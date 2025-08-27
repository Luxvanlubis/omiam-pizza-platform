#!/usr/bin/env node

/**
 * Final Setup Completion Script
 * This script helps complete the Supabase configuration with your actual credentials
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Generate NextAuth 
const nextAuth = crypto.randomBytes(32).toString('base64');

console.log('🍕 Configuration finale OMIAM Pizza');
console.log('='.repeat(40));

console.log('\n✅ Configuration détectée :');
console.log('- Projet Supabase: bnjmxkjpngvkmelkhnjv');
console.log('- URL: https://bnjmxkjpngvkmelkhnjv.supabase.co');

console.log('\n🔐 Clés manquantes à récupérer :');
console.log('1. Service Role  (Settings → API)');
console.log('2. Database  (Settings → Database)');
console.log('3. NextAuth  généré:', nextAuth);

// Update .env.local with NextAuth 
const envPath = path.join(__dirname, '.env.local');
let envContent = fs.readFileSync(envPath, 'utf8');
envContent = envContent.replace('your_nextauth__here', nextAuth);
fs.writeFileSync(envPath, envContent);

console.log('\n📋 Étapes finales :');
console.log('1. Allez sur https://app.supabase.com/project/bnjmxkjpngvkmelkhnjv/settings/api');
console.log('2. Copiez votre Service Role Key');
console.log('3. Allez sur https://app.supabase.com/project/bnjmxkjpngvkmelkhnjv/settings/database');
console.log('4. Copiez votre Database Password');
console.log('5. Mettez à jour .env.local avec ces valeurs');
console.log('6. Exécutez le script SQL dans Supabase → SQL Editor');

console.log('\n🚀  rapide :');
console.log('npm run dev');
console.log('http://localhost:3000');

console.log('\n💡 Commande SQL à exécuter :');
console.log('Copiez le contenu de supabase-schema.sql dans SQL Editor');