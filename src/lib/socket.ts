// socket.ts - Configuration Socket.IO pour le suivi des commandes
import { Server } from 'socket.io';
import { Server as NetServer } from 'http';

// Types pour les événements de suivi des commandes
export interface OrderTrackingEvents {
  'order-status-update': {
    orderId: string;
    status: string;
    estimatedTime?: number;
    employeeName?: string;
    timestamp: string;
  };
  'order-message': {
    orderId: string;
    type: 'info' | 'warning' | 'success';
    message: string;
    employeeName?: string;
    timestamp: string;
  };
  'client-message': {
    orderId: string;
    message: string;
    customerName?: string;
    timestamp: string;
  };
  'new-order': {
    orderId: string;
    customerName: string;
    total: number;
    items: number;
    timestamp: string;
  };
  'order-completed': {
    orderId: string;
    completionTime: string;
    employeeName: string;
  };
}

// Configuration des rooms pour organiser les connexions
interface OrderRooms {
  order: (orderId: string) => string;
  tracking: () => string;
  client: (phoneNumber: string) => string;
}

export const orderRooms: OrderRooms = {
  order: (orderId: string) => `order:${orderId}`,
  tracking: () => 'admin:tracking',
  client: (phoneNumber: string) => `client:${phoneNumber}`
};

// Classe pour gérer le suivi des commandes via WebSocket
export class OrderTrackingService {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    // Écouter les connexions
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      // Gérer l'inscription au suivi d'une commande
      socket.on('track-order', (data: { orderId: string; phoneNumber: string }) => {
        const { orderId, phoneNumber } = data;
        
        // Rejoindre la room de la commande
        socket.join(orderRooms.order(orderId));
        // Rejoindre la room du client
        socket.join(orderRooms.client(phoneNumber));
        
        console.log(`Client ${socket.id} tracking order ${orderId}`);
        
        // Envoyer le statut actuel au client
        this.sendCurrentOrderStatus(socket, orderId);
      });

      // Gérer les mises à jour de statut depuis l'admin
      socket.on('update-order-status', (data: OrderTrackingEvents['order-status-update']) => {
        this.handleStatusUpdate(data);
      });

      // Gérer l'envoi de messages depuis l'admin
      socket.on('send-order-message', (data: OrderTrackingEvents['order-message']) => {
        this.handleMessageSend(data);
      });

      // Gérer les messages du client
      socket.on('client-message', (data: OrderTrackingEvents['client-message']) => {
        this.handleClientMessage(data);
      });

      // Gérer les déconnexions
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  // Envoyer le statut actuel d'une commande à un client
  private sendCurrentOrderStatus(socket: any, orderId: string) {
    // Simuler la récupération du statut depuis la base de données
    const currentStatus = this.getOrderStatusFromDB(orderId);
    if (currentStatus) {
      socket.emit('current-order-status', currentStatus);
    }
  }

  // Gérer les mises à jour de statut
  private handleStatusUpdate(data: OrderTrackingEvents['order-status-update']) {
    const { orderId, status, estimatedTime, employeeName, timestamp } = data;
    
    // Mettre à jour la base de données
    this.updateOrderStatusInDB(orderId, status, estimatedTime, employeeName);
    
    // Émettre l'événement à tous les clients suivant cette commande
    this.io.to(orderRooms.order(orderId)).emit('order-status-update', {
      orderId,
      status,
      estimatedTime,
      employeeName,
      timestamp
    });
    
    // Notifier les admins
    this.io.to(orderRooms.tracking()).emit('admin-status-update', {
      orderId,
      status,
      employeeName,
      timestamp
    });
    
    console.log(`Status updated for order ${orderId}: ${status}`);
  }

  // Gérer l'envoi de messages
  private handleMessageSend(data: OrderTrackingEvents['order-message']) {
    const { orderId, type, message, employeeName, timestamp } = data;
    
    // Sauvegarder le message dans la base de données
    this.saveMessageToDB(orderId, {
      type,
      message,
      sender: 'employee',
      employeeName,
      timestamp
    });
    
    // Émettre le message à tous les clients suivant cette commande
    this.io.to(orderRooms.order(orderId)).emit('order-message', {
      orderId,
      type,
      message,
      employeeName,
      timestamp
    });
    
    console.log(`Message sent for order ${orderId}: ${message}`);
  }

  // Gérer les messages des clients
  private handleClientMessage(data: OrderTrackingEvents['client-message']) {
    const { orderId, message, customerName, timestamp } = data;
    
    // Sauvegarder le message dans la base de données
    this.saveMessageToDB(orderId, {
      type: 'info',
      message,
      sender: 'client',
      customerName,
      timestamp
    });
    
    // Émettre le message aux admins
    this.io.to(orderRooms.tracking()).emit('client-message', {
      orderId,
      message,
      customerName,
      timestamp
    });
    
    console.log(`Client message received for order ${orderId}: ${message}`);
  }

  // Notifier les admins d'une nouvelle commande
  public notifyNewOrder(orderData: {
    orderId: string;
    customerName: string;
    total: number;
    items: number;
  }) {
    const notification: OrderTrackingEvents['new-order'] = {
      orderId: orderData.orderId,
      customerName: orderData.customerName,
      total: orderData.total,
      items: orderData.items,
      timestamp: new Date().toISOString()
    };
    
    this.io.to(orderRooms.tracking()).emit('new-order', notification);
    console.log(`New order notification sent: ${orderData.orderId}`);
  }

  // Notifier la complétion d'une commande
  public notifyOrderCompletion(orderData: {
    orderId: string;
    completionTime: string;
    employeeName: string;
  }) {
    const notification: OrderTrackingEvents['order-completed'] = {
      orderId: orderData.orderId,
      completionTime: orderData.completionTime,
      employeeName: orderData.employeeName
    };
    
    this.io.to(orderRooms.order(orderData.orderId)).emit('order-completed', notification);
    this.io.to(orderRooms.tracking()).emit('order-completed', notification);
    
    console.log(`Order completion notification sent: ${orderData.orderId}`);
  }

  // Simuler la récupération du statut depuis la base de données
  private getOrderStatusFromDB(orderId: string): any {
    // Dans une implémentation réelle, cela viendrait de la base de données
    return {
      orderId,
      status: 'confirmed',
      estimatedTime: 25,
      employeeName: 'Chef Marco',
      timestamp: new Date().toISOString()
    };
  }

  // Simuler la mise à jour du statut dans la base de données
  private updateOrderStatusInDB(orderId: string, status: string, estimatedTime?: number, employeeName?: string) {
    // Dans une implémentation réelle, cela mettrait à jour la base de données
    console.log(`Updating order ${orderId} status to ${status} in database`);
  }

  // Simuler la sauvegarde du message dans la base de données
  private saveMessageToDB(orderId: string, messageData: any) {
    // Dans une implémentation réelle, cela sauvegarderait dans la base de données
    console.log(`Saving message for order ${orderId} to database`);
  }
}

// Fonction pour initialiser le service de suivi des commandes
export function initializeOrderTracking(server: NetServer): OrderTrackingService {
  const io = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' ? false : ["http://localhost:3000"],
      methods: ["GET", "POST"]
    }
  });
  
  return new OrderTrackingService(io);
}

// Fonction pour configurer Socket.IO avec le serveur HTTP
export function setupSocket(io: Server): void {
  new OrderTrackingService(io);
}