"use server";

import { revalidatePath } from "next/cache";

import {
  payrollCalculatorSchema,
  type PayrollCalculatorInput,
} from "@/features/payroll/schema/payroll-calculator.schema";
import { savePayrollRunSchema } from "@/features/payroll/schema/payroll-history.schema";
import { calculatePayrollPreview } from "@/features/payroll/services/payroll-calculator.service";
import { savePayrollRun } from "@/features/payroll/services/payroll-history.service";
import { requireSessionUser } from "@/features/auth/services/session.service";

export type PayrollPreviewActionResult =
  | {
      success: true;
      preview: Awaited<ReturnType<typeof calculatePayrollPreview>>;
    }
  | { success: false; error: string };

export type SavePayrollRunActionResult =
  | {
      success: true;
      status: "CREATED" | "UPDATED";
      savedRun: {
        id: string;
        payrollPeriod: string;
        payFrequency: "MONTHLY" | "SEMI_MONTHLY" | "WEEKLY";
        netPay: number;
      };
    }
  | {
      success: false;
      error: "DUPLICATE_PAYROLL_PERIOD";
      duplicate: {
        id: string;
        payrollPeriod: string;
        payFrequency: "MONTHLY" | "SEMI_MONTHLY" | "WEEKLY";
        netPay: number;
      };
    }
  | { success: false; error: string };

export async function calculatePayrollPreviewAction(
  values: PayrollCalculatorInput,
): Promise<PayrollPreviewActionResult> {
  const parsed = payrollCalculatorSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid payroll calculator input.",
    };
  }

  try {
    const user = await requireSessionUser();
    const preview = await calculatePayrollPreview(parsed.data, user.id);
    return {
      success: true,
      preview,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to calculate payroll preview.",
    };
  }
}

export async function savePayrollRunAction(values: {
  payrollPeriod: string;
  calculatorInput: PayrollCalculatorInput;
  conflictStrategy?: "ASK" | "UPDATE" | "OVERWRITE";
}): Promise<SavePayrollRunActionResult> {
  const parsed = savePayrollRunSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid save request.",
    };
  }

  try {
    const user = await requireSessionUser();
    const preview = await calculatePayrollPreview(parsed.data.calculatorInput, user.id);

    const savedRun = await savePayrollRun({
      userId: user.id,
      payrollPeriod: parsed.data.payrollPeriod,
      payFrequency: parsed.data.calculatorInput.payFrequency,
      preview,
      calculatorInput: parsed.data.calculatorInput,
      conflictStrategy: parsed.data.conflictStrategy,
    });

    if (savedRun.status === "DUPLICATE") {
      return {
        success: false,
        error: "DUPLICATE_PAYROLL_PERIOD",
        duplicate: savedRun.duplicate,
      };
    }

    revalidatePath("/reports");

    return {
      success: true,
      status: savedRun.status,
      savedRun,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save payroll run.",
    };
  }
}
