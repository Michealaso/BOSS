BOSS Build with BOSS workflow

Build with BOSS is intentionally separate from the template Orders system.
Customer submissions are stored in public.build_requests. Template purchases continue using public.orders.
Run the appended build_requests migration in Supabase before testing the wizard/admin queue.
