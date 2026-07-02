import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSessionUser } from "@/features/auth/services/session.service";
import { PayrollHistoryChart } from "@/features/payroll/components/payroll-history-chart";
import {
  getPayrollHistory,
  getPayrollHistoryChartData,
} from "@/features/payroll/services/payroll-history.service";
import { formatCurrency, formatDate } from "@/lib/formatters";

const frequencyLabel: Record<"MONTHLY" | "SEMI_MONTHLY" | "WEEKLY", string> = {
  MONTHLY: "Monthly",
  SEMI_MONTHLY: "Semi-Monthly",
  WEEKLY: "Weekly",
};

export default async function ReportsPage() {
  const user = await requireSessionUser();
  const [history, chartItems] = await Promise.all([
    getPayrollHistory({ userId: user.id, limit: 60 }),
    getPayrollHistoryChartData(user.id),
  ]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:gap-8">
      <section className="space-y-3">
        <Badge variant="outline" className="w-fit">Personal History</Badge>
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">My History</h2>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground sm:text-base">
            Review your saved payroll results by payroll period and compare your net pay trends against total deductions.
          </p>
        </div>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Salary Pattern Graph</CardTitle>
            <CardDescription>
              Latest 12 saved runs, ordered by payroll period.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PayrollHistoryChart
              items={chartItems.map((item) => ({
                id: item.id,
                periodLabel: formatDate(item.payrollPeriod),
                netPay: item.netPay,
                totalDeductions: item.totalDeductions,
              }))}
            />
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Saved Payroll Runs</CardTitle>
            <CardDescription>
              Each saved run captures the finalized preview values for your selected payroll period.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-6 text-sm text-muted-foreground">
                No saved payroll runs yet. Use Calculate Preview, pick a payroll period, then save from My Calculator.
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-border/70">
                <div className="grid grid-cols-[1fr_0.9fr_1fr_1fr_1fr_0.95fr] gap-3 border-b border-border/70 bg-muted/30 px-4 py-3 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  <span>Payroll Period</span>
                  <span>Frequency</span>
                  <span>Gross Pay</span>
                  <span>Deductions</span>
                  <span>Net Pay</span>
                  <span>Saved At</span>
                </div>
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[1fr_0.9fr_1fr_1fr_1fr_0.95fr] gap-3 border-b border-border/60 px-4 py-3 text-sm last:border-b-0"
                  >
                    <span>{formatDate(item.payrollPeriod)}</span>
                    <span>{frequencyLabel[item.payFrequency]}</span>
                    <span>{formatCurrency(item.grossPay)}</span>
                    <span>{formatCurrency(item.totalDeductions)}</span>
                    <span className="font-medium">{formatCurrency(item.netPay)}</span>
                    <span className="text-muted-foreground">{formatDate(item.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
