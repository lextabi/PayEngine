"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  calculatePayrollPreviewAction,
  type PayrollPreviewActionResult,
} from "@/features/payroll/actions/payroll-preview.actions";
import {
  defaultPayrollCalculatorValues,
  payrollCalculatorSchema,
  type PayrollCalculatorInput,
} from "@/features/payroll/schema/payroll-calculator.schema";
import type { PayrollPageHolidayRule } from "@/features/payroll/services/payroll-page.service";
import { formatCurrency } from "@/lib/formatters";

type PayrollCalculatorFormProps = {
  defaultMonthlySalary: string;
  recurringAllowances: string;
  recurringLoans: string;
  recurringCashAdvances: string;
  recurringOtherDeductions: string;
  holidayRules: PayrollPageHolidayRule[];
};

export function PayrollCalculatorForm({
  defaultMonthlySalary,
  recurringAllowances,
  recurringLoans,
  recurringCashAdvances,
  recurringOtherDeductions,
  holidayRules,
}: PayrollCalculatorFormProps) {
  const [result, setResult] = useState<PayrollPreviewActionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<PayrollCalculatorInput>({
    resolver: zodResolver(payrollCalculatorSchema),
    defaultValues: {
      ...defaultPayrollCalculatorValues,
      monthlySalary: defaultMonthlySalary,
      recurringAllowances,
      recurringLoans,
      recurringCashAdvances,
      recurringOtherDeductions,
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    setResult(null);

    startTransition(async () => {
      const response = await calculatePayrollPreviewAction(values);
      setResult(response);
    });
  });

  return (
    <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[1fr_0.95fr]">
      <Card>
        <CardHeader>
          <CardTitle>Payroll Calculator</CardTitle>
          <CardDescription>
            Preview your take-home pay using your own salary inputs and personal settings. Government deductions use your settings and active rule tables.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-6">
            <section className="grid gap-4 sm:grid-cols-2">
              <MetricField form={form} name="monthlySalary" label="Monthly Salary" />
              <Field label="Holiday Rule" error={form.formState.errors.holidayRuleCode?.message}>
                <select {...form.register("holidayRuleCode")} className={inputClassName}>
                  <option value="">No holiday rule</option>
                  {holidayRules.map((rule) => (
                    <option key={rule.id} value={rule.code}>
                      {rule.name} ({rule.type})
                    </option>
                  ))}
                </select>
              </Field>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <MetricField form={form} name="overtimeHours" label="Overtime Hours" />
              <MetricField form={form} name="nightDifferentialHours" label="Night Differential Hours" />
              <MetricField form={form} name="holidayHours" label="Holiday Hours" />
              <MetricField form={form} name="restDayHours" label="Rest Day Hours" />
              <MetricField form={form} name="absencesDays" label="Absence Days" />
              <MetricField form={form} name="tardinessMinutes" label="Tardiness Minutes" />
              <MetricField form={form} name="recurringAllowances" label="Recurring Allowances" />
              <MetricField form={form} name="recurringLoans" label="Recurring Loans" />
              <MetricField form={form} name="recurringCashAdvances" label="Recurring Cash Advances" />
              <MetricField form={form} name="recurringOtherDeductions" label="Recurring Other Deductions" />
              <MetricField form={form} name="bonuses" label="Bonuses" />
              <MetricField form={form} name="incentives" label="Incentives" />
              <MetricField form={form} name="adHocAllowances" label="Ad Hoc Allowances" />
              <MetricField form={form} name="loans" label="Loans" />
              <MetricField form={form} name="cashAdvances" label="Cash Advances" />
            </section>

            <div className="flex justify-end">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Calculating..." : "Calculate Payroll Preview"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preview Result</CardTitle>
          <CardDescription>
            Review the calculated rates, gross pay, deductions, and net pay before saving any payroll record.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!result ? (
            <EmptyState message="Run the calculator to preview payroll results." />
          ) : !result.success ? (
            <EmptyState message={result.error} tone="error" />
          ) : (
            <div className="space-y-6">
              <section className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{result.preview.profile.label}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Monthly salary basis: {formatCurrency(result.preview.profile.monthlySalary)}
                    </p>
                  </div>
                  <Badge variant="outline">{formatCurrency(result.preview.netPay)}</Badge>
                </div>
              </section>

              <PreviewGrid
                title="Rates"
                items={[
                  ["Daily Rate", formatCurrency(result.preview.rates.dailyRate)],
                  ["Hourly Rate", formatCurrency(result.preview.rates.hourlyRate)],
                  ["Minute Rate", formatCurrency(result.preview.rates.minuteRate)],
                ]}
              />

              <PreviewGrid
                title="Earnings"
                items={[
                  ["Base Pay", formatCurrency(result.preview.earnings.periodBasePay)],
                  ["Overtime", formatCurrency(result.preview.earnings.overtimePay)],
                  ["Night Differential", formatCurrency(result.preview.earnings.nightDifferentialPay)],
                  ["Holiday Pay", formatCurrency(result.preview.earnings.holidayPay)],
                  ["Rest Day", formatCurrency(result.preview.earnings.restDayPay)],
                  ["Bonuses", formatCurrency(result.preview.earnings.bonuses)],
                  ["Incentives", formatCurrency(result.preview.earnings.incentives)],
                  ["Recurring Allowances", formatCurrency(result.preview.earnings.recurringAllowanceTotal)],
                  ["Ad Hoc Allowances", formatCurrency(result.preview.earnings.adHocAllowances)],
                  ["Gross Pay", formatCurrency(result.preview.earnings.grossPay)],
                ]}
              />

              <PreviewGrid
                title="Deductions & Contributions"
                items={[
                  ["Absences", formatCurrency(result.preview.deductions.absenceDeduction)],
                  ["Tardiness", formatCurrency(result.preview.deductions.tardinessDeduction)],
                  ["Loans", formatCurrency(result.preview.deductions.recurringLoanTotal + result.preview.deductions.adHocLoans)],
                  ["Cash Advances", formatCurrency(result.preview.deductions.recurringCashAdvanceTotal + result.preview.deductions.adHocCashAdvances)],
                  ["Other Deductions", formatCurrency(result.preview.deductions.recurringOtherDeductionTotal)],
                  ["SSS", formatCurrency(result.preview.government.sss)],
                  ["PhilHealth", formatCurrency(result.preview.government.philHealth)],
                  ["Pag-IBIG", formatCurrency(result.preview.government.pagIbig)],
                  ["Tax", formatCurrency(result.preview.government.tax)],
                  ["Net Pay", formatCurrency(result.preview.netPay)],
                ]}
              />

              {result.preview.warnings.length > 0 ? (
                <div className="space-y-2 rounded-2xl border border-amber-500/30 bg-amber-500/8 p-4">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Configuration warnings</p>
                  <ul className="space-y-1 text-sm text-amber-700 dark:text-amber-300">
                    {result.preview.warnings.map((warning) => (
                      <li key={warning}>- {warning}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </label>
  );
}

function MetricField({
  form,
  name,
  label,
}: {
  form: ReturnType<typeof useForm<PayrollCalculatorInput>>;
  name: keyof PayrollCalculatorInput;
  label: string;
}) {
  return (
    <Field label={label} error={form.formState.errors[name]?.message?.toString()}>
      <input {...form.register(name)} inputMode="decimal" className={inputClassName} />
    </Field>
  );
}

function PreviewGrid({
  title,
  items,
}: {
  title: string;
  items: [string, string][];
}) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-border/70 bg-background/60 p-4">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
            <p className="mt-2 text-sm font-medium">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function EmptyState({ message, tone = "default" }: { message: string; tone?: "default" | "error" }) {
  return (
    <div className={tone === "error" ? "rounded-2xl border border-destructive/30 bg-destructive/8 p-6 text-sm text-destructive" : "rounded-2xl border border-dashed border-border/70 bg-muted/20 p-6 text-sm text-muted-foreground"}>
      {message}
    </div>
  );
}

const inputClassName =
  "border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-10 w-full rounded-xl border px-3 text-sm outline-none focus-visible:ring-2";
