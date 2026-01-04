import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../types/supabase'

// Server-side client with service role key
// This bypasses RLS and should only be used in server-side code (API routes, Server Components)
export function createServerClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Missing Supabase environment variables')
    }

    return createClient<Database>(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
}

// Singleton for server-side use
let serverClient: ReturnType<typeof createServerClient> | null = null

export function getSupabaseServerClient() {
    if (!serverClient) {
        serverClient = createServerClient()
    }
    return serverClient
}

