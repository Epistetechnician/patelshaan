import { useEffect, useMemo, useRef, useState } from 'react'

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

const HUES = [4, 28, 50, 95, 150, 180, 205, 235, 270, 310, 335, 15]
const W = 800
const HGT = 330

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
  { block: -1, op: 'none', tag: 'start', status: 'note', title: 'A trained network, five blocks', facts: [], caption: 'Each column of dots is a block’s hidden units; the thin lines are weights. A sample moves left to right.' },
  { block: 1, op: 'permute', tag: 'GPT-2 permutation', status: 'pass', title: 'Relabel every hidden unit', facts: [{ value: '100%', label: 'selected positions changed' }, { value: '3e-7', label: 'mean relative logit error' }, { value: '−0.983 vs 0.9999996', label: 'same-label vs inverse-mapped ablation cosine' }], caption: 'Behavior is untouched, but an ablation that names the same label now hits a different unit. Labels are not causal identity.' },
  { block: 2, op: 'split', tag: 'exact channel split', status: 'pass', title: 'Split one channel into two exact halves', facts: [{ value: '6 / 6', label: 'across OPT-125M and SmolLM2-135M' }, { value: '12 / 12', label: 'wrong-source and random controls failed, as required' }], caption: 'Exact algebra, so it passes. A constructed positive control, not independent retraining.' },
  { block: 3, op: 'affine', tag: 'V8 affine projection', status: 'pass', title: 'Replace the output projection with a fitted affine map', facts: [{ value: '9 / 9', label: 'fresh checkpoint-by-seed cases' }], caption: 'The one narrow learned replacement that held, and the strongest bounded positive in the lab.' },
  { block: 1, op: 'wrong', tag: 'V16 whole MLP', status: 'fail', title: 'Replace a whole nonlinear block', facts: [{ value: 'high', label: 'activation similarity' }, { value: '0 / 9', label: 'causal prediction' }], caption: 'It looks right from the outside and fails the causal gate. Whole nonlinear blocks did not replicate under the frozen gates.' },
  { block: 4, op: 'wrong', tag: 'V14 retention', status: 'fail', title: 'Relative gains, absolute retention', facts: [{ value: '0 / 12', label: 'cases retained absolute performance' }], caption: 'Better than affine on a relative scale did not mean good enough to keep.' },
  { block: 0, op: 'zero', tag: 'V31 null blocks', status: 'fail', title: 'Replace the target with zero, or with noise', facts: [{ value: '100%', label: 'task accuracy kept by random and zero blocks' }], caption: 'The target was never behaviorally indispensable, so the test could not have failed. A passing replacement here would mean nothing.' },
  { block: 2, op: 'affine', tag: 'V39 diagnosis', status: 'fail', title: 'Why the learned block fails', facts: [{ value: '0.10 to 0.12', label: 'value nRMSE: it matches where the function is' }, { value: '0.88 to 0.89', label: 'Jacobian nRMSE: it misses how the function bends' }], caption: 'Derivative underfitting. The module learns values but not local derivatives, even along the training directions.' },
]
const STEP_MS = 5200

