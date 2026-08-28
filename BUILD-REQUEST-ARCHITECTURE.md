BOSS Build with BOSS now uses a dedicated `public.build_requests` table.

Template purchases remain in `public.orders`.
Build requests are separate because they are a done-for-you workflow: customer submits a brief, admin builds it, admin sends the delivery link/message, customer sees the delivery in their dashboard.

Run `supabase/build-requests.sql` once in the Supabase SQL Editor before testing the workflow.
