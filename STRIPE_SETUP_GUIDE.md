# 🔧 Guide de Configuration Stripe - OMIAM Pizza

## 📋 Prérequis

1. **Compte Stripe** : Créez un compte sur [stripe.com](https://stripe.com)
2. **Clés API** : Récupérez vos clés de test et de production
3. **Webhook** : Configurez l'endpoint webhook pour les notifications

## 🔑 Étape 1 : Récupération des Clés API

### Clés de Test (Développement)
1. Connectez-vous à votre [Dashboard Stripe](https://dashboard.stripe.com)
2. Activez le **Mode Test** (toggle en haut à droite)
3. Allez dans **Développeurs > Clés API**
4. Copiez :
   - **Clé publique** : `pk_test_...`
   - **Clé secrète** : `sk_test_...`

### Clés de Production (Plus tard)
1. Désactivez le **Mode Test**
2. Récupérez les clés de production :
   - **Clé publique** : `pk_live_...`
   - **Clé secrète** : `sk_live_...`

## 🔧 Étape 2 : Configuration des Variables d'Environnement

### Fichier `.env.local`
Mettez à jour votre fichier `.env.local` avec vos clés Stripe :

```bash
# Configuration Stripe (Mode Test)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_VOTRE_CLE_PUBLIQUE_ICI
STRIPE_SECRET_KEY=sk_test_VOTRE_CLE_SECRETE_ICI
STRIPE_WEBHOOK_SECRET=whsec_VOTRE_SECRET_WEBHOOK_ICI
```

⚠️ **Important** :
- La clé publique (`NEXT_PUBLIC_*`) est visible côté client
- La clé secrète ne doit JAMAIS être exposée côté client
- Utilisez toujours les clés de test en développement

## 🔗 Étape 3 : Configuration des Webhooks

### Création du Webhook
1. Dans le Dashboard Stripe, allez dans **Développeurs > Webhooks**
2. Cliquez sur **Ajouter un endpoint**
3. URL de l'endpoint : `https://votre-domaine.com/api/webhooks/stripe`
   - En développement : `http://localhost:3001/api/webhooks/stripe`
4. Sélectionnez les événements à écouter :
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.created`

### Récupération du Secret Webhook
1. Après création, cliquez sur votre webhook
2. Dans la section **Signing secret**, cliquez sur **Révéler**
3. Copiez le secret (commence par `whsec_`)
4. Ajoutez-le à votre `.env.local`

## 🧪 Étape 4 : Test de la Configuration

### Vérification Automatique
L'application inclut un système de vérification automatique :
- Mode mock si les clés ne sont pas configurées
- Logs de débogage dans la console
- Health check disponible via l'API

### Test Manuel
1. Démarrez l'application : `npm run dev`
2. Ajoutez des articles au panier
3. Procédez au checkout
4. Utilisez les [cartes de test Stripe](https://stripe.com/docs/testing#cards) :
   - **Succès** : `4242 4242 4242 4242`
   - **Échec** : `4000 0000 0000 0002`
   - **3D Secure** : `4000 0025 0000 3155`

### Cartes de Test Recommandées
```
# Paiement réussi
4242 4242 4242 4242
Expiration : 12/34
CVC : 123

# Carte refusée
4000 0000 0000 0002
Expiration : 12/34
CVC : 123

# Fonds insuffisants
4000 0000 0000 9995
Expiration : 12/34
CVC : 123
```

## 🔒 Étape 5 : Sécurité et Bonnes Pratiques

### Variables d'Environnement
- ✅ Utilisez `.env.local` pour le développement
- ✅ Configurez les variables sur Vercel pour la production
- ❌ Ne commitez JAMAIS les clés dans Git
- ❌ N'utilisez pas les clés de production en développement

### Validation des Paiements
- ✅ Toujours valider côté serveur
- ✅ Vérifier les webhooks avec la signature
- ✅ Gérer les erreurs de paiement
- ✅ Logger les transactions pour audit

## 🚀 Étape 6 : Déploiement en Production

### Configuration Vercel
1. Dans votre projet Vercel, allez dans **Settings > Environment Variables**
2. Ajoutez vos variables de production :
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### Mise à Jour des Webhooks
1. Créez un nouveau webhook avec l'URL de production
2. Mettez à jour `STRIPE_WEBHOOK_SECRET` avec le nouveau secret

## 🔍 Dépannage

### Problèmes Courants

#### "Stripe publishable key not found"
- Vérifiez que `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` est défini
- Redémarrez le serveur de développement

#### "Payment intent creation failed"
- Vérifiez que `STRIPE_SECRET_KEY` est correct
- Vérifiez les logs serveur pour plus de détails

#### "Webhook signature verification failed"
- Vérifiez que `STRIPE_WEBHOOK_SECRET` est correct
- Assurez-vous que l'URL du webhook est accessible

### Mode Debug
Pour activer les logs détaillés :
```bash
DEBUG=stripe:*
NODE_ENV=development
```

## 📚 Ressources Utiles

- [Documentation Stripe](https://stripe.com/docs)
- [Guide d'intégration React](https://stripe.com/docs/stripe-js/react)
- [Cartes de test](https://stripe.com/docs/testing#cards)
- [Webhooks](https://stripe.com/docs/webhooks)
- [Sécurité PCI DSS](https://stripe.com/docs/security)

## ✅ Checklist de Configuration

- [ ] Compte Stripe créé
- [ ] Clés API récupérées (test)
- [ ] Variables d'environnement configurées
- [ ] Webhook créé et configuré
- [ ] Test de paiement réussi
- [ ] Gestion d'erreurs testée
- [ ] Configuration production prête

---

🎉 **Félicitations !** Votre intégration Stripe est maintenant configurée et prête à traiter les paiements de manière sécurisée.