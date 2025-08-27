# 🗄️ **Exécution du Script SQL Supabase - OMIAM Pizza**

> **Objectif** : Configurer la base de données complète avec tables, données de test et sécurité RLS

---

## 📋 **Étapes d'Exécution**

### **1. Accéder à l'Éditeur SQL**

1. **Connectez-vous** à [supabase.com](https://supabase.com)
2. **Sélectionnez** votre projet OMIAM Pizza
3. **Cliquez** sur "SQL Editor" dans le menu de gauche
4. **Choisissez** "New Query" ou utilisez l'éditeur principal

### **2. Copier le Script SQL**

1. **Ouvrez** le fichier `supabase-schema.sql` dans votre éditeur
2. **Sélectionnez tout** le contenu (Ctrl+A)
3. **Copiez** le script (Ctrl+C)

### **3. Exécuter le Script**

1. **Collez** le script dans l'éditeur SQL de Supabase (Ctrl+V)
2. **Vérifiez** que tout le contenu est bien collé
3. **Cliquez** sur le bouton "Run" (▶️) ou utilisez Ctrl+Enter
4. **Attendez** l'exécution complète (peut prendre 10-30 secondes)

---

## ✅ **Vérification de l'Installation**

### **Script de Vérification Rapide**
```sql
-- Vérifier que toutes les tables sont créées
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'products', 'orders', 'order_items', 'loyalty_transactions', 'reviews');

-- Vérifier les données de test
SELECT COUNT(*) as nb_products FROM public.products;
SELECT name, price, category FROM public.products LIMIT 3;

-- Vérifier les politiques RLS
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

### **Résultats Attendus**
- ✅ **6 tables** créées : `users`, `products`, `orders`, `order_items`, `loyalty_transactions`, `reviews`
- ✅ **12 produits** de test insérés
- ✅ **Politiques RLS** activées (environ 10-12 politiques)
- ✅ **Fonctions et triggers** créés

---

## 🔧 **Structure Créée**

### **Tables Principales**
| Table | Description | Enregistrements |
|-------|-------------|----------------|
| `users` | Utilisateurs et profils | 0 (créés via auth) |
| `products` | Catalogue pizzas/produits | 12 produits test |
| `orders` | Commandes clients | 0 (à créer) |
| `order_items` | Détails des commandes | 0 (à créer) |
| `loyalty_transactions` | Points fidélité | 0 (à créer) |
| `reviews` | Avis clients | 0 (à créer) |

### **Fonctionnalités Automatiques**
- 🔢 **Numéros de commande** auto-générés (format: OM20241215001)
- 🕒 **Timestamps** `updated_at` automatiques
- 🔒 **Sécurité RLS** complète
- 📊 **Vues statistiques** (order_stats, popular_products)
- 🚀 **Index** pour les performances

---

## 🚨 **Résolution de Problèmes**

### **Erreur : "relation already exists"**
```sql
-- Supprimer les tables existantes si nécessaire
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.loyalty_transactions CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
```

### **Erreur : "permission denied"**
- Vérifiez que vous êtes **propriétaire** du projet Supabase
- Utilisez le **service role key** si nécessaire

### **Script trop long**
- Exécutez le script **par sections** (tables → RLS → données)
- Utilisez plusieurs requêtes séparées

---

## 🎯 **Prochaines Étapes**

1. ✅ **Vérifier** l'exécution avec les scripts de test
2. 🔑 **Tester** l'authentification dans l'application
3. 🛒 **Créer** une première commande de test
4. 📱 **Lancer** l'application : `npm run dev`
5. 🌐 **Accéder** à http://localhost:3000

---

## 📞 **Support**

- 📖 **Documentation** : [Supabase SQL Editor](https://supabase.com/docs/guides/database)
- 🐛 **Issues** : Vérifiez les logs dans l'onglet "Logs" de Supabase
- 💬 **Aide** : [Discord Supabase](https://discord.supabase.com)

---

**🎉 Une fois terminé, votre base de données OMIAM Pizza sera prête pour la production !**