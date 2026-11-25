import { useEffect, useRef, useState } from 'react'
import {
  COOL,
  GOOD,
  HOT,
  MID,
  MONO_B,
  MONO_S,
  SANS_B,
  SERIF_I,
  arrow,
  chip,
  clamp,
  drawTooltip,
  ease,
  label,
  legend,
  lerp,
  rgb,
  rrect,
  runCanvas,
  seg,
  type CanvasController,
  type PointerState,
  type RGB,
  type ThemeColors,
} from './postAnim'
import { RichText } from '../components/RichText'

/* ---------- Verified JSON loader with in-memory cache ---------- */
const jsonCache = new Map<string, unknown>()

function useVizJson<T>(file?: string): T | null {
  const [fetched, setFetched] = useState<{ file: string; value: T } | null>(null)
  useEffect(() => {
    if (!file || jsonCache.has(file)) return
    let alive = true
    fetch(`/viz-data/${file}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d) {
          jsonCache.set(file, d)
          setFetched({ file, value: d as T })
        }
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [file])
  if (!file) return null
  if (jsonCache.has(file)) return jsonCache.get(file) as T
  return fetched?.file === file ? fetched.value : null
}

type AnimMode = { id: string; label: string }

type AnimDef = {
  dataFile?: string
  cycleMs: number
  height: (W: number) => number
  ariaLabel: string
  caption: string
  provenance?: string
  hoverHint?: string
  modes?: AnimMode[]
  render: (
    ctx: CanvasRenderingContext2D,
    W: number,
    H: number,
    p: number,
    C: ThemeColors,
    data: unknown,
    ptr: PointerState,
    mode: string,
  ) => void
}

/* ============================================================================
   1. ARC MEMBRANE HERO: 400-Problem Live A100 MATH-500 Matrix Explorer
   ============================================================================ */
type ArcProblem = {
  uid: string
  lvl: number
  subj: string
  b_ok: boolean
  b_cut: boolean
  b_tok: number | null
  t4_ok: boolean
  ab_ok: boolean | null
  c_ok: boolean
  c_cut: boolean
  c_tok: number
  pred: string
  gold: string
  flip: 'f2p' | 'p2p' | 'p2f' | 'f2f'
  slice: string
}

type ArcJson = {
  kl_reduction_factor: number
  qr_bases_count: number
  ed25519_payload_sha256?: string
  arms: { id: string; label: string; acc: number; cut_rate: number; replay_kl: number; n: number }[]
  level_breakdown: {
    level: number
    n: number
    base_acc?: number
    acc: number
    cut_rate: number
    avg_tokens: number
    fail_to_pass?: number
    pass_to_fail?: number
  }[]
  paired_traces?: {
    uid: string
    level: number
    subject: string
    base_ok: boolean
    base_cut: boolean
    base_tokens: number
    arm_c_ok: boolean
    arm_c_cut: boolean
    arm_c_tokens: number
    gold: string
    pred?: string
  }[]
  problems_400?: ArcProblem[]
}

function renderArcHero(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  p: number,
  C: ThemeColors,
  raw: unknown,
  ptr: PointerState,
) {
  const data = raw as ArcJson | null
  const probs = data?.problems_400 ?? []
  const compact = W < 620
  const padL = 18
  const padR = 18
  const rightW = compact ? 0 : Math.min(248, Math.floor(W * 0.31))
  const gridW = W - padL - padR - (compact ? 0 : rightW + 18)
  const topY = 42
  const botY = H - 40
  const gridH = botY - topY

  // Narrative 3-act pacing: Base (0..0.22) -> Arm C sweep (0.22..0.64) -> Hold (0.64..1.0)
  const sweep = ease(seg(p, 0.22, 0.64))
  const inArmC = p >= 0.22

  label(
    ctx,
    inArmC
      ? 'ALL 400 SEALED A100 MATH-500 PROBLEMS · TRACK 5 ARM C QR-NULLSPACE SFT (n = 400)'
      : 'ALL 400 SEALED A100 MATH-500 PROBLEMS · BASE QWEN3-30B-A3B (79.5% HIT 1536 CAP)',
    padL,
    18,
    inArmC ? rgb(COOL) : C.mute,
    MONO_B,
  )

  const cols = 25
  const rows = 16
  const gap = 3
  const cellW = (gridW - (cols - 1) * gap) / cols
  const cellH = Math.min(13, (gridH - (rows - 1) * gap) / rows)
  const actualGridH = rows * cellH + (rows - 1) * gap
  const startY = topY + Math.max(0, (gridH - actualGridH) / 2)

  let hovered: { pr: ArcProblem; cx: number; cy: number } | null = null
  let curF2P = 0
  let curP2F = 0
  let curSolved = 0

  for (let idx = 0; idx < 400; idx++) {
    const pr = probs[idx]
    const col = idx % cols
    const row = Math.floor(idx / cols)
    const x = padL + col * (cellW + gap)
    const y = startY + row * (cellH + gap)

    const cellThreshold = idx / 400
    const transitioned = sweep > cellThreshold

    let fillCol: RGB = [90, 96, 104]
    let fillAlpha = C.dark ? 0.34 : 0.22

    if (pr) {
      if (!transitioned) {
        if (pr.b_ok) {
          fillCol = COOL
          fillAlpha = 0.72
          curSolved++
        } else if (pr.b_cut) {
          fillCol = HOT
          fillAlpha = 0.24
        }
      } else {
        if (pr.c_ok) curSolved++
        if (pr.flip === 'f2p') {
          fillCol = GOOD
          fillAlpha = 0.92
          curF2P++
        } else if (pr.flip === 'p2p') {
          fillCol = COOL
          fillAlpha = 0.76
        } else if (pr.flip === 'p2f') {
          fillCol = HOT
          fillAlpha = 0.95
          curP2F++
        } else {
          fillCol = [92, 96, 102]
          fillAlpha = C.dark ? 0.28 : 0.18
        }
      }

      if (
        ptr.inside &&
        ptr.x >= x - 1 &&
        ptr.x <= x + cellW + 1 &&
        ptr.y >= y - 1 &&
        ptr.y <= y + cellH + 1
      ) {
        hovered = { pr, cx: x + cellW / 2, cy: y + cellH / 2 }
      }
    }

    rrect(ctx, x, y, cellW, cellH, 2)
    ctx.fillStyle = rgb(fillCol, fillAlpha)
    ctx.fill()

    if (hovered?.pr === pr) {
      ctx.strokeStyle = C.fg
      ctx.lineWidth = 1.8
      ctx.stroke()
    }
  }

  // Right-hand telemetry column (on wide viewports)
  if (!compact && rightW > 120) {
    const rx = padL + gridW + 20
    const rw = rightW - 2
    const accPct = probs.length ? (curSolved / probs.length) * 100 : lerp(39.75, 76.25, sweep)

    label(ctx, 'SEALED HOLDOUT (n=400)', rx, startY + 6, C.mute, MONO_S)
    label(
      ctx,
      `${accPct.toFixed(1)}%`,
      rx,
      startY + 34,
      sweep > 0.5 ? rgb(GOOD) : C.fg,
      '700 26px "SF Mono", ui-monospace, monospace',
    )
    label(
      ctx,
      sweep > 0.05 ? `+${(accPct - 39.75).toFixed(1)} pp vs base` : 'Base 159/400 solved',
      rx,
      startY + 56,
      sweep > 0.05 ? rgb(GOOD) : C.mute,
      MONO_S,
    )

    // Live flip counters
    const boxY = startY + 76
    chip(ctx, rx, boxY, rw, 24, `F→P flips: +${probs.length ? curF2P : Math.round(152 * sweep)}`, {
      fill: rgb(GOOD, 0.14),
      stroke: rgb(GOOD, 0.55),
      color: rgb(GOOD),
      font: MONO_B,
    })
    chip(ctx, rx, boxY + 30, rw, 24, `P→F regressions: −${probs.length ? curP2F : Math.round(6 * sweep)}`, {
      fill: rgb(HOT, 0.13),
      stroke: rgb(HOT, 0.5),
      color: rgb(HOT),
      font: MONO_S,
    })

    // Replay KL contrast bar
    const klY = boxY + 70
    label(ctx, 'REPLAY KL DRIFT (180× LOWER)', rx, klY, C.mute, MONO_S)
    label(ctx, 'Arm B unproj.', rx, klY + 18, C.mute, MONO_S)
    rrect(ctx, rx, klY + 27, rw, 8, 2)
    ctx.fillStyle = rgb(HOT, 0.82)
    ctx.fill()
    label(ctx, '0.1088 (REVERT)', rx + rw, klY + 18, rgb(HOT), MONO_S, 'right')

    label(ctx, 'Arm C QR-SFT', rx, klY + 48, C.fg, MONO_S)
    rrect(ctx, rx, klY + 57, rw, 8, 2)
    ctx.fillStyle = C.soft
    ctx.fill()
    rrect(ctx, rx, klY + 57, Math.max(3, rw * (0.000605 / 0.1088)), 8, 2)
    ctx.fillStyle = rgb(COOL, 0.95)
    ctx.fill()
    label(ctx, '0.000605 (KEEP)', rx + rw, klY + 48, rgb(COOL), MONO_B, 'right')

    label(ctx, 'McNemar p = 1.12e-37', rx, klY + 80, C.mute, MONO_S)
    label(ctx, '844 QR bases · Ed25519', rx, klY + 95, C.mute, MONO_S)
  }

  legend(
    ctx,
    [
      { label: 'F→P flip (152)', c: rgb(GOOD) },
      { label: 'P→P kept (153)', c: rgb(COOL) },
      { label: 'P→F regress (6)', c: rgb(HOT) },
      { label: 'F→F unsolved (89)', c: rgb([92, 96, 102], 0.5) },
    ],
    W / 2,
    H - 14,
    C,
  )

  if (hovered) {
    const pr = hovered.pr
    const flipTag =
      pr.flip === 'f2p'
        ? 'F→P BREAKTHROUGH'
        : pr.flip === 'p2f'
          ? 'P→F REGRESSION'
          : pr.flip === 'p2p'
            ? 'P→P PRESERVED'
            : 'F→F UNSOLVED'
    const accent = pr.flip === 'f2p' ? GOOD : pr.flip === 'p2f' ? HOT : pr.flip === 'p2p' ? COOL : MID
    const baseStr = `${pr.b_ok ? 'PASS ✓' : pr.b_cut ? 'CUT ✗' : 'FAIL ✗'}${pr.b_tok ? ` (${pr.b_tok}t)` : ''}`
    const armCStr = `${pr.c_ok ? 'PASS ✓' : pr.c_cut ? 'CUT ✗' : 'FAIL ✗'} (${pr.c_tok}t)`
    drawTooltip(
      ctx,
      W,
      H,
      hovered.cx,
      hovered.cy,
      [
        { text: `${pr.uid}  [L${pr.lvl} · ${pr.subj}]`, bold: true },
        { text: flipTag, bold: true, color: rgb(accent) },
        { text: `Base: ${baseStr}  →  Arm C: ${armCStr}`, color: C.fg },
        { text: `gold: ${pr.gold || '--'}   pred: ${pr.pred || '--'}`, color: C.mute },
      ],
      C,
      accent,
    )
  }
}

function renderArcRunReplay(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  p: number,
  C: ThemeColors,
  raw: unknown,
  ptr: PointerState,
) {
  const data = raw as ArcJson | null
  const traces = data?.paired_traces ?? []
  label(ctx, 'PAIRED SPOTCHECK TOKEN RACE: BASE (1536 CAP) vs. ARM C QR-NULLSPACE SFT', 18, 18, C.mute, MONO_B)

  const leftW = Math.min(176, Math.max(138, Math.floor(W * 0.27)))
  const rightPad = 92
  const trackW = Math.max(120, W - leftW - rightPad)
  const maxTok = 1536
  const curTok = ease(seg(p, 0.04, 0.8)) * maxTok

  const wallX = leftW + trackW
  ctx.save()
  ctx.setLineDash([4, 3])
  ctx.strokeStyle = rgb(HOT, 0.55)
  ctx.beginPath()
  ctx.moveTo(wallX, 34)
  ctx.lineTo(wallX, H - 36)
  ctx.stroke()
  ctx.restore()
  label(ctx, '1536 cap', wallX, 30, rgb(HOT), MONO_S, 'right')

  let hovered = null as { tr: NonNullable<ArcJson['paired_traces']>[number]; y: number } | null

  const sliced = traces.slice(0, 8)
  for (let i = 0; i < sliced.length; i++) {
    const tr = sliced[i]
    const y = 44 + i * 31
    if (ptr.inside && ptr.y >= y - 2 && ptr.y <= y + 26) {
      hovered = { tr, y: y + 12 }
      rrect(ctx, 10, y - 2, W - 20, 27, 4)
      ctx.fillStyle = rgb(COOL, 0.08)
      ctx.fill()
    }
    const shortId = tr.uid.replace('intermediate_algebra', 'interm_alg')
    label(ctx, `L${tr.level} ${shortId}`, 18, y + 11, C.fg, MONO_S)

    const baseNow = Math.min(curTok, tr.base_tokens)
    const bw = (baseNow / maxTok) * trackW
    rrect(ctx, leftW, y + 1, trackW, 8, 2)
    ctx.fillStyle = C.soft
    ctx.fill()
    rrect(ctx, leftW, y + 1, bw, 8, 2)
    ctx.fillStyle = rgb(tr.base_ok ? MID : HOT, 0.78)
    ctx.fill()

    const cNow = Math.min(curTok, tr.arm_c_tokens)
    const cw = (cNow / maxTok) * trackW
    rrect(ctx, leftW, y + 12, trackW, 10, 2)
    ctx.fillStyle = C.soft
    ctx.fill()
    rrect(ctx, leftW, y + 12, cw, 10, 2)
    ctx.fillStyle = rgb(COOL, 0.92)
    ctx.fill()

    if (curTok >= tr.arm_c_tokens) {
      label(ctx, `✓ ${tr.arm_c_tokens}t`, leftW + trackW + 8, y + 17, rgb(COOL), MONO_B)
    }
    if (curTok >= tr.base_tokens) {
      label(
        ctx,
        tr.base_cut && !tr.base_ok ? 'CUT ✗' : tr.base_ok ? 'ok' : '✗',
        leftW + trackW + 8,
        y + 5,
        tr.base_ok ? rgb(MID) : rgb(HOT),
        MONO_S,
      )
    }
  }

  legend(
    ctx,
    [
      { label: 'Base Qwen3-30B (avg 1,397.7t)', c: rgb(HOT) },
      { label: 'Arm C QR-SFT (avg 603.5t · 2.32× shorter)', c: rgb(COOL) },
    ],
    W / 2,
    H - 14,
    C,
  )

  if (hovered) {
    const { tr, y } = hovered
    const ratio = (tr.base_tokens / Math.max(1, tr.arm_c_tokens)).toFixed(2)
    drawTooltip(
      ctx,
      W,
      H,
      ptr.x,
      y,
      [
        { text: `${tr.uid} · Level ${tr.level} (${tr.subject})`, bold: true },
        { text: `Base: ${tr.base_tokens} tok (${tr.base_ok ? 'PASS' : tr.base_cut ? 'CUT @ 1536' : 'FAIL'})`, color: rgb(HOT) },
        { text: `Arm C: ${tr.arm_c_tokens} tok (PASS · ${ratio}× shorter)`, color: rgb(COOL) },
        { text: `gold: ${tr.gold}   pred: ${tr.pred ?? tr.gold}`, color: C.mute },
      ],
      C,
      COOL,
    )
  }
}

function renderArcLevels(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  p: number,
  C: ThemeColors,
  raw: unknown,
  ptr: PointerState,
) {
  const data = raw as ArcJson | null
  const levels = data?.level_breakdown ?? []
  label(ctx, 'BASE vs. ARM C ACCURACY & CUT RATE BY MATH-500 LEVEL (n = 400)', 18, 18, C.mute, MONO_B)

  const prog = ease(seg(p, 0.05, 0.72))
  const padL = 44
  const padR = 24
  const topY = 46
  const botY = H - 54
  const colW = (W - padL - padR) / Math.max(1, levels.length)

  let hovered: { lv: ArcJson['level_breakdown'][number]; cx: number } | null = null

  for (let i = 0; i < levels.length; i++) {
    const lv = levels[i]
    const cx = padL + i * colW + colW / 2
    const bw = Math.min(34, colW * 0.28)
    const hBase = (botY - topY) * (lv.base_acc ?? 0) * prog
    const hAcc = (botY - topY) * lv.acc * prog
    const hCut = (botY - topY) * lv.cut_rate * prog

    if (ptr.inside && Math.abs(ptr.x - cx) < colW * 0.45 && ptr.y >= topY && ptr.y <= botY + 30) {
      hovered = { lv, cx }
      rrect(ctx, cx - colW * 0.44, topY - 4, colW * 0.88, botY - topY + 38, 5)
      ctx.fillStyle = rgb(COOL, 0.08)
      ctx.fill()
    }

    rrect(ctx, cx - bw * 1.5 - 3, botY - hBase, bw, hBase, 3)
    ctx.fillStyle = rgb(MID, 0.65)
    ctx.fill()

    rrect(ctx, cx - bw * 0.5, botY - hAcc, bw, hAcc, 3)
    ctx.fillStyle = rgb(COOL, 0.9)
    ctx.fill()
    label(ctx, `${(lv.acc * 100).toFixed(0)}%`, cx, botY - hAcc - 10, rgb(COOL), MONO_B, 'center')

    rrect(ctx, cx + bw * 0.5 + 3, botY - hCut, bw * 0.75, hCut, 3)
    ctx.fillStyle = rgb(HOT, 0.82)
    ctx.fill()

    label(ctx, `Level ${lv.level}`, cx, botY + 14, C.fg, SANS_B, 'center')
    label(ctx, `n=${lv.n}`, cx, botY + 28, C.mute, MONO_S, 'center')
  }

  legend(
    ctx,
    [
      { label: 'Base accuracy', c: rgb(MID) },
      { label: 'Arm C accuracy', c: rgb(COOL) },
      { label: 'Arm C cutoff rate', c: rgb(HOT) },
    ],
    W / 2,
    H - 12,
    C,
  )

  if (hovered) {
    const { lv, cx } = hovered
    const delta = ((lv.acc - (lv.base_acc ?? 0)) * 100).toFixed(1)
    drawTooltip(
      ctx,
      W,
      H,
      cx,
      topY + 30,
      [
        { text: `MATH-500 Level ${lv.level} (n = ${lv.n})`, bold: true },
        { text: `Base: ${((lv.base_acc ?? 0) * 100).toFixed(1)}%  →  Arm C: ${(lv.acc * 100).toFixed(1)}% (+${delta} pp)`, color: rgb(GOOD) },
        { text: `Flips: +${lv.fail_to_pass ?? 0} F→P / −${lv.pass_to_fail ?? 0} P→F`, color: rgb(COOL) },
        { text: `Arm C avg tokens: ${lv.avg_tokens}t  (cut ${(lv.cut_rate * 100).toFixed(1)}%)`, color: C.mute },
      ],
      C,
      COOL,
    )
  }
}

/* ============================================================================
   2. HOLDOUT LEDGER: Hoverable e-Process + 238-Trajectory Gemma-4 Broker Matrix
   ============================================================================ */
type GemmaTraj = {
  run: string
  id: string
  repo: string
  resolved: boolean
  adm: boolean
  strict_adm: boolean
  scratch: number
  reasons: string[]
  tools: number
  secs: number
  patch_chars: number
}

type HoldoutJson = {
  eprocess_benchmark: {
    wald_null_attack_violation_rate: number
    eb_eprocess_anytime_violation_rate: number
    certificate_tightening_pct: number
    query_savings_pct: number
  }
  gemma4_trajectory_gate: {
    n_trajectories: number
    n_admitted: number
    n_rejected: number
    baseline_solve_rate: number
    admitted_solve_rate: number
    rejected_solve_rate: number
    naive_reject_scratch_solve_rate: number
    holdout_budget_saved_pct: number
    precision_lift_ratio: number
  }
  martingale_trace: {
    log10_threshold: number
    honest_improver: { series: { t: number; log10_e: number; e_val: number; wald_lcb: number }[] }
    best_of_14_null_patch: { series: { t: number; log10_e: number; e_val: number; wald_lcb: number }[] }
  }
  trajectories?: GemmaTraj[]
  confirmatory_59200?: { proposer: string; gate: string; n_runs: number; mean_overclaim: number; mean_d_true: number }[]
}

function renderHoldoutHero(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  p: number,
  C: ThemeColors,
  raw: unknown,
  ptr: PointerState,
) {
  const data = raw as HoldoutJson | null
  const padL = 54
  const padR = 24
  const topY = 44
  const botY = H - 54
  const plotW = W - padL - padR
  const plotH = botY - topY

  label(
    ctx,
    'ANYTIME EMPIRICAL-BERNSTEIN e-PROCESS  vs.  POST-SELECTION WALD OVERCLAIM',
    padL,
    18,
    C.mute,
    MONO_B,
  )

  const minY = -5
  const maxY = 7.5
  const mapX = (t: number) => padL + (t / 256) * plotW
  const mapY = (v: number) => botY - ((clamp(v, minY, maxY) - minY) / (maxY - minY)) * plotH

  ctx.strokeStyle = C.line
  ctx.lineWidth = 1
  for (const yv of [-4, 0, 4]) {
    const yy = mapY(yv)
    ctx.beginPath()
    ctx.moveTo(padL, yy)
    ctx.lineTo(W - padR, yy)
    ctx.stroke()
    label(ctx, `${yv}`, padL - 10, yy, C.mute, MONO_S, 'right')
  }
  for (const xv of [0, 64, 128, 192, 256]) {
    label(ctx, `${xv}`, mapX(xv), botY + 14, C.mute, MONO_S, 'center')
  }
  label(ctx, 'log₁₀ E_t', padL, topY - 12, C.fg, MONO_S, 'left')

  const barrierVal = data?.martingale_trace.log10_threshold ?? 1.301
  const barrierY = mapY(barrierVal)
  ctx.save()
  ctx.setLineDash([5, 4])
  ctx.strokeStyle = rgb(MID, 0.9)
  ctx.lineWidth = 1.6
  ctx.beginPath()
  ctx.moveTo(padL, barrierY)
  ctx.lineTo(W - padR, barrierY)
  ctx.stroke()
  ctx.restore()
  label(ctx, 'Ville barrier log₁₀(α⁻¹) = 1.30', W - padR, barrierY - 10, rgb(MID), MONO_S, 'right')

  const drawProg = ease(seg(p, 0.04, 0.72))
  const honest = data?.martingale_trace.honest_improver.series ?? []
  const patch = data?.martingale_trace.best_of_14_null_patch.series ?? []
  const maxT = Math.max(1, drawProg * 256)

  if (patch.length) {
    ctx.strokeStyle = rgb(HOT)
    ctx.lineWidth = 2.4
    ctx.beginPath()
    patch.forEach((pt, idx) => {
      if (pt.t > maxT && idx > 0) return
      const x = mapX(pt.t)
      const y = mapY(pt.log10_e)
      if (idx === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()
  }

  let lastH = honest[0]
  if (honest.length) {
    ctx.strokeStyle = rgb(COOL)
    ctx.lineWidth = 2.8
    ctx.beginPath()
    honest.forEach((pt, idx) => {
      if (pt.t > maxT && idx > 0) return
      lastH = pt
      const x = mapX(pt.t)
      const y = mapY(pt.log10_e)
      if (idx === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()
  }

  if (lastH && lastH.log10_e >= barrierVal) {
    const cx = mapX(lastH.t)
    const cy = mapY(lastH.log10_e)
    ctx.fillStyle = rgb(COOL)
    ctx.beginPath()
    ctx.arc(cx, cy, 4.5, 0, Math.PI * 2)
    ctx.fill()
    chip(ctx, Math.min(W - 180, cx + 10), Math.max(topY + 4, cy - 26), 166, 22, `CERTIFIED at t=${lastH.t}`, {
      fill: rgb(COOL, 0.14),
      stroke: rgb(COOL, 0.65),
      color: rgb(COOL),
      font: MONO_B,
    })
  }

  // Hover crosshair across sequential holdout steps
  if (ptr.inside && ptr.x >= padL && ptr.x <= W - padR && ptr.y >= topY && ptr.y <= botY && honest.length) {
    const targetT = ((ptr.x - padL) / plotW) * 256
    const hPt = honest.reduce((best, cur) => (Math.abs(cur.t - targetT) < Math.abs(best.t - targetT) ? cur : best), honest[0])
    const pPt = patch.reduce((best, cur) => (Math.abs(cur.t - targetT) < Math.abs(best.t - targetT) ? cur : best), patch[0])
    const hx = mapX(hPt.t)
    ctx.strokeStyle = C.line
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(hx, topY)
    ctx.lineTo(hx, botY)
    ctx.stroke()

    ctx.fillStyle = rgb(COOL)
    ctx.beginPath()
    ctx.arc(hx, mapY(hPt.log10_e), 5, 0, Math.PI * 2)
    ctx.fill()
    if (pPt) {
      ctx.fillStyle = rgb(HOT)
      ctx.beginPath()
      ctx.arc(hx, mapY(pPt.log10_e), 4.5, 0, Math.PI * 2)
      ctx.fill()
    }
    drawTooltip(
      ctx,
      W,
      H,
      hx,
      mapY(hPt.log10_e),
      [
        { text: `Holdout step t = ${hPt.t} / 256`, bold: true },
        { text: `Honest: log₁₀ E = ${hPt.log10_e.toFixed(2)}  (E = ${hPt.e_val.toFixed(1)})`, color: rgb(COOL) },
        { text: `Null-14: log₁₀ E = ${(pPt?.log10_e ?? -5).toFixed(2)}  (Wald LCB ${(pPt?.wald_lcb ?? 0).toFixed(3)})`, color: rgb(HOT) },
        { text: hPt.log10_e >= barrierVal ? 'Ville gate: CERTIFIED (p ≤ 0.05)' : 'Ville gate: collecting evidence', color: rgb(MID) },
      ],
      C,
      COOL,
    )
  }

  const waldViol = ((data?.eprocess_benchmark.wald_null_attack_violation_rate ?? 0.544) * 100).toFixed(1)
  const tighten = (data?.eprocess_benchmark.certificate_tightening_pct ?? 40.4).toFixed(1)
  legend(
    ctx,
    [
      { label: `Honest improver (0.0% viol., −${tighten}% width)`, c: rgb(COOL) },
      { label: `Null-14 patch (Wald fails ${waldViol}% of trials)`, c: rgb(HOT) },
      { label: '59,200 confirmatory.jsonl runs verified', c: rgb(MID) },
    ],
    W / 2,
    H - 16,
    C,
  )
}

function renderBrokerWaterfall(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  p: number,
  C: ThemeColors,
  raw: unknown,
  ptr: PointerState,
) {
  const data = raw as HoldoutJson | null
  const trajs = data?.trajectories ?? []
  label(ctx, 'ALL 238 REAL GEMMA-4 SWE TRAJECTORIES (7 RUNS × 34 TASKS) · BROKER GATE MATRIX', 18, 18, C.mute, MONO_B)

  const runs = ['b1', 'b31', 'c7', 'k20', 'v1', 'v2', 'v3']
  const taskIds = Array.from(new Set(trajs.map((t) => t.id))).sort()
  const lookup = new Map(trajs.map((t) => [`${t.run}:${t.id}`, t]))

  const padL = 52
  const padR = 18
  const topY = 44
  const botY = H - 56
  const gridW = W - padL - padR
  const nCols = Math.max(34, taskIds.length)
  const gapX = 2.5
  const gapY = 5
  const cellW = (gridW - (nCols - 1) * gapX) / nCols
  const cellH = Math.min(18, (botY - topY - (runs.length - 1) * gapY) / runs.length)

  const sweep = ease(seg(p, 0.04, 0.72)) * (runs.length * nCols)
  let hovered: { tr: GemmaTraj; cx: number; cy: number } | null = null

  for (let rIdx = 0; rIdx < runs.length; rIdx++) {
    const run = runs[rIdx]
    const y = topY + rIdx * (cellH + gapY)
    label(ctx, run, 18, y + cellH / 2, run === 'v3' ? rgb(COOL) : C.mute, run === 'v3' ? MONO_B : MONO_S)
    for (let cIdx = 0; cIdx < nCols; cIdx++) {
      const tid = taskIds[cIdx]
      const tr = tid ? lookup.get(`${run}:${tid}`) : undefined
      const x = padL + cIdx * (cellW + gapX)
      const revealed = rIdx * nCols + cIdx <= sweep

      let col: RGB = [88, 92, 98]
      let alpha = C.dark ? 0.28 : 0.18
      if (tr && revealed) {
        if (tr.adm && tr.resolved) {
          col = GOOD
          alpha = 0.94
        } else if (tr.adm) {
          col = COOL
          alpha = 0.62
        } else if (tr.resolved) {
          col = HOT
          alpha = 0.85
        } else {
          col = [86, 90, 96]
          alpha = C.dark ? 0.24 : 0.15
        }
      }

      rrect(ctx, x, y, cellW, cellH, 2.5)
      ctx.fillStyle = rgb(col, alpha)
      ctx.fill()

      // Small amber marker inside cells where broker stripped scratch repro.py
      if (tr && revealed && tr.adm && tr.scratch > 0) {
        ctx.fillStyle = rgb(MID, 0.95)
        ctx.beginPath()
        ctx.arc(x + cellW / 2, y + cellH / 2, Math.min(2.4, cellW * 0.22), 0, Math.PI * 2)
        ctx.fill()
      }

      if (tr && ptr.inside && ptr.x >= x - 1 && ptr.x <= x + cellW + 1 && ptr.y >= y - 1 && ptr.y <= y + cellH + 1) {
        hovered = { tr, cx: x + cellW / 2, cy: y + cellH / 2 }
        ctx.strokeStyle = C.fg
        ctx.lineWidth = 1.6
        ctx.stroke()
      }
    }
  }

  const g = data?.gemma4_trajectory_gate
  label(
    ctx,
    `Admitted: ${g?.n_admitted ?? 83}/238 (${((g?.admitted_solve_rate ?? 0.337) * 100).toFixed(1)}% solved · 4.75× lift)  ·  Rejected: ${g?.n_rejected ?? 155} (65.1% budget saved)  ·  v3 recall: 9/9`,
    W / 2,
    H - 34,
    C.fg,
    MONO_S,
    'center',
  )

  legend(
    ctx,
    [
      { label: 'Admitted & solved', c: rgb(GOOD) },
      { label: 'Admitted (unsolved)', c: rgb(COOL) },
      { label: 'Amber dot: repro.py sanitized (43)', c: rgb(MID) },
      { label: 'Rejected & solved (11)', c: rgb(HOT) },
    ],
    W / 2,
    H - 14,
    C,
  )

  if (hovered) {
    const { tr, cx, cy } = hovered
    const accent = tr.adm && tr.resolved ? GOOD : tr.adm ? COOL : tr.resolved ? HOT : MID
    drawTooltip(
      ctx,
      W,
      H,
      cx,
      cy,
      [
        { text: `${tr.run} · ${tr.id} (${tr.repo})`, bold: true },
        {
          text: tr.adm
            ? `BROKER ADMITTED${tr.scratch > 0 ? ` (stripped ${tr.scratch} scratch file${tr.scratch > 1 ? 's' : ''})` : ''}`
            : `BROKER REJECTED: ${tr.reasons.join(', ') || 'gate fail'}`,
          bold: true,
          color: rgb(accent),
        },
        { text: `Outcome: ${tr.resolved ? 'SOLVED ✓' : 'UNSOLVED ✗'}  ·  ${tr.tools} tools · ${tr.secs}s`, color: C.fg },
        { text: `Patch: ${tr.patch_chars} chars  ·  Naive strict gate: ${tr.strict_adm ? 'admit' : 'drop'}`, color: C.mute },
      ],
      C,
      accent,
    )
  }
}

/* ============================================================================
   3. MECH-INTERP UNIFIED: 16-Claim Live 7-Signal Matrix + 400-Prompt H100 J-Space Scatter
   ============================================================================ */
type InterpClaim = {
  id: string
  desc?: string
  is_flawed: boolean
  raw_effect: number
  rand_dir?: number
  base_drift?: number
  pca_gap: number
  heldout_ratio?: number
  donor_suff?: number
  relabel_cos?: number
  naive_flag: boolean
  probe_flag: boolean
  unified_flag: boolean
  reasons?: string[]
}

type InterpJson = {
  models: {
    model_id: string
    device?: string
    wall_s?: number
    layer: number
    claims: InterpClaim[]
  }[]
}

function renderMechInterpHero(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  p: number,
  C: ThemeColors,
  raw: unknown,
  ptr: PointerState,
  mode: string,
) {
  const data = raw as InterpJson | null
  const modelIdx = mode === 'qwen25' ? 1 : 0
  const model = data?.models?.[modelIdx] ?? data?.models?.[0]
  const claims = model?.claims ?? []

  label(
    ctx,
    `REAL MPS/GPU CAUSAL AUDIT (${model?.model_id ?? 'Qwen3-1.7B-Base'}, L${model?.layer ?? 21}, ${model?.wall_s ?? 21.9}s)`,
    18,
    18,
    C.mute,
    MONO_B,
  )

  const col0 = 18
  const col1 = Math.min(256, W * 0.42)
  const colW = (W - col1 - 24) / 3
  const headers = ['Naive (0/6)', 'Probe+Donor (4/6)', 'Unified Invariants (6/6)']
  headers.forEach((h, j) => {
    label(ctx, h, col1 + j * colW + colW / 2, 42, j === 2 ? rgb(COOL) : C.mute, MONO_B, 'center')
  })

  const sweep = ease(seg(p, 0.04, 0.78)) * Math.max(1, claims.length)
  let hovered: { c: InterpClaim; y: number } | null = null

  for (let i = 0; i < claims.length; i++) {
    const c = claims[i]
    const y = 60 + i * 28
    if (ptr.inside && ptr.y >= y - 2 && ptr.y <= y + 24) {
      hovered = { c, y: y + 11 }
      rrect(ctx, 10, y - 2, W - 20, 26, 4)
      ctx.fillStyle = rgb(COOL, 0.08)
      ctx.fill()
    }
    const shortName = c.id.replace(/_/g, ' ').slice(0, 30)
    label(ctx, shortName, col0, y + 11, c.is_flawed ? C.fg : rgb(COOL), MONO_S)

    const verdicts = [c.naive_flag, c.probe_flag, c.unified_flag]
    verdicts.forEach((flagged, j) => {
      const reveal = clamp(sweep - i - j * 0.2, 0, 1)
      const correct = flagged === c.is_flawed
      const cellCol = !c.is_flawed ? (flagged ? HOT : COOL) : flagged ? GOOD : HOT
      const txt = !c.is_flawed ? (flagged ? 'FALSE POS' : 'PASS ✓') : flagged ? 'CAUGHT ✓' : 'MISSED ✗'
      ctx.globalAlpha = 0.25 + 0.75 * reveal
      chip(ctx, col1 + j * colW + 4, y, colW - 8, 22, txt, {
        fill: rgb(cellCol, correct ? 0.14 : 0.2),
        stroke: rgb(cellCol, 0.65),
        color: rgb(cellCol),
        font: MONO_B,
      })
      ctx.globalAlpha = 1
    })
  }

  if (hovered) {
    const { c, y } = hovered
    const accent = c.is_flawed ? (c.unified_flag ? GOOD : HOT) : COOL
    drawTooltip(
      ctx,
      W,
      H,
      ptr.x,
      y,
      [
        { text: `${c.id} (${c.is_flawed ? 'PLANTED FLAW' : 'GENUINE MECHANISM'})`, bold: true, color: rgb(accent) },
        { text: `raw=${c.raw_effect}  pca_gap=${c.pca_gap}  base_drift=${c.base_drift ?? 0}`, color: C.fg },
        { text: `heldout=${c.heldout_ratio ?? 0}  donor_suff=${c.donor_suff ?? 0}  relabel_cos=${c.relabel_cos ?? 0}`, color: C.fg },
        { text: c.reasons?.length ? `Caught by: ${c.reasons.join(', ')}` : (c.desc ?? '').slice(0, 62), color: C.mute },
      ],
      C,
      accent,
    )
  }
}

type JspacePoint = { i: number; j: number; p: number; r: number }
type JspaceCkpt = {
  n_total: number
  dose: number
  mean_j: number
  mean_pca: number
  mean_rand: number
  mean_diff: number
  pearson_r: number
  points: JspacePoint[]
}
type JspaceJson = {
  checkpoints?: Record<string, JspaceCkpt>
}

function renderJspacePcaEquiv(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  p: number,
  C: ThemeColors,
  raw: unknown,
  ptr: PointerState,
  mode: string,
) {
  const data = raw as JspaceJson | null
  const ckptKey = mode || 'dpo'
  const ck = data?.checkpoints?.[ckptKey] ?? data?.checkpoints?.dpo

  const padL = 56
  const padR = 26
  const topY = 44
  const botY = H - 52
  const plotW = W - padL - padR
  const plotH = botY - topY

  label(
    ctx,
    `REAL H100 OLMo-2-7B (${ckptKey.toUpperCase()}, n=${ck?.n_total ?? 2000} PROMPTS, DOSE 0.2): Δ_J vs. Δ_PCA`,
    18,
    18,
    C.mute,
    MONO_B,
  )

  const minV = -3.2
  const maxV = 1.6
  const mapX = (v: number) => padL + ((clamp(v, minV, maxV) - minV) / (maxV - minV)) * plotW
  const mapY = (v: number) => botY - ((clamp(v, minV, maxV) - minV) / (maxV - minV)) * plotH

  // Grid + zero axes
  ctx.strokeStyle = C.line
  ctx.lineWidth = 1
  for (const v of [-3, -2, -1, 0, 1]) {
    const xx = mapX(v)
    const yy = mapY(v)
    ctx.beginPath()
    ctx.moveTo(padL, yy)
    ctx.lineTo(W - padR, yy)
    ctx.stroke()
    label(ctx, `${v}`, padL - 8, yy, C.mute, MONO_S, 'right')
    label(ctx, `${v}`, xx, botY + 14, C.mute, MONO_S, 'center')
  }
  label(ctx, 'Δ logit (J-space clamp)', W - padR, botY + 28, C.mute, MONO_S, 'right')
  label(ctx, 'Δ logit (PCA)', padL, topY - 12, C.mute, MONO_S, 'left')

  // Shaded ±0.20 equivalence corridor around y = x diagonal
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(mapX(minV), mapY(minV + 0.2))
  ctx.lineTo(mapX(maxV - 0.2), mapY(maxV))
  ctx.lineTo(mapX(maxV), mapY(maxV - 0.2))
  ctx.lineTo(mapX(minV + 0.2), mapY(minV))
  ctx.closePath()
  ctx.fillStyle = rgb(COOL, 0.12)
  ctx.fill()

  ctx.setLineDash([5, 4])
  ctx.strokeStyle = rgb(COOL, 0.7)
  ctx.lineWidth = 1.4
  ctx.beginPath()
  ctx.moveTo(mapX(minV), mapY(minV))
  ctx.lineTo(mapX(maxV), mapY(maxV))
  ctx.stroke()
  ctx.restore()
  label(ctx, 'y = x (±0.20 equiv.)', mapX(0.75), mapY(1.25), rgb(COOL), MONO_S, 'center')

  const pts = ck?.points ?? []
  const revealCount = Math.floor(ease(seg(p, 0.04, 0.65)) * pts.length)
  let bestHit: { pt: JspacePoint; dist: number; cx: number; cy: number } | null = null

  // Plot norm-matched random-k controls (collapsed near 0,0) and real J vs PCA points
  for (let i = 0; i < revealCount; i++) {
    const pt = pts[i]
    // Random-k control cloud
    const rx = mapX(pt.r)
    const ry = mapY(pt.r * 0.92)
    ctx.fillStyle = rgb(MID, 0.34)
    ctx.beginPath()
    ctx.arc(rx, ry, 2.4, 0, Math.PI * 2)
    ctx.fill()

    // Real (Δ_J, Δ_PCA) pair
    const cx = mapX(pt.j)
    const cy = mapY(pt.p)
    ctx.fillStyle = rgb(COOL, 0.85)
    ctx.beginPath()
    ctx.arc(cx, cy, 3.6, 0, Math.PI * 2)
    ctx.fill()

    if (ptr.inside) {
      const dist = Math.hypot(ptr.x - cx, ptr.y - cy)
      if (dist < 14 && (!bestHit || dist < bestHit.dist)) {
        bestHit = { pt, dist, cx, cy }
      }
    }
  }

  if (bestHit) {
    ctx.strokeStyle = C.fg
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(bestHit.cx, bestHit.cy, 6, 0, Math.PI * 2)
    ctx.stroke()
    const pt = bestHit.pt
    drawTooltip(
      ctx,
      W,
      H,
      bestHit.cx,
      bestHit.cy,
      [
        { text: `OLMo-2-7B ${ckptKey.toUpperCase()} · prompt #${pt.i}`, bold: true },
        { text: `Δ_J (clamp): ${pt.j >= 0 ? '+' : ''}${pt.j.toFixed(3)} logits`, color: rgb(COOL) },
        { text: `Δ_PCA (norm-matched): ${pt.p >= 0 ? '+' : ''}${pt.p.toFixed(3)} logits`, color: rgb(GOOD) },
        { text: `|Δ_J − Δ_PCA| = ${Math.abs(pt.j - pt.p).toFixed(3)}  ·  rand_k: ${pt.r.toFixed(3)}`, color: C.mute },
      ],
      C,
      COOL,
    )
  }

  // Live Pearson r badge
  if (ck) {
    chip(
      ctx,
      padL + 10,
      topY + 8,
      216,
      24,
      `Pearson r = ${ck.pearson_r.toFixed(3)}  ·  Δ̄ = ${ck.mean_diff >= 0 ? '+' : ''}${ck.mean_diff.toFixed(3)}`,
      { fill: rgb(COOL, 0.14), stroke: rgb(COOL, 0.6), color: rgb(COOL), font: MONO_B },
    )
  }

  legend(
    ctx,
    [
      { label: 'Real H100 prompt (Δ_J vs Δ_PCA)', c: rgb(COOL) },
      { label: 'Random-k control (near 0)', c: rgb(MID) },
    ],
    W / 2,
    H - 12,
    C,
  )
}

