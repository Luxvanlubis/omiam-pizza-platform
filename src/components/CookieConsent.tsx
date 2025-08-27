'use client'

import React, { useState, useEffect } from 'react'
import { X, Settings, Check, Shield, BarChart3, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'

interface CookiePreferences {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  functional: boolean
}

const COOKIE_CONSENT_KEY = 'omiam-cookie-consent'
const COOKIE_PREFERENCES_KEY = 'omiam-cookie-preferences'

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Toujours activé
    analytics: false,
    marketing: false,
    functional: false
  })

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà donné son consentement
    const hasConsent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!hasConsent) {
      setIsVisible(true)
    } else {
      // Charger les préférences sauvegardées
      const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY)
      if (savedPreferences) {
        try {
          setPreferences(JSON.parse(savedPreferences))
        } catch (error) {
          console.error('Erreur lors du parsing des préférences cookies:', error)
        }
      }
    }
  }, [])

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true
    }
    savePreferences(allAccepted)
  }

  const handleRejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false
    }
    savePreferences(onlyNecessary)
  }

  const handleSavePreferences = () => {
    savePreferences(preferences)
  }

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true')
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs))
    setPreferences(prefs)
    setIsVisible(false)
    
    // Déclencher les événements pour les services tiers
    window.dispatchEvent(new CustomEvent('cookiePreferencesUpdated', { detail: prefs }))
  }

  const handlePreferenceChange = (key: keyof CookiePreferences, value: boolean) => {
    if (key === 'necessary') return // Les cookies nécessaires ne peuvent pas être désactivés
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Gestion des Cookies</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Nous utilisons des cookies pour améliorer votre expérience sur notre site.
            Vous pouvez choisir quels types de cookies accepter.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showDetails ? (
            <>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleAcceptAll} className="flex-1">
                  <Check className="h-4 w-4 mr-2" />
                  Tout Accepter
                </Button>
                <Button variant="outline" onClick={handleRejectAll} className="flex-1">
                  Refuser Tout
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowDetails(true)}
                  className="flex-1"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Personnaliser
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4">
                {/* Cookies Nécessaires */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="h-4 w-4 text-green-600" />
                      <h4 className="font-medium">Cookies Nécessaires</h4>
                      <Badge variant="secondary">Obligatoire</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Essentiels au fonctionnement du site (authentification, panier, sécurité)
                    </p>
                  </div>
                  <Switch checked={true} disabled />
                </div>

                {/* Cookies Analytics */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <BarChart3 className="h-4 w-4 text-blue-600" />
                      <h4 className="font-medium">Cookies d'Analyse</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Nous aident à comprendre comment vous utilisez le site (Google Analytics)
                    </p>
                  </div>
                  <Switch
                    checked={preferences.analytics}
                    onCheckedChange={(value) => handlePreferenceChange('analytics', value)}
                  />
                </div>

                {/* Cookies Marketing */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="h-4 w-4 text-purple-600" />
                      <h4 className="font-medium">Cookies Marketing</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Personnalisent les publicités et mesurent leur efficacité
                    </p>
                  </div>
                  <Switch
                    checked={preferences.marketing}
                    onCheckedChange={(value) => handlePreferenceChange('marketing', value)}
                  />
                </div>

                {/* Cookies Fonctionnels */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Settings className="h-4 w-4 text-orange-600" />
                      <h4 className="font-medium">Cookies Fonctionnels</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Améliorent l'expérience utilisateur (préférences, chat en ligne)
                    </p>
                  </div>
                  <Switch
                    checked={preferences.functional}
                    onCheckedChange={(value) => handlePreferenceChange('functional', value)}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button onClick={handleSavePreferences} className="flex-1">
                  <Check className="h-4 w-4 mr-2" />
                  Sauvegarder mes Préférences
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDetails(false)}
                  className="flex-1"
                >
                  Retour
                </Button>
              </div>
            </>
          )}

          <div className="text-xs text-muted-foreground pt-2 border-t">
            <p>
              En continuant à naviguer sur ce site, vous acceptez notre{' '}
              <a href="/politique-confidentialite" className="underline hover:text-foreground">
                Politique de Confidentialité
              </a>{' '}
              et nos{' '}
              <a href="/mentions-legales" className="underline hover:text-foreground">
                Mentions Légales
              </a>
              .
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Hook pour utiliser les préférences cookies dans d'autres composants
export function useCookiePreferences() {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false
  })

  useEffect(() => {
    const loadPreferences = () => {
      const saved = localStorage.getItem(COOKIE_PREFERENCES_KEY)
      if (saved) {
        try {
          setPreferences(JSON.parse(saved))
        } catch (error) {
          console.error('Erreur lors du parsing des préférences cookies:', error)
        }
      }
    }

    loadPreferences()

    const handleUpdate = (event: CustomEvent) => {
      setPreferences(event.detail)
    }

    window.addEventListener('cookiePreferencesUpdated', handleUpdate as EventListener)

    return () => {
      window.removeEventListener('cookiePreferencesUpdated', handleUpdate as EventListener)
    }
  }, [])

  return preferences
}