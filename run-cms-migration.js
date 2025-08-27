// Script pour exécuter la migration CMS directement
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Configuration PostgreSQL locale (Supabase)
const client = new Client({ host: 'localhost', port: 54322, database: 'postgres', user: 'postgres', : 'postgres'
});

async function runCMSMigration() { console.log('🚀 Exécution de la migration CMS...'); try { // Se connecter à la base de données await client.connect(); console.log('✅ Connexion à PostgreSQL établie'); // Lire le fichier de migration const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20240115000003_create_cms_tables.sql'); const migrationSQL = fs.readFileSync(migrationPath, 'utf8'); console.log('📝 Exécution de la migration...'); // Exécuter la migration await client.query(migrationSQL); console.log('🎉 Migration CMS exécutée avec succès!'); // Vérifier que les tables ont été créées const result = await client.query(` SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('content_items', 'content_versions', 'content_templates', 'content_media', 'content_categories') ORDER BY table_name; `); console.log('📊 Tables CMS créées:'); result.rows.forEach(row => { console.log(`  ✅ ${row.table_name}`); }); // Vérifier les données de const contentCount = await client.query('SELECT COUNT(*) as count FROM content_items'); console.log(`📝 Nombre d'éléments de contenu: ${contentCount.rows[0].count}`); const templateCount = await client.query('SELECT COUNT(*) as count FROM content_templates'); console.log(`📋 Nombre de templates: ${templateCount.rows[0].count}`); const categoryCount = await client.query('SELECT COUNT(*) as count FROM content_categories'); console.log(`📂 Nombre de catégories: ${categoryCount.rows[0].count}`); console.log('\n🌐 Interface CMS disponible sur: http://localhost:30020/); return true; } catch (error) { console.error('❌ Erreur lors de la migration:', error.message); if (error.code === 'ECONNREFUSED') { console.log('\n💡 Solutions possibles:'); console.log('1. Vérifiez que Supabase local est démarré: npx supabase start'); console.log('2. Vérifiez que PostgreSQL écoute sur le port 54322'); console.log('3. Vérifiez les credentials de connexion'); } return false; } finally { await client.end(); console.log('🔌 Connexion fermée'); }
}

// Exécuter la migration
runCMSMigration().then(success => { if (success) { console.log('\n✅ Migration terminée avec succès'); } else { console.log('\n❌ Migration échouée'); } process.exit(success ? 0 : 1);
}).catch(error => { console.error('💥 Erreur fatale:', error); process.exit(1);
});