import { useState } from 'react'
import { motion } from 'framer-motion'

const CORRECT_PIN = import.meta.env.VITE_DASHBOARD_PIN ?? '1234'
const SESSION_KEY = 'dashboard_unlocked'

export default function PinGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(SESSION_KEY) === 'true')
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)

  function handleDigit(d: string) {
    if (pin.length >= 4) return
    const next = pin + d
    setPin(next)
    setError(false)
    if (next.length === 4) {
      if (next === CORRECT_PIN) {
        sessionStorage.setItem(SESSION_KEY, 'true')
        setUnlocked(true)
      } else {
        setShake(true)
        setError(true)
        setTimeout(() => { setPin(''); setShake(false) }, 600)
      }
    }
  }

  function handleClear() {
    setPin('')
    setError(false)
  }

  if (unlocked) return <>{children}</>

  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem', padding: '2rem' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔒</div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', margin: 0, textShadow: '0 2px 8px rgba(0,0,0,0.15)', fontFamily: 'Calibri, system-ui, sans-serif' }}>
          Parent Dashboard
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', margin: '0.4rem 0 0', fontSize: '1rem', fontFamily: 'Calibri, system-ui, sans-serif' }}>
          Enter your 4-digit PIN to continue
        </p>
      </div>

      {/* PIN dots */}
      <motion.div
        animate={shake ? { x: [-8, 8, -8, 8, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
        style={{ display: 'flex', gap: '1rem' }}
      >
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{
            width: '18px', height: '18px', borderRadius: '50%',
            background: pin.length > i
              ? (error ? '#ef4444' : '#fff')
              : 'rgba(255,255,255,0.3)',
            border: '2px solid rgba(255,255,255,0.6)',
            transition: 'background 0.15s',
          }} />
        ))}
      </motion.div>

      {error && (
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ color: '#fecaca', fontWeight: 700, margin: '-1rem 0 0', fontSize: '0.9rem', fontFamily: 'Calibri, system-ui, sans-serif' }}
        >
          Incorrect PIN — try again
        </motion.p>
      )}

      {/* Number pad */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
        {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((d, i) => (
          <button
            key={i}
            onClick={() => d === '⌫' ? handleClear() : d !== '' ? handleDigit(d) : undefined}
            disabled={d === ''}
            style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: d === '' ? 'transparent' : 'rgba(255,255,255,0.2)',
              border: d === '' ? 'none' : '1px solid rgba(255,255,255,0.35)',
              color: '#fff', fontSize: d === '⌫' ? '1.3rem' : '1.5rem',
              fontWeight: 700, cursor: d === '' ? 'default' : 'pointer',
              fontFamily: 'Calibri, system-ui, sans-serif',
              backdropFilter: 'blur(8px)',
              transition: 'background 0.15s',
              boxShadow: d !== '' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
            }}
            onMouseEnter={e => { if (d !== '') e.currentTarget.style.background = 'rgba(255,255,255,0.35)' }}
            onMouseLeave={e => { if (d !== '') e.currentTarget.style.background = 'rgba(255,255,255,0.2)' }}
          >
            {d}
          </button>
        ))}
      </div>
    </div>
  )
}
