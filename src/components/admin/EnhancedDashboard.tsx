"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import {
  TrendingUp, TrendingDown, Users, ShoppingCart, DollarSign, Clock,
  Download, Filter, Calendar, Eye, BarChart3, PieChart as PieChartIcon,
  Activity, AlertCircle, CheckCircle, Star, Package, Zap, RefreshCw
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  revenueGrowth: number;
  ordersGrowth: number;
  customersGrowth: number;
  conversionRate: number;
}

interface Order {
  id: string;
  customerName: string;
  items: string[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  createdAt: string;
  estimatedTime?: number;
}

interface Product {
  id: string;
  name: string;
  category: string;
  sales: number;
  revenue: number;
  stock: number;
  rating: number;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
  lastOrder: string;
  status: 'active' | 'inactive' | 'vip';
}

const EnhancedDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Mock data - to be replaced with actual API calls
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 45280,
    totalOrders: 1847,
    totalCustomers: 892,
    averageOrderValue: 24.5,
    revenueGrowth: 12.5,
    ordersGrowth: 8.3,
    customersGrowth: 15.2,
    conversionRate: 3.8
  });

  const [recentOrders] = useState<Order[]>([
    {
      id: 'ORD-2024-001',
      customerName: 'Marie Dubois',
      items: ['Pizza Margherita', 'Coca-Cola'],
      total: 18.50,
      status: 'preparing',
      createdAt: '2024-01-15T14:30:00Z',
      estimatedTime: 15
    },
    {
      id: 'ORD-2024-002',
      customerName: 'Jean Martin',
      items: ['Pizza 4 Fromages', 'Salade César'],
      total: 22.00,
      status: 'ready',
      createdAt: '2024-01-15T14:25:00Z'
    },
    {
      id: 'ORD-2024-003',
      customerName: 'Sophie Laurent',
      items: ['Pizza Reine', 'Tiramisu', 'Vin Rouge'],
      total: 35.50,
      status: 'delivered',
      createdAt: '2024-01-15T14:15:00Z'
    }
  ]);

  const [topProducts] = useState<Product[]>([
    { id: '1', name: 'Pizza Margherita', category: 'Pizzas', sales: 342, revenue: 5472, stock: 45, rating: 4.8 },
    { id: '2', name: 'Pizza 4 Fromages', category: 'Pizzas', sales: 289, revenue: 5780, stock: 32, rating: 4.7 },
    { id: '3', name: 'Pizza Reine', category: 'Pizzas', sales: 234, revenue: 4680, stock: 28, rating: 4.6 },
    { id: '4', name: 'Salade César', category: 'Salades', sales: 156, revenue: 1872, stock: 67, rating: 4.5 }
  ]);

  const [topCustomers] = useState<Customer[]>([
    { id: '1', name: 'Marie Dubois', email: 'marie@email.com', totalOrders: 23, totalSpent: 456.80, loyaltyPoints: 1250, lastOrder: '2024-01-15', status: 'vip' },
    { id: '2', name: 'Jean Martin', email: 'jean@email.com', totalOrders: 18, totalSpent: 342.50, loyaltyPoints: 890, lastOrder: '2024-01-14', status: 'active' },
    { id: '3', name: 'Sophie Laurent', email: 'sophie@email.com', totalOrders: 15, totalSpent: 298.20, loyaltyPoints: 720, lastOrder: '2024-01-13', status: 'active' }
  ]);

  const revenueData = [
    { date: '2024-01-08', revenue: 1250, orders: 45 },
    { date: '2024-01-09', revenue: 1380, orders: 52 },
    { date: '2024-01-10', revenue: 1120, orders: 38 },
    { date: '2024-01-11', revenue: 1450, orders: 58 },
    { date: '2024-01-12', revenue: 1680, orders: 62 },
    { date: '2024-01-13', revenue: 1520, orders: 55 },
    { date: '2024-01-14', revenue: 1750, orders: 67 }
  ];

  const categoryData = [
    { name: 'Pizzas', value: 65, color: '#ef4444' },
    { name: 'Salades', value: 15, color: '#22c55e' },
    { name: 'Desserts', value: 12, color: '#f59e0b' },
    { name: 'Boissons', value: 8, color: '#3b82f6' }
  ];

  const hourlyData = [
    { hour: '11h', orders: 12 },
    { hour: '12h', orders: 28 },
    { hour: '13h', orders: 45 },
    { hour: '14h', orders: 32 },
    { hour: '15h', orders: 18 },
    { hour: '16h', orders: 15 },
    { hour: '17h', orders: 22 },
    { hour: '18h', orders: 38 },
    { hour: '19h', orders: 52 },
    { hour: '20h', orders: 48 },
    { hour: '21h', orders: 35 },
    { hour: '22h', orders: 25 }
  ];

  // Auto-refresh simulation
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        setLastUpdated(new Date());
        // Here, you would make an API call to fetch new data
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const handleRefresh = async () => {
    setIsLoading(true);
    // API call simulation
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastUpdated(new Date());
    setIsLoading(false);
  };

  const handleExport = (type: 'csv' | 'pdf' | 'excel') => {
    // Export simulation
    console.log(`Exporting data as ${type}`);
    // Here, you would implement the actual export logic
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'preparing': return 'En préparation';
      case 'ready': return 'Prête';
      case 'delivered': return 'Livrée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  const getCustomerStatusColor = (status: Customer['status']) => {
    switch (status) {
      case 'vip': return 'bg-purple-100 text-purple-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-red-800 dark:text-red-600">Tableau de Bord Pizzeria</h2>
          <p className="text-muted-foreground">
            Dernière mise à jour: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Aujourd'hui</SelectItem>
              <SelectItem value="7d">7 jours</SelectItem>
              <SelectItem value="30d">30 jours</SelectItem>
              <SelectItem value="90d">90 jours</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex items-center gap-2">
            <Checkbox 
              id="auto-refresh" 
              checked={autoRefresh} 
              onCheckedChange={setAutoRefresh}
            />
            <Label htmlFor="auto-refresh" className="text-sm">Auto-refresh</Label>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Exporter les données</DialogTitle>
                <DialogDescription>
                  Choisissez le format d'export pour les données du tableau de bord.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-3 gap-4 py-4">
                <Button onClick={() => handleExport('csv')} variant="outline">
                  CSV
                </Button>
                <Button onClick={() => handleExport('excel')} variant="outline">
                  Excel
                </Button>
                <Button onClick={() => handleExport('pdf')} variant="outline">
                  PDF
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Chiffre d'affaires</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalRevenue)}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">+{stats.revenueGrowth}%</span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pizzas Vendues</p>
                <p className="text-2xl font-bold text-red-600">{stats.totalOrders}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">+{stats.ordersGrowth}%</span>
                </div>
              </div>
              <ShoppingCart className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Clients Fidèles</p>
                <p className="text-2xl font-bold text-red-600">{stats.totalCustomers}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">+{stats.customersGrowth}%</span>
                </div>
              </div>
              <Users className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Panier Moyen</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.averageOrderValue)}</p>
                <div className="flex items-center mt-2">
                  <Activity className="h-4 w-4 text-blue-600 mr-1" />
                  <span className="text-sm text-blue-600">{stats.conversionRate}% conversion</span>
                </div>
              </div>
              <BarChart3 className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue evolution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Évolution du Chiffre d'Affaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value: number) => [formatCurrency(value), 'Chiffre d\'affaires']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sales distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Répartition des Ventes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Orders by hour */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Commandes par Heure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="orders" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Data tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Commandes Récentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-sm text-muted-foreground">{order.items.join(', ')}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(order.total)}</p>
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusText(order.status)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Popular products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Pizzas Populaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.category}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="text-xs">{product.rating}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{product.sales} ventes</p>
                    <p className="text-sm text-muted-foreground">{formatCurrency(product.revenue)}</p>
                    <Badge variant={product.stock > 20 ? 'default' : 'destructive'}>
                      Stock: {product.stock}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top customers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Meilleurs Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCustomers.map((customer) => (
                <div key={customer.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-sm text-muted-foreground">{customer.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Dernière commande: {new Date(customer.lastOrder).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{customer.totalOrders} commandes</p>
                    <p className="text-sm text-muted-foreground">{formatCurrency(customer.totalSpent)}</p>
                    <Badge className={getCustomerStatusColor(customer.status)}>
                      {customer.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedDashboard;