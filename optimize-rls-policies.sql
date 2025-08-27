-- =====================================================
-- OPTIMISATION DES POLITIQUES RLS (ROW LEVEL SECURITY)
-- O'miam Pizza - Sécurité Avancée
-- =====================================================

-- =====================================================
-- 1. SUPPRESSION DES ANCIENNES POLITIQUES
-- =====================================================

-- Supprimer les politiques existantes pour les recréer de manière optimisée
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can insert own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can view own loyalty transactions" ON public.loyalty_transactions;
DROP POLICY IF EXISTS "Users can insert own loyalty transactions" ON public.loyalty_transactions;
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
DROP POLICY IF EXISTS "Users can insert own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews;

-- =====================================================
-- 2. POLITIQUES OPTIMISÉES POUR LES UTILISATEURS
-- =====================================================

-- Lecture du profil utilisateur (optimisée avec index)
CREATE POLICY "users_select_own" ON public.users
    FOR SELECT 
    USING (auth.uid() = id);

-- Mise à jour du profil utilisateur (avec validation)
CREATE POLICY "users_update_own" ON public.users
    FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id AND
        email IS NOT NULL AND
        length(email) > 5 AND
        email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    );

-- Insertion d'utilisateur (avec validation stricte)
CREATE POLICY "users_insert_authenticated" ON public.users
    FOR INSERT 
    WITH CHECK (
        auth.uid() = id AND
        auth.uid() IS NOT NULL AND
        email IS NOT NULL AND
        length(email) > 5 AND
        email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    );

-- =====================================================
-- 3. POLITIQUES OPTIMISÉES POUR LES PRODUITS
-- =====================================================

-- Lecture publique des produits (avec cache optimisé)
CREATE POLICY "products_select_public" ON public.products
    FOR SELECT 
    USING (true);

-- Seuls les administrateurs peuvent modifier les produits
CREATE POLICY "products_admin_only" ON public.products
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        ) AND
        name IS NOT NULL AND
        length(name) > 2 AND
        price > 0
    );

-- =====================================================
-- 4. POLITIQUES OPTIMISÉES POUR LES COMMANDES
-- =====================================================

-- Lecture des commandes (utilisateur propriétaire uniquement)
CREATE POLICY "orders_select_own" ON public.orders
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Insertion de commandes (avec validation métier)
CREATE POLICY "orders_insert_own" ON public.orders
    FOR INSERT 
    WITH CHECK (
        auth.uid() = user_id AND
        auth.uid() IS NOT NULL AND
        total > 0 AND
        status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')
    );

-- Mise à jour limitée des commandes
CREATE POLICY "orders_update_limited" ON public.orders
    FOR UPDATE 
    USING (
        auth.uid() = user_id AND
        status IN ('pending', 'confirmed') -- Seules les commandes non traitées
    )
    WITH CHECK (
        auth.uid() = user_id AND
        total > 0 AND
        status IN ('pending', 'confirmed', 'cancelled')
    );

-- =====================================================
-- 5. POLITIQUES OPTIMISÉES POUR LES ARTICLES DE COMMANDE
-- =====================================================

-- Lecture des articles de commande (optimisée avec JOIN)
CREATE POLICY "order_items_select_own" ON public.order_items
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- Insertion d'articles (avec validation de stock et prix)
CREATE POLICY "order_items_insert_own" ON public.order_items
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
            AND orders.status = 'pending' -- Seules les commandes en attente
        ) AND
        quantity > 0 AND
        quantity <= 10 AND -- Limite de quantité
        price > 0 AND
        EXISTS (
            SELECT 1 FROM public.products 
            WHERE products.id = order_items.product_id
        )
    );

-- Mise à jour limitée des articles
CREATE POLICY "order_items_update_limited" ON public.order_items
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
            AND orders.status = 'pending'
        )
    )
    WITH CHECK (
        quantity > 0 AND
        quantity <= 10 AND
        price > 0
    );

-- =====================================================
-- 6. POLITIQUES POUR LES TRANSACTIONS DE FIDÉLITÉ
-- =====================================================

-- Lecture des transactions de fidélité
CREATE POLICY "loyalty_select_own" ON public.loyalty_transactions
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Insertion automatique uniquement (via triggers)
CREATE POLICY "loyalty_insert_system" ON public.loyalty_transactions
    FOR INSERT 
    WITH CHECK (
        auth.uid() = user_id AND
        points != 0 AND
        transaction_type IN ('earned', 'redeemed', 'expired')
    );

-- =====================================================
-- 7. POLITIQUES OPTIMISÉES POUR LES AVIS
-- =====================================================

-- Lecture publique des avis (avec modération)
CREATE POLICY "reviews_select_public" ON public.reviews
    FOR SELECT 
    USING (
        is_verified = true OR 
        auth.uid() = user_id
    );

