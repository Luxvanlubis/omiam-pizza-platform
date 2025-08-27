// Gestionnaire pour les opérations offline et la synchronisation

export interface OfflineAction {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
  timestamp: number;
  retryCount: number;
}

export interface CacheEntry {
  data: any;
  timestamp: number;
  expiry?: number;
}

export class OfflineManager {
  private static instance: OfflineManager;
  private readonly CACHE_PREFIX = 'omiam_cache_';
  private readonly ACTIONS_KEY = 'omiam_offline_actions';
  private readonly SYNC_KEY = 'omiam_last_sync';
  private readonly MAX_RETRY_COUNT = 3;
  private readonly CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 heures

  static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  // Gestion du cache
  setCacheData(key: string, data: any, expiry?: number): void {
    const cacheEntry: CacheEntry = {
      data,
      timestamp: Date.now(),
      expiry: expiry || Date.now() + this.CACHE_EXPIRY
    };

    try {
      localStorage.setItem(
        `${this.CACHE_PREFIX}${key}`,
        JSON.stringify(cacheEntry)
      );
    } catch (error) {
      console.warn('Erreur lors de la sauvegarde en cache:', error);
      // Nettoyer le cache si l'espace est insuffisant
      this.cleanExpiredCache();
    }
  }

  getCacheData(key: string): any | null {
    try {
      const cached = localStorage.getItem(`${this.CACHE_PREFIX}${key}`);
      if (!cached) return null;

      const cacheEntry: CacheEntry = JSON.parse(cached);

      // Vérifier l'expiration
      if (cacheEntry.expiry && Date.now() > cacheEntry.expiry) {
        localStorage.removeItem(`${this.CACHE_PREFIX}${key}`);
        return null;
      }

      return cacheEntry.data;
    } catch (error) {
      console.warn('Erreur lors de la lecture du cache:', error);
      return null;
    }
  }

  clearCache(key?: string): void {
    if (key) {
      localStorage.removeItem(`${this.CACHE_PREFIX}${key}`);
    } else {
      // Supprimer tout le cache
      Object.keys(localStorage)
        .filter(k => k.startsWith(this.CACHE_PREFIX))
        .forEach(k => localStorage.removeItem(k));
    }
  }

  cleanExpiredCache(): void {
    const now = Date.now();
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.CACHE_PREFIX))
      .forEach(key => {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const cacheEntry: CacheEntry = JSON.parse(cached);
            if (cacheEntry.expiry && now > cacheEntry.expiry) {
              localStorage.removeItem(key);
            }
          }
        } catch (error) {
          // Supprimer les entrées corrompues
          localStorage.removeItem(key);
        }
      });
  }

  // Gestion des actions offline
  addOfflineAction(url: string, method: string, headers: Record<string, string>, body?: string): void {
    const action: OfflineAction = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      url,
      method,
      headers,
      body,
      timestamp: Date.now(),
      retryCount: 0
    };

    const actions = this.getOfflineActions();
    actions.push(action);

    try {
      localStorage.setItem(this.ACTIONS_KEY, JSON.stringify(actions));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'action offline:', error instanceof Error ? error.message : String(error));
    }
  }

  getOfflineActions(): OfflineAction[] {
    try {
      const actions = localStorage.getItem(this.ACTIONS_KEY);
      return actions ? JSON.parse(actions) : [];
    } catch (error) {
      console.warn('Erreur lors de la lecture des actions offline:', error);
      return [];
    }
  }

  removeOfflineAction(actionId: string): void {
    const actions = this.getOfflineActions().filter(action => action.id !== actionId);
    localStorage.setItem(this.ACTIONS_KEY, JSON.stringify(actions));
  }

  clearOfflineActions(): void {
    localStorage.removeItem(this.ACTIONS_KEY);
  }

  // Synchronisation
  async syncOfflineActions(): Promise<{ success: number; failed: number }> {
    const actions = this.getOfflineActions();
    let success = 0;
    let failed = 0;
    const failedActions: OfflineAction[] = [];

    for (const action of actions) {
      try {
        const response = await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body
        });

        if (response.ok) {
          success++;
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.error(`Erreur lors de la synchronisation de l'action ${action.id}:`, error instanceof Error ? error.message : String(error));
        
        // Réessayer si le nombre maximum de tentatives n'est pas atteint
        if (action.retryCount < this.MAX_RETRY_COUNT) {
          failedActions.push({ ...action, retryCount: action.retryCount + 1 });
        }
        failed++;
      }
    }

    // Sauvegarder les actions qui ont échoué pour un nouveau essai
    localStorage.setItem(this.ACTIONS_KEY, JSON.stringify(failedActions));

    // Mettre à jour la date de dernière synchronisation
    localStorage.setItem(this.SYNC_KEY, new Date().toISOString());

    return { success, failed };
  }

  getLastSyncDate(): Date | null {
    const lastSync = localStorage.getItem(this.SYNC_KEY);
    return lastSync ? new Date(lastSync) : null;
  }

  // Requête avec fallback cache
  async fetchWithCache(
    url: string,
    options: RequestInit = {},
    cacheKey?: string
  ): Promise<Response> {
    const key = cacheKey || url;

    try {
      // Essayer la requête réseau d'abord
      const response = await fetch(url, options);
      
      if (response.ok) {
        // Mettre en cache la réponse si elle est réussie
        const data = await response.clone().json();
        this.setCacheData(key, data);
        return response;
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.warn(`Requête réseau échouée pour ${url}, utilisation du cache:`, error);
      
      // Fallback vers le cache
      const cachedData = this.getCacheData(key);
      if (cachedData) {
        return new Response(JSON.stringify(cachedData), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Si pas de cache disponible, relancer l'erreur
      throw error;
    }
  }

  // Requête avec mise en queue offline
  async fetchWithOfflineQueue(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      // Si offline, ajouter à la queue
      if (!navigator.onLine) {
        this.addOfflineAction(
          url,
          options.method || 'GET',
          (options.headers as Record<string, string>) || {},
          options.body as string
        );

        // Retourner une réponse simulée pour les requêtes POST/PUT/DELETE
        if (['POST', 'PUT', 'DELETE'].includes(options.method || 'GET')) {
          return new Response(JSON.stringify({ 
            success: true, 
            message: 'Action mise en queue pour synchronisation' 
          }), {
            status: 202,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }

      throw error;
    }
  }

  // Statistiques
  getCacheStats(): {
    totalItems: number;
    totalSize: number;
    oldestItem: Date | null;
    newestItem: Date | null;
  } {
    const cacheKeys = Object.keys(localStorage).filter(key => 
      key.startsWith(this.CACHE_PREFIX)
    );

    let totalSize = 0;
    let oldestTimestamp = Infinity;
    let newestTimestamp = 0;

    cacheKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        totalSize += value.length;
        try {
          const cacheEntry: CacheEntry = JSON.parse(value);
          if (cacheEntry.timestamp < oldestTimestamp) {
            oldestTimestamp = cacheEntry.timestamp;
          }
          if (cacheEntry.timestamp > newestTimestamp) {
            newestTimestamp = cacheEntry.timestamp;
          }
        } catch (error) {
          // Ignorer les entrées corrompues
        }
      }
    });

    return {
      totalItems: cacheKeys.length,
      totalSize,
      oldestItem: oldestTimestamp === Infinity ? null : new Date(oldestTimestamp),
      newestItem: newestTimestamp === 0 ? null : new Date(newestTimestamp)
    };
  }
}

// Instance globale
export const offlineManager = OfflineManager.getInstance();