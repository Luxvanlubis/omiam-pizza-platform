#!/usr/bin/env node
/**
 * 🔧 Script de correction des dépendances - Versions compatibles
 * Objectif: Corriger les packages inexistants ou incompatibles
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DependencyFixer {
  constructor() {
    this.packageJsonPath = path.join(process.cwd(), 'package.json');
    this.backupPath = path.join(process.cwd(), 'package.json.backup');
  }

  log(message) {
    console.log(`🔧 ${message}`);
  }

  // Corrections des packages problématiques
  getPackageFixes() {
    return {
      // Packages inexistants ou versions incorrectes
      '@radix-ui/react-sheet': '@radix-ui/react-dialog',
      '@supabase/ssr@^0.8.0': '@supabase/ssr@^0.5.0',
      '@mdxeditor/editor@^3.39.1': '@mdxeditor/editor@^3.11.0',
      '@tanstack/react-query@^5.62.7': '@tanstack/react-query@^5.51.0',
      '@tanstack/react-query-devtools@^5.62.7': '@tanstack/react-query-devtools@^5.51.0',
      'next@15.1.3': 'next@14.2.5',
      'react@^19.0.0': 'react@^18.3.1',
      'react-dom@^19.0.0': 'react-dom@^18.3.1',
      '@types/react@^19.0.2': '@types/react@^18.3.3',
      '@types/react-dom@^19.0.2': '@types/react-dom@^18.3.0'
    };
  }

  // Backup du package.json original
  createBackup() {
    if (fs.existsSync(this.packageJsonPath)) {
      fs.copyFileSync(this.packageJsonPath, this.backupPath);
      this.log(`Backup créé: ${this.backupPath}`);
    }
  }

  // Corriger le package.json
  fixPackageJson() {
    this.log('Correction du package.json...');
    
    if (!fs.existsSync(this.packageJsonPath)) {
      this.log('❌ package.json introuvable');
      return false;
    }

    try {
      const packageData = JSON.parse(fs.readFileSync(this.packageJsonPath, 'utf8'));
      const fixes = this.getPackageFixes();
      let fixCount = 0;

      // Corriger les dépendances
      if (packageData.dependencies) {
        Object.keys(packageData.dependencies).forEach(pkg => {
          const currentVersion = packageData.dependencies[pkg];
          const fullPkg = `${pkg}@${currentVersion}`;
          
          // Vérifier si le package ou sa version nécessite une correction
          Object.keys(fixes).forEach(problematicPkg => {
            if (pkg === problematicPkg || fullPkg === problematicPkg || pkg.includes(problematicPkg.split('@')[0])) {
              const newPkg = fixes[problematicPkg];
              if (newPkg.includes('@')) {
                const [newName, newVersion] = newPkg.split('@');
                if (newName !== pkg) {
                  // Renommer le package
                  delete packageData.dependencies[pkg];
                  packageData.dependencies[newName] = `^${newVersion}`;
                } else {
                  // Changer seulement la version
                  packageData.dependencies[pkg] = `^${newVersion}`;
                }
              } else {
                // Renommer le package sans changer la version
                const version = packageData.dependencies[pkg];
                delete packageData.dependencies[pkg];
                packageData.dependencies[newPkg] = version;
              }
              fixCount++;
              this.log(`✅ Corrigé: ${pkg} -> ${newPkg}`);
            }
          });
        });
      }

      // Corriger les devDependencies
      if (packageData.devDependencies) {
        Object.keys(packageData.devDependencies).forEach(pkg => {
          const currentVersion = packageData.devDependencies[pkg];
          const fullPkg = `${pkg}@${currentVersion}`;
          
          Object.keys(fixes).forEach(problematicPkg => {
            if (pkg === problematicPkg || fullPkg === problematicPkg) {
              const newPkg = fixes[problematicPkg];
              if (newPkg.includes('@')) {
                const [newName, newVersion] = newPkg.split('@');
                if (newName !== pkg) {
                  delete packageData.devDependencies[pkg];
                  packageData.devDependencies[newName] = `^${newVersion}`;
                } else {
                  packageData.devDependencies[pkg] = `^${newVersion}`;
                }
              } else {
                const version = packageData.devDependencies[pkg];
                delete packageData.devDependencies[pkg];
                packageData.devDependencies[newPkg] = version;
              }
              fixCount++;
              this.log(`✅ Corrigé (dev): ${pkg} -> ${newPkg}`);
            }
          });
        });
      }

      // Sauvegarder le package.json corrigé
      fs.writeFileSync(this.packageJsonPath, JSON.stringify(packageData, null, 2));
      this.log(`✅ package.json corrigé avec ${fixCount} modifications`);
      return true;

    } catch (error) {
      this.log(`❌ Erreur lors de la correction: ${error.message}`);
      return false;
    }
  }

  // Nettoyer et réinstaller
  cleanInstall() {
    this.log('Nettoyage et réinstallation...');
    
    try {
      // Supprimer node_modules et package-lock.json
      if (fs.existsSync('node_modules')) {
        this.log('🗑️ Suppression node_modules...');
        execSync('rmdir /s /q node_modules', { stdio: 'inherit' });
      }
      
      if (fs.existsSync('package-lock.json')) {
        this.log('🗑️ Suppression package-lock.json...');
        fs.unlinkSync('package-lock.json');
      }

      // Nettoyer le cache npm
      this.log('🧹 Nettoyage cache npm...');
      execSync('npm cache clean --force', { stdio: 'inherit' });

      // Réinstaller avec --legacy-peer-deps pour éviter les conflits
      this.log('📦 Installation des dépendances...');
      execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
      
      this.log('✅ Installation terminée avec succès!');
      return true;

    } catch (error) {
      this.log(`❌ Erreur lors de l'installation: ${error.message}`);
      return false;
    }
  }

  // Exécution principale
  async run() {
    this.log('🚀 Démarrage correction des dépendances...');
    
    try {
      // 1. Créer un backup
      this.createBackup();
      
      // 2. Corriger le package.json
      const fixed = this.fixPackageJson();
      
      if (!fixed) {
        this.log('❌ Impossible de corriger package.json');
        return false;
      }

      // 3. Nettoyer et réinstaller
      const installed = this.cleanInstall();
      
      if (installed) {
        this.log('✅ Correction des dépendances terminée!');
        return true;
      } else {
        this.log('⚠️ Problème lors de l\'installation, restauration du backup...');
        if (fs.existsSync(this.backupPath)) {
          fs.copyFileSync(this.backupPath, this.packageJsonPath);
        }
        return false;
      }
      
    } catch (error) {
      this.log(`❌ Erreur critique: ${error.message}`);
      return false;
    }
  }
}

// Exécution si appelé directement
if (require.main === module) {
  const fixer = new DependencyFixer();
  fixer.run().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
}

module.exports = DependencyFixer;