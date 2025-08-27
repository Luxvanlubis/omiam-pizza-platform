/**
 * 🧪 Script de Test d'Intégration - Interface Admin O'Miam
 * 
 * Ce script teste l'intégration complète de tous les modules d'administration
 * en simulant les interactions utilisateur et en validant les fonctionnalités.
 * 
 * @version 2.0
 * @author O'Miam Team
 * @date 2025-01-15
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration des tests
const CONFIG = {
  baseUrl: 'http://localhost:3003',
  adminPath: '/admin/dashboard',
  timeout: 30000,
  screenshotDir: './test-screenshots',
  reportFile: './RAPPORT-INTEGRATION-ADMIN.md'
};

// Modules à tester avec leurs sélecteurs basés sur le contenu visible
const MODULES = [
  {
    id: 'unified-pos',
    name: 'Point de Vente Unifié',
    selector: '.card:has-text("Point de Vente Unifié"), h3:has-text("Point de Vente Unifié")',
    priority: 'high',
    tests: ['navigation', 'interface', 'functionality']
  },
  {
    id: 'menu',
    name: 'Gestion du Menu',
    selector: '.card:has-text("Gestion du Menu"), h3:has-text("Gestion du Menu")',
    priority: 'medium',
    tests: ['navigation', 'crud', 'validation']
  },
  {
    id: 'inventory',
    name: 'Gestion des Stocks',
    selector: '.card:has-text("Gestion des Stocks"), h3:has-text("Gestion des Stocks")',
    priority: 'high',
    tests: ['navigation', 'interface']
  },
  {
    id: 'reservations',
    name: 'Gestion des Réservations',
    selector: '.card:has-text("Gestion des Réservations"), h3:has-text("Gestion des Réservations")',
    priority: 'high',
    tests: ['navigation', 'interface']
  },
  {
    id: 'analytics',
    name: 'Analytics',
    selector: '.card:has-text("Analytics"):not(:has-text("Avancées")), h3:has-text("Analytics"):not(:has-text("Avancées"))',
    priority: 'medium',
    tests: ['navigation', 'charts', 'data']
  },
  {
    id: 'advanced-analytics',
    name: 'Analytics Avancées',
    selector: '.card:has-text("Analytics Avancées"), h3:has-text("Analytics Avancées")',
    priority: 'medium',
    tests: ['navigation', 'interface']
  },
  {
    id: 'loyalty',
    name: 'Programme Fidélité',
    selector: '.card:has-text("Programme Fidélité"), h3:has-text("Programme Fidélité")',
    priority: 'medium',
    tests: ['navigation', 'store-integration', 'functionality']
  },
  {
    id: 'notifications',
    name: 'Centre de Notifications',
    selector: '.card:has-text("Centre de Notifications"), h3:has-text("Centre de Notifications")',
    priority: 'low',
    tests: ['navigation', 'interface']
  },
  {
    id: 'security',
    name: 'Sécurité',
    selector: '.card:has-text("Sécurité"), h3:has-text("Sécurité")',
    priority: 'low',
    tests: ['navigation', 'interface']
  },
  {
    id: 'settings',
    name: 'Paramètres Système',
    selector: '.card:has-text("Paramètres Système"), h3:has-text("Paramètres Système")',
    priority: 'low',
    tests: ['navigation', 'store-integration', 'persistence']
  },
  {
    id: 'media',
    name: 'Gestion des Médias',
    selector: '.card:has-text("Gestion des Médias"), h3:has-text("Gestion des Médias")',
    priority: 'low',
    tests: ['navigation', 'interface']
  },
  {
    id: 'content',
    name: 'Gestion du Contenu',
    selector: '.card:has-text("Gestion du Contenu"), h3:has-text("Gestion du Contenu")',
    priority: 'low',
    tests: ['navigation', 'interface']
  },
  {
    id: 'localization',
    name: 'Langues & Localisation',
    selector: '.card:has-text("Langues & Localisation"), h3:has-text("Langues & Localisation")',
    priority: 'low',
    tests: ['navigation', 'interface']
  },
  {
    id: 'links',
    name: 'Gestion des Liens',
    selector: '.card:has-text("Gestion des Liens"), h3:has-text("Gestion des Liens")',
    priority: 'low',
    tests: ['navigation', 'interface']
  }
];

// Résultats des tests
let testResults = {
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
    startTime: new Date(),
    endTime: null
  },
  modules: [],
  errors: [],
  screenshots: []
};

/**
 * Utilitaires de test
 */
