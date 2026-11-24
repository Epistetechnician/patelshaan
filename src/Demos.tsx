import { useEffect, useMemo, useState } from 'react'
import { RichText } from './components/RichText'
import { NetSwap } from './NetSwap'

function Frame({ title, children, note }: { title: string; children: React.ReactNode; note: string }) {
  return (
    <figure className="ef demo">
      <h4>
        <span className="demo-tag">live</span> <RichText text={title} />
      </h4>
      {children}
      <figcaption><RichText text={note} /></figcaption>
    </figure>
  )
}

/* ---------- Holdout Ledger: adaptive leakage vs MDL-priced bound ---------- */
function HoldoutBudgetDemo() {
  const [queries, setQueries] = useState(1024)
  const [proposer, setProposer] = useState<'swaps' | 'patch' | 'mixed'>('patch')
  const [batch64, setBatch64] = useState(false)
  const n = 20000
  const delta = 0.05
  const effectiveBits = batch64 ? Math.ceil((queries / 64) * 6) : queries
  const trueGain = proposer === 'swaps' ? 0.229 : proposer === 'patch' ? 0.006 : 0.211
  // Stylized adaptive inflation grows with sqrt(queries / n) when patches fit the holdout
  const fitDrift = proposer === 'swaps' ? 0 : (proposer === 'patch' ? 0.031 : 0.006) * Math.sqrt(queries / 1024)
  const admitted = trueGain + fitDrift - (batch64 && proposer !== 'patch' ? 0.003 : 0)
  const waldRadius = 1.645 * Math.sqrt((0.25) / n)
  const waldBound = admitted - waldRadius
  const coreDescBits = proposer === 'swaps' ? 98 : proposer === 'patch' ? 1400 : 104
  const coreAdmitted = proposer === 'patch' ? 0.004 : proposer === 'mixed' ? admitted - fitDrift - 0.006 : admitted
  const infoRadius = Math.sqrt(((effectiveBits * Math.LN2 + Math.log(2 / delta)) / (2 * n)))
  const descRadius = Math.sqrt(((coreDescBits * Math.LN2 + Math.log(2 / delta)) / (2 * n)))
  const infoBound = admitted - infoRadius
  const descBound = coreAdmitted - descRadius
  const ledgerBound = Math.max(infoBound, descBound)
  const waldWrong = waldBound > trueGain
  const ledgerValid = ledgerBound <= trueGain

  return (
    <Frame
      title="Adaptive holdout queries: naive Wald bound vs bit-priced ledger"
      note="Computed live with Hoeffding union-bound radii at n = 20,000, δ = 0.05, calibrated to match the Holdout Ledger early-regime regimes (`PREREG.md`). Switch to the patch proposer to see zero-bit Wald overclaim while the ledger strips the incompressible patch."
    >
      <div className="demo-ctl">
        <label>
          adaptive queries: {queries} ({effectiveBits} verdict bits billed)
          <input
            type="range"
            min={64}
            max={1024}
            step={64}
            value={queries}
            onChange={(e) => setQueries(+e.target.value)}
          />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <input
            type="checkbox"
            checked={batch64}
            onChange={(e) => setBatch64(e.target.checked)}
          />
          batch 64 candidates per verdict
        </label>
      </div>
      <div className="demo-tabs">
        <button type="button" aria-pressed={proposer === 'swaps'} onClick={() => setProposer('swaps')}>
          honest pool swaps (~98b)
        </button>
        <button type="button" aria-pressed={proposer === 'patch'} onClick={() => setProposer('patch')}>
          holdout-fitting patch (~1,400b)
        </button>
        <button type="button" aria-pressed={proposer === 'mixed'} onClick={() => setProposer('mixed')}>
          mixed (swaps + patch)
        </button>
      </div>
      <div className="ef-compare">
        <div>
          <strong>{admitted.toFixed(3)}</strong>
          <span>observed holdout gain (true reserve: {trueGain.toFixed(3)})</span>
        </div>
        <div className={waldWrong ? 'bad' : 'good'}>
          <strong>{waldBound.toFixed(3)}</strong>
          <span>
            usual zero-bit Wald lower bound — {waldWrong ? 'INVALID (exceeds true gain)' : 'valid here'}
          </span>
        </div>
        <div className={ledgerValid ? 'good' : 'bad'}>
          <strong>{ledgerBound.toFixed(3)}</strong>
          <span>
            ledger bound min(info {infoBound.toFixed(3)}, desc {descBound.toFixed(3)}) — {ledgerBound <= 0 ? 'refuses claim' : 'valid certificate'}
          </span>
        </div>
      </div>
    </Frame>
  )
}

