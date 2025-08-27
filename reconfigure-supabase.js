#!/usr/bin/env node

/**
 * 🔧 Reconfiguration Interactive Supabase - OMIAM Pizza
 * * Script pour reconfigurer complètement Supabase avec les bonnes informations
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuration des couleurs pour la console
const colors = { reset: '\x1b[0m', bright: '\x1b[1m', red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m', blue: '\x1b[34m', magenta: '\x1b[35m', cyan: '\x1b[36m'
};

const rl = readline.createInterface({ input: process.stdin, output: process.stdout
});

/**
 * Fonction pour poser une question
 */
function question(prompt) { return new Promise((resolve) => { rl.question(prompt, resolve); });
}

/**
 * Fonction pour valider une URL Supabase
 */
function validateSupabaseUrl(url) { const regex = /^https:\/\/[a-z0-9]+\.supabase\.co$/; return regex.(url);
}

/**
 * Fonction pour valider un JWT */
function validateJWT(token) { try { const parts = token.split('.'); if (parts.length !== 3) return false; // Décoder le payload pour vérifier const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString()); return payload.iss === 'supabase' && payload.ref; } catch { return false; }
}

/**
 * Fonction pour extraire l'ID du projet depuis un JWT
 */
function extractProjectId(token) { try { const parts = token.split('.'); const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString()); return payload.ref; } catch { return null; }
}

/**
 * Fonction pour générer un  NextAuth
 */
function generateNextAuth() { return crypto.randomBytes(32).toString('base64');
}

/**
 * Fonction principale de configuration
 */
async function configureSupabase() { console.log(`${colors.cyan}${colors.bright}`); console.log('🔧 RECONFIGURATION SUPABASE - OMIAM PIZZA'); console.log('=' .repeat(60)); console.log(`${colors.reset}`); console.log(`${colors.yellow}⚠️  Problème détecté avec la configuration Supabase actuelle.${colors.reset}`); console.log(`${colors.blue}📋 Ce script va vous aider à reconfigurer complètement Supabase.${colors.reset}\n`); const config = {}; // Étape 1: URL Supabase console.log(`${colors.bright}🌐 Étape 1: URL du Projet Supabase${colors.reset}`); console.log('Allez sur https://supabase.com/dashboard et sélectionnez votre projet.'); console.log('Copiez l\'URL qui apparaît dans les paramètres API.\n'); while (true) { const url = await question('🔗 URL Supabase (ex: https://abc123.supabase.co): '); if (validateSupabaseUrl(url)) { config.url = url; console.log(`${colors.green}✅ URL valide!${colors.reset}\n`); break; } else { console.log(`${colors.red}❌ URL invalide. Format attendu: https://[id].supabase.co${colors.reset}`); } } // Étape 2: Clé Anon console.log(`${colors.bright}🔑 Étape 2: Clé Anon (Public)${colors.reset}`); console.log('Dans les paramètres API, copiez la clé "anon public".\n'); while (true) { const anon = await question('🔐 Clé Anon (commence par eyJ...): '); if (validateJWT(anon)) { config.anon = anon; console.log(`${colors.green}✅ Clé Anon valide!${colors.reset}\n`); break; } else { console.log(`${colors.red}❌ Clé invalide. Doit être un JWT valide commençant par eyJ${colors.reset}`); } } // Étape 3: Clé Service Role console.log(`${colors.bright}🛡️ Étape 3: Clé Service Role (Privée)${colors.reset}`); console.log('Dans les paramètres API, copiez la clé "service_role".\n'); while (true) { const service = await question('🔒 Clé Service Role (commence par eyJ...): '); if (validateJWT(service)) { config.service = service; console.log(`${colors.green}✅ Clé Service Role valide!${colors.reset}\n`); break; } else { console.log(`${colors.red}❌ Clé invalide. Doit être un JWT valide commençant par eyJ${colors.reset}`); } } // Étape 4: Mot de passe DB console.log(`${colors.bright}🔒 Étape 4: Mot de Passe de la Base de Données${colors.reset}`); console.log('Mot de passe configuré lors de la création du projet.\n'); const db = await question('🗄️ Mot de passe DB: '); config.db = db; // Génération du  NextAuth config.nextAuth = generateNextAuth(); // Extraction de l'ID du projet const projectId = extractProjectId(config.anon); return { ...config, projectId };
}

