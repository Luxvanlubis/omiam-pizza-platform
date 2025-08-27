'use client';

import { io, Socket } from 'socket.io-client';
import { MockWebSocket } from './mockWebSocketServer';

// Types pour les événements WebSocket
export interface AvailabilityUpdate {
  date: string;
  timeSlot: string;
  tableId: string;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  timestamp: number;
}

export interface ReservationEvent {
  type: 'created' | 'cancelled' | 'modified';
  reservationId: string;
  tableId: string;
  date: string;
  timeSlot: string;
  guestCount: number;
  timestamp: number;
}

export interface TableStatusUpdate {
  tableId: string;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  currentReservation?: {
    id: string;
    guestCount: number;
    startTime: string;
    endTime: string;
  };
  timestamp: number;
}

// Gestionnaire de connexion WebSocket
class RealTimeAvailabilityManager {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor() {
    this.initializeConnection();
  }

  private initializeConnection() {
    try {
      // Déterminer l'URL du serveur WebSocket
      const socketUrl = process.env.NODE_ENV === 'production' 
        ? window.location.origin 
        : `http://localhost:${process.env.PORT || 3004}`;

      // Utiliser MockWebSocket en mode développement
      if (process.env.NODE_ENV === 'development') {
        console.log('[RealTimeAvailabilityManager] Utilisation du WebSocket simulé');
        this.socket = new MockWebSocket(socketUrl) as any;
      } else {
        this.socket = io(socketUrl, {
          path: '/api/socketio',
          transports: ['websocket', 'polling'],
          timeout: 20000,
          forceNew: true
        });
      }

      this.setupEventHandlers();
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la connexion WebSocket:', error);
      this.scheduleReconnect();
    }
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Connexion WebSocket établie');
      this.reconnectAttempts = 0;
      this.emit('connection', { status: 'connected' });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Connexion WebSocket fermée:', reason);
      this.emit('connection', { status: 'disconnected', reason });
      
      if (reason === 'io server disconnect') {
        // Reconnexion manuelle nécessaire
        this.scheduleReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Erreur de connexion WebSocket:', error);
      this.emit('connection', { status: 'error', error });
      this.scheduleReconnect();
    });

    // Événements métier
    this.socket.on('availability:update', (data: AvailabilityUpdate) => {
      this.emit('availability:update', data);
    });

    this.socket.on('reservation:event', (data: ReservationEvent) => {
      this.emit('reservation:event', data);
    });

    this.socket.on('table:status', (data: TableStatusUpdate) => {
      this.emit('table:status', data);
    });

    this.socket.on('capacity:alert', (data: { date: string; timeSlot: string; availableSlots: number }) => {
      this.emit('capacity:alert', data);
    });
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Nombre maximum de tentatives de reconnexion atteint');
      return;
    }

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    this.reconnectAttempts++;

    console.log(`🔄 Tentative de reconnexion ${this.reconnectAttempts}/${this.maxReconnectAttempts} dans ${delay}ms`);
    
    setTimeout(() => {
      this.initializeConnection();
    }, delay);
  }

  // Méthodes publiques pour l'écoute d'événements
  public on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  public off(event: string, callback: Function) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }

  private emit(event: string, data: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Erreur dans le callback pour l'événement ${event}:`, error);
        }
      });
    }
  }

  // Méthodes pour envoyer des données au serveur
  public subscribeToDate(date: string) {
    if (this.socket?.connected) {
      this.socket.emit('subscribe:date', { date });
    }
  }

  public unsubscribeFromDate(date: string) {
    if (this.socket?.connected) {
      this.socket.emit('unsubscribe:date', { date });
    }
  }

  public subscribeToTable(tableId: string) {
    if (this.socket?.connected) {
      this.socket.emit('subscribe:table', { tableId });
    }
  }

  public requestAvailabilityUpdate(date: string, timeSlot?: string) {
    if (this.socket?.connected) {
      this.socket.emit('request:availability', { date, timeSlot });
    }
  }

  // Méthodes utilitaires
  public isConnected(): boolean {
    return this.socket?.connected || false;
  }

  public getConnectionStatus(): 'connected' | 'disconnected' | 'connecting' {
    if (!this.socket) return 'disconnected';
    if (this.socket.connected) return 'connected';
    if (this.socket.connecting) return 'connecting';
    return 'disconnected';
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }
}

// Instance singleton
let realTimeManager: RealTimeAvailabilityManager | null = null;

export function getRealTimeManager(): RealTimeAvailabilityManager {
  if (typeof window === 'undefined') {
    // Côté serveur, retourner un mock
    return {
      on: () => {},
      off: () => {},
      subscribeToDate: () => {},
      unsubscribeFromDate: () => {},
      subscribeToTable: () => {},
      requestAvailabilityUpdate: () => {},
      isConnected: () => false,
      getConnectionStatus: () => 'disconnected' as const,
      disconnect: () => {}
    } as RealTimeAvailabilityManager;
  }

  if (!realTimeManager) {
    realTimeManager = new RealTimeAvailabilityManager();
  }
  return realTimeManager;
}

// Hook React pour utiliser les disponibilités en temps réel
export function useRealTimeAvailability() {
  const manager = getRealTimeManager();
  
  return {
    manager,
    isConnected: manager.isConnected(),
    status: manager.getConnectionStatus(),
    
    // Méthodes de convenance
    subscribeToDate: (date: string) => manager.subscribeToDate(date),
    unsubscribeFromDate: (date: string) => manager.unsubscribeFromDate(date),
    subscribeToTable: (tableId: string) => manager.subscribeToTable(tableId),
    requestUpdate: (date: string, timeSlot?: string) => manager.requestAvailabilityUpdate(date, timeSlot),
    
    // Méthodes d'écoute
    onAvailabilityUpdate: (callback: (data: AvailabilityUpdate) => void) => {
      manager.on('availability:update', callback);
      return () => manager.off('availability:update', callback);
    },
    
    onReservationEvent: (callback: (data: ReservationEvent) => void) => {
      manager.on('reservation:event', callback);
      return () => manager.off('reservation:event', callback);
    },
    
    onTableStatusUpdate: (callback: (data: TableStatusUpdate) => void) => {
      manager.on('table:status', callback);
      return () => manager.off('table:status', callback);
    },
    
    onConnectionChange: (callback: (data: { status: string; reason?: string; error?: any }) => void) => {
      manager.on('connection', callback);
      return () => manager.off('connection', callback);
    }
  };
}

// Utilitaires pour la gestion des données
export function formatAvailabilityKey(date: string, timeSlot: string): string {
  return `${date}_${timeSlot}`;
}

export function parseAvailabilityKey(key: string): { date: string; timeSlot: string } {
  const [date, timeSlot] = key.split('_');
  return { date, timeSlot };
}

export function isRecentUpdate(timestamp: number, maxAgeMs: number = 30000): boolean {
  return Date.now() - timestamp < maxAgeMs;
}