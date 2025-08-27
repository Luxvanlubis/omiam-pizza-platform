#!/usr/bin/env node

/**
 * 🔗 OMIAM Pizza - Vérificateur de Liens Simple
 * Vérifie rapidement les liens principaux de l'application
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('🔗 OMIAM Pizza - Vérification des Liens');
console.log('=====================================\n');

// Liens à vérifier
const links = [ // Navigation interne { name: 'Page d\'accueil', url: 'http://localhost:3000/', type: 'local' }, { name: 'Menu', url: 'http://localhost:3000/menu', type: 'local' }, { name: 'Réservation', url: 'http://localhost:3000/reservation', type: 'local' }, { name: 'Galerie', url: 'http://localhost:3000/galerie', type: 'local' }, { name: 'Contact', url: 'http://localhost:3000/contact', type: 'local' }, { name: 'Fidélité', url: 'http://localhost:3000/fidelite', type: 'local' }, { name: , url: 'http://localhost:3000/, type: 'local' }, // Supabase { name: 'Supabase Project', url: 'https://bnjmxkjpngvkmelhknjv.supabase.co', type: 'external' }, { name: 'Supabase Main', url: 'https://supabase.com', type: 'external' }, // Réseaux sociaux (exemples) { name: 'Facebook', url: 'https://facebook.com', type: 'external' }, { name: 'Instagram', url: 'https://instagram.com', type: 'external' }, { name: 'WhatsApp Web', url: 'https://web.whatsapp.com', type: 'external' }
];

// Fonction de vérification simple
function checkLink(url) { return new Promise((resolve) => { try { const urlObj = new URL(url); const isHttps = urlObj.protocol === 'https:'; const client = isHttps ? https : http; const options = { hostname: urlObj.hostname, port: urlObj.port || (isHttps ? 443 : 80), path: urlObj.pathname, method: 'HEAD', timeout: 5000, headers: { 'User-Agent': 'OMIAM-LinkChecker/1.0' } }; const req = client.request(options, (res) => { const status = res.statusCode; if (status >= 200 && status < 400) { resolve({ success: true, status, message: 'OK' }); } else { resolve({ success: false, status, message: `HTTP ${status}` }); } }); req.on('timeout', () => { req.destroy(); resolve({ success: false, status: 0, message: 'Timeout' }); }); req.on('error', (err) => { resolve({ success: false, status: 0, message: err.code || err.message }); }); req.end(); } catch (error) { resolve({ success: false, status: 0, message: error.message }); } });
}

// Vérification de tous les liens
async function verifyAllLinks() { const results = []; for (const link of links) { process.stdout.write(`🔍 ${link.name.padEnd(20)} ... `); const result = await checkLink(link.url); if (result.success) { console.log(`✅ OK (${result.status})`); } else { console.log(`❌ ERREUR: ${result.message}`); } results.push({ name: link.name, url: link.url, type: link.type, ...result }); // Pause courte await new Promise(resolve => setTimeout(resolve, 200)); } // Résumé console.log('\n📊 RÉSUMÉ:'); console.log('========='); const successful = results.filter(r => r.success).length; const failed = results.filter(r => !r.success).length; console.log(`✅ Liens fonctionnels: ${successful}`); console.log(`❌ Liens défaillants: ${failed}`); console.log(`📊 Total: ${results.length}`); if (failed > 0) { console.log('\n⚠️  LIENS DÉFAILLANTS:'); results.filter(r => !r.success).forEach(link => { console.log(`❌ ${link.name}: ${link.message}`); console.log(` URL: ${link.url}`); }); } console.log('\n✅ Vérification terminée!');
}

// Exécution
verifyAllLinks().catch(console.error);