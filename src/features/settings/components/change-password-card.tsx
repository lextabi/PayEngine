"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  changePasswordSchema,
  type ChangePasswordSchema,
} from "@/features/auth/schema/login.schema";

type ChangePasswordCardProps = {
  email: string;
};

export function ChangePasswordCard({ email }: ChangePasswordCardProps) {
  const [result, setResult] = useState<{ error?: string; success?: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<ChangePasswordSchema>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    setResult(null);

    startTransition(async () => {
      const supabase = createSupabaseBrowserClient();

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: values.currentPassword,
      });

      if (signInError) {
        setResult({ error: "Current password is incorrect." });
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: values.newPassword,
      });

      if (updateError) {
        setResult({ error: updateError.message });
        return;
      }

      form.reset();
      setResult({ success: "Password updated successfully." });
    });
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>
          Confirm your current password, then set a new one. This is for signed-in users only.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="currentPassword" className="text-sm font-medium">
              Current Password
            </label>
            <input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              required
              {...form.register("currentPassword")}
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-10 w-full rounded-lg border px-3 text-sm outline-none focus-visible:ring-2"
              placeholder="••••••••"
            />
            {form.formState.errors.currentPassword?.message ? (
              <p className="text-destructive text-xs">{form.formState.errors.currentPassword.message}</p>
            ) : null}
          </div>

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

          {result?.error ? (
            <p className="text-destructive text-sm" role="alert">
              {result.error}
            </p>
          ) : null}

          {result?.success ? (
            <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">
              {result.success}
            </p>
          ) : null}

          <Button type="submit" disabled={isPending}>
            {isPending ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}