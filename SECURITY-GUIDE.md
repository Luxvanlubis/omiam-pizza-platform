# 🔐 Guide de Sécurité - O'Miam Guingamp

## 📋 Vue d'ensemble

Ce guide présente les mesures de sécurité implémentées dans l'application O'Miam et les bonnes pratiques à suivre.

## 🛡️ Gestion des Secrets

### Variables d'environnement requises

#### Production (OBLIGATOIRES)
```bash
# Base de données
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Authentification
NEXTAUTH_SECRET=your-super-secret-key-32-chars-min
NEXTAUTH_URL=https://your-domain.com

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=your-email@domain.com
SMTP_PASS=your-secure-password

# Google Services
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your-verification-token
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

#### Développement (avec fallbacks sécurisés)
```bash
# Utiliser .env.example comme base
# Les valeurs de développement sont automatiquement générées
# JAMAIS de vraies clés en développement
```

## 🔒 Mesures de Sécurité Implémentées

### 1. Validation des Variables d'Environnement
- ✅ Vérification obligatoire en production
- ✅ Fallbacks sécurisés en développement
- ✅ Erreurs explicites si secrets manquants

### 2. Authentification
- ✅ NextAuth.js avec sessions sécurisées
- ✅ Cookies avec flags `secure` et `samesite=strict`
- ✅ Tokens JWT avec expiration
- ✅ Validation côté serveur

### 3. Paiements (Stripe)
- ✅ Clés publiques/privées séparées
- ✅ Webhooks avec signature vérifiée
- ✅ Mode test/production automatique
- ✅ Validation des montants côté serveur

### 4. Base de Données
- ✅ Connexions chiffrées (SSL)
- ✅ Requêtes préparées (Prisma)
- ✅ Validation des entrées
- ✅ Logs d'audit

### 5. Communication
- ✅ HTTPS obligatoire en production
- ✅ Headers de sécurité (CSP, HSTS, etc.)
- ✅ Validation des emails SMTP
- ✅ Rate limiting sur les APIs

## 🚨 Alertes de Sécurité

### Erreurs bloquantes en production
1. `NEXTAUTH_SECRET must be set in production`
2. `SMTP_PASS must be set in production`
3. `STRIPE_SECRET_KEY missing in production`

### Vérifications automatiques
- Headers de sécurité (CSP, HSTS, X-Frame-Options)
- Configuration Stripe valide
- Connexion base de données sécurisée
- Certificats SSL valides

## 📝 Checklist de Déploiement

### Avant le déploiement
- [ ] Toutes les variables d'environnement sont définies
- [ ] Aucun secret hardcodé dans le code
- [ ] Tests de sécurité passés
- [ ] Certificats SSL configurés
- [ ] Webhooks Stripe configurés
- [ ] Backup de la base de données

### Après le déploiement
- [ ] Test des paiements en mode live
- [ ] Vérification des emails
- [ ] Test de l'authentification
- [ ] Monitoring des erreurs actif
- [ ] Logs de sécurité configurés

## 🔧 Outils de Sécurité

### Tests automatisés
```bash
# Vérification des secrets
npm run security:check

# Audit des dépendances
npm audit

# Tests de sécurité
npm run test:security
```

### Monitoring
- Sentry pour le suivi d'erreurs
- Logs structurés avec Winston
- Alertes en temps réel
- Métriques de performance

## 📞 Contact Sécurité

En cas de problème de sécurité :
1. 🚨 **Urgence** : Désactiver immédiatement les services concernés
2. 📧 **Rapport** : Documenter l'incident
3. 🔧 **Correction** : Appliquer les correctifs
4. 📊 **Suivi** : Analyser et prévenir

---

**Dernière mise à jour** : Janvier 2025
**Version** : 1.0
**Responsable** : Équipe Développement O'Miam