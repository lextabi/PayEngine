"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  forgotPasswordSchema,
  loginSchema,
  signupSchema,
} from "@/features/auth/schema/login.schema";
import { clientEnv } from "@/config/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type LoginActionState = {
  error?: string;
};

export type SignupActionState = {
  error?: string;
  message?: string;
};

export type ForgotPasswordActionState = {
  error?: string;
  message?: string;
};

const INVALID_CREDENTIALS = "Invalid email or password.";
const ACTION_COOLDOWN_MS = 60_000;

type CooldownEntry = {
  expiresAt: number;
};

const actionCooldownStore = new Map<string, CooldownEntry>();

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function enforceActionCooldown(action: string, email: string) {
  const key = `${action}:${normalizeEmail(email)}`;
  const now = Date.now();
  const existing = actionCooldownStore.get(key);

  if (existing && existing.expiresAt > now) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((existing.expiresAt - now) / 1000),
    };
  }

  actionCooldownStore.set(key, {
    expiresAt: now + ACTION_COOLDOWN_MS,
  });

  return {
    allowed: true,
  };
}

const mapSignInError = (message: string) => {
  const normalized = message.toLowerCase();

  if (normalized.includes("email not confirmed")) {
    return "Please verify your email before signing in.";
  }

  return INVALID_CREDENTIALS;
};

export const loginAction = async (
  _prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> => {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? INVALID_CREDENTIALS,
    };
  }

  const cooldown = enforceActionCooldown("login", parsed.data.email);

  if (!cooldown.allowed) {
    return {
      error: `Please wait ${cooldown.retryAfterSeconds} seconds before trying again.`,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return {
      error: mapSignInError(error.message),
    };
  }

  revalidatePath("/");
  redirect("/dashboard");
};

export const signupAction = async (
  _prevState: SignupActionState,
  formData: FormData,
): Promise<SignupActionState> => {
  const parsed = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid signup details.",
    };
  }

  const cooldown = enforceActionCooldown("signup", parsed.data.email);

  if (!cooldown.allowed) {
    return {
      error: `Please wait ${cooldown.retryAfterSeconds} seconds before trying again.`,
    };
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${clientEnv.NEXT_PUBLIC_APP_URL}/login`,
    },
  });

  if (error) {
    return {
      error: error.message,
    };
  }

  redirect("/verify-email");
};

export const sendPasswordResetAction = async (
  _prevState: ForgotPasswordActionState,
  formData: FormData,
): Promise<ForgotPasswordActionState> => {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid email address.",
    };
  }

  const cooldown = enforceActionCooldown("forgot-password", parsed.data.email);

  if (!cooldown.allowed) {
    return {
      message: `Please wait ${cooldown.retryAfterSeconds} seconds before requesting another reset link.`,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${clientEnv.NEXT_PUBLIC_APP_URL}/auth/confirm?next=/reset-password`,
  });

  if (error) {
    console.error("Password reset email request failed:", error.message);

    if (error.message.toLowerCase().includes("rate limit")) {
      return {
        error:
          "Supabase email rate limit exceeded. Please wait about 60 seconds and try again, or configure custom SMTP for reliable delivery.",
      };
    }

    return {
      error: error.message,
    };
  }

  return {
    message: "If the email exists, a password reset link has been sent.",
  };
};

export const logoutAction = async () => {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  revalidatePath("/");
  redirect("/login");
};
