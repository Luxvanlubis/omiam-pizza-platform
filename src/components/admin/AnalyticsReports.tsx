"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  TrendingUp,
  Users,
  ShoppingCart,
  DollarSign,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  PieChart,
  Activity,
  Target,
  AlertTriangle,
  CheckCircle,
  Loader2
} from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";

interface SalesData {
  date: string;
  revenue: number;
  orders: number;
  customers: number;
  averageOrderValue: number;
}

interface CustomerData {
  period: string;
  newCustomers: number;
  returningCustomers: number;
  totalOrders: number;
  retentionRate: number;
}

interface ProductPerformance {
  name: string;
  category: string;
  orders: number;
  revenue: number;
  profit: number;
  popularity: number;
}

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  unit: string;
  lastRestock: string;
  status: 'good' | 'low' | 'critical';
}

export default function AnalyticsReports() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  
  const { data: analyticsData, loading, error, timeRange, setTimeRange, refresh } = useAnalytics({
    timeRange: '7days',
    autoRefresh: true,
    refreshInterval: 60000 // Refresh toutes les minutes
  });

  // Afficher le loader pendant le chargement initial
  if (loading && !analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Chargement des données analytics...</p>
        </div>
      </div>
    );
  }

  // Afficher l'erreur si le chargement a échoué
  if (error && !analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4 text-center">
          <AlertTriangle className="h-8 w-8 text-destructive" />
          <p className="text-destructive font-medium">{error}</p>
          <Button onClick={refresh} variant="outline">
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  // Extraire les données du service
  const { salesData, customerData, productPerformance, inventoryData, kpis } = analyticsData || {};
  
  const mockSalesData = salesData || [];
  const mockCustomerData = customerData || [];
  const mockProductPerformance = productPerformance || [];
  const mockInventory = inventoryData || [];

  const getInventoryStatus = (status: string) => {
    switch (status) {
      case 'good':
        return { label: "Bon", color: "bg-green-100 text-green-800", icon: CheckCircle };
      case 'low':
        return { label: "Bas", color: "bg-yellow-100 text-yellow-800", icon: AlertTriangle };
      case 'critical':
        return { label: "Critique", color: "bg-red-100 text-red-800", icon: AlertTriangle };
      default:
        return { label: "Inconnu", color: "bg-gray-100 text-gray-800", icon: AlertTriangle };
    }
  };

  const handleExportReport = (reportType: string) => {
    setIsLoading(true);
    // Simuler l'exportation
    setTimeout(() => {
      setIsLoading(false);
      alert(`Rapport ${reportType} exporté avec succès !`);
    }, 1500);
  };

  // Fonctions de calcul utilisant les KPIs du service
  const calculateTotalRevenue = () => {
    return kpis?.totalRevenue || 0;
  };

  const calculateTotalOrders = () => {
    return kpis?.totalOrders || 0;
  };

  const calculateAverageOrderValue = () => {
    return kpis?.averageOrderValue || 0;
  };

  const calculateGrowthRate = () => {
    return kpis?.growthRate || 0;
  };

  const getCustomerRetentionRate = () => {
    return kpis?.customerRetentionRate || 0;
  };

  const getConversionRate = () => {
    return kpis?.conversionRate || 0;
  };

  const getInventoryTurnover = () => {
    return kpis?.inventoryTurnover || 0;
  };

  return (
    <div className="space-y-6">
      {/* En-tête et contrôles */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-red-800 dark:text-red-600">Analytics et Rapports</h2>
            {loading && analyticsData && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Mise à jour...</span>
              </div>
            )}
          </div>
          <p className="text-muted-foreground">Analysez les performances de votre restaurant</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">7 derniers jours</SelectItem>
              <SelectItem value="30days">30 derniers jours</SelectItem>
              <SelectItem value="90days">90 derniers jours</SelectItem>
              <SelectItem value="1year">Dernière année</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={refresh}
            variant="outline"
            size="sm"
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <Calendar className="h-4 w-4" />
            <span>Actualiser</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExportReport("complet")}
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Exporter
          </Button>
        </div>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="transform hover:scale-105 transition-transform">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenu total</p>
                <p className="text-2xl font-bold text-red-600">
                  {calculateTotalRevenue().toLocaleString('fr-FR')}€
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-sm text-green-600">+{calculateGrowthRate().toFixed(1)}%</span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="transform hover:scale-105 transition-transform">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Commandes totales</p>
                <p className="text-2xl font-bold text-blue-600">
                  {calculateTotalOrders()}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Activity className="h-3 w-3 text-blue-600" />
                  <span className="text-sm text-blue-600">Conversion: {getConversionRate().toFixed(1)}%</span>
                </div>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="transform hover:scale-105 transition-transform">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Clients totaux</p>
                <p className="text-2xl font-bold text-green-600">
                  {kpis?.totalCustomers || 0}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Users className="h-3 w-3 text-green-600" />
                  <span className="text-sm text-green-600">Rétention: {getCustomerRetentionRate().toFixed(1)}%</span>
                </div>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="transform hover:scale-105 transition-transform">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Panier moyen</p>
                <p className="text-2xl font-bold text-purple-600">
                  {calculateAverageOrderValue().toFixed(2)}€
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Target className="h-3 w-3 text-purple-600" />
                  <span className="text-sm text-purple-600">Rotation: {getInventoryTurnover().toFixed(1)}x</span>
                </div>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sales">Ventes</TabsTrigger>
          <TabsTrigger value="customers">Clients</TabsTrigger>
          <TabsTrigger value="products">Produits</TabsTrigger>
          <TabsTrigger value="inventory">Inventaire</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Évolution des ventes
                </CardTitle>
                <CardDescription>
                  Revenus et commandes sur la période sélectionnée
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockSalesData.map((day, index) => (
                    <div key={`sales-${index}`} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{new Date(day.date).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'short'
                        })}</p>
                        <p className="text-sm text-muted-foreground">{day.orders} commandes</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600">{day.revenue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}€</p>
                        <p className="text-sm text-muted-foreground">{day.averageOrderValue.toFixed(2)}€/commande</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Analyse des tendances
                </CardTitle>
                <CardDescription>
                  Indicateurs clés de performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Meilleur jour</p>
                      <p className="text-lg font-bold">Samedi</p>
                      <p className="text-sm text-green-600">2,680€</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Jour le plus lent</p>
                      <p className="text-lg font-bold">Lundi</p>
                      <p className="text-sm text-red-600">1,250€</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Heure de pointe</p>
                      <p className="text-lg font-bold">19h-20h</p>
                      <p className="text-sm text-blue-600">25% des commandes</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Panier max</p>
                      <p className="text-lg font-bold">28.50€</p>
                      <p className="text-sm text-purple-600">Moyenne: 21.20€</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Évolution clientèle
                </CardTitle>
                <CardDescription>
                  Nouveaux clients et taux de rétention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockCustomerData.map((month, index) => (
                    <div key={`customer-${index}`} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{month.period}</p>
                        <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                          <span>{month.newCustomers} nouveaux</span>
                          <span>{month.returningCustomers} fidèles</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600">{month.totalOrders} commandes</p>
                        <p className="text-sm text-green-600">{month.retentionRate}% rétention</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Segmentation clients
                </CardTitle>
                <CardDescription>
                  Répartition des clients par comportement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Clients fidèles</span>
                      <Badge className="bg-green-100 text-green-800">35%</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Plus de 10 commandes, taux de rétention élevé</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Clients réguliers</span>
                      <Badge className="bg-blue-100 text-blue-800">45%</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">5-10 commandes, bonne rétention</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Nouveaux clients</span>
                      <Badge className="bg-yellow-100 text-yellow-800">20%</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Moins de 5 commandes, à convertir</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance des produits
              </CardTitle>
              <CardDescription>
                Analyse des ventes et rentabilité par produit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockProductPerformance.map((product, index) => (
                  <div key={`product-${index}`} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{product.name}</h3>
                        <Badge variant="outline">{product.category}</Badge>
                        <div className="flex items-center gap-1">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-red-600"
                              style={{ width: `${product.popularity}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">{product.popularity}%</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Commandes: </span>
                          <span className="font-medium">{product.orders}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Revenu: </span>
                          <span className="font-medium text-red-600">{product.revenue}€</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Profit: </span>
                          <span className="font-medium text-green-600">{product.profit}€</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  État des stocks
                </CardTitle>
                <CardDescription>
                  Suivi des niveaux d'inventaire
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockInventory.map((item, index) => {
                    const status = getInventoryStatus(item.status);
                    const StatusIcon = status.icon;
                    return (
                      <div key={`inventory-${index}`} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{item.name}</h3>
                            <Badge variant="outline">{item.category}</Badge>
                            <Badge className={status.color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {status.label}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Stock actuel: </span>
                              <span className={`font-medium ${
                                item.status === 'critical' ? 'text-red-600' :
                                item.status === 'low' ? 'text-yellow-600' : 'text-green-600'
                              }`}>
                                {item.currentStock} {item.unit}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Stock minimum: </span>
                              <span className="font-medium">{item.minStock} {item.unit}</span>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Dernier réapprovisionnement: {new Date(item.lastRestock).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Recommandations
                </CardTitle>
                <CardDescription>
                  Actions suggérées basées sur les données
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20">
                    <h4 className="font-medium text-red-800 dark:text-red-600">Urgent</h4>
                    <p className="text-sm text-red-700 dark:text-red-400">
                      Réapprovisionner immédiatement les champignons (stock critique)
                    </p>
                  </div>
                  <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-600">À planifier</h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">
                      Commander de la sauce tomate dans les 2-3 jours
                    </p>
                  </div>
                  <div className="p-4 border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20">
                    <h4 className="font-medium text-green-800 dark:text-green-600">Optimisation</h4>
                    <p className="text-sm text-green-700 dark:text-green-400">
                      Augmenter la promotion de la Margherita Royale (meilleure performance)
                    </p>
                  </div>
                  <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
                    <h4 className="font-medium text-blue-800 dark:text-blue-600">Opportunité</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      Introduire des desserts saisonniers pour augmenter le panier moyen
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}