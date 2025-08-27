-- Migration pour créer les tables CMS
-- Créé le: 2024-01-15
-- Description: Tables pour le système de gestion de contenu (CMS)

-- Table principale pour les éléments de contenu
CREATE TABLE IF NOT EXISTS content_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('text', 'title', 'description', 'button', 'link', 'image', 'video', 'html')),
    page VARCHAR(100) NOT NULL,
    section VARCHAR(100) NOT NULL,
    metadata JSONB DEFAULT '{}',
    is_published BOOLEAN DEFAULT false,
    version INTEGER DEFAULT 1,
    tags TEXT[] DEFAULT '{}',
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Table pour l'historique des versions
CREATE TABLE IF NOT EXISTS content_versions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_id UUID REFERENCES content_items(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    change_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(content_id, version)
);

-- Table pour les templates de contenu
CREATE TABLE IF NOT EXISTS content_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    default_content TEXT NOT NULL,
    default_metadata JSONB DEFAULT '{}',
    fields JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Table pour les médias (images, vidéos, etc.)
CREATE TABLE IF NOT EXISTS content_media (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size_bytes BIGINT NOT NULL,
    width INTEGER,
    height INTEGER,
    alt_text TEXT,
    description TEXT,
    tags TEXT[] DEFAULT '{}',
    storage_path TEXT NOT NULL,
    public_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Table pour les catégories de contenu
CREATE TABLE IF NOT EXISTS content_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES content_categories(id),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table de liaison entre contenu et catégories
CREATE TABLE IF NOT EXISTS content_item_categories (
    content_id UUID REFERENCES content_items(id) ON DELETE CASCADE,
    category_id UUID REFERENCES content_categories(id) ON DELETE CASCADE,
    PRIMARY KEY (content_id, category_id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_content_items_key ON content_items(key);
CREATE INDEX IF NOT EXISTS idx_content_items_page ON content_items(page);
CREATE INDEX IF NOT EXISTS idx_content_items_type ON content_items(type);
CREATE INDEX IF NOT EXISTS idx_content_items_published ON content_items(is_published);
CREATE INDEX IF NOT EXISTS idx_content_items_updated_at ON content_items(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_items_tags ON content_items USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_content_versions_content_id ON content_versions(content_id);
CREATE INDEX IF NOT EXISTS idx_content_versions_version ON content_versions(content_id, version DESC);
CREATE INDEX IF NOT EXISTS idx_content_media_tags ON content_media USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_content_categories_slug ON content_categories(slug);
CREATE INDEX IF NOT EXISTS idx_content_categories_parent ON content_categories(parent_id);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_content_items_updated_at 
    BEFORE UPDATE ON content_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour créer automatiquement une version lors de la mise à jour
CREATE OR REPLACE FUNCTION create_content_version()
RETURNS TRIGGER AS $$
BEGIN
    -- Créer une nouvelle version si le contenu, le titre ou les métadonnées ont changé
    IF (OLD.content IS DISTINCT FROM NEW.content) OR 
       (OLD.title IS DISTINCT FROM NEW.title) OR 
       (OLD.metadata IS DISTINCT FROM NEW.metadata) THEN
        
        INSERT INTO content_versions (
            content_id,
            version,
            title,
            content,
            metadata,
            created_by,
            change_note
        ) VALUES (
            NEW.id,
            NEW.version,
            NEW.title,
            NEW.content,
            NEW.metadata,
            NEW.updated_by,
            'Mise à jour automatique'
        );
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour créer automatiquement les versions
CREATE TRIGGER create_content_version_trigger
    AFTER UPDATE ON content_items
    FOR EACH ROW EXECUTE FUNCTION create_content_version();

-- Fonction pour obtenir les statistiques CMS
CREATE OR REPLACE FUNCTION get_cms_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_content', (
            SELECT COUNT(*) FROM content_items
        ),
        'published_content', (
            SELECT COUNT(*) FROM content_items WHERE is_published = true
        ),
        'draft_content', (
            SELECT COUNT(*) FROM content_items WHERE is_published = false
        ),
        'total_pages', (
            SELECT COUNT(DISTINCT page) FROM content_items
        ),
        'recent_updates', (
            SELECT COUNT(*) FROM content_items 
            WHERE updated_at > NOW() - INTERVAL '24 hours'
        ),
        'content_by_type', (
            SELECT json_object_agg(type, count) 
            FROM (
                SELECT type, COUNT(*) as count 
                FROM content_items 
                GROUP BY type
            ) t
        ),
        'content_by_page', (
            SELECT json_object_agg(page, count) 
            FROM (
                SELECT page, COUNT(*) as count 
                FROM content_items 
                GROUP BY page
            ) t
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Politiques RLS (Row Level Security)
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_categories ENABLE ROW LEVEL SECURITY;

-- Politique pour les éléments de contenu (lecture publique pour le contenu publié)
CREATE POLICY "Public can read published content" ON content_items
    FOR SELECT USING (is_published = true);

-- Politique pour les administrateurs (accès complet)
CREATE POLICY "Admins can do everything on content" ON content_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Politique pour les éditeurs (peuvent créer et modifier)
CREATE POLICY "Editors can create and update content" ON content_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin', 'editor')
        )
    );

CREATE POLICY "Editors can update content" ON content_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin', 'editor')
        )
    );

