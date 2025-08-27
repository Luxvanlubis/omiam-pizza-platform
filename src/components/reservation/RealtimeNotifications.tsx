'use client';

import React, { useState, useEffect } from 'react';
import { Bell, X, Clock, Users, CheckCircle, AlertTriangle, Info, Zap } from 'lucide-react';
import { useRealTimeReservations } from '@/hooks/useRealTimeReservations';
import { ReservationEvent } from '@/utils/realTimeAvailability';

interface NotificationItem {
  id: string;
  type: 'availability' | 'reservation' | 'table_status' | 'system';
  title: string;
  message: string;
  timestamp: number;
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  data?: any;
}

interface RealtimeNotificationsProps {
  className?: string;
  maxNotifications?: number;
  autoHideDelay?: number;
  showSystemNotifications?: boolean;
}

export default function RealtimeNotifications({
  className = '',
  maxNotifications = 10,
  autoHideDelay = 5000,
  showSystemNotifications = true
}: RealtimeNotificationsProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const {
    state: realtimeState,
    getStats
  } = useRealTimeReservations({
    autoSubscribe: true,
    enableLogging: false
  });

  // Créer une notification à partir d'un événement de réservation
  const createReservationNotification = (event: ReservationEvent): NotificationItem => {
    const eventTypeLabels = {
      'reservation_created': 'Nouvelle réservation',
      'reservation_updated': 'Réservation modifiée',
      'reservation_cancelled': 'Réservation annulée',
      'table_assigned': 'Table attribuée',
      'table_freed': 'Table libérée'
    };

    const eventTypeIcons = {
      'reservation_created': CheckCircle,
      'reservation_updated': Info,
      'reservation_cancelled': AlertTriangle,
      'table_assigned': Users,
      'table_freed': CheckCircle
    };

    const priority = event.eventType === 'reservation_cancelled' ? 'high' : 'medium';

    return {
      id: `${event.eventType}-${event.timestamp}-${Math.random()}`,
      type: 'reservation',
      title: eventTypeLabels[event.eventType] || 'Événement de réservation',
      message: `Table ${event.tableId} - ${event.guestCount} personnes`,
      timestamp: event.timestamp,
      priority,
      read: false,
      data: event
    };
  };

  // Écouter les nouveaux événements de réservation
  useEffect(() => {
    const newEvents = realtimeState.recentEvents.filter(event => {
      // Vérifier si on a déjà une notification pour cet événement
      return !notifications.some(notif => 
        notif.data && 
        notif.data.eventType === event.eventType && 
        notif.data.tableId === event.tableId &&
        Math.abs(notif.data.timestamp - event.timestamp) < 1000 // Tolérance de 1 seconde
      );
    });

    if (newEvents.length > 0) {
      const newNotifications = newEvents.map(createReservationNotification);
      
      setNotifications(prev => {
        const updated = [...newNotifications, ...prev].slice(0, maxNotifications);
        return updated;
      });

      // Mettre à jour le compteur de non-lus
      setUnreadCount(prev => prev + newNotifications.length);
    }
  }, [realtimeState.recentEvents, notifications, maxNotifications]);

  // Notifications système pour les changements de connexion
  useEffect(() => {
    if (!showSystemNotifications) return;

    const connectionStatus = realtimeState.connectionStatus;
    const lastConnectionNotif = notifications.find(n => n.type === 'system');
    
    // Éviter les notifications en double
    if (lastConnectionNotif && 
        lastConnectionNotif.data?.status === connectionStatus &&
        Date.now() - lastConnectionNotif.timestamp < 10000) {
      return;
    }

    let systemNotification: NotificationItem | null = null;

    if (connectionStatus === 'connected') {
      systemNotification = {
        id: `system-connected-${Date.now()}`,
        type: 'system',
        title: 'Connexion établie',
        message: 'Mises à jour en temps réel activées',
        timestamp: Date.now(),
        priority: 'low',
        read: false,
        data: { status: connectionStatus }
      };
    } else if (connectionStatus === 'disconnected') {
      systemNotification = {
        id: `system-disconnected-${Date.now()}`,
        type: 'system',
        title: 'Connexion perdue',
        message: 'Les mises à jour en temps réel sont indisponibles',
        timestamp: Date.now(),
        priority: 'medium',
        read: false,
        data: { status: connectionStatus }
      };
    }

    if (systemNotification) {
      setNotifications(prev => [systemNotification!, ...prev].slice(0, maxNotifications));
      setUnreadCount(prev => prev + 1);
    }
  }, [realtimeState.connectionStatus, showSystemNotifications, maxNotifications, notifications]);

  // Auto-masquer les notifications après un délai
  useEffect(() => {
    if (autoHideDelay > 0) {
      const timer = setTimeout(() => {
        setNotifications(prev => 
          prev.filter(notif => Date.now() - notif.timestamp < autoHideDelay)
        );
      }, autoHideDelay);

      return () => clearTimeout(timer);
    }
  }, [notifications, autoHideDelay]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    setUnreadCount(0);
  };

  const removeNotification = (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass = `w-4 h-4 ${
      priority === 'high' ? 'text-red-500' :
      priority === 'medium' ? 'text-yellow-500' :
      'text-blue-500'
    }`;

    switch (type) {
      case 'reservation':
        return <Users className={iconClass} />;
      case 'availability':
        return <Clock className={iconClass} />;
      case 'table_status':
        return <CheckCircle className={iconClass} />;
      case 'system':
        return <Zap className={iconClass} />;
      default:
        return <Info className={iconClass} />;
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'À l\'instant';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}min`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Bouton de notification */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel de notifications */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* En-tête */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Tout marquer lu
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Liste des notifications */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>Aucune notification</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      !notification.read ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''
                    }`}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type, notification.priority)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium ${
                            !notification.read ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTimestamp(notification.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pied de page */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={clearAllNotifications}
                className="w-full text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Effacer toutes les notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}