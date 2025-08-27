import {
  WaitlistEntry,
  WaitlistCreateRequest,
  WaitlistUpdateRequest,
  WaitlistSearchFilters,
  WaitlistStats,
  WaitlistAvailability,
  WaitlistMatchResult,
  WaitlistNotification,
  WaitlistConfiguration,
  WaitlistNotificationTemplate
} from '@/types/waitlist';

// Simulation d'une base de données en mémoire
let waitlistEntries: WaitlistEntry[] = [];
let notificationTemplates: WaitlistNotificationTemplate[] = [];
let waitlistConfig: WaitlistConfiguration = {
  maxWaitTime: 24, // 24 heures
  notificationIntervals: [30, 60, 120], // 30min, 1h, 2h
  autoExpireAfter: 4, // 4 heures sans réponse
  maxEntriesPerCustomer: 3,
  priorityRules: {
    vipCustomers: true,
    largeGroups: true,
    specialOccasions: ['anniversaire', 'demande en mariage', 'business'],
    loyaltyLevelBonus: {
      bronze: 0,
      silver: 10,
      gold: 20,
      platinum: 30
    }
  },
  notificationSettings: {
    enableSMS: true,
    enableEmail: true,
    enablePush: true,
    enableCall: false,
    businessHoursOnly: true,
    quietHours: {
      start: '22:00',
      end: '08:00'
    }
  }
};

// Initialisation des templates de notification
const initializeNotificationTemplates = () => {
  notificationTemplates = [
    {
      id: 'availability-notification',
      name: 'Notification de disponibilité',
      type: 'availability',
      channels: ['sms', 'email'],
      subject: 'Table disponible chez OMIAM !',
      content: 'Bonjour {{customerName}}, une table pour {{guestCount}} personnes est maintenant disponible le {{date}} à {{timeSlot}}. Confirmez avant {{expirationTime}} : {{confirmationLink}}',
      variables: ['customerName', 'guestCount', 'date', 'timeSlot', 'expirationTime', 'confirmationLink'],
      isActive: true
    },
    {
      id: 'reminder-notification',
      name: 'Rappel liste d\'attente',
      type: 'reminder',
      channels: ['email'],
      subject: 'Votre demande de réservation chez OMIAM',
      content: 'Bonjour {{customerName}}, vous êtes en position {{position}} sur notre liste d\'attente pour le {{date}}. Temps d\'attente estimé : {{estimatedWaitTime}} minutes.',
      variables: ['customerName', 'position', 'date', 'estimatedWaitTime'],
      isActive: true
    },
    {
      id: 'expiration-warning',
      name: 'Avertissement d\'expiration',
      type: 'expiration',
      channels: ['sms', 'email'],
      subject: 'Votre demande expire bientôt',
      content: 'Bonjour {{customerName}}, votre demande de réservation expire dans {{timeRemaining}}. Contactez-nous pour la prolonger.',
      variables: ['customerName', 'timeRemaining'],
      isActive: true
    }
  ];
};

// Initialiser les templates
initializeNotificationTemplates();

