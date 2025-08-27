# 🛠️ Application Manuelle des Corrections RLS

> **Solution de contournement - Docker/Supabase local indisponible**

---

## 🚨 Situation Actuelle

- ❌ **Docker** non disponible ou non démarré
- ❌ **Supabase local** inaccessible (localhost:54321)
- ⚠️ **Tests RLS** ont révélé des failles de sécurité (60% de réussite)

---

## 🎯 Solutions Alternatives

### 🔄 **Option 1 : Supabase Cloud Dashboard**

1. **Accédez à votre projet Supabase Cloud**
   - Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Sélectionnez votre projet O'miam Pizza

2. **Ouvrez l'éditeur SQL**
   - Menu gauche → "SQL Editor"
   - Cliquez sur "New Query"

3. **Exécutez le script de correction**
   - Copiez le contenu de `fix-rls-issues.sql`
   - Collez dans l'éditeur
   - Cliquez sur "Run"

### 🔄 **Option 2 : Démarrer Docker et Supabase Local**

1. **Démarrer Docker Desktop**
   ```powershell
   # Ouvrir Docker Desktop manuellement
   # Ou via PowerShell en tant qu'administrateur
   Start-Process "Docker Desktop"
   ```

2. **Attendre que Docker soit prêt** (2-3 minutes)

3. **Démarrer Supabase local**
   ```powershell
   npx supabase start
   ```

4. **Relancer le script automatique**
   ```powershell
   node execute-rls-fixes.js
   ```

### 🔄 **Option 3 : Configuration Cloud Directe**

Si vous préférez utiliser Supabase Cloud directement :

1. **Modifier les variables d'environnement**
   ```env
   # Dans .env - Remplacer par vos vraies URLs Supabase Cloud
   NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=votre-service-role-key
   ```

2. **Relancer le script**
   ```powershell
   node execute-rls-fixes.js
   ```

---

## 📋 Script SQL à Exécuter Manuellement

**Si vous choisissez l'option manuelle, voici le SQL complet :**

```sql
-- 1. Ajout des colonnes manquantes
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer' 
CHECK (role IN ('customer', 'admin', 'moderator'));

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Suppression des anciennes politiques
DROP POLICY IF EXISTS "Public can read products" ON public.products;
DROP POLICY IF EXISTS "Users can insert products" ON public.products;
DROP POLICY IF EXISTS "Users can update products" ON public.products;
DROP POLICY IF EXISTS "Public can read reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can insert reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews;

-- 3. Nouvelles politiques sécurisées
-- Products : Lecture publique, écriture admin seulement
CREATE POLICY "products_public_read" ON public.products
FOR SELECT USING (true);

CREATE POLICY "products_admin_write" ON public.products
FOR ALL USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Reviews : Seuls les avis vérifiés sont visibles
CREATE POLICY "reviews_verified_read" ON public.reviews
FOR SELECT USING (is_verified = true);

CREATE POLICY "reviews_user_insert" ON public.reviews
FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  NOT EXISTS (
    SELECT 1 FROM public.reviews 
    WHERE user_id = auth.uid() AND product_id = NEW.product_id
  )
);

CREATE POLICY "reviews_user_update" ON public.reviews
FOR UPDATE USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Fonctions de sécurité
CREATE OR REPLACE FUNCTION validate_email(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Triggers de validation
CREATE OR REPLACE FUNCTION validate_user_email()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT validate_email(NEW.email) THEN
    RAISE EXCEPTION 'Format email invalide: %', NEW.email;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_email_trigger ON public.users;
CREATE TRIGGER validate_email_trigger
BEFORE INSERT OR UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION validate_user_email();

-- 6. Triggers updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON public.reviews;
CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Index de performance
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_reviews_verified ON public.reviews(is_verified);
CREATE INDEX IF NOT EXISTS idx_reviews_user_product ON public.reviews(user_id, product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);

-- Message de confirmation
SELECT 'Corrections RLS appliquées avec succès!' as status;
```

---

## ✅ Validation Post-Application

### 🧪 **Test Rapide**

Après avoir appliqué les corrections, testez :

```sql
-- Vérifier les nouvelles colonnes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('users', 'reviews') 
AND column_name IN ('role', 'is_verified', 'updated_at');

-- Vérifier les politiques
SELECT tablename, policyname, cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Test de lecture produits (doit fonctionner)
SELECT COUNT(*) FROM public.products;
```

### 🔄 **Test Automatisé**

Une fois les corrections appliquées :

```powershell
# Relancer les tests de sécurité
node test-rls-security.js
```

**Résultat attendu :** 100% de réussite (au lieu de 60%)

---

## 🚀 Prochaines Étapes

1. ✅ **Appliquer les corrections RLS** (via une des 3 options)
2. 🧪 **Valider avec les tests** (`node test-rls-security.js`)
3. 🔐 **Tester l'authentification** sur `http://localhost:3001/test-auth`
4. 🛒 **Passer au système de commandes** (prochaine tâche)

---

## 📞 Support

### ❌ **Problème Docker**
- Installer Docker Desktop
- Redémarrer en tant qu'administrateur
- Attendre le démarrage complet

### ❌ **Problème Supabase Local**
- Utiliser Supabase Cloud à la place
- Modifier les variables d'environnement
- Exécuter le SQL manuellement

### ❌ **Erreurs SQL**
- Vérifier les permissions
- Exécuter ligne par ligne
- Consulter les logs Supabase

---

**🎯 Objectif :** Sécuriser l'application avec des politiques RLS optimisées.

**⏱️ Temps estimé :** 10-15 minutes selon la méthode choisie.

*Guide créé automatiquement - Janvier 2024*