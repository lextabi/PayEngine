import { z } from "zod";

const decimalInput = z
  .string()
  .trim()
  .min(1, "This field is required.")
  .refine((value) => !Number.isNaN(Number(value)), "Enter a valid number.")
  .refine((value) => Number(value) >= 0, "Value must be zero or greater.");

export const personalSettingsSchema = z.object({
  defaultMonthlySalary: decimalInput,
  workingDaysPerMonth: decimalInput,
  workingHoursPerDay: decimalInput,
  payPeriodsPerMonth: decimalInput,
  governmentRuleYear: decimalInput,
  overtimePercent: decimalInput,
  nightDifferentialPercent: decimalInput,
  restDayPercent: decimalInput,
  regularHolidayBonusPercent: decimalInput,
  specialHolidayBonusPercent: decimalInput,
  companyHolidayBonusPercent: decimalInput,
  useManualHolidayBonuses: z.boolean(),
  useManualContributions: z.boolean(),
  manualSssAmount: decimalInput,
  manualPhilHealthAmount: decimalInput,
  manualPagIbigAmount: decimalInput,
});

export type PersonalSettingsInput = z.infer<typeof personalSettingsSchema>;
