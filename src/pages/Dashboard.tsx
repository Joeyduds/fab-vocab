import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getWordPairs, addWordPair, toggleWordPair, deleteWordPair } from '../lib/wordPairs'
import { getProgress, redeemToken } from '../lib/progress'
import { generateSentence } from '../lib/generateSentence'
import type { WordPair, GameProgress } from '../lib/supabase'

const hasApiKey = !!import.meta.env.VITE_ANTHROPIC_API_KEY

export default function Dashboard() {
  const [pairs, setPairs] = useState<WordPair[]>([])
  const [progress, setProgress] = useState<GameProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [incorrectInput, setIncorrectInput] = useState('')
  const [correctInput, setCorrectInput] = useState('')
  const [sentenceInput, setSentenceInput] = useState('')
  const [generating, setGenerating] = useState(false)
  const [addError, setAddError] = useState('')
  const [saving, setSaving] = useState(false)
  const [redeemConfirm, setRedeemConfirm] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    const [wps, prog] = await Promise.all([getWordPairs(), getProgress()])
    setPairs(wps)
    setProgress(prog)
    setLoading(false)
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setAddError('')
    const inc = incorrectInput.trim().toLowerCase()
    const cor = correctInput.trim().toLowerCase()
    if (!inc || !cor) return
    if (inc === cor) { setAddError("The spellings can't be the same."); return }
    if (pairs.some(p => p.incorrect === inc)) { setAddError('That misspelling is already in the list.'); return }
    setSaving(true)
    try {
      const newPair = await addWordPair(inc, cor, sentenceInput.trim() || undefined)
      setPairs(prev => [newPair, ...prev])
      setIncorrectInput('')
      setCorrectInput('')
      setSentenceInput('')
    } catch {
      setAddError('Failed to save — please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleGenerate() {
    if (!correctInput.trim()) return
    setGenerating(true)
    try {
      const sentence = await generateSentence(correctInput.trim().toLowerCase())
      setSentenceInput(sentence)
    } catch {
      setAddError('Could not auto-generate — type a sentence manually.')
    } finally {
      setGenerating(false)
    }
  }

  async function handleToggle(pair: WordPair) {
    await toggleWordPair(pair.id, !pair.active)
    setPairs(prev => prev.map(p => p.id === pair.id ? { ...p, active: !p.active } : p))
  }

  async function handleDelete(id: string) {
    await deleteWordPair(id)
    setPairs(prev => prev.filter(p => p.id !== id))
  }

  async function handleRedeem() {
    if (!progress) return
    const updated = await redeemToken()
    setProgress(updated)
    setRedeemConfirm(false)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <motion.p animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.4 }}
          style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 700, textShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
          Loading...
        </motion.p>
      </div>
    )
  }

  const available = progress ? progress.tokens_earned - progress.tokens_redeemed : 0
  const activeCount = pairs.filter(p => p.active).length

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.9rem', fontWeight: 900, color: '#fff', margin: '0 0 0.25rem', textShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
          Parent Dashboard
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: '0.9rem' }}>
          Manage spelling words and track progress.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {[
          { label: 'Total Points', value: progress?.total_points ?? 0 },
          { label: 'Tokens Earned', value: progress?.tokens_earned ?? 0 },
          { label: 'Available', value: available },
        ].map(({ label, value }) => (
          <div key={label} style={{
            background: 'rgba(255,255,255,0.25)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.4)',
            borderRadius: '20px',
            padding: '1.25rem 1rem',
            textAlign: 'center',
            boxShadow: '0 4px 16px rgba(0,0,0,0.07)',
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: '0.09em', marginTop: '0.3rem' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Redeem */}
      {available > 0 && (
        <div style={{ marginBottom: '1.25rem' }}>
          <AnimatePresence>
            {redeemConfirm ? (
              <motion.div key="confirm"
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{
                  background: 'rgba(255,255,255,0.25)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.4)',
                  borderRadius: '18px', padding: '1rem 1.25rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
                }}>
                <p style={{ color: '#fff', fontWeight: 700, margin: 0, fontSize: '0.9rem' }}>
                  Mark 1 token as redeemed for a prize?
                </p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={handleRedeem} style={{ background: '#fff', color: '#0f9b58', fontWeight: 800, border: 'none', borderRadius: '999px', padding: '0.4rem 1rem', cursor: 'pointer', fontSize: '0.85rem' }}>Yes!</button>
                  <button onClick={() => setRedeemConfirm(false)} style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 600, border: 'none', borderRadius: '999px', padding: '0.4rem 1rem', cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button>
                </div>
              </motion.div>
            ) : (
              <motion.button key="btn"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                onClick={() => setRedeemConfirm(true)}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.4)',
                  borderRadius: '999px', padding: '0.65rem',
                  color: '#fff', fontWeight: 700, cursor: 'pointer',
                  fontSize: '0.9rem', transition: 'background 0.2s',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.3)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
              >
                🎟️ Redeem 1 token for a prize
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Add word pair */}
      <div style={{
        background: '#fff',
        borderRadius: '24px',
        padding: '1.5rem',
        marginBottom: '1.25rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#1a1a1a', margin: '0 0 1rem' }}>Add a Word Pair</h2>
        <form onSubmit={handleAdd}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.62rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
                His spelling (wrong)
              </label>
              <input value={incorrectInput} onChange={e => setIncorrectInput(e.target.value)}
                placeholder="e.g. frend"
                autoComplete="off" autoCorrect="off" spellCheck={false}
                style={{ width: '100%', background: '#fff5f5', border: '2px solid #fecaca', borderRadius: '12px', padding: '0.6rem 0.9rem', color: '#ef4444', fontFamily: 'monospace', fontSize: '1rem', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                onFocus={e => (e.target.style.borderColor = '#ef4444')}
                onBlur={e => (e.target.style.borderColor = '#fecaca')}
              />
            </div>
            <div style={{ color: '#d1d5db', fontSize: '1.2rem', paddingBottom: '0.5rem' }}>→</div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.62rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
                Correct spelling
              </label>
              <input value={correctInput} onChange={e => setCorrectInput(e.target.value)}
                placeholder="e.g. friend"
                autoComplete="off" autoCorrect="off" spellCheck={false}
                style={{ width: '100%', background: '#f0fdf4', border: '2px solid #a7f3d0', borderRadius: '12px', padding: '0.6rem 0.9rem', color: '#059669', fontFamily: 'monospace', fontSize: '1rem', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                onFocus={e => (e.target.style.borderColor = '#10b981')}
                onBlur={e => (e.target.style.borderColor = '#a7f3d0')}
              />
            </div>
          </div>
          {/* Sentence field */}
          <div style={{ marginTop: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.62rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Context sentence <span style={{ color: '#d1d5db', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(uses the correct word)</span>
              </label>
              {hasApiKey && (
                <button type="button" onClick={handleGenerate}
                  disabled={!correctInput.trim() || generating}
                  style={{
                    background: (!correctInput.trim() || generating) ? '#f3f4f6' : 'linear-gradient(135deg, #11998e, #38ef7d)',
                    color: (!correctInput.trim() || generating) ? '#9ca3af' : '#fff',
                    border: 'none', borderRadius: '999px', padding: '0.25rem 0.85rem',
                    fontSize: '0.72rem', fontWeight: 700, cursor: (!correctInput.trim() || generating) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                  }}>
                  {generating ? '✨ Generating…' : '✨ Auto-generate'}
                </button>
              )}
            </div>
            <input
              value={sentenceInput}
              onChange={e => setSentenceInput(e.target.value)}
              placeholder={`e.g. "The boy played with the ball."`}
              autoComplete="off"
              style={{
                width: '100%', background: '#f9fafb', border: '2px solid #e5e7eb',
                borderRadius: '12px', padding: '0.6rem 0.9rem',
                color: '#374151', fontSize: '0.95rem', outline: 'none',
                boxSizing: 'border-box', transition: 'border-color 0.2s',
              }}
              onFocus={e => (e.target.style.borderColor = '#10b981')}
              onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
            />
            <p style={{ color: '#9ca3af', fontSize: '0.72rem', margin: '0.3rem 0 0' }}>
              The game will display it with <span style={{ color: '#ef4444', fontWeight: 600 }}>the wrong spelling</span> substituted in.
            </p>
          </div>

          {addError && <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: '0.5rem 0 0' }}>{addError}</p>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.9rem' }}>
            <button type="submit" disabled={!incorrectInput.trim() || !correctInput.trim() || saving}
              style={{
                background: (incorrectInput.trim() && correctInput.trim() && !saving) ? 'linear-gradient(135deg, #11998e, #38ef7d)' : '#e5e7eb',
                color: (incorrectInput.trim() && correctInput.trim() && !saving) ? '#fff' : '#9ca3af',
                border: 'none', borderRadius: '999px', padding: '0.55rem 1.5rem',
                fontWeight: 800, fontSize: '0.9rem',
                cursor: (incorrectInput.trim() && correctInput.trim() && !saving) ? 'pointer' : 'not-allowed',
                boxShadow: (incorrectInput.trim() && correctInput.trim() && !saving) ? '0 4px 12px rgba(17,153,142,0.35)' : 'none',
                transition: 'all 0.2s',
              }}>
              {saving ? 'Saving...' : '+ Add Pair'}
            </button>
          </div>
        </form>
      </div>

      {/* Word pairs list */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: 0, textShadow: '0 1px 4px rgba(0,0,0,0.15)' }}>
            Word Pairs ({pairs.length})
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>{activeCount} active in game</span>
        </div>

        {pairs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'rgba(255,255,255,0.6)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📝</div>
            <p>No word pairs yet. Add some above!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <AnimatePresence initial={false}>
              {pairs.map(pair => (
                <motion.div key={pair.id} layout
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    background: pair.active ? '#fff' : 'rgba(255,255,255,0.5)',
                    borderRadius: '16px',
                    padding: '0.75rem 1rem',
                    boxShadow: pair.active ? '0 4px 16px rgba(0,0,0,0.08)' : 'none',
                    opacity: pair.active ? 1 : 0.6,
                    transition: 'opacity 0.2s, background 0.2s',
                  }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontFamily: 'monospace', color: '#ef4444', fontWeight: 700, fontSize: '1rem' }}>{pair.incorrect}</span>
                      <span style={{ color: '#d1d5db', fontSize: '0.9rem' }}>→</span>
                      <span style={{ fontFamily: 'monospace', color: '#059669', fontWeight: 700, fontSize: '1rem' }}>{pair.correct}</span>
                    </div>
                    {pair.sentence && (
                      <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: '#6b7280', fontStyle: 'italic' }}>
                        "{pair.sentence}"
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <button onClick={() => handleToggle(pair)}
                      style={{
                        fontSize: '0.7rem', fontWeight: 700, padding: '0.25rem 0.8rem',
                        borderRadius: '999px', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                        background: pair.active ? '#dcfce7' : '#f3f4f6',
                        color: pair.active ? '#059669' : '#9ca3af',
                      }}>
                      {pair.active ? 'Active' : 'Off'}
                    </button>
                    <button onClick={() => handleDelete(pair.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fca5a5', fontSize: '1.3rem', lineHeight: 1, padding: '0 0.2rem', transition: 'color 0.2s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#fca5a5')}
                      title="Delete">×</button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
