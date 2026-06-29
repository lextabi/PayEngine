"use server";

import {
  payrollCalculatorSchema,
  type PayrollCalculatorInput,
} from "@/features/payroll/schema/payroll-calculator.schema";
import { calculatePayrollPreview } from "@/features/payroll/services/payroll-calculator.service";
import { requireSessionUser } from "@/features/auth/services/session.service";

export type PayrollPreviewActionResult =
  | {
      success: true;
      preview: Awaited<ReturnType<typeof calculatePayrollPreview>>;
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
