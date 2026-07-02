import { SlidersHorizontal, WalletCards } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDashboardOverview } from "@/features/dashboard/services/dashboard.service";
import { requireSessionUser } from "@/features/auth/services/session.service";
import { formatCurrency } from "@/lib/formatters";

const statCards = [
  {
    key: "defaultMonthlySalary",
    title: "Monthly Salary",
    caption: "Current default in your calculator",
    icon: WalletCards,
  },
  {
    key: "userSettingCount",
    title: "Configured Settings",
    caption: "Personal calculator settings saved",
    icon: SlidersHorizontal,
  },
] as const;

export default async function DashboardPage() {
  const user = await requireSessionUser();
  const overview = await getDashboardOverview(user.id);
  const updatedAsOf = overview.sourceGuide.updatedAt
    ? new Intl.DateTimeFormat("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(overview.sourceGuide.updatedAt))
    : "Not available";

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:gap-8">
      <section className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
        <Card className="overflow-hidden border-transparent bg-[linear-gradient(135deg,color-mix(in_oklch,var(--color-primary),white_60%)_0%,color-mix(in_oklch,var(--color-chart-1),white_68%)_40%,color-mix(in_oklch,var(--color-card),transparent_5%)_100%)] dark:bg-[linear-gradient(135deg,color-mix(in_oklch,var(--color-primary),black_55%)_0%,color-mix(in_oklch,var(--color-chart-3),black_60%)_40%,color-mix(in_oklch,var(--color-card),transparent_10%)_100%)]">
          <CardHeader className="pb-4">
            <Badge variant="outline" className="w-fit border-black/10 bg-white/60 text-black/70 dark:border-white/10 dark:bg-black/20 dark:text-white/75">
              Personal Payroll Workspace
            </Badge>
            <CardTitle className="max-w-2xl text-3xl sm:text-4xl">
              Estimate your payroll anytime with your own assumptions.
            </CardTitle>
            <CardDescription className="max-w-2xl text-sm leading-6 text-black/70 dark:text-white/70 sm:text-base">
              This app now focuses on personal payroll simulation. You control salary assumptions and contribution behavior through your own account settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map(({ key, title, caption, icon: Icon }) => (
              <div key={key} className="rounded-2xl border border-black/10 bg-white/70 p-4 backdrop-blur dark:border-white/10 dark:bg-black/20">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-black/55 dark:text-white/55">
                      {title}
                    </p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight text-black dark:text-white">
                      {key === "defaultMonthlySalary"
                        ? formatCurrency(overview.stats.defaultMonthlySalary)
                        : overview.stats[key]}
                    </p>
                  </div>
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-black/5 dark:bg-white/10">
                    <Icon className="size-5" />
                  </div>
                </div>
                <p className="mt-3 text-sm text-black/60 dark:text-white/60">{caption}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuration Snapshot</CardTitle>
            <CardDescription>
              Quick check of your current personal calculator posture.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
              <p className="text-sm font-medium">Manual contributions mode</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight">
                {overview.stats.manualContributionsEnabled ? "Enabled" : "Disabled"}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                You can toggle this in My Settings to manually set SSS, PhilHealth, and Pag-IBIG values. Tax always stays automatic.
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
              <p className="text-sm font-medium">Self-service workflow</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Signup, login, personal settings, and payroll preview are now aligned for individual usage.
              </p>
            </div>
            <div className="rounded-2xl border border-dashed border-border/70 p-4">
              <p className="text-sm font-medium">Next workflow focus</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Save finalized calculator previews and track net pay versus deductions in My History.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>How Tax Is Computed</CardTitle>
            <CardDescription>
              Tax uses the active INCOME_TAX rule table. The calculator maps your selected pay frequency to the rule basis and computes tax from bracket base amount plus rate on excess.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 text-sm">
              <p>
                Rule status: <span className="font-medium">{overview.taxGuide.status ?? "Not configured"}</span>
              </p>
              {overview.taxGuide.sample ? (
                <p className="mt-2 text-muted-foreground">
                  Sample using your default salary ({formatCurrency(overview.stats.defaultMonthlySalary)}) on semi-monthly basis: bracket #{overview.taxGuide.sample.appliedSequence} with {(overview.taxGuide.sample.appliedRate * 100).toFixed(2)}% rate, estimated tax {formatCurrency(overview.taxGuide.sample.computedTax)}.
                </p>
              ) : (
                <p className="mt-2 text-muted-foreground">
                  No matching tax bracket found for the sample basis yet.
                </p>
              )}
            </div>

            <div className="overflow-hidden rounded-2xl border border-border/70">
              <div className="grid grid-cols-[0.5fr_1.1fr_1fr_0.8fr_1fr] gap-3 border-b border-border/70 bg-muted/30 px-4 py-3 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                <span>#</span>
                <span>Range</span>
                <span>Base Amount</span>
                <span>Rate</span>
                <span>Formula</span>
              </div>
              {overview.taxGuide.rows.length === 0 ? (
                <div className="px-4 py-4 text-sm text-muted-foreground">No INCOME_TAX rows configured.</div>
              ) : (
                overview.taxGuide.rows.map((row) => (
                  <div
                    key={row.sequence}
                    className="grid grid-cols-[0.5fr_1.1fr_1fr_0.8fr_1fr] gap-3 border-b border-border/60 px-4 py-3 text-sm last:border-b-0"
                  >
                    <span>{row.sequence}</span>
                    <span>
                      {formatCurrency(row.rangeStart)} - {row.rangeEnd == null ? "and above" : formatCurrency(row.rangeEnd)}
                    </span>
                    <span>{formatCurrency(row.baseAmount)}</span>
                    <span>{(row.employeeRate * 100).toFixed(2)}%</span>
                    <span>{row.formulaKey || "-"}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Government Contributions ({overview.sourceGuide.assumptionsYear} Guide)</CardTitle>
            <CardDescription>
              SSS, PhilHealth, and Pag-IBIG are computed from configured rule tables for the selected rule year when manual contributions are disabled.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
              Sample basis from your default monthly salary: {formatCurrency(overview.contributionGuide.basis.monthlySalary)} monthly / {formatCurrency(overview.contributionGuide.basis.semiMonthlySalary)} semi-monthly.
            </div>

            <div className="overflow-hidden rounded-2xl border border-border/70">
              <div className="grid grid-cols-[0.9fr_0.9fr_1fr_1fr_1fr_1fr] gap-3 border-b border-border/70 bg-muted/30 px-4 py-3 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                <span>Agency</span>
                <span>Status</span>
                <span>Bracket #</span>
                <span>Formula</span>
                <span>Monthly</span>
                <span>Semi-monthly</span>
              </div>
              {overview.contributionGuide.rows.map((row) => (
                <div
                  key={row.code}
                  className="grid grid-cols-[0.9fr_0.9fr_1fr_1fr_1fr_1fr] gap-3 border-b border-border/60 px-4 py-3 text-sm last:border-b-0"
                >
                  <span>{row.label}</span>
                  <span>{row.status ?? "Not configured"}</span>
                  <span>{row.appliedSequence ?? "-"}</span>
                  <span>{row.formulaKey ?? "-"}</span>
                  <span>{row.monthlyAmount == null ? "-" : formatCurrency(row.monthlyAmount)}</span>
                  <span>{row.semiMonthlyAmount == null ? "-" : formatCurrency(row.semiMonthlyAmount)}</span>
                </div>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                <p className="text-sm font-medium">Estimated monthly contributions</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">
                  {formatCurrency(overview.contributionGuide.totalMonthlyContributions)}
                </p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                <p className="text-sm font-medium">Estimated semi-monthly contributions</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">
                  {formatCurrency(overview.contributionGuide.totalSemiMonthlyContributions)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Accuracy and Sources</CardTitle>
            <CardDescription>
              Answers to common verification questions: is this accurate, is this up to date, and where the computation basis comes from.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
              <p>{overview.sourceGuide.summary}</p>
              <p className="mt-2 font-medium text-foreground">
                PhilHealth, SSS, Pag-IBIG, and Tax computations updated as of {updatedAsOf} based on sources.
              </p>
              <p className="mt-1">
                Assumption year currently loaded: {overview.sourceGuide.assumptionsYear}
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border/70">
              <div className="grid grid-cols-[1fr_1fr_1.2fr] gap-3 border-b border-border/70 bg-muted/30 px-4 py-3 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                <span>Agency Source</span>
                <span>Coverage</span>
                <span>Reference Link</span>
              </div>
              {overview.sourceGuide.references.map((reference) => (
                <div
                  key={reference.key}
                  className="grid grid-cols-[1fr_1fr_1.2fr] gap-3 border-b border-border/60 px-4 py-3 text-sm last:border-b-0"
                >
                  <span>{reference.label}</span>
                  <span>{reference.coverage}</span>
                  <a
                    href={reference.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline underline-offset-4"
                  >
                    Open source
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
