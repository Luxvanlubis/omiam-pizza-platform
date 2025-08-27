'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  type: 'ORDER_STATUS_UPDATE' | 'PROMOTION' | 'NEW_PRODUCT' | 'SYSTEM';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: Record<string, any>;
  orderId?: string;
}

export interface NotificationPreferences {
  orderStatusUpdates: boolean;
  promotions: boolean;
  newProducts: boolean;
  systemNotifications: boolean;
}

export interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreferences | null;
  isLoading: boolean;
  error: string | null;
  // Actions
  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  deleteSelected: (notificationIds: string[]) => Promise<void>;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => Promise<void>;
  // Push notifications
  subscribeToPush: () => Promise<boolean>;
  unsubscribeFromPush: () => Promise<boolean>;
  isPushSupported: boolean;
  isPushSubscribed: boolean;
  pushPermission: NotificationPermission;
}

export function useNotifications(userId?: string): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPushSubscribed, setIsPushSubscribed] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');

  // Vérifier le support des notifications push
  const isPushSupported = typeof window !== 'undefined' && 
    'serviceWorker' in navigator && 
    'PushManager' in window && 
    'Notification' in window;

  // Charger les notifications
  const refreshNotifications = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/notifications?userId=${userId}&limit=50`);
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des notifications');
      }

      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      toast.error('Erreur lors du chargement des notifications');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Charger les préférences
  const loadPreferences = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/notifications/preferences?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setPreferences(data.preferences);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des préférences:', err);
    }
  }, [userId]);

  // Vérifier l'état de l'abonnement push
  const checkPushSubscription = useCallback(async () => {
    if (!isPushSupported) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsPushSubscribed(!!subscription);

      if ('Notification' in window) {
        setPushPermission(Notification.permission);
      }
    } catch (err) {
      console.error('Erreur lors de la vérification de l\'abonnement push:', err);
    }
  }, [isPushSupported]);

  // Marquer une notification comme lue
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!userId) return;

    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          notificationId,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }

      // Mettre à jour localement
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, isRead: true } 
            : notif
        )
      );
    } catch (err) {
      toast.error('Erreur lors de la mise à jour de la notification');
    }
  }, [userId]);

  // Marquer toutes les notifications comme lues
  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          markAllAsRead: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }

      // Mettre à jour localement
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );

      toast.success('Toutes les notifications ont été marquées comme lues');
    } catch (err) {
      toast.error('Erreur lors de la mise à jour des notifications');
    }
  }, [userId]);

  // Supprimer une notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      // Mettre à jour localement
      setNotifications(prev => 
        prev.filter(notif => notif.id !== notificationId)
      );

      toast.success('Notification supprimée');
    } catch (err) {
      toast.error('Erreur lors de la suppression de la notification');
    }
  }, [userId]);

  // Supprimer plusieurs notifications
  const deleteSelected = useCallback(async (notificationIds: string[]) => {
    if (!userId || notificationIds.length === 0) return;

    try {
      const promises = notificationIds.map(id => 
        fetch(`/api/notifications/${id}`, { method: 'DELETE' })
      );
      await Promise.all(promises);

      // Mettre à jour localement
      setNotifications(prev => 
        prev.filter(notif => !notificationIds.includes(notif.id))
      );

      toast.success(`${notificationIds.length} notification(s) supprimée(s)`);
    } catch (err) {
      toast.error('Erreur lors de la suppression des notifications');
    }
  }, [userId]);

  // Mettre à jour les préférences
  const updatePreferences = useCallback(async (newPreferences: Partial<NotificationPreferences>) => {
    if (!userId) return;

    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          ...newPreferences,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour des préférences');
      }

      const data = await response.json();
      setPreferences(data.preferences);
      toast.success('Préférences mises à jour');
    } catch (err) {
      toast.error('Erreur lors de la mise à jour des préférences');
    }
  }, [userId]);

  // S'abonner aux notifications push
  const subscribeToPush = useCallback(async (): Promise<boolean> => {
    if (!isPushSupported || !userId) return false;

    try {
      // Demander la permission
      const permission = await Notification.requestPermission();
      setPushPermission(permission);

      if (permission !== 'granted') {
        toast.error('Permission refusée pour les notifications');
        return false;
      }

      // Obtenir l'abonnement
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      // Envoyer l'abonnement au serveur
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          subscription: {
            endpoint: subscription.endpoint,
            p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
            auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))),
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'enregistrement de l\'abonnement');
      }

      setIsPushSubscribed(true);
      toast.success('Notifications push activées');
      return true;
    } catch (err) {
      console.error('Erreur lors de l\'abonnement push:', err);
      toast.error('Erreur lors de l\'activation des notifications push');
      return false;
    }
  }, [isPushSupported, userId]);

  // Se désabonner des notifications push
  const unsubscribeFromPush = useCallback(async (): Promise<boolean> => {
    if (!isPushSupported || !userId) return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Désabonner côté client
        await subscription.unsubscribe();

        // Désabonner côté serveur
        await fetch('/api/notifications/subscribe', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            endpoint: subscription.endpoint,
          }),
        });
      }

      setIsPushSubscribed(false);
      toast.success('Notifications push désactivées');
      return true;
    } catch (err) {
      console.error('Erreur lors du désabonnement push:', err);
      toast.error('Erreur lors de la désactivation des notifications push');
      return false;
    }
  }, [isPushSupported, userId]);

  // Calculer le nombre de notifications non lues
  const unreadCount = notifications.filter(notif => !notif.isRead).length;

  // Charger les données au montage
  useEffect(() => {
    if (userId) {
      refreshNotifications();
      loadPreferences();
      checkPushSubscription();
    }
  }, [userId, refreshNotifications, loadPreferences, checkPushSubscription]);

  // Écouter les messages du service worker
  useEffect(() => {
    if (!isPushSupported) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'NOTIFICATION_RECEIVED') {
        // Rafraîchir les notifications quand une nouvelle arrive
        refreshNotifications();
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, [isPushSupported, refreshNotifications]);

  return {
    notifications,
    unreadCount,
    preferences,
    isLoading,
    error,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteSelected,
    updatePreferences,
    subscribeToPush,
    unsubscribeFromPush,
    isPushSupported,
    isPushSubscribed,
    pushPermission,
  };
}

// Hook pour les notifications toast en temps réel
export function useRealtimeNotifications(userId?: string) {
  useEffect(() => {
    if (!userId || typeof window === 'undefined') return;

    // Écouter les événements de notification en temps réel
    const eventSource = new EventSource(`/api/notifications/stream?userId=${userId}`);

    eventSource.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data);
        
        // Afficher une toast pour les nouvelles notifications
        toast(notification.title, {
          description: notification.message,
          action: notification.data?.orderId ? {
            label: 'Voir',
            onClick: () => {
              window.location.href = `/orders/${notification.data.orderId}`;
            },
          } : undefined,
        });
      } catch (err) {
        console.error('Erreur lors du parsing de la notification:', err);
      }
    };

    eventSource.onerror = (error) => {
      console.error('Erreur EventSource:', error);
    };

    return () => {
      eventSource.close();
    };
  }, [userId]);
}