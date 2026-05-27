import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getWordPairs } from '../lib/wordPairs'
import { getProgress, addPoints } from '../lib/progress'
import type { WordPair, GameProgress } from '../lib/supabase'

type Feedback = 'correct' | 'wrong-first' | 'wrong-final' | null

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function SentenceDisplay({ sentence, correct, incorrect }: { sentence: string; correct: string; incorrect: string }) {
  // Match whichever form the parent typed — correct or incorrect spelling
  const escaped = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`\\b(${escaped(correct)}|${escaped(incorrect)})\\b`, 'gi')
  const parts = sentence.split(regex)
  return (
    <p style={{ textAlign: 'center', fontSize: '1.1rem', color: '#374151', lineHeight: 1.6, margin: '0.25rem 0 0', fontStyle: 'italic', display: 'inline' }}>
      {parts.map((part, i) => {
        const lower = part.toLowerCase()
        if (lower === correct.toLowerCase() || lower === incorrect.toLowerCase()) {
          return <strong key={i} style={{ color: '#ef4444', fontWeight: 900, fontStyle: 'normal', fontFamily: 'monospace', fontSize: '1.15rem', textDecoration: 'underline', textDecorationColor: '#ef4444' }}>{incorrect}</strong>
        }
        return <span key={i}>{part}</span>
      })}
    </p>
  )
}

