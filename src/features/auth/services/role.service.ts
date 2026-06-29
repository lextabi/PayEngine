import type { AppRole } from "@/types/auth";
import { authAdminEmails } from "@/config/env";
import { prisma } from "@/lib/db/prisma";

const DEFAULT_ROLE: AppRole = "EMPLOYEE";

export const getOrCreateUserRole = async (
  userId: string,
  email: string,
): Promise<AppRole> => {
  const shouldBeAdmin = authAdminEmails.includes(email.toLowerCase());

  const existingRole = await prisma.userRole.findUnique({
    where: { userId },
    select: { role: true },
  });

  if (existingRole) {
    if (shouldBeAdmin && existingRole.role !== "ADMIN") {
      const updatedRole = await prisma.userRole.update({
        where: { userId },
        data: { role: "ADMIN" },
        select: { role: true },
      });

      return updatedRole.role as AppRole;
    }

    return existingRole.role as AppRole;
  }

  const role = shouldBeAdmin ? "ADMIN" : DEFAULT_ROLE;

  await prisma.userRole.create({
    data: {
      userId,
      role,
    },
  });

  return role;
};
