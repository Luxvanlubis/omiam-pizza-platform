// Service d'intégration Supabase centralisé pour tous les modules 
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Variables d'environnement avec vérification
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Vérifications des variables d'environnement
if (!supabaseUrl) {
  console.error('NEXT_PUBLIC_SUPABASE_URL manquante');
}
if (!supabaseAnon) {
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY manquante');
}

// Client Supabase public (accessible côté client)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnon);

// Client Supabase admin (uniquement côté serveur)
export const supabaseAdmin = (() => {
  // Vérifier si on est côté serveur
  if (typeof window === 'undefined') {
    const supabaseService = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseService) {
      console.error('SUPABASE_SERVICE_ROLE_KEY manquante côté serveur');
      return null;
    }
    return createClient<Database>(supabaseUrl, supabaseService);
  }
  // Côté client, retourner null ou le client public
  return null;
})();

// Types pour l'intégration
export interface SupabaseIntegrationConfig {
  enableRealTime: boolean;
  enableCaching: boolean;
  cacheTimeout: number;
  retryAttempts: number;
  fallbackToMock: boolean;
}

// Configuration par défaut
const defaultConfig: SupabaseIntegrationConfig = {
  enableRealTime: true,
  enableCaching: true,
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
  retryAttempts: 3,
  fallbackToMock: true
};

// Cache en mémoire
class MemoryCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttl: number = 5 * 60 * 1000) {
    this.cache.set(key, { data, timestamp: Date.now(), ttl });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear() {
    this.cache.clear();
  }

  delete(key: string) {
    this.cache.delete(key);
  }

  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export const cache = new MemoryCache();

// Service d'intégration principal
export class SupabaseIntegrationService {
  private config: SupabaseIntegrationConfig;
  private isConnected = false;
  private connectionChecked = false;

  constructor(config: Partial<SupabaseIntegrationConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.checkConnection();
  }

  // Vérifier la connexion Supabase
  async checkConnection(): Promise<boolean> {
    if (this.connectionChecked) return this.isConnected;

    try {
      const { data, error } = await supabase.from('users').select('id').limit(1);
      this.isConnected = !error;
      console.log(this.isConnected ? '✅ Supabase connecté' : '⚠️ Supabase non disponible');
    } catch (error) {
      this.isConnected = false;
      console.warn('⚠️ Erreur de connexion Supabase:', error);
    }

    this.connectionChecked = true;
    return this.isConnected;
  }

  // Exécuter une requête avec retry et fallback
  async executeQuery<T>(
    queryFn: () => Promise<{ data: T | null; error: any }>,
    cacheKey?: string,
    mockFallback?: () => T
  ): Promise<T | null> {
    // Vérifier le cache d'abord
    if (cacheKey && this.config.enableCaching) {
      const cached = cache.get(cacheKey);
      if (cached) return cached;
    }

    // Vérifier la connexion
    const isConnected = await this.checkConnection();
    if (!isConnected && this.config.fallbackToMock && mockFallback) {
      console.log('📦 Utilisation du fallback mock - connexion indisponible');
      const mockData = mockFallback();
      if (cacheKey) cache.set(cacheKey, mockData, this.config.cacheTimeout);
      return mockData;
    }

    // Exécuter la requête avec retry
    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        const { data, error } = await queryFn();
        
        if (error) {
          console.error(`Tentative ${attempt} échouée:`, error);
          if (attempt === this.config.retryAttempts) {
            if (this.config.fallbackToMock && mockFallback) {
              console.log('📦 Fallback vers mock après échec des tentatives');
              const mockData = mockFallback();
              if (cacheKey) cache.set(cacheKey, mockData, this.config.cacheTimeout);
              return mockData;
            }
            throw error;
          }
          continue;
        }

        // Succès - mettre en cache
        if (cacheKey && this.config.enableCaching && data) {
          cache.set(cacheKey, data, this.config.cacheTimeout);
        }

        return data;
      } catch (error) {
        console.error(`Erreur tentative ${attempt}:`, error);
        if (attempt === this.config.retryAttempts) {
          if (this.config.fallbackToMock && mockFallback) {
            console.log('📦 Fallback vers mock après erreur');
            const mockData = mockFallback();
            if (cacheKey) cache.set(cacheKey, mockData, this.config.cacheTimeout);
            return mockData;
          }
          throw error;
        }
      }
    }

    return null;
  }

  // Exécuter une mutation avec retry
  async executeMutation<T>(
    mutationFn: () => Promise<{ data: T | null; error: any }>,
    invalidateCache?: string[]
  ): Promise<T | null> {
    const isConnected = await this.checkConnection();
    if (!isConnected) {
      throw new Error('Base de données non disponible pour les mutations');
    }

    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        const { data, error } = await mutationFn();
        
        if (error) {
          console.error(`Mutation tentative ${attempt} échouée:`, error);
          if (attempt === this.config.retryAttempts) {
            throw error;
          }
          continue;
        }

        // Succès - invalider le cache
        if (invalidateCache) {
          invalidateCache.forEach(key => cache.delete(key));
        }

        return data;
      } catch (error) {
        console.error(`Erreur mutation tentative ${attempt}:`, error);
        if (attempt === this.config.retryAttempts) {
          throw error;
        }
      }
    }

    return null;
  }

  // Souscrire aux changements en temps réel
  subscribeToChanges<T>(
    table: string,
    callback: (payload: any) => void,
    filter?: string
  ) {
    if (!this.config.enableRealTime) return null;

    const channel = supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          filter: filter
        },
        callback
      )
      .subscribe();

    return channel;
  }

  // Obtenir les statistiques de performance
  getPerformanceStats() {
    return {
      isConnected: this.isConnected,
      config: this.config,
      cache: cache.getStats()
    };
  }

  // Nettoyer le cache
  clearCache() {
    cache.clear();
  }

  // Mettre à jour la configuration
  updateConfig(newConfig: Partial<SupabaseIntegrationConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  getClient() {
    return supabase;
  }
}

