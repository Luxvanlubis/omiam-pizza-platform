#!/usr/bin/env node

/**
 * 🔗 OMIAM Pizza - Vérificateur de Liens Automatique
 * Vérifie tous les liens internes et externes de l'application
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  timeout: 10000, // 10 secondes
  userAgent: 'OMIAM-LinkChecker/1.0',
  maxRedirects: 5
};

// Couleurs pour la console
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Liens à vérifier (extraits du code)
const LINKS_TO_CHECK = {
  // Liens sociaux (mockSocialLinks)
  social: [
    { name: 'Facebook O\'Miam', url: 'https://facebook.com/omiam', type: 'external' },
    { name: 'Instagram O\'Miam', url: 'https://instagram.com/omiam', type: 'external' },
    { name: 'Twitter O\'Miam', url: 'https://twitter.com/omiam', type: 'external' },
    { name: 'WhatsApp', url: 'https://wa.me/33789', type: 'external' },
    { name: 'TripAdvisor', url: 'https://tripadvisor.com/omiam', type: 'external' }
  ],
  // Liens personnalisés (mockCustomLinks)
  custom: [
    { name: 'Blog O\'Miam', url: 'https://blog.omiam.fr', type: 'external' },
    { name: 'Menu PDF', url: '/files/menu.pdf', type: 'internal' },
    { name: 'Partenaires', url: '/partenaires', type: 'internal' }
  ],
  // Navigation principale
  navigation: [
    { name: 'Accueil', url: '/', type: 'internal' },
    { name: 'Menu', url: '/menu', type: 'internal' },
    { name: 'Réservation', url: '/reservation', type: 'internal' },
    { name: 'Galerie', url: '/galerie', type: 'internal' },
    { name: 'Contact', url: '/contact', type: 'internal' },
    { name: 'Fidélité', url: '/fidelite', type: 'internal' },
    { name: 'Admin', url: '/admin', type: 'internal' }
  ],
  // Configuration Supabase
  supabase: [
    { name: 'Supabase Project', url: 'https://bnjmxkjpngvkmelhknjv.supabase.co', type: 'external' },
    { name: 'Supabase Dashboard', url: 'https://supabase.com/dashboard', type: 'external' }
  ],
  // Ressources externes
  resources: [
    { name: 'Documentation Supabase', url: 'https://supabase.com/docs', type: 'external' },
    { name: 'Status Supabase', url: 'https://status.supabase.com', type: 'external' },
    { name: 'Discord Supabase', url: 'https://discord.supabase.com', type: 'external' }
  ]
};

// Fonction pour vérifier un lien HTTP/HTTPS
function checkExternalLink(url) { return new Promise((resolve) => { const urlObj = new URL(url); const isHttps = urlObj.protocol === 'https:'; const client = isHttps ? https : http; const options = { hostname: urlObj.hostname, port: urlObj.port || (isHttps ? 443 : 80), path: urlObj.pathname + urlObj.search, method: 'HEAD', timeout: CONFIG.timeout, headers: { 'User-Agent': CONFIG.userAgent } }; const req = client.request(options, (res) => { const status = res.statusCode; if (status >= 200 && status < 300) { resolve({ success: true, status, message: 'OK' }); } else if (status >= 300 && status < 400) { resolve({ success: true, status, message: 'Redirection' }); } else { resolve({ success: false, status, message: `HTTP ${status}` }); } }); req.on('timeout', () => { req.destroy(); resolve({ success: false, status: 0, message: 'Timeout' }); }); req.on('error', (err) => { resolve({ success: false, status: 0, message: err.message }); }); req.end(); });
}

// Fonction pour vérifier un lien interne
function checkInternalLink(url) { return new Promise((resolve) => { // Pour les liens internes, on vérifie si le fichier/route existe const localUrl = `http://localhost:3000${url}`; checkExternalLink(localUrl) .then(result => { if (result.success) { resolve({ success: true, status: result.status, message: 'Route accessible' }); } else { // Si le serveur local n'est pas accessible, on vérifie les fichiers const filePath = path.join(__dirname, 'src', 'app', url === '/' ? 'page.tsx' : url + '/page.tsx'); if (fs.existsSync(filePath)) { resolve({ success: true, status: 200, message: 'Fichier existe' }); } else { resolve({ success: false, status: 404, message: 'Route/Fichier introuvable' }); } } }) .catch(() => { resolve({ success: false, status: 0, message: 'Erreur de vérification' }); }); });
}

// Fonction principale de vérification
async function verifyLink(link) { console.log(`${colors.cyan}🔍 Vérification: ${colors.bold}${link.name}${colors.reset}`); console.log(` URL: ${link.url}`); let result; if (link.type === 'external') { result = await checkExternalLink(link.url); } else { result = await checkInternalLink(link.url); } const statusColor = result.success ? colors.green : colors.red; const statusIcon = result.success ? '✅' : '❌'; console.log(` ${statusIcon} ${statusColor}${result.message}${colors.reset} (${result.status})\n`); return { ...link, ...result, timestamp: new Date().toISOString() };
}

// Fonction pour générer un rapport
function generateReport(results) { const report = { timestamp: new Date().toISOString(), summary: { total: results.length, success: results.filter(r => r.success).length, failed: results.filter(r => !r.success).length }, results: results }; // Sauvegarde du rapport const reportPath = path.join(__dirname, 'link-verification-report.json'); fs.writeFileSync(reportPath, JSON.stringify(report, null, 2)); return report;
}

// Fonction principale
async function main() { console.log(`${colors.bold}${colors.blue}🔗 OMIAM Pizza - Vérificateur de Liens${colors.reset}`); console.log(`${colors.yellow}📅 ${new Date().toLocaleString('fr-FR')}${colors.reset}\n`); const allResults = []; // Vérification par catégorie for (const [category, links] of Object.entries(LINKS_TO_CHECK)) { console.log(`${colors.bold}${colors.blue}📂 Catégorie: ${category.toUpperCase()}${colors.reset}`); console.log(`${colors.yellow}${'='.repeat(50)}${colors.reset}\n`); for (const link of links) { const result = await verifyLink(link); allResults.push({ category, ...result }); // Petite pause pour éviter de surcharger les serveurs await new Promise(resolve => setTimeout(resolve, 500)); } } // Génération du rapport const report = generateReport(allResults); // Affichage du résumé console.log(`${colors.bold}${colors.blue}📊 RÉSUMÉ DE LA VÉRIFICATION${colors.reset}`); console.log(`${colors.yellow}${'='.repeat(50)}${colors.reset}`); console.log(`${colors.green}✅ Liens fonctionnels: ${report.summary.success}${colors.reset}`); console.log(`${colors.red}❌ Liens défaillants: ${report.summary.failed}${colors.reset}`); console.log(`${colors.cyan}📊 Total vérifié: ${report.summary.total}${colors.reset}`); const successRate = ((report.summary.success / report.summary.total) * 100).toFixed(1); console.log(`${colors.bold}🎯 Taux de réussite: ${successRate}%${colors.reset}\n`); // Liens défaillants const failedLinks = allResults.filter(r => !r.success); if (failedLinks.length > 0) { console.log(`${colors.bold}${colors.red}⚠️  LIENS DÉFAILLANTS:${colors.reset}`); failedLinks.forEach(link => { console.log(`${colors.red}❌ ${link.name} (${link.category})${colors.reset}`); console.log(` URL: ${link.url}`); console.log(` Erreur: ${link.message}\n`); }); } console.log(`${colors.cyan}📄 Rapport détaillé sauvegardé: link-verification-report.json${colors.reset}`); // Code de sortie process.exit(failedLinks.length > 0 ? 1 : 0);
}

// Gestion des erreurs
process.on('unhandledRejection', (reason, promise) => { console.error(`${colors.red}❌ Erreur non gérée:${colors.reset}`, reason); process.exit(1);
});

// Exécution
if (require.main === module) { main().catch(console.error);
}

module.exports = { verifyLink, checkExternalLink, checkInternalLink };