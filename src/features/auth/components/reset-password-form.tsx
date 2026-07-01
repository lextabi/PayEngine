"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  resetPasswordSchema,
  type ResetPasswordSchema,
} from "@/features/auth/schema/login.schema";

export function ResetPasswordForm() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecoverySession, setIsRecoverySession] = useState(false);

  const form = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      const supabase = createSupabaseBrowserClient();
      const currentUrl = new URL(window.location.href);
      const recoveryCode = currentUrl.searchParams.get("code");

      if (recoveryCode) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(recoveryCode);

        if (exchangeError && mounted) {
          setError("The recovery link could not be verified. Please request a new one.");
          setIsReady(true);
          return;
        }

        currentUrl.searchParams.delete("code");
        window.history.replaceState({}, document.title, currentUrl.toString());
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      setIsRecoverySession(Boolean(session));
      setIsReady(true);
    };

    void initialize();

    return () => {
      mounted = false;
    };
  }, []);

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      if (!isRecoverySession) {
        setError("Open the password reset link from your email again to continue.");
        return;
      }

      const supabase = createSupabaseBrowserClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password: values.newPassword,
      });

      if (updateError) {
        setError(updateError.message || "Failed to update password.");
        return;
      }

      await supabase.auth.signOut();
      setMessage("Your password has been updated. Please sign in again.");
      router.push("/login?passwordReset=success");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Failed to update password.");
    } finally {
      setIsSubmitting(false);
    }
  });

  const helperMessage = useMemo(() => {
    if (!isReady) {
      return "Preparing your recovery session...";
    }

    if (!isRecoverySession) {
      return "Open this page from the password reset email link to continue.";
    }

    return "Enter your new password below to finish the reset.";
  }, [isReady, isRecoverySession]);

  return (
    <Card className="border-border/60 bg-card shadow-md">
      <CardContent className="space-y-4 p-6 sm:p-8">
        <p className="text-sm text-muted-foreground">{helperMessage}</p>

        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="newPassword" className="text-sm font-medium">
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              required
              {...form.register("newPassword")}
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-10 w-full rounded-lg border px-3 text-sm outline-none focus-visible:ring-2"
              placeholder="••••••••"
            />
            {form.formState.errors.newPassword?.message ? (
              <p className="text-destructive text-xs">{form.formState.errors.newPassword.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              {...form.register("confirmPassword")}
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-10 w-full rounded-lg border px-3 text-sm outline-none focus-visible:ring-2"
              placeholder="••••••••"
            />
            {form.formState.errors.confirmPassword?.message ? (
              <p className="text-destructive text-xs">{form.formState.errors.confirmPassword.message}</p>
            ) : null}
          </div>

          {error ? (
            <p className="text-destructive text-sm" role="alert">
              {error}
            </p>
          ) : null}

          {message ? (
            <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">
              {message}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={isSubmitting || !isRecoverySession}>
            {isSubmitting ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
