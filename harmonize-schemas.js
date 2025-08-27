#!/usr/bin/env node

/**
 * Script d'harmonisation des schémas Prisma/Supabase
 * Synchronise les types et génère les types TypeScript corrects
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔄 Harmonisation des schémas Prisma/Supabase...');

// 1. Vérifier les conflits de nommage
const conflictsMap = { // Prisma -> Supabase mapping 'name': 'full_name', 'loyaltyPoints': 'loyalty_points', 'createdAt': 'created_at', 'updatedAt': 'updated_at', 'isActive': 'is_active', 'orderItems': 'order_items', 'totalAmount': 'total_amount', 'deliveryAddress': 'delivery_address', 'customerNotes': 'customer_notes', Notes': _notes', 'estimatedDelivery': 'estimated_delivery', 'productId': 'product_id', 'orderId': 'order_id', 'userId': 'user_id'
};

console.log('📋 Conflits détectés:', Object.s(conflictsMap).length);

// 2. Créer un schéma Supabase harmonisé
const harmonizedSchema = `
-- Schema Supabase harmonisé avec Prisma
-- Généré automatiquement le ${new Date().toISOString()}

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (harmonisé)
CREATE TABLE IF NOT EXISTS users ( id UUID PRIMARY  DEFAULT uuid_generate_v4(), email VARCHAR UNIQUE NOT NULL, full_name VARCHAR,  -- Harmonisé avec Prisma 'name' phone VARCHAR, loyalty_points INTEGER DEFAULT 0,  -- Harmonisé avec Prisma 'loyaltyPoints' created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table (harmonisé)
CREATE TABLE IF NOT EXISTS products ( id UUID PRIMARY  DEFAULT uuid_generate_v4(), name VARCHAR UNIQUE NOT NULL, description TEXT, price DECIMAL(10,2) NOT NULL, category VARCHAR NOT NULL, image VARCHAR, ingredients JSONB,  -- JSON array of ingredients is_active BOOLEAN DEFAULT true,  -- Harmonisé avec Prisma 'isActive' created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table (harmonisé)
CREATE TABLE IF NOT EXISTS orders ( id UUID PRIMARY  DEFAULT uuid_generate_v4(), user_id UUID REFERENCES users(id) ON DELETE CASCADE, status VARCHAR NOT NULL DEFAULT 'PENDING', total_amount DECIMAL(10,2) NOT NULL,  -- Harmonisé avec Prisma 'totalAmount' delivery_address TEXT,  -- Harmonisé avec Prisma 'deliveryAddress' phone VARCHAR, notes TEXT, customer_notes TEXT,  -- Harmonisé avec Prisma 'customerNotes' _notes TEXT, -- Harmonisé avec Prisma Notes' estimated_delivery TIMESTAMP WITH TIME ZONE,  -- Harmonisé avec Prisma 'estimatedDelivery' created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items table (harmonisé)
CREATE TABLE IF NOT EXISTS order_items ( id UUID PRIMARY  DEFAULT uuid_generate_v4(), order_id UUID REFERENCES orders(id) ON DELETE CASCADE, product_id UUID REFERENCES products(id) ON DELETE CASCADE, quantity INTEGER NOT NULL, price DECIMAL(10,2) NOT NULL, customizations JSONB, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews ( id UUID PRIMARY  DEFAULT uuid_generate_v4(), user_id UUID REFERENCES users(id) ON DELETE CASCADE, product_id UUID REFERENCES products(id) ON DELETE CASCADE, rating INTEGER CHECK (rating >= 1 AND rating <= 5), comment TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications ( id UUID PRIMARY  DEFAULT uuid_generate_v4(), user_id UUID REFERENCES users(id) ON DELETE CASCADE, title VARCHAR NOT NULL, message TEXT NOT NULL, type VARCHAR NOT NULL, read BOOLEAN DEFAULT false, data JSONB, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Push Subscriptions table
CREATE TABLE IF NOT EXISTS push_subscriptions ( id UUID PRIMARY  DEFAULT uuid_generate_v4(), user_id UUID REFERENCES users(id) ON DELETE CASCADE, endpoint TEXT NOT NULL, p256dh VARCHAR NOT NULL, auth VARCHAR NOT NULL, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), UNIQUE(user_id, endpoint)
);

-- Notification Preferences table
CREATE TABLE IF NOT EXISTS notification_preferences ( id UUID PRIMARY  DEFAULT uuid_generate_v4(), user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE, order_updates BOOLEAN DEFAULT true, promotions BOOLEAN DEFAULT true, newsletter BOOLEAN DEFAULT false, push_enabled BOOLEAN DEFAULT true, email_enabled BOOLEAN DEFAULT true, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CMS Content table
CREATE TABLE IF NOT EXISTS cms_content ( id UUID PRIMARY  DEFAULT uuid_generate_v4(), VARCHAR UNIQUE NOT NULL, title VARCHAR, content TEXT, metadata JSONB, is_active BOOLEAN DEFAULT true, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes pour performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);

-- RLS (Row Level Security) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Policies de base (à ajuster selon les besoins)
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

COMMIT;
`;

// 3. Sauvegarder le schéma harmonisé
fs.writeFileSync('supabase-harmonized-schema.sql', harmonizedSchema);
console.log('✅ Schéma harmonisé généré: supabase-harmonized-schema.sql');

// 4. Générer les types TypeScript harmonisés
const harmonizedTypes = `
// Types TypeScript harmonisés Prisma/Supabase
// Auto-généré le ${new Date().toISOString()}

export type Json = | string | number | boolean | null | { [: string]: Json | undefined } | Json[]

// Types de base harmonisés
export interface User { id: string; email: string; full_name?: string | null;  // Harmonisé avec Prisma 'name' phone?: string | null; loyalty_points: number; // Harmonisé avec Prisma 'loyaltyPoints' created_at: string; updated_at: string;
}

export interface Product { id: string; name: string; description?: string | null; price: number; category: string; image?: string | null; ingredients?: Json; is_active: boolean; // Harmonisé avec Prisma 'isActive' created_at: string; updated_at: string;
}

export interface Order { id: string; user_id: string; status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED'; total_amount: number; // Harmonisé avec Prisma 'totalAmount' delivery_address?: string | null;  // Harmonisé avec Prisma 'deliveryAddress' phone?: string | null; notes?: string | null; customer_notes?: string | null; // Harmonisé avec Prisma 'customerNotes' _notes?: string | null; // Harmonisé avec Prisma Notes' estimated_delivery?: string | null; // Harmonisé avec Prisma 'estimatedDelivery' created_at: string; updated_at: string;
}

export interface OrderItem { id: string; order_id: string; // Harmonisé avec Prisma 'orderId' product_id: string; // Harmonisé avec Prisma 'productId' quantity: number; price: number; customizations?: Json; created_at: string; updated_at: string;
}

export interface Review { id: string; user_id: string; // Harmonisé avec Prisma 'userId' product_id: string; // Harmonisé avec Prisma 'productId' rating: number; comment?: string | null; created_at: string; updated_at: string;
}

export interface Notification { id: string; user_id: string; // Harmonisé avec Prisma 'userId' title: string; message: string; type: string; read: boolean; data?: Json; created_at: string; updated_at: string;
}

export interface PushSubscription { id: string; user_id: string; // Harmonisé avec Prisma 'userId' endpoint: string; p256dh: string; auth: string; created_at: string; updated_at: string;
}

export interface NotificationPreference { id: string; user_id: string; // Harmonisé avec Prisma 'userId' order_updates: boolean; promotions: boolean; newsletter: boolean; push_enabled: boolean; email_enabled: boolean; created_at: string; updated_at: string;
}

export interface CmsContent { id: string; : string; title?: string | null; content?: string | null; metadata?: Json; is_active: boolean; // Harmonisé avec Prisma 'isActive' created_at: string; updated_at: string;
}

// Database interface pour Supabase
export interface Database { public: { Tables: { users: { Row: User; Insert: Omit<User, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string; }; Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>> & { updated_at?: string; }; }; products: { Row: Product; Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string; }; Update: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>> & { updated_at?: string; }; }; orders: { Row: Order; Insert: Omit<Order, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string; }; Update: Partial<Omit<Order, 'id' | 'created_at' | 'updated_at'>> & { updated_at?: string; }; }; order_items: { Row: OrderItem; Insert: Omit<OrderItem, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string; }; Update: Partial<Omit<OrderItem, 'id' | 'created_at' | 'updated_at'>> & { updated_at?: string; }; }; reviews: { Row: Review; Insert: Omit<Review, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string; }; Update: Partial<Omit<Review, 'id' | 'created_at' | 'updated_at'>> & { updated_at?: string; }; }; notifications: { Row: Notification; Insert: Omit<Notification, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string; }; Update: Partial<Omit<Notification, 'id' | 'created_at' | 'updated_at'>> & { updated_at?: string; }; }; push_subscriptions: { Row: PushSubscription; Insert: Omit<PushSubscription, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string; }; Update: Partial<Omit<PushSubscription, 'id' | 'created_at' | 'updated_at'>> & { updated_at?: string; }; }; notification_preferences: { Row: NotificationPreference; Insert: Omit<NotificationPreference, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string; }; Update: Partial<Omit<NotificationPreference, 'id' | 'created_at' | 'updated_at'>> & { updated_at?: string; }; }; cms_content: { Row: CmsContent; Insert: Omit<CmsContent, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string; }; Update: Partial<Omit<CmsContent, 'id' | 'created_at' | 'updated_at'>> & { updated_at?: string; }; }; }; Views: { [_ in never]: never; }; Functions: { [_ in never]: never; }; Enums: { [_ in never]: never; }; CompositeTypes: { [_ in never]: never; }; };
}

// Types utilitaires
export type Tables<T extends of Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends of Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends of Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Exports pour compatibilité
export type { User, Product, Order, OrderItem, Review, Notification, PushSubscription, NotificationPreference, CmsContent };
`;

// 5. Sauvegarder les types harmonisés
fs.writeFileSync('src/types/supabase-harmonized.ts', harmonizedTypes);
console.log('✅ Types harmonisés générés: src/types/supabase-harmonized.ts');

// 6. Créer un guide de migration
const migrationGuide = `
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
| Notes | _notes | Notes  |
| estimatedDelivery | estimated_delivery | Livraison estimée |
| productId | product_id | ID produit |
| orderId | order_id | ID commande |
| userId | user_id | ID utilisateur |

## Actions Requises

### 1. Mise à jour du schéma Prisma
\`\`\`bash
npx prisma db push
npx prisma generate
\`\`\`

### 2. Application du schéma Supabase
\`\`\`bash
# Via Supabase CLI
supabase db reset
supabase db push

# Ou via SQL direct
psql $DATABASE_URL < supabase-harmonized-schema.sql
\`\`\`

### 3. Mise à jour des types
\`\`\`bash
# Remplacer l'ancien fichier de types
cp src/types/supabase-harmonized.ts src/types/supabase.ts
\`\`\`

### 4. Mise à jour du code
- Remplacer les imports \`from '@/types/supabase'\` par les nouveaux types
- Vérifier les mappings de champs dans les services
- er les requêtes Prisma et Supabase

## Vérification

\`\`\`bash
# er la connexion
node -db-connection.js

# Vérifier les types
npx tsc --noEmit

# er les services
npm 
\`\`\`

## Rollback

En cas de problème :
\`\`\`bash
# Restaurer les anciens types
git checkout HEAD~1 -- src/types/supabase.ts

# Restaurer le schéma Prisma
git checkout HEAD~1 -- prisma/schema.prisma
\`\`\`
`;

fs.writeFileSync('MIGRATION-HARMONIZATION.md', migrationGuide);
console.log('✅ Guide de migration créé: MIGRATION-HARMONIZATION.md');

console.log('\n🎉 Harmonisation terminée!');
console.log('📋 Fichiers générés:');
console.log('  - supabase-harmonized-schema.sql');
console.log('  - src/types/supabase-harmonized.ts');
console.log('  - MIGRATION-HARMONIZATION.md');
console.log('\n⚠️  Actions requises:');
console.log('  1. Appliquer le schéma Supabase');
console.log('  2. Mettre à jour Prisma');
console.log('  3. Remplacer les types');
console.log('  4. er les services');