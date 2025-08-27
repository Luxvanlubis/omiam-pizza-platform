
import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';
import path from 'path';

// Types pour le service unifié
type UserRow = Database['public']['Tables']['users']['Row'];
type ProductRow = Database['public']['Tables']['products']['Row'];
type OrderRow = Database['public']['Tables']['orders']['Row'];
type OrderItemRow = Database['public']['Tables']['order_items']['Row'];
type NotificationRow = Database['public']['Tables']['notifications']['Row'];
type InventoryItemRow = Database['public']['Tables']['inventory_items']['Row'];

// Types utilitaires
type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

interface QueryFilters {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  filters?: Record<string, any>;
}

interface TimeRangeFilter {
  start_date?: string;
  end_date?: string;
}

interface SupabaseListResponse<T> {
  data: T[] | null;
  error: any;
  count: number;
}

interface RealtimePayload<T> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T;
  old: T;
  schema: string;
  table: string;
}

interface RealtimeSubscription {
  unsubscribe: () => void;
}

/**
 * Valide et sécurise un chemin de fichier
 * @param {string} userPath - Chemin fourni par l'utilisateur
 * @param {string} basePath - Chemin de base autorisé
 * @returns {string} - Chemin sécurisé
 */
function validateSecurePath(userPath: string, basePath = process.cwd()): string {
  if (!userPath || typeof userPath !== 'string') {
    throw new Error('Chemin invalide');
  }
  
  // Normaliser le chemin et vérifier qu'il reste dans le répertoire autorisé
  const normalizedPath = path.normalize(path.join(basePath, userPath));
  const normalizedBase = path.normalize(basePath);
  
  if (!normalizedPath.startsWith(normalizedBase)) {
    throw new Error('Accès au chemin non autorisé');
  }
  
  return normalizedPath;
}

export class UnifiedDatabaseService {
  private supabase: SupabaseClient<Database>;
  private isInitialized = false;
  private currentUser: User | null = null;
  private currentSession: Session | null = null;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    if (!supabaseUrl || !supabaseAnon) {
      throw new Error('Variables d\'environnement Supabase manquantes');
    }
    
