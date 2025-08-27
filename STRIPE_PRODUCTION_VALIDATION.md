# 🚀 Guide de Validation Stripe Production - OMIAM Pizza

## 📋 Checklist de Validation Production

### ✅ 1. Configuration des Clés API

#### Étapes de Configuration
1. **Créer un compte Stripe** sur [stripe.com](https://stripe.com)
2. **Activer le compte** et compléter la vérification d'identité
3. **Récupérer les clés de production** dans Développeurs > Clés API
4. **Mettre à jour `.env.local`** :

```bash
# Clés de production Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_VOTRE_CLE_PUBLIQUE
STRIPE_SECRET_KEY=sk_live_VOTRE_CLE_SECRETE
STRIPE_WEBHOOK_SECRET=whsec_VOTRE_SECRET_WEBHOOK
```

#### ⚠️ Vérifications de Sécurité
- [ ] Clés stockées uniquement dans variables d'environnement
- [ ] Aucune clé hardcodée dans le code source
- [ ] Clés de test supprimées en production
- [ ] Variables d'environnement Vercel configurées

### ✅ 2. Configuration des Webhooks

#### Création du Webhook
1. **Aller dans Stripe Dashboard** > Développeurs > Webhooks
2. **Créer un endpoint** : `https://votre-domaine.com/api/webhooks/stripe`
3. **Sélectionner les événements** :
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `payment_intent.requires_action`
   - `charge.dispute.created`

#### Test des Webhooks
```bash
# Tester localement avec Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

#### ✅ Validation Webhook
- [ ] Endpoint webhook configuré
- [ ] Secret webhook récupéré et configuré
- [ ] Signature webhook validée dans le code
- [ ] Gestion d'erreurs implémentée
- [ ] Logs des événements activés

### ✅ 3. Tests de Paiement

#### Cartes de Test Stripe
```javascript
// Cartes de test recommandées
const testCards = {
  success: '4242424242424242',
  declined: '4000000000000002',
  requiresAuth: '4000002500003155',
  insufficientFunds: '4000000000009995'
};
```

#### Tests à Effectuer
- [ ] Paiement réussi avec carte valide
- [ ] Paiement refusé avec carte invalide
- [ ] Authentification 3D Secure
- [ ] Gestion des erreurs de paiement
- [ ] Webhooks reçus et traités

### ✅ 4. Conformité PCI DSS

#### Mesures Implémentées
- [x] **Chiffrement HTTPS** : Toutes les communications sécurisées
- [x] **Pas de stockage de données de carte** : Stripe Elements utilisé
- [x] **Validation côté serveur** : Montants et métadonnées vérifiés
- [x] **Gestion des erreurs sécurisée** : Pas d'exposition d'informations sensibles
- [x] **Logs sécurisés** : Aucune donnée de carte dans les logs

#### Validation PCI DSS
- [ ] Certificat SSL/TLS valide et configuré
- [ ] Stripe Elements intégré (pas de manipulation directe des cartes)
- [ ] Validation des montants côté serveur
- [ ] Gestion sécurisée des erreurs
- [ ] Audit des logs de sécurité

### ✅ 5. Tests de Production

#### Interface de Test Admin
Accéder à `/admin/stripe-config` pour :
- ✅ Vérifier la configuration
- 🧪 Tester les API Stripe
- 📊 Voir les diagnostics détaillés

#### Tests Automatisés
```bash
# Lancer les tests Stripe
npm run test:stripe

# Vérifier la configuration
npm run stripe:validate
```

#### Checklist Tests Production
- [ ] Health check API Stripe réussi
- [ ] Création PaymentIntent fonctionnelle
- [ ] Création Customer fonctionnelle
- [ ] Webhooks reçus et traités
- [ ] Interface de paiement fonctionnelle
- [ ] Gestion d'erreurs testée

### ✅ 6. Monitoring et Alertes

#### Logs à Surveiller
- Erreurs de paiement
- Échecs de webhook
- Tentatives de fraude
- Performances API

#### Alertes Recommandées
- [ ] Taux d'échec de paiement > 5%
- [ ] Webhooks non reçus
- [ ] Erreurs API Stripe
- [ ] Tentatives de paiement suspectes

### ✅ 7. Déploiement Production

#### Variables d'Environnement Vercel
```bash
# Configuration production
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NODE_ENV=production
```

#### Checklist Déploiement
- [ ] Variables d'environnement configurées
- [ ] Domaine webhook mis à jour
- [ ] Tests de bout en bout validés
- [ ] Monitoring activé
- [ ] Équipe formée sur les procédures

## 🔧 Commandes Utiles

```bash
# Valider la configuration Stripe
npm run stripe:validate

# Tester les webhooks localement
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Voir les logs Stripe
stripe logs tail

# Tester un paiement
curl -X POST https://votre-domaine.com/api/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{"amount": 10.50, "currency": "eur"}'
```

## 📞 Support et Documentation

- 📖 **Documentation Stripe** : [stripe.com/docs](https://stripe.com/docs)
- 🧪 **Cartes de Test** : [stripe.com/docs/testing](https://stripe.com/docs/testing)
- 🔧 **Stripe CLI** : [stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)
- 📞 **Support Stripe** : Disponible dans le dashboard

## ⚠️ Points d'Attention

1. **Jamais de clés en dur** dans le code source
2. **Toujours valider côté serveur** les montants et métadonnées
3. **Tester les webhooks** avant la mise en production
4. **Surveiller les logs** pour détecter les problèmes
5. **Former l'équipe** sur les procédures de paiement

---

**✅ Validation complète = Production ready !**