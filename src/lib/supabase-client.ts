import { createClient } from '@supabase/supabase-js'
import { SupabaseConnection } from './supabase-fallback'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_!

// Create client with error handling
let supabase: ReturnType<typeof createClient> | null = null

try { if (supabaseUrl && supabaseAnon && !supabaseUrl.includes('localhost')) { supabase = createClient(supabaseUrl, supabaseAnon) //  connection in background SupabaseConnection().catch(console.warn) } else { console.log('🔄 Supabase: Using local development configuration') // Create a mock client for development supabase = createClient('http://localhost:54321', 'mock-) }
} catch (error) { console.warn('⚠️ Supabase client creation failed:', error) // Create a mock client as fallback supabase = createClient('http://localhost:54321', 'mock-)
}

export { supabase }
export default supabase