import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const D = 6
const NB = 5
const NOUT = 4
const NIN = 6
const NS = 400

type Block = {
  kind: 'mlp' | 'affine' | 'zero'
  ids: number[]
  W1: number[][]
  b1: number[]
  W2: number[][]
  A: number[][]
  c: number[]
}
type Net = { P: number[][]; blocks: Block[]; R: number[][] }

function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 4294967296
  }
}
const gauss = (r: () => number) => Math.sqrt(-2 * Math.log(r() + 1e-12)) * Math.cos(2 * Math.PI * r())
const mat = (r: () => number, n: number, m: number, s: number) => Array.from({ length: n }, () => Array.from({ length: m }, () => gauss(r) * s))

function makeNet(seed: number, H = 10): Net {
  const r = rng(seed)
  return {
    P: mat(r, D, NIN, 0.7),
    R: mat(r, NOUT, D, 0.9),
    blocks: Array.from({ length: NB }, () => ({
      kind: 'mlp' as const,
      ids: Array.from({ length: H }, (_, i) => i),
      W1: mat(r, H, D, 0.8),
      b1: Array.from({ length: H }, () => gauss(r) * 0.3),
      W2: mat(r, D, H, 0.75),
      A: [],
      c: [],
    })),
  }
}
const clone = (n: Net): Net => JSON.parse(JSON.stringify(n))
const mv = (M: number[][], v: number[]) => M.map((row) => row.reduce((s, w, j) => s + w * v[j], 0))

function delta(b: Block, r: number[]): number[] {
  if (b.kind === 'zero') return r.map(() => 0)
  if (b.kind === 'affine') return mv(b.A, r).map((v, i) => v + b.c[i])
  const h = b.W1.map((row, i) => Math.max(0, row.reduce((s, w, j) => s + w * r[j], b.b1[i])))
  return mv(b.W2, h)
}
function forward(n: Net, x: number[]) {
  let r = mv(n.P, x)
  const stream = [r]
  const hidden: number[][] = []
  for (const b of n.blocks) {
    if (b.kind === 'mlp') hidden.push(b.W1.map((row, i) => Math.max(0, row.reduce((s, w, j) => s + w * r[j], b.b1[i]))))
    else hidden.push([])
    const d = delta(b, r)
    r = r.map((v, i) => v + d[i])
    stream.push(r)
  }
  return { logits: mv(n.R, r), stream, hidden }
}

function solveRidge(X: number[][], Y: number[][], lam = 1e-3) {
  const p = X[0].length
  const q = Y[0].length
  const M = Array.from({ length: p }, (_, i) => Array.from({ length: p + q }, (_, j) => (j < p ? X.reduce((s, x) => s + x[i] * x[j], i === j ? lam : 0) : X.reduce((s, x, k) => s + x[i] * Y[k][j - p], 0))))
  for (let i = 0; i < p; i++) {
    let piv = i
    for (let k = i + 1; k < p; k++) if (Math.abs(M[k][i]) > Math.abs(M[piv][i])) piv = k
    ;[M[i], M[piv]] = [M[piv], M[i]]
    const d = M[i][i] || 1e-9
    for (let j = i; j < p + q; j++) M[i][j] /= d
    for (let k = 0; k < p; k++) if (k !== i) {
      const f = M[k][i]
      for (let j = i; j < p + q; j++) M[k][j] -= f * M[i][j]
    }
  }
  return M.map((row) => row.slice(p))
}

function jacobian(b: Block, r: number[]) {
  const e = 1e-4
  const base = delta(b, r)
  return Array.from({ length: D }, (_, j) => {
    const rp = r.slice()
    rp[j] += e
    return delta(b, rp).map((v, i) => (v - base[i]) / e)
  }).flat()
}
const cosine = (u: number[], v: number[]) => {
  const n = Math.hypot(...u) * Math.hypot(...v)
  return n < 1e-12 ? (Math.hypot(...u) < 1e-12 && Math.hypot(...v) < 1e-12 ? 1 : 0) : u.reduce((s, a, i) => s + a * v[i], 0) / n
}

const HUES = [4, 28, 50, 95, 150, 180, 205, 235, 270, 310, 335, 15]
const W = 800
const HGT = 330

