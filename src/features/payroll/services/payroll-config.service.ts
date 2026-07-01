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

const defaultHolidayRateMultipliers = {
  REGULAR: 2,
  SPECIAL: 1.3,
  COMPANY: 1,
} as const;

function isRuleApplicableForYear(
  rule: {
    effectiveFrom: Date | null;
    effectiveTo: Date | null;
  },
  year: number,
) {
  const yearStart = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0));
  const yearEnd = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));

  const startsBeforeYearEnd = !rule.effectiveFrom || rule.effectiveFrom <= yearEnd;
  const endsAfterYearStart = !rule.effectiveTo || rule.effectiveTo >= yearStart;

  return startsBeforeYearEnd && endsAfterYearStart;
}

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

  const selectedRuleYear = Number(userSettings.government_rule_year || 2026);
  const normalizedRuleYear = Number.isFinite(selectedRuleYear)
    ? Math.max(2000, Math.min(2100, Math.round(selectedRuleYear)))
    : 2026;

  const governmentRulesForYear = governmentRules.filter((rule) =>
    isRuleApplicableForYear(rule, normalizedRuleYear),
  );

  const scopedGovernmentRules =
    governmentRulesForYear.length > 0 ? governmentRulesForYear : governmentRules;

  if (governmentRulesForYear.length === 0) {
    warnings.push(
      `No government rules were scoped for year ${normalizedRuleYear}. Using latest available active rules instead.`,
    );
  }

  const getHolidayRateMultiplier = (type: keyof typeof defaultHolidayRateMultipliers) => {
    const defaultValue = defaultHolidayRateMultipliers[type];
    const matchedRule = holidayRules.find((rule) => rule.type === type);

    if (!matchedRule || matchedRule.rateMultiplier == null) {
      return defaultValue;
    }

    const parsed = Number(matchedRule.rateMultiplier);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : defaultValue;
  };

  const useManualHolidayBonuses = userSettings.use_manual_holiday_bonuses === "true";

  return {
    settings: config,
    holidayRules,
    holidayMultipliers: {
      regular: getHolidayRateMultiplier("REGULAR"),
      special: getHolidayRateMultiplier("SPECIAL"),
      company: getHolidayRateMultiplier("COMPANY"),
    },
    governmentRules: scopedGovernmentRules,
    selectedRuleYear: normalizedRuleYear,
    holidayBonuses: {
      enabled: useManualHolidayBonuses,
      regular: useManualHolidayBonuses
        ? Number(userSettings.regular_holiday_bonus_percent || 0)
        : 0,
      special: useManualHolidayBonuses
        ? Number(userSettings.special_holiday_bonus_percent || 0)
        : 0,
      company: useManualHolidayBonuses
        ? Number(userSettings.company_holiday_bonus_percent || 0)
        : 0,
    },
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
