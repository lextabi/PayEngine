import { redirect } from "next/navigation";

import { getSessionUser } from "@/features/auth/services/session.service";

export default async function Home() {
  const user = await getSessionUser();
  redirect(user ? "/dashboard" : "/signup");
}
