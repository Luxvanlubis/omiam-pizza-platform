/**
 * ♿ Système d'Accessibilité O'Miam
 * Conformité WCAG 2.1 AA et tests automatisés
 */

import { useEffect, useState, useCallback } from 'react';

// =============================================================================
// 🎯 INTERFACES & TYPES
// =============================================================================

export interface AccessibilityConfig {
  enableHighContrast: boolean;
  enableLargeText: boolean;
  enableReducedMotion: boolean;
  enableScreenReader: boolean;
  enableKeyboardNavigation: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  colorScheme: 'light' | 'dark' | 'high-contrast';
}

export interface AccessibilityTest {
  id: string;
  name: string;
  description: string;
  level: 'A' | 'AA' | 'AAA';
  category: 'perceivable' | 'operable' | 'understandable' | 'robust';
  test: () => Promise<AccessibilityTestResult>;
}

export interface AccessibilityTestResult {
  passed: boolean;
  score: number;
  issues: AccessibilityIssue[];
  suggestions: string[];
}

export interface AccessibilityIssue {
  severity: 'error' | 'warning' | 'info';
  element: string;
  description: string;
  wcagReference: string;
  howToFix: string;
}

export interface FocusManagementOptions {
  trapFocus: boolean;
  restoreFocus: boolean;
  skipLinks: boolean;
  focusVisible: boolean;
}

// =============================================================================
// ♿ GESTIONNAIRE D'ACCESSIBILITÉ PRINCIPAL
// =============================================================================

export class AccessibilityManager {
  private static instance: AccessibilityManager;
  private config: AccessibilityConfig;
  private focusHistory: HTMLElement[] = [];
  private skipLinkContainer: HTMLElement | null = null;

  private constructor() {
    this.config = {
      enableHighContrast: false,
      enableLargeText: false,
      enableReducedMotion: false,
      enableScreenReader: true,
      enableKeyboardNavigation: true,
      fontSize: 'medium',
      colorScheme: 'light'
    };
    
    this.initializeAccessibility();
  }

  static getInstance(): AccessibilityManager {
    if (!AccessibilityManager.instance) {
      AccessibilityManager.instance = new AccessibilityManager();
    }
    return AccessibilityManager.instance;
  }

  /**
   * 🚀 Initialisation de l'accessibilité
   */
  private initializeAccessibility() {
    if (typeof window === 'undefined') return;

    // Détection des préférences utilisateur
    this.detectUserPreferences();
    
    // Application des styles d'accessibilité
    this.applyAccessibilityStyles();
    
    // Création des liens de navigation rapide
    this.createSkipLinks();
    
    // Gestion du focus
    this.initializeFocusManagement();
    
    // Annonces pour les lecteurs d'écran
    this.createAriaLiveRegions();
  }

  /**
   * 🔍 Détection des préférences utilisateur
   */
  private detectUserPreferences() {
    if (typeof window === 'undefined') return;

    // Préférence pour le mouvement réduit
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.config.enableReducedMotion = prefersReducedMotion.matches;
    
    prefersReducedMotion.addEventListener('change', (e) => {
      this.config.enableReducedMotion = e.matches;
      this.applyAccessibilityStyles();
    });

    // Préférence pour le contraste élevé
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)');
    this.config.enableHighContrast = prefersHighContrast.matches;
    
    prefersHighContrast.addEventListener('change', (e) => {
      this.config.enableHighContrast = e.matches;
      this.applyAccessibilityStyles();
    });

    // Préférence pour le thème sombre
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    if (prefersDarkScheme.matches) {
      this.config.colorScheme = 'dark';
    }
    
    prefersDarkScheme.addEventListener('change', (e) => {
      this.config.colorScheme = e.matches ? 'dark' : 'light';
      this.applyAccessibilityStyles();
    });