/* ============================================================================
   4. KAILAS SACRED GEOGRAPHY: 48 Real Thubron Episodes + Two-Clock Rissanen MDL
   ============================================================================ */
type KailasEpisode = {
  ep: string
  ch: number
  trad?: string
  r: number
  stage: string
  chars: number
  kind: string
  phase: string
  clock: string
  exp: number
  aligned: number
  decoupled: number
  sha1: string
}

type KailasJson = {
  two_clock_mdl: {
    v2_expanded_kailas_region_episodes: { n: number; delta_mdl_bits: number }
    v2_expanded_hajj_and_holyland_liturgical_subset: { n: number; delta_mdl_bits: number }
  }
  thubron_episodes?: KailasEpisode[]
  indigenous_episodes?: KailasEpisode[]
  cross_tradition_episodes?: KailasEpisode[]
}

function renderKailasHero(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  p: number,
  C: ThemeColors,
  raw: unknown,
  ptr: PointerState,
  mode: string,
) {
  const data = raw as KailasJson | null
  const kBits = data?.two_clock_mdl.v2_expanded_kailas_region_episodes.delta_mdl_bits ?? 2.028
  const hBits = data?.two_clock_mdl.v2_expanded_hajj_and_holyland_liturgical_subset.delta_mdl_bits ?? -1.397
  const eps =
    mode === 'indigenous'
      ? (data?.indigenous_episodes ?? [])
      : mode === 'cross'
        ? (data?.cross_tradition_episodes ?? [])
        : (data?.thubron_episodes ?? [])
  const corpusLabel =
    mode === 'indigenous'
      ? `48 INDIGENOUS KORA EPISODES`
      : mode === 'cross'
        ? `30 CROSS-TRADITION EPISODES`
        : `48 THUBRON KORA EPISODES`

  label(ctx, `${corpusLabel} (126 TOTAL CODED) & TWO-CLOCK MDL DISSOCIATION`, 18, 18, C.mute, MONO_B)

  const cx = Math.min(155, W * 0.26)
  const cy = H / 2 + 4
  const R = Math.min(78, cx - 28)

  ctx.strokeStyle = rgb(COOL, 0.35)
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(cx, cy, R, 0, Math.PI * 2)
  ctx.stroke()

  ctx.strokeStyle = rgb(HOT, 0.28)
  ctx.setLineDash([4, 4])
  ctx.beginPath()
  ctx.arc(cx, cy, R * 0.72, 0, Math.PI * 2)
  ctx.stroke()
  ctx.setLineDash([])

  // Pyramidal peak center
  ctx.fillStyle = rgb(COOL, 0.16)
  ctx.beginPath()
  ctx.moveTo(cx, cy - 16)
  ctx.lineTo(cx + 15, cy + 12)
  ctx.lineTo(cx - 15, cy + 12)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = rgb(COOL)
  ctx.stroke()
  label(ctx, 'Kailas', cx, cy + 24, C.mute, MONO_S, 'center')

  // Plot all 48 real episodes around the kora ring at their exact r_progress
  let bestHit: { ep: KailasEpisode; dist: number; x: number; y: number } | null = null
  const reveal = ease(seg(p, 0.03, 0.55)) * eps.length
  for (let idx = 0; idx < eps.length; idx++) {
    if (idx > reveal) break
    const ep = eps[idx]
    const isApproach = ep.r < 0
    const angle = isApproach
      ? -Math.PI / 2 - 0.55 + (idx / 12) * 0.42
      : ep.r * Math.PI * 2 - Math.PI / 2
    const rad = isApproach ? R + 16 : ep.aligned ? R : ep.decoupled ? R * 0.86 : R * 0.93
    const x = cx + Math.cos(angle) * rad
    const y = cy + Math.sin(angle) * rad
    const col = ep.aligned ? GOOD : ep.decoupled ? HOT : isApproach ? MID : COOL
    ctx.fillStyle = rgb(col, 0.88)
    ctx.beginPath()
    ctx.arc(x, y, 3.6, 0, Math.PI * 2)
    ctx.fill()
    if (ptr.inside) {
      const dist = Math.hypot(ptr.x - x, ptr.y - y)
      if (dist < 11 && (!bestHit || dist < bestHit.dist)) {
        bestHit = { ep, dist, x, y }
      }
    }
  }

  // Moving pilgrim marker
  const cwAngle = p * Math.PI * 2 - Math.PI / 2
  ctx.strokeStyle = C.fg
  ctx.lineWidth = 1.6
  ctx.beginPath()
  ctx.arc(cx + Math.cos(cwAngle) * R, cy + Math.sin(cwAngle) * R, 6.5, 0, Math.PI * 2)
  ctx.stroke()

  // Right: Two-Clock MDL diverging bar chart
  const rightX = cx + R + 48
  const rightW = W - rightX - 24
  const zeroX = rightX + rightW * 0.44
  const prog = ease(seg(p, 0.08, 0.68))

  ctx.strokeStyle = C.line
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(zeroX, 46)
  ctx.lineTo(zeroX, H - 56)
  ctx.stroke()
  label(ctx, '0 bits (1-clock null)', zeroX, H - 42, C.mute, MONO_S, 'center')

  const scale = (rightW * 0.42) / 2.5
  const kW = kBits * scale * prog
  rrect(ctx, zeroX, 66, kW, 28, 4)
  ctx.fillStyle = rgb(COOL, 0.88)
  ctx.fill()
  label(ctx, 'Kailas region (n=134)', rightX, 56, C.fg, SANS_B)
  label(ctx, `+${kBits.toFixed(2)} bits`, zeroX + kW + 6, 80, rgb(COOL), MONO_B)

  const hW = Math.abs(hBits) * scale * prog
  rrect(ctx, zeroX - hW, 134, hW, 28, 4)
  ctx.fillStyle = rgb(HOT, 0.82)
  ctx.fill()
  label(ctx, 'Hajj & Holy Land (n=96)', rightX, 124, C.fg, SANS_B)
  label(ctx, `${hBits.toFixed(2)} bits`, zeroX - hW - 6, 148, rgb(HOT), MONO_B, 'right')

  legend(
    ctx,
    [
      { label: 'Aligned kora episode', c: rgb(GOOD) },
      { label: 'Decoupled / liturgical', c: rgb(HOT) },
      { label: 'Approach (r < 0)', c: rgb(MID) },
    ],
    W / 2,
    H - 14,
    C,
  )

  if (bestHit) {
    const { ep, x, y } = bestHit
    ctx.strokeStyle = C.fg
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(x, y, 6.5, 0, Math.PI * 2)
    ctx.stroke()
    const accent = ep.aligned ? GOOD : ep.decoupled ? HOT : MID
    const headTag = ep.ch > 0 ? `Episode ${ep.ep} · Ch.${ep.ch} (${ep.stage})` : `${ep.ep} · ${ep.trad ?? 'Kora'} (${ep.stage})`
    drawTooltip(
      ctx,
      W,
      H,
      x,
      y,
      [
        { text: headTag, bold: true },
        { text: `r_progress = ${ep.r}  ·  kind: ${ep.kind}  ·  clock: ${ep.clock}`, color: rgb(accent) },
        { text: `aligned=${ep.aligned}  decoupled=${ep.decoupled}  chars=${ep.chars}`, color: C.fg },
        { text: `sha1: ${ep.sha1}  (kailas-corpus/coding/*.csv)`, color: C.mute },
      ],
      C,
      accent,
    )
  }
}

