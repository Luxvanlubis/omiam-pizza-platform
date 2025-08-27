#!/usr/bin/env node

/**
 * Interactive Supabase Environment Setup
 * This script helps you configure your .env.local with Supabase credentials
 * Run with: node setup-env.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout
});

function question(query) { return new Promise(resolve => rl.question(query, resolve));
}

function generateNextAuth() { return require('crypto').randomBytes(32).toString('base64');
}

async function setupEnvironment() { console.log('🍕 Configuration Interactive de Supabase pour OMIAM Pizza'); console.log('='.repeat(55)); console.log('\n📋 Vous trouverez vos clés dans: https://app.supabase.com/project/[your-project]/settings/api'); console.log('\n⚠️  Important: Ne partagez jamais vos clés privées !\n'); // Collect credentials const supabaseUrl = await question('🔗 URL du projet Supabase (https://[project].supabase.co): '); const supabaseAnon = await question('🔑 Anon/Public : '); const supabaseService = await question('🔐 Service Role : '); const db = await question('🗝️  Mot de passe de la base de données: '); // Extract project name from URL const projectMatch = supabaseUrl.match(/https:\/\/([^\.]+)\.supabase\.co/); const projectName = projectMatch ? projectMatch[1] : 'your-project'; // Generate NextAuth const nextAuth = generateNextAuth(); // Create .env.local content const envContent = `# Configuration Supabase
NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_=${supabaseAnon}
SUPABASE_SERVICE_ROLE_=${supabaseService}
DATABASE_URL=postgresql://postgres:${db}@db.${projectName}.supabase.co:5432/postgres

# Configuration NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_=${nextAuth}

# Configuration Vercel (auto-généré lors du déploiement)
VERCEL_URL=

# Configuration Stripe (optionnel)
STRIPE_PUBLIC_=
STRIPE__=
STRIPE_WEBHOOK_=

# Configuration Email (optionnel)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_=

# Configuration Analytics (optionnel)
GOOGLE_ANALYTICS_ID=
POSTHOG_=

# Mode développement
NODE_ENV=development
`; // Write .env.local file const envPath = path.join(__dirname, '.env.local'); fs.writeFileSync(envPath, envContent); console.log('\n✅ Fichier .env.local créé avec succès !'); console.log(`📁 Chemin: ${envPath}`); console.log('\n📊 Résumé de la configuration:'); console.log(`- Projet: ${projectName}`); console.log(`- URL Supabase: ${supabaseUrl}`); console.log(`- NextAuth  généré: ${nextAuth.substring(0, 10)}...`); console.log('\n🚀 Prochaines étapes:'); console.log('1. npm install (si pas déjà fait)'); console.log('2. npm run dev'); console.log('3. ez votre application sur http://localhost:3000'); // Create a backup file const backupPath = path.join(__dirname, '.env.example'); if (!fs.existsSync(backupPath)) { fs.writeFileSync(backupPath, envContent); console.log(`\n💾 Backup créé: ${backupPath}`); } rl.close();
}

// Check if .env.local already exists
if (fs.existsSync('.env.local')) { console.log('⚠️  Le fichier .env.local existe déjà !'); rl.question('Voulez-vous le remplacer ? (y/N): ', (answer) => { if (answer.toLowerCase() === 'y') { setupEnvironment(); } else { console.log('✋ Configuration annulée.'); rl.close(); } });
} else { setupEnvironment();
}

rl.on('close', () => { console.log('\n🎉 Configuration terminée !'); process.exit(0);
});