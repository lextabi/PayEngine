# Personal Settings

This module provides user-scoped calculator settings used by payroll preview computation.

## Delivered

- Default monthly salary setup
- Working day and working hour assumptions
- Pay periods per month setting
- Government rule year selection for policy-year assumptions
- Overtime, night differential, and rest day percentage inputs
- Optional manual holiday bonus override with per-holiday bonus percentages
- Manual contribution override toggle for SSS, PhilHealth, and Pag-IBIG
- Automatic tax behavior (always from INCOME_TAX table)

## Data Scope

The settings workflow currently handles:

- `default_monthly_salary`
- `working_days_per_month`
- `working_hours_per_day`
- `pay_periods_per_month`
- `government_rule_year`
- `overtime_multiplier`
- `night_differential_multiplier`
- `rest_day_multiplier`
- `use_manual_holiday_bonuses`
- `regular_holiday_bonus_percent`
- `special_holiday_bonus_percent`
- `company_holiday_bonus_percent`
- `use_manual_contributions`
- `manual_sss_amount`
- `manual_philhealth_amount`
- `manual_pagibig_amount`

## Notes

- Settings are stored per user in `user_settings`.
- Saving settings revalidates both settings and calculator routes.
- Tax is always computed from rule tables even when manual contribution mode is enabled.
- Multiplier percentages in UI are converted to internal multiplier values when saved.
- Holiday bonus percentages apply only when `use_manual_holiday_bonuses` is enabled.
