import { PersonalSettingsForm } from "@/features/settings/components/personal-settings-form";
import { ChangePasswordCard } from "@/features/settings/components/change-password-card";
import { requireSessionUser } from "@/features/auth/services/session.service";
import { getUserPayrollSettings } from "@/features/settings/services/user-settings.service";

export default async function SettingsPage() {
  const user = await requireSessionUser();
  const settings = await getUserPayrollSettings(user.id);

  const overtimePercent = ((Number(settings.overtime_multiplier || 1) - 1) * 100).toFixed(2);
  const nightDifferentialPercent = (Number(settings.night_differential_multiplier || 0) * 100).toFixed(2);
  const restDayPercent = ((Number(settings.rest_day_multiplier || 1) - 1) * 100).toFixed(2);

  return (
    <div className="space-y-6">
      <PersonalSettingsForm
        initialValues={{
          defaultMonthlySalary: settings.default_monthly_salary,
          workingDaysPerMonth: settings.working_days_per_month,
          workingHoursPerDay: settings.working_hours_per_day,
          payPeriodsPerMonth: settings.pay_periods_per_month,
          governmentRuleYear: settings.government_rule_year,
          overtimePercent,
          nightDifferentialPercent,
          restDayPercent,
          regularHolidayBonusPercent: settings.regular_holiday_bonus_percent,
          specialHolidayBonusPercent: settings.special_holiday_bonus_percent,
          companyHolidayBonusPercent: settings.company_holiday_bonus_percent,
          useManualHolidayBonuses: settings.use_manual_holiday_bonuses === "true",
          useManualContributions: settings.use_manual_contributions === "true",
          manualSssAmount: settings.manual_sss_amount,
          manualPhilHealthAmount: settings.manual_philhealth_amount,
          manualPagIbigAmount: settings.manual_pagibig_amount,
        }}
      />

      <div className="mx-auto max-w-5xl">
        <ChangePasswordCard email={user.email} />
      </div>
    </div>
  );
}
