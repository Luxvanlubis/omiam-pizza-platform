'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Shield, Settings, BarChart3, Target } from 'lucide-react';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

const COOKIE_CONSENT_ = 'omiam-cookie-consent';
const COOKIE_PREFERENCES_ = 'omiam-cookie-preferences';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Toujours activé
    analytics: false,
    marketing: false,
    functional: false,
  });

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà donné son consentement
    const consent = localStorage.getItem(COOKIE_CONSENT_);
    const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_);
    
    if (!consent) {
      setShowBanner(true);
    } else if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    };
    setPreferences(allAccepted);
    saveConsent(allAccepted);
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    };
    setPreferences(onlyNecessary);
    saveConsent(onlyNecessary);
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
    setShowBanner(false);
    setShowPreferences(false);
  };

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_, 'true');
    localStorage.setItem(COOKIE_PREFERENCES_, JSON.stringify(prefs));
    
    // Déclencher les événements pour les services tiers
    window.dispatchEvent(new CustomEvent('cookieConsentUpdated', { detail: prefs }));
  };

  const updatePreference = (key: keyof CookiePreferences, value: boolean) => {
    if (key === 'necessary') return; // Les cookies nécessaires ne peuvent pas être désactivés
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Bannière de consentement */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg">
        <div className="container mx-auto p-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Respect de votre vie privée</h3>
              </div>
              <p className="text-sm text-gray-600">
                Nous utilisons des cookies pour améliorer votre expérience, analyser le trafic et personnaliser le contenu. 
                Vous pouvez choisir quels cookies accepter.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 min-w-fit">
              <Dialog open={showPreferences} onOpenChange={setShowPreferences}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Personnaliser
                  </Button>
                </DialogTrigger>
                
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Préférences de cookies</DialogTitle>
                    <DialogDescription>
                      Gérez vos préférences de cookies. Les cookies nécessaires sont requis pour le fonctionnement du site.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    {/* Cookies nécessaires */}
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-green-600" />
                            <CardTitle className="text-base">Cookies nécessaires</CardTitle>
                          </div>
                          <Switch checked={true} disabled />
                        </div>
                        <CardDescription>
                          Ces cookies sont essentiels au fonctionnement du site (authentification, panier, sécurité).
                        </CardDescription>
                      </CardHeader>
                    </Card>
                    
                    {/* Cookies analytiques */}
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-blue-600" />
                            <CardTitle className="text-base">Cookies analytiques</CardTitle>
                          </div>
                          <Switch 
                            checked={preferences.analytics} 
                            onCheckedChange={(checked) => updatePreference('analytics', checked)} 
                          />
                        </div>
                        <CardDescription>
                          Nous aident à comprendre comment vous utilisez le site pour l'améliorer (Google Analytics).
                        </CardDescription>
                      </CardHeader>
                    </Card>
                    
                    {/* Cookies marketing */}
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-purple-600" />
                            <CardTitle className="text-base">Cookies marketing</CardTitle>
                          </div>
                          <Switch 
                            checked={preferences.marketing} 
                            onCheckedChange={(checked) => updatePreference('marketing', checked)} 
                          />
                        </div>
                        <CardDescription>
                          Utilisés pour vous proposer des publicités pertinentes et mesurer l'efficacité des campagnes.
                        </CardDescription>
                      </CardHeader>
                    </Card>
                    
                    {/* Cookies fonctionnels */}
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Settings className="h-5 w-5 text-orange-600" />
                            <CardTitle className="text-base">Cookies fonctionnels</CardTitle>
                          </div>
                          <Switch 
                            checked={preferences.functional} 
                            onCheckedChange={(checked) => updatePreference('functional', checked)} 
                          />
                        </div>
                        <CardDescription>
                          Améliorent l'expérience utilisateur (préférences, chat en ligne, widgets sociaux).
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setShowPreferences(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleSavePreferences}>
                      Sauvegarder les préférences
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button variant="outline" size="sm" onClick={handleRejectAll}>
                Refuser tout
              </Button>
              <Button size="sm" onClick={handleAcceptAll}>
                Accepter tout
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Overlay pour bloquer l'interaction */}
      <div className="fixed inset-0 bg-black/20 z-40" />
    </>
  );
}

// Hook pour accéder aux préférences de cookies
export function useCookiePreferences() {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false,
  });

  useEffect(() => {
    const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_);
    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    }

    const handleConsentUpdate = (event: CustomEvent) => {
      setPreferences(event.detail);
    };

    window.addEventListener('cookieConsentUpdated', handleConsentUpdate as EventListener);
    
    return () => {
      window.removeEventListener('cookieConsentUpdated', handleConsentUpdate as EventListener);
    };
  }, []);

  return preferences;
}

// Fonction utilitaire pour vérifier si un type de cookie est autorisé
export function isCookieAllowed(type: keyof CookiePreferences): boolean {
  if (typeof window === 'undefined') return false;
  
  const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_);
  if (!savedPreferences) return type === 'necessary';
  
  const preferences: CookiePreferences = JSON.parse(savedPreferences);
  return preferences[type];
}