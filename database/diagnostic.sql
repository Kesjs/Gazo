-- Diagnostic script to check database state and RLS policies
-- Run this in Supabase SQL editor to debug the dashboard loading issue

-- 1. Check if tables exist and have data
SELECT 'plans' as table_name, COUNT(*) as record_count FROM public.plans
UNION ALL
SELECT 'profiles' as table_name, COUNT(*) as record_count FROM public.profiles
UNION ALL
SELECT 'admins' as table_name, COUNT(*) as record_count FROM public.admins
UNION ALL
SELECT 'subscriptions' as table_name, COUNT(*) as record_count FROM public.subscriptions
UNION ALL
SELECT 'transactions' as table_name, COUNT(*) as record_count FROM public.transactions;

-- 2. Check RLS status for all tables
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('plans', 'profiles', 'admins', 'subscriptions', 'transactions')
ORDER BY tablename;

-- 3. Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 4. Test the is_admin function
SELECT public.is_admin('00000000-0000-0000-0000-000000000000'::uuid) as test_admin_check;

-- 5. Check if plans are accessible without auth
-- This should return data if RLS is working for public read
SELECT id, name, min_amount FROM public.plans LIMIT 5;
