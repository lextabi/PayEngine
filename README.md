# PayEngine

PayEngine is a personal payroll calculator web app. Each user manages their own account, settings, and payroll simulations.

## Stack

- Next.js 16 (App Router)
- React 19
- TypeScript (strict mode)
- Tailwind CSS v4
- shadcn/ui
- Prisma
- Supabase PostgreSQL
- Supabase Auth SDK
- React Hook Form
- Zod

## Project Structure

```text
src/
app/                    # App Router entrypoints and layouts
components/
ui/                   # shared UI components
config/                 # environment and runtime configuration
features/               # feature modules (auth, payroll, settings, dashboard)
lib/
db/                   # database clients/adapters
supabase/             # supabase browser/server clients
validations/          # shared validation schemas
server/
actions/              # server actions
types/                  # cross-feature shared types
prisma/
schema.prisma           # prisma schema and datasource config
```

## Prerequisites

- Node.js 20+
- npm 10+
- A Supabase project

## Environment Variables

1. Copy `.env.example` to `.env`.
2. Fill in values from your Supabase project.

Required variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `DIRECT_URL` (optional but recommended)
- `NEXT_PUBLIC_APP_URL` (recommended for auth redirect links)

## Run Locally

```bash
npm install
npm run prisma:generate
npm run dev
```

Open `http://localhost:3000`.

## Deploy to Vercel

1. Push your latest code to GitHub.
2. In Vercel, create a new project and import this repository.
3. Set build settings:
   - Framework Preset: `Next.js`
   - Build Command: `npm run build`
   - Install Command: `npm install`
4. Add required environment variables in Vercel Project Settings:
   - `NEXT_PUBLIC_APP_NAME`
   - `NEXT_PUBLIC_APP_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `DATABASE_URL`
   - `DIRECT_URL`
5. In Supabase Auth URL Configuration:
   - Set Site URL to your Vercel production URL.
   - Add redirect URLs for `/login`, `/signup`, `/verify-email`, `/dashboard`, and `/auth/confirm`.
6. Trigger deploy in Vercel.
7. Run post-deploy checks from `docs/vercel-deployment.md`.

## Scripts

- `npm run dev` - start development server
- `npm run build` - build for production
- `npm run start` - run production build
- `npm run lint` - run ESLint
- `npm run typecheck` - run TypeScript checks
- `npm run format` - format with Prettier
- `npm run format:check` - verify formatting
- `npm run prisma:generate` - generate Prisma client
- `npm run prisma:migrate` - run Prisma migrations in development
- `npm run prisma:studio` - open Prisma Studio
- `npm run db:push` - push schema to database
- `npm run db:seed` - seed baseline configuration data

## Authentication Setup

### 1) Supabase Auth Configuration

In Supabase Dashboard:

1. Go to **Authentication > URL Configuration**.
2. Set **Site URL** to your app URL:
   - Local: `http://localhost:3000`
3. Add **Redirect URLs**:
   - `http://localhost:3000/login`
   - `http://localhost:3000/signup`
   - `http://localhost:3000/verify-email`
   - `http://localhost:3000/dashboard`

### 2) API Keys and Environment

From **Project Settings > API**, copy:

- Project URL -> `NEXT_PUBLIC_SUPABASE_URL`
- `anon` public key -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` secret key -> `SUPABASE_SERVICE_ROLE_KEY`

From **Project Settings > Database**, copy connection strings for:

- `DATABASE_URL`
- `DIRECT_URL`

### 3) Database Support Tables

Run `supabase/auth-setup.sql` in Supabase SQL Editor.

This creates:

- auth support policies and supporting SQL objects used by Supabase auth setup

## Database Scope

The application uses these core tables:

- `government_rules`
- `government_tables`
- `holiday_rules`
- `user_settings`

## Current Status

- [x] Login and logout flow implemented
- [x] Self-signup and verify-email flow added
- [x] Protected routes with middleware implemented
- [x] Session-based redirects implemented
- [x] Personal payroll preview calculator added
- [x] User-scoped payroll settings added
- [x] Percentage-based settings UX for overtime/night diff/rest day
- [x] Manual holiday bonus override toggle and per-holiday bonus percentages added
- [x] Manual contribution override controls added (SSS/PhilHealth/Pag-IBIG)
- [x] Tax is always computed automatically from the INCOME_TAX rule table
- [x] 2026 seeded contribution tables for SSS/PhilHealth/Pag-IBIG added
- [x] Dashboard source links and "updated as of" trust messaging added
- [x] Government rule year selection added to settings for policy-year scoping
- [x] Dashboard and navigation updated for personal workflow

## Personal Workflow Routes

- `/signup` - self-registration form
- `/verify-email` - post-signup verification prompt
- `/login` - sign in
- `/dashboard` - personal overview
- `/payroll` - personal payroll calculator
- `/settings` - personal salary and contribution controls
- `/reports` - placeholder for personal export/history workflows

## Product Principles

- The app is self-service for individual users.
- Users create their own accounts and verify their own email.
- Government formulas are table-driven and configurable in data, not hardcoded in code.
- Tax is always automatically calculated from the configured INCOME_TAX table.
- Manual contribution override mode applies only to SSS, PhilHealth, and Pag-IBIG.
- Holiday bonus manual override is optional and defaults to automatic behavior when disabled.
- Government computation references and freshness are surfaced on the dashboard.

## Documentation

- `docs/project-scope.md` - product scope and behavior
- `docs/database-design.md` - database design and data model
- `docs/dashboard-experience.md` - dashboard experience
- `docs/personal-settings.md` - personal settings and user controls
- `docs/payroll-calculator.md` - payroll computation behavior
- `docs/vercel-deployment.md` - production deployment checklist for Vercel
