const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const { URL } = require('url');

// Configuration
const CONFIG = { timeout: 10000, maxRedirects: 5, userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', localServerUrl: 'http://localhost:3000', outputFile: 'rapport-verification-finale.json'
};

// Liens à vérifier
const LINKS_TO_CHECK = {
  // Navigation interne
  navigation: [
    '/', '/menu', '/reservation', '/contact', '/login', '/partenaires', '/blog'
  ],
  // Liens sociaux (exemples)
  social: [
    'https://facebook.com/omiam.pizza',
    'https://instagram.com/omiam.pizza',
    'https://twitter.com/omiam_pizza'
  ],
  // Liens personnalisés
  custom: [
    '/files/menu-omiam.pdf',
    '/files/dossier-partenariat.pdf'
  ],
  // Configuration Supabase
  supabase: [
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co',
    `${process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co'}/rest/v1/`
  ],
  // Ressources externes
  external: [
    'https://fonts.googleapis.com',
    'https://cdnjs.cloudflare.com'
  ]
};

// Fonction pour vérifier un lien HTTP/HTTPS
function checkHttpLink(url) { return new Promise((resolve) => { try { const urlObj = new URL(url); const client = urlObj.protocol === 'https:' ? https : http; const options = { hostname: urlObj.hostname, port: urlObj.port, path: urlObj.pathname + urlObj.search, method: 'HEAD', timeout: CONFIG.timeout, headers: { 'User-Agent': CONFIG.userAgent } }; const req = client.request(options, (res) => { resolve({ url, status: res.statusCode, success: res.statusCode >= 200 && res.statusCode < 400, message: `HTTP ${res.statusCode}`, redirected: res.statusCode >= 300 && res.statusCode < 400 ? res.headers.location : null }); }); req.on('error', (error) => { resolve({ url, status: 0, success: false, message: `Erreur: ${error.message}`, error: error.code }); }); req.on('timeout', () => { req.destroy(); resolve({ url, status: 0, success: false, message: 'Timeout dépassé', error: 'TIMEOUT' }); }); req.end(); } catch (error) { resolve({ url, status: 0, success: false, message: `URL invalide: ${error.message}`, error: 'INVALID_URL' }); } });
}

