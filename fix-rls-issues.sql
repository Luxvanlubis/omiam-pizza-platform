-- =====================================================
-- CORRECTION DES PROBLÈMES RLS DÉTECTÉS
-- O'miam Pizza - Corrections de Sécurité
-- =====================================================

-- =====================================================
-- 1. AJOUT DES COLONNES MANQUANTES
-- =====================================================

-- Ajouter la colonne is_verified à la table reviews
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

-- Ajouter la colonne role à la table users pour la gestion des admins
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator'));

-- Ajouter des colonnes utiles pour l'audit
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS images TEXT[];

ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- =====================================================
-- 2. CORRECTION DES POLITIQUES RLS DÉFAILLANTES
-- =====================================================

-- Supprimer les anciennes politiques problématiques
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
DROP POLICY IF EXISTS "Users can insert own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews;

-- =====================================================
-- 3. NOUVELLES POLITIQUES SÉCURISÉES
-- =====================================================

-- Politique pour les produits (lecture publique seulement)
CREATE POLICY "products_public_read_only" ON public.products
    FOR SELECT 
    USING (true);

-- Politique pour les produits (modification admin uniquement)
CREATE POLICY "products_admin_modify" ON public.products
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

-- Politique pour les avis (lecture des avis vérifiés + propres avis)
CREATE POLICY "reviews_public_verified_or_own" ON public.reviews
    FOR SELECT 
    USING (
        is_verified = true OR 
        auth.uid() = user_id
    );

-- Politique pour l'insertion d'avis (utilisateurs authentifiés)
CREATE POLICY "reviews_insert_authenticated" ON public.reviews
    FOR INSERT 
    WITH CHECK (
        auth.uid() = user_id AND
        auth.uid() IS NOT NULL AND
        rating >= 1 AND
        rating <= 5 AND
        (comment IS NULL OR length(comment) >= 10) AND
        (comment IS NULL OR length(comment) <= 1000) AND
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

-- Politique pour la mise à jour d'avis (propriétaire dans les 24h)
CREATE POLICY "reviews_update_own_24h" ON public.reviews
    FOR UPDATE 
    USING (
        auth.uid() = user_id AND
        created_at > NOW() - INTERVAL '24 hours'
    )
    WITH CHECK (
        auth.uid() = user_id AND
        rating >= 1 AND
        rating <= 5 AND
        (comment IS NULL OR length(comment) >= 10) AND
        (comment IS NULL OR length(comment) <= 1000)
    );

-- =====================================================
-- 4. CORRECTION DES POLITIQUES UTILISATEURS
-- =====================================================

-- Supprimer l'ancienne politique d'insertion utilisateur
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.users;

-- Nouvelle politique d'insertion avec validation email stricte
CREATE POLICY "users_insert_with_validation" ON public.users
    FOR INSERT 
    WITH CHECK (
        auth.uid() = id AND
        auth.uid() IS NOT NULL AND
        email IS NOT NULL AND
        length(email) > 5 AND
        email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
        (full_name IS NULL OR length(full_name) >= 2)
    );

-- Politique de mise à jour avec validation
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "users_update_with_validation" ON public.users
    FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id AND
        email IS NOT NULL AND
        length(email) > 5 AND
        email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
        (full_name IS NULL OR length(full_name) >= 2) AND
        role IN ('user', 'admin', 'moderator')
    );

-- =====================================================
-- 5. FONCTIONS DE SÉCURITÉ
-- =====================================================

-- Fonction pour vérifier si l'utilisateur est admin
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
-- 6. TRIGGERS POUR LES COLONNES UPDATED_AT
-- =====================================================

-- Trigger pour updated_at sur reviews
CREATE TRIGGER trigger_reviews_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. INDEX POUR OPTIMISER LES PERFORMANCES
-- =====================================================

-- Index pour les politiques RLS
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role) WHERE role = 'admin';
CREATE INDEX IF NOT EXISTS idx_reviews_verified ON public.reviews(is_verified) WHERE is_verified = true;
CREATE INDEX IF NOT EXISTS idx_reviews_user_product ON public.reviews(user_id, product_id);
CREATE INDEX IF NOT EXISTS idx_users_auth_uid ON public.users(id);

-- =====================================================
-- 8. DONNÉES DE TEST POUR VALIDATION
-- =====================================================

-- Créer un utilisateur admin de test (optionnel)
INSERT INTO public.users (id, email, full_name, role) 
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'admin@omiam.com',
    'Admin O\'miam',
    'admin'
) ON CONFLICT (id) DO UPDATE SET 
    role = 'admin',
    email = 'admin@omiam.com';

-- Marquer quelques avis comme vérifiés pour les tests
UPDATE public.reviews 
SET is_verified = true 
WHERE id IN (
    SELECT id FROM public.reviews 
    ORDER BY created_at DESC 
    LIMIT 3
);

-- =====================================================
-- 9. VALIDATION FINALE
-- =====================================================

-- Vérifier que toutes les politiques sont actives
DO $$
DECLARE
    policy_count INTEGER;
    table_count INTEGER;
BEGIN
    -- Compter les politiques
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public';
    
    -- Compter les tables avec RLS activé
    SELECT COUNT(*) INTO table_count
    FROM pg_class c
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public' 
    AND c.relkind = 'r'
    AND c.relrowsecurity = true;
    
    RAISE NOTICE '✅ Corrections RLS appliquées!';
    RAISE NOTICE '📊 Politiques actives: %', policy_count;
    RAISE NOTICE '🔒 Tables sécurisées: %', table_count;
    
    IF policy_count < 8 THEN
        RAISE WARNING 'Nombre de politiques insuffisant: %', policy_count;
    END IF;
END
$$;

-- Message de confirmation
SELECT 
    '🛡️ Corrections RLS terminées!' as status,
    COUNT(*) as total_policies,
    NOW() as timestamp
FROM pg_policies 
WHERE schemaname = 'public';