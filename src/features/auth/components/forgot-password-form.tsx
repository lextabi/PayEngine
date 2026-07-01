"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  sendPasswordResetAction,
  type ForgotPasswordActionState,
} from "@/features/auth/actions/auth.actions";

const initialState: ForgotPasswordActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 w-full items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50"
    >
      {pending ? "Sending link..." : "Send reset link"}
    </button>
  );
}

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(sendPasswordResetAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-10 w-full rounded-lg border px-3 text-sm outline-none focus-visible:ring-2"
          placeholder="you@company.com"
        />
      </div>

      {state.error ? (
        <p className="text-destructive text-sm" role="alert">
          {state.error}
        </p>
      ) : null}

      {state.message ? (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">
          {state.message}
        </p>
      ) : null}

      <SubmitButton />

      <p className="text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link href="/login" className="text-foreground font-medium underline-offset-4 hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
