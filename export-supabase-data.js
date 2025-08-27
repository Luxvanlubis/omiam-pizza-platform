require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function exportSupabaseData() {
  console.log('🔄 Export complet des données Supabase O\'Miam...');
  console.log('=' .repeat(60));
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  
  const exportData = {
    timestamp: new Date().toISOString(),
    project: 'O\'Miam Pizza Restaurant',
    supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    tables: {}
  };
  
  const tables = [
    'products',
    'users', 
    'orders',
    'order_items',
    'loyalty_transactions',
    'reviews'
  ];
  
  console.log('📊 Récupération des données des tables...');
  
  for (const tableName of tables) {
    try {
      console.log(`\n🔍 Table: ${tableName}`);
      
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact' });
        
      if (error) {
        console.log(`   ❌ Erreur: ${error.message}`);
        exportData.tables[tableName] = {
          error: error.message,
          count: 0,
          data: []
        };
      } else {
        console.log(`   ✅ ${count || data?.length || 0} enregistrements trouvés`);
        exportData.tables[tableName] = {
          count: count || data?.length || 0,
          data: data || [],
          schema: data && data.length > 0 ? Object.keys(data[0]) : []
        };
        
        // Afficher un aperçu des données
        if (data && data.length > 0) {
          console.log(`   📋 Colonnes: ${Object.keys(data[0]).join(', ')}`);
          if (data.length <= 3) {
            data.forEach((item, index) => {
              console.log(`   ${index + 1}. ${JSON.stringify(item, null, 2).substring(0, 100)}...`);
            });
          } else {
            console.log(`   📝 Premiers enregistrements: ${data.slice(0, 2).map(item => 
              Object.values(item).slice(0, 2).join(' | ')
            ).join(', ')}...`);
          }
        }
      }
    } catch (err) {
      console.log(`   ❌ Erreur système: ${err.message}`);
      exportData.tables[tableName] = {
        error: err.message,
        count: 0,
        data: []
      };
    }
  }
  
  // Statistiques générales
  console.log('\n📈 Statistiques générales:');
  console.log('=' .repeat(40));
  
  let totalRecords = 0;
  let tablesWithData = 0;
  
  Object.entries(exportData.tables).forEach(([tableName, tableData]) => {
    if (!tableData.error && tableData.count > 0) {
      totalRecords += tableData.count;
      tablesWithData++;
      console.log(`📊 ${tableName}: ${tableData.count} enregistrements`);
    } else if (tableData.error) {
      console.log(`❌ ${tableName}: Erreur - ${tableData.error}`);
    } else {
      console.log(`📭 ${tableName}: Vide`);
    }
  });
  
  console.log(`\n📋 Résumé:`);
  console.log(`   • Tables avec données: ${tablesWithData}/${tables.length}`);
  console.log(`   • Total enregistrements: ${totalRecords}`);
  
  // Sauvegarder les données
  const exportDir = path.join(__dirname, 'supabase-export');
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const exportFile = path.join(exportDir, `omiam-data-${timestamp}.json`);
  
  fs.writeFileSync(exportFile, JSON.stringify(exportData, null, 2));
  console.log(`\n💾 Données exportées vers: ${exportFile}`);
  
  // Créer un rapport lisible
  const reportFile = path.join(exportDir, `omiam-report-${timestamp}.md`);
  const report = generateMarkdownReport(exportData);
  fs.writeFileSync(reportFile, report);
  console.log(`📄 Rapport généré: ${reportFile}`);
  
  // Afficher les données importantes
  console.log('\n🍕 DONNÉES O\'MIAM RÉCUPÉRÉES:');
  console.log('=' .repeat(50));
  
  if (exportData.tables.products && exportData.tables.products.data.length > 0) {
    console.log('\n🍕 MENU DISPONIBLE:');
    exportData.tables.products.data.forEach(product => {
      console.log(`   • ${product.name} - ${product.price}€`);
      if (product.description) {
        console.log(`     ${product.description.substring(0, 80)}...`);
      }
    });
  }
  
  if (exportData.tables.users && exportData.tables.users.data.length > 0) {
    console.log('\n👥 UTILISATEURS:');
    exportData.tables.users.data.forEach(user => {
      console.log(`   • ${user.full_name} (${user.email})`);
    });
  }
  
  if (exportData.tables.orders && exportData.tables.orders.data.length > 0) {
    console.log('\n🛒 COMMANDES:');
    exportData.tables.orders.data.forEach(order => {
      console.log(`   • #${order.order_number} - ${order.total_amount}€ (${order.status})`);
    });
  }
  
  console.log('\n✅ Export terminé avec succès!');
  return exportData;
}

function generateMarkdownReport(exportData) {
  let report = `# 🍕 Rapport de données O'Miam\n\n`;
  report += `**Date d'export:** ${exportData.timestamp}\n`;
  report += `**Projet:** ${exportData.project}\n`;
  report += `**URL Supabase:** ${exportData.supabase_url}\n\n`;
  
  report += `## 📊 Résumé des tables\n\n`;
  
  Object.entries(exportData.tables).forEach(([tableName, tableData]) => {
    report += `### ${tableName}\n`;
    if (tableData.error) {
      report += `❌ **Erreur:** ${tableData.error}\n\n`;
    } else {
      report += `✅ **Enregistrements:** ${tableData.count}\n`;
      if (tableData.schema.length > 0) {
        report += `**Colonnes:** ${tableData.schema.join(', ')}\n`;
      }
      report += `\n`;
    }
  });
  
  if (exportData.tables.products && exportData.tables.products.data.length > 0) {
    report += `## 🍕 Menu disponible\n\n`;
    exportData.tables.products.data.forEach(product => {
      report += `- **${product.name}** - ${product.price}€\n`;
      if (product.description) {
        report += `  ${product.description}\n`;
      }
    });
    report += `\n`;
  }
  
  return report;
}

exportSupabaseData().catch(console.error);