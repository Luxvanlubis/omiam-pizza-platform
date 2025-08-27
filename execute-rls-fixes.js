#!/usr/bin/env node

/**
 * 🛠️ Script d'Exécution Automatique - Corrections RLS
 * * Ce script applique automatiquement les corrections RLS
 * détectées par les s de sécurité.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseService = process.env.SUPABASE_SERVICE_ROLE_;

if (!supabaseUrl || !supabaseService) { console.error('❌ Variables d\'environnement manquantes:'); console.error(' - NEXT_PUBLIC_SUPABASE_URL'); console.error(' - SUPABASE_SERVICE_ROLE_); process.exit(1);
}

// Client Supabase avec clé service (permissions )
const supabase = createClient(supabaseUrl, supabaseService);

/**
 * 🔧 Exécute une requête SQL avec gestion d'erreur
 */
async function executeSQL(query, description) { console.log(`🔄 ${description}...`); try { const { data, error } = await supabase.rpc('exec_sql', { sql_query: query }); if (error) { console.error(`❌ Erreur ${description}:`, error.message); return false; } console.log(`✅ ${description} - Succès`); return true; } catch (err) { console.error(`❌ Exception ${description}:`, err.message); return false; }
}

/**
 * 🛠️ Applique les corrections RLS étape par étape
 */
