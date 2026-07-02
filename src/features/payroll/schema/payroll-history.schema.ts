import { z } from "zod";

import { payrollCalculatorSchema } from "@/features/payroll/schema/payroll-calculator.schema";

const payrollPeriodSchema = z
  .string()
  .trim()
  .min(1, "Payroll period is required.")
  .refine((value) => !Number.isNaN(Date.parse(value)), "Enter a valid payroll period date.");

export const savePayrollRunSchema = z.object({
  payrollPeriod: payrollPeriodSchema,
  calculatorInput: payrollCalculatorSchema,
  conflictStrategy: z.enum(["ASK", "UPDATE", "OVERWRITE"]).default("ASK"),
});

export type SavePayrollRunInput = z.infer<typeof savePayrollRunSchema>;
