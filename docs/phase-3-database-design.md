# Phase 3 Database Design

This phase introduces the core payroll data model in Prisma and Supabase PostgreSQL.

## Design Principles

- Configuration-first: government formulas and holiday multipliers are stored as editable records, not hardcoded.
- Minimal normalized model: separate tables exist only where they represent durable business entities or configurable rule sets.
- Future-ready: the schema can later expand toward multi-company support without blocking current payroll workflows.

## Model Overview

- `employees`: employee profile, employment details, and base compensation.
- `payrolls`: payroll run header per employee and pay period.
- `payroll_details`: normalized line items for earnings, deductions, tax, and contributions.
- `government_rules`: top-level rule containers for BIR, SSS, PhilHealth, and Pag-IBIG.
- `government_tables`: bracket or tier rows tied to a government rule.
- `leave_credits`: employee leave balances by leave type code.
- `holiday_rules`: configurable holiday multiplier containers.
- `attendances`: daily attendance inputs used by payroll calculations.
- `allowances`: employee-specific earning adjustments.
- `deductions`: employee-specific non-government deductions.
- `company_settings`: editable company-level configuration store.
- `audit_logs`: generic audit trail table.
- `user_roles`: auth role mapping from Phase 2.

## Seed Data

The seed script intentionally avoids hardcoding live government formulas.

It creates:

- baseline company settings
- government rule containers
- holiday rule containers

Numeric rates and contribution brackets remain empty until entered through the Admin UI or SQL tooling.

## Operational Notes

- Use `npm.cmd run db:push` to sync schema in the current Supabase project.
- Use `npm.cmd run db:seed` to load baseline configuration data.
- A migration SQL file is stored in `prisma/migrations/` for source control.
