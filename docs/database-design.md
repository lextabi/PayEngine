# Database Design

This document describes the core data model for the personal payroll calculator.

## Design Principles

- Configuration-first: government formulas and holiday multipliers are stored as records, not hardcoded.
- Personal scope: each user stores calculator preferences in user-scoped settings.
- Minimal model: only active workflow tables are retained.

## Model Overview

- `government_rules`: top-level rule containers for BIR, SSS, PhilHealth, and Pag-IBIG.
- `government_tables`: bracket or tier rows tied to a government rule.
- `holiday_rules`: configurable holiday multiplier containers.
- `user_settings`: user-scoped calculator settings and contribution override values.

## Seed Data

The seed script intentionally avoids hardcoding live government brackets and rates.

It creates:

- government rule containers
- holiday rule containers

Numeric rates and contribution brackets remain editable records in the database.

## Operational Notes

- Use `npm run db:push` to sync schema with Supabase.
- Use `npm run db:seed` to load baseline configuration containers.
- Use `npm run prisma:generate` after schema changes.
