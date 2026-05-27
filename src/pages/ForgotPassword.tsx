import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: 'https://fabvocab.co/auth/reset',
      })
      if (error) throw error
      setSent(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong — please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '2rem',
    }}>
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            style={{
              background: '#fff', borderRadius: '28px', padding: '2.5rem 2rem',
              width: '100%', maxWidth: '400px', textAlign: 'center',
              boxShadow: '0 16px 56px rgba(0,0,0,0.14)',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📬</div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1a1a1a', margin: '0 0 0.75rem', fontFamily: 'Calibri, system-ui, sans-serif' }}>
              Check your email
            </h1>
            <p style={{ color: '#6b7280', fontSize: '0.95rem', lineHeight: 1.6, margin: '0 0 0.5rem' }}>
              We sent a password reset link to
            </p>
            <p style={{ color: '#0f9b58', fontWeight: 700, fontSize: '0.95rem', margin: '0 0 1.5rem', wordBreak: 'break-all' }}>
              {email}
            </p>
            <p style={{ color: '#9ca3af', fontSize: '0.85rem', lineHeight: 1.55, margin: '0 0 1.5rem' }}>
              Click the link in the email to set a new password.
            </p>
            <Link to="/login" style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #11998e, #38ef7d)',
              color: '#fff', fontWeight: 800, fontSize: '0.95rem',
              padding: '0.7rem 2rem', borderRadius: '999px', textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(17,153,142,0.35)',
            }}>
              Back to log in
            </Link>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            style={{
              background: '#fff', borderRadius: '28px', padding: '2.5rem 2rem',
              width: '100%', maxWidth: '400px',
              boxShadow: '0 16px 56px rgba(0,0,0,0.14)',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔑</div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1a1a1a', margin: '0 0 0.25rem', fontFamily: 'Calibri, system-ui, sans-serif' }}>
                Forgot password?
              </h1>
              <p style={{ color: '#9ca3af', fontSize: '0.9rem', margin: 0 }}>
                Enter your email and we'll send a reset link
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Email
                </label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" required autoComplete="email"
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

              <button
                type="submit" disabled={!email || loading}
                style={{
                  background: (email && !loading) ? 'linear-gradient(135deg, #11998e, #38ef7d)' : '#e5e7eb',
                  color: (email && !loading) ? '#fff' : '#9ca3af',
                  border: 'none', borderRadius: '999px', padding: '0.8rem',
                  fontSize: '1rem', fontWeight: 800, cursor: (email && !loading) ? 'pointer' : 'not-allowed',
                  boxShadow: (email && !loading) ? '0 4px 16px rgba(17,153,142,0.35)' : 'none',
                  transition: 'all 0.2s', marginTop: '0.25rem',
                }}
              >
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>

            <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem', margin: '1.5rem 0 0' }}>
              Remember it?{' '}
              <Link to="/login" style={{ color: '#0f9b58', fontWeight: 700, textDecoration: 'none' }}>
                Log in
              </Link>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <Link to="/" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginTop: '1.5rem', textDecoration: 'none', fontWeight: 600 }}>
        ← Back to home
      </Link>
    </div>
  )
}
