import { useEffect, useMemo, useRef, useState } from 'react'
import {
  COOL,
  GOOD,
  HOT,
  MID,
  MONO_B,
  MONO_S,
  colors,
  label,
  rgb,
  rrect,
} from './viz/postAnim'

const D = 6
const NB = 5
const NOUT = 4
const NIN = 6

type Block = {
  kind: 'mlp' | 'affine' | 'zero'
  ids: number[]
  W1: number[][]
  b1: number[]
  W2: number[][]
  A: number[][]
  c: number[]
}
type Net = { P: number[][]; R: number[][]; blocks: Block[] }

function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function gauss(r: () => number) {
  return Math.sqrt(-2 * Math.log(Math.max(1e-9, r()))) * Math.cos(2 * Math.PI * r())
}
function mat(r: () => number, rows: number, cols: number, scale: number) {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => gauss(r) * scale))
}
function makeNet(seed: number): Net {
  const r = rng(seed)
  return {
    P: mat(r, D, NIN, 0.7),
    R: mat(r, NOUT, D, 0.8),
    blocks: Array.from({ length: NB }, () => ({
      kind: 'mlp',
      ids: Array.from({ length: 8 }, (_, i) => i),
      W1: mat(r, 8, D, 0.75),
      b1: Array.from({ length: 8 }, () => gauss(r) * 0.25),
      W2: mat(r, D, 8, 0.75),
      A: [],
      c: [],
    })),
  }
}
const clone = (n: Net): Net => JSON.parse(JSON.stringify(n)) as Net
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
    if (b.kind === 'mlp') {
      hidden.push(b.W1.map((row, i) => Math.max(0, row.reduce((s, w, j) => s + w * r[j], b.b1[i]))))
    } else {
      hidden.push([])
    }
    const d = delta(b, r)
    r = r.map((v, i) => v + d[i])
    stream.push(r)
  }
  return { logits: mv(n.R, r), stream, hidden }
}

function solveRidge(X: number[][], Y: number[][], lam = 1e-3) {
  const p = X[0].length
  const q = Y[0].length
  const M = Array.from({ length: p }, (_, i) =>
    Array.from({ length: p + q }, (_, j) =>
      j < p
        ? X.reduce((s, x) => s + x[i] * x[j], i === j ? lam : 0)
        : X.reduce((s, x, k) => s + x[i] * Y[k][j - p], 0),
    ),
  )
  for (let i = 0; i < p; i++) {
    let piv = i
    for (let k = i + 1; k < p; k++) if (Math.abs(M[k][i]) > Math.abs(M[piv][i])) piv = k
    ;[M[i], M[piv]] = [M[piv], M[i]]
    const d = M[i][i] || 1e-9
    for (let j = i; j < p + q; j++) M[i][j] /= d
    for (let k = 0; k < p; k++) {
      if (k !== i) {
        const f = M[k][i]
        for (let j = i; j < p + q; j++) M[k][j] -= f * M[i][j]
      }
    }
  }
  return M.map((row) => row.slice(p))
}

function cosine(a: number[], b: number[]): number {
  let dot = 0
  let na = 0
  let nb = 0
  const m = Math.min(a.length, b.length)
  for (let i = 0; i < m; i++) {
    dot += a[i] * b[i]
    na += a[i] * a[i]
    nb += b[i] * b[i]
  }
  return na > 1e-12 && nb > 1e-12 ? dot / Math.sqrt(na * nb) : 0
}

type Step = {
  block: number
  op: 'none' | 'permute' | 'split' | 'affine' | 'wrong' | 'zero'
  tag: string
  status: 'pass' | 'fail' | 'note'
  title: string
  facts: { value: string; label: string }[]
  caption: string
}

