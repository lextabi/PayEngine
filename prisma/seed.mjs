import { PrismaClient, GovernmentAgency, HolidayType, RuleStatus } from "@prisma/client";

const prisma = new PrismaClient();

const governmentRules = [
  {
    code: "INCOME_TAX",
    name: "Income Tax",
    agency: GovernmentAgency.BIR,
    description: "Configurable income tax rule container. Table rows are managed separately.",
    effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
  },
  {
    code: "SSS",
    name: "Social Security System",
    agency: GovernmentAgency.SSS,
    description: "Configurable SSS contribution rule container.",
    effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
  },
  {
    code: "PHILHEALTH",
    name: "PhilHealth",
    agency: GovernmentAgency.PHILHEALTH,
    description: "Configurable PhilHealth contribution rule container.",
    effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
  },
  {
    code: "PAG_IBIG",
    name: "Pag-IBIG",
    agency: GovernmentAgency.PAG_IBIG,
    description: "Configurable Pag-IBIG contribution rule container.",
    effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
  },
];

const holidayRules = [
  {
    code: "REGULAR_HOLIDAY",
    name: "Regular Holiday",
    type: HolidayType.REGULAR,
    description: "Base container for regular holiday multipliers.",
    effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
  },
  {
    code: "SPECIAL_HOLIDAY",
    name: "Special Non-Working Holiday",
    type: HolidayType.SPECIAL,
    description: "Base container for special holiday multipliers.",
    effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
  },
  {
    code: "COMPANY_HOLIDAY",
    name: "Company Holiday",
    type: HolidayType.COMPANY,
    description: "Company-defined holiday rule container.",
    effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
  },
];

// 2026 PH withholding tax brackets (TRAIN 2023 onwards), semi-monthly basis.
const incomeTaxSemiMonthlyRows = [
  {
    sequence: 1,
    rangeStart: "0.00",
    rangeEnd: "10416.67",
    baseAmount: "0.00",
    employeeRate: "0.0000",
    formulaKey: "FIXED_AMOUNT",
  },
  {
    sequence: 2,
    rangeStart: "10416.67",
    rangeEnd: "16666.67",
    baseAmount: "0.00",
    employeeRate: "0.1500",
    formulaKey: "BASE_PLUS_PERCENT_OF_EXCESS",
  },
  {
    sequence: 3,
    rangeStart: "16666.67",
    rangeEnd: "33333.33",
    baseAmount: "937.50",
    employeeRate: "0.2000",
    formulaKey: "BASE_PLUS_PERCENT_OF_EXCESS",
  },
  {
    sequence: 4,
    rangeStart: "33333.33",
    rangeEnd: "83333.33",
    baseAmount: "4270.83",
    employeeRate: "0.2500",
    formulaKey: "BASE_PLUS_PERCENT_OF_EXCESS",
  },
  {
    sequence: 5,
    rangeStart: "83333.33",
    rangeEnd: "333333.33",
    baseAmount: "16770.83",
    employeeRate: "0.3000",
    formulaKey: "BASE_PLUS_PERCENT_OF_EXCESS",
  },
  {
    sequence: 6,
    rangeStart: "333333.33",
    rangeEnd: null,
    baseAmount: "91770.83",
    employeeRate: "0.3500",
    formulaKey: "BASE_PLUS_PERCENT_OF_EXCESS",
  },
];

// 2026 SSS employee share approximation (monthly basis):
// employee share is 5% of monthly salary credit with floor 5,000 and ceiling 35,000.
const sssMonthlyRows = [
  {
    sequence: 1,
    rangeStart: "0.00",
    rangeEnd: "5000.00",
    baseAmount: "250.00",
    employeeRate: "0.0000",
    formulaKey: "FIXED_AMOUNT",
  },
  {
    sequence: 2,
    rangeStart: "5000.00",
    rangeEnd: "35000.00",
    baseAmount: "0.00",
    employeeRate: "0.0500",
    formulaKey: "PERCENT_OF_BASIS",
  },
  {
    sequence: 3,
    rangeStart: "35000.00",
    rangeEnd: null,
    baseAmount: "1750.00",
    employeeRate: "0.0000",
    formulaKey: "FIXED_AMOUNT",
  },
];

