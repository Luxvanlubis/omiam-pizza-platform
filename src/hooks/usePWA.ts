'use client';

import { useState, useEffect, useCallback } from 'react';
import { offlineManager } from '@/lib/offline-manager';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAState {
  isOnline: boolean;
  isInstalled: boolean;
  canInstall: boolean;
  isUpdateAvailable: boolean;
}

interface PWAActions {
  installApp: () => Promise<boolean>;
  updateApp: () => void;
  clearCache: () => Promise<boolean>;
  enableNotifications: () => Promise<boolean>;
}

export function usePWA(): PWAState & PWAActions {
  const [isOnline, setIsOnline] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Vérifier l'état de connexion
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);

    // Vérifier si l'app est installée
    const checkInstallStatus = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone || isInWebAppiOS);
    };

    // Gérer l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    // Gérer l'installation de l'app
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
    };

    // Vérifier les mises à jour du service worker
    const checkForUpdates = () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          setIsUpdateAvailable(true);
        });

        // Vérifier périodiquement les mises à jour
        setInterval(() => {
          navigator.serviceWorker.getRegistrations().then(registrations => {
            registrations.forEach(registration => {
              registration.update();
            });
          });
        }, 60000); // Vérifier toutes les minutes
      }
    };

    // Event listeners
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Vérifications initiales
    updateOnlineStatus();
    checkInstallStatus();
    checkForUpdates();

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) return false;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setIsInstalled(true);
        setCanInstall(false);
        setDeferredPrompt(null);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erreur lors de l\'installation:', error instanceof Error ? error.message : String(error));
      return false;
    }
  }, [deferredPrompt]);

  const updateApp = useCallback(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      });
      // Recharger la page après la mise à jour
      window.location.reload();
    }
  }, []);

  const clearCache = useCallback(async (): Promise<boolean> => {
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          if (registration.active) {
            // Envoyer un message au service worker pour vider le cache
            const messageChannel = new MessageChannel();
            return new Promise((resolve) => {
              messageChannel.port1.onmessage = (event) => {
                resolve(event.data.success);
              };
              registration.active?.postMessage(
                { type: 'CLEAR_CACHE' },
                [messageChannel.port2]
              );
            });
          }
        }
      }
      return false;
    } catch (error) {
      console.error('Erreur lors du nettoyage du cache:', error instanceof Error ? error.message : String(error));
      return false;
    }
  }, []);

  const enableNotifications = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.log('Ce navigateur ne supporte pas les notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }, []);

  return {
    isOnline,
    isInstalled,
    canInstall,
    isUpdateAvailable,
    installApp,
    updateApp,
    clearCache,
    enableNotifications
  };
}

// Hook pour gérer le cache offline
export function useOfflineCache() {
  const [cachedData, updateCachedData] = useState<Record<string, any>>({});

  const getCachedData = useCallback((key: string) => {
    return offlineManager.getCacheData(key);
  }, []);

  const setCachedData = useCallback((key: string, data: any, expiry?: number) => {
    offlineManager.setCacheData(key, data, expiry);
    updateCachedData(prev => ({ ...prev, [key]: data }));
  }, []);

  const clearCachedData = useCallback((key?: string) => {
    offlineManager.clearCache(key);
    if (key) {
      updateCachedData(prev => {
        const newData = { ...prev };
        delete newData[key];
        return newData;
      });
    } else {
      updateCachedData({});
    }
  }, []);

  const fetchWithCache = useCallback(async (
    url: string,
    options: RequestInit = {},
    cacheKey?: string
  ) => {
    return offlineManager.fetchWithCache(url, options, cacheKey);
  }, []);

  const fetchWithOfflineQueue = useCallback(async (
    url: string,
    options: RequestInit = {}
  ) => {
    return offlineManager.fetchWithOfflineQueue(url, options);
  }, []);

  const syncOfflineActions = useCallback(async () => {
    return offlineManager.syncOfflineActions();
  }, []);

  const getOfflineActions = useCallback(() => {
    return offlineManager.getOfflineActions();
  }, []);

  const getCacheStats = useCallback(() => {
    return offlineManager.getCacheStats();
  }, []);

  return {
    cachedData,
    getCachedData,
    setCachedData,
    clearCachedData,
    fetchWithCache,
    fetchWithOfflineQueue,
    syncOfflineActions,
    getOfflineActions,
    getCacheStats
  };
}