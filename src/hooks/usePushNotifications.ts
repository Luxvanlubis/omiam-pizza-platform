import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  data?: any;
}

interface UsePushNotificationsProps {
  userId: string;
  onNotificationReceived?: (notification: NotificationData) => void;
}

interface UsePushNotificationsReturn {
  isSupported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
  isLoading: boolean;
  notifications: NotificationData[];
  unreadCount: number;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  markAsRead: (notificationId?: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  sendNotification: () => Promise<void>;
}

export function usePushNotifications({
  userId,
  onNotificationReceived
}: UsePushNotificationsProps): UsePushNotificationsReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Vérifier le support des notifications push
  useEffect(() => {
    const checkSupport = () => {
      const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
      setIsSupported(supported);
      if (supported) {
        setPermission(Notification.permission);
        checkSubscriptionStatus();
        loadNotifications();
      }
    };
    checkSupport();
  }, [userId]);

  // Vérifier le statut de l'abonnement
  const checkSubscriptionStatus = useCallback(async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  }, []);

  // Charger les notifications
  const loadNotifications = useCallback(async () => {
    try {
      const response = await fetch(`/api/notifications?userId=${userId}&limit=50`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }, [userId]);

  // S'abonner aux notifications push
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      toast.error('Les notifications push ne sont pas supportées');
      return false;
    }

    setIsLoading(true);
    try {
      // Demander la permission
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission !== 'granted') {
        toast.error('Permission refusée pour les notifications');
        return false;
      }

      // Enregistrer le service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // Créer la souscription push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      });

      // Envoyer la souscription au serveur
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          subscription,
          userAgent: navigator.userAgent
        })
      });

      if (response.ok) {
        setIsSubscribed(true);
        toast.success('Notifications push activées!');
        return true;
      } else {
        throw new Error('Failed to subscribe on server');
      }
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      toast.error('Erreur lors de l\'activation des notifications');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, userId]);

  // Se désabonner des notifications push
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        
        // Informer le serveur
        await fetch('/api/notifications/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            endpoint: subscription.endpoint
          })
        });
      }

      setIsSubscribed(false);
      toast.success('Notifications push désactivées');
      return true;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      toast.error('Erreur lors de la désactivation');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Marquer comme lu
  const markAsRead = useCallback(async (notificationId?: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, notificationId })
      });

      if (response.ok) {
        if (notificationId) {
          // Marquer une notification spécifique comme lue
          setNotifications(prev => 
            prev.map(n => 
              n.id === notificationId ? { ...n, isRead: true } : n
            )
          );
          setUnreadCount(prev => Math.max(0, prev - 1));
        } else {
          // Marquer toutes les notifications comme lues
          setNotifications(prev => 
            prev.map(n => ({ ...n, isRead: true }))
          );
          setUnreadCount(0);
        }
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  }, [userId]);

  // Actualiser les notifications
  const refreshNotifications = useCallback(async () => {
    await loadNotifications();
  }, [loadNotifications]);

  // Envoyer une notification de test
  const sendNotification = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          type: 'SYSTEM_MESSAGE',
          title: 'Notification de test',
          message: 'Ceci est une notification de test pour vérifier que le système fonctionne correctement.',
          data: { isTest: true, timestamp: Date.now() }
        })
      });

      if (response.ok) {
        toast.success('Notification de test envoyée!');
        await refreshNotifications();
      } else {
        throw new Error('Failed to send test notification');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error('Erreur lors de l\'envoi de la notification de test');
    }
  }, [userId, refreshNotifications]);

  // Écouter les messages du service worker
  useEffect(() => {
    if (!isSupported) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'NOTIFICATION_RECEIVED') {
        const notification = event.data.notification;
        
        // Ajouter la nouvelle notification à la liste
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Appeler le callback si fourni
        if (onNotificationReceived) {
          onNotificationReceived(notification);
        }
        
        // Afficher une toast notification
        toast.info(notification.title, {
          description: notification.message
        });
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleMessage);
    
    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
    };
  }, [isSupported, onNotificationReceived]);

  // Écouter les changements de permission
  useEffect(() => {
    if (!isSupported) return;

    const handlePermissionChange = () => {
      setPermission(Notification.permission);
      if (Notification.permission !== 'granted') {
        setIsSubscribed(false);
      }
    };

    // Vérifier périodiquement les changements de permission
    const interval = setInterval(handlePermissionChange, 5000);
    
    return () => clearInterval(interval);
  }, [isSupported]);

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    notifications,
    unreadCount,
    subscribe,
    unsubscribe,
    markAsRead,
    refreshNotifications,
    sendNotification
  };
}

// Hook pour les notifications en temps réel (WebSocket)
export function useRealtimeNotifications(userId: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastNotification, setLastNotification] = useState<NotificationData | null>(null);

  useEffect(() => {
    if (!userId) return;

    // Connexion WebSocket pour les notifications en temps réel
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'}/notifications`);

    ws.onopen = () => {
      console.log('WebSocket connected for notifications');
      setIsConnected(true);
      
      // S'identifier auprès du serveur
      ws.send(JSON.stringify({ type: 'IDENTIFY', userId }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'NOTIFICATION') {
          setLastNotification(data.notification);
          
          // Envoyer le message au service worker
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
              registration.active?.postMessage({
                type: 'NOTIFICATION_RECEIVED',
                notification: data.notification
              });
            });
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected for notifications');
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error for notifications:', error);
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [userId]);

  return {
    isConnected,
    lastNotification
  };
}