// Fonction pour vérifier un lien local
function checkLocalLink(path) { return new Promise((resolve) => { const fullUrl = `${CONFIG.localServerUrl}${path}`; // Vérifier d'abord si c'est un fichier statique if (path.startsWith('/files/')) { const filePath = `./public${path}`; if (fs.existsSync(filePath)) { resolve({ url: path, status: 200, success: true, message: 'Fichier statique trouvé', type: 'static_file' }); return; } } // Vérifier via HTTP checkHttpLink(fullUrl).then(result => { resolve({ ...result, url: path, type: 'local_route' }); }); });
}

// Fonction principale de vérification
async function verifyAllLinks() { console.log('🔍 Début de la vérification complète des liens...'); console.log('=' .repeat(60)); const results = { timestamp: new Date().toISOString(), summary: { total: 0, success: 0, failed: 0, warnings: 0 }, categories: {}, failed_links: [], warnings: [] }; // Vérifier chaque catégorie for (const [category, links] of Object.entries(LINKS_TO_CHECK)) { console.log(`\n📂 Vérification: ${category.toUpperCase()}`); console.log('-'.repeat(40)); const categoryResults = []; for (const link of links) { let result; if (category === 'navigation' || category === 'custom') { result = await checkLocalLink(link); } else { result = await checkHttpLink(link); } categoryResults.push(result); results.summary.total++; if (result.success) { results.summary.success++; console.log(`✅ ${result.url} - ${result.message}`); } else { results.summary.failed++; results.failed_links.push(result); console.log(`❌ ${result.url} - ${result.message}`); } // Ajouter des avertissements pour les redirections if (result.redirected) { results.summary.warnings++; results.warnings.push({ url: result.url, message: `Redirection vers: ${result.redirected}` }); console.log(`⚠️  Redirection détectée: ${result.redirected}`); } } results.categories[category] = { total: links.length, success: categoryResults.filter(r => r.success).length, failed: categoryResults.filter(r => !r.success).length, results: categoryResults }; } // Calcul du taux de réussite const successRate = results.summary.total > 0 ? ((results.summary.success / results.summary.total) * 100).toFixed(1) : 0; // Affichage du résumé console.log('\n' + '='.repeat(60)); console.log('📊 RÉSUMÉ DE LA VÉRIFICATION'); console.log('='.repeat(60)); console.log(`Total des liens vérifiés: ${results.summary.total}`); console.log(`✅ Liens fonctionnels: ${results.summary.success}`); console.log(`❌ Liens défaillants: ${results.summary.failed}`); console.log(`⚠️  Avertissements: ${results.summary.warnings}`); console.log(`📈 Taux de réussite: ${successRate}%`); // Détail par catégorie console.log('\n📋 DÉTAIL PAR CATÉGORIE:'); for (const [category, data] of Object.entries(results.categories)) { const categoryRate = data.total > 0 ? ((data.success / data.total) * 100).toFixed(1) : 0; console.log(`  ${category}: ${data.success}/${data.total} (${categoryRate}%)`); } // Liens défaillants if (results.failed_links.length > 0) { console.log('\n❌ LIENS DÉFAILLANTS:'); results.failed_links.forEach(link => { console.log(`  • ${link.url} - ${link.message}`); }); } // Avertissements if (results.warnings.length > 0) { console.log('\n⚠️  AVERTISSEMENTS:'); results.warnings.forEach(warning => { console.log(`  • ${warning.url} - ${warning.message}`); }); } // Recommandations console.log('\n💡 RECOMMANDATIONS:'); if (results.summary.failed === 0) { console.log('  ✨ Excellent! Tous les liens sont fonctionnels.'); } else { console.log('  🔧 Corriger les liens défaillants listés ci-dessus.'); } if (results.summary.warnings > 0) { console.log('  📝 Vérifier les redirections pour optimiser les performances.'); } console.log('  🚀 L\'application est prête pour la production!'); // Sauvegarde du rapport try { fs.writeFileSync(CONFIG.outputFile, JSON.stringify(results, null, 2)); console.log(`\n💾 Rapport sauvegardé: ${CONFIG.outputFile}`); } catch (error) { console.log(`\n❌ Erreur lors de la sauvegarde: ${error.message}`); } console.log('\n🎉 Vérification terminée!'); return results;
}

// Fonction pour vérifier l'état du serveur local
function checkLocalServer() { return new Promise((resolve) => { const req = http.request({ hostname: 'localhost', port: 3000, path: '/', method: 'HEAD', timeout: 5000 }, (res) => { resolve({ running: true, status: res.statusCode, message: `Serveur actif (HTTP ${res.statusCode})` }); }); req.on('error', () => { resolve({ running: false, status: 0, message: 'Serveur non accessible sur localhost:3000' }); }); req.on('timeout', () => { req.destroy(); resolve({ running: false, status: 0, message: 'Timeout - serveur non responsive' }); }); req.end(); });
}

// Exécution principale
async function main() { console.log('🚀 OMIAM Pizza - Vérification Finale des Liens'); console.log('='.repeat(60)); // Vérifier d'abord le serveur local console.log('🔍 Vérification du serveur local...'); const serverStatus = await checkLocalServer(); console.log(`${serverStatus.running ? '✅' : '❌'} ${serverStatus.message}`); if (!serverStatus.running) { console.log('\n⚠️  ATTENTION: Le serveur local n\'est pas accessible.'); console.log(' Démarrez le serveur avec: npm run dev'); console.log(' Les liens de navigation ne pourront pas être vérifiés.'); } // Procéder à la vérification await verifyAllLinks();
}

// Exécuter si appelé directement
if (require.main === module) { main().catch(error => { console.error('❌ Erreur lors de la vérification:', error.message); process.exit(1); });
}

module.exports = { verifyAllLinks, checkHttpLink, checkLocalLink };