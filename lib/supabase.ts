import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create client only if credentials are provided
export const supabase: SupabaseClient | null = 
  supabaseUrl && supabaseAnonKey 
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null

export interface Company {
  id: string
  company_name: string
  origin_country: string
  sector: string
  base_price: number
  revenue_2022: number
  revenue_2023: number
  growth_rate: 'LOW' | 'MEDIUM' | 'HIGH'
  logo_url: string | null
}
