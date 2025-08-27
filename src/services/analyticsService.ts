import {
  AnalyticsDashboard,
  AnalyticsFilters,
  AnalyticsInsight,
  ReservationStats,
  OccupancyStats,
  RevenueStats,
  CustomerStats,
  TimeSlotAnalytics,
  DayAnalytics,
  MonthlyTrends,
  PeakHoursAnalytics,
  SeasonalTrends,
  WaitlistAnalytics,
  TableAnalytics,
  ForecastData,
  ComparisonData,
  ExportOptions
} from '@/types/analytics';
import { Reservation } from '@/types/reservation';
import { Customer } from '@/types/customer';
import { WaitlistEntry } from '@/types/waitlist';

// Simulation de données pour la démo
class AnalyticsService {
  private static instance: AnalyticsService;
  private reservations: Reservation[] = [];
  private customers: Customer[] = [];
  private waitlistEntries: WaitlistEntry[] = [];

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  constructor() {
    this.generateMockData();
  }

  private generateMockData() {
    // Génération de données de test pour les 30 derniers jours
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Générer des réservations fictives
    for (let i = 0; i < 500; i++) {
      const date = new Date(thirtyDaysAgo.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000);
      const statuses = ['confirmed', 'completed', 'cancelled', 'no-show', 'pending'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      this.reservations.push({
        id: `res_${i}`,
        customerId: `cust_${Math.floor(i / 3)}`,
        date: date.toISOString().split('T')[0],
        time: `${Math.floor(Math.random() * 12) + 12}:${Math.random() > 0.5 ? '00' : '30'}`,
        guests: Math.floor(Math.random() * 8) + 1,
        tableId: `table_${Math.floor(Math.random() * 20) + 1}`,
        status: status as any,
        customerName: `Client ${Math.floor(i / 3)}`,
        customerEmail: `client${Math.floor(i / 3)}@example.com`,
        customerPhone: `+33${Math.floor(Math.random() * 900000000) + 100000000}`,
        specialRequests: Math.random() > 0.7 ? 'Allergie aux fruits de mer' : '',
        estimatedRevenue: Math.floor(Math.random() * 200) + 50,
        createdAt: new Date(date.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      });
    }

    // Générer des clients fictifs
    for (let i = 0; i < 150; i++) {
      this.customers.push({
        id: `cust_${i}`,
        name: `Client ${i}`,
        email: `client${i}@example.com`,
        phone: `+33${Math.floor(Math.random() * 900000000) + 100000000}`,
        totalReservations: Math.floor(Math.random() * 10) + 1,
        totalSpent: Math.floor(Math.random() * 2000) + 100,
        averagePartySize: Math.floor(Math.random() * 4) + 1,
        preferredTimeSlots: ['19:00', '20:00'],
        dietaryRestrictions: [],
        specialRequests: '',
        loyaltyPoints: Math.floor(Math.random() * 1000),
        createdAt: new Date(thirtyDaysAgo.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      });
    }
  }

  async getDashboard(filters?: AnalyticsFilters): Promise<AnalyticsDashboard> {
    const startDate = filters?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = filters?.endDate || new Date();

    const filteredReservations = this.filterReservations(this.reservations, filters);
    const filteredCustomers = this.filterCustomers(this.customers, filters);

    return {
      period: {
        start: startDate,
        end: endDate,
        label: this.getPeriodLabel(startDate, endDate)
      },
      reservations: this.calculateReservationStats(filteredReservations),
      occupancy: this.calculateOccupancyStats(filteredReservations),
      revenue: this.calculateRevenueStats(filteredReservations),
      customers: this.calculateCustomerStats(filteredCustomers, filteredReservations),
      timeSlots: this.calculateTimeSlotAnalytics(filteredReservations),
      dailyTrends: this.calculateDailyTrends(filteredReservations),
      monthlyTrends: this.calculateMonthlyTrends(filteredReservations),
      peakHours: this.calculatePeakHours(filteredReservations),
      seasonalTrends: this.calculateSeasonalTrends(filteredReservations),
      waitlist: this.calculateWaitlistAnalytics(),
      tables: this.calculateTableAnalytics(filteredReservations),
      insights: this.generateInsights(filteredReservations)
    };
  }

  private filterReservations(reservations: Reservation[], filters?: AnalyticsFilters): Reservation[] {
    if (!filters) return reservations;

    return reservations.filter(reservation => {
      const reservationDate = new Date(reservation.date);
      
      if (filters.startDate && reservationDate < filters.startDate) return false;
      if (filters.endDate && reservationDate > filters.endDate) return false;
      if (filters.timeSlots && !filters.timeSlots.includes(reservation.time)) return false;
      if (filters.tableIds && !filters.tableIds.includes(reservation.tableId)) return false;
      if (filters.reservationStatuses && !filters.reservationStatuses.includes(reservation.status)) return false;
      
      return true;
    });
  }

  private filterCustomers(customers: Customer[], filters?: AnalyticsFilters): Customer[] {
    if (!filters) return customers;
    return customers; // Implémentation simplifiée
  }

  private calculateReservationStats(reservations: Reservation[]): ReservationStats {
    const total = reservations.length;
    const confirmed = reservations.filter(r => r.status === 'confirmed').length;
    const cancelled = reservations.filter(r => r.status === 'cancelled').length;
    const noShow = reservations.filter(r => r.status === 'no-show').length;
    const pending = reservations.filter(r => r.status === 'pending').length;
    const completed = reservations.filter(r => r.status === 'completed').length;

    return {
      totalReservations: total,
      confirmedReservations: confirmed,
      cancelledReservations: cancelled,
      noShowReservations: noShow,
      pendingReservations: pending,
      completedReservations: completed
    };
  }

  private calculateOccupancyStats(reservations: Reservation[]): OccupancyStats {
    const totalTables = 20; // Nombre total de tables
    const confirmedReservations = reservations.filter(r => r.status === 'confirmed' || r.status === 'completed');
    const occupiedTables = new Set(confirmedReservations.map(r => r.tableId)).size;
    const totalGuests = confirmedReservations.reduce((sum, r) => sum + r.guests, 0);
    const averagePartySize = confirmedReservations.length > 0 ? totalGuests / confirmedReservations.length : 0;

    return {
      totalTables,
      occupiedTables,
      availableTables: totalTables - occupiedTables,
      occupancyRate: (occupiedTables / totalTables) * 100,
      averagePartySize: Math.round(averagePartySize * 100) / 100,
      turnoverRate: confirmedReservations.length / totalTables
    };
  }

  private calculateRevenueStats(reservations: Reservation[]): RevenueStats {
    const completedReservations = reservations.filter(r => r.status === 'completed');
    const totalRevenue = completedReservations.reduce((sum, r) => sum + (r.estimatedRevenue || 0), 0);
    const totalGuests = completedReservations.reduce((sum, r) => sum + r.guests, 0);

    const revenueByTimeSlot: { [timeSlot: string]: number } = {};
    const revenueByDay: { [day: string]: number } = {};
    const revenueByMonth: { [month: string]: number } = {};

    completedReservations.forEach(reservation => {
      const revenue = reservation.estimatedRevenue || 0;
      
      // Par créneau horaire
      revenueByTimeSlot[reservation.time] = (revenueByTimeSlot[reservation.time] || 0) + revenue;
      
      // Par jour
      revenueByDay[reservation.date] = (revenueByDay[reservation.date] || 0) + revenue;
      
      // Par mois
      const month = reservation.date.substring(0, 7);
      revenueByMonth[month] = (revenueByMonth[month] || 0) + revenue;
    });

    return {
      totalRevenue,
      averageRevenuePerReservation: completedReservations.length > 0 ? totalRevenue / completedReservations.length : 0,
      averageRevenuePerGuest: totalGuests > 0 ? totalRevenue / totalGuests : 0,
      revenueByTimeSlot,
      revenueByDay,
      revenueByMonth
    };
  }

  private calculateCustomerStats(customers: Customer[], reservations: Reservation[]): CustomerStats {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newCustomers = customers.filter(c => c.createdAt > thirtyDaysAgo).length;
    const returningCustomers = customers.filter(c => c.totalReservations > 1).length;
    
    const topCustomers = customers
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10)
      .map(customer => ({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        totalReservations: customer.totalReservations,
        totalRevenue: customer.totalSpent,
        lastVisit: new Date()
      }));

    return {
      totalCustomers: customers.length,
      newCustomers,
      returningCustomers,
      averageVisitsPerCustomer: customers.length > 0 ? customers.reduce((sum, c) => sum + c.totalReservations, 0) / customers.length : 0,
      customerRetentionRate: customers.length > 0 ? (returningCustomers / customers.length) * 100 : 0,
      topCustomers
    };
  }

  private calculateTimeSlotAnalytics(reservations: Reservation[]): TimeSlotAnalytics[] {
    const timeSlotMap = new Map<string, {
      reservations: Reservation[];
      totalGuests: number;
      totalRevenue: number;
    }>();

    reservations.forEach(reservation => {
      if (!timeSlotMap.has(reservation.time)) {
        timeSlotMap.set(reservation.time, {
          reservations: [],
          totalGuests: 0,
          totalRevenue: 0
        });
      }
      
      const slot = timeSlotMap.get(reservation.time)!;
      slot.reservations.push(reservation);
      slot.totalGuests += reservation.guests;
      slot.totalRevenue += reservation.estimatedRevenue || 0;
    });

    return Array.from(timeSlotMap.entries()).map(([timeSlot, data]) => ({
      timeSlot,
      totalReservations: data.reservations.length,
      averagePartySize: data.totalGuests / data.reservations.length,
      occupancyRate: (data.reservations.length / 20) * 100, // Assumant 20 tables
      revenue: data.totalRevenue,
      popularityScore: data.reservations.length * 10 + data.totalGuests
    })).sort((a, b) => b.popularityScore - a.popularityScore);
  }

  private calculateDailyTrends(reservations: Reservation[]): DayAnalytics[] {
    const dailyMap = new Map<string, {
      reservations: Reservation[];
      totalGuests: number;
      totalRevenue: number;
    }>();

    reservations.forEach(reservation => {
      if (!dailyMap.has(reservation.date)) {
        dailyMap.set(reservation.date, {
          reservations: [],
          totalGuests: 0,
          totalRevenue: 0
        });
      }
      
      const day = dailyMap.get(reservation.date)!;
      day.reservations.push(reservation);
      day.totalGuests += reservation.guests;
      day.totalRevenue += reservation.estimatedRevenue || 0;
    });

    return Array.from(dailyMap.entries()).map(([date, data]) => {
      const dayOfWeek = new Date(date).toLocaleDateString('fr-FR', { weekday: 'long' });
      return {
        date,
        dayOfWeek,
        totalReservations: data.reservations.length,
        totalGuests: data.totalGuests,
        revenue: data.totalRevenue,
        occupancyRate: (data.reservations.length / 20) * 100,
        averageWaitTime: Math.floor(Math.random() * 30) + 5 // Simulation
      };
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  private calculateMonthlyTrends(reservations: Reservation[]): MonthlyTrends[] {
    // Implémentation simplifiée pour la démo
    return [];
  }

  private calculatePeakHours(reservations: Reservation[]): PeakHoursAnalytics[] {
    const hourMap = new Map<number, {
      reservations: number;
      revenue: number;
    }>();

    reservations.forEach(reservation => {
      const hour = parseInt(reservation.time.split(':')[0]);
      if (!hourMap.has(hour)) {
        hourMap.set(hour, { reservations: 0, revenue: 0 });
      }
      
      const hourData = hourMap.get(hour)!;
      hourData.reservations++;
      hourData.revenue += reservation.estimatedRevenue || 0;
    });

    return Array.from(hourMap.entries()).map(([hour, data]) => ({
      hour,
      averageReservations: data.reservations,
      averageOccupancy: (data.reservations / 20) * 100,
      averageRevenue: data.revenue,
      recommendedStaffing: Math.ceil(data.reservations / 5)
    })).sort((a, b) => b.averageReservations - a.averageReservations);
  }

  private calculateSeasonalTrends(reservations: Reservation[]): SeasonalTrends[] {
    // Implémentation simplifiée pour la démo
    return [
      {
        season: 'spring',
        averageReservations: 45,
        averageRevenue: 3200,
        popularDishes: ['Salade de printemps', 'Agneau aux herbes'],
        customerPreferences: { 'Terrasse': 70, 'Intérieur': 30 }
      },
      {
        season: 'summer',
        averageReservations: 65,
        averageRevenue: 4800,
        popularDishes: ['Gazpacho', 'Poisson grillé'],
        customerPreferences: { 'Terrasse': 85, 'Intérieur': 15 }
      },
      {
        season: 'autumn',
        averageReservations: 55,
        averageRevenue: 4200,
        popularDishes: ['Soupe de châtaignes', 'Gibier'],
        customerPreferences: { 'Terrasse': 40, 'Intérieur': 60 }
      },
      {
        season: 'winter',
        averageReservations: 40,
        averageRevenue: 3800,
        popularDishes: ['Pot-au-feu', 'Fondue'],
        customerPreferences: { 'Terrasse': 10, 'Intérieur': 90 }
      }
    ];
  }

  private calculateWaitlistAnalytics(): WaitlistAnalytics {
    return {
      totalWaitlistEntries: 25,
      averageWaitTime: 45,
      conversionRate: 78,
      abandonmentRate: 22,
      peakWaitlistTimes: ['19:00-20:00', '20:00-21:00']
    };
  }

  private calculateTableAnalytics(reservations: Reservation[]): TableAnalytics[] {
    const tableMap = new Map<string, {
      reservations: number;
      totalRevenue: number;
      totalDuration: number;
    }>();

    reservations.forEach(reservation => {
      if (!tableMap.has(reservation.tableId)) {
        tableMap.set(reservation.tableId, {
          reservations: 0,
          totalRevenue: 0,
          totalDuration: 0
        });
      }
      
      const table = tableMap.get(reservation.tableId)!;
      table.reservations++;
      table.totalRevenue += reservation.estimatedRevenue || 0;
      table.totalDuration += 120; // Durée moyenne de 2h
    });

    return Array.from(tableMap.entries()).map(([tableId, data]) => {
      const tableNumber = parseInt(tableId.replace('table_', ''));
      return {
        tableId,
        tableNumber,
        capacity: Math.floor(Math.random() * 6) + 2, // 2-8 personnes
        utilizationRate: (data.reservations / 30) * 100, // Sur 30 jours
        averageOccupancyDuration: data.totalDuration / data.reservations,
        totalRevenue: data.totalRevenue,
        preferenceScore: data.reservations * 10 + Math.random() * 50
      };
    }).sort((a, b) => b.utilizationRate - a.utilizationRate);
  }

  private generateInsights(reservations: Reservation[]): AnalyticsInsight[] {
    const insights: AnalyticsInsight[] = [];
    
    // Analyse du taux d'occupation
    const occupancyRate = (reservations.filter(r => r.status === 'confirmed').length / (20 * 30)) * 100;
    if (occupancyRate > 85) {
      insights.push({
        id: 'high-occupancy',
        type: 'positive',
        title: 'Taux d\'occupation élevé',
        description: `Votre restaurant affiche un excellent taux d'occupation de ${occupancyRate.toFixed(1)}%`,
        impact: 'high',
        recommendation: 'Considérez l\'ajout de créneaux supplémentaires ou l\'expansion.',
        metrics: { occupancyRate: occupancyRate.toFixed(1) },
        createdAt: new Date()
      });
    }

    // Analyse des annulations
    const cancellationRate = (reservations.filter(r => r.status === 'cancelled').length / reservations.length) * 100;
    if (cancellationRate > 15) {
      insights.push({
        id: 'high-cancellation',
        type: 'warning',
        title: 'Taux d\'annulation élevé',
        description: `Le taux d'annulation de ${cancellationRate.toFixed(1)}% est supérieur à la moyenne`,
        impact: 'medium',
        recommendation: 'Implémentez une politique de confirmation 24h avant ou des frais d\'annulation.',
        metrics: { cancellationRate: cancellationRate.toFixed(1) },
        createdAt: new Date()
      });
    }

    // Analyse des créneaux populaires
    const timeSlotAnalytics = this.calculateTimeSlotAnalytics(reservations);
    const mostPopularSlot = timeSlotAnalytics[0];
    if (mostPopularSlot) {
      insights.push({
        id: 'popular-timeslot',
        type: 'positive',
        title: 'Créneau le plus demandé',
        description: `Le créneau ${mostPopularSlot.timeSlot} génère le plus de réservations`,
        impact: 'medium',
        recommendation: 'Optimisez le staffing pour ce créneau et considérez des prix dynamiques.',
        metrics: { 
          timeSlot: mostPopularSlot.timeSlot,
          reservations: mostPopularSlot.totalReservations.toString()
        },
        createdAt: new Date()
      });
    }

    return insights;
  }

  private getPeriodLabel(startDate: Date, endDate: Date): string {
    const start = startDate.toLocaleDateString('fr-FR');
    const end = endDate.toLocaleDateString('fr-FR');
    return `${start} - ${end}`;
  }

  async getComparison(currentFilters: AnalyticsFilters, previousFilters: AnalyticsFilters): Promise<ComparisonData> {
    const current = await this.getDashboard(currentFilters);
    const previous = await this.getDashboard(previousFilters);

    return {
      current,
      previous,
      changes: {
        reservations: ((current.reservations.totalReservations - previous.reservations.totalReservations) / previous.reservations.totalReservations) * 100,
        revenue: ((current.revenue.totalRevenue - previous.revenue.totalRevenue) / previous.revenue.totalRevenue) * 100,
        occupancy: current.occupancy.occupancyRate - previous.occupancy.occupancyRate,
        customers: ((current.customers.totalCustomers - previous.customers.totalCustomers) / previous.customers.totalCustomers) * 100
      }
    };
  }

  async getForecast(days: number = 7): Promise<ForecastData[]> {
    const forecast: ForecastData[] = [];
    const today = new Date();

    for (let i = 1; i <= days; i++) {
      const date = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
      const dayOfWeek = date.getDay();
      
      // Simulation basée sur des patterns historiques
      let baseReservations = 15;
      if (dayOfWeek === 5 || dayOfWeek === 6) baseReservations = 25; // Weekend
      if (dayOfWeek === 0) baseReservations = 10; // Dimanche
      
      const variance = Math.random() * 0.3 - 0.15; // ±15% de variance
      const predictedReservations = Math.round(baseReservations * (1 + variance));
      
      forecast.push({
        date: date.toISOString().split('T')[0],
        predictedReservations,
        predictedRevenue: predictedReservations * 85, // 85€ moyenne par réservation
        predictedOccupancy: (predictedReservations / 20) * 100,
        confidence: Math.random() * 0.3 + 0.7, // 70-100% de confiance
        factors: ['Historique', 'Jour de la semaine', 'Saisonnalité']
      });
    }

    return forecast;
  }

  async exportData(options: ExportOptions): Promise<string> {
    // Simulation d'export - retourne une URL de téléchargement
    const dashboard = await this.getDashboard({
      startDate: options.dateRange.start,
      endDate: options.dateRange.end
    });

    // Dans une vraie implémentation, on générerait le fichier ici
    const filename = `analytics_${Date.now()}.${options.format}`;
    
    // Simulation d'une URL de téléchargement
    return `/api/exports/${filename}`;
  }
}

export default AnalyticsService;