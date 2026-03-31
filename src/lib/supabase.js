import { createClient } from '@supabase/supabase-js'

// Get env variables
// Vite exposes VITE_ prefixed vars to the client
// Server-side (SSR) can access non-prefixed vars via process.env or import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase configuration missing:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey
  });
  // During build/SSR on Vercel, this might fail if env vars aren't set in the dashboard
  if (typeof window !== 'undefined') {
    throw new Error('Supabase configuration missing. Please check your environment variables.');
  }
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
)
