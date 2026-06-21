// ─────────────────────────────────────────────────────────────
// App.jsx — the shell. Warm ground, the mark, three rooms.
// Gates on the Supabase session: no session → the Login screen
// (Google · email · guest). Signed in → straight into the rooms, no
// onboarding gate. Env not set → a plain message instead of a crash,
// so the deploy still serves.
// ─────────────────────────────────────────────────────────────
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { tokens, sans } from './lib/tokens'
import { supabaseConfigured } from './lib/supabase'
import { useSession } from './hooks/useSession'
import { useGame } from './hooks/useGame'
import Nav from './components/Nav'
import Wordmark from './components/Wordmark'
import Login from './pages/Login'
import AuthCallback from './pages/AuthCallback'
import Today from './pages/Today'
import Scout from './pages/Scout'
import Progress from './pages/Progress'

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

function Authed({ userId }) {
  // No onboarding gate — after auth you land straight in the app.
  // (useGame still runs so the time-ladder state exists.)
  const { loading } = useGame(userId)

  if (loading) {
    return <Centered><p style={{ color: tokens.ink3, fontSize: 15 }}>Lining you up&hellip;</p></Centered>
  }

  return (
    <BrowserRouter>
      <div style={{ minHeight: '100dvh', background: tokens.bg, color: tokens.ink, ...sans, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Today userId={userId} />} />
            <Route path="/scout" element={<Scout userId={userId} />} />
            <Route path="/progress" element={<Progress userId={userId} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <Nav />
      </div>
    </BrowserRouter>
  )
}

export default function App() {
  const { user, loading, authError } = useSession()

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
  if (typeof window !== 'undefined' && window.location.pathname === '/auth/callback') {
    return <AuthCallback />
  }
  if (loading) {
    return <Centered><p style={{ color: tokens.ink3, fontSize: 15 }}>Lining you up&hellip;</p></Centered>
  }
  if (authError) {
    return (
      <Centered>
        <Wordmark mark={false} font={15} />
        <p style={{ fontSize: 14.5, color: tokens.ink2, lineHeight: 1.55, marginTop: 18 }}>
          Couldn&rsquo;t start a session. Turn on <b style={{ color: tokens.ink }}>Anonymous sign-ins</b> in Supabase under Authentication → Providers, then refresh.
        </p>
        <p style={{ fontSize: 12.5, color: tokens.ink3, marginTop: 12 }}>{authError}</p>
      </Centered>
    )
  }
  if (!user) {
    return <Login />
  }

  return <Authed userId={user.id} />
}
