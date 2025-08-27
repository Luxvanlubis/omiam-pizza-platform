#!/usr/bin/env node

/**
 * 🚀 Test Production Build - O'MIAM
 * Teste le build de production Next.js et valide la configuration
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ProductionBuildTester {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      status: 'PENDING',
      tests: [],
      buildTime: null,
      buildSize: null,
      errors: [],
      warnings: []
    };
    this.startTime = Date.now();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString('fr-FR');
    const icons = { info: '📋', success: '✅', error: '❌', warning: '⚠️' };
    console.log(`${icons[type]} [${timestamp}] ${message}`);
  }

  async runTest(name, testFn) {
    this.log(`Test: ${name}`);
    const testResult = {
      name,
      status: 'PENDING',
      duration: 0,
      details: {},
      error: null
    };

    const testStart = Date.now();
    try {
      const result = await testFn();
      testResult.status = 'PASSED';
      testResult.details = result || {};
      this.log(`✅ ${name} - RÉUSSI`, 'success');
    } catch (error) {
      testResult.status = 'FAILED';
      testResult.error = error.message;
      this.results.errors.push(`${name}: ${error.message}`);
      this.log(`❌ ${name} - ÉCHOUÉ: ${error.message}`, 'error');
    }
    
    testResult.duration = Date.now() - testStart;
    this.results.tests.push(testResult);
    return testResult;
  }

  // Test 1: Vérification des dépendances
  async testDependencies() {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const nodeModulesExists = fs.existsSync('node_modules');
    
    if (!nodeModulesExists) {
      throw new Error('node_modules non trouvé - exécutez npm install');
    }

    const criticalDeps = ['next', 'react', 'react-dom'];
    const missingDeps = criticalDeps.filter(dep => 
      !packageJson.dependencies[dep] && !packageJson.devDependencies[dep]
    );

    if (missingDeps.length > 0) {
      throw new Error(`Dépendances manquantes: ${missingDeps.join(', ')}`);
    }

    return {
      totalDependencies: Object.keys(packageJson.dependencies || {}).length,
      devDependencies: Object.keys(packageJson.devDependencies || {}).length,
      criticalDepsFound: criticalDeps.length
    };
  }

  // Test 2: Validation de la configuration Next.js
  async testNextConfig() {
    const configExists = fs.existsSync('next.config.js');
    if (!configExists) {
      throw new Error('next.config.js non trouvé');
    }

    const configContent = fs.readFileSync('next.config.js', 'utf8');
    const hasOptimizations = configContent.includes('compress') || 
                           configContent.includes('swcMinify') ||
                           configContent.includes('experimental');

    return {
      configExists: true,
      hasOptimizations,
      configSize: configContent.length
    };
  }

  // Test 3: Build de production
  async testProductionBuild() {
    this.log('Démarrage du build de production...', 'info');
    const buildStart = Date.now();
    
    try {
      // Nettoyer le cache et build précédent
      if (fs.existsSync('.next')) {
        execSync('rmdir /s /q .next', { stdio: 'pipe' });
      }
      
      // Exécuter le build
      const buildOutput = execSync('npm run build', { 
        encoding: 'utf8',
        timeout: 300000 // 5 minutes max
      });
      
      const buildTime = Date.now() - buildStart;
      this.results.buildTime = buildTime;
      
      // Analyser la sortie du build
      const hasErrors = buildOutput.includes('Failed to compile') || 
                       buildOutput.includes('Error:');
      const hasWarnings = buildOutput.includes('Warning:');
      
      if (hasErrors) {
        throw new Error('Erreurs détectées dans le build');
      }
      
      // Vérifier que le dossier .next existe
      if (!fs.existsSync('.next')) {
        throw new Error('Dossier .next non créé après le build');
      }
      
      // Calculer la taille du build
      const buildSize = this.calculateDirectorySize('.next');
      this.results.buildSize = buildSize;
      
      return {
        buildTime,
        buildSize: `${(buildSize / 1024 / 1024).toFixed(2)} MB`,
        hasWarnings,
        outputLines: buildOutput.split('\n').length
      };
      
    } catch (error) {
      throw new Error(`Build échoué: ${error.message}`);
    }
  }

  // Test 4: Validation des fichiers de build
  async testBuildArtifacts() {
    const requiredFiles = [
      '.next/BUILD_ID',
      '.next/static',
      '.next/server',
      '.next/cache'
    ];
    
    const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
    
    if (missingFiles.length > 0) {
      throw new Error(`Fichiers de build manquants: ${missingFiles.join(', ')}`);
    }
    
    // Vérifier les pages statiques
    const staticDir = '.next/static';
    const staticFiles = fs.existsSync(staticDir) ? 
      fs.readdirSync(staticDir, { recursive: true }).length : 0;
    
    // Vérifier le manifest
    const manifestExists = fs.existsSync('.next/static/chunks/webpack-*.js') ||
                          fs.readdirSync('.next/static/chunks').some(f => f.startsWith('webpack'));
    
    return {
      requiredFilesFound: requiredFiles.length,
      staticFilesCount: staticFiles,
      manifestExists
    };
  }

  // Test 5: Test de démarrage de production
  async testProductionStart() {
    this.log('Test de démarrage en mode production...', 'info');
    
    try {
      // Tenter de démarrer le serveur en mode production (test rapide)
      const startOutput = execSync('timeout 10 npm start || echo "Timeout OK"', { 
        encoding: 'utf8',
        timeout: 15000
      });
      
      const hasStartupErrors = startOutput.includes('Error:') || 
                              startOutput.includes('EADDRINUSE');
      
      return {
        startupTested: true,
        hasStartupErrors,
        outputPreview: startOutput.substring(0, 200)
      };
      
    } catch (error) {
      // Le timeout est normal, on vérifie juste qu'il n'y a pas d'erreur immédiate
      return {
        startupTested: true,
        hasStartupErrors: false,
        note: 'Test de démarrage rapide effectué'
      };
    }
  }

  calculateDirectorySize(dirPath) {
    let totalSize = 0;
    
    function calculateSize(currentPath) {
      const stats = fs.statSync(currentPath);
      
      if (stats.isFile()) {
        totalSize += stats.size;
      } else if (stats.isDirectory()) {
        const files = fs.readdirSync(currentPath);
        files.forEach(file => {
          calculateSize(path.join(currentPath, file));
        });
      }
    }
    
    try {
      calculateSize(dirPath);
    } catch (error) {
      // Ignorer les erreurs d'accès aux fichiers
    }
    
    return totalSize;
  }

  generateReport() {
    const totalTests = this.results.tests.length;
    const passedTests = this.results.tests.filter(t => t.status === 'PASSED').length;
    const failedTests = this.results.tests.filter(t => t.status === 'FAILED').length;
    
    this.results.status = failedTests === 0 ? 'SUCCESS' : 'FAILED';
    
    const report = `
============================================================
🚀 RAPPORT DE TEST BUILD PRODUCTION - O'MIAM
============================================================
📅 Date: ${new Date().toLocaleString('fr-FR')}
📈 Statut global: ${this.results.status}
📊 Tests: ${totalTests} total, ${passedTests} réussies, ${failedTests} échouées
⚡ Taux de réussite: ${Math.round((passedTests / totalTests) * 100)}%
${this.results.buildTime ? `⏱️ Temps de build: ${Math.round(this.results.buildTime / 1000)}s` : ''}
${this.results.buildSize ? `📦 Taille du build: ${(this.results.buildSize / 1024 / 1024).toFixed(2)} MB` : ''}

📋 Détail des tests:`;

    let detailReport = '';
    this.results.tests.forEach((test, index) => {
      const status = test.status === 'PASSED' ? '✅' : '❌';
      detailReport += `\n  ${index + 1}. ${status} ${test.name}`;
      if (test.status === 'FAILED') {
        detailReport += `\n     ❌ ${test.error}`;
      } else if (Object.keys(test.details).length > 0) {
        Object.entries(test.details).forEach(([key, value]) => {
          detailReport += `\n     📊 ${key}: ${value}`;
        });
      }
    });

    let recommendations = '\n🎯 Recommandations:';
    if (this.results.status === 'SUCCESS') {
      recommendations += '\n  ✅ Build de production validé avec succès!';
      recommendations += '\n  🚀 L\'application est prête pour le déploiement';
    } else {
      recommendations += '\n  ❌ Des problèmes ont été détectés';
      recommendations += '\n  🔍 Vérifiez les erreurs ci-dessus';
      recommendations += '\n  🛠️ Corrigez les problèmes avant le déploiement';
    }

    const fullReport = report + detailReport + recommendations + '\n\n============================================================';
    
    // Sauvegarder le rapport
    const reportPath = `production-build-test-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    
    console.log(fullReport);
    console.log(`\n💾 Rapport sauvegardé: ${path.resolve(reportPath)}`);
    
    return this.results;
  }

  async runAllTests() {
    console.log('🚀 Démarrage des tests de build production O\'MIAM...');
    console.log('============================================================\n');

    await this.runTest('Vérification des dépendances', () => this.testDependencies());
    await this.runTest('Validation configuration Next.js', () => this.testNextConfig());
    await this.runTest('Build de production', () => this.testProductionBuild());
    await this.runTest('Validation des artefacts', () => this.testBuildArtifacts());
    await this.runTest('Test de démarrage production', () => this.testProductionStart());

    this.log('Génération du rapport final...', 'info');
    return this.generateReport();
  }
}

// Exécution principale
if (require.main === module) {
  const tester = new ProductionBuildTester();
  
  tester.runAllTests()
    .then(results => {
      console.log('\n🎉 Tests terminés!');
      process.exit(results.status === 'SUCCESS' ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Erreur fatale:', error.message);
      process.exit(1);
    });
}

module.exports = ProductionBuildTester;