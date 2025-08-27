# 🛡️ Guide d'Optimisation RLS - O'miam Pizza

> **Row Level Security (RLS) - Sécurité Avancée et Performance**

---

## 📋 Vue d'Ensemble

Ce guide détaille l'optimisation des politiques RLS (Row Level Security) pour l'application O'miam Pizza, garantissant une sécurité maximale tout en maintenant des performances optimales.

### 🎯 Objectifs de l'Optimisation

- **🔒 Sécurité Renforcée** : Politiques granulaires et validation stricte
- **⚡ Performance Optimisée** : Index spécialisés et requêtes efficaces
- **🧪 Validation Métier** : Règles business intégrées dans les politiques
- **📊 Monitoring** : Audit et logging des accès sensibles

---

## 🚀 Étapes d'Implémentation

### 1️⃣ **Exécution du Script d'Optimisation**

```bash
# Dans le Dashboard Supabase → SQL Editor
# Coller et exécuter le contenu de: optimize-rls-policies.sql
```

**⚠️ Important :** Ce script supprime et recrée toutes les politiques RLS existantes.

### 2️⃣ **Validation des Politiques**

```bash
# Test automatisé de sécurité
node test-rls-security.js
```

### 3️⃣ **Vérification Manuelle**

```sql
-- Dans Supabase SQL Editor
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

---

## 🔧 Politiques Optimisées par Table

### 👤 **Table `users`**

| Politique | Action | Description |
|-----------|--------|-------------|
| `users_select_own` | SELECT | Lecture du profil utilisateur uniquement |
| `users_update_own` | UPDATE | Mise à jour avec validation email |
| `users_insert_authenticated` | INSERT | Insertion avec validation stricte |

**🔍 Améliorations :**
- Validation regex pour les emails
- Vérification de la longueur des champs
- Protection contre l'injection de données

### 🍕 **Table `products`**

| Politique | Action | Description |
|-----------|--------|-------------|
| `products_select_public` | SELECT | Lecture publique optimisée |
| `products_admin_only` | ALL | Modification réservée aux admins |

**🔍 Améliorations :**
- Contrôle d'accès basé sur les rôles
- Validation des prix (> 0)
- Vérification de la longueur des noms

### 🛒 **Table `orders`**

| Politique | Action | Description |
|-----------|--------|-------------|
| `orders_select_own` | SELECT | Lecture des commandes propriétaires |
| `orders_insert_own` | INSERT | Création avec validation métier |
| `orders_update_limited` | UPDATE | Modification limitée aux statuts autorisés |

**🔍 Améliorations :**
- Validation des statuts de commande
- Restriction des modifications selon l'état
- Vérification des montants (> 0)

### 📦 **Table `order_items`**

| Politique | Action | Description |
|-----------|--------|-------------|
| `order_items_select_own` | SELECT | Lecture via JOIN optimisé |
| `order_items_insert_own` | INSERT | Insertion avec validation stock |
| `order_items_update_limited` | UPDATE | Modification limitée aux commandes pending |

**🔍 Améliorations :**
- Limite de quantité par article (max 10)
- Vérification de l'existence des produits
- Restriction aux commandes en attente

### ⭐ **Table `reviews`**

| Politique | Action | Description |
|-----------|--------|-------------|
| `reviews_select_public` | SELECT | Lecture des avis vérifiés uniquement |
| `reviews_insert_own` | INSERT | Insertion avec validation complète |
| `reviews_update_own_limited` | UPDATE | Modification dans les 24h |

**🔍 Améliorations :**
- Un seul avis par utilisateur par produit
- Validation de la note (1-5)
- Limitation de la longueur des commentaires
- Fenêtre de modification de 24h

---

## ⚡ Optimisations de Performance

### 📊 **Index Spécialisés**

```sql
-- Index pour les politiques RLS
CREATE INDEX idx_users_auth_uid ON users(id) WHERE id = auth.uid();
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_reviews_user_product ON reviews(user_id, product_id);
```

### 🔍 **Fonctions de Sécurité**

```sql
-- Vérification du rôle admin
CREATE FUNCTION is_admin() RETURNS BOOLEAN;

