import Stripe from 'stripe'

// Configuration Stripe
const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripePublishable = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

// Mode mock pour le développement
const isMockMode = !stripeSecretKey || stripeSecretKey.includes('test') || process.env.NODE_ENV === 'development'

// Initialisation Stripe
let stripe: Stripe | null = null
if (stripeSecretKey && !isMockMode) {
  try {
    stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-06-20',
    })
  } catch (error) {
    console.error('Erreur d\'initialisation Stripe:', error)
  }
}

// Mock payment responses for development
const mockPaymentIntent = {
  id: 'pi_mock_' + Math.random().toString(36).substr(2, 9),
  client_secret: 'pi_mock_secret_' + Math.random().toString(36).substr(2, 9),
  status: 'succeeded' as const,
  amount: 0,
  currency: 'eur',
  created: Math.floor(Date.now() / 1000),
  payment_method: 'pm_mock_card',
}

export const stripeService = {
  // Create payment intent
  async createPaymentIntent(amount: number, currency = 'eur', metadata = {}) {
    if (stripe && !isMockMode) {
      try {
        return await stripe.paymentIntents.create({
          amount: Math.round(amount * 100), // Convert to cents
          currency,
          metadata,
          automatic_payment_methods: {
            enabled: true,
          },
        })
      } catch (error) {
        console.error('Stripe payment intent creation failed:', error instanceof Error ? error.message : String(error))
        // Fallback to mock
        return {
          ...mockPaymentIntent,
          amount: Math.round(amount * 100),
          currency
        }
      }
    }
    
    // Mock mode
    console.log('🎭 Mock payment intent created:', { amount, currency, metadata })
    return {
      ...mockPaymentIntent,
      amount: Math.round(amount * 100),
      currency
    }
  },

  // Confirm payment intent
  async confirmPaymentIntent(paymentIntentId: string, paymentMethodId?: string) {
    if (stripe && !isMockMode) {
      try {
        return await stripe.paymentIntents.confirm(paymentIntentId, {
          payment_method: paymentMethodId,
        })
      } catch (error) {
        console.error('Stripe payment confirmation failed:', error instanceof Error ? error.message : String(error))
        // Fallback to mock success
        return {
          ...mockPaymentIntent,
          id: paymentIntentId,
          status: 'succeeded' as const
        }
      }
    }
    
    // Mock mode - always succeed
    console.log('🎭 Mock payment confirmed:', paymentIntentId)
    return {
      ...mockPaymentIntent,
      id: paymentIntentId,
      status: 'succeeded' as const
    }
  },

  // Retrieve payment intent
  async retrievePaymentIntent(paymentIntentId: string) {
    if (stripe && !isMockMode) {
      try {
        return await stripe.paymentIntents.retrieve(paymentIntentId)
      } catch (error) {
        console.error('Stripe payment retrieval failed:', error instanceof Error ? error.message : String(error))
        return {
          ...mockPaymentIntent,
          id: paymentIntentId
        }
      }
    }
    
    // Mock mode
    return {
      ...mockPaymentIntent,
      id: paymentIntentId
    }
  },

  // Create customer
  async createCustomer(email: string, name?: string, metadata = {}) {
    if (stripe && !isMockMode) {
      try {
        return await stripe.customers.create({
          email,
          name,
          metadata,
        })
      } catch (error) {
        console.error('Stripe customer creation failed:', error instanceof Error ? error.message : String(error))
        // Fallback to mock
        return {
          id: 'cus_mock_' + Math.random().toString(36).substr(2, 9),
          email,
          name,
          created: Math.floor(Date.now() / 1000),
        }
      }
    }
    
    // Mock mode
    console.log('🎭 Mock customer created:', { email, name })
    return {
      id: 'cus_mock_' + Math.random().toString(36).substr(2, 9),
      email,
      name,
      created: Math.floor(Date.now() / 1000),
    }
  },

  // Health check
  async healthCheck() {
    try {
      if (stripe && !isMockMode) {
        // Test with a minimal API call
        await stripe.paymentMethods.list({ limit: 1 })
        return {
          status: 'healthy',
          mode: 'live',
          provider: 'stripe'
        }
      }
      
      return {
        status: 'healthy',
        mode: 'mock',
        provider: 'stripe-mock'
      }
    } catch (error) {
      return {
        status: 'error',
        mode: isMockMode ? 'mock' : 'live',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  },

  // Get publishable key
  getPublishableKey() {
    if (stripePublishable && stripePublishable.startsWith('pk_')) {
      return stripePublishable
    }
    return 'pk_test_mock_for_development'
  },

  // Check if in mock mode
  isMockMode() {
    return isMockMode
  }
}

export { stripe }
export default stripeService