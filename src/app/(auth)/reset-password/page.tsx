import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,var(--color-muted),transparent_60%)] p-6">
      <section className="w-full max-w-md space-y-6">
        <div className="space-y-2">
          <p className="text-muted-foreground text-xs font-medium tracking-[0.16em] uppercase">
            PayEngine
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Set a new password
          </h1>
          <p className="text-muted-foreground text-sm">
            Use the link from your email to continue, then choose a new password for your account.
          </p>
        </div>

        <ResetPasswordForm />
      </section>
    </main>
  );
}
