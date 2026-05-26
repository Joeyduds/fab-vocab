import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import Game from './pages/Game'
import Dashboard from './pages/Dashboard'
import PinGate from './components/PinGate'

function Nav() {
  const loc = useLocation()
  const isDash = loc.pathname === '/dashboard'

  return (
    <nav style={{
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem 2rem',
      background: 'rgba(255,255,255,0.18)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.3)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '1.4rem' }}>✏️</span>
        <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.15)', fontFamily: 'Calibri, system-ui, sans-serif' }}>
          Fab Vocab
        </span>
      </Link>
      <Link
        to={isDash ? '/' : '/dashboard'}
        style={{
          textDecoration: 'none',
          background: 'rgba(255,255,255,0.9)',
          borderRadius: '999px',
          padding: '0.45rem 1.2rem',
          fontSize: '0.85rem',
          color: '#0f9b58',
          fontWeight: 700,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          transition: 'all 0.2s',
        }}
      >
        {isDash ? '← Play Game' : 'Parent Dashboard →'}
      </Link>
    </nav>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', backgroundAttachment: 'fixed' }}>
        <Nav />
        <main>
          <Routes>
            <Route path="/" element={<Game />} />
            <Route path="/dashboard" element={<PinGate><Dashboard /></PinGate>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
