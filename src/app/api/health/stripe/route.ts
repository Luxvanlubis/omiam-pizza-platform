/**
 * Stripe Health Check API Endpoint
 * Checks Stripe connectivity and configuration
 */

import { NextResponse } from 'next/server'
import { stripeService } from '@/lib/stripe-service'

export async function GET() {
  try {
    const healthCheck = await stripeService.healthCheck()
    const publishable = stripeService.getPublishable()
    const isMock = stripeService.isMockMode()
    
    return NextResponse.json({
      status: 'success',
      stripe: {
        ...healthCheck,
        publishable: publishable.substring(0, 12) + '...', // Mask for security
        isMockMode: isMock,
        features: {
          paymentIntents: true,
          customers: true,
          webhooks: !isMock,
          subscriptions: !isMock
        }
      },
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    })
  } catch (error) {
    console.error('Stripe health check failed:', error)
    return NextResponse.json({
      status: 'error',
      stripe: {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        isMockMode: true
      },
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    }, { status: 500 })
  }
}