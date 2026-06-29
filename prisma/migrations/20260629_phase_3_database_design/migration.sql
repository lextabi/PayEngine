-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACTUAL', 'PROBATIONARY', 'PROJECT_BASED');

-- CreateEnum
CREATE TYPE "EmployeeStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'RESIGNED', 'TERMINATED', 'ON_LEAVE');

-- CreateEnum
CREATE TYPE "PayrollStatus" AS ENUM ('DRAFT', 'PENDING', 'FINALIZED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PayrollDetailType" AS ENUM ('EARNING', 'DEDUCTION', 'CONTRIBUTION', 'TAX', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "AllowanceFrequency" AS ENUM ('ONE_TIME', 'MONTHLY', 'PAYROLL_PERIOD');

-- CreateEnum
CREATE TYPE "DeductionFrequency" AS ENUM ('ONE_TIME', 'MONTHLY', 'PAYROLL_PERIOD');

-- CreateEnum
CREATE TYPE "DeductionType" AS ENUM ('LOAN', 'CASH_ADVANCE', 'MANUAL', 'OTHER');

-- CreateEnum
CREATE TYPE "GovernmentAgency" AS ENUM ('BIR', 'SSS', 'PHILHEALTH', 'PAG_IBIG', 'DOLE', 'COMPANY');

-- CreateEnum
CREATE TYPE "RuleStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "HolidayType" AS ENUM ('REGULAR', 'SPECIAL', 'COMPANY');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'REST_DAY', 'HOLIDAY', 'ON_LEAVE');

-- CreateEnum
CREATE TYPE "SettingValueType" AS ENUM ('STRING', 'NUMBER', 'BOOLEAN', 'JSON');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'GENERATE', 'FINALIZE');

-- DropEnum
DROP TYPE "app_role";

