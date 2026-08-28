# BOSS deployment baseline

This build preserves the tested BOSS v14 UI/UX baseline (BOSS logo/favicon, mobile navigation/responsiveness, customer/admin flows) and adds the Pesapal API 3.0 integration without rolling those features back.

## Preserved
- BOSS crown/B icon and browser favicon
- Mobile-responsive navigation and layouts
- Customer/admin authentication and separation
- Build with BOSS request flow and dedicated build_requests table
- Admin request visibility and update controls

## Added
- Pesapal sandbox payment endpoints
- Local Vite API adapter for `/api/*`
- Pesapal payment status verification
- Pesapal IPN handler and admin-only IPN registration
- Pesapal payment schema migration

## Before deployment
- Keep secrets in Vercel environment variables, never in GitHub.
- Run `supabase/pesapal-payment.sql` once after the existing BOSS schema/build-request migrations.
- Set the public HTTPS callback/IPN URLs after the Vercel domain is known.