    this.supabase = createClient<Database>(supabaseUrl, supabaseAnon);
    this.initialize();
  }

  private async initialize() {
    try {
      // Récupérer la session actuelle
      const { data: { session } } = await this.supabase.auth.getSession();
      this.currentSession = session;
      this.currentUser = session?.user || null;
      
      // Écouter les changements d'authentification
      this.supabase.auth.onAuthStateChange((event, session) => {
        this.currentSession = session;
        this.currentUser = session?.user || null;
      });
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Erreur d\'initialisation du service unifié:', error);
    }
  }

  // ==================== AUTHENTIFICATION ====================
  
  async signUp(email: string, password: string, userData?: { full_name?: string; phone?: string }) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: { data: userData }
    });
    
    if (error) throw error;
    
    // Créer le profil utilisateur
    if (data.user) {
      await this.createUserProfile(data.user.id, {
        email,
        full_name: userData?.full_name || null,
        phone: userData?.phone || null,
        loyalty_points: 0
      });
    }
    
    return data;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }

  async resetPassword(email: string) {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getCurrentSession(): Session | null {
    return this.currentSession;
  }

  // ==================== GESTION UTILISATEURS ====================
  
  private async createUserProfile(userId: string, userData: Inserts<'users'>) {
    const { data, error } = await this.supabase
      .from('users')
      .insert({ ...userData, id: userId })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }

  async getUserProfile(userId: string): Promise<UserRow | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async updateUserProfile(userId: string, updates: Updates<'users'>): Promise<UserRow> {
    const { data, error } = await this.supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }

  async getAllUsers(filters?: QueryFilters): Promise<SupabaseListResponse<UserRow>> {
    let query = this.supabase.from('users').select('*', { count: 'exact' });
    
    if (filters?.search) {
      query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }
    
    if (filters?.sortBy) {
      query = query.order(filters.sortBy, { ascending: filters.sortOrder === 'asc' });
    }
    
    if (filters?.limit) {
      const from = ((filters.page || 1) - 1) * filters.limit;
      query = query.range(from, from + filters.limit - 1);
    }
    
    const { data, error, count } = await query;
    return { data, error, count: count || 0 };
  }

  // ==================== GESTION PRODUITS ====================
  
  async getProducts(filters?: QueryFilters): Promise<SupabaseListResponse<ProductRow>> {
    let query = this.supabase.from('products').select('*', { count: 'exact' });
    
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }
    
    if (filters?.filters?.category) {
      query = query.eq('category', filters.filters.category);
    }
    
    if (filters?.filters?.available !== undefined) {
      query = query.eq('available', filters.filters.available);
    }
    
    if (filters?.sortBy) {
      query = query.order(filters.sortBy, { ascending: filters.sortOrder === 'asc' });
    }
    
    if (filters?.limit) {
      const from = ((filters.page || 1) - 1) * filters.limit;
      query = query.range(from, from + filters.limit - 1);
    }
    
    const { data, error, count } = await query;
    return { data, error, count: count || 0 };
  }

  async getProduct(id: string): Promise<ProductRow | null> {
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async createProduct(product: Inserts<'products'>): Promise<ProductRow> {
    const { data, error } = await this.supabase
      .from('products')
      .insert(product)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }

  async updateProduct(id: string, updates: Updates<'products'>): Promise<ProductRow> {
    const { data, error } = await this.supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }

  async deleteProduct(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('products')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  }

  // ==================== GESTION COMMANDES ====================
  
  async createOrder(orderData: Inserts<'orders'>, items: Inserts<'order_items'>[]): Promise<{ order: OrderRow; items: OrderItemRow[] }> {
    // Créer la commande
    const { data: order, error: orderError } = await this.supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();
      
    if (orderError) throw orderError;
    
    // Créer les items de commande
    const itemsWithOrderId = items.map(item => ({ ...item, order_id: order.id }));
    const { data: orderItems, error: itemsError } = await this.supabase
      .from('order_items')
      .insert(itemsWithOrderId)
      .select();
      
    if (itemsError) throw itemsError;
    
    return { order, items: orderItems };
  }

  async getOrders(filters?: QueryFilters & TimeRangeFilter): Promise<SupabaseListResponse<OrderRow>> {
    let query = this.supabase.from('orders').select('*', { count: 'exact' });
    
    if (filters?.search) {
      query = query.or(`order_number.ilike.%${filters.search}%,delivery_address.ilike.%${filters.search}%`);
    }
    
    if (filters?.filters?.status) {
      query = query.eq('status', filters.filters.status);
    }
    
    if (filters?.filters?.user_id) {
      query = query.eq('user_id', filters.filters.user_id);
    }
    
    if (filters?.start_date) {
      query = query.gte('created_at', filters.start_date);
    }
    
    if (filters?.end_date) {
      query = query.lte('created_at', filters.end_date);
    }
    
    if (filters?.sortBy) {
      query = query.order(filters.sortBy, { ascending: filters.sortOrder === 'asc' });
    } else {
      query = query.order('created_at', { ascending: false });
    }
    
    if (filters?.limit) {
      const from = ((filters.page || 1) - 1) * filters.limit;
      query = query.range(from, from + filters.limit - 1);
    }
    
    const { data, error, count } = await query;
    return { data, error, count: count || 0 };
  }

  async getOrder(id: string): Promise<OrderRow | null> {
    const { data, error } = await this.supabase
      .from('orders')
      .select(`
        *,
        order_items(*,
          products(*)
        ),
        users(*)
      `)
      .eq('id', id)
      .single();
      
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async updateOrderStatus(id: string, status: string): Promise<OrderRow> {
    const { data, error } = await this.supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }

  // ==================== NOTIFICATIONS ====================
  
  async createNotification(notification: Inserts<'notifications'>): Promise<NotificationRow> {
    const { data, error } = await this.supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }

  async getUserNotifications(userId: string, filters?: QueryFilters): Promise<SupabaseListResponse<NotificationRow>> {
    let query = this.supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);
      
    if (filters?.filters?.read !== undefined) {
      query = query.eq('read', filters.filters.read);
    }
    
    query = query.order('created_at', { ascending: false });
    
    if (filters?.limit) {
      const from = ((filters.page || 1) - 1) * filters.limit;
      query = query.range(from, from + filters.limit - 1);
    }
    
    const { data, error, count } = await query;
    return { data, error, count: count || 0 };
  }

  async markNotificationAsRead(id: string): Promise<NotificationRow> {
    const { data, error } = await this.supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }

  // ==================== INVENTAIRE ====================
  
  async getInventoryItems(filters?: QueryFilters): Promise<SupabaseListResponse<InventoryItemRow>> {
    let query = this.supabase.from('inventory_items').select('*', { count: 'exact' });
    
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,category.ilike.%${filters.search}%`);
    }
    
    if (filters?.filters?.status) {
      query = query.eq('status', filters.filters.status);
    }
    
    if (filters?.filters?.category) {
      query = query.eq('category', filters.filters.category);
    }
    
    if (filters?.sortBy) {
      query = query.order(filters.sortBy, { ascending: filters.sortOrder === 'asc' });
    }
    
    if (filters?.limit) {
      const from = ((filters.page || 1) - 1) * filters.limit;
      query = query.range(from, from + filters.limit - 1);
    }
    
    const { data, error, count } = await query;
    return { data, error, count: count || 0 };
  }

  // ==================== ANALYTICS ====================
  
  async getAnalyticsData(timeRange: string) {
    const { data, error } = await this.supabase.rpc('get_analytics_data', {
      time_range: timeRange
    });
    
    if (error) throw error;
    return data;
  }

  async getKPIs() {
    const { data, error } = await this.supabase.rpc('get_kpis');
    if (error) throw error;
    return data;
  }

  // ==================== TEMPS RÉEL ====================
  
  subscribeToTable<T = any>(
    table: keyof Database['public']['Tables'],
    callback: (payload: RealtimePayload<T>) => void,
    filter?: string
  ): RealtimeSubscription {
    let subscription = this.supabase
      .channel(`public:${table}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table as string,
          filter: filter
        },
        (payload) => {
          callback({
            eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            new: payload.new as T,
            old: payload.old as T,
            schema: payload.schema,
            table: payload.table
          });
        }
      )
      .subscribe();

    return {
      unsubscribe: () => {
        this.supabase.removeChannel(subscription);
      }
    };
  }

  // ==================== UPLOAD FICHIERS ====================
  
  async uploadFile(bucket: string, path: string, file: File): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(path, file);
      
    if (error) throw error;
    
    const { data: { publicUrl } } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(path);
      
    return publicUrl;
  }

  async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(bucket)
      .remove([path]);
      
    if (error) throw error;
  }

  // ==================== UTILITAIRES ====================
  
  async healthCheck(): Promise<boolean> {
    try {
      const { error } = await this.supabase.from('users').select('id').limit(1);
      return !error;
    } catch {
      return false;
    }
  }

  getSupabaseClient(): SupabaseClient<Database> {
    return this.supabase;
  }
}

// Instance singleton
let unifiedService: UnifiedDatabaseService | null = null;

export function getUnifiedService(): UnifiedDatabaseService {
  if (!unifiedService) {
    unifiedService = new UnifiedDatabaseService();
  }
  return unifiedService;
}

export default UnifiedDatabaseService;