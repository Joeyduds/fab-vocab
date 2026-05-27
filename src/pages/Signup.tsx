import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { signUp, signIn } from '../lib/auth'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Passwords don\'t match.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    try {
      await signUp(email.trim(), password)
      // Auto sign-in after signup
      await signIn(email.trim(), password)
      navigate('/game', { replace: true })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Signup failed — please try again.')
    } finally {
      setLoading(false)
    }
  }

  const ready = email && password && confirm && !loading

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '2rem',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        style={{
          background: '#fff', borderRadius: '28px', padding: '2.5rem 2rem',
          width: '100%', maxWidth: '400px',
          boxShadow: '0 16px 56px rgba(0,0,0,0.14)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✏️</div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1a1a1a', margin: '0 0 0.25rem', fontFamily: 'Calibri, system-ui, sans-serif' }}>
            Create your account
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem', margin: 0 }}>Free forever · No credit card needed</p>
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

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Password
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
              placeholder="••••••••" required autoComplete="new-password"
              style={{
                width: '100%', boxSizing: 'border-box',
                border: `2px solid ${confirm && password && confirm !== password ? '#fca5a5' : '#e5e7eb'}`,
                borderRadius: '12px', padding: '0.7rem 1rem', fontSize: '1rem',
                color: '#1a1a1a', outline: 'none', transition: 'border-color 0.2s',
              }}
              onFocus={e => (e.target.style.borderColor = confirm !== password ? '#fca5a5' : '#10b981')}
              onBlur={e => (e.target.style.borderColor = confirm && password && confirm !== password ? '#fca5a5' : '#e5e7eb')}
            />
          </div>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ color: '#ef4444', fontSize: '0.85rem', margin: 0, fontWeight: 600 }}>
              {error}
            </motion.p>
          )}

          <button
            type="submit" disabled={!ready}
            style={{
              background: ready ? 'linear-gradient(135deg, #11998e, #38ef7d)' : '#e5e7eb',
              color: ready ? '#fff' : '#9ca3af',
              border: 'none', borderRadius: '999px', padding: '0.8rem',
              fontSize: '1rem', fontWeight: 800, cursor: ready ? 'pointer' : 'not-allowed',
              boxShadow: ready ? '0 4px 16px rgba(17,153,142,0.35)' : 'none',
              transition: 'all 0.2s', marginTop: '0.25rem',
            }}
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem', margin: '1.5rem 0 0' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#0f9b58', fontWeight: 700, textDecoration: 'none' }}>
            Log in
          </Link>
        </p>
      </motion.div>

      <Link to="/" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginTop: '1.5rem', textDecoration: 'none', fontWeight: 600 }}>
        ← Back to home
      </Link>
    </div>
  )
}