/* ---------- FormaSec: untrusted proposer vs verified kernel ---------- */
const FORMASEC_CASES = [
  {
    name: 'valid 3-stage pipeline',
    dag: 'fetch_csv -> normalize_schema -> aggregate_counts  (paths: 1, caps: read_tmp)',
    py: 'ADMIT (receipt 9f31…c8)',
    rs: 'ADMIT (receipt 9f31…c8)',
    lean: 'plan_sound ✓',
    ok: true,
    why: 'Postconditions discharge every downstream precondition; Landlock restricts filesystem access to read_tmp.',
  },
  {
    name: 'weakened postcondition mutant',
    dag: 'fetch_csv -> drop_null_guard -> write_ledger  (M1 mutant #14)',
    py: 'REJECT: UnsatisfiedPrecondition(non_null)',
    rs: 'REJECT: UnsatisfiedPrecondition(non_null)',
    lean: 'admitAlg = false ✓',
    ok: false,
    why: 'Caught identically by Python, Rust, and Lean structural rules (0 false accepts across 75 mutants).',
  },
  {
    name: '2^n diamond DAG bomb',
    dag: 'fanout_1..24 -> recombine_1..24  (paths: 16,777,216)',
    py: 'REJECT: PathBudgetExceeded(max=4096)',
    rs: 'REJECT: PathBudgetExceeded(max=4096)',
    lean: 'bounded_dag = false ✓',
    ok: false,
    why: 'Reproduces the M6 hostile-proposer vector that exhausted 14 GB RAM before explicit DAG path caps were added.',
  },
  {
    name: 'capability widening attempt',
    dag: 'summarize_doc [net=none] -> exfil_webhook [net=egress]',
    py: 'REJECT: CapabilityWidening(net=egress)',
    rs: 'REJECT: CapabilityWidening(net=egress)',
    lean: 'non_widening = false ✓',
    ok: false,
    why: 'A composition cannot acquire ambient network or filesystem authority absent from the caller’s grant.',
  },
] as const

function FormasecDemo() {
  const [idx, setIdx] = useState(0)
  const c = FORMASEC_CASES[idx]
  return (
    <Frame
      title="Untrusted proposer vs Python, Rust, and Lean admission"
      note="Illustrates FormaSec's M1/M2/M6 admission checks (`DESIGN.md` §§18–23): the proposer is free to emit arbitrary DAGs, while Python, Rust (Kani-checked core), and Lean agree on admission and produce byte-identical receipts."
    >
      <div className="demo-tabs">
        {FORMASEC_CASES.map((item, i) => (
          <button key={item.name} type="button" aria-pressed={idx === i} onClick={() => setIdx(i)}>
            {item.name}
          </button>
        ))}
      </div>
      <pre className="demo-log">{c.dag}</pre>
      <div className="ef-compare">
        <div className={c.ok ? 'good' : 'bad'}>
          <strong>{c.ok ? 'Admitted' : 'Rejected'}</strong>
          <span>Python ref: {c.py}</span>
        </div>
        <div className="good">
          <strong>Byte-exact</strong>
          <span>Rust core: {c.rs}</span>
        </div>
        <div className="good">
          <strong>Sound</strong>
          <span>Lean 4: {c.lean}</span>
        </div>
      </div>
      <p className="demo-verdict">{c.why}</p>
    </Frame>
  )
}

