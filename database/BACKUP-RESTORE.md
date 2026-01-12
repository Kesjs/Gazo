# 💾 Guide de Backup et Restauration

Guide complet pour sauvegarder et restaurer la base de données Gazoduc Invest.

---

## 📋 Table des Matières

- [Backup Automatique Supabase](#backup-automatique-supabase)
- [Backup Manuel](#backup-manuel)
- [Restauration](#restauration)
- [Backup Programmé](#backup-programmé)
- [Stratégie de Backup](#stratégie-de-backup)

---

## 🔄 Backup Automatique Supabase

Supabase effectue des backups automatiques quotidiens.

### Accéder aux Backups

1. Allez dans **Supabase Dashboard**
2. Sélectionnez votre projet
3. **Settings → Database → Backups**
4. Vous verrez la liste des backups disponibles

### Restaurer un Backup Automatique

1. Dans la section Backups
2. Cliquez sur le backup souhaité
3. Cliquez sur **Restore**
4. Confirmez l'opération

⚠️ **Attention :** La restauration écrase toutes les données actuelles.

---

## 💾 Backup Manuel

### Via Supabase Dashboard

#### Backup Complet

```sql
-- Dans Supabase SQL Editor
-- Exporter toutes les données

-- 1. Profiles
COPY (SELECT * FROM public.profiles) TO STDOUT WITH CSV HEADER;

-- 2. Admins
COPY (SELECT * FROM public.admins) TO STDOUT WITH CSV HEADER;

-- 3. Plans
COPY (SELECT * FROM public.plans) TO STDOUT WITH CSV HEADER;

-- 4. Subscriptions
COPY (SELECT * FROM public.subscriptions) TO STDOUT WITH CSV HEADER;

-- 5. Transactions
COPY (SELECT * FROM public.transactions) TO STDOUT WITH CSV HEADER;
```

#### Backup du Schéma Uniquement

```sql
-- Obtenir le schéma de toutes les tables
SELECT 
    'CREATE TABLE ' || table_name || ' (' || 
    string_agg(
        column_name || ' ' || data_type || 
        CASE WHEN character_maximum_length IS NOT NULL 
            THEN '(' || character_maximum_length || ')' 
            ELSE '' 
        END,
        ', '
    ) || ');'
FROM information_schema.columns
WHERE table_schema = 'public'
GROUP BY table_name;
```

### Via CLI (pg_dump)

Si vous avez accès direct à PostgreSQL :

```bash
# Backup complet
pg_dump -h db.xxxxx.supabase.co \
  -U postgres \
  -d postgres \
  -F c \
  -f backup_$(date +%Y%m%d_%H%M%S).dump

# Backup du schéma uniquement
pg_dump -h db.xxxxx.supabase.co \
  -U postgres \
  -d postgres \
  --schema-only \
  -f schema_backup.sql

# Backup des données uniquement
pg_dump -h db.xxxxx.supabase.co \
  -U postgres \
  -d postgres \
  --data-only \
  -f data_backup.sql
```

---

## 🔙 Restauration

### Restauration Complète

#### Via Supabase Dashboard

1. **Settings → Database → Backups**
2. Sélectionnez le backup
3. Cliquez sur **Restore**

#### Via SQL Editor

```sql
-- 1. Désactiver temporairement les contraintes
SET session_replication_role = 'replica';

-- 2. Vider les tables (dans l'ordre)
TRUNCATE public.transactions CASCADE;
TRUNCATE public.subscriptions CASCADE;
TRUNCATE public.referrals CASCADE;
TRUNCATE public.referral_codes CASCADE;
TRUNCATE public.notifications CASCADE;
TRUNCATE public.profiles CASCADE;
TRUNCATE public.admins CASCADE;
TRUNCATE public.plans CASCADE;

-- 3. Réimporter les données (via COPY ou INSERT)
-- Voir section suivante

-- 4. Réactiver les contraintes
SET session_replication_role = 'origin';

-- 5. Mettre à jour les séquences
SELECT setval('plans_id_seq', (SELECT MAX(id) FROM plans));
SELECT setval('subscriptions_id_seq', (SELECT MAX(id) FROM subscriptions));
SELECT setval('transactions_id_seq', (SELECT MAX(id) FROM transactions));
```

### Restauration Partielle (Table Spécifique)

```sql
-- Exemple : Restaurer uniquement la table plans

-- 1. Sauvegarder les données actuelles (sécurité)
CREATE TABLE plans_backup AS SELECT * FROM public.plans;

-- 2. Vider la table
TRUNCATE public.plans CASCADE;

-- 3. Réimporter les données
-- (Coller vos données ici)

-- 4. Vérifier
SELECT COUNT(*) FROM public.plans;

-- 5. Si OK, supprimer le backup
DROP TABLE plans_backup;
```

### Restauration d'Urgence

Si la base de données est corrompue :

```sql
-- 1. Réexécuter le schéma principal
-- Exécuter database/01-schema.sql

-- 2. Réappliquer les index
-- Exécuter database/03-indexes.sql

-- 3. Réappliquer les migrations
-- Exécuter database/04-migrations.sql

-- 4. Réimporter les données depuis le backup
```

---

## ⏰ Backup Programmé

### Script de Backup Automatique

Créez un script pour automatiser les backups :

```bash
#!/bin/bash
# backup-db.sh

# Configuration
SUPABASE_HOST="db.xxxxx.supabase.co"
SUPABASE_USER="postgres"
SUPABASE_DB="postgres"
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Créer le dossier de backup
mkdir -p $BACKUP_DIR

# Backup complet
pg_dump -h $SUPABASE_HOST \
  -U $SUPABASE_USER \
  -d $SUPABASE_DB \
  -F c \
  -f $BACKUP_DIR/backup_$DATE.dump

# Backup SQL (lisible)
pg_dump -h $SUPABASE_HOST \
  -U $SUPABASE_USER \
  -d $SUPABASE_DB \
  -f $BACKUP_DIR/backup_$DATE.sql

# Compresser
gzip $BACKUP_DIR/backup_$DATE.sql

# Nettoyer les backups de plus de 30 jours
find $BACKUP_DIR -name "backup_*.dump" -mtime +30 -delete
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

echo "Backup créé : backup_$DATE.dump"
```

### Cron Job (Linux/Mac)

```bash
# Éditer crontab
crontab -e

# Ajouter une ligne pour backup quotidien à 2h du matin
0 2 * * * /path/to/backup-db.sh >> /var/log/db-backup.log 2>&1
```

### Task Scheduler (Windows)

1. Ouvrir **Task Scheduler**
2. Créer une nouvelle tâche
3. Trigger : Quotidien à 2h
4. Action : Exécuter `backup-db.sh`

---

## 📊 Stratégie de Backup

### Recommandations

#### Production

- ✅ **Backup automatique quotidien** (Supabase)
- ✅ **Backup manuel hebdomadaire** (téléchargé localement)
- ✅ **Backup avant chaque migration**
- ✅ **Backup avant modifications majeures**
- ✅ **Conserver 30 jours de backups**

#### Développement

- ✅ **Backup avant tests destructifs**
- ✅ **Backup avant migrations**
- ✅ **Conserver 7 jours de backups**

### Règle 3-2-1

- **3** copies de vos données
- **2** types de stockage différents
- **1** copie hors site

Exemple :
1. Base de données principale (Supabase)
2. Backup automatique Supabase
3. Backup manuel local
4. Backup cloud (Google Drive, Dropbox, etc.)

---

## 🔍 Vérification des Backups

### Tester un Backup

```sql
-- 1. Créer une base de test
CREATE DATABASE test_restore;

-- 2. Restaurer le backup dans la base de test
-- (Via pg_restore ou SQL)

-- 3. Vérifier l'intégrité
SELECT 
    'profiles' as table_name, 
    COUNT(*) as count 
FROM test_restore.public.profiles
UNION ALL
SELECT 'subscriptions', COUNT(*) FROM test_restore.public.subscriptions
UNION ALL
SELECT 'transactions', COUNT(*) FROM test_restore.public.transactions;

-- 4. Supprimer la base de test
DROP DATABASE test_restore;
```

### Checklist de Vérification

- [ ] Toutes les tables sont présentes
- [ ] Le nombre d'enregistrements est correct
- [ ] Les contraintes sont actives
- [ ] Les index sont créés
- [ ] Les politiques RLS sont actives
- [ ] Les fonctions et triggers existent
- [ ] Les données sont cohérentes

---

## 🚨 Plan de Reprise d'Activité (DRP)

### En Cas de Perte de Données

1. **Évaluer l'ampleur** de la perte
2. **Identifier le dernier backup valide**
3. **Notifier l'équipe** et les utilisateurs si nécessaire
4. **Restaurer le backup**
5. **Vérifier l'intégrité** des données
6. **Tester les fonctionnalités** critiques
7. **Documenter l'incident**

### Contacts d'Urgence

- **Admin Principal** : admin@gazoducinvest.com
- **Support Supabase** : support@supabase.com
- **Équipe Technique** : tech@gazoducinvest.com

---

## 📚 Ressources

- [Supabase Backup Documentation](https://supabase.com/docs/guides/platform/backups)
- [PostgreSQL Backup Guide](https://www.postgresql.org/docs/current/backup.html)
- [pg_dump Documentation](https://www.postgresql.org/docs/current/app-pgdump.html)

---

## ⚠️ Avertissements

1. **Testez vos backups** régulièrement
2. **Chiffrez les backups** contenant des données sensibles
3. **Documentez la procédure** de restauration
4. **Formez l'équipe** aux procédures de backup
5. **Automatisez** autant que possible

---

**Dernière mise à jour :** 26 Octobre 2025  
**Version :** 1.0.0
