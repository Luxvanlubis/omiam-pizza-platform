/**
 * 🔐 Utilitaires de sécurité des mots de passe
 * Conforme aux standards PCI DSS
 */

import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxAge: number; // en jours
}

const DEFAULT_POLICY: PasswordPolicy = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxAge: 90
};

/**
 * Valide un mot de passe selon la politique de sécurité
 */
export function validatePassword(
  password: string,
  policy: PasswordPolicy = DEFAULT_POLICY
): {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
} {
  const errors: string[] = [];

  if (password.length < policy.minLength) {
    errors.push(`Le mot de passe doit contenir au moins ${policy.minLength} caractères`);
  }

  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule');
  }

  if (policy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule');
  }

  if (policy.requireNumbers && !/\d/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }

  if (policy.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un caractère spécial');
  }

  // Vérifier les patterns communs faibles
  const weakPatterns = [
    /password/i,
    /123456/i,
    /admin/i,
    /qwerty/i,
    /(.)\1{2,}/ // Caractères répétés
  ];

  weakPatterns.forEach(pattern => {
    if (pattern.test(password)) {
      errors.push('Le mot de passe contient un pattern faible ou commun');
    }
  });

  const strength = calculateStrength(password);

  return {
    isValid: errors.length === 0,
    errors,
    strength
  };
}

/**
 * Calcule la force d'un mot de passe
 */
function calculateStrength(password: string): 'weak' | 'medium' | 'strong' | 'very-strong' {
  let score = 0;

  // Longueur
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  // Complexité
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^\w\s]/.test(password)) score += 1;

  // Diversité
  const uniqueChars = new Set(password).size;
  if (uniqueChars >= password.length * 0.7) score += 1;

  if (score <= 3) return 'weak';
  if (score <= 5) return 'medium';
  if (score <= 7) return 'strong';
  return 'very-strong';
}

/**
 * Hash sécurisé d'un mot de passe
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12; // Coût élevé pour la sécurité
  return bcrypt.hash(password, saltRounds);
}

/**
 * Vérification d'un mot de passe
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Génère un mot de passe sécurisé
 */
export function generateSecurePassword(length: number = 16): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  let password = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, charset.length);
    password += charset[randomIndex];
  }

  return password;
}

/**
 * Vérifie si un mot de passe a expiré
 */
export function isPasswordExpired(lastChanged: Date, policy: PasswordPolicy = DEFAULT_POLICY): boolean {
  const now = new Date();
  const daysSinceChange = Math.floor((now.getTime() - lastChanged.getTime()) / (1000 * 60 * 60 * 24));
  return daysSinceChange > policy.maxAge;
}

/**
 * Génère un token de réinitialisation sécurisé
 */
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Vérifie la complexité d'un mot de passe en temps réel
 */
export function getPasswordComplexity(password: string): {
  score: number;
  feedback: string[];
  color: 'red' | 'orange' | 'yellow' | 'green';
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length < 8) {
    feedback.push('Trop court (minimum 8 caractères)');
  } else if (password.length < 12) {
    feedback.push('Longueur acceptable, mais 12+ caractères recommandés');
    score += 1;
  } else {
    score += 2;
  }

  if (!/[a-z]/.test(password)) {
    feedback.push('Ajoutez des minuscules');
  } else {
    score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    feedback.push('Ajoutez des majuscules');
  } else {
    score += 1;
  }

  if (!/\d/.test(password)) {
    feedback.push('Ajoutez des chiffres');
  } else {
    score += 1;
  }

  if (!/[^\w\s]/.test(password)) {
    feedback.push('Ajoutez des caractères spéciaux');
  } else {
    score += 1;
  }

  let color: 'red' | 'orange' | 'yellow' | 'green' = 'red';
  if (score >= 6) color = 'green';
  else if (score >= 4) color = 'yellow';
  else if (score >= 2) color = 'orange';

  return { score, feedback, color };
}
