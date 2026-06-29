"use server";

import { revalidatePath } from "next/cache";

import {
  personalSettingsSchema,
  type PersonalSettingsInput,
} from "@/features/settings/schema/personal-settings.schema";
import { requireSessionUser } from "@/features/auth/services/session.service";
import { upsertUserPayrollSettings } from "@/features/settings/services/user-settings.service";

export type SavePersonalSettingsResult =
  | { success: true }
  | { success: false; error: string };

export async function savePersonalSettingsAction(
  values: PersonalSettingsInput,
): Promise<SavePersonalSettingsResult> {
  const parsed = personalSettingsSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid settings input.",
    };
  }

  try {
    const user = await requireSessionUser();

    await upsertUserPayrollSettings(user.id, {
      default_monthly_salary: parsed.data.defaultMonthlySalary,
      working_days_per_month: parsed.data.workingDaysPerMonth,
      working_hours_per_day: parsed.data.workingHoursPerDay,
      pay_periods_per_month: parsed.data.payPeriodsPerMonth,
      overtime_multiplier: parsed.data.overtimeMultiplier,
      night_differential_multiplier: parsed.data.nightDifferentialMultiplier,
      rest_day_multiplier: parsed.data.restDayMultiplier,
      use_manual_contributions: String(parsed.data.useManualContributions),
      manual_sss_amount: parsed.data.manualSssAmount,
      manual_philhealth_amount: parsed.data.manualPhilHealthAmount,
      manual_pagibig_amount: parsed.data.manualPagIbigAmount,
    });

    revalidatePath("/settings");
    revalidatePath("/payroll");

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save settings.",
    };
  }
}
