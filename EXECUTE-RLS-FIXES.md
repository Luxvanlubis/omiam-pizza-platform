# 🛠️ Guide d'Exécution - Corrections RLS

> **Étapes pour corriger les failles de sécurité détectées**

---

## 🚨 Problèmes Détectés

Le test de sécurité a révélé plusieurs failles :

- ❌ **Modification des produits** autorisée pour utilisateurs anonymes
- ❌ **Validation email** défaillante lors de l'insertion utilisateur
- ⚠️ **Colonne `is_verified`** manquante dans la table `reviews`
- ⚠️ **Colonne `role`** manquante dans la table `users`

---

## 🔧 Solution : Exécution du Script de Correction

### 📋 **Étape 1 : Accéder au Dashboard Supabase**

1. Ouvrez votre navigateur
2. Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
3. Connectez-vous à votre compte
4. Sélectionnez votre projet **O'miam Pizza**

### 📋 **Étape 2 : Ouvrir l'Éditeur SQL**

1. Dans le menu de gauche, cliquez sur **"SQL Editor"**
2. Cliquez sur **"New Query"** ou utilisez l'éditeur existant

### 📋 **Étape 3 : Exécuter le Script de Correction**

1. **Copiez** tout le contenu du fichier `fix-rls-issues.sql`
2. **Collez** le code dans l'éditeur SQL
3. Cliquez sur **"Run"** ou **"RUN"** (bouton vert)

### 📋 **Étape 4 : Vérifier l'Exécution**

**Résultat attendu :**
```
✅ Corrections RLS appliquées!
📊 Politiques actives: 12+
🔒 Tables sécurisées: 6
🛡️ Corrections RLS terminées!
```

**En cas d'erreur :**
- Vérifiez que vous avez les permissions d'administration
- Assurez-vous que toutes les tables existent
- Contactez le support si nécessaire

---

## ✅ Validation des Corrections

### 🧪 **Test Automatisé**

Après l'exécution du script, lancez le test de validation :

```bash
# Dans votre terminal local
node test-rls-security.js
```

**Résultat attendu :**
```
✅ Tests réussis: 6/6
📈 Taux de réussite: 100%
🛡️ Application sécurisée
```

### 🔍 **Vérification Manuelle**

Dans l'éditeur SQL Supabase, exécutez :

```sql
-- Vérifier les nouvelles colonnes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name IN ('users', 'reviews') 
AND table_schema = 'public'
ORDER BY table_name, column_name;

-- Vérifier les politiques RLS
SELECT schemaname, tablename, policyname, permissive, cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Tester l'accès aux produits
SELECT COUNT(*) as nb_products FROM public.products;
```

---

## 📊 Améliorations Apportées

### 🔒 **Sécurité Renforcée**

- ✅ **Produits** : Modification réservée aux administrateurs
- ✅ **Utilisateurs** : Validation email avec regex stricte
- ✅ **Avis** : Visibilité limitée aux avis vérifiés
- ✅ **Rôles** : Système de permissions par rôle

### ⚡ **Performance Optimisée**

- ✅ **Index RLS** : Index spécialisés pour les politiques
- ✅ **Requêtes** : Optimisation des conditions WHERE
- ✅ **Cache** : Amélioration du cache des politiques

### 🧪 **Validation Métier**

- ✅ **Email** : Format validé par regex
- ✅ **Avis** : Un seul avis par utilisateur par produit
- ✅ **Notes** : Validation 1-5 étoiles
- ✅ **Commentaires** : Longueur contrôlée (10-1000 caractères)

---

## 🚀 Prochaines Étapes

### 1️⃣ **Immédiat**
- [ ] Exécuter `fix-rls-issues.sql` dans Supabase
- [ ] Lancer `node test-rls-security.js`
- [ ] Vérifier que tous les tests passent

### 2️⃣ **Validation Fonctionnelle**
- [ ] Tester l'inscription utilisateur
- [ ] Vérifier la lecture des produits
- [ ] Tester la création d'avis
- [ ] Valider les permissions admin

### 3️⃣ **Optimisation Continue**
- [ ] Implémenter le système de commandes
- [ ] Configurer Stripe pour les paiements
- [ ] Préparer le déploiement production

---

## 🆘 Dépannage

### ❌ **Erreur : "insufficient_privilege"**
**Solution :** Utilisez un compte avec des permissions d'administration sur le projet Supabase.

### ❌ **Erreur : "relation does not exist"**
**Solution :** Assurez-vous que le schéma de base (`supabase-schema.sql`) a été exécuté en premier.

### ❌ **Erreur : "policy already exists"**
**Solution :** Le script gère automatiquement les politiques existantes avec `DROP POLICY IF EXISTS`.

### ❌ **Tests toujours en échec**
**Solution :** 
1. Vérifiez que le script s'est exécuté sans erreur
2. Attendez 30 secondes pour la propagation des changements
3. Relancez les tests

---

## 📞 Support

### 🔗 **Ressources Utiles**
- [Documentation Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Guide PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Meilleures Pratiques Sécurité](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)

### 📁 **Fichiers du Projet**
- `fix-rls-issues.sql` - Script de correction
- `test-rls-security.js` - Tests de validation
- `RLS-OPTIMIZATION-GUIDE.md` - Guide complet

---

## ✅ Checklist de Validation

- [ ] **Script exécuté** : `fix-rls-issues.sql` dans Supabase
- [ ] **Colonnes ajoutées** : `is_verified`, `role`, `updated_at`
- [ ] **Politiques corrigées** : Produits, utilisateurs, avis
- [ ] **Tests passés** : 100% de réussite
- [ ] **Index créés** : Performance optimisée
- [ ] **Fonctions ajoutées** : `is_admin()`, `owns_order()`

---

**🎯 Objectif :** Passer de 60% à 100% de réussite aux tests de sécurité RLS.

**⏱️ Temps estimé :** 5-10 minutes d'exécution + validation.

*Dernière mise à jour : Janvier 2024*