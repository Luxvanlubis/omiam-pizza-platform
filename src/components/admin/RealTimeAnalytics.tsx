'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Bell,
  Settings,
  RefreshCw,
  Zap,
  Eye,
  Target,
  Gauge,
  Wifi,
  WifiOff,
  Play,
  Pause,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Download,
  Filter,
  Calendar,
  Globe,
  Smartphone,
  Monitor
} from 'lucide-react';
import { useI18n } from '@/hooks/useI18n';
import { useLocalizedFormat } from '@/hooks/useLocalizedFormat';

// Types avancés pour les analytics temps réel
interface RealTimeMetric {
  id: string;
  label: string;
  value: number;
  previousValue: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'stable';
  unit: 'currency' | 'number' | 'percentage' | 'time';
  target?: number;
  threshold: {
    warning: number;
    critical: number;
  };
  trend: number[];
  status: 'healthy' | 'warning' | 'critical';
  category: 'revenue' | 'orders' | 'customers' | 'performance';
  icon: any;
  color: string;
}

interface RealTimeData {
  timestamp: Date;
  metrics: RealTimeMetric[];
  activeUsers: number;
  ordersInProgress: number;
  serverLoad: number;
  responseTime: number;
  errorRate: number;
  conversionRate: number;
}

interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  action?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  autoResolve?: boolean;
}

interface PerformanceData {
  timestamp: Date;
  cpu: number;
  memory: number;
  network: number;
  database: number;
  cache: number;
}

interface TrafficSource {
  source: string;
  visitors: number;
  conversions: number;
  revenue: number;
  color: string;
}

interface DeviceAnalytics {
  device: string;
  sessions: number;
  bounceRate: number;
  avgSessionDuration: number;
  conversions: number;
}

interface RealTimeAnalyticsProps {
  timeRange?: string;
  compact?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

// Données mockées avancées
const mockRealTimeMetrics: RealTimeMetric[] = [
  {
    id: 'revenue',
    label: 'Revenus temps réel',
    value: 15420.50,
    previousValue: 14280.30,
    change: 7.98,
    changeType: 'increase',
    unit: 'currency',
    target: 16000,
    threshold: { warning: 12000, critical: 10000 },
    trend: [12500, 13200, 13800, 14280, 15420],
    status: 'healthy',
    category: 'revenue',
    icon: DollarSign,
    color: '#10b981'
  },
  {
    id: 'orders',
    label: 'Commandes actives',
    value: 127,
    previousValue: 98,
    change: 29.59,
    changeType: 'increase',
    unit: 'number',
    target: 150,
    threshold: { warning: 80, critical: 50 },
    trend: [85, 92, 89, 98, 127],
    status: 'healthy',
    category: 'orders',
    icon: ShoppingCart,
    color: '#3b82f6'
  },
  {
    id: 'active_users',
    label: 'Utilisateurs actifs',
    value: 342,
    previousValue: 289,
    change: 18.34,
    changeType: 'increase',
    unit: 'number',
    target: 400,
    threshold: { warning: 200, critical: 100 },
    trend: [245, 267, 278, 289, 342],
    status: 'healthy',
    category: 'customers',
    icon: Users,
    color: '#8b5cf6'
  }
];

const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'warning',
    title: 'Temps de réponse élevé',
    message: 'Le temps de réponse moyen dépasse 400ms depuis 5 minutes',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    isRead: false,
    action: 'Optimiser',
    priority: 'high',
    category: 'performance',
    autoResolve: true
  }
];

const mockPerformanceData: PerformanceData[] = [
  {
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    cpu: 45,
    memory: 62,
    network: 78,
    database: 34,
    cache: 89
  }
];

const mockTrafficSources: TrafficSource[] = [
  {
    source: 'Recherche organique',
    visitors: 1247,
    conversions: 89,
    revenue: 3420.50,
    color: '#10b981'
  }
];

const mockDeviceAnalytics: DeviceAnalytics[] = [
  {
    device: 'Desktop',
    sessions: 1847,
    bounceRate: 32.5,
    avgSessionDuration: 245,
    conversions: 156
  }
];

