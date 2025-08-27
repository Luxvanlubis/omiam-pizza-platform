/**
 * 🛡️ Gestionnaire d'erreurs sécurisé
 * Évite l'exposition d'informations sensibles
 */

export interface SecureError {
  message: string;
  code: string;
  timestamp: Date;
  requestId?: string;
}

/**
 * Sanitise une erreur pour l'affichage public
 */
export function sanitizeError(error: Error, isDevelopment: boolean = false): SecureError {
  const secureError: SecureError = {
    message: 'Une erreur interne s\'est produite',
    code: 'INTERNAL_ERROR',
    timestamp: new Date()
  };

  // En développement, on peut être plus verbeux
  if (isDevelopment) {
    secureError.message = error.message;
  }

  // Codes d'erreur spécifiques sans exposition de détails
  if (error.message.includes('validation')) {
    secureError.code = 'VALIDATION_ERROR';
    secureError.message = 'Données invalides';
  } else if (error.message.includes('authentication')) {
    secureError.code = 'AUTH_ERROR';
    secureError.message = 'Authentification requise';
  } else if (error.message.includes('authorization')) {
    secureError.code = 'AUTHZ_ERROR';
    secureError.message = 'Accès non autorisé';
  }

  return secureError;
}

/**
 * Log sécurisé des erreurs
 */
export function logSecureError(error: Error, context?: Record<string, any>) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: 'ERROR',
    message: error.message,
    stack: error.stack,
    context: context ? sanitizeContext(context) : undefined
  };

  // En production, utiliser un service de logging sécurisé
  if (process.env.NODE_ENV === 'production') {
    // TODO: Intégrer avec un service de logging (ex: Winston, Sentry)
    console.error(JSON.stringify(logEntry));
  } else {
    console.error('🚨 Erreur:', logEntry);
  }
}

/**
 * Sanitise le contexte pour éviter l'exposition de données sensibles
 */
function sanitizeContext(context: Record<string, any>): Record<string, any> {
  const sensitives = ['password', 'token', 'secret', 'key', 'auth', 'credential'];
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(context)) {
    const lower = key.toLowerCase();
    const isSensitive = sensitives.some(sensitive => lower.includes(sensitive));

    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeContext(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
