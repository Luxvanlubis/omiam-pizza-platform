// Types TypeScript pour l'intégration Supabase complète
// Auto-généré et étendu pour tous les modules

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          loyalty_points: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          loyalty_points?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          loyalty_points?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          category: string;
          image_url: string | null;
          available: boolean;
          ingredients: string[] | null;
          allergens: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          price: number;
          category: string;
          image_url?: string | null;
          available?: boolean;
          ingredients?: string[] | null;
          allergens?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          category?: string;
          image_url?: string | null;
          available?: boolean;
          ingredients?: string[] | null;
          allergens?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          order_number: string;
          status: string;
          total_amount: number;
          delivery_address: string | null;
          phone: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          order_number: string;
          status?: string;
          total_amount: number;
          delivery_address?: string | null;
          phone?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          order_number?: string;
          status?: string;
          total_amount?: number;
          delivery_address?: string | null;
          phone?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
          created_at?: string;
        };
      };
      loyalty_transactions: {
        Row: {
          id: string;
          user_id: string;
          order_id: string | null;
          points: number;
          transaction_type: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          order_id?: string | null;
          points: number;
          transaction_type: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          order_id?: string | null;
          points?: number;
          transaction_type?: string;
          description?: string | null;
          created_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          user_id: string;
          order_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          order_id: string;
          rating: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          order_id?: string;
          rating?: number;
          comment?: string | null;
          created_at?: string;
        };
      };
      inventory_items: {
        Row: {
          id: string;
          name: string;
          category: string;
          current_stock: number;
          min_stock: number;
          max_stock: number | null;
          unit: string;
          cost: number | null;
          supplier: string | null;
          last_restock: string | null;
          status: string;
          auto_reorder: boolean;
          reorder_point: number | null;
          reorder_quantity: number | null;
          location: string | null;
          expiry_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          current_stock: number;
          min_stock: number;
          max_stock?: number | null;
          unit: string;
          cost?: number | null;
          supplier?: string | null;
          last_restock?: string | null;
          status?: string;
          auto_reorder?: boolean;
          reorder_point?: number | null;
          reorder_quantity?: number | null;
          location?: string | null;
          expiry_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          current_stock?: number;
          min_stock?: number;
          max_stock?: number | null;
          unit?: string;
          cost?: number | null;
          supplier?: string | null;
          last_restock?: string | null;
          status?: string;
          auto_reorder?: boolean;
          reorder_point?: number | null;
          reorder_quantity?: number | null;
          location?: string | null;
          expiry_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      stock_movements: {
        Row: {
          id: string;
          item_id: string;
          type: string;
          quantity: number;
          reason: string | null;
          employee_id: string | null;
          order_id: string | null;
          timestamp: string;
          cost: number | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          item_id: string;
          type: string;
          quantity: number;
          reason?: string | null;
          employee_id?: string | null;
          order_id?: string | null;
          timestamp?: string;
          cost?: number | null;
          notes?: string | null;
        };
        Update: {
          id?: string;
          item_id?: string;
          type?: string;
          quantity?: number;
          reason?: string | null;
          employee_id?: string | null;
          order_id?: string | null;
          timestamp?: string;
          cost?: number | null;
          notes?: string | null;
        };
      };
      content_items: {
        Row: {
          id: string;
          key: string;
          title: string;
          content: string;
          type: string;
          page: string;
          section: string | null;
          metadata: Json | null;
          is_published: boolean;
          version: number;
          created_at: string;
          updated_at: string;
          created_by: string;
          updated_by: string;
        };
        Insert: {
          id?: string;
          key: string;
          title: string;
          content: string;
          type: string;
          page: string;
          section?: string | null;
          metadata?: Json | null;
          is_published?: boolean;
          version?: number;
          created_at?: string;
          updated_at?: string;
          created_by: string;
          updated_by: string;
        };
        Update: {
          id?: string;
          key?: string;
          title?: string;
          content?: string;
          type?: string;
          page?: string;
          section?: string | null;
          metadata?: Json | null;
          is_published?: boolean;
          version?: number;
          created_at?: string;
          updated_at?: string;
          created_by?: string;
          updated_by?: string;
        };
      };
      content_templates: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          type: string;
          default_content: string | null;
          fields_schema: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          type: string;
          default_content?: string | null;
          fields_schema?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          type?: string;
          default_content?: string | null;
          fields_schema?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      content_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string | null;
          type: string;
          title: string;
          message: string;
          data: Json | null;
          read: boolean;
          priority: string;
          channel: string;
          created_at: string;
          read_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          type: string;
          title: string;
          message: string;
          data?: Json | null;
          read?: boolean;
          priority?: string;
          channel?: string;
          created_at?: string;
          read_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          type?: string;
          title?: string;
          message?: string;
          data?: Json | null;
          read?: boolean;
          priority?: string;
          channel?: string;
          created_at?: string;
          read_at?: string | null;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          role: string;
          permissions: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: string;
          permissions?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: string;
          permissions?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_analytics_data: {
        Args: {
          time_range: string;
        };
        Returns: {
          date: string;
          revenue: number;
          orders: number;
          customers: number;
          average_order_value: number;
        }[];
      };
      get_kpis: {
        Args: Record<PropertyKey, never>;
        Returns: {
          total_revenue: number;
          total_orders: number;
          total_customers: number;
          average_order_value: number;
          growth_rate: number;
          conversion_rate: number;
          customer_retention_rate: number;
          inventory_turnover: number;
        };
      };
      create_inventory_tables: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      order_status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
      notification_type: 'order' | 'promotion' | 'system' | 'loyalty' | 'review' | 'payment' | 'inventory' | 'security' | 'marketing' | 'social';
      notification_priority: 'low' | 'medium' | 'high' | 'urgent';
      notification_channel: 'push' | 'email' | 'sms' | 'in_app';
      user_role: 'customer' | 'employee' | 'admin' | 'super_admin';
      stock_status: 'good' | 'low' | 'critical' | 'out_of_stock';
      movement_type: 'in' | 'out' | 'adjustment' | 'transfer';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Types utilitaires pour l'intégration
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// Types spécifiques pour les modules
export type User = Tables<'users'>;
export type Product = Tables<'products'>;
export type Order = Tables<'orders'>;
export type OrderItem = Tables<'order_items'>;
export type InventoryItem = Tables<'inventory_items'>;
export type StockMovement = Tables<'stock_movements'>;
export type ContentItem = Tables<'content_items'>;
export type Notification = Tables<'notifications'>;
export type UserProfile = Tables<'user_profiles'>;

// Types pour les réponses d'API
export interface SupabaseResponse<T> {
  data: T | null;
  error: any;
}

export interface SupabaseListResponse<T> {
  data: T[] | null;
  error: any;
  count?: number;
}

// Types pour les analytics
export interface AnalyticsData {
  date: string;
  revenue: number;
  orders: number;
  customers: number;
  average_order_value: number;
}

export interface KPIData {
  total_revenue: number;
  total_orders: number;
  total_customers: number;
  average_order_value: number;
  growth_rate: number;
  conversion_rate: number;
  customer_retention_rate: number;
  inventory_turnover: number;
}

// Types pour les filtres et requêtes
export interface QueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export interface TimeRangeFilter {
  start_date?: string;
  end_date?: string;
  period?: '1d' | '7d' | '30d' | '90d' | '1y';
}

// Types pour les souscriptions temps réel
export interface RealtimePayload<T = any> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T;
  old: T;
  schema: string;
  table: string;
}

export interface RealtimeSubscription {
  unsubscribe: () => void;
}