# 🔑 Configuration des Clés Stripe - Guide Complet

## 📋 Vue d'ensemble

Ce guide vous explique comment configurer correctement les clés Stripe pour votre application OMIAM Pizza.

## 🚀 Étapes de Configuration

### 1. Créer un Compte Stripe

1. Rendez-vous sur [stripe.com](https://stripe.com)
2. Créez un compte ou connectez-vous
3. Activez votre compte avec les informations de votre entreprise

### 2. Récupérer les Clés de Test

1. Dans le dashboard Stripe, allez dans **Développeurs > Clés API**
2. Assurez-vous d'être en **Mode Test** (toggle en haut à droite)
3. Copiez :
   - **Clé publiable** (commence par `pk_test_`)
   - **Clé secrète** (commence par `sk_test_`)

### 3. Configurer les Webhooks

1. Allez dans **Développeurs > Webhooks**
2. Cliquez sur **Ajouter un endpoint**
3. URL de l'endpoint : `https://votre-domaine.com/api/webhooks/stripe`
4. Sélectionnez les événements :
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.created`
   - `customer.updated`
5. Copiez le **Secret de signature** (commence par `whsec_`)

### 4. Mettre à Jour .env.local

```bash
# Configuration Stripe (Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_VOTRE_VRAIE_CLE_PUBLIQUE
STRIPE_SECRET_KEY=sk_test_VOTRE_VRAIE_CLE_SECRETE
STRIPE_WEBHOOK_SECRET=whsec_VOTRE_VRAIE_CLE_WEBHOOK
```

### 5. Tester la Configuration

```bash
# Lancer le script de validation
node scripts/validate-stripe.js

# Démarrer l'application
npm run dev

# Tester l'interface admin
# http://localhost:3000/admin/stripe-config
```

## 🧪 Tests avec Cartes de Test

### Cartes de Test Stripe

| Numéro | Description | Résultat |
|--------|-------------|----------|
| `4242424242424242` | Visa | Succès |
| `4000000000000002` | Visa | Décliné |
| `4000000000009995` | Visa | Fonds insuffisants |
| `4000000000000069` | Visa | Carte expirée |

### Informations de Test

- **Date d'expiration** : N'importe quelle date future
- **CVC** : N'importe quel code à 3 chiffres
- **Code postal** : N'importe quel code postal valide

## 🔒 Sécurité

### ✅ Bonnes Pratiques

- ✅ Utilisez toujours les variables d'environnement
- ✅ Ne commitez jamais les clés dans Git
- ✅ Utilisez HTTPS en production
- ✅ Validez les webhooks avec la signature
- ✅ Loggez les erreurs de paiement

### ❌ À Éviter

- ❌ Clés hardcodées dans le code
- ❌ Clés de production en développement
- ❌ Partage des clés secrètes
- ❌ Webhooks sans validation de signature

## 🚀 Passage en Production

### 1. Activer le Compte Stripe

1. Complétez les informations de votre entreprise
2. Fournissez les documents requis
3. Activez les paiements en direct

### 2. Récupérer les Clés de Production

1. Basculez en **Mode Live** dans le dashboard
2. Récupérez les nouvelles clés (commencent par `pk_live_` et `sk_live_`)
3. Configurez les webhooks pour la production

### 3. Variables d'Environnement Production

```bash
# Configuration Stripe (Production)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_VOTRE_CLE_PUBLIQUE_LIVE
STRIPE_SECRET_KEY=sk_live_VOTRE_CLE_SECRETE_LIVE
STRIPE_WEBHOOK_SECRET=whsec_VOTRE_CLE_WEBHOOK_LIVE
NODE_ENV=production
```

## 🔧 Dépannage

### Erreur 401 - Unauthorized

- Vérifiez que les clés sont correctes
- Assurez-vous d'utiliser les bonnes clés (test/live)
- Vérifiez les variables d'environnement

### Webhook Non Reçu

- Vérifiez l'URL de l'endpoint
- Testez avec ngrok en développement
- Vérifiez les logs Stripe

### Paiement Échoué

- Utilisez les cartes de test appropriées
- Vérifiez les montants (minimum 0.50€)
- Consultez les logs de l'application

## 📞 Support

- **Documentation Stripe** : [docs.stripe.com](https://docs.stripe.com)
- **Support Stripe** : [support.stripe.com](https://support.stripe.com)
- **Guide PCI DSS** : Voir `PCI_DSS_SECURITY.md`

---

*Dernière mise à jour : Janvier 2025*