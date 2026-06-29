import { prisma } from "@/lib/db/prisma";
import { getUserPayrollSettings } from "@/features/settings/services/user-settings.service";

export async function getDashboardOverview(userId: string) {
  const [userSettingCount] = await prisma.$transaction([
    prisma.userSetting.count({ where: { userId } }),
  ]);

  const userSettings = await getUserPayrollSettings(userId);

  return {
    stats: {
      userSettingCount,
      defaultMonthlySalary: Number(userSettings.default_monthly_salary || 0),
      manualContributionsEnabled: userSettings.use_manual_contributions === "true",
    },
  };
}
