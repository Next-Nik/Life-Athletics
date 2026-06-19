// Wordmark.jsx — the lockup: the mark + LIFE·ATHLETICS, used in every header.
import { tokens, sans, ASSETS } from '../lib/tokens'

export default function Wordmark({ size = 28, font = 16, mark = true }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
      {mark && <img src={ASSETS.mark} alt="" width={size} height={size} style={{ display: 'block' }} />}
      <span style={{ ...sans, fontWeight: 700, fontSize: font, letterSpacing: '0.13em' }}>
        <span style={{ color: tokens.ink }}>LIFE</span>
        <span style={{ color: tokens.blue }}>ATHLETICS</span>
      </span>
    </div>
  )
}