// Données de test
const initializeTestData = () => {
  const testEntries: Partial<WaitlistEntry>[] = [
    {
      customerName: 'Marie Dubois',
      customerEmail: 'marie.dubois@email.com',
      customerPhone: '+33123456789',
      guestCount: 2,
      preferredDate: '2024-01-20',
      preferredTimeSlots: ['19:00', '19:30', '20:00'],
      seatingPreference: 'indoor',
      occasion: 'anniversaire',
      priority: 'high',
      status: 'waiting'
    },
    {
      customerName: 'Jean Martin',
      customerEmail: 'jean.martin@email.com',
      customerPhone: '+33987654321',
      guestCount: 4,
      preferredDate: '2024-01-20',
      preferredTimeSlots: ['20:00', '20:30'],
      seatingPreference: 'outdoor',
      priority: 'medium',
      status: 'waiting'
    },
    {
      customerName: 'Sophie Laurent',
      customerEmail: 'sophie.laurent@email.com',
      customerPhone: '+33555666777',
      guestCount: 6,
      preferredDate: '2024-01-21',
      preferredTimeSlots: ['19:30', '20:00'],
      seatingPreference: 'private',
      occasion: 'business',
      priority: 'high',
      status: 'notified'
    }
  ];

  testEntries.forEach(entry => {
    const now = new Date();
    const fullEntry: WaitlistEntry = {
      id: `waitlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      customerId: undefined,
      customerName: entry.customerName!,
      customerEmail: entry.customerEmail!,
      customerPhone: entry.customerPhone!,
      guestCount: entry.guestCount!,
      preferredDate: entry.preferredDate!,
      preferredTimeSlots: entry.preferredTimeSlots!,
      seatingPreference: entry.seatingPreference,
      occasion: entry.occasion,
      priority: entry.priority!,
      status: entry.status!,
      createdAt: now,
      updatedAt: now,
      notificationsSent: [],
      estimatedWaitTime: Math.floor(Math.random() * 120) + 30,
      position: waitlistEntries.length + 1
    };
    waitlistEntries.push(fullEntry);
  });
};

// Initialiser les données de test
initializeTestData();

export class WaitlistService {
  // Créer une nouvelle entrée dans la liste d'attente
  static async createWaitlistEntry(request: WaitlistCreateRequest): Promise<WaitlistEntry> {
    // Vérifier le nombre maximum d'entrées par client
    if (request.customerId) {
      const existingEntries = waitlistEntries.filter(
        entry => entry.customerId === request.customerId && 
        ['waiting', 'notified'].includes(entry.status)
      );
      if (existingEntries.length >= waitlistConfig.maxEntriesPerCustomer) {
        throw new Error(`Maximum ${waitlistConfig.maxEntriesPerCustomer} entrées actives par client`);
      }
    }

    const now = new Date();
    const entry: WaitlistEntry = {
      id: `waitlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      customerId: request.customerId,
      customerName: request.customerName,
      customerEmail: request.customerEmail,
      customerPhone: request.customerPhone,
      guestCount: request.guestCount,
      preferredDate: request.preferredDate,
      preferredTimeSlots: request.preferredTimeSlots,
      seatingPreference: request.seatingPreference,
      occasion: request.occasion,
      specialRequests: request.specialRequests,
      dietaryRestrictions: request.dietaryRestrictions,
      allergies: request.allergies,
      priority: this.calculatePriority(request),
      status: 'waiting',
      createdAt: now,
      updatedAt: now,
      notificationsSent: [],
      estimatedWaitTime: this.calculateEstimatedWaitTime(request),
      position: this.calculatePosition(request)
    };

    waitlistEntries.push(entry);
    this.updatePositions();
    
    // Envoyer notification de confirmation
    await this.sendNotification(entry.id, 'confirmation');
    
    return entry;
  }

  // Calculer la priorité basée sur les règles
  private static calculatePriority(request: WaitlistCreateRequest): 'low' | 'medium' | 'high' | 'urgent' {
    let score = 0;

    // Bonus pour les grandes tables
    if (waitlistConfig.priorityRules.largeGroups && request.guestCount >= 6) {
      score += 20;
    }

    // Bonus pour les occasions spéciales
    if (request.occasion && waitlistConfig.priorityRules.specialOccasions.includes(request.occasion.toLowerCase())) {
      score += 30;
    }

    // Bonus pour les clients VIP (à implémenter avec le système de fidélité)
    // if (request.customerId && isVipCustomer(request.customerId)) {
    //   score += 40;
    // }

    if (score >= 50) return 'urgent';
    if (score >= 30) return 'high';
    if (score >= 15) return 'medium';
    return 'low';
  }

  // Calculer le temps d'attente estimé
  private static calculateEstimatedWaitTime(request: WaitlistCreateRequest): number {
    const baseWaitTime = 60; // 1 heure de base
    const guestCountMultiplier = request.guestCount > 4 ? 1.5 : 1;
    const dateDistance = Math.abs(new Date(request.preferredDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
    const dateMultiplier = dateDistance < 1 ? 2 : 1; // Double si c'est pour aujourd'hui
    
    return Math.floor(baseWaitTime * guestCountMultiplier * dateMultiplier);
  }

  // Calculer la position dans la liste
  private static calculatePosition(request: WaitlistCreateRequest): number {
    const sameDate = waitlistEntries.filter(
      entry => entry.preferredDate === request.preferredDate && 
      ['waiting', 'notified'].includes(entry.status)
    );
    return sameDate.length + 1;
  }

  // Mettre à jour les positions
  private static updatePositions(): void {
    const activeEntries = waitlistEntries.filter(entry => ['waiting', 'notified'].includes(entry.status));
    const groupedByDate = activeEntries.reduce((acc, entry) => {
      if (!acc[entry.preferredDate]) acc[entry.preferredDate] = [];
      acc[entry.preferredDate].push(entry);
      return acc;
    }, {} as Record<string, WaitlistEntry[]>);

    Object.values(groupedByDate).forEach(entries => {
      entries
        .sort((a, b) => {
          // Trier par priorité puis par date de création
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
          if (priorityDiff !== 0) return priorityDiff;
          return a.createdAt.getTime() - b.createdAt.getTime();
        })
        .forEach((entry, index) => {
          entry.position = index + 1;
        });
    });
  }

  // Obtenir une entrée par ID
  static async getWaitlistEntry(id: string): Promise<WaitlistEntry | null> {
    return waitlistEntries.find(entry => entry.id === id) || null;
  }

  // Mettre à jour une entrée
  static async updateWaitlistEntry(id: string, updates: WaitlistUpdateRequest): Promise<WaitlistEntry | null> {
    const entryIndex = waitlistEntries.findIndex(entry => entry.id === id);
    if (entryIndex === -1) return null;

    const entry = waitlistEntries[entryIndex];
    const updatedEntry = {
      ...entry,
      ...updates,
      updatedAt: new Date()
    };

    waitlistEntries[entryIndex] = updatedEntry;
    this.updatePositions();
    
    return updatedEntry;
  }

  // Supprimer une entrée
  static async deleteWaitlistEntry(id: string): Promise<boolean> {
    const initialLength = waitlistEntries.length;
    waitlistEntries = waitlistEntries.filter(entry => entry.id !== id);
    this.updatePositions();
    return waitlistEntries.length < initialLength;
  }

  // Rechercher des entrées
  static async searchWaitlistEntries(filters: WaitlistSearchFilters = {}): Promise<WaitlistEntry[]> {
    let results = [...waitlistEntries];

    if (filters.status?.length) {
      results = results.filter(entry => filters.status!.includes(entry.status));
    }

    if (filters.priority?.length) {
      results = results.filter(entry => filters.priority!.includes(entry.priority));
    }

    if (filters.dateRange) {
      const start = new Date(filters.dateRange.start);
      const end = new Date(filters.dateRange.end);
      results = results.filter(entry => {
        const entryDate = new Date(entry.preferredDate);
        return entryDate >= start && entryDate <= end;
      });
    }

    if (filters.guestCountRange) {
      results = results.filter(entry => 
        entry.guestCount >= filters.guestCountRange!.min && 
        entry.guestCount <= filters.guestCountRange!.max
      );
    }

    if (filters.seatingPreference?.length) {
      results = results.filter(entry => 
        entry.seatingPreference && filters.seatingPreference!.includes(entry.seatingPreference)
      );
    }

    if (filters.customerId) {
      results = results.filter(entry => entry.customerId === filters.customerId);
    }

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      results = results.filter(entry => 
        entry.customerName.toLowerCase().includes(term) ||
        entry.customerEmail.toLowerCase().includes(term) ||
        entry.customerPhone.includes(term)
      );
    }

    return results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Obtenir les statistiques
  static async getWaitlistStats(): Promise<WaitlistStats> {
    const totalEntries = waitlistEntries.length;
    const activeEntries = waitlistEntries.filter(entry => ['waiting', 'notified'].includes(entry.status)).length;
    const confirmedToday = waitlistEntries.filter(entry => {
      const today = new Date().toISOString().split('T')[0];
      return entry.status === 'confirmed' && entry.updatedAt.toISOString().split('T')[0] === today;
    }).length;

    const waitTimes = waitlistEntries
      .filter(entry => entry.estimatedWaitTime)
      .map(entry => entry.estimatedWaitTime!);
    const averageWaitTime = waitTimes.length > 0 ? waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length : 0;

    const confirmedEntries = waitlistEntries.filter(entry => entry.status === 'confirmed').length;
    const conversionRate = totalEntries > 0 ? (confirmedEntries / totalEntries) * 100 : 0;

    const byTimeSlot = waitlistEntries.reduce((acc, entry) => {
      entry.preferredTimeSlots.forEach(slot => {
        acc[slot] = (acc[slot] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const bySeatingPreference = waitlistEntries.reduce((acc, entry) => {
      if (entry.seatingPreference) {
        acc[entry.seatingPreference] = (acc[entry.seatingPreference] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      totalEntries,
      activeEntries,
      confirmedToday,
      averageWaitTime: Math.round(averageWaitTime),
      conversionRate: Math.round(conversionRate * 100) / 100,
      byTimeSlot,
      bySeatingPreference
    };
  }

  // Trouver des correspondances pour les disponibilités
  static async findMatches(availability: WaitlistAvailability[]): Promise<WaitlistMatchResult[]> {
    const activeEntries = waitlistEntries.filter(entry => ['waiting'].includes(entry.status));
    const matches: WaitlistMatchResult[] = [];

    for (const entry of activeEntries) {
      const matchingSlots = availability.filter(slot => {
        const dateMatch = slot.date === entry.preferredDate;
        const timeMatch = entry.preferredTimeSlots.includes(slot.timeSlot);
        const capacityMatch = slot.availableTables > 0;
        const seatingMatch = !entry.seatingPreference || 
          entry.seatingPreference === 'no-preference' || 
          slot.seatingTypes.includes(entry.seatingPreference);
        
        return dateMatch && timeMatch && capacityMatch && seatingMatch;
      });

      if (matchingSlots.length > 0) {
        let matchScore = 50; // Score de base
        const reasons: string[] = [];

        // Bonus pour correspondance exacte du créneau préféré
        if (matchingSlots.some(slot => entry.preferredTimeSlots[0] === slot.timeSlot)) {
          matchScore += 20;
          reasons.push('Créneau horaire préféré disponible');
        }

        // Bonus pour correspondance du type de siège
        if (entry.seatingPreference && entry.seatingPreference !== 'no-preference') {
          if (matchingSlots.some(slot => slot.seatingTypes.includes(entry.seatingPreference!))) {
            matchScore += 15;
            reasons.push('Type de siège préféré disponible');
          }
        }

        // Bonus pour priorité élevée
        if (entry.priority === 'urgent') matchScore += 25;
        else if (entry.priority === 'high') matchScore += 15;
        else if (entry.priority === 'medium') matchScore += 5;

        // Bonus pour ancienneté dans la liste
        const hoursWaiting = (new Date().getTime() - entry.createdAt.getTime()) / (1000 * 60 * 60);
        if (hoursWaiting > 24) matchScore += 10;
        else if (hoursWaiting > 12) matchScore += 5;

        matches.push({
          waitlistEntry: entry,
          availableSlots: matchingSlots,
          matchScore: Math.min(matchScore, 100),
          reasons
        });
      }
    }

    // Trier par score de correspondance décroissant
    return matches.sort((a, b) => b.matchScore - a.matchScore);
  }

  // Envoyer une notification
  static async sendNotification(entryId: string, type: 'availability' | 'reminder' | 'expiration' | 'confirmation'): Promise<boolean> {
    const entry = await this.getWaitlistEntry(entryId);
    if (!entry) return false;

    const template = notificationTemplates.find(t => t.type === type && t.isActive);
    if (!template) return false;

    const notification: WaitlistNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'email', // Par défaut email, à adapter selon les préférences
      status: 'pending',
      content: this.processNotificationTemplate(template.content, entry),
      metadata: {
        templateId: template.id,
        subject: template.subject
      }
    };

    // Simuler l'envoi
    setTimeout(() => {
      notification.status = 'sent';
      notification.sentAt = new Date();
    }, 1000);

    entry.notificationsSent.push(notification);
    entry.updatedAt = new Date();

    return true;
  }

  // Traiter le template de notification
  private static processNotificationTemplate(template: string, entry: WaitlistEntry): string {
    return template
      .replace('{{customerName}}', entry.customerName)
      .replace('{{guestCount}}', entry.guestCount.toString())
      .replace('{{date}}', new Date(entry.preferredDate).toLocaleDateString('fr-FR'))
      .replace('{{timeSlot}}', entry.preferredTimeSlots[0] || 'N/A')
      .replace('{{position}}', entry.position?.toString() || 'N/A')
      .replace('{{estimatedWaitTime}}', entry.estimatedWaitTime?.toString() || 'N/A');
  }

  // Nettoyer les entrées expirées
  static async cleanupExpiredEntries(): Promise<number> {
    const now = new Date();
    const initialCount = waitlistEntries.length;
    
    waitlistEntries = waitlistEntries.filter(entry => {
      if (entry.expiresAt && entry.expiresAt < now) {
        return false;
      }
      
      // Auto-expiration basée sur la configuration
      const hoursOld = (now.getTime() - entry.createdAt.getTime()) / (1000 * 60 * 60);
      if (entry.status === 'notified' && hoursOld > waitlistConfig.autoExpireAfter) {
        return false;
      }
      
      return true;
    });
    
    this.updatePositions();
    return initialCount - waitlistEntries.length;
  }

  // Obtenir la configuration
  static getConfiguration(): WaitlistConfiguration {
    return { ...waitlistConfig };
  }

  // Mettre à jour la configuration
  static updateConfiguration(updates: Partial<WaitlistConfiguration>): WaitlistConfiguration {
    waitlistConfig = { ...waitlistConfig, ...updates };
    return waitlistConfig;
  }

  // Obtenir les templates de notification
  static getNotificationTemplates(): WaitlistNotificationTemplate[] {
    return [...notificationTemplates];
  }

  // Obtenir toutes les entrées (pour l'admin)
  static async getAllEntries(): Promise<WaitlistEntry[]> {
    return [...waitlistEntries].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}