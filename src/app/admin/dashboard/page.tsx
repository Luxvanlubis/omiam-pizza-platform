"use client";

import { useState } from "react";
import { cn, formatCurrency } from "@/lib/utils";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import RealTimeAnalytics from '@/components/admin/RealTimeAnalytics';
import { useAnalytics } from '@/hooks/useAnalytics';
import { UnifiedPOSModule } from "@/components/admin/UnifiedPOSModule";
import { MenuManagement } from "@/components/admin/MenuManagement";
import { LoyaltyManagement } from "@/components/admin/LoyaltyManagement";
import { SystemSettings } from "@/components/admin/SystemSettings";
import AnalyticsReports from "@/components/admin/AnalyticsReports";
import { AdvancedAnalytics } from "@/components/admin/AdvancedAnalytics";
import { SecurityManagement } from "@/components/admin/SecurityManagement";
import MediaManagement from "@/components/admin/MediaManagement";
import { ContentManagement } from "@/components/admin/ContentManagement";
import LocalizationManagement from "@/components/admin/LocalizationManagement";
import { LinksManagement } from "@/components/admin/LinksManagement";
import { NotificationCenter } from "@/components/admin/NotificationCenter";
import InventoryManagement from "@/components/admin/InventoryManagement";
import ReservationManagement from "@/components/admin/ReservationManagement";
import EnhancedDashboard from '@/components/admin/EnhancedDashboard';
import RealTimeUpdates from '@/components/reservation/RealTimeUpdates';
import { Users, ShoppingCart, TrendingUp, Settings, Pizza, Star, Clock, DollarSign, AlertCircle, CheckCircle, BarChart3, Database, LogOut, Image as ImageIcon, FileText, Globe, Link as LinkIcon, Timer, Bell, Search, Filter, Grid3X3, List, ChefHat, CreditCard, Shield, Palette, Languages, Package, Share2, Eye, Zap, Calendar
} from "lucide-react";

// Les stats seront calculées dans le composant avec le hook useAnalytics

const recentOrders = [
  { id: "ORD-001", customer: "Marie Dupont", items: ["Margherita Royale", "Coca-Cola"], total: 15, status: "completed", date: "2024-01-15 14:30" },
  { id: "ORD-002", customer: "Jean Martin", items: ["O'Miam Spéciale", "Eau"], total: 17, status: "preparing", date: "2024-01-15 14:45" },
  { id: "ORD-003", customer: "Sophie Bernard", items: ["4 Fromages", "Vin Rouge"], total: 18, status: "pending", date: "2024-01-15 15:00" }
];

// popularItems sera calculé dans le composant avec les données analytics

const loyaltyCustomers = [
  { name: "Marie Dupont", level: "Or", points: 1250, orders: 23, totalSpent: 456 },
  { name: "Jean Martin", level: "Argent", points: 780, orders: 15, totalSpent: 298 },
  { name: "Sophie Bernard", level: "Bronze", points: 450, orders: 8, totalSpent: 156 }
];

// Configuration des modules 
const Modules = [
  { id: "enhanced-dashboard", title: "Tableau de Bord Avancé", description: "Statistiques avancées, filtres et export des données", icon: BarChart3, color: "bg-indigo-600", component: EnhancedDashboard, priority: "high", isNew: true },
  { id: "real-time-updates", title: "Mises à Jour Temps Réel", description: "Synchronisation live des réservations et activités", icon: Zap, color: "bg-yellow-600", component: RealTimeUpdates, priority: "medium", isNew: true },
  { id: "unified-pos", title: "Point de Vente Unifié", description: "Gestion complète des commandes, suivi et caisse", icon: CreditCard, color: "bg-green-500", component: UnifiedPOSModule, priority: "high", isNew: true },
  { id: "menu", title: "Gestion du Menu", description: "Modifier les plats et prix", icon: Pizza, color: "bg-red-500", component: MenuManagement, priority: "medium" },
  { id: "inventory", title: "Gestion des Stocks", description: "Automatisation et suivi des stocks", icon: Package, color: "bg-orange-500", component: InventoryManagement, priority: "high", isNew: true },
  { id: "reservations", title: "Gestion des Réservations", description: "Calendrier et suivi des réservations", icon: Calendar, color: "bg-blue-500", component: ReservationManagement, priority: "high", isNew: true },
  { id: "analytics", title: "Analytics", description: "Rapports et statistiques", icon: BarChart3, color: "bg-purple-500", component: AnalyticsReports, priority: "medium" },
  { id: "advanced-analytics", title: "Analytics Avancées", description: "Analyses approfondies", icon: TrendingUp, color: "bg-indigo-500", component: AdvancedAnalytics, priority: "medium" },
  { id: "loyalty", title: "Programme Fidélité", description: "Gérer les points et récompenses", icon: Star, color: "bg-yellow-500", component: LoyaltyManagement, priority: "medium" },
  { id: "notifications", title: "Centre de Notifications", description: "Alertes et messages système", icon: Bell, color: "bg-pink-500", component: NotificationCenter, priority: "low" },
  { id: "security", title: "Sécurité", description: "Gestion des accès et sécurité", icon: Shield, color: "bg-gray-500", component: SecurityManagement, priority: "low" },
  { id: "settings", title: "Paramètres Système", description: "Configuration générale", icon: Settings, color: "bg-slate-500", component: SystemSettings, priority: "low" },
  { id: "media", title: "Gestion des Médias", description: "Images et fichiers", icon: ImageIcon, color: "bg-teal-500", component: MediaManagement, priority: "low" },
  { id: "content", title: "Gestion du Contenu", description: "Textes et contenus du site", icon: FileText, color: "bg-cyan-500", component: ContentManagement, priority: "low" },
  { id: "localization", title: "Langues & Localisation", description: "Gestion multilingue", icon: Languages, color: "bg-emerald-500", component: LocalizationManagement, priority: "low" },
  { id: "links", title: "Gestion des Liens", description: "Liens sociaux et externes", icon: LinkIcon, color: "bg-violet-500", component: LinksManagement, priority: "low" }
];

