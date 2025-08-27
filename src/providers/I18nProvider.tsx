
"use client";

import { useState, useEffect, createContext, ReactNode } from 'react';
import path from 'path';

/**
 * Valide et sécurise un chemin de fichier
 * @param {string} userPath - Chemin fourni par l'utilisateur
 * @param {string} basePath - Chemin de base autorisé
 * @returns {string} - Chemin sécurisé
 */
function validateSecurePath(userPath: string, basePath: string = process.cwd()): string {
  if (!userPath || typeof userPath !== 'string') {
    throw new Error('Chemin invalide');
  }
  
  // Normaliser le chemin et vérifier qu'il reste dans le répertoire autorisé
  const normalizedPath = path.normalize(path.join(basePath, userPath));
  const normalizedBase = path.normalize(basePath);
  
  if (!normalizedPath.startsWith(normalizedBase)) {
    throw new Error('Accès au chemin non autorisé');
  }
  
  return normalizedPath;
}

// Types pour l'internationalisation
export interface Translation {
  [key: string]: string | Translation;
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  isRTL?: boolean;
}

export interface I18nContextType {
  currentLanguage: string;
  languages: Language[];
  translations: Translation;
  t: (key: string, params?: Record<string, string | number>) => string;
  changeLanguage: (languageCode: string) => void;
  isLoading: boolean;
}

// Langues supportées
export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'fr', name: 'Français', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'it', name: 'Italiano', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'de', name: 'Deutsch', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'ar', name: 'العربية', nativeName: 'العربية', flag: '🇸🇦', isRTL: true }
];

// Contexte I18n
export const I18nContext = createContext<I18nContextType | null>(null);

// Provider I18n
export function I18nProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<string>('fr');
  const [translations, setTranslations] = useState<Translation>({});
  const [isLoading, setIsLoading] = useState(true);
  
  // Charger les traductions
  const loadTranslations = async (languageCode: string) => {
    setIsLoading(true);
    try {
      // Charger depuis l'API ou les fichiers locaux
      const response = await fetch(`/api/translations/${languageCode}`);
      if (response.ok) {
        const data = await response.json();
        setTranslations(data);
      } else {
        // Fallback vers les traductions par défaut
        const defaultTranslations = await import(`../locales/${languageCode}.json`);
        setTranslations(defaultTranslations.default);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des traductions:', error);
      // Charger les traductions par défaut en français
      if (languageCode !== 'fr') {
        await loadTranslations('fr');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fonction de traduction avec interpolation
  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Retourner la clé si la traduction n'existe pas
      }
    }
    
    if (typeof value !== 'string') {
      return key;
    }
    
    // Interpolation des paramètres
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, param) => {
        return params[param]?.toString() || match;
      });
    }
    
    return value;
  };
  
  // Changer de langue
  const changeLanguage = async (languageCode: string) => {
    if (languageCode !== currentLanguage) {
      setCurrentLanguage(languageCode);
      await loadTranslations(languageCode);
      
      // Sauvegarder la préférence
      localStorage.setItem('preferred-language', languageCode);
      
      // Mettre à jour l'attribut lang du document
      document.documentElement.lang = languageCode;
      
      // Gérer le sens d'écriture (RTL/LTR)
      const language = SUPPORTED_LANGUAGES.find(lang => lang.code === languageCode);
      if (language?.isRTL) {
        document.documentElement.dir = 'rtl';
      } else {
        document.documentElement.dir = 'ltr';
      }
    }
  };
  
  // Initialisation
  useEffect(() => {
    const initializeI18n = async () => {
      // Détecter la langue préférée ou celle du navigateur
      const savedLanguage = localStorage.getItem('preferred-language');
      const browserLanguage = navigator.language.split('-')[0];
      const supportedCodes = SUPPORTED_LANGUAGES.map(lang => lang.code);
      
      const initialLanguage = savedLanguage && supportedCodes.includes(savedLanguage)
        ? savedLanguage
        : supportedCodes.includes(browserLanguage)
        ? browserLanguage
        : 'fr';
      
      setCurrentLanguage(initialLanguage);
      await loadTranslations(initialLanguage);
    };
    
    initializeI18n();
  }, []);
  
  const value: I18nContextType = {
    currentLanguage,
    languages: SUPPORTED_LANGUAGES,
    translations,
    t,
    changeLanguage,
    isLoading
  };
  
  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}