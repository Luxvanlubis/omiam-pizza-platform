'use client';

import {
  AvailabilityUpdate,
  ReservationEvent,
  TableStatusUpdate
} from './realTimeAvailability';

// Simulateur de serveur WebSocket pour les tests
export class MockWebSocketServer {
  private clients: Set<MockWebSocket> = new Set();
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  // Tables simulées
  private tables = [
    'table-1', 'table-2', 'table-3', 'table-4', 'table-5',
    'table-6', 'table-7', 'table-8', 'table-9', 'table-10'
  ];

  // Créneaux horaires simulés
  private timeSlots = [
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'
  ];

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('[MockWebSocketServer] Démarrage du serveur simulé');
    
    // Envoyer des mises à jour périodiques
    this.intervalId = setInterval(() => {
      this.sendRandomUpdates();
    }, 3000 + Math.random() * 7000); // Entre 3 et 10 secondes
  }

  stop() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    console.log('[MockWebSocketServer] Arrêt du serveur simulé');
  }

  addClient(client: MockWebSocket) {
    this.clients.add(client);
    console.log(`[MockWebSocketServer] Client connecté (${this.clients.size} clients)`);
    
    // Envoyer l'état initial au nouveau client
    setTimeout(() => {
      this.sendInitialState(client);
    }, 500);
  }

  removeClient(client: MockWebSocket) {
    this.clients.delete(client);
    console.log(`[MockWebSocketServer] Client déconnecté (${this.clients.size} clients)`);
  }

  private sendInitialState(client: MockWebSocket) {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Envoyer les disponibilités initiales
    [today, tomorrow].forEach(date => {
      this.timeSlots.forEach(timeSlot => {
        const availabilityUpdate: AvailabilityUpdate = {
          date,
          timeSlot,
          status: Math.random() > 0.3 ? 'available' : 'unavailable',
          availableCount: Math.floor(Math.random() * 8) + 2,
          totalCount: 10,
          timestamp: Date.now()
        };
        
        client.simulateMessage({
          type: 'availability_update',
          data: availabilityUpdate
        });
      });
    });

    // Envoyer les statuts de tables initiaux
    this.tables.forEach(tableId => {
      const tableStatus: TableStatusUpdate = {
        tableId,
        status: Math.random() > 0.2 ? 'available' : 'occupied',
        timestamp: Date.now(),
        estimatedFreeTime: Math.random() > 0.5 ? Date.now() + Math.random() * 3600000 : undefined
      };
      
      client.simulateMessage({
        type: 'table_status_update',
        data: tableStatus
      });
    });
  }

  private sendRandomUpdates() {
    if (this.clients.size === 0) return;

    const updateType = Math.random();
    
    if (updateType < 0.4) {
      // Mise à jour de disponibilité
      this.sendAvailabilityUpdate();
    } else if (updateType < 0.7) {
      // Événement de réservation
      this.sendReservationEvent();
    } else {
      // Mise à jour de statut de table
      this.sendTableStatusUpdate();
    }
  }

  private sendAvailabilityUpdate() {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const date = Math.random() > 0.7 ? tomorrow : today;
    const timeSlot = this.timeSlots[Math.floor(Math.random() * this.timeSlots.length)];
    
    const availabilityUpdate: AvailabilityUpdate = {
      date,
      timeSlot,
      status: Math.random() > 0.3 ? 'available' : 'unavailable',
      availableCount: Math.floor(Math.random() * 8) + 1,
      totalCount: 10,
      timestamp: Date.now()
    };

    this.broadcast({
      type: 'availability_update',
      data: availabilityUpdate
    });
  }

  private sendReservationEvent() {
    const eventTypes: ReservationEvent['eventType'][] = [
      'reservation_created', 'reservation_updated', 'reservation_cancelled',
      'table_assigned', 'table_freed'
    ];
    
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const tableId = this.tables[Math.floor(Math.random() * this.tables.length)];
    
    const reservationEvent: ReservationEvent = {
      eventType,
      tableId,
      guestCount: Math.floor(Math.random() * 6) + 2,
      timestamp: Date.now(),
      reservationId: `res-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };

    this.broadcast({
      type: 'reservation_event',
      data: reservationEvent
    });
  }

  private sendTableStatusUpdate() {
    const tableId = this.tables[Math.floor(Math.random() * this.tables.length)];
    const statuses: TableStatusUpdate['status'][] = ['available', 'occupied', 'reserved', 'maintenance'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    const tableStatusUpdate: TableStatusUpdate = {
      tableId,
      status,
      timestamp: Date.now(),
      estimatedFreeTime: status === 'occupied' ? Date.now() + Math.random() * 7200000 : undefined
    };

    this.broadcast({
      type: 'table_status_update',
      data: tableStatusUpdate
    });
  }

  private broadcast(message: any) {
    this.clients.forEach(client => {
      client.simulateMessage(message);
    });
  }
}

// Instance singleton du serveur simulé
let mockServer: MockWebSocketServer | null = null;

export function getMockWebSocketServer(): MockWebSocketServer {
  if (!mockServer) {
    mockServer = new MockWebSocketServer();
  }
  return mockServer;
}

// WebSocket simulé côté client
export class MockWebSocket {
  private listeners: { [key: string]: Function[] } = {};
  private server: MockWebSocketServer;
  private _readyState: number = WebSocket.CONNECTING;
  private connectTimeout: NodeJS.Timeout;

  constructor(url: string) {
    this.server = getMockWebSocketServer();
    
    // Simuler une connexion avec un délai
    this.connectTimeout = setTimeout(() => {
      this._readyState = WebSocket.OPEN;
      this.server.addClient(this);
      this.server.start();
      
      // Déclencher l'événement open
      this.dispatchEvent('open', {});
    }, 500 + Math.random() * 1500); // 0.5 à 2 secondes
  }

  get readyState() {
    return this._readyState;
  }

  addEventListener(type: string, listener: Function) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(listener);
  }

  removeEventListener(type: string, listener: Function) {
    if (this.listeners[type]) {
      this.listeners[type] = this.listeners[type].filter(l => l !== listener);
    }
  }

  send(data: string) {
    if (this._readyState !== WebSocket.OPEN) {
      console.warn('[MockWebSocket] Tentative d\'envoi sur une connexion fermée');
      return;
    }
    
    try {
      const message = JSON.parse(data);
      console.log('[MockWebSocket] Message envoyé:', message);
      
      // Simuler une réponse du serveur pour certains types de messages
      if (message.type === 'subscribe_date' || message.type === 'subscribe_table') {
        setTimeout(() => {
          this.simulateMessage({
            type: 'subscription_confirmed',
            data: { subscription: message.data }
          });
        }, 100);
      }
    } catch (error) {
      console.error('[MockWebSocket] Erreur lors du parsing du message:', error);
    }
  }

  close() {
    if (this.connectTimeout) {
      clearTimeout(this.connectTimeout);
    }
    
    this._readyState = WebSocket.CLOSED;
    this.server.removeClient(this);
    
    // Déclencher l'événement close
    this.dispatchEvent('close', { code: 1000, reason: 'Normal closure' });
  }

  simulateMessage(message: any) {
    if (this._readyState === WebSocket.OPEN) {
      this.dispatchEvent('message', {
        data: JSON.stringify(message)
      });
    }
  }

  simulateError(error: any) {
    this.dispatchEvent('error', error);
  }

  private dispatchEvent(type: string, event: any) {
    if (this.listeners[type]) {
      this.listeners[type].forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error(`[MockWebSocket] Erreur dans le listener ${type}:`, error);
        }
      });
    }
  }
}

// Remplacer WebSocket par MockWebSocket en mode développement
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // @ts-ignore
  window.MockWebSocket = MockWebSocket;
  console.log('[MockWebSocketServer] WebSocket simulé disponible en mode développement');
}