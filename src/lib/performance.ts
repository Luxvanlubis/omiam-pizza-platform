/**
 * 🚀 SYSTÈME D'OPTIMISATION PERFORMANCE O'MIAM
 * ==============================================
 * Gestion avancée des performances, cache, lazy loading et monitoring
 * Version: 1.0.0 | Date: 2025-01-27
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

// =============================================================================
// 🎯 TYPES & INTERFACES
// =============================================================================

interface CacheConfig {
  ttl: number;
  key: string;
  tags?: string[];
  revalidate?: number;
}

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  interactionTime: number;
  cacheHitRate: number;
  errorRate: number;
}

interface LazyLoadConfig {
  threshold: number;
  rootMargin: string;
  triggerOnce: boolean;
}

// =============================================================================
// 🗄️ SYSTÈME DE CACHE AVANCÉ
// =============================================================================

class PerformanceCache {
  private static instance: PerformanceCache;
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private hitCount = 0;
  private missCount = 0;

  static getInstance(): PerformanceCache {
    if (!PerformanceCache.instance) {
      PerformanceCache.instance = new PerformanceCache();
    }
    return PerformanceCache.instance;
  }

  /**
   * 💾 Mise en cache intelligente avec TTL
   */
  set(key: string, data: any, ttl: number = 3600000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * 🔍 Récupération avec validation TTL
   */
  get(key: string): any | null {
    const item = this.cache.get(key);
    
    if (!item) {
      this.missCount++;
      return null;
    }

    // Vérification TTL
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      this.missCount++;
      return null;
    }

    this.hitCount++;
    return item.data;
  }

  /**
   * 📊 Statistiques de cache
   */
  getStats(): { hitRate: number; totalRequests: number } {
    const total = this.hitCount + this.missCount;
    return {
      hitRate: total > 0 ? (this.hitCount / total) * 100 : 0,
      totalRequests: total
    };
  }

  /**
   * 🧹 Nettoyage automatique
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 🗑️ Invalidation par tags
   */
  invalidateByTag(tag: string): void {
    // Implémentation simplifiée - en production, utiliser Redis avec tags
    this.cache.clear();
  }
}

// =============================================================================
// 🖼️ LAZY LOADING INTELLIGENT
// =============================================================================

class LazyLoader {
  private observer: IntersectionObserver | null = null;
  private config: LazyLoadConfig;

  constructor(config: LazyLoadConfig = {
    threshold: 0.1,
    rootMargin: '50px',
    triggerOnce: true
  }) {
    this.config = config;
    this.initObserver();
  }

  /**
   * 👁️ Initialisation de l'observer
   */
  private initObserver(): void {
    if (typeof window === 'undefined') return;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.loadElement(entry.target as HTMLElement);
            if (this.config.triggerOnce) {
              this.observer?.unobserve(entry.target);
            }
          }
        });
      },
      {
        threshold: this.config.threshold,
        rootMargin: this.config.rootMargin
      }
    );
  }

  /**
   * 🎯 Observation d'un élément
   */
  observe(element: HTMLElement): void {
    if (this.observer) {
      this.observer.observe(element);
    }
  }

  /**
   * 📥 Chargement d'un élément
   */
  private loadElement(element: HTMLElement): void {
    // Images
    if (element.tagName === 'IMG') {
      const img = element as HTMLImageElement;
      const src = img.dataset.src;
      if (src) {
        img.src = src;
        img.classList.add('loaded');
      }
    }

    // Composants React lazy
    if (element.dataset.component) {
      const componentName = element.dataset.component;
      this.loadComponent(componentName, element);
    }

    // Scripts différés
    if (element.dataset.script) {
      this.loadScript(element.dataset.script);
    }
  }

  /**
   * 🧩 Chargement de composant dynamique
   */
  private async loadComponent(componentName: string, element: HTMLElement): Promise<void> {
    try {
      const module = await import(`../components/${componentName}`);
      const Component = module.default;
      // Ici, vous intégreriez avec votre système de rendu React
      element.classList.add('component-loaded');
    } catch (error) {
      console.error(`Erreur chargement composant ${componentName}:`, error);
    }
  }

  /**
   * 📜 Chargement de script différé
   */
  private loadScript(src: string): void {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    document.head.appendChild(script);
  }

  /**
   * 🛑 Destruction de l'observer
   */
  destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

