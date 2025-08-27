// supabase-fallback.ts - Fallback database service
import { createClient } from '@supabase/supabase-js'

// Mock database interface for fallback
interface DatabaseFallback { healthCheck(): Promise<{ status: 'connected' | 'disconnected' | 'error' latency?: number error?: string }>
}

//  Supabase connection
export async function SupabaseConnection(): Promise<boolean> { try { const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_ if (!supabaseUrl || !supabaseAnon || supabaseUrl.includes('localhost')) { console.log('🔄 Supabase: Using development mode') return false } const client = createClient(supabaseUrl, supabaseAnon) const startTime = Date.now() // Simple connection const { error } = await client.from('_health_check').select('*').limit(1) const latency = Date.now() - startTime if (error && !error.message.includes('relation "_health_check" does not exist')) { console.warn('⚠️ Supabase connection  failed:', error.message) return false } console.log(`✅ Supabase connected (${latency}ms)`) return true } catch (error) { console.warn('⚠️ Supabase connection  error:', error instanceof Error ? error.message : String(error)) return false }
}

// Fallback database service
class SupabaseFallback implements DatabaseFallback { private isConnected = false constructor() { this.checkConnection() } private async checkConnection() { this.isConnected = await SupabaseConnection() } async healthCheck() { const startTime = Date.now() try { const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_ if (!supabaseUrl || !supabaseAnon || supabaseUrl.includes('localhost')) { return { status: 'disconnected' as const, error: 'Development mode - no real database connection' } } const client = createClient(supabaseUrl, supabaseAnon) const { error } = await client.from('_health_check').select('*').limit(1) const latency = Date.now() - startTime if (error && !error.message.includes('relation "_health_check" does not exist')) { return { status: 'error' as const, latency, error: error.message } } return { status: 'connected' as const, latency } } catch (error) { const latency = Date.now() - startTime return { status: 'error' as const, latency, error: error instanceof Error ? error.message : 'Unknown error' } } }
}

// Export default instance
const db = new SupabaseFallback()
export default db