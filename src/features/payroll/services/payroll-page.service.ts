import { getPayrollConfig } from "@/features/payroll/services/payroll-config.service";
import { getUserPayrollSettings } from "@/features/settings/services/user-settings.service";

export type PayrollPageHolidayRule = {
  id: string;
  code: string;
  name: string;
  type: string;
};

export async function getPayrollPageData(userId: string) {
  const [settings, config] = await Promise.all([
    getUserPayrollSettings(userId),
    getPayrollConfig(userId),
  ]);

  return {
    defaultMonthlySalary: settings.default_monthly_salary,
    recurringAllowances: "0",
    recurringLoans: "0",
    recurringCashAdvances: "0",
    recurringOtherDeductions: "0",
    holidayRules: config.holidayRules.map((rule): PayrollPageHolidayRule => ({
      id: rule.id,
      code: rule.code,
      name: rule.name,
      type: rule.type,
    })),
    configWarnings: config.warnings,
  };
}
