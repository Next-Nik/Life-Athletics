// ─────────────────────────────────────────────────────────────
// App.jsx — the shell. White ground, the mark, the two rooms.
// Gates on the Supabase session (tables are RLS-scoped). Env not set →
// a plain white message instead of a crash, so the deploy still serves.
// ─────────────────────────────────────────────────────────────
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { tokens, sans, eyebrow } from './lib/tokens'
import { supabaseConfigured } from './lib/supabase'
import { useSession } from './hooks/useSession'
import Nav from './components/Nav'
import Wordmark from './components/Wordmark'
import Today from './pages/Today'
import Scout from './pages/Scout'
import Login from './pages/Login'

function Centered({ children }) {
  return (
    <div style={{
      minHeight: '100dvh', background: tokens.bg, color: tokens.ink, ...sans,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', textAlign: 'center',
    }}>
      <div style={{ maxWidth: 380 }}>{children}</div>
    </div>
  )
}

export default function App() {
  const { user, loading } = useSession()

  if (!supabaseConfigured) {
    return (
      <Centered>
        <Wordmark mark={false} font={15} />
        <p style={{ fontSize: 14.5, color: tokens.ink2, lineHeight: 1.55, marginTop: 18 }}>
          The stack is serving, but Supabase isn&rsquo;t wired yet. Set <b style={{ color: tokens.ink }}>VITE_SUPABASE_URL</b> and <b style={{ color: tokens.ink }}>VITE_SUPABASE_ANON_KEY</b> in Vercel, then redeploy.
        </p>
      </Centered>
    )
  }

  if (loading) {
    return <Centered><p style={{ color: tokens.ink3, fontSize: 15 }}>Lining you up&hellip;</p></Centered>
  }

  if (!user) return <Login />

  return (
    <BrowserRouter>
      <div style={{
        minHeight: '100dvh', background: tokens.bg, color: tokens.ink, ...sans,
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Today userId={user.id} />} />
            <Route path="/scout" element={<Scout userId={user.id} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <Nav />
      </div>
    </BrowserRouter>
  )
}
