import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { sanitizeMetadata, validateAmount } from '@/lib/stripe';

// Initialiser Stripe avec la clé secrète
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
});

// Interface pour les données de commande
interface OrderData {
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  customerInfo: {
    email: string;
    name: string;
    phone?: string;
  };
  deliveryInfo?: {
    address: string;
    city: string;
    postalCode: string;
  };
  orderType: 'dine-in' | 'takeaway' | 'delivery';
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier que Stripe est configuré
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Configuration de paiement manquante' },
        { status: 500 }
      );
    }

    const body: OrderData = await request.json();

    // Validation des données d'entrée
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: 'Aucun article dans la commande' },
        { status: 400 }
      );
    }

    if (!body.customerInfo || !body.customerInfo.email) {
      return NextResponse.json(
        { error: 'Informations client manquantes' },
        { status: 400 }
      );
    }

    // Calculer le montant total côté serveur (sécurité)
    const totalAmount = body.items.reduce((total, item) => {
      const itemTotal = item.price * item.quantity;
      return total + itemTotal;
    }, 0);

    // Validation du montant
    if (!validateAmount(totalAmount)) {
      return NextResponse.json(
        { error: 'Montant de commande invalide' },
        { status: 400 }
      );
    }

    // Convertir en centimes pour Stripe
    const amountInCents = Math.round(totalAmount * 100);

    // Préparer les métadonnées sécurisées
    const metadata = sanitizeMetadata({
      order_type: body.orderType,
      customer_email: body.customerInfo.email,
      customer_name: body.customerInfo.name,
      items_count: body.items.length.toString(),
      total_amount: totalAmount.toString(),
      created_at: new Date().toISOString(),
    });

    // Créer le PaymentIntent avec Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'eur',
      payment_method_types: ['card'],
      // Informations de facturation
      receipt_email: body.customerInfo.email,
      // Métadonnées pour le suivi
      metadata,
      // Configuration de sécurité
      confirmation_method: 'manual',
      confirm: false,
      // Description pour les relevés bancaires
      description: `Commande O'Miam Pizza - ${body.items.length} article(s)`,
      // Configuration pour la conformité PCI DSS
      setup_future_usage: undefined, // Pas de stockage de carte
    });

    // Log sécurisé (sans données sensibles)
    console.log(`PaymentIntent créé: ${paymentIntent.id} pour ${totalAmount}€`);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: totalAmount,
      currency: 'eur'
    });

  } catch (error: any) {
    console.error('Erreur création PaymentIntent:', error);

    // Gestion des erreurs Stripe spécifiques
    if (error.type === 'StripeCardError') {
      return NextResponse.json(
        { error: 'Erreur de carte bancaire' },
        { status: 400 }
      );
    }

    if (error.type === 'StripeRateLimitError') {
      return NextResponse.json(
        { error: 'Trop de requêtes, veuillez patienter' },
        { status: 429 }
      );
    }

    if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { error: 'Requête de paiement invalide' },
        { status: 400 }
      );
    }

    if (error.type === 'StripeAPIError') {
      return NextResponse.json(
        { error: 'Erreur du service de paiement' },
        { status: 502 }
      );
    }

    if (error.type === 'StripeConnectionError') {
      return NextResponse.json(
        { error: 'Problème de connexion au service de paiement' },
        { status: 503 }
      );
    }

    if (error.type === 'StripeAuthenticationError') {
      return NextResponse.json(
        { error: 'Erreur d\'authentification du paiement' },
        { status: 401 }
      );
    }

    // Erreur générique (ne pas exposer les détails)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// Méthodes HTTP autorisées
export async function GET() {
  return NextResponse.json(
    { error: 'Méthode non autorisée' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Méthode non autorisée' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Méthode non autorisée' },
    { status: 405 }
  );
}