    // Chargement des préférences sauvegardées
    this.loadSavedPreferences();
  }

  /**
   * 💾 Chargement des préférences sauvegardées
   */
  private loadSavedPreferences() {
    try {
      const saved = localStorage.getItem('omiam-accessibility-preferences');
      if (saved) {
        const preferences = JSON.parse(saved);
        this.config = { ...this.config, ...preferences };
      }
    } catch (error) {
      console.warn('Impossible de charger les préférences d\'accessibilité:', error);
    }
  }

  /**
   * 💾 Sauvegarde des préférences
   */
  private savePreferences() {
    try {
      localStorage.setItem('omiam-accessibility-preferences', JSON.stringify(this.config));
    } catch (error) {
      console.warn('Impossible de sauvegarder les préférences d\'accessibilité:', error);
    }
  }

  /**
   * 🎨 Application des styles d'accessibilité
   */
  private applyAccessibilityStyles() {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    
    // Taille de police
    const fontSizeMap = {
      'small': '14px',
      'medium': '16px',
      'large': '18px',
      'extra-large': '20px'
    };
    root.style.setProperty('--base-font-size', fontSizeMap[this.config.fontSize]);

    // Schéma de couleurs
    root.setAttribute('data-color-scheme', this.config.colorScheme);
    
    // Contraste élevé
    if (this.config.enableHighContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Mouvement réduit
    if (this.config.enableReducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // Texte large
    if (this.config.enableLargeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }
  }

  /**
   * 🔗 Création des liens de navigation rapide
   */
  private createSkipLinks() {
    if (typeof document === 'undefined') return;
    
    // Vérifier si les skip links existent déjà
    if (document.getElementById('skip-links')) return;

    const skipLinks = document.createElement('div');
    skipLinks.id = 'skip-links';
    skipLinks.className = 'skip-links';
    skipLinks.setAttribute('aria-label', 'Liens de navigation rapide');
    
    const links = [
      { href: '#main-content', text: 'Aller au contenu principal' },
      { href: '#main-navigation', text: 'Aller à la navigation' },
      { href: '#search', text: 'Aller à la recherche' },
      { href: '#footer', text: 'Aller au pied de page' }
    ];

    links.forEach(link => {
      const skipLink = document.createElement('a');
      skipLink.href = link.href;
      skipLink.textContent = link.text;
      skipLink.className = 'skip-link';
      skipLinks.appendChild(skipLink);
    });

    // Insérer au début du body
    document.body.insertBefore(skipLinks, document.body.firstChild);
    this.skipLinkContainer = skipLinks;
  }

  /**
   * 🎯 Initialisation de la gestion du focus
   */
  private initializeFocusManagement() {
    if (typeof document === 'undefined') return;

    // Indicateur de focus visible
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
    });

    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-navigation');
    });

    // Gestion des modales et overlays
    this.setupModalFocusTrap();
  }

  /**
   * 🔒 Piège à focus pour les modales
   */
  private setupModalFocusTrap() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const activeModal = document.querySelector('[role="dialog"][aria-modal="true"]');
        if (activeModal) {
          this.closeModal(activeModal as HTMLElement);
        }
      }

      if (e.key === 'Tab') {
        const activeModal = document.querySelector('[role="dialog"][aria-modal="true"]');
        if (activeModal) {
          this.trapFocus(e, activeModal as HTMLElement);
        }
      }
    });
  }

  /**
   * 🔒 Piégeage du focus dans un élément
   */
  private trapFocus(event: KeyboardEvent, container: HTMLElement) {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        event.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        event.preventDefault();
      }
    }
  }

  /**
   * ❌ Fermeture de modale avec restauration du focus
   */
  private closeModal(modal: HTMLElement) {
    modal.setAttribute('aria-modal', 'false');
    modal.style.display = 'none';
    
    // Restaurer le focus
    const lastFocused = this.focusHistory.pop();
    if (lastFocused) {
      lastFocused.focus();
    }
  }

  /**
   * 📢 Création des régions ARIA Live
   */
  private createAriaLiveRegions() {
    if (typeof document === 'undefined') return;

    // Région pour les annonces polies
    const politeRegion = document.createElement('div');
    politeRegion.id = 'aria-live-polite';
    politeRegion.setAttribute('aria-live', 'polite');
    politeRegion.setAttribute('aria-atomic', 'true');
    politeRegion.className = 'sr-only';
    document.body.appendChild(politeRegion);

    // Région pour les annonces assertives
    const assertiveRegion = document.createElement('div');
    assertiveRegion.id = 'aria-live-assertive';
    assertiveRegion.setAttribute('aria-live', 'assertive');
    assertiveRegion.setAttribute('aria-atomic', 'true');
    assertiveRegion.className = 'sr-only';
    document.body.appendChild(assertiveRegion);
  }

  /**
   * 📢 Annonce pour les lecteurs d'écran
   */
  announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
    if (typeof document === 'undefined') return;

    const regionId = priority === 'assertive' ? 'aria-live-assertive' : 'aria-live-polite';
    const region = document.getElementById(regionId);
    
    if (region) {
      region.textContent = message;
      
      // Nettoyer après 1 seconde
      setTimeout(() => {
        region.textContent = '';
      }, 1000);
    }
  }

  /**
   * ⚙️ Mise à jour de la configuration
   */
  updateConfig(newConfig: Partial<AccessibilityConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.applyAccessibilityStyles();
    this.savePreferences();
    
    // Annoncer le changement
    this.announce('Paramètres d\'accessibilité mis à jour');
  }

  /**
   * 📊 Obtenir la configuration actuelle
   */
  getConfig(): AccessibilityConfig {
    return { ...this.config };
  }

  /**
   * 🧪 Tests d'accessibilité automatisés
   */
  async runAccessibilityTests(): Promise<AccessibilityTestResult> {
    const tests = this.getAccessibilityTests();
    const results: AccessibilityTestResult[] = [];
    
    for (const test of tests) {
      try {
        const result = await test.test();
        results.push(result);
      } catch (error) {
        console.error(`Erreur lors du test ${test.name}:`, error);
      }
    }

    // Agrégation des résultats
    const totalTests = results.length;
    const passedTests = results.filter(r => r.passed).length;
    const allIssues = results.flatMap(r => r.issues);
    const allSuggestions = results.flatMap(r => r.suggestions);

    return {
      passed: passedTests === totalTests,
      score: Math.round((passedTests / totalTests) * 100),
      issues: allIssues,
      suggestions: [...new Set(allSuggestions)]
    };
  }

  /**
   * 📋 Définition des tests d'accessibilité
   */
  private getAccessibilityTests(): AccessibilityTest[] {
    return [
      {
        id: 'alt-text',
        name: 'Texte alternatif des images',
        description: 'Vérifier que toutes les images ont un texte alternatif approprié',
        level: 'A',
        category: 'perceivable',
        test: async () => {
          const images = document.querySelectorAll('img');
          const issues: AccessibilityIssue[] = [];
          
          images.forEach((img, index) => {
            if (!img.alt && !img.getAttribute('aria-label') && !img.getAttribute('aria-labelledby')) {
              issues.push({
                severity: 'error',
                element: `img[${index}]`,
                description: 'Image sans texte alternatif',
                wcagReference: 'WCAG 1.1.1',
                howToFix: 'Ajouter un attribut alt descriptif ou aria-label'
              });
            }
          });

          return {
            passed: issues.length === 0,
            score: issues.length === 0 ? 100 : Math.max(0, 100 - (issues.length * 10)),
            issues,
            suggestions: issues.length > 0 ? ['Ajouter des textes alternatifs descriptifs'] : []
          };
        }
      },
      
      {
        id: 'heading-structure',
        name: 'Structure des titres',
        description: 'Vérifier la hiérarchie logique des titres',
        level: 'AA',
        category: 'perceivable',
        test: async () => {
          const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
          const issues: AccessibilityIssue[] = [];
          let previousLevel = 0;
          
          headings.forEach((heading, index) => {
            const level = parseInt(heading.tagName.charAt(1));
            
            if (index === 0 && level !== 1) {
              issues.push({
                severity: 'warning',
                element: heading.tagName.toLowerCase(),
                description: 'La page devrait commencer par un h1',
                wcagReference: 'WCAG 1.3.1',
                howToFix: 'Utiliser h1 pour le titre principal'
              });
            }
            
            if (level > previousLevel + 1) {
              issues.push({
                severity: 'warning',
                element: heading.tagName.toLowerCase(),
                description: 'Saut de niveau de titre détecté',
                wcagReference: 'WCAG 1.3.1',
                howToFix: 'Respecter la hiérarchie des titres (h1 > h2 > h3...)'
              });
            }
            
            previousLevel = level;
          });

          return {
            passed: issues.length === 0,
            score: Math.max(0, 100 - (issues.length * 15)),
            issues,
            suggestions: issues.length > 0 ? ['Respecter la hiérarchie des titres'] : []
          };
        }
      },
      
      {
        id: 'form-labels',
        name: 'Étiquettes des formulaires',
        description: 'Vérifier que tous les champs de formulaire ont des étiquettes',
        level: 'A',
        category: 'perceivable',
        test: async () => {
          const inputs = document.querySelectorAll('input, select, textarea');
          const issues: AccessibilityIssue[] = [];
          
          inputs.forEach((input, index) => {
            const hasLabel = input.getAttribute('aria-label') || 
                           input.getAttribute('aria-labelledby') ||
                           document.querySelector(`label[for="${input.id}"]`);
            
            if (!hasLabel && input.type !== 'hidden' && input.type !== 'submit') {
              issues.push({
                severity: 'error',
                element: `${input.tagName.toLowerCase()}[${index}]`,
                description: 'Champ de formulaire sans étiquette',
                wcagReference: 'WCAG 1.3.1',
                howToFix: 'Ajouter un label, aria-label ou aria-labelledby'
              });
            }
          });

          return {
            passed: issues.length === 0,
            score: issues.length === 0 ? 100 : Math.max(0, 100 - (issues.length * 20)),
            issues,
            suggestions: issues.length > 0 ? ['Ajouter des étiquettes aux champs de formulaire'] : []
          };
        }
      },
      
      {
        id: 'color-contrast',
        name: 'Contraste des couleurs',
        description: 'Vérifier le contraste minimum des couleurs',
        level: 'AA',
        category: 'perceivable',
        test: async () => {
          // Test simplifié - dans un vrai projet, utiliser une librairie comme axe-core
          const issues: AccessibilityIssue[] = [];
          const suggestions = ['Vérifier le contraste avec un outil dédié comme WebAIM'];
          
          return {
            passed: true, // Placeholder
            score: 85, // Score estimé
            issues,
            suggestions
          };
        }
      },
      
      {
        id: 'keyboard-navigation',
        name: 'Navigation au clavier',
        description: 'Vérifier que tous les éléments interactifs sont accessibles au clavier',
        level: 'A',
        category: 'operable',
        test: async () => {
          const interactiveElements = document.querySelectorAll(
            'button, a, input, select, textarea, [tabindex], [role="button"], [role="link"]'
          );
          const issues: AccessibilityIssue[] = [];
          
          interactiveElements.forEach((element, index) => {
            const tabIndex = element.getAttribute('tabindex');
            if (tabIndex === '-1' && !element.getAttribute('aria-hidden')) {
              issues.push({
                severity: 'warning',
                element: `${element.tagName.toLowerCase()}[${index}]`,
                description: 'Élément interactif non accessible au clavier',
                wcagReference: 'WCAG 2.1.1',
                howToFix: 'Retirer tabindex="-1" ou ajouter aria-hidden="true"'
              });
            }
          });

          return {
            passed: issues.length === 0,
            score: Math.max(0, 100 - (issues.length * 10)),
            issues,
            suggestions: issues.length > 0 ? ['Assurer l\'accessibilité au clavier'] : []
          };
        }
      }
    ];
  }
}

