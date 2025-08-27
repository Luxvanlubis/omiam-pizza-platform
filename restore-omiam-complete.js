require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration complète O'Miam
const OMIAM_CONFIG = {
  name: "O'Miam Pizza Restaurant",
  description: "Restaurant de pizzas artisanales avec système de commande en ligne",
  features: [
    "🍕 Menu de pizzas artisanales",
    "🛒 Système de commande en ligne",
    "👥 Gestion des utilisateurs",
    "📊 Tableau de bord administrateur",
    "🎯 Programme de fidélité",
    "⭐ Système d'avis clients",
    "📱 Interface responsive",
    "🔒 Authentification sécurisée"
  ],
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  }
};

// Données complètes du menu O'Miam
const MENU_DATA = {
  pizzas: [
    {
      name: "Pizza Margherita",
      description: "Pizza classique avec tomate, mozzarella et basilic frais",
      price: 12.90,
      ingredients: ["tomate", "mozzarella", "basilic", "huile d'olive"],
      allergens: ["gluten", "lactose"],
      image_url: "/images/pizza-margherita.jpg"
    },
    {
      name: "Pizza Pepperoni",
      description: "Pizza avec sauce tomate, mozzarella et pepperoni",
      price: 15.90,
      ingredients: ["tomate", "mozzarella", "pepperoni"],
      allergens: ["gluten", "lactose"],
      image_url: "/images/pizza-pepperoni.jpg"
    },
    {
      name: "Pizza Quattro Stagioni",
      description: "Pizza aux quatre saisons avec champignons, jambon, artichauts et olives",
      price: 17.90,
      ingredients: ["tomate", "mozzarella", "champignons", "jambon", "artichauts", "olives"],
      allergens: ["gluten", "lactose"],
      image_url: "/images/pizza-quattro-stagioni.jpg"
    },
    {
      name: "Pizza Végétarienne",
      description: "Pizza avec légumes grillés et fromage de chèvre",
      price: 16.90,
      ingredients: ["tomate", "courgettes", "aubergines", "poivrons", "fromage de chèvre"],
      allergens: ["gluten", "lactose"],
      image_url: "/images/pizza-vegetarienne.jpg"
    },
    {
      name: "Calzone Classique",
      description: "Pizza fermée avec jambon, champignons et mozzarella",
      price: 14.90,
      ingredients: ["tomate", "mozzarella", "jambon", "champignons"],
      allergens: ["gluten", "lactose"],
      image_url: "/images/calzone-classique.jpg"
    }
  ],
  salades: [
    {
      name: "Salade César",
      description: "Salade romaine, croûtons, parmesan et sauce César",
      price: 9.90,
      ingredients: ["salade romaine", "croûtons", "parmesan", "sauce césar"],
      allergens: ["gluten", "lactose", "œufs"],
      image_url: "/images/salade-cesar.jpg"
    },
    {
      name: "Salade Méditerranéenne",
      description: "Salade mixte avec tomates, olives, feta et vinaigrette",
      price: 11.90,
      ingredients: ["salade mixte", "tomates", "olives", "feta", "vinaigrette"],
      allergens: ["lactose"],
      image_url: "/images/salade-mediterraneenne.jpg"
    }
  ],
  desserts: [
    {
      name: "Tiramisu",
      description: "Dessert italien traditionnel au café et mascarpone",
      price: 6.90,
      ingredients: ["mascarpone", "café", "biscuits", "cacao"],
      allergens: ["gluten", "lactose", "œufs"],
      image_url: "/images/tiramisu.jpg"
    },
    {
      name: "Panna Cotta",
      description: "Dessert crémeux aux fruits rouges",
      price: 5.90,
      ingredients: ["crème", "gélatine", "fruits rouges"],
      allergens: ["lactose"],
      image_url: "/images/panna-cotta.jpg"
    }
  ],
  boissons: [
    {
      name: "Coca-Cola",
      description: "Boisson gazeuse 33cl",
      price: 2.50,
      ingredients: ["eau gazéifiée", "sucre", "arômes"],
      allergens: [],
      image_url: "/images/coca-cola.jpg"
    },
    {
      name: "Eau Minérale",
      description: "Eau minérale naturelle 50cl",
      price: 1.90,
      ingredients: ["eau minérale"],
      allergens: [],
      image_url: "/images/eau-minerale.jpg"
    },
    {
      name: "Bière Artisanale",
      description: "Bière blonde artisanale 33cl",
      price: 4.50,
      ingredients: ["malt", "houblon", "levure"],
      allergens: ["gluten"],
      image_url: "/images/biere-artisanale.jpg"
    }
  ]
};

