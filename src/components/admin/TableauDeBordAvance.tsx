"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Download, Filter, TrendingUp, Users, DollarSign, ShoppingCart } from "lucide-react";

interface TableauDeBordAvanceProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function TableauDeBordAvance({ isOpen, onClose }: TableauDeBordAvanceProps) {
  const [dateRange, setDateRange] = useState('7days');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  // Données de démonstration
  const revenueData = [
    { date: 'Lun', revenue: 2400, orders: 24 },
    { date: 'Mar', revenue: 1398, orders: 18 },
    { date: 'Mer', revenue: 9800, orders: 98 },
    { date: 'Jeu', revenue: 3908, orders: 38 },
    { date: 'Ven', revenue: 4800, orders: 48 },
    { date: 'Sam', revenue: 3800, orders: 38 },
    { date: 'Dim', revenue: 4300, orders: 43 },
  ];

  const topPizzas = [
    { name: 'Margherita Royale', orders: 145, revenue: 1740 },
    { name: 'O\'Miam Spéciale', orders: 123, revenue: 1845 },
    { name: '4 Fromages', orders: 98, revenue: 1372 },
    { name: 'Reine', orders: 87, revenue: 1131 },
    { name: 'Pepperoni', orders: 76, revenue: 988 },
  ];

  const customerSegments = [
    { name: 'Nouveaux', value: 35, color: '#8884d8' },
    { name: 'Réguliers', value: 45, color: '#82ca9d' },
    { name: 'VIP', value: 20, color: '#ffc658' },
  ];

  const kpis = [
    { title: 'Chiffre d\'affaires', value: '€25,480', change: '+12.5%', icon: DollarSign, color: 'text-green-600' },
    { title: 'Commandes', value: '1,247', change: '+8.2%', icon: ShoppingCart, color: 'text-blue-600' },
    { title: 'Nouveaux clients', value: '156', change: '+15.3%', icon: Users, color: 'text-purple-600' },
    { title: 'Panier moyen', value: '€20.40', change: '+3.8%', icon: TrendingUp, color: 'text-orange-600' },
  ];

  const exportData = () => {
    // Logique d'export CSV
    console.log('Export des données...');
  };

  return (
    <div className="space-y-6">
      {/* Contrôles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Avancées</h2>
          <p className="text-gray-600">Analyse détaillée des performances de votre pizzeria</p>
        </div>
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="7days">7 derniers jours</option>
            <option value="30days">30 derniers jours</option>
            <option value="90days">90 derniers jours</option>
          </select>
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                {kpi.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                  <p className={`text-sm ${kpi.color}`}>{kpi.change}</p>
                </div>
                <kpi.icon className={`h-8 w-8 ${kpi.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Évolution du chiffre d'affaires</CardTitle>
            <CardDescription>Par jour sur la période sélectionnée</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: any) => [`€${value}`, 'Revenue']} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 Pizzas</CardTitle>
            <CardDescription>Les pizzas les plus commandées</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topPizzas}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value: any, name: string) => [name === 'orders' ? `${value} commandes` : `€${value}`, name === 'orders' ? 'Commandes' : 'Revenue']} />
                <Legend />
                <Bar dataKey="orders" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Répartition des clients</CardTitle>
            <CardDescription>Segmentation de la clientèle</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={customerSegments}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {customerSegments.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performances par heure</CardTitle>
            <CardDescription>Activité moyenne par créneau horaire</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { hour: '12h-14h', orders: 45, trend: '+5%' },
                { hour: '19h-21h', orders: 78, trend: '+12%' },
                { hour: '21h-23h', orders: 34, trend: '-3%' },
              ].map((slot, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{slot.hour}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{slot.orders} commandes</span>
                    <Badge variant={slot.trend.startsWith('+') ? 'default' : 'secondary'}>
                      {slot.trend}
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
}