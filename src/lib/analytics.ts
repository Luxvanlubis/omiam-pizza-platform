/**
 * 📊 Système Analytics Avancé O'Miam
 * Suivi des performances, conversions et comportement utilisateur
 */

// =============================================================================
// 📊 INTERFACES & TYPES
// =============================================================================

export interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
}

export interface ConversionEvent {
  event_name: string;
  currency?: string;
  value?: number;
  transaction_id?: string;
  items?: AnalyticsItem[];
}

export interface AnalyticsItem {
  item_id: string;
  item_name: string;
  category: string;
  quantity: number;
  price: number;
}

export interface UserProperties {
  user_id?: string;
  customer_type?: 'new' | 'returning' | 'vip';
  preferred_cuisine?: string;
  avg_order_value?: number;
  total_orders?: number;
}

export interface PerformanceMetrics {
  page_load_time: number;
  first_contentful_paint: number;
  largest_contentful_paint: number;
  cumulative_layout_shift: number;
  first_input_delay: number;
}

// =============================================================================
// 🎯 GESTIONNAIRE ANALYTICS PRINCIPAL
// =============================================================================

export class AnalyticsManager {
  private static instance: AnalyticsManager;
  private isInitialized = false;
  private debugMode = process.env.NODE_ENV === 'development';
  private queue: AnalyticsEvent[] = [];

  private constructor() {}

  static getInstance(): AnalyticsManager {
    if (!AnalyticsManager.instance) {
      AnalyticsManager.instance = new AnalyticsManager();
    }
    return AnalyticsManager.instance;
  }

  /**
   * 🚀 Initialisation des services analytics
   */
  async initialize() {
    if (this.isInitialized || typeof window === 'undefined') return;

    try {
      // Google Analytics 4
      await this.initializeGA4();
      
      // Google Tag Manager
      await this.initializeGTM();
      
      // Facebook Pixel
      await this.initializeFacebookPixel();
      
      // Hotjar
      await this.initializeHotjar();
      
      // Performance monitoring
      this.initializePerformanceMonitoring();
      
      // Process queued events
      this.processQueue();
      
      this.isInitialized = true;
      this.log('📊 Analytics initialisé avec succès');
      
    } catch (error) {
      console.error('❌ Erreur initialisation analytics:', error);
    }
  }

  /**
   * 📈 Google Analytics 4
   */
  private async initializeGA4() {
    const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
    if (!GA_ID) return;

    // Load gtag script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);

    // Initialize gtag
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).gtag = function() {
      (window as any).dataLayer.push(arguments);
    };

    (window as any).gtag('js', new Date());
    (window as any).gtag('config', GA_ID, {
      page_title: document.title,
      page_location: window.location.href,
      send_page_view: true,
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });

