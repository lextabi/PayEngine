import { SettingValueType } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";

export const personalPayrollSettingDefaults = {
  default_monthly_salary: "0",
  working_days_per_month: "22",
  working_hours_per_day: "8",
  pay_periods_per_month: "2",
  government_rule_year: "2026",
  overtime_multiplier: "1.25",
  night_differential_multiplier: "0.10",
  rest_day_multiplier: "1.30",
  regular_holiday_bonus_percent: "0",
  special_holiday_bonus_percent: "0",
  company_holiday_bonus_percent: "0",
  use_manual_holiday_bonuses: "false",
  use_manual_contributions: "false",
  manual_sss_amount: "0",
  manual_philhealth_amount: "0",
  manual_pagibig_amount: "0",
} as const;

const userSettingKeys = Object.keys(personalPayrollSettingDefaults) as Array<keyof typeof personalPayrollSettingDefaults>;
const userSettingKeySet = new Set<string>(userSettingKeys);

export type PersonalPayrollSettings = Record<keyof typeof personalPayrollSettingDefaults, string>;

export async function getUserPayrollSettings(userId: string): Promise<PersonalPayrollSettings> {
  const rows = await prisma.userSetting.findMany({
    where: {
      userId,
      key: {
        in: userSettingKeys,
      },
    },
    select: {
      key: true,
      value: true,
    },
  });

  const valueMap = new Map(rows.map((row) => [row.key, row.value ?? ""]));

  return Object.fromEntries(
    userSettingKeys.map((key) => [
      key,
      valueMap.get(key) || personalPayrollSettingDefaults[key],
    ]),
  ) as PersonalPayrollSettings;
}

export async function upsertUserPayrollSettings(
  userId: string,
  values: Partial<PersonalPayrollSettings>,
) {
  const entries = Object.entries(values).filter((entry): entry is [keyof PersonalPayrollSettings, string] => {
    const [key, value] = entry;
    return userSettingKeySet.has(key) && typeof value === "string";
  });

  if (entries.length === 0) {
    return;
  }

  await prisma.$transaction(
    entries.map(([key, value]) =>
      prisma.userSetting.upsert({
        where: {
          userId_key: {
            userId,
            key,
          },
        },
        update: {
          value,
          valueType:
            key === "use_manual_contributions" || key === "use_manual_holiday_bonuses"
              ? SettingValueType.BOOLEAN
              : SettingValueType.NUMBER,
        },
        create: {
          userId,
          key,
          value,
          valueType:
            key === "use_manual_contributions" || key === "use_manual_holiday_bonuses"
              ? SettingValueType.BOOLEAN
              : SettingValueType.NUMBER,
        },
      }),
    ),
  );
}
