import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { signIn } from '../lib/auth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email.trim(), password)
      navigate('/game', { replace: true })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed — please try again.')
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
            Welcome back
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem', margin: 0 }}>Log in to your Fab Vocab account</p>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.35rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Password
              </label>
              <Link to="/forgot-password" style={{ fontSize: '0.78rem', color: '#0f9b58', fontWeight: 600, textDecoration: 'none' }}>
                Forgot password?
              </Link>
            </div>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" required autoComplete="current-password"
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
            type="submit" disabled={loading || !email || !password}
            style={{
              background: (loading || !email || !password) ? '#e5e7eb' : 'linear-gradient(135deg, #11998e, #38ef7d)',
              color: (loading || !email || !password) ? '#9ca3af' : '#fff',
              border: 'none', borderRadius: '999px', padding: '0.8rem',
              fontSize: '1rem', fontWeight: 800, cursor: (loading || !email || !password) ? 'not-allowed' : 'pointer',
              boxShadow: (loading || !email || !password) ? 'none' : '0 4px 16px rgba(17,153,142,0.35)',
              transition: 'all 0.2s', marginTop: '0.25rem',
            }}
          >
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem', margin: '1.5rem 0 0' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: '#0f9b58', fontWeight: 700, textDecoration: 'none' }}>
            Sign up free
          </Link>
        </p>
      </motion.div>

      <Link to="/" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginTop: '1.5rem', textDecoration: 'none', fontWeight: 600 }}>
        ← Back to home
      </Link>
    </div>
  )
}
