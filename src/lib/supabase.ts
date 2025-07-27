import { createClient } from '@supabase/supabase-js'

// Supabase configuration - all values must be provided via environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate required environment variables
if (!supabaseUrl) {
  throw new Error('Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL')
}

if (!supabaseAnonKey) {
  throw new Error('Missing required environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// NOTE: Service role key should NEVER be exposed in client-side code
// It should only be used in API routes or server actions
// Example usage in API route: process.env.SUPABASE_SERVICE_ROLE_KEY

export default supabase