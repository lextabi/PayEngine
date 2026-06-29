import { cache } from "react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AuthUser } from "@/types/auth";

const getSessionUserInternal = cache(async (): Promise<AuthUser | null> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
  };
});

export const getSessionUser = async () => getSessionUserInternal();

export const requireSessionUser = async (): Promise<AuthUser> => {
  const user = await getSessionUser();

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  return user;
};