export default function Game() {
  const [pairs, setPairs] = useState<WordPair[]>([])
  const [queue, setQueue] = useState<WordPair[]>([])
  const [current, setCurrent] = useState<WordPair | null>(null)
  const [input, setInput] = useState('')
  const [attempt, setAttempt] = useState<1 | 2>(1)
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [progress, setProgress] = useState<GameProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [newTokenAlert, setNewTokenAlert] = useState(false)
  const [loadError, setLoadError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    Promise.all([getWordPairs(), getProgress()])
      .then(([wps, prog]) => {
        const active = wps.filter(p => p.active)
        setPairs(active)
        setProgress(prog)
        const q = shuffle(active)
        setQueue(q.slice(1))
        setCurrent(q[0] ?? null)
        setLoading(false)
      })
      .catch(err => {
        setLoadError(err?.message ?? 'Failed to load game data.')
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (!loading) inputRef.current?.focus()
  }, [loading, current])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!current || (feedback && feedback !== 'wrong-first')) return

    const answer = input.trim().toLowerCase()
    const isCorrect = answer === current.correct

    if (isCorrect) {
      try {
        const prev = progress?.tokens_earned ?? 0
        const updated = await addPoints(1)
        setProgress(updated)
        if (updated.tokens_earned > prev) setNewTokenAlert(true)
      } catch { /* non-fatal — points just don't save */ }
      setFeedback('correct')
      setTimeout(() => advanceWord(), 1100)
    } else if (attempt === 1) {
      setFeedback('wrong-first')
      setInput('')
      setAttempt(2)
    } else {
      try {
        const updated = await addPoints(-1)
        setProgress(updated)
      } catch { /* non-fatal */ }
      setFeedback('wrong-final')
      setTimeout(() => advanceWord(), 1600)
    }
  }

  function advanceWord() {
    setFeedback(null)
    setInput('')
    setAttempt(1)
    setNewTokenAlert(false)

    if (queue.length === 0) {
      const reshuffled = shuffle(pairs)
      setQueue(reshuffled.slice(1))
      setCurrent(reshuffled[0] ?? null)
    } else {
      setCurrent(queue[0])
      setQueue(q => q.slice(1))
    }
    setTimeout(() => inputRef.current?.focus(), 50)
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

  if (loadError) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: '1rem', padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem' }}>⚠️</div>
        <p style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700, maxWidth: '400px', textShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>
          {loadError}
        </p>
        <button onClick={() => window.location.reload()} style={{ background: '#fff', color: '#0f9b58', fontWeight: 800, border: 'none', borderRadius: '999px', padding: '0.7rem 2rem', fontSize: '1rem', cursor: 'pointer' }}>
          Try again
        </button>
      </div>
    )
  }

  if (!current) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: '1.5rem', textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '4rem' }}>📚</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', margin: 0, textShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>No words yet!</h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.1rem' }}>Ask a parent to add spelling words in the dashboard.</p>
      </div>
    )
  }

  const available = progress ? progress.tokens_earned - progress.tokens_redeemed : 0
  const pointsToNextToken = progress ? 35 - (progress.total_points % 35) : 35
  const progressPct = progress ? ((progress.total_points % 35) / 35) * 100 : 0

  const cardBg =
    feedback === 'correct' ? '#f0fff4' :
    feedback === 'wrong-first' ? '#fffbeb' :
    feedback === 'wrong-final' ? '#fff5f5' :
    '#ffffff'

  const cardBorder =
    feedback === 'correct' ? '#6ee7b7' :
    feedback === 'wrong-first' ? '#fcd34d' :
    feedback === 'wrong-final' ? '#fca5a5' :
    'rgba(255,255,255,0.9)'

  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2.5rem 1.5rem', gap: '1.75rem' }}>

      {/* Stats pill */}
      <div style={{
        width: '100%', maxWidth: '480px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(255,255,255,0.25)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.4)',
        borderRadius: '999px',
        padding: '0.8rem 1.75rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{progress?.total_points ?? 0}</div>
          <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.2rem' }}>Points</div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.9rem', lineHeight: 1 }}>🎟️</div>
          <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.2rem' }}>{available} Token{available !== 1 ? 's' : ''}</div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.4rem' }}>{pointsToNextToken} to next token</div>
          <div style={{ width: '90px', height: '7px', background: 'rgba(255,255,255,0.25)', borderRadius: '999px', overflow: 'hidden' }}>
            <motion.div
              style={{ height: '100%', background: '#fff', borderRadius: '999px' }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* Token celebration */}
      <AnimatePresence>
        {newTokenAlert && (
          <motion.div
            initial={{ scale: 0, y: -12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            style={{
              background: '#fff',
              color: '#0f9b58',
              fontWeight: 900,
              fontSize: '1rem',
              padding: '0.6rem 1.5rem',
              borderRadius: '999px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
            }}
          >
            🎉 You earned a token!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Word card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -28, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          style={{
            width: '100%',
            maxWidth: '480px',
            background: cardBg,
            border: `2px solid ${cardBorder}`,
            borderRadius: '28px',
            padding: '2.5rem 2rem',
            boxShadow: '0 12px 48px rgba(0,0,0,0.12)',
            transition: 'background 0.3s, border-color 0.3s',
          }}
        >
          <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '1.2rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '1.25rem', marginTop: 0, fontFamily: 'Calibri, system-ui, sans-serif' }}>
            How do you spell this word?
          </p>

          <div style={{ textAlign: 'center', marginBottom: current.sentence ? '1rem' : '1.75rem' }}>
            <span style={{ fontSize: '3.4rem', fontWeight: 900, color: '#ef4444', fontFamily: 'monospace', letterSpacing: '0.04em' }}>
              {current.incorrect}
            </span>
          </div>

          {current.sentence && (
            <div style={{ marginBottom: '1.75rem' }}>
              <span style={{ fontWeight: 700, color: '#6b7280', fontSize: '0.95rem' }}>In a sentence: </span>
              <SentenceDisplay
                sentence={current.sentence}
                correct={current.correct}
                incorrect={current.incorrect}
              />
            </div>
          )}

          {feedback === 'wrong-first' && (
            <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: 'center', color: '#d97706', fontWeight: 700, fontSize: '1rem', marginBottom: '1.25rem', marginTop: 0 }}>
              Not quite — one more try! 🤔
            </motion.p>
          )}

          {feedback === 'wrong-final' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <p style={{ color: '#ef4444', fontWeight: 600, margin: '0 0 0.3rem' }}>The correct spelling is:</p>
              <p style={{ fontSize: '2rem', fontWeight: 900, color: '#dc2626', fontFamily: 'monospace', margin: 0 }}>{current.correct}</p>
            </motion.div>
          )}

          {feedback === 'correct' && (
            <motion.p initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}
              style={{ textAlign: 'center', color: '#059669', fontWeight: 900, fontSize: '1.4rem', marginBottom: '1.25rem', marginTop: 0 }}>
              ✅ Correct! +1 point
            </motion.p>
          )}

          {(!feedback || feedback === 'wrong-first') && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.6rem' }}>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type the correct spelling..."
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                style={{
                  flex: 1,
                  border: '2px solid #d1fae5',
                  borderRadius: '999px',
                  padding: '0.75rem 1.25rem',
                  fontSize: '1.1rem',
                  textAlign: 'center',
                  color: '#1a1a1a',
                  fontFamily: 'monospace',
                  outline: 'none',
                  background: '#fff',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => (e.target.style.borderColor = '#10b981')}
                onBlur={e => (e.target.style.borderColor = '#d1fae5')}
              />
              <button
                type="submit"
                disabled={!input.trim()}
                style={{
                  background: input.trim() ? 'linear-gradient(135deg, #11998e, #38ef7d)' : '#e5e7eb',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '0.75rem 1.4rem',
                  fontSize: '1.2rem',
                  color: input.trim() ? '#fff' : '#9ca3af',
                  fontWeight: 800,
                  cursor: input.trim() ? 'pointer' : 'not-allowed',
                  boxShadow: input.trim() ? '0 4px 12px rgba(17,153,142,0.35)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                →
              </button>
            </form>
          )}
        </motion.div>
      </AnimatePresence>

      {feedback === 'wrong-first' && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', textShadow: '0 1px 4px rgba(0,0,0,0.2)', margin: 0 }}>
          ⚠️ Last chance!
        </motion.p>
      )}
    </div>
  )
}
