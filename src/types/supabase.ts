
// Types TypeScript harmonisés Prisma/Supabase
// Auto-généré le 2025-08-24T10:37:41.216Z

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Types de base harmonisés
export interface User {
  id: string;
  email: string;
  full_name?: string | null; // Harmonisé avec Prisma 'name'
  phone?: string | null;
  loyalty_points: number; // Harmonisé avec Prisma 'loyaltyPoints'
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  category: string;
  image?: string | null;
  ingredients?: Json;
  is_active: boolean; // Harmonisé avec Prisma 'isActive'
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  total_amount: number; // Harmonisé avec Prisma 'totalAmount'
  delivery_address?: string | null; // Harmonisé avec Prisma 'deliveryAddress'
  phone?: string | null;
  notes?: string | null;
  customer_notes?: string | null; // Harmonisé avec Prisma 'customerNotes'
  internal_notes?: string | null; // Harmonisé avec Prisma 'internalNotes'
  estimated_delivery?: string | null; // Harmonisé avec Prisma 'estimatedDelivery'
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string; // Harmonisé avec Prisma 'orderId'
  product_id: string; // Harmonisé avec Prisma 'productId'
  quantity: number;
  price: number;
  customizations?: Json;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  user_id: string; // Harmonisé avec Prisma 'userId'
  product_id: string; // Harmonisé avec Prisma 'productId'
  rating: number;
  comment?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string; // Harmonisé avec Prisma 'userId'
  title: string;
  message: string;
  type: string;
  read: boolean;
  data?: Json;
  created_at: string;
  updated_at: string;
}

