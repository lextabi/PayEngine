import { PrismaClient, GovernmentAgency, HolidayType, RuleStatus } from "@prisma/client";

const prisma = new PrismaClient();

const governmentRules = [
  {
    code: "INCOME_TAX",
    name: "Income Tax",
    agency: GovernmentAgency.BIR,
    description: "Configurable income tax rule container. Table rows are managed separately.",
  },
  {
    code: "SSS",
    name: "Social Security System",
    agency: GovernmentAgency.SSS,
    description: "Configurable SSS contribution rule container.",
  },
  {
    code: "PHILHEALTH",
    name: "PhilHealth",
    agency: GovernmentAgency.PHILHEALTH,
    description: "Configurable PhilHealth contribution rule container.",
  },
  {
    code: "PAG_IBIG",
    name: "Pag-IBIG",
    agency: GovernmentAgency.PAG_IBIG,
    description: "Configurable Pag-IBIG contribution rule container.",
  },
];

const holidayRules = [
  {
    code: "REGULAR_HOLIDAY",
    name: "Regular Holiday",
    type: HolidayType.REGULAR,
    description: "Base container for regular holiday multipliers.",
  },
  {
    code: "SPECIAL_HOLIDAY",
    name: "Special Non-Working Holiday",
    type: HolidayType.SPECIAL,
    description: "Base container for special holiday multipliers.",
  },
  {
    code: "COMPANY_HOLIDAY",
    name: "Company Holiday",
    type: HolidayType.COMPANY,
    description: "Company-defined holiday rule container.",
  },
];

async function main() {
  for (const rule of governmentRules) {
    await prisma.governmentRule.upsert({
      where: { code: rule.code },
      update: {
        name: rule.name,
        agency: rule.agency,
        description: rule.description,
        status: RuleStatus.DRAFT,
      },
      create: {
        ...rule,
        status: RuleStatus.DRAFT,
      },
    });
  }

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
