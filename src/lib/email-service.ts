/**
 * Email Service with SMTP and Fallback
 * Handles email sending with mock mode for development
 */

import * as nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'

interface EmailTemplate {
  subject: string
  html: string
  text: string
}

interface EmailOptions {
  to: string | string[]
  subject?: string
  html?: string
  text?: string
  template?: keyof typeof emailTemplates
  variables?: Record<string, string>
}

// Email templates
const emailTemplates = {
  orderConfirmation: {
    subject: '🍕 Confirmation de commande - OMIAM',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #e74c3c;">🍕 Merci pour votre commande !</h1>
        <p>Bonjour <strong>{{customerName}}</strong>,</p>
        <p>Votre commande <strong>#{{orderId}}</strong> a été confirmée.</p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Détails de la commande :</h3>
          <p><strong>Total :</strong> {{total}}€</p>
          <p><strong>Adresse de livraison :</strong> {{address}}</p>
          <p><strong>Temps estimé :</strong> {{estimatedTime}} minutes</p>
        </div>
        <p>Vous pouvez suivre votre commande en temps réel sur notre site.</p>
        <p>Merci de votre confiance !</p>
        <p><em>L'équipe OMIAM</em></p>
      </div>
    `,
    text: 'Merci pour votre commande #{{orderId}} ! Total: {{total}}€. Livraison estimée: {{estimatedTime}} minutes.'
  },
  orderReady: {
    subject: '🚀 Votre commande est prête !',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #27ae60;">🚀 Votre commande est prête !</h1>
        <p>Bonjour <strong>{{customerName}}</strong>,</p>
        <p>Votre commande <strong>#{{orderId}}</strong> est maintenant prête !</p>
        <p style="font-size: 18px; color: #27ae60;"><strong>🍕 Bon appétit !</strong></p>
        <p><em>L'équipe OMIAM</em></p>
      </div>
    `,
    text: 'Votre commande #{{orderId}} est prête ! Bon appétit !'
  },
  welcome: {
    subject: '🎉 Bienvenue chez OMIAM !',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #e74c3c;">🎉 Bienvenue chez OMIAM !</h1>
        <p>Bonjour <strong>{{customerName}}</strong>,</p>
        <p>Merci de vous être inscrit ! Découvrez nos délicieuses pizzas artisanales.</p>
        <p>🎁 <strong>Offre spéciale :</strong> -10% sur votre première commande avec le code <strong>BIENVENUE10</strong></p>
        <p>À bientôt !</p>
        <p><em>L'équipe OMIAM</em></p>
      </div>
    `,
    text: 'Bienvenue chez OMIAM ! Utilisez le code BIENVENUE10 pour -10% sur votre première commande.'
  },
  passwordReset: {
    subject: '🔐 Réinitialisation de mot de passe',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3498db;">🔐 Réinitialisation de mot de passe</h1>
        <p>Bonjour,</p>
        <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
        <p><a href="{{resetLink}}" style="background: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Réinitialiser mon mot de passe</a></p>
        <p><small>Ce lien expire dans 1 heure.</small></p>
        <p><em>L'équipe OMIAM</em></p>
      </div>
    `,
    text: 'Réinitialisez votre mot de passe : {{resetLink}}'
  }
} as const

// SMTP Configuration
const smtpConfig = {
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'noreply@omiam.local',
    pass: process.env.SMTP_PASS || (() => {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('SMTP_PASS must be set in production');
      }
      return 'dev123';
    })()
  }
}

// Check if we have real SMTP config or should use mock mode
const isRealSMTP = process.env.SMTP_HOST && !process.env.SMTP_HOST.includes('localhost')
const isMockMode = !isRealSMTP || process.env.NODE_ENV === 'development'

let transporter: Transporter | null = null

// Initialize transporter
if (isRealSMTP && !isMockMode) {
  try {
    transporter = nodemailer.createTransport(smtpConfig)
    console.log('✅ SMTP transporter initialized')
  } catch (error) {
    console.error('❌ SMTP initialization failed:', error instanceof Error ? error.message : String(error))
  }
} else {
  console.log('🔄 Email: Using mock mode for development')
}

// Template processing
function processTemplate(template: EmailTemplate, variables: Record<string, string> = {}): EmailTemplate {
  let { subject, html, text } = template
  
  // Replace variables in template
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`
    subject = subject.replace(new RegExp(placeholder, 'g'), value)
    html = html.replace(new RegExp(placeholder, 'g'), value)
    text = text.replace(new RegExp(placeholder, 'g'), value)
  })
  
  return { subject, html, text }
}

export const emailService = {
  // Send email
  async sendEmail(options: EmailOptions) {
    try {
      let { subject, html, text } = options
      
      // Use template if specified
      if (options.template && emailTemplates[options.template]) {
        const processed = processTemplate(emailTemplates[options.template], options.variables)
        subject = processed.subject
        html = processed.html
        text = processed.text
      }
      
      const mailOptions = {
        from: process.env.SMTP_FROM || 'OMIAM <noreply@omiam.local>',
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject,
        html: html || options.html,
        text: text || options.text
      }
      
      if (transporter && !isMockMode) {
        const result = await transporter.sendMail(mailOptions)
        console.log('✅ Email sent:', result.messageId)
        return { success: true, messageId: result.messageId, mode: 'smtp' }
      } else {
        // Mock mode - log email instead of sending
        console.log('🎭 Mock email sent:')
        console.log('  To:', mailOptions.to)
        console.log('  Subject:', mailOptions.subject)
        console.log('  Content:', mailOptions.text?.substring(0, 100) + '...')
        return { success: true, messageId: 'mock_' + Date.now(), mode: 'mock', details: mailOptions }
      }
    } catch (error) {
      console.error('❌ Email sending failed:', error instanceof Error ? error.message : String(error))
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error', mode: isMockMode ? 'mock' : 'smtp' }
    }
  },   // Send order confirmation
  async sendOrderConfirmation(customerEmail: string, orderData: {
    customerName: string
    orderId: string
    total: number
    address: string
    estimatedTime: number
  }) {
    return this.sendEmail({
      to: customerEmail,
      template: 'orderConfirmation',
      variables: {
        customerName: orderData.customerName,
        orderId: orderData.orderId,
        total: orderData.total.toFixed(2),
        address: orderData.address,
        estimatedTime: orderData.estimatedTime.toString()
      }
    })
  },   // Send order ready notification
  async sendOrderReady(customerEmail: string, customerName: string, orderId: string) {
    return this.sendEmail({
      to: customerEmail,
      template: 'orderReady',
      variables: { customerName, orderId }
    })
  },   // Send welcome email
  async sendWelcomeEmail(customerEmail: string, customerName: string) {
    return this.sendEmail({
      to: customerEmail,
      template: 'welcome',
      variables: { customerName }
    })
  },   // Send password reset
  async sendPasswordReset(customerEmail: string, resetLink: string) {
    return this.sendEmail({
      to: customerEmail,
      template: 'passwordReset',
      variables: { resetLink }
    })
  },   // Health check
  async healthCheck() {
    try {
      if (transporter && !isMockMode) {
        await transporter.verify()
        return { status: 'healthy', mode: 'smtp', provider: 'nodemailer' }
      }
      return { status: 'healthy', mode: 'mock', provider: 'mock-smtp' }
    } catch (error) {
      return {
        status: 'error',
        mode: isMockMode ? 'mock' : 'smtp',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  },   // Get available templates
  getTemplates() {
    return Object.keys(emailTemplates)
  },   // Check if in mock mode
  isMockMode() {
    return isMockMode
  }
}

export default emailService