'use client';

import React from 'react';
import Layout from '@/components/layout/Layout';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <Layout showHeader={true} maxWidth="full" className="px-4">
      {/* En-tête de la page */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BarChart3 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600">Tableau de bord analytique et statistiques du restaurant</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Performance</p>
                  <p className="text-2xl font-bold text-blue-900">Excellente</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Satisfaction</p>
                  <p className="text-2xl font-bold text-green-900">94%</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Croissance</p>
                  <p className="text-2xl font-bold text-purple-900">+12%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Rentabilité</p>
                  <p className="text-2xl font-bold text-orange-900">Optimale</p>
                </div>
                <DollarSign className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Composant principal du tableau de bord */}
      <AnalyticsDashboard />

      {/* Informations supplémentaires */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>À propos des analytics</CardTitle>
            <CardDescription>
              Comprendre vos données pour optimiser votre restaurant
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50">
                  📊
                </Badge>
                Métriques clés
              </h4>
              <p className="text-sm text-muted-foreground">
                Suivez vos réservations, revenus, taux d'occupation et satisfaction client en temps réel.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50">
                  🎯
                </Badge>
                Insights intelligents
              </h4>
              <p className="text-sm text-muted-foreground">
                Recevez des recommandations personnalisées basées sur l'analyse de vos données.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Badge variant="outline" className="bg-purple-50">
                  📈
                </Badge>
                Prévisions
              </h4>
              <p className="text-sm text-muted-foreground">
                Anticipez les tendances et optimisez votre planning avec nos algorithmes prédictifs.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fonctionnalités avancées</CardTitle>
            <CardDescription>
              Outils d'analyse pour les professionnels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Badge variant="outline" className="bg-orange-50">
                  📋
                </Badge>
                Rapports personnalisés
              </h4>
              <p className="text-sm text-muted-foreground">
                Créez et exportez des rapports détaillés selon vos besoins spécifiques.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Badge variant="outline" className="bg-red-50">
                  ⚡
                </Badge>
                Alertes en temps réel
              </h4>
              <p className="text-sm text-muted-foreground">
                Soyez notifié instantanément des événements importants et des anomalies.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Badge variant="outline" className="bg-yellow-50">
                  🔄
                </Badge>
                Synchronisation multi-plateforme
              </h4>
              <p className="text-sm text-muted-foreground">
                Accédez à vos analytics depuis tous vos appareils, toujours synchronisés.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}