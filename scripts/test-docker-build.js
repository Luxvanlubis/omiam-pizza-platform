const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class DockerBuildTester {
  constructor() {
    this.projectRoot = process.cwd();
    this.results = {
      timestamp: new Date().toISOString(),
      status: 'PENDING',
      tests: [],
      buildMetrics: {},
      imageInfo: {},
      healthCheck: {}
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString('fr-FR');
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '📋';
    console.log(`${icon} [${timestamp}] ${message}`);
  }

  async checkDockerInstallation() {
    this.log('Vérification de l\'installation Docker...');
    
    try {
      const dockerVersion = execSync('docker --version', { encoding: 'utf8' }).trim();
      const composeVersion = execSync('docker-compose --version', { encoding: 'utf8' }).trim();
      
      this.log(`Docker détecté: ${dockerVersion}`, 'success');
      this.log(`Docker Compose détecté: ${composeVersion}`, 'success');
      
      this.results.tests.push({
        name: 'Installation Docker',
        status: 'SUCCESS',
        details: { docker: dockerVersion, compose: composeVersion }
      });
      
      return true;
    } catch (error) {
      this.log(`Docker non disponible: ${error.message}`, 'error');
      this.results.tests.push({
        name: 'Installation Docker',
        status: 'FAILED',
        error: error.message
      });
      return false;
    }
  }

  async validateDockerfiles() {
    this.log('Validation des fichiers Docker...');
    
    const requiredFiles = [
      'Dockerfile',
      'docker-compose.yml',
      '.env.production',
      'nginx.conf'
    ];
    
    const missingFiles = [];
    const validFiles = [];
    
    for (const file of requiredFiles) {
      const filePath = path.join(this.projectRoot, file);
      if (fs.existsSync(filePath)) {
        validFiles.push(file);
        this.log(`✓ ${file} trouvé`, 'success');
      } else {
        missingFiles.push(file);
        this.log(`✗ ${file} manquant`, 'error');
      }
    }
    
    this.results.tests.push({
      name: 'Validation Fichiers Docker',
      status: missingFiles.length === 0 ? 'SUCCESS' : 'FAILED',
      details: { valid: validFiles, missing: missingFiles }
    });
    
    return missingFiles.length === 0;
  }

  async testDockerBuild() {
    this.log('Test du build Docker...');
    
    try {
      const buildStart = Date.now();
      
      // Build de l'image Docker
      this.log('Démarrage du build Docker (cela peut prendre plusieurs minutes)...');
      
      const buildOutput = execSync('docker build -t omiam-test .', { 
        encoding: 'utf8',
        maxBuffer: 1024 * 1024 * 10 // 10MB buffer
      });
      
      const buildTime = Date.now() - buildStart;
      
      this.log(`Build Docker terminé en ${Math.round(buildTime / 1000)}s`, 'success');
      
      // Obtenir les informations de l'image
      const imageInfo = execSync('docker images omiam-test --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"', { encoding: 'utf8' });
      
      this.results.buildMetrics = {
        buildTime: buildTime,
        buildTimeSeconds: Math.round(buildTime / 1000)
      };
      
      this.results.imageInfo = {
        info: imageInfo.trim(),
        buildOutput: buildOutput.split('\n').slice(-10).join('\n') // Dernières 10 lignes
      };
      
      this.results.tests.push({
        name: 'Build Docker',
        status: 'SUCCESS',
        details: {
          buildTime: `${Math.round(buildTime / 1000)}s`,
          imageCreated: true
        }
      });
      
      return true;
    } catch (error) {
      this.log(`Erreur lors du build Docker: ${error.message}`, 'error');
      this.results.tests.push({
        name: 'Build Docker',
        status: 'FAILED',
        error: error.message
      });
      return false;
    }
  }

  async testContainerStart() {
    this.log('Test de démarrage du conteneur...');
    
    try {
      // Démarrer le conteneur en arrière-plan
      this.log('Démarrage du conteneur de test...');
      
      execSync('docker run -d --name omiam-test-container -p 3001:3000 omiam-test', { encoding: 'utf8' });
      
      // Attendre que le conteneur démarre
      await this.sleep(10000); // 10 secondes
      
      // Vérifier le statut du conteneur
      const containerStatus = execSync('docker ps --filter "name=omiam-test-container" --format "{{.Status}}"', { encoding: 'utf8' }).trim();
      
      if (containerStatus.includes('Up')) {
        this.log('Conteneur démarré avec succès', 'success');
        
        this.results.tests.push({
          name: 'Démarrage Conteneur',
          status: 'SUCCESS',
          details: { containerStatus }
        });
        
        return true;
      } else {
        throw new Error(`Conteneur non démarré: ${containerStatus}`);
      }
    } catch (error) {
      this.log(`Erreur lors du démarrage: ${error.message}`, 'error');
      this.results.tests.push({
        name: 'Démarrage Conteneur',
        status: 'FAILED',
        error: error.message
      });
      return false;
    }
  }

  async testHealthCheck() {
    this.log('Test du health check...');
    
    try {
      // Attendre un peu plus pour que l'application soit prête
      await this.sleep(15000); // 15 secondes supplémentaires
      
      // Test du health check
      const healthResponse = execSync('curl -f http://localhost:3001/api/health', { encoding: 'utf8' });
      
      const healthData = JSON.parse(healthResponse);
      
      if (healthData.status === 'healthy') {
        this.log('Health check réussi', 'success');
        
        this.results.healthCheck = healthData;
        this.results.tests.push({
          name: 'Health Check',
          status: 'SUCCESS',
          details: healthData
        });
        
        return true;
      } else {
        throw new Error(`Health check échoué: ${healthData.status}`);
      }
    } catch (error) {
      this.log(`Erreur health check: ${error.message}`, 'error');
      
      // Essayer de récupérer les logs du conteneur pour diagnostic
      try {
        const containerLogs = execSync('docker logs omiam-test-container --tail 20', { encoding: 'utf8' });
        this.log('Logs du conteneur:', 'warning');
        console.log(containerLogs);
      } catch (logError) {
        this.log('Impossible de récupérer les logs du conteneur', 'warning');
      }
      
      this.results.tests.push({
        name: 'Health Check',
        status: 'FAILED',
        error: error.message
      });
      return false;
    }
  }

  async testApplicationResponse() {
    this.log('Test de réponse de l\'application...');
    
    try {
      // Test de la page d'accueil
      const homeResponse = execSync('curl -I http://localhost:3001/', { encoding: 'utf8' });
      
      if (homeResponse.includes('200 OK') || homeResponse.includes('HTTP/1.1 200')) {
        this.log('Application répond correctement', 'success');
        
        this.results.tests.push({
          name: 'Réponse Application',
          status: 'SUCCESS',
          details: { httpStatus: '200 OK' }
        });
        
        return true;
      } else {
        throw new Error(`Réponse HTTP inattendue: ${homeResponse}`);
      }
    } catch (error) {
      this.log(`Erreur de réponse application: ${error.message}`, 'error');
      this.results.tests.push({
        name: 'Réponse Application',
        status: 'FAILED',
        error: error.message
      });
      return false;
    }
  }

  async cleanup() {
    this.log('Nettoyage des ressources de test...');
    
    try {
      // Arrêter et supprimer le conteneur
      try {
        execSync('docker stop omiam-test-container', { encoding: 'utf8' });
        execSync('docker rm omiam-test-container', { encoding: 'utf8' });
        this.log('Conteneur de test supprimé', 'success');
      } catch (error) {
        this.log('Conteneur déjà supprimé ou inexistant', 'warning');
      }
      
      // Supprimer l'image de test
      try {
        execSync('docker rmi omiam-test', { encoding: 'utf8' });
        this.log('Image de test supprimée', 'success');
      } catch (error) {
        this.log('Image déjà supprimée ou inexistante', 'warning');
      }
      
    } catch (error) {
      this.log(`Erreur lors du nettoyage: ${error.message}`, 'warning');
    }
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async generateReport() {
    this.log('Génération du rapport de test Docker...');
    
    const totalTests = this.results.tests.length;
    const successTests = this.results.tests.filter(t => t.status === 'SUCCESS').length;
    const failedTests = this.results.tests.filter(t => t.status === 'FAILED').length;
    
    this.results.status = failedTests === 0 ? 'SUCCESS' : 'FAILED';
    this.results.summary = {
      total: totalTests,
      success: successTests,
      failed: failedTests,
      successRate: totalTests > 0 ? Math.round((successTests / totalTests) * 100) : 0
    };
    
    // Sauvegarder le rapport
    const reportPath = path.join(this.projectRoot, `docker-build-test-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    
    // Afficher le rapport
    console.log('\n============================================================');
    console.log('🐳 RAPPORT DE TEST DOCKER BUILD - O\'MIAM');
    console.log('============================================================');
    console.log(`📅 Date: ${new Date().toLocaleString('fr-FR')}`);
    console.log(`📈 Statut global: ${this.results.status}`);
    console.log(`📊 Tests: ${totalTests} total, ${successTests} réussies, ${failedTests} échouées`);
    console.log(`⚡ Taux de réussite: ${this.results.summary.successRate}%`);
    
    if (this.results.buildMetrics.buildTime) {
      console.log(`⏱️ Temps de build: ${this.results.buildMetrics.buildTimeSeconds}s`);
    }
    
    console.log('\n📋 Détail des tests:');
    this.results.tests.forEach((test, index) => {
      const status = test.status === 'SUCCESS' ? '✅' : '❌';
      console.log(`  ${index + 1}. ${status} ${test.name}`);
      if (test.details) {
        console.log(`     📝 ${JSON.stringify(test.details, null, 2).replace(/\n/g, '\n     ')}`);
      }
      if (test.error) {
        console.log(`     ❌ ${test.error}`);
      }
    });
    
    if (this.results.healthCheck.status) {
      console.log('\n🏥 Health Check:');
      console.log(`  Status: ${this.results.healthCheck.status}`);
      console.log(`  Uptime: ${this.results.healthCheck.uptime}s`);
      console.log(`  Environment: ${this.results.healthCheck.environment}`);
    }
    
    console.log('\n🎯 Recommandations:');
    if (this.results.status === 'SUCCESS') {
      console.log('  ✅ L\'application est prête pour le déploiement production!');
      console.log('  📋 Suivez le guide DEPLOYMENT_PRODUCTION.md');
      console.log('  🔧 Configurez les vraies clés dans .env.production');
    } else {
      console.log('  ❌ Des problèmes ont été détectés');
      console.log('  🔍 Vérifiez les erreurs ci-dessus');
      console.log('  🛠️ Corrigez les problèmes avant le déploiement');
    }
    
    console.log(`\n💾 Rapport sauvegardé: ${reportPath}`);
    console.log('============================================================');
    
    return this.results;
  }

  async run() {
    try {
      console.log('🐳 Démarrage des tests Docker Build O\'MIAM...');
      console.log('============================================================\n');
      
      // Vérifications préliminaires
      const dockerOk = await this.checkDockerInstallation();
      if (!dockerOk) {
        this.log('Docker non disponible, arrêt des tests', 'error');
        return await this.generateReport();
      }
      
      const filesOk = await this.validateDockerfiles();
      if (!filesOk) {
        this.log('Fichiers Docker manquants, arrêt des tests', 'error');
        return await this.generateReport();
      }
      
      // Tests de build et déploiement
      const buildOk = await this.testDockerBuild();
      if (!buildOk) {
        this.log('Build Docker échoué, arrêt des tests', 'error');
        return await this.generateReport();
      }
      
      const startOk = await this.testContainerStart();
      if (startOk) {
        await this.testHealthCheck();
        await this.testApplicationResponse();
      }
      
      // Nettoyage
      await this.cleanup();
      
      const report = await this.generateReport();
      console.log('\n🎉 Tests Docker terminés!');
      
      return report;
    } catch (error) {
      console.error('❌ Erreur lors des tests Docker:', error);
      await this.cleanup();
      throw error;
    }
  }
}

// Exécution du script
if (require.main === module) {
  const tester = new DockerBuildTester();
  tester.run().catch(console.error);
}

module.exports = DockerBuildTester;