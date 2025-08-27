"use client";

import { useContext } from 'react';
import { I18nContext } from '../providers/I18nProvider';

/**
 * Hook pour l'internationalisation et la traduction
 * Fournit les fonctions de traduction et de gestion des locales
 */
export function useI18n() {
  const context = useContext(I18nContext);
  
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }

  /**
   * Fonction de traduction principale
   * @param key - Clé de traduction (ex: 'common.save')
   * @param params - Paramètres pour l'interpolation
   */
  const t = (key: string, params?: Record<string, any>): string => {
    const keys = key.split('.');
    let value: any = context.translations[context.locale];
    
    // Navigation dans l'objet de traductions
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key; // Retourne la clé si traduction non trouvée
      }
    }
    
    if (typeof value !== 'string') {
      console.warn(`Translation value is not a string for key: ${key}`);
      return key;
    }
    
    // Interpolation des paramètres
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match;
      });
    }
    
    return value;
  };

  /**
   * Fonction de pluralisation
   * @param key - Clé de base pour la traduction
   * @param count - Nombre pour déterminer la forme plurielle
   * @param params - Paramètres additionnels
   */
  const plural = (key: string, count: number, params?: Record<string, any>): string => {
    const pluralKey = count === 1 ? key : `${key}_plural`;
    return t(pluralKey, { count, ...params });
  };

  /**
   * Alias pour la fonction de traduction
   */
  const formatMessage = (key: string, params?: Record<string, any>): string => {
    return t(key, params);
  };

  /**
   * Vérifie si une traduction existe
   */
  const hasTranslation = (key: string): boolean => {
    const keys = key.split('.');
    let value: any = context.translations[context.locale];
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return false;
      }
    }
    
    return typeof value === 'string';
  };

  /**
   * Obtient la direction du texte pour la locale courante
   */
  const getTextDirection = (): 'ltr' | 'rtl' => {
    const rtlLocales = ['ar', 'he', 'fa', 'ur'];
    return rtlLocales.includes(context.locale) ? 'rtl' : 'ltr';
  };

  /**
   * Formate un nombre selon la locale courante
   */
  const formatNumber = (number: number, options?: Intl.NumberFormatOptions): string => {
    return new Intl.NumberFormat(context.locale, options).format(number);
  };

  return {
    t,
    plural,
    formatMessage,
    hasTranslation,
    getTextDirection,
    formatNumber,
    locale: context.locale,
    setLocale: context.setLocale,
    availableLocales: context.availableLocales,
    isLoading: context.isLoading
  };
}

export default useI18n;