
# Guide de Migration - Harmonisation Prisma/Supabase

## Conflits Résolus

### Nommage des Champs
| Prisma | Supabase | Description |
|--------|----------|-------------|
| name | full_name | Nom complet utilisateur |
| loyaltyPoints | loyalty_points | Points de fidélité |
| createdAt | created_at | Date de création |
| updatedAt | updated_at | Date de mise à jour |
| isActive | is_active | Statut actif |
| orderItems | order_items | Articles de commande |
| totalAmount | total_amount | Montant total |
| deliveryAddress | delivery_address | Adresse de livraison |
| customerNotes | customer_notes | Notes client |
| adminNotes | admin_notes | Notes admin |
| estimatedDelivery | estimated_delivery | Livraison estimée |
| productId | product_id | ID produit |
| orderId | order_id | ID commande |
| userId | user_id | ID utilisateur |

## Actions Requises

### 1. Mise à jour du schéma Prisma
```bash
npx prisma db push
npx prisma generate
```

### 2. Application du schéma Supabase
```bash
# Via Supabase CLI
supabase db reset
supabase db push

# Ou via SQL direct
psql $DATABASE_URL < supabase-harmonized-schema.sql
```

### 3. Mise à jour des types
```bash
# Remplacer l'ancien fichier de types
cp src/types/supabase-harmonized.ts src/types/supabase.ts
```

### 4. Mise à jour du code
- Remplacer les imports `from '@/types/supabase'` par les nouveaux types
- Vérifier les mappings de champs dans les services
- Tester les requêtes Prisma et Supabase

## Vérification

```bash
# Tester la connexion
node test-db-connection.js

# Vérifier les types
npx tsc --noEmit

# Tester les services
npm test
```

## Rollback

En cas de problème :
```bash
# Restaurer les anciens types
git checkout HEAD~1 -- src/types/supabase.ts

# Restaurer le schéma Prisma
git checkout HEAD~1 -- prisma/schema.prisma
```
