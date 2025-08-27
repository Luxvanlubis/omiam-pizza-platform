"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Cookie, Settings, Shield, BarChart3, Target, X } from 'lucide-react';

interface CookiePreferences { necessary: boolean; analytics: boolean; marketing: boolean; functional: boolean;
}

interface CookieConsentBannerProps { onConsentChange?: (preferences: CookiePreferences) => void;
}

const COOKIE_CONSENT_ = 'omiam-cookie-consent';
const COOKIE_PREFERENCES_ = 'omiam-cookie-preferences';

export default function CookieConsentBanner({ onConsentChange }: CookieConsentBannerProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
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
      try {
        const parsed = JSON.parse(savedPreferences);
        setPreferences(parsed);
        onConsentChange?.(parsed);
      } catch (error) {
        console.error('Erreur lors du parsing des préférences cookies:', error);
      }
    }
  }, [onConsentChange]);

  const savePreferences = (newPreferences: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_, 'true');
    localStorage.setItem(COOKIE_PREFERENCES_, JSON.stringify(newPreferences));
    setPreferences(newPreferences);
    onConsentChange?.(newPreferences);
    setShowBanner(false);
    setShowSettings(false);
  };

  const acceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    };
    savePreferences(allAccepted);
  };

  const acceptNecessaryOnly = () => {
    const necessaryOnly: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    };
    savePreferences(necessaryOnly);
  };

  const handlePreferenceChange = (key: keyof CookiePreferences, value: boolean) => {
    if (key === 'necessary') return; // Les cookies nécessaires ne peuvent pas être désactivés
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const cookieCategories = [
    {
      key: 'necessary' as const,
      title: 'Cookies nécessaires',
      description: 'Ces cookies sont essentiels au fonctionnement du site et ne peuvent pas être désactivés.',
      icon: Shield,
      required: true,
      examples: 'Authentification, panier, préférences de langue'
    },
    {
      key: 'functional' as const,
      title: 'Cookies fonctionnels',
      description: 'Ces cookies améliorent votre expérience en mémorisant vos préférences.',
      icon: Settings,
      required: false,
      examples: 'Thème sombre/clair, préférences d\'affichage'
    },
    {
      key: 'analytics' as const,
      title: 'Cookies analytiques',
      description: 'Ces cookies nous aident à comprendre comment vous utilisez notre site.',
      icon: BarChart3,
      required: false,
      examples: 'Google Analytics, statistiques de visite'
    },
    {
      key: 'marketing' as const,
      title: 'Cookies marketing',
      description: 'Ces cookies sont utilisés pour vous proposer des publicités pertinentes.',
      icon: Target,
      required: false,
      examples: 'Publicités ciblées, réseaux sociaux'
    }
  ];

  if (!showBanner) return null;

  return (
    <>
      {/* Bannière principale */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur-sm border-t shadow-lg">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Cookie className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">
                  🍪 Nous utilisons des cookies
                </h3>
                <p className="text-muted-foreground mb-4">
                  Nous utilisons des cookies pour améliorer votre expérience, analyser le trafic et personnaliser le contenu. En continuant à utiliser notre site, vous acceptez notre utilisation des cookies.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={acceptAll} className="bg-primary hover:bg-primary/90">
                    Accepter tout
                  </Button>
                  <Button variant="outline" onClick={acceptNecessaryOnly}>
                    Nécessaires uniquement
                  </Button>
                  <Dialog open={showSettings} onOpenChange={setShowSettings}>
                    <DialogTrigger asChild>
                      <Button variant="ghost">
                        <Settings className="h-4 w-4 mr-2" />
                        Personnaliser
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Cookie className="h-5 w-5" />
                          Paramètres des cookies
                        </DialogTitle>
                        <DialogDescription>
                          Choisissez les types de cookies que vous souhaitez autoriser. Vous pouvez modifier ces paramètres à tout moment.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6">
                        {cookieCategories.map((category) => {
                          const Icon = category.icon;
                          return (
                            <div key={category.key} className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Icon className="h-5 w-5 text-primary" />
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <Label className="font-medium">
                                        {category.title}
                                      </Label>
                                      {category.required && (
                                        <Badge variant="secondary" className="text-xs">
                                          Requis
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {category.description}
                                    </p>
                                  </div>
                                </div>
                                <Switch
                                  checked={preferences[category.key]}
                                  onCheckedChange={(checked) =>
                                    handlePreferenceChange(category.key, checked)
                                  }
                                  disabled={category.required}
                                />
                              </div>
                              <div className="ml-8 text-xs text-muted-foreground">
                                <strong>Exemples :</strong> {category.examples}
                              </div>
                              {category.key !== 'marketing' && <Separator />}
                            </div>
                          );
                        })}
                      </div>
                      <DialogFooter className="gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setShowSettings(false)}
                        >
                          Annuler
                        </Button>
                        <Button onClick={() => savePreferences(preferences)}>
                          Enregistrer les préférences
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={acceptNecessaryOnly}
                className="flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

// Hook pour utiliser les préférences cookies
export function useCookiePreferences() {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false,
  });

  useEffect(() => {
    const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    if (savedPreferences) {
      try {
        setPreferences(JSON.parse(savedPreferences));
      } catch (error) {
        console.error('Erreur lors du parsing des préférences cookies:', error);
      }
    }
  }, []);

  return preferences;
}

// Fonction utilitaire pour vérifier si un type de cookie est autorisé
export function isCookieAllowed(type: keyof CookiePreferences): boolean {
  if (typeof window === 'undefined') return false;
  
  const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);
  if (!savedPreferences) return type === 'necessary';
  
  try {
    const preferences = JSON.parse(savedPreferences);
    return preferences[type] || false;
  } catch {
    return type === 'necessary';
  }
}