-- Politiques similaires pour les autres tables
CREATE POLICY "Admins can manage versions" ON content_versions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Admins can manage templates" ON content_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Admins can manage media" ON content_media
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Public can read categories" ON content_categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage categories" ON content_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Insérer quelques données de test
INSERT INTO content_items (key, title, content, type, page, section, is_published, created_by, updated_by) VALUES
('hero.title', 'Titre Principal', 'Bienvenue chez OMIAM - Saveurs Authentiques du Maroc', 'title', 'home', 'hero', true, (SELECT id FROM auth.users LIMIT 1), (SELECT id FROM auth.users LIMIT 1)),
('hero.description', 'Description Hero', 'Découvrez nos plats traditionnels marocains préparés avec amour et des ingrédients frais.', 'description', 'home', 'hero', true, (SELECT id FROM auth.users LIMIT 1), (SELECT id FROM auth.users LIMIT 1)),
('hero.cta', 'Bouton CTA', 'Commander maintenant', 'button', 'home', 'hero', true, (SELECT id FROM auth.users LIMIT 1), (SELECT id FROM auth.users LIMIT 1)),
('about.title', 'Titre À propos', 'Notre Histoire', 'title', 'about', 'main', true, (SELECT id FROM auth.users LIMIT 1), (SELECT id FROM auth.users LIMIT 1)),
('about.content', 'Contenu À propos', 'OMIAM est né de la passion pour la cuisine marocaine authentique. Depuis 2020, nous servons des plats traditionnels dans une ambiance chaleureuse.', 'text', 'about', 'main', true, (SELECT id FROM auth.users LIMIT 1), (SELECT id FROM auth.users LIMIT 1)),
('contact.phone', 'Téléphone', '+33 1 23 45 67 89', 'text', 'contact', 'info', true, (SELECT id FROM auth.users LIMIT 1), (SELECT id FROM auth.users LIMIT 1)),
('contact.email', 'Email', 'contact@omiam.fr', 'text', 'contact', 'info', true, (SELECT id FROM auth.users LIMIT 1), (SELECT id FROM auth.users LIMIT 1)),
('contact.address', 'Adresse', '123 Rue de la Paix, 75001 Paris', 'text', 'contact', 'info', true, (SELECT id FROM auth.users LIMIT 1), (SELECT id FROM auth.users LIMIT 1))
ON CONFLICT (key) DO NOTHING;

-- Insérer quelques templates de base
INSERT INTO content_templates (name, description, type, default_content, fields) VALUES
('Page Title', 'Template pour les titres de page', 'title', 'Nouveau Titre', '[{"name":"title","type":"text","label":"Titre","required":true}]'),
('Hero Section', 'Template pour les sections hero', 'description', 'Description de la section hero', '[{"name":"title","type":"text","label":"Titre","required":true},{"name":"description","type":"textarea","label":"Description","required":true},{"name":"cta_text","type":"text","label":"Texte du bouton","required":false}]'),
('Contact Info', 'Template pour les informations de contact', 'text', 'Information de contact', '[{"name":"type","type":"select","label":"Type","required":true,"options":["phone","email","address"]},{"name":"value","type":"text","label":"Valeur","required":true}]')
ON CONFLICT DO NOTHING;

-- Insérer quelques catégories de base
INSERT INTO content_categories (name, slug, description) VALUES
('Pages principales', 'main-pages', 'Contenu des pages principales du site'),
('Navigation', 'navigation', 'Éléments de navigation et menus'),
('Footer', 'footer', 'Contenu du pied de page'),
('SEO', 'seo', 'Contenu lié au référencement')
ON CONFLICT (slug) DO NOTHING;

COMMIT;