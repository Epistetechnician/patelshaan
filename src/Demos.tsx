import { useEffect, useMemo, useState } from 'react'
import { NetSwap } from './NetSwap'

function Frame({ title, children, note }: { title: string; children: React.ReactNode; note: string }) {
  return (
    <figure className="ef demo">
      <h4>
        <span className="demo-tag">live</span> {title}
      </h4>
      {children}
      <figcaption>{note}</figcaption>
    </figure>
  )
}

/* ---------- AHCL: matched progress ---------- */
function MatchedProgress() {
  const [speed, setSpeed] = useState(0.6)
  const [harmRate, setHarmRate] = useState(1)
  const [mode, setMode] = useState<'end' | 'matched'>('end')
  const T = 3
  const refEnd = T
  const candEnd = T * speed
  const harm = (g: number, k: number) => k * g * (1 + 0.08 * g)
  const W = 520
  const H = 200
  const x = (g: number) => 30 + (g / T) * (W - 50)
  const y = (h: number) => H - 25 - (h / (T * 1.5)) * (H - 45)
  const path = (k: number, to: number) =>
    Array.from({ length: 41 }, (_, i) => {
      const g = (to * i) / 40
      return `${i ? 'L' : 'M'}${x(g).toFixed(1)},${y(harm(g, k)).toFixed(1)}`
    }).join(' ')
  const matchAt = Math.min(refEnd, candEnd)
  const hRefEnd = harm(refEnd, 1)
  const hCandEnd = harm(candEnd, harmRate)
  const hRefM = harm(matchAt, 1)
  const hCandM = harm(matchAt, harmRate)
  const diffEnd = ((hCandEnd - hRefEnd) / hRefEnd) * 100
  const diffM = ((hCandM - hRefM) / hRefM) * 100
  const verdict =
    mode === 'end'
      ? `At end of training the candidate has ${Math.abs(diffEnd).toFixed(0)}% ${diffEnd < 0 ? 'less' : 'more'} harm.`
      : Math.abs(diffM) < 0.5
        ? 'At matched progress: a tie.'
        : `At matched progress the candidate has ${Math.abs(diffM).toFixed(0)}% ${diffM < 0 ? 'less' : 'more'} harm.`
  return (
    <Frame
      title="Why matched progress matters"
      note="An illustration, not repository data: harm is modeled as growing with how much a method has learned. At the defaults the candidate has the same harm per unit of learning, and only learns less."
    >
      <div className="demo-ctl">
        <label>
          candidate learns at {speed.toFixed(2)}× the reference
          <input type="range" min={0.3} max={1} step={0.05} value={speed} onChange={(e) => setSpeed(+e.target.value)} />
        </label>
        <label>
          candidate harm per unit learned: {harmRate.toFixed(2)}×
          <input type="range" min={0.7} max={1.3} step={0.05} value={harmRate} onChange={(e) => setHarmRate(+e.target.value)} />
        </label>
        <div className="demo-tabs">
          <button type="button" aria-pressed={mode === 'end'} onClick={() => setMode('end')}>compare at end of training</button>
          <button type="button" aria-pressed={mode === 'matched'} onClick={() => setMode('matched')}>compare at matched progress</button>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="demo-svg" role="img" aria-label="Harm against cumulative learning for reference and candidate">
        <line x1="30" y1={H - 25} x2={W - 20} y2={H - 25} stroke="currentColor" opacity=".3" />
        <path d={path(1, refEnd)} fill="none" stroke="#9cb0aa" strokeWidth="2" />
        <path d={path(harmRate, candEnd)} fill="none" stroke="#e9b36b" strokeWidth="2" />
        {mode === 'end' ? (
          <>
            <circle cx={x(refEnd)} cy={y(hRefEnd)} r="5" fill="#9cb0aa" />
            <circle cx={x(candEnd)} cy={y(hCandEnd)} r="5" fill="#e9b36b" />
          </>
        ) : (
          <>
            <line x1={x(matchAt)} y1="10" x2={x(matchAt)} y2={H - 25} stroke="#3fa593" strokeDasharray="4 3" />
            <circle cx={x(matchAt)} cy={y(hRefM)} r="5" fill="#9cb0aa" />
            <circle cx={x(matchAt)} cy={y(hCandM)} r="5" fill="#e9b36b" />
          </>
        )}
        <text x={W - 20} y={H - 8} textAnchor="end" fontSize="11" fill="currentColor" opacity=".6">cumulative gain →</text>
        <text x="32" y="16" fontSize="11" fill="currentColor" opacity=".6">harm ↑</text>
        <text x={x(refEnd) - 4} y={y(hRefEnd) - 10} textAnchor="end" fontSize="11" fill="#9cb0aa">reference</text>
        <text x={x(candEnd) - 4} y={y(hCandEnd) + 18} textAnchor="end" fontSize="11" fill="#e9b36b">candidate</text>
      </svg>
      <p className="demo-verdict">{verdict}</p>
    </Frame>
  )
}