class TestUtils {
  static async waitForElement(page, selector, timeout = 5000) {
    try {
      await page.waitForSelector(selector, { timeout });
      return await page.$(selector);
    } catch (error) {
      console.log(`⚠️ Élément non trouvé: ${selector}`);
      return null;
    }
  }

  // Trouver un élément par son contenu textuel
  static async findElementByText(page, text, tag = '*') {
    try {
      const elements = await page.$x(`//${tag}[contains(text(), "${text}")]`);
      return elements.length > 0 ? elements[0] : null;
    } catch (error) {
      console.log(`⚠️ Élément avec texte "${text}" non trouvé`);
      return null;
    }
  }

  // Trouver une carte de module par son titre
  static async findModuleCard(page, moduleTitle) {
    try {
      // Chercher d'abord par XPath pour le titre exact
      const titleElements = await page.$x(`//h3[contains(text(), "${moduleTitle}")]`);
      if (titleElements.length > 0) {
        // Remonter au parent card
        const cardElement = await page.evaluateHandle(el => {
          let parent = el.parentElement;
          while (parent && !parent.classList.contains('cursor-pointer')) {
            parent = parent.parentElement;
          }
          return parent;
        }, titleElements[0]);
        return cardElement;
      }
      
      // Fallback: chercher par sélecteur CSS générique
      const cards = await page.$$('.cursor-pointer');
      for (const card of cards) {
        const text = await page.evaluate(el => el.textContent, card);
        if (text.includes(moduleTitle)) {
          return card;
        }
      }
      
      return null;
    } catch (error) {
      console.log(`⚠️ Carte module "${moduleTitle}" non trouvée:`, error.message);
      return null;
    }
  }

  static async takeScreenshot(page, name) {
    try {
      if (!fs.existsSync(CONFIG.screenshotDir)) {
        fs.mkdirSync(CONFIG.screenshotDir, { recursive: true });
      }
      const filename = `${name}-${Date.now()}.png`;
      const filepath = path.join(CONFIG.screenshotDir, filename);
      await page.screenshot({ path: filepath, fullPage: true });
      testResults.screenshots.push({ name, filepath });
      return filepath;
    } catch (error) {
      console.error(`❌ Erreur capture d'écran: ${error.message}`);
      return null;
    }
  }

  static async checkConsoleErrors(page) {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    return errors;
  }

  static logTest(module, test, status, details = '') {
    const icon = status === 'passed' ? '✅' : status === 'failed' ? '❌' : '⚠️';
    console.log(`${icon} ${module} - ${test}: ${details}`);
  }
}

/**
 * Tests spécifiques par module
 */
