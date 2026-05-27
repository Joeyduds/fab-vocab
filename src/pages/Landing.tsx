import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'

const steps = [
  {
    emoji: '📝',
    title: 'Parent adds words',
    desc: 'Pull misspellings straight from your child\'s homework or spelling tests and add them to the game.',
  },
  {
    emoji: '🎮',
    title: 'Kid plays and learns',
    desc: 'The game shows the misspelled word in context. Your child types the correct spelling — two chances per word.',
  },
  {
    emoji: '🎟️',
    title: 'Earn tokens, win prizes',
    desc: 'Every 35 correct answers earns a token. You decide what each token is worth — screen time, treats, outings.',
  },
]

export default function Landing() {
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate('/game', { replace: true })
    })
  }, [navigate])

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}>

      {/* Nav */}
      <nav style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1rem 2rem', boxSizing: 'border-box',
        background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.25)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.4rem' }}>✏️</span>
          <span style={{ fontWeight: 900, fontSize: '1.2rem', color: '#fff', fontFamily: 'Calibri, system-ui, sans-serif', letterSpacing: '-0.01em' }}>
            Fab Vocab
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/login" style={{
            textDecoration: 'none', color: '#fff', fontWeight: 700,
            fontSize: '0.9rem', padding: '0.45rem 1.1rem',
            borderRadius: '999px', border: '1.5px solid rgba(255,255,255,0.6)',
            transition: 'all 0.2s',
          }}>
            Log in
          </Link>
          <Link to="/signup" style={{
            textDecoration: 'none', background: '#fff', color: '#0f9b58',
            fontWeight: 800, fontSize: '0.9rem', padding: '0.45rem 1.25rem',
            borderRadius: '999px', boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            transition: 'all 0.2s',
          }}>
            Sign up free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '5rem 2rem 3rem', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✏️</div>
          <h1 style={{
            fontSize: 'clamp(2.4rem, 6vw, 3.5rem)', fontWeight: 900, color: '#fff',
            margin: '0 0 1rem', lineHeight: 1.1, fontFamily: 'Calibri, system-ui, sans-serif',
            textShadow: '0 2px 16px rgba(0,0,0,0.12)',
          }}>
            Spelling practice<br />that actually works
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.85)', fontSize: '1.2rem', maxWidth: '520px',
            margin: '0 auto 2.5rem', lineHeight: 1.6, fontFamily: 'Calibri, system-ui, sans-serif',
          }}>
            Add your child's real misspellings, and Fab Vocab turns them into a fun, rewarding game — with tokens they can redeem for prizes.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup" style={{
              textDecoration: 'none', background: '#fff', color: '#0f9b58',
              fontWeight: 900, fontSize: '1.1rem', padding: '0.85rem 2.25rem',
              borderRadius: '999px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}>
              Create a free account →
            </Link>
            <Link to="/login" style={{
              textDecoration: 'none', color: '#fff',
              fontWeight: 700, fontSize: '1rem', padding: '0.85rem 2rem',
              borderRadius: '999px', border: '2px solid rgba(255,255,255,0.5)',
              transition: 'border-color 0.2s',
            }}>
              I already have an account
            </Link>
          </div>
        </motion.div>
      </div>

      {/* How it works */}
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '2rem 2rem 5rem' }}>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem',
            fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em',
            marginBottom: '1.5rem',
          }}
        >
          How it works
        </motion.h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.1 }}
              style={{
                background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)', borderRadius: '20px',
                padding: '1.5rem', textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{step.emoji}</div>
              <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '1rem', margin: '0 0 0.5rem', fontFamily: 'Calibri, system-ui, sans-serif' }}>
                {step.title}
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: '0.85rem', lineHeight: 1.55, margin: 0, fontFamily: 'Calibri, system-ui, sans-serif' }}>
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
