#!/usr/bin/env node
/**
 * 🧹 Script de nettoyage des corruptions de sécurité
 * Supprime toutes les insertions process.env.SECURE_... des fichiers
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Pattern pour détecter les corruptions
const CORRUPTION_PATTERN = /process\.env\.SECURE_\d+\s*\|\|\s*'[a-f0-9]+'/g;

// Fichiers à nettoyer (éviter node_modules, .git, etc.)
const FILES_TO_CLEAN = [ '**/*.js', '**/*.ts', '**/*.tsx', '**/*.json', '!node_modules/**', '!.git/**', '!dist/**', '!build/**', '!.next/**'
];

function cleanFile(filePath) { try { const content = fs.readFileSync(filePath, 'utf8'); const originalContent = content; // Nettoyer les corruptions let cleanedContent = content.replace(CORRUPTION_PATTERN, ''); // Nettoyer les doubles espaces et caractères orphelins cleanedContent = cleanedContent .replace(/\s+\|\|\s*'/g, "'") .replace(/\s+\|\|\s*"/g, '"') .replace(/\s{3,}/g, ' ') .replace(/\n\s*\n\s*\n/g, '\n\n'); // Corrections spécifiques pour certains patterns cleanedContent = cleanedContent .replace(/import rateLimit, \{\s*\} from 'express-rate-limit';/g, "import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';") .replace(/const supabase = createClient\(supabaseUrl, \);/g, 'const supabase = createClient(supabaseUrl, supabaseAnonKey);') .replace(/async function \(\)/g, 'async function testConnection()') .replace(/console\.log\('🧪 RAPIDE DES FONCTIONNALITÉS'\);/g, "console.log('🧪 TEST RAPIDE DES FONCTIONNALITÉS');") .replace(/return quick\(\);/g, 'return quickTest();') .replace(/module\.exports = \{ verifyDatabase, quick \};/g, 'module.exports = { verifyDatabase, quickTest };'); if (cleanedContent !== originalContent) { fs.writeFileSync(filePath, cleanedContent, 'utf8'); console.log(`✅ Nettoyé: ${filePath}`); return true; } return false; } catch (error) { console.error(`❌ Erreur lors du nettoyage de ${filePath}:`, error.message); return false; }
}

function main() { console.log('🧹 Démarrage du nettoyage des corruptions de sécurité...'); let cleanedCount = 0; let totalFiles = 0; // Trouver tous les fichiers à nettoyer const files = glob.sync(FILES_TO_CLEAN, { cwd: process.cwd(), absolute: true, ignore: ['node_modules/**', '.git/**', 'dist/**', 'build/**', '.next/**'] }); console.log(`📁 ${files.length} fichiers à analyser...`); files.forEach(file => { totalFiles++; if (cleanFile(file)) { cleanedCount++; } }); console.log(`\n🎉 Nettoyage terminé!`); console.log(`📊 Statistiques:`); console.log(` - Fichiers analysés: ${totalFiles}`); console.log(` - Fichiers nettoyés: ${cleanedCount}`); console.log(` - Fichiers intacts: ${totalFiles - cleanedCount}`); if (cleanedCount > 0) { console.log(`\n✨ ${cleanedCount} fichiers ont été nettoyés avec succès!`); } else { console.log(`\n✅ Aucune corruption détectée.`); }
}

if (require.main === module) { main();
}

module.exports = { cleanFile, main };