
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
export type { User, Product, Order, OrderItem, Review, Notification, PushSubscription, NotificationPreference, CmsContent };
