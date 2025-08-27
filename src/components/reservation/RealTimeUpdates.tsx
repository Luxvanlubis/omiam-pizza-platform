"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Wifi, WifiOff, Activity, Bell, Users, Calendar, 
  Clock, CheckCircle, AlertCircle, RefreshCw, Zap
} from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface Reservation {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  time: string;
  guests: number;
  tableId?: string;
  tableNumber?: number;
  status: 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no-show';
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
}

interface WebSocketMessage {
  type: 'reservation_created' | 'reservation_updated' | 'reservation_cancelled' | 'table_status_changed' | 'system_notification';
  data: any;
  timestamp: string;
}

interface ConnectionStats {
  connected: boolean;
  lastPing: Date | null;
  reconnectAttempts: number;
  totalMessages: number;
  uptime: number;
}

const RealTimeUpdates: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const [connectionStats, setConnectionStats] = useState<ConnectionStats>({
    connected: false,
    lastPing: null,
    reconnectAttempts: 0,
    totalMessages: 0,
    uptime: 0
  });
  const [recentUpdates, setRecentUpdates] = useState<WebSocketMessage[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [reconnectTimer, setReconnectTimer] = useState<NodeJS.Timeout | null>(null);

  // Données mockées pour la démonstration
  const [mockReservations] = useState<Reservation[]>([
    {
      id: 'RES-2024-001',
      customerName: 'Marie Dubois',
      customerEmail: 'marie@email.com',
      customerPhone: '+33 1 23 45 67 89',
      date: '2024-01-15',
      time: '19:30',
      guests: 4,
      tableId: 'T001',
      tableNumber: 12,
      status: 'confirmed',
      specialRequests: 'Anniversaire - gâteau',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:35:00Z'
    },
    {
      id: 'RES-2024-002',
      customerName: 'Jean Martin',
      customerEmail: 'jean@email.com',
      customerPhone: '+33 1 98 76 54 32',
      date: '2024-01-15',
      time: '20:00',
      guests: 2,
      tableId: 'T005',
      tableNumber: 8,
      status: 'pending',
      createdAt: '2024-01-15T11:15:00Z',
      updatedAt: '2024-01-15T11:15:00Z'
    },
    {
      id: 'RES-2024-003',
      customerName: 'Sophie Laurent',
      customerEmail: 'sophie@email.com',
      customerPhone: '+33 1 11 22 33 44',
      date: '2024-01-15',
      time: '18:45',
      guests: 6,
      tableId: 'T010',
      tableNumber: 15,
      status: 'seated',
      specialRequests: 'Allergie aux fruits de mer',
      createdAt: '2024-01-15T09:20:00Z',
      updatedAt: '2024-01-15T18:45:00Z'
    }
  ]);

  // Simulation WebSocket pour la démonstration
  const connectWebSocket = useCallback(() => {
    if (!isEnabled) return;

    try {
      // En production, utilisez une vraie URL WebSocket
      // const websocket = new WebSocket('ws://localhost:3001/ws');
      
      // Simulation pour la démonstration
      const mockWebSocket = {
        readyState: WebSocket.OPEN,
        close: () => {},
        send: (data: string) => console.log('Sending:', data)
      } as WebSocket;

      setWs(mockWebSocket);
      setIsConnected(true);
      setConnectionStats(prev => ({
        ...prev,
        connected: true,
        lastPing: new Date(),
        reconnectAttempts: 0
      }));

      toast({
        title: "Connexion établie",
        description: "Les mises à jour temps réel sont activées.",
      });

      // Simulation de messages WebSocket
      simulateWebSocketMessages();

    } catch (error) {
      console.error('Erreur de connexion WebSocket:', error);
      handleConnectionError();
    }
  }, [isEnabled]);

  const disconnectWebSocket = useCallback(() => {
    if (ws) {
      ws.close();
      setWs(null);
    }
    setIsConnected(false);
    setConnectionStats(prev => ({ ...prev, connected: false }));
    
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      setReconnectTimer(null);
    }
  }, [ws, reconnectTimer]);

  const handleConnectionError = useCallback(() => {
    setIsConnected(false);
    setConnectionStats(prev => ({
      ...prev,
      connected: false,
      reconnectAttempts: prev.reconnectAttempts + 1
    }));

    if (isEnabled && connectionStats.reconnectAttempts < 5) {
      const timer = setTimeout(() => {
        console.log('Tentative de reconnexion...');
        connectWebSocket();
      }, Math.pow(2, connectionStats.reconnectAttempts) * 1000); // Backoff exponentiel
      
      setReconnectTimer(timer);
    }
  }, [isEnabled, connectionStats.reconnectAttempts, connectWebSocket]);

  // Simulation de messages WebSocket pour la démonstration
  const simulateWebSocketMessages = () => {
    const messageTypes: WebSocketMessage['type'][] = [
      'reservation_created',
      'reservation_updated',
      'table_status_changed',
      'system_notification'
    ];

    const interval = setInterval(() => {
      if (!isConnected || !isEnabled) {
        clearInterval(interval);
        return;
      }

      const randomType = messageTypes[Math.floor(Math.random() * messageTypes.length)];
      const message: WebSocketMessage = {
        type: randomType,
        data: generateMockData(randomType),
        timestamp: new Date().toISOString()
      };

      handleWebSocketMessage(message);
    }, 10000 + Math.random() * 20000); // Messages aléatoires entre 10-30 secondes

    // Nettoyer l'intervalle après 5 minutes pour la démo
    setTimeout(() => clearInterval(interval), 300000);
  };

  const generateMockData = (type: WebSocketMessage['type']) => {
    switch (type) {
      case 'reservation_created':
        return {
          reservation: {
            id: `RES-2024-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
            customerName: ['Alice Dupont', 'Bob Smith', 'Claire Martin'][Math.floor(Math.random() * 3)],
            date: '2024-01-15',
            time: ['19:00', '19:30', '20:00', '20:30'][Math.floor(Math.random() * 4)],
            guests: Math.floor(Math.random() * 6) + 1,
            status: 'pending'
          }
        };
      case 'reservation_updated':
        return {
          reservationId: mockReservations[Math.floor(Math.random() * mockReservations.length)].id,
          changes: { status: ['confirmed', 'seated', 'completed'][Math.floor(Math.random() * 3)] }
        };
      case 'table_status_changed':
        return {
          tableId: `T${String(Math.floor(Math.random() * 20) + 1).padStart(3, '0')}`,
          status: ['available', 'occupied', 'reserved', 'cleaning'][Math.floor(Math.random() * 4)]
        };
      case 'system_notification':
        return {
          message: ['Nouveau client VIP arrivé', 'Table 12 demande l\'addition', 'Cuisine: commande spéciale prête'][Math.floor(Math.random() * 3)],
          priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
        };
      default:
        return {};
    }
  };

  const handleWebSocketMessage = (message: WebSocketMessage) => {
    setConnectionStats(prev => ({
      ...prev,
      totalMessages: prev.totalMessages + 1,
      lastPing: new Date()
    }));

    setRecentUpdates(prev => [message, ...prev.slice(0, 9)]); // Garder les 10 derniers messages

    // Traiter le message selon son type
    switch (message.type) {
      case 'reservation_created':
        toast({
          title: "Nouvelle réservation",
          description: `${message.data.reservation.customerName} - ${message.data.reservation.guests} personnes`,
        });
        break;
      case 'reservation_updated':
        toast({
          title: "Réservation mise à jour",
          description: `Statut changé: ${message.data.changes.status}`,
        });
        break;
      case 'table_status_changed':
        toast({
          title: "Statut de table modifié",
          description: `Table ${message.data.tableId}: ${message.data.status}`,
        });
        break;
      case 'system_notification':
        toast({
          title: "Notification système",
          description: message.data.message,
          variant: message.data.priority === 'high' ? 'destructive' : 'default'
        });
        break;
    }
  };

  const getStatusColor = (status: Reservation['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'seated': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no-show': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Reservation['status']) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmée';
      case 'seated': return 'Installée';
      case 'completed': return 'Terminée';
      case 'cancelled': return 'Annulée';
      case 'no-show': return 'Absent';
      default: return status;
    }
  };

  const getMessageIcon = (type: WebSocketMessage['type']) => {
    switch (type) {
      case 'reservation_created': return <Calendar className="h-4 w-4 text-blue-600" />;
      case 'reservation_updated': return <RefreshCw className="h-4 w-4 text-green-600" />;
      case 'table_status_changed': return <Users className="h-4 w-4 text-orange-600" />;
      case 'system_notification': return <Bell className="h-4 w-4 text-purple-600" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getMessageTitle = (type: WebSocketMessage['type']) => {
    switch (type) {
      case 'reservation_created': return 'Nouvelle réservation';
      case 'reservation_updated': return 'Réservation modifiée';
      case 'table_status_changed': return 'Statut de table';
      case 'system_notification': return 'Notification système';
      default: return 'Mise à jour';
    }
  };

  // Effets
  useEffect(() => {
    setReservations(mockReservations);
  }, [mockReservations]);

  useEffect(() => {
    if (isEnabled) {
      connectWebSocket();
    } else {
      disconnectWebSocket();
    }

    return () => {
      disconnectWebSocket();
    };
  }, [isEnabled, connectWebSocket, disconnectWebSocket]);

  // Calcul du temps de connexion
  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(() => {
        setConnectionStats(prev => ({
          ...prev,
          uptime: prev.uptime + 1
        }));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isConnected]);

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* En-tête et contrôles */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-red-800 dark:text-red-600 flex items-center gap-2">
            <Zap className="h-6 w-6" />
            Mises à jour temps réel
          </h2>
          <p className="text-muted-foreground">
            Synchronisation live des réservations et statuts des tables
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="real-time-updates"
            checked={isEnabled}
            onCheckedChange={setIsEnabled}
          />
          <Label htmlFor="real-time-updates">Activer les mises à jour temps réel</Label>
        </div>
      </div>

      {/* Statut de connexion */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="h-5 w-5 text-green-600" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-600" />
            )}
            Statut de connexion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="font-medium">
                {isConnected ? 'Connecté' : 'Déconnecté'}
              </span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Temps de connexion</p>
              <p className="font-mono">{formatUptime(connectionStats.uptime)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Messages reçus</p>
              <p className="font-mono">{connectionStats.totalMessages}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Dernière activité</p>
              <p className="text-sm">
                {connectionStats.lastPing ? connectionStats.lastPing.toLocaleTimeString() : 'Aucune'}
              </p>
            </div>
          </div>
          
          {connectionStats.reconnectAttempts > 0 && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Tentatives de reconnexion: {connectionStats.reconnectAttempts}/5
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Réservations en temps réel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Réservations du jour
            </CardTitle>
            <CardDescription>
              Mises à jour automatiques des statuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reservations.map((reservation) => (
                <div key={reservation.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{reservation.customerName}</p>
                      <Badge className={getStatusColor(reservation.status)}>
                        {getStatusText(reservation.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {reservation.time} • {reservation.guests} personnes
                      {reservation.tableNumber && ` • Table ${reservation.tableNumber}`}
                    </p>
                    {reservation.specialRequests && (
                      <p className="text-xs text-blue-600 mt-1">
                        {reservation.specialRequests}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {new Date(reservation.updatedAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Flux d'activité */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Flux d'activité
            </CardTitle>
            <CardDescription>
              Dernières mises à jour en temps réel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUpdates.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Aucune mise à jour récente
                </p>
              ) : (
                recentUpdates.map((update, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="mt-0.5">
                      {getMessageIcon(update.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{getMessageTitle(update.type)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(update.timestamp).toLocaleTimeString()}
                      </p>
                      <div className="text-xs text-muted-foreground mt-1">
                        {JSON.stringify(update.data, null, 2).slice(0, 100)}...
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => connectWebSocket()}
              disabled={isConnected}
            >
              <Wifi className="h-4 w-4 mr-2" />
              Reconnecter
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setRecentUpdates([])}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Vider l'historique
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const stats = {
                  connected: isConnected,
                  uptime: connectionStats.uptime,
                  messages: connectionStats.totalMessages,
                  reconnects: connectionStats.reconnectAttempts
                };
                console.log('Statistiques de connexion:', stats);
                toast({
                  title: "Statistiques exportées",
                  description: "Consultez la console pour les détails.",
                });
              }}
            >
              <Activity className="h-4 w-4 mr-2" />
              Exporter stats
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimeUpdates;