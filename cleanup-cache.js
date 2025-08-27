// Script de nettoyage du cache et des fichiers temporaires
const fs = require('fs');
const path = require('path');

console.log('🧹 Nettoyage du cache et des fichiers temporaires...');
console.log('==================================================');

// Fonction pour supprimer récursivement un dossier
function removeDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`✅ Supprimé: ${dirPath}`);
    return true;
  }
  return false;
}

// Fonction pour nettoyer un dossier (garder le dossier, supprimer le contenu)
function cleanDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      fs.rmSync(filePath, { recursive: true, force: true });
    });
    console.log(`🧽 Nettoyé: ${dirPath}`);
    return true;
  }
  return false;
}

try {
  // 1. Nettoyer le cache Next.js
  console.log('\n1️⃣ Nettoyage du cache Next.js...');
  removeDir('.next');
  
  // 2. Nettoyer node_modules/.cache
  console.log('\n2️⃣ Nettoyage du cache node_modules...');
  removeDir('node_modules/.cache');
  
  // 3. Nettoyer les fichiers temporaires
  console.log('\n3️⃣ Nettoyage des fichiers temporaires...');
  const tempDirs = [
    'tmp',
    '.tmp',
    'temp',
    '.temp'
  ];
  
  tempDirs.forEach(dir => {
    if (removeDir(dir)) {
      console.log(`✅ Dossier temporaire supprimé: ${dir}`);
    }
  });
  
  // 4. Nettoyer les logs
  console.log('\n4️⃣ Nettoyage des logs...');
  const logFiles = [
    'npm-debug.log',
    'yarn-debug.log',
    'yarn-error.log',
    '.npm/_logs',
    'logs'
  ];
  
  logFiles.forEach(logFile => {
    if (fs.existsSync(logFile)) {
      if (fs.statSync(logFile).isDirectory()) {
        removeDir(logFile);
      } else {
        fs.unlinkSync(logFile);
        console.log(`✅ Fichier log supprimé: ${logFile}`);
      }
    }
  });
  
  console.log('\n🎉 NETTOYAGE TERMINÉ');
  console.log('==================================================');
  console.log('✅ Cache Next.js nettoyé');
  console.log('✅ Fichiers temporaires supprimés');
  console.log('✅ Logs nettoyés');
  console.log('\n📋 PROCHAINES ÉTAPES:');
  console.log('1. Redémarrer le serveur de développement');
  console.log('2. Vider le cache du navigateur (Ctrl+Shift+R)');
  console.log('3. Ouvrir les outils de développement et vider localStorage');
  
} catch (error) {
  console.error('❌ Erreur lors du nettoyage:', error.message);
  process.exit(1);
}