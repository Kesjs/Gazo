# 🗄️ Base de Données - Gazoduc Invest

Ce dossier contient tous les scripts SQL pour la gestion de la base de données Supabase/PostgreSQL.

---

## 📁 Structure

```
database/
├── 01-schema.sql           # Schéma principal (EXÉCUTER EN PREMIER)
├── 02-seed-data.sql        # Données de test (optionnel)
├── 03-indexes.sql          # Index pour performance
├── diagnostic.sql          # Vérification de l'état de la DB
├── test-queries.sql        # Requêtes de test
├── maintenance/            # Scripts de maintenance
│   ├── fix-rls.sql
│   ├── emergency-rls-fix.sql
│   ├── restore-rls.sql
│   ├── temp-disable-rls.sql
│   └── quick-rls-check.sql
└── README.md              # Ce fichier
```

---

## 🚀 Installation Initiale

### 1️⃣ Créer le Schéma Principal

**Fichier :** `01-schema.sql`

Ce script crée :
- ✅ Tables : `profiles`, `admins`, `plans`, `subscriptions`, `transactions`
- ✅ Fonctions : `is_admin()`, `handle_new_user()`
- ✅ Triggers : Création automatique de profil
- ✅ Politiques RLS (Row Level Security)
- ✅ Données par défaut (plans d'investissement)

**Exécution :**
1. Allez dans **Supabase Dashboard → SQL Editor**
2. Créez une nouvelle requête
3. Copiez tout le contenu de `01-schema.sql`
4. Cliquez sur **Run**

⚠️ **Important :** Exécutez ce script **une seule fois** lors de la configuration initiale.

### 2️⃣ Ajouter des Données de Test (Optionnel)

**Fichier :** `02-seed-data.sql`

Ajoute des données de test pour le développement :
- Utilisateurs de test
- Souscriptions d'exemple
- Transactions fictives

**Exécution :**
```sql
-- Dans Supabase SQL Editor
-- Copiez et exécutez 02-seed-data.sql
```

### 3️⃣ Créer les Index (Recommandé)

**Fichier :** `03-indexes.sql`

Améliore les performances des requêtes fréquentes.

**Exécution :**
```sql
-- Dans Supabase SQL Editor
-- Copiez et exécutez 03-indexes.sql
```

---

## 🔍 Diagnostic et Tests

### Vérifier l'État de la Base de Données

**Fichier :** `diagnostic.sql`

Vérifie :
- ✅ Nombre d'enregistrements dans chaque table
- ✅ État de Row Level Security (RLS)
- ✅ Politiques RLS actives
- ✅ Fonction `is_admin()` fonctionnelle

**Utilisation :**
```sql
-- Dans Supabase SQL Editor
-- Copiez et exécutez diagnostic.sql
-- Analysez les résultats
```

### Tester les Requêtes Dashboard

**Fichier :** `test-queries.sql`

Teste les requêtes utilisées par le dashboard :
- Profil utilisateur
- Souscriptions actives
- Transactions récentes
- Calcul du solde

**Utilisation :**
```sql
-- Dans Supabase SQL Editor (avec un utilisateur authentifié)
-- Copiez et exécutez test-queries.sql
```

---

## 🛠️ Maintenance

### Scripts de Maintenance RLS

Le dossier `maintenance/` contient des scripts pour gérer les problèmes de Row Level Security.

#### `quick-rls-check.sql`
Vérification rapide de l'état RLS de toutes les tables.

```sql
-- Utilisation : Vérifier rapidement si RLS est activé
```

#### `fix-rls.sql`
Répare les politiques RLS si elles sont cassées.

```sql
-- Utilisation : En cas de problème d'accès aux données
```

#### `emergency-rls-fix.sql`
Réinitialisation complète des politiques RLS.

```sql
-- ⚠️ ATTENTION : Supprime et recrée toutes les politiques
-- Utiliser uniquement en cas d'urgence
```

#### `temp-disable-rls.sql`
Désactive temporairement RLS pour le débogage.

```sql
-- ⚠️ DANGER : N'utiliser QUE en développement local
-- NE JAMAIS exécuter en production
```

#### `restore-rls.sql`
Réactive RLS après débogage.

```sql
-- Utilisation : Après avoir utilisé temp-disable-rls.sql
```

---

## 📊 Schéma de Base de Données

### Tables Principales

#### `profiles`
Profils utilisateurs (étend `auth.users`)
```sql
- id: UUID (PK, FK → auth.users)
- email: TEXT (UNIQUE)
- full_name: TEXT
- created_at: TIMESTAMP
```

#### `admins`
Liste des administrateurs
```sql
- id: SERIAL (PK)
- email: TEXT (UNIQUE)
- created_at: TIMESTAMP
```

#### `plans`
Plans d'investissement disponibles
```sql
- id: SERIAL (PK)
- name: TEXT
- description: TEXT
- min_amount: DECIMAL(10,2)
- duration_days: INTEGER
- daily_profit: DECIMAL(5,2)
- created_at: TIMESTAMP
```

#### `subscriptions`
Souscriptions des utilisateurs
```sql
- id: SERIAL (PK)
- user_id: UUID (FK → profiles)
- plan_id: INTEGER (FK → plans)
- amount: DECIMAL(10,2)
- start_date: TIMESTAMP
- status: TEXT ('active', 'inactive', 'completed')
- created_at: TIMESTAMP
```

#### `transactions`
Historique des transactions
```sql
- id: SERIAL (PK)
- user_id: UUID (FK → profiles)
- type: TEXT ('deposit', 'subscription', 'earnings', 'withdrawal')
- amount: DECIMAL(10,2)
- description: TEXT
- created_at: TIMESTAMP
```

---

## 🔒 Row Level Security (RLS)

### Politiques Actives

#### Profiles
- ✅ Utilisateurs peuvent voir leur propre profil
- ✅ Utilisateurs peuvent modifier leur propre profil
- ✅ Utilisateurs peuvent créer leur propre profil

#### Plans
- ✅ Tout le monde peut voir les plans (lecture publique)
- ✅ Seuls les admins peuvent modifier les plans

#### Subscriptions
- ✅ Utilisateurs peuvent voir leurs propres souscriptions
- ✅ Utilisateurs peuvent créer leurs propres souscriptions
- ✅ Seuls les admins peuvent modifier les souscriptions

#### Transactions
- ✅ Utilisateurs peuvent voir leurs propres transactions
- ✅ Utilisateurs peuvent créer leurs propres transactions
- ✅ Admins peuvent voir toutes les transactions

#### Admins
- ✅ Seuls les admins peuvent voir la table admins

---

## 🔧 Commandes Utiles

### Ajouter un Administrateur

```sql
INSERT INTO public.admins (email)
VALUES ('votre-email@example.com')
ON CONFLICT (email) DO NOTHING;
```

### Modifier un Plan d'Investissement

```sql
UPDATE public.plans
SET min_amount = 150, daily_profit = 6.0
WHERE name = 'Starter GNL';
```

### Voir les Souscriptions Actives

```sql
SELECT 
  s.id,
  p.email,
  pl.name as plan_name,
  s.amount,
  s.start_date,
  s.status
FROM subscriptions s
JOIN profiles p ON s.user_id = p.id
JOIN plans pl ON s.plan_id = pl.id
WHERE s.status = 'active'
ORDER BY s.start_date DESC;
```

### Calculer le Solde Total d'un Utilisateur

```sql
SELECT 
  p.email,
  COALESCE(SUM(t.amount), 0) as total_balance
FROM profiles p
LEFT JOIN transactions t ON p.id = t.user_id
WHERE p.email = 'user@example.com'
GROUP BY p.email;
```

---

## 🐛 Résolution de Problèmes

### Problème : "permission denied for table X"

**Cause :** RLS mal configuré ou politiques manquantes

**Solution :**
1. Exécutez `diagnostic.sql` pour identifier le problème
2. Exécutez `maintenance/fix-rls.sql` pour réparer
3. Si le problème persiste, exécutez `maintenance/emergency-rls-fix.sql`

### Problème : "new row violates row-level security policy"

**Cause :** Tentative d'insertion de données non autorisées

**Solution :**
1. Vérifiez que l'utilisateur est authentifié
2. Vérifiez que les données respectent les politiques RLS
3. Pour les opérations admin, utilisez la clé `service_role`

### Problème : Les plans ne s'affichent pas

**Cause :** Politique RLS "Anyone can view plans" manquante

**Solution :**
```sql
CREATE POLICY "Anyone can view plans" ON public.plans
    FOR SELECT USING (true);
```

### Problème : Le trigger de création de profil ne fonctionne pas

**Cause :** Trigger ou fonction manquante

**Solution :**
Réexécutez la section "Function to handle new user signup" de `01-schema.sql`

---

## 📚 Ressources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Policies](https://www.postgresql.org/docs/current/sql-createpolicy.html)
- [Supabase SQL Editor](https://supabase.com/docs/guides/database/overview)

---

## ⚠️ Avertissements de Sécurité

1. **NE JAMAIS** désactiver RLS en production
2. **NE JAMAIS** donner des permissions `ALL` sans politiques appropriées
3. **TOUJOURS** tester les politiques RLS avant le déploiement
4. **TOUJOURS** utiliser `auth.uid()` dans les politiques pour identifier l'utilisateur
5. **TOUJOURS** sauvegarder la base de données avant des modifications majeures

---

## 📝 Changelog

### Version 1.0.0 (26 Oct 2025)
- ✅ Schéma initial créé
- ✅ Politiques RLS configurées
- ✅ Scripts de diagnostic ajoutés
- ✅ Scripts de maintenance ajoutés
- ✅ Documentation complète

---

**Maintenu par :** Équipe Gazoduc Invest  
**Dernière mise à jour :** 26 Octobre 2025
