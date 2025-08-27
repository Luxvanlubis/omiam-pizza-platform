# 🚀 Guide de Déploiement Production - OMIAM Pizza

## 📋 Prérequis de Déploiement

### ✅ Checklist Pré-Déploiement

- [ ] **Base de données** : Supabase configuré et testé
- [ ] **Authentification** : NextAuth + Supabase Auth fonctionnel
- [ ] **Paiements** : Stripe configuré avec clés de test
- [ ] **Commandes** : Système de commandes testé
- [ ] **Build** : Application compile sans erreurs
- [ ] **Tests** : Tests unitaires et e2e passent
- [ ] **Variables d'environnement** : Toutes les variables documentées

## 🌐 Déploiement Vercel

### 1. Préparation du Projet

```bash
# Vérifier que tout fonctionne localement
npm run build
npm run test
npm run stripe:validate

# Nettoyer le cache
npm run lint
```

### 2. Configuration Vercel

#### A. Connexion du Repository

1. Connectez-vous à [vercel.com](https://vercel.com)
2. Cliquez sur "New Project"
3. Importez votre repository GitHub
4. Sélectionnez le framework : **Next.js**

#### B. Variables d'Environnement Production

Dans **Settings > Environment Variables**, ajoutez :

```bash
# Supabase Production
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres

# NextAuth Production
NEXTAUTH_URL=https://votre-domaine.vercel.app
NEXTAUTH_SECRET=votre-secret-production-securise

# Stripe Production
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email Production (optionnel)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-app

# Analytics (optionnel)
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=votre-token

# Configuration Production
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://votre-domaine.vercel.app
```

### 3. Configuration du Build

#### vercel.json (optionnel)

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["cdg1"],
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ]
}
```

## 🗄️ Configuration Supabase Production

### 1. Projet de Production

1. Créez un **nouveau projet Supabase** pour la production
2. Configurez les **politiques RLS** identiques au développement
3. Importez le **schéma de base de données**
4. Configurez l'**authentification**

### 2. Migration des Données

```sql
-- Exporter depuis le projet de développement
pg_dump "postgresql://postgres:password@db.xxx.supabase.co:5432/postgres" > backup.sql

-- Importer vers la production
psql "postgresql://postgres:password@db.yyy.supabase.co:5432/postgres" < backup.sql
```

### 3. Configuration Auth

Dans **Authentication > Settings** :

- **Site URL** : `https://votre-domaine.vercel.app`
- **Redirect URLs** : 
  - `https://votre-domaine.vercel.app/auth/callback`
  - `https://votre-domaine.vercel.app/api/auth/callback/supabase`

## 💳 Configuration Stripe Production

### 1. Activation du Mode Live

1. Dans le Dashboard Stripe, **désactivez le mode Test**
2. Complétez les **informations de votre entreprise**
3. Activez votre **compte marchand**

### 2. Récupération des Clés Live

1. Allez dans **Développeurs > Clés API**
2. Copiez les clés de production :
   - `pk_live_...` (clé publique)
   - `sk_live_...` (clé secrète)

### 3. Configuration des Webhooks

1. **Développeurs > Webhooks > Ajouter un endpoint**
2. **URL** : `https://votre-domaine.vercel.app/api/webhooks/stripe`
3. **Événements** :
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
   - `invoice.payment_succeeded`

## 🔒 Sécurité Production

### 1. Secrets et Clés

```bash
# Générer un secret NextAuth sécurisé
openssl rand -base64 32

# Vérifier que toutes les clés sont en mode production
npm run stripe:validate
```

### 2. Headers de Sécurité

Dans `next.config.js` :

```javascript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          }
        ]
      }
    ];
  }
};
```

## 📊 Monitoring et Analytics

### 1. Vercel Analytics

```bash
npm install @vercel/analytics
```

```typescript
// src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 2. Google Analytics (optionnel)

Ajoutez votre ID Google Analytics dans les variables d'environnement.

### 3. Monitoring des Erreurs

Considérez l'intégration de :
- **Sentry** pour le monitoring d'erreurs
- **LogRocket** pour les sessions utilisateur
- **Vercel Speed Insights** pour les performances

## 🧪 Tests Post-Déploiement

### Checklist de Validation

- [ ] **Page d'accueil** se charge correctement
- [ ] **Authentification** fonctionne (inscription/connexion)
- [ ] **Menu** s'affiche avec les produits
- [ ] **Panier** permet d'ajouter des articles
- [ ] **Commande** peut être passée
- [ ] **Paiement** fonctionne avec une vraie carte
- [ ] **Emails** de confirmation sont envoyés
- [ ] **Responsive** fonctionne sur mobile
- [ ] **Performance** : Score Lighthouse > 90

### Tests de Paiement

⚠️ **Attention** : En production, utilisez de **vraies cartes** avec de **petits montants** pour tester.

### Monitoring des Logs

```bash
# Vercel CLI pour voir les logs
npx vercel logs votre-domaine.vercel.app

# Supabase logs
# Consultez les logs dans le dashboard Supabase

# Stripe logs
# Consultez les événements dans le dashboard Stripe
```

## 🔄 Processus de Mise à Jour

### 1. Déploiement Continu

Vercel déploie automatiquement à chaque push sur la branche `main`.

### 2. Environnements

- **Production** : branche `main`
- **Staging** : branche `develop` (optionnel)
- **Preview** : toutes les autres branches

### 3. Rollback

En cas de problème :

1. Dans Vercel Dashboard > Deployments
2. Cliquez sur un déploiement précédent
3. Cliquez sur "Promote to Production"

## 📞 Support et Maintenance

### Contacts Importants

- **Vercel Support** : [vercel.com/support](https://vercel.com/support)
- **Supabase Support** : [supabase.com/support](https://supabase.com/support)
- **Stripe Support** : [stripe.com/support](https://stripe.com/support)

### Maintenance Régulière

- **Hebdomadaire** : Vérifier les logs d'erreur
- **Mensuelle** : Mettre à jour les dépendances
- **Trimestrielle** : Audit de sécurité
- **Annuelle** : Renouvellement des certificats/clés

---

## 🎉 Félicitations !

Votre application OMIAM Pizza est maintenant prête pour la production ! 🍕

**Prochaines étapes** :
1. Configurez votre nom de domaine personnalisé
2. Activez les sauvegardes automatiques
3. Mettez en place un monitoring proactif
4. Planifiez les mises à jour de sécurité

**Besoin d'aide ?** Consultez la documentation ou contactez le support technique.