import { prisma } from "@/lib/db/prisma";
import { getUserPayrollSettings } from "@/features/settings/services/user-settings.service";

function roundToCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

function computeRuleAmountFromTables(
  basis: number,
  rows: Array<{
    sequence: number;
    rangeStart: unknown;
    rangeEnd: unknown;
    baseAmount: unknown;
    employeeRate: unknown;
    formulaKey: string | null;
  }>,
) {
  const row = rows.find((candidate) => {
    const start = Number(candidate.rangeStart ?? 0);
    const end = candidate.rangeEnd == null ? null : Number(candidate.rangeEnd);
    return basis >= start && (end == null || basis <= end);
  });

  if (!row || !row.formulaKey) {
    return null;
  }

  const baseAmount = Number(row.baseAmount ?? 0);
  const rate = Number(row.employeeRate ?? 0);
  const rangeStart = Number(row.rangeStart ?? 0);

  let amount = 0;
  if (row.formulaKey === "FIXED_AMOUNT") {
    amount = baseAmount;
  } else if (row.formulaKey === "PERCENT_OF_BASIS") {
    amount = basis * rate;
  } else if (row.formulaKey === "BASE_PLUS_PERCENT_OF_BASIS") {
    amount = baseAmount + basis * rate;
  } else if (row.formulaKey === "BASE_PLUS_PERCENT_OF_EXCESS") {
    amount = baseAmount + Math.max(basis - rangeStart, 0) * rate;
  } else {
    return null;
  }

  return {
    sequence: row.sequence,
    formulaKey: row.formulaKey,
    rate,
    amount: roundToCurrency(amount),
  };
}

