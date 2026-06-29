import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,var(--color-muted),transparent_60%)] p-6">
      <section className="border-border/60 bg-card w-full max-w-md space-y-4 rounded-2xl border p-6 shadow-md sm:p-8">
        <p className="text-muted-foreground text-xs font-medium tracking-[0.16em] uppercase">
          PayEngine
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
        <p className="text-sm text-muted-foreground">
          We sent a verification link to your email address. Verify your account first, then sign in.
        </p>
        <Link href="/login" className="text-sm font-medium underline-offset-4 hover:underline">
          Back to login
        </Link>
      </section>
    </main>
  );
}
