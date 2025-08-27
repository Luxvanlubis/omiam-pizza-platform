#!/usr/bin/env node

/**
 * 🔗 OMIAM Pizza - Vérification Complète des Liens * * Ce script vérifie tous les liens présents dans l'interface distration :
 * - Réseaux sociaux
 * - Contacts
 * - Liens personnalisés
 * - Routes internes
 * - Fichiers statiques
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = { localServerUrl: 'http://localhost:3000', timeout: 10000, maxRetries: 2 };

// Données extraites du composant LinksManagement
const _LINKS = { socialLinks: [ { name: "Facebook", url: "https://facebook.com/omiam", platform: "facebook", isActive: true, category: "social" }, { name: "Instagram", url: "https://instagram.com/omiam", platform: "instagram", isActive: true, category: "social" }, { name: "Twitter", url: "https://twitter.com/omiam", platform: "twitter", isActive: false, category: "social" }, { name: "WhatsApp", url: "https://wa.me/33789", platform: "whatsapp", isActive: true, category: "messaging" }, { name: "TripAdvisor", url: "https://tripadvisor.com/omiam", platform: "tripadvisor", isActive: true, category: "review" } ], contactLinks: [ { name: "Téléphone principal", value: "+33 1 23 45 67 89", type: "phone", isActive: true }, { name: "Téléphone secondaire", value: "+33 1 23 45 67 90", type: "phone", isActive: false }, { name: "Email principal", value: "contact@omiam.fr", type: "email", isActive: true }, { name: "Adresse principale", value: "123 Rue de la Pizza, 75001 Paris", type: "address", isActive: true }, { name: "Horaires d'ouverture", value: "Lun-Dim: 11:00 - 23:00", type: "hours", isActive: true } ], customLinks: [ { name: "Menu PDF", url: "/files/menu.pdf", description: "Télécharger notre menu au format PDF", isActive: true, openInNewTab: true, category: "documents" }, { name: "Blog O'Miam", url: "https://blog.omiam.fr", description: "Découvrez nos actualités et recettes", isActive: true, openInNewTab: true, category: "external" }, { name: "Partenaires", url: "/partenaires", description: "Nos partenaires locaux", isActive: false, openInNewTab: false, category: "internal" } ]
};

// Routes  à vérifier
const _ROUTES = [ '/, '//dashboard', '//orders', '//menu', '//analytics', '//settings', '//links'
];

/**
 * Vérifie un lien HTTP/HTTPS
 */
function checkHttpLink(url, retries = 0) { return new Promise((resolve) => { try { const urlObj = new URL(url); const isHttps = urlObj.protocol === 'https:'; const client = isHttps ? https : http; const options = { hostname: urlObj.hostname, port: urlObj.port || (isHttps ? 443 : 80), path: urlObj.pathname + urlObj.search, method: 'HEAD', timeout: CONFIG.timeout, headers: { 'User-Agent': 'OMIAM-LinkChecker/1.0', 'Accept': '*/*' } }; const req = client.request(options, (res) => { const status = res.statusCode; if (status >= 200 && status < 400) { resolve({ success: true, status, message: 'OK', redirected: status >= 300 }); } else { resolve({ success: false, status, message: `HTTP ${status}` }); } }); req.on('timeout', () => { req.destroy(); if (retries < CONFIG.maxRetries) { setTimeout(() => { checkHttpLink(url, retries + 1).then(resolve); }, 1000 * (retries + 1)); } else { resolve({ success: false, status: 0, message: 'Timeout après ' + CONFIG.maxRetries + ' tentatives' }); } }); req.on('error', (err) => { if (retries < CONFIG.maxRetries) { setTimeout(() => { checkHttpLink(url, retries + 1).then(resolve); }, 1000 * (retries + 1)); } else { resolve({ success: false, status: 0, message: err.code || err.message }); } }); req.end(); } catch (error) { resolve({ success: false, status: 0, message: 'URL invalide: ' + error.message }); } });
}

/**
 * Vérifie un lien local (route ou fichier)
 */
