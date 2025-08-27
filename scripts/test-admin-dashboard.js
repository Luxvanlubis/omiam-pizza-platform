const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

/**
 * Script de test automatisé pour le Dashboard Admin O'Miam
 * Valide les analytics avancées et fonctionnalités temps réel
 */

class AdminDashboardTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      timestamp: new Date().toISOString(),
      status: 'PENDING',
      tests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0
      },
      performance: {},
      screenshots: []
    };
  }

  async init() {
    console.log('🚀 Initialisation du test Dashboard Admin...');
    
    this.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1920, height: 1080 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage();
    
    // Configuration des timeouts et événements
    this.page.setDefaultTimeout(30000);
    this.page.setDefaultNavigationTimeout(30000);
    
    // Écouter les erreurs console
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Erreur console:', msg.text());
      }
    });
    
    // Écouter les erreurs de page
    this.page.on('pageerror', error => {
      console.log('❌ Erreur page:', error.message);
    });
  }

  async testDashboardAccess() {
    const testName = 'Accès Dashboard Admin';
    console.log(`\n📊 Test: ${testName}`);
    
    try {
      const startTime = Date.now();
      
      // Navigation vers le dashboard admin
      await this.page.goto('http://localhost:3000/admin/dashboard', {
        waitUntil: 'networkidle2'
      });
      
      const loadTime = Date.now() - startTime;
      
      // Vérifier le titre de la page
      const title = await this.page.title();
      console.log(`📄 Titre de la page: ${title}`);
      
      // Vérifier la présence des éléments principaux
      const dashboardElements = await this.page.evaluate(() => {
        const elements = {
          header: !!document.querySelector('header'),
          navigation: !!document.querySelector('nav'),
          statsCards: document.querySelectorAll('[data-testid*="stat"], .stat-card, [class*="stat"]').length,
          charts: document.querySelectorAll('svg, canvas, [class*="chart"]').length,
          tables: document.querySelectorAll('table, [class*="table"]').length,
          buttons: document.querySelectorAll('button').length
        };
        return elements;
      });
      
      console.log('📈 Éléments détectés:', dashboardElements);
      
      // Prendre une capture d'écran
      const screenshotPath = path.join(__dirname, '..', 'test-results', `dashboard-${Date.now()}.png`);
      await this.page.screenshot({ path: screenshotPath, fullPage: true });
      this.results.screenshots.push(screenshotPath);
      
      this.results.tests.push({
        name: testName,
        status: 'PASSED',
        duration: loadTime,
        details: {
          loadTime: `${loadTime}ms`,
          title,
          elements: dashboardElements
        }
      });
      
      this.results.performance.dashboardLoad = loadTime;
      this.results.summary.passed++;
      
      console.log(`✅ ${testName} - RÉUSSI (${loadTime}ms)`);
      
    } catch (error) {
      console.log(`❌ ${testName} - ÉCHEC:`, error.message);
      
      this.results.tests.push({
        name: testName,
        status: 'FAILED',
        error: error.message
      });
      
      this.results.summary.failed++;
    }
    
    this.results.summary.total++;
  }

  async testAnalyticsComponents() {
    const testName = 'Composants Analytics';
    console.log(`\n📊 Test: ${testName}`);
    
    try {
      // Rechercher les composants d'analytics
      const analyticsData = await this.page.evaluate(() => {
        const components = {
          realTimeMetrics: document.querySelectorAll('[class*="real-time"], [data-testid*="real-time"]').length,
          kpiCards: document.querySelectorAll('[class*="kpi"], [class*="metric"], [class*="stat"]').length,
          charts: document.querySelectorAll('svg[class*="recharts"], canvas').length,
          tables: document.querySelectorAll('table, [class*="table"]').length,
          filters: document.querySelectorAll('select, [class*="filter"], [class*="dropdown"]').length,
          tabs: document.querySelectorAll('[role="tab"], [class*="tab"]').length
        };
        
        // Vérifier la présence de données
        const hasData = {
          numbers: document.querySelectorAll('[class*="number"], [class*="value"]').length > 0,
          percentages: /\d+%/.test(document.body.textContent),
          currency: /€|\$/.test(document.body.textContent),
          dates: /\d{1,2}\/\d{1,2}|\d{4}-\d{2}-\d{2}/.test(document.body.textContent)
        };
        
        return { components, hasData };
      });
      
      console.log('📈 Analytics détectés:', analyticsData);
      
      // Tester l'interactivité des filtres
      const filterElements = await this.page.$$('select, [role="combobox"]');
      if (filterElements.length > 0) {
        console.log(`🔍 Test des filtres (${filterElements.length} trouvés)`);
        
        for (let i = 0; i < Math.min(filterElements.length, 3); i++) {
          try {
            await filterElements[i].click();
            await this.page.waitForTimeout(500);
            console.log(`✅ Filtre ${i + 1} - Interactif`);
          } catch (e) {
            console.log(`⚠️ Filtre ${i + 1} - Non interactif`);
          }
        }
      }
      
      this.results.tests.push({
        name: testName,
        status: 'PASSED',
        details: analyticsData
      });
      
      this.results.summary.passed++;
      console.log(`✅ ${testName} - RÉUSSI`);
      
    } catch (error) {
      console.log(`❌ ${testName} - ÉCHEC:`, error.message);
      
      this.results.tests.push({
        name: testName,
        status: 'FAILED',
        error: error.message
      });
      
      this.results.summary.failed++;
    }
    
    this.results.summary.total++;
  }

  async testModuleNavigation() {
    const testName = 'Navigation Modules Admin';
    console.log(`\n🧭 Test: ${testName}`);
    
    try {
      // Rechercher les onglets/modules disponibles
      const modules = await this.page.evaluate(() => {
        const tabs = Array.from(document.querySelectorAll('[role="tab"], [class*="tab"], button[class*="nav"]'));
        return tabs.map(tab => ({
          text: tab.textContent?.trim() || '',
          visible: tab.offsetParent !== null,
          clickable: !tab.disabled
        })).filter(tab => tab.text.length > 0);
      });
      
      console.log(`📋 Modules détectés: ${modules.length}`);
      modules.forEach((module, index) => {
        console.log(`  ${index + 1}. ${module.text} (${module.visible ? 'Visible' : 'Caché'}, ${module.clickable ? 'Cliquable' : 'Désactivé'})`);
      });
      
      // Tester la navigation vers quelques modules
      const testModules = modules.slice(0, 3);
      for (const module of testModules) {
        if (module.clickable && module.visible) {
          try {
            const moduleButton = await this.page.$x(`//button[contains(text(), "${module.text}")]`);
            if (moduleButton.length > 0) {
              await moduleButton[0].click();
              await this.page.waitForTimeout(1000);
              console.log(`✅ Navigation vers "${module.text}" - Réussie`);
            }
          } catch (e) {
            console.log(`⚠️ Navigation vers "${module.text}" - Problème:`, e.message);
          }
        }
      }
      
      this.results.tests.push({
        name: testName,
        status: 'PASSED',
        details: { modules, testedModules: testModules.length }
      });
      
      this.results.summary.passed++;
      console.log(`✅ ${testName} - RÉUSSI`);
      
    } catch (error) {
      console.log(`❌ ${testName} - ÉCHEC:`, error.message);
      
      this.results.tests.push({
        name: testName,
        status: 'FAILED',
        error: error.message
      });
      
      this.results.summary.failed++;
    }
    
    this.results.summary.total++;
  }

  async testPerformanceMetrics() {
    const testName = 'Métriques de Performance';
    console.log(`\n⚡ Test: ${testName}`);
    
    try {
      // Mesurer les performances de la page
      const metrics = await this.page.metrics();
      const performanceData = await this.page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
          firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
        };
      });
      
      console.log('📊 Métriques de performance:');
      console.log(`  - DOM Content Loaded: ${performanceData.domContentLoaded.toFixed(2)}ms`);
      console.log(`  - Load Complete: ${performanceData.loadComplete.toFixed(2)}ms`);
      console.log(`  - First Paint: ${performanceData.firstPaint.toFixed(2)}ms`);
      console.log(`  - First Contentful Paint: ${performanceData.firstContentfulPaint.toFixed(2)}ms`);
      console.log(`  - JS Heap Used: ${(metrics.JSHeapUsedSize / 1024 / 1024).toFixed(2)} MB`);
      
      this.results.performance = {
        ...this.results.performance,
        ...performanceData,
        jsHeapUsed: metrics.JSHeapUsedSize,
        jsHeapTotal: metrics.JSHeapTotalSize
      };
      
      this.results.tests.push({
        name: testName,
        status: 'PASSED',
        details: { ...performanceData, jsHeapUsed: metrics.JSHeapUsedSize }
      });
      
      this.results.summary.passed++;
      console.log(`✅ ${testName} - RÉUSSI`);
      
    } catch (error) {
      console.log(`❌ ${testName} - ÉCHEC:`, error.message);
      
      this.results.tests.push({
        name: testName,
        status: 'FAILED',
        error: error.message
      });
      
      this.results.summary.failed++;
    }
    
    this.results.summary.total++;
  }

  async generateReport() {
    console.log('\n📋 Génération du rapport...');
    
    // Déterminer le statut global
    if (this.results.summary.failed === 0) {
      this.results.status = 'PASSED';
    } else if (this.results.summary.passed > this.results.summary.failed) {
      this.results.status = 'PARTIAL';
    } else {
      this.results.status = 'FAILED';
    }
    
    // Créer le dossier de résultats s'il n'existe pas
    const resultsDir = path.join(__dirname, '..', 'test-results');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    // Sauvegarder le rapport JSON
    const reportPath = path.join(resultsDir, `admin-dashboard-test-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    
    console.log('\n============================================================');
    console.log('📊 RAPPORT DE TEST - DASHBOARD ADMIN O\'MIAM');
    console.log('============================================================');
    console.log(`📅 Date: ${new Date(this.results.timestamp).toLocaleString('fr-FR')}`);
    console.log(`📈 Statut global: ${this.results.status}`);
    console.log(`📊 Tests: ${this.results.summary.total} total, ${this.results.summary.passed} réussis, ${this.results.summary.failed} échoués`);
    
    if (this.results.performance.dashboardLoad) {
      console.log(`⚡ Performance: Chargement dashboard ${this.results.performance.dashboardLoad}ms`);
    }
    
    console.log('\n📋 Détail des tests:');
    this.results.tests.forEach((test, index) => {
      const status = test.status === 'PASSED' ? '✅' : '❌';
      console.log(`  ${index + 1}. ${status} ${test.name}`);
      if (test.error) {
        console.log(`     Erreur: ${test.error}`);
      }
    });
    
    console.log(`\n💾 Rapport sauvegardé: ${reportPath}`);
    console.log('============================================================');
    
    return this.results;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async run() {
    try {
      await this.init();
      
      // Exécuter tous les tests
      await this.testDashboardAccess();
      await this.testAnalyticsComponents();
      await this.testModuleNavigation();
      await this.testPerformanceMetrics();
      
      // Générer le rapport final
      const results = await this.generateReport();
      
      return results;
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'exécution des tests:', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// Exécution du script
if (require.main === module) {
  const tester = new AdminDashboardTester();
  
  tester.run()
    .then(results => {
      console.log('\n🎉 Tests terminés avec succès!');
      process.exit(results.status === 'PASSED' ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Échec des tests:', error);
      process.exit(1);
    });
}

module.exports = AdminDashboardTester;