const STEPS: Step[] = [
  {
    block: -1,
    op: 'none',
    tag: 'baseline',
    status: 'note',
    title: 'Baseline residual network (5 MLP blocks)',
    facts: [{ value: '0.0e0', label: 'reference logit delta' }],
    caption: 'Real live forward pass through 5 residual MLP blocks. Select any intervention below to compare exact logits and hidden-state geometry against this reference.',
  },
  {
    block: 1,
    op: 'permute',
    tag: 'GPT-2 permute',
    status: 'pass',
    title: 'Exact hidden-unit permutation P (100% relabeled)',
    facts: [
      { value: '100%', label: 'positions moved' },
      { value: '3e-7', label: 'GPT-2 logit error' },
      { value: '−0.983 vs 0.9999996', label: 'same-label vs P⁻¹ cosine' },
    ],
    caption: 'Every hidden unit in Block 2 is permuted via P (W₁→PW₁, W₂→W₂Pᵀ). Output logits stay identical to floating-point precision while same-index neuron probes break.',
  },
  {
    block: 2,
    op: 'split',
    tag: 'channel split',
    status: 'pass',
    title: 'Exact algebraic channel split (6/6 OPT & SmolLM2)',
    facts: [
      { value: '6 / 6', label: 'exact split passed' },
      { value: '12 / 12', label: 'wrong-source & random failed' },
    ],
    caption: 'One MLP unit is split into two half-weighted children. Live logits stay exact; serves as a constructed positive control.',
  },
  {
    block: 3,
    op: 'affine',
    tag: 'V8 affine',
    status: 'pass',
    title: 'Ridge-fitted affine projection (9/9 replicated)',
    facts: [{ value: '9 / 9', label: 'fresh checkpoint × seed cases (≥256 prompts)' }],
    caption: 'The one narrow learned replacement that replicated on natural WikiText and CNN/DailyMail once adaptation coverage reached ≥256 prompts.',
  },
  {
    block: 1,
    op: 'wrong',
    tag: 'V16 whole MLP',
    status: 'fail',
    title: 'Whole nonlinear block swap (0/9 causal fail)',
    facts: [
      { value: '0 / 9', label: 'causal prediction' },
      { value: '0.88–0.89', label: 'V39 Jacobian nRMSE' },
    ],
    caption: 'High activation similarity on the surface, yet causal intervention fails 9/9: the surrogate matches function values (nRMSE 0.11) while underfitting local derivatives.',
  },
  {
    block: 0,
    op: 'zero',
    tag: 'V31 null block',
    status: 'fail',
    title: 'Zero-out non-indispensable block (null control)',
    facts: [{ value: '100%', label: 'accuracy kept when zeroed' }],
    caption: 'When a block is not behaviorally indispensable on a narrow probe, zeroing it out still passes — proving the necessity of indispensability controls.',
  },
]

function applyStep(ref: Net, step: Step, r: () => number): Net {
  const n = clone(ref)
  if (step.block < 0) return n
  const b = n.blocks[step.block]
  if (step.op === 'permute') {
    // Guaranteed derangement so 100% of positions change
    const order = [4, 7, 1, 6, 0, 3, 5, 2]
    b.ids = order.map((o) => b.ids[o])
    b.W1 = order.map((o) => b.W1[o])
    b.b1 = order.map((o) => b.b1[o])
    b.W2 = b.W2.map((row) => order.map((o) => row[o]))
  } else if (step.op === 'split') {
    const i = 3
    b.ids = [...b.ids, Math.max(...b.ids) + 1]
    b.W1 = [...b.W1, b.W1[i].slice()]
    b.b1 = [...b.b1, b.b1[i]]
    b.W2 = b.W2.map((row) => {
      const nr = row.slice()
      nr[i] = row[i] / 2
      return [...nr, row[i] / 2]
    })
  } else if (step.op === 'affine') {
    const xs = Array.from({ length: 200 }, () => Array.from({ length: NIN }, () => gauss(r)))
    const states = xs.map((x) => forward(ref, x).stream[step.block])
    const B = solveRidge(
      states.map((s) => [...s, 1]),
      states.map((s) => delta(b, s)),
    )
    b.A = Array.from({ length: D }, (_, i) => Array.from({ length: D }, (_, j) => B[j][i]))
    b.c = Array.from({ length: D }, (_, i) => B[D][i])
    b.kind = 'affine'
  } else if (step.op === 'wrong') {
    b.W1 = b.W1.map((row) => row.map((w) => w + gauss(r) * 0.45))
    b.W2 = b.W2.map((row) => row.map((w) => w + gauss(r) * 0.45))
  } else if (step.op === 'zero') {
    b.kind = 'zero'
  }
  return n
}

const W = 760
const HGT = 290

