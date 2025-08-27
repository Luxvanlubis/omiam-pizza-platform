const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ProductionValidator {
  constructor() {
    this.projectRoot = process.cwd();
    this.results = {
      timestamp: new Date().toISOString(),
      status: 'PENDING',
      categories: {
        codeQuality: { tests: [], score: 0 },
        security: { tests: [], score: 0 },
        performance: { tests: [], score: 0 },
        deployment: { tests: [], score: 0 },
        documentation: { tests: [], score: 0 }
      },
      overallScore: 0,
      recommendations: []
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString('fr-FR');
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '📋';
    console.log(`${icon} [${timestamp}] ${message}`);
  }

  addTest(category, name, status, details = null, error = null) {
    const test = { name, status, details, error };
    this.results.categories[category].tests.push(test);
    
    if (status === 'SUCCESS') {
      this.results.categories[category].score += 1;
    }
  }

  async validateCodeQuality() {
    this.log('🔍 Validation de la qualité du code...');
    
    // Vérifier la structure du projet
    const requiredDirs = ['src', 'public', 'components', 'pages'];
    const existingDirs = [];
    
    for (const dir of requiredDirs) {
      const dirPath = path.join(this.projectRoot, 'src', dir === 'src' ? '' : dir);
      if (fs.existsSync(dirPath)) {
        existingDirs.push(dir);
      }
    }
    
    this.addTest('codeQuality', 'Structure du projet', 
      existingDirs.length >= 3 ? 'SUCCESS' : 'WARNING',
      { required: requiredDirs, existing: existingDirs }
    );
    
    // Vérifier package.json
    try {
      const packageJson = JSON.parse(fs.readFileSync(path.join(this.projectRoot, 'package.json'), 'utf8'));
      const hasScripts = packageJson.scripts && Object.keys(packageJson.scripts).length > 0;
      const hasDependencies = packageJson.dependencies && Object.keys(packageJson.dependencies).length > 0;
      
      this.addTest('codeQuality', 'Configuration package.json',
        hasScripts && hasDependencies ? 'SUCCESS' : 'WARNING',
        { 
          scripts: Object.keys(packageJson.scripts || {}),
          dependenciesCount: Object.keys(packageJson.dependencies || {}).length
        }
      );
    } catch (error) {
      this.addTest('codeQuality', 'Configuration package.json', 'FAILED', null, error.message);
    }
    
    // Vérifier TypeScript
    const tsConfigExists = fs.existsSync(path.join(this.projectRoot, 'tsconfig.json'));
    this.addTest('codeQuality', 'Configuration TypeScript',
      tsConfigExists ? 'SUCCESS' : 'WARNING',
      { tsConfigExists }
    );
    
    // Vérifier les composants principaux
    const componentPaths = [
      'src/components/Header.tsx',
      'src/components/Menu.tsx',
      'src/components/Cart.tsx',
      'src/app/page.tsx'
    ];
    
    const existingComponents = componentPaths.filter(comp => 
      fs.existsSync(path.join(this.projectRoot, comp))
    );
    
    this.addTest('codeQuality', 'Composants principaux',
      existingComponents.length >= 3 ? 'SUCCESS' : 'WARNING',
      { 
        required: componentPaths.length,
        existing: existingComponents.length,
        components: existingComponents
      }
    );
  }

  async validateSecurity() {
    this.log('🔒 Validation de la sécurité...');
    
    // Vérifier .env.example
    const envExampleExists = fs.existsSync(path.join(this.projectRoot, '.env.example'));
    this.addTest('security', 'Template .env.example',
      envExampleExists ? 'SUCCESS' : 'WARNING',
      { envExampleExists }
    );
    
    // Vérifier .gitignore
    try {
      const gitignore = fs.readFileSync(path.join(this.projectRoot, '.gitignore'), 'utf8');
      const hasEnvIgnore = gitignore.includes('.env');
      const hasNodeModulesIgnore = gitignore.includes('node_modules');
      
      this.addTest('security', 'Configuration .gitignore',
        hasEnvIgnore && hasNodeModulesIgnore ? 'SUCCESS' : 'WARNING',
        { hasEnvIgnore, hasNodeModulesIgnore }
      );
    } catch (error) {
      this.addTest('security', 'Configuration .gitignore', 'WARNING', null, 'Fichier .gitignore non trouvé');
    }
    
    // Vérifier next.config.js pour les headers de sécurité
    try {
      const nextConfig = fs.readFileSync(path.join(this.projectRoot, 'next.config.js'), 'utf8');
      const hasSecurityHeaders = nextConfig.includes('X-Frame-Options') || nextConfig.includes('headers()');
      
      this.addTest('security', 'Headers de sécurité Next.js',
        hasSecurityHeaders ? 'SUCCESS' : 'WARNING',
        { hasSecurityHeaders }
      );
    } catch (error) {
      this.addTest('security', 'Headers de sécurité Next.js', 'WARNING', null, 'Configuration non vérifiable');
    }
    
    // Vérifier les dépendances de sécurité
    try {
      const packageJson = JSON.parse(fs.readFileSync(path.join(this.projectRoot, 'package.json'), 'utf8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      const securityPackages = ['bcryptjs', 'helmet', 'cors', 'express-rate-limit'];
      const foundSecurityPackages = securityPackages.filter(pkg => deps[pkg]);
      
      this.addTest('security', 'Packages de sécurité',
        foundSecurityPackages.length > 0 ? 'SUCCESS' : 'WARNING',
        { found: foundSecurityPackages, available: securityPackages }
      );
    } catch (error) {
      this.addTest('security', 'Packages de sécurité', 'WARNING', null, error.message);
    }
  }

  async validatePerformance() {
    this.log('⚡ Validation des performances...');
    
    // Vérifier la configuration PWA
    const manifestExists = fs.existsSync(path.join(this.projectRoot, 'public', 'manifest.json'));
    this.addTest('performance', 'Manifest PWA',
      manifestExists ? 'SUCCESS' : 'WARNING',
      { manifestExists }
    );
    
    // Vérifier les service workers
    const swExists = fs.existsSync(path.join(this.projectRoot, 'public', 'sw.js')) ||
                    fs.existsSync(path.join(this.projectRoot, 'src', 'sw.js'));
    this.addTest('performance', 'Service Worker',
      swExists ? 'SUCCESS' : 'WARNING',
      { swExists }
    );
    
    // Vérifier next.config.js pour les optimisations
    try {
      const nextConfig = fs.readFileSync(path.join(this.projectRoot, 'next.config.js'), 'utf8');
      const hasOptimizations = nextConfig.includes('compress') || nextConfig.includes('optimizeCss');
      
      this.addTest('performance', 'Optimisations Next.js',
        hasOptimizations ? 'SUCCESS' : 'WARNING',
        { hasOptimizations }
      );
    } catch (error) {
      this.addTest('performance', 'Optimisations Next.js', 'WARNING', null, 'Configuration non vérifiable');
    }
    
    // Vérifier la taille des images
    const publicDir = path.join(this.projectRoot, 'public');
    if (fs.existsSync(publicDir)) {
      const imageFiles = fs.readdirSync(publicDir)
        .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
        .map(file => {
          const filePath = path.join(publicDir, file);
          const stats = fs.statSync(filePath);
          return { file, size: stats.size };
        });
      
      const largeImages = imageFiles.filter(img => img.size > 500 * 1024); // > 500KB
      
      this.addTest('performance', 'Optimisation des images',
        largeImages.length === 0 ? 'SUCCESS' : 'WARNING',
        { 
          totalImages: imageFiles.length,
          largeImages: largeImages.length,
          largeImagesList: largeImages.map(img => `${img.file} (${Math.round(img.size / 1024)}KB)`)
        }
      );
    }
  }

  async validateDeployment() {
    this.log('🚀 Validation du déploiement...');
    
    // Vérifier les fichiers Docker
    const dockerFiles = ['Dockerfile', 'docker-compose.yml', '.dockerignore'];
    const existingDockerFiles = dockerFiles.filter(file => 
      fs.existsSync(path.join(this.projectRoot, file))
    );
    
    this.addTest('deployment', 'Fichiers Docker',
      existingDockerFiles.length >= 2 ? 'SUCCESS' : 'WARNING',
      { required: dockerFiles, existing: existingDockerFiles }
    );
    
    // Vérifier .env.production
    const envProdExists = fs.existsSync(path.join(this.projectRoot, '.env.production'));
    this.addTest('deployment', 'Configuration production',
      envProdExists ? 'SUCCESS' : 'WARNING',
      { envProdExists }
    );
    
    // Vérifier nginx.conf
    const nginxExists = fs.existsSync(path.join(this.projectRoot, 'nginx.conf'));
    this.addTest('deployment', 'Configuration Nginx',
      nginxExists ? 'SUCCESS' : 'WARNING',
      { nginxExists }
    );
    
    // Vérifier l'endpoint de health check
    const healthCheckPath = path.join(this.projectRoot, 'src', 'app', 'api', 'health', 'route.ts');
    const healthCheckExists = fs.existsSync(healthCheckPath);
    this.addTest('deployment', 'Health Check API',
      healthCheckExists ? 'SUCCESS' : 'WARNING',
      { healthCheckExists }
    );
    
    // Vérifier les scripts de build
    try {
      const packageJson = JSON.parse(fs.readFileSync(path.join(this.projectRoot, 'package.json'), 'utf8'));
      const hasBuildScript = packageJson.scripts && packageJson.scripts.build;
      const hasStartScript = packageJson.scripts && packageJson.scripts.start;
      
      this.addTest('deployment', 'Scripts de déploiement',
        hasBuildScript && hasStartScript ? 'SUCCESS' : 'WARNING',
        { hasBuildScript, hasStartScript }
      );
    } catch (error) {
      this.addTest('deployment', 'Scripts de déploiement', 'WARNING', null, error.message);
    }
  }

  async validateDocumentation() {
    this.log('📚 Validation de la documentation...');
    
    // Vérifier README.md
    const readmeExists = fs.existsSync(path.join(this.projectRoot, 'README.md'));
    let readmeQuality = 'WARNING';
    
    if (readmeExists) {
      try {
        const readme = fs.readFileSync(path.join(this.projectRoot, 'README.md'), 'utf8');
        const hasInstallInstructions = readme.toLowerCase().includes('install');
        const hasUsageInstructions = readme.toLowerCase().includes('usage') || readme.toLowerCase().includes('utilisation');
        
        if (hasInstallInstructions && hasUsageInstructions) {
          readmeQuality = 'SUCCESS';
        }
      } catch (error) {
        readmeQuality = 'WARNING';
      }
    }
    
    this.addTest('documentation', 'README.md',
      readmeQuality,
      { readmeExists, quality: readmeQuality }
    );
    
    // Vérifier le guide de déploiement
    const deploymentGuideExists = fs.existsSync(path.join(this.projectRoot, 'DEPLOYMENT_PRODUCTION.md'));
    this.addTest('documentation', 'Guide de déploiement',
      deploymentGuideExists ? 'SUCCESS' : 'WARNING',
      { deploymentGuideExists }
    );
    
    // Vérifier les commentaires dans le code
    const componentFiles = [];
    const srcDir = path.join(this.projectRoot, 'src');
    
    if (fs.existsSync(srcDir)) {
      const findTsxFiles = (dir) => {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);
          
          if (stat.isDirectory()) {
            findTsxFiles(filePath);
          } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            componentFiles.push(filePath);
          }
        });
      };
      
      findTsxFiles(srcDir);
    }
    
    const filesWithComments = componentFiles.filter(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        return content.includes('//') || content.includes('/*');
      } catch (error) {
        return false;
      }
    });
    
    const commentCoverage = componentFiles.length > 0 ? 
      Math.round((filesWithComments.length / componentFiles.length) * 100) : 0;
    
    this.addTest('documentation', 'Commentaires dans le code',
      commentCoverage >= 50 ? 'SUCCESS' : 'WARNING',
      { 
        totalFiles: componentFiles.length,
        filesWithComments: filesWithComments.length,
        coverage: `${commentCoverage}%`
      }
    );
  }

  generateRecommendations() {
    this.log('💡 Génération des recommandations...');
    
    // Analyser les résultats et générer des recommandations
    Object.entries(this.results.categories).forEach(([category, data]) => {
      const failedTests = data.tests.filter(t => t.status === 'FAILED');
      const warningTests = data.tests.filter(t => t.status === 'WARNING');
      
      if (failedTests.length > 0) {
        this.results.recommendations.push({
          priority: 'HIGH',
          category,
          message: `${failedTests.length} test(s) échoué(s) dans ${category}`,
          actions: failedTests.map(t => `Corriger: ${t.name}`)
        });
      }
      
      if (warningTests.length > 0) {
        this.results.recommendations.push({
          priority: 'MEDIUM',
          category,
          message: `${warningTests.length} amélioration(s) possible(s) dans ${category}`,
          actions: warningTests.map(t => `Améliorer: ${t.name}`)
        });
      }
    });
    
    // Recommandations spécifiques
    if (this.results.overallScore < 70) {
      this.results.recommendations.push({
        priority: 'HIGH',
        category: 'general',
        message: 'Score global insuffisant pour la production',
        actions: ['Corriger les problèmes critiques', 'Améliorer la qualité générale']
      });
    }
  }

  calculateScores() {
    // Calculer les scores par catégorie
    Object.entries(this.results.categories).forEach(([category, data]) => {
      const totalTests = data.tests.length;
      const successTests = data.tests.filter(t => t.status === 'SUCCESS').length;
      data.score = totalTests > 0 ? Math.round((successTests / totalTests) * 100) : 0;
    });
    
    // Calculer le score global
    const categoryScores = Object.values(this.results.categories).map(c => c.score);
    this.results.overallScore = categoryScores.length > 0 ? 
      Math.round(categoryScores.reduce((a, b) => a + b, 0) / categoryScores.length) : 0;
  }

  async generateReport() {
    this.log('📊 Génération du rapport de validation...');
    
    this.calculateScores();
    this.generateRecommendations();
    
    this.results.status = this.results.overallScore >= 80 ? 'READY' : 
                         this.results.overallScore >= 60 ? 'NEEDS_IMPROVEMENT' : 'NOT_READY';
    
    // Sauvegarder le rapport
    const reportPath = path.join(this.projectRoot, `production-validation-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    
    // Afficher le rapport
    console.log('\n============================================================');
    console.log('🎯 RAPPORT DE VALIDATION PRODUCTION - O\'MIAM');
    console.log('============================================================');
    console.log(`📅 Date: ${new Date().toLocaleString('fr-FR')}`);
    console.log(`📈 Statut: ${this.results.status}`);
    console.log(`🏆 Score global: ${this.results.overallScore}/100`);
    
    console.log('\n📊 Scores par catégorie:');
    Object.entries(this.results.categories).forEach(([category, data]) => {
      const emoji = data.score >= 80 ? '🟢' : data.score >= 60 ? '🟡' : '🔴';
      console.log(`  ${emoji} ${category}: ${data.score}/100 (${data.tests.filter(t => t.status === 'SUCCESS').length}/${data.tests.length} tests réussis)`);
    });
    
    console.log('\n📋 Détail des tests:');
    Object.entries(this.results.categories).forEach(([category, data]) => {
      console.log(`\n  📂 ${category.toUpperCase()}:`);
      data.tests.forEach(test => {
        const status = test.status === 'SUCCESS' ? '✅' : test.status === 'WARNING' ? '⚠️' : '❌';
        console.log(`    ${status} ${test.name}`);
        if (test.error) {
          console.log(`       ❌ ${test.error}`);
        }
      });
    });
    
    if (this.results.recommendations.length > 0) {
      console.log('\n💡 Recommandations:');
      this.results.recommendations.forEach((rec, index) => {
        const priority = rec.priority === 'HIGH' ? '🔴' : '🟡';
        console.log(`  ${index + 1}. ${priority} [${rec.category}] ${rec.message}`);
        rec.actions.forEach(action => {
          console.log(`     • ${action}`);
        });
      });
    }
    
    console.log('\n🎯 Verdict:');
    if (this.results.status === 'READY') {
      console.log('  ✅ L\'application est PRÊTE pour la production!');
      console.log('  🚀 Vous pouvez procéder au déploiement');
    } else if (this.results.status === 'NEEDS_IMPROVEMENT') {
      console.log('  ⚠️ L\'application nécessite des AMÉLIORATIONS');
      console.log('  🔧 Corrigez les points d\'attention avant le déploiement');
    } else {
      console.log('  ❌ L\'application N\'EST PAS PRÊTE pour la production');
      console.log('  🛠️ Des corrections importantes sont nécessaires');
    }
    
    console.log(`\n💾 Rapport détaillé sauvegardé: ${reportPath}`);
    console.log('============================================================');
    
    return this.results;
  }

  async run() {
    try {
      console.log('🎯 Démarrage de la validation production O\'MIAM...');
      console.log('============================================================\n');
      
      await this.validateCodeQuality();
      await this.validateSecurity();
      await this.validatePerformance();
      await this.validateDeployment();
      await this.validateDocumentation();
      
      const report = await this.generateReport();
      console.log('\n🎉 Validation terminée!');
      
      return report;
    } catch (error) {
      console.error('❌ Erreur lors de la validation:', error);
      throw error;
    }
  }
}

// Exécution du script
if (require.main === module) {
  const validator = new ProductionValidator();
  validator.run().catch(console.error);
}

module.exports = ProductionValidator;