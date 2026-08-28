# BOSS bug-fix round

Applied fixes requested before payments:

- Admin users no longer see customer-only "My account" / "Build with BOSS" actions; the header provides a dedicated admin entry and account menu with Sign out.
- Customer account menu is now in the top-right corner with name, role, dashboard/admin entry, and Sign out.
- Build with BOSS no longer starts payment. The wizard submits a real build request directly to the admin queue.
- Build requests are marked `Build requested` / `Not required` so the admin can work on them immediately.
- Admin receives the full build brief for current no-payment requests and can add delivery URL/message.
- Removed the visible Supabase connection test from the login screen.
- Added Forgot password and password recovery/update flow for Supabase auth.
- Updated the Supabase order trigger to preserve secure server pricing while allowing the no-payment build-request workflow.
- Removed the customer-dashboard shortcut from the admin order controls.

Before launch, apply the updated `supabase/schema.sql` in the BOSS Supabase project so the no-payment build request trigger is active.