function applyStep(ref: Net, step: Step, r: () => number): Net {
  const n = clone(ref)
  if (step.block < 0) return n
  const b = n.blocks[step.block]
  if (step.op === 'permute') {
    const order = b.ids.map((_, i) => i)
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1))
      ;[order[i], order[j]] = [order[j], order[i]]
    }
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
    const B = solveRidge(states.map((s) => [...s, 1]), states.map((s) => delta(b, s)))
    b.A = Array.from({ length: D }, (_, i) => Array.from({ length: D }, (_, j) => B[j][i]))
    b.c = Array.from({ length: D }, (_, i) => B[D][i])
    b.kind = 'affine'
  } else if (step.op === 'wrong') {
    b.W1 = b.W1.map((row) => row.map((w) => w + gauss(r) * 0.5))
    b.W2 = b.W2.map((row) => row.map((w) => w + gauss(r) * 0.5))
  } else if (step.op === 'zero') {
    b.kind = 'zero'
  }
  return n
}

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
  const [idx, setIdx] = useState(0)
  const canvas = useRef<HTMLCanvasElement>(null)
  const state = useRef({ idx: 0, t0: 0 })

  useEffect(() => {
    state.current.t0 = performance.now()
    const id = window.setInterval(() => {
      setIdx((i) => {
        const nx = (i + 1) % STEPS.length
        state.current = { idx: nx, t0: performance.now() }
        return nx
      })
    }, STEP_MS)
    return () => window.clearInterval(id)
  }, [])

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
      const { idx: si, t0 } = state.current
      const step = STEPS[si]
      const prev = si === 0 ? ref : nets[si - 1]
      // swapped state appears after 1.1s into the step; before that show the pre-swap net
      const sinceStep = now - t0
      const swapped = sinceStep > 1100
      const n = swapped ? nets[si] : step.op === 'none' ? nets[si] : ref
      void prev
      const sample = Math.floor(now / 1700) % xs.length
      const phase = (now % 1700) / 1700
      const f = forward(n, xs[sample])
      ctx.clearRect(0, 0, W, HGT)
      const wave = (c: number) => Math.max(0, 1 - Math.abs(phase * (2 * NB + 3) - c - 1) / 1.6)
      const failTint = step.status === 'fail' && swapped
      const edge = (x1: number, y1: number, x2: number, y2: number, w: number, glow: number, hue = 190) => {
        const h = failTint && glow > 0.05 ? 8 : w > 0 ? hue : 8
        ctx.strokeStyle = `hsla(${h}, 70%, ${55 + glow * 25}%, ${Math.min(0.6, 0.06 + Math.abs(w) * 0.13 + glow * 0.35)})`
        ctx.lineWidth = 0.5 + glow * 0.8
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
      }
      const pulse = swapped ? Math.max(0, 1 - (sinceStep - 1100) / 900) : 0
      for (let b = 0; b < NB; b++) {
        const blk = n.blocks[b]
        const x0 = colX(2 * b)
        const xh = colX(2 * b + 1)
        const x1 = colX(2 * b + 2)
        const g = wave(2 * b + 1)
        const target = step.block === b
        if (target) {
          const col = step.status === 'fail' ? '224,138,122' : step.status === 'pass' ? '63,165,147' : '233,179,107'
          ctx.fillStyle = `rgba(${col},${0.06 + pulse * 0.1})`
          ctx.strokeStyle = `rgba(${col},0.7)`
          ctx.lineWidth = 1.2
          ctx.beginPath()
          ctx.roundRect(x0 + 8, 6, x1 - x0 - 16, HGT - 12, 8)
          ctx.fill()
          ctx.stroke()
        }
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
              const on = f.hidden[b][h] > 0 ? 1 : 0.2
              edge(x0, nodeY(i, D), xh, nodeY(h, H), blk.W1[h][i], g * on)
              edge(xh, nodeY(h, H), x1, nodeY(i, D), blk.W2[i][h], wave(2 * b + 2) * on)
            }
          }
          for (let h = 0; h < H; h++) {
            const a = Math.min(1, f.hidden[b][h] / 2)
            const hue = HUES[blk.ids[h] % HUES.length]
            ctx.fillStyle = `hsla(${hue}, 75%, ${35 + a * 35 + (target ? pulse * 20 : 0)}%, ${0.55 + a * 0.45})`
            ctx.beginPath()
            ctx.arc(xh, nodeY(h, H), 4.2 + a * 2 + (target ? pulse * 2 : 0), 0, 7)
            ctx.fill()
          }
        } else if (blk.kind === 'affine') {
          for (let i = 0; i < D; i++) for (let j = 0; j < D; j++) edge(x0, nodeY(j, D), x1, nodeY(i, D), blk.A[i][j] * 3, wave(2 * b + 1), 40)
          ctx.fillStyle = 'rgba(233,179,107,0.7)'
          ctx.fillRect(xh - 3, 40, 6, HGT - 80)
          ctx.font = '10px ui-monospace, Menlo, monospace'
          ctx.fillText('affine', xh - 14, HGT - 24)
        } else {
          ctx.setLineDash([4, 4])
          ctx.strokeStyle = 'rgba(224,138,122,0.6)'
          ctx.beginPath()
          ctx.moveTo(xh, 40)
          ctx.lineTo(xh, HGT - 40)
          ctx.stroke()
          ctx.setLineDash([])
          ctx.fillStyle = 'rgba(224,138,122,0.85)'
          ctx.font = '10px ui-monospace, Menlo, monospace'
          ctx.fillText('zero', xh - 12, HGT - 24)
        }
      }
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
  }, [ref, nets, xs])

  const step = STEPS[idx]
  return (
    <figure className="ef demo storyboard">
      <h4>
        <span className="demo-tag">what happened</span> Swapping modules, from the lab’s own runs
      </h4>
      <canvas ref={canvas} className="netswap-canvas" style={{ aspectRatio: `${W} / ${HGT}` }} role="img" aria-label="Animated network showing modules being swapped" />
      <ol className="sb-steps" aria-label="Experiments in order">
        {STEPS.map((s, i) => (
          <li key={s.tag} className={`${i === idx ? 'on' : ''} ${s.status}`}>
            {s.tag}
          </li>
        ))}
      </ol>
      <div className="sb-card" key={idx}>
        <span className={`ef-chip ${step.status === 'note' ? 'open' : step.status}`}>{step.status === 'note' ? 'start' : step.status}</span>
        <h5>{step.title}</h5>
        <div className="ef-compare">
          {step.facts.map((f) => (
            <div key={f.label} className={step.status === 'fail' ? 'bad' : step.status === 'pass' ? 'good' : ''}>
              <strong>{f.value}</strong>
              <span>{f.label}</span>
            </div>
          ))}
        </div>
        <p>{step.caption}</p>
      </div>
      <figcaption>
        The numbers are the lab’s reported results (RESEARCH.md). The network drawing is schematic: a small stand-in for the language models, used to show what each swap does to structure.
      </figcaption>
    </figure>
  )
}