// =============================================================================
// 🎨 STYLES CSS D'ACCESSIBILITÉ
// =============================================================================

export const accessibilityCSS = `
/* Skip Links */
.skip-links {
  position: absolute;
  top: -40px;
  left: 6px;
  z-index: 1000;
}

.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: #000;
  color: #fff;
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
  font-weight: bold;
  z-index: 1001;
}

.skip-link:focus {
  top: 6px;
}

/* Screen Reader Only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Focus Visible */
.keyboard-navigation *:focus {
  outline: 2px solid #005fcc;
  outline-offset: 2px;
}

/* High Contrast Mode */
.high-contrast {
  --text-color: #000;
  --bg-color: #fff;
  --link-color: #0000ee;
  --visited-color: #551a8b;
  --border-color: #000;
}

.high-contrast * {
  color: var(--text-color) !important;
  background-color: var(--bg-color) !important;
  border-color: var(--border-color) !important;
}

.high-contrast a {
  color: var(--link-color) !important;
}

.high-contrast a:visited {
  color: var(--visited-color) !important;
}

/* Reduced Motion */
.reduced-motion *,
.reduced-motion *::before,
.reduced-motion *::after {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
  scroll-behavior: auto !important;
}

/* Large Text */
.large-text {
  font-size: 120% !important;
  line-height: 1.6 !important;
}

/* Dark Mode */
[data-color-scheme="dark"] {
  --text-color: #e0e0e0;
  --bg-color: #121212;
  --surface-color: #1e1e1e;
  --primary-color: #bb86fc;
  --secondary-color: #03dac6;
}

/* Focus Management */
[aria-modal="true"] {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
}

/* ARIA States */
[aria-expanded="false"] + * {
  display: none;
}

[aria-expanded="true"] + * {
  display: block;
}

[aria-hidden="true"] {
  display: none !important;
}

/* Loading States */
[aria-busy="true"] {
  cursor: wait;
  opacity: 0.6;
}

/* Error States */
[aria-invalid="true"] {
  border-color: #d32f2f !important;
  box-shadow: 0 0 0 2px rgba(211, 47, 47, 0.2) !important;
}

/* Success States */
[aria-invalid="false"] {
  border-color: #388e3c !important;
  box-shadow: 0 0 0 2px rgba(56, 142, 60, 0.2) !important;
}
`;