export default function RealTimeAnalytics({
  timeRange = '24h',
  compact = false,
  autoRefresh = true,
  refreshInterval = 30000
}: RealTimeAnalyticsProps) {
  const { t } = useI18n();
  const { formatCurrency, formatNumber, formatPercentage, formatTime } = useLocalizedFormat();

  // États du composant
  const [isConnected, setIsConnected] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [realTimeData, setRealTimeData] = useState<RealTimeData>({
    timestamp: new Date(),
    metrics: mockRealTimeMetrics,
    activeUsers: 342,
    ordersInProgress: 23,
    serverLoad: 48,
    responseTime: 245,
    errorRate: 0.8,
    conversionRate: 4.8
  });
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>(mockPerformanceData);
  const [selectedChartType, setSelectedChartType] = useState<'line' | 'bar' | 'area'>('line');

  // Simulation de la mise à jour en temps réel
  useEffect(() => {
    if (!autoRefresh || isPaused) return;

    const interval = setInterval(() => {
      setIsLoading(true);
      // Simuler une mise à jour des données
      setTimeout(() => {
        setRealTimeData(prev => ({
          ...prev,
          timestamp: new Date(),
          activeUsers: prev.activeUsers + Math.floor(Math.random() * 20 - 10),
          ordersInProgress: Math.max(0, prev.ordersInProgress + Math.floor(Math.random() * 6 - 3)),
          metrics: prev.metrics.map(metric => ({
            ...metric,
            previousValue: metric.value,
            value: metric.value * (1 + (Math.random() * 0.1 - 0.05)),
            change: Math.random() * 20 - 10
          }))
        }));
        setIsLoading(false);
      }, 1000);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, isPaused]);

  // Fonctions utilitaires
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy': return <Badge className="bg-green-100 text-green-800">Sain</Badge>;
      case 'warning': return <Badge className="bg-yellow-100 text-yellow-800">Attention</Badge>;
      case 'critical': return <Badge className="bg-red-100 text-red-800">Critique</Badge>;
      default: return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const formatValue = (value: number, unit: string) => {
    switch (unit) {
      case 'currency': return formatCurrency(value);
      case 'percentage': return formatPercentage(value / 100);
      case 'time': return `${value}ms`;
      default: return formatNumber(value);
    }
  };

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    // Simuler un appel API
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
  }, []);

  const handleAlertAction = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ));
  };

  const filteredMetrics = selectedCategory === 'all' 
    ? realTimeData.metrics 
    : realTimeData.metrics.filter(metric => metric.category === selectedCategory);

  const unreadAlerts = alerts.filter(alert => !alert.isRead);
  const criticalAlerts = alerts.filter(alert => alert.priority === 'critical' && !alert.isRead);

  if (compact) {
    return (
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {filteredMetrics.slice(0, 4).map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.id} className="relative">
              {isLoading && (
                <div className="absolute top-2 right-2">
                  <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
                </div>
              )}
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {metric.label}
                    </p>
                    <p className="text-lg font-bold">{formatValue(metric.value, metric.unit)}</p>
                    <div className="flex items-center space-x-1 mt-1">
                      <TrendingUp className={`h-3 w-3 ${metric.change > 0 ? 'text-green-600' : 'text-red-600'}`} />
                      <span className={`text-xs ${metric.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.abs(metric.change).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-6" data-id="real-time-analytics">
      {/* En-tête avec contrôles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`h-3 w-3 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            } ${isLoading ? 'animate-pulse' : ''}`}></div>
            <span className="text-sm font-medium">
              {isConnected ? 'Connecté' : 'Déconnecté'}
            </span>
            {isConnected && (
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                Temps réel
              </Badge>
            )}
          </div>
          {criticalAlerts.length > 0 && (
            <Alert className="border-red-200 bg-red-50 p-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-sm text-red-800">
                {criticalAlerts.length} alerte(s) critique(s) nécessitent votre attention
              </AlertDescription>
            </Alert>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">1 heure</SelectItem>
              <SelectItem value="24h">24 heures</SelectItem>
              <SelectItem value="7d">7 jours</SelectItem>
              <SelectItem value="30d">30 jours</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPaused(!isPaused)}
            className="flex items-center space-x-1"
          >
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            <span>{isPaused ? 'Reprendre' : 'Pause'}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center space-x-1"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </Button>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredMetrics.map((metric) => {
          const Icon = metric.icon;
          const progressValue = metric.target ? (metric.value / metric.target) * 100 : 0;
          return (
            <Card key={metric.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
              {isLoading && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"></div>
              )}
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-2">
                  <Icon className="h-4 w-4" style={{ color: metric.color }} />
                  <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
                </div>
                {getStatusBadge(metric.status)}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  {formatValue(metric.value, metric.unit)}
                </div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1">
                    {metric.changeType === 'increase' ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : metric.changeType === 'decrease' ? (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    ) : (
                      <Activity className="h-3 w-3 text-gray-600" />
                    )}
                    <span className={`text-xs font-medium ${
                      metric.changeType === 'increase' ? 'text-green-600' :
                      metric.changeType === 'decrease' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {Math.abs(metric.change).toFixed(1)}%
                    </span>
                  </div>
                  {metric.target && (
                    <span className="text-xs text-muted-foreground">
                      Objectif: {formatValue(metric.target, metric.unit)}
                    </span>
                  )}
                </div>
                {metric.target && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Progression</span>
                      <span>{progressValue.toFixed(0)}%</span>
                    </div>
                    <Progress value={progressValue} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}