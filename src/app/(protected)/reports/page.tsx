import { ComingSoonPage } from "@/features/dashboard/components/coming-soon-page";

export default function ReportsPage() {
  return (
    <ComingSoonPage
      eyebrow="Personal History"
      title="My Reports & Exports"
      description="This area will provide personal payroll history, downloadable summaries, and export options for your own records."
      purpose="My History is the timeline of your previous payroll simulations so you can review trends, compare runs, and re-export old results without recalculating from scratch."
      plannedItems={[
        "Save each payroll run with timestamp and selected pay frequency.",
        "Search and filter by date range and salary basis.",
        "Re-export previous runs to PDF and Excel in one click.",
        "Quick comparison of net pay changes across runs.",
      ]}
    />
  );
}