    this.log('✅ Google Analytics 4 initialisé');
  }

  /**
   * 🏷️ Google Tag Manager
   */
  private async initializeGTM() {
    const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
    if (!GTM_ID) return;

    // GTM script
    const script = document.createElement('script');
    script.innerHTML = `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${GTM_ID}');
    `;
    document.head.appendChild(script);

    // GTM noscript
    const noscript = document.createElement('noscript');
    noscript.innerHTML = `
      <iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}"
      height="0" width="0" style="display:none;visibility:hidden"></iframe>
    `;
    document.body.appendChild(noscript);

    this.log('✅ Google Tag Manager initialisé');
  }

  /**
   * 📘 Facebook Pixel
   */
  private async initializeFacebookPixel() {
    const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
    if (!FB_PIXEL_ID) return;

    (window as any).fbq = (window as any).fbq || function() {
      ((window as any).fbq.q = (window as any).fbq.q || []).push(arguments);
    };
    (window as any)._fbq = (window as any).fbq;
    (window as any).fbq.push = (window as any).fbq;
    (window as any).fbq.loaded = true;
    (window as any).fbq.version = '2.0';
    (window as any).fbq.queue = [];

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(script);

    (window as any).fbq('init', FB_PIXEL_ID);
    (window as any).fbq('track', 'PageView');

    this.log('✅ Facebook Pixel initialisé');
  }

  /**
   * 🔥 Hotjar
   */
  private async initializeHotjar() {
    const HOTJAR_ID = process.env.NEXT_PUBLIC_HOTJAR_ID;
    if (!HOTJAR_ID) return;

    (window as any).hj = (window as any).hj || function() {
      ((window as any).hj.q = (window as any).hj.q || []).push(arguments);
    };
    (window as any)._hjSettings = { hjid: parseInt(HOTJAR_ID), hjsv: 6 };

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://static.hotjar.com/c/hotjar-${HOTJAR_ID}.js?sv=6`;
    document.head.appendChild(script);

    this.log('✅ Hotjar initialisé');
  }

  /**
   * ⚡ Monitoring des performances
   */
  private initializePerformanceMonitoring() {
    if (typeof window === 'undefined') return;

    // Web Vitals
    this.measureWebVitals();
    
    // Custom performance metrics
    this.measureCustomMetrics();
    
    // Error tracking
    this.initializeErrorTracking();
  }

  /**
   * 📊 Mesure des Web Vitals
   */
  private measureWebVitals() {
    // First Contentful Paint
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          this.trackEvent({
            action: 'web_vital',
            category: 'performance',
            label: 'first_contentful_paint',
            value: Math.round(entry.startTime)
          });
        }
      }
    }).observe({ entryTypes: ['paint'] });

    // Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.trackEvent({
        action: 'web_vital',
        category: 'performance',
        label: 'largest_contentful_paint',
        value: Math.round(lastEntry.startTime)
      });
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // Cumulative Layout Shift
    let clsValue = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
    }).observe({ entryTypes: ['layout-shift'] });

    // Send CLS on page unload
    window.addEventListener('beforeunload', () => {
      this.trackEvent({
        action: 'web_vital',
        category: 'performance',
        label: 'cumulative_layout_shift',
        value: Math.round(clsValue * 1000)
      });
    });
  }

  /**
   * 🎯 Métriques personnalisées
   */
  private measureCustomMetrics() {
    // Time to Interactive
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const tti = navigation.loadEventEnd - navigation.fetchStart;
        
        this.trackEvent({
          action: 'custom_metric',
          category: 'performance',
          label: 'time_to_interactive',
          value: Math.round(tti)
        });
      }, 0);
    });

    // Page Load Time
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const loadTime = navigation.loadEventEnd - navigation.fetchStart;
      
      this.trackEvent({
        action: 'custom_metric',
        category: 'performance',
        label: 'page_load_time',
        value: Math.round(loadTime)
      });
    });
  }

  /**
   * 🚨 Suivi des erreurs
   */
  private initializeErrorTracking() {
    window.addEventListener('error', (event) => {
      this.trackEvent({
        action: 'javascript_error',
        category: 'error',
        label: event.message,
        custom_parameters: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack
        }
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.trackEvent({
        action: 'unhandled_promise_rejection',
        category: 'error',
        label: event.reason?.message || 'Unknown promise rejection',
        custom_parameters: {
          reason: event.reason
        }
      });
    });
  }

  /**
   * 📈 Suivi d'événement générique
   */
  trackEvent(event: AnalyticsEvent) {
    if (!this.isInitialized) {
      this.queue.push(event);
      return;
    }

    this.log('📊 Événement:', event);

    // Google Analytics
    if ((window as any).gtag) {
      (window as any).gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        ...event.custom_parameters
      });
    }

    // Facebook Pixel
    if ((window as any).fbq) {
      (window as any).fbq('trackCustom', event.action, {
        category: event.category,
        label: event.label,
        value: event.value,
        ...event.custom_parameters
      });
    }

    // Hotjar
    if ((window as any).hj) {
      (window as any).hj('event', event.action);
    }
  }

  /**
   * 💰 Suivi des conversions
   */
  trackConversion(conversion: ConversionEvent) {
    this.log('💰 Conversion:', conversion);

    // Google Analytics Enhanced Ecommerce
    if ((window as any).gtag) {
      (window as any).gtag('event', conversion.event_name, {
        currency: conversion.currency || 'EUR',
        value: conversion.value,
        transaction_id: conversion.transaction_id,
        items: conversion.items
      });
    }

    // Facebook Pixel
    if ((window as any).fbq) {
      (window as any).fbq('track', 'Purchase', {
        currency: conversion.currency || 'EUR',
        value: conversion.value,
        content_ids: conversion.items?.map(item => item.item_id),
        content_type: 'product'
      });
    }
  }

  /**
   * 👤 Propriétés utilisateur
   */
  setUserProperties(properties: UserProperties) {
    this.log('👤 Propriétés utilisateur:', properties);

    if ((window as any).gtag) {
      (window as any).gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
        user_id: properties.user_id,
        custom_map: {
          custom_dimension_1: 'customer_type',
          custom_dimension_2: 'preferred_cuisine'
        }
      });
    }
  }

  /**
   * 📄 Suivi de page
   */
  trackPageView(page: string, title: string) {
    this.log('📄 Page vue:', { page, title });

    if ((window as any).gtag) {
      (window as any).gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
        page_title: title,
        page_location: window.location.href,
        page_path: page
      });
    }

    if ((window as any).fbq) {
      (window as any).fbq('track', 'PageView');
    }
  }

  /**
   * 🔄 Traitement de la queue
   */
  private processQueue() {
    while (this.queue.length > 0) {
      const event = this.queue.shift();
      if (event) {
        this.trackEvent(event);
      }
    }
  }

  /**
   * 🐛 Logging conditionnel
   */
  private log(message: string, data?: any) {
    if (this.debugMode) {
      console.log(message, data);
    }
  }
}

