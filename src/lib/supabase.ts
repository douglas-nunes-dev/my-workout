import { createClient } from '@supabase/supabase-js'

// Os valores vêm do arquivo .env.local
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Faltam VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY no arquivo .env.local')
}

// Conexão com o Supabase, usada em todo o app
export const supabase = createClient(supabaseUrl, supabaseKey)
