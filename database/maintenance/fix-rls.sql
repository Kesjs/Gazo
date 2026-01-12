-- Fix infinite recursion in RLS policies for admins table
-- Run this script in Supabase SQL editor to fix the RLS issues

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Only admins can view admins table" ON public.admins;
DROP POLICY IF EXISTS "Only admins can modify plans" ON public.plans;
DROP POLICY IF EXISTS "Only admins can modify subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Only admins can view all transactions" ON public.transactions;

-- Create secure function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admins
        WHERE email = (SELECT email FROM auth.users WHERE id = user_id)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create policies using the secure function
CREATE POLICY "Only admins can view admins table" ON public.admins
    FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can modify plans" ON public.plans
    FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can modify subscriptions" ON public.subscriptions
    FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can view all transactions" ON public.transactions
    FOR SELECT USING (public.is_admin(auth.uid()));
