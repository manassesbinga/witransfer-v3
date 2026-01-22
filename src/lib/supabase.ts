import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Supabase SDK requires a valid URL format even during initialization
// We use a dummy URL if keys are missing to prevent Runtime Errors during build/render
const isConfigured = supabaseUrl && supabaseUrl.startsWith('http')

if (!isConfigured) {
    // Supabase not configured warning removed
}

const finalUrl = isConfigured ? supabaseUrl : 'https://placeholder-project.supabase.co'
const finalAnonKey = supabaseAnonKey || 'placeholder-key'
const finalServiceKey = supabaseServiceKey || 'placeholder-key'

export const supabase = createClient(finalUrl, finalAnonKey)

export const supabaseAdmin = createClient(
    finalUrl,
    finalServiceKey,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
)
