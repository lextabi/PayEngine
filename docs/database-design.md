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

The seed script currently initializes active 2026 baseline records used by the personal calculator:

- INCOME_TAX semi-monthly bracket rows (TRAIN 2023 onwards)
- SSS monthly contribution rows
- PhilHealth monthly contribution rows
- Pag-IBIG monthly contribution rows
- holiday rule containers

Seeded rules include `effectiveFrom` metadata (`2026-01-01`) to support year-aware rule scoping.

## Operational Notes

- Use `npm run db:push` to sync schema with Supabase.
- Use `npm run db:seed` to load baseline configuration containers.
- Use `npm run prisma:generate` after schema changes.