// Instance globale
export const supabaseIntegration = new SupabaseIntegrationService();
export const supabaseIntegrationService = supabaseIntegration;

// Utilitaires pour les modules 
export const Queries = {
  // Analytics
  async getAnalyticsData(timeRange: string = '7d') {
    return supabaseIntegration.executeQuery(
      () => supabase.rpc('get_analytics_data', { time_range: timeRange }),
      `analytics_${timeRange}`,
      () => ({
        total_revenue: 0,
        total_orders: 0,
        total_customers: 0,
        conversion_rate: 0,
        growth_rate: 0,
        popular_products: [],
        revenue_by_day: []
      })
    );
  },

  async getKPIs() {
    return supabaseIntegration.executeQuery(
      () => supabase.rpc('get_kpis'),
      'kpis',
      () => ({
        total_revenue: 0,
        total_orders: 0,
        total_customers: 0,
        average_order_value: 0,
        conversion_rate: 0,
        customer_retention_rate: 0,
        inventory_turnover: 0,
        growth_rate: 0
      })
    );
  },

  async getCustomerAnalytics() {
    return supabaseIntegration.executeQuery(
      () => supabase.rpc('get_customer_analytics'),
      'customer_analytics',
      () => []
    );
  },

  async getProductPerformance() {
    return supabaseIntegration.executeQuery(
      () => supabase.rpc('get_product_performance'),
      'product_performance',
      () => []
    );
  },

  // Inventory
  async getInventoryItems() {
    return supabaseIntegration.executeQuery(
      () => supabase.from('inventory_items').select('*').order('name'),
      'inventory_items',
      () => []
    );
  },

  async updateInventoryItem(id: string, updates: any) {
    return supabaseIntegration.executeMutation(
      () => supabase.from('inventory_items').update(updates).eq('id', id).select(),
      ['inventory_items']
    );
  },

  // Orders
  async getOrders(limit: number = 50) {
    return supabaseIntegration.executeQuery(
      () => supabase.from('orders').select('*, order_items(*, products(*))')
        .order('created_at', { ascending: false })
        .limit(limit),
      `orders_${limit}`
    );
  },

  async updateOrderStatus(orderId: string, status: string) {
    return supabaseIntegration.executeMutation(
      () => supabase.from('orders').update({ status }).eq('id', orderId).select(),
      ['orders_50', 'orders_100']
    );
  },

  // Users
  async getUsers(limit: number = 100) {
    return supabaseIntegration.executeQuery(
      () => supabase.from('users').select('*')
        .order('created_at', { ascending: false })
        .limit(limit),
      `users_${limit}`
    );
  },

  // Products
  async getProducts() {
    return supabaseIntegration.executeQuery(
      () => supabase.from('products').select('*').order('name'),
      'products'
    );
  },

  async updateProduct(id: string, updates: any) {
    return supabaseIntegration.executeMutation(
      () => supabase.from('products').update(updates).eq('id', id).select(),
      ['products']
    );
  },

  // CMS
  async getContentItems() {
    return supabaseIntegration.executeQuery(
      () => supabase.from('content_items').select('*')
        .order('updated_at', { ascending: false }),
      'content_items',
      () => []
    );
  },

  async updateContentItem(id: string, updates: any) {
    return supabaseIntegration.executeMutation(
      () => supabase.from('content_items').update(updates).eq('id', id).select(),
      ['content_items']
    );
  },

  // Notifications
  async getNotifications(userId?: string) {
    const query = supabase.from('notifications').select('*')
      .order('created_at', { ascending: false });
    
    if (userId) {
      query.eq('user_id', userId);
    }

    return supabaseIntegration.executeQuery(
      () => query,
      `notifications_${userId || 'all'}`
    );
  },

  async createNotification(notification: any) {
    return supabaseIntegration.executeMutation(
      () => supabase.from('notifications').insert(notification).select(),
      ['notifications_all']
    );
  }
};

// Hooks pour les souscriptions temps réel
export const useRealtimeSubscription = (
  table: string,
  callback: (payload: any) => void,
  filter?: string
) => {
  const channel = supabaseIntegration.subscribeToChanges(table, callback, filter);
  
  return () => {
    if (channel) {
      supabase.removeChannel(channel);
    }
  };
};

// Utilitaires de diagnostic
export const diagnostics = {
  async testConnection() {
    try {
      const { data, error } = await supabase.from('users').select('id').limit(1);
      return {
        success: !error,
        error: error?.message,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        timestamp: new Date().toISOString()
      };
    }
  },

  async getTableInfo() {
    try {
      const tables = ['users', 'products', 'orders', 'inventory_items', 'content_items', 'notifications'];
      const results = await Promise.all(
        tables.map(async (table) => {
          try {
            const { count, error } = await supabase
              .from(table)
              .select('*', { count: 'exact', head: true });
            
            return {
              table,
              count: count || 0,
              status: error ? 'error' : 'ok',
              error: error?.message
            };
          } catch (err) {
            return {
              table,
              count: 0,
              status: 'error',
              error: err instanceof Error ? err.message : 'Erreur inconnue'
            };
          }
        })
      );
      return results;
    } catch (error) {
      return [];
    }
  },

  getPerformanceReport() {
    return supabaseIntegration.getPerformanceStats();
  }
};

export default supabaseIntegration;