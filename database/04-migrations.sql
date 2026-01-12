-- Migrations de la base de données
-- Ce fichier contient les migrations pour faire évoluer le schéma

-- ============================================================================
-- SYSTÈME DE VERSIONING
-- ============================================================================

-- Table pour tracker les migrations
CREATE TABLE IF NOT EXISTS public.schema_migrations (
    id SERIAL PRIMARY KEY,
    version TEXT UNIQUE NOT NULL,
    description TEXT,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Fonction pour enregistrer une migration
CREATE OR REPLACE FUNCTION record_migration(
    p_version TEXT,
    p_description TEXT
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.schema_migrations (version, description)
    VALUES (p_version, p_description)
    ON CONFLICT (version) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- MIGRATION v1.0.0 - Schéma Initial
-- ============================================================================

SELECT record_migration('1.0.0', 'Schéma initial avec tables principales et RLS');

-- ============================================================================
-- MIGRATION v1.1.0 - Ajout de champs pour amélioration future
-- ============================================================================

-- Ajouter un champ avatar_url aux profiles (optionnel)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'avatar_url'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
    END IF;
END $$;

-- Ajouter un champ phone aux profiles (optionnel)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'phone'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN phone TEXT;
    END IF;
END $$;

-- Ajouter un champ country aux profiles (optionnel)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'country'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN country TEXT;
    END IF;
END $$;

SELECT record_migration('1.1.0', 'Ajout de champs optionnels aux profils utilisateurs');

-- ============================================================================
-- MIGRATION v1.2.0 - Amélioration des transactions
-- ============================================================================

-- Ajouter un champ reference_id pour traçabilité
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'transactions' 
        AND column_name = 'reference_id'
    ) THEN
        ALTER TABLE public.transactions ADD COLUMN reference_id TEXT;
    END IF;
END $$;

-- Ajouter un champ status aux transactions
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'transactions' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE public.transactions 
        ADD COLUMN status TEXT DEFAULT 'completed' 
        CHECK (status IN ('pending', 'completed', 'failed', 'cancelled'));
    END IF;
END $$;

SELECT record_migration('1.2.0', 'Amélioration du système de transactions');

-- ============================================================================
-- MIGRATION v1.3.0 - Système de notifications
-- ============================================================================

-- Table pour les notifications utilisateur
CREATE TABLE IF NOT EXISTS public.notifications (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index pour requêtes rapides
CREATE INDEX IF NOT EXISTS idx_notifications_user_read 
ON public.notifications(user_id, read, created_at DESC);

-- RLS pour notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

SELECT record_migration('1.3.0', 'Ajout du système de notifications');

-- ============================================================================
-- MIGRATION v1.4.0 - Système de parrainage
-- ============================================================================

-- Table pour les codes de parrainage
CREATE TABLE IF NOT EXISTS public.referral_codes (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    code TEXT UNIQUE NOT NULL,
    uses INTEGER DEFAULT 0,
    max_uses INTEGER DEFAULT NULL, -- NULL = illimité
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Table pour tracker les parrainages
CREATE TABLE IF NOT EXISTS public.referrals (
    id SERIAL PRIMARY KEY,
    referrer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    referred_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    code_used TEXT,
    commission_earned DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(referred_id) -- Un utilisateur ne peut être parrainé qu'une fois
);

-- Index
CREATE INDEX IF NOT EXISTS idx_referral_codes_user 
ON public.referral_codes(user_id);

CREATE INDEX IF NOT EXISTS idx_referral_codes_code 
ON public.referral_codes(code);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer 
ON public.referrals(referrer_id);

-- RLS
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referral codes" ON public.referral_codes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own referral codes" ON public.referral_codes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own referrals" ON public.referrals
    FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- Fonction pour générer un code de parrainage unique
CREATE OR REPLACE FUNCTION generate_referral_code(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
    v_code TEXT;
    v_exists BOOLEAN;
BEGIN
    LOOP
        -- Générer un code aléatoire de 8 caractères
        v_code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
        
        -- Vérifier si le code existe déjà
        SELECT EXISTS(SELECT 1 FROM public.referral_codes WHERE code = v_code) INTO v_exists;
        
        EXIT WHEN NOT v_exists;
    END LOOP;
    
    -- Insérer le code
    INSERT INTO public.referral_codes (user_id, code)
    VALUES (p_user_id, v_code);
    
    RETURN v_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT record_migration('1.4.0', 'Ajout du système de parrainage');

-- ============================================================================
-- MIGRATION v1.5.0 - Logs d'audit
-- ============================================================================

-- Table pour les logs d'audit
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    table_name TEXT,
    record_id TEXT,
    old_data JSONB,
    new_data JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index pour recherches
CREATE INDEX IF NOT EXISTS idx_audit_logs_user 
ON public.audit_logs(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action 
ON public.audit_logs(action, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_table 
ON public.audit_logs(table_name, created_at DESC);

-- RLS - Seuls les admins peuvent voir les logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view audit logs" ON public.audit_logs
    FOR SELECT USING (public.is_admin(auth.uid()));

SELECT record_migration('1.5.0', 'Ajout du système de logs d\'audit');

-- ============================================================================
-- MIGRATION v1.6.0 - Ajout du champ updated_at aux souscriptions
-- ============================================================================

-- Ajouter le champ updated_at à la table subscriptions
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'subscriptions' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.subscriptions ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());
        
        -- Mettre à jour tous les enregistrements existants avec created_at comme valeur initiale
        UPDATE public.subscriptions SET updated_at = created_at WHERE updated_at IS NULL;
    END IF;
END $$;

SELECT record_migration('1.6.0', 'Ajout du champ updated_at à la table subscriptions');

-- ============================================================================
-- VÉRIFIER LES MIGRATIONS APPLIQUÉES
-- ============================================================================

-- Pour voir toutes les migrations :
-- SELECT * FROM public.schema_migrations ORDER BY executed_at;

-- Pour voir la version actuelle :
-- SELECT version, description, executed_at 
-- FROM public.schema_migrations 
-- ORDER BY executed_at DESC 
-- LIMIT 1;
