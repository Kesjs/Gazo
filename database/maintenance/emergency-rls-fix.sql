-- IMMEDIATE FIX: Disable RLS to allow dashboard to load
-- Execute this in Supabase SQL Editor RIGHT NOW

ALTER TABLE public.plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins DISABLE ROW LEVEL SECURITY;

-- Confirm the changes
SELECT
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('plans', 'profiles', 'subscriptions', 'transactions', 'admins')
ORDER BY tablename;

-- Test queries (should work now)
SELECT 'plans' as table_name, COUNT(*) as record_count FROM public.plans
UNION ALL
SELECT 'profiles' as table_name, COUNT(*) as record_count FROM public.profiles
UNION ALL
SELECT 'subscriptions' as table_name, COUNT(*) as record_count FROM public.subscriptions
UNION ALL
SELECT 'transactions' as table_name, COUNT(*) as record_count FROM public.transactions;
