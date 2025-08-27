require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testSupabaseConnection() {
  console.log('🔍 Test de connexion Supabase pour O\'Miam...');
  console.log('=' .repeat(50));
  
  // Vérifier les variables d'environnement
  console.log('📋 Variables d\'environnement:');
  console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configurée' : '❌ Manquante');
  console.log('Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configurée' : '❌ Manquante');
  console.log('Service Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Configurée' : '❌ Manquante');
  console.log('');
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.log('❌ Configuration Supabase incomplète');
    return;
  }
  
  try {
    // Créer le client Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    console.log('🔗 Test de connexion...');
    
    // Test 1: Vérifier les tables existantes
    console.log('\n📊 Test des tables:');
    
    // Test table products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(5);
      
    if (productsError) {
      console.log('❌ Table products:', productsError.message);
    } else {
      console.log(`✅ Table products: ${products?.length || 0} produits trouvés`);
      if (products && products.length > 0) {
        console.log('   Exemples:', products.map(p => p.name).join(', '));
      }
    }
    
    // Test table users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(3);
      
    if (usersError) {
      console.log('❌ Table users:', usersError.message);
    } else {
      console.log(`✅ Table users: ${users?.length || 0} utilisateurs trouvés`);
    }
    
    // Test table orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .limit(3);
      
    if (ordersError) {
      console.log('❌ Table orders:', ordersError.message);
    } else {
      console.log(`✅ Table orders: ${orders?.length || 0} commandes trouvées`);
    }
    
    // Résumé
    console.log('\n📈 Résumé de la base de données O\'Miam:');
    console.log('=' .repeat(50));
    
    if (products && products.length > 0) {
      console.log('🍕 Produits disponibles:');
      products.forEach(product => {
        console.log(`   - ${product.name}: ${product.price}€ (${product.category})`);
      });
    }
    
    if (users && users.length > 0) {
      console.log('\n👥 Utilisateurs enregistrés:');
      users.forEach(user => {
        console.log(`   - ${user.full_name} (${user.email})`);
      });
    }
    
    if (orders && orders.length > 0) {
      console.log('\n🛒 Commandes récentes:');
      orders.forEach(order => {
        console.log(`   - Commande #${order.order_number}: ${order.total_amount}€ (${order.status})`);
      });
    }
    
    console.log('\n✅ Connexion Supabase réussie!');
    
  } catch (error) {
    console.log('❌ Erreur de connexion:', error.message);
    console.log('\n🔧 Vérifiez:');
    console.log('1. Que le projet Supabase existe');
    console.log('2. Que les clés API sont correctes');
    console.log('3. Que le script SQL a été exécuté');
  }
}

testSupabaseConnection();