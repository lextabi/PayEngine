# Project Scope: Personal Payroll Calculator

## Product scope

1. The app is a personal payroll calculator for individual users.
2. Users create their own accounts and verify email before sign in.
3. Users can control their own SSS, PhilHealth, and Pag-IBIG behavior through account-level settings while tax remains automatically computed from rule tables.
4. Users can choose a government rule year so computations align with the selected policy-year assumptions.

## Architecture implications

- Authentication is Supabase Auth based.
- Payroll calculations are rule-table driven.
- Calculator settings are user-scoped via `user_settings`.
- Dashboard and navigation prioritize personal workflows.

## Core capabilities

- Signup, verify email, login, and logout flows
- Protected personal workspace routes
- Personal settings for salary assumptions and percentage-based multipliers
- Optional manual holiday bonus override with per-holiday bonus percentages
- Manual contribution override mode for SSS, PhilHealth, and Pag-IBIG
- Automatic tax calculation from INCOME_TAX rule table
- Payroll preview computation with year-aware government rule scoping
- Dashboard trust panel with official source links and last-updated messaging

## Non-goals

- No employee record management workflow
- No admin role management workflow
- No organization-level payroll operations workflow
