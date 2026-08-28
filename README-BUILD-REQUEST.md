# BOSS Build Request Workflow

This version changes the Business Setup Wizard so **Build my BOSS setup** submits a done-for-you build request instead of sending the customer to checkout.

## Customer flow
1. Customer completes the Business Setup Wizard.
2. Customer clicks **Build my BOSS setup**.
3. BOSS creates a `Build requested` order/project.
4. The customer sees a confirmation explaining the ~10 minute preparation window and gets a request ID.
5. The request appears in the admin dashboard with the full wizard brief.
6. Admin changes the request to **In progress** while building.
7. Admin adds a delivery URL and message, then marks the request **Completed**.
8. The customer sees the delivery message/link in their dashboard.

## Backend
When Supabase is configured, the request is stored in `orders` and `projects`. Run the updated `supabase/schema.sql` to add the delivery fields to `orders`.

The workflow does not require an AI API. The initial build can be template-based and handled manually by the admin.


## Hybrid optional payment flow

The BOSS wizard now supports two payment paths:

- **Pay once:** a one-time build price. After Pesapal confirms payment, the request moves into production/admin workflow.
- **Subscribe:** a monthly BOSS plan. Configure a Pesapal Payment Plan ID for Starter, Business and Pro in the environment variables. The first checkout includes the payment plan and Pesapal handles subsequent billing cycles.

Set `FLW_STARTER_PLAN_ID`, `FLW_BUSINESS_PLAN_ID`, and `FLW_PRO_PLAN_ID` to the Payment Plan IDs from your Pesapal account.

The app does not expose payment secrets in the browser; checkout creation and verification stay server-side.


## BOSS v13 database fix
Run `supabase/build-requests.sql` in the Supabase SQL Editor. This version installs the dedicated `submit_build_request()` RPC used by the customer wizard and `admin_list_build_requests()` / `admin_update_build_request()` for the private admin queue. No existing orders need to be deleted.
