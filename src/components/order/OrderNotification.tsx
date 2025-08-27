"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Bell, 
  Clock, 
  ChefHat, 
  Flame, 
  CheckCircle, 
  Truck, 
  AlertCircle, 
  Eye, 
  X, 
  ExternalLink 
} from "lucide-react";
import { useWebSocket } from "@/lib/websocket-service";

interface OrderNotification {
  id: string;
  orderId: string;
  type: 'status_update' | 'message' | 'delay' | 'issue';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

const mockNotifications: OrderNotification[] = [
  {
    id: "notif-1",
    orderId: "ORD-001",
    type: "status_update",
    title: "Votre commande est en cuisson",
    message: "Votre pizza Margherita Royale est en train de cuire dans notre four à bois",
    timestamp: "2024-01-15T15:25:00Z",
    read: false,
    actionUrl: "/suivi-commande"
  },
  {
    id: "notif-2",
    orderId: "ORD-001",
    type: "message",
    title: "Information sur votre commande",
    message: "Votre commande sera prête dans environ 10 minutes",
    timestamp: "2024-01-15T15:20:00Z",
    read: true,
    actionUrl: "/suivi-commande"
  }
];

export function OrderNotification() {
  const [notifications, setNotifications] = useState<OrderNotification[]>(mockNotifications);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { isConnected, on, off } = useWebSocket();

  useEffect(() => {
    // Calculer le nombre de notifications non lues
    const unread = notifications.filter(n => !n.read).length;
    setUnreadCount(unread);

    // Écouter les mises à jour en temps réel
    const handleStatusUpdate = (data: any) => {
      const newNotification: OrderNotification = {
        id: `notif-${Date.now()}`,
        orderId: data.orderId,
        type: 'status_update',
        title: `Mise à jour de votre commande ${data.orderId}`,
        message: `Votre commande est maintenant : ${getStatusText(data.status)}`,
        timestamp: new Date().toISOString(),
        read: false,
        actionUrl: "/suivi-commande"
      };

      setNotifications(prev => [newNotification, ...prev]);

      // Afficher une notification navigateur si possible
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("O'Miam - Mise à jour de commande", {
          body: newNotification.message,
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          tag: newNotification.orderId
        });
      }
    };

    const handleMessage = (data: any) => {
      const newNotification: OrderNotification = {
        id: `notif-${Date.now()}`,
        orderId: data.orderId,
        type: data.type,
        title: `Message concernant votre commande ${data.orderId}`,
        message: data.message,
        timestamp: new Date().toISOString(),
        read: false,
        actionUrl: "/suivi-commande"
      };

      setNotifications(prev => [newNotification, ...prev]);

      // Afficher une notification navigateur
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("O'Miam - Message", {
          body: data.message,
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          tag: data.orderId
        });
      }
    };

    on('order_status_update', handleStatusUpdate);
    on('order_message', handleMessage);

    // Demander la permission pour les notifications
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    return () => {
      off('order_status_update', handleStatusUpdate);
      off('order_message', handleMessage);
    };
  }, [notifications, on, off]);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => 
      prev.filter(notif => notif.id !== id)
    );
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      pending: "En attente",
      confirmed: "Confirmée",
      preparing: "En préparation",
      cooking: "En cuisson",
      ready: "Prête",
      delivered: "Livrée",
      cancelled: "Annulée"
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'preparing':
        return <ChefHat className="h-4 w-4" />;
      case 'cooking':
        return <Flame className="h-4 w-4" />;
      case 'ready':
        return <CheckCircle className="h-4 w-4" />;
      case 'delivered':
        return <Truck className="h-4 w-4" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationIcon = (type: string, status?: string) => {
    if (type === 'status_update' && status) {
      return getStatusIcon(status);
    }
    
    switch (type) {
      case 'message':
        return <Bell className="h-4 w-4" />;
      case 'delay':
        return <Clock className="h-4 w-4" />;
      case 'issue':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'status_update':
        return "bg-blue-100 text-blue-800";
      case 'message':
        return "bg-green-100 text-green-800";
      case 'delay':
        return "bg-yellow-100 text-yellow-800";
      case 'issue':
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "À l'instant";
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="relative p-2">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <div>
              <DialogTitle>Notifications de commande</DialogTitle>
              <CardDescription>
                {isConnected ? (
                  <span className="flex items-center gap-1 text-green-600">
                    <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                    Connecté en temps réel
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-orange-600">
                    <span className="w-2 h-2 bg-orange-600 rounded-full"></span>
                    Mode hors ligne
                  </span>
                )}
              </CardDescription>
            </div>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                Tout marquer comme lu
              </Button>
            )}
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-2">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune notification</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`transition-all cursor-pointer hover:shadow-md ${
                  !notification.read ? 'border-red-200 bg-red-50' : ''
                }`}
                onClick={() => {
                  markAsRead(notification.id);
                  if (notification.actionUrl) {
                    window.open(notification.actionUrl, '_blank');
                  }
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                      {getNotificationIcon(
                        notification.type, 
                        notification.type === 'status_update' ? notification.message.split(' ').pop() : undefined
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <h4 className={`font-medium text-sm truncate ${!notification.read ? 'text-red-800' : ''}`}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatTime(notification.timestamp)}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0 hover:bg-gray-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {notification.orderId}
                        </Badge>
                        {notification.actionUrl && (
                          <Button variant="ghost" size="sm" className="h-6 text-xs p-0 hover:text-red-600">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Voir
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        
        {notifications.length > 0 && (
          <div className="border-t pt-4">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.open('/suivi-commande', '_blank')}
            >
              <Eye className="h-4 w-4 mr-2" />
              Voir le suivi des commandes
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}