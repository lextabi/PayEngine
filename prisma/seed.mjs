import { PrismaClient, GovernmentAgency, HolidayType, RuleStatus, SettingValueType } from "@prisma/client";

const prisma = new PrismaClient();

const companySettings = [
  {
    key: "company_name",
    name: "Company Name",
    description: "Display name used in payroll outputs and payslips.",
    value: "PayEngine Demo Company",
    valueType: SettingValueType.STRING,
  },
  {
    key: "country_code",
    name: "Country Code",
    description: "Primary country where payroll rules apply.",
    value: "PH",
    valueType: SettingValueType.STRING,
  },
  {
    key: "currency_code",
    name: "Currency Code",
    description: "Default currency for payroll calculations.",
    value: "PHP",
    valueType: SettingValueType.STRING,
  },
  {
    key: "timezone",
    name: "Timezone",
    description: "Default timezone for attendance and payroll cutoffs.",
    value: "Asia/Manila",
    valueType: SettingValueType.STRING,
  },
  {
    key: "default_pay_schedule",
    name: "Default Pay Schedule",
    description: "Default payroll cycle used for new payroll batches.",
    value: "SEMI_MONTHLY",
    valueType: SettingValueType.STRING,
  },
];

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
  for (const setting of companySettings) {
    await prisma.companySetting.upsert({
      where: { key: setting.key },
      update: {
        name: setting.name,
        description: setting.description,
        value: setting.value,
        valueType: setting.valueType,
      },
      create: setting,
    });
  }

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