async function applyRLSFixes() { console.log('🚀 Début des corrections RLS...'); console.log('=' .repeat(50)); const fixes = [ { name: 'Ajout colonne is_verified à reviews', sql: ` ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false; ` }, { name: 'Ajout colonne role à users', sql: ` ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer' CHECK (role IN ('customer', , 'moderator')); ` }, { name: 'Ajout colonnes updated_at', sql: ` ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(); ALTER TABLE public.products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(); ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(); ` }, { name: 'Suppression anciennes politiques products', sql: ` DROP POLICY IF EXISTS "Public can read products" ON public.products; DROP POLICY IF EXISTS "Users can insert products" ON public.products; DROP POLICY IF EXISTS "Users can update products" ON public.products; ` }, { name: 'Nouvelles politiques products sécurisées', sql: ` CREATE POLICY "products_public_read" ON public.products FOR SELECT USING (true); CREATE POLICY "products__write" ON public.products FOR ALL USING ( auth.uid() IS NOT NULL AND EXISTS ( SELECT 1 FROM public.users WHERE id = auth.uid() AND role = ) ); ` }, { name: 'Suppression anciennes politiques reviews', sql: ` DROP POLICY IF EXISTS "Public can read reviews" ON public.reviews; DROP POLICY IF EXISTS "Users can insert reviews" ON public.reviews; DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews; ` }, { name: 'Nouvelles politiques reviews avec vérification', sql: ` CREATE POLICY "reviews_verified_read" ON public.reviews FOR SELECT USING (is_verified = true); CREATE POLICY "reviews_user_insert" ON public.reviews FOR INSERT WITH CHECK ( auth.uid() = user_id AND NOT EXISTS ( SELECT 1 FROM public.reviews WHERE user_id = auth.uid() AND product_id = NEW.product_id ) ); CREATE POLICY "reviews_user_update" ON public.reviews FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); ` }, { name: 'Fonction de validation email', sql: ` CREATE OR REPLACE FUNCTION validate_email(email TEXT) RETURNS BOOLEAN AS $$ BEGIN RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'; END; $$ LANGUAGE plpgsql; ` }, { name: 'Fonction is_, sql: ` CREATE OR REPLACE FUNCTION is_() RETURNS BOOLEAN AS $$ BEGIN RETURN EXISTS ( SELECT 1 FROM public.users WHERE id = auth.uid() AND role = ); END; $$ LANGUAGE plpgsql SECURITY DEFINER; ` }, { name: 'Trigger validation email users', sql: ` CREATE OR REPLACE FUNCTION validate_user_email() RETURNS TRIGGER AS $$ BEGIN IF NOT validate_email(NEW.email) THEN RAISE EXCEPTION 'Format email invalide: %', NEW.email; END IF; RETURN NEW; END; $$ LANGUAGE plpgsql; DROP TRIGGER IF EXISTS validate_email_trigger ON public.users; CREATE TRIGGER validate_email_trigger BEFORE INSERT OR UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION validate_user_email(); ` }, { name: 'Index de performance RLS', sql: ` CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role); CREATE INDEX IF NOT EXISTS idx_reviews_verified ON public.reviews(is_verified); CREATE INDEX IF NOT EXISTS idx_reviews_user_product ON public.reviews(user_id, product_id); CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id); ` }, { name: 'Triggers updated_at', sql: ` CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql; DROP TRIGGER IF EXISTS update_users_updated_at ON public.users; CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); DROP TRIGGER IF EXISTS update_products_updated_at ON public.products; CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); DROP TRIGGER IF EXISTS update_reviews_updated_at ON public.reviews; CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); ` } ]; let successCount = 0; let totalFixes = fixes.length; for (const fix of fixes) { const success = await executeSQL(fix.sql, fix.name); if (success) { successCount++; } // Pause entre les corrections await new Promise(resolve => setTimeout(resolve, 500)); } console.log('=' .repeat(50)); console.log(`📊 Résultats: ${successCount}/${totalFixes} corrections appliquées`); if (successCount === totalFixes) { console.log('✅ Toutes les corrections RLS ont été appliquées avec succès!'); console.log('🔒 Votre application est maintenant sécurisée.'); return true; } else { console.log('⚠️  Certaines corrections ont échoué.'); console.log('📋 Consultez le guide EXECUTE-RLS-FIXES.md pour les étapes manuelles.'); return false; }
}

/**
 * 🧪 Vérifie que les corrections ont été appliquées
 */
async function verifyFixes() { console.log('\n🔍 Vérification des corrections...'); const checks = [ { name: 'Colonne is_verified dans reviews', sql: ` SELECT column_name FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'is_verified'; ` }, { name: 'Colonne role dans users', sql: ` SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role'; ` }, { name: 'Politiques RLS actives', sql: ` SELECT COUNT(*) as policy_count FROM pg_policies WHERE schemaname = 'public'; ` } ]; let verificationsPassed = 0; for (const check of checks) { try { const { data, error } = await supabase.rpc('exec_sql', { sql_query: check.sql }); if (!error && data && data.length > 0) { console.log(`✅ ${check.name} - OK`); verificationsPassed++; } else { console.log(`❌ ${check.name} - Échec`); } } catch (err) { console.log(`❌ ${check.name} - Erreur: ${err.message}`); } } return verificationsPassed === checks.length;
}

/**
 * 🚀 Fonction principale
 */
async function main() { console.log('🛠️  CORRECTEUR AUTOMATIQUE RLS - O\'miam Pizza'); console.log('🔒 Application des corrections de sécurité...'); console.log(''); try { //  de connexion const { data: Data, error: Error } = await supabase .from('users') .select('count') .limit(1); if (Error) { console.error('❌ Impossible de se connecter à Supabase:', Error.message); process.exit(1); } console.log('✅ Connexion Supabase établie'); // Application des corrections const fixesApplied = await applyRLSFixes(); if (fixesApplied) { // Vérification const verificationsOK = await verifyFixes(); if (verificationsOK) { console.log('\n🎉 SUCCÈS COMPLET!'); console.log('🔒 Toutes les corrections RLS ont été appliquées et vérifiées.'); console.log('\n📋 Prochaines étapes:'); console.log(' 1. Lancez: node -rls-security.js'); console.log(' 2. Vérifiez que tous les s passent'); console.log(' 3. ez l\'authentification sur http://localhost:3001/-auth'); process.exit(0); } else { console.log('\n⚠️  Corrections appliquées mais vérifications partielles.'); process.exit(1); } } else { console.log('\n❌ Échec de l\'application des corrections.'); console.log('📋 Consultez EXECUTE-RLS-FIXES.md pour les étapes manuelles.'); process.exit(1); } } catch (error) { console.error('💥 Erreur critique:', error.message); console.log('\n🆘 Solutions:'); console.log(' 1. Vérifiez vos variables d\'environnement'); console.log(' 2. Assurez-vous d\'avoir les permissions ); console.log(' 3. Consultez EXECUTE-RLS-FIXES.md pour l\'exécution manuelle'); process.exit(1); }
}

// Exécution du script
if (require.main === module) { main();
}

module.exports = { applyRLSFixes, verifyFixes };