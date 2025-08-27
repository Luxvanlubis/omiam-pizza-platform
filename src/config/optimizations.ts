/**
 * 🚀 Configuration Centralisée des Optimisations O'Miam
 * Gestion unifiée de toutes les optimisations et configurations
 */

// =============================================================================
// 🎯 TYPES & INTERFACES
// =============================================================================

export interface OptimizationFeatures {
  // Performance
  lazyLoading: boolean;
  codesplitting: boolean;
  imageCaching: boolean;
  preloading: boolean;
  compression: boolean;
  minification: boolean;
  
  // Analytics
  googleAnalytics: boolean;
  googleTagManager: boolean;
  facebookPixel: boolean;
  hotjar: boolean;
  performanceTracking: boolean;
  errorTracking: boolean;
  
  // Sécurité
  contentSecurityPolicy: boolean;
  rateLimit: boolean;
  inputValidation: boolean;
  xssProtection: boolean;
  csrfProtection: boolean;
  sqlInjectionProtection: boolean;
  
  // Accessibilité
  wcagCompliance: boolean;
  keyboardNavigation: boolean;
  screenReaderSupport: boolean;
  highContrastMode: boolean;
  textScaling: boolean;
  reducedMotion: boolean;
  
  // SEO
  structuredData: boolean;
  openGraph: boolean;
  twitterCards: boolean;
  sitemap: boolean;
  robotsTxt: boolean;
  canonicalUrls: boolean;
  
  // PWA
  serviceWorker: boolean;
  pushNotifications: boolean;
  offlineMode: boolean;
  installPrompt: boolean;
  backgroundSync: boolean;
  
  // Internationalisation
  multiLanguage: boolean;
  rtlSupport: boolean;
  currencyLocalization: boolean;
  dateTimeLocalization: boolean;
}

export interface EnvironmentConfig {
  // Application
  appName: string;
  appUrl: string;
  appVersion: string;
  environment: 'development' | 'staging' | 'production';
  
  // Base de données
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceKey?: string;
  
  // Authentification
  nextAuthUrl: string;
  nextAuthSecret: string;
  googleClientId?: string;
  googleClientSecret?: string;
  facebookAppId?: string;
  facebookAppSecret?: string;
  
  // Paiements
  stripePublishableKey: string;
  stripeSecretKey?: string;
  stripeWebhookSecret?: string;
  
  // Analytics
  ga4MeasurementId?: string;
  gtmId?: string;
  facebookPixelId?: string;
  hotjarId?: string;
  
  // Email
  emailProvider: 'resend' | 'sendgrid' | 'mailgun';
  emailApiKey?: string;
  emailFromAddress: string;
  
  // Stockage
  uploadProvider: 'supabase' | 'cloudinary' | 's3';
  uploadApiKey?: string;
  uploadCloudName?: string;
  
  // Restaurant
  restaurantName: string;
  restaurantAddress: string;
  restaurantPhone: string;
  restaurantEmail: string;
  
  // Sécurité
  encryptionKey?: string;
  jwtSecret?: string;
  corsOrigins: string[];
}

export interface PerformanceThresholds {
  // Core Web Vitals
  lcp: { good: number; needsImprovement: number };
  fid: { good: number; needsImprovement: number };
  cls: { good: number; needsImprovement: number };
  
  // Autres métriques
  ttfb: { good: number; needsImprovement: number };
  fcp: { good: number; needsImprovement: number };
  
  // Limites de ressources
  maxBundleSize: number;
  maxImageSize: number;
  maxApiResponseTime: number;
}

// =============================================================================
// 🎯 CONFIGURATION PAR ENVIRONNEMENT
// =============================================================================

