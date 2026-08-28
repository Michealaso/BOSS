# BOSS — Website + AI Chatbot Marketplace

BOSS is a zero-cost-first React + Vite marketplace for selling ready-made websites and AI chatbot packages. The project now includes production integration points for real accounts, Supabase data, Flutterwave checkout/webhooks, AI chatbot serving and automatic static website export.

## Included

- Responsive BOSS marketplace
- Website + chatbot catalogs and live demos
- Product detail and order flow
- Local fallback mode with localStorage
- Real Supabase email/password auth when configured
- Real Supabase orders/projects/messages when configured
- Role-based admin policies in the SQL schema
- Flutterwave hosted checkout endpoint + webhook verification for UGX
- Public chatbot API endpoint with an optional OpenAI-compatible provider
- Website HTML export for delivery
- Chatbot JSON/embed configuration export
- BOSS Studio editor and publishing preview
- Customer dashboard and admin dashboard

## Run locally

Node.js 18+ is recommended.

```bash
npm install
npm run dev
```

## Supabase

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Copy `.env.example` to `.env` and fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. For your first admin, create a normal account then set its profile role to `admin` in Supabase:

```sql
update profiles set role='admin' where id = 'YOUR_AUTH_USER_UUID';
```

Supabase password auth is used for real sign-in. Supabase sessions persist in the client auth storage. See the official docs for the current `signInWithPassword`, `signUp`, and session APIs.

## Real payments (Flutterwave)

The included serverless endpoint keeps the Flutterwave secret key off the browser. Set the server environment variables:

```text
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
FLW_SECRET_KEY=
FLW_SECRET_HASH=
FLW_CURRENCY=USD
FLW_REDIRECT_URL=https://your-domain.example/order
```

Then set the webhook URL in Flutterwave to:

```text
https://your-domain.example/api/flutterwave-webhook
```

The checkout endpoint creates the hosted payment link and the webhook re-verifies transaction status, reference, currency and amount before marking an order paid. This follows Flutterwave's documented server-side Standard checkout and verification flow.

## AI chatbot

The public `/api/chat` endpoint reads a published chatbot project from Supabase. To enable live AI answers, configure:

```text
AI_API_URL=
AI_API_KEY=
AI_MODEL=
```

The endpoint expects an OpenAI-compatible chat-completions style JSON response. Without these variables, the bot still works using its saved FAQ fallback.

## Deployment

The repository includes `vercel.json`. Deploy the repository to Vercel, add the browser and server environment variables, then add the Flutterwave webhook URL. The current catalog prices are denominated in USD; change both the catalog pricing and `FLW_CURRENCY` together if you want to sell in UGX.

Real deployment of arbitrary customer websites to a custom domain still requires connecting a hosting/deployment provider and its credentials. BOSS currently provides the ready-to-deliver static HTML export so you can fulfill orders without paying for infrastructure first.

## Important

Never put payment provider secret keys or Supabase service-role keys in `VITE_*` variables. `VITE_*` values are exposed to the browser. Real payment state must be changed by the server/webhook, not by browser code.

## What is wired in this release
- Real Supabase auth state is synchronized across the app.
- Flutterwave return verification is handled server-side at `/api/verify-payment`.
- Admins can update both fulfillment status and payment status through the protected server endpoint.
- The customer dashboard can remain the primary order/project workspace.

## Payment redirect
Set `FLW_REDIRECT_URL` to `https://YOUR_DOMAIN/payment/return` in production, or leave it blank and BOSS will use the current site origin automatically.

## BOSS Business Setup Wizard

The new `/start` flow guides a customer through business type, goals, channels, visual direction, budget level, and contact details. It recommends an initial website/chatbot combination and passes the collected requirements into the existing order flow.


## Final security notes
- Customer-created orders are normalized server-side/database-side to the catalog price and cannot mark themselves paid.
- Admin role changes must be performed through trusted Supabase SQL/server administration.
- Flutterwave webhooks are signature-checked, transaction-verified, and de-duplicated.
- Recurring subscription charges are matched by the active subscription/customer when Flutterwave uses a new transaction reference.


## Current production hardening
- BOSS Setup Wizard orders use server-side package pricing (`starter`, `business`, `pro`) so browser-submitted prices cannot change what is charged.
- Flutterwave webhooks accept the current `flutterwave-signature` HMAC flow and the legacy `verif-hash` flow.
- Admin access is verified server-side against the Supabase profile role.


## Admin updates
The admin dashboard writes updates directly to Supabase when BOSS is running under Vite. Supabase RLS restricts those writes to authenticated users with role `admin`; no local `/api` server is required for admin updates during development.

## Admin build-request fix

For an existing Supabase BOSS project, run `supabase/admin-build-request-fix.sql` once. This adds the structured customer brief field and the secure admin order-list RPC used by the admin dashboard.

The admin dashboard refreshes requests automatically every 5 seconds and also has a manual Refresh requests button. New build requests include the customer's business type, country, goals, tools, style, plan, contact details, and notes.
