// ─────────────────────────────────────────────────────────────
// RunRouter.jsx — one entry point for running a practice. Dispatches by
// run mode to the matching runner. Anything without a real runner is
// logged with a single tap on the day, so it never reaches here.
// (Breath is pulled for now; the timer handles both single blocks and
// work/rest rounds.)
// ─────────────────────────────────────────────────────────────
import PracticeRun from './PracticeRun'
import TimerRun from './TimerRun'
import ReframeRun from './ReframeRun'
import BreathBlock from './BreathBlock'
import { runnerKind } from '../lib/day'

export default function RunRouter({ practice, onLogged, onClose }) {
  const kind = runnerKind(practice)
  const props = { practice, onLogged, onClose }
  if (kind === 'breath')  return <BreathBlock {...props} />
  if (kind === 'steps')   return <PracticeRun {...props} />
  if (kind === 'timer')   return <TimerRun {...props} />
  if (kind === 'reframe') return <ReframeRun {...props} />
  return <PracticeRun {...props} />
}
