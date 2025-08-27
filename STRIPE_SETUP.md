# Configuration Stripe pour O'Miam Pizza

## 🔐 Configuration PCI DSS Compliant

Ce guide vous aide à configurer Stripe de manière sécurisée pour respecter les standards PCI DSS.

## 📋 Prérequis

1. **Compte Stripe** : Créez un compte sur [stripe.com](https://stripe.com)
2. **Vérification d'identité** : Complétez la vérification de votre entreprise
3. **Compte bancaire** : Ajoutez vos informations bancaires pour les virements

## 🔑 Configuration des clés API

### 1. Récupérer les clés Stripe

1. Connectez-vous à votre [Dashboard Stripe](https://dashboard.stripe.com)
2. Allez dans **Développeurs** > **Clés API**
3. Récupérez :
   - **Clé publique** (commence par `pk_`)
   - **Clé secrète** (commence par `sk_`)

### 2. Configurer les webhooks

1. Allez dans **Développeurs** > **Webhooks**
2. Cliquez sur **Ajouter un endpoint**
3. URL de l'endpoint : `https://votre-domaine.com/api/webhooks/stripe`
4. Sélectionnez ces événements :
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `payment_intent.requires_action`
   - `charge.dispute.created`
5. Récupérez la **clé secrète du webhook** (commence par `whsec_`)

### 3. Mettre à jour le fichier .env.local

```bash
# Configuration Stripe (OBLIGATOIRE)
STRIPE_PUBLIC_KEY=pk_test_votre_cle_publique_ici
STRIPE_SECRET_KEY=sk_test_votre_cle_secrete_ici
STRIPE_WEBHOOK_SECRET=whsec_votre_webhook_secret_ici
```

⚠️ **IMPORTANT** : 
- Utilisez les clés de **test** (`pk_test_` et `sk_test_`) pour le développement
- Utilisez les clés de **production** (`pk_live_` et `sk_live_`) uniquement en production
- Ne commitez JAMAIS ces clés dans votre code source

## 🛡️ Sécurité PCI DSS

### Mesures implémentées :

✅ **Chiffrement des données** : Toutes les communications utilisent HTTPS/TLS
✅ **Pas de stockage de cartes** : Les données de carte ne transitent jamais par nos serveurs
✅ **Validation côté serveur** : Tous les montants sont recalculés côté serveur
✅ **Webhooks sécurisés** : Vérification des signatures pour tous les événements
✅ **Gestion d'erreurs** : Messages d'erreur sécurisés sans exposition de données
✅ **Logs sécurisés** : Aucune donnée sensible dans les logs

### Configuration recommandée :

1. **HTTPS obligatoire** : Activez HTTPS sur votre domaine
2. **Firewall** : Configurez un firewall pour protéger vos API
3. **Monitoring** : Surveillez les tentatives de paiement suspectes
4. **Backup** : Sauvegardez régulièrement vos données de commandes

## 🧪 Tests

### Cartes de test Stripe :

```
# Paiement réussi
4242 4242 4242 4242
Date d'expiration : n'importe quelle date future
CVC : n'importe quel code à 3 chiffres

# Carte refusée
4000 0000 0000 0002

# Authentification 3D Secure requise
4000 0025 0000 3155

# Fonds insuffisants
4000 0000 0000 9995
```

### Test des webhooks :

1. Utilisez [Stripe CLI](https://stripe.com/docs/stripe-cli) pour tester localement :
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

2. Ou utilisez [ngrok](https://ngrok.com) pour exposer votre serveur local :
```bash
ngrok http 3000
```

## 🚀 Déploiement en production

### Checklist avant mise en production :

- [ ] Remplacer les clés de test par les clés de production
- [ ] Configurer le webhook avec l'URL de production
- [ ] Activer HTTPS sur le domaine
- [ ] Tester tous les scénarios de paiement
- [ ] Vérifier la réception des webhooks
- [ ] Configurer les notifications d'erreur
- [ ] Mettre en place le monitoring

### Variables d'environnement de production :

```bash
# Production Stripe
STRIPE_PUBLIC_KEY=pk_live_votre_cle_publique_production
STRIPE_SECRET_KEY=sk_live_votre_cle_secrete_production
STRIPE_WEBHOOK_SECRET=whsec_votre_webhook_secret_production
NODE_ENV=production
```

## 📊 Monitoring et analytics

### Dashboard Stripe :
- Consultez les paiements en temps réel
- Analysez les taux de conversion
- Surveillez les litiges et remboursements
- Exportez les données pour la comptabilité

### Logs applicatifs :
- Surveillez les erreurs de paiement
- Trackez les tentatives de fraude
- Monitorer les performances des API

## 🆘 Support et dépannage

### Erreurs courantes :

1. **"No such payment_intent"** : Vérifiez que le PaymentIntent existe
2. **"Invalid API key"** : Vérifiez vos clés dans .env.local
3. **"Webhook signature verification failed"** : Vérifiez la clé secrète du webhook

### Ressources utiles :
- [Documentation Stripe](https://stripe.com/docs)
- [Guide PCI DSS](https://stripe.com/guides/pci-compliance)
- [Support Stripe](https://support.stripe.com)

## 📞 Contact

Pour toute question technique, consultez la documentation Stripe ou contactez leur support.

---

**⚠️ Rappel sécurité** : Ne partagez jamais vos clés secrètes et utilisez toujours HTTPS en production.