/* ============================================================================
   5. TEMPORAL GRID SAFETY: Real Per-Seed (n=6) Curves across 3 LLMs
   ============================================================================ */
type TemporalModel = {
  key: string
  label: string
  lr: number
  n_safe: number
  grid: number[]
  means: Record<string, number[]>
  seeds: { seed: string; arms: Record<string, number[]> }[]
}
type TemporalJson = { models: TemporalModel[] }

function renderTemporalGridHero(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  p: number,
  C: ThemeColors,
  raw: unknown,
  ptr: PointerState,
  mode: string,
) {
  const data = raw as TemporalJson | null
  const model = data?.models?.find((m) => m.key === mode) ?? data?.models?.[0]
  const grid = model?.grid ?? [1, 2, 4, 8, 16, 32, 64, 128]

  label(
    ctx,
    `REAL PER-SEED (n=${model?.seeds.length ?? 6}) HELD-OUT SAFETY TRAJECTORIES · ${model?.label ?? 'OLMo-2-7B'}`,
    18,
    18,
    C.mute,
    MONO_B,
  )

  const padL = 50
  const padR = 24
  const topY = 44
  const botY = H - 56
  const plotW = W - padL - padR
  const plotH = botY - topY

  const mapX = (idx: number) => padL + (idx / Math.max(1, grid.length - 1)) * plotW
  const mapY = (v: number) => botY - clamp(v, 0, 1) * plotH

  ctx.strokeStyle = C.line
  ctx.lineWidth = 1
  for (const v of [0, 0.25, 0.5, 0.75, 1.0]) {
    const yy = mapY(v)
    ctx.beginPath()
    ctx.moveTo(padL, yy)
    ctx.lineTo(W - padR, yy)
    ctx.stroke()
    label(ctx, v.toFixed(2), padL - 8, yy, C.mute, MONO_S, 'right')
  }
  grid.forEach((step, idx) => {
    label(ctx, `${step}`, mapX(idx), botY + 14, C.mute, MONO_S, 'center')
  })
  label(ctx, 'fine-tune steps (log₂ grid)', W - padR, botY + 28, C.mute, MONO_S, 'right')

  const progIdx = ease(seg(p, 0.04, 0.68)) * (grid.length - 1)
  const armSpec: { key: string; label: string; col: RGB; lw: number }[] = [
    { key: 'disc_replay', label: 'Discriminant + replay', col: GOOD, lw: 2.8 },
    { key: 'disc', label: 'Discriminant adapter', col: COOL, lw: 2.2 },
    { key: 'free_replay', label: 'Free + replay', col: MID, lw: 2.0 },
    { key: 'free', label: 'Unconstrained free', col: HOT, lw: 2.4 },
  ]

  // Individual seed faint traces
  if (model) {
    armSpec.forEach((a) => {
      model.seeds.forEach((s) => {
        const vals = s.arms[a.key]
        if (!vals) return
        ctx.strokeStyle = rgb(a.col, 0.2)
        ctx.lineWidth = 1
        ctx.beginPath()
        vals.forEach((v, idx) => {
          if (idx > Math.ceil(progIdx)) return
          const x = mapX(idx)
          const y = mapY(v)
          if (idx === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        })
        ctx.stroke()
      })
    })

    // Mean bold lines + dots
    armSpec.forEach((a) => {
      const vals = model.means[a.key]
      if (!vals) return
      ctx.strokeStyle = rgb(a.col, 0.95)
      ctx.lineWidth = a.lw
      ctx.beginPath()
      vals.forEach((v, idx) => {
        if (idx > Math.ceil(progIdx)) return
        const x = mapX(idx)
        const y = mapY(v)
        if (idx === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.stroke()
      vals.forEach((v, idx) => {
        if (idx > Math.floor(progIdx)) return
        ctx.fillStyle = rgb(a.col)
        ctx.beginPath()
        ctx.arc(mapX(idx), mapY(v), 3.3, 0, Math.PI * 2)
        ctx.fill()
      })
    })

    // Hover crosshair snapping to nearest step index
    if (ptr.inside && ptr.x >= padL && ptr.x <= W - padR && ptr.y >= topY && ptr.y <= botY) {
      const idx = clamp(Math.round(((ptr.x - padL) / plotW) * (grid.length - 1)), 0, grid.length - 1)
      const hx = mapX(idx)
      ctx.strokeStyle = C.line
      ctx.lineWidth = 1.2
      ctx.beginPath()
      ctx.moveTo(hx, topY)
      ctx.lineTo(hx, botY)
      ctx.stroke()

      const lines = [{ text: `${model.label} · step = ${grid[idx]} (n=${model.seeds.length} seeds)`, bold: true }]
      armSpec.forEach((a) => {
        const mVal = model.means[a.key]?.[idx]
        const sVals = model.seeds.map((s) => s.arms[a.key]?.[idx]).filter((v): v is number => v !== undefined)
        if (mVal !== undefined) {
          const lo = Math.min(...sVals)
          const hi = Math.max(...sVals)
          lines.push({
            text: `${a.label}: ${mVal.toFixed(3)}  [min ${lo.toFixed(2)}, max ${hi.toFixed(2)}]`,
            bold: false,
            color: rgb(a.col),
          } as { text: string; bold: boolean; color?: string })
        }
      })
      drawTooltip(ctx, W, H, hx, topY + 26, lines, C, COOL)
    }
  }

  legend(
    ctx,
    armSpec.map((a) => ({ label: a.label, c: rgb(a.col) })),
    W / 2,
    H - 12,
    C,
  )
}

/* ============================================================================
   6. THESEUS LAB: Live MLP Permutation (Hoverable) + Real Coverage/V39 Inline
   ============================================================================ */
function renderTheseusHero(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  p: number,
  C: ThemeColors,
  _raw: unknown,
  ptr: PointerState,
) {
  const x = [0.85, -0.4, 1.15, -0.65]
  const W1 = [
    [0.9, -0.6, 0.5, 0.2],
    [-0.4, 1.1, 0.7, -0.5],
    [0.6, 0.3, -0.9, 0.8],
    [-0.7, -0.5, 0.8, 0.9],
  ]
  const W2 = [
    [0.7, -0.4, 0.9, 0.3],
    [-0.5, 0.8, 0.2, 0.6],
    [0.4, 0.5, -0.7, 0.8],
  ]
  const perm = [2, 3, 0, 1]
  const hOrig = W1.map((row) => Math.max(0, row.reduce((s, w, j) => s + w * x[j], 0)))
  const hPerm = perm.map((idx) => hOrig[idx])
  const yOrig = W2.map((row) => row.reduce((s, w, j) => s + w * hOrig[j], 0))
  const yPerm = W2.map((row) => row.reduce((s, _, j) => s + row[perm[j]] * hPerm[j], 0))
  const maxErr = Math.max(...yOrig.map((v, i) => Math.abs(v - yPerm[i])))

  const phase = p * 5
  const showH = phase >= 0.8
  const showY = phase >= 2.2
  const showProbe = phase >= 3.2

  label(ctx, 'LIVE FLOATING-POINT MLP PERMUTATION: W₂·ReLU(W₁x)  vs.  (W₂Pᵀ)·ReLU((PW₁)x)', 18, 18, C.mute, MONO_B)

  const colW = Math.min(72, Math.floor((W - 140) / 8))
  let hoveredUnit: { idx: number; isPerm: boolean; val: number; origIdx: number; cx: number; cy: number } | null = null

  const drawPanel = (py: number, title: string, hs: number[], ys: number[], isPerm: boolean) => {
    label(ctx, title, 18, py + 10, isPerm ? rgb(MID) : rgb(COOL), SANS_B)
    const xStart = 18
    const hStart = Math.floor(W * 0.34)
    const yStart = Math.floor(W * 0.72)

    x.forEach((v, i) => {
      const cx = xStart + i * (colW * 0.78)
      chip(ctx, cx, py + 24, colW * 0.72, 24, v.toFixed(2), {
        fill: C.soft,
        stroke: C.line,
        color: C.mute,
        font: MONO_S,
      })
    })
    label(ctx, 'input x', xStart, py + 58, C.mute, MONO_S)
    arrow(ctx, xStart + 4 * colW * 0.78 + 4, py + 36, hStart - 8, py + 36, C.line, 1.3, 6)

    hs.forEach((v, i) => {
      const cx = hStart + i * (colW * 0.88)
      const bw = colW * 0.82
      const isAblated = showProbe && i === 0
      const tint = isAblated ? (isPerm ? HOT : COOL) : isPerm ? MID : COOL
      if (ptr.inside && ptr.x >= cx && ptr.x <= cx + bw && ptr.y >= py + 22 && ptr.y <= py + 50) {
        hoveredUnit = { idx: i, isPerm, val: v, origIdx: isPerm ? perm[i] : i, cx: cx + bw / 2, cy: py + 36 }
      }
      chip(ctx, cx, py + 24, bw, 24, showH ? v.toFixed(2) : '···', {
        fill: showH ? rgb(tint, isAblated ? 0.26 : 0.12) : C.soft,
        stroke: showH ? rgb(tint, isAblated ? 0.95 : 0.55) : C.line,
        lw: isAblated ? 2 : 1.2,
        color: showH ? C.fg : C.mute,
        font: MONO_S,
      })
      label(ctx, isPerm ? `u_${perm[i]}` : `u_${i}`, cx + bw / 2, py + 58, isAblated ? rgb(tint) : C.mute, MONO_S, 'center')
    })

    arrow(ctx, hStart + 4 * colW * 0.88 + 4, py + 36, yStart - 8, py + 36, showY ? rgb(COOL) : C.line, 1.3, 6)

    ys.forEach((v, i) => {
      const cx = yStart + i * (colW * 0.88)
      chip(ctx, cx, py + 24, colW * 0.82, 24, showY ? v.toFixed(3) : '···', {
        fill: showY ? rgb(GOOD, 0.14) : C.soft,
        stroke: showY ? rgb(GOOD, 0.75) : C.line,
        color: showY ? rgb(GOOD) : C.mute,
        font: MONO_B,
      })
    })
    label(ctx, 'logits y', yStart, py + 58, showY ? rgb(GOOD) : C.mute, MONO_S)
  }

  drawPanel(36, 'Original network (index 0 = unit u₀)', hOrig, yOrig, false)
  drawPanel(118, 'Permuted network P (index 0 = unit u₂: 100% positions moved)', hPerm, yPerm, true)

  chip(
    ctx,
    18,
    H - 40,
    W - 36,
    26,
    `Live max |y − y'| = ${maxErr.toExponential(1)} (GPT-2: 3e−7) · Same-index cos = −0.983 · Inverse-map P⁻¹ cos = 0.9999996`,
    { fill: rgb(showProbe ? COOL : MID, 0.12), stroke: rgb(showProbe ? COOL : MID, 0.55), color: C.fg, font: MONO_S },
  )

  if (hoveredUnit) {
    const u = hoveredUnit as { idx: number; isPerm: boolean; val: number; origIdx: number; cx: number; cy: number }
    drawTooltip(
      ctx,
      W,
      H,
      u.cx,
      u.cy,
      [
        { text: `${u.isPerm ? 'Permuted' : 'Original'} slot index [${u.idx}]  →  unit u_${u.origIdx}`, bold: true },
        { text: `Activation ReLU(W₁x) = ${u.val.toFixed(4)}`, color: rgb(COOL) },
        {
          text: u.isPerm
            ? `Naive probe at slot [${u.idx}] hits u_${u.origIdx} instead of u_${u.idx}!`
            : `Under P, u_${u.origIdx} relocates to slot [${perm.indexOf(u.origIdx)}].`,
          color: rgb(u.isPerm ? HOT : GOOD),
        },
      ],
      C,
      u.isPerm ? HOT : COOL,
    )
  }
}

type TheseusCase = {
  model: string
  seed: number
  rows: number
  nrmse: number
  cos: number
  ce_delta: number
  passed: boolean
  blockers: number
}
type TheseusJson = {
  coverage_arms: { n_prompts: number; cases: TheseusCase[] }[]
  v39?: {
    jvp: { final_value_nrmse_range: [number, number]; final_jacobian_nrmse_range: [number, number]; final_finite_median_cosine_range: [number, number] }
    endpoints: { final_value_nrmse_range: [number, number]; final_jacobian_nrmse_range: [number, number]; final_finite_median_cosine_range: [number, number] }
  }
}

function renderTheseusCoverage(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  p: number,
  C: ThemeColors,
  raw: unknown,
  ptr: PointerState,
) {
  const data = raw as TheseusJson | null
  const arms = data?.coverage_arms ?? []
  const splitX = Math.floor(W * 0.56)

  label(ctx, 'ADAPTATION COVERAGE (27 CASES)  ·  V39 VALUE vs. JACOBIAN', 18, 18, C.mute, MONO_B)

  // Left Panel: Log10 normalized error across N=128, N=256, N=512
  const padL = 56
  const topY = 46
  const botY = H - 48
  const plotW = splitX - padL - 24
  const plotH = botY - topY

  const minLog = -7.5
  const maxLog = 0
  const mapY = (err: number) => {
    const lg = clamp(Math.log10(Math.max(1e-8, err)), minLog, maxLog)
    return botY - ((lg - minLog) / (maxLog - minLog)) * plotH
  }

  ctx.strokeStyle = C.line
  ctx.lineWidth = 1
  for (const exp of [-7, -5, -3, -1]) {
    const yy = mapY(Math.pow(10, exp))
    ctx.beginPath()
    ctx.moveTo(padL, yy)
    ctx.lineTo(padL + plotW, yy)
    ctx.stroke()
    label(ctx, `10^${exp}`, padL - 8, yy, C.mute, MONO_S, 'right')
  }

  const prog = ease(seg(p, 0.04, 0.68))
  let bestHit: { c: TheseusCase; n: number; dist: number; x: number; y: number } | null = null

  arms.forEach((arm, aIdx) => {
    const cx = padL + ((aIdx + 0.5) / Math.max(1, arms.length)) * plotW
    label(ctx, `N=${arm.n_prompts}`, cx, botY + 14, C.fg, MONO_B, 'center')
    const passCount = arm.cases.filter((c) => c.passed).length
    label(ctx, `${passCount}/${arm.cases.length} pass`, cx, botY + 28, passCount === arm.cases.length ? rgb(GOOD) : rgb(HOT), MONO_S, 'center')

    arm.cases.forEach((c, cIdx) => {
      if ((aIdx * 9 + cIdx) / 27 > prog) return
      const jitter = ((cIdx - 4) / 4) * Math.min(26, plotW * 0.12)
      const x = cx + jitter
      const y = mapY(c.nrmse)
      const col = c.passed ? GOOD : HOT
      ctx.fillStyle = rgb(col, 0.88)
      ctx.beginPath()
      ctx.arc(x, y, 4.2, 0, Math.PI * 2)
      ctx.fill()
      if (ptr.inside) {
        const d = Math.hypot(ptr.x - x, ptr.y - y)
        if (d < 12 && (!bestHit || d < bestHit.dist)) {
          bestHit = { c, n: arm.n_prompts, dist: d, x, y }
        }
      }
    })
  })

  // Right Panel: V39 Value nRMSE (0.09-0.11) vs Jacobian nRMSE (0.88-1.19)
  const rx = splitX + 18
  const rw = W - rx - 18
  const v39 = data?.v39
  const bars = [
    { name: 'JVP Value nRMSE', val: v39?.jvp.final_value_nrmse_range[1] ?? 0.115, col: GOOD, note: '0.11 (looks ok)' },
    { name: 'JVP Jacobian nRMSE', val: v39?.jvp.final_jacobian_nrmse_range[1] ?? 0.889, col: HOT, note: '0.89 (FAIL)' },
    { name: 'Endpt Value nRMSE', val: v39?.endpoints.final_value_nrmse_range[1] ?? 0.099, col: GOOD, note: '0.10 (looks ok)' },
    { name: 'Endpt Jacobian nRMSE', val: v39?.endpoints.final_jacobian_nrmse_range[1] ?? 1.198, col: HOT, note: '1.20 (FAIL)' },
  ]
  label(ctx, 'V39 FIRST-MLP NONLINEAR DIAGNOSIS', rx, topY, C.fg, MONO_B)
  bars.forEach((b, i) => {
    const y = topY + 24 + i * 38
    label(ctx, b.name, rx, y, C.mute, MONO_S)
    label(ctx, b.note, rx + rw, y, rgb(b.col), MONO_B, 'right')
    rrect(ctx, rx, y + 10, rw, 10, 3)
    ctx.fillStyle = C.soft
    ctx.fill()
    rrect(ctx, rx, y + 10, rw * clamp(b.val / 1.25, 0, 1) * prog, 10, 3)
    ctx.fillStyle = rgb(b.col, 0.86)
    ctx.fill()
  })

  if (bestHit) {
    const { c, n, x, y } = bestHit as { c: TheseusCase; n: number; x: number; y: number }
    ctx.strokeStyle = C.fg
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(x, y, 7, 0, Math.PI * 2)
    ctx.stroke()
    drawTooltip(
      ctx,
      W,
      H,
      x,
      y,
      [
        { text: `N=${n} prompts · ${c.model} (seed ${c.seed})`, bold: true },
        { text: `Median nRMSE: ${c.nrmse.toExponential(2)}  ·  cos: ${c.cos.toFixed(5)}`, color: rgb(c.passed ? GOOD : HOT) },
        { text: `CE delta: ${c.ce_delta.toExponential(2)}  ·  rows: ${c.rows.toLocaleString()}`, color: C.fg },
        { text: c.passed ? 'All frozen treatment & stratum gates PASSED' : `FAILED (${c.blockers} gate blockers)`, color: C.mute },
      ],
      C,
      c.passed ? GOOD : HOT,
    )
  }
}

/* ============================================================================
   7. HSI-LAB: All 13 Real Receipts (E1..E10) Interactive Forest Plot
   ============================================================================ */
type HsiReceipt = {
  id: string
  decision: string
  diff: number
  ci_lo: number
  ci_hi: number
  n_pairs: number
  receipt_digest: string
  lock_digest: string
}
type HsiJson = { receipts: HsiReceipt[] }

function renderHsiHero(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  p: number,
  C: ThemeColors,
  raw: unknown,
  ptr: PointerState,
) {
  const data = raw as HsiJson | null
  const receipts = (data?.receipts ?? []).slice(0, 11)
  label(ctx, `HSI-LAB REAL RECEIPT FOREST PLOT (${receipts.length} DETERMINISTIC RECEIPTS · E1 → E10)`, 18, 18, C.mute, MONO_B)

  const padL = 112
  const padR = 64
  const mapX = (v: number) => padL + ((v + 0.12) / 0.86) * (W - padL - padR)
  const zeroX = mapX(0)

  ctx.strokeStyle = C.line
  ctx.beginPath()
  ctx.moveTo(zeroX, 36)
  ctx.lineTo(zeroX, H - 22)
  ctx.stroke()

  const prog = ease(seg(p, 0.04, 0.72))
  let hovered: { r: HsiReceipt; y: number } | null = null

  receipts.forEach((r, i) => {
    const y = 46 + i * 20
    const col = r.decision === 'PROMOTE' ? GOOD : r.decision === 'INCONCLUSIVE' ? MID : HOT
    if (ptr.inside && Math.abs(ptr.y - y) <= 9) {
      hovered = { r, y }
      rrect(ctx, 10, y - 9, W - 20, 18, 3)
      ctx.fillStyle = rgb(col, 0.1)
      ctx.fill()
    }
    label(ctx, r.id, 18, y, C.fg, MONO_S)
    const xVal = lerp(zeroX, mapX(r.diff), prog)
    const xLo = lerp(zeroX, mapX(r.ci_lo), prog)
    const xHi = lerp(zeroX, mapX(r.ci_hi), prog)
    ctx.strokeStyle = rgb(col, 0.85)
    ctx.lineWidth = 2.2
    ctx.beginPath()
    ctx.moveTo(xLo, y)
    ctx.lineTo(xHi, y)
    ctx.stroke()
    ctx.fillStyle = rgb(col)
    ctx.beginPath()
    ctx.arc(xVal, y, 4, 0, Math.PI * 2)
    ctx.fill()
    label(ctx, `${r.diff >= 0 ? '+' : ''}${r.diff.toFixed(3)}`, xHi + 6, y, rgb(col), MONO_S)
  })

  if (hovered) {
    const { r, y } = hovered as { r: HsiReceipt; y: number }
    const col = r.decision === 'PROMOTE' ? GOOD : r.decision === 'INCONCLUSIVE' ? MID : HOT
    drawTooltip(
      ctx,
      W,
      H,
      ptr.x,
      y,
      [
        { text: `${r.id} · ${r.decision} (n = ${r.n_pairs} paired trials)`, bold: true, color: rgb(col) },
        { text: `Paired diff: ${r.diff >= 0 ? '+' : ''}${r.diff.toFixed(4)}  95% CI [${r.ci_lo.toFixed(3)}, ${r.ci_hi.toFixed(3)}]`, color: C.fg },
        { text: `receipt: ${r.receipt_digest}…  lock: ${r.lock_digest}…`, color: C.mute },
      ],
      C,
      col,
    )
  }
}

/* ============================================================================
   8. CADUCEUS: Real exp-003 Per-Skill Cluster Pass Rates + Containment Escapes
   ============================================================================ */
type CaduceusJson = {
  exp003?: {
    clusters: number
    mean_micro: number
    lower_micro: number
    per_skill: Record<string, { control_pass: number; random_pass: number; treatment_pass: number; units: number }>
  }
  containment?: {
    call?: { bad_contained: string; bad_live: string[] }
  }
}

function renderCaduceusHero(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  p: number,
  C: ThemeColors,
  raw: unknown,
  ptr: PointerState,
) {
  const data = raw as CaduceusJson | null
  const skills = Object.entries(data?.exp003?.per_skill ?? {})
  label(ctx, 'CADUCEUS exp-003 PER-SKILL CLUSTER PASS RATES (40 CLUSTERS) + CONTAINMENT AUDIT', 18, 18, C.mute, MONO_B)

  const prog = ease(seg(p, 0.05, 0.72))
  const leftW = Math.min(200, W * 0.36)
  const barW = W - leftW - 110
  let hovered: { name: string; s: { control_pass: number; random_pass: number; treatment_pass: number; units: number }; y: number } | null = null

  skills.forEach(([name, s], i) => {
    const y = 46 + i * 32
    if (ptr.inside && ptr.y >= y - 4 && ptr.y <= y + 24) {
      hovered = { name, s, y: y + 10 }
      rrect(ctx, 10, y - 4, W - 20, 28, 4)
      ctx.fillStyle = rgb(COOL, 0.08)
      ctx.fill()
    }
    label(ctx, name.slice(0, 26), 18, y + 9, C.fg, MONO_S)
    rrect(ctx, leftW, y, Math.max(40, barW), 18, 3)
    ctx.fillStyle = C.soft
    ctx.fill()

    const cW = Math.max(40, barW) * (s.control_pass / Math.max(1, s.units)) * prog
    const tW = Math.max(40, barW) * (s.treatment_pass / Math.max(1, s.units)) * prog

    rrect(ctx, leftW, y, tW, 18, 3)
    ctx.fillStyle = rgb(COOL, 0.85)
    ctx.fill()
    rrect(ctx, leftW, y + 4, cW, 10, 2)
    ctx.fillStyle = rgb(MID, 0.9)
    ctx.fill()
    label(ctx, `${s.treatment_pass}/${s.units} vs ${s.control_pass}`, leftW + Math.max(40, barW) + 8, y + 9, rgb(COOL), MONO_S)
  })

  const liveEscapes = data?.containment?.call?.bad_live?.length ?? 2
  chip(
    ctx,
    18,
    H - 36,
    W - 36,
    24,
    `exp-003 lift: +0.305 [+0.17, +0.445] · Call containment: ${data?.containment?.call?.bad_contained ?? '15/17'} (${liveEscapes} live escapes) · Authority lane: OFF (41% FP)`,
    { fill: rgb(MID, 0.12), stroke: rgb(MID, 0.5), color: C.fg, font: MONO_S },
  )

  if (hovered) {
    const { name, s, y } = hovered as {
      name: string
      s: { control_pass: number; random_pass: number; treatment_pass: number; units: number }
      y: number
    }
    drawTooltip(
      ctx,
      W,
      H,
      ptr.x,
      y,
      [
        { text: `Skill: ${name} (${s.units} units)`, bold: true },
        { text: `Treatment pass: ${s.treatment_pass}/${s.units} (${((s.treatment_pass / s.units) * 100).toFixed(0)}%)`, color: rgb(COOL) },
        { text: `Random control: ${s.random_pass}/${s.units}  ·  No-skill control: ${s.control_pass}/${s.units}`, color: rgb(MID) },
      ],
      C,
      COOL,
    )
  }
}

/* ============================================================================
   9. PLAYBOX: Real H100 Qwen3-30B-FP8 KV-Cache/RAG Bench + E8 Cross-Model Sweep
   ============================================================================ */
type PlayboxJson = {
  kv_30b?: {
    model: string
    gpu: string
    corpus_tokens: number
    arms: { id: string; n: number; acc: number; ttft_p50: number; turns_per_min: number; usd_per_1k: number; cached_frac: number }[]
  }
  e8_sweep?: {
    chance: number
    pairs: { pair: string; k16: number; k32: number; k128: number; cos128: number }[]
  }
}

function renderPlayboxHero(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  p: number,
  C: ThemeColors,
  raw: unknown,
  ptr: PointerState,
  mode: string,
) {
  const data = raw as PlayboxJson | null
  const prog = ease(seg(p, 0.05, 0.72))

  if (mode === 'e8') {
    const pairs = (data?.e8_sweep?.pairs ?? []).slice(0, 7)
    label(ctx, 'PLAYBOX E8 CROSS-MODEL HUB SWEEP (k=16 → k=32 → k=128 ANCHORS · CHANCE = 0.20)', 18, 18, C.mute, MONO_B)
    const leftW = Math.min(165, W * 0.32)
    const barW = W - leftW - 110
    let hovered: { pr: NonNullable<PlayboxJson['e8_sweep']>['pairs'][number]; y: number } | null = null

    pairs.forEach((pr, i) => {
      const y = 44 + i * 26
      if (ptr.inside && Math.abs(ptr.y - (y + 8)) < 12) {
        hovered = { pr, y: y + 8 }
        rrect(ctx, 10, y - 3, W - 20, 22, 3)
        ctx.fillStyle = rgb(COOL, 0.08)
        ctx.fill()
      }
      label(ctx, pr.pair, 18, y + 8, C.fg, MONO_S)
      rrect(ctx, leftW, y, Math.max(40, barW), 16, 3)
      ctx.fillStyle = C.soft
      ctx.fill()
      rrect(ctx, leftW, y, Math.max(40, barW) * pr.k128 * prog, 16, 3)
      ctx.fillStyle = rgb(COOL, 0.85)
      ctx.fill()
      rrect(ctx, leftW, y + 4, Math.max(40, barW) * pr.k16 * prog, 8, 2)
      ctx.fillStyle = rgb(HOT, 0.85)
      ctx.fill()
      label(ctx, `${(pr.k128 * 100).toFixed(0)}% (cos ${pr.cos128.toFixed(2)})`, leftW + Math.max(40, barW) + 8, y + 8, rgb(COOL), MONO_S)
    })

    if (hovered) {
      const { pr, y } = hovered as { pr: NonNullable<PlayboxJson['e8_sweep']>['pairs'][number]; y: number }
      drawTooltip(
        ctx,
        W,
        H,
        ptr.x,
        y,
        [
          { text: `Cross-model pair: ${pr.pair}`, bold: true },
          { text: `k=16: ${(pr.k16 * 100).toFixed(1)}%  →  k=32: ${(pr.k32 * 100).toFixed(1)}%  →  k=128: ${(pr.k128 * 100).toFixed(1)}%`, color: rgb(COOL) },
          { text: `Held-out hub cosine @ k=128: ${pr.cos128.toFixed(4)}  (chance = 20%)`, color: C.mute },
        ],
        C,
        COOL,
      )
    }
    return
  }

  // Default mode: H100 Qwen3-30B-FP8 KV-Cache vs RAG vs Hybrid
  const arms = (data?.kv_30b?.arms ?? []).slice(0, 7)
  label(
    ctx,
    `REAL H100 BENCHMARK (${data?.kv_30b?.model ?? 'Qwen3-30B-A3B-FP8'} · 111K TOKENS): ACC vs. TTFT p50`,
    18,
    18,
    C.mute,
    MONO_B,
  )
  const leftW = Math.min(168, W * 0.32)
  const barW = W - leftW - 140
  let hovered: { a: NonNullable<PlayboxJson['kv_30b']>['arms'][number]; y: number } | null = null

  arms.forEach((a, i) => {
    const y = 44 + i * 26
    if (ptr.inside && Math.abs(ptr.y - (y + 8)) < 12) {
      hovered = { a, y: y + 8 }
      rrect(ctx, 10, y - 3, W - 20, 22, 3)
      ctx.fillStyle = rgb(COOL, 0.08)
      ctx.fill()
    }
    const isHybrid = a.id.includes('hybrid')
    const col = isHybrid ? GOOD : a.id.includes('full') ? MID : COOL
    label(ctx, a.id, 18, y + 8, C.fg, MONO_S)
    rrect(ctx, leftW, y, Math.max(40, barW), 16, 3)
    ctx.fillStyle = C.soft
    ctx.fill()
    rrect(ctx, leftW, y, Math.max(40, barW) * a.acc * prog, 16, 3)
    ctx.fillStyle = rgb(col, 0.85)
    ctx.fill()
    label(ctx, `${(a.acc * 100).toFixed(1)}% · ${a.ttft_p50.toFixed(2)}s`, leftW + Math.max(40, barW) + 8, y + 8, rgb(col), MONO_S)
  })

  if (hovered) {
    const { a, y } = hovered as { a: NonNullable<PlayboxJson['kv_30b']>['arms'][number]; y: number }
    drawTooltip(
      ctx,
      W,
      H,
      ptr.x,
      y,
      [
        { text: `${a.id} (n = ${a.n} queries, H100 vLLM)`, bold: true },
        { text: `Accuracy: ${(a.acc * 100).toFixed(2)}%  ·  TTFT p50: ${a.ttft_p50.toFixed(3)}s`, color: rgb(GOOD) },
        { text: `Throughput: ${a.turns_per_min} turns/min  ·  Cost: $${a.usd_per_1k.toFixed(3)} / 1k correct`, color: rgb(COOL) },
        { text: `KV prefix cached fraction: ${(a.cached_frac * 100).toFixed(1)}%`, color: C.mute },
      ],
      C,
      COOL,
    )
  }
}

/* ============================================================================
   10–14. ALL REMAINING MONOGRAPHS, BACKED BY REAL SHA-256 BUNDLES + HOVER
   ============================================================================ */
type FormasecGate = { id: string; label: string; tested: number; unsafe: number; status: string; note: string }
type FormasecJson = { fuzz_admit_seeds: number; strata_trace_events: number; gates: FormasecGate[] }

function renderFormasecHero(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  p: number,
  C: ThemeColors,
  raw: unknown,
  ptr: PointerState,
) {
  const data = raw as FormasecJson | null
  const gates = data?.gates ?? []
  label(
    ctx,
    `FORMASEC AUDIT (M1–M6): 0 UNSAFE ADMISSIONS · ${data?.fuzz_admit_seeds ?? 44} FUZZ SEEDS · ${data?.strata_trace_events ?? 450} TRACES`,
    18,
    18,
    C.mute,
    MONO_B,
  )

  const prog = ease(seg(p, 0.04, 0.72))
  const leftW = Math.min(186, W * 0.34)
  const barW = W - leftW - 140
  const maxN = 600
  let hovered: { g: FormasecGate; y: number } | null = null

  for (let i = 0; i < gates.length; i++) {
    const g = gates[i]
    const y = 44 + i * 28
    const isNull = g.status === 'NULL'
    const col = isNull ? MID : GOOD
    if (ptr.inside && ptr.y >= y - 3 && ptr.y <= y + 23) {
      hovered = { g, y: y + 9 }
      rrect(ctx, 10, y - 3, W - 20, 24, 3)
      ctx.fillStyle = rgb(col, 0.1)
      ctx.fill()
    }
    label(ctx, g.label, 18, y + 9, C.fg, MONO_S)
    rrect(ctx, leftW, y, Math.max(40, barW), 16, 3)
    ctx.fillStyle = C.soft
    ctx.fill()
    const frac = Math.max(0.08, Math.log10(g.tested + 1) / Math.log10(maxN + 1))
    rrect(ctx, leftW, y, Math.max(40, barW) * frac * prog, 16, 3)
    ctx.fillStyle = rgb(col, 0.84)
    ctx.fill()
    chip(
      ctx,
      leftW + Math.max(40, barW) + 8,
      y - 1,
      118,
      18,
      isNull ? 'HONEST NULL' : `${g.unsafe}/${g.tested} UNSAFE`,
      { fill: rgb(col, 0.14), stroke: rgb(col, 0.6), color: rgb(col), font: MONO_B },
    )
  }

  label(ctx, 'Python · Rust · Lean 4 structural parity (600/600) + Kani model check on pure Rust decision core.', W / 2, H - 14, C.mute, SERIF_I, 'center')

  if (hovered) {
    const { g, y } = hovered
    const accent = g.status === 'NULL' ? MID : GOOD
    drawTooltip(
      ctx,
      W,
      H,
      ptr.x,
      y,
      [
        { text: `${g.label}  [${g.status}]`, bold: true, color: rgb(accent) },
        { text: `Cases tested: ${g.tested}  ·  Unsafe admissions: ${g.unsafe}`, color: C.fg },
        { text: g.note, color: C.mute },
      ],
      C,
      accent,
    )
  }
}

type ReplayMod = { module: string; total: number; highlighted: number; samples: string[] }
type ReplaySuiteJson = {
  total_tests: number
  highlighted_total: number
  modules: ReplayMod[]
  fixtures?: { version: string; bytes: number; sha256: string }[]
  ignored_tests?: number
  workload_families?: number
  mutation_classes?: number
}

function renderSecAlignHero(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  p: number,
  C: ThemeColors,
  raw: unknown,
  ptr: PointerState,
) {
  const data = raw as ReplaySuiteJson | null
  const mods = (data?.modules ?? []).slice(0, 8)
  label(
    ctx,
    `SECURITY ALIGNMENT OS: ${data?.total_tests ?? 279} REAL RUST TESTS (${data?.highlighted_total ?? 116} ADVERSARIAL / REPLAY / ESCAPE)`,
    18,
    18,
    C.mute,
    MONO_B,
  )

  const prog = ease(seg(p, 0.04, 0.72))
  const leftW = Math.min(155, W * 0.28)
  const barW = W - leftW - 122
  const maxMod = Math.max(1, ...mods.map((m) => m.total))
  let hovered: { m: ReplayMod; y: number } | null = null

  for (let i = 0; i < mods.length; i++) {
    const m = mods[i]
    const y = 44 + i * 23
    if (ptr.inside && ptr.y >= y - 3 && ptr.y <= y + 18) {
      hovered = { m, y: y + 8 }
      rrect(ctx, 10, y - 3, W - 20, 20, 3)
      ctx.fillStyle = rgb(COOL, 0.08)
      ctx.fill()
    }
    label(ctx, m.module, 18, y + 7, C.fg, MONO_S)
    rrect(ctx, leftW, y, Math.max(40, barW), 14, 3)
    ctx.fillStyle = C.soft
    ctx.fill()
    const totalW = Math.max(40, barW) * (m.total / maxMod) * prog
    const advW = Math.max(40, barW) * (m.highlighted / maxMod) * prog
    rrect(ctx, leftW, y, totalW, 14, 3)
    ctx.fillStyle = rgb(COOL, 0.78)
    ctx.fill()
    if (advW > 1) {
      rrect(ctx, leftW, y, advW, 14, 3)
      ctx.fillStyle = rgb(MID, 0.92)
      ctx.fill()
    }
    label(ctx, `${m.total} (${m.highlighted} adv)`, leftW + Math.max(40, barW) + 8, y + 7, C.mute, MONO_S)
  }

  legend(
    ctx,
    [
      { label: 'Adversarial / replay / escape / reject tests', c: rgb(MID) },
      { label: 'Core invariant tests (0 escapes)', c: rgb(COOL) },
    ],
    W / 2,
    H - 14,
    C,
  )

  if (hovered) {
    const { m, y } = hovered
    const lines = [
      { text: `Module ${m.module}::tests (${m.total} passed · ${m.highlighted} adversarial)`, bold: true, color: rgb(MID) },
      ...m.samples.slice(0, 3).map((s) => ({ text: `• ${s.slice(0, 58)}`, color: C.fg })),
    ]
    drawTooltip(ctx, W, H, ptr.x, y, lines, C, MID)
  }
}

function renderHyperintelHero(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  p: number,
  C: ThemeColors,
  raw: unknown,
  ptr: PointerState,
) {
  const data = raw as ReplaySuiteJson | null
  const fixtures = data?.fixtures ?? []
  label(
    ctx,
    `HYPERINTEL: OFFLINE RECEIPT CHAIN (${data?.total_tests ?? 114} TESTS · ${data?.ignored_tests ?? 2} IGNORED) & V1–V4 FIXTURES`,
    18,
    18,
    C.mute,
    MONO_B,
  )

  const stages = [
    { name: 'Offer', note: 'Signed capacity quote + fee split' },
    { name: 'Route', note: 'Z3 unsat: ineligible offer blocked' },
    { name: 'Admit', note: 'SQLite CAS single-use nonce' },
    { name: 'Meter', note: 'Deterministic token/usage receipt' },
    { name: 'Settle', note: 'Offline bundle vs trust registry' },
  ]
  const gap = 14
  const bw = (W - 36 - gap * (stages.length - 1)) / stages.length
  const tamperPhase = p > 0.54
  const tamperIdx = 2
  let hoveredStage: { st: (typeof stages)[number]; idx: number; cx: number } | null = null

  for (let i = 0; i < stages.length; i++) {
    const st = stages[i]
    const x = 18 + i * (bw + gap)
    const broken = tamperPhase && i >= tamperIdx
    const col = broken ? HOT : COOL
    if (ptr.inside && ptr.x >= x && ptr.x <= x + bw && ptr.y >= 46 && ptr.y <= 116) {
      hoveredStage = { st, idx: i, cx: x + bw / 2 }
    }
    rrect(ctx, x, 46, bw, 68, 6)
    ctx.fillStyle = rgb(col, hoveredStage?.idx === i ? 0.22 : 0.12)
    ctx.fill()
    ctx.strokeStyle = rgb(col, 0.8)
    ctx.lineWidth = 1.6
    ctx.stroke()
    label(ctx, st.name, x + bw / 2, 68, rgb(col), SANS_B, 'center')
    label(ctx, broken ? 'HASH FAIL' : `h_${i} valid`, x + bw / 2, 92, broken ? rgb(HOT) : C.mute, MONO_S, 'center')
    if (i < stages.length - 1) arrow(ctx, x + bw + 2, 80, x + bw + gap - 2, 80, rgb(col), 1.5, 6)
  }

  // Real V1..V4 offline evidence fixture chips from hyperintel-cli/tests/fixtures
  let hoveredFix: { fx: NonNullable<ReplaySuiteJson['fixtures']>[number]; cx: number } | null = null
  if (fixtures.length) {
    const fw = (W - 36 - (fixtures.length - 1) * 8) / fixtures.length
    for (let i = 0; i < fixtures.length; i++) {
      const fx = fixtures[i]
      const x = 18 + i * (fw + 8)
      const y = 130
      if (ptr.inside && ptr.x >= x && ptr.x <= x + fw && ptr.y >= y && ptr.y <= y + 26) {
        hoveredFix = { fx, cx: x + fw / 2 }
      }
      chip(ctx, x, y, fw, 26, `${fx.version}: ${fx.sha256.slice(0, 10)}…`, {
        fill: rgb(GOOD, hoveredFix?.fx === fx ? 0.22 : 0.1),
        stroke: rgb(GOOD, 0.55),
        color: rgb(GOOD),
        font: MONO_S,
      })
    }
  }

  label(
    ctx,
    tamperPhase
      ? 'TAMPER AT ADMIT -> downstream settlement digest fails offline against caller trust registry.'
      : '2 concurrency journal wrapper tests explicitly marked ignored & unverified in RESEARCH.md.',
    W / 2,
    H - 16,
    tamperPhase ? rgb(HOT) : C.mute,
    SERIF_I,
    'center',
  )

  if (hoveredStage) {
    const { st, idx, cx } = hoveredStage
    drawTooltip(
      ctx,
      W,
      H,
      cx,
      80,
      [
        { text: `Stage ${idx + 1}: ${st.name}`, bold: true },
        { text: st.note, color: rgb(COOL) },
        { text: tamperPhase && idx >= tamperIdx ? 'Bit-flip breaks SHA-256 chain → OFFLINE REJECT' : 'Verified deterministically in workspace suite', color: C.mute },
      ],
      C,
      tamperPhase && idx >= tamperIdx ? HOT : COOL,
    )
  } else if (hoveredFix) {
    const { fx, cx } = hoveredFix
    drawTooltip(
      ctx,
      W,
      H,
      cx,
      142,
      [
        { text: `Offline fixture evidence-${fx.version.toLowerCase()}.json`, bold: true, color: rgb(GOOD) },
        { text: `SHA-256: ${fx.sha256}…  (${fx.bytes.toLocaleString()} bytes)`, color: C.fg },
        { text: 'Verified offline by hyperintel-cli against caller trust registry', color: C.mute },
      ],
      C,
      GOOD,
    )
  }
}

function renderZkBenchHero(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  p: number,
  C: ThemeColors,
  raw: unknown,
  ptr: PointerState,
) {
  const data = raw as ReplaySuiteJson | null
  const mods = (data?.modules ?? []).slice(0, 8)
  label(
    ctx,
    `COMPOSED ZK BENCHMARK OS: ${data?.total_tests ?? 1107} REAL RUST TESTS (${data?.highlighted_total ?? 214} MUTATION / ADVERSARIAL)`,
    18,
    18,
    C.mute,
    MONO_B,
  )

  const prog = ease(seg(p, 0.04, 0.72))
  const leftW = Math.min(165, W * 0.3)
  const barW = W - leftW - 125
  const maxMod = Math.max(1, ...mods.map((m) => m.total))
  let hovered: { m: ReplayMod; y: number } | null = null

  for (let i = 0; i < mods.length; i++) {
    const m = mods[i]
    const y = 44 + i * 23
    if (ptr.inside && ptr.y >= y - 3 && ptr.y <= y + 18) {
      hovered = { m, y: y + 8 }
      rrect(ctx, 10, y - 3, W - 20, 20, 3)
      ctx.fillStyle = rgb(HOT, 0.08)
      ctx.fill()
    }
    label(ctx, m.module.slice(0, 22), 18, y + 7, C.fg, MONO_S)
    rrect(ctx, leftW, y, Math.max(40, barW), 14, 3)
    ctx.fillStyle = C.soft
    ctx.fill()
    const totalW = Math.max(40, barW) * (m.total / maxMod) * prog
    const mutW = Math.max(40, barW) * (m.highlighted / maxMod) * prog
    rrect(ctx, leftW, y, totalW, 14, 3)
    ctx.fillStyle = rgb(COOL, 0.78)
    ctx.fill()
    if (mutW > 1) {
      rrect(ctx, leftW, y, mutW, 14, 3)
      ctx.fillStyle = rgb(HOT, 0.9)
      ctx.fill()
    }
    label(ctx, `${m.total} (${m.highlighted} mut)`, leftW + Math.max(40, barW) + 8, y + 7, C.mute, MONO_S)
  }

  legend(
    ctx,
    [
      { label: 'Adversarial mutation tests (14 classes)', c: rgb(HOT) },
      { label: 'Core semantics / oracle tests (9 families)', c: rgb(COOL) },
    ],
    W / 2,
    H - 14,
    C,
  )

  if (hovered) {
    const { m, y } = hovered
    drawTooltip(
      ctx,
      W,
      H,
      ptr.x,
      y,
      [
        { text: `Module ${m.module} (${m.total} tests · ${m.highlighted} mutation/adversarial)`, bold: true, color: rgb(HOT) },
        ...m.samples.slice(0, 3).map((s) => ({ text: `• ${s.slice(0, 58)}`, color: C.fg })),
      ],
      C,
      HOT,
    )
  }
}

type AhclTarget = { id: string; r2: number; sign_agreement: number; shuffled_r2: number; retention_guard_r2: number }
type AhclJson = { status: string; prediction_lock_digest: string; experiment_digest: string; targets: AhclTarget[] }

function renderAhclHero(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  p: number,
  C: ThemeColors,
  raw: unknown,
  ptr: PointerState,
) {
  const data = raw as AhclJson | null
  const targets = data?.targets ?? []
  label(
    ctx,
    `AHCL REAL SYNTHETIC RECEIPT (lock ${data?.prediction_lock_digest?.slice(0, 10) ?? '86063d2efe'}…): R² vs. SHUFFLED CONTROL`,
    18,
    18,
    C.mute,
    MONO_B,
  )

  const padL = 165
  const padR = 26
  const plotW = W - padL - padR
  const minV = -0.65
  const maxV = 1.05
  const mapX = (v: number) => padL + ((clamp(v, minV, maxV) - minV) / (maxV - minV)) * plotW
  const zeroX = mapX(0)
  const gateX = mapX(0.25)

  ctx.strokeStyle = C.line
  ctx.beginPath()
  ctx.moveTo(zeroX, 38)
  ctx.lineTo(zeroX, H - 54)
  ctx.stroke()

  ctx.save()
  ctx.setLineDash([4, 3])
  ctx.strokeStyle = rgb(MID, 0.8)
  ctx.beginPath()
  ctx.moveTo(gateX, 38)
  ctx.lineTo(gateX, H - 54)
  ctx.stroke()
  ctx.restore()
  label(ctx, 'R² ≥ 0.25 gate', gateX, 34, rgb(MID), MONO_S, 'center')

  const prog = ease(seg(p, 0.04, 0.7))
  let hovered: { t: AhclTarget; y: number } | null = null

  for (let i = 0; i < targets.length; i++) {
    const t = targets[i]
    const y = 52 + i * 32
    if (ptr.inside && ptr.y >= y - 4 && ptr.y <= y + 24) {
      hovered = { t, y: y + 9 }
      rrect(ctx, 10, y - 4, W - 20, 26, 3)
      ctx.fillStyle = rgb(COOL, 0.08)
      ctx.fill()
    }
    label(ctx, t.id.replace(/_/g, ' '), 18, y + 8, C.fg, MONO_S)

    // Positive fixed_update R² bar
    const xPos = lerp(zeroX, mapX(t.r2), prog)
    rrect(ctx, zeroX, y, xPos - zeroX, 15, 3)
    ctx.fillStyle = rgb(COOL, 0.88)
    ctx.fill()
    label(ctx, `+${t.r2.toFixed(3)}`, xPos + 6, y + 8, rgb(COOL), MONO_B)

    // Negative shuffled control bar
    const xNeg = lerp(zeroX, mapX(t.shuffled_r2), prog)
    rrect(ctx, xNeg, y + 2, zeroX - xNeg, 11, 2)
    ctx.fillStyle = rgb(GOOD, 0.78)
    ctx.fill()
    label(ctx, `${t.shuffled_r2.toFixed(2)}`, xNeg - 6, y + 8, rgb(GOOD), MONO_S, 'right')
  }

  chip(
    ctx,
    18,
    H - 42,
    W - 36,
    24,
    'Synthetic harness + shuffled controls PASS -> Matched-progress confound gate FAILED (0/5 seeds) -> CLAIM STOPPED',
    { fill: rgb(HOT, 0.12), stroke: rgb(HOT, 0.55), color: rgb(HOT), font: MONO_S },
  )

  if (hovered) {
    const { t, y } = hovered
    drawTooltip(
      ctx,
      W,
      H,
      ptr.x,
      y,
      [
        { text: `Target: ${t.id}`, bold: true },
        { text: `fixed_update R² = +${t.r2.toFixed(4)}  ·  sign agreement = ${(t.sign_agreement * 100).toFixed(1)}%`, color: rgb(COOL) },
        { text: `Shuffled control R² = ${t.shuffled_r2.toFixed(4)}  (ceiling ≤ 0.20 → PASS)`, color: rgb(GOOD) },
        { text: `retention_guard R² = ${t.retention_guard_r2.toFixed(3)}`, color: C.mute },
      ],
      C,
      COOL,
    )
  }
}

/* ============================================================================
   NEW INLINE RAW-DATA EXPLORERS: cl7b Continual Memory & Holdout 59,200 Runs
   ============================================================================ */
type Cl7bArm = {
  id: string
  label: string
  fact_acc: number
  oldest_acc: number
  wiki_nll: number
  real_cap: number
  arith: number
  unlearn_other?: number
  unlearn_drop?: number
  tone: string
}

function renderCl7bMemory(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  p: number,
  C: ThemeColors,
  raw: unknown,
  ptr: PointerState,
) {
  const data = raw as { cl7b_arms?: Cl7bArm[] } | null
  const arms = data?.cl7b_arms ?? []
  label(ctx, 'QWEN3-1.7B CONTINUAL MEMORY (cl7b, 4 TASKS × 40 FACTS): FACT ACC vs. WIKI NLL', 18, 18, C.mute, MONO_B)

  const leftW = Math.min(176, W * 0.34)
  const splitX = Math.floor(leftW + (W - leftW) * 0.52)
  const barW1 = splitX - leftW - 56
  const barW2 = W - splitX - 72
  const prog = ease(seg(p, 0.04, 0.72))

  label(ctx, 'Mean Fact Acc (higher = better)', leftW, 40, C.fg, SANS_B)
  label(ctx, 'Wiki NLL (base 3.29, lower = fluent)', splitX + 10, 40, C.fg, SANS_B)

  let hovered: { a: Cl7bArm; y: number } | null = null

  for (let i = 0; i < arms.length; i++) {
    const a = arms[i]
    const y = 56 + i * 30
    const col: RGB = a.tone === 'good' ? GOOD : a.tone === 'cool' ? COOL : a.tone === 'mid' ? MID : HOT
    if (ptr.inside && ptr.y >= y - 3 && ptr.y <= y + 23) {
      hovered = { a, y: y + 9 }
      rrect(ctx, 10, y - 3, W - 20, 24, 3)
      ctx.fillStyle = rgb(col, 0.09)
      ctx.fill()
    }
    label(ctx, a.label, 18, y + 8, C.fg, MONO_S)

    // Left: Fact Accuracy
    rrect(ctx, leftW, y, Math.max(40, barW1), 15, 3)
    ctx.fillStyle = C.soft
    ctx.fill()
    const w1 = Math.max(40, barW1) * a.fact_acc * prog
    rrect(ctx, leftW, y, w1, 15, 3)
    ctx.fillStyle = rgb(col, 0.88)
    ctx.fill()
    label(ctx, `${(a.fact_acc * 100).toFixed(1)}%`, leftW + w1 + 6, y + 8, rgb(col), MONO_B)

    // Right: Wiki NLL (3.29 -> 18)
    const x2 = splitX + 10
    rrect(ctx, x2, y, Math.max(40, barW2), 15, 3)
    ctx.fillStyle = C.soft
    ctx.fill()
    const w2 = Math.max(40, barW2) * clamp(a.wiki_nll / 18.5, 0, 1) * prog
    rrect(ctx, x2, y, w2, 15, 3)
    ctx.fillStyle = rgb(a.wiki_nll > 5 ? HOT : a.wiki_nll < 3.4 ? COOL : MID, 0.85)
    ctx.fill()
    label(ctx, a.wiki_nll.toFixed(2), x2 + w2 + 6, y + 8, a.wiki_nll > 5 ? rgb(HOT) : C.fg, MONO_S)
  }

  label(ctx, 'OrthoDelta preserves base Wiki NLL (3.294) & supports selective unlearning (remove_t2: 0.961 kept / 0.100 erased).', W / 2, H - 14, C.mute, SERIF_I, 'center')

  if (hovered) {
    const { a, y } = hovered
    const col: RGB = a.tone === 'good' ? GOOD : a.tone === 'cool' ? COOL : a.tone === 'mid' ? MID : HOT
    const lines = [
      { text: `${a.label} (Qwen3-1.7B-Base)`, bold: true, color: rgb(col) },
      { text: `4-task fact acc: ${(a.fact_acc * 100).toFixed(1)}%  ·  oldest task: ${(a.oldest_acc * 100).toFixed(1)}%`, color: C.fg },
      { text: `Wiki NLL: ${a.wiki_nll.toFixed(3)}  ·  real_cap: ${a.real_cap.toFixed(2)}  ·  arith: ${a.arith.toFixed(2)}`, color: C.fg },
    ]
    if (a.unlearn_other !== undefined) {
      lines.push({ text: `Selective unlearn (remove_t2): others ${(a.unlearn_other * 100).toFixed(1)}%, target ${(a.unlearn_drop! * 100).toFixed(1)}%`, color: rgb(COOL) })
    }
    drawTooltip(ctx, W, H, ptr.x, y, lines, C, col)
  }
}

type ConfRow = { proposer: string; gate: string; n_runs: number; mean_overclaim: number; mean_d_true: number; mean_swaps?: number }

function renderHoldoutConfirmatory(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  p: number,
  C: ThemeColors,
  raw: unknown,
  ptr: PointerState,
) {
  const data = raw as { confirmatory_59200?: ConfRow[] } | null
  const rows = data?.confirmatory_59200 ?? []
  label(ctx, '59,200 CONFIRMATORY RUNS (confirmatory.jsonl): MEAN OVERCLAIM vs. TRUE PICK BY GATE', 18, 18, C.mute, MONO_B)

  const proposers = ['pool', 'patch', 'mixed']
  const gates = ['batch', 'seq', 'seqm', 'mdl']
  const lookup = new Map(rows.map((r) => [`${r.proposer}:${r.gate}`, r]))

  const padL = 78
  const padR = 20
  const topY = 52
  const botY = H - 46
  const colW = (W - padL - padR) / gates.length
  const rowH = (botY - topY) / proposers.length
  const prog = ease(seg(p, 0.04, 0.7))

  gates.forEach((g, j) => {
    label(ctx, `gate: ${g}`, padL + j * colW + colW / 2, 38, g === 'mdl' ? rgb(GOOD) : C.mute, MONO_B, 'center')
  })

  let hovered: { r: ConfRow; cx: number; cy: number } | null = null

  for (let i = 0; i < proposers.length; i++) {
    const pr = proposers[i]
    const y = topY + i * rowH
    label(ctx, pr, 18, y + rowH / 2, C.fg, MONO_B)
    for (let j = 0; j < gates.length; j++) {
      const gt = gates[j]
      const r = lookup.get(`${pr}:${gt}`)
      const x = padL + j * colW + 4
      const cw = colW - 8
      const ch = rowH - 8
      const over = r?.mean_overclaim ?? 0
      const intensity = clamp(over / 0.03, 0, 1)
      const col: RGB = over < 0.008 ? GOOD : over < 0.015 ? COOL : HOT
      if (r && ptr.inside && ptr.x >= x && ptr.x <= x + cw && ptr.y >= y + 4 && ptr.y <= y + 4 + ch) {
        hovered = { r, cx: x + cw / 2, cy: y + 4 + ch / 2 }
      }
      rrect(ctx, x, y + 4, cw, ch, 4)
      ctx.fillStyle = rgb(col, (0.12 + 0.24 * intensity) * prog)
      ctx.fill()
      ctx.strokeStyle = rgb(col, hovered?.r === r ? 0.95 : 0.55)
      ctx.lineWidth = hovered?.r === r ? 1.8 : 1.1
      ctx.stroke()
      if (r) {
        label(ctx, `over +${r.mean_overclaim.toFixed(4)}`, x + cw / 2, y + 4 + ch * 0.38, rgb(col), MONO_B, 'center')
        label(ctx, `true ${r.mean_d_true.toFixed(3)}`, x + cw / 2, y + 4 + ch * 0.7, C.mute, MONO_S, 'center')
      }
    }
  }

  label(ctx, 'Every cell aggregates 4,800–5,600 real holdout-ledger runs (total n = 59,200).', W / 2, H - 16, C.mute, SERIF_I, 'center')

  if (hovered) {
    const { r, cx, cy } = hovered
    const accent: RGB = r.mean_overclaim < 0.008 ? GOOD : r.mean_overclaim < 0.015 ? COOL : HOT
    drawTooltip(
      ctx,
      W,
      H,
      cx,
      cy,
      [
        { text: `Proposer: ${r.proposer}  ×  Gate: ${r.gate} (n = ${r.n_runs.toLocaleString()} runs)`, bold: true, color: rgb(accent) },
        { text: `Mean overclaim (max(0, d̂ − d_true)): +${r.mean_overclaim.toFixed(4)}`, color: C.fg },
        { text: `Mean true selected gain d_true: +${r.mean_d_true.toFixed(4)}`, color: rgb(COOL) },
      ],
      C,
      accent,
    )
  }
}

/* ============================================================================
   ANIMATION REGISTRY (every hero slug + inline mechanism id)
   ============================================================================ */
const RESEARCH_ANIMS: Record<string, AnimDef> = {
  'arc-membrane': {
    dataFile: 'arc-membrane.json',
    cycleMs: 11000,
    height: (W) => (W < 620 ? 320 : 320),
    ariaLabel: 'Interactive 400-problem sealed A100 MATH-500 matrix showing Base Qwen3-30B-A3B transitioning to Track 5 Arm C QR-Nullspace SFT with 152 fail-to-pass flips and 6 regressions.',
    caption: 'Every single cell is a real sealed A100 MATH-500 problem (`n = 400`, sorted L1→L5). Track 5 QR-Nullspace SFT delivers `152` fail→pass flips vs. `6` pass→fail regressions ($p = 1.12\\times 10^{-37}$) while clamping replay KL to `0.000605` (`180×` lower than unprojected SFT).',
    provenance: 'arc_membrane/track5_math500_n400_qr_sft_manifest.json',
    hoverHint: 'Hover any of the 400 problem cells to inspect uid, tokens, gold & Arm C prediction',
    render: renderArcHero,
  },
  'arc-run-replay': {
    dataFile: 'arc-membrane.json',
    cycleMs: 9000,
    height: () => 315,
    ariaLabel: 'Real paired MATH-500 run trace comparing Base Qwen3-30B-A3B hitting the 1536 token cutoff versus Arm C QR-Nullspace SFT solving cleanly.',
    caption: 'Live token-by-token race of 8 paired MATH-500 spotcheck problems from `track5_math500_n400_qr_sft_manifest.json`: Base hits the 1,536-token wall while Arm C solves all 8 concisely (`181–1,212` tokens).',
    provenance: 'arc_membrane/track5_math500_n400_qr_sft_manifest.json',
    hoverHint: 'Hover any row for exact token compression ratio & answers',
    render: renderArcRunReplay,
  },
  'arc-math500-levels': {
    dataFile: 'arc-membrane.json',
    cycleMs: 7500,
    height: () => 258,
    ariaLabel: 'Base versus Track 5 Arm C MATH-500 accuracy and length cutoff rate by difficulty level 1 through 5.',
    caption: 'Sealed `n = 400` MATH-500 lift across every difficulty tier: `+12.5 pp` (L1), `+21.7 pp` (L2), `+39.3 pp` (L3), `+46.7 pp` (L4), and `+38.8 pp` (L5).',
    provenance: 'arc_membrane/track5_math500_n400_verified_report.json',
    hoverHint: 'Hover any level column for exact F→P / P→F counts & avg tokens',
    render: renderArcLevels,
  },
  'holdout-ledger': {
    dataFile: 'holdout-eprocess.json',
    cycleMs: 9500,
    height: (W) => (W < 520 ? 275 : 295),
    ariaLabel: 'Anytime Empirical-Bernstein e-process crossing the Ville barrier while 14 null patches stay suppressed.',
    caption: 'Anytime Empirical-Bernstein $e$-process wealth trajectories (`holdout-eprocess.json`): honest improver certifies early while naive Wald overclaims on `54.4%` of null-attacked trials across `59,200` confirmatory runs.',
    provenance: 'primitives/results/eprocess_holdout_benchmark.json',
    hoverHint: 'Hover along the x-axis to inspect exact log₁₀ E_t & Wald LCB at any step',
    render: renderHoldoutHero,
  },
  'holdout-broker-waterfall': {
    dataFile: 'holdout-eprocess.json',
    cycleMs: 8500,
    height: () => 252,
    ariaLabel: 'All 238 real Gemma-4 SWE trajectories across 7 agent runs and 34 tasks colored by broker admission, scratch sanitization, and task resolution.',
    caption: 'All `238` real Gemma-4 SWE trajectories (`7` runs × `34` tasks) scored deterministically by `primitives.verified_loop.admit_trajectory`: stripping scratch `repro.py` (amber dots, `43` trajectories) lifts precision `4.75×` while saving `65.1%` of holdout budget.',
    provenance: 'gemma4-agent/runs/*/results_heldout_draw1.json',
    hoverHint: 'Hover any of the 238 trajectory cells for exact repo, tool count & broker verdict',
    render: renderBrokerWaterfall,
  },
  'holdout-confirmatory-59k': {
    dataFile: 'holdout-eprocess.json',
    cycleMs: 8000,
    height: () => 235,
    ariaLabel: '59,200 confirmatory holdout-ledger runs across pool, patch, and mixed proposers versus batch, seq, seqm, and mdl gates.',
    caption: 'Full confirmatory matrix aggregated from `../holdout-ledger/results/confirmatory.jsonl` (`59,200` runs): MDL & sequential gates suppress adaptive overclaim without collapsing true selected gain.',
    provenance: '../holdout-ledger/results/confirmatory.jsonl',
    hoverHint: 'Hover any proposer × gate cell for exact run count, mean overclaim & true gain',
    render: renderHoldoutConfirmatory,
  },
  'mech-interp-unified': {
    dataFile: 'mech-interp-audit.json',
    cycleMs: 9000,
    height: () => 302,
    ariaLabel: 'Real MPS/GPU 8-claim causal audit matrix comparing Naive, Probe+Donor, and Unified Portfolio Invariants across Qwen3-1.7B and Qwen2.5-0.5B.',
    caption: 'Live audit matrix from `16` real forward-pass claims across `Qwen3-1.7B-Base` (L21) and `Qwen2.5-0.5B` (L18): naive necessity catches `0/6`, probe+donor catches `4/6`, and unified portfolio invariants catch `6/6` with `0` false positives.',
    provenance: 'primitives/results/real_interp_audit_qwen3_1_7b.json',
    hoverHint: 'Hover any claim row to inspect all 7 measured forward-pass signals',
    modes: [
      { id: 'qwen3', label: 'Qwen3-1.7B (L21)' },
      { id: 'qwen25', label: 'Qwen2.5-0.5B (L18)' },
    ],
    render: renderMechInterpHero,
  },
  'jspace-pca-equiv': {
    dataFile: 'jspace-equivalence.json',
    cycleMs: 8500,
    height: () => 295,
    ariaLabel: 'Scatter plot of real H100 OLMo-2-7B prompts showing J-space ablation deltas lying directly on the y=x norm-matched PCA diagonal.',
    caption: 'Real H100 `OLMo-2-7B` per-prompt logit deltas (`gateB2_*_raw.npz`, dose `0.2`, `100` stratified prompts from `n = 2,000` per checkpoint): J-space ablation collapses directly onto the `y = x` norm-matched PCA diagonal ($r = 0.855$ on DPO, $0.854$ on Instruct), while random-$k$ controls stay near `(0, 0)`.',
    provenance: 'jspace-pilot/results/gateB2_*_raw.npz',
    hoverHint: 'Hover any H100 prompt dot to inspect exact Δ_J, Δ_PCA & random-k delta',
    modes: [
      { id: 'dpo', label: 'DPO (r=0.855)' },
      { id: 'inst', label: 'Instruct (r=0.854)' },
      { id: 'sft', label: 'SFT (r=0.814)' },
      { id: 'base', label: 'Base (r=0.751)' },
    ],
    render: renderJspacePcaEquiv,
  },
  'theseus-lab': {
    cycleMs: 9000,
    height: () => 242,
    ariaLabel: 'Live two-panel floating-point MLP forward pass proving exact permutation invariance while same-index neuron probes break.',
    caption: 'Computed live in JavaScript on weights $W_1, W_2$ and derangement $P$: hidden activations scramble `100%` across indices while output logits match to floating-point precision (`GPT-2`: $3\\times 10^{-7}$).',
    provenance: 'theseus-lab/RESEARCH.md',
    hoverHint: 'Hover any hidden unit chip u₀–u₃ to trace its relocation under P',
    render: renderTheseusHero,
  },
  'theseus-coverage-v39': {
    dataFile: 'theseus-real.json',
    cycleMs: 8500,
    height: () => 260,
    ariaLabel: 'Left: 27 real adaptation-coverage cases showing an 824,000x normalized error drop between 128 and 256 prompts. Right: V39 nonlinear MLP diagnosis showing low value error but high Jacobian error.',
    caption: 'Left: real adaptation-coverage phase transition across `27` cases (`replacement-loss-v8-scale-r5-N{128,256,512}`): error plunges from `0.301` at `N=128` to `3.66e−7` at `N=256`. Right: `V39` (`384` decoder pairs, `288` full Jacobians) proves low value error (`0.10–0.11`) masks severe local Jacobian error (`0.89–1.20`).',
    provenance: '../theseus-lab/docs/v39-first-mlp-diagnosis-v1-results.json',
    hoverHint: 'Hover any case dot on the left to inspect exact model, seed, nRMSE & cosine',
    render: renderTheseusCoverage,
  },
  'temporal-grid-safety': {
    dataFile: 'temporal-grid-real.json',
    cycleMs: 8500,
    height: () => 282,
    ariaLabel: 'Real per-seed held-out safety trajectories across steps 1 to 128 for OLMo-2-7B, Qwen3-8B, and Mistral-7B.',
    caption: 'All `6` individual seeds (`out30/*.json`) + mean curves across `1..128` benign fine-tune steps: discriminant adapters hold `OLMo-2-7B` and `Qwen3-8B` near `1.0`, while `Mistral-7B` reveals why replay (`disc_replay`) is still needed (`0.625` vs `0.188`).',
    provenance: '../temporal-grid-safety/out30/*.json',
    hoverHint: 'Hover across steps 1..128 to compare all 4 arms and min/max seed spread',
    modes: [
      { id: 'olmo', label: 'OLMo-2-7B' },
      { id: 'qwen', label: 'Qwen3-8B' },
      { id: 'mistral', label: 'Mistral-7B' },
    ],
    render: renderTemporalGridHero,
  },
  'sacred-geography-kailas': {
    dataFile: 'kailas-two-clock.json',
    cycleMs: 10000,
    height: (W) => (W < 540 ? 290 : 265),
    ariaLabel: 'All 126 real coded Kailas kora episodes across Thubron, Indigenous, and Cross-Tradition corpora plotted around the 52 km circuit alongside Two-Clock Rissanen MDL double dissociation.',
    caption: 'All `126` coded kora episodes across `3` corpora (`thubron_kora_codings.csv`, `indigenous_kora_codings.csv`, `cross_tradition_kora_codings.csv`) plotted at their exact `r_progress` alongside the Two-Clock Rissanen MDL double dissociation (`+2.03` vs `−1.40` bits).',
    provenance: 'kailas-corpus/coding/*.csv',
    hoverHint: 'Hover any episode dot around the ring for chapter/tradition, stage & SHA-1',
    modes: [
      { id: 'thubron', label: 'Thubron (48)' },
      { id: 'indigenous', label: 'Indigenous (48)' },
      { id: 'cross', label: 'Cross-Tradition (30)' },
    ],
    render: renderKailasHero,
  },
  caduceus: {
    dataFile: 'caduceus-real.json',
    cycleMs: 8000,
    height: () => 245,
    ariaLabel: 'Caduceus exp-003 per-skill cluster pass rates comparing treatment versus control alongside containment audit results.',
    caption: 'Real `exp-003` per-skill pass counts across `40` clusters (`+0.305` lift, `95% CI [+0.17, +0.445]`) paired with `containment-eval` (`15/17` calls contained, `2` live shell escapes) and the honestly disabled authority lane (`41%` FP).',
    provenance: '../caduceus/ledgers/exp-003.result.json',
    hoverHint: 'Hover any skill row for exact treatment, random & no-skill pass counts',
    render: renderCaduceusHero,
  },
  'hsi-lab': {
    dataFile: 'hsi-real.json',
    cycleMs: 8500,
    height: () => 278,
    ariaLabel: 'HSI-Lab deterministic receipt forest plot across all real experiments from E1 to E10.',
    caption: 'Every receipt recomputed deterministically from `hsi-lab/docs/experiments/E*-receipt.json`: positive lifts (`E1`, `E6`) sit on the same scale as tight nulls (`E8-7B −0.0025`, `E9 −0.019`) and inconclusive runs (`E10`).',
    provenance: '../hsi-lab/docs/experiments/E*-receipt.json',
    hoverHint: 'Hover any receipt row for exact 95% CI, paired n & SHA-256 digest',
    render: renderHsiHero,
  },
  'cl7b-continual-memory': {
    dataFile: 'hsi-real.json',
    cycleMs: 8500,
    height: () => 260,
    ariaLabel: 'Qwen3-1.7B continual memory comparison across replay_kl, OrthoDelta, plain SFT, and naive delta sums on fact accuracy and Wiki NLL.',
    caption: 'Real `Qwen3-1.7B-Base` `cl7b` runs (`rsi-loops/cl7b/results/`): naive delta addition explodes Wiki NLL to `15.96` (`17.74` 4-bit), while `OrthoDelta` composes 4 tasks at `94.4%` accuracy with zero fluency drift (`3.294` NLL) and exact selective unlearning.',
    provenance: 'rsi-loops/cl7b/results/orthodelta_3seed_summary.json',
    hoverHint: 'Hover any arm for oldest-task retention, real_cap, arith & unlearning accuracy',
    render: renderCl7bMemory,
  },
  playbox: {
    dataFile: 'playbox-real.json',
    cycleMs: 8000,
    height: () => 248,
    ariaLabel: 'Playbox real H100 Qwen3-30B-FP8 KV-cache versus RAG benchmark and E8 cross-model hub accuracy sweep.',
    caption: 'Real H100 `Qwen3-30B-A3B-Instruct-2507-FP8` (`111,316`-token corpus) KV-cache/RAG benchmark alongside the `E8` cross-model anchor hub sweep (`k = 16 → 32 → 128`).',
    provenance: 'modal/shaan-66074/playbox-telepathy-bench/kv_30b.json',
    hoverHint: 'Hover any bar for exact TTFT p50, throughput, $/1k correct & hub cosine',
    modes: [
      { id: 'kv', label: 'H100 KV-30B Bench' },
      { id: 'e8', label: 'E8 Cross-Model Sweep' },
    ],
    render: renderPlayboxHero,
  },
  formasec: {
    dataFile: 'formasec-real.json',
    cycleMs: 8000,
    height: () => 240,
    ariaLabel: 'FormaSec M1 through M6 formal verification ledger across 552 hostile LLM proposals, 600 Python/Rust/Lean parity checks, and 75 mutants.',
    caption: 'Verified `M1–M6` audit ledger backed by `44` fuzz admission seeds and `450` kernel execution traces: `0` unsafe admissions across `552` hostile proposals, `600/600` Python/Rust/Lean parity, and an honest `M3` Bend speedup null.',
    provenance: '../formasec/DESIGN.md & .strata/traces/latest.jsonl',
    hoverHint: 'Hover any verification gate for exact tested counts & audit notes',
    render: renderFormasecHero,
  },
  'security-alignment-os': {
    dataFile: 'secalign-real.json',
    cycleMs: 8000,
    height: () => 255,
    ariaLabel: 'Security Alignment OS 279 real Rust tests grouped by module highlighting adversarial, replay, forged, and escape checks.',
    caption: 'All `279` real passing Rust tests (`replays.json`), grouped by kernel module with adversarial, replay, escape, and rejection checks highlighted in amber; `0` failures.',
    provenance: 'site/src/replays.json (security-alignment-os)',
    hoverHint: 'Hover any kernel module bar to inspect exact adversarial test names',
    render: renderSecAlignHero,
  },
  hyperintel: {
    dataFile: 'hyperintel-real.json',
    cycleMs: 9000,
    height: () => 205,
    ariaLabel: 'HyperIntel offline-verifiable receipt chain and V1 through V4 signed evidence fixture SHA-256 hashes.',
    caption: 'Offline-verifiable route-to-settlement receipt chain paired with SHA-256 digests of the `V1–V4` evidence bundle fixtures (`114` passing tests, `2` concurrency wrapper tests explicitly marked ignored).',
    provenance: '../hyperintel/crates/hyperintel-cli/tests/fixtures/evidence-v*.json',
    hoverHint: 'Hover any pipeline stage or V1–V4 fixture chip for exact SHA-256 & byte size',
    render: renderHyperintelHero,
  },
  'composed-zk-benchmark-os': {
    dataFile: 'zkbench-real.json',
    cycleMs: 8500,
    height: () => 255,
    ariaLabel: 'Composed ZK Benchmark OS 1,107 real Rust tests grouped by module highlighting adversarial mutation tests.',
    caption: 'All `1,107` real passing Rust tests (`replays.json`) across `9` workload families and `14` adversarial mutation classes; explicitly scoped to Claim Ladder Level 1.',
    provenance: 'site/src/replays.json (composed-zk-benchmark-os)',
    hoverHint: 'Hover any crate module bar to inspect exact adversarial mutation test names',
    render: renderZkBenchHero,
  },
  'aligned-holistic-continual-learning': {
    dataFile: 'ahcl-real.json',
    cycleMs: 8500,
    height: () => 235,
    ariaLabel: 'AHCL real synthetic qualification R2 values from 0.83 to 0.90 versus negative shuffled controls and the matched-progress confound stop.',
    caption: 'Real `synthetic-result.json` (`prediction_lock_digest = 86063d2efe…`): all `4` targets clear $R^2 \\ge 0.25$ (`0.830–0.900`) and pass negative shuffled controls (`−0.27` to `−0.51`) before halting cleanly at the matched-progress confound gate.',
    provenance: '../aligned-holistic-continual-learning/results/synthetic-result.json',
    hoverHint: 'Hover any target bar for exact R², sign agreement & shuffled control R²',
    render: renderAhclHero,
  },
}

/* ============================================================================
   REACT COMPONENT: PostAnimCanvas (nathan.rs borderless hoverable explorer)
   ============================================================================ */
export function PostAnimCanvas({
  id,
  variant = 'inline',
}: {
  id: string
  variant?: 'hero' | 'inline'
}) {
  const def = RESEARCH_ANIMS[id]
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ctrlRef = useRef<CanvasController | null>(null)
  const [playing, setPlaying] = useState(true)
  const [mode, setMode] = useState(() => def?.modes?.[0]?.id ?? '')
  const modeRef = useRef(mode)
  const data = useVizJson(def?.dataFile)

  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  useEffect(() => {
    if (!def || !canvasRef.current) return
    const ctrl = runCanvas(
      canvasRef.current,
      (W) => def.height(W),
      (ctx, W, H, elapsedMs, C, ptr) => {
        const p = (elapsedMs % def.cycleMs) / def.cycleMs
        def.render(ctx, W, H, p, C, data, ptr, modeRef.current)
      },
      { cycleMs: def.cycleMs },
    )
    ctrlRef.current = ctrl
    return () => {
      ctrl.destroy()
      ctrlRef.current = null
    }
  }, [def, data])

  if (!def) return null

  const toggle = () => {
    const next = !playing
    setPlaying(next)
    ctrlRef.current?.setPlaying(next)
  }

  const replay = () => {
    setPlaying(true)
    ctrlRef.current?.replay()
  }

  return (
    <figure className={variant === 'hero' ? 'post-hero-anim' : 'ef post-inline-anim'}>
      {def.modes?.length ? (
        <div className="post-anim-modes" role="tablist" aria-label="Dataset selector">
          {def.modes.map((m) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={mode === m.id}
              onClick={() => {
                setMode(m.id)
                ctrlRef.current?.replay()
                setPlaying(true)
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
      ) : null}
      <div className="post-anim-stage">
        <canvas
          ref={canvasRef}
          className="post-anim-canvas"
          style={{ height: `${def.height(680)}px` }}
          role="img"
          aria-label={def.ariaLabel}
        />
        <div className="post-anim-overlay">
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? 'Pause animation' : 'Play animation'}
            title={playing ? 'Pause' : 'Play'}
          >
            {playing ? '❚❚' : '▶'}
          </button>
          <button type="button" onClick={replay} aria-label="Replay animation" title="Replay">
            ↻
          </button>
        </div>
      </div>
      {(def.hoverHint || def.provenance) ? (
        <div className="post-anim-meta">
          {def.hoverHint ? <span className="post-anim-hint">{def.hoverHint}</span> : <span />}
          {def.provenance ? <span className="post-anim-src">{def.provenance}</span> : null}
        </div>
      ) : null}
      <figcaption>
        <RichText text={def.caption} />
      </figcaption>
    </figure>
  )
}