export const OPTIMIZATION_FEATURES: Record<string, OptimizationFeatures> = {
  development: {
    // Performance - Activé mais moins agressif
    lazyLoading: true,
    codesplitting: true,
    imageCaching: false,
    preloading: false,
    compression: false,
    minification: false,
    
    // Analytics - Désactivé en développement
    googleAnalytics: false,
    googleTagManager: false,
    facebookPixel: false,
    hotjar: false,
    performanceTracking: true,
    errorTracking: true,
    
    // Sécurité - Activé mais moins strict
    contentSecurityPolicy: false,
    rateLimit: false,
    inputValidation: true,
    xssProtection: true,
    csrfProtection: true,
    sqlInjectionProtection: true,
    
    // Accessibilité - Toujours activé
    wcagCompliance: true,
    keyboardNavigation: true,
    screenReaderSupport: true,
    highContrastMode: true,
    textScaling: true,
    reducedMotion: true,
    
    // SEO - Activé pour les tests
    structuredData: true,
    openGraph: true,
    twitterCards: true,
    sitemap: false,
    robotsTxt: false,
    canonicalUrls: true,
    
    // PWA - Activé pour les tests
    serviceWorker: true,
    pushNotifications: false,
    offlineMode: true,
    installPrompt: false,
    backgroundSync: false,
    
    // Internationalisation
    multiLanguage: true,
    rtlSupport: false,
    currencyLocalization: true,
    dateTimeLocalization: true,
  },
  
  staging: {
    // Performance - Activé mais monitoring renforcé
    lazyLoading: true,
    codesplitting: true,
    imageCaching: true,
    preloading: true,
    compression: true,
    minification: true,
    
    // Analytics - Activé avec des IDs de test
    googleAnalytics: true,
    googleTagManager: true,
    facebookPixel: false,
    hotjar: true,
    performanceTracking: true,
    errorTracking: true,
    
    // Sécurité - Activé complètement
    contentSecurityPolicy: true,
    rateLimit: true,
    inputValidation: true,
    xssProtection: true,
    csrfProtection: true,
    sqlInjectionProtection: true,
    
    // Accessibilité - Toujours activé
    wcagCompliance: true,
    keyboardNavigation: true,
    screenReaderSupport: true,
    highContrastMode: true,
    textScaling: true,
    reducedMotion: true,
    
    // SEO - Activé complètement
    structuredData: true,
    openGraph: true,
    twitterCards: true,
    sitemap: true,
    robotsTxt: true,
    canonicalUrls: true,
    
    // PWA - Activé complètement
    serviceWorker: true,
    pushNotifications: true,
    offlineMode: true,
    installPrompt: true,
    backgroundSync: true,
    
    // Internationalisation
    multiLanguage: true,
    rtlSupport: true,
    currencyLocalization: true,
    dateTimeLocalization: true,
  },
  
  production: {
    // Performance - Optimisation maximale
    lazyLoading: true,
    codesplitting: true,
    imageCaching: true,
    preloading: true,
    compression: true,
    minification: true,
    
    // Analytics - Activé complètement
    googleAnalytics: true,
    googleTagManager: true,
    facebookPixel: true,
    hotjar: true,
    performanceTracking: true,
    errorTracking: true,
    
    // Sécurité - Sécurité maximale
    contentSecurityPolicy: true,
    rateLimit: true,
    inputValidation: true,
    xssProtection: true,
    csrfProtection: true,
    sqlInjectionProtection: true,
    
    // Accessibilité - Toujours activé
    wcagCompliance: true,
    keyboardNavigation: true,
    screenReaderSupport: true,
    highContrastMode: true,
    textScaling: true,
    reducedMotion: true,
    
    // SEO - Optimisation maximale
    structuredData: true,
    openGraph: true,
    twitterCards: true,
    sitemap: true,
    robotsTxt: true,
    canonicalUrls: true,
    
    // PWA - Fonctionnalités complètes
    serviceWorker: true,
    pushNotifications: true,
    offlineMode: true,
    installPrompt: true,
    backgroundSync: true,
    
    // Internationalisation
    multiLanguage: true,
    rtlSupport: true,
    currencyLocalization: true,
    dateTimeLocalization: true,
  },
};

// =============================================================================
// 🎯 SEUILS DE PERFORMANCE
// =============================================================================

export const PERFORMANCE_THRESHOLDS: PerformanceThresholds = {
  // Core Web Vitals (en millisecondes)
  lcp: { good: 2500, needsImprovement: 4000 },
  fid: { good: 100, needsImprovement: 300 },
  cls: { good: 0.1, needsImprovement: 0.25 },
  
  // Autres métriques
  ttfb: { good: 800, needsImprovement: 1800 },
  fcp: { good: 1800, needsImprovement: 3000 },
  
  // Limites de ressources
  maxBundleSize: 250 * 1024, // 250KB
  maxImageSize: 500 * 1024,  // 500KB
  maxApiResponseTime: 2000,   // 2 secondes
};

// =============================================================================
// 🎯 CONFIGURATION ENVIRONNEMENT
// =============================================================================

export function getEnvironmentConfig(): EnvironmentConfig {
  const env = process.env.NODE_ENV as 'development' | 'staging' | 'production';
  
  return {
    // Application
    appName: process.env.NEXT_PUBLIC_APP_NAME || "O'Miam",
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    environment: env || 'development',
    
    // Base de données
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    
    // Authentification
    nextAuthUrl: process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    nextAuthSecret: process.env.NEXTAUTH_SECRET || 'dev-secret-key',
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    facebookAppId: process.env.FACEBOOK_APP_ID,
    facebookAppSecret: process.env.FACEBOOK_APP_SECRET,
    
    // Paiements
    stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    
    // Analytics
    ga4MeasurementId: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID,
    gtmId: process.env.NEXT_PUBLIC_GTM_ID,
    facebookPixelId: process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID,
    hotjarId: process.env.NEXT_PUBLIC_HOTJAR_ID,
    
    // Email
    emailProvider: (process.env.EMAIL_PROVIDER as 'resend' | 'sendgrid' | 'mailgun') || 'resend',
    emailApiKey: process.env.EMAIL_API_KEY,
    emailFromAddress: process.env.EMAIL_FROM_ADDRESS || 'noreply@omiam.fr',
    
    // Stockage
    uploadProvider: (process.env.UPLOAD_PROVIDER as 'supabase' | 'cloudinary' | 's3') || 'supabase',
    uploadApiKey: process.env.UPLOAD_API_KEY,
    uploadCloudName: process.env.UPLOAD_CLOUD_NAME,
    
    // Restaurant
    restaurantName: process.env.NEXT_PUBLIC_RESTAURANT_NAME || "O'Miam",
    restaurantAddress: process.env.NEXT_PUBLIC_RESTAURANT_ADDRESS || '123 Rue de la Gastronomie, 75001 Paris',
    restaurantPhone: process.env.NEXT_PUBLIC_RESTAURANT_PHONE || '+33 1 23 45 67 89',
    restaurantEmail: process.env.NEXT_PUBLIC_RESTAURANT_EMAIL || 'contact@omiam.fr',
    
    // Sécurité
    encryptionKey: process.env.ENCRYPTION_KEY,
    jwtSecret: process.env.JWT_SECRET,
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  };
}