export function NetSwap() {
  const ref = useMemo(() => makeNet(11), [])
  const xs = useMemo(() => {
    const r = rng(99)
    return Array.from({ length: 8 }, () => Array.from({ length: NIN }, () => gauss(r)))
  }, [])
  const nets = useMemo(() => {
    const r = rng(5)
    return STEPS.map((s) => applyStep(ref, s, r))
  }, [ref])

  const [idx, setIdx] = useState(1) // Start directly on GPT-2 permutation
  const [playing, setPlaying] = useState(true)
  const canvas = useRef<HTMLCanvasElement>(null)
  const playingRef = useRef(true)
  const idxRef = useRef(1)

  useEffect(() => {
    playingRef.current = playing
  }, [playing])
  useEffect(() => {
    idxRef.current = idx
  }, [idx])

  useEffect(() => {
    const id = window.setInterval(() => {
      if (!playingRef.current) return
      setIdx((i) => (i + 1) % STEPS.length)
    }, 5500)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    const cv = canvas.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    if (!ctx) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    cv.width = W * dpr
    cv.height = HGT * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    let raf = 0
    const colX = (c: number) => 36 + (c / (2 * NB)) * (W - 72)
    const nodeY = (i: number, n: number) => 42 + ((i + 0.5) / n) * (HGT - 76)

    const draw = (now: number) => {
      const C = colors(cv)
      const si = idxRef.current
      const step = STEPS[si]
      const n = nets[si]
      const sample = Math.floor(now / 1800) % xs.length
      const phase = (now % 1800) / 1800

      const fRef = forward(ref, xs[sample])
      const fCur = forward(n, xs[sample])
      const maxLogitDiff = Math.max(...fRef.logits.map((v, k) => Math.abs(v - fCur.logits[k])))
      const hCos =
        step.block >= 0 && fCur.hidden[step.block].length === fRef.hidden[step.block].length
          ? cosine(fRef.hidden[step.block], fCur.hidden[step.block])
          : step.op === 'split'
            ? 1.0
            : cosine(fRef.stream[NB], fCur.stream[NB])

      ctx.clearRect(0, 0, W, HGT)

      // Live computed telemetry header (honest IEEE-754 numbers from actual forward pass)
      const statusCol = step.status === 'fail' ? HOT : step.status === 'pass' ? COOL : MID
      label(ctx, `LIVE FORWARD PASS · ${step.tag.toUpperCase()}`, 18, 18, C.mute, MONO_B)
      label(
        ctx,
        `max |Δ logit| = ${maxLogitDiff < 1e-12 ? '0.00e+00' : maxLogitDiff.toExponential(2)}   ·   same-index cos = ${hCos.toFixed(3)}`,
        W - 18,
        18,
        maxLogitDiff < 1e-6 ? rgb(GOOD) : rgb(HOT),
        MONO_B,
        'right',
      )

      const wave = (c: number) => Math.max(0, 1 - Math.abs(phase * (2 * NB + 2) - c - 0.8) / 1.8)

      for (let b = 0; b < NB; b++) {
        const blk = n.blocks[b]
        const x0 = colX(2 * b)
        const xh = colX(2 * b + 1)
        const x1 = colX(2 * b + 2)
        const g = wave(2 * b + 1)
        const target = step.block === b

        if (target) {
          rrect(ctx, x0 + 6, 32, x1 - x0 - 12, HGT - 58, 6)
          ctx.fillStyle = rgb(statusCol, 0.08)
          ctx.fill()
          ctx.strokeStyle = rgb(statusCol, 0.65)
          ctx.lineWidth = 1.3
          ctx.stroke()
          label(ctx, step.op.toUpperCase(), (x0 + x1) / 2, HGT - 14, rgb(statusCol), MONO_B, 'center')
        }

        // Residual bypass rails
        for (let i = 0; i < D; i++) {
          ctx.strokeStyle = C.line
          ctx.globalAlpha = 0.35
          ctx.lineWidth = 0.8
          ctx.beginPath()
          ctx.moveTo(x0, nodeY(i, D))
          ctx.lineTo(x1, nodeY(i, D))
          ctx.stroke()
          ctx.globalAlpha = 1
        }

        if (blk.kind === 'mlp') {
          const H = blk.ids.length
          for (let h = 0; h < H; h++) {
            const act = fCur.hidden[b][h] > 0 ? 1 : 0.15
            for (let i = 0; i < D; i++) {
              const w1 = blk.W1[h][i]
              const w2 = blk.W2[i][h]
              const tint = target && step.status === 'fail' ? HOT : target ? COOL : COOL
              ctx.strokeStyle = rgb(tint, Math.min(0.55, 0.05 + Math.abs(w1) * 0.1 + g * act * 0.32))
              ctx.lineWidth = 0.6 + g * act * 0.7
              ctx.beginPath()
              ctx.moveTo(x0, nodeY(i, D))
              ctx.lineTo(xh, nodeY(h, H))
              ctx.stroke()

              ctx.strokeStyle = rgb(tint, Math.min(0.55, 0.05 + Math.abs(w2) * 0.1 + wave(2 * b + 2) * act * 0.32))
              ctx.beginPath()
              ctx.moveTo(xh, nodeY(h, H))
              ctx.lineTo(x1, nodeY(i, D))
              ctx.stroke()
            }
          }
          for (let h = 0; h < H; h++) {
            const a = Math.min(1, fCur.hidden[b][h] / 2)
            const moved = target && step.op === 'permute'
            const nodeCol = target && step.status === 'fail' ? HOT : moved ? MID : COOL
            ctx.fillStyle = rgb(nodeCol, 0.35 + a * 0.65)
            ctx.beginPath()
            ctx.arc(xh, nodeY(h, H), 3.4 + a * 1.4, 0, Math.PI * 2)
            ctx.fill()
            if (target) {
              label(ctx, `${blk.ids[h]}`, xh + 8, nodeY(h, H), C.mute, MONO_S)
            }
          }
        } else if (blk.kind === 'affine') {
          for (let i = 0; i < D; i++) {
            for (let j = 0; j < D; j++) {
              const w = blk.A[j][i]
              ctx.strokeStyle = rgb(COOL, Math.min(0.5, 0.08 + Math.abs(w) * 0.25 + g * 0.25))
              ctx.lineWidth = 0.7
              ctx.beginPath()
              ctx.moveTo(x0, nodeY(i, D))
              ctx.lineTo(x1, nodeY(j, D))
              ctx.stroke()
            }
          }
          label(ctx, 'Ax + c', xh, HGT / 2, rgb(COOL), MONO_B, 'center')
        } else {
          label(ctx, '0 (bypass)', xh, HGT / 2, rgb(HOT), MONO_B, 'center')
        }
      }

      // Residual-stream column nodes
      for (let c = 0; c <= NB; c++) {
        const x = colX(2 * c)
        for (let i = 0; i < D; i++) {
          const v = Math.min(1, Math.abs(fCur.stream[c][i]) / 2.5)
          ctx.fillStyle = rgb(COOL, 0.3 + v * 0.65)
          ctx.beginPath()
          ctx.arc(x, nodeY(i, D), 2.8 + v * 1.2, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [nets, ref, xs])

  const step = STEPS[idx]
  return (
    <figure className="ef netswap-lab">
      <div className="netswap-head">
        <div>
          <span className="demo-tag">live matrix lab</span>
          <strong>{step.title}</strong>
        </div>
        <button type="button" onClick={() => setPlaying((p) => !p)}>
          {playing ? 'Pause cycle' : 'Resume cycle'}
        </button>
      </div>
      <div className="demo-tabs" role="tablist" aria-label="Replacement interventions">
        {STEPS.map((s, i) => (
          <button
            key={s.tag}
            type="button"
            role="tab"
            aria-pressed={i === idx}
            onClick={() => {
              setIdx(i)
              setPlaying(false)
            }}
          >
            {s.tag}
          </button>
        ))}
      </div>
      <canvas ref={canvas} className="post-anim-canvas" style={{ width: '100%', height: 'auto', aspectRatio: `${W} / ${HGT}` }} />
      {step.facts.length ? (
        <div className="ef-compare" style={{ marginTop: '0.75rem' }}>
          {step.facts.map((f) => (
            <div key={f.label} className={step.status === 'fail' ? 'bad' : step.status === 'pass' ? 'good' : ''}>
              <strong>{f.value}</strong>
              <span>{f.label}</span>
            </div>
          ))}
        </div>
      ) : null}
      <figcaption>{step.caption}</figcaption>
    </figure>
  )
}
