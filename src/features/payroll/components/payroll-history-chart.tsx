import { formatCurrency } from "@/lib/formatters";

type PayrollHistoryChartItem = {
  id: string;
  periodLabel: string;
  netPay: number;
  totalDeductions: number;
};

type PayrollHistoryChartProps = {
  items: PayrollHistoryChartItem[];
};

export function PayrollHistoryChart({ items }: PayrollHistoryChartProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-6 text-sm text-muted-foreground">
        Save payroll runs to unlock your trend graph.
      </div>
    );
  }

  const maxValue = items.reduce((max, item) => {
    return Math.max(max, item.netPay, item.totalDeductions);
  }, 1);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const netPayHeight = Math.max((item.netPay / maxValue) * 100, 2);
          const deductionsHeight = Math.max((item.totalDeductions / maxValue) * 100, 2);

          return (
            <div key={item.id} className="rounded-2xl border border-border/70 bg-card/60 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{item.periodLabel}</p>
              <div className="mt-4 grid h-40 grid-cols-2 items-end gap-4 rounded-xl border border-border/60 bg-background/70 px-3 pb-3 pt-2">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-full rounded-t-md bg-emerald-500/80" style={{ height: `${netPayHeight}%` }} />
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Net Pay</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-full rounded-t-md bg-rose-500/80" style={{ height: `${deductionsHeight}%` }} />
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Deductions</p>
                </div>
              </div>
              <div className="mt-3 grid gap-2 text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Net Pay</span>
                  <span className="font-medium text-foreground">{formatCurrency(item.netPay)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total Deductions</span>
                  <span className="font-medium text-foreground">{formatCurrency(item.totalDeductions)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2"><span className="size-2 rounded-full bg-emerald-500/80" /> Net Pay</span>
        <span className="inline-flex items-center gap-2"><span className="size-2 rounded-full bg-rose-500/80" /> Total Deductions</span>
      </div>
    </div>
  );
}
