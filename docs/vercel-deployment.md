# Vercel Deployment Playbook

This checklist is for deploying PayEngine to production on Vercel with Supabase.

## 1. Pre-deploy checks

1. Ensure latest code is pushed to GitHub.
2. Ensure local checks pass:
   - `npm run typecheck`
   - `npm run build`
3. Ensure database is updated:
   - `npm run db:seed`

## 2. Vercel project setup

1. Go to Vercel and import the GitHub repository.
2. Keep framework as Next.js.
3. Set build command to `npm run build`.
4. Set install command to `npm install`.

## 3. Production environment variables

Add these in Vercel Project Settings > Environment Variables:

- `NODE_ENV=production`
- `NEXT_PUBLIC_APP_NAME=PayEngine`
- `NEXT_PUBLIC_APP_URL=https://<your-production-domain>`
- `NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>`
- `SUPABASE_SERVICE_ROLE_KEY=<supabase-service-role-key>`
- `DATABASE_URL=<supabase-postgres-url>`
- `DIRECT_URL=<direct-or-same-as-database-url>`

## 4. Supabase auth URL configuration

In Supabase Dashboard > Authentication > URL Configuration:

1. Site URL:
   - `https://<your-production-domain>`
2. Redirect URLs:
   - `https://<your-production-domain>/login`
   - `https://<your-production-domain>/signup`
   - `https://<your-production-domain>/verify-email`
   - `https://<your-production-domain>/dashboard`
   - `https://<your-production-domain>/auth/confirm`

## 5. Deploy and verify

After first deploy, verify:

1. Signup works and redirects to verify-email page.
2. Email verification link returns user to login.
3. Login redirects to dashboard.
4. Protected routes redirect unauthenticated users to login.
5. Payroll calculation works with:
   - manual contributions OFF (table-driven SSS/PhilHealth/Pag-IBIG)
   - manual contributions ON
   - manual holiday bonus OFF/ON
6. Dashboard shows source links and updated-as-of message.
7. PDF/Excel export works.

## 7. Auth email delivery notes

1. If password reset or signup emails do not arrive, check whether Supabase is using its default email service.
2. The default Supabase email service has low throughput and is best-effort only; configure custom SMTP for production reliability.
3. Password reset links must use an allowed redirect URL such as `/auth/confirm` before landing on `/reset-password`.

## 8. Launch safety checks

1. Confirm no sensitive values are committed in repository.
2. Confirm service role key exists only in server-side env vars.
3. Confirm production domain is HTTPS.
4. Confirm app and Supabase project use matching region expectations.

## 9. Rollback plan

1. Keep previous successful Vercel deployment ready for instant rollback.
2. If auth issues occur, first check `NEXT_PUBLIC_APP_URL` and Supabase redirect URLs.
3. If database issues occur, verify `DATABASE_URL` and `DIRECT_URL`.
