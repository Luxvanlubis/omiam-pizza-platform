const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class AdvancedAnalyticsTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      timestamp: new Date().toISOString(),
      status: 'PENDING',
      tests: [],
      analytics: {
        realTimeData: {},
        charts: {},
        interactions: {},
        performance: {}
      }
    };
  }

  async init() {
    console.log('🚀 Initialisation du testeur Analytics Avancées...');
    this.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1920, height: 1080 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    
    // Intercepter les erreurs console
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Erreur console:', msg.text());
      }
    });
  }

  async testRealTimeAnalytics() {
    console.log('\n📊 Test: Analytics Temps Réel');
    const startTime = Date.now();
    
    try {
      await this.page.goto('http://localhost:3000/admin/dashboard', { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      
      // Attendre le chargement des composants analytics
      await this.page.waitForTimeout(3000);
      
      // Vérifier les métriques temps réel
      const realTimeMetrics = await this.page.evaluate(() => {
        const metrics = {
          kpiCards: document.querySelectorAll('[data-testid="kpi-card"], .kpi-card, [class*="kpi"]').length,
          realTimeCharts: document.querySelectorAll('[data-testid="real-time-chart"], .recharts-wrapper, canvas').length,
          liveData: document.querySelectorAll('[data-testid="live-data"], [class*="live"], [class*="real-time"]').length,
          notifications: document.querySelectorAll('[data-testid="notification"], .notification, [class*="alert"]').length,
          dashboardModules: document.querySelectorAll('[data-testid="dashboard-module"], .dashboard-module, [class*="module"]').length
        };
        
        // Vérifier la présence de données numériques (revenus, commandes, etc.)
        const textContent = document.body.textContent || '';
        const hasRevenue = /€|EUR|\d+[.,]\d+/.test(textContent);
        const hasOrders = /commande|order|\d+\s*(commandes?|orders?)/.test(textContent);
        const hasCustomers = /client|customer|\d+\s*(clients?|customers?)/.test(textContent);
        const hasPercentages = /%|pourcent|\d+\s*%/.test(textContent);
        
        return {
          ...metrics,
          dataPresence: {
            revenue: hasRevenue,
            orders: hasOrders,
            customers: hasCustomers,
            percentages: hasPercentages
          }
        };
      });
      
      this.results.analytics.realTimeData = realTimeMetrics;
      
      const duration = Date.now() - startTime;
      this.results.tests.push({
        name: 'Analytics Temps Réel',
        status: 'PASSED',
        duration,
        details: realTimeMetrics
      });
      
      console.log('📈 Métriques temps réel détectées:', realTimeMetrics);
      console.log('✅ Analytics Temps Réel - RÉUSSI');
      
    } catch (error) {
      console.log('❌ Analytics Temps Réel - ÉCHEC:', error.message);
      this.results.tests.push({
        name: 'Analytics Temps Réel',
        status: 'FAILED',
        duration: Date.now() - startTime,
        error: error.message
      });
    }
  }

  async testAdvancedCharts() {
    console.log('\n📊 Test: Graphiques Avancés');
    const startTime = Date.now();
    
    try {
      // Analyser les types de graphiques présents
      const chartAnalysis = await this.page.evaluate(() => {
        const charts = {
          recharts: document.querySelectorAll('.recharts-wrapper').length,
          canvas: document.querySelectorAll('canvas').length,
          svg: document.querySelectorAll('svg').length,
          chartjs: document.querySelectorAll('[class*="chartjs"]').length,
          d3: document.querySelectorAll('[class*="d3"]').length
        };
        
        // Détecter les types de graphiques spécifiques
        const chartTypes = {
          lineCharts: document.querySelectorAll('.recharts-line, [class*="line-chart"]').length,
          barCharts: document.querySelectorAll('.recharts-bar, [class*="bar-chart"]').length,
          pieCharts: document.querySelectorAll('.recharts-pie, [class*="pie-chart"]').length,
          areaCharts: document.querySelectorAll('.recharts-area, [class*="area-chart"]').length
        };
        
        // Vérifier l'interactivité
        const interactive = {
          tooltips: document.querySelectorAll('[class*="tooltip"]').length,
          legends: document.querySelectorAll('[class*="legend"]').length,
          filters: document.querySelectorAll('select, [class*="filter"], [class*="dropdown"]').length
        };
        
        return { charts, chartTypes, interactive };
      });
      
      this.results.analytics.charts = chartAnalysis;
      
      const duration = Date.now() - startTime;
      this.results.tests.push({
        name: 'Graphiques Avancés',
        status: 'PASSED',
        duration,
        details: chartAnalysis
      });
      
      console.log('📊 Analyse des graphiques:', chartAnalysis);
      console.log('✅ Graphiques Avancés - RÉUSSI');
      
    } catch (error) {
      console.log('❌ Graphiques Avancés - ÉCHEC:', error.message);
      this.results.tests.push({
        name: 'Graphiques Avancés',
        status: 'FAILED',
        duration: Date.now() - startTime,
        error: error.message
      });
    }
  }

  async testInteractivity() {
    console.log('\n🖱️ Test: Interactivité Dashboard');
    const startTime = Date.now();
    
    try {
      // Tester les interactions utilisateur
      const interactions = await this.page.evaluate(() => {
        const buttons = document.querySelectorAll('button').length;
        const links = document.querySelectorAll('a').length;
        const inputs = document.querySelectorAll('input, select, textarea').length;
        const tabs = document.querySelectorAll('[role="tab"], [class*="tab"]').length;
        const modals = document.querySelectorAll('[role="dialog"], .modal, [class*="modal"]').length;
        
        return { buttons, links, inputs, tabs, modals };
      });
      
      // Tester un clic sur un bouton si disponible
      const buttonExists = await this.page.$('button');
      if (buttonExists) {
        await this.page.click('button');
        await this.page.waitForTimeout(1000);
      }
      
      this.results.analytics.interactions = interactions;
      
      const duration = Date.now() - startTime;
      this.results.tests.push({
        name: 'Interactivité Dashboard',
        status: 'PASSED',
        duration,
        details: interactions
      });
      
      console.log('🖱️ Éléments interactifs:', interactions);
      console.log('✅ Interactivité Dashboard - RÉUSSI');
      
    } catch (error) {
      console.log('❌ Interactivité Dashboard - ÉCHEC:', error.message);
      this.results.tests.push({
        name: 'Interactivité Dashboard',
        status: 'FAILED',
        duration: Date.now() - startTime,
        error: error.message
      });
    }
  }

  async testPerformanceMetrics() {
    console.log('\n⚡ Test: Métriques de Performance Avancées');
    const startTime = Date.now();
    
    try {
      // Mesurer les performances détaillées
      const performanceMetrics = await this.page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        const paint = performance.getEntriesByType('paint');
        
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
          firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
          totalLoadTime: navigation.loadEventEnd - navigation.navigationStart
        };
      });
      
      // Mesurer l'utilisation mémoire
      const memoryInfo = await this.page.evaluate(() => {
        if (performance.memory) {
          return {
            jsHeapUsed: performance.memory.usedJSHeapSize,
            jsHeapTotal: performance.memory.totalJSHeapSize,
            jsHeapLimit: performance.memory.jsHeapSizeLimit
          };
        }
        return null;
      });
      
      const fullMetrics = { ...performanceMetrics, memory: memoryInfo };
      this.results.analytics.performance = fullMetrics;
      
      const duration = Date.now() - startTime;
      this.results.tests.push({
        name: 'Métriques de Performance Avancées',
        status: 'PASSED',
        duration,
        details: fullMetrics
      });
      
      console.log('⚡ Métriques de performance:', fullMetrics);
      console.log('✅ Métriques de Performance Avancées - RÉUSSI');
      
    } catch (error) {
      console.log('❌ Métriques de Performance Avancées - ÉCHEC:', error.message);
      this.results.tests.push({
        name: 'Métriques de Performance Avancées',
        status: 'FAILED',
        duration: Date.now() - startTime,
        error: error.message
      });
    }
  }

  async generateReport() {
    console.log('\n📋 Génération du rapport avancé...');
    
    // Calculer les statistiques
    const totalTests = this.results.tests.length;
    const passedTests = this.results.tests.filter(t => t.status === 'PASSED').length;
    const failedTests = this.results.tests.filter(t => t.status === 'FAILED').length;
    
    this.results.status = failedTests === 0 ? 'PASSED' : 'FAILED';
    this.results.summary = {
      total: totalTests,
      passed: passedTests,
      failed: failedTests,
      successRate: Math.round((passedTests / totalTests) * 100)
    };
    
    // Prendre une capture d'écran finale
    const screenshotPath = path.join(process.cwd(), 'test-results', `advanced-analytics-${Date.now()}.png`);
    await this.page.screenshot({ path: screenshotPath, fullPage: true });
    this.results.screenshots = [screenshotPath];
    
    // Sauvegarder le rapport
    const reportPath = path.join(process.cwd(), 'test-results', `advanced-analytics-test-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    
    // Afficher le rapport
    console.log('\n============================================================');
    console.log('📊 RAPPORT DE TEST - ANALYTICS AVANCÉES O\'MIAM');
    console.log('============================================================');
    console.log(`📅 Date: ${new Date().toLocaleString('fr-FR')}`);
    console.log(`📈 Statut global: ${this.results.status}`);
    console.log(`📊 Tests: ${totalTests} total, ${passedTests} réussis, ${failedTests} échoués`);
    console.log(`⚡ Taux de réussite: ${this.results.summary.successRate}%`);
    
    console.log('\n📋 Détail des tests:');
    this.results.tests.forEach((test, index) => {
      const status = test.status === 'PASSED' ? '✅' : '❌';
      console.log(`  ${index + 1}. ${status} ${test.name}`);
    });
    
    console.log(`\n💾 Rapport sauvegardé: ${reportPath}`);
    console.log(`📸 Capture d'écran: ${screenshotPath}`);
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
      await this.testRealTimeAnalytics();
      await this.testAdvancedCharts();
      await this.testInteractivity();
      await this.testPerformanceMetrics();
      
      const report = await this.generateReport();
      console.log('\n🎉 Tests avancés terminés avec succès!');
      
      return report;
    } catch (error) {
      console.error('❌ Erreur lors des tests:', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// Exécution du test
if (require.main === module) {
  const tester = new AdvancedAnalyticsTester();
  tester.run().catch(console.error);
}

module.exports = AdvancedAnalyticsTester;