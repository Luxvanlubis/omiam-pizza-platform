# 🍕 Guide Complet de Configuration Supabase pour OMIAM Pizza

Ce guide vous accompagne pas à pas pour créer et configurer votre projet Supabase pour l'application OMIAM Pizza.

## 📋 Prérequis

- Un compte GitHub ou email valide
- Accès à https://supabase.com
- Node.js installé sur votre machine
- Votre projet OMIAM Pizza cloné localement

## 🚀 Étape 1: Création du Compte Supabase

### 1.1 Accès au site
1. Rendez-vous sur [https://supabase.com](https://supabase.com)
2. Cliquez sur **"Get Started"** ou **"Sign In"** en haut à droite
3. Connectez-vous avec :
   - **GitHub** (recommandé)
   - **Google**
   - **Email** (avec vérification)

### 1.2 Vérification du compte
- Vérifiez votre email pour confirmer votre compte
- Complétez votre profil avec vos informations

## 🎯 Étape 2: Création d'un Nouveau Projet

### 2.1 Navigation vers la création
1. Une fois connecté, cliquez sur **"New Project"**
2. Ou allez dans **"Projects"** → **"New Project"**

### 2.2 Configuration du projet

**Informations du projet :**
- **Project name**: `omiam-pizza` (ou votre choix)
- **Organization**:
  - Sélectionnez votre organisation existante
  - Ou créez-en une nouvelle : `Personal` ou votre nom d'entreprise
- **Database Password**:
  - Générez un mot de passe fort (minimum 8 caractères)
  - **Note importante**: Notez ce mot de passe dans un gestionnaire sécurisé

**Région du serveur :**
- **US East (N. Virginia)** - us-east-1 (recommandé pour performance)
- **EU West (Ireland)** - eu-west-1 (si majorité des utilisateurs en Europe)
- **Asia Pacific (Singapore)** - ap-southeast-1 (si majorité en Asie)

### 2.3 Lancement du projet
1. Cliquez sur **"Create New Project"**
2. Attendez 2-3 minutes que le projet soit provisionné
3. Vous serez redirigé vers le tableau de bord

## 🔑 Étape 3: Récupération des Clés d'API

### 3.1 Accès aux paramètres
1. Dans le tableau de bord, cliquez sur **"Settings"** (engrenage en bas à gauche)
2. Sélectionnez **"API"**

### 3.2 Copie des clés
**Clés à copier et sauvegarder :**

```
Project URL: https://[votre-projet].supabase.co
Anon/Public Key: [clé très longue - commence par eyJ...]
Service Role Key: [clé très longue - commence par eyJ...]
Database URL: postgresql://postgres:[password]@db.[votre-projet].supabase.co:5432/postgres
```

**⚠️ Important**: Ne partagez jamais votre **Service Role Key** publiquement !

## 🗄️ Étape 4: Configuration de la Base de Données

### 4.1 Accès à l'éditeur SQL
1. Dans le tableau de bord, cliquez sur **"SQL Editor"** dans le menu gauche
2. Cliquez sur **"New Query"**

### 4.2 Exécution du script
1. Ouvrez le fichier `supabase-schema.sql` dans votre projet
2. Copiez l'intégralité du contenu
3. Collez dans l'éditeur SQL de Supabase
4. Cliquez sur **"Run"** ou appuyez sur **Ctrl+Enter**
5. Attendez la confirmation "Success" (environ 10-15 secondes)

### 4.3 Vérification des tables
1. Cliquez sur **"Table Editor"** dans le menu gauche
2. Vous devriez voir les tables créées :
   - `users`
   - `products`
   - `orders`
   - `order_items`
   - `loyalty_transactions`
   - `reviews`

## ⚙️ Étape 5: Configuration Locale du Projet

### 5.1 Mise à jour du fichier .env.local
1. Ouvrez le fichier `.env.local` à la racine de votre projet
2. Remplacez les valeurs par celles de votre projet Supabase :

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://[votre-projet].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[votre-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[votre-service-role-key]
DATABASE_URL=postgresql://postgres:[password]@db.[votre-projet].supabase.co:5432/postgres

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=[générez-avec: openssl rand -base64 32]

# Vercel Configuration (pour déploiement)
VERCEL_URL=[sera-généré-par-vercel]
```

### 5.2 Génération de NextAuth Secret
```bash
# Dans votre terminal
openssl rand -base64 32
```

## 🧪 Étape 6: Test de la Configuration

### 6.1 Installation des dépendances
```bash
npm install
```

### 6.2 Lancement du serveur de développement
```bash
npm run dev
```

### 6.3 Vérification des endpoints
1. Accédez à `http://localhost:3000/api/auth/signup`
2. Testez l'inscription avec un email et mot de passe
3. Vérifiez dans **"Authentication"** → **"Users"** que l'utilisateur apparaît

## 🎨 Étape 7: Configuration Supplémentaire

### 7.1 Paramètres d'authentification
1. Allez dans **"Authentication"** → **"Providers"**
2. Activez les providers souhaités :
   - **Email** (déjà activé)
   - **Google** (optionnel)
   - **Facebook** (optionnel)

### 7.2 Configuration des emails
1. Dans **"Authentication"** → **"Templates"**
2. Personnalisez les emails de confirmation
3. Testez l'envoi d'email avec **"Send Test Email"**

### 7.3 Storage pour les images
1. Allez dans **"Storage"**
2. Créez un bucket nommé **"pizza-images"**
3. Configurez les policies :
   - **Public** pour la lecture des images de produits
   - **Private** pour les avatars utilisateurs

## 🔍 Dépannage Commun

### Problème: "Cannot connect to database"
**Solution**: Vérifiez que le mot de passe dans DATABASE_URL correspond exactement à celui défini lors de la création du projet.

### Problème: "JWT expired"
**Solution**: Rafraîchissez votre page et reconnectez-vous, ou régénérez les clés API.

### Problème: "Row Level Security"
**Solution**: Assurez-vous que toutes les policies sont créées comme dans le script SQL fourni.

### Problème: "CORS error"
**Solution**: Vérifiez que NEXT_PUBLIC_SUPABASE_URL est correct et inclut https://

## 📊 Monitoring et Maintenance

### 8.1 Tableau de bord
- **"Reports"** : Statistiques d'utilisation
- **"Logs"** : Logs d'erreurs et d'activité
- **"Billing"** : Suivi des coûts

### 8.2 Sauvegardes
- Supabase effectue des sauvegardes automatiques toutes les 7 jours
- Pour des sauvegardes plus fréquentes, passez au plan Pro

## 🚀 Prochaines Étapes

1. **Déploiement sur Vercel** : Suivez le guide `DEPLOYMENT.md`
2. **Configuration du paiement** : Intégration Stripe ou PayPal
3. **Notifications** : Configuration de l'envoi d'emails pour les commandes
4. **Analytics** : Intégration avec Google Analytics ou PostHog

## 📞 Support

- **Documentation Supabase**: https://supabase.com/docs
- **Community Discord**: https://discord.supabase.com
- **Support technique**: support@supabase.com

---

**🎉 Félicitations ! Votre projet OMIAM Pizza est maintenant configuré avec Supabase !**

*Temps total estimé: 15-20 minutes*