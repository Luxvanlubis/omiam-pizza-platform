"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Clock, CheckCircle, AlertCircle, User, Pizza, ShoppingCart } from "lucide-react";

interface GestionTempsReelProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface Activity {
  id: string;
  type: 'order' | 'reservation' | 'delivery' | 'stock';
  title: string;
  description: string;
  timestamp: Date;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
}

export function GestionTempsReel({ isOpen, onClose }: GestionTempsReelProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLive, setIsLive] = useState(true);

  // Données de démonstration
  const mockActivities: Activity[] = [
    {
      id: '1',
      type: 'order',
      title: 'Nouvelle commande',
      description: 'Commande #CMD-2024-001 - Pizza Margherita + Coca',
      timestamp: new Date(),
      status: 'pending',
      priority: 'high'
    },
    {
      id: '2',
      type: 'reservation',
      title: 'Réservation confirmée',
      description: 'Table pour 4 personnes à 19h30 - Client: Martin',
      timestamp: new Date(Date.now() - 5 * 60000),
      status: 'completed',
      priority: 'medium'
    },
    {
      id: '3',
      type: 'stock',
      title: 'Alerte stock',
      description: 'Stock bas : Mozzarella (2kg restants)',
      timestamp: new Date(Date.now() - 10 * 60000),
      status: 'processing',
      priority: 'high'
    },
    {
      id: '4',
      type: 'delivery',
      title: 'Livraison en cours',
      description: 'Livreur en route - Commande #CMD-2024-002',
      timestamp: new Date(Date.now() - 15 * 60000),
      status: 'processing',
      priority: 'medium'
    }
  ];

  useEffect(() => {
    setActivities(mockActivities);
    
    // Simulation de mises à jour en temps réel
    if (isLive) {
      const interval = setInterval(() => {
        const newActivity: Activity = {
          id: Date.now().toString(),
          type: ['order', 'reservation', 'stock'][Math.floor(Math.random() * 3)] as Activity['type'],
          title: ['Nouvelle commande', 'Réservation reçue', 'Alerte stock'][Math.floor(Math.random() * 3)],
          description: [
            'Commande #CMD-' + Date.now().toString().slice(-4) + ' - Pizza spéciale',
            'Table pour ' + (Math.floor(Math.random() * 6) + 2) + ' personnes - Client: Dupont',
            'Stock bas : ' + ['Tomates', 'Mozzarella', 'Pepperoni'][Math.floor(Math.random() * 3)] + ' (' + Math.floor(Math.random() * 5) + 'kg restants)'
          ][Math.floor(Math.random() * 3)],
          timestamp: new Date(),
          status: ['pending', 'processing', 'completed'][Math.floor(Math.random() * 3)] as Activity['status'],
          priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as Activity['priority']
        };
        
        setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [isLive]);

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'order': return ShoppingCart;
      case 'reservation': return User;
      case 'stock': return Pizza;
      case 'delivery': return Clock;
      default: return Bell;
    }
  };

  const getStatusColor = (status: Activity['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'processing': return 'text-blue-600 bg-blue-50';
      case 'completed': return 'text-green-600 bg-green-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: Activity['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    return `Il y a ${Math.floor(minutes / 60)}h`;
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Activité en Temps Réel</h2>
          <p className="text-gray-600">Suivez les événements de votre pizzeria en direct</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={isLive ? "default" : "outline"}
            onClick={() => setIsLive(!isLive)}
            className="flex items-center gap-2"
          >
            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
            {isLive ? 'En direct' : 'En pause'}
          </Button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Commandes actives</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Réservations aujourd'hui</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <User className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alertes en cours</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Livraisons actives</p>
                <p className="text-2xl font-bold">5</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des activités */}
      <Card>
        <CardHeader>
          <CardTitle>Activités récentes</CardTitle>
          <CardDescription>Les 10 dernières activités de votre pizzeria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              return (
                <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className={`p-2 rounded-full ${getStatusColor(activity.status)}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{activity.title}</h4>
                      <Badge className={getPriorityColor(activity.priority)}>
                        {activity.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatTime(activity.timestamp)}</p>
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