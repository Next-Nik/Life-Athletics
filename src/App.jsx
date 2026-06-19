// ─────────────────────────────────────────────────────────────
// App.jsx — the shell.
//
// Gates on the Supabase session, because the tables are RLS-scoped: no
// session, nothing to read. Configured-but-signed-out → Login. Signed
// in → the two rooms (Today, Scout) under the bottom nav. Env not set
// yet → a plain message instead of a crash, so the deploy still serves.
// ─────────────────────────────────────────────────────────────
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { tokens, serif, mono } from './lib/tokens'
import { supabaseConfigured } from './lib/supabase'
import { useSession } from './hooks/useSession'
import Nav from './components/Nav'
import Today from './pages/Today'
import Scout from './pages/Scout'
import Login from './pages/Login'

function Centered({ children }) {
  return (
    <div style={{
      minHeight: '100dvh', background: tokens.bg, color: tokens.ink, fontFamily: serif.fontFamily,
      backgroundImage: `radial-gradient(120% 70% at 50% 4%, ${tokens.glow}, transparent 56%)`,
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
        <div style={{ ...mono, fontSize: 14, fontWeight: 700, letterSpacing: '0.26em', textTransform: 'uppercase' }}>LIFE <b style={{ color: tokens.cyan }}>ATHLETICS</b></div>
        <p style={{ fontSize: 14.5, color: tokens.ink2, lineHeight: 1.55, marginTop: 18 }}>
          The stack is serving, but Supabase isn&rsquo;t wired yet. Set <b style={{ color: tokens.ink }}>VITE_SUPABASE_URL</b> and <b style={{ color: tokens.ink }}>VITE_SUPABASE_ANON_KEY</b> in Vercel, then redeploy.
        </p>
      </Centered>
    )
  }

  if (loading) {
    return <Centered><p style={{ ...serif, color: tokens.ink3, fontSize: 15 }}>Finding your place&hellip;</p></Centered>
  }

  if (!user) return <Login />

  return (
    <BrowserRouter>
      <div style={{
        minHeight: '100dvh', background: tokens.bg, color: tokens.ink, fontFamily: serif.fontFamily,
        WebkitFontSmoothing: 'antialiased', display: 'flex', flexDirection: 'column',
        backgroundImage: `radial-gradient(120% 60% at 50% 2%, ${tokens.glow}, transparent 56%)`,
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
