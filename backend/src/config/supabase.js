import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY

let supabase = null

if (supabaseUrl && supabaseKey && supabaseUrl !== 'YOUR_SUPABASE_URL') {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    })
    console.log('⚡ Supabase Client initialized successfully!')
  } catch (err) {
    console.error('❌ Failed to initialize Supabase client:', err.message)
  }
} else {
  console.log('ℹ️ SUPABASE_URL / SUPABASE_KEY not configured. Falling back to local JsonDB engine.')
}

export { supabase }
