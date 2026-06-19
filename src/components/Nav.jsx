// Nav.jsx — the two rooms, bottom rail. White, blurred, hairline top.
import { NavLink } from 'react-router-dom'
import { tokens, sans } from '../lib/tokens'

const items = [
  { to: '/', label: 'Today', end: true },
  { to: '/scout', label: 'Scout', end: false },
]

export default function Nav() {
  return (
    <nav style={{
      position: 'sticky', bottom: 0, display: 'flex', justifyContent: 'center', gap: 8,
      padding: '10px 16px calc(10px + env(safe-area-inset-bottom))',
      borderTop: `1px solid ${tokens.lineSoft}`, background: 'rgba(255,255,255,0.8)',
      backdropFilter: 'saturate(180%) blur(20px)', WebkitBackdropFilter: 'saturate(180%) blur(20px)',
    }}>
      {items.map(it => (
        <NavLink key={it.to} to={it.to} end={it.end} style={({ isActive }) => ({
          ...sans, fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
          textDecoration: 'none', padding: '8px 18px', borderRadius: 999,
          color: isActive ? '#fff' : tokens.ink2,
          background: isActive ? tokens.blue : 'transparent',
          border: `1px solid ${isActive ? tokens.blue : tokens.line}`,
        })}>{it.label}</NavLink>
      ))}
    </nav>
  )
}
