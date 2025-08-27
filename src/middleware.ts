/**
 * 🚀 Middleware Next.js O'Miam
 * Intégration complète : Sécurité, Performance, Analytics, PWA
 */

import { NextRequest, NextResponse } from 'next/server';

// =============================================================================
// 🛡️ CONFIGURATION DU MIDDLEWARE
// =============================================================================

const STATIC_EXTENSIONS = [
  '.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot'
];

const API_ROUTES = [
  '/api/',
  '/auth/',
  '/_next/',
  '/favicon.ico'
];

const PROTECTED_ROUTES = [
  '/admin',
  '/dashboard',
  '/profile',
  '/orders',
  '/reservations'
];

// Configuration simplifiée du middleware O'Miam
const config = {
  security: {
    enableCSP: true,
    enableSecurityHeaders: true,
  },
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'en'],
  },
};

// Génération de nonce sécurisé pour CSP (compatible edge runtime)
function generateNonce(): string {
  const array = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    // Fallback pour les environnements sans crypto
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return btoa(String.fromCharCode(...array));
}

// =============================================================================
// 🚀 MIDDLEWARE PRINCIPAL
// =============================================================================

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // 🔍 Skip middleware pour les fichiers statiques
  if (STATIC_EXTENSIONS.some(ext => pathname.endsWith(ext))) {
    return response;
  }

  try {
    
    
    // 1. Gestion des redirections (doit être en premier)
    const redirectResponse = handleRedirections(request);
    if (redirectResponse) return redirectResponse;
    
    // 2. Authentification
    const authResponse = handleAuth(request, NextResponse.next());
    if (authResponse && authResponse.status !== 200) return authResponse;
    
    // 3. Créer la réponse de base
    let response = NextResponse.next();
    
    // 4. Appliquer tous les middlewares
    response = handleSecurity(request, response);
    response = handleAnalytics(request, response);
    response = handlePerformance(request, response);
    response = handlePWA(request, response);
    response = handleI18n(request, response);
    response = handleSEO(request, response);
    response = handleAccessibility(request, response);
    response = handleDeviceDetection(request, response);
    
    // 5. Headers finaux
    response.headers.set('X-Middleware-Version', '2.0.0');
    response.headers.set('X-Powered-By', 'O\'Miam Optimization Suite');
    
    return response;
    
  } catch (error) {
    console.error('Erreur dans le middleware:', error);
    return NextResponse.next();
  }
}

// =============================================================================
// 🛡️ MIDDLEWARE DE SÉCURITÉ
// =============================================================================

// Middleware de sécurité simplifié
function handleSecurity(request: NextRequest, response: NextResponse) {
  if (!config.security.enableSecurityHeaders) return response;

  // Content Security Policy
  if (config.security.enableCSP) {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://js.stripe.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://api.stripe.com https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com https://vitals.vercel-insights.com",
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join('; ');
    
    response.headers.set('Content-Security-Policy', csp);
  }

  // Headers de sécurité
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // HSTS pour HTTPS
  if (request.nextUrl.protocol === 'https:') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  return response;
}

// =============================================================================
// 📊 ANALYTICS & TRACKING
// =============================================================================

