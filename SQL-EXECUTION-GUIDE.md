# 🗄️ **Guide d'Exécution SQL - OMIAM Pizza**

```
┌─────────────────────────────────────────────────────────────┐
│  🍕 OMIAM PIZZA - CONFIGURATION BASE DE DONNÉES SUPABASE   │
│                                                             │
│  📋 Étape 2: Exécution du Script SQL                       │
│  ⏱️  Durée estimée: 2-5 minutes                            │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 **Objectif**
Exécuter le script `supabase-schema.sql` pour créer toutes les tables, données de test et configurations de sécurité.

---

## 📋 **Procédure Étape par Étape**

### **Étape 1: Accéder à Supabase**
```
1. 🌐 Allez sur https://supabase.com
2. 🔑 Connectez-vous à votre compte
3. 📂 Sélectionnez votre projet OMIAM Pizza
4. 📝 Cliquez sur "SQL Editor" dans le menu gauche
```

### **Étape 2: Préparer le Script**
```
1. 📁 Ouvrez le fichier "supabase-schema.sql"
2. 📋 Sélectionnez tout le contenu (Ctrl+A)
3. 📄 Copiez le script (Ctrl+C)
```

### **Étape 3: Exécuter dans Supabase**
```
1. 📝 Dans l'éditeur SQL Supabase:
   - Collez le script (Ctrl+V)
   - Vérifiez que tout est bien collé
   
2. ▶️  Cliquez sur "Run" ou appuyez sur Ctrl+Enter

3. ⏳ Attendez l'exécution (10-30 secondes)

4. ✅ Vérifiez le message de succès
```

---

## 🔍 **Vérification Automatique**

### **Script de Vérification**
```bash
# Exécutez ce script pour vérifier l'installation
node verify-database.js
```

### **Résultats Attendus**
```
✅ Tables créées (6 tables)
✅ Produits insérés (12 produits)
✅ RLS configuré (sécurité active)
✅ Fonctions et triggers opérationnels
```

---

## 📊 **Structure Créée**

### **Tables Principales**
| 🗂️ Table | 📝 Description | 📊 Données Test |
|-----------|----------------|------------------|
| `users` | Profils utilisateurs | 0 (via auth) |
| `products` | Catalogue produits | **12 produits** |
| `orders` | Commandes clients | 0 (à créer) |
| `order_items` | Détails commandes | 0 (à créer) |
| `loyalty_transactions` | Points fidélité | 0 (à créer) |
| `reviews` | Avis clients | 0 (à créer) |

### **Produits de Test Créés**
```
🍕 Pizzas (5):
   - Pizza Margherita (12.90€)
   - Pizza Pepperoni (15.90€)
   - Pizza Quattro Stagioni (17.90€)
   - Pizza Végétarienne (16.90€)
   - Calzone Classique (14.90€)

🥗 Salades (2):
   - Salade César (9.90€)
   - Salade Méditerranéenne (11.90€)

🍰 Desserts (2):
   - Tiramisu (6.90€)
   - Panna Cotta (5.90€)

🥤 Boissons (3):
   - Coca-Cola (2.50€)
   - Eau Minérale (1.90€)
   - Bière Artisanale (4.50€)
```

---

## 🔧 **Fonctionnalités Automatiques**

### **✨ Créées Automatiquement**
- 🔢 **Numéros de commande** : Format `OM20241215001`
- 🕒 **Timestamps** : `updated_at` automatique
- 🔒 **Sécurité RLS** : Accès sécurisé par utilisateur
- 📊 **Vues statistiques** : `order_stats`, `popular_products`
- 🚀 **Index** : Optimisation des performances

---

## 🚨 **Résolution de Problèmes**

### **❌ Erreur: "relation already exists"**
```sql
-- Solution: Supprimer les tables existantes
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.loyalty_transactions CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Puis relancer le script complet
```

### **❌ Erreur: "permission denied"**
```
✅ Solutions:
   1. Vérifiez que vous êtes propriétaire du projet
   2. Utilisez le service role key si nécessaire
   3. Vérifiez vos permissions dans Supabase
```

### **❌ Script trop long / timeout**
```
✅ Solutions:
   1. Exécutez par sections (tables → RLS → données)
   2. Augmentez le timeout dans les paramètres
   3. Utilisez plusieurs requêtes séparées
```

---

## ✅ **Vérification Manuelle**

### **Test Rapide dans SQL Editor**
```sql
-- 1. Vérifier les tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- 2. Compter les produits
SELECT COUNT(*) as nb_products FROM public.products;

-- 3. Voir quelques produits
SELECT name, price, category FROM public.products LIMIT 5;

-- 4. Vérifier les politiques RLS
SELECT tablename, policyname FROM pg_policies 
WHERE schemaname = 'public';
```

### **Résultats Attendus**
```
📊 Tables: 6 tables créées
🍕 Produits: 12 produits
🔒 Politiques: 10+ politiques RLS
✅ Message: "Base de données OMIAM Pizza configurée avec succès!"
```

---

## 🎯 **Prochaines Étapes**

```
┌─────────────────────────────────────────────────────────────┐
│  ✅ Script SQL exécuté avec succès                         │
│                                                             │
│  🚀 Actions suivantes:                                     │
│     1. node verify-database.js  (vérification auto)        │
│     2. npm run dev              (lancer l'application)      │
│     3. http://localhost:3000    (tester l'interface)        │
│     4. Créer un compte utilisateur                          │
│     5. Passer votre première commande! 🍕                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📞 **Support & Ressources**

- 📖 **Documentation** : [Supabase SQL Editor](https://supabase.com/docs/guides/database)
- 🔧 **Logs** : Onglet "Logs" dans votre projet Supabase
- 💬 **Communauté** : [Discord Supabase](https://discord.supabase.com)
- 🐛 **Issues** : Vérifiez la console du navigateur

---

**🎉 Félicitations ! Votre base de données OMIAM Pizza est maintenant prête pour la production !**