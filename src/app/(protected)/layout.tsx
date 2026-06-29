import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AppShell } from "@/features/dashboard/components/app-shell";
import { getSessionUser } from "@/features/auth/services/session.service";

type ProtectedLayoutProps = {
  children: ReactNode;
};

export default async function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  return <AppShell user={user}>{children}</AppShell>;
}
