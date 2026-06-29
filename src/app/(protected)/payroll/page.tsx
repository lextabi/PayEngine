import { Badge } from "@/components/ui/badge";
import { PayrollCalculatorForm } from "@/features/payroll/components/payroll-calculator-form";
import { getPayrollPageData } from "@/features/payroll/services/payroll-page.service";
import { requireSessionUser } from "@/features/auth/services/session.service";

export default async function PayrollPage() {
  const user = await requireSessionUser();
  const data = await getPayrollPageData(user.id);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Badge variant="outline" className="w-fit">Personal Calculator</Badge>
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">My Payroll Calculator</h2>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground sm:text-base">
            Calculate your own payroll estimate using your salary assumptions, account-level settings, and contribution controls. This experience is personal and does not manage other employees.
          </p>
        </div>
        {data.configWarnings.length > 0 ? (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/8 p-4 text-sm text-amber-800 dark:text-amber-200">
            Some of your personal settings are missing or invalid, so fallback values are being used. Update your values in Settings.
          </div>
        ) : null}
      </div>

      <PayrollCalculatorForm
        defaultMonthlySalary={data.defaultMonthlySalary}
        recurringAllowances={data.recurringAllowances}
        recurringLoans={data.recurringLoans}
        recurringCashAdvances={data.recurringCashAdvances}
        recurringOtherDeductions={data.recurringOtherDeductions}
        holidayRules={data.holidayRules}
      />
    </div>
  );
}
