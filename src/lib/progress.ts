import { supabase } from './supabase'
import type { GameProgress } from './supabase'

const PROGRESS_ID = 'singleton'

export async function getProgress(): Promise<GameProgress> {
  const { data, error } = await supabase
    .from('spelling_progress')
    .select('*')
    .eq('id', PROGRESS_ID)
    .single()

  if (error || !data) {
    const fresh: GameProgress = {
      id: PROGRESS_ID,
      total_points: 0,
      tokens_earned: 0,
      tokens_redeemed: 0,
      updated_at: new Date().toISOString(),
    }
    await supabase.from('spelling_progress').upsert(fresh)
    return fresh
  }
  return data as GameProgress
}

export async function addPoints(delta: number): Promise<GameProgress> {
  const current = await getProgress()
  const newPoints = Math.max(0, current.total_points + delta)
  const newTokensEarned = Math.max(current.tokens_earned, Math.floor(newPoints / 35))

  const updated = {
    ...current,
    total_points: newPoints,
    tokens_earned: newTokensEarned,
    updated_at: new Date().toISOString(),
  }

  await supabase.from('spelling_progress').upsert(updated)
  return updated
}

export async function redeemToken(): Promise<GameProgress> {
  const current = await getProgress()
  const available = current.tokens_earned - current.tokens_redeemed
  if (available <= 0) return current

  const updated = {
    ...current,
    tokens_redeemed: current.tokens_redeemed + 1,
    updated_at: new Date().toISOString(),
  }

  await supabase.from('spelling_progress').upsert(updated)
  return updated
}
