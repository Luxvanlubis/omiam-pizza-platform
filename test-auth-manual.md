# 🔐 Test Manuel de l'Authentification Supabase

## Objectif
Tester l'authentification utilisateur avec Supabase Auth via l'interface web pour éviter les problèmes de captcha.

## Pages de Test Créées

### 1. Page d'Inscription
- **URL**: `http://localhost:3001/auth/signup`
- **Fonctionnalités**:
  - Validation côté client (email, mot de passe, confirmation)
  - Gestion des erreurs
  - Interface utilisateur moderne avec Shadcn/ui
  - Redirection automatique après inscription

### 2. Page de Connexion
- **URL**: `http://localhost:3001/auth/login`
- **Fonctionnalités**:
  - Authentification par email/mot de passe
  - Gestion des erreurs et succès
  - Redirection vers la page d'accueil
  - Lien vers l'inscription

## Procédure de Test

### Étape 1: Test d'Inscription
1. Ouvrir `http://localhost:3001/auth/signup`
2. Remplir le formulaire avec :
   - **Prénom**: Test
   - **Nom**: User
   - **Email**: test@example.com
   - **Mot de passe**: testpass123
   - **Confirmation**: testpass123
3. Cliquer sur "Créer mon compte"
4. **Résultat attendu**: Message de succès + redirection vers login

### Étape 2: Vérification dans Supabase
1. Aller sur [Supabase Dashboard](https://app.supabase.com)
2. Naviguer vers **Authentication** → **Users**
3. **Vérifier**: L'utilisateur `test@example.com` apparaît dans la liste
4. **Statut**: Doit être "Confirmed" ou "Pending" selon la config email

### Étape 3: Test de Connexion
1. Ouvrir `http://localhost:3001/auth/login`
2. Utiliser les identifiants créés :
   - **Email**: test@example.com
   - **Mot de passe**: testpass123
3. Cliquer sur "Se connecter"
4. **Résultat attendu**: Message de succès + redirection vers `/`

### Étape 4: Vérification de Session
1. Après connexion, vérifier que l'utilisateur est bien connecté
2. Tester la navigation sur des pages protégées
3. Vérifier la persistance de la session (refresh de page)

## Problèmes Connus et Solutions

### 1. Erreur "captcha verification process failed"
- **Cause**: Captcha activé dans Supabase
- **Solution**: Désactiver le captcha dans Supabase Dashboard
- **Chemin**: Project Settings → Authentication → Bot Protection → Disable

### 2. Erreur NextAuth Session
- **Cause**: Endpoint `/api/auth/session` non accessible
- **Status**: ✅ Résolu - Endpoint NextAuth configuré

### 3. Erreurs CORS
- **Cause**: Configuration Supabase restrictive
- **Solution**: Ajouter `http://localhost:3001` dans les URLs autorisées

## Configuration Supabase Recommandée

### Authentication Settings
```
Site URL: http://localhost:3001
Redirect URLs: 
  - http://localhost:3001/auth/callback
  - http://localhost:3001/
  - http://localhost:3001/auth/login

Email Templates: Activés
Bot Protection: Désactivé (pour développement)
```

### RLS Policies (Row Level Security)
```sql
-- Politique pour la table users
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);
```

## Résultats Attendus

### ✅ Succès
- [ ] Inscription réussie sans erreur captcha
- [ ] Utilisateur visible dans Supabase Dashboard
- [ ] Connexion réussie avec les identifiants créés
- [ ] Session persistante après refresh
- [ ] Redirection correcte après auth

### ❌ Échecs Possibles
- Captcha encore actif → Désactiver dans Supabase
- Erreur de validation → Vérifier les champs requis
- Problème de session → Vérifier NextAuth config
- Erreur RLS → Ajuster les politiques de sécurité

## Prochaines Étapes

Après validation de l'authentification de base :
1. **Optimiser RLS** - Affiner les politiques de sécurité
2. **Implémenter les commandes** - Système de panier et checkout
3. **Configurer Stripe** - Intégration paiements
4. **Déployer en production** - Vercel + Supabase

---

**Note**: Ce test manuel permet de contourner les limitations du captcha tout en validant l'intégration Supabase Auth complète.