// Types et interfaces pour les profils clients

export interface CustomerProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: Date;
  preferences: CustomerPreferences;
  reservationHistory: ReservationHistoryItem[];
  loyaltyPoints: number;
  membershipTier: MembershipTier;
  createdAt: Date;
  updatedAt: Date;
  lastVisit?: Date;
  totalVisits: number;
  averageSpending: number;
  favoriteTable?: string;
  specialRequests?: string[];
  allergies?: string[];
  dietaryRestrictions?: DietaryRestriction[];
}

export interface CustomerPreferences {
  preferredSeating: SeatingPreference;
  preferredTimeSlots: string[];
  favoriteOccasions: string[];
  communicationPreferences: CommunicationPreferences;
  accessibilityNeeds?: AccessibilityNeed[];
  ambiance: AmbiancePreference;
  serviceStyle: ServiceStylePreference;
}

export interface ReservationHistoryItem {
  id: string;
  date: Date;
  time: string;
  partySize: number;
  tableId: string;
  occasion?: string;
  totalAmount?: number;
  rating?: number;
  feedback?: string;
  status: ReservationStatus;
  specialRequests?: string[];
  wasCancelled: boolean;
  wasNoShow: boolean;
}

export interface CommunicationPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  promotionalEmails: boolean;
  reminderNotifications: boolean;
  preferredLanguage: string;
  contactMethod: 'email' | 'sms' | 'both';
}

export type MembershipTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'vip';

export type SeatingPreference = 
  | 'window' 
  | 'quiet' 
  | 'social' 
  | 'private' 
  | 'bar' 
  | 'outdoor' 
  | 'booth' 
  | 'table';

export type DietaryRestriction = 
  | 'vegetarian' 
  | 'vegan' 
  | 'gluten-free' 
  | 'dairy-free' 
  | 'nut-free' 
  | 'kosher' 
  | 'halal' 
  | 'low-sodium' 
  | 'diabetic';

export type AccessibilityNeed = 
  | 'wheelchair' 
  | 'hearing-impaired' 
  | 'visual-impaired' 
  | 'mobility-assistance' 
  | 'service-animal';

export type AmbiancePreference = 
  | 'quiet' 
  | 'lively' 
  | 'romantic' 
  | 'family-friendly' 
  | 'business' 
  | 'casual';

export type ServiceStylePreference = 
  | 'attentive' 
  | 'minimal' 
  | 'standard' 
  | 'personalized';

export type ReservationStatus = 
  | 'confirmed' 
  | 'pending' 
  | 'cancelled' 
  | 'completed' 
  | 'no-show' 
  | 'seated';

// Interface pour la création d'un nouveau profil client
export interface CreateCustomerProfileRequest {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: Date;
  preferences?: Partial<CustomerPreferences>;
  specialRequests?: string[];
  allergies?: string[];
  dietaryRestrictions?: DietaryRestriction[];
}

// Interface pour la mise à jour d'un profil client
export interface UpdateCustomerProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: Date;
  preferences?: Partial<CustomerPreferences>;
  specialRequests?: string[];
  allergies?: string[];
  dietaryRestrictions?: DietaryRestriction[];
}

// Interface pour les statistiques client
export interface CustomerStats {
  totalReservations: number;
  completedReservations: number;
  cancelledReservations: number;
  noShowCount: number;
  averagePartySize: number;
  favoriteTimeSlot: string;
  mostFrequentOccasion: string;
  loyaltyPointsEarned: number;
  loyaltyPointsUsed: number;
  memberSince: Date;
  lastReservation?: Date;
  upcomingReservations: number;
}

// Interface pour les recommandations personnalisées
export interface PersonalizedRecommendation {
  type: 'table' | 'time' | 'occasion' | 'menu';
  title: string;
  description: string;
  confidence: number; // 0-1
  reason: string;
  data: any;
}

// Interface pour les notifications client
export interface CustomerNotification {
  id: string;
  customerId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  scheduledFor?: Date;
  metadata?: Record<string, any>;
}

export type NotificationType = 
  | 'reservation-reminder' 
  | 'reservation-confirmed' 
  | 'reservation-cancelled' 
  | 'loyalty-points' 
  | 'special-offer' 
  | 'birthday' 
  | 'anniversary' 
  | 'feedback-request';