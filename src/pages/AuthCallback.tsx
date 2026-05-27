import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState('')

  useEffect(() => {
    // Supabase puts the session tokens in the URL hash after email confirmation.
    // getSession() automatically reads and exchanges them.
    supabase.auth.getSession().then(({ data, error }) => {
      if (error || !data.session) {
        setError('This confirmation link has expired or is invalid. Please sign up again.')
        return
      }
      // Small delay so the user sees the success message
      setTimeout(() => navigate('/game', { replace: true }), 1500)
    })
  }, [navigate])

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
          width: '100%', maxWidth: '380px', textAlign: 'center',
          boxShadow: '0 16px 56px rgba(0,0,0,0.14)',
        }}
      >
        {error ? (
          <>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>😕</div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1a1a1a', margin: '0 0 0.75rem', fontFamily: 'Calibri, system-ui, sans-serif' }}>
              Link expired
            </h1>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 1.5rem' }}>{error}</p>
            <Link to="/signup" style={{
              display: 'inline-block', background: 'linear-gradient(135deg, #11998e, #38ef7d)',
              color: '#fff', fontWeight: 800, fontSize: '0.95rem',
              padding: '0.7rem 2rem', borderRadius: '999px', textDecoration: 'none',
            }}>
              Try again
            </Link>
          </>
        ) : (
          <>
            <motion.div
              animate={{ rotate: [0, 10, -10, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
              style={{ fontSize: '3rem', marginBottom: '1rem', display: 'inline-block' }}
            >
              ✉️
            </motion.div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1a1a1a', margin: '0 0 0.5rem', fontFamily: 'Calibri, system-ui, sans-serif' }}>
              Email confirmed!
            </h1>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>Taking you to the game…</p>
          </>
        )}
      </motion.div>
    </div>
  )
}
