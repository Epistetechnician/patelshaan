import { useEffect, useMemo, useState } from 'react'
import snapshot from '../ecdsafail-data.json'

type Pt = [number, number]

interface BenchmarkState {
  points: Pt[]
  front: Pt[]
  submissions: number
  withMetrics: number
  asOf: string
  live: boolean
}

const API_URL =
  'https://ecdsa.fail/api/benchmarks/1ffb695a-309b-46b6-a728-2f97d8c7be74/submissions'

function computeParetoFront(pts: Pt[]): Pt[] {
  const sorted = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1])
  const front: Pt[] = []
  let bestT = Infinity
  for (const [q, t] of sorted) {
    if (t < bestT) {
      front.push([q, t])
      bestT = t
    }
  }
  return front
}

function parseLiveSubmissions(raw: unknown): BenchmarkState | null {
  const arr = Array.isArray(raw)
    ? raw
    : raw && typeof raw === 'object' && Array.isArray((raw as { submissions?: unknown[] }).submissions)
      ? (raw as { submissions: unknown[] }).submissions
      : null
  if (!arr || arr.length === 0) return null

  const pts: Pt[] = []
  for (const row of arr) {
    if (!row || typeof row !== 'object') continue
    const r = row as Record<string, unknown>
    const m = (r.metrics && typeof r.metrics === 'object'
      ? (r.metrics as Record<string, unknown>)
      : r) as Record<string, unknown>
    const q = Number(m.qubits ?? m.logical_qubits ?? m.q)
    const t = Number(m.toffoli_gates ?? m.toffoli ?? m.t)
    if (Number.isFinite(q) && Number.isFinite(t) && q > 0 && t > 0) {
      pts.push([q, t])
    }
  }
  if (pts.length < 10) return null
  return {
    points: pts,
    front: computeParetoFront(pts),
    submissions: arr.length,
    withMetrics: pts.length,
    asOf: new Date().toISOString().slice(0, 10),
    live: true,
  }
}