/* ---------- Mech-Interp Unified: F2 planted-flaw audit ---------- */
const FLAWS = [
  { name: 'Width-confounded job count', rules: false, r5b: false, probes: true, note: 'P(>=2 jobs) ≈ 0.91 for generic vectors; conflates neuron width with polysemanticity.' },
  { name: 'Paired superposition', rules: false, r5b: true, probes: true, note: 'Caught cleanly (1.00 TPR) by R5b and targeted probes; missed by static rules.' },
  { name: 'Diffuse superposition', rules: false, r5b: false, probes: false, note: 'R5b TPR drops to 0.30; weak distributed interference evades single-unit checks.' },
  { name: 'Residual norm-damage mismatch', rules: false, r5b: false, probes: true, note: 'Why plain rank-matched PCA swung wildly in jspace-pilot while norm-matched PCA held at 0.00.' },
  { name: 'Clean-margin level shift (+2 logits)', rules: false, r5b: false, probes: false, note: 'Ablation shifts baseline logit margin, shrinking injected effect without removing the route.' },
  { name: 'Per-prompt oracle leakage', rules: false, r5b: false, probes: false, note: 'Fitting a subspace on evaluated downstream images inflates SFT specificity (+0.09 -> +0.03).' },
  { name: 'Device / dtype selection drift', rules: false, r5b: false, probes: false, note: 'V60 showed selected swap units change between CUDA float16 and CPU float32.' },
  { name: 'Behavioral non-indispensability', rules: false, r5b: false, probes: false, note: 'Zero/random replacement keeps 100% accuracy (Theseus V31), making behavioral pass vacuous.' },
] as const

