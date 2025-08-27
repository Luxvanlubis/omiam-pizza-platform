#!/usr/bin/env node

/**
 * Supabase Setup Helper Script
 * This script guides you through the Supabase project setup process
 * Run with: node supabase-setup.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout
});

function question(query) { return new Promise(resolve => rl.question(query, resolve));
}

async function setupSupabase() {
  console.log('🍕 Configuration Supabase pour OMIAM Pizza');
  console.log('='.repeat(50));
  console.log('\n📋 Étapes à suivre sur supabase.com :');
  console.log('1. Créer un compte sur https://supabase.com');
  console.log('2. Cliquer sur "New Project"');
  console.log('3. Remplir les informations suivantes :');
  
  const projectName = await question('\n📝 Nom du projet (ex: omiam-pizza): ') || 'omiam-pizza';
  const organization = await question('🏢 Organisation (laisser vide pour personnel): ') || 'Personal';
  const region = await question('🌍 Région (ex: us-east-1, eu-west-1): ') || 'us-east-1';
  const db = await question('🔐 Mot de passe DB (8+ caractères, ou laisser vide pour générer): ');
  const generated = db || Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  console.log('\n✅ Configuration recommandée :');
  console.log(`- Nom du projet: ${projectName}`);
  console.log(`- Organisation: ${organization}`);
  console.log(`- Région: ${region}`);
  console.log(`- Mot de passe DB: ${generated}`);
  
  console.log('\n🔗 Après création du projet, récupérez ces informations :');
  console.log('- Aller à Settings > API');
  console.log('- Copier "Project URL"');
  console.log('- Copier "Anon/Public Key"');
  console.log('- Copier "Service Role Key"');
  
  console.log('\n🗄️ Configuration de la base de données :');
  console.log('1. Aller à SQL Editor dans Supabase');
  console.log('2. Coller le script SQL ci-dessous :');
  
  const sqlScript = `-- Configuration OMIAM Pizza - Supabase
-- Exécuter dans SQL Editor de Supabase

-- Table des utilisateurs (extension de auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  address JSONB,
  loyalty_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des produits (pizzas, boissons, etc.)
CREATE TABLE public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  image_url TEXT,
  category TEXT NOT NULL,
  ingredients TEXT[],
  is_vegetarian BOOLEAN DEFAULT FALSE,
  is_vegan BOOLEAN DEFAULT FALSE,
  is_spicy BOOLEAN DEFAULT FALSE,
  preparation_time INTEGER DEFAULT 20,
  stock_quantity INTEGER DEFAULT 100,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des commandes
CREATE TABLE public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id),
  order_number TEXT UNIQUE NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT,
  delivery_address JSONB,
  notes TEXT,
  estimated_delivery_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des articles de commande
CREATE TABLE public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table de fidélité
CREATE TABLE public.loyalty_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id),
  points INTEGER NOT NULL,
  type TEXT NOT NULL, -- 'earned', 'redeemed', 'expired'
  order_id UUID REFERENCES public.orders(id),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des avis
CREATE TABLE public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id),
  product_id UUID REFERENCES public.products(id),
  order_id UUID REFERENCES public.orders(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  images TEXT[],
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Données de test
INSERT INTO public.products (name, description, price, category, ingredients, is_vegetarian, preparation_time) VALUES
('Margherita Classique', 'Tomate, mozzarella, basilic frais', 12.50, 'pizza', ARRAY['tomate', 'mozzarella', 'basilic'], true, 15),
('Pepperoni', 'Tomate, mozzarella, pepperoni', 14.00, 'pizza', ARRAY['tomate', 'mozzarella', 'pepperoni'], false, 18),
('Quatre Fromages', 'Mozzarella, gorgonzola, parmesan, chèvre', 15.50, 'pizza', ARRAY['mozzarella', 'gorgonzola', 'parmesan', 'chèvre'], true, 20),
('Végétarienne', 'Tomate, mozzarella, légumes grillés', 13.50, 'pizza', ARRAY['tomate', 'mozzarella', 'légumes grillés'], true, 18),
('Reine', 'Tomate, mozzarella, jambon, champignons', 14.50, 'pizza', ARRAY['tomate', 'mozzarella', 'jambon', 'champignons'], false, 20);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Policies pour users
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Policies pour products (lecture publique)
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins can manage products" ON public.products FOR ALL USING (
  auth.jwt() ->> 'role' = 'admin'
);

-- Policies pour orders
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own orders" ON public.orders FOR UPDATE USING (auth.uid() = user_id);

-- Policies pour reviews
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);

-- Fonction pour générer numéro de commande
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'OM-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 9999)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Trigger pour numéro de commande
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_order_number BEFORE INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION set_order_number();

-- Mise à jour automatique de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON public.order_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_loyalty_transactions_updated_at BEFORE UPDATE ON public.loyalty_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

  // Save SQL script
  fs.writeFileSync(path.join(__dirname, 'supabase-schema.sql'), sqlScript);
  
  console.log('\n💾 Script SQL sauvegardé dans: supabase-schema.sql');
  console.log('\n📋 Prochaines étapes :');
  console.log('1. Copier le script SQL dans SQL Editor de Supabase');
  console.log('2. Exécuter le script pour créer les tables');
  console.log('3. Remplacer .env.local avec vos clés Supabase');
  console.log('4. Redémarrer le serveur de développement');
  
  rl.close();
}

setupSupabase().catch(console.error);