-- Vérification de propriété de commande
CREATE FUNCTION owns_order(order_id UUID) RETURNS BOOLEAN;
```

### 📈 **Vues Sécurisées**

- `user_stats` : Statistiques utilisateur personnalisées
- `products_with_ratings` : Produits avec notes moyennes

---

## 🧪 Tests de Sécurité

### ✅ **Tests Automatisés**

Le script `test-rls-security.js` vérifie :

1. **Isolation des données utilisateur**
2. **Accès public aux produits**
3. **Protection des commandes**
4. **Visibilité des avis vérifiés**
5. **Validation des données**
6. **Performance des index**

### 📊 **Métriques de Sécurité**

```bash
# Résultat attendu
✅ Tests réussis: 6/6
📈 Taux de réussite: 100%
🛡️ Application sécurisée
```

---

## 🔍 Monitoring et Audit

### 📝 **Logging des Modifications**

```sql
-- Trigger automatique pour les changements de statut
CREATE TRIGGER trigger_log_order_changes
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION log_sensitive_changes();
```

### 📊 **Métriques de Performance**

```sql
-- Statistiques des politiques RLS
SELECT 
    schemaname,
    tablename,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY schemaname, tablename;
```

---

## 🚨 Gestion des Erreurs

### ⚠️ **Erreurs Communes**

| Erreur | Cause | Solution |
|--------|-------|----------|
| `insufficient_privilege` | Politique RLS bloque l'accès | Vérifier l'authentification |
| `new row violates row-level security` | Validation échouée | Contrôler les données d'entrée |
| `permission denied for table` | RLS non configuré | Exécuter le script d'optimisation |

### 🔧 **Dépannage**

```sql
-- Vérifier les politiques actives
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- Tester une politique spécifique
SET ROLE authenticated;
SELECT * FROM users WHERE id = auth.uid();
```

---

## 📚 Meilleures Pratiques

### ✅ **À Faire**

- ✅ Toujours valider les données d'entrée
- ✅ Utiliser des index pour les colonnes RLS
- ✅ Tester régulièrement les politiques
- ✅ Logger les accès sensibles
- ✅ Limiter les permissions au minimum nécessaire

### ❌ **À Éviter**

- ❌ Politiques trop permissives (`USING (true)`)
- ❌ Requêtes complexes dans les politiques
- ❌ Oublier la validation des données
- ❌ Ignorer les tests de sécurité
- ❌ Exposer des données sensibles

---

## 🔄 Maintenance Continue

### 📅 **Tâches Régulières**

- **Hebdomadaire** : Exécuter les tests de sécurité
- **Mensuel** : Réviser les politiques RLS
- **Trimestriel** : Audit complet de sécurité

### 📈 **Évolution des Politiques**

```sql
-- Template pour nouvelle politique
CREATE POLICY "policy_name" ON table_name
    FOR action
    USING (security_condition)
    WITH CHECK (validation_condition);
```

---

## 🎯 Prochaines Étapes

### 1️⃣ **Implémentation Immédiate**
- [ ] Exécuter `optimize-rls-policies.sql`
- [ ] Lancer `test-rls-security.js`
- [ ] Vérifier les résultats

### 2️⃣ **Optimisations Avancées**
- [ ] Configurer l'audit logging
- [ ] Implémenter le rate limiting
- [ ] Ajouter la détection d'intrusion

### 3️⃣ **Monitoring Production**
- [ ] Dashboard de sécurité
- [ ] Alertes automatiques
- [ ] Rapports de conformité

---

## 📞 Support et Ressources

### 🔗 **Liens Utiles**
- [Documentation Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Guide](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Security Best Practices](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)

### 📁 **Fichiers du Projet**
- `optimize-rls-policies.sql` - Script d'optimisation
- `test-rls-security.js` - Tests automatisés
- `supabase-schema.sql` - Schéma de base

---

## ✅ Checklist de Validation

- [ ] **Politiques RLS** : Toutes les tables protégées
- [ ] **Tests de Sécurité** : 100% de réussite
- [ ] **Performance** : Index optimisés
- [ ] **Validation** : Données contrôlées
- [ ] **Audit** : Logging configuré
- [ ] **Documentation** : Politiques documentées

---

**🎉 Félicitations !** Votre application O'miam Pizza est maintenant sécurisée avec des politiques RLS optimisées et des performances maximales.

*Dernière mise à jour : Janvier 2024*