// 2026 PhilHealth employee share (monthly basis): 2.5% with floor 10,000 and ceiling 100,000.
const philHealthMonthlyRows = [
  {
    sequence: 1,
    rangeStart: "0.00",
    rangeEnd: "10000.00",
    baseAmount: "250.00",
    employeeRate: "0.0000",
    formulaKey: "FIXED_AMOUNT",
  },
  {
    sequence: 2,
    rangeStart: "10000.00",
    rangeEnd: "100000.00",
    baseAmount: "0.00",
    employeeRate: "0.0250",
    formulaKey: "PERCENT_OF_BASIS",
  },
  {
    sequence: 3,
    rangeStart: "100000.00",
    rangeEnd: null,
    baseAmount: "2500.00",
    employeeRate: "0.0000",
    formulaKey: "FIXED_AMOUNT",
  },
];

// 2026 Pag-IBIG employee share (monthly basis): 1% up to 1,500, 2% thereafter, capped at 100.
const pagIbigMonthlyRows = [
  {
    sequence: 1,
    rangeStart: "0.00",
    rangeEnd: "1500.00",
    baseAmount: "0.00",
    employeeRate: "0.0100",
    formulaKey: "PERCENT_OF_BASIS",
  },
  {
    sequence: 2,
    rangeStart: "1500.00",
    rangeEnd: "5000.00",
    baseAmount: "15.00",
    employeeRate: "0.0200",
    formulaKey: "BASE_PLUS_PERCENT_OF_EXCESS",
  },
  {
    sequence: 3,
    rangeStart: "5000.00",
    rangeEnd: null,
    baseAmount: "100.00",
    employeeRate: "0.0000",
    formulaKey: "FIXED_AMOUNT",
  },
];

async function syncGovernmentTableRows(ruleId, rows) {
  for (const row of rows) {
    await prisma.governmentTable.upsert({
      where: {
        governmentRuleId_sequence: {
          governmentRuleId: ruleId,
          sequence: row.sequence,
        },
      },
      update: {
        rangeStart: row.rangeStart,
        rangeEnd: row.rangeEnd,
        baseAmount: row.baseAmount,
        employeeRate: row.employeeRate,
        formulaKey: row.formulaKey,
      },
      create: {
        governmentRuleId: ruleId,
        sequence: row.sequence,
        rangeStart: row.rangeStart,
        rangeEnd: row.rangeEnd,
        baseAmount: row.baseAmount,
        employeeRate: row.employeeRate,
        formulaKey: row.formulaKey,
      },
    });
  }

  await prisma.governmentTable.deleteMany({
    where: {
      governmentRuleId: ruleId,
      sequence: {
        notIn: rows.map((row) => row.sequence),
      },
    },
  });
}

async function main() {
  const ruleIds = {};

  for (const rule of governmentRules) {
    const upsertedRule = await prisma.governmentRule.upsert({
      where: { code: rule.code },
      update: {
        name: rule.name,
        agency: rule.agency,
        description: rule.description,
        effectiveFrom: rule.effectiveFrom,
        effectiveTo: null,
        status: RuleStatus.ACTIVE,
      },
      create: {
        ...rule,
        effectiveTo: null,
        status: RuleStatus.ACTIVE,
      },
    });

    ruleIds[rule.code] = upsertedRule.id;
  }

  await syncGovernmentTableRows(ruleIds.INCOME_TAX, incomeTaxSemiMonthlyRows);
  await syncGovernmentTableRows(ruleIds.SSS, sssMonthlyRows);
  await syncGovernmentTableRows(ruleIds.PHILHEALTH, philHealthMonthlyRows);
  await syncGovernmentTableRows(ruleIds.PAG_IBIG, pagIbigMonthlyRows);

  for (const holidayRule of holidayRules) {
    await prisma.holidayRule.upsert({
      where: { code: holidayRule.code },
      update: holidayRule,
      create: holidayRule,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