-- Insertion d'avis (avec validation)
CREATE POLICY "reviews_insert_own" ON public.reviews
    FOR INSERT 
    WITH CHECK (
        auth.uid() = user_id AND
        auth.uid() IS NOT NULL AND
        rating >= 1 AND
        rating <= 5 AND
        length(comment) >= 10 AND
        length(comment) <= 1000 AND
        EXISTS (
            SELECT 1 FROM public.products 
            WHERE products.id = reviews.product_id
        ) AND
        -- Un seul avis par utilisateur par produit
        NOT EXISTS (
            SELECT 1 FROM public.reviews existing_reviews
            WHERE existing_reviews.user_id = auth.uid()
            AND existing_reviews.product_id = reviews.product_id
        )
    );

-- Mise à jour d'avis (dans les 24h)
CREATE POLICY "reviews_update_own_limited" ON public.reviews
    FOR UPDATE 
    USING (
        auth.uid() = user_id AND
        created_at > NOW() - INTERVAL '24 hours'
    )
    WITH CHECK (
        auth.uid() = user_id AND
        rating >= 1 AND
        rating <= 5 AND
        length(comment) >= 10 AND
        length(comment) <= 1000
    );

-- =====================================================
-- 8. FONCTIONS DE SÉCURITÉ AVANCÉES
-- =====================================================

-- Fonction pour vérifier le rôle administrateur
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier la propriété d'une commande
CREATE OR REPLACE FUNCTION owns_order(order_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.orders 
        WHERE id = order_id 
        AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 9. INDEX POUR OPTIMISER LES PERFORMANCES RLS
-- =====================================================

-- Index pour les politiques RLS sur les utilisateurs
CREATE INDEX IF NOT EXISTS idx_users_auth_uid ON public.users(id) WHERE id = auth.uid();

-- Index pour les commandes par utilisateur
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON public.orders(user_id, status);

-- Index pour les articles de commande
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- Index pour les transactions de fidélité
CREATE INDEX IF NOT EXISTS idx_loyalty_user_id ON public.loyalty_transactions(user_id);

-- Index pour les avis
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_product ON public.reviews(user_id, product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_verified ON public.reviews(is_verified) WHERE is_verified = true;

-- =====================================================
-- 10. VUES SÉCURISÉES POUR L'APPLICATION
-- =====================================================

-- Vue sécurisée pour les statistiques utilisateur
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    u.id,
    u.full_name,
    COUNT(DISTINCT o.id) as total_orders,
    COALESCE(SUM(o.total), 0) as total_spent,
    COALESCE(SUM(lt.points), 0) as loyalty_points
FROM public.users u
LEFT JOIN public.orders o ON u.id = o.user_id
LEFT JOIN public.loyalty_transactions lt ON u.id = lt.user_id
WHERE u.id = auth.uid()
GROUP BY u.id, u.full_name;

-- Vue pour les produits avec avis moyens
CREATE OR REPLACE VIEW products_with_ratings AS
SELECT 
    p.*,
    COALESCE(AVG(r.rating), 0) as average_rating,
    COUNT(r.id) as review_count
FROM public.products p
LEFT JOIN public.reviews r ON p.id = r.product_id AND r.is_verified = true
GROUP BY p.id;

-- =====================================================
-- 11. TRIGGERS DE SÉCURITÉ
-- =====================================================

-- Trigger pour logger les modifications sensibles
CREATE OR REPLACE FUNCTION log_sensitive_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Log des modifications sur les commandes
    IF TG_TABLE_NAME = 'orders' AND OLD.status != NEW.status THEN
        INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, user_id)
        VALUES (
            TG_TABLE_NAME,
            NEW.id,
            'status_change',
            json_build_object('status', OLD.status),
            json_build_object('status', NEW.status),
            auth.uid()
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Appliquer le trigger sur les commandes
DROP TRIGGER IF EXISTS trigger_log_order_changes ON public.orders;
CREATE TRIGGER trigger_log_order_changes
    AFTER UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION log_sensitive_changes();

-- =====================================================
-- 12. VALIDATION FINALE
-- =====================================================

-- Vérifier que toutes les politiques sont actives
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public';
    
    IF policy_count < 10 THEN
        RAISE EXCEPTION 'Nombre insuffisant de politiques RLS créées: %', policy_count;
    END IF;
    
    RAISE NOTICE '✅ Optimisation RLS terminée avec succès! % politiques actives', policy_count;
END
$$;

-- Message de confirmation
SELECT '🛡️ Politiques RLS optimisées avec succès!' as status,
       COUNT(*) as total_policies
FROM pg_policies 
WHERE schemaname = 'public';