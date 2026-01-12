-- Données de test pour le développement
-- ⚠️ NE PAS exécuter en production
-- Ce script ajoute des données fictives pour tester l'application

-- Note: Les utilisateurs doivent être créés via Supabase Auth
-- Ce script suppose que des utilisateurs existent déjà

-- ============================================================================
-- DONNÉES DE TEST - PLANS SUPPLÉMENTAIRES (optionnel)
-- ============================================================================

-- Ajouter des plans supplémentaires si nécessaire
INSERT INTO public.plans (name, description, min_amount, duration_days, daily_profit) VALUES
('Test Plan', 'Plan de test pour développement', 50.00, 15, 2.50)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- DONNÉES DE TEST - TRANSACTIONS
-- ============================================================================

-- Note: Remplacez 'USER_UUID_HERE' par un vrai UUID d'utilisateur de test
-- Vous pouvez obtenir l'UUID depuis la table auth.users dans Supabase

-- Exemple de transactions pour un utilisateur de test
-- DÉCOMMENTEZ et remplacez l'UUID pour utiliser

/*
DO $$
DECLARE
    test_user_id UUID := 'USER_UUID_HERE'; -- Remplacez par un vrai UUID
BEGIN
    -- Dépôt initial
    INSERT INTO public.transactions (user_id, type, amount, description)
    VALUES 
        (test_user_id, 'deposit', 1000.00, 'Dépôt initial de test'),
        (test_user_id, 'deposit', 500.00, 'Second dépôt de test');
    
    -- Souscription à un plan
    INSERT INTO public.subscriptions (user_id, plan_id, amount, status)
    VALUES 
        (test_user_id, 1, 100.00, 'active'),
        (test_user_id, 2, 225.00, 'active');
    
    -- Transaction de souscription
    INSERT INTO public.transactions (user_id, type, amount, description)
    VALUES 
        (test_user_id, 'subscription', -100.00, 'Souscription Starter GNL'),
        (test_user_id, 'subscription', -225.00, 'Souscription Premium GNL');
    
    -- Gains quotidiens (simulation)
    INSERT INTO public.transactions (user_id, type, amount, description)
    VALUES 
        (test_user_id, 'earnings', 5.00, 'Gains quotidiens - Starter GNL'),
        (test_user_id, 'earnings', 7.50, 'Gains quotidiens - Premium GNL'),
        (test_user_id, 'earnings', 5.00, 'Gains quotidiens - Starter GNL'),
        (test_user_id, 'earnings', 7.50, 'Gains quotidiens - Premium GNL');
END $$;
*/

-- ============================================================================
-- FONCTION UTILITAIRE - Créer un utilisateur de test complet
-- ============================================================================

CREATE OR REPLACE FUNCTION create_test_user_data(
    p_user_id UUID,
    p_initial_deposit DECIMAL DEFAULT 1000.00
)
RETURNS TEXT AS $$
DECLARE
    v_result TEXT;
BEGIN
    -- Vérifier si l'utilisateur existe dans profiles
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id) THEN
        RETURN 'Erreur: Utilisateur non trouvé dans profiles. Créez d''abord un compte via Supabase Auth.';
    END IF;
    
    -- Dépôt initial
    INSERT INTO public.transactions (user_id, type, amount, description)
    VALUES (p_user_id, 'deposit', p_initial_deposit, 'Dépôt initial de test');
    
    -- Souscription au plan Starter
    INSERT INTO public.subscriptions (user_id, plan_id, amount, status)
    VALUES (p_user_id, 1, 100.00, 'active');
    
    INSERT INTO public.transactions (user_id, type, amount, description)
    VALUES (p_user_id, 'subscription', -100.00, 'Souscription Starter GNL');
    
    -- Quelques gains quotidiens
    INSERT INTO public.transactions (user_id, type, amount, description)
    SELECT 
        p_user_id,
        'earnings',
        5.00,
        'Gains quotidiens - Jour ' || generate_series
    FROM generate_series(1, 5);
    
    v_result := 'Données de test créées avec succès pour l''utilisateur ' || p_user_id::TEXT;
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- UTILISATION DE LA FONCTION
-- ============================================================================

-- Pour créer des données de test pour un utilisateur :
-- SELECT create_test_user_data('UUID_DE_VOTRE_UTILISATEUR'::UUID);

-- Avec un montant de dépôt personnalisé :
-- SELECT create_test_user_data('UUID_DE_VOTRE_UTILISATEUR'::UUID, 2000.00);

-- ============================================================================
-- NETTOYAGE DES DONNÉES DE TEST
-- ============================================================================

CREATE OR REPLACE FUNCTION cleanup_test_data(p_user_id UUID)
RETURNS TEXT AS $$
BEGIN
    -- Supprimer les transactions
    DELETE FROM public.transactions WHERE user_id = p_user_id;
    
    -- Supprimer les souscriptions
    DELETE FROM public.subscriptions WHERE user_id = p_user_id;
    
    RETURN 'Données de test supprimées pour l''utilisateur ' || p_user_id::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Utilisation :
-- SELECT cleanup_test_data('UUID_DE_VOTRE_UTILISATEUR'::UUID);

-- ============================================================================
-- NOTES
-- ============================================================================

-- Pour obtenir l'UUID d'un utilisateur :
-- SELECT id, email FROM auth.users;

-- Pour voir le solde d'un utilisateur de test :
-- SELECT 
--     p.email,
--     COALESCE(SUM(t.amount), 0) as balance
-- FROM profiles p
-- LEFT JOIN transactions t ON p.id = t.user_id
-- WHERE p.id = 'UUID_ICI'
-- GROUP BY p.email;
