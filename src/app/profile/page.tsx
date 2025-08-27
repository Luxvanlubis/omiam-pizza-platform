'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, LogOut, Settings } from 'lucide-react';
import CustomerAuth from '@/components/customer/CustomerAuth';
import CustomerProfile from '@/components/customer/CustomerProfile';
import { CustomerProfile as CustomerProfileType } from '@/types/customer';
import { CustomerService } from '@/services/customerService';
import Layout from '@/components/layout/Layout';

export default function ProfilePage() {
  const [currentProfile, setCurrentProfile] = useState<CustomerProfileType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simuler la vérification d'une session existante
    const checkExistingSession = async () => {
      try {
        // Dans une vraie application, on vérifierait un token JWT ou une session
        const savedProfileId = localStorage.getItem('omiam_customer_id');
        if (savedProfileId) {
          const profile = await CustomerService.getProfile(savedProfileId);
          if (profile) {
            setCurrentProfile(profile);
          } else {
            localStorage.removeItem('omiam_customer_id');
          }
        }
      } catch (err) {
        console.error('Erreur lors de la vérification de session:', err);
        localStorage.removeItem('omiam_customer_id');
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingSession();
  }, []);

  const handleAuthSuccess = (profile: CustomerProfileType) => {
    setCurrentProfile(profile);
    setShowAuth(false);
    setError(null);
    // Sauvegarder l'ID du profil pour la session
    localStorage.setItem('omiam_customer_id', profile.id);
  };

  const handleLogout = () => {
    setCurrentProfile(null);
    localStorage.removeItem('omiam_customer_id');
  };

  const handleProfileUpdate = (updatedProfile: CustomerProfileType) => {
    setCurrentProfile(updatedProfile);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!currentProfile && !showAuth && (
          <div className="text-center py-12">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle>Bienvenue chez OMIAM</CardTitle>
                <CardDescription>
                  Connectez-vous pour accéder à votre espace personnel et profiter d'une expérience de réservation personnalisée.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Settings className="w-5 h-5 text-blue-600" />
                      <div className="text-left">
                        <p className="text-sm font-medium">Préférences sauvegardées</p>
                        <p className="text-xs text-gray-500">Tables, horaires, restrictions alimentaires</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <User className="w-5 h-5 text-green-600" />
                      <div className="text-left">
                        <p className="text-sm font-medium">Historique des réservations</p>
                        <p className="text-xs text-gray-500">Accès à toutes vos réservations passées</p>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => setShowAuth(true)}
                    className="w-full"
                  >
                    Se connecter / S'inscrire
                  </Button>
                  
                  <div className="text-center">
                    <Button 
                      variant="link" 
                      onClick={() => window.location.href = '/reservation'}
                      className="text-sm"
                    >
                      Continuer sans compte
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {showAuth && !currentProfile && (
          <CustomerAuth
            onAuthSuccess={handleAuthSuccess}
            onCancel={() => setShowAuth(false)}
          />
        )}

        {currentProfile && (
          <div className="space-y-6">
            {/* Statistiques rapides */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{currentProfile.totalReservations}</p>
                    <p className="text-sm text-gray-600">Réservations</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{currentProfile.loyaltyPoints}</p>
                    <p className="text-sm text-gray-600">Points fidélité</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {currentProfile.membershipLevel === 'bronze' ? 'Bronze' :
                       currentProfile.membershipLevel === 'silver' ? 'Argent' :
                       currentProfile.membershipLevel === 'gold' ? 'Or' : 'Platine'}
                    </p>
                    <p className="text-sm text-gray-600">Statut membre</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {currentProfile.reservationHistory?.length || 0}
                    </p>
                    <p className="text-sm text-gray-600">Visites cette année</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profil détaillé */}
            <CustomerProfile
              profile={currentProfile}
              onUpdate={handleProfileUpdate}
            />
          </div>
        )}
      </div>
    </Layout>
  );
}