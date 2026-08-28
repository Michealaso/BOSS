# BOSS production notes

## Now connected

1. Supabase auth and database persistence when environment variables are present.
2. Supabase row-level security with customer/admin separation.
3. Pesapal hosted checkout endpoint and signed webhook handler.
4. Public chatbot backend with configurable AI provider and FAQ fallback.
5. Website HTML and chatbot configuration export for delivery.

## Still requiring your accounts/credentials

- A Supabase project.
- A Pesapal merchant account and API secrets.
- Optional AI provider credentials.
- A hosting account/domain for permanent customer sites.

## Recommended launch order

1. Launch with the three website templates and three chatbot packages.
2. Connect Supabase.
3. Test Pesapal in test mode with a test order.
4. Configure the webhook and verify a successful payment before changing an order to Paid.
5. Deliver sites using BOSS Studio export while customer volume is low.
6. Later connect automated deployment/custom domains.


## Final pre-launch checks
1. Run the updated `supabase/schema.sql` in your existing Supabase SQL Editor. It is idempotent and adds the BOSS package pricing table.
2. Keep the browser `.env` publishable key and server secret separate. Never expose `SUPABASE_SERVICE_ROLE_KEY` or `FLW_SECRET_KEY` to the Vite client.
3. Configure Pesapal payment plans in UGX if you want subscriptions, then paste the three plan IDs into server environment variables.
4. Configure the Pesapal webhook URL as `/api/flutterwave-webhook` on the deployed domain and set the same secret hash in `FLW_SECRET_HASH`.
5. Use a real small-value test payment before launch. Verify amount, currency, tx_ref, webhook, order status and customer delivery end-to-end.
