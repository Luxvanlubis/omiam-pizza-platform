# 🚀 Guide de Déploiement GitHub - O'Miam

## ✅ Étapes Complétées

- ✅ Dépôt Git initialisé
- ✅ Configuration utilisateur Git
- ✅ Tous les fichiers ajoutés
- ✅ Commit initial créé

## 📋 Étapes pour Pousser sur GitHub

### 1. Créer un Nouveau Dépôt sur GitHub

1. Allez sur [GitHub.com](https://github.com)
2. Cliquez sur le bouton **"+"** en haut à droite
3. Sélectionnez **"New repository"**
4. Configurez le dépôt :
   - **Repository name**: `omiam-pizza-platform`
   - **Description**: `🍕 O'Miam - Plateforme moderne de commande de pizzas avec Next.js, Supabase et optimisations avancées`
   - **Visibility**: Public ou Private (selon votre préférence)
   - ⚠️ **NE PAS** cocher "Add a README file" (nous en avons déjà un)
   - ⚠️ **NE PAS** ajouter .gitignore ou license (déjà présents)
5. Cliquez sur **"Create repository"**

### 2. Connecter le Dépôt Local à GitHub

Après création du dépôt, GitHub vous donnera des instructions. Utilisez ces commandes :

```bash
# Ajouter le remote GitHub (remplacez YOUR_USERNAME par votre nom d'utilisateur)
git remote add origin https://github.com/YOUR_USERNAME/omiam-pizza-platform.git

# Renommer la branche principale en 'main' (standard GitHub)
git branch -M main

# Pousser le code vers GitHub
git push -u origin main
```

### 3. Commandes Prêtes à Exécuter

**Remplacez `YOUR_USERNAME` par votre nom d'utilisateur GitHub :**

```powershell
# Étape 1: Ajouter le remote
git remote add origin https://github.com/YOUR_USERNAME/omiam-pizza-platform.git

# Étape 2: Renommer la branche
git branch -M main

# Étape 3: Pousser vers GitHub
git push -u origin main
```

## 🔧 Configuration Recommandée du Dépôt

### Paramètres du Dépôt

1. **Topics/Tags** à ajouter :
   - `nextjs`
   - `react`
   - `supabase`
   - `typescript`
   - `tailwindcss`
   - `pizza`
   - `restaurant`
   - `ecommerce`
   - `pwa`
   - `stripe`

2. **Protection de Branche** (Settings > Branches) :
   - Protéger la branche `main`
   - Require pull request reviews
   - Require status checks to pass

### Variables d'Environnement (GitHub Secrets)

Pour le déploiement automatique, ajoutez ces secrets dans Settings > Secrets and variables > Actions :

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

## 🚀 Déploiement Automatique

### Vercel (Recommandé)

1. Connectez votre dépôt GitHub à [Vercel](https://vercel.com)
2. Importez le projet
3. Ajoutez les variables d'environnement
4. Déployez !

### Netlify

1. Connectez votre dépôt à [Netlify](https://netlify.com)
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Ajoutez les variables d'environnement

## 📝 Prochaines Étapes

Après le push initial :

1. **README.md** - Mettre à jour avec les instructions spécifiques
2. **Issues** - Créer des issues pour les fonctionnalités manquantes
3. **Projects** - Organiser le développement avec GitHub Projects
4. **Actions** - Configurer CI/CD pour les tests automatiques
5. **Releases** - Créer des releases avec tags sémantiques

## 🔍 Vérification

Après le push, vérifiez :

- ✅ Code visible sur GitHub
- ✅ README.md affiché correctement
- ✅ Structure des dossiers préservée
- ✅ Fichiers de configuration présents
- ✅ Historique des commits visible

---

**🎉 Votre projet O'Miam sera maintenant disponible sur GitHub !**

Pour toute question ou problème, consultez la [documentation GitHub](https://docs.github.com) ou créez une issue dans le dépôt.