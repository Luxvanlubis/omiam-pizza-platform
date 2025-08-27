/**
 * 🚀 Fournisseur d'Optimisations O'Miam
 * Intégration complète de tous les systèmes d'optimisation
 */

'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { PerformanceMonitor } from '../lib/performance';
import { AnalyticsManager } from '../lib/analytics';
import { SecurityManager } from '../lib/security';
import { AccessibilityManager } from '../lib/accessibility';
import { SEOGenerator } from '../lib/seo';

// =============================================================================
// 🎯 TYPES & INTERFACES
// =============================================================================

interface OptimizationConfig {
  performance: {
    enableLazyLoading: boolean;
    enableCodeSplitting: boolean;
    enableCaching: boolean;
    enablePreloading: boolean;
  };
  analytics: {
    enableGA4: boolean;
    enableGTM: boolean;
    enableFacebookPixel: boolean;
    enableHotjar: boolean;
    trackPerformance: boolean;
  };
  security: {
    enableCSP: boolean;
    enableRateLimit: boolean;
    enableInputValidation: boolean;
    enableXSSProtection: boolean;
  };
  accessibility: {
    enableWCAG: boolean;
    enableKeyboardNav: boolean;
    enableScreenReader: boolean;
    enableHighContrast: boolean;
  };
  seo: {
    enableStructuredData: boolean;
    enableOpenGraph: boolean;
    enableTwitterCards: boolean;
    enableSitemap: boolean;
  };
  pwa: {
    enableServiceWorker: boolean;
    enablePushNotifications: boolean;
    enableOfflineMode: boolean;
    enableInstallPrompt: boolean;
  };
}

interface OptimizationContextType {
  config: OptimizationConfig;
  updateConfig: (newConfig: Partial<OptimizationConfig>) => void;
  performance: PerformanceMonitor;
  analytics: AnalyticsManager;
  security: SecurityManager;
  accessibility: AccessibilityManager;
  seo: SEOGenerator;
  isInitialized: boolean;
  metrics: {
    performanceScore: number;
    securityScore: number;
    accessibilityScore: number;
    seoScore: number;
  };
}

// =============================================================================
// 🎯 CONFIGURATION PAR DÉFAUT
// =============================================================================

const DEFAULT_CONFIG: OptimizationConfig = {
  performance: {
    enableLazyLoading: true,
    enableCodeSplitting: true,
    enableCaching: true,
    enablePreloading: true,
  },
  analytics: {
    enableGA4: true,
    enableGTM: true,
    enableFacebookPixel: true,
    enableHotjar: true,
    trackPerformance: true,
  },
  security: {
    enableCSP: true,
    enableRateLimit: true,
    enableInputValidation: true,
    enableXSSProtection: true,
  },
  accessibility: {
    enableWCAG: true,
    enableKeyboardNav: true,
    enableScreenReader: true,
    enableHighContrast: true,
  },
  seo: {
    enableStructuredData: true,
    enableOpenGraph: true,
    enableTwitterCards: true,
    enableSitemap: true,
  },
  pwa: {
    enableServiceWorker: true,
    enablePushNotifications: true,
    enableOfflineMode: true,
    enableInstallPrompt: true,
  },
};

// =============================================================================
// 🎯 CONTEXTE
// =============================================================================

const OptimizationContext = createContext<OptimizationContextType | null>(null);

// =============================================================================
// 🚀 FOURNISSEUR PRINCIPAL
// =============================================================================

interface OptimizationProviderProps {
  children: ReactNode;
  initialConfig?: Partial<OptimizationConfig>;
}

