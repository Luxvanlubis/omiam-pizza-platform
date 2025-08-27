import React from 'react';
import { I18nContext } from '@/providers/I18nProvider';

// Mock useLocalizedFormat hook globally
jest.mock('@/hooks/useLocalizedFormat', () => ({
  useLocalizedFormat: () => ({
    formatDate: (date: Date | string) => {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleDateString('fr-FR');
    },
    formatTime: (date: Date | string) => {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleTimeString('fr-FR');
    },
    formatDateTime: (date: Date | string) => {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleString('fr-FR');
    },
    formatNumber: (num: number) => num.toLocaleString('fr-FR'),
    formatCurrency: (amount: number) => `${amount.toFixed(2)} €`,
    formatFileSize: (bytes: number) => `${(bytes / 1024).toFixed(1)} KB`
  })
}));

// Mock useI18n hook globally
jest.mock('@/hooks/useI18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    currentLanguage: 'fr',
    languages: [{ code: 'fr', name: 'Français' }]
  })
}));

// Create a test wrapper with I18nProvider
export const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const mockI18nValue = {
    currentLanguage: 'fr',
    languages: [
      { code: 'fr', name: 'Français', nativeName: 'Français', flag: '🇫🇷' },
      { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
      { code: 'es', name: 'Español', nativeName: 'Español', flag: '🇪🇸' },
      { code: 'it', name: 'Italiano', nativeName: 'Italiano', flag: '🇮🇹' },
      { code: 'de', name: 'Deutsch', nativeName: 'Deutsch', flag: '🇩🇪' },
      { code: 'ar', name: 'العربية', nativeName: 'العربية', flag: '🇸🇦', isRTL: true },
    ],
    translations: {
      // Common translations
      'common.save': 'Enregistrer',
      'common.cancel': 'Annuler',
      'common.delete': 'Supprimer',
      'common.edit': 'Modifier',
      'common.add': 'Ajouter',
      'common.search': 'Rechercher',
      'common.filter': 'Filtrer',
      'common.export': 'Exporter',
      'common.import': 'Importer',
      'common.loading': 'Chargement...',
      'common.error': 'Erreur',
      'common.success': 'Succès',
      // Localization
      'localization.title': 'Gestion de la localisation',
      'localization.languages': 'Langues',
      'localization.translations': 'Traductions',
      // Notifications
      'notifications.title': 'Centre de notifications',
      'notifications.markAsRead': 'Marquer comme lu',
      'notifications.delete': 'Supprimer',
      // Menu Management
      'menu.title': 'Gestion du menu',
      'menu.categories': 'Catégories',
      'menu.items': 'Articles',
      // Order Tracking
      'orders.title': 'Suivi des commandes',
      'orders.status': 'Statut',
      'orders.details': 'Détails',
      // Analytics
      'analytics.title': 'Analyses avancées',
      'analytics.revenue': 'Chiffre d\'affaires',
      'analytics.orders': 'Commandes',
      // Security
      'security.title': 'Gestion de la sécurité',
      'security.users': 'Utilisateurs',
      'security.permissions': 'Permissions',
      // Media
      'media.title': 'Gestion des médias',
      'media.upload': 'Télécharger',
      'media.gallery': 'Galerie',
      // Inventory
      'inventory.title': 'Gestion des stocks',
      'inventory.products': 'Produits',
      'inventory.stock': 'Stock',
      // POS
      'pos.title': 'Module POS unifié',
      'pos.orders': 'Commandes',
      'pos.payment': 'Paiement',
      // Real-time Analytics
      'realtime.title': 'Analyses en temps réel',
      'realtime.dashboard': 'Tableau de bord',
      'realtime.metrics': 'Métriques',
    },
    t: (key: string, params?: Record<string, string | number>) => {
      const translations: Record<string, string> = {
        // Common translations
        'common.save': 'Enregistrer',
        'common.cancel': 'Annuler',
        'common.delete': 'Supprimer',
        'common.edit': 'Modifier',
        'common.add': 'Ajouter',
        'common.search': 'Rechercher',
        'common.filter': 'Filtrer',
        'common.export': 'Exporter',
        'common.import': 'Importer',
        'common.loading': 'Chargement...',
        'common.error': 'Erreur',
        'common.success': 'Succès',
        // Localization
        'localization.title': 'Gestion de la localisation',
        'localization.languages': 'Langues',
        'localization.translations': 'Traductions',
        // Notifications
        'notifications.title': 'Centre de notifications',
        'notifications.markAsRead': 'Marquer comme lu',
        'notifications.delete': 'Supprimer',
        // Menu Management
        'menu.title': 'Gestion du menu',
        'menu.categories': 'Catégories',
        'menu.items': 'Articles',
        // Order Tracking
        'orders.title': 'Suivi des commandes',
        'orders.status': 'Statut',
        'orders.details': 'Détails',
        // Analytics
        'analytics.title': 'Analyses avancées',
        'analytics.revenue': 'Chiffre d\'affaires',
        'analytics.orders': 'Commandes',
        // Security
        'security.title': 'Gestion de la sécurité',
        'security.users': 'Utilisateurs',
        'security.permissions': 'Permissions',
        // Media
        'media.title': 'Gestion des médias',
        'media.upload': 'Télécharger',
        'media.gallery': 'Galerie',
        // Inventory
        'inventory.title': 'Gestion des stocks',
        'inventory.products': 'Produits',
        'inventory.stock': 'Stock',
        // POS
        'pos.title': 'Module POS unifié',
        'pos.orders': 'Commandes',
        'pos.payment': 'Paiement',
        // Real-time Analytics
        'realtime.title': 'Analyses en temps réel',
        'realtime.dashboard': 'Tableau de bord',
        'realtime.metrics': 'Métriques',
      };

      let translation = translations[key] || key;

      // Handle parameter substitution
      if (params) {
        Object.entries(params).forEach(([param, paramValue]) => {
          translation = translation.replace(`{{${param}}}`, String(paramValue));
        });
      }

      return translation;
    },
    changeLanguage: jest.fn(),
    isLoading: false,
  };

  return (
    <I18nContext.Provider value={mockI18nValue}>
      {children}
    </I18nContext.Provider>
  );
};

// Common test mocks
export const commonMocks = {
  // Mock next/image
  nextImage: () => {
    jest.mock('next/image', () => ({
      __esModule: true,
      default: ({ src, alt, ...props }: any) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} {...props} />
      ),
    }));
  },

  // Mock react-hot-toast
  reactHotToast: () => {
    jest.mock('react-hot-toast', () => ({
      __esModule: true,
      default: {
        success: jest.fn(),
        error: jest.fn(),
        loading: jest.fn(),
      },
      toast: {
        success: jest.fn(),
        error: jest.fn(),
        loading: jest.fn(),
      },
    }));
  },

  // Mock use-toast hook
  useToast: () => {
    jest.mock('@/hooks/use-toast', () => ({
      useToast: () => ({
        toast: jest.fn(),
      }),
    }));
  },

  // Mock Supabase integration service
  supabaseIntegration: (mockData: any = {}) => {
    jest.mock('@/lib/supabase-integration-service', () => ({
      supabaseIntegrationService: {
        checkConnection: jest.fn().mockResolvedValue(true),
        executeQuery: jest.fn().mockResolvedValue(mockData.queryResult || []),
        executeMutation: jest.fn().mockResolvedValue({ success: true }),
        Queries: {
          ...mockData.Queries,
        },
      },
    }));
  },
};