import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Interfaces pour les paramètres système
export interface RestaurantSettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  logo?: string;
  currency: string;
  timezone: string;
  language: string;
}

export interface OpeningHours {
  [key: string]: {
    isOpen: boolean;
    openTime: string;
    closeTime: string;
    breakStart?: string;
    breakEnd?: string;
  };
}

export interface PaymentSettings {
  acceptCash: boolean;
  acceptCard: boolean;
  acceptMobile: boolean;
  taxRate: number;
  serviceCharge: number;
  tipSuggestions: number[];
  minimumOrderAmount: number;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  orderConfirmation: boolean;
  orderReady: boolean;
  promotionalEmails: boolean;
  loyaltyUpdates: boolean;
}

export interface SystemSettings {
  maintenanceMode: boolean;
  allowOnlineOrders: boolean;
  allowReservations: boolean;
  maxOrdersPerHour: number;
  orderPreparationTime: number;
  autoAcceptOrders: boolean;
  requireCustomerRegistration: boolean;
  enableLoyaltyProgram: boolean;
  enableReviews: boolean;
  dataRetentionDays: number;
}

export interface AllSettings {
  restaurant: RestaurantSettings;
  openingHours: OpeningHours;
  payment: PaymentSettings;
  notifications: NotificationSettings;
  system: SystemSettings;
}

// Valeurs par défaut
const defaultRestaurantSettings: RestaurantSettings = {
  name: 'Mon Restaurant',
  address: '123 Rue de la Paix, 75001 Paris',
  phone: '+33 1 23 45 67 89',
  email: 'contact@monrestaurant.fr',
  website: 'https://monrestaurant.fr',
  description: 'Un restaurant authentique proposant une cuisine délicieuse',
  currency: 'EUR',
  timezone: 'Europe/Paris',
  language: 'fr'
};

const defaultOpeningHours: OpeningHours = {
  monday: { isOpen: true, openTime: '11:00', closeTime: '22:00' },
  tuesday: { isOpen: true, openTime: '11:00', closeTime: '22:00' },
  wednesday: { isOpen: true, openTime: '11:00', closeTime: '22:00' },
  thursday: { isOpen: true, openTime: '11:00', closeTime: '22:00' },
  friday: { isOpen: true, openTime: '11:00', closeTime: '23:00' },
  saturday: { isOpen: true, openTime: '11:00', closeTime: '23:00' },
  sunday: { isOpen: true, openTime: '12:00', closeTime: '21:00' }
};

const defaultPaymentSettings: PaymentSettings = {
  acceptCash: true,
  acceptCard: true,
  acceptMobile: true,
  taxRate: 20,
  serviceCharge: 0,
  tipSuggestions: [10, 15, 20],
  minimumOrderAmount: 15
};

const defaultNotificationSettings: NotificationSettings = {
  emailNotifications: true,
  smsNotifications: false,
  pushNotifications: true,
  orderConfirmation: true,
  orderReady: true,
  promotionalEmails: false,
  loyaltyUpdates: true
};

const defaultSystemSettings: SystemSettings = {
  maintenanceMode: false,
  allowOnlineOrders: true,
  allowReservations: true,
  maxOrdersPerHour: 50,
  orderPreparationTime: 30,
  autoAcceptOrders: false,
  requireCustomerRegistration: false,
  enableLoyaltyProgram: true,
  enableReviews: true,
  dataRetentionDays: 365
};

interface SystemSettingsStore {
  settings: AllSettings;
  isLoading: boolean;
  error: string | null;
  
  // Actions pour les paramètres du restaurant
  updateRestaurantSettings: (settings: Partial<RestaurantSettings>) => void;
  
  // Actions pour les heures d'ouverture
  updateOpeningHours: (day: string, hours: Partial<OpeningHours[string]>) => void;
  
  // Actions pour les paramètres de paiement
  updatePaymentSettings: (settings: Partial<PaymentSettings>) => void;
  
