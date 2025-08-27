import { useState, useEffect } from 'react';

// Service WebSocket pour le suivi des commandes en temps réel
export interface OrderStatusUpdate {
  orderId: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'cooking' | 'ready' | 'delivered' | 'cancelled';
  estimatedTime?: number;
  actualTime?: number;
  message?: string;
  employee?: string;
  timestamp: string;
}

export interface OrderMessage {
  id: string;
  orderId: string;
  type: 'status_update' | 'info' | 'delay' | 'issue';
  message: string;
  timestamp: string;
  sender: 'system' | 'employee';
  employeeName?: string;
}

export interface TrackingEvent {
  type: 'status_update' | 'new_message' | 'order_created' | 'order_cancelled';
  orderId: string;
  data: OrderStatusUpdate | OrderMessage;
  timestamp: string;
}

class WebSocketService {
  private socket: any = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private eventListeners: Map<string, ((data?: any) => void)[]> = new Map();
  private isConnected = false;

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket() {
    if (typeof window !== 'undefined') {
      // Importer socket.io-client uniquement côté client
      import('socket.io-client').then((module) => {
        const io = module.default || module.io;
        
        // Utiliser l'URL correcte avec le chemin Socket.IO
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin;
        
        this.socket = io(socketUrl, {
          path: '/api/socketio',
          transports: ['websocket', 'polling'],
          timeout: 10000,
          reconnection: true,
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: this.reconnectDelay,
          forceNew: true,
        });
        
        this.setupEventHandlers();
      }).catch((error) => {
        console.error('Failed to load socket.io-client:', error instanceof Error ? error.message : String(error));
      });
    }
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connected');
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('WebSocket disconnected:', reason);
      this.isConnected = false;
      this.emit('disconnected', reason);
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('WebSocket connection error:', error instanceof Error ? error.message : String(error));
      this.isConnected = false;
      this.handleReconnect();
    });

    // Événements de suivi des commandes
    this.socket.on('order_status_update', (data: OrderStatusUpdate) => {
      console.log('Order status update received:', data);
      this.emit('order_status_update', data);
    });

    this.socket.on('order_message', (data: OrderMessage) => {
      console.log('Order message received:', data);
      this.emit('order_message', data);
    });

    this.socket.on('tracking_event', (event: TrackingEvent) => {
      console.log('Tracking event received:', event);
      this.emit('tracking_event', event);
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        if (!this.isConnected) {
          this.initializeSocket();
        }
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
      this.emit('reconnect_failed');
    }
  }

  // S'abonner au suivi d'une commande
  public trackOrder(orderId: string, customerPhone: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('track_order', { orderId, customerPhone });
      console.log(`Tracking order: ${orderId}`);
    }
  }

  // Arrêter le suivi d'une commande
  public untrackOrder(orderId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('untrack_order', { orderId });
      console.log(`Stopped tracking order: ${orderId}`);
    }
  }

  // Envoyer un message concernant une commande
  public sendOrderMessage(orderId: string, message: string, type: OrderMessage['type']) {
    if (this.socket && this.isConnected) {
      const messageData: OrderMessage = {
        id: `msg_${Date.now()}`,
        orderId,
        type,
        message,
        timestamp: new Date().toISOString(),
        sender: 'employee'
      };
      
      this.socket.emit('send_order_message', messageData);
      console.log('Message sent:', messageData);
    }
  }

  // Mettre à jour le statut d'une commande (côté restaurant)
  public updateOrderStatus(
    orderId: string, 
    status: OrderStatusUpdate['status'], 
    employee: string, 
    estimatedTime?: number
  ) {
    if (this.socket && this.isConnected) {
      const statusUpdate: OrderStatusUpdate = {
        orderId,
        status,
        estimatedTime,
        actualTime: 0, // Sera calculé côté serveur
        employee,
        timestamp: new Date().toISOString()
      };
      
      this.socket.emit('update_order_status', statusUpdate);
      console.log('Status update sent:', statusUpdate);
    }
  }

  // Gestion des événements
  public on(event: string, callback: (data?: any) => void) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  public off(event: string, callback: (data?: any) => void) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  // Vérifier la connexion
  public connected(): boolean {
    return this.isConnected;
  }

  // Déconnexion manuelle
  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
    }
  }

  // Reconnexion manuelle
  public reconnect() {
    this.reconnectAttempts = 0;
    this.initializeSocket();
  }
}

// Singleton instance
export const websocketService = new WebSocketService();

// Hook React pour utiliser le service WebSocket
export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const handleConnected = () => setIsConnected(true);
    const handleDisconnected = () => setIsConnected(false);

    websocketService.on('connected', handleConnected);
    websocketService.on('disconnected', handleDisconnected);

    // Vérifier l'état initial
    setIsConnected(websocketService.connected());

    return () => {
      websocketService.off('connected', handleConnected);
      websocketService.off('disconnected', handleDisconnected);
    };
  }, []);

  return {
    isConnected,
    trackOrder: websocketService.trackOrder.bind(websocketService),
    untrackOrder: websocketService.untrackOrder.bind(websocketService),
    sendOrderMessage: websocketService.sendOrderMessage.bind(websocketService),
    updateOrderStatus: websocketService.updateOrderStatus.bind(websocketService),
    on: websocketService.on.bind(websocketService),
    off: websocketService.off.bind(websocketService),
    disconnect: websocketService.disconnect.bind(websocketService),
    reconnect: websocketService.reconnect.bind(websocketService),
  };
}