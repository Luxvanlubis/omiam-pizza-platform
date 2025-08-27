# 🚀 Configuration CMS OMIAM - Instructions Finales

## ⚠️ Action Requise : Création de la Table CMS

La table `content_items` doit être créée manuellement via l'interface Supabase Dashboard.

### 📋 Étapes à Suivre :

1. **Ouvrir Supabase Dashboard**
   - Aller sur : https://supabase.com/dashboard
   - Se connecter avec votre compte
   - Sélectionner le projet OMIAM

2. **Accéder à l'Éditeur SQL**
   - Dans le menu latéral, cliquer sur "SQL Editor"
   - Cliquer sur "New Query"

3. **Exécuter le Script SQL**
   - Copier le contenu du fichier `scripts/create-cms-table.sql`
   - Coller dans l'éditeur SQL
   - Cliquer sur "Run" pour exécuter

4. **Vérifier la Création**
   - Aller dans "Table Editor"
   - Vérifier que la table `content_items` apparaît
   - Vérifier que les données de test sont présentes

### 🔧 Script SQL à Exécuter :

```sql
-- Créer la table content_items
CREATE TABLE IF NOT EXISTS public.content_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
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

-- Créer les index
CREATE INDEX IF NOT EXISTS idx_content_items_key ON public.content_items(key);
CREATE INDEX IF NOT EXISTS idx_content_items_page ON public.content_items(page);
CREATE INDEX IF NOT EXISTS idx_content_items_type ON public.content_items(type);
CREATE INDEX IF NOT EXISTS idx_content_items_published ON public.content_items(is_published);
CREATE INDEX IF NOT EXISTS idx_content_items_page_section ON public.content_items(page, section);

-- Fonction pour updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS update_content_items_updated_at ON public.content_items;
CREATE TRIGGER update_content_items_updated_at
  BEFORE UPDATE ON public.content_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Activer RLS
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;

-- Politique pour lecture publique
DROP POLICY IF EXISTS "Public can read published content" ON public.content_items;
CREATE POLICY "Public can read published content"
  ON public.content_items FOR SELECT
  USING (is_published = true);

-- Politique pour gestion par utilisateurs authentifiés
DROP POLICY IF EXISTS "Authenticated users can manage content" ON public.content_items;
CREATE POLICY "Authenticated users can manage content"
  ON public.content_items FOR ALL
  USING (auth.role() = 'authenticated');

-- Insérer des données de test
INSERT INTO public.content_items (key, title, content, type, page, section, is_published, metadata) VALUES
('hero.title', 'Titre Principal', 'Bienvenue chez OMIAM - Saveurs Authentiques du Maroc', 'title', 'home', 'hero', true, '{"priority": "high", "featured": true}'),
('hero.description', 'Description Hero', 'Découvrez nos plats traditionnels marocains préparés avec amour et des ingrédients frais.', 'description', 'home', 'hero', true, '{"style": "large"}'),
('hero.cta', 'Bouton CTA', 'Commander maintenant', 'button', 'home', 'hero', true, '{"variant": "primary", "size": "large"}'),
('about.title', 'Titre À propos', 'Notre Histoire', 'title', 'about', 'main', true, '{"level": "h2"}'),
('about.content', 'Contenu À propos', 'OMIAM est né de la passion pour la cuisine marocaine authentique. Depuis 2020, nous servons des plats traditionnels dans une ambiance chaleureuse.', 'text', 'about', 'main', true, '{"format": "paragraph"}'),
('contact.phone', 'Téléphone', '+33 1 23 45 67 89', 'text', 'contact', 'info', true, '{"format": "phone", "icon": "phone"}'),
('contact.email', 'Email', 'contact@omiam.fr', 'text', 'contact', 'info', true, '{"format": "email", "icon": "mail"}'),
('contact.address', 'Adresse', '123 Rue de la Paix, 75001 Paris', 'text', 'contact', 'info', true, '{"format": "address", "icon": "map-pin"}'),
('menu.featured.title', 'Nos Spécialités', 'Découvrez nos plats signature', 'title', 'menu', 'featured', true, '{"level": "h2", "style": "featured"}'),
('footer.copyright', 'Copyright', '© 2024 OMIAM. Tous droits réservés.', 'text', 'global', 'footer', true, '{"position": "bottom"}')
ON CONFLICT (key) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();
```

### ✅ Après Exécution :

1. **Vérifier l'Interface Admin**
   - Aller sur : http://localhost:3000/admin
   - Cliquer sur "Gestion de Contenu"
   - Vérifier que les données apparaissent

2. **Tester la Modification**
   - Modifier un élément de contenu
   - Vérifier que les changements sont sauvegardés

3. **Vérifier l'Affichage Public**
   - Aller sur la page d'accueil
   - Vérifier que le contenu CMS s'affiche correctement

### 🎯 Fonctionnalités CMS Disponibles :

- ✅ **Interface d'administration** complète
- ✅ **Gestion de contenu** par page et section
- ✅ **Système de publication** (publié/brouillon)
- ✅ **Métadonnées** flexibles (JSON)
- ✅ **Versioning** automatique
- ✅ **Recherche** et filtrage
- ✅ **Import/Export** de contenu
- ✅ **Statistiques** CMS

### 🚀 Prochaines Étapes :

1. Exécuter le script SQL dans Supabase Dashboard
2. Tester l'interface CMS
3. Personnaliser le contenu selon vos besoins
4. Intégrer le CMS dans vos pages existantes

---

**📞 Support** : En cas de problème, vérifiez les logs dans la console du navigateur et les erreurs Supabase dans le dashboard.