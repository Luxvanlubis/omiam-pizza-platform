#!/usr/bin/env node
/**
 * 🚀 Script d'optimisation projet - Réduction taille prompts & nettoyage
 * Objectif: Gérer les erreurs JSON récurrentes et optimiser l'environnement
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ProjectOptimizer {
  constructor() {
    this.projectRoot = process.cwd();
    this.logFile = path.join(this.projectRoot, 'optimization.log');
    this.backupDir = path.join(this.projectRoot, 'backup-' + Date.now());
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    console.log(message);
    fs.appendFileSync(this.logFile, logEntry);
  }

  // 1. Nettoyer et réparer package-lock.json
  async fixPackageLock() {
    this.log('🔧 Réparation package-lock.json...');
    
    const packageLockPath = path.join(this.projectRoot, 'package-lock.json');
    
    if (!fs.existsSync(packageLockPath)) {
      this.log('❌ package-lock.json introuvable');
      return false;
    }

    try {
      // Backup du fichier original
      const backupPath = path.join(this.backupDir, 'package-lock.json.backup');
      fs.mkdirSync(this.backupDir, { recursive: true });
      fs.copyFileSync(packageLockPath, backupPath);
      this.log(`📦 Backup créé: ${backupPath}`);

      // Lire et nettoyer le contenu
      let content = fs.readFileSync(packageLockPath, 'utf8');
      
      // Corrections communes des erreurs JSON
      const fixes = [
        // Corriger les clés malformées @playwright
        { pattern: /"@playwright\/:"/g, replacement: '"@playwright/test":' },
        { pattern: /"@playwright\/:/g, replacement: '"@playwright/test":' },
        // Corriger les guillemets manquants
        { pattern: /([^"\s]):/g, replacement: '$1":' },
        // Corriger les propriétés sans guillemets
        { pattern: /-exclude":/g, replacement: '"test-exclude":' },
        { pattern: /""([^"]+)"":/g, replacement: '"$1":' }
      ];

      let fixCount = 0;
      fixes.forEach(fix => {
        const beforeCount = (content.match(fix.pattern) || []).length;
        content = content.replace(fix.pattern, fix.replacement);
        const afterCount = (content.match(fix.pattern) || []).length;
        if (beforeCount > afterCount) {
          fixCount += (beforeCount - afterCount);
          this.log(`✅ Corrigé ${beforeCount - afterCount} occurrences: ${fix.pattern}`);
        }
      });

      // Valider le JSON
      try {
        JSON.parse(content);
        fs.writeFileSync(packageLockPath, content);
        this.log(`✅ package-lock.json réparé avec ${fixCount} corrections`);
        return true;
      } catch (parseError) {
        this.log(`❌ JSON toujours invalide après corrections: ${parseError.message}`);
        // Restaurer le backup
        fs.copyFileSync(backupPath, packageLockPath);
        return false;
      }

    } catch (error) {
      this.log(`❌ Erreur lors de la réparation: ${error.message}`);
      return false;
    }
  }

  // 2. Nettoyer les fichiers temporaires et caches
  cleanTempFiles() {
    this.log('🧹 Nettoyage fichiers temporaires...');
    
    const tempPatterns = [
      'debug-*.js',
      'fix-*.js',
      'find-*.js',
      'test-*.js',
      'quick-*.js',
      '.next/cache/**/*',
      'node_modules/.cache/**/*',
      'coverage/**/*'
    ];

    let cleanedCount = 0;
    tempPatterns.forEach(pattern => {
      try {
        const files = this.globSync(pattern);
        files.forEach(file => {
          if (fs.existsSync(file) && !file.includes('node_modules')) {
            fs.unlinkSync(file);
            cleanedCount++;
            this.log(`🗑️ Supprimé: ${file}`);
          }
        });
      } catch (error) {
        // Ignorer les erreurs de pattern
      }
    });

    this.log(`✅ ${cleanedCount} fichiers temporaires nettoyés`);
  }

  // 3. Optimiser la structure du projet
  optimizeStructure() {
    this.log('📁 Optimisation structure projet...');
    
    // Créer un fichier .traeai-ignore pour réduire les prompts
    const ignoreContent = `# Fichiers à ignorer pour réduire la taille des prompts\n` +
      `node_modules/\n` +
      `.next/\n` +
      `coverage/\n` +
      `*.log\n` +
      `debug-*.js\n` +
      `fix-*.js\n` +
      `test-*.js\n` +
      `backup-*/\n` +
      `.swc/\n` +
      `tsconfig.tsbuildinfo\n`;
    
    fs.writeFileSync(path.join(this.projectRoot, '.traeai-ignore'), ignoreContent);
    this.log('✅ Fichier .traeai-ignore créé');
  }

  // 4. Régénérer package-lock.json proprement
  async regeneratePackageLock() {
    this.log('🔄 Régénération package-lock.json...');
    
    try {
      // Supprimer l'ancien package-lock.json
      const packageLockPath = path.join(this.projectRoot, 'package-lock.json');
      if (fs.existsSync(packageLockPath)) {
        fs.unlinkSync(packageLockPath);
      }

      // Nettoyer node_modules
      const nodeModulesPath = path.join(this.projectRoot, 'node_modules');
      if (fs.existsSync(nodeModulesPath)) {
        this.log('🗑️ Suppression node_modules...');
        execSync('rmdir /s /q node_modules', { cwd: this.projectRoot, stdio: 'inherit' });
      }

      // Réinstaller les dépendances
      this.log('📦 Réinstallation dépendances...');
      execSync('npm install', { cwd: this.projectRoot, stdio: 'inherit' });
      
      this.log('✅ package-lock.json régénéré avec succès');
      return true;
    } catch (error) {
      this.log(`❌ Erreur lors de la régénération: ${error.message}`);
      return false;
    }
  }

  // Utilitaire pour glob simple
  globSync(pattern) {
    const files = [];
    const walk = (dir) => {
      try {
        const items = fs.readdirSync(dir);
        items.forEach(item => {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
            walk(fullPath);
          } else if (stat.isFile()) {
            if (pattern.includes('*')) {
              const regex = new RegExp(pattern.replace(/\*/g, '.*'));
              if (regex.test(item)) {
                files.push(fullPath);
              }
            } else if (item === pattern) {
              files.push(fullPath);
            }
          }
        });
      } catch (error) {
        // Ignorer les erreurs d'accès
      }
    };
    walk(this.projectRoot);
    return files;
  }

  // Exécution principale
  async run() {
    this.log('🚀 Démarrage optimisation projet...');
    
    try {
      // 1. Réparer package-lock.json
      const fixed = await this.fixPackageLock();
      
      if (!fixed) {
        this.log('⚠️ Tentative de régénération complète...');
        await this.regeneratePackageLock();
      }

      // 2. Nettoyer les fichiers temporaires
      this.cleanTempFiles();

      // 3. Optimiser la structure
      this.optimizeStructure();

      this.log('✅ Optimisation terminée avec succès!');
      this.log(`📊 Logs sauvegardés dans: ${this.logFile}`);
      
    } catch (error) {
      this.log(`❌ Erreur critique: ${error.message}`);
      process.exit(1);
    }
  }
}

// Exécution si appelé directement
if (require.main === module) {
  const optimizer = new ProjectOptimizer();
  optimizer.run().catch(console.error);
}

module.exports = ProjectOptimizer;