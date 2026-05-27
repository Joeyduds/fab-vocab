import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import { signOut } from './lib/auth'
import Game from './pages/Game'
import Dashboard from './pages/Dashboard'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import AuthCallback from './pages/AuthCallback'
import AuthGuard from './components/AuthGuard'

function Nav() {
  const loc = useLocation()
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const isDash = loc.pathname === '/dashboard'
  const isApp = loc.pathname === '/game' || loc.pathname === '/dashboard'

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Don't show app nav on public pages
  if (!isApp) return null

  async function handleSignOut() {
    await signOut()
    navigate('/', { replace: true })
  }

  return (
    <nav style={{
      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '1rem 2rem', boxSizing: 'border-box',
      background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.3)',
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      <Link to="/game" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '1.4rem' }}>✏️</span>
        <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.15)', fontFamily: 'Calibri, system-ui, sans-serif' }}>
          Fab Vocab
        </span>
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        {user && (
          <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.78rem', fontWeight: 500, maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.email}
          </span>
        )}
        <Link
          to={isDash ? '/game' : '/dashboard'}
          style={{
            textDecoration: 'none', background: 'rgba(255,255,255,0.9)',
            borderRadius: '999px', padding: '0.45rem 1.2rem',
            fontSize: '0.85rem', color: '#0f9b58', fontWeight: 700,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)', transition: 'all 0.2s',
          }}
        >
          {isDash ? '← Play Game' : 'Parent Dashboard →'}
        </Link>
        <button
          onClick={handleSignOut}
          style={{
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.35)',
            borderRadius: '999px', padding: '0.45rem 1rem',
            fontSize: '0.8rem', color: 'rgba(255,255,255,0.85)', fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
        >
          Log out
        </button>
      </div>
    </nav>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes — no app chrome */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Protected routes — with nav */}
        <Route path="/game" element={
          <AuthGuard>
            <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', backgroundAttachment: 'fixed' }}>
              <Nav />
              <main><Game /></main>
            </div>
          </AuthGuard>
        } />
        <Route path="/dashboard" element={
          <AuthGuard>
            <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', backgroundAttachment: 'fixed' }}>
              <Nav />
              <main><Dashboard /></main>
            </div>
          </AuthGuard>
        } />
      </Routes>
    </BrowserRouter>
  )
}
