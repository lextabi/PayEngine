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
                Save/reuse named calculator presets and add export history for personal financial planning.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