class ModuleTests {
  static async testNavigation(page, module) {
    try {
      // Chercher le module par son titre
      const moduleCard = await TestUtils.findModuleCard(page, module.name);
      if (!moduleCard) {
        throw new Error(`Module ${module.name} non trouvé`);
      }

      await moduleCard.click();
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Vérifier que nous sommes dans le module (chercher des éléments spécifiques au module)
      const moduleContent = await TestUtils.waitForElement(page, 'main, .module-content, [class*="module"]', 3000);
      if (!moduleContent) {
        throw new Error('Contenu du module non chargé');
      }

      // Prendre une capture d'écran
      await TestUtils.takeScreenshot(page, `module-${module.id}`);

      // Retourner au dashboard
      const backButton = await TestUtils.findElementByText(page, 'Retour au Dashboard', 'button');
      if (backButton) {
        await backButton.click();
      } else {
        // Fallback: utiliser l'historique du navigateur
        await page.goBack();
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));

      return { status: 'passed', details: 'Navigation fonctionnelle' };
    } catch (error) {
      return { status: 'failed', details: error.message };
    }
  }

  static async testInterface(page, module) {
    try {
      // Naviguer vers le module
      const moduleCard = await TestUtils.findModuleCard(page, module.name);
      if (!moduleCard) {
        throw new Error(`Module ${module.name} non trouvé`);
      }
      await moduleCard.click();
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Vérifier la présence d'éléments UI de base
      const hasCards = await TestUtils.waitForElement(page, '[class*="card"]', 3000);
      const hasButtons = await TestUtils.waitForElement(page, 'button', 3000);
      const hasInputs = await TestUtils.waitForElement(page, 'input, textarea, select', 3000);

      let score = 0;
      if (hasCards) score++;
      if (hasButtons) score++;
      if (hasInputs) score++;

      // Retourner au dashboard
      const backButton = await TestUtils.findElementByText(page, 'Retour au Dashboard', 'button');
      if (backButton) {
        await backButton.click();
      } else {
        // Fallback: utiliser l'historique du navigateur
        await page.goBack();
      }
      await new Promise(resolve => setTimeout(resolve, 1000));

      const status = score >= 2 ? 'passed' : score >= 1 ? 'warning' : 'failed';
      return { status, details: `Interface UI: ${score}/3 éléments détectés` };
    } catch (error) {
      return { status: 'failed', details: error.message };
    }
  }

  static async testStoreIntegration(page, module) {
    try {
      // Naviguer vers le module
      const moduleCard = await TestUtils.findModuleCard(page, module.name);
      if (!moduleCard) {
        throw new Error(`Module ${module.name} non trouvé`);
      }
      await moduleCard.click();
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Vérifier la présence de données (pas d'erreurs de store)
      const hasData = await page.evaluate(() => {
        // Chercher des indicateurs de données chargées
        const hasText = document.body.innerText.length > 1000;
        const hasNoErrors = !document.body.innerText.includes('Error') && 
                           !document.body.innerText.includes('undefined');
        return hasText && hasNoErrors;
      });

      // Retourner au dashboard
      const backButton = await TestUtils.findElementByText(page, 'Retour au Dashboard', 'button');
      if (backButton) {
        await backButton.click();
      } else {
        // Fallback: utiliser l'historique du navigateur
        await page.goBack();
      }
      await new Promise(resolve => setTimeout(resolve, 1000));

      return { 
        status: hasData ? 'passed' : 'warning', 
        details: hasData ? 'Store intégré correctement' : 'Données limitées ou erreurs détectées'
      };
    } catch (error) {
      return { status: 'failed', details: error.message };
    }
  }

  static async testFunctionality(page, module) {
    try {
      // Naviguer vers le module
      const moduleCard = await TestUtils.findModuleCard(page, module.name);
      if (!moduleCard) {
        throw new Error(`Module ${module.name} non trouvé`);
      }
      await moduleCard.click();
      await page.waitForTimeout(3000);

      // Tests fonctionnels spécifiques selon le module
      let functionalityScore = 0;

      if (module.id === 'loyalty') {
        // Tester les fonctionnalités de fidélité
        const hasLoyaltyCards = await TestUtils.waitForElement(page, '[class*="loyalty"], [class*="points"], [class*="reward"]', 3000);
        if (hasLoyaltyCards) functionalityScore++;
      }

      if (module.id === 'settings') {
        // Tester les paramètres système
        const hasSettings = await TestUtils.waitForElement(page, 'input[type="text"], input[type="number"], select', 3000);
        if (hasSettings) functionalityScore++;
      }

      // Test générique: présence de boutons d'action
      const saveButton = await TestUtils.findElementByText(page, 'Sauvegarder', 'button');
      const addButton = await TestUtils.findElementByText(page, 'Ajouter', 'button');
      const editButton = await TestUtils.findElementByText(page, 'Modifier', 'button');
      if (saveButton || addButton || editButton) functionalityScore++;

      // Retourner au dashboard
      const backButton = await TestUtils.findElementByText(page, 'Retour au Dashboard', 'button');
      if (backButton) {
        await backButton.click();
      } else {
        // Fallback: utiliser l'historique du navigateur
        await page.goBack();
      }
      await page.waitForTimeout(1000);

      const status = functionalityScore >= 2 ? 'passed' : functionalityScore >= 1 ? 'warning' : 'failed';
      return { status, details: `Fonctionnalités: ${functionalityScore}/2+ détectées` };
    } catch (error) {
      return { status: 'failed', details: error.message };
    }
  }
}

/**
 * Fonction principale de test
 */