export function OptimizationProvider({ children, initialConfig }: OptimizationProviderProps) {
  const [config, setConfig] = useState<OptimizationConfig>({
    ...DEFAULT_CONFIG,
    ...initialConfig,
  });
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [metrics, setMetrics] = useState({
    performanceScore: 0,
    securityScore: 0,
    accessibilityScore: 0,
    seoScore: 0,
  });

  // Instances des gestionnaires
  const [performance] = useState(() => new PerformanceMonitor());
  const [analytics] = useState(() => new AnalyticsManager());
  const [security] = useState(() => new SecurityManager());
  const [accessibility] = useState(() => new AccessibilityManager());
  const [seo] = useState(() => new SEOGenerator());

  // =============================================================================
  // 🔧 INITIALISATION
  // =============================================================================

  useEffect(() => {
    const initializeOptimizations = async () => {
      try {
        console.log('🚀 Initialisation des optimisations O\'Miam...');

        // 1. Performance
        if (config.performance.enableLazyLoading) {
          performance.enableLazyLoading();
        }
        if (config.performance.enableCaching) {
          performance.enableCaching();
        }
        if (config.performance.enablePreloading) {
          performance.preloadCriticalResources();
        }

        // 2. Analytics
        if (config.analytics.enableGA4) {
          await analytics.initialize({
            ga4MeasurementId: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || '',
            gtmId: process.env.NEXT_PUBLIC_GTM_ID || '',
            facebookPixelId: process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || '',
            hotjarId: process.env.NEXT_PUBLIC_HOTJAR_ID || '',
          });
        }

        // 3. Sécurité
        if (config.security.enableCSP) {
          security.generateCSP();
        }
        if (config.security.enableRateLimit) {
          security.enableRateLimit();
        }

        // 4. Accessibilité
        if (config.accessibility.enableWCAG) {
          await accessibility.initialize();
          accessibility.applyAccessibilityStyles();
        }

        // 5. SEO
        if (config.seo.enableStructuredData) {
          seo.generateRestaurantStructuredData({
            name: "O'Miam",
            description: "Restaurant gastronomique français",
            address: {
              streetAddress: "123 Rue de la Gastronomie",
              addressLocality: "Paris",
              postalCode: "75001",
              addressCountry: "FR"
            },
            telephone: "+33 1 23 45 67 89",
            url: process.env.NEXT_PUBLIC_APP_URL || '',
            priceRange: "€€€",
            servesCuisine: "French",
            acceptsReservations: true
          });
        }

        // 6. PWA
        if (config.pwa.enableServiceWorker && 'serviceWorker' in navigator) {
          try {
            await navigator.serviceWorker.register('/sw.js');
            console.log('✅ Service Worker enregistré');
          } catch (error) {
            console.error('❌ Erreur Service Worker:', error);
          }
        }

        // Calculer les scores initiaux
        await updateMetrics();

        setIsInitialized(true);
        console.log('✅ Optimisations O\'Miam initialisées avec succès');

      } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation des optimisations:', error);
      }
    };

    initializeOptimizations();
  }, [config]);

  // =============================================================================
  // 📊 MISE À JOUR DES MÉTRIQUES
  // =============================================================================

  const updateMetrics = async () => {
    try {
      // Performance Score (basé sur les Web Vitals)
      const performanceMetrics = performance.getMetrics();
      const performanceScore = calculatePerformanceScore(performanceMetrics);

      // Security Score (basé sur les fonctionnalités activées)
      const securityScore = calculateSecurityScore();

      // Accessibility Score (basé sur les tests automatisés)
      const accessibilityResults = await accessibility.runAutomatedTests();
      const accessibilityScore = calculateAccessibilityScore(accessibilityResults);

      // SEO Score (basé sur les éléments présents)
      const seoScore = calculateSEOScore();

      setMetrics({
        performanceScore,
        securityScore,
        accessibilityScore,
        seoScore,
      });
    } catch (error) {
      console.error('Erreur lors du calcul des métriques:', error);
    }
  };

  // =============================================================================
  // 🧮 CALCUL DES SCORES
  // =============================================================================

  const calculatePerformanceScore = (metrics: any): number => {
    if (!metrics.lcp || !metrics.fid || !metrics.cls) return 0;
    
    // Score basé sur les seuils Core Web Vitals
    const lcpScore = metrics.lcp <= 2500 ? 100 : metrics.lcp <= 4000 ? 50 : 0;
    const fidScore = metrics.fid <= 100 ? 100 : metrics.fid <= 300 ? 50 : 0;
    const clsScore = metrics.cls <= 0.1 ? 100 : metrics.cls <= 0.25 ? 50 : 0;
    
    return Math.round((lcpScore + fidScore + clsScore) / 3);
  };

  const calculateSecurityScore = (): number => {
    let score = 0;
    if (config.security.enableCSP) score += 25;
    if (config.security.enableRateLimit) score += 25;
    if (config.security.enableInputValidation) score += 25;
    if (config.security.enableXSSProtection) score += 25;
    return score;
  };

  const calculateAccessibilityScore = (results: any): number => {
    if (!results || !results.tests) return 0;
    
    const totalTests = results.tests.length;
    const passedTests = results.tests.filter((test: any) => test.passed).length;
    
    return Math.round((passedTests / totalTests) * 100);
  };

  const calculateSEOScore = (): number => {
    let score = 0;
    if (config.seo.enableStructuredData) score += 25;
    if (config.seo.enableOpenGraph) score += 25;
    if (config.seo.enableTwitterCards) score += 25;
    if (config.seo.enableSitemap) score += 25;
    return score;
  };

  // =============================================================================
  // 🔧 FONCTIONS UTILITAIRES
  // =============================================================================

  const updateConfig = (newConfig: Partial<OptimizationConfig>) => {
    setConfig(prev => ({
      ...prev,
      ...newConfig,
    }));
  };

  // =============================================================================
  // 📊 MONITORING EN TEMPS RÉEL
  // =============================================================================

  useEffect(() => {
    if (!isInitialized) return;

    // Mise à jour des métriques toutes les 30 secondes
    const metricsInterval = setInterval(updateMetrics, 30000);

    // Nettoyage
    return () => {
      clearInterval(metricsInterval);
    };
  }, [isInitialized]);

  // =============================================================================
  // 🎯 VALEUR DU CONTEXTE
  // =============================================================================

  const contextValue: OptimizationContextType = {
    config,
    updateConfig,
    performance,
    analytics,
    security,
    accessibility,
    seo,
    isInitialized,
    metrics,
  };

  return (
    <OptimizationContext.Provider value={contextValue}>
      {children}
      {/* Indicateur de statut des optimisations */}
      {process.env.NODE_ENV === 'development' && (
        <OptimizationStatusIndicator />
      )}
    </OptimizationContext.Provider>
  );
}

