'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, Settings } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

interface NotificationSettings {
  orderUpdates: boolean;
  promotions: boolean;
  newProducts: boolean;
  reservationReminders: boolean;
}

export default function PWANotifications() {
  const { enableNotifications } = usePWA();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    orderUpdates: true,
    promotions: false,
    newProducts: false,
    reservationReminders: true
  });

  useEffect(() => {
    // Vérifier l'état des notifications
    const checkNotificationStatus = () => {
      if ('Notification' in window) {
        setNotificationsEnabled(Notification.permission === 'granted');
      }
    };
    checkNotificationStatus();

    // Charger les préférences depuis localStorage
    const savedSettings = localStorage.getItem('notification-settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.warn('Erreur lors du chargement des préférences:', error);
      }
    }
  }, []);

  const handleEnableNotifications = async () => {
    const granted = await enableNotifications();
    setNotificationsEnabled(granted);
    
    if (granted) {
      // Envoyer une notification de bienvenue
      new Notification('O\'Miam - Notifications activées', {
        body: 'Vous recevrez maintenant nos notifications importantes.',
        icon: '/icon-192x192.svg',
        badge: '/icon-72x72.svg',
        tag: 'welcome-notification'
      });

      // Enregistrer l'utilisateur pour les notifications push
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
          });

          // Envoyer la subscription au serveur
          await fetch('/api/notifications/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subscription, settings })
          });
        } catch (error) {
          console.error('Erreur lors de l\'enregistrement push:', error);
        }
      }
    }
  };

  const handleDisableNotifications = () => {
    setNotificationsEnabled(false);
    
    // Désabonner des notifications push
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.pushManager.getSubscription().then(subscription => {
          if (subscription) {
            subscription.unsubscribe();
            // Informer le serveur
            fetch('/api/notifications/unsubscribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ subscription })
            }).catch(console.error);
          }
        });
      });
    }
  };

  const updateSettings = (key: keyof NotificationSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('notification-settings', JSON.stringify(newSettings));

    // Mettre à jour les préférences sur le serveur
    if (notificationsEnabled) {
      fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      }).catch(console.error);
    }
  };

  const sendNotification = () => {
    if (notificationsEnabled) {
      new Notification('O\'Miam - Notification de test', {
        body: 'Ceci est une notification de test pour vérifier que tout fonctionne.',
        icon: '/icon-192x192.svg',
        badge: '/icon-72x72.svg',
        tag: 'test-notification'
      });
    }
  };

  if (!('Notification' in window)) {
    return null; // Les notifications ne sont pas supportées
  }

  return (
    <div className="relative">
      {/* Bouton principal */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className={`p-2 rounded-full transition-colors ${
          notificationsEnabled
            ? 'bg-green-100 text-green-600 hover:bg-green-200'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
        title="Gérer les notifications"
      >
        {notificationsEnabled ? (
          <Bell className="h-5 w-5" />
        ) : (
          <BellOff className="h-5 w-5" />
        )}
      </button>

      {/* Panneau de paramètres */}
      {showSettings && (
        <div className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Notifications
            </h3>
            <button
              onClick={() => setShowSettings(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          {/* État des notifications */}
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Notifications {notificationsEnabled ? 'activées' : 'désactivées'}
              </span>
              <div className={`w-2 h-2 rounded-full ${
                notificationsEnabled ? 'bg-green-500' : 'bg-red-500'
              }`} />
            </div>
            
            {!notificationsEnabled ? (
              <button
                onClick={handleEnableNotifications}
                className="w-full bg-red-600 text-white px-3 py-2 rounded-md text-sm hover:bg-red-700 transition-colors"
              >
                Activer les notifications
              </button>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={sendNotification}
                  className="w-full bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
                >
                  Tester les notifications
                </button>
                <button
                  onClick={handleDisableNotifications}
                  className="w-full bg-gray-600 text-white px-3 py-2 rounded-md text-sm hover:bg-gray-700 transition-colors"
                >
                  Désactiver
                </button>
              </div>
            )}
          </div>

          {/* Préférences de notifications */}
          {notificationsEnabled && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Types de notifications :
              </h4>
              
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Mises à jour de commandes</span>
                <input
                  type="checkbox"
                  checked={settings.orderUpdates}
                  onChange={(e) => updateSettings('orderUpdates', e.target.checked)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
              </label>
              
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Promotions et offres</span>
                <input
                  type="checkbox"
                  checked={settings.promotions}
                  onChange={(e) => updateSettings('promotions', e.target.checked)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
              </label>
              
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Nouveaux produits</span>
                <input
                  type="checkbox"
                  checked={settings.newProducts}
                  onChange={(e) => updateSettings('newProducts', e.target.checked)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
              </label>
              
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Rappels de réservation</span>
                <input
                  type="checkbox"
                  checked={settings.reservationReminders}
                  onChange={(e) => updateSettings('reservationReminders', e.target.checked)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  );
}