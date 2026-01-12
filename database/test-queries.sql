-- Test script for dashboard queries
-- Run this in Supabase SQL editor with proper auth context

-- 1. Check current user (this will only work in authenticated context)
SELECT auth.uid() as current_user_id;

-- 2. Test profile query (should return user's profile)
SELECT id, email, full_name, created_at
FROM public.profiles
WHERE id = auth.uid();

-- 3. Test subscriptions query (should return user's subscriptions)
SELECT s.id, s.plan_id, s.amount, s.start_date, s.status, p.name as plan_name
FROM public.subscriptions s
LEFT JOIN public.plans p ON s.plan_id = p.id
WHERE s.user_id = auth.uid();

-- 4. Test transactions query (should return user's transactions)
SELECT id, type, amount, description, created_at
FROM public.transactions
WHERE user_id = auth.uid()
ORDER BY created_at DESC
LIMIT 10;

-- 5. Test balance calculation (sum of all transactions)
SELECT COALESCE(SUM(amount), 0) as total_balance
FROM public.transactions
WHERE user_id = auth.uid();

-- 6. Test plans query (should return all plans - public)
SELECT id, name, description, min_amount, duration_days, daily_profit
FROM public.plans
ORDER BY id;
