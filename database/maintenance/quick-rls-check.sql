-- Quick check of RLS status
SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('plans', 'profiles', 'subscriptions', 'transactions', 'admins')
ORDER BY tablename;

-- Test if we can read plans (should work if RLS disabled)
SELECT COUNT(*) as plans_count FROM public.plans;

-- Test if we can read profiles (should work if RLS disabled)
SELECT COUNT(*) as profiles_count FROM public.profiles;