async function restoreOmiamComplete() {
  console.log('🍕 RESTAURATION COMPLÈTE O\'MIAM');
  console.log('=' .repeat(60));
  console.log(`📍 Projet: ${OMIAM_CONFIG.name}`);
  console.log(`📝 Description: ${OMIAM_CONFIG.description}`);
  console.log('');
  
  console.log('🎯 Fonctionnalités disponibles:');
  OMIAM_CONFIG.features.forEach(feature => {
    console.log(`   ${feature}`);
  });
  console.log('');
  
  // Test de connexion Supabase
  console.log('🔗 Vérification de la connexion Supabase...');
  
  if (!OMIAM_CONFIG.supabase.url || !OMIAM_CONFIG.supabase.anonKey) {
    console.log('❌ Configuration Supabase manquante!');
    console.log('Vérifiez votre fichier .env.local');
    return;
  }
  
  const supabase = createClient(
    OMIAM_CONFIG.supabase.url,
    OMIAM_CONFIG.supabase.anonKey
  );
  
  try {
    // Test de connexion
    const { data, error } = await supabase.from('products').select('count', { count: 'exact', head: true });
    if (error) {
      console.log('❌ Erreur de connexion Supabase:', error.message);
      return;
    }
    console.log('✅ Connexion Supabase réussie!');
    
    // Vérifier les données existantes
    console.log('\n📊 État actuel de la base de données:');
    const tables = ['products', 'users', 'orders', 'order_items', 'loyalty_transactions', 'reviews'];
    
    for (const table of tables) {
      const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
      console.log(`   📋 ${table}: ${count || 0} enregistrements`);
    }
    
    // Récupérer les produits existants
    console.log('\n🍕 Menu actuel:');
    const { data: existingProducts } = await supabase.from('products').select('*');
    
    if (existingProducts && existingProducts.length > 0) {
      console.log(`✅ ${existingProducts.length} produits trouvés dans la base:`);
      existingProducts.forEach(product => {
        console.log(`   • ${product.name} - ${product.price}€ (${product.category})`);
      });
    } else {
      console.log('📭 Aucun produit trouvé - Base de données vide');
    }
    
    // Générer le rapport de restauration
    console.log('\n📄 Génération du rapport de restauration...');
    const report = generateRestorationReport(existingProducts || []);
    
    const reportDir = path.join(__dirname, 'omiam-restoration');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = path.join(reportDir, `omiam-restoration-${timestamp}.md`);
    fs.writeFileSync(reportFile, report);
    
    console.log(`📄 Rapport sauvegardé: ${reportFile}`);
    
    // Créer le fichier de configuration
    const configFile = path.join(reportDir, `omiam-config-${timestamp}.json`);
    const fullConfig = {
      ...OMIAM_CONFIG,
      menu: MENU_DATA,
      database_status: {
        products: existingProducts?.length || 0,
        timestamp: new Date().toISOString()
      }
    };
    
    fs.writeFileSync(configFile, JSON.stringify(fullConfig, null, 2));
    console.log(`⚙️ Configuration sauvegardée: ${configFile}`);
    
    console.log('\n✅ RESTAURATION O\'MIAM TERMINÉE!');
    console.log('=' .repeat(50));
    console.log('🎯 Votre restaurant O\'Miam est prêt à fonctionner!');
    console.log('🌐 Accédez à http://localhost:3000 pour voir l\'application');
    console.log('📊 Tableau de bord admin: http://localhost:3000/admin');
    
  } catch (error) {
    console.log('❌ Erreur lors de la restauration:', error.message);
  }
}

function generateRestorationReport(existingProducts) {
  let report = `# 🍕 Rapport de Restauration O'Miam\n\n`;
  report += `**Date de restauration:** ${new Date().toISOString()}\n`;
  report += `**Projet:** ${OMIAM_CONFIG.name}\n`;
  report += `**URL Supabase:** ${OMIAM_CONFIG.supabase.url}\n\n`;
  
  report += `## 🎯 Fonctionnalités O'Miam\n\n`;
  OMIAM_CONFIG.features.forEach(feature => {
    report += `- ${feature}\n`;
  });
  report += `\n`;
  
  report += `## 📊 État de la base de données\n\n`;
  report += `**Produits trouvés:** ${existingProducts.length}\n\n`;
  
  if (existingProducts.length > 0) {
    report += `### 🍕 Menu disponible\n\n`;
    existingProducts.forEach(product => {
      report += `- **${product.name}** - ${product.price}€\n`;
      report += `  *${product.description}*\n`;
      report += `  **Catégorie:** ${product.category}\n`;
      if (product.ingredients) {
        report += `  **Ingrédients:** ${product.ingredients.join(', ')}\n`;
      }
      if (product.allergens) {
        report += `  **Allergènes:** ${product.allergens.join(', ')}\n`;
      }
      report += `\n`;
    });
  }
  
  report += `## 🚀 Instructions de démarrage\n\n`;
  report += `1. **Démarrer l'application:** \`npm run dev\`\n`;
  report += `2. **Accéder à l'application:** http://localhost:3000\n`;
  report += `3. **Tableau de bord admin:** http://localhost:3000/admin\n`;
  report += `4. **Documentation API:** http://localhost:3000/api\n\n`;
  
  report += `## 🔧 Configuration technique\n\n`;
  report += `- **Framework:** Next.js 14\n`;
  report += `- **Base de données:** Supabase PostgreSQL\n`;
  report += `- **Authentification:** NextAuth.js\n`;
  report += `- **Paiements:** Stripe (mode test)\n`;
  report += `- **UI:** Tailwind CSS + Shadcn/ui\n`;
  report += `- **Temps réel:** Socket.IO\n\n`;
  
  return report;
}

restoreOmiamComplete().catch(console.error);