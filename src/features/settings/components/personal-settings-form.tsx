"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  savePersonalSettingsAction,
  type SavePersonalSettingsResult,
} from "@/features/settings/actions/personal-settings.actions";
import {
  personalSettingsSchema,
  type PersonalSettingsInput,
} from "@/features/settings/schema/personal-settings.schema";

type PersonalSettingsFormProps = {
  initialValues: PersonalSettingsInput;
};

export function PersonalSettingsForm({ initialValues }: PersonalSettingsFormProps) {
  const [result, setResult] = useState<SavePersonalSettingsResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<PersonalSettingsInput>({
    resolver: zodResolver(personalSettingsSchema),
    defaultValues: initialValues,
  });

  const useManualHolidayBonuses = form.watch("useManualHolidayBonuses");
  const useManualContributions = form.watch("useManualContributions");

  const onSubmit = form.handleSubmit((values) => {
    setResult(null);

    startTransition(async () => {
      const response = await savePersonalSettingsAction(values);
      setResult(response);
    });
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Card>
        <CardHeader>
          <Badge variant="outline" className="w-fit">Personal Scope</Badge>
          <CardTitle>My Payroll Settings</CardTitle>
          <CardDescription>
            Configure your own salary assumptions and contribution behavior. These settings are applied only to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <MetricField form={form} name="defaultMonthlySalary" label="Default Monthly Salary" />
              <MetricField form={form} name="workingDaysPerMonth" label="Working Days Per Month" />
              <MetricField form={form} name="workingHoursPerDay" label="Working Hours Per Day" />
              <MetricField form={form} name="payPeriodsPerMonth" label="Pay Periods Per Month" />
              <MetricField form={form} name="governmentRuleYear" label="Government Rule Year" />
              <MetricField form={form} name="overtimePercent" label="Overtime Add-on (%)" />
              <MetricField form={form} name="nightDifferentialPercent" label="Night Diff Add-on (%)" />
              <MetricField form={form} name="restDayPercent" label="Rest Day Add-on (%)" />
            </section>

            <section className="space-y-4 rounded-2xl border border-border/70 bg-muted/20 p-4">
              <p className="text-sm font-medium">Holiday Bonus Percentages</p>
              <p className="text-sm text-muted-foreground">
                Default holiday bonus percentages apply automatically unless you enable manual override.
              </p>
              <label className="flex items-center gap-3 text-sm font-medium">
                <input type="checkbox" {...form.register("useManualHolidayBonuses")} className="size-4" />
                Use manual holiday bonus percentages
              </label>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <MetricField
                  form={form}
                  name="regularHolidayBonusPercent"
                  label="Regular Holiday Bonus (%)"
                  disabled={!useManualHolidayBonuses}
                />
                <MetricField
                  form={form}
                  name="specialHolidayBonusPercent"
                  label="Special Holiday Bonus (%)"
                  disabled={!useManualHolidayBonuses}
                />
                <MetricField
                  form={form}
                  name="companyHolidayBonusPercent"
                  label="Company Holiday Bonus (%)"
                  disabled={!useManualHolidayBonuses}
                />
              </div>
            </section>

            <section className="space-y-4 rounded-2xl border border-border/70 bg-muted/20 p-4">
              <label className="flex items-center gap-3 text-sm font-medium">
                <input type="checkbox" {...form.register("useManualContributions")} className="size-4" />
                Use manual SSS, PhilHealth, and Pag-IBIG amounts
              </label>
              <p className="text-sm text-muted-foreground">
                Tax is always computed automatically from the INCOME_TAX rule table.
              </p>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <MetricField form={form} name="manualSssAmount" label="Manual SSS" disabled={!useManualContributions} />
                <MetricField form={form} name="manualPhilHealthAmount" label="Manual PhilHealth" disabled={!useManualContributions} />
                <MetricField form={form} name="manualPagIbigAmount" label="Manual Pag-IBIG" disabled={!useManualContributions} />
              </div>
            </section>

            {result?.success === false ? (
              <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {result.error}
              </p>
            ) : null}

            {result?.success ? (
              <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">
                Settings saved. Payroll calculator now uses your updated values.
              </p>
            ) : null}

            <div className="flex justify-end">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricField({
  form,
  name,
  label,
  disabled,
}: {
  form: ReturnType<typeof useForm<PersonalSettingsInput>>;
  name: keyof PersonalSettingsInput;
  label: string;
  disabled?: boolean;
}) {
  const fieldError = form.formState.errors[name]?.message?.toString();

  return (
    <label className="space-y-2">
      <span className="text-sm font-medium">{label}</span>
      <input
        {...form.register(name)}
        inputMode={name === "useManualContributions" ? undefined : "decimal"}
        disabled={disabled}
        className={inputClassName}
      />
      {fieldError ? <span className="text-xs text-destructive">{fieldError}</span> : null}
    </label>
  );
}

const inputClassName =
  "border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-10 w-full rounded-xl border px-3 text-sm outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60";