export interface PushSubscription {
  id: string;
  user_id: string; // Harmonisé avec Prisma 'userId'
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreference {
  id: string;
  user_id: string; // Harmonisé avec Prisma 'userId'
  order_updates: boolean;
  promotions: boolean;
  newsletter: boolean;
  push_enabled: boolean;
  email_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface CmsContent {
  id: string;
  key: string;
  title?: string | null;
  content?: string | null;
  metadata?: Json;
  is_active: boolean; // Harmonisé avec Prisma 'isActive'
  created_at: string;
  updated_at: string;
}

export interface ContentTemplate {
  id: string;
  name: string;
  description?: string | null;
  type: string;
  default_content?: string | null;
  fields_schema?: Json | null;
  created_at: string;
  updated_at: string;
}

export interface ContentCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContentVersion {
  id: string;
  content_id: string;
  version: number;
  title?: string | null;
  content?: string | null;
  metadata?: Json;
  created_at: string;
  created_by?: string | null;
}

export interface InventoryItem {
  id: string;
  name: string;
  description?: string | null;
  sku: string;
  category?: string | null;
  unit: string;
  current_stock: number;
  min_stock: number;
  max_stock?: number | null;
  cost_price?: number | null;
  selling_price?: number | null;
  supplier?: string | null;
  location?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InventoryMovement {
  id: string;
  item_id: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  unit_cost?: number | null;
  total_cost?: number | null;
  reason?: string | null;
  reference_number?: string | null;
  employee_id?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface MediaFile {
  id: string;
  name: string;
  original_name: string;
  type: string;
  mime_type: string;
  size: number;
  url: string;
  alt_text?: string | null;
  description?: string | null;
  thumbnail_url?: string | null;
  folder_id?: string | null;
  tags?: string[] | null;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    format?: string;
    [key: string]: any;
  } | null;
  uploaded_by: string;
  created_at: string;
  updated_at?: string | null;
}

export interface MediaFolder {
  id: string;
  name: string;
  description?: string | null;
  parent_id?: string | null;
  path: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsData {
  id: string;
  metric_name: string;
  metric_value: number;
  dimensions?: Json;
  timestamp: string;
  created_at: string;
}

export interface KpiData {
  id: string;
  kpi_name: string;
  kpi_value: number;
  target_value?: number | null;
  period: string;
  created_at: string;
  updated_at: string;
}

export interface QueryFilters {
  id: string;
  filter_name: string;
  filter_config: Json;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Database interface pour Supabase
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>> & {
          updated_at?: string;
        };
      };
      products: {
        Row: Product;
        Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>> & {
          updated_at?: string;
        };
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Order, 'id' | 'created_at' | 'updated_at'>> & {
          updated_at?: string;
        };
      };
      order_items: {
        Row: OrderItem;
        Insert: Omit<OrderItem, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<OrderItem, 'id' | 'created_at' | 'updated_at'>> & {
          updated_at?: string;
        };
      };
      reviews: {
        Row: Review;
        Insert: Omit<Review, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Review, 'id' | 'created_at' | 'updated_at'>> & {
          updated_at?: string;
        };
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Notification, 'id' | 'created_at' | 'updated_at'>> & {
          updated_at?: string;
        };
      };
      push_subscriptions: {
        Row: PushSubscription;
        Insert: Omit<PushSubscription, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<PushSubscription, 'id' | 'created_at' | 'updated_at'>> & {
          updated_at?: string;
        };
      };
      notification_preferences: {
        Row: NotificationPreference;
        Insert: Omit<NotificationPreference, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<NotificationPreference, 'id' | 'created_at' | 'updated_at'>> & {
          updated_at?: string;
        };
      };
      cms_content: {
        Row: CmsContent;
        Insert: Omit<CmsContent, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<CmsContent, 'id' | 'created_at' | 'updated_at'>> & {
          updated_at?: string;
        };
      };
      content_templates: {
        Row: ContentTemplate;
        Insert: Omit<ContentTemplate, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<ContentTemplate, 'id' | 'created_at' | 'updated_at'>> & {
          updated_at?: string;
        };
      };
      content_categories: {
        Row: ContentCategory;
        Insert: Omit<ContentCategory, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<ContentCategory, 'id' | 'created_at' | 'updated_at'>> & {
          updated_at?: string;
        };
      };
      content_versions: {
        Row: ContentVersion;
        Insert: Omit<ContentVersion, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<ContentVersion, 'id' | 'created_at'>>;
      };
      inventory_items: {
        Row: InventoryItem;
        Insert: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>> & {
          updated_at?: string;
        };
      };
      inventory_movements: {
        Row: InventoryMovement;
        Insert: Omit<InventoryMovement, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<InventoryMovement, 'id' | 'created_at'>>;
      };
      media_files: {
        Row: MediaFile;
        Insert: Omit<MediaFile, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<MediaFile, 'id' | 'created_at' | 'updated_at'>> & {
          updated_at?: string;
        };
      };
      media_folders: {
        Row: MediaFolder;
        Insert: Omit<MediaFolder, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<MediaFolder, 'id' | 'created_at' | 'updated_at'>> & {
          updated_at?: string;
        };
      };
      analytics_data: {
        Row: AnalyticsData;
        Insert: Omit<AnalyticsData, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<AnalyticsData, 'id' | 'created_at'>>;
      };
      kpi_data: {
        Row: KpiData;
        Insert: Omit<KpiData, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<KpiData, 'id' | 'created_at' | 'updated_at'>> & {
          updated_at?: string;
        };
      };
      query_filters: {
        Row: QueryFilters;
        Insert: Omit<QueryFilters, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<QueryFilters, 'id' | 'created_at' | 'updated_at'>> & {
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Types utilitaires
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Exports pour compatibilité
export type {
  User,
  Product,
  Order,
  OrderItem,
  Review,
  Notification,
  PushSubscription,
  NotificationPreference,
  CmsContent,
  ContentTemplate,
  ContentCategory,
  ContentVersion,
  InventoryItem,
  InventoryMovement,
  MediaFile,
  MediaFolder,
  AnalyticsData,
  KpiData,
  QueryFilters
};
