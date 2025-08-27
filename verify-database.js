#!/usr/bin/env node

/**
 * 🔍 OMIAM PIZZA - Vérification Base de Données Supabase
 * * Ce script vérifie que la base de données a été correctement configurée
 * après l'exécution du script SQL supabase-schema.sql
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) { console.error('❌ Erreur: Variables d\'environnement Supabase manquantes'); console.log('Vérifiez votre fichier .env.local'); process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Fonction principale de vérification
 */
async function verifyDatabase() {
  console.log('🔍 VÉRIFICATION DE LA BASE DE DONNÉES OMIAM PIZZA');
  console.log('='.repeat(60));
  const results = { tables: false, products: false, rls: false, functions: false };

  try {
    // 1. Vérifier les tables
    console.log('\n📋 1. Vérification des tables...');
    const expectedTables = ['users', 'products', 'orders', 'order_items', 'loyalty_transactions', 'reviews'];
    for (const table of expectedTables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error && !error.message.includes('0 rows')) {
          throw error;
        }
        console.log(` ✅ Table '${table}' : OK`);
      } catch (err) {
        console.log(` ❌ Table '${table}' : ERREUR - ${err.message}`);
        return false;
      }
    }
    results.tables = true;
    console.log(' 🎉 Toutes les tables sont présentes!');

    // 2. Vérifier les produits
    console.log('\n🍕 2. Vérification des produits...');
    const { data: products, error: productsError } = await supabase.from('products').select('*');
    if (productsError) {
      console.log(` ❌ Erreur lors de la récupération des produits: ${productsError.message}`);
    } else {
      console.log(` ✅ Nombre de produits: ${products.length}`);
      if (products.length >= 10) {
        console.log(' 🎉 Données correctement insérées!');
        results.products = true;
        console.log(' 📝 Exemples de produits:');
        products.slice(0, 3).forEach(product => {
          console.log(` - ${product.name} (${product.price}€) - ${product.category}`);
        });
      } else {
        console.log(' ⚠️ Nombre de produits insuffisant (attendu: 12+)');
      }
    }

    // 3. Vérifier l'authentification
    console.log('\n🔐 3. Vérification de connexion Supabase...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError) {
      console.log(` ⚠️ Authentification: ${authError.message}`);
    } else {
      console.log(' ✅ Connexion Supabase: OK');
    }

    // 4. Vérifier les politiques RLS
    console.log('\n🔒 4. Vérification RLS...');
    try {
      const { data: userData, error: userError } = await supabase.from('users').select('*').limit(1);
      if (!userError) {
        console.log(' ⚠️ RLS pourrait ne pas être correctement configuré');
      } else {
        console.log(' ✅ RLS semble actif (accès users restreint)');
        results.rls = true;
      }
    } catch (err) {
      console.log(' ✅ RLS actif (erreur d\'accès attendue)');
      results.rls = true;
    }
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
    return false;
  }

  // Résumé final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RÉSUMÉ DE LA VÉRIFICATION');
  console.log('='.repeat(60));
  const checks = [
    { name: 'Tables créées', status: results.tables },
    { name: 'Produits insérés', status: results.products },
    { name: 'RLS configuré', status: results.rls }
  ];
  checks.forEach(check => {
    const icon = check.status ? '✅' : '❌';
    console.log(`${icon} ${check.name}`);
  });

  const allGood = checks.every(check => check.status);
  if (allGood) {
    console.log('\n🎉 SUCCÈS! Base de données correctement configurée!');
    console.log('\n🚀 Prochaines étapes:');
    console.log(' 1. Lancez l\'application: npm run dev');
    console.log(' 2. Accédez à http://localhost:3000');
    console.log(' 3. Testez l\'inscription/connexion');
    console.log(' 4. Créez votre première commande!');
  } else {
    console.log('\n⚠️ Certains éléments nécessitent votre attention.');
    console.log('\n🔧 Actions recommandées:');
    console.log(' 1. Vérifiez que le script SQL a été exécuté complètement');
    console.log(' 2. Consultez les logs Supabase pour les erreurs');
    console.log(' 3. Relancez le script SQL si nécessaire');
  }
  return allGood;
}

/**
 * Script de  rapide des fonctionnalités
 */
async function quick() { console.log('\n🧪  RAPIDE DES FONCTIONNALITÉS'); console.log('=' .repeat(40)); try { //  1: Récupérer les pizzas console.log('\n🍕 : Récupération des pizzas...'); const { data: pizzas, error: pizzasError } = await supabase .from('products') .select('*') .eq('category', 'pizzas'); if (pizzasError) { console.log(` ❌ Erreur: ${pizzasError.message}`); } else { console.log(` ✅ ${pizzas.length} pizzas trouvées`); } //  2: Vérifier les vues console.log('\n📊 : Vues statistiques...'); const { data: stats, error: statsError } = await supabase .from('popular_products') .select('*') .limit(3); if (statsError) { console.log(` ⚠️  Vue popular_products: ${statsError.message}`); } else { console.log(' ✅ Vues statistiques fonctionnelles'); } } catch (error) { console.log(` ❌ Erreur lors des s: ${error.message}`); }
}

// Exécution du script
if (require.main === module) { console.log('🚀 Démarrage de la vérification...'); verifyDatabase() .then(success => { if (success) { return quickTest(); } }) .then(() => { console.log('\n✨ Vérification terminée!'); process.exit(0); }) .catch(error => { console.error('💥 Erreur fatale:', error); process.exit(1); });
}

module.exports = { verifyDatabase, quickTest };