export async function getDashboardOverview(userId: string) {
  const [userSettingCount, incomeTaxRule, contributionRules] = await prisma.$transaction([
    prisma.userSetting.count({ where: { userId } }),
    prisma.governmentRule.findUnique({
      where: { code: "INCOME_TAX" },
      include: {
        tables: {
          orderBy: { sequence: "asc" },
        },
      },
    }),
    prisma.governmentRule.findMany({
      where: {
        code: {
          in: ["SSS", "PHILHEALTH", "PAG_IBIG"],
        },
      },
      include: {
        tables: {
          orderBy: { sequence: "asc" },
        },
      },
    }),
  ]);

  const userSettings = await getUserPayrollSettings(userId);
  const selectedRuleYear = Number(userSettings.government_rule_year || 2026);
  const normalizedRuleYear = Number.isFinite(selectedRuleYear)
    ? Math.max(2000, Math.min(2100, Math.round(selectedRuleYear)))
    : 2026;
  const defaultMonthlySalary = Number(userSettings.default_monthly_salary || 0);
  const sampleSemiMonthlyBasis = defaultMonthlySalary / 2;
  const sampleRow = incomeTaxRule?.tables.find((row) => {
    const start = Number(row.rangeStart ?? 0);
    const end = row.rangeEnd == null ? null : Number(row.rangeEnd);
    return sampleSemiMonthlyBasis >= start && (end == null || sampleSemiMonthlyBasis <= end);
  });

  const sampleTax = sampleRow
    ? Number(sampleRow.baseAmount ?? 0) +
      Math.max(sampleSemiMonthlyBasis - Number(sampleRow.rangeStart ?? 0), 0) *
        Number(sampleRow.employeeRate ?? 0)
    : 0;

  const contributionRuleMap = Object.fromEntries(
    contributionRules.map((rule) => [rule.code, rule]),
  );

  const sampleContributionBreakdown = [
    {
      code: "SSS",
      label: "SSS",
    },
    {
      code: "PHILHEALTH",
      label: "PhilHealth",
    },
    {
      code: "PAG_IBIG",
      label: "Pag-IBIG",
    },
  ].map(({ code, label }) => {
    const rule = contributionRuleMap[code] ?? null;
    const computed = rule
      ? computeRuleAmountFromTables(defaultMonthlySalary, rule.tables)
      : null;

    return {
      code,
      label,
      status: rule?.status ?? null,
      appliedSequence: computed?.sequence ?? null,
      formulaKey: computed?.formulaKey ?? null,
      appliedRate: computed?.rate ?? null,
      monthlyAmount: computed?.amount ?? null,
      semiMonthlyAmount: computed ? roundToCurrency(computed.amount / 2) : null,
      hasConfiguredRows: Boolean(rule && rule.tables.length > 0),
    };
  });

  const totalMonthlyContributions = roundToCurrency(
    sampleContributionBreakdown.reduce((sum, row) => sum + (row.monthlyAmount ?? 0), 0),
  );

  const computationRules = [
    incomeTaxRule,
    contributionRuleMap.SSS,
    contributionRuleMap.PHILHEALTH,
    contributionRuleMap.PAG_IBIG,
  ].filter(Boolean);

  const lastRuleUpdate = computationRules.reduce<Date | null>((latest, rule) => {
    if (!rule) {
      return latest;
    }

    const ruleUpdatedAt = rule.updatedAt;
    const latestTableUpdate = rule.tables.reduce<Date>(
      (acc, table) => (table.updatedAt > acc ? table.updatedAt : acc),
      ruleUpdatedAt,
    );

    if (!latest || latestTableUpdate > latest) {
      return latestTableUpdate;
    }

    return latest;
  }, null);

  const references = [
    {
      key: "tax",
      label: "BIR Withholding Tax (TRAIN)",
      url: "https://www.bir.gov.ph/index.php/tax-information/withholding-tax.html",
      coverage: "Income tax bracket and formula basis",
    },
    {
      key: "sss",
      label: "SSS Contribution Table",
      url: "https://www.sss.gov.ph/sss-contribution-table/",
      coverage: "SSS employee contribution basis",
    },
    {
      key: "philhealth",
      label: "PhilHealth Advisories",
      url: "https://www.philhealth.gov.ph/advisories/",
      coverage: "PhilHealth premium contribution guidance",
    },
    {
      key: "pagibig",
      label: "Pag-IBIG Fund Circulars and Advisories",
      url: "https://www.pagibigfund.gov.ph/circulars.html",
      coverage: "Pag-IBIG employee contribution guidance",
    },
  ] as const;

  return {
    stats: {
      userSettingCount,
      defaultMonthlySalary,
      manualContributionsEnabled: userSettings.use_manual_contributions === "true",
    },
    taxGuide: {
      status: incomeTaxRule?.status ?? null,
      rows:
        incomeTaxRule?.tables.map((row) => ({
          sequence: row.sequence,
          rangeStart: Number(row.rangeStart ?? 0),
          rangeEnd: row.rangeEnd == null ? null : Number(row.rangeEnd),
          baseAmount: Number(row.baseAmount ?? 0),
          employeeRate: Number(row.employeeRate ?? 0),
          formulaKey: row.formulaKey ?? "",
        })) ?? [],
      sample: sampleRow
        ? {
            semiMonthlyBasis: sampleSemiMonthlyBasis,
            appliedSequence: sampleRow.sequence,
            appliedRate: Number(sampleRow.employeeRate ?? 0),
            baseAmount: Number(sampleRow.baseAmount ?? 0),
            computedTax: sampleTax,
          }
        : null,
    },
    contributionGuide: {
      basis: {
        monthlySalary: defaultMonthlySalary,
        semiMonthlySalary: roundToCurrency(defaultMonthlySalary / 2),
      },
      rows: sampleContributionBreakdown,
      totalMonthlyContributions,
      totalSemiMonthlyContributions: roundToCurrency(totalMonthlyContributions / 2),
    },
    sourceGuide: {
      references,
      assumptionsYear: normalizedRuleYear,
      updatedAt: lastRuleUpdate ? lastRuleUpdate.toISOString() : null,
      summary:
        "PhilHealth, SSS, Pag-IBIG, and tax computations are based on active configured rule tables aligned with official agency references.",
    },
  };
}
