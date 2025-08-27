-- =====================================================
-- OMIAM PIZZA - SUPABASE DATABASE SCHEMA
-- =====================================================
-- Ce script configure la base de données complète pour OMIAM Pizza
-- Incluant : tables, RLS, fonctions, triggers et données de test

-- =====================================================
-- 1. SUPPRESSION DES TABLES EXISTANTES (si nécessaire)
-- =====================================================
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.loyalty_transactions CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- =====================================================
-- 2. CRÉATION DES TABLES
-- =====================================================

-- Table des utilisateurs
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    loyalty_points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des produits
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    image_url TEXT,
    available BOOLEAN DEFAULT true,
    ingredients TEXT[],
    allergens TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des commandes
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    order_number VARCHAR(20) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    delivery_address TEXT,
    phone VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des articles de commande
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des transactions de fidélité
CREATE TABLE public.loyalty_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    points INTEGER NOT NULL,
    transaction_type VARCHAR(20) NOT NULL, -- 'earned' ou 'spent'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des avis
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. FONCTIONS ET TRIGGERS
-- =====================================================

-- Fonction pour générer un numéro de commande unique
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    counter INTEGER := 1;
BEGIN
    LOOP
        new_number := 'OM' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(counter::TEXT, 4, '0');
        
        IF NOT EXISTS (SELECT 1 FROM public.orders WHERE order_number = new_number) THEN
            RETURN new_number;
        END IF;
        
        counter := counter + 1;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour générer automatiquement le numéro de commande
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        NEW.order_number := generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_order_number
    BEFORE INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION set_order_number();

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. POLITIQUES RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Politiques pour les utilisateurs
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Politiques pour les produits (lecture publique)
CREATE POLICY "Products are viewable by everyone" ON public.products
    FOR SELECT USING (true);

-- Politiques pour les commandes
CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders" ON public.orders
    FOR UPDATE USING (auth.uid() = user_id);

-- Politiques pour les articles de commande
CREATE POLICY "Users can view own order items" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own order items" ON public.order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- Politiques pour les transactions de fidélité
CREATE POLICY "Users can view own loyalty transactions" ON public.loyalty_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own loyalty transactions" ON public.loyalty_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politiques pour les avis
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own reviews" ON public.reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON public.reviews
    FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- 5. DONNÉES DE TEST
-- =====================================================

-- Insertion des produits de test
INSERT INTO public.products (name, description, price, category, image_url, ingredients, allergens) VALUES
('Pizza Margherita', 'Pizza classique avec tomate, mozzarella et basilic frais', 12.90, 'pizzas', '/images/pizza-margherita.jpg', ARRAY['tomate', 'mozzarella', 'basilic', 'huile d''olive'], ARRAY['gluten', 'lactose']),
('Pizza Pepperoni', 'Pizza avec sauce tomate, mozzarella et pepperoni', 15.90, 'pizzas', '/images/pizza-pepperoni.jpg', ARRAY['tomate', 'mozzarella', 'pepperoni'], ARRAY['gluten', 'lactose']),
('Pizza Quattro Stagioni', 'Pizza aux quatre saisons avec champignons, jambon, artichauts et olives', 17.90, 'pizzas', '/images/pizza-quattro.jpg', ARRAY['tomate', 'mozzarella', 'champignons', 'jambon', 'artichauts', 'olives'], ARRAY['gluten', 'lactose']),
('Pizza Végétarienne', 'Pizza avec légumes grillés et fromage de chèvre', 16.90, 'pizzas', '/images/pizza-vegetarienne.jpg', ARRAY['tomate', 'courgettes', 'aubergines', 'poivrons', 'fromage de chèvre'], ARRAY['gluten', 'lactose']),
('Calzone Classique', 'Pizza fermée avec jambon, champignons et mozzarella', 14.90, 'pizzas', '/images/calzone.jpg', ARRAY['tomate', 'jambon', 'champignons', 'mozzarella'], ARRAY['gluten', 'lactose']),
('Salade César', 'Salade romaine, croûtons, parmesan et sauce César', 9.90, 'salades', '/images/salade-cesar.jpg', ARRAY['salade romaine', 'croûtons', 'parmesan', 'sauce césar'], ARRAY['gluten', 'lactose', 'œufs']),
('Salade Méditerranéenne', 'Salade mixte avec tomates, olives, feta et vinaigrette', 11.90, 'salades', '/images/salade-mediterraneenne.jpg', ARRAY['salade mixte', 'tomates', 'olives', 'feta', 'concombre'], ARRAY['lactose']),
('Tiramisu', 'Dessert italien traditionnel au café et mascarpone', 6.90, 'desserts', '/images/tiramisu.jpg', ARRAY['mascarpone', 'café', 'biscuits', 'cacao'], ARRAY['gluten', 'lactose', 'œufs']),
('Panna Cotta', 'Dessert crémeux aux fruits rouges', 5.90, 'desserts', '/images/panna-cotta.jpg', ARRAY['crème', 'fruits rouges', 'gélatine'], ARRAY['lactose']),
('Coca-Cola', 'Boisson gazeuse 33cl', 2.50, 'boissons', '/images/coca-cola.jpg', ARRAY['eau gazéifiée', 'sucre', 'caféine'], ARRAY[]::text[]),
('Eau Minérale', 'Eau minérale naturelle 50cl', 1.90, 'boissons', '/images/eau-minerale.jpg', ARRAY['eau minérale'], ARRAY[]::text[]),
('Bière Artisanale', 'Bière blonde artisanale 33cl', 4.50, 'boissons', '/images/biere-artisanale.jpg', ARRAY['malt', 'houblon', 'levure'], ARRAY['gluten']);

-- Insertion d'un utilisateur de test (optionnel - sera créé via l'authentification)
-- Note: En production, les utilisateurs seront créés via Supabase Auth

-- =====================================================
-- 6. INDEX POUR LES PERFORMANCES
-- =====================================================

-- Index sur les colonnes fréquemment utilisées
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX idx_loyalty_transactions_user_id ON public.loyalty_transactions(user_id);
CREATE INDEX idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_available ON public.products(available);

-- =====================================================
-- 7. VUES UTILES (OPTIONNEL)
-- =====================================================

-- Vue pour les statistiques des commandes
CREATE OR REPLACE VIEW order_stats AS
SELECT 
    DATE(created_at) as order_date,
    COUNT(*) as total_orders,
    SUM(total_amount) as total_revenue,
    AVG(total_amount) as average_order_value
FROM public.orders
GROUP BY DATE(created_at)
ORDER BY order_date DESC;

-- Vue pour les produits populaires
CREATE OR REPLACE VIEW popular_products AS
SELECT 
    p.id,
    p.name,
    p.category,
    COUNT(oi.id) as order_count,
    SUM(oi.quantity) as total_quantity,
    AVG(r.rating) as average_rating
FROM public.products p
LEFT JOIN public.order_items oi ON p.id = oi.product_id
LEFT JOIN public.reviews r ON p.id = r.product_id
GROUP BY p.id, p.name, p.category
ORDER BY order_count DESC, total_quantity DESC;

-- =====================================================
-- SCRIPT TERMINÉ AVEC SUCCÈS
-- =====================================================

-- Pour vérifier que tout fonctionne :
-- SELECT * FROM public.products LIMIT 5;
-- SELECT * FROM public.users LIMIT 5;

-- Message de confirmation
SELECT 'Base de données OMIAM Pizza configurée avec succès!' as status,
       'Tables créées: users, products, orders, order_items, loyalty_transactions, reviews' as tables,
       'RLS activé et politiques configurées' as security,
       'Données de test insérées' as data;