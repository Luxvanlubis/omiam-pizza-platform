export interface WaitlistEntry {
  id: string;
  customerId?: string; // ID du profil client si connecté
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  guestCount: number;
  preferredDate: string; // Format ISO date
  preferredTimeSlots: string[]; // Créneaux horaires préférés
  seatingPreference?: 'indoor' | 'outdoor' | 'bar' | 'private' | 'no-preference';
  occasion?: string;
  specialRequests?: string;
  dietaryRestrictions?: string[];
  allergies?: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'waiting' | 'notified' | 'confirmed' | 'expired' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date; // Expiration automatique si pas de réponse
  notificationsSent: WaitlistNotification[];
  estimatedWaitTime?: number; // En minutes
  position?: number; // Position dans la liste d'attente
}

export interface WaitlistNotification {
  id: string;
  type: 'sms' | 'email' | 'push' | 'call';
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  sentAt?: Date;
  content: string;
  metadata?: Record<string, any>;
}

export interface WaitlistAvailability {
  date: string;
  timeSlot: string;
  availableTables: number;
  tableIds: string[];
  seatingTypes: ('indoor' | 'outdoor' | 'bar' | 'private')[];
}

export interface WaitlistStats {
  totalEntries: number;
  activeEntries: number;
  confirmedToday: number;
  averageWaitTime: number;
  conversionRate: number; // Pourcentage de liste d'attente convertie en réservation
  byTimeSlot: Record<string, number>;
  bySeatingPreference: Record<string, number>;
}

export interface WaitlistCreateRequest {
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  guestCount: number;
  preferredDate: string;
  preferredTimeSlots: string[];
  seatingPreference?: 'indoor' | 'outdoor' | 'bar' | 'private' | 'no-preference';
  occasion?: string;
  specialRequests?: string;
  dietaryRestrictions?: string[];
  allergies?: string[];
  notificationPreferences: {
    sms: boolean;
    email: boolean;
    push: boolean;
    call: boolean;
  };
}

export interface WaitlistUpdateRequest {
  preferredTimeSlots?: string[];
  seatingPreference?: 'indoor' | 'outdoor' | 'bar' | 'private' | 'no-preference';
  occasion?: string;
  specialRequests?: string;
  dietaryRestrictions?: string[];
  allergies?: string[];
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'waiting' | 'notified' | 'confirmed' | 'expired' | 'cancelled';
}

export interface WaitlistSearchFilters {
  status?: WaitlistEntry['status'][];
  priority?: WaitlistEntry['priority'][];
  dateRange?: {
    start: string;
    end: string;
  };
  guestCountRange?: {
    min: number;
    max: number;
  };
  seatingPreference?: WaitlistEntry['seatingPreference'][];
  customerId?: string;
  searchTerm?: string; // Recherche par nom, email, téléphone
}

export interface WaitlistMatchResult {
  waitlistEntry: WaitlistEntry;
  availableSlots: WaitlistAvailability[];
  matchScore: number; // Score de correspondance (0-100)
  reasons: string[]; // Raisons du match (créneau préféré, type de table, etc.)
}

export interface WaitlistNotificationTemplate {
  id: string;
  name: string;
  type: 'availability' | 'reminder' | 'expiration' | 'confirmation';
  channels: ('sms' | 'email' | 'push' | 'call')[];
  subject?: string; // Pour email
  content: string;
  variables: string[]; // Variables disponibles dans le template
  isActive: boolean;
}

export interface WaitlistConfiguration {
  maxWaitTime: number; // Temps maximum d'attente en heures
  notificationIntervals: number[]; // Intervalles de notification en minutes
  autoExpireAfter: number; // Auto-expiration après X heures sans réponse
  maxEntriesPerCustomer: number;
  priorityRules: {
    vipCustomers: boolean;
    largeGroups: boolean;
    specialOccasions: string[];
    loyaltyLevelBonus: Record<string, number>;
  };
  notificationSettings: {
    enableSMS: boolean;
    enableEmail: boolean;
    enablePush: boolean;
    enableCall: boolean;
    businessHoursOnly: boolean;
    quietHours: {
      start: string;
      end: string;
    };
  };
}