function fmtCount(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}k`
  return String(n)
}

export function EcdsaLivePareto() {
  const [data, setData] = useState<BenchmarkState>(() => ({
    points: snapshot.points as Pt[],
    front: snapshot.front as Pt[],
    submissions: snapshot.submissions,
    withMetrics: snapshot.withMetrics,
    asOf: snapshot.asOf,
    live: false,
  }))
  const [hovered, setHovered] = useState<Pt | null>(null)

  useEffect(() => {
    const ctrl = new AbortController()
    const timer = window.setTimeout(() => ctrl.abort(), 6000)
    fetch(API_URL, { signal: ctrl.signal, headers: { Accept: 'application/json' } })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        const parsed = parseLiveSubmissions(json)
        if (parsed) setData(parsed)
      })
      .catch(() => {
        // ecdsa.fail sets X-Frame-Options: DENY and may restrict cross-origin reads;
        // retain the bundled snapshot transparently.
      })
      .finally(() => window.clearTimeout(timer))
    return () => {
      window.clearTimeout(timer)
      ctrl.abort()
    }
  }, [])

  const W = 900
  const H = 430
  const m = { l: 68, r: 26, t: 52, b: 48 }
  const pw = W - m.l - m.r
  const ph = H - m.t - m.b

  const xMin = 640
  const xMax = 1500
  const lyMin = Math.log10(600000)
  const lyMax = Math.log10(700000000)

  const sx = (q: number) => m.l + ((q - xMin) / (xMax - xMin)) * pw
  const sy = (t: number) => m.t + (1 - (Math.log10(t) - lyMin) / (lyMax - lyMin)) * ph

  const { visiblePts, visibleFront, stepPath, bestProduct } = useMemo(() => {
    const vp = data.points.filter(([q, t]) => q >= xMin && q <= xMax && t >= 600000)
    const vf = data.front.filter(([q, t]) => q >= xMin && q <= xMax && t >= 600000)
    const path = vf
      .map(([q, t], i) => {
        const x = sx(q).toFixed(1)
        const y = sy(t).toFixed(1)
        if (i === 0) return `M${x},${y}`
        const py = sy(vf[i - 1][1]).toFixed(1)
        return `H${x}V${y === py ? y : y}`
      })
      .join('')
    const best = vf.reduce<Pt | null>(
      (acc, pt) => (!acc || pt[0] * pt[1] < acc[0] * acc[1] ? pt : acc),
      null,
    )
    return { visiblePts: vp, visibleFront: vf, stepPath: path, bestProduct: best }
  }, [data])

  const xTicks = [700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500]
  const yTicks: [number, string][] = [
    [1e6, '1M'],
    [1e7, '10M'],
    [1e8, '100M'],
  ]

  const activePt = hovered ?? bestProduct

  return (
    <div className="ecdsa-embed" aria-label="ECDSA.fail Pareto Frontier and PQC/PQAI Research Panel">
      <div className="ecdsa-embed__head">
        <div>
          <span className="ecdsa-embed__eyebrow">
            ecdsa.fail · Main Benchmark Graph (secp256k1 Reversible Point Addition)
          </span>
          <h4 className="ecdsa-embed__title">
            Pareto Frontier: Logical Qubits vs. Toffoli Gates
          </h4>
        </div>
        <div className="ecdsa-embed__status-group">
          <span className={`ecdsa-embed__pill${data.live ? ' is-live' : ''}`}>
            {data.live ? `Live API · ${data.asOf}` : `Synced snapshot · ${data.asOf}`}
          </span>
          <a
            href="https://ecdsa.fail/"
            target="_blank"
            rel="noreferrer"
            className="text-link ecdsa-embed__ext"
          >
            Open live on ecdsa.fail ↗
          </a>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="pareto ecdsa-embed__svg"
        role="img"
        aria-label={`ECDSA.fail Pareto frontier across ${data.withMetrics} verified submissions: logical qubits versus Toffoli gates`}
      >
        <text x={m.l} y={24} className="pareto__sub">
          {data.withMetrics.toLocaleString()} scored / {data.submissions.toLocaleString()} total submissions · Hover frontier points for exact Q×T
        </text>
        {activePt && (
          <text x={W - m.r} y={24} textAnchor="end" className="pareto__title">
            {activePt[0]} qubits · {fmtCount(activePt[1])} Toffoli · {fmtCount(activePt[0] * activePt[1])} Q×T
          </text>
        )}

        {xTicks.map((q) => (
          <g key={q}>
            <line x1={sx(q)} x2={sx(q)} y1={m.t} y2={H - m.b} className="pareto__grid" />
            <text x={sx(q)} y={H - m.b + 18} textAnchor="middle" className="pareto__tick">
              {q}
            </text>
          </g>
        ))}

        {yTicks.map(([t, label]) => (
          <g key={t}>
            <line x1={m.l} x2={W - m.r} y1={sy(t)} y2={sy(t)} className="pareto__grid" />
            <text x={m.l - 10} y={sy(t) + 4} textAnchor="end" className="pareto__tick">
              {label}
            </text>
          </g>
        ))}

        <text x={m.l + pw / 2} y={H - 10} textAnchor="middle" className="pareto__axis">
          Logical Qubits (secp256k1)
        </text>
        <text
          x={18}
          y={m.t + ph / 2}
          textAnchor="middle"
          transform={`rotate(-90 18 ${m.t + ph / 2})`}
          className="pareto__axis"
        >
          Toffoli Gates (log scale)
        </text>

        <g className="pareto__pts">
          {visiblePts.map(([q, t], i) => (
            <circle key={i} cx={sx(q)} cy={sy(t)} r={2.0} className="pareto__pt" />
          ))}
        </g>

        <path d={stepPath} className="pareto__front" />
        <g>
          {visibleFront.map(([q, t], i) => {
            const isSel = activePt && activePt[0] === q && activePt[1] === t
            return (
              <circle
                key={i}
                cx={sx(q)}
                cy={sy(t)}
                r={isSel ? 5.2 : 3.2}
                className="pareto__fpt"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHovered([q, t])}
                onMouseLeave={() => setHovered(null)}
              >
                <title>{`${q} qubits · ${t.toLocaleString()} Toffoli · ${(q * t).toLocaleString()} Q×T`}</title>
              </circle>
            )
          })}
        </g>
      </svg>

      <div className="ecdsa-embed__pqc-bar">
        <div className="ecdsa-embed__pqc-item">
          <span className="ecdsa-embed__pqc-k">Research Focus · PQC</span>
          <p>
            Measuring real quantum attack-cost compression on classical elliptic curves
            (<strong>−86.1%</strong> secp256k1 point-addition cost, <strong>1.82B Q×T</strong> verified) to
            ground transition urgency toward <strong>FIPS 204 (ML-DSA-65)</strong> and{' '}
            <strong>FIPS 205 (SLH-DSA)</strong>.
          </p>
        </div>
        <div className="ecdsa-embed__pqc-item">
          <span className="ecdsa-embed__pqc-k">Research Focus · PQAI</span>
          <p>
            Post-Quantum AI Assurance: hardware-attested <strong>Intel TDX</strong> promotion gates +
            tri-signed PQ roots proved in <strong>Lean 4 (0 sorry)</strong>, catching{' '}
            <strong>28/28</strong> adversarial EIP-8288/8479 mutations with 100% Python/Rust parity.
          </p>
        </div>
      </div>

      <p className="ecdsa-embed__note">
        Note: ecdsa.fail sets <code>X-Frame-Options: DENY</code> preventing third-party iframe framing;
        this component renders the identical Pareto frontier directly from the ecdsa.fail benchmark
        schema with automatic live API sync and local fallback.
      </p>
    </div>
  )
}
