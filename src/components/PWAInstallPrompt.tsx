'use client';

import { useState, useEffect } from 'react';
import { X, Download, Wifi, WifiOff } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineNotice, setShowOfflineNotice] = useState(false);

  useEffect(() => {
    // Gérer l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Afficher le prompt après un délai si l'utilisateur n'a pas encore installé
      setTimeout(() => {
        if (!window.matchMedia('(display-mode: standalone)').matches) {
          setShowInstallPrompt(true);
        }
      }, 10000); // 10 secondes après le chargement
    };

    // Gérer le statut de connexion
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineNotice(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineNotice(true);
      // Masquer la notification après 5 secondes
      setTimeout(() => setShowOfflineNotice(false), 5000);
    };

    // Vérifier si l'app est déjà installée
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setShowInstallPrompt(false);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('appinstalled', () => setShowInstallPrompt(false));

    // Vérifier l'état initial
    setIsOnline(navigator.onLine);
    checkIfInstalled();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('appinstalled', () => setShowInstallPrompt(false));
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('PWA installée avec succès');
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('Erreur lors de l\'installation PWA:', error);
    }
  };

  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false);
    // Ne plus afficher pendant cette session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Ne pas afficher si déjà dismissé dans cette session
  useEffect(() => {
    if (sessionStorage.getItem('pwa-install-dismissed')) {
      setShowInstallPrompt(false);
    }
  }, []);

  return (
    <>
      {/* Prompt d'installation PWA */}
      {showInstallPrompt && deferredPrompt && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 animate-slide-up">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Download className="h-5 w-5 text-red-600" />
              <h3 className="font-semibold text-gray-900">Installer O'Miam</h3>
            </div>
            <button
              onClick={dismissInstallPrompt}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Installez notre app pour une expérience plus rapide et des notifications de commandes.
          </p>
          <div className="flex space-x-2">
            <button
              onClick={handleInstallClick}
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Installer
            </button>
            <button
              onClick={dismissInstallPrompt}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Plus tard
            </button>
          </div>
        </div>
      )}

      {/* Indicateur de statut de connexion */}
      <div className="fixed top-4 right-4 z-50">
        {!isOnline && (
          <div className="bg-gray-800 text-white px-3 py-2 rounded-full flex items-center space-x-2 text-sm">
            <WifiOff className="h-4 w-4" />
            <span>Mode hors ligne</span>
          </div>
        )}
      </div>

      {/* Notification de retour en ligne */}
      {showOfflineNotice && !isOnline && (
        <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-orange-100 border border-orange-200 rounded-lg p-4 z-50 animate-slide-up">
          <div className="flex items-center space-x-2">
            <WifiOff className="h-5 w-5 text-orange-600" />
            <div>
              <h4 className="font-medium text-orange-800">Mode hors ligne activé</h4>
              <p className="text-sm text-orange-700">
                Vous pouvez continuer à naviguer grâce au cache.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Notification de retour en ligne */}
      {isOnline && showOfflineNotice && (
        <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-green-100 border border-green-200 rounded-lg p-4 z-50 animate-slide-up">
          <div className="flex items-center space-x-2">
            <Wifi className="h-5 w-5 text-green-600" />
            <div>
              <h4 className="font-medium text-green-800">Connexion rétablie</h4>
              <p className="text-sm text-green-700">
                Toutes les fonctionnalités sont à nouveau disponibles.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}