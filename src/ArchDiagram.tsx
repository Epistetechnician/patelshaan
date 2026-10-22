import { archs } from './arch'

const CW = 210
const GAP = 46
const BH = 60
const BG = 26
const TOP = 56
const X0 = 14

export function ArchDiagram({ slug }: { slug: string }) {
  const spec = archs[slug]
  if (!spec) return null
  const pos: Record<string, { x: number; y: number; col: number }> = {}
  let maxRows = 0
  spec.cols.forEach((c, ci) => {
    maxRows = Math.max(maxRows, c.boxes.length)
    c.boxes.forEach((b, bi) => {
      pos[b.id] = { x: X0 + ci * (CW + GAP) + 14, y: TOP + bi * (BH + BG), col: ci }
    })
  })
  const bw = CW - 28
  const colH = TOP + maxRows * (BH + BG) - BG + 22
  const W = X0 * 2 + spec.cols.length * CW + (spec.cols.length - 1) * GAP
  const railY = colH + 36
  const botY = railY + 28
  const H = botY + BH + 24
  const bottomW = Math.min(290, (W - 80) / spec.bottom.length)
  const bottomX = (i: number) => W / 2 - (spec.bottom.length * bottomW + (spec.bottom.length - 1) * 40) / 2 + i * (bottomW + 40)

  const arrow = (a: string, b: string) => {
    const p = pos[a]
    const q = pos[b]
    if (p.col === q.col) {
      const x = p.x + bw / 2
      return { d: `M${x},${p.y + BH} L${x},${q.y - 1}`, head: [x, q.y - 1, 'down'] as const }
    }
    const x1 = p.x + bw
    const y1 = p.y + BH / 2
    const x2 = q.x
    const y2 = q.y + BH / 2
    const mx = (x1 + x2) / 2
    return { d: `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2 - 1},${y2}`, head: [x2 - 1, y2, 'right'] as const }
  }
  const head = (x: number, y: number, dir: 'down' | 'right' | 'left') =>
    dir === 'down' ? `${x - 4},${y - 8} ${x + 4},${y - 8} ${x},${y}` : dir === 'right' ? `${x - 8},${y - 4} ${x - 8},${y + 4} ${x},${y}` : `${x + 8},${y - 4} ${x + 8},${y + 4} ${x},${y}`

  return (
    <figure className="arch">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Architecture diagram">
        {spec.cols.map((c, ci) => {
          const x = X0 + ci * (CW + GAP)
          return (
            <g key={c.title}>
              <rect x={x} y={8} width={CW} height={colH - 8} fill="none" stroke="#7d9db8" strokeWidth="1.4" strokeDasharray={c.dashed ? '6 5' : undefined} />
              <text x={x + 14} y={36} className="arch-title">{c.title}</text>
              <line x1={x + CW / 2} y1={colH} x2={x + CW / 2} y2={railY} stroke="#7d9db8" strokeWidth="1.3" />
            </g>
          )
        })}
        <line x1={X0 + CW / 2} y1={railY} x2={X0 + (spec.cols.length - 1) * (CW + GAP) + CW / 2} y2={railY} stroke="#7d9db8" strokeWidth="1.3" />
        <line x1={W / 2} y1={railY} x2={W / 2} y2={botY - 1} stroke="#2f5d7e" strokeWidth="1.6" />
        <polygon points={head(W / 2, botY - 1, 'down')} fill="#2f5d7e" />
        {spec.links.map(([a, b]) => {
          const ar = arrow(a, b)
          return (
            <g key={a + b}>
              <path d={ar.d} fill="none" stroke="#2f5d7e" strokeWidth="1.6" />
              <polygon points={head(ar.head[0], ar.head[1], ar.head[2])} fill="#2f5d7e" />
            </g>
          )
        })}
        {spec.cols.flatMap((c) =>
          c.boxes.map((b) => {
            const p = pos[b.id]
            return (
              <g key={b.id}>
                <rect x={p.x} y={p.y} width={bw} height={BH} fill="#fdfcfa" stroke={b.soft ? '#7d9db8' : '#4d7596'} strokeWidth="1.4" />
                <text x={p.x + bw / 2} y={p.y + (b.sub ? 26 : 36)} textAnchor="middle" className={b.soft ? 'arch-box soft' : 'arch-box'}>{b.label}</text>
                {b.sub ? <text x={p.x + bw / 2} y={p.y + 46} textAnchor="middle" className="arch-sub">{b.sub}</text> : null}
              </g>
            )
          }),
        )}
        {spec.bottom.map((b, i) => (
          <g key={b.label}>
            <rect x={bottomX(i)} y={botY} width={bottomW} height={BH} fill="#fdfcfa" stroke="#4d7596" strokeWidth="1.4" />
            <text x={bottomX(i) + bottomW / 2} y={botY + (b.sub ? 26 : 36)} textAnchor="middle" className="arch-box">{b.label}</text>
            {b.sub ? <text x={bottomX(i) + bottomW / 2} y={botY + 46} textAnchor="middle" className="arch-sub">{b.sub}</text> : null}
            {i > 0 ? (
              <>
                <line x1={bottomX(i)} y1={botY + BH / 2} x2={bottomX(i - 1) + bottomW + 9} y2={botY + BH / 2} stroke="#2f5d7e" strokeWidth="1.6" />
                <polygon points={head(bottomX(i - 1) + bottomW + 1, botY + BH / 2, 'left')} fill="#2f5d7e" />
              </>
            ) : null}
          </g>
        ))}
      </svg>
      <figcaption>{spec.caption}</figcaption>
    </figure>
  )
}
