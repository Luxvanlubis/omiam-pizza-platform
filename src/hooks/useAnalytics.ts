import { useState, useEffect, useCallback } from 'react';
import AnalyticsService from '../services/analyticsService';
import type { AnalyticsData, KPIData, SalesData, ProductPerformance } from '../types/analytics';

// Créer une instance du service
const analyticsService = AnalyticsService.getInstance();

// Fonctions utilitaires pour adapter les données
function getFiltersFromTimeRange(timeRange: string) {
  const now = new Date();
  const days = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : timeRange === '90days' ? 90 : 7;
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return { startDate, endDate: now };
}

function adaptDashboardToAnalyticsData(dashboard: any): AnalyticsData {
  // Adapter les données du dashboard au format AnalyticsData attendu
  return {
    kpis: {
      totalRevenue: dashboard.revenue.totalRevenue,
      totalReservations: dashboard.reservations.totalReservations,
      averageOrderValue: dashboard.revenue.averageRevenuePerReservation,
      customerSatisfaction: 4.5, // Valeur par défaut
      growthRate: 12.5 // Valeur par défaut
    },
    salesData: dashboard.dailyTrends.map((trend: any) => ({
      date: trend.date,
      revenue: trend.totalRevenue,
      orders: trend.totalReservations,
      customers: trend.uniqueCustomers
    })),
    productPerformance: dashboard.tables.slice(0, 10).map((table: any) => ({
      id: table.tableId,
      name: `Table ${table.tableNumber}`,
      revenue: table.totalRevenue,
      quantity: table.utilizationRate,
      growth: Math.random() * 20 - 10 // Valeur simulée
    })),
    customerMetrics: {
      totalCustomers: dashboard.customers.totalCustomers,
      newCustomers: dashboard.customers.newCustomers,
      returningCustomers: dashboard.customers.returningCustomers,
      averageLifetimeValue: dashboard.customers.averageLifetimeValue
    }
  };
}

interface UseAnalyticsOptions {
  timeRange?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseAnalyticsReturn {
  data: AnalyticsData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  setTimeRange: (range: string) => void;
  timeRange: string;
}

export function useAnalytics(options: UseAnalyticsOptions = {}): UseAnalyticsReturn {
  const {
    timeRange: initialTimeRange = '7days',
    autoRefresh = false,
    refreshInterval = 30000 // 30 secondes
  } = options;

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState(initialTimeRange);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Adapter les filtres selon le timeRange
      const filters = getFiltersFromTimeRange(timeRange);
      const dashboard = await analyticsService.getDashboard(filters);
      // Adapter les données du dashboard au format AnalyticsData
      const analyticsData = adaptDashboardToAnalyticsData(dashboard);
      setData(analyticsData);
    } catch (err) {
      console.error('Erreur lors du chargement des données analytics:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // Chargement initial et rechargement lors du changement de timeRange
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-refresh si activé
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loadData]);

  return {
    data,
    loading,
    error,
    refresh,
    setTimeRange,
    timeRange
  };
}

// Hook spécialisé pour les KPIs uniquement
export function useKPIs(timeRange: string = '7days') {
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadKPIs = async () => {
      try {
        setLoading(true);
        setError(null);
        const filters = getFiltersFromTimeRange(timeRange);
        const dashboard = await analyticsService.getDashboard(filters);
        const data: KPIData = {
          totalRevenue: dashboard.revenue.totalRevenue,
          totalReservations: dashboard.reservations.totalReservations,
          averageOrderValue: dashboard.revenue.averageRevenuePerReservation,
          customerSatisfaction: 4.5,
          growthRate: 12.5
        };
        setKpis(data);
      } catch (err) {
        console.error('Erreur lors du chargement des KPIs:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    loadKPIs();
  }, [timeRange]);

  return { kpis, loading, error };
}

// Hook pour les données de ventes uniquement
export function useSalesData(timeRange: string = '7days') {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSalesData = async () => {
      try {
        setLoading(true);
        setError(null);
        const filters = getFiltersFromTimeRange(timeRange);
        const dashboard = await analyticsService.getDashboard(filters);
        const data = dashboard.dailyTrends.map((trend: any) => ({
          date: trend.date,
          revenue: trend.totalRevenue,
          orders: trend.totalReservations,
          customers: trend.uniqueCustomers
        }));
        setSalesData(data);
      } catch (err) {
        console.error('Erreur lors du chargement des données de ventes:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    loadSalesData();
  }, [timeRange]);

  return { salesData, loading, error };
}

// Hook pour les performances des produits
export function useProductPerformance(timeRange: string = '7days') {
  const [productPerformance, setProductPerformance] = useState<ProductPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProductPerformance = async () => {
      try {
        setLoading(true);
        setError(null);
        const filters = getFiltersFromTimeRange(timeRange);
        const dashboard = await analyticsService.getDashboard(filters);
        const data = dashboard.tables.slice(0, 10).map((table: any) => ({
          id: table.tableId,
          name: `Table ${table.tableNumber}`,
          revenue: table.totalRevenue,
          quantity: table.utilizationRate,
          growth: Math.random() * 20 - 10
        }));
        setProductPerformance(data);
      } catch (err) {
        console.error('Erreur lors du chargement des performances produits:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    loadProductPerformance();
  }, [timeRange]);

  return { productPerformance, loading, error };
}