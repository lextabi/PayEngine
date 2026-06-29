"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { loginSchema } from "@/features/auth/schema/login.schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type LoginActionState = {
  error?: string;
};

const INVALID_CREDENTIALS = "Invalid email or password.";

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
      error: INVALID_CREDENTIALS,
    };
  }

  revalidatePath("/");
  redirect("/dashboard");
};

export const logoutAction = async () => {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  revalidatePath("/");
  redirect("/login");
};
