# 🔒 Guide de Sécurité - Gazoduc Invest

## 📋 Table des Matières

- [Variables d'Environnement](#variables-denvironnement)
- [Bonnes Pratiques](#bonnes-pratiques)
- [Gestion des Clés Supabase](#gestion-des-clés-supabase)
- [Sécurité Côté Client vs Serveur](#sécurité-côté-client-vs-serveur)
- [Checklist de Sécurité](#checklist-de-sécurité)

---

## 🔐 Variables d'Environnement

### Configuration Requise

Créez un fichier `.env.local` à la racine du projet (ne jamais commiter ce fichier) :

```bash
# Copiez .env.example vers .env.local
cp .env.example .env.local
```

### Variables Publiques (Côté Client)

Ces variables commencent par `NEXT_PUBLIC_` et sont **exposées au navigateur** :

```env
# ✅ Sûr à exposer - Clé publique Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ✅ Sûr à exposer - URL de l'application
NEXT_PUBLIC_APP_URL=https://gazoducinvest.com
```

**⚠️ Important :** Ces variables sont visibles dans le code JavaScript du navigateur. Ne jamais y mettre de secrets !

### Variables Privées (Côté Serveur Uniquement)

Ces variables ne doivent **JAMAIS** commencer par `NEXT_PUBLIC_` :

```env
# ❌ NE JAMAIS exposer - Clé service_role
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ❌ NE JAMAIS exposer - Clés API tierces
STRIPE_SECRET_KEY=sk_live_xxxxx
SENDGRID_API_KEY=SG.xxxxx
```

**🚨 Danger :** Ces clés donnent un accès complet à votre base de données et services. Gardez-les secrètes !

---

## ✅ Bonnes Pratiques

### 1. Validation Automatique

Notre système valide automatiquement les variables au démarrage :

```typescript
import { env } from '@/lib/env'

// ✅ Utiliser l'utilitaire centralisé
const url = env.supabaseUrl  // Validé automatiquement

// ❌ Ne pas accéder directement
const url = process.env.NEXT_PUBLIC_SUPABASE_URL  // Pas de validation
```

### 2. Différencier Client et Serveur

```typescript
// ✅ Côté CLIENT (composants, pages)
import { createClient } from '@/lib/supabase'
const supabase = createClient()

// ✅ Côté SERVEUR (API routes, Server Components)
import { createServerSupabaseClient } from '@/lib/supabase-server'
const supabase = createServerSupabaseClient()

// ✅ Opérations ADMIN (contourne RLS)
import { createAdminSupabaseClient } from '@/lib/supabase-server'
const supabase = createAdminSupabaseClient()
```

### 3. Gestion des Erreurs

```typescript
try {
  const supabase = createClient()
  // Vos opérations...
} catch (error) {
  // L'erreur contient des messages explicites
  console.error(error.message)
  // Afficher un message utilisateur approprié
}
```

---

## 🔑 Gestion des Clés Supabase

### Types de Clés

| Clé | Usage | Exposition | Pouvoir |
|-----|-------|------------|---------|
| **anon/public** | Client-side | ✅ Public | Limité par RLS |
| **service_role** | Server-side | ❌ Secret | Contourne RLS |

### Obtenir vos Clés

1. Allez sur [app.supabase.com](https://app.supabase.com)
2. Sélectionnez votre projet
3. Settings → API
4. Copiez les clés dans `.env.local`

### Rotation des Clés

Si une clé est compromise :

1. **Clé anon** : Régénérez-la dans Supabase Dashboard
2. **Clé service_role** : Régénérez immédiatement et mettez à jour `.env.local`
3. Redéployez l'application

---

## 🛡️ Sécurité Côté Client vs Serveur

### Côté Client (Navigateur)

```typescript
// ✅ Opérations autorisées
- Lecture de données publiques
- Lecture de données utilisateur (via RLS)
- Insertion/modification de données utilisateur (via RLS)
- Authentification (login, signup)

// ❌ Opérations interdites
- Accès aux données d'autres utilisateurs
- Modification des tables admin
- Contournement des politiques RLS
```

### Côté Serveur (API Routes)

```typescript
// ✅ Opérations autorisées
- Toutes les opérations client
- Opérations admin (avec service_role)
- Validation côté serveur
- Opérations sensibles (paiements, etc.)

// ⚠️ Toujours valider les entrées utilisateur
import { z } from 'zod'

const schema = z.object({
  amount: z.number().positive(),
  planId: z.number()
})

const validated = schema.parse(body)
```

---

## 📝 Checklist de Sécurité

### Configuration Initiale

- [ ] `.env.local` créé et configuré
- [ ] `.env.local` ajouté à `.gitignore`
- [ ] Clés Supabase valides (pas de valeurs de test)
- [ ] Variables validées au démarrage

### Développement

- [ ] Utiliser `env` pour accéder aux variables
- [ ] Différencier client/serveur pour Supabase
- [ ] Valider toutes les entrées utilisateur
- [ ] Ne jamais logger les secrets

### Avant le Déploiement

- [ ] Vérifier que `.env.local` n'est pas commité
- [ ] Configurer les variables d'environnement sur Vercel/Netlify
- [ ] Tester avec les vraies clés de production
- [ ] Activer HTTPS uniquement
- [ ] Configurer les CORS appropriés

### Production

- [ ] Row Level Security (RLS) activée sur toutes les tables
- [ ] Politiques RLS testées et validées
- [ ] Rate limiting configuré
- [ ] Monitoring des erreurs (Sentry)
- [ ] Logs d'audit pour actions sensibles

---

## 🚨 En Cas de Fuite de Clés

### Si la clé `anon` est exposée

**Risque :** Faible (c'est une clé publique)
**Action :** Aucune action urgente, mais vous pouvez la régénérer par précaution

### Si la clé `service_role` est exposée

**Risque :** 🔴 CRITIQUE - Accès complet à la base de données

**Actions immédiates :**

1. **Révoquer la clé** dans Supabase Dashboard
2. **Générer une nouvelle clé** service_role
3. **Mettre à jour** `.env.local` et variables de production
4. **Redéployer** immédiatement l'application
5. **Auditer** les logs pour détecter des accès suspects
6. **Changer les mots de passe** des comptes sensibles si nécessaire

---

## 📚 Ressources

- [Documentation Supabase Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

## 🤝 Support

Pour toute question de sécurité :
- Email : security@gazoducinvest.com
- Ne jamais partager vos clés dans les issues GitHub