/**
 * Fonction pour créer le fichier .env.local
 */
function createEnvFile(config) { const envContent = `# Configuration Supabase - OMIAM Pizza
# Généré automatiquement le ${new Date().toLocaleString('fr-FR')}

# Configuration Supabase
NEXT_PUBLIC_SUPABASE_URL=${config.url}
NEXT_PUBLIC_SUPABASE_ANON_=${config.anon}
SUPABASE_SERVICE_ROLE_=${config.service}
DATABASE_URL=postgresql://postgres:${config.db}@db.${config.projectId}.supabase.co:5432/postgres

# Configuration NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_=${config.nextAuth}

# Configuration Vercel
VERCEL_URL=

# Configuration Stripe (optionnel)
STRIPE_PUBLIC_=
STRIPE__=
STRIPE_WEBHOOK_=

# Configuration Email (optionnel)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

# Configuration Redis (optionnel)
REDIS_URL=

# Configuration de développement
NODE_ENV=development
DEBUG=false
`; const envPath = path.join(process.cwd(), '.env.local'); // Sauvegarde de l'ancien fichier if (fs.existsSync(envPath)) { const backupPath = `${envPath}.backup.${Date.now()}`; fs.copyFileSync(envPath, backupPath); console.log(`${colors.yellow}📁 Ancien .env.local sauvegardé: ${path.basename(backupPath)}${colors.reset}`); } fs.writeFileSync(envPath, envContent); console.log(`${colors.green}✅ Nouveau .env.local créé avec succès!${colors.reset}`);
}

/**
 * Fonction pour er la connexion
 */
async function Connection() { console.log(`\n${colors.bright}🧪  de la nouvelle configuration...${colors.reset}`); try { const { spawn } = require('child_process'); return new Promise((resolve) => { const Process = spawn('node', [-connection.js'], { stdio: 'inherit' }); Process.on('close', (code) => { if (code === 0) { console.log(`${colors.green}\n✅  de connexion réussi!${colors.reset}`); resolve(true); } else { console.log(`${colors.red}\n❌  de connexion échoué.${colors.reset}`); resolve(false); } }); }); } catch (error) { console.log(`${colors.red}❌ Erreur lors du : ${error.message}${colors.reset}`); return false; }
}

/**
 * Fonction pour afficher les prochaines étapes
 */
function showNextSteps() { console.log(`\n${colors.cyan}${colors.bright}🚀 PROCHAINES ÉTAPES${colors.reset}`); console.log('=' .repeat(40)); console.log(`\n${colors.bright}1. Exécuter le script SQL${colors.reset}`); console.log(' - Allez sur https://supabase.com/dashboard'); console.log(' - Sélectionnez votre projet → SQL Editor'); console.log(' - Copiez le contenu de supabase-schema.sql'); console.log(' - Collez et exécutez (bouton RUN)'); console.log(`\n${colors.bright}2. Vérifier la base de données${colors.reset}`); console.log(' - Commande: node verify-database.js'); console.log(`\n${colors.bright}3. er l\'application${colors.reset}`); console.log(' - L\'application devrait fonctionner sur http://localhost:3000'); console.log(' - ez l\'inscription/connexion'); console.log(' - Vérifiez le menu et les commandes'); console.log(`\n${colors.green}🎉 Configuration Supabase terminée!${colors.reset}`);
}

/**
 * Fonction principale
 */
async function main() { try { const config = await configureSupabase(); console.log(`\n${colors.bright}📝 Création du fichier de configuration...${colors.reset}`); createEnvFile(config); const Success = await Connection(); if (Success) { showNextSteps(); } else { console.log(`\n${colors.yellow}⚠️  La connexion a échoué. Vérifiez les informations saisies.${colors.reset}`); console.log(`${colors.blue}💡 Vous pouvez relancer ce script: node reconfigure-supabase.js${colors.reset}`); } } catch (error) { console.error(`${colors.red}💥 Erreur: ${error.message}${colors.reset}`); } finally { rl.close(); }
}

if (require.main === module) { main();
}

module.exports = { configureSupabase, createEnvFile, Connection };