// =============================================================================
// 🎯 HOOK D'UTILISATION
// =============================================================================

export function useOptimization(): OptimizationContextType {
  const context = useContext(OptimizationContext);
  if (!context) {
    throw new Error('useOptimization doit être utilisé dans un OptimizationProvider');
  }
  return context;
}

// =============================================================================
// 📊 INDICATEUR DE STATUT (DÉVELOPPEMENT)
// =============================================================================

function OptimizationStatusIndicator() {
  const { isInitialized, metrics } = useOptimization();
  const [isVisible, setIsVisible] = useState(false);

  if (!isInitialized) return null;

  return (
    <div 
      className="fixed bottom-4 right-4 z-50"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {/* Bouton d'indicateur */}
      <div className="bg-green-500 text-white p-2 rounded-full cursor-pointer shadow-lg">
        🚀
      </div>
      
      {/* Panel de métriques */}
      {isVisible && (
        <div className="absolute bottom-12 right-0 bg-white border border-gray-200 rounded-lg shadow-xl p-4 min-w-[300px]">
          <h3 className="font-bold text-gray-800 mb-3">📊 Scores d'Optimisation</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">⚡ Performance</span>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${metrics.performanceScore}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{metrics.performanceScore}%</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">🛡️ Sécurité</span>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${metrics.securityScore}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{metrics.securityScore}%</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">♿ Accessibilité</span>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all"
                    style={{ width: `${metrics.accessibilityScore}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{metrics.accessibilityScore}%</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">🎯 SEO</span>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full transition-all"
                    style={{ width: `${metrics.seoScore}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{metrics.seoScore}%</span>
              </div>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              Score global: {Math.round((metrics.performanceScore + metrics.securityScore + metrics.accessibilityScore + metrics.seoScore) / 4)}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OptimizationProvider;

console.log('🚀 OptimizationProvider O\'Miam chargé avec succès');