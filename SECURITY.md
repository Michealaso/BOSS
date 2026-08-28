# BOSS admin isolation

The admin area is isolated in two layers:

1. Client-side routing hides `/admin` from normal customers, but this is only a UX boundary.
2. Supabase RLS and the server-side `/api/admin-order` endpoint enforce authorization using the authenticated user's `profiles.role`.

Important: the `profiles` table policy now prevents a customer from changing their own `role` to `admin`. The `profile_role()` SECURITY DEFINER helper is used only to compare the existing role during self-updates.

For production, create admin users through a trusted SQL/server process; never expose the service-role key to the browser.
