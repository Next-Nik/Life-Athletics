// Today.jsx — the day. Money Moves is hidden (never finalized), so until
// real practices are wired this is a clean empty state that points to
// Scout. The seed/engine code still lives in db.js / practiceModel.js;
// it's just not surfaced here.
import { Link } from 'react-router-dom'
import { tokens, sans, display, eyebrow, ASSETS } from '../lib/tokens'
import Wordmark from '../components/Wordmark'

export default function Today() {
  return (
    <div style={{ maxWidth: 472, margin: '0 auto', padding: '22px 22px 40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Wordmark font={16} />
        <div style={{ ...sans, fontWeight: 600, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: tokens.ink3 }}>Today</div>
      </div>

      <div style={{ textAlign: 'center', padding: '64px 8px 0' }}>
        <img src={ASSETS.mark} alt="" width={92} height={92} style={{ display: 'block', margin: '0 auto 22px', opacity: 0.9 }} />
        <div style={{ ...eyebrow, fontSize: 11, color: tokens.ink3 }}>Today</div>
        <h1 style={{ ...display, fontSize: 28, margin: '12px 0 0', lineHeight: 1.1, letterSpacing: '-0.01em' }}>No moves set yet.</h1>
        <p style={{ fontSize: 15, color: tokens.ink2, lineHeight: 1.55, maxWidth: 360, margin: '12px auto 0' }}>
          Scout your game first &mdash; see where every area stands. Your daily moves get built from there.
        </p>
        <Link to="/scout" style={{
          display: 'inline-block', marginTop: 24, padding: '13px 28px', ...sans,
          fontSize: 14, fontWeight: 600, letterSpacing: '0.02em', textDecoration: 'none',
          color: '#fff', background: tokens.blue, borderRadius: 980,
        }}>Scout your game</Link>
      </div>
    </div>
  )
}
