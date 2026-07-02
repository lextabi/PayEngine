import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import type { PayrollCalculatorInput } from "@/features/payroll/schema/payroll-calculator.schema";

type PayrollPreview = {
  profile: {
    label: string;
    monthlySalary: number;
  };
  earnings: {
    grossPay: number;
  };
  deductions: {
    totalDeductions: number;
  };
  government: {
    totalContributions: number;
    tax: number;
  };
  netPay: number;
};

type PayrollPayFrequency = "MONTHLY" | "SEMI_MONTHLY" | "WEEKLY";

type PayrollRunSnapshot = {
  calculatorInput: PayrollCalculatorInput;
  preview: PayrollPreview;
};

function toDateOnly(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function addDays(value: Date, days: number) {
  const copy = new Date(value);
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

function toNumber(value: Prisma.Decimal | number | string) {
  return Number(value);
}

function startOfUtcDay(value: Date) {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
}

function getIsoWeekParts(value: Date) {
  const day = startOfUtcDay(value);
  const dayOfWeek = day.getUTCDay() || 7;
  day.setUTCDate(day.getUTCDate() + 4 - dayOfWeek);
  const isoYear = day.getUTCFullYear();
  const yearStart = new Date(Date.UTC(isoYear, 0, 1));
  const week = Math.ceil((((day.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);

  return {
    isoYear,
    isoWeek: week,
  };
}

function buildPeriodKey(payrollPeriodDate: Date, payFrequency: PayrollPayFrequency) {
  const year = payrollPeriodDate.getUTCFullYear();
  const month = `${payrollPeriodDate.getUTCMonth() + 1}`.padStart(2, "0");

  if (payFrequency === "MONTHLY") {
    return `M-${year}-${month}`;
  }

  if (payFrequency === "SEMI_MONTHLY") {
    const half = payrollPeriodDate.getUTCDate() <= 15 ? "H1" : "H2";
    return `SM-${year}-${month}-${half}`;
  }

  const { isoYear, isoWeek } = getIsoWeekParts(payrollPeriodDate);
  return `W-${isoYear}-${`${isoWeek}`.padStart(2, "0")}`;
}

type ConflictStrategy = "ASK" | "OVERWRITE";

type SavedPayrollRunResult = {
  status: "CREATED" | "OVERWRITTEN";
  id: string;
  payrollPeriod: string;
  payFrequency: PayrollPayFrequency;
  netPay: number;
};

type DuplicatePayrollRunResult = {
  status: "DUPLICATE";
  duplicate: {
    id: string;
    payrollPeriod: string;
    payFrequency: PayrollPayFrequency;
    netPay: number;
  };
};

type SavePayrollRunResult = SavedPayrollRunResult | DuplicatePayrollRunResult;

function mapSavedRunResult(run: {
  id: string;
  payrollPeriod: Date;
  payFrequency: PayrollPayFrequency;
  netPay: Prisma.Decimal;
}, status: SavedPayrollRunResult["status"] = "CREATED"): SavedPayrollRunResult {
  return {
    status,
    id: run.id,
    payrollPeriod: run.payrollPeriod.toISOString(),
    payFrequency: run.payFrequency,
    netPay: toNumber(run.netPay),
  };
}

export async function savePayrollRun(params: {
  userId: string;
  payrollPeriod: string;
  payFrequency: PayrollPayFrequency;
  preview: PayrollPreview;
  calculatorInput: PayrollCalculatorInput;
  conflictStrategy: ConflictStrategy;
}): Promise<SavePayrollRunResult> {
  const payrollPeriodDate = toDateOnly(params.payrollPeriod);
  const periodKey = buildPeriodKey(payrollPeriodDate, params.payFrequency);

  const existing = await prisma.payrollRun.findUnique({
    where: {
      userId_payFrequency_periodKey: {
        userId: params.userId,
        payFrequency: params.payFrequency,
        periodKey,
      },
    },
  });

  if (existing && params.conflictStrategy === "ASK") {
    return {
      status: "DUPLICATE",
      duplicate: {
        id: existing.id,
        payrollPeriod: existing.payrollPeriod.toISOString(),
        payFrequency: existing.payFrequency,
        netPay: toNumber(existing.netPay),
      },
    };
  }

  const saveData = {
    userId: params.userId,
    payrollPeriod: payrollPeriodDate,
    payFrequency: params.payFrequency,
    periodKey,
    monthlySalaryBasis: params.preview.profile.monthlySalary,
    grossPay: params.preview.earnings.grossPay,
    totalDeductions: params.preview.deductions.totalDeductions,
    totalContributions: params.preview.government.totalContributions,
    totalTax: params.preview.government.tax,
    netPay: params.preview.netPay,
    snapshot: {
      calculatorInput: params.calculatorInput,
      preview: params.preview,
    } satisfies PayrollRunSnapshot,
  };

  if (existing && params.conflictStrategy === "OVERWRITE") {
    await prisma.payrollRun.delete({
      where: {
        id: existing.id,
      },
    });

    const created = await prisma.payrollRun.create({
      data: saveData,
    });

    return mapSavedRunResult(created, "OVERWRITTEN");
  }

  const created = await prisma.payrollRun.create({
    data: saveData,
  });

  return mapSavedRunResult(created);
}

export async function getPayrollHistory(params: {
  userId: string;
  from?: string;
  to?: string;
  payFrequency?: PayrollPayFrequency;
  limit?: number;
}) {
  const where: Prisma.PayrollRunWhereInput = {
    userId: params.userId,
  };

  if (params.payFrequency) {
    where.payFrequency = params.payFrequency;
  }

  if (params.from || params.to) {
    where.payrollPeriod = {};

    if (params.from) {
      where.payrollPeriod.gte = toDateOnly(params.from);
    }

    if (params.to) {
      where.payrollPeriod.lt = addDays(toDateOnly(params.to), 1);
    }
  }

  const runs = await prisma.payrollRun.findMany({
    where,
    orderBy: [{ payrollPeriod: "desc" }, { createdAt: "desc" }],
    take: params.limit,
  });

  return runs.map((run) => ({
    id: run.id,
    payrollPeriod: run.payrollPeriod.toISOString(),
    payFrequency: run.payFrequency,
    monthlySalaryBasis: toNumber(run.monthlySalaryBasis),
    grossPay: toNumber(run.grossPay),
    totalDeductions: toNumber(run.totalDeductions),
    totalContributions: toNumber(run.totalContributions),
    totalTax: toNumber(run.totalTax),
    netPay: toNumber(run.netPay),
    createdAt: run.createdAt.toISOString(),
  }));
}

export async function getPayrollHistoryChartData(userId: string) {
  const runs = await getPayrollHistory({
    userId,
    limit: 12,
  });

  return runs.reverse();
}
