'use client';

import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, Database, Clock } from 'lucide-react';
import { usePWA, useOfflineCache } from '@/hooks/usePWA';

interface SyncStatus {
  lastSync: Date | null;
  pendingActions: number;
  cachedItems: number;
  syncInProgress: boolean;
}

export default function OfflineSync() {
  const { isOnline } = usePWA();
  const { getCachedData, clearCachedData, syncOfflineActions, getOfflineActions, getCacheStats } = useOfflineCache();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSync: null,
    pendingActions: 0,
    cachedItems: 0,
    syncInProgress: false
  });
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    updateSyncStatus();
    // Mettre à jour le statut périodiquement
    const interval = setInterval(updateSyncStatus, 30000); // Toutes les 30 secondes
    return () => clearInterval(interval);
  }, [isOnline]);

  const updateSyncStatus = () => {
    // Utiliser les nouvelles méthodes du gestionnaire offline
    const cacheStats = getCacheStats();
    const offlineActions = getOfflineActions();
    const lastSyncStr = localStorage.getItem('omiam_last_sync');
    const lastSync = lastSyncStr ? new Date(lastSyncStr) : null;

    setSyncStatus({
      lastSync,
      pendingActions: offlineActions.length,
      cachedItems: cacheStats.totalItems,
      syncInProgress: false
    });
  };

  const performSync = async () => {
    if (!isOnline) return;

    setSyncStatus(prev => ({ ...prev, syncInProgress: true }));

    try {
      // Utiliser la méthode de synchronisation du gestionnaire offline
      const result = await syncOfflineActions();
      console.log(`Synchronisation terminée: ${result.success} réussies, ${result.failed} échouées`);

      // Rafraîchir les données depuis le serveur
      await refreshCachedData();
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
    } finally {
      setSyncStatus(prev => ({ ...prev, syncInProgress: false }));
      updateSyncStatus();
    }
  };

  const refreshCachedData = async () => {
    const endpoints = [
      '/api/menu/items',
      '/api/inventory/items',
      '/api/inventory/alerts'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint);
        if (response.ok) {
          const data = await response.json();
          localStorage.setItem(`cache_${endpoint}`, JSON.stringify({
            data,
            timestamp: Date.now()
          }));
        }
      } catch (error) {
        console.error(`Erreur lors du rafraîchissement de ${endpoint}:`, error);
      }
    }
  };

  const clearAllCache = () => {
    clearCachedData();
    localStorage.removeItem('omiam_offline_actions');
    localStorage.removeItem('omiam_last_sync');
    updateSyncStatus();
  };

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Jamais';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    
    const days = Math.floor(hours / 24);
    return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
  };

  return (
    <div className="fixed bottom-4 left-4 z-40">
      {/* Indicateur principal */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium transition-all ${
          isOnline
            ? 'bg-green-100 text-green-800 hover:bg-green-200'
            : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
        }`}
      >
        {isOnline ? (
          <Wifi className="h-4 w-4" />
        ) : (
          <WifiOff className="h-4 w-4" />
        )}
        <span>{isOnline ? 'En ligne' : 'Hors ligne'}</span>
        {syncStatus.pendingActions > 0 && (
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            {syncStatus.pendingActions}
          </span>
        )}
      </button>

      {/* Panneau de détails */}
      {showDetails && (
        <div className="absolute bottom-12 left-0 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <Database className="h-4 w-4 mr-2" />
              Synchronisation
            </h3>
            <button
              onClick={() => setShowDetails(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          {/* Statut de connexion */}
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                État de la connexion
              </span>
              <div className={`flex items-center space-x-1 text-xs ${
                isOnline ? 'text-green-600' : 'text-orange-600'
              }`}>
                {isOnline ? (
                  <Wifi className="h-3 w-3" />
                ) : (
                  <WifiOff className="h-3 w-3" />
                )}
                <span>{isOnline ? 'Connecté' : 'Déconnecté'}</span>
              </div>
            </div>
          </div>

          {/* Informations de synchronisation */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Dernière sync :</span>
              <span className="text-gray-900 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {formatLastSync(syncStatus.lastSync)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Actions en attente :</span>
              <span className={`font-medium ${
                syncStatus.pendingActions > 0 ? 'text-orange-600' : 'text-green-600'
              }`}>
                {syncStatus.pendingActions}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Éléments en cache :</span>
              <span className="text-gray-900 font-medium">
                {syncStatus.cachedItems}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            {isOnline && (
              <button
                onClick={performSync}
                disabled={syncStatus.syncInProgress}
                className="w-full bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {syncStatus.syncInProgress ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Synchronisation...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Synchroniser maintenant
                  </>
                )}
              </button>
            )}
            <button
              onClick={clearAllCache}
              className="w-full bg-gray-600 text-white px-3 py-2 rounded-md text-sm hover:bg-gray-700 transition-colors"
            >
              Vider le cache
            </button>
          </div>

          {/* Aide */}
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <p className="text-xs text-blue-800">
              💡 En mode hors ligne, vos actions sont sauvegardées et seront synchronisées automatiquement lors de la reconnexion.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}