import data from './ecdsafail-data.json'

const W = 900
const H = 560
const M = { l: 64, r: 20, t: 56, b: 52 }
const X0 = 640
const X1 = 1500
const LOG0 = Math.log10(666170)
const LOG1 = Math.log10(656150000)

const sx = (q: number) => M.l + ((q - X0) / (X1 - X0)) * (W - M.l - M.r)
const sy = (t: number) =>
  M.t + (1 - (Math.log10(t) - LOG0) / (LOG1 - LOG0)) * (H - M.t - M.b)

const fmt = (n: number) =>
  n >= 1e6 ? `${(n / 1e6).toFixed(n >= 1e8 ? 0 : 1)}M` : `${Math.round(n / 1e3)}K`

export default function ParetoChart() {
  const pts = (data.points as number[][]).filter(
    ([q, t]) => q >= X0 && q <= X1 && t >= 666170 && t <= 656150000,
  )
  const front = (data.front as number[][]).filter(([q]) => q <= X1)
  // Step line: hold toffoli flat until the next frontier point's qubit count.
  let d = ''
  front.forEach(([q, t], i) => {
    d += i === 0 ? `M${sx(q)},${sy(t)}` : `H${sx(q)}V${sy(t)}`
  })
  d += `H${sx(X1)}`
  const yTicks = [1e6, 1e7, 1e8]
  const xTicks = [700, 900, 1100, 1300, 1500]
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`Pareto frontier of ${data.withMetrics} ECDSA.Fail submissions: qubits against Toffoli gates.`}
      className="pareto"
    >
      <text x={M.l} y={22} className="pareto__title">
        PARETO FRONTIER · QUBITS VS TOFFOLIS
      </text>
      <text x={M.l} y={40} className="pareto__sub">
        low qubit {data.front[0][0]} · low Toffoli {fmtExact(746114)} · live ecdsa.fail data, {data.asOf}
      </text>
      {yTicks.map((t) => (
        <g key={t}>
          <line x1={M.l} x2={W - M.r} y1={sy(t)} y2={sy(t)} className="pareto__grid" />
          <text x={M.l - 8} y={sy(t) + 4} textAnchor="end" className="pareto__tick">
            {fmt(t)}
          </text>
        </g>
      ))}
      {xTicks.map((q) => (
        <g key={q}>
          <line x1={sx(q)} x2={sx(q)} y1={M.t} y2={H - M.b} className="pareto__grid" />
          <text x={sx(q)} y={H - M.b + 18} textAnchor="middle" className="pareto__tick">
            {q}
          </text>
        </g>
      ))}
      <text x={(M.l + W - M.r) / 2} y={H - 10} textAnchor="middle" className="pareto__axis">
        Qubits
      </text>
      <text
        transform={`translate(14 ${(M.t + H - M.b) / 2}) rotate(-90)`}
        textAnchor="middle"
        className="pareto__axis"
      >
        Toffolis (log)
      </text>
      {pts.map(([q, t], i) => (
        <circle key={i} cx={sx(q)} cy={sy(t)} r={2.6} className="pareto__pt" />
      ))}
      <path d={d} className="pareto__front" />
      {front.map(([q, t], i) => (
        <circle key={i} cx={sx(q)} cy={sy(t)} r={3.4} className="pareto__fpt" />
      ))}
    </svg>
  )
}

function fmtExact(n: number) {
  return n.toLocaleString('en-US')
}
