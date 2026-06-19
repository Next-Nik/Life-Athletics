// Nav.jsx — the two rooms, bottom rail.
import { NavLink } from 'react-router-dom'
import { tokens, mono } from '../lib/tokens'

const items = [
  { to: '/', label: 'Today', end: true },
  { to: '/scout', label: 'Scout', end: false },
]

export default function Nav() {
  return (
    <nav style={{
      position: 'sticky', bottom: 0, display: 'flex', justifyContent: 'center', gap: 8,
      padding: '10px 16px calc(10px + env(safe-area-inset-bottom))',
      borderTop: `1px solid ${tokens.line}`, background: 'rgba(8,10,14,0.85)', backdropFilter: 'blur(8px)',
    }}>
      {items.map(it => (
        <NavLink key={it.to} to={it.to} end={it.end} style={({ isActive }) => ({
          ...mono, fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
          textDecoration: 'none', padding: '8px 18px', borderRadius: 999,
          color: isActive ? tokens.bg : tokens.ink2,
          background: isActive ? tokens.cyan : 'transparent',
          border: `1px solid ${isActive ? tokens.cyan : tokens.line}`,
        })}>{it.label}</NavLink>
      ))}
    </nav>
  )
}