function checkLocalLink(path) { return new Promise((resolve) => { // Vérifier d'abord si c'est un fichier statique if (path.startsWith('/files/')) { const filePath = `./public${path}`; if (fs.existsSync(filePath)) { const stats = fs.statSync(filePath); resolve({ success: true, status: 200, message: `Fichier trouvé (${(stats.size / 1024).toFixed(1)} KB)`, type: 'static_file' }); return; } else { resolve({ success: false, status: 404, message: 'Fichier non trouvé', type: 'static_file' }); return; } } // Vérifier via HTTP pour les routes const fullUrl = `${CONFIG.localServerUrl}${path}`; checkHttpLink(fullUrl).then(result => { resolve({ ...result, type: 'local_route' }); }); });
}

/**
 * Valide un contact (email, téléphone, etc.)
 */
function validateContact(contact) {
  const result = { isValid: false, message: '' };
  
  switch (contact.type) {
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      result.isValid = emailRegex.test(contact.value);
      result.message = result.isValid ? 'Format email valide' : 'Format email invalide';
      break;
      
    case 'phone':
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      const cleanPhone = contact.value.replace(/[\s\-\.\(\)]/g, '');
      result.isValid = phoneRegex.test(cleanPhone);
      result.message = result.isValid ? 'Format téléphone valide' : 'Format téléphone invalide';
      break;
      
    case 'address':
    case 'hours':
      result.isValid = contact.value.length > 5;
      result.message = result.isValid ? 'Information valide' : 'Information trop courte';
      break;
      
    default:
      result.isValid = true;
      result.message = 'Type de contact non vérifié';
  }
  
  return result;
}

/**
 * Affiche les résultats formatés
 */
function displayResults(results) {
  console.log('\n' + '='.repeat(80));
  console.log('🔗 OMIAM PIZZA - RAPPORT DE VÉRIFICATION DES LIENS');
  console.log('='.repeat(80));
  
  let totalLinks = 0;
  let successfulLinks = 0;
  let failedLinks = 0;
  
  // Réseaux sociaux
  console.log('\n📱 RÉSEAUX SOCIAUX:');
  console.log('-'.repeat(50));
  results.socialLinks.forEach(result => {
    totalLinks++;
    const status = result.success ? '✅' : '❌';
    const activeStatus = result.link.isActive ? '[ACTIF]' : '[INACTIF]';
    console.log(`${status} ${result.link.name} ${activeStatus}`);
    console.log(` URL: ${result.link.url}`);
    console.log(` Statut: ${result.message} (${result.status || 'N/A'})`);
    console.log(` Catégorie: ${result.link.category}`);
    console.log('');
    if (result.success) successfulLinks++;
    else failedLinks++;
  });
  
  // Contacts
  console.log('\n📞 INFORMATIONS DE CONTACT:');
  console.log('-'.repeat(50));
  results.contactLinks.forEach(result => {
    const status = result.validation.isValid ? '✅' : '⚠️';
    const activeStatus = result.contact.isActive ? '[ACTIF]' : '[INACTIF]';
    console.log(`${status} ${result.contact.name} ${activeStatus}`);
    console.log(` Type: ${result.contact.type}`);
    console.log(` Valeur: ${result.contact.value}`);
    console.log(` Validation: ${result.validation.message}`);
    console.log('');
  });
  
  // Liens personnalisés
  console.log('\n🔗 LIENS PERSONNALISÉS:');
  console.log('-'.repeat(50));
  results.customLinks.forEach(result => {
    totalLinks++;
    const status = result.success ? '✅' : '❌';
    const activeStatus = result.link.isActive ? '[ACTIF]' : '[INACTIF]';
    console.log(`${status} ${result.link.name} ${activeStatus}`);
    console.log(` URL: ${result.link.url}`);
    console.log(` Statut: ${result.message} (${result.status || 'N/A'})`);
    console.log(` Type: ${result.type || 'external'}`);
    console.log(` Catégorie: ${result.link.category}`);
    console.log('');
    if (result.success) successfulLinks++;
    else failedLinks++;
  });
  
  // Routes
  console.log('\n⚙️ ROUTES ADMINISTRATION:');
  console.log('-'.repeat(50));
  results.adminRoutes.forEach(result => {
    totalLinks++;
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.route}`);
    console.log(` Statut: ${result.message} (${result.status || 'N/A'})`);
    console.log('');
    if (result.success) successfulLinks++;
    else failedLinks++;
  });
  
  // Résumé
  console.log('\n📊 RÉSUMÉ:');
  console.log('-'.repeat(50));
  console.log(`Total des liens vérifiés: ${totalLinks}`);
  console.log(`✅ Liens fonctionnels: ${successfulLinks}`);
  console.log(`❌ Liens défaillants: ${failedLinks}`);
  console.log(`📈 Taux de réussite: ${((successfulLinks / totalLinks) * 100).toFixed(1)}%`);
  
  if (failedLinks > 0) {
    console.log('\n⚠️  ACTIONS RECOMMANDÉES:');
    console.log('- Vérifier les liens externes défaillants');
    console.log('- Créer les fichiers manquants dans /public/files/');
    console.log('- Configurer les vraies URLs des réseaux sociaux');
    console.log('- Tester les routes admin en mode production');
  }
  
  console.log('\n' + '='.repeat(80));
}
}

/**
 * Fonction principale
 */
async function main() { console.log('🚀 Démarrage de la vérification des liens ...'); const results = { socialLinks: [], contactLinks: [], customLinks: [], Routes: [] }; // Vérifier les réseaux sociaux console.log('\n📱 Vérification des réseaux sociaux...'); for (const link of _LINKS.socialLinks) { if (link.isActive) { console.log(` Vérification: ${link.name}`); const result = await checkHttpLink(link.url); results.socialLinks.push({ link, ...result }); } else { results.socialLinks.push({ link, success: null, message: 'Lien désactivé', status: 'INACTIVE' }); } } // Valider les contacts console.log('\n📞 Validation des contacts...'); for (const contact of _LINKS.contactLinks) { console.log(` Validation: ${contact.name}`); const validation = validateContact(contact); results.contactLinks.push({ contact, validation }); } // Vérifier les liens personnalisés console.log('\n🔗 Vérification des liens personnalisés...'); for (const link of _LINKS.customLinks) { if (link.isActive) { console.log(` Vérification: ${link.name}`); let result; if (link.url.startsWith('http')) { result = await checkHttpLink(link.url); } else { result = await checkLocalLink(link.url); } results.customLinks.push({ link, ...result }); } else { results.customLinks.push({ link, success: null, message: 'Lien désactivé', status: 'INACTIVE' }); } } // Vérifier les routes console.log('\n⚙️ Vérification des routes ...'); for (const route of _ROUTES) { console.log(` Vérification: ${route}`); const result = await checkLocalLink(route); results.Routes.push({ route, ...result }); } // Afficher les résultats displayResults(results);
}

// Exécution
if (require.main === module) { main().catch(console.error);
}

module.exports = { checkHttpLink, checkLocalLink, validateContact };