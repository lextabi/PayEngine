import { RuleStatus } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import {
  getUserPayrollSettings,
  personalPayrollSettingDefaults,
} from "@/features/settings/services/user-settings.service";

type CompanyNumericSetting = {
  key: string;
  fallback: number;
};

const numericSettings: CompanyNumericSetting[] = [
  {
    key: "working_days_per_month",
    fallback: Number(personalPayrollSettingDefaults.working_days_per_month),
  },
  {
    key: "working_hours_per_day",
    fallback: Number(personalPayrollSettingDefaults.working_hours_per_day),
  },
  {
    key: "pay_periods_per_month",
    fallback: Number(personalPayrollSettingDefaults.pay_periods_per_month),
  },
  {
    key: "overtime_multiplier",
    fallback: Number(personalPayrollSettingDefaults.overtime_multiplier),
  },
  {
    key: "night_differential_multiplier",
    fallback: Number(personalPayrollSettingDefaults.night_differential_multiplier),
  },
  {
    key: "rest_day_multiplier",
    fallback: Number(personalPayrollSettingDefaults.rest_day_multiplier),
  },
];

export async function getPayrollConfig(userId: string) {
  const [userSettings, holidayRules, governmentRules] = await Promise.all([
    getUserPayrollSettings(userId),
    prisma.holidayRule.findMany({
      where: { isActive: true },
      orderBy: [{ type: "asc" }, { name: "asc" }],
      select: {
        id: true,
        code: true,
        name: true,
        type: true,
        rateMultiplier: true,
        overtimeMultiplier: true,
        nightDifferentialMultiplier: true,
        restDayMultiplier: true,
      },
    }),
    prisma.governmentRule.findMany({
      where: {
        status: {
          in: [RuleStatus.ACTIVE, RuleStatus.DRAFT],
        },
      },
      include: {
        tables: {
          orderBy: [{ sequence: "asc" }],
        },
      },
    }),
  ]);

  const warnings: string[] = [];

  const config = Object.fromEntries(
    numericSettings.map(({ key, fallback }) => {
      const rawValue = userSettings[key as keyof typeof userSettings];
      const parsedValue = rawValue ? Number(rawValue) : Number.NaN;

      if (!rawValue || Number.isNaN(parsedValue)) {
        warnings.push(
          `Your setting '${key}' is missing or invalid. Using fallback value ${fallback}.`,
        );
        return [key, fallback];
      }

      return [key, parsedValue];
    }),
  ) as Record<string, number>;

  return {
    settings: config,
    holidayRules,
    governmentRules,
    manualContributions: {
      enabled: userSettings.use_manual_contributions === "true",
      sss: Number(userSettings.manual_sss_amount || 0),
      philHealth: Number(userSettings.manual_philhealth_amount || 0),
      pagIbig: Number(userSettings.manual_pagibig_amount || 0),
    },
    defaultMonthlySalary: Number(userSettings.default_monthly_salary || 0),
    warnings,
  };
}
