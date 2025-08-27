-- Script SQL pour créer la table CMS content_items
-- À exécuter directement dans l'interface Supabase

-- Créer la table content_items
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
    created_by UUID,
    updated_by UUID
);

-- Créer les index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_content_items_key ON content_items(key);
CREATE INDEX IF NOT EXISTS idx_content_items_page ON content_items(page);
CREATE INDEX IF NOT EXISTS idx_content_items_type ON content_items(type);
CREATE INDEX IF NOT EXISTS idx_content_items_published ON content_items(is_published);
CREATE INDEX IF NOT EXISTS idx_content_items_updated_at ON content_items(updated_at DESC);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour updated_at
CREATE TRIGGER update_content_items_updated_at 
    BEFORE UPDATE ON content_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Activer RLS (Row Level Security)
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;

-- Politique pour la lecture publique du contenu publié
CREATE POLICY "Public can read published content" ON content_items
    FOR SELECT USING (is_published = true);

-- Politique pour les utilisateurs authentifiés (peuvent tout faire)
CREATE POLICY "Authenticated users can manage content" ON content_items
    FOR ALL USING (auth.role() = 'authenticated');

-- Insérer des données de test
INSERT INTO content_items (key, title, content, type, page, section, is_published) VALUES
('hero.title', 'Titre Principal', 'Bienvenue chez OMIAM - Saveurs Authentiques du Maroc', 'title', 'home', 'hero', true),
('hero.description', 'Description Hero', 'Découvrez nos plats traditionnels marocains préparés avec amour et des ingrédients frais.', 'description', 'home', 'hero', true),
('hero.cta', 'Bouton CTA', 'Commander maintenant', 'button', 'home', 'hero', true),
('about.title', 'Titre À propos', 'Notre Histoire', 'title', 'about', 'main', true),
('about.content', 'Contenu À propos', 'OMIAM est né de la passion pour la cuisine marocaine authentique. Depuis 2020, nous servons des plats traditionnels dans une ambiance chaleureuse.', 'text', 'about', 'main', true),
('contact.phone', 'Téléphone', '+33 1 23 45 67 89', 'text', 'contact', 'info', true),
('contact.email', 'Email', 'contact@omiam.fr', 'text', 'contact', 'info', true),
('contact.address', 'Adresse', '123 Rue de la Paix, 75001 Paris', 'text', 'contact', 'info', true)
ON CONFLICT (key) DO NOTHING;