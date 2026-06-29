# PayEngine

PayEngine is a configurable payroll engine designed to replace spreadsheet-based payroll workflows with a production-quality web platform.

This repository currently contains **Phase 3: Database Design**.

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
		ui/                   # shadcn/ui components
	config/                 # environment and runtime configuration
	features/               # feature modules (auth, employees, payroll)
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

## Run Locally

```bash
npm install
npm run prisma:generate
npm run dev
```

Open `http://localhost:3000`.

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

## Supabase Connectivity Check

After setting `.env`, validate DB connectivity with:

```bash
npm run prisma:generate
npx prisma db pull
```

If credentials are correct, Prisma introspection should complete successfully.

## Current Status

- [x] Next.js app initialized with App Router
- [x] Tailwind configured
- [x] shadcn/ui configured
- [x] Prisma configured for PostgreSQL
- [x] Supabase client scaffolding added
- [x] Feature-based folder structure added
- [x] ESLint + Prettier configured
- [x] Login and logout flow implemented
- [x] Protected routes with middleware implemented
- [x] Session-based redirects implemented
- [x] Future-ready role scaffolding added
- [x] Core payroll database schema modeled
- [x] Seed script for baseline configuration added
- [x] Database design documentation added

## Authentication Setup (Phase 2)

### 1) Supabase Auth Configuration

In Supabase Dashboard:

1. Go to **Authentication > URL Configuration**.
2. Set **Site URL** to your app URL:
	- Local: `http://localhost:3000`
3. Add **Redirect URLs**:
	- `http://localhost:3000/login`
	- `http://localhost:3000/dashboard`

### 2) API Keys and Environment

From **Project Settings > API**, copy:

- Project URL -> `NEXT_PUBLIC_SUPABASE_URL`
- `anon` public key -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` secret key -> `SUPABASE_SERVICE_ROLE_KEY`

From **Project Settings > Database**, copy connection strings for:

- `DATABASE_URL`
- `DIRECT_URL`

Set `AUTH_ADMIN_EMAILS` to one or more comma-separated emails that should default to ADMIN role on first login.

### 3) Database Role Table Setup

Run [supabase/phase-2-auth.sql](supabase/phase-2-auth.sql) in Supabase SQL Editor.

This creates:

- `public.app_role` enum
- `public.user_roles` table
- trigger for `updated_at`
- RLS policies for authenticated users and service role

### 4) Prisma Sync

After SQL is applied and env vars are set:

```bash
npm run prisma:generate
```

## Database Design (Phase 3)

The Phase 3 schema adds the following core models:

- `employees`
- `payrolls`
- `payroll_details`
- `government_rules`
- `government_tables`
- `leave_credits`
- `holiday_rules`
- `attendances`
- `allowances`
- `deductions`
- `company_settings`
- `audit_logs`

Supporting documentation is available in [docs/phase-3-database-design.md](docs/phase-3-database-design.md).

### Seed Strategy

The seed script creates baseline editable configuration records only:

- company settings
- government rule containers
- holiday rule containers

It intentionally does **not** hardcode real government brackets, rates, or formulas.

### Commands

```bash
npm run prisma:generate
npm run db:push
npm run db:seed
```

## Next Phase

Phase 4 will implement the dashboard, navigation, layout, and visual system.
