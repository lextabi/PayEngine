import { Prisma, RuleStatus } from "@prisma/client";

import type { PayrollCalculatorInput } from "@/features/payroll/schema/payroll-calculator.schema";
import { getPayrollConfig } from "@/features/payroll/services/payroll-config.service";

function toNumber(value: Prisma.Decimal | number | string | null | undefined) {
  if (value == null) {
    return 0;
  }

  return Number(value);
}

function roundToCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

function parseInput(value: string) {
  return Number(value);
}

type FormulaKey =
  | "FIXED_AMOUNT"
  | "PERCENT_OF_BASIS"
  | "BASE_PLUS_PERCENT_OF_BASIS"
  | "BASE_PLUS_PERCENT_OF_EXCESS";

type GovernmentResult = {
  amount: number;
  warning?: string;
  sourceStatus?: RuleStatus;
  details?: {
    ruleCode: string;
    sequence: number;
    rangeStart: number;
    rangeEnd: number | null;
    baseAmount: number;
    employeeRate: number;
    formulaKey: FormulaKey;
    excessOverRangeStart: number;
    basisUsed: number;
  };
};

type PayFrequency = "MONTHLY" | "SEMI_MONTHLY" | "WEEKLY";

function getFrequencyPeriodsPerMonth(frequency: PayFrequency) {
  if (frequency === "MONTHLY") {
    return 1;
  }

  if (frequency === "WEEKLY") {
    return 52 / 12;
  }

  return 2;
}

function computeConfiguredRuleAmount(
  basis: number,
  ruleCode: string,
  rules: Awaited<ReturnType<typeof getPayrollConfig>>["governmentRules"],
): GovernmentResult {
  const rule = rules.find((item) => item.code === ruleCode);

  if (!rule) {
    return {
      amount: 0,
      warning: `${ruleCode} rule container was not found.`,
    };
  }

  const matchingRow = rule.tables.find((row) => {
    const rangeStart = toNumber(row.rangeStart);
    const rangeEnd = row.rangeEnd == null ? null : toNumber(row.rangeEnd);

    return basis >= rangeStart && (rangeEnd == null || basis <= rangeEnd);
  });

  if (!matchingRow) {
    return {
      amount: 0,
      warning: `${ruleCode} has no table row matching basis ${basis.toFixed(2)}.`,
      sourceStatus: rule.status,
    };
  }

  const formulaKey = (matchingRow.formulaKey ?? "").trim() as FormulaKey | "";

  if (!formulaKey) {
    return {
      amount: 0,
      warning: `${ruleCode} row ${matchingRow.sequence} has no formulaKey configured.`,
      sourceStatus: rule.status,
    };
  }

  const baseAmount = toNumber(matchingRow.baseAmount);
  const employeeRate = toNumber(matchingRow.employeeRate);
  const rangeStart = toNumber(matchingRow.rangeStart);

  let amount = 0;

  switch (formulaKey) {
    case "FIXED_AMOUNT":
      amount = baseAmount;
      break;
    case "PERCENT_OF_BASIS":
      amount = basis * employeeRate;
      break;
    case "BASE_PLUS_PERCENT_OF_BASIS":
      amount = baseAmount + basis * employeeRate;
      break;
    case "BASE_PLUS_PERCENT_OF_EXCESS":
      amount = baseAmount + Math.max(basis - rangeStart, 0) * employeeRate;
      break;
    default:
      return {
        amount: 0,
        warning: `${ruleCode} row ${matchingRow.sequence} uses unsupported formulaKey '${formulaKey}'.`,
        sourceStatus: rule.status,
      };
  }

  const warning =
    rule.status === RuleStatus.DRAFT
      ? `${ruleCode} is currently using DRAFT configuration.`
      : undefined;

  return {
    amount: roundToCurrency(amount),
    warning,
    sourceStatus: rule.status,
    details: {
      ruleCode,
      sequence: matchingRow.sequence,
      rangeStart,
      rangeEnd: matchingRow.rangeEnd == null ? null : toNumber(matchingRow.rangeEnd),
      baseAmount,
      employeeRate,
      formulaKey,
      excessOverRangeStart: roundToCurrency(Math.max(basis - rangeStart, 0)),
      basisUsed: roundToCurrency(basis),
    },
  };
}