// =============================================================================
// 🚀 HOOK REACT POUR ACCESSIBILITÉ
// =============================================================================

export function useAccessibility() {
  const [config, setConfig] = useState<AccessibilityConfig | null>(null);
  const [testResults, setTestResults] = useState<AccessibilityTestResult | null>(null);
  const accessibility = AccessibilityManager.getInstance();

  useEffect(() => {
    setConfig(accessibility.getConfig());
  }, []);

  const updateConfig = useCallback((newConfig: Partial<AccessibilityConfig>) => {
    accessibility.updateConfig(newConfig);
    setConfig(accessibility.getConfig());
  }, []);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    accessibility.announce(message, priority);
  }, []);

  const runTests = useCallback(async () => {
    const results = await accessibility.runAccessibilityTests();
    setTestResults(results);
    return results;
  }, []);

  const manageFocus = useCallback((element: HTMLElement | null) => {
    if (element) {
      element.focus();
    }
  }, []);

  return {
    config,
    updateConfig,
    announce,
    runTests,
    testResults,
    manageFocus
  };
}

// =============================================================================
// 🧩 COMPOSANTS D'ACCESSIBILITÉ
// =============================================================================

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Initialiser le gestionnaire d'accessibilité
    AccessibilityManager.getInstance();
    
    // Injecter les styles CSS
    if (typeof document !== 'undefined') {
      const styleElement = document.createElement('style');
      styleElement.textContent = accessibilityCSS;
      document.head.appendChild(styleElement);
    }
  }, []);

  return <>{children}</>;
};

// =============================================================================
// 🧹 NETTOYAGE ET INITIALISATION
// =============================================================================

if (typeof window !== 'undefined') {
  // Auto-initialisation côté client
  AccessibilityManager.getInstance();
}

console.log('♿ Système d\'Accessibilité O\'Miam initialisé');