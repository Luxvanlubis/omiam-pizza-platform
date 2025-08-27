// Service de gestion des profils clients

import { 
  CustomerProfile, 
  CreateCustomerProfileRequest, 
  UpdateCustomerProfileRequest,
  CustomerStats,
  PersonalizedRecommendation,
  CustomerNotification,
  ReservationHistoryItem,
  MembershipTier,
  NotificationType
} from '@/types/customer';

// Simulation d'une base de données en mémoire
let customerProfiles: CustomerProfile[] = [];
let customerNotifications: CustomerNotification[] = [];

export class CustomerService {
  // Créer un nouveau profil client
  static async createProfile(data: CreateCustomerProfileRequest): Promise<CustomerProfile> {
    const existingCustomer = customerProfiles.find(c => c.email === data.email);
    if (existingCustomer) {
      throw new Error('Un client avec cet email existe déjà');
    }

    const newProfile: CustomerProfile = {
      id: `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      dateOfBirth: data.dateOfBirth,
      preferences: {
        preferredSeating: 'table',
        preferredTimeSlots: [],
        favoriteOccasions: [],
        communicationPreferences: {
          emailNotifications: true,
          smsNotifications: false,
          promotionalEmails: true,
          reminderNotifications: true,
          preferredLanguage: 'fr',
          contactMethod: 'email'
        },
        ambiance: 'casual',
        serviceStyle: 'standard',
        ...data.preferences
      },
      reservationHistory: [],
      loyaltyPoints: 0,
      membershipTier: 'bronze',
      createdAt: new Date(),
      updatedAt: new Date(),
      totalVisits: 0,
      averageSpending: 0,
      specialRequests: data.specialRequests || [],
      allergies: data.allergies || [],
      dietaryRestrictions: data.dietaryRestrictions || []
    };

    customerProfiles.push(newProfile);
    
    // Créer une notification de bienvenue
    await this.createNotification(newProfile.id, {
      type: 'special-offer',
      title: 'Bienvenue chez OMIAM !',
      message: 'Merci de nous avoir rejoint. Profitez de 10% de réduction sur votre première réservation.',
      metadata: { discount: 10, isWelcomeOffer: true }
    });

    return newProfile;
  }

  // Récupérer un profil client par ID
  static async getProfile(customerId: string): Promise<CustomerProfile | null> {
    return customerProfiles.find(c => c.id === customerId) || null;
  }

  // Récupérer un profil client par email
  static async getProfileByEmail(email: string): Promise<CustomerProfile | null> {
    return customerProfiles.find(c => c.email === email) || null;
  }

  // Mettre à jour un profil client
  static async updateProfile(customerId: string, data: UpdateCustomerProfileRequest): Promise<CustomerProfile> {
    const profileIndex = customerProfiles.findIndex(c => c.id === customerId);
    if (profileIndex === -1) {
      throw new Error('Profil client non trouvé');
    }

    const updatedProfile = {
      ...customerProfiles[profileIndex],
      ...data,
      preferences: {
        ...customerProfiles[profileIndex].preferences,
        ...data.preferences
      },
      updatedAt: new Date()
    };

    customerProfiles[profileIndex] = updatedProfile;
    return updatedProfile;
  }

  // Ajouter une réservation à l'historique
  static async addReservationToHistory(customerId: string, reservation: ReservationHistoryItem): Promise<void> {
    const profile = await this.getProfile(customerId);
    if (!profile) {
      throw new Error('Profil client non trouvé');
    }

    profile.reservationHistory.unshift(reservation);
    profile.totalVisits += reservation.status === 'completed' ? 1 : 0;
    profile.lastVisit = reservation.status === 'completed' ? reservation.date : profile.lastVisit;
    
    // Calculer la dépense moyenne
    const completedReservations = profile.reservationHistory.filter(r => r.status === 'completed' && r.totalAmount);
    if (completedReservations.length > 0) {
      profile.averageSpending = completedReservations.reduce((sum, r) => sum + (r.totalAmount || 0), 0) / completedReservations.length;
    }

    // Ajouter des points de fidélité
    if (reservation.status === 'completed' && reservation.totalAmount) {
      const pointsEarned = Math.floor(reservation.totalAmount * 0.1); // 10% en points
      profile.loyaltyPoints += pointsEarned;
      
      // Mettre à jour le niveau de membership
      profile.membershipTier = this.calculateMembershipTier(profile.loyaltyPoints, profile.totalVisits);
    }

    profile.updatedAt = new Date();
  }

  // Calculer le niveau de membership
  private static calculateMembershipTier(loyaltyPoints: number, totalVisits: number): MembershipTier {
    if (loyaltyPoints >= 5000 || totalVisits >= 50) return 'vip';
    if (loyaltyPoints >= 2000 || totalVisits >= 25) return 'platinum';
    if (loyaltyPoints >= 1000 || totalVisits >= 15) return 'gold';
    if (loyaltyPoints >= 500 || totalVisits >= 8) return 'silver';
    return 'bronze';
  }

  // Obtenir les statistiques d'un client
  static async getCustomerStats(customerId: string): Promise<CustomerStats> {
    const profile = await this.getProfile(customerId);
    if (!profile) {
      throw new Error('Profil client non trouvé');
    }

    const history = profile.reservationHistory;
    const completedReservations = history.filter(r => r.status === 'completed');
    const cancelledReservations = history.filter(r => r.status === 'cancelled');
    const noShowReservations = history.filter(r => r.status === 'no-show');

    // Analyser les préférences
    const timeSlotCounts = history.reduce((acc, r) => {
      acc[r.time] = (acc[r.time] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const occasionCounts = history.reduce((acc, r) => {
      if (r.occasion) {
        acc[r.occasion] = (acc[r.occasion] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const favoriteTimeSlot = Object.entries(timeSlotCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || '';
    const mostFrequentOccasion = Object.entries(occasionCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || '';

    return {
      totalReservations: history.length,
      completedReservations: completedReservations.length,
      cancelledReservations: cancelledReservations.length,
      noShowCount: noShowReservations.length,
      averagePartySize: history.length > 0 ? history.reduce((sum, r) => sum + r.partySize, 0) / history.length : 0,
      favoriteTimeSlot,
      mostFrequentOccasion,
      loyaltyPointsEarned: profile.loyaltyPoints,
      loyaltyPointsUsed: 0, // À implémenter
      memberSince: profile.createdAt,
      lastReservation: history[0]?.date,
      upcomingReservations: history.filter(r => r.status === 'confirmed' && r.date > new Date()).length
    };
  }

  // Générer des recommandations personnalisées
  static async getPersonalizedRecommendations(customerId: string): Promise<PersonalizedRecommendation[]> {
    const profile = await this.getProfile(customerId);
    if (!profile) {
      return [];
    }

    const recommendations: PersonalizedRecommendation[] = [];
    const history = profile.reservationHistory;

    // Recommandation de table basée sur l'historique
    if (profile.favoriteTable) {
      recommendations.push({
        type: 'table',
        title: 'Votre table préférée',
        description: `Table ${profile.favoriteTable} - votre choix habituel`,
        confidence: 0.9,
        reason: 'Basé sur vos réservations précédentes',
        data: { tableId: profile.favoriteTable }
      });
    }

    // Recommandation de créneau horaire
    const timeSlotCounts = history.reduce((acc, r) => {
      acc[r.time] = (acc[r.time] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const favoriteTime = Object.entries(timeSlotCounts).sort(([,a], [,b]) => b - a)[0];
    if (favoriteTime && favoriteTime[1] >= 2) {
      recommendations.push({
        type: 'time',
        title: 'Votre créneau préféré',
        description: `${favoriteTime[0]} - votre horaire habituel`,
        confidence: 0.8,
        reason: `Vous avez réservé ${favoriteTime[1]} fois à cette heure`,
        data: { timeSlot: favoriteTime[0] }
      });
    }

    // Recommandation d'occasion
    const occasionCounts = history.reduce((acc, r) => {
      if (r.occasion) {
        acc[r.occasion] = (acc[r.occasion] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    const favoriteOccasion = Object.entries(occasionCounts).sort(([,a], [,b]) => b - a)[0];
    if (favoriteOccasion && favoriteOccasion[1] >= 2) {
      recommendations.push({
        type: 'occasion',
        title: 'Occasion suggérée',
        description: `${favoriteOccasion[0]} - votre occasion favorite`,
        confidence: 0.7,
        reason: `Vous avez choisi cette occasion ${favoriteOccasion[1]} fois`,
        data: { occasion: favoriteOccasion[0] }
      });
    }

    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }

  // Créer une notification
  static async createNotification(customerId: string, notification: Omit<CustomerNotification, 'id' | 'customerId' | 'isRead' | 'createdAt'>): Promise<CustomerNotification> {
    const newNotification: CustomerNotification = {
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      customerId,
      isRead: false,
      createdAt: new Date(),
      ...notification
    };

    customerNotifications.push(newNotification);
    return newNotification;
  }

  // Récupérer les notifications d'un client
  static async getNotifications(customerId: string, unreadOnly: boolean = false): Promise<CustomerNotification[]> {
    let notifications = customerNotifications.filter(n => n.customerId === customerId);
    
    if (unreadOnly) {
      notifications = notifications.filter(n => !n.isRead);
    }
    
    return notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Marquer une notification comme lue
  static async markNotificationAsRead(notificationId: string): Promise<void> {
    const notification = customerNotifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
    }
  }

  // Rechercher des clients
  static async searchCustomers(query: string): Promise<CustomerProfile[]> {
    const searchTerm = query.toLowerCase();
    return customerProfiles.filter(profile => 
      profile.firstName.toLowerCase().includes(searchTerm) ||
      profile.lastName.toLowerCase().includes(searchTerm) ||
      profile.email.toLowerCase().includes(searchTerm) ||
      (profile.phone && profile.phone.includes(searchTerm))
    );
  }

  // Obtenir tous les profils (pour l'administration)
  static async getAllProfiles(): Promise<CustomerProfile[]> {
    return customerProfiles.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  // Supprimer un profil client
  static async deleteProfile(customerId: string): Promise<void> {
    const profileIndex = customerProfiles.findIndex(c => c.id === customerId);
    if (profileIndex === -1) {
      throw new Error('Profil client non trouvé');
    }

    customerProfiles.splice(profileIndex, 1);
    
    // Supprimer aussi les notifications associées
    customerNotifications = customerNotifications.filter(n => n.customerId !== customerId);
  }

  // Initialiser avec des données de test
  static initializeTestData(): void {
    const testCustomers: CreateCustomerProfileRequest[] = [
      {
        email: 'marie.dupont@email.com',
        firstName: 'Marie',
        lastName: 'Dupont',
        phone: '+33123456789',
        preferences: {
          preferredSeating: 'window',
          preferredTimeSlots: ['19:00', '20:00'],
          favoriteOccasions: ['anniversaire', 'romantique'],
          ambiance: 'romantic',
          serviceStyle: 'attentive'
        },
        dietaryRestrictions: ['vegetarian']
      },
      {
        email: 'jean.martin@email.com',
        firstName: 'Jean',
        lastName: 'Martin',
        phone: '+33987654321',
        preferences: {
          preferredSeating: 'bar',
          preferredTimeSlots: ['18:30', '21:00'],
          favoriteOccasions: ['business', 'casual'],
          ambiance: 'lively',
          serviceStyle: 'minimal'
        }
      }
    ];

    testCustomers.forEach(async (customer) => {
      try {
        await this.createProfile(customer);
      } catch (error) {
        // Ignorer si le client existe déjà
      }
    });
  }
}

// Initialiser les données de test au chargement
if (typeof window !== 'undefined') {
  CustomerService.initializeTestData();
}

// Export d'une instance pour compatibilité avec les imports existants
export const customerService = {
  getCustomerProfile: CustomerService.getProfile,
  getProfileByEmail: CustomerService.getProfileByEmail,
  createProfile: CustomerService.createProfile,
  updateProfile: CustomerService.updateProfile,
  addReservationToHistory: CustomerService.addReservationToHistory,
  getCustomerStats: CustomerService.getCustomerStats,
  getPersonalizedRecommendations: CustomerService.getPersonalizedRecommendations,
  createNotification: CustomerService.createNotification,
  getNotifications: CustomerService.getNotifications,
  markNotificationAsRead: CustomerService.markNotificationAsRead,
  searchCustomers: CustomerService.searchCustomers,
  getAllProfiles: CustomerService.getAllProfiles,
  deleteProfile: CustomerService.deleteProfile
};

// Export par défaut de la classe
export default CustomerService;