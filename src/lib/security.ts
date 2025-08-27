/**
 * 🔒 Système de Sécurité Avancé O'Miam
 * Protection complète contre les vulnérabilités web
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';

// =============================================================================
// 🛡️ INTERFACES & TYPES
// =============================================================================

export interface SecurityConfig {
  enableCSP: boolean;
  enableRateLimit: boolean;
  enableInputValidation: boolean;
  enableXSSProtection: boolean;
  enableSQLInjectionProtection: boolean;
  maxRequestsPerMinute: number;
  allowedOrigins: string[];
}

export interface ValidationRule {
  field: string;
  type: 'string' | 'number' | 'email' | 'phone' | 'date' | 'custom';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  customValidator?: (value: any) => boolean;
  sanitize?: boolean;
}

export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
  standardHeaders: boolean;
  legacyHeaders: boolean;
}

// =============================================================================
// 🔐 GESTIONNAIRE DE SÉCURITÉ PRINCIPAL
// =============================================================================

export class SecurityManager {
  private static instance: SecurityManager;
  private config: SecurityConfig;
  private rateLimitStore = new Map<string, { count: number; resetTime: number }>();

  private constructor() {
    this.config = {
      enableCSP: true,
      enableRateLimit: true,
      enableInputValidation: true,
      enableXSSProtection: true,
      enableSQLInjectionProtection: true,
      maxRequestsPerMinute: 100,
      allowedOrigins: [
        process.env.NEXT_PUBLIC_APP_URL || 'https://omiam.fr',
        'https://omiam.vercel.app',
        'http://localhost:3000'
      ]
    };
  }

  static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  /**
   * 🛡️ Content Security Policy
   */
  generateCSPHeader(): string {
    const nonce = this.generateNonce();
    
    const cspDirectives = {
      'default-src': ["'self'"],
      'script-src': [
        "'self'",
        "'unsafe-inline'", // Nécessaire pour Next.js en dev
        "'unsafe-eval'", // Nécessaire pour Next.js en dev
        `'nonce-${nonce}'`,
        'https://www.googletagmanager.com',
        'https://www.google-analytics.com',
        'https://connect.facebook.net',
        'https://static.hotjar.com',
        'https://js.stripe.com'
      ],
      'style-src': [
        "'self'",
        "'unsafe-inline'", // Nécessaire pour les styles inline
        'https://fonts.googleapis.com'
      ],
      'img-src': [
        "'self'",
        'data:',
        'blob:',
        'https:',
        'https://www.google-analytics.com',
        'https://www.facebook.com'
      ],
      'font-src': [
        "'self'",
        'https://fonts.gstatic.com'
      ],
      'connect-src': [
        "'self'",
        'https://api.stripe.com',
        'https://www.google-analytics.com',
        'https://vitals.vercel-analytics.com',
        process.env.NEXT_PUBLIC_SUPABASE_URL || ''
      ],
      'frame-src': [
        'https://js.stripe.com',
        'https://www.google.com'
      ],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'frame-ancestors': ["'none'"],
      'upgrade-insecure-requests': []
    };

    return Object.entries(cspDirectives)
      .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
      .join('; ');
  }

  /**
   * 🔑 Génération de nonce sécurisé
   */
  generateNonce(): string {
    return crypto.randomBytes(16).toString('base64');
  }

  /**
   * 🚦 Rate Limiting avancé
   */
  checkRateLimit(identifier: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const key = `rate_limit_${identifier}`;
    const existing = this.rateLimitStore.get(key);

    if (!existing || now > existing.resetTime) {
      // Nouvelle fenêtre ou première requête
      this.rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      });
      return true;
    }

    if (existing.count >= config.max) {
      return false; // Rate limit dépassé
    }

    // Incrémenter le compteur
    existing.count++;
    this.rateLimitStore.set(key, existing);
    return true;
  }

  /**
   * 🧹 Nettoyage périodique du store rate limit
   */
  cleanupRateLimitStore() {
    const now = Date.now();
    for (const [key, value] of this.rateLimitStore.entries()) {
      if (now > value.resetTime) {
        this.rateLimitStore.delete(key);
      }
    }
  }

  /**
   * 🔍 Validation et assainissement des entrées
   */
  validateInput(data: any, rules: ValidationRule[]): { isValid: boolean; errors: string[]; sanitizedData: any } {
    const errors: string[] = [];
    const sanitizedData: any = {};

    for (const rule of rules) {
      const value = data[rule.field];
      
      // Vérification required
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`Le champ ${rule.field} est requis`);
        continue;
      }

      if (value === undefined || value === null || value === '') {
        sanitizedData[rule.field] = value;
        continue;
      }

      // Validation par type
      let sanitizedValue = value;
      
      switch (rule.type) {
        case 'string':
          sanitizedValue = this.sanitizeString(value, rule.sanitize);
          if (rule.minLength && sanitizedValue.length < rule.minLength) {
            errors.push(`${rule.field} doit contenir au moins ${rule.minLength} caractères`);
          }
          if (rule.maxLength && sanitizedValue.length > rule.maxLength) {
            errors.push(`${rule.field} ne peut pas dépasser ${rule.maxLength} caractères`);
          }
          break;

        case 'email':
          sanitizedValue = this.sanitizeEmail(value);
          if (!this.isValidEmail(sanitizedValue)) {
            errors.push(`${rule.field} doit être un email valide`);
          }
          break;

        case 'phone':
          sanitizedValue = this.sanitizePhone(value);
          if (!this.isValidPhone(sanitizedValue)) {
            errors.push(`${rule.field} doit être un numéro de téléphone valide`);
          }
          break;

        case 'number':
          sanitizedValue = this.sanitizeNumber(value);
          if (isNaN(sanitizedValue)) {
            errors.push(`${rule.field} doit être un nombre valide`);
          }
          break;

        case 'date':
          sanitizedValue = this.sanitizeDate(value);
          if (!sanitizedValue) {
            errors.push(`${rule.field} doit être une date valide`);
          }
          break;

        case 'custom':
          if (rule.customValidator && !rule.customValidator(value)) {
            errors.push(`${rule.field} n'est pas valide`);
          }
          break;
      }

      // Validation par pattern
      if (rule.pattern && !rule.pattern.test(sanitizedValue)) {
        errors.push(`${rule.field} ne respecte pas le format requis`);
      }

      sanitizedData[rule.field] = sanitizedValue;
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData
    };
  }

  /**
   * 🧼 Méthodes de sanitisation
   */
  private sanitizeString(value: string, enableSanitization = true): string {
    if (!enableSanitization) return value;
    
    return value
      .replace(/[<>"'&]/g, (match) => {
        const entities: { [key: string]: string } = {
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#x27;',
          '&': '&amp;'
        };
        return entities[match];
      })
      .trim();
  }

  private sanitizeEmail(value: string): string {
    return value.toLowerCase().trim();
  }

  private sanitizePhone(value: string): string {
    return value.replace(/[^+\d\s()-]/g, '').trim();
  }

  private sanitizeNumber(value: any): number {
    return parseFloat(value.toString().replace(/[^\d.-]/g, ''));
  }

  private sanitizeDate(value: string): Date | null {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }

  /**
   * ✅ Méthodes de validation
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^[+]?[\d\s()-]{8,}$/;
    return phoneRegex.test(phone);
  }

  /**
   * 🛡️ Protection XSS
   */
  detectXSS(input: string): boolean {
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /<object[^>]*>.*?<\/object>/gi,
      /<embed[^>]*>/gi,
      /eval\s*\(/gi,
      /expression\s*\(/gi
    ];

    return xssPatterns.some(pattern => pattern.test(input));
  }

  /**
   * 💉 Protection SQL Injection
   */
  detectSQLInjection(input: string): boolean {
    const sqlPatterns = [
      /('|(\-\-)|(;)|(\||\|)|(\*|\*))/gi,
      /(union|select|insert|delete|update|drop|create|alter|exec|execute)/gi,
      /script|javascript|vbscript|onload|onerror|onclick/gi
    ];

    return sqlPatterns.some(pattern => pattern.test(input));
  }

  /**
   * 🔐 Génération de token CSRF
   */
  generateCSRFToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * ✅ Validation token CSRF
   */
  validateCSRFToken(token: string, sessionToken: string): boolean {
    return crypto.timingSafeEqual(
      Buffer.from(token, 'hex'),
      Buffer.from(sessionToken, 'hex')
    );
  }

  /**
   * 🔒 Hashage sécurisé des mots de passe
   */
  async hashPassword(password: string): Promise<string> {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  }

  /**
   * ✅ Vérification mot de passe
   */
  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    const [salt, hash] = hashedPassword.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(verifyHash, 'hex'));
  }
}