/* ---------- Theseus: permutation symmetry ---------- */
function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296 - 0.5
  }
}

function PermutationLab() {
  const [seed, setSeed] = useState(7)
  const [k, setK] = useState(2)
  const res = useMemo(() => {
    const r = rng(seed * 9973 + 11)
    const D = 4, Hn = 8, O = 3
    const W1 = Array.from({ length: Hn }, () => Array.from({ length: D }, () => r() * 2))
    const b1 = Array.from({ length: Hn }, () => r())
    const W2 = Array.from({ length: O }, () => Array.from({ length: Hn }, () => r() * 2))
    // seeded Fisher-Yates
    const perm = Array.from({ length: Hn }, (_, i) => i)
    const rp = rng(seed * 31 + 5)
    for (let i = Hn - 1; i > 0; i--) {
      const j = Math.floor((rp() + 0.5) * (i + 1))
      ;[perm[i], perm[j]] = [perm[j], perm[i]]
    }
    // permuted net: hidden unit p of new net = hidden unit perm[p] of old
    const W1p = perm.map((o) => W1[o])
    const b1p = perm.map((o) => b1[o])
    const W2p = W2.map((row) => perm.map((o) => row[o]))
    const fwd = (A: number[][], b: number[], B: number[][], x: number[], mask = -1) => {
      const h = A.map((row, i) => (i === mask ? 0 : Math.max(0, row.reduce((s, w, j) => s + w * x[j], b[i]))))
      return B.map((row) => row.reduce((s, w, i) => s + w * h[i], 0))
    }
    const rx = rng(seed + 101)
    const xs = Array.from({ length: 64 }, () => Array.from({ length: D }, () => rx() * 4))
    let maxDiff = 0
    for (const x of xs) {
      const a = fwd(W1, b1, W2, x)
      const b = fwd(W1p, b1p, W2p, x)
      a.forEach((v, i) => (maxDiff = Math.max(maxDiff, Math.abs(v - b[i]))))
    }
    const effect = (A: number[][], bb: number[], B: number[][], idx: number) =>
      xs.flatMap((x) => {
        const base = fwd(A, bb, B, x)
        const abl = fwd(A, bb, B, x, idx)
        return base.map((v, i) => abl[i] - v)
      })
    const cos = (u: number[], v: number[]) => {
      const d = u.reduce((s, a, i) => s + a * v[i], 0)
      const n = Math.hypot(...u) * Math.hypot(...v)
      return n === 0 ? 1 : d / n
    }
    const orig = effect(W1, b1, W2, k)
    const sameLabel = effect(W1p, b1p, W2p, k)
    const mapped = effect(W1p, b1p, W2p, perm.indexOf(k))
    return { perm, maxDiff, cosSame: cos(orig, sameLabel), cosMapped: cos(orig, mapped), moved: perm.filter((o, i) => o !== i).length, Hn }
  }, [seed, k])
  return (
    <Frame
      title="Same function, different labels"
      note="A tiny ReLU network computed in your browser. The permutation reorders hidden units and leaves the function unchanged, the same principle as the GPT-2 result (100% of selected positions changed, mean relative logit error 3e-7). This is a toy, not the repository's code."
    >
      <div className="demo-ctl">
        <button type="button" onClick={() => setSeed((s) => s + 1)}>New random network and permutation</button>
        <label>
          ablate hidden unit #{k}
          <input type="range" min={0} max={res.Hn - 1} step={1} value={k} onChange={(e) => setK(+e.target.value)} />
        </label>
      </div>
      <div className="demo-perm" aria-label="Permutation of hidden units">
        {res.perm.map((o, i) => (
          <span key={i} className={o === k ? 'sel' : ''}>
            <small>new {i}</small>
            <b>old {o}</b>
          </span>
        ))}
      </div>
      <div className="ef-compare">
        <div className="good">
          <strong>{res.maxDiff.toExponential(1)}</strong>
          <span>largest output difference across 64 inputs, original vs permuted</span>
        </div>
        <div className="bad">
          <strong>{res.cosSame.toFixed(3)}</strong>
          <span>cosine of ablation effects, same label #{k} in both networks</span>
        </div>
        <div className="good">
          <strong>{res.cosMapped.toFixed(7)}</strong>
          <span>cosine, inverse-mapped unit (#{res.perm.indexOf(k)} in the permuted network)</span>
        </div>
      </div>
    </Frame>
  )
}

/* ---------- SAO: the gate ---------- */
const GATES = ['Exact-subject evidence', 'Deterministic admission', 'Single-use capability', 'Separate broker', 'Sandboxed operation'] as const

function GateLoop() {
  const [ok, setOk] = useState<boolean[]>([true, true, true, true, true])
  const [used, setUsed] = useState(false)
  const [log, setLog] = useState<string[]>([])
  const fail = ok.findIndex((v) => !v)
  const attempt = () => {
    if (fail >= 0) {
      setLog((l) => [`FROZEN at “${GATES[fail]}”. Nothing ran.`, ...l].slice(0, 5))
      return
    }
    if (used) {
      setLog((l) => ['REJECTED: capability already consumed (replay).', ...l].slice(0, 5))
      return
    }
    setUsed(true)
    setLog((l) => ['EXECUTED once. Receipt signed and journaled.', ...l].slice(0, 5))
  }
  return (
    <Frame
      title="Try to act without earning it"
      note="An illustration of the loop's fail-closed design, not the Rust code running. Break any gate and the proposal freezes there; spend the capability once and a replay is rejected."
    >
      <ol className="ef-flow demo-gates">
        {GATES.map((g, i) => {
          const blocked = fail >= 0 && i > fail
          const bad = fail === i
          return (
            <li key={g} className={bad ? 'bad' : blocked ? 'skip' : 'ok'}>
              <label>
                <input
                  type="checkbox"
                  checked={ok[i]}
                  onChange={(e) => setOk(ok.map((v, j) => (j === i ? e.target.checked : v)))}
                />{' '}
                {g}
              </label>
            </li>
          )
        })}
      </ol>
      <div className="demo-ctl">
        <button type="button" onClick={attempt}>Submit proposal</button>
        <button type="button" onClick={() => { setUsed(false); setLog([]) }}>Reset</button>
      </div>
      <pre className="demo-log">{log.length ? log.join('\n') : 'No attempts yet.'}</pre>
    </Frame>
  )
}

/* ---------- Composed ZK: mutation vs the oracle ---------- */
type Step = { from: string; to: string; v: number }
const MACHINE: Record<string, { to: string; guard: (v: number) => boolean }[]> = {
  idle: [{ to: 'armed', guard: (v) => v >= 1 }],
  armed: [{ to: 'fired', guard: (v) => v >= 3 }, { to: 'idle', guard: () => true }],
  fired: [{ to: 'idle', guard: () => true }],
}
const VALID: Step[] = [
  { from: 'idle', to: 'armed', v: 2 },
  { from: 'armed', to: 'fired', v: 4 },
  { from: 'fired', to: 'idle', v: 0 },
]
const MUTATIONS: { name: string; apply: (t: Step[]) => Step[] }[] = [
  { name: 'drop a step', apply: (t) => t.filter((_, i) => i !== 1) },
  { name: 'swap two steps', apply: (t) => [t[1], t[0], t[2]] },
  { name: 'break a guard', apply: (t) => t.map((s, i) => (i === 1 ? { ...s, v: 1 } : s)) },
  { name: 'forge a transition', apply: (t) => t.map((s, i) => (i === 0 ? { ...s, to: 'fired' } : s)) },
  { name: 'repeat a step', apply: (t) => [t[0], t[0], t[1], t[2]] },
]
function oracle(trace: Step[]) {
  let cur = 'idle'
  for (const s of trace) {
    if (s.from !== cur) return false
    const edge = MACHINE[cur]?.find((e) => e.to === s.to)
    if (!edge || !edge.guard(s.v)) return false
    cur = s.to
  }
  return cur === 'idle'
}
const fastBackend = (trace: Step[]) => trace.every((s) => typeof s.from === 'string' && typeof s.to === 'string' && Number.isFinite(s.v))

function MutationBench() {
  const [picked, setPicked] = useState<number | null>(null)
  const trace = picked === null ? VALID : MUTATIONS[picked].apply(VALID)
  const o = oracle(trace)
  const f = fastBackend(trace)
  return (
    <Frame
      title="A fast backend that accepts everything"
      note="A toy three-state machine with guards. The semantic oracle replays the machine; the “fast backend” only checks that the trace is well-formed. Pick a mutation and see which one notices. The real benchmark uses nine families and 14 mutation classes."
    >
      <div className="demo-tabs">
        <button type="button" aria-pressed={picked === null} onClick={() => setPicked(null)}>valid trace</button>
        {MUTATIONS.map((m, i) => (
          <button key={m.name} type="button" aria-pressed={picked === i} onClick={() => setPicked(i)}>{m.name}</button>
        ))}
      </div>
      <pre className="demo-log">
        {trace.map((s) => `${s.from} → ${s.to}  (v=${s.v})`).join('\n')}
      </pre>
      <div className="ef-compare">
        <div className={o ? 'good' : 'bad'}>
          <strong>{o ? 'accept' : 'reject'}</strong>
          <span>semantic oracle (correct verdict for this trace)</span>
        </div>
        <div className={f === o ? 'good' : 'bad'}>
          <strong>{f ? 'accept' : 'reject'}</strong>
          <span>fast backend {f === o ? 'agrees' : o ? 'wrongly rejects' : 'ACCEPTED AN INVALID TRACE'}</span>
        </div>
      </div>
    </Frame>
  )
}

/* ---------- HyperIntel: tamper-evident receipt ---------- */
async function sha(s: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
}
const ORIGINAL = { offer: 'offer-7', priceMicro: 420000, tokens: 12000 }

function TamperReceipt() {
  const [f, setF] = useState(ORIGINAL)
  const [chain, setChain] = useState<{ route: string; usage: string; settlement: string; evidence: string } | null>(null)
  const [trusted, setTrusted] = useState('')
  useEffect(() => {
    let live = true
    ;(async () => {
      const route = await sha(`route|${f.offer}|${f.priceMicro}`)
      const usage = await sha(`usage|${route}|${f.tokens}`)
      const settlement = await sha(`settle|${usage}|${f.priceMicro * f.tokens}`)
      const evidence = await sha(`evidence|${route}|${usage}|${settlement}`)
      if (live) setChain({ route, usage, settlement, evidence })
    })()
    return () => {
      live = false
    }
  }, [f])
  useEffect(() => {
    let live = true
    ;(async () => {
      const route = await sha(`route|${ORIGINAL.offer}|${ORIGINAL.priceMicro}`)
      const usage = await sha(`usage|${route}|${ORIGINAL.tokens}`)
      const settlement = await sha(`settle|${usage}|${ORIGINAL.priceMicro * ORIGINAL.tokens}`)
      const evidence = await sha(`evidence|${route}|${usage}|${settlement}`)
      if (live) setTrusted(evidence)
    })()
    return () => {
      live = false
    }
  }, [])
  const valid = chain !== null && chain.evidence === trusted
  const short = (h: string) => (h ? `${h.slice(0, 10)}…${h.slice(-4)}` : '…')
  return (
    <Frame
      title="Edit a receipt and watch it fail offline"
      note="Real SHA-256, computed in your browser, over a toy receipt whose identities are derived the way the HyperIntel bundle derives them: each digest commits to the one before it. The trusted digest is supplied separately, as a verifier would receive it. The real verifier also checks signatures; this toy does not."
    >
      <div className="demo-ctl">
        <label>
          price (µ per token)
          <input type="number" value={f.priceMicro} onChange={(e) => setF({ ...f, priceMicro: +e.target.value || 0 })} />
        </label>
        <label>
          tokens metered
          <input type="number" value={f.tokens} onChange={(e) => setF({ ...f, tokens: +e.target.value || 0 })} />
        </label>
        <button type="button" onClick={() => setF(ORIGINAL)}>Restore</button>
      </div>
      <table className="ef-table demo-hash">
        <tbody>
          {chain &&
            (['route', 'usage', 'settlement', 'evidence'] as const).map((k) => (
              <tr key={k}>
                <td>{k} digest</td>
                <td><code>{short(chain[k])}</code></td>
              </tr>
            ))}
          <tr>
            <td>trusted evidence digest</td>
            <td><code>{short(trusted)}</code></td>
          </tr>
        </tbody>
      </table>
      <div className="ef-compare">
        <div className={valid ? 'good' : 'bad'}>
          <strong>{valid ? 'verified' : 'rejected'}</strong>
          <span>{valid ? 'bundle matches the trusted digest' : 'any change to price or metering breaks the chain'}</span>
        </div>
      </div>
    </Frame>
  )
}

const registry: Record<string, () => React.JSX.Element> = {
  matched: MatchedProgress,
  permutation: PermutationLab,
  netswap: NetSwap,
  gate: GateLoop,
  mutation: MutationBench,
  tamper: TamperReceipt,
}

export function Demo({ id }: { id: string }) {
  const D = registry[id]
  return D ? <D /> : null
}
