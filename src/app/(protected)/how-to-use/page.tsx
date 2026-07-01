import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
  "Create an account and verify your email.",
  "Open My Settings and set your monthly salary assumptions.",
  "Configure multipliers and optional manual SSS/PhilHealth/Pag-IBIG amounts.",
  "Open My Calculator and choose pay frequency (monthly, semi-monthly, or weekly).",
  "Fill in overtime, holiday, bonuses, and deductions as needed.",
  "Click Calculate Payroll Preview to view net pay and detailed tax computation.",
  "Export your result as PDF or Excel for your records.",
] as const;

export default function HowToUsePage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="space-y-3">
        <Badge variant="outline" className="w-fit">Guide</Badge>
        <h2 className="text-3xl font-semibold tracking-tight">How to Use PayEngine</h2>
        <p className="text-sm text-muted-foreground sm:text-base">
          Follow this quick guide to set up your profile, compute payroll, and export your results.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Step-by-step</CardTitle>
          <CardDescription>
            Personal payroll simulation in under five minutes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {steps.map((step, index) => (
              <li key={step} className="flex gap-3 rounded-xl border border-border/70 bg-muted/20 p-4">
                <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-border/70 bg-background text-xs font-semibold">
                  {index + 1}
                </span>
                <p className="text-sm leading-6">{step}</p>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tax transparency</CardTitle>
          <CardDescription>
            Tax is always computed automatically from the active INCOME_TAX rule table.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            After each preview, open the "How Tax Was Computed" section to see the applied bracket, base amount, rate, and exact tax formula inputs used for your selected frequency.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
