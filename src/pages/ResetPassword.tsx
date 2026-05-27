import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Recovery tokens arrive in the URL hash (#access_token=...&type=recovery).
    // The Supabase v2 client exchanges them asynchronously and fires the
    // PASSWORD_RECOVERY event — NOT a synchronous getSession() result.
    // We must listen for this event; calling getSession() immediately races
    // the exchange and almost always returns null, showing a false "link expired".
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setReady(true)
      }
    })

    // Fallback: if no event fires in 5s the link is genuinely expired/invalid
    const timeout = setTimeout(() => {
      setReady(prev => {
        if (!prev) setError('This reset link has expired or is invalid. Please request a new one.')
        return prev
      })
    }, 5000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    setError('')
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setSuccess(true)
      setTimeout(() => navigate('/game', { replace: true }), 1500)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update password.')
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = password && confirm && !loading

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        style={{
          background: '#fff', borderRadius: '28px', padding: '2.5rem 2rem',
          width: '100%', maxWidth: '400px', textAlign: 'center',
          boxShadow: '0 16px 56px rgba(0,0,0,0.14)',
        }}
      >
        {!ready && !error ? (
          <>
            <motion.p animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.4 }}
              style={{ color: '#6b7280', fontSize: '1rem', margin: 0 }}>
              Verifying link…
            </motion.p>
          </>
        ) : error && !ready ? (
          <>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>😕</div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1a1a1a', margin: '0 0 0.75rem', fontFamily: 'Calibri, system-ui, sans-serif' }}>
              Link expired
            </h1>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 1.5rem' }}>{error}</p>
            <Link to="/forgot-password" style={{
              display: 'inline-block', background: 'linear-gradient(135deg, #11998e, #38ef7d)',
              color: '#fff', fontWeight: 800, fontSize: '0.95rem',
              padding: '0.7rem 2rem', borderRadius: '999px', textDecoration: 'none',
            }}>
              Request new link
            </Link>
          </>
        ) : (
          <>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔒</div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1a1a1a', margin: '0 0 0.25rem', fontFamily: 'Calibri, system-ui, sans-serif' }}>
              Set new password
            </h1>
            <p style={{ color: '#9ca3af', fontSize: '0.9rem', margin: '0 0 2rem' }}>Choose something you'll remember</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  New password
                </label>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="At least 6 characters" required autoComplete="new-password"
                  style={{
                    width: '100%', boxSizing: 'border-box', border: '2px solid #e5e7eb',
                    borderRadius: '12px', padding: '0.7rem 1rem', fontSize: '1rem',
                    color: '#1a1a1a', outline: 'none', transition: 'border-color 0.2s',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#10b981')}
                  onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Confirm password
                </label>
                <input
                  type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                  placeholder="Same password again" required autoComplete="new-password"
                  style={{
                    width: '100%', boxSizing: 'border-box', border: '2px solid #e5e7eb',
                    borderRadius: '12px', padding: '0.7rem 1rem', fontSize: '1rem',
                    color: '#1a1a1a', outline: 'none', transition: 'border-color 0.2s',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#10b981')}
                  onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
                />
              </div>

              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ color: '#ef4444', fontSize: '0.85rem', margin: 0, fontWeight: 600 }}>
                  {error}
                </motion.p>
              )}

              {success && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ color: '#059669', fontSize: '0.85rem', margin: 0, fontWeight: 600, textAlign: 'center' }}>
                  ✅ Password updated! Taking you to the game…
                </motion.p>
              )}

              <button
                type="submit" disabled={!canSubmit}
                style={{
                  background: canSubmit ? 'linear-gradient(135deg, #11998e, #38ef7d)' : '#e5e7eb',
                  color: canSubmit ? '#fff' : '#9ca3af',
                  border: 'none', borderRadius: '999px', padding: '0.8rem',
                  fontSize: '1rem', fontWeight: 800, cursor: canSubmit ? 'pointer' : 'not-allowed',
                  boxShadow: canSubmit ? '0 4px 16px rgba(17,153,142,0.35)' : 'none',
                  transition: 'all 0.2s', marginTop: '0.25rem',
                }}
              >
                {loading ? 'Saving…' : 'Set new password'}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  )
}