// =============================================================================
// 📊 MONITORING DES PERFORMANCES
// =============================================================================

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    loadTime: 0,
    renderTime: 0,
    interactionTime: 0,
    cacheHitRate: 0,
    errorRate: 0
  };

  /**
   * ⏱️ Mesure du temps de chargement
   */
  measureLoadTime(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      this.metrics.loadTime = navigation.loadEventEnd - navigation.fetchStart;
      this.reportMetrics();
    });
  }

  /**
   * 🎨 Mesure du temps de rendu
   */
  measureRenderTime(): void {
    if (typeof window === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
          this.metrics.renderTime = entry.startTime;
        }
      });
    });

    observer.observe({ entryTypes: ['paint'] });
  }

  /**
   * 🖱️ Mesure du temps d'interaction
   */
  measureInteractionTime(): void {
    if (typeof window === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'first-input') {
          this.metrics.interactionTime = (entry as any).processingStart - entry.startTime;
        }
      });
    });

    observer.observe({ entryTypes: ['first-input'] });
  }

  /**
   * 📈 Rapport des métriques
   */
  private reportMetrics(): void {
    const cache = PerformanceCache.getInstance();
    const cacheStats = cache.getStats();
    this.metrics.cacheHitRate = cacheStats.hitRate;

    // Envoi vers analytics (Google Analytics, Sentry, etc.)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'performance_metrics', {
        load_time: this.metrics.loadTime,
        render_time: this.metrics.renderTime,
        interaction_time: this.metrics.interactionTime,
        cache_hit_rate: this.metrics.cacheHitRate
      });
    }

    console.log('📊 Métriques Performance O\'Miam:', this.metrics);
  }

  /**
   * 📋 Obtenir les métriques actuelles
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
}

// =============================================================================
// 🔧 OPTIMISATIONS NEXT.JS
// =============================================================================

/**
 * 🎯 Middleware de cache intelligent
 */
export function cacheMiddleware(request: NextRequest): NextResponse {
  const cache = PerformanceCache.getInstance();
  const cacheKey = `page_${request.nextUrl.pathname}_${request.nextUrl.search}`;
  
  // Vérification cache
  const cachedResponse = cache.get(cacheKey);
  if (cachedResponse) {
    const response = new NextResponse(cachedResponse.body);
    response.headers.set('X-Cache', 'HIT');
    response.headers.set('Cache-Control', 'public, max-age=3600');
    return response;
  }

  // Pas de cache, continuer
  const response = NextResponse.next();
  response.headers.set('X-Cache', 'MISS');
  return response;
}

/**
 * 🖼️ Optimisation des images
 */
export const imageOptimization = {
  formats: ['webp', 'avif', 'jpeg'],
  sizes: [640, 768, 1024, 1280, 1920],
  quality: 85,
  placeholder: 'blur',
  loading: 'lazy' as const
};

/**
 * 📦 Configuration du code splitting
 */
export const codeSplittingConfig = {
  chunks: 'async' as const,
  minSize: 20000,
  maxSize: 244000,
  cacheGroups: {
    vendor: {
      test: /[\\/]node_modules[\\/]/,
      name: 'vendors',
      chunks: 'all' as const,
    },
    common: {
      name: 'common',
      minChunks: 2,
      chunks: 'all' as const,
      enforce: true,
    },
  },
};

// =============================================================================
// 🚀 EXPORTS & INSTANCES
// =============================================================================

export const performanceCache = PerformanceCache.getInstance();
export const lazyLoader = new LazyLoader();
export const performanceMonitor = new PerformanceMonitor();

/**
 * 🎬 Initialisation automatique
 */
export function initPerformanceOptimizations(): void {
  if (typeof window !== 'undefined') {
    // Démarrage du monitoring
    performanceMonitor.measureLoadTime();
    performanceMonitor.measureRenderTime();
    performanceMonitor.measureInteractionTime();

    // Nettoyage automatique du cache
    setInterval(() => {
      performanceCache.cleanup();
    }, 300000); // 5 minutes

    // Préchargement des ressources critiques
    preloadCriticalResources();
  }
}

/**
 * 🔄 Préchargement des ressources critiques
 */
function preloadCriticalResources(): void {
  const criticalResources = [
    '/fonts/inter-var.woff2',
    '/images/logo.webp',
    '/images/hero-pizza.webp'
  ];

  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    link.as = resource.includes('.woff') ? 'font' : 'image';
    if (resource.includes('.woff')) {
      link.crossOrigin = 'anonymous';
    }
    document.head.appendChild(link);
  });
}

/**
 * 🎯 Hook React pour les performances
 */
export function usePerformance() {
  return {
    cache: performanceCache,
    lazyLoader,
    monitor: performanceMonitor,
    metrics: performanceMonitor.getMetrics()
  };
}

// =============================================================================
// 📚 DOCUMENTATION D'UTILISATION
// =============================================================================

/*
🚀 GUIDE D'UTILISATION:

1. 💾 Cache:
   performanceCache.set('menu-data', menuData, 3600000);
   const cached = performanceCache.get('menu-data');

2. 🖼️ Lazy Loading:
   <img data-src="/image.jpg" className="lazy" />
   lazyLoader.observe(imageElement);

3. 📊 Monitoring:
   const metrics = performanceMonitor.getMetrics();

4. 🎬 Initialisation:
   import { initPerformanceOptimizations } from '@/lib/performance';
   initPerformanceOptimizations();

5. ⚛️ Hook React:
   const { cache, metrics } = usePerformance();

📈 MÉTRIQUES SURVEILLÉES:
- Temps de chargement initial
- First Contentful Paint (FCP)
- First Input Delay (FID)
- Taux de cache hit/miss
- Erreurs de performance

🎯 OPTIMISATIONS AUTOMATIQUES:
- Cache intelligent avec TTL
- Lazy loading des images/composants
- Code splitting optimisé
- Préchargement des ressources critiques
- Monitoring temps réel
*/