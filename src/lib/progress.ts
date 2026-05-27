import { supabase } from './supabase'
import type { GameProgress } from './supabase'

async function getUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  return user.id
}

export async function getProgress(): Promise<GameProgress> {
  const userId = await getUserId()

  const { data, error } = await supabase
    .from('spelling_progress')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    const fresh = {
      total_points: 0,
      tokens_earned: 0,
      tokens_redeemed: 0,
      user_id: userId,
      updated_at: new Date().toISOString(),
    }
    const { data: created, error: createError } = await supabase
      .from('spelling_progress')
      .insert(fresh)
      .select()
      .single()
    if (createError) throw createError
    return created as GameProgress
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

  const { error } = await supabase
    .from('spelling_progress')
    .update({ total_points: newPoints, tokens_earned: newTokensEarned, updated_at: updated.updated_at })
    .eq('id', current.id)

  if (error) throw error
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

  const { error } = await supabase
    .from('spelling_progress')
    .update({ tokens_redeemed: updated.tokens_redeemed, updated_at: updated.updated_at })
    .eq('id', current.id)

  if (error) throw error
  return updated
}
