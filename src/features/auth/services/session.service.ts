import { cache } from "react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppRole, AuthUser } from "@/types/auth";
import { getOrCreateUserRole } from "@/features/auth/services/role.service";

const DEFAULT_UNAUTHORIZED_ROLE: AppRole = "EMPLOYEE";

const getSessionUserInternal = cache(async (): Promise<AuthUser | null> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return null;
  }

  let role: AppRole = DEFAULT_UNAUTHORIZED_ROLE;

  try {
    role = await getOrCreateUserRole(user.id, user.email);
  } catch {
    // Keep auth session usable even if role bootstrap storage is unavailable.
  }

  return {
    id: user.id,
    email: user.email,
    role,
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
