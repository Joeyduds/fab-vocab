import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type WordPair = {
  id: string
  incorrect: string
  correct: string
  active: boolean
  sentence: string | null
  created_at: string
}

export type GameProgress = {
  id: string
  total_points: number
  tokens_earned: number
  tokens_redeemed: number
  updated_at: string
}
