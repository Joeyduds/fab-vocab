import { supabase } from './supabase'
import type { WordPair } from './supabase'

export async function getWordPairs(): Promise<WordPair[]> {
  const { data, error } = await supabase
    .from('spelling_word_pairs')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as WordPair[]
}

export async function addWordPair(incorrect: string, correct: string, sentence?: string): Promise<WordPair> {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('spelling_word_pairs')
    .insert({ incorrect: incorrect.trim().toLowerCase(), correct: correct.trim().toLowerCase(), active: true, sentence: sentence?.trim() || null, user_id: user!.id })
    .select()
    .single()

  if (error) throw error
  return data as WordPair
}

export async function toggleWordPair(id: string, active: boolean): Promise<void> {
  const { error } = await supabase
    .from('spelling_word_pairs')
    .update({ active })
    .eq('id', id)

  if (error) throw error
}

export async function deleteWordPair(id: string): Promise<void> {
  const { error } = await supabase
    .from('spelling_word_pairs')
    .delete()
    .eq('id', id)

  if (error) throw error
}