export async function calculatePayrollPreview(
  input: PayrollCalculatorInput,
  userId: string,
) {
  const config = await getPayrollConfig(userId);

  const warnings = [...config.warnings];

  const workingDaysPerMonth = config.settings.working_days_per_month;
  const workingHoursPerDay = config.settings.working_hours_per_day;
  const selectedFrequency = input.payFrequency as PayFrequency;
  const payPeriodsPerMonth = getFrequencyPeriodsPerMonth(selectedFrequency);
  const periodsPerYear = payPeriodsPerMonth * 12;
  const overtimeMultiplier = config.settings.overtime_multiplier;
  const nightDifferentialMultiplier = config.settings.night_differential_multiplier;
  const restDayMultiplier = config.settings.rest_day_multiplier;

  const monthlySalary = parseInput(input.monthlySalary);
  const dailyRate = roundToCurrency(monthlySalary / workingDaysPerMonth);
  const hourlyRate = roundToCurrency(dailyRate / workingHoursPerDay);
  const minuteRate = roundToCurrency(hourlyRate / 60);
  const periodBasePay = roundToCurrency(monthlySalary / payPeriodsPerMonth);

  const overtimeHours = parseInput(input.overtimeHours);
  const nightDifferentialHours = parseInput(input.nightDifferentialHours);
  const regularHolidayHours = parseInput(input.regularHolidayHours);
  const specialHolidayHours = parseInput(input.specialHolidayHours);
  const companyHolidayHours = parseInput(input.companyHolidayHours);
  const restDayHours = parseInput(input.restDayHours);
  const absencesDays = parseInput(input.absencesDays);
  const tardinessMinutes = parseInput(input.tardinessMinutes);
  const recurringAllowances = parseInput(input.recurringAllowances);
  const recurringLoans = parseInput(input.recurringLoans);
  const recurringCashAdvances = parseInput(input.recurringCashAdvances);
  const recurringOtherDeductions = parseInput(input.recurringOtherDeductions);
  const bonuses = parseInput(input.bonuses);
  const incentives = parseInput(input.incentives);
  const adHocAllowances = parseInput(input.adHocAllowances);
  const adHocLoans = parseInput(input.loans);
  const adHocCashAdvances = parseInput(input.cashAdvances);

  const overtimePay = roundToCurrency(overtimeHours * hourlyRate * overtimeMultiplier);
  const nightDifferentialPay = roundToCurrency(
    nightDifferentialHours * hourlyRate * nightDifferentialMultiplier,
  );

  const computeHolidayTypePay = (
    hours: number,
    multiplier: number,
    bonusPercent: number,
  ) => {
    if (hours <= 0) {
      return 0;
    }

    const baseHolidayPay = hours * hourlyRate * multiplier;
    const bonusFactor = 1 + bonusPercent / 100;

    return roundToCurrency(baseHolidayPay * bonusFactor);
  };

  const regularHolidayPay = computeHolidayTypePay(
    regularHolidayHours,
    config.holidayMultipliers.regular,
    config.holidayBonuses.regular,
  );
  const specialHolidayPay = computeHolidayTypePay(
    specialHolidayHours,
    config.holidayMultipliers.special,
    config.holidayBonuses.special,
  );
  const companyHolidayPay = computeHolidayTypePay(
    companyHolidayHours,
    config.holidayMultipliers.company,
    config.holidayBonuses.company,
  );
  const holidayPay = roundToCurrency(regularHolidayPay + specialHolidayPay + companyHolidayPay);

  const restDayPay = roundToCurrency(restDayHours * hourlyRate * restDayMultiplier);
  const absenceDeduction = roundToCurrency(absencesDays * dailyRate);
  const tardinessDeduction = roundToCurrency(tardinessMinutes * minuteRate);

  const totalEarnings = roundToCurrency(
    periodBasePay +
      overtimePay +
      nightDifferentialPay +
      holidayPay +
      restDayPay +
      bonuses +
      incentives +
      adHocAllowances +
      recurringAllowances,
  );

  const grossPay = roundToCurrency(totalEarnings - absenceDeduction - tardinessDeduction);

  const monthlyEquivalentBasis = roundToCurrency(grossPay * (periodsPerYear / 12));
  const periodScaleFromMonthly = 12 / periodsPerYear;

  const sssMonthly = config.manualContributions.enabled
    ? { amount: roundToCurrency(config.manualContributions.sss) }
    : computeConfiguredRuleAmount(monthlyEquivalentBasis, "SSS", config.governmentRules);
  const philHealthMonthly = config.manualContributions.enabled
    ? { amount: roundToCurrency(config.manualContributions.philHealth) }
    : computeConfiguredRuleAmount(monthlyEquivalentBasis, "PHILHEALTH", config.governmentRules);
  const pagIbigMonthly = config.manualContributions.enabled
    ? { amount: roundToCurrency(config.manualContributions.pagIbig) }
    : computeConfiguredRuleAmount(monthlyEquivalentBasis, "PAG_IBIG", config.governmentRules);

  const sss = {
    ...sssMonthly,
    amount: roundToCurrency(sssMonthly.amount * periodScaleFromMonthly),
  };
  const philHealth = {
    ...philHealthMonthly,
    amount: roundToCurrency(philHealthMonthly.amount * periodScaleFromMonthly),
  };
  const pagIbig = {
    ...pagIbigMonthly,
    amount: roundToCurrency(pagIbigMonthly.amount * periodScaleFromMonthly),
  };
  const semiMonthlyEquivalentBasis = roundToCurrency(grossPay * (periodsPerYear / 24));
  const incomeTaxSemiMonthly = computeConfiguredRuleAmount(
    semiMonthlyEquivalentBasis,
    "INCOME_TAX",
    config.governmentRules,
  );
  const incomeTax = {
    ...incomeTaxSemiMonthly,
    amount: roundToCurrency(incomeTaxSemiMonthly.amount * (24 / periodsPerYear)),
    details: incomeTaxSemiMonthly.details
      ? {
          ...incomeTaxSemiMonthly.details,
          basisUsed: semiMonthlyEquivalentBasis,
        }
      : undefined,
  };

  [sss.warning, philHealth.warning, pagIbig.warning, incomeTax.warning]
    .filter(Boolean)
    .forEach((warning) => warnings.push(warning as string));

  const totalContributions = roundToCurrency(sss.amount + philHealth.amount + pagIbig.amount);
  const totalTax = roundToCurrency(incomeTax.amount);
  const totalManualDeductions = roundToCurrency(
    recurringLoans +
      recurringCashAdvances +
      recurringOtherDeductions +
      adHocLoans +
      adHocCashAdvances,
  );
  const totalDeductions = roundToCurrency(
    absenceDeduction + tardinessDeduction + totalManualDeductions + totalContributions + totalTax,
  );
  const netPay = roundToCurrency(grossPay - totalManualDeductions - totalContributions - totalTax);

  return {
    profile: {
      label: "My Payroll Profile",
      monthlySalary,
    },
    rates: {
      dailyRate,
      hourlyRate,
      minuteRate,
      payPeriodsPerMonth,
      workingDaysPerMonth,
      workingHoursPerDay,
    },
    earnings: {
      periodBasePay,
      overtimePay,
      nightDifferentialPay,
      regularHolidayPay,
      specialHolidayPay,
      companyHolidayPay,
      holidayPay,
      restDayPay,
      bonuses,
      incentives,
      recurringAllowanceTotal: recurringAllowances,
      adHocAllowances,
      totalEarnings,
      grossPay,
    },
    deductions: {
      absenceDeduction,
      tardinessDeduction,
      recurringLoanTotal: recurringLoans,
      recurringCashAdvanceTotal: recurringCashAdvances,
      recurringOtherDeductionTotal: recurringOtherDeductions,
      adHocLoans,
      adHocCashAdvances,
      totalManualDeductions,
      totalDeductions,
    },
    government: {
      sss: sss.amount,
      philHealth: philHealth.amount,
      pagIbig: pagIbig.amount,
      tax: totalTax,
      totalContributions,
    },
    taxBreakdown: incomeTax.details
      ? {
          appliedRuleCode: incomeTax.details.ruleCode,
          bracketSequence: incomeTax.details.sequence,
          bracketRangeStart: incomeTax.details.rangeStart,
          bracketRangeEnd: incomeTax.details.rangeEnd,
          bracketRate: incomeTax.details.employeeRate,
          baseAmount: incomeTax.details.baseAmount,
          formulaKey: incomeTax.details.formulaKey,
          basisForTaxTable: incomeTax.details.basisUsed,
          excessOverRangeStart: incomeTax.details.excessOverRangeStart,
          selectedPayFrequency: selectedFrequency,
          selectedPeriodGrossPay: grossPay,
          finalTaxForSelectedPeriod: totalTax,
        }
      : null,
    netPay,
    warnings,
    configUsed: {
      payFrequency: selectedFrequency,
      overtimeMultiplier,
      nightDifferentialMultiplier,
      restDayMultiplier,
      manualContributionsEnabled: config.manualContributions.enabled,
    },
  };
}
