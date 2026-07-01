import { z } from "zod";

const decimalInput = z
  .string()
  .trim()
  .min(1, "This field is required.")
  .refine((value) => !Number.isNaN(Number(value)), "Enter a valid number.")
  .refine((value) => Number(value) >= 0, "Value must be zero or greater.");

export const payrollCalculatorSchema = z.object({
  payFrequency: z.enum(["MONTHLY", "SEMI_MONTHLY", "WEEKLY"]),
  monthlySalary: decimalInput,
  overtimeHours: decimalInput,
  nightDifferentialHours: decimalInput,
  regularHolidayHours: decimalInput,
  specialHolidayHours: decimalInput,
  companyHolidayHours: decimalInput,
  restDayHours: decimalInput,
  absencesDays: decimalInput,
  tardinessMinutes: decimalInput,
  recurringAllowances: decimalInput,
  recurringLoans: decimalInput,
  recurringCashAdvances: decimalInput,
  recurringOtherDeductions: decimalInput,
  bonuses: decimalInput,
  incentives: decimalInput,
  adHocAllowances: decimalInput,
  loans: decimalInput,
  cashAdvances: decimalInput,
});

export type PayrollCalculatorInput = z.infer<typeof payrollCalculatorSchema>;

export const defaultPayrollCalculatorValues: PayrollCalculatorInput = {
  payFrequency: "SEMI_MONTHLY",
  monthlySalary: "0",
  overtimeHours: "0",
  nightDifferentialHours: "0",
  regularHolidayHours: "0",
  specialHolidayHours: "0",
  companyHolidayHours: "0",
  restDayHours: "0",
  absencesDays: "0",
  tardinessMinutes: "0",
  recurringAllowances: "0",
  recurringLoans: "0",
  recurringCashAdvances: "0",
  recurringOtherDeductions: "0",
  bonuses: "0",
  incentives: "0",
  adHocAllowances: "0",
  loans: "0",
  cashAdvances: "0",
};
