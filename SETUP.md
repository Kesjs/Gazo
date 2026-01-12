# 🚀 Guide de Démarrage Rapide - Gazoduc Invest

## 📋 Prérequis

- Node.js 18+ installé
- Un compte Supabase (gratuit sur [supabase.com](https://supabase.com))
- Git installé

---

## ⚡ Installation en 5 Minutes

### 1️⃣ Cloner le Projet

```bash
git clone <repository-url>
cd Invest
```

### 2️⃣ Installer les Dépendances

```bash
npm install
```

### 3️⃣ Configurer Supabase

#### a) Créer un Projet Supabase

1. Allez sur [app.supabase.com](https://app.supabase.com)
2. Cliquez sur "New Project"
3. Remplissez les informations et créez le projet

#### b) Récupérer les Clés

1. Dans votre projet Supabase, allez dans **Settings → API**
2. Copiez les valeurs suivantes :
   - **Project URL** (commence par `https://`)
   - **anon/public key** (clé publique)
   - **service_role key** (clé secrète - optionnelle)

#### c) Créer la Base de Données

1. Dans Supabase, allez dans **SQL Editor**
2. Ouvrez le fichier `database-schema.sql` de ce projet
3. Copiez tout le contenu et exécutez-le dans l'éditeur SQL
4. Vérifiez que les tables sont créées dans **Table Editor**

### 4️⃣ Configurer les Variables d'Environnement

```bash
# Copier le fichier d'exemple
cp .env.example .env.local
```

Ouvrez `.env.local` et remplissez vos valeurs :

```env
# Remplacez par vos vraies valeurs Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optionnel - pour les opérations admin
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5️⃣ Vérifier la Configuration

```bash
npm run check-env
```

Si tout est vert ✅, vous êtes prêt !

### 6️⃣ Démarrer l'Application

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur 🎉

---

## 🔧 Configuration Avancée

### Ajouter un Administrateur

1. Créez un compte utilisateur via l'interface
2. Dans Supabase, allez dans **Table Editor → admins**
3. Cliquez sur "Insert row"
4. Ajoutez l'email de l'utilisateur
5. L'utilisateur aura maintenant accès à `/admin`

### Personnaliser les Plans d'Investissement

Modifiez les plans dans la table `plans` via Supabase :

```sql
UPDATE plans 
SET min_amount = 200, daily_profit = 10 
WHERE name = 'Starter GNL';
```

---

## 🐛 Résolution de Problèmes

### Erreur : "Variable d'environnement manquante"

**Cause :** `.env.local` n'existe pas ou est mal configuré

**Solution :**
```bash
# Vérifier la configuration
npm run check-env

# Suivre les instructions affichées
```

### Erreur : "URL Supabase invalide"

**Cause :** L'URL Supabase contient des valeurs de test

**Solution :**
- Vérifiez que vous avez copié la vraie URL depuis Supabase
- Format attendu : `https://xxxxx.supabase.co`

### Erreur : "Cannot connect to Supabase"

**Cause :** Problème de connexion ou clés incorrectes

**Solution :**
1. Vérifiez votre connexion Internet
2. Testez l'URL dans votre navigateur
3. Régénérez les clés dans Supabase si nécessaire

### Erreur de Build : "Module not found"

**Cause :** Dépendances manquantes

**Solution :**
```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules package-lock.json
npm install
```

### Problème d'Authentification

**Cause :** RLS mal configuré ou trigger manquant

**Solution :**
```bash
# Réexécuter le schéma de base de données
# Dans Supabase SQL Editor, exécutez database-schema.sql
```

---

## 📚 Commandes Utiles

```bash
# Développement
npm run dev              # Démarrer en mode développement
npm run build            # Build pour production
npm run start            # Démarrer en production
npm run lint             # Vérifier le code

# Configuration
npm run check-env        # Vérifier les variables d'environnement

# Base de données
# Voir les fichiers .sql dans le dossier racine
```

---

## 🔒 Sécurité

⚠️ **Important :**

- Ne jamais commiter `.env.local` dans Git
- Gardez votre `service_role` key secrète
- Consultez [SECURITY.md](./SECURITY.md) pour plus de détails

---

## 📖 Documentation Complète

- [README.md](./README.md) - Documentation complète du projet
- [SECURITY.md](./SECURITY.md) - Guide de sécurité
- [Supabase Docs](https://supabase.com/docs) - Documentation Supabase
- [Next.js Docs](https://nextjs.org/docs) - Documentation Next.js

---

## 🆘 Besoin d'Aide ?

- 📧 Email : support@gazoducinvest.com
- 🐛 Issues : [GitHub Issues](https://github.com/...)
- 📚 Documentation : Consultez les fichiers `.md` du projet

---

## ✅ Checklist de Démarrage

- [ ] Node.js 18+ installé
- [ ] Projet cloné
- [ ] `npm install` exécuté
- [ ] Projet Supabase créé
- [ ] Base de données initialisée (database-schema.sql)
- [ ] `.env.local` créé et configuré
- [ ] `npm run check-env` passe ✅
- [ ] `npm run dev` fonctionne
- [ ] Compte utilisateur créé
- [ ] Administrateur ajouté (optionnel)

**Prêt à investir ! 🚀**
