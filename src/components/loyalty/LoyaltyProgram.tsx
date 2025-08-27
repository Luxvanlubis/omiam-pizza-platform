"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLoyaltyStore } from "@/store/loyalty-store";
import { Star, Gift, Crown, Award, TrendingUp } from "lucide-react";

export function LoyaltyProgram() {
  const { customers, getAvailableRewards } = useLoyaltyStore();
  const [selectedLevel, setSelectedLevel] = useState<'Bronze' | 'Argent' | 'Or' | 'Platine'>('Bronze');
  
  const levelColors = {
    Bronze: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300',
    Argent: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    Or: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
    Platine: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
  };
  
  const levelIcons = {
    Bronze: Award,
    Argent: Star,
    Or: Crown,
    Platine: Gift
  };
  
  const levelBenefits = {
    Bronze: {
      points: '0-499 points',
      color: 'text-amber-600',
      benefits: [
        '1 point pour 10€ dépensés',
        'Boisson offerte à 250 points',
        '10% de réduction à 400 points'
      ]
    },
    Argent: {
      points: '500-999 points',
      color: 'text-gray-600',
      benefits: [
        '1.2x points par achat',
        'Pizza offerte à 600 points',
        '20% de réduction à 800 points',
        'Dessert maison gratuit à 900 points'
      ]
    },
    Or: {
      points: '1000-1999 points',
      color: 'text-yellow-600',
      benefits: [
        '1.5x points par achat',
        'Menu complet offert à 1200 points',
        '30% de réduction permanente',
        'Bouteille de vin offerte',
        'Priorité sur les réservations'
      ]
    },
    Platine: {
      points: '2000+ points',
      color: 'text-purple-600',
      benefits: [
        '2x points par achat',
        'Dîner pour 2 personnes offert',
        '40% de réduction permanente',
        'Accès VIP aux événements',
        'Menu dégustation exclusif',
        'Service prioritaire'
      ]
    }
  };
  
  const rewards = getAvailableRewards(selectedLevel);
  
  return (
    <div className="space-y-8">
      {/* En-tête du programme */}
      <Card className="transform hover:scale-105 transition-transform">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl text-red-800 dark:text-red-600 flex items-center justify-center gap-2">
            <Star className="h-8 w-8 text-yellow-500" />
            Programme de Fidélité O'Miam
          </CardTitle>
          <CardDescription className="text-lg">
            Cumulez des points à chaque achat et bénéficiez d'avantages exclusifs !
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/10">
              <div className="text-2xl font-bold text-amber-600">1 point</div>
              <div className="text-sm text-muted-foreground">pour 10€ dépensés</div>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="text-2xl font-bold text-gray-600">+20%</div>
              <div className="text-sm text-muted-foreground">points niveau Argent</div>
            </div>
            <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/10">
              <div className="text-2xl font-bold text-yellow-600">+50%</div>
              <div className="text-sm text-muted-foreground">points niveau Or</div>
            </div>
            <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/10">
              <div className="text-2xl font-bold text-purple-600">+100%</div>
              <div className="text-sm text-muted-foreground">points niveau Platine</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Sélection du niveau */}
      <div className="flex flex-wrap justify-center gap-4">
        {(['Bronze', 'Argent', 'Or', 'Platine'] as const).map((level) => {
          const Icon = levelIcons[level];
          return (
            <Button
              key={level}
              variant={selectedLevel === level ? "default" : "outline"}
              onClick={() => setSelectedLevel(level)}
              className={`flex items-center gap-2 ${
                selectedLevel === level
                  ? level === 'Bronze'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : level === 'Argent'
                    ? 'bg-gray-600 hover:bg-gray-700'
                    : level === 'Or'
                    ? 'bg-yellow-600 hover:bg-yellow-700'
                    : 'bg-purple-600 hover:bg-purple-700'
                  : ''
              }`}
            >
              <Icon className="h-4 w-4" />
              {level}
            </Button>
          );
        })}
      </div>
      
      {/* Détails du niveau */}
      <Card className="transform hover:scale-105 transition-transform">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              selectedLevel === 'Bronze'
                ? 'bg-amber-600'
                : selectedLevel === 'Argent'
                ? 'bg-gray-600'
                : selectedLevel === 'Or'
                ? 'bg-yellow-600'
                : 'bg-purple-600'
            }`}>
              {(() => {
                const Icon = levelIcons[selectedLevel];
                return <Icon className="h-4 w-4 text-white" />;
              })()}
            </div>
            Niveau {selectedLevel}
          </CardTitle>
          <CardDescription>
            {levelBenefits[selectedLevel].points} • {levelBenefits[selectedLevel].color}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h4 className="font-semibold">Avantages exclusifs :</h4>
            <ul className="space-y-2">
              {levelBenefits[selectedLevel].benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
      
      {/* Récompenses disponibles */}
      <Card className="transform hover:scale-105 transition-transform">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Récompenses disponibles - Niveau {selectedLevel}
          </CardTitle>
          <CardDescription>
            Échangez vos points contre ces récompenses exclusives
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {rewards.map((reward, index) => (
              <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gift className="h-5 w-5 text-red-600" />
                    <span className="font-medium">{reward.name}</span>
                  </div>
                  <Badge variant="outline">Disponible</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Meilleurs clients */}
      <Card className="transform hover:scale-105 transition-transform">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Nos Clients les Plus Fidèles
          </CardTitle>
          <CardDescription>
            Merci à nos clients fidèles pour leur confiance !
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {customers
              .sort((a, b) => b.points - a.points)
              .slice(0, 5)
              .map((customer, index) => {
                const Icon = levelIcons[customer.level];
                return (
                  <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-gray-400">#{index + 1}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{customer.name}</p>
                          <Badge className={levelColors[customer.level]}>
                            <Icon className="h-3 w-3 mr-1" />
                            {customer.level}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {customer.totalOrders} commandes • {customer.totalSpent}€ dépensés
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-600">{customer.points} pts</p>
                      <p className="text-sm text-muted-foreground">Dernière visite: {customer.lastVisit}</p>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}