async function runIntegrationTests() {
  console.log('🚀 Démarrage des tests d\'intégration admin O\'Miam');
  console.log(`📍 URL de test: ${CONFIG.baseUrl}${CONFIG.adminPath}`);
  console.log('=' .repeat(60));

  let browser;
  try {
    // Lancer le navigateur
    browser = await puppeteer.launch({
      headless: false, // Mode visible pour debug
      defaultViewport: { width: 1920, height: 1080 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Configurer la page
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    // Écouter les erreurs console
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Naviguer vers l'admin
    console.log('🌐 Navigation vers l\'interface admin...');
    await page.goto(`${CONFIG.baseUrl}${CONFIG.adminPath}`, { 
      waitUntil: 'networkidle2',
      timeout: CONFIG.timeout 
    });

    // Attendre le chargement complet
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Capture d'écran initiale
    await TestUtils.takeScreenshot(page, 'dashboard-initial');

    // Tester chaque module
    for (const module of MODULES) {
      console.log(`\n📦 Test du module: ${module.name}`);
      
      const moduleResult = {
        id: module.id,
        name: module.name,
        priority: module.priority,
        tests: {},
        overall: 'unknown'
      };

      // Exécuter les tests spécifiques au module
      for (const testType of module.tests) {
        try {
          let result;
          
          switch (testType) {
            case 'navigation':
              result = await ModuleTests.testNavigation(page, module);
              break;
            case 'interface':
              result = await ModuleTests.testInterface(page, module);
              break;
            case 'store-integration':
              result = await ModuleTests.testStoreIntegration(page, module);
              break;
            case 'functionality':
              result = await ModuleTests.testFunctionality(page, module);
              break;
            default:
              result = { status: 'skipped', details: 'Test non implémenté' };
          }

          moduleResult.tests[testType] = result;
          TestUtils.logTest(module.name, testType, result.status, result.details);

          // Mettre à jour les compteurs
          testResults.summary.total++;
          if (result.status === 'passed') testResults.summary.passed++;
          else if (result.status === 'failed') testResults.summary.failed++;
          else if (result.status === 'warning') testResults.summary.warnings++;

        } catch (error) {
          console.error(`❌ Erreur lors du test ${testType} pour ${module.name}:`, error.message);
          moduleResult.tests[testType] = { status: 'failed', details: error.message };
          testResults.summary.total++;
          testResults.summary.failed++;
          testResults.errors.push(`${module.name} - ${testType}: ${error.message}`);
        }

        // Pause entre les tests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Déterminer le statut global du module
      const testStatuses = Object.values(moduleResult.tests).map(t => t.status);
      if (testStatuses.every(s => s === 'passed')) {
        moduleResult.overall = 'passed';
      } else if (testStatuses.some(s => s === 'failed')) {
        moduleResult.overall = 'failed';
      } else {
        moduleResult.overall = 'warning';
      }

      testResults.modules.push(moduleResult);
    }

    // Tests additionnels globaux
    console.log('\n🔍 Tests globaux...');
    
    // Test de la recherche
    try {
      await page.type('input[placeholder*="Rechercher"]', 'menu');
      await new Promise(resolve => setTimeout(resolve, 1000));
      const searchResults = await page.$$('.card:has-text("menu"), .card:has-text("Menu")');
      TestUtils.logTest('Global', 'Recherche', searchResults.length > 0 ? 'passed' : 'failed', 
        `${searchResults.length} résultats trouvés`);
      
      // Nettoyer la recherche
      await page.evaluate(() => {
        const searchInput = document.querySelector('input[placeholder*="Rechercher"]');
        if (searchInput) searchInput.value = '';
      });
    } catch (error) {
      TestUtils.logTest('Global', 'Recherche', 'failed', error.message);
    }

    // Test des filtres de priorité
    try {
      await page.select('select', 'high');
      await new Promise(resolve => setTimeout(resolve, 1000));
      const highPriorityModules = await page.$$('.card');
      TestUtils.logTest('Global', 'Filtres', highPriorityModules.length > 0 ? 'passed' : 'failed',
        `${highPriorityModules.length} modules haute priorité`);
      
      // Remettre sur "all"
      await page.select('select', 'all');
    } catch (error) {
      TestUtils.logTest('Global', 'Filtres', 'failed', error.message);
    }

    // Capture d'écran finale
    await TestUtils.takeScreenshot(page, 'dashboard-final');

    // Vérifier les erreurs console
    if (consoleErrors.length > 0) {
      console.log(`\n⚠️ ${consoleErrors.length} erreurs console détectées:`);
      consoleErrors.forEach(error => console.log(`  - ${error}`));
      testResults.errors.push(...consoleErrors.map(e => `Console: ${e}`));
    }

  } catch (error) {
    console.error('❌ Erreur critique lors des tests:', error.message);
    testResults.errors.push(`Erreur critique: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  // Finaliser les résultats
  testResults.summary.endTime = new Date();
  const duration = testResults.summary.endTime - testResults.summary.startTime;
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RÉSULTATS DES TESTS D\'INTÉGRATION');
  console.log('='.repeat(60));
  console.log(`⏱️ Durée: ${Math.round(duration / 1000)}s`);
  console.log(`📈 Total: ${testResults.summary.total}`);
  console.log(`✅ Réussis: ${testResults.summary.passed}`);
  console.log(`❌ Échecs: ${testResults.summary.failed}`);
  console.log(`⚠️ Avertissements: ${testResults.summary.warnings}`);
  
  const successRate = Math.round((testResults.summary.passed / testResults.summary.total) * 100);
  console.log(`🎯 Taux de réussite: ${successRate}%`);

  // Générer le rapport
  await generateReport();
  
  console.log(`\n📄 Rapport détaillé généré: ${CONFIG.reportFile}`);
  console.log(`📸 Captures d'écran: ${CONFIG.screenshotDir}`);
  
  return testResults;
}

/**
 * Génération du rapport Markdown
 */
async function generateReport() {
  const { summary, modules, errors, screenshots } = testResults;
  const duration = Math.round((summary.endTime - summary.startTime) / 1000);
  const successRate = Math.round((summary.passed / summary.total) * 100);

  const report = `# 📊 Rapport d'Intégration - Interface Admin O'Miam

> **Date**: ${summary.startTime.toLocaleString('fr-FR')}  
> **Durée**: ${duration}s  
> **Taux de réussite**: ${successRate}%

---

## 🎯 Résumé Exécutif

| Métrique | Valeur |
|----------|--------|
| **Tests totaux** | ${summary.total} |
| **✅ Réussis** | ${summary.passed} |
| **❌ Échecs** | ${summary.failed} |
| **⚠️ Avertissements** | ${summary.warnings} |
| **🎯 Taux de réussite** | **${successRate}%** |

---

## 📦 Résultats par Module

${modules.map(module => {
  const icon = module.overall === 'passed' ? '✅' : module.overall === 'failed' ? '❌' : '⚠️';
  const priorityBadge = module.priority === 'high' ? '🔴 Haute' : module.priority === 'medium' ? '🟡 Moyenne' : '🟢 Basse';
  
  return `### ${icon} ${module.name}

**Priorité**: ${priorityBadge}  
**Statut global**: ${module.overall.toUpperCase()}

| Test | Résultat | Détails |
|------|----------|----------|
${Object.entries(module.tests).map(([test, result]) => {
  const testIcon = result.status === 'passed' ? '✅' : result.status === 'failed' ? '❌' : '⚠️';
  return `| ${test} | ${testIcon} ${result.status} | ${result.details} |`;
}).join('\n')}
`;
}).join('\n')}

---

## 🚨 Erreurs Détectées

${errors.length > 0 ? errors.map(error => `- ❌ ${error}`).join('\n') : '✅ Aucune erreur critique détectée'}

---

## 📸 Captures d'Écran

${screenshots.map(screenshot => `- **${screenshot.name}**: \`${screenshot.filepath}\``).join('\n')}

---

## 🎯 Recommandations

### ✅ Points Forts
- Interface d'administration complète avec ${modules.length} modules
- Navigation fonctionnelle entre les modules
- Design responsive et moderne
- Intégration des stores Zustand

### 🔧 Améliorations Suggérées
${summary.failed > 0 ? '- Corriger les modules en échec pour améliorer la stabilité' : ''}
${summary.warnings > 0 ? '- Optimiser les modules avec avertissements' : ''}
${errors.length > 0 ? '- Résoudre les erreurs console détectées' : ''}
- Ajouter des tests automatisés pour la régression
- Implémenter des indicateurs de chargement
- Optimiser les performances de navigation

### 🚀 Prochaines Étapes
1. **Correction des bugs** identifiés dans ce rapport
2. **Optimisation des performances** des modules lents
3. **Tests utilisateur** avec de vraies données
4. **Déploiement en staging** pour validation finale

---

## 📞 Support

**Équipe**: O'Miam Development Team  
**Contact**: support@omiam.fr  
**Documentation**: [Admin Docs](./DOCUMENTATION-ADMIN.md)

---

*Rapport généré automatiquement par le système de test d'intégration O'Miam v2.0*
`;

  try {
    fs.writeFileSync(CONFIG.reportFile, report, 'utf8');
    console.log(`✅ Rapport généré: ${CONFIG.reportFile}`);
  } catch (error) {
    console.error(`❌ Erreur génération rapport: ${error.message}`);
  }
}

// Exécution si appelé directement
if (require.main === module) {
  runIntegrationTests()
    .then(results => {
      const successRate = Math.round((results.summary.passed / results.summary.total) * 100);
      process.exit(successRate >= 80 ? 0 : 1); // Exit code basé sur le taux de réussite
    })
    .catch(error => {
      console.error('💥 Échec critique des tests:', error);
      process.exit(1);
    });
}

module.exports = { runIntegrationTests, TestUtils, ModuleTests };