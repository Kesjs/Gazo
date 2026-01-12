-- Gazoduc Invest Database Schema
-- Execute this entire script at once to create all necessary tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Admins table (for admin authentication)
CREATE TABLE IF NOT EXISTS public.admins (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Plans table (investment plans)
CREATE TABLE IF NOT EXISTS public.plans (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    min_amount DECIMAL(10,2) NOT NULL,
    duration_days INTEGER NOT NULL,
    daily_profit DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    plan_id INTEGER REFERENCES public.plans(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    static_balance DECIMAL(10,2) DEFAULT 0 NOT NULL,
    dynamic_balance DECIMAL(10,2) DEFAULT 0 NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('deposit', 'subscription', 'earnings', 'withdrawal')),
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Payment sessions table (for USDT TRC20 payments)
CREATE TABLE IF NOT EXISTS public.payment_sessions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    subscription_id INTEGER REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    session_id TEXT UNIQUE NOT NULL,
    payment_address TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'expired')),
    blockchain_tx_hash TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Withdrawal addresses table
CREATE TABLE IF NOT EXISTS public.withdrawal_addresses (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    address TEXT NOT NULL,
    blockchain TEXT NOT NULL DEFAULT 'TRC20',
    label TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, address)
);

-- Insert default investment plans
INSERT INTO public.plans (name, description, min_amount, duration_days, daily_profit) VALUES
('Starter GNL', 'Plan de départ pour investir dans le GNL', 100.00, 30, 5.00),
('Premium GNL', 'Investissement équilibré avec meilleurs rendements', 225.00, 45, 7.50),
('Elite GNL', 'Investisseur avancé avec accès privilégié', 999.00, 60, 12.00),
('Élite GNL', 'Investisseur professionnel avec services premium', 1999.00, 90, 20.00)
ON CONFLICT (id) DO NOTHING;

-- Insert default admin (change email as needed)
INSERT INTO public.admins (email) VALUES ('admin@gazoducinvest.com')
ON CONFLICT (email) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_addresses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Function to check if user is admin (secure function)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admins
        WHERE email = (SELECT email FROM auth.users WHERE id = user_id)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-enable RLS for admins with proper policy
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admins (using secure function)
CREATE POLICY "Only admins can view admins table" ON public.admins
    FOR SELECT USING (public.is_admin(auth.uid()));

-- RLS Policies for plans (public read)
CREATE POLICY "Anyone can view plans" ON public.plans
    FOR SELECT USING (true);

CREATE POLICY "Only admins can modify plans" ON public.plans
    FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON public.subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only admins can modify subscriptions" ON public.subscriptions
    FOR UPDATE USING (public.is_admin(auth.uid()));

-- RLS Policies for payment_sessions
CREATE POLICY "Users can view own payment sessions" ON public.payment_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payment sessions" ON public.payment_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only admins can modify payment sessions" ON public.payment_sessions
    FOR UPDATE USING (public.is_admin(auth.uid()));

-- RLS Policies for withdrawal_addresses
CREATE POLICY "Users can view own withdrawal addresses" ON public.withdrawal_addresses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own withdrawal addresses" ON public.withdrawal_addresses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own withdrawal addresses" ON public.withdrawal_addresses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own withdrawal addresses" ON public.withdrawal_addresses
    FOR DELETE USING (auth.uid() = user_id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;
GRANT ALL ON public.admins TO anon, authenticated;
GRANT ALL ON public.plans TO anon, authenticated;
GRANT ALL ON public.subscriptions TO anon, authenticated;
GRANT ALL ON public.transactions TO anon, authenticated;
GRANT ALL ON public.payment_sessions TO anon, authenticated;
GRANT ALL ON public.withdrawal_addresses TO anon, authenticated;