// Middleware d'analytics simplifié
function handleAnalytics(request: NextRequest, response: NextResponse) {
  try {
    // Headers pour le tracking
    response.headers.set('X-Analytics-Enabled', 'true');
    
    // Log simple des métriques
    console.log('📊 Analytics:', {
      path: request.nextUrl.pathname,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Erreur dans le middleware analytics:', error);
  }

  return response;
}

// =============================================================================
// ⚡ PERFORMANCE & CACHE
// =============================================================================

// Middleware de performance simplifié
function handlePerformance(request: NextRequest, response: NextResponse) {
  try {
    // Headers de cache pour les ressources statiques
    const pathname = request.nextUrl.pathname;
    
    if (pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)) {
      response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (pathname.startsWith('/api/')) {
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else {
      response.headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
    }

    // Headers de performance
    response.headers.set('X-Performance-Optimized', 'true');
    
  } catch (error) {
    console.error('Erreur dans le middleware performance:', error);
  }

  return response;
}

// =============================================================================
// 🌐 PWA & SERVICE WORKER
// =============================================================================

// Middleware PWA simplifié
function handlePWA(request: NextRequest, response: NextResponse) {
  try {
    const pathname = request.nextUrl.pathname;
    
    // Headers PWA
    if (pathname === '/') {
      response.headers.set('X-PWA-Enabled', 'true');
      response.headers.set('X-Service-Worker', '/sw.js');
    }
    
    // Headers pour le service worker
    if (pathname === '/sw.js') {
      response.headers.set('Content-Type', 'application/javascript');
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      response.headers.set('Service-Worker-Allowed', '/');
    }
    
  } catch (error) {
    console.error('Erreur dans le middleware PWA:', error);
  }

  return response;
}

// =============================================================================
// 🔐 AUTHENTIFICATION
// =============================================================================

// Middleware d'authentification simplifié
function handleAuth(request: NextRequest, response: NextResponse) {
  try {
    const pathname = request.nextUrl.pathname;
    
    // Routes protégées
    const protectedRoutes = ['/admin', '/dashboard', '/profile', '/orders'];
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    
    if (isProtectedRoute) {
      // Vérifier la session (simplifié pour l'edge runtime)
      const sessionCookie = request.cookies.get('sb-access-token');
      
      if (!sessionCookie) {
        // Rediriger vers la page de connexion
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('redirectTo', pathname);
        return NextResponse.redirect(loginUrl);
      }
    }
    
  } catch (error) {
    console.error('Erreur dans le middleware auth:', error);
  }

  return response;
}

// =============================================================================
// 🌍 INTERNATIONALISATION
// =============================================================================

// Middleware d'internationalisation simplifié
function handleI18n(request: NextRequest, response: NextResponse) {
  try {
    const locale = request.cookies.get('locale')?.value || config.i18n.defaultLocale;
    
    // Ajouter les headers de langue
    response.headers.set('Content-Language', locale);
    response.headers.set('X-Locale', locale);
    
  } catch (error) {
    console.error('Erreur dans le middleware i18n:', error);
  }

  return response;
}

// =============================================================================
// 🎯 SEO & MÉTADONNÉES
// =============================================================================

// Middleware SEO simplifié
function handleSEO(request: NextRequest, response: NextResponse) {
  try {
    const pathname = request.nextUrl.pathname;
    
    // Headers SEO
    response.headers.set('X-Robots-Tag', 'index, follow');
    
    // Canonical URL
    const canonicalUrl = new URL(pathname, request.url).toString();
    response.headers.set('X-Canonical-URL', canonicalUrl);
    
    // Sitemap hint
    if (pathname === '/') {
      response.headers.set('X-Sitemap', '/sitemap.xml');
    }
    
  } catch (error) {
    console.error('Erreur dans le middleware SEO:', error);
  }

  return response;
}

// =============================================================================
// ♿ ACCESSIBILITÉ
// =============================================================================

// Middleware d'accessibilité simplifié
function handleAccessibility(request: NextRequest, response: NextResponse) {
  try {
    // Headers d'accessibilité
    response.headers.set('X-Accessibility-Enabled', 'true');
    response.headers.set('X-WCAG-Level', 'AA');
    
    // Support des préférences utilisateur
    const prefersReducedMotion = request.headers.get('sec-ch-prefers-reduced-motion');
    if (prefersReducedMotion) {
      response.headers.set('X-Reduced-Motion', prefersReducedMotion);
    }
    
  } catch (error) {
    console.error('Erreur dans le middleware accessibilité:', error);
  }

  return response;
}

// =============================================================================
// 📱 DEVICE DETECTION
// =============================================================================

// Middleware de détection d'appareil simplifié
function handleDeviceDetection(request: NextRequest, response: NextResponse) {
  try {
    const userAgent = request.headers.get('user-agent') || '';
    
    // Détection basique d'appareil
    const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
    const isTablet = /iPad|Android.*Tablet/.test(userAgent);
    
    // Headers de détection d'appareil
    response.headers.set('X-Device-Type', isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop');
    response.headers.set('X-Is-Mobile', isMobile.toString());
    
  } catch (error) {
    console.error('Erreur dans le middleware device detection:', error);
  }

  return response;
}

// =============================================================================
// 🔄 REDIRECTIONS & REWRITES
// =============================================================================

// Middleware de redirections simplifié
function handleRedirections(request: NextRequest) {
  try {
    const pathname = request.nextUrl.pathname;
    
    // Redirections personnalisées
    const redirects: Record<string, string> = {
      '/old-menu': '/menu',
      '/old-contact': '/contact',
      '/pizza': '/menu',
      '/commande': '/menu',
    };
    
    if (redirects[pathname]) {
      return NextResponse.redirect(new URL(redirects[pathname], request.url), 301);
    }
    
    // Redirection trailing slash
    if (pathname.endsWith('/') && pathname !== '/') {
      return NextResponse.redirect(new URL(pathname.slice(0, -1), request.url), 301);
    }
    
  } catch (error) {
    console.error('Erreur dans le middleware redirections:', error);
  }

  return null;
}

export const config = {
  matcher: [
    /*
     * Matcher pour toutes les routes sauf :
     * - API routes internes Next.js (_next)
     * - Fichiers statiques (avec extensions)
     * - Favicon
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$).*)',
  ],
};

console.log('🚀 Middleware O\'Miam initialisé avec toutes les optimisations');
