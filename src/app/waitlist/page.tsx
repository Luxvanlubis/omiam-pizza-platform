'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  Search, 
  Clock, 
  Users, 
  Bell, 
  Info,
  CheckCircle,
  Star,
  TrendingUp,
  Calendar
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import WaitlistForm from '@/components/waitlist/WaitlistForm';
import WaitlistStatus from '@/components/waitlist/WaitlistStatus';
import { CustomerProfile } from '@/types/customer';
import { WaitlistService } from '@/services/waitlistService';
import { WaitlistStats } from '@/types/waitlist';
import { toast } from 'sonner';

export default function WaitlistPage() {
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [stats, setStats] = useState<WaitlistStats | null>(null);
  const [activeTab, setActiveTab] = useState('join');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Charger le profil client depuis le localStorage
      const savedProfile = localStorage.getItem('customerProfile');
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        setCustomerProfile(profile);
        
        // Si le client est connecté, afficher d'abord ses demandes
        setActiveTab('status');
      }
      
      // Charger les statistiques publiques
      const waitlistStats = await WaitlistService.getWaitlistStats();
      setStats(waitlistStats);
    } catch (error: any) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWaitlistSuccess = () => {
    // Basculer vers l'onglet statut après soumission réussie
    setActiveTab('status');
    toast.success('Votre demande a été enregistrée avec succès!');
  };

  const formatWaitTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center space-x-3">
            <Heart className="h-8 w-8 text-red-500" />
            <span>Liste d'attente</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Aucune table disponible pour vos dates ? Rejoignez notre liste d'attente et nous vous notifierons dès qu'une place se libère.
          </p>
        </div>

        {/* Statistiques en temps réel */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.totalEntries}</p>
                    <p className="text-sm text-muted-foreground">Demandes actives</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">{formatWaitTime(stats.averageWaitTime)}</p>
                    <p className="text-sm text-muted-foreground">Attente moyenne</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.successRate}%</p>
                    <p className="text-sm text-muted-foreground">Taux de succès</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.peakHours.join(', ')}</p>
                    <p className="text-sm text-muted-foreground">Heures de pointe</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Onglets principaux */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="join" className="flex items-center space-x-2">
              <Heart className="h-4 w-4" />
              <span>Rejoindre la liste</span>
            </TabsTrigger>
            <TabsTrigger value="status" className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span>Vérifier le statut</span>
            </TabsTrigger>
          </TabsList>

          {/* Onglet: Rejoindre la liste d'attente */}
          <TabsContent value="join" className="space-y-6">
            {/* Informations sur le processus */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Heart className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">1. Rejoignez la liste</h3>
                  <p className="text-sm text-muted-foreground">
                    Remplissez le formulaire avec vos préférences de réservation
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Bell className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="font-semibold mb-2">2. Recevez une notification</h3>
                  <p className="text-sm text-muted-foreground">
                    Nous vous contactons dès qu'une table correspondante se libère
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">3. Confirmez rapidement</h3>
                  <p className="text-sm text-muted-foreground">
                    Vous avez 30 minutes pour confirmer votre réservation
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Formulaire de liste d'attente */}
            <WaitlistForm 
              customerProfile={customerProfile || undefined}
              onSuccess={handleWaitlistSuccess}
            />
          </TabsContent>

          {/* Onglet: Vérifier le statut */}
          <TabsContent value="status" className="space-y-6">
            <WaitlistStatus 
              customerId={customerProfile?.id}
              onUpdate={(entry) => {
                toast.success('Statut mis à jour');
              }}
              onCancel={(entryId) => {
                toast.success('Demande annulée');
              }}
            />
          </TabsContent>
        </Tabs>

        {/* Informations complémentaires */}
        <div className="mt-12 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* FAQ */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Info className="h-5 w-5" />
                  <span>Questions fréquentes</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Combien de temps dois-je attendre ?</h4>
                  <p className="text-sm text-muted-foreground">
                    Le temps d'attente dépend de vos critères (date, heure, nombre de convives). 
                    Plus vous êtes flexible, plus vos chances sont élevées.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Que se passe-t-il si je rate la notification ?</h4>
                  <p className="text-sm text-muted-foreground">
                    Vous avez 30 minutes pour répondre. Passé ce délai, nous proposons 
                    la table au client suivant et vous restez dans la liste.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Puis-je modifier ma demande ?</h4>
                  <p className="text-sm text-muted-foreground">
                    Vous pouvez annuler votre demande actuelle et en créer une nouvelle 
                    avec des critères différents.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Conseils */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5" />
                  <span>Conseils pour optimiser vos chances</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Badge variant="secondary" className="mt-0.5">1</Badge>
                  <div>
                    <h4 className="font-semibold mb-1">Soyez flexible sur les horaires</h4>
                    <p className="text-sm text-muted-foreground">
                      Sélectionnez plusieurs créneaux horaires pour augmenter vos chances
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Badge variant="secondary" className="mt-0.5">2</Badge>
                  <div>
                    <h4 className="font-semibold mb-1">Évitez les heures de pointe</h4>
                    <p className="text-sm text-muted-foreground">
                      Les créneaux 19h30-20h30 sont les plus demandés
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Badge variant="secondary" className="mt-0.5">3</Badge>
                  <div>
                    <h4 className="font-semibold mb-1">Mentionnez les occasions spéciales</h4>
                    <p className="text-sm text-muted-foreground">
                      Les anniversaires et événements spéciaux ont une priorité plus élevée
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Badge variant="secondary" className="mt-0.5">4</Badge>
                  <div>
                    <h4 className="font-semibold mb-1">Répondez rapidement</h4>
                    <p className="text-sm text-muted-foreground">
                      Activez les notifications pour ne pas manquer votre chance
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Besoin d'aide ?</strong> Notre équipe est disponible au{' '}
              <strong>01 23 45 67 89</strong> ou par email à{' '}
              <strong>reservation@restaurant.com</strong> pour toute question 
              concernant votre demande de liste d'attente.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </Layout>
  );
}