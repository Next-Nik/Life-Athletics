// Wordmark.jsx — the lockup: a small ring glyph + "Life Athletics" set in
// the serif. The ring is the instrument's hero shape; the brass dot is the
// figure on it. Used in every header.
import { tokens, serif } from '../lib/tokens'

export default function Wordmark({ size = 26, font = 19, mark = true }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {mark && (
        <span style={{
          position: 'relative', flex: '0 0 auto',
          width: size, height: size, borderRadius: '50%',
          border: `1.5px solid ${tokens.ink}`,
          boxShadow: `0 0 0 4px ${tokens.skySoft}`,
        }}>
          <span style={{ position: 'absolute', left: '50%', top: size * 0.15, width: 1.5, height: size * 0.42, background: tokens.ink, transform: 'translateX(-50%)', borderRadius: 2 }} />
          <span style={{ position: 'absolute', left: '50%', top: size * 0.13, width: size * 0.24, height: size * 0.24, borderRadius: '50%', background: tokens.sun, transform: 'translateX(-50%)' }} />
        </span>
      )}
      <span style={{ ...serif, fontWeight: 500, fontSize: font, letterSpacing: '-0.01em', lineHeight: 1, color: tokens.ink }}>
        Life <em style={{ fontStyle: 'italic', color: tokens.ink2, fontWeight: 400 }}>Athletics</em>
      </span>
    </div>
  )
}