export function NetSwap() {
  const [seed] = useState(11)
  const ref = useMemo(() => makeNet(seed), [seed])
  const xs = useMemo(() => {
    const r = rng(99)
    return Array.from({ length: NS }, () => Array.from({ length: NIN }, () => gauss(r)))
  }, [])
  const refOut = useMemo(() => xs.map((x) => forward(ref, x).logits), [ref, xs])
  const refJac = useMemo(() => {
    const sample = xs.slice(0, 40).map((x) => forward(ref, x).stream)
    return ref.blocks.map((b, bi) => sample.map((s) => jacobian(b, s[bi])))
  }, [ref, xs])

  const [net, setNet] = useState<Net>(() => clone(ref))
  const [sel, setSel] = useState(2)
  const [log, setLog] = useState<string[]>(['Pick a block, then swap something into it.'])
  const canvas = useRef<HTMLCanvasElement>(null)
  const netRef = useRef(net)
  const selRef = useRef(sel)
  const flash = useRef<{ block: number; t: number } | null>(null)
  useEffect(() => { netRef.current = net }, [net])
  useEffect(() => { selRef.current = sel }, [sel])

  const metrics = useMemo(() => {
    let agree = 0
    let maxErr = 0
    xs.forEach((x, i) => {
      const o = forward(net, x).logits
      const a = refOut[i]
      if (o.indexOf(Math.max(...o)) === a.indexOf(Math.max(...a))) agree++
      o.forEach((v, k) => (maxErr = Math.max(maxErr, Math.abs(v - a[k]))))
    })
    const sample = xs.slice(0, 40).map((x) => forward(net, x).stream)
    const mech = net.blocks.map((b, bi) => {
      const cur = sample.map((s) => jacobian(b, s[bi]))
      return cur.reduce((s, j, k) => s + cosine(j, refJac[bi][k]), 0) / cur.length
    })
    return { agree: agree / NS, maxErr, mech }
  }, [net, xs, refOut, refJac])

  const apply = useCallback(
    (op: 'permute' | 'split' | 'affine' | 'zero' | 'reset') => {
      if (op === 'reset') {
        setNet(clone(ref))
        setLog(['Reset to the original network.'])
        return
      }
      const n = clone(netRef.current)
      const b = n.blocks[sel]
      const r = rng(Date.now() % 100000)
      if (b.kind !== 'mlp' && op !== 'zero') {
        setLog((l) => [`Block ${sel + 1} is no longer an MLP. Reset to swap again.`, ...l].slice(0, 4))
        return
      }
      if (op === 'permute') {
        const order = b.ids.map((_, i) => i)
        for (let i = order.length - 1; i > 0; i--) {
          const j = Math.floor(r() * (i + 1))
          ;[order[i], order[j]] = [order[j], order[i]]
        }
        b.ids = order.map((o) => b.ids[o])
        b.W1 = order.map((o) => b.W1[o])
        b.b1 = order.map((o) => b.b1[o])
        b.W2 = b.W2.map((row) => order.map((o) => row[o]))
        setLog((l) => [`Block ${sel + 1}: hidden units permuted. Every label moved; the function did not.`, ...l].slice(0, 4))
      } else if (op === 'split') {
        const i = Math.floor(r() * b.ids.length)
        b.ids = [...b.ids, Math.max(...b.ids) + 1]
        b.W1 = [...b.W1, b.W1[i].slice()]
        b.b1 = [...b.b1, b.b1[i]]
        b.W2 = b.W2.map((row) => {
          const half = row[i] / 2
          const nr = row.slice()
          nr[i] = half
          return [...nr, half]
        })
        setLog((l) => [`Block ${sel + 1}: unit ${i} split into two exact halves. Exact algebra, a constructed positive control.`, ...l].slice(0, 4))
      } else if (op === 'affine') {
        const states = xs.map((x) => forward(netRef.current, x).stream[sel])
        const X = states.map((s) => [...s, 1])
        const Y = states.map((s) => delta(b, s))
        const B = solveRidge(X, Y)
        b.A = Array.from({ length: D }, (_, i) => Array.from({ length: D }, (_, j) => B[j][i]))
        b.c = Array.from({ length: D }, (_, i) => B[D][i])
        b.kind = 'affine'
        setLog((l) => [`Block ${sel + 1}: replaced by a least-squares affine map fitted to the block's own outputs.`, ...l].slice(0, 4))
      } else {
        b.kind = 'zero'
        setLog((l) => [`Block ${sel + 1}: replaced by zero.`, ...l].slice(0, 4))
      }
      flash.current = { block: sel, t: performance.now() }
      setNet(n)
    },
    [ref, sel, xs],
  )

  // canvas animation
  useEffect(() => {
    const cv = canvas.current
    if (!cv) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    cv.width = W * dpr
    cv.height = HGT * dpr
    const ctx = cv.getContext('2d')!
    ctx.scale(dpr, dpr)
    let raf = 0
    const colX = (c: number) => 28 + (c / (2 * NB + 1)) * (W - 56)
    const nodeY = (i: number, n: number) => 24 + ((i + 0.5) / n) * (HGT - 48)
    const draw = (now: number) => {
      const n = netRef.current
      const si = Math.floor(now / 1800) % NS
      const phase = (now % 1800) / 1800
      const f = forward(n, xs[si])
      ctx.clearRect(0, 0, W, HGT)
      const wave = (c: number) => Math.max(0, 1 - Math.abs(phase * (2 * NB + 3) - c - 1) / 1.6)
      const edge = (x1: number, y1: number, x2: number, y2: number, w: number, glow: number, hue = 190) => {
        ctx.strokeStyle = `hsla(${w > 0 ? hue : 8}, 70%, ${55 + glow * 25}%, ${Math.min(0.55, 0.05 + Math.abs(w) * 0.12 + glow * 0.35)})`
        ctx.lineWidth = 0.5 + glow * 0.8
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
      }
      for (let b = 0; b < NB; b++) {
        const blk = n.blocks[b]
        const cR = 2 * b
        const cH = 2 * b + 1
        const x0 = colX(cR)
        const xh = colX(cH)
        const x1 = colX(cR + 2)
        const g = wave(cH)
        const isSel = selRef.current === b
        if (isSel) {
          ctx.fillStyle = 'rgba(233,179,107,0.07)'
          ctx.strokeStyle = 'rgba(233,179,107,0.55)'
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.roundRect(x0 + 8, 6, x1 - x0 - 16, HGT - 12, 8)
          ctx.fill()
          ctx.stroke()
        }
        const fl = flash.current && flash.current.block === b ? Math.max(0, 1 - (now - flash.current.t) / 900) : 0
        for (let i = 0; i < D; i++) {
          ctx.strokeStyle = 'rgba(165,221,211,0.10)'
          ctx.lineWidth = 0.6
          ctx.beginPath()
          ctx.moveTo(x0, nodeY(i, D))
          ctx.lineTo(x1, nodeY(i, D))
          ctx.stroke()
        }
        if (blk.kind === 'mlp') {
          const H = blk.ids.length
          for (let h = 0; h < H; h++) {
            for (let i = 0; i < D; i++) {
              edge(x0, nodeY(i, D), xh, nodeY(h, H), blk.W1[h][i], g * (f.hidden[b][h] > 0 ? 1 : 0.2))
              edge(xh, nodeY(h, H), x1, nodeY(i, D), blk.W2[i][h], wave(cH + 1) * (f.hidden[b][h] > 0 ? 1 : 0.2))
            }
          }
          for (let h = 0; h < H; h++) {
            const a = Math.min(1, f.hidden[b][h] / 2)
            const hue = HUES[blk.ids[h] % HUES.length]
            ctx.fillStyle = `hsla(${hue}, 75%, ${35 + a * 35 + fl * 20}%, ${0.55 + a * 0.45})`
            ctx.beginPath()
            ctx.arc(xh, nodeY(h, H), 4.2 + a * 2 + fl * 2, 0, 7)
            ctx.fill()
          }
        } else if (blk.kind === 'affine') {
          for (let i = 0; i < D; i++) for (let j = 0; j < D; j++) edge(x0, nodeY(j, D), x1, nodeY(i, D), blk.A[i][j] * 3, wave(cH), 40)
          ctx.fillStyle = `rgba(233,179,107,${0.5 + fl * 0.4})`
          ctx.fillRect(xh - 3, 40, 6, HGT - 80)
          ctx.font = '10px ui-monospace, Menlo, monospace'
          ctx.fillText('affine', xh - 14, HGT - 28)
        } else {
          ctx.setLineDash([4, 4])
          ctx.strokeStyle = 'rgba(224,138,122,0.5)'
          ctx.beginPath()
          ctx.moveTo(xh, 40)
          ctx.lineTo(xh, HGT - 40)
          ctx.stroke()
          ctx.setLineDash([])
          ctx.fillStyle = 'rgba(224,138,122,0.8)'
          ctx.font = '10px ui-monospace, Menlo, monospace'
          ctx.fillText('zero', xh - 12, HGT - 28)
        }
      }
      // residual stream nodes + output
      for (let c = 0; c <= NB; c++) {
        const x = colX(2 * c)
        for (let i = 0; i < D; i++) {
          const a = Math.min(1, Math.abs(f.stream[c][i]) / 3)
          ctx.fillStyle = `hsla(${f.stream[c][i] >= 0 ? 190 : 8}, 65%, ${40 + a * 30}%, ${0.5 + wave(2 * c) * 0.5})`
          ctx.beginPath()
          ctx.arc(x, nodeY(i, D), 3 + a * 2, 0, 7)
          ctx.fill()
        }
      }
      const xo = colX(2 * NB + 1)
      const mx = Math.max(...f.logits)
      const ex = f.logits.map((v) => Math.exp(v - mx))
      const sm = ex.reduce((s, v) => s + v, 0)
      for (let i = 0; i < D; i++) for (let k = 0; k < NOUT; k++) edge(colX(2 * NB), nodeY(i, D), xo, nodeY(k, NOUT), n.R[k][i], wave(2 * NB + 1))
      const top = f.logits.indexOf(mx)
      for (let k = 0; k < NOUT; k++) {
        ctx.fillStyle = k === top ? '#e9b36b' : 'rgba(247,249,248,0.35)'
        ctx.beginPath()
        ctx.arc(xo, nodeY(k, NOUT), 4 + (ex[k] / sm) * 6, 0, 7)
        ctx.fill()
      }
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [xs])

  const onCanvas = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * W
    const c = ((x - 28) / (W - 56)) * (2 * NB + 1)
    setSel(Math.max(0, Math.min(NB - 1, Math.floor(c / 2))))
  }

  const mech = metrics.mech[sel]
  return (
    <figure className="ef demo">
      <h4>
        <span className="demo-tag">live</span> Swap a module, then ask what changed
      </h4>
      <p className="demo-intro">
        A small residual network, five blocks, computed in your browser. Click a block to select it, then swap something into it. Node color is a unit’s original identity; brightness is its activation on the sample moving through.
      </p>
      <canvas ref={canvas} className="netswap-canvas" style={{ aspectRatio: `${W} / ${HGT}` }} onClick={onCanvas} aria-label="Residual network with five blocks; click a block to select it" />
      <div className="demo-tabs">
        <button type="button" onClick={() => apply('permute')}>Permute hidden units</button>
        <button type="button" onClick={() => apply('split')}>Split a unit (exact)</button>
        <button type="button" onClick={() => apply('affine')}>Replace with fitted affine</button>
        <button type="button" onClick={() => apply('zero')}>Replace with zero</button>
        <button type="button" onClick={() => apply('reset')}>Reset</button>
      </div>
      <div className="ef-compare">
        <div className={metrics.agree > 0.999 ? 'good' : 'bad'}>
          <strong>{(metrics.agree * 100).toFixed(1)}%</strong>
          <span>top-1 agreement with the original, 400 inputs (max logit error {metrics.maxErr.toExponential(1)})</span>
        </div>
        <div className={mech > 0.99 ? 'good' : 'bad'}>
          <strong>{mech.toFixed(3)}</strong>
          <span>mechanism continuity of block {sel + 1}: cosine of local derivatives against the original block</span>
        </div>
      </div>
      <pre className="demo-log">{log.join('\n')}</pre>
      <figcaption>
        A toy, not the repository’s code. Try the affine swap on different blocks: behavior can stay close while derivatives drift, the same shape as the V39 finding (values matched, Jacobian did not). Mechanism continuity here is a derivative-based stand-in, not the repository’s metric.
      </figcaption>
    </figure>
  )
}
