-- Migration: Add payment system tables and fields
-- Date: 2025-01-27
-- Description: Add automatic payment processing with TronWeb

-- Add new fields to subscriptions table
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS static_balance DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS dynamic_balance DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS payment_tx_hash TEXT,
ADD COLUMN IF NOT EXISTS last_credit_date TIMESTAMP WITH TIME ZONE;

-- Update existing subscriptions to set static_balance = amount
UPDATE public.subscriptions
SET static_balance = amount
WHERE static_balance = 0;

-- Update plans with correct percentages (user specified 1.5% for starter)
UPDATE public.plans
SET daily_profit = 1.5
WHERE name = 'Starter GNL';

UPDATE public.plans
SET daily_profit = 2.0
WHERE name = 'Premium GNL';

UPDATE public.plans
SET daily_profit = 2.5
WHERE name = 'Elite GNL';

UPDATE public.plans
SET daily_profit = 3.0
WHERE name = 'Élite GNL';

-- Update plans duration to match user requirements
UPDATE public.plans
SET duration_days = 90
WHERE name = 'Starter GNL';

UPDATE public.plans
SET duration_days = 120
WHERE name = 'Premium GNL';

UPDATE public.plans
SET duration_days = 180
WHERE name = 'Elite GNL';

UPDATE public.plans
SET duration_days = 365
WHERE name = 'Élite GNL';

-- Create payment_sessions table for tracking payment attempts
CREATE TABLE IF NOT EXISTS public.payment_sessions (
    session_id TEXT PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    plan_id INTEGER REFERENCES public.plans(id) ON DELETE CASCADE NOT NULL,
    payment_address TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create investment_credits table for tracking daily earnings
CREATE TABLE IF NOT EXISTS public.investment_credits (
    id SERIAL PRIMARY KEY,
    subscription_id INTEGER REFERENCES public.subscriptions(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    credit_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    credit_type TEXT DEFAULT 'daily' CHECK (credit_type IN ('daily', 'bonus', 'referral')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_sessions_user_id ON public.payment_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_status ON public.payment_sessions(status);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_expires_at ON public.payment_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_investment_credits_subscription_id ON public.investment_credits(subscription_id);
CREATE INDEX IF NOT EXISTS idx_investment_credits_user_id ON public.investment_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_investment_credits_credit_date ON public.investment_credits(credit_date);

-- Enable RLS on new tables
ALTER TABLE public.payment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_credits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_sessions
CREATE POLICY "Users can view own payment sessions" ON public.payment_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payment sessions" ON public.payment_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only admins can modify payment sessions" ON public.payment_sessions
    FOR UPDATE USING (public.is_admin(auth.uid()));

-- RLS Policies for investment_credits
CREATE POLICY "Users can view own investment credits" ON public.investment_credits
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Only admins can insert investment credits" ON public.investment_credits
    FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can modify investment credits" ON public.investment_credits
    FOR UPDATE USING (public.is_admin(auth.uid()));

-- Create notifications table for dashboard alerts
CREATE TABLE IF NOT EXISTS public.notifications (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('payment_detected', 'subscription_created', 'subscription_activated', 'daily_credits', 'pack_completed', 'withdrawal_processed', 'system_info')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    related_id TEXT, -- ID de la souscription/transaction liée
    metadata JSONB, -- Données supplémentaires (montant, hash, etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Only admins can create notifications" ON public.notifications
    FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

-- Grant permissions
GRANT ALL ON public.notifications TO anon, authenticated;