-- CreateTable
CREATE TABLE "employees" (
    "id" UUID NOT NULL,
    "employeeNumber" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "middleName" TEXT,
    "email" TEXT,
    "phoneNumber" TEXT,
    "employmentType" "EmploymentType" NOT NULL,
    "status" "EmployeeStatus" NOT NULL DEFAULT 'ACTIVE',
    "department" TEXT,
    "position" TEXT,
    "hireDate" TIMESTAMP(3) NOT NULL,
    "separationDate" TIMESTAMP(3),
    "monthlySalary" DECIMAL(12,2) NOT NULL,
    "taxId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payrolls" (
    "id" UUID NOT NULL,
    "payrollNumber" TEXT NOT NULL,
    "employeeId" UUID NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "payDate" TIMESTAMP(3) NOT NULL,
    "status" "PayrollStatus" NOT NULL DEFAULT 'DRAFT',
    "grossPay" DECIMAL(12,2) NOT NULL,
    "netPay" DECIMAL(12,2) NOT NULL,
    "totalEarnings" DECIMAL(12,2) NOT NULL,
    "totalDeductions" DECIMAL(12,2) NOT NULL,
    "totalContributions" DECIMAL(12,2) NOT NULL,
    "totalTax" DECIMAL(12,2) NOT NULL,
    "remarks" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payrolls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_details" (
    "id" UUID NOT NULL,
    "payrollId" UUID NOT NULL,
    "type" "PayrollDetailType" NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "quantity" DECIMAL(12,2),
    "rate" DECIMAL(12,4),
    "amount" DECIMAL(12,2) NOT NULL,
    "taxable" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "government_rules" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "agency" "GovernmentAgency" NOT NULL,
    "description" TEXT,
    "status" "RuleStatus" NOT NULL DEFAULT 'DRAFT',
    "effectiveFrom" TIMESTAMP(3),
    "effectiveTo" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "government_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "government_tables" (
    "id" UUID NOT NULL,
    "governmentRuleId" UUID NOT NULL,
    "sequence" INTEGER NOT NULL,
    "rangeStart" DECIMAL(12,2),
    "rangeEnd" DECIMAL(12,2),
    "baseAmount" DECIMAL(12,2),
    "employeeRate" DECIMAL(8,4),
    "employerRate" DECIMAL(8,4),
    "multiplier" DECIMAL(8,4),
    "formulaKey" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "government_tables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_credits" (
    "id" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "leaveTypeCode" TEXT NOT NULL,
    "leaveTypeName" TEXT NOT NULL,
    "balance" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "used" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "effectiveFrom" TIMESTAMP(3),
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leave_credits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "holiday_rules" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "HolidayType" NOT NULL,
    "description" TEXT,
    "effectiveFrom" TIMESTAMP(3),
    "effectiveTo" TIMESTAMP(3),
    "rateMultiplier" DECIMAL(8,4),
    "overtimeMultiplier" DECIMAL(8,4),
    "nightDifferentialMultiplier" DECIMAL(8,4),
    "restDayMultiplier" DECIMAL(8,4),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "holiday_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendances" (
    "id" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "attendanceDate" TIMESTAMP(3) NOT NULL,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "scheduledIn" TIMESTAMP(3),
    "scheduledOut" TIMESTAMP(3),
    "actualIn" TIMESTAMP(3),
    "actualOut" TIMESTAMP(3),
    "regularHours" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "overtimeHours" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "nightDiffHours" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "tardinessMinutes" INTEGER NOT NULL DEFAULT 0,
    "undertimeMinutes" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "allowances" (
    "id" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "frequency" "AllowanceFrequency" NOT NULL,
    "taxable" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "effectiveFrom" TIMESTAMP(3),
    "effectiveTo" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "allowances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deductions" (
    "id" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "DeductionType" NOT NULL DEFAULT 'OTHER',
    "amount" DECIMAL(12,2) NOT NULL,
    "frequency" "DeductionFrequency" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "effectiveFrom" TIMESTAMP(3),
    "effectiveTo" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deductions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_settings" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "value" TEXT,
    "valueType" "SettingValueType" NOT NULL DEFAULT 'STRING',
    "isEditable" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "actorUserId" UUID,
    "actorEmail" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "changes" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "employees_employeeNumber_key" ON "employees"("employeeNumber");

-- CreateIndex
CREATE UNIQUE INDEX "employees_email_key" ON "employees"("email");

-- CreateIndex
CREATE INDEX "employees_lastName_firstName_idx" ON "employees"("lastName", "firstName");

-- CreateIndex
CREATE INDEX "employees_status_idx" ON "employees"("status");

-- CreateIndex
CREATE UNIQUE INDEX "payrolls_payrollNumber_key" ON "payrolls"("payrollNumber");

-- CreateIndex
CREATE INDEX "payrolls_employeeId_periodStart_periodEnd_idx" ON "payrolls"("employeeId", "periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "payrolls_status_idx" ON "payrolls"("status");

-- CreateIndex
CREATE INDEX "payroll_details_payrollId_type_idx" ON "payroll_details"("payrollId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "government_rules_code_key" ON "government_rules"("code");

-- CreateIndex
CREATE INDEX "government_rules_agency_status_idx" ON "government_rules"("agency", "status");

-- CreateIndex
CREATE INDEX "government_tables_governmentRuleId_idx" ON "government_tables"("governmentRuleId");

-- CreateIndex
CREATE UNIQUE INDEX "government_tables_governmentRuleId_sequence_key" ON "government_tables"("governmentRuleId", "sequence");

-- CreateIndex
CREATE UNIQUE INDEX "leave_credits_employeeId_leaveTypeCode_key" ON "leave_credits"("employeeId", "leaveTypeCode");

-- CreateIndex
CREATE UNIQUE INDEX "holiday_rules_code_key" ON "holiday_rules"("code");

-- CreateIndex
CREATE INDEX "holiday_rules_type_isActive_idx" ON "holiday_rules"("type", "isActive");

-- CreateIndex
CREATE INDEX "attendances_attendanceDate_status_idx" ON "attendances"("attendanceDate", "status");

-- CreateIndex
CREATE UNIQUE INDEX "attendances_employeeId_attendanceDate_key" ON "attendances"("employeeId", "attendanceDate");

-- CreateIndex
CREATE INDEX "allowances_employeeId_isActive_idx" ON "allowances"("employeeId", "isActive");

-- CreateIndex
CREATE INDEX "deductions_employeeId_isActive_idx" ON "deductions"("employeeId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "company_settings_key_key" ON "company_settings"("key");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_actorUserId_idx" ON "audit_logs"("actorUserId");

-- AddForeignKey
ALTER TABLE "payrolls" ADD CONSTRAINT "payrolls_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_details" ADD CONSTRAINT "payroll_details_payrollId_fkey" FOREIGN KEY ("payrollId") REFERENCES "payrolls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "government_tables" ADD CONSTRAINT "government_tables_governmentRuleId_fkey" FOREIGN KEY ("governmentRuleId") REFERENCES "government_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_credits" ADD CONSTRAINT "leave_credits_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allowances" ADD CONSTRAINT "allowances_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deductions" ADD CONSTRAINT "deductions_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

