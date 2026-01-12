-- Index de performance pour Gazoduc Invest
-- Ces index améliorent les performances des requêtes fréquentes

-- ============================================================================
-- INDEX POUR LA TABLE PROFILES
-- ============================================================================

-- Index sur email pour recherches rapides
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Index sur created_at pour trier par date d'inscription
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);

-- ============================================================================
-- INDEX POUR LA TABLE SUBSCRIPTIONS
-- ============================================================================

-- Index composite pour requêtes dashboard (user_id + status)
-- Utilisé pour : SELECT * FROM subscriptions WHERE user_id = ? AND status = 'active'
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status 
ON public.subscriptions(user_id, status);

-- Index sur plan_id pour jointures avec plans
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id 
ON public.subscriptions(plan_id);

-- Index sur start_date pour calculs de durée
CREATE INDEX IF NOT EXISTS idx_subscriptions_start_date 
ON public.subscriptions(start_date DESC);

-- Index composite pour statistiques admin
CREATE INDEX IF NOT EXISTS idx_subscriptions_status_created 
ON public.subscriptions(status, created_at DESC);

-- ============================================================================
-- INDEX POUR LA TABLE TRANSACTIONS
-- ============================================================================

-- Index composite pour requêtes dashboard (user_id + created_at)
-- Utilisé pour : SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_transactions_user_date 
ON public.transactions(user_id, created_at DESC);

-- Index sur type pour filtrer par type de transaction
CREATE INDEX IF NOT EXISTS idx_transactions_type 
ON public.transactions(type);

-- Index composite pour calculs de solde par type
CREATE INDEX IF NOT EXISTS idx_transactions_user_type 
ON public.transactions(user_id, type);

-- Index sur created_at pour requêtes temporelles
CREATE INDEX IF NOT EXISTS idx_transactions_created_at 
ON public.transactions(created_at DESC);

-- Index composite pour statistiques admin
CREATE INDEX IF NOT EXISTS idx_transactions_type_date 
ON public.transactions(type, created_at DESC);

-- ============================================================================
-- INDEX POUR LA TABLE ADMINS
-- ============================================================================

-- Index sur email pour vérification rapide des droits admin
CREATE INDEX IF NOT EXISTS idx_admins_email ON public.admins(email);

-- ============================================================================
-- INDEX POUR LA TABLE PLANS
-- ============================================================================

-- Index sur min_amount pour filtres de prix
CREATE INDEX IF NOT EXISTS idx_plans_min_amount ON public.plans(min_amount);

-- Index sur duration_days pour filtres de durée
CREATE INDEX IF NOT EXISTS idx_plans_duration ON public.plans(duration_days);

-- ============================================================================
-- STATISTIQUES ET ANALYSE
-- ============================================================================

-- Mettre à jour les statistiques pour l'optimiseur de requêtes
ANALYZE public.profiles;
ANALYZE public.subscriptions;
ANALYZE public.transactions;
ANALYZE public.admins;
ANALYZE public.plans;

-- ============================================================================
-- VÉRIFICATION DES INDEX
-- ============================================================================

-- Pour voir tous les index créés :
-- SELECT 
--     schemaname,
--     tablename,
--     indexname,
--     indexdef
-- FROM pg_indexes
-- WHERE schemaname = 'public'
-- ORDER BY tablename, indexname;

-- Pour voir la taille des index :
-- SELECT
--     schemaname,
--     tablename,
--     indexname,
--     pg_size_pretty(pg_relation_size(indexrelid)) as index_size
-- FROM pg_stat_user_indexes
-- WHERE schemaname = 'public'
-- ORDER BY pg_relation_size(indexrelid) DESC;

-- ============================================================================
-- NOTES DE PERFORMANCE
-- ============================================================================

-- Ces index sont optimisés pour les requêtes suivantes :

-- 1. Dashboard utilisateur :
--    - Récupération des souscriptions actives (idx_subscriptions_user_status)
--    - Historique des transactions (idx_transactions_user_date)
--    - Calcul du solde (idx_transactions_user_type)

-- 2. Dashboard admin :
--    - Liste de toutes les souscriptions (idx_subscriptions_status_created)
--    - Statistiques des transactions (idx_transactions_type_date)
--    - Vérification des droits admin (idx_admins_email)

-- 3. Recherches et filtres :
--    - Recherche par email (idx_profiles_email)
--    - Filtrage des plans par prix (idx_plans_min_amount)
--    - Tri chronologique (tous les index sur created_at)

-- ============================================================================
-- MAINTENANCE
-- ============================================================================

-- Pour reconstruire un index si nécessaire :
-- REINDEX INDEX idx_transactions_user_date;

-- Pour reconstruire tous les index d'une table :
-- REINDEX TABLE public.transactions;

-- Pour supprimer un index inutilisé :
-- DROP INDEX IF EXISTS idx_nom_index;
