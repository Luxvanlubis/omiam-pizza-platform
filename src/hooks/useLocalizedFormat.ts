import { useI18n } from './useI18n';

/**
 * Hook pour le formatage localisé des dates, nombres et devises
 * Utilise les APIs Intl natives du navigateur
 */
export function useLocalizedFormat() {
  const { locale } = useI18n();

  /**
   * Formate une date selon la locale courante
   */
  const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    });
  };

  /**
   * Formate un montant en devise selon la locale courante
   */
  const formatCurrency = (amount: number, currency = 'EUR') => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency
    }).format(amount);
  };

  /**
   * Formate un nombre selon la locale courante
   */
  const formatNumber = (number: number, options?: Intl.NumberFormatOptions) => {
    return new Intl.NumberFormat(locale, options).format(number);
  };

  /**
   * Formate une heure selon la locale courante
   */
  const formatTime = (date: Date | string, options?: Intl.DateTimeFormatOptions) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
      ...options
    });
  };

  /**
   * Formate une date relative (il y a X minutes, dans X heures, etc.)
   */
  const formatRelativeTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
    
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    
    if (Math.abs(diffInSeconds) < 60) {
      return rtf.format(-diffInSeconds, 'second');
    }
    if (Math.abs(diffInSeconds) < 3600) {
      return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
    }
    if (Math.abs(diffInSeconds) < 86400) {
      return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
    }
    return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
  };

  /**
   * Formate un pourcentage selon la locale courante
   */
  const formatPercentage = (value: number, options?: Intl.NumberFormatOptions) => {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      ...options
    }).format(value);
  };

  /**
   * Formate une date et heure complète
   */
  const formatDateTime = (date: Date | string, options?: Intl.DateTimeFormatOptions) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      ...options
    });
  };

  /**
   * Formate une durée en heures et minutes
   */
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours === 0) {
      return `${remainingMinutes}min`;
    }
    
    return remainingMinutes === 0 
      ? `${hours}h` 
      : `${hours}h ${remainingMinutes}min`;
  };

  /**
   * Formate une taille de fichier
   */
  const formatFileSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${formatNumber(size, { maximumFractionDigits: 1 })} ${units[unitIndex]}`;
  };

  return {
    formatDate,
    formatCurrency,
    formatNumber,
    formatTime,
    formatRelativeTime,
    formatPercentage,
    formatDateTime,
    formatDuration,
    formatFileSize,
    locale
  };
}