// =============================================================================
// 🎯 ÉVÉNEMENTS PRÉDÉFINIS RESTAURANT
// =============================================================================

export const RestaurantEvents = {
  // Navigation
  viewMenu: () => ({
    action: 'view_menu',
    category: 'navigation',
    label: 'menu_page'
  }),

  viewReservation: () => ({
    action: 'view_reservation',
    category: 'navigation', 
    label: 'reservation_page'
  }),

  // Interactions menu
  viewItem: (itemId: string, itemName: string, category: string) => ({
    action: 'view_item',
    category: 'menu_interaction',
    label: itemName,
    custom_parameters: {
      item_id: itemId,
      item_category: category
    }
  }),

  addToCart: (item: AnalyticsItem) => ({
    action: 'add_to_cart',
    category: 'ecommerce',
    label: item.item_name,
    value: item.price,
    custom_parameters: {
      item_id: item.item_id,
      quantity: item.quantity
    }
  }),

  // Réservations
  startReservation: () => ({
    action: 'begin_reservation',
    category: 'reservation',
    label: 'reservation_form'
  }),

  completeReservation: (guests: number, date: string) => ({
    action: 'complete_reservation',
    category: 'reservation',
    label: 'reservation_confirmed',
    value: guests,
    custom_parameters: {
      reservation_date: date,
      party_size: guests
    }
  }),

  // Commandes
  beginCheckout: (value: number, items: AnalyticsItem[]) => ({
    action: 'begin_checkout',
    category: 'ecommerce',
    label: 'checkout_started',
    value,
    custom_parameters: {
      items,
      item_count: items.length
    }
  }),

  purchase: (transactionId: string, value: number, items: AnalyticsItem[]): ConversionEvent => ({
    event_name: 'purchase',
    currency: 'EUR',
    value,
    transaction_id: transactionId,
    items
  }),

  // Engagement
  shareItem: (itemId: string, method: string) => ({
    action: 'share',
    category: 'engagement',
    label: itemId,
    custom_parameters: {
      method,
      content_type: 'menu_item'
    }
  }),

  searchMenu: (searchTerm: string) => ({
    action: 'search',
    category: 'menu_interaction',
    label: searchTerm,
    custom_parameters: {
      search_term: searchTerm
    }
  })
};

// =============================================================================
// 🚀 HOOK REACT POUR ANALYTICS
// =============================================================================

export function useAnalytics() {
  const analytics = AnalyticsManager.getInstance();

  return {
    trackEvent: (event: AnalyticsEvent) => analytics.trackEvent(event),
    trackConversion: (conversion: ConversionEvent) => analytics.trackConversion(conversion),
    trackPageView: (page: string, title: string) => analytics.trackPageView(page, title),
    setUserProperties: (properties: UserProperties) => analytics.setUserProperties(properties)
  };
}

// =============================================================================
// 🎯 INITIALISATION AUTOMATIQUE
// =============================================================================

if (typeof window !== 'undefined') {
  const analytics = AnalyticsManager.getInstance();
  
  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => analytics.initialize());
  } else {
    analytics.initialize();
  }
}

console.log('📊 Système Analytics O\'Miam chargé');