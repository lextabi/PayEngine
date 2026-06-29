import { redirect } from "next/navigation";

import { logoutAction } from "@/features/auth/actions/auth.actions";
import { getSessionUser } from "@/features/auth/services/session.service";

export default async function DashboardPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="flex min-h-screen bg-[radial-gradient(circle_at_top_left,var(--color-muted),transparent_65%)] p-6 sm:p-10">
      <section className="border-border/60 bg-card mx-auto flex w-full max-w-5xl flex-col gap-6 rounded-3xl border p-6 shadow-sm sm:p-10">
        <header className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm">Authenticated Session</p>
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Signed in as <span className="font-medium">{user.email}</span> ({" "}
              {user.role}).
            </p>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              className="border-border bg-background hover:bg-muted inline-flex h-9 items-center justify-center rounded-lg border px-4 text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </form>
        </header>

        <div className="grid gap-4 sm:grid-cols-3">
          <article className="border-border/60 bg-background rounded-xl border p-4">
            <p className="text-muted-foreground text-xs uppercase">Session</p>
            <p className="mt-2 text-sm font-medium">Active</p>
          </article>
          <article className="border-border/60 bg-background rounded-xl border p-4">
            <p className="text-muted-foreground text-xs uppercase">Role</p>
            <p className="mt-2 text-sm font-medium">{user.role}</p>
          </article>
          <article className="border-border/60 bg-background rounded-xl border p-4">
            <p className="text-muted-foreground text-xs uppercase">Auth Provider</p>
            <p className="mt-2 text-sm font-medium">Supabase Auth</p>
          </article>
        </div>
      </section>
    </main>
  );
}