function FlawAuditDemo() {
  const [auditor, setAuditor] = useState<'rules' | 'r5b' | 'probes'>('probes')
  const caught = FLAWS.filter((f) => f[auditor]).length
  return (
    <Frame
      title="F2 planted-flaw audit: which broken instruments get caught?"
      note=" summarizes F2 (`mech-interp-unified/audit/REPORT.md`, 200 seeds) alongside the confounds isolated in `jspace-pilot` and `theseus-lab`. No single automated auditor catches more than 3 of 8 classes."
    >
      <div className="demo-tabs">
        <button type="button" aria-pressed={auditor === 'rules'} onClick={() => setAuditor('rules')}>
          A1 static rules gate (0 / 8)
        </button>
        <button type="button" aria-pressed={auditor === 'r5b'} onClick={() => setAuditor('r5b')}>
          A2 R5b superposition audit (partial)
        </button>
        <button type="button" aria-pressed={auditor === 'probes'} onClick={() => setAuditor('probes')}>
          A3 probe battery (3 / 8 upper bound)
        </button>
      </div>
      <ul className="ef-chips">
        {FLAWS.map((f) => {
          const hit = f[auditor]
          return (
            <li key={f.name}>
              <span className={`ef-chip ${hit ? 'pass' : 'fail'}`}>{hit ? 'caught' : 'missed'}</span>
              <b>{f.name}</b>
              <em>{f.note}</em>
            </li>
          )
        })}
      </ul>
      <p className="demo-verdict">
        Auditor verdict: {caught} of {FLAWS.length} flaw classes caught ({caught < 6 ? 'FAILS pre-registered >= 6/8 validity bar' : 'PASS'}).
      </p>
    </Frame>
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
    const perm = Array.from({ length: Hn }, (_, i) => i)
    const rp = rng(seed * 31 + 5)
    for (let i = Hn - 1; i > 0; i--) {
      const j = Math.floor((rp() + 0.5) * (i + 1))
      ;[perm[i], perm[j]] = [perm[j], perm[i]]
    }
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

/* ---------- Kailas 52-km Kora S¹ Spatial Mandala & Register Explorer ---------- */
const KORA_STAGES = [
  {
    r: 0.03,
    elev: '4,750 m',
    stage: 'Stage 1 · Tarboche Saga Dawa Flagpole & 84-Mahāsiddha Charnel',
    clock: 'independent (Saga Dawa full-moon anchor)',
    core: false,
    regs: ['cosmological', 'critical', 'devotional', 'historical', 'physical'],
    note: '75% (3/4) of all circuit calendar-decoupled hits occur here as lunar festival crowds gather at the flagpole.',
  },
  {
    r: 0.17,
    elev: '4,860 m',
    stage: 'Stage 2A · Lha-chu West Valley & Choku Gompa',
    clock: 'aligned (φ = f(r))',
    core: true,
    regs: ['cosmological', 'devotional', 'historical', 'physical'],
    note: 'Entering the glacial canyon beneath the West (Ruby) face; calendar decoupling drops to 0.0% for the next 24 episodes.',
  },
  {
    r: 0.29,
    elev: '4,970 m',
    stage: 'Stage 2B · Kangri Chorten & Three Bodhisattva Peaks',
    clock: 'aligned (φ = f(r))',
    core: true,
    regs: ['cosmological', 'devotional', 'historical', 'physical'],
    note: 'Cliffs read simultaneously as Rigsum Gonpo (Mañjuśrī, Vajrapāṇi, Avalokiteśvara) and glacial granite walls.',
  },
  {
    r: 0.43,
    elev: '5,080 m',
    stage: 'Stage 3 · Dirapuk Monastery & North (Gold) Face Mandala Camp',
    clock: 'aligned (φ = f(r))',
    core: true,
    regs: ['cosmological', 'devotional', 'historical', 'physical'],
    note: 'Direct axial view of the 1,500 m North Face; Śiva’s throne, Cakrasaṃvara’s bindu, and Bon Yungdrung Gutsek align.',
  },
  {
    r: 0.49,
    elev: '5,330 m',
    stage: 'Stage 4A · Shiva-tsal Charnel Ground (Symbolic Bardo Death)',
    clock: 'aligned (φ = f(r))',
    core: true,
    regs: ['biographical', 'cosmological', 'devotional', 'physical'],
    note: 'Pilgrims leave clothing or hair in ritual ego-death before the pass; bardo state is locked to physical altitude.',
  },
  {
    r: 0.52,
    elev: '5,630 m',
    stage: 'Stage 4B · Drolma La Pass Summit & Gauri Kund (Tārā’s Emerald Lake)',
    clock: 'aligned (φ = f(r))',
    core: true,
    regs: ['cosmological', 'devotional', 'historical', 'physical'],
    note: 'Circuit apex (r = 0.52): hypoxia, prayer-flag labyrinth, Hindu Pārvatī lake, and Vajrayāna rebirth threshold coincide.',
  },
  {
    r: 0.74,
    elev: '4,790 m',
    stage: 'Stage 5 · Zutulpuk (Milarepa vs. Naro Bonchung Contest Cave)',
    clock: 'aligned (φ = f(r) · 50.0% strict / 62.5% loose)',
    core: true,
    regs: ['cosmological', 'devotional', 'historical', 'physical'],
    note: 'Peak route-aligned mandala stage: one cave encodes rival Buddhist and Bon cosmogenesis contests without erasing either.',
  },
  {
    r: 0.94,
    elev: '4,670 m',
    stage: 'Stage 6 · Gorge Exit onto Barkha Plain & Darchen Loop Closure',
    clock: 'boundary transition (return to secular calendar)',
    core: false,
    regs: ['biographical', 'cosmological', 'devotional', 'historical', 'physical'],
    note: 'Exiting the mandala canyon onto the Barkha plain re-couples the walker to modern historical and calendar time.',
  },
] as const

const ALL_KORA_REGS = [
  'physical',
  'cosmological',
  'devotional',
  'historical',
  'biographical',
  'critical',
] as const

function KailasKoraMandalaDemo() {
  const [idx, setIdx] = useState(3)
  const [dirMode, setDirMode] = useState<'cw' | 'ccw'>('cw')
  const st = KORA_STAGES[idx]
  const cx = 148
  const cy = 138
  const rad = 96
  const ang = -Math.PI / 2 + 2 * Math.PI * st.r
  const px = cx + rad * Math.cos(ang)
  const py = cy + rad * Math.sin(ang)
  const phaseAng = st.core ? ang : -Math.PI / 2
  const bonAng = -Math.PI / 2 - 2 * Math.PI * st.r
  const bpx = cx + rad * Math.cos(bonAng)
  const bpy = cy + rad * Math.sin(bonAng)

  return (
    <Frame
      title="52-km Kailash kora circuit (114 coded episodes): spatial route progress r ∈ [0, 1] vs. ritual clock"
      note="Backed by locator-only dual coding in `kailas-corpus` (`thubron_kora_codings.csv`, α = 0.83; plus public-domain pilgrimage windows, α = 0.86). Toggle between clockwise Hindu/Buddhist circumambulation and counter-clockwise Bon circumambulation across the same 52-km mountain loop."
    >
      <div className="demo-ctl">
        <label>
          circuit landmark ({idx + 1} / {KORA_STAGES.length}) — r = {st.r.toFixed(2)} ({st.elev})
          <input
            type="range"
            min={0}
            max={KORA_STAGES.length - 1}
            step={1}
            value={idx}
            onChange={(e) => setIdx(+e.target.value)}
          />
        </label>
        <div className="demo-pills" role="group" aria-label="Circuit traversal direction">
          <button
            type="button"
            className={dirMode === 'cw' ? 'on' : ''}
            onClick={() => setDirMode('cw')}
          >
            Clockwise Kora (Hindu / Buddhist)
          </button>
          <button
            type="button"
            className={dirMode === 'ccw' ? 'on' : ''}
            onClick={() => setDirMode('ccw')}
          >
            Clockwise vs. Counter-Clockwise Bon Circuit
          </button>
        </div>
      </div>

      <svg viewBox="0 0 680 286" className="kora-svg" role="img" aria-label="Mount Kailash 52-km kora circuit map">
        {/* Square 4-gated bhupura mandala courtyard */}
        <rect x={cx - 64} y={cy - 64} width={128} height={128} fill="none" stroke="#b8a06a" strokeWidth="1.2" strokeDasharray="3 3" />
        <rect x={cx - 44} y={cy - 44} width={88} height={88} fill="#f4efe4" stroke="#8a6d2f" strokeWidth="1.1" />
        {/* Four cardinal faces of Kailash */}
        <polygon points={`${cx},${cy} ${cx - 44},${cy - 44} ${cx + 44},${cy - 44}`} fill="#efe6d2" stroke="#8a6d2f" strokeWidth="0.9" />
        <polygon points={`${cx},${cy} ${cx + 44},${cy - 44} ${cx + 44},${cy + 44}`} fill="#e8eef4" stroke="#4d7596" strokeWidth="0.9" />
        <polygon points={`${cx},${cy} ${cx - 44},${cy + 44} ${cx + 44},${cy + 44}`} fill="#dde8f2" stroke="#2f5d7e" strokeWidth="0.9" />
        <polygon points={`${cx},${cy} ${cx - 44},${cy - 44} ${cx - 44},${cy + 44}`} fill="#f3e3de" stroke="#a4453a" strokeWidth="0.9" />
        <circle cx={cx} cy={cy} r={4} fill="#2f5d7e" />
        <text x={cx} y={cy - 50} textAnchor="middle" fontSize="9.5" fontFamily="SF Mono, monospace" fill="#6c7580">N · Gold (Dirapuk)</text>
        <text x={cx} y={cy + 58} textAnchor="middle" fontSize="9.5" fontFamily="SF Mono, monospace" fill="#6c7580">S · Lapis (Darchen)</text>

        {/* Outer 52-km S1 kora ring */}
        <circle cx={cx} cy={cy} r={rad} fill="none" stroke="#c9d3de" strokeWidth="4" />
        {/* Mountain core arc r in [0.14, 0.84] */}
        <circle
          cx={cx}
          cy={cy}
          r={rad}
          fill="none"
          stroke={dirMode === 'ccw' ? '#8a6d2f' : '#3d7a5a'}
          strokeWidth="4.5"
          strokeDasharray={`${0.70 * 2 * Math.PI * rad} ${2 * Math.PI * rad}`}
          strokeDashoffset={-0.14 * 2 * Math.PI * rad}
          transform={`rotate(-90 ${cx} ${cy})`}
        />

        {/* Landmark nodes */}
        {KORA_STAGES.map((node, i) => {
          const a = -Math.PI / 2 + 2 * Math.PI * node.r
          const nx = cx + rad * Math.cos(a)
          const ny = cy + rad * Math.sin(a)
          const active = i === idx
          return (
            <g key={node.stage} onClick={() => setIdx(i)} style={{ cursor: 'pointer' }}>
              <circle
                cx={nx}
                cy={ny}
                r={active ? 7.5 : 5}
                fill={node.core ? '#3d7a5a' : '#a4453a'}
                stroke="#fdfcfa"
                strokeWidth="1.8"
              />
            </g>
          )
        })}

        {/* Active CW kime phase vector */}
        <line
          x1={px}
          y1={py}
          x2={px + 22 * Math.cos(phaseAng)}
          y2={py + 22 * Math.sin(phaseAng)}
          stroke={st.core ? '#2f5d7e' : '#a4453a'}
          strokeWidth="2.2"
        />
        <circle cx={px} cy={py} r={10.5} fill="none" stroke="#2f5d7e" strokeWidth="1.4" />

        {/* Counter-clockwise Bon walker comparison */}
        {dirMode === 'ccw' && (
          <g>
            <line
              x1={bpx}
              y1={bpy}
              x2={bpx - 20 * Math.cos(bonAng)}
              y2={bpy - 20 * Math.sin(bonAng)}
              stroke="#a4453a"
              strokeWidth="2.2"
            />
            <circle cx={bpx} cy={bpy} r={9.5} fill="none" stroke="#a4453a" strokeWidth="1.5" strokeDasharray="2 2" />
          </g>
        )}

        {/* Right telemetry panel */}
        <line x1={292} y1={22} x2={292} y2={266} stroke="var(--gray-200)" strokeWidth="1" />
        <text x={312} y={38} fontSize="11" fontFamily="SF Mono, monospace" fontWeight="700" fill="var(--line)">
          {st.stage}
        </text>
        <text x={312} y={59} fontSize="10.2" fontFamily="SF Mono, monospace" fill="var(--color-link)">
          Coordinate r = {st.r.toFixed(2)} · Elevation {st.elev} · Kailas coding v2
        </text>
        <text x={312} y={80} fontSize="10.2" fontFamily="SF Mono, monospace" fill={st.core ? 'var(--good)' : 'var(--bad)'}>
          Clock regime: {st.clock}
        </text>
        <text x={312} y={101} fontSize="10.2" fontFamily="SF Mono, monospace" fill={dirMode === 'ccw' ? 'var(--bad)' : 'var(--good)'}>
          {dirMode === 'cw'
            ? 'Stages 2–5 (r ∈ [0.14, 0.84]): 0/24 strict calendar decoupling'
            : 'Clockwise Buddhist vs. Counter-Clockwise Bon circuit alignment'}
        </text>
        <text x={312} y={121} fontSize="9.8" fontFamily="SF Mono, monospace" fill="var(--color-link)">
          {dirMode === 'cw'
            ? 'Thubron full kora: 20.0% strict route-aligned mandala (p = 0.0017).'
            : '70.8% indigenous sacred-landscape 4-register overlap across circuits.'}
        </text>
        <text x={312} y={145} fontSize="10" fontFamily="SF Mono, monospace" fill="var(--line)">
          ACTIVE INTERPRETIVE REGISTERS AT STAGE:
        </text>
        {ALL_KORA_REGS.map((reg, k) => {
          const on = (st.regs as readonly string[]).includes(reg)
          const rx = 312 + (k % 3) * 116
          const ry = 156 + Math.floor(k / 3) * 32
          return (
            <g key={reg}>
              <rect
                x={rx}
                y={ry}
                width={108}
                height={24}
                rx={3}
                fill={on ? 'var(--gray-100)' : 'var(--body-background)'}
                stroke={on ? 'var(--line)' : 'var(--gray-200)'}
                strokeWidth="1.1"
              />
              <text
                x={rx + 54}
                y={ry + 15.5}
                textAnchor="middle"
                fontSize="9.8"
                fontFamily="SF Mono, monospace"
                fill={on ? 'var(--body-font-color)' : 'var(--color-link)'}
              >
                {on ? `✓ ${reg}` : reg}
              </text>
            </g>
          )
        })}
        <text x={312} y={248} fontSize="10.2" fontStyle="italic" fill="var(--color-link)">
          {st.note.slice(0, 68)}{st.note.length > 68 ? '…' : ''}
        </text>
      </svg>

      <p className="demo-verdict">{st.note}</p>
    </Frame>
  )
}

const registry: Record<string, () => React.JSX.Element> = {
  holdout: HoldoutBudgetDemo,
  formasec: FormasecDemo,
  flawaudit: FlawAuditDemo,
  matched: MatchedProgress,
  permutation: PermutationLab,
  netswap: NetSwap,
  gate: GateLoop,
  mutation: MutationBench,
  tamper: TamperReceipt,
  kora: KailasKoraMandalaDemo,
}

export function Demo({ id }: { id: string }) {
  const D = registry[id]
  return D ? <D /> : null
}
