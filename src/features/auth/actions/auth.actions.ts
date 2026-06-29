"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { loginSchema, signupSchema } from "@/features/auth/schema/login.schema";
import { clientEnv } from "@/config/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type LoginActionState = {
  error?: string;
};

export type SignupActionState = {
  error?: string;
  message?: string;
};

const INVALID_CREDENTIALS = "Invalid email or password.";

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

export const logoutAction = async () => {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  revalidatePath("/");
  redirect("/login");
};