  // Actions pour les notifications
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  
  // Actions pour les paramètres système
  updateSystemSettings: (settings: Partial<SystemSettings>) => void;
  
  // Actions générales
  loadSettings: () => Promise<void>;
  saveSettings: () => Promise<void>;
  resetToDefaults: () => void;
  exportSettings: () => string;
  importSettings: (settingsJson: string) => boolean;
}

export const useSystemSettingsStore = create<SystemSettingsStore>()(persist(
  (set, get) => ({
    settings: {
      restaurant: defaultRestaurantSettings,
      openingHours: defaultOpeningHours,
      payment: defaultPaymentSettings,
      notifications: defaultNotificationSettings,
      system: defaultSystemSettings
    },
    isLoading: false,
    error: null,

    updateRestaurantSettings: (newSettings) => {
      set((state) => ({
        settings: {
          ...state.settings,
          restaurant: { ...state.settings.restaurant, ...newSettings }
        }
      }));
    },

    updateOpeningHours: (day, hours) => {
      set((state) => ({
        settings: {
          ...state.settings,
          openingHours: {
            ...state.settings.openingHours,
            [day]: { ...state.settings.openingHours[day], ...hours }
          }
        }
      }));
    },

    updatePaymentSettings: (newSettings) => {
      set((state) => ({
        settings: {
          ...state.settings,
          payment: { ...state.settings.payment, ...newSettings }
        }
      }));
    },

    updateNotificationSettings: (newSettings) => {
      set((state) => ({
        settings: {
          ...state.settings,
          notifications: { ...state.settings.notifications, ...newSettings }
        }
      }));
    },

    updateSystemSettings: (newSettings) => {
      set((state) => ({
        settings: {
          ...state.settings,
          system: { ...state.settings.system, ...newSettings }
        }
      }));
    },

    loadSettings: async () => {
      set({ isLoading: true, error: null });
      try {
        // TODO: Implémenter le chargement depuis l'API/base de données
        // Pour l'instant, on utilise les paramètres du localStorage via persist
        set({ isLoading: false });
      } catch (error) {
        set({ 
          isLoading: false, 
          error: error instanceof Error ? error.message : 'Erreur lors du chargement des paramètres'
        });
      }
    },

    saveSettings: async () => {
      set({ isLoading: true, error: null });
      try {
        // TODO: Implémenter la sauvegarde vers l'API/base de données
        // Pour l'instant, la persistance se fait automatiquement via zustand/persist
        
        // Simulation d'un appel API
        await new Promise(resolve => setTimeout(resolve, 500));
        
        set({ isLoading: false });
      } catch (error) {
        set({ 
          isLoading: false, 
          error: error instanceof Error ? error.message : 'Erreur lors de la sauvegarde des paramètres'
        });
      }
    },

    resetToDefaults: () => {
      set({
        settings: {
          restaurant: defaultRestaurantSettings,
          openingHours: defaultOpeningHours,
          payment: defaultPaymentSettings,
          notifications: defaultNotificationSettings,
          system: defaultSystemSettings
        },
        error: null
      });
    },

    exportSettings: () => {
      const { settings } = get();
      return JSON.stringify(settings, null, 2);
    },

    importSettings: (settingsJson) => {
      try {
        const importedSettings = JSON.parse(settingsJson) as AllSettings;
        
        // Validation basique de la structure
        if (!importedSettings.restaurant || !importedSettings.openingHours || 
            !importedSettings.payment || !importedSettings.notifications || 
            !importedSettings.system) {
          throw new Error('Structure des paramètres invalide');
        }
        
        set({ settings: importedSettings, error: null });
        return true;
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Erreur lors de l\'importation des paramètres'
        });
        return false;
      }
    }
  }),
  {
    name: 'system-settings-storage',
    partialize: (state) => ({ settings: state.settings })
  }
));