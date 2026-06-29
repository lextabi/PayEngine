# Payroll Calculator

The payroll calculator provides personal payroll computation preview for signed-in users.

## Delivered

- Payroll preview page at `/payroll`
- Pure computation service for payroll preview
- Config reader for user settings, holiday rules, and government rule tables
- Preview output for rates, earnings, deductions, government contributions, tax, and net pay
- Warning system when rule tables or company settings are incomplete

## Important Constraints

- Government formulas are not hardcoded as fixed bracket values in code.
- Government deductions are computed only from database-configured `government_rules` and `government_tables` rows.
- If rule tables are missing or incomplete, the preview returns warnings and uses `0` for that rule output.
- Income tax is always computed from the INCOME_TAX rule table.

## Current Computation Inputs

- monthly salary
- overtime hours
- night differential hours
- holiday hours
- holiday rule selection
- rest day hours
- absences days
- tardiness minutes
- recurring allowances
- recurring loans
- recurring cash advances
- recurring other deductions
- bonuses
- incentives
- ad hoc allowances
- loans
- cash advances

## Current Settings Inputs

The preview reads user settings for:

- `working_days_per_month`
- `working_hours_per_day`
- `pay_periods_per_month`
- `overtime_multiplier`
- `night_differential_multiplier`
- `rest_day_multiplier`
- `use_manual_contributions`
- `manual_sss_amount`
- `manual_philhealth_amount`
- `manual_pagibig_amount`

## Notes

- The calculator currently previews values and does not persist payroll runs.
- Manual contribution mode applies to SSS, PhilHealth, and Pag-IBIG only.
- Tax remains automatic and rule-table driven at all times.
