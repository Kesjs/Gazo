# 🚀 Gazoduc Invest - Plateforme d'Investissement GNL

[![Next.js](https://img.shields.io/badge/Next.js-14.0-black)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.0-green)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.0-blue)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

Une plateforme moderne d'investissement spécialisée dans le Gaz Naturel Liquéfié (GNL), offrant une expérience utilisateur fluide avec des rendements transparents et un suivi en temps réel.

## 📋 Table des Matières

- [✨ Fonctionnalités](#-fonctionnalités)
- [🏗️ Architecture](#️-architecture)
- [🚀 Processus d'Utilisation](#-processus-dutilisation)
- [🛠️ Installation & Configuration](#️-installation--configuration)
- [📊 Schéma Base de Données](#-schéma-base-de-données)
- [🔐 Sécurité](#-sécurité)
- [📱 API Endpoints](#-api-endpoints)
- [🎨 Interface Utilisateur](#-interface-utilisateur)
- [🔧 Technologies Utilisées](#-technologies-utilisées)

## 🎯 Fonctionnalités

### 👤 Pour les Utilisateurs
- **Inscription/Connexion** sécurisée avec Supabase Auth
- **Dashboard personnalisé** avec métriques en temps réel
- **Onboarding intelligent** avec modales guidées (7 étapes)
- **Plans d'investissement** multiples (Starter, Premium, Elite)
- **Suivi des souscriptions** avec dates et projections
- **Historique des transactions** complet
- **Calculs automatiques** de ROI et gains estimés
- **Interface responsive** et multilingue (FR/EN)

### 👑 Pour les Administrateurs
- **Dashboard d'administration** protégé
- **Gestion des utilisateurs** et statistiques globales
- **Supervision des transactions** et investissements
- **Accès sécurisé** avec vérification d'autorisation

### 🔒 Sécurité
- **Row Level Security (RLS)** activée sur toutes les tables
- **Middleware de protection** des routes sensibles
- **Validation côté client** et serveur
- **Gestion d'erreurs** complète avec messages français
- **Protection CSRF** et sessions sécurisées

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Routes    │    │   Supabase DB   │
│   (Next.js)     │◄──►│   (Next.js)     │◄──►│   (PostgreSQL)  │
│                 │    │                 │    │                 │
│ • Dashboard UI  │    │ • /api/subscribe│    │ • profiles      │
│ • Auth Forms    │    │ • /api/admin/*  │    │ • subscriptions │
│ • Admin Panel   │    │ • /api/deposit  │    │ • transactions  │
│ • Error Handling│    │ • /api/withdraw │    │ • admins        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Composants Clés
- **Frontend**: Next.js 14 (App Router) + TypeScript + TailwindCSS
- **Backend**: API Routes Next.js + Supabase Auth
- **Base de données**: PostgreSQL avec Supabase
- **Authentification**: Supabase Auth avec RLS
- **UI/UX**: Glassmorphism design + animations fluides

## 🚀 Processus d'Utilisation

### 📝 1. Inscription & Connexion

#### Création de Compte
```
1. Accès www.gazoducinvest.com
2. Clic "S'inscrire"
3. Formulaire: Nom complet, Email, Mot de passe (≥6 caractères)
4. Validation automatique + email de confirmation
5. Redirection vers connexion
```

#### Première Connexion
```
1. Saisie email + mot de passe
2. Vérification Supabase Auth
3. Redirection automatique vers /dashboard
```

### 📊 2. Découverte du Dashboard

#### Métriques Principales
- **Solde disponible**: Montant pour investir/retrait
- **Souscriptions actives**: Nombre de plans en cours
- **Performance totale**: Gains cumulés

#### Sections Disponibles
- **Mes Souscriptions**: Liste détaillée avec dates et statuts
- **Historique Transactions**: 10 dernières opérations
- **Plans Disponibles**: 4 options avec ROI calculé

### 💰 3. Premier Investissement

#### Exploration des Plans
```typescript
Plans disponibles:
├── Starter GNL : 100$ min, 30j, 5$/j, ROI: 50%
├── Premium GNL : 500$ min, 60j, 10$/j, ROI: 120%
├── Elite GNL : 1000$ min, 90j, 15$/j, ROI: 135%
└── (Calcul automatique du retour total)
```

#### Processus de Souscription
```
1. Sélection du plan souhaité
2. Clic "Investir [montant]"
3. Confirmation → "Souscription réussie"
4. Mise à jour automatique du dashboard
```

### ⏰ 4. Gestion Quotidienne

#### Gains Automatiques
```
Chaque jour le système:
├── Crédite +profit/jour sur le solde
├── Enregistre transaction "earnings"
├── Met à jour métriques temps réel
└── Calcule performance totale
```

#### Suivi des Investissements
```
Utilisateur consulte régulièrement:
├── Évolution du solde disponible
├── Progression des souscriptions actives
├── Historique des gains quotidiens
└── Calcul ROI réel vs estimé
```

### 💸 5. Gestion des Retraits

#### Processus de Retrait (À Implémenter)
```
1. Clic "Retirer des fonds"
2. Saisie du montant souhaité
3. Validation des fonds disponibles
4. Confirmation sécurisée
5. Transaction débit "withdrawal"
```

### 👑 6. Fonctionnalités Admin

#### Accès Administrateur
```
1. Connexion via /admin/login
2. Vérification email dans table admins
3. Accès dashboard protégé
4. Gestion globale plateforme
```

## 🛠️ Installation & Configuration

### Prérequis
- Node.js 18+
- npm ou yarn
- Compte Supabase

### Installation
```bash
# Cloner le repository
git clone <repository-url>
cd gazoduc-invest

# Installer les dépendances
npm install

# Configuration environnement
cp .env.local.example .env.local
```

### Configuration Supabase
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Base de Données

Le dossier `database/` contient tous les scripts SQL organisés :

```bash
# 1. Schéma principal (OBLIGATOIRE)
database/01-schema.sql

# 2. Index de performance (RECOMMANDÉ)
database/03-indexes.sql

# 3. Migrations (OPTIONNEL - fonctionnalités avancées)
database/04-migrations.sql
```

📖 **Documentation complète** : Voir `database/README.md`

### Lancement
```bash
# Développement
npm run dev

# Production
npm run build
npm start
```

## 📊 Schéma Base de Données

### Tables Principales

#### `profiles`
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `subscriptions`
```sql
CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  plan_id INTEGER NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  start_date TIMESTAMP DEFAULT NOW(),
  status TEXT DEFAULT 'active'
);
```

#### `transactions`
```sql
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  type TEXT CHECK (type IN ('deposit', 'subscription', 'earnings', 'withdrawal')),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `admins`
```sql
CREATE TABLE admins (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Politiques RLS
- **Profiles**: Utilisateur ne voit que son profil
- **Subscriptions**: Utilisateur ne voit que ses souscriptions
- **Transactions**: Utilisateur ne voit que ses transactions
- **Admins**: Accessible uniquement aux administrateurs

## 🔐 Sécurité

### Authentification
- **Supabase Auth** avec JWT tokens
- **Sessions persistantes** et sécurisées
- **Protection middleware** pour routes sensibles

### Autorisation
- **Vérification admin** via API dédiée `/api/admin/check`
- **Row Level Security** activée sur toutes les tables
- **Middleware Next.js** pour protection des routes

### Validation
- **Côté client**: Regex email, longueur mot de passe
- **Côté serveur**: Vérification données avant insertion
- **Gestion d'erreurs** complète avec logs

## 📱 API Endpoints

### Utilisateur
```typescript
POST /api/subscribe
// Créer une nouvelle souscription
// Body: { planId: number, amount: number }

POST /api/deposit
// Effectuer un dépôt (à implémenter)
// Body: { amount: number }

POST /api/withdraw
// Effectuer un retrait (à implémenter)
// Body: { amount: number }
```

### Administrateur
```typescript
GET /api/admin/check
// Vérifier les droits administrateur
// Return: { isAdmin: boolean, message?: string }
```

### Middleware
```typescript
// Protection automatique des routes
/dashboard/* → Nécessite session utilisateur
/admin/* → Nécessite session + droits admin
```

## 🎨 Interface Utilisateur

### Design System
- **Glassmorphism**: Effets de verre avec backdrop-blur
- **Palette**: Bleu/Green pour l'énergie GNL
- **Animations**: Transitions fluides et hover effects
- **Responsive**: Mobile-first avec breakpoints Tailwind

### Composants Clés
- **Auth Forms**: Inscription/connexion avec validation
- **Dashboard Cards**: Métriques avec icônes et descriptions
- **Subscription List**: Détails complets avec statuts
- **Transaction History**: Timeline avec icônes colorées
- **Investment Plans**: Cards avec ROI et avantages

### États d'Interface
- **Loading**: Spinners et messages de chargement
- **Error**: Messages explicatifs avec boutons retry
- **Empty States**: Illustrations et conseils utilisateur
- **Success**: Confirmations avec animations

## 🎯 Système d'Onboarding Intelligent

### Vue d'Ensemble
Le système d'onboarding guide automatiquement les nouveaux utilisateurs à travers les fonctionnalités clés du dashboard avec des **modales flottantes insistantes**.

### Fonctionnalités Clés
- **Onboarding adaptatif** : 5 étapes pour nouveaux utilisateurs, 6 étapes pour investisseurs actifs
- **Modales flottantes** avec positionnement dynamique
- **Surbrillance des éléments** ciblés avec animation pulse
- **Progression sauvegardée** dans localStorage
- **Interface responsive** adaptée à tous les écrans

### Étapes d'Onboarding

#### Pour Nouveaux Utilisateurs (5 étapes)
1. **Bienvenue Dashboard** → Présentation générale
2. **Solde Disponible** → Explication du solde
3. **Souscriptions Actives** → Nombre de plans actifs
4. **Performance Totale** → Gains cumulés
5. **Plans d'Investissement** → Découverte des opportunités

#### Pour Utilisateurs Existants (6 étapes)
1. **Bienvenue Dashboard** → Présentation générale
2. **Solde Disponible** → Explication du solde
3. **Souscriptions Actives** → Nombre de plans actifs
4. **Performance Totale** → Gains cumulés
5. **Détails Souscriptions** → Liste et projections
6. **Historique Transactions** → Suivi financier

### Caractéristiques Techniques
```typescript
// Hook adaptatif selon le contexte utilisateur
const onboarding = useDashboardOnboarding(hasSubscriptions)

// Nouveaux utilisateurs : guide vers les plans d'investissement
// Utilisateurs actifs : guide à travers le dashboard complet
```

### Animations et UX
- **Transitions fluides** : Scale, opacity, translate
- **Surbrillance pulsée** : Animation CSS personnalisée
- **Barre de progression** : Indicateur visuel animé
- **Boutons interactifs** : Hover effects et scaling
- **Overlay bloquant** : Focus sur l'onboarding

### Gestion de l'État
- **Première visite** : Déclenchement automatique après 1.5s
- **Progression persistante** : Sauvegarde localStorage
- **Skip possible** : Bouton "Passer l'onboarding"
- **Reset développement** : Bouton de test en mode dev

---

## 🔧 Technologies Utilisées

### Frontend
- **Next.js 14**: Framework React avec App Router
- **TypeScript**: Typage statique complet
- **TailwindCSS**: Framework CSS utilitaire
- **React Hooks**: Gestion d'état moderne

### Backend
- **Next.js API Routes**: API RESTful
- **Supabase**: Base de données + authentification
- **PostgreSQL**: Base relationnelle
- **Row Level Security**: Sécurité au niveau ligne

### Outils de Développement
- **ESLint**: Linting du code
- **Prettier**: Formatage automatique
- **Vercel**: Déploiement et hosting
- **Git**: Contrôle de version

## 🚀 Déploiement

### Sur Vercel
```bash
# Build et déploiement automatique
npm run build
# Vercel détecte automatiquement le projet Next.js
```

### Variables d'Environnement
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Domaines
- **Frontend**: www.gazoducinvest.com
- **Admin**: www.gazoducinvest.com/admin
- **API**: www.gazoducinvest.com/api/*

## 📈 Performance & Monitoring

### Optimisations
- **Static Generation**: Pages statiques pré-buildées
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Import dynamique des composants
- **Caching**: Headers appropriés et CDN

### Métriques Clés
- **Temps de chargement**: <3 secondes
- **Core Web Vitals**: Scores optimaux
- **SEO**: Meta tags et structured data
- **Accessibilité**: Conformité WCAG 2.1

## 🔮 Évolutions Futures

### Fonctionnalités à Implémenter
- [ ] **Système de retrait** avec validation KYC
- [ ] **Notifications push** pour gains quotidiens
- [ ] **API mobile** pour applications natives
- [ ] **Multi-devises** (EUR, USD, crypto)
- [ ] **Référencement** avec commissions
- [ ] **Analytics avancés** pour utilisateurs

### Améliorations Techniques
- [ ] **Cache Redis** pour performances
- [ ] **WebSockets** pour temps réel
- [ ] **Tests automatisés** complets
- [ ] **Monitoring Sentry** pour erreurs
- [ ] **CI/CD** pipeline complet

---

## 📞 Support & Contact

Pour toute question ou support technique :
- **Email**: support@gazoducinvest.com
- **Documentation**: [docs.gazoducinvest.com](https://docs.gazoducinvest.com)
- **GitHub Issues**: Pour signaler des bugs

---

**Gazoduc Invest** - Investissez dans l'avenir énergétique avec transparence et sécurité. 🌟⚡💚
