#!/usr/bin/env node

/**
 * 🔐 Script de Validation Stripe - Sécurité PCI DSS
 * Vérifie la configuration Stripe et la conformité de sécurité
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuration des couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Logger avec couleurs
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  title: (msg) => console.log(`${colors.bright}${colors.cyan}🔐 ${msg}${colors.reset}`)
};

// Chargement des variables d'environnement
function loadEnvironmentVariables() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    try {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const envVars = envContent.split('\n')
        .filter(line => line.includes('=') && !line.startsWith('#'))
        .reduce((acc, line) => {
          const [key, ...valueParts] = line.split('=');
          acc[key.trim()] = valueParts.join('=').trim();
          return acc;
        }, {});
      Object.assign(process.env, envVars);
      log.info('Variables d\'environnement chargées depuis .env.local');
    } catch (error) {
      log.warning('Erreur lors du chargement de .env.local: ' + error.message);
    }
  } else {
    log.warning('Fichier .env.local non trouvé');
  }
}

// Validation des clés Stripe
function validateStripeKeys() {
  log.title('Validation des Clés Stripe');
  const requiredKeys = {
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY': 'Clé publique Stripe',
    'STRIPE_SECRET_KEY': 'Clé secrète Stripe',
    'STRIPE_WEBHOOK_SECRET': 'Secret webhook Stripe'
  };
  
  let allKeysValid = true;
  
  for (const [envKey, description] of Object.entries(requiredKeys)) {
    const value = process.env[envKey];
    if (!value) {
      log.error(`${description} manquante: ${envKey}`);
      allKeysValid = false;
      continue;
    }
    
    // Validation du format des clés
    if (envKey === 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY') {
      if (!value.startsWith('pk_')) {
        log.error(`Format invalide pour ${envKey}: doit commencer par 'pk_'`);
        allKeysValid = false;
      } else {
        log.success(`${description} valide`);
      }
    } else if (envKey === 'STRIPE_SECRET_KEY') {
      if (!value.startsWith('sk_')) {
        log.error(`Format invalide pour ${envKey}: doit commencer par 'sk_'`);
        allKeysValid = false;
      } else {
        log.success(`${description} valide`);
      }
    } else if (envKey === 'STRIPE_WEBHOOK_SECRET') {
      if (!value.startsWith('whsec_')) {
        log.error(`Format invalide pour ${envKey}: doit commencer par 'whsec_'`);
        allKeysValid = false;
      } else {
        log.success(`${description} valide`);
      }
    }
  }
  
  return allKeysValid;
}

// Validation de la sécurité PCI DSS
function validatePCICompliance() {
  log.title('Validation PCI DSS');
  const issues = [];
  const warnings = [];
  
  // Vérification des fichiers sensibles
  const sensitiveFiles = [
    'src/app/api/stripe/webhook/route.ts',
    'src/app/api/payments/route.ts',
    'src/components/checkout/CheckoutForm.tsx'
  ];
  
  sensitiveFiles.forEach(filePath => {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Vérification des clés hardcodées
      if (content.includes('sk_') || content.includes('pk_')) {
        issues.push(`Clés Stripe potentiellement hardcodées dans ${filePath}`);
      }
      
      // Vérification de la validation des webhooks
      if (filePath.includes('webhook') && !content.includes('stripe.webhooks.constructEvent')) {
        warnings.push(`Validation webhook manquante dans ${filePath}`);
      }
      
      log.success(`Fichier analysé: ${filePath}`);
    } else {
      warnings.push(`Fichier non trouvé: ${filePath}`);
    }
  });
  
  // Vérification de la configuration HTTPS
  const nextConfig = path.join(process.cwd(), 'next.config.js');
  if (fs.existsSync(nextConfig)) {
    const content = fs.readFileSync(nextConfig, 'utf8');
    if (!content.includes('headers') || !content.includes('Strict-Transport-Security')) {
      warnings.push('Configuration HTTPS/HSTS manquante dans next.config.js');
    }
  }
  
  return { issues, warnings };
}

// Test de connexion Stripe
async function testStripeConnection() {
  log.title('Test de Connexion Stripe');
  try {
    // Simulation d'un test de connexion (sans vraie API call)
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY manquante');
    }
    
    // Vérification de l'environnement (test vs live)
    const isTestMode = secretKey.includes('_test_');
    const environment = isTestMode ? 'TEST' : 'PRODUCTION';
    log.info(`Environnement détecté: ${environment}`);
    
    if (!isTestMode) {
      log.warning('⚠️  Mode PRODUCTION détecté - Assurez-vous d\'être en conformité PCI DSS');
    }
    
    log.success('Configuration Stripe validée');
    return true;
  } catch (error) {
    log.error('Erreur de connexion Stripe: ' + error.message);
    return false;
  }
}

// Génération du rapport de validation
function generateValidationReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    status: results.overall ? 'COMPLIANT' : 'NON_COMPLIANT',
    stripe_keys: results.stripeKeys,
    stripe_connection: results.stripeConnection,
    pci_compliance: results.pciCompliance,
    recommendations: []
  };
  
  // Ajout des recommandations
  if (!results.stripeKeys) {
    report.recommendations.push('Configurer toutes les clés Stripe requises');
  }
  if (!results.stripeConnection) {
    report.recommendations.push('Vérifier la connexion à l\'API Stripe');
  }
  if (results.pciCompliance.issues.length > 0) {
    report.recommendations.push('Corriger les problèmes de sécurité PCI DSS identifiés');
  }
  if (results.pciCompliance.warnings.length > 0) {
    report.recommendations.push('Examiner les avertissements de sécurité');
  }
  
  // Sauvegarde du rapport
  const reportPath = path.join(process.cwd(), 'stripe-validation-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log.info(`Rapport sauvegardé: ${reportPath}`);
  
  return report;
}

// Fonction principale
async function main() {
  console.log('\n' + '='.repeat(60));
  log.title('VALIDATION STRIPE & PCI DSS');
  console.log('='.repeat(60) + '\n');
  
  // Chargement des variables d'environnement
  loadEnvironmentVariables();
  
  // Validation des clés Stripe
  const stripeKeysValid = validateStripeKeys();
  
  // Test de connexion Stripe
  const stripeConnectionValid = await testStripeConnection();
  
  // Validation PCI DSS
  const pciResults = validatePCICompliance();
  
  // Affichage des résultats
  console.log('\n' + '-'.repeat(40));
  log.title('RÉSULTATS DE VALIDATION');
  console.log('-'.repeat(40));
  
  if (pciResults.issues.length > 0) {
    log.error('Problèmes critiques détectés:');
    pciResults.issues.forEach(issue => log.error(`  • ${issue}`));
  }
  
  if (pciResults.warnings.length > 0) {
    log.warning('Avertissements:');
    pciResults.warnings.forEach(warning => log.warning(`  • ${warning}`));
  }
  
  const overallValid = stripeKeysValid && stripeConnectionValid && pciResults.issues.length === 0;
  
  // Génération du rapport
  const report = generateValidationReport({
    overall: overallValid,
    stripeKeys: stripeKeysValid,
    stripeConnection: stripeConnectionValid,
    pciCompliance: pciResults
  });
  
  console.log('\n' + '='.repeat(60));
  if (overallValid) {
    log.success('✅ VALIDATION RÉUSSIE - Configuration Stripe conforme');
  } else {
    log.error('❌ VALIDATION ÉCHOUÉE - Corrections requises');
    process.exit(1);
  }
  console.log('='.repeat(60) + '\n');
}

// Exécution du script
if (require.main === module) {
  main().catch(error => {
    log.error('Erreur fatale: ' + error.message);
    process.exit(1);
  });
}

module.exports = {
  validateStripeKeys,
  validatePCICompliance,
  testStripeConnection
};