export default function Dashboard() {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { data: analyticsData, loading } = useAnalytics({ timeRange: '30days', autoRefresh: true, refreshInterval: 60000 });

  // Utiliser les données réelles ou des fallbacks
  const stats = {
    totalOrders: analyticsData?.kpis?.totalOrders || 1247,
    totalRevenue: analyticsData?.kpis?.totalRevenue || 25480,
    totalCustomers: analyticsData?.kpis?.totalCustomers || 892,
    averageOrderValue: analyticsData?.kpis?.averageOrderValue || 20.4
  };

  // Utiliser les données réelles pour les produits populaires ou fallback
  const popularItems = analyticsData?.productPerformance?.slice(0, 4) || [
    { name: "Margherita Royale", orders: 342, revenue: 4104 },
    { name: "O'Miam Spéciale", orders: 289, revenue: 4335 },
    { name: "Reine", orders: 198, revenue: 2574 },
    { name: "4 Fromages", orders: 156, revenue: 2184 }
  ];

  const handleLogout = () => {
    document.cookie = "admin-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = '/login';
  };

  // Filtrage des modules
  const filteredModules = Modules.filter(module => {
    const matchesSearch = module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'all' || module.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  // Rendu du module sélectionné
  if (selectedModule) {
    const selectedModuleData = Modules.find(m => m.id === selectedModule);
    if (selectedModuleData && selectedModuleData.component) {
      const ModuleComponent = selectedModuleData.component;
      return (
        <div className="min-h-screen bg-background">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="outline"
                onClick={() => setSelectedModule(null)}
                className="flex items-center gap-2"
              >
                ← Retour au Dashboard
              </Button>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${selectedModuleData.color} text-white`}>
                  <selectedModuleData.icon className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-red-800 dark:text-red-600">
                    {selectedModuleData.title}
                  </h1>
                  <p className="text-muted-foreground">{selectedModuleData.description}</p>
                </div>
              </div>
            </div>
            <ModuleComponent
              isOpen={notificationsOpen}
              onClose={() => setNotificationsOpen(false)}
            />
          </main>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* En-tête avec contrôles */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-red-800 dark:text-red-600 mb-2">
              Dashboard
            </h1>
            <p className="text-muted-foreground">Gérez votre pizzeria O'Miam</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            {/* Barre de recherche */}
            <div className="relative flex-1 lg:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un module..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {/* Filtres et contrôles */}
            <div className="flex items-center gap-2">
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background text-sm"
              >
                <option value="all">Toutes priorités</option>
                <option value="high">Haute</option>
                <option value="medium">Moyenne</option>
                <option value="low">Basse</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
              </Button>
            </div>
            <Button
              variant="outline"
              onClick={() => setNotificationsOpen(true)}
              className="relative flex items-center gap-2"
            >
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                3
              </Badge>
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </Button>
          </div>
        </div>

        {/* Analytics en temps réel */}
        <div className="mb-8">
          <RealTimeAnalytics timeRange="7days" compact={true} />
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <Card className="transform hover:scale-105 transition-all duration-200 hover:shadow-lg">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Commandes totales</p>
                  <p className="text-xl lg:text-2xl font-bold text-red-600">{stats.totalOrders}</p>
                </div>
                <ShoppingCart className="h-6 w-6 lg:h-8 lg:w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="transform hover:scale-105 transition-all duration-200 hover:shadow-lg">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Revenu total</p>
                  <p className="text-xl lg:text-2xl font-bold text-red-600">{formatCurrency(stats.totalRevenue)}</p>
                </div>
                <DollarSign className="h-6 w-6 lg:h-8 lg:w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="transform hover:scale-105 transition-all duration-200 hover:shadow-lg">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Clients</p>
                  <p className="text-xl lg:text-2xl font-bold text-red-600">{stats.totalCustomers}</p>
                </div>
                <Users className="h-6 w-6 lg:h-8 lg:w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="transform hover:scale-105 transition-all duration-200 hover:shadow-lg">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Panier moyen</p>
                  <p className="text-xl lg:text-2xl font-bold text-red-600">{stats.averageOrderValue}€</p>
                </div>
                <TrendingUp className="h-6 w-6 lg:h-8 lg:w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modules d'administration */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-red-800 dark:text-red-600 mb-6">
            Modules d'administration
          </h2>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {filteredModules.map((module) => (
                <Card
                  key={module.id}
                  className="cursor-pointer transform hover:scale-105 transition-all duration-200 hover:shadow-lg group relative"
                  onClick={() => setSelectedModule(module.id)}
                >
                  {module.isNew && (
                    <Badge className="absolute -top-2 -right-2 bg-green-500 text-white z-10">
                      Nouveau
                    </Badge>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${module.color} text-white group-hover:scale-110 transition-transform`}>
                        <module.icon className="h-5 w-5" />
                      </div>
                      <Badge
                        variant={module.priority === 'high' ? 'destructive' : module.priority === 'medium' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {module.priority === 'high' ? 'Haute' : module.priority === 'medium' ? 'Moyenne' : 'Basse'}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg group-hover:text-red-600 transition-colors">
                      {module.title}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {module.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      {Boolean(module.component) ? (
                        <Button size="sm" variant="outline" className="w-full group-hover:bg-red-50">
                          <Eye className="h-4 w-4 mr-2" />
                          Ouvrir
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" disabled className="w-full">
                          <Zap className="h-4 w-4 mr-2" />
                          Bientôt disponible
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredModules.map((module) => (
                <Card
                  key={module.id}
                  className="cursor-pointer hover:shadow-md transition-all duration-200 group"
                  onClick={() => setSelectedModule(module.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${module.color} text-white`}>
                          <module.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold group-hover:text-red-600 transition-colors">
                              {module.title}
                            </h3>
                            {module.isNew && (
                              <Badge className="bg-green-500 text-white text-xs">
                                Nouveau
                              </Badge>
                            )}
                            <Badge
                              variant={module.priority === 'high' ? 'destructive' : module.priority === 'medium' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {module.priority === 'high' ? 'Haute' : module.priority === 'medium' ? 'Moyenne' : 'Basse'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{module.description}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        Ouvrir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Aperçu des données récentes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-800 dark:text-red-600 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Commandes récentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-sm">{order.id}</p>
                      <p className="text-xs text-muted-foreground">{order.customer}</p>
                      <p className="text-xs text-muted-foreground">{order.date}</p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          order.status === "completed" ? "default" :
                          order.status === "preparing" ? "secondary" : "destructive"
                        }
                        className="text-xs mb-1"
                      >
                        {order.status === "completed" ? "Terminée" :
                         order.status === "preparing" ? "Préparation" : "En attente"}
                      </Badge>
                      <p className="text-sm font-bold text-red-600">{order.total}€</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-red-800 dark:text-red-600 flex items-center gap-2">
                <Pizza className="h-5 w-5" />
                Plats populaires
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {popularItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Pizza className="h-4 w-4 text-red-600" />
                      <div>
                        <p className="font-semibold text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.orders} commandes</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-red-600">{item.revenue}€</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-red-800 dark:text-red-600 flex items-center gap-2">
                <Star className="h-5 w-5" />
                Top Clients Fidèles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loyaltyCustomers.map((customer, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-sm">{customer.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={
                            customer.level === "Or" ? "default" :
                            customer.level === "Argent" ? "secondary" : "outline"
                          }
                          className="text-xs"
                        >
                          {customer.level}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{customer.points} pts</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {customer.orders} commandes • {customer.totalSpent}€
                      </p>
                    </div>
                    <Star className="h-4 w-4 text-yellow-500" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Centre de notifications */}
      <NotificationCenter
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </div>
  );
}