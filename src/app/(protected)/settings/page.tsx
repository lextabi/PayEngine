import { PersonalSettingsForm } from "@/features/settings/components/personal-settings-form";
import { requireSessionUser } from "@/features/auth/services/session.service";
import { getUserPayrollSettings } from "@/features/settings/services/user-settings.service";

export default async function SettingsPage() {
  const user = await requireSessionUser();
  const settings = await getUserPayrollSettings(user.id);

  return (
    <PersonalSettingsForm
      initialValues={{
        defaultMonthlySalary: settings.default_monthly_salary,
        workingDaysPerMonth: settings.working_days_per_month,
        workingHoursPerDay: settings.working_hours_per_day,
        payPeriodsPerMonth: settings.pay_periods_per_month,
        overtimeMultiplier: settings.overtime_multiplier,
        nightDifferentialMultiplier: settings.night_differential_multiplier,
        restDayMultiplier: settings.rest_day_multiplier,
        useManualContributions: settings.use_manual_contributions === "true",
        manualSssAmount: settings.manual_sss_amount,
        manualPhilHealthAmount: settings.manual_philhealth_amount,
        manualPagIbigAmount: settings.manual_pagibig_amount,
      }}
    />
  );
}
