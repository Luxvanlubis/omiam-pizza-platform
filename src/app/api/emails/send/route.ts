/**
 * Send Email API Endpoint
 * Handles email sending with templates
 */

import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email-service'

// Simple validation function
function validateEmailRequest(body: any) {
  if (!body.to || typeof body.to !== 'string') {
    throw new Error('Valid email address is required')
  }
  
  if (body.template && !['orderConfirmation', 'orderReady', 'welcome', 'passwordReset'].includes(body.template)) {
    throw new Error('Invalid template')
  }
  
  return {
    to: body.to,
    template: body.template,
    subject: body.subject,
    html: body.html,
    text: body.text,
    variables: body.variables || {}
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = validateEmailRequest(body)
    const { to, template, subject, html, text, variables = {} } = validatedData
    
    // Send email
    const result = await emailService.sendEmail({
      to,
      template,
      subject,
      html,
      text,
      variables
    })
    
    return NextResponse.json({
      success: result.success,
      messageId: result.messageId,
      mode: result.mode,
      details: result.success ? undefined : result.error
    })
  } catch (error) {
    console.error('Email sending failed:', error)
    
    if (error instanceof Error && (error.message.includes('required') || error.message.includes('Invalid'))) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: error.message
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Email sending failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Email Sending API',
    methods: ['POST'],
    requiredFields: ['to'],
    optionalFields: ['template', 'subject', 'html', 'text', 'variables'],
    availableTemplates: emailService.getTemplates(),
    examples: {
      withTemplate: {
        to: 'customer@example.com',
        template: 'welcome',
        variables: { customerName: 'Jean Dupont' }
      },
      custom: {
        to: 'customer@example.com',
        subject: 'Custom Email',
        html: '<h1>Hello World!</h1>',
        text: 'Hello World!'
      }
    }
  })
}