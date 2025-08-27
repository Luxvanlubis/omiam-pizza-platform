/**
 * Email Health Check API Endpoint
 * Checks email service connectivity and configuration
 */

import { NextResponse } from 'next/server'
import { emailService } from '@/lib/email-service'

export async function GET() {
  try {
    const healthCheck = await emailService.healthCheck()
    const templates = emailService.getTemplates()
    const isMock = emailService.isMockMode()
    
    return NextResponse.json({
      status: 'success',
      email: {
        ...healthCheck,
        isMockMode: isMock,
        availableTemplates: templates,
        features: {
          orderConfirmation: true,
          orderReady: true,
          welcome: true,
          passwordReset: true,
          customEmails: true
        },
        config: {
          host: process.env.SMTP_HOST || 'localhost',
          port: process.env.SMTP_PORT || '587',
          from: process.env.SMTP_FROM || 'OMIAM <noreply@omiam.local>'
        }
      },
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    })
  } catch (error) {
    console.error('Email health check failed:', error)
    
    return NextResponse.json({
      status: 'error',
      email: {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        isMockMode: true
      },
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    }, { status: 500 })
  }
}