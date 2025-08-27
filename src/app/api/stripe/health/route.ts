import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { stripeService } from '@/lib/stripe-service';

/**
 * GET /api/stripe/health
 * Endpoint de diagnostic pour vérifier la configuration Stripe
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification (optionnel selon vos besoins)
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session?.user) {
      return NextResponse.json({
        error: 'Non autorisé'
      }, { status: 401 });
    }

    // Effectuer le health check
    const healthCheck = await stripeService.healthCheck();

    // Informations sur la configuration
    const configInfo = {
      publishableConfigured: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      secretConfigured: !!process.env.STRIPE_SECRET_KEY,
      webhookConfigured: !!process.env.STRIPE_WEBHOOK_SECRET,
      publishableType: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_test_') ? 'test' : 
                      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_live_') ? 'live' : 'invalid',
      secretType: process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_') ? 'test' : 
                 process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') ? 'live' : 'invalid',
      isMockMode: stripeService.isMockMode(),
      environment: process.env.NODE_ENV,
    };

    // Vérifications de cohérence
    const warnings = [];
    if (configInfo.publishableType !== configInfo.secretType && 
        configInfo.publishableType !== 'invalid' && 
        configInfo.secretType !== 'invalid') {
      warnings.push('Les clés publique et secrète ne correspondent pas au même environnement (test/live)');
    }
    if (configInfo.environment === 'production' && configInfo.publishableType === 'test') {
      warnings.push('Clés de test utilisées en production');
    }
    if (configInfo.environment === 'development' && configInfo.publishableType === 'live') {
      warnings.push('Clés de production utilisées en développement');
    }
    if (!configInfo.webhookConfigured) {
      warnings.push('Webhook non configuré - les notifications ne fonctionneront pas');
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      healthCheck,
      configuration: configInfo,
      warnings,
      recommendations: [
        configInfo.isMockMode ? 'Configurez vos clés Stripe pour activer les vrais paiements' : null,
        !configInfo.webhookConfigured ? 'Configurez le webhook Stripe pour les notifications' : null,
        configInfo.environment === 'production' && configInfo.publishableType === 'test' ? 
          'Utilisez les clés de production en environnement de production' : null
      ].filter(Boolean)
    });
  } catch (error) {
    console.error('Erreur lors du health check Stripe:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la vérification de la configuration Stripe',
      details: error instanceof Error ? error.message : 'Erreur inconnue',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * POST /api/stripe/health
 * Test des fonctionnalités Stripe de base
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session?.user) {
      return NextResponse.json({
        error: 'Non autorisé'
      }, { status: 401 });
    }

    const body = await request.json();
    const { testType = 'basic' } = body;

    const results: any = {
      timestamp: new Date().toISOString(),
      testType,
      tests: {}
    };

    try {
      // Test 1: Création d'un PaymentIntent
      console.log('🧪 Test: Création PaymentIntent...');
      const paymentIntent = await stripeService.createPaymentIntent(
        10.50,
        'eur',
        {
          test: 'true',
          source: 'health-check',
          timestamp: new Date().toISOString()
        }
      );
      
      results.tests.paymentIntent = {
        success: true,
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status
      };
    } catch (error) {
      results.tests.paymentIntent = {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }

    try {
      // Test 2: Création d'un Customer
      console.log('🧪 Test: Création Customer...');
      const customer = await stripeService.createCustomer(
        'test-health-check@example.com',
        'Health Check User',
        {
          test: 'true',
          source: 'health-check',
          timestamp: new Date().toISOString()
        }
      );
      
      results.tests.customer = {
        success: true,
        id: customer.id,
        email: customer.email,
        name: customer.name
      };
    } catch (error) {
      results.tests.customer = {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }

    // Résumé des tests
    const successfulTests = Object.values(results.tests).filter((test: any) => test.success).length;
    const totalTests = Object.keys(results.tests).length;

    results.summary = {
      totalTests,
      successfulTests,
      failedTests: totalTests - successfulTests,
      success: successfulTests === totalTests
    };

    return NextResponse.json({
      success: true,
      ...results
    });
  } catch (error) {
    console.error('Erreur lors des tests Stripe:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors des tests Stripe',
      details: error instanceof Error ? error.message : 'Erreur inconnue',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}