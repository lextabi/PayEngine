import { redirect } from "next/navigation";

import { LoginForm } from "@/features/auth/components/login-form";
import { getSessionUser } from "@/features/auth/services/session.service";

export default async function LoginPage() {
  const user = await getSessionUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,var(--color-muted),transparent_60%)] p-6">
      <section className="border-border/60 bg-card w-full max-w-md rounded-2xl border p-6 shadow-md sm:p-8">
        <div className="mb-6 space-y-2">
          <p className="text-muted-foreground text-xs font-medium tracking-[0.16em] uppercase">
            PayEngine
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Sign in to your account
          </h1>
          <p className="text-muted-foreground text-sm">
            Use your Supabase Auth credentials to continue.
          </p>
        </div>

        <LoginForm />
      </section>
    </main>
  );
}
