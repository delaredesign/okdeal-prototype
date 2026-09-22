import { createClient } from '@supabase/supabase-js'

const url = 'https://eermsbffdmwtmwryedqh.supabase.co'
const publishableKey = 'sb_publishable_14pA1sCGBVApAyFcrGZhkw_LimSD-NO'

export const supabase = createClient(url, publishableKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
})
