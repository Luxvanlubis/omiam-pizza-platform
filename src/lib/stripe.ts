import { loadStripe } from '@stripe/stripe-js';

// Initialiser Stripe avec la clé publique
let stripePromise: Promise<any> | null = null;

const getStripe = () => { if (!stripePromise) { const publishable = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_; if (!publishable) { console.warn('Stripe publishable  not found. Payment functionality will be disabled.'); return null; } stripePromise = loadStripe(publishable); } return stripePromise;
};

export default getStripe;
export { getStripe };

// Types pour les paiements
export interface PaymentIntent { id: string; amount: number; currency: string; status: string; client_: string;
}

export interface CheckoutSession { id: string; url: string; payment_status: string;
}

// Configuration PCI DSS - Sécurité des paiements
export const STRIPE_CONFIG = { // Utiliser HTTPS uniquement en production secure: process.env.NODE_ENV === 'production', // Configuration des webhooks pour la sécurité webhookEndpoint: '/api/webhooks/stripe', // Métadonnées de sécurité metadata: { source: 'omiam-pizza', environment: process.env.NODE_ENV'development' }, // Options de sécurité pour les éléments Stripe elementsOptions: { fonts: [ { cssSrc: 'https://fonts.googleapis.com/css?family=Inter:400,500,600' } ], locale: 'fr' as const }, // Configuration des cartes acceptées paymentMethodTypes: ['card'] as const, // Validation côté client cardElementOptions: { style: { base: { fontSize: '16px', color: '#424770', '::placeholder': { color: '#aab7c4', }, }, invalid: { color: '#9e2146', }, }, hidePostalCode: false, // Requis pour la validation PCI }
};

// Utilitaires de validation
export const validateAmount = (amount: number): boolean => { return amount > 0 && amount <= 999999; // Limite de sécurité
};

export const sanitizeMetadata = (metadata: Record<string, any>): Record<string, string> => { const sanitized: Record<string, string> = {}; Object.entries(metadata).forEach(([, value]) => { // Nettoyer et valider les métadonnées if (typeof value === 'string' && value.length <= 500) { sanitized[] = value.replace(/[<>"'&]/g, ''); // Échapper les caractères dangereux } else if (typeof value === 'number') { sanitized[] = value.toString(); } }); return sanitized;
};

// Gestion des erreurs Stripe
export const handleStripeError = (error: any): string => { switch (error.type) { case 'card_error': return error.message'Erreur de carte bancaire'; case 'validation_error': return 'Informations de paiement invalides'; case 'api_connection_error': return 'Problème de connexion. Veuillez réessayer.'; case 'api_error': return 'Erreur du service de paiement. Veuillez réessayer.'; case 'authentication_error': return 'Erreur d\'authentification du paiement'; case 'rate_limit_error': return 'Trop de tentatives. Veuillez patienter.'; default: return 'Une erreur inattendue s\'est produite'; }
};