// =============================================================================
// 🎯 FONCTIONS UTILITAIRES
// =============================================================================

/**
 * Obtient les fonctionnalités d'optimisation pour l'environnement actuel
 */
export function getCurrentOptimizationFeatures(): OptimizationFeatures {
  const env = process.env.NODE_ENV || 'development';
  return OPTIMIZATION_FEATURES[env] || OPTIMIZATION_FEATURES.development;
}

/**
 * Vérifie si une fonctionnalité est activée
 */
export function isFeatureEnabled(feature: keyof OptimizationFeatures): boolean {
  const features = getCurrentOptimizationFeatures();
  return features[feature];
}

/**
 * Obtient la configuration complète pour l'environnement actuel
 */
export function getOptimizationConfig() {
  return {
    features: getCurrentOptimizationFeatures(),
    environment: getEnvironmentConfig(),
    thresholds: PERFORMANCE_THRESHOLDS,
  };
}

/**
 * Valide la configuration environnement
 */
export function validateEnvironmentConfig(): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const config = getEnvironmentConfig();
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Vérifications critiques
  if (!config.supabaseUrl) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL est requis');
  }
  if (!config.supabaseAnonKey) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY est requis');
  }
  if (!config.nextAuthSecret || config.nextAuthSecret === 'dev-secret-key') {
    if (config.environment === 'production') {
      errors.push('NEXTAUTH_SECRET doit être défini en production');
    } else {
      warnings.push('NEXTAUTH_SECRET utilise une valeur par défaut');
    }
  }
  
  // Vérifications de production
  if (config.environment === 'production') {
    if (!config.stripeSecretKey) {
      errors.push('STRIPE_SECRET_KEY est requis en production');
    }
    if (!config.ga4MeasurementId) {
      warnings.push('GA4_MEASUREMENT_ID recommandé en production');
    }
    if (!config.emailApiKey) {
      warnings.push('EMAIL_API_KEY recommandé en production');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Génère un rapport de configuration
 */
export function generateConfigReport(): string {
  const config = getOptimizationConfig();
  const validation = validateEnvironmentConfig();
  
  const enabledFeatures = Object.entries(config.features)
    .filter(([, enabled]) => enabled)
    .map(([feature]) => feature);
  
  return `
🚀 Rapport de Configuration O'Miam
=====================================

📊 Environnement: ${config.environment.environment}
📱 Application: ${config.environment.appName} v${config.environment.appVersion}
🌐 URL: ${config.environment.appUrl}

✅ Fonctionnalités Activées (${enabledFeatures.length}):
${enabledFeatures.map(f => `   • ${f}`).join('\n')}

${validation.errors.length > 0 ? `❌ Erreurs (${validation.errors.length}):
${validation.errors.map(e => `   • ${e}`).join('\n')}\n` : ''}
${validation.warnings.length > 0 ? `⚠️  Avertissements (${validation.warnings.length}):
${validation.warnings.map(w => `   • ${w}`).join('\n')}\n` : ''}
${validation.isValid ? '✅ Configuration valide' : '❌ Configuration invalide'}

📈 Seuils de Performance:
   • LCP: ${config.thresholds.lcp.good}ms (bon) / ${config.thresholds.lcp.needsImprovement}ms (à améliorer)
   • FID: ${config.thresholds.fid.good}ms (bon) / ${config.thresholds.fid.needsImprovement}ms (à améliorer)
   • CLS: ${config.thresholds.cls.good} (bon) / ${config.thresholds.cls.needsImprovement} (à améliorer)

🔧 Bundle Max: ${Math.round(config.thresholds.maxBundleSize / 1024)}KB
🖼️  Image Max: ${Math.round(config.thresholds.maxImageSize / 1024)}KB
⏱️  API Max: ${config.thresholds.maxApiResponseTime}ms
`;
}

// =============================================================================
// 🎯 EXPORT PAR DÉFAUT
// =============================================================================

export default {
  features: getCurrentOptimizationFeatures(),
  environment: getEnvironmentConfig(),
  thresholds: PERFORMANCE_THRESHOLDS,
  isFeatureEnabled,
  validateEnvironmentConfig,
  generateConfigReport,
};

console.log('🚀 Configuration des optimisations O\'Miam chargée');
console.log(generateConfigReport());