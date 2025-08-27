import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnon)

// Re-export types from types/supabase.ts for convenience
export type { Database }
export type {
  Tables,
  TablesInsert,
  TablesUpdate,
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
} from '@/types/supabase'