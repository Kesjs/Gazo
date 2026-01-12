-- Script complet pour configurer le système de paiement USDT
-- À exécuter dans Supabase SQL Editor

-- 1. Créer la table payment_sessions (si elle n'existe pas)
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

-- 2. Donner les permissions (si pas déjà faites)
GRANT ALL ON public.payment_sessions TO anon, authenticated;

-- 3. Activer RLS (si pas déjà activé)
ALTER TABLE public.payment_sessions ENABLE ROW LEVEL SECURITY;

-- 4. Supprimer les anciennes politiques (au cas où elles existent)
DROP POLICY IF EXISTS "Users can view own payment sessions" ON public.payment_sessions;
DROP POLICY IF EXISTS "Users can insert own payment sessions" ON public.payment_sessions;
DROP POLICY IF EXISTS "Only admins can modify payment sessions" ON public.payment_sessions;

-- 5. Créer les nouvelles politiques
CREATE POLICY "Users can view own payment sessions" ON public.payment_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payment sessions" ON public.payment_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only admins can modify payment sessions" ON public.payment_sessions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.admins
            WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    );

-- 6. Corriger la contrainte subscriptions (si nécessaire)
ALTER TABLE public.subscriptions
DROP CONSTRAINT IF EXISTS subscriptions_status_check;

ALTER TABLE public.subscriptions
ADD CONSTRAINT subscriptions_status_check
CHECK (status IN ('pending', 'active', 'inactive', 'completed'));

-- 7. Vérification finale
SELECT 'Configuration terminée avec succès !' as status;
