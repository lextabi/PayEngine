"use client";

import { useState, useTransition } from "react";
import { Download } from "lucide-react";
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
import { formatCurrency } from "@/lib/formatters";

type PayrollCalculatorFormProps = {
  defaultMonthlySalary: string;
  recurringAllowances: string;
  recurringLoans: string;
  recurringCashAdvances: string;
  recurringOtherDeductions: string;
};

export function PayrollCalculatorForm({
  defaultMonthlySalary,
  recurringAllowances,
  recurringLoans,
  recurringCashAdvances,
  recurringOtherDeductions,
}: PayrollCalculatorFormProps) {
  const [result, setResult] = useState<PayrollPreviewActionResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const [exporting, setExporting] = useState<"pdf" | "excel" | null>(null);

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

  const handleExcelExport = async () => {
    if (!result?.success) {
      return;
    }

    setExporting("excel");

    try {
      const XLSX = await import("xlsx");
      const preview = result.preview;
      const rows: Array<Array<string | number>> = [
        ["PayEngine Payroll Preview"],
        ["Generated At", new Date().toISOString()],
        [],
        ["Profile"],
        ["Label", preview.profile.label],
        ["Monthly Salary", preview.profile.monthlySalary],
        [],
        ["Rates"],
        ["Daily Rate", preview.rates.dailyRate],
        ["Hourly Rate", preview.rates.hourlyRate],
        ["Minute Rate", preview.rates.minuteRate],
        [],
        ["Earnings"],
        ["Base Pay", preview.earnings.periodBasePay],
        ["Overtime", preview.earnings.overtimePay],
        ["Night Differential", preview.earnings.nightDifferentialPay],
        ["Holiday Pay", preview.earnings.holidayPay],
        ["Rest Day", preview.earnings.restDayPay],
        ["Bonuses", preview.earnings.bonuses],
        ["Incentives", preview.earnings.incentives],
        ["Recurring Allowances", preview.earnings.recurringAllowanceTotal],
        ["Ad Hoc Allowances", preview.earnings.adHocAllowances],
        ["Gross Pay", preview.earnings.grossPay],
        [],
        ["Deductions & Contributions"],
        ["Absences", preview.deductions.absenceDeduction],
        ["Tardiness", preview.deductions.tardinessDeduction],
        ["Loans", preview.deductions.recurringLoanTotal + preview.deductions.adHocLoans],
        ["Cash Advances", preview.deductions.recurringCashAdvanceTotal + preview.deductions.adHocCashAdvances],
        ["Other Deductions", preview.deductions.recurringOtherDeductionTotal],
        ["SSS", preview.government.sss],
        ["PhilHealth", preview.government.philHealth],
        ["Pag-IBIG", preview.government.pagIbig],
        ["Tax", preview.government.tax],
        ["Net Pay", preview.netPay],
      ];

      if (preview.warnings.length > 0) {
        rows.push([], ["Warnings"]);
        preview.warnings.forEach((warning) => rows.push([warning]));
      }

      const worksheet = XLSX.utils.aoa_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Payroll Preview");

      const fileStamp = new Date().toISOString().replace(/[:.]/g, "-");
      XLSX.writeFile(workbook, `payroll-preview-${fileStamp}.xlsx`);
    } finally {
      setExporting(null);
    }
  };

  const handlePdfExport = async () => {
    if (!result?.success) {
      return;
    }

    setExporting("pdf");

    try {
      const { jsPDF } = await import("jspdf");
      const preview = result.preview;
      const doc = new jsPDF({ unit: "pt", format: "a4" });

      let y = 40;
      const left = 40;
      const lineHeight = 18;

      const addLine = (label: string, value?: string) => {
        if (y > 790) {
          doc.addPage();
          y = 40;
        }

        doc.text(value ? `${label}: ${value}` : label, left, y);
        y += lineHeight;
      };

      doc.setFontSize(16);
      addLine("PayEngine Payroll Preview");
      doc.setFontSize(10);
      addLine("Generated At", new Date().toLocaleString());
      y += 10;

      doc.setFontSize(12);
      addLine("Profile");
      doc.setFontSize(10);
      addLine("Label", preview.profile.label);
      addLine("Monthly Salary", formatCurrency(preview.profile.monthlySalary));
      y += 8;

      doc.setFontSize(12);
      addLine("Rates");
      doc.setFontSize(10);
      addLine("Daily Rate", formatCurrency(preview.rates.dailyRate));
      addLine("Hourly Rate", formatCurrency(preview.rates.hourlyRate));
      addLine("Minute Rate", formatCurrency(preview.rates.minuteRate));
      y += 8;

      doc.setFontSize(12);
      addLine("Earnings");
      doc.setFontSize(10);
      addLine("Base Pay", formatCurrency(preview.earnings.periodBasePay));
      addLine("Overtime", formatCurrency(preview.earnings.overtimePay));
      addLine("Night Differential", formatCurrency(preview.earnings.nightDifferentialPay));
      addLine("Holiday Pay", formatCurrency(preview.earnings.holidayPay));
      addLine("Rest Day", formatCurrency(preview.earnings.restDayPay));
      addLine("Bonuses", formatCurrency(preview.earnings.bonuses));
      addLine("Incentives", formatCurrency(preview.earnings.incentives));
      addLine("Recurring Allowances", formatCurrency(preview.earnings.recurringAllowanceTotal));
      addLine("Ad Hoc Allowances", formatCurrency(preview.earnings.adHocAllowances));
      addLine("Gross Pay", formatCurrency(preview.earnings.grossPay));
      y += 8;

      doc.setFontSize(12);
      addLine("Deductions and Contributions");
      doc.setFontSize(10);
      addLine("Absences", formatCurrency(preview.deductions.absenceDeduction));
      addLine("Tardiness", formatCurrency(preview.deductions.tardinessDeduction));
      addLine("Loans", formatCurrency(preview.deductions.recurringLoanTotal + preview.deductions.adHocLoans));
      addLine("Cash Advances", formatCurrency(preview.deductions.recurringCashAdvanceTotal + preview.deductions.adHocCashAdvances));
      addLine("Other Deductions", formatCurrency(preview.deductions.recurringOtherDeductionTotal));
      addLine("SSS", formatCurrency(preview.government.sss));
      addLine("PhilHealth", formatCurrency(preview.government.philHealth));
      addLine("Pag-IBIG", formatCurrency(preview.government.pagIbig));
      addLine("Tax", formatCurrency(preview.government.tax));
      addLine("Net Pay", formatCurrency(preview.netPay));

      if (preview.warnings.length > 0) {
        y += 8;
        doc.setFontSize(12);
        addLine("Warnings");
        doc.setFontSize(10);
        preview.warnings.forEach((warning) => addLine(`- ${warning}`));
      }

      const fileStamp = new Date().toISOString().replace(/[:.]/g, "-");
      doc.save(`payroll-preview-${fileStamp}.pdf`);
    } finally {
      setExporting(null);
    }
  };

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
              <Field label="Pay Frequency" error={form.formState.errors.payFrequency?.message}>
                <select {...form.register("payFrequency")} className={inputClassName}>
                  <option value="MONTHLY">Monthly</option>
                  <option value="SEMI_MONTHLY">Semi-Monthly</option>
                  <option value="WEEKLY">Weekly</option>
                </select>
              </Field>
              <MetricField form={form} name="monthlySalary" label="Monthly Salary" />
            </section>

            <section className="space-y-3 rounded-2xl border border-border/70 bg-muted/20 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">Holiday Hours by Type</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <MetricField form={form} name="regularHolidayHours" label="Regular Holiday Hours" />
                <MetricField form={form} name="specialHolidayHours" label="Special Holiday Hours" />
                <MetricField form={form} name="companyHolidayHours" label="Company Holiday Hours" />
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <MetricField form={form} name="overtimeHours" label="Overtime Hours" />
              <MetricField form={form} name="nightDifferentialHours" label="Night Differential Hours" />
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
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{formatCurrency(result.preview.netPay)}</Badge>
                    <Button type="button" variant="outline" onClick={handlePdfExport} disabled={exporting !== null}>
                      <Download className="mr-2 size-4" />
                      {exporting === "pdf" ? "Exporting PDF..." : "Export PDF"}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleExcelExport} disabled={exporting !== null}>
                      <Download className="mr-2 size-4" />
                      {exporting === "excel" ? "Exporting Excel..." : "Export Excel"}
                    </Button>
                  </div>
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
                  ["Regular Holiday", formatCurrency(result.preview.earnings.regularHolidayPay)],
                  ["Special Holiday", formatCurrency(result.preview.earnings.specialHolidayPay)],
                  ["Company Holiday", formatCurrency(result.preview.earnings.companyHolidayPay)],
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

              {result.preview.taxBreakdown ? (
                <section className="space-y-3 rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    How Tax Was Computed
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <TaxLine label="Pay Frequency" value={result.preview.taxBreakdown.selectedPayFrequency.replaceAll("_", " ")} />
                    <TaxLine label="Selected Period Gross Pay" value={formatCurrency(result.preview.taxBreakdown.selectedPeriodGrossPay)} />
                    <TaxLine label="Tax Table Basis Used" value={formatCurrency(result.preview.taxBreakdown.basisForTaxTable)} />
                    <TaxLine label="Applied Bracket" value={`#${result.preview.taxBreakdown.bracketSequence}`} />
                    <TaxLine
                      label="Bracket Range"
                      value={`${formatCurrency(result.preview.taxBreakdown.bracketRangeStart)} - ${result.preview.taxBreakdown.bracketRangeEnd == null ? "and above" : formatCurrency(result.preview.taxBreakdown.bracketRangeEnd)}`}
                    />
                    <TaxLine label="Base Amount" value={formatCurrency(result.preview.taxBreakdown.baseAmount)} />
                    <TaxLine label="Rate" value={`${(result.preview.taxBreakdown.bracketRate * 100).toFixed(2)}%`} />
                    <TaxLine label="Excess Over Range Start" value={formatCurrency(result.preview.taxBreakdown.excessOverRangeStart)} />
                    <TaxLine label="Formula" value={result.preview.taxBreakdown.formulaKey.replaceAll("_", " ")} />
                    <TaxLine label="Final Tax Deducted" value={formatCurrency(result.preview.taxBreakdown.finalTaxForSelectedPeriod)} />
                  </div>
                </section>
              ) : null}

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

function TaxLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/70 p-3">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

const inputClassName =
  "border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-10 w-full rounded-xl border px-3 text-sm outline-none focus-visible:ring-2";
