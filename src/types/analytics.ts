export interface ReservationStats {
  totalReservations: number;
  confirmedReservations: number;
  cancelledReservations: number;
  noShowReservations: number;
  pendingReservations: number;
  completedReservations: number;
}

export interface OccupancyStats {
  totalTables: number;
  occupiedTables: number;
  availableTables: number;
  occupancyRate: number;
  averagePartySize: number;
  turnoverRate: number;
}

export interface RevenueStats {
  totalRevenue: number;
  averageRevenuePerReservation: number;
  averageRevenuePerGuest: number;
  revenueByTimeSlot: { [timeSlot: string]: number };
  revenueByDay: { [day: string]: number };
  revenueByMonth: { [month: string]: number };
}

export interface CustomerStats {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  averageVisitsPerCustomer: number;
  customerRetentionRate: number;
  topCustomers: Array<{
    id: string;
    name: string;
    email: string;
    totalReservations: number;
    totalRevenue: number;
    lastVisit: Date;
  }>;
}

export interface TimeSlotAnalytics {
  timeSlot: string;
  totalReservations: number;
  averagePartySize: number;
  occupancyRate: number;
  revenue: number;
  popularityScore: number;
}

export interface DayAnalytics {
  date: string;
  dayOfWeek: string;
  totalReservations: number;
  totalGuests: number;
  revenue: number;
  occupancyRate: number;
  averageWaitTime: number;
  weatherCondition?: string;
}

export interface MonthlyTrends {
  month: string;
  year: number;
  reservations: ReservationStats;
  occupancy: OccupancyStats;
  revenue: RevenueStats;
  customers: CustomerStats;
  growthRate: number;
}

export interface PeakHoursAnalytics {
  hour: number;
  averageReservations: number;
  averageOccupancy: number;
  averageRevenue: number;
  recommendedStaffing: number;
}

export interface SeasonalTrends {
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  averageReservations: number;
  averageRevenue: number;
  popularDishes: string[];
  customerPreferences: { [preference: string]: number };
}

export interface WaitlistAnalytics {
  totalWaitlistEntries: number;
  averageWaitTime: number;
  conversionRate: number;
  abandonmentRate: number;
  peakWaitlistTimes: string[];
}

export interface TableAnalytics {
  tableId: string;
  tableNumber: number;
  capacity: number;
  utilizationRate: number;
  averageOccupancyDuration: number;
  totalRevenue: number;
  preferenceScore: number;
}

export interface AnalyticsFilters {
  startDate?: Date;
  endDate?: Date;
  timeSlots?: string[];
  tableIds?: string[];
  customerSegments?: string[];
  reservationStatuses?: string[];
  groupBy?: 'day' | 'week' | 'month' | 'quarter' | 'year';
}

export interface AnalyticsDashboard {
  period: {
    start: Date;
    end: Date;
    label: string;
  };
  reservations: ReservationStats;
  occupancy: OccupancyStats;
  revenue: RevenueStats;
  customers: CustomerStats;
  timeSlots: TimeSlotAnalytics[];
  dailyTrends: DayAnalytics[];
  monthlyTrends: MonthlyTrends[];
  peakHours: PeakHoursAnalytics[];
  seasonalTrends: SeasonalTrends[];
  waitlist: WaitlistAnalytics;
  tables: TableAnalytics[];
  insights: AnalyticsInsight[];
}

export interface AnalyticsInsight {
  id: string;
  type: 'positive' | 'negative' | 'neutral' | 'warning';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  recommendation?: string;
  metrics: { [key: string]: number | string };
  createdAt: Date;
}

export interface ForecastData {
  date: string;
  predictedReservations: number;
  predictedRevenue: number;
  predictedOccupancy: number;
  confidence: number;
  factors: string[];
}

export interface ComparisonData {
  current: AnalyticsDashboard;
  previous: AnalyticsDashboard;
  changes: {
    reservations: number;
    revenue: number;
    occupancy: number;
    customers: number;
  };
}

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv' | 'json';
  includeCharts: boolean;
  includeTables: boolean;
  includeInsights: boolean;
  dateRange: {
    start: Date;
    end: Date;
  };
  sections: string[];
}