// =============================================================================
// 🛡️ MIDDLEWARE DE SÉCURITÉ
// =============================================================================

export function securityMiddleware(request: NextRequest): NextResponse {
  const security = SecurityManager.getInstance();
  const response = NextResponse.next();

  // Headers de sécurité
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Content Security Policy
  if (security.config.enableCSP) {
    response.headers.set('Content-Security-Policy', security.generateCSPHeader());
  }

  // HSTS (HTTPS uniquement)
  if (request.nextUrl.protocol === 'https:') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Rate Limiting
  if (security.config.enableRateLimit) {
    const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitConfig: RateLimitConfig = {
      windowMs: 60 * 1000, // 1 minute
      max: security.config.maxRequestsPerMinute,
      message: 'Trop de requêtes, veuillez réessayer plus tard',
      standardHeaders: true,
      legacyHeaders: false
    };

    if (!security.checkRateLimit(clientIP, rateLimitConfig)) {
      return new NextResponse(JSON.stringify({ error: rateLimitConfig.message }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '60'
        }
      });
    }
  }

  return response;
}

// =============================================================================
// 📋 RÈGLES DE VALIDATION PRÉDÉFINIES
// =============================================================================

export const ValidationRules = {
  // Utilisateur
  user: {
    email: {
      field: 'email',
      type: 'email' as const,
      required: true,
      maxLength: 255,
      sanitize: true
    },
    password: {
      field: 'password',
      type: 'string' as const,
      required: true,
      minLength: 8,
      maxLength: 128,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
    },
    name: {
      field: 'name',
      type: 'string' as const,
      required: true,
      minLength: 2,
      maxLength: 100,
      sanitize: true
    },
    phone: {
      field: 'phone',
      type: 'phone' as const,
      required: false,
      sanitize: true
    }
  },

  // Réservation
  reservation: {
    date: {
      field: 'date',
      type: 'date' as const,
      required: true,
      customValidator: (value: Date) => value > new Date()
    },
    time: {
      field: 'time',
      type: 'string' as const,
      required: true,
      pattern: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    guests: {
      field: 'guests',
      type: 'number' as const,
      required: true,
      customValidator: (value: number) => value >= 1 && value <= 20
    },
    specialRequests: {
      field: 'specialRequests',
      type: 'string' as const,
      required: false,
      maxLength: 500,
      sanitize: true
    }
  },

  // Commande
  order: {
    items: {
      field: 'items',
      type: 'custom' as const,
      required: true,
      customValidator: (value: any[]) => Array.isArray(value) && value.length > 0
    },
    deliveryAddress: {
      field: 'deliveryAddress',
      type: 'string' as const,
      required: true,
      minLength: 10,
      maxLength: 200,
      sanitize: true
    },
    paymentMethod: {
      field: 'paymentMethod',
      type: 'string' as const,
      required: true,
      customValidator: (value: string) => ['card', 'paypal', 'cash'].includes(value)
    }
  }
};

// =============================================================================
// 🚀 HOOK REACT POUR SÉCURITÉ
// =============================================================================

export function useSecurity() {
  const security = SecurityManager.getInstance();

  return {
    validateInput: (data: any, rules: ValidationRule[]) => security.validateInput(data, rules),
    detectXSS: (input: string) => security.detectXSS(input),
    detectSQLInjection: (input: string) => security.detectSQLInjection(input),
    generateCSRFToken: () => security.generateCSRFToken(),
    hashPassword: (password: string) => security.hashPassword(password),
    verifyPassword: (password: string, hash: string) => security.verifyPassword(password, hash)
  };
}

// =============================================================================
// 🧹 NETTOYAGE PÉRIODIQUE
// =============================================================================

if (typeof window === 'undefined') {
  // Côté serveur uniquement
  setInterval(() => {
    SecurityManager.getInstance().cleanupRateLimitStore();
  }, 5 * 60 * 1000); // Toutes les 5 minutes
}

console.log('🔒 Système de Sécurité O\'Miam initialisé');