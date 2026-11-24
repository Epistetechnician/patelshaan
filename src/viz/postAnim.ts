/*
  Shared canvas animation primitives ported from nathanrs/nathan.rs/static/js/post-anim.js
  and extended with detllm.js-grade interactive hover tooltips & pointer hit-testing.

  - Theme-aware colors() reading live CSS custom properties from .rp / :root
  - Semantic 3-color grammar:
      COOL (steel blue)  = verified / certified / orthogonal / deterministic / admitted
      MID  (amber)       = threshold / boundary / slack / LPN blinding
      HOT  (terracotta)  = leakage / violation / drift / tampering / rejected
      GOOD (sage green)  = confirmed flip / pass / exact match
  - DPR-aware ResizeObserver + IntersectionObserver (clock starts on first scroll-in)
  - Live CSS-pixel pointer tracking for hoverable raw-data explorers
*/

export type RGB = readonly [number, number, number]

export const COOL: RGB = [91, 138, 166]
export const MID: RGB = [224, 168, 63]
export const HOT: RGB = [216, 101, 75]
export const GOOD: RGB = [78, 154, 111]

export type ThemeColors = {
  bg: string
  fg: string
  mute: string
  line: string
  soft: string
  link: string
  dark: boolean
}

export type PointerState = {
  x: number
  y: number
  inside: boolean
}

export function colors(el?: HTMLElement | null): ThemeColors {
  const target = el?.closest('.rp') ?? document.documentElement
  const s = getComputedStyle(target)
  const v = (name: string, fallback: string) => s.getPropertyValue(name).trim() || fallback
  const bg = v('--body-background', '#141414')
  const dark = !document.documentElement.classList.contains('light-mode')
  return {
    bg,
    fg: v('--body-font-color', '#f0f0f0'),
    mute: v('--color-link', '#a8a8a8'),
    line: v('--gray-200', '#2e2e2e'),
    soft: v('--gray-100', '#1a1a1a'),
    link: v('--color-link', '#a8a8a8'),
    dark,
  }
}

export function rgb(c: RGB, a?: number): string {
  return a === undefined ? `rgb(${c[0]},${c[1]},${c[2]})` : `rgba(${c[0]},${c[1]},${c[2]},${a})`
}

export function mixc(a: RGB, b: RGB, t: number): RGB {
  const k = clamp(t, 0, 1)
  return [
    Math.round(a[0] + (b[0] - a[0]) * k),
    Math.round(a[1] + (b[1] - a[1]) * k),
    Math.round(a[2] + (b[2] - a[2]) * k),
  ]
}

export function heat(t: number): string {
  const k = clamp(t, 0, 1)
  return rgb(k < 0.5 ? mixc(COOL, MID, k / 0.5) : mixc(MID, HOT, (k - 0.5) / 0.5))
}

export const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const ease = (t: number) => {
  const k = clamp(t, 0, 1)
  return k * k * (3 - 2 * k)
}
export const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a), 0, 1)
export const fmt = (n: number) => Math.round(n).toLocaleString('en-US')

export function hash(n: number): number {
  const x = Math.sin(n * 127.1 + 11.7) * 43758.5453
  return x - Math.floor(x)
}

export const SANS = '12px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
export const SANS_S = '11px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
export const SANS_B = '600 12px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
export const MONO = '12px "SF Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
export const MONO_S = '10.5px "SF Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
export const MONO_B = '600 10.5px "SF Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
export const SERIF_I = 'italic 13px Palatino, Georgia, Cambria, serif'

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)

export function rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.roundRect(x, y, Math.max(0, w), Math.max(0, h), r)
}

export function label(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  font?: string,
  align?: CanvasTextAlign,
) {
  ctx.font = font || SANS
  ctx.fillStyle = color
  ctx.textAlign = align || 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, x, y)
}

export function legend(
  ctx: CanvasRenderingContext2D,
  items: { label: string; c: string; outline?: boolean }[],
  cx: number,
  y: number,
  C: ThemeColors,
) {
  ctx.font = SANS_S
  ctx.textBaseline = 'middle'
  const sw = 10
  const g = 6
  const pad = 16
  const ws = items.map((it) => sw + g + ctx.measureText(it.label).width)
  const total = ws.reduce((a, b) => a + b, 0) + pad * Math.max(0, items.length - 1)
  let x = cx - total / 2
  items.forEach((it, i) => {
    if (it.outline) {
      ctx.strokeStyle = it.c
      ctx.lineWidth = 1.5
      rrect(ctx, x, y - sw / 2, sw, sw, 3)
      ctx.stroke()
    } else {
      ctx.fillStyle = it.c
      rrect(ctx, x, y - sw / 2, sw, sw, 3)
      ctx.fill()
    }
    ctx.fillStyle = C.mute
    ctx.textAlign = 'left'
    ctx.fillText(it.label, x + sw + g, y + 0.5)
    x += ws[i] + pad
  })
}

export function chip(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  text: string | null | undefined,
  opts?: {
    r?: number
    fill?: string
    stroke?: string
    lw?: number
    font?: string
    color?: string
  },
) {
  const o = opts ?? {}
  rrect(ctx, x, y, w, h, o.r ?? 5)
  if (o.fill) {
    ctx.fillStyle = o.fill
    ctx.fill()
  }
  if (o.stroke) {
    ctx.strokeStyle = o.stroke
    ctx.lineWidth = o.lw ?? 1.2
    ctx.stroke()
  }
  if (text !== undefined && text !== null) {
    ctx.font = o.font ?? MONO_S
    ctx.fillStyle = o.color ?? '#f0f0f0'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, x + w / 2, y + h / 2 + 0.5)
  }
}

export function arrow(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  color: string,
  lw = 1.5,
  head = 7,
) {
  const a = Math.atan2(y1 - y0, x1 - x0)
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = lw
  ctx.beginPath()
  ctx.moveTo(x0, y0)
  ctx.lineTo(x1 - Math.cos(a) * (head * 0.7), y1 - Math.sin(a) * (head * 0.7))
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x1 - Math.cos(a - 0.45) * head, y1 - Math.sin(a - 0.45) * head)
  ctx.lineTo(x1 - Math.cos(a + 0.45) * head, y1 - Math.sin(a + 0.45) * head)
  ctx.closePath()
  ctx.fill()
}

/* Crisp detllm.js-grade floating tooltip card auto-clamped inside canvas bounds */
export function drawTooltip(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  anchorX: number,
  anchorY: number,
  lines: { text: string; bold?: boolean; color?: string }[],
  C: ThemeColors,
  accent?: RGB,
) {
  if (!lines.length) return
  const padX = 10
  const padY = 8
  const lineH = 15
  let maxW = 0
  lines.forEach((ln) => {
    ctx.font = ln.bold ? MONO_B : MONO_S
    maxW = Math.max(maxW, ctx.measureText(ln.text).width)
  })
  const boxW = Math.min(W - 16, Math.ceil(maxW + padX * 2))
  const boxH = padY * 2 + lines.length * lineH

  let bx = anchorX + 14
  if (bx + boxW > W - 8) bx = anchorX - boxW - 14
  bx = clamp(bx, 8, W - boxW - 8)

  let by = anchorY - boxH - 10
  if (by < 8) by = anchorY + 14
  by = clamp(by, 8, H - boxH - 8)

  ctx.save()
  ctx.shadowColor = C.dark ? 'rgba(0,0,0,0.55)' : 'rgba(20,20,20,0.16)'
  ctx.shadowBlur = 12
  ctx.shadowOffsetY = 4
  rrect(ctx, bx, by, boxW, boxH, 6)
  ctx.fillStyle = C.dark ? 'rgba(22, 22, 24, 0.96)' : 'rgba(255, 255, 255, 0.97)'
  ctx.fill()
  ctx.restore()

  rrect(ctx, bx, by, boxW, boxH, 6)
  ctx.strokeStyle = accent ? rgb(accent, 0.72) : C.line
  ctx.lineWidth = 1.2
  ctx.stroke()

  lines.forEach((ln, i) => {
    label(
      ctx,
      ln.text,
      bx + padX,
      by + padY + i * lineH + lineH / 2,
      ln.color ?? (ln.bold ? C.fg : C.mute),
      ln.bold ? MONO_B : MONO_S,
      'left',
    )
  })
}

export type CanvasController = {
  setPlaying: (playing: boolean) => void
  seekProgress: (p: number) => void
  replay: () => void
  destroy: () => void
}

export function runCanvas(
  canvas: HTMLCanvasElement,
  heightFor: (W: number, ctx: CanvasRenderingContext2D) => number,
  render: (
    ctx: CanvasRenderingContext2D,
    W: number,
    H: number,
    elapsedMs: number,
    C: ThemeColors,
    ptr: PointerState,
  ) => void,
  options?: {
    cycleMs?: number
    onProgress?: (p: number) => void
  },
): CanvasController {
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return { setPlaying: () => {}, seekProgress: () => {}, replay: () => {}, destroy: () => {} }
  }
  const cycleMs = options?.cycleMs ?? 9000
  let W = 0
  let H = 0
  let visible = false
  let playing = !prefersReducedMotion()
  let elapsed = prefersReducedMotion() ? cycleMs * 0.88 : 0
  let lastNow = performance.now()
  let raf = 0
  let dead = false
  const ptr: PointerState = { x: -1, y: -1, inside: false }

  function resize() {
    if (!ctx) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    W = Math.max(240, canvas.clientWidth || canvas.getBoundingClientRect().width || 640)
    H = heightFor(W, ctx)
    canvas.style.height = `${H}px`
    canvas.width = Math.round(W * dpr)
    canvas.height = Math.round(H * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  function onPointerMove(e: PointerEvent) {
    const rect = canvas.getBoundingClientRect()
    ptr.x = e.clientX - rect.left
    ptr.y = e.clientY - rect.top
    ptr.inside = true
  }

  function onPointerLeave() {
    ptr.inside = false
    ptr.x = -1
    ptr.y = -1
  }

  canvas.addEventListener('pointermove', onPointerMove)
  canvas.addEventListener('pointerleave', onPointerLeave)

  const ro = new ResizeObserver(resize)
  ro.observe(canvas)

  const io = new IntersectionObserver(
    (entries) => {
      visible = entries.some((e) => e.isIntersecting)
      if (visible) lastNow = performance.now()
    },
    { threshold: 0.05 },
  )
  io.observe(canvas)

  resize()

  let lastReportedBucket = -1

  function frame(now: number) {
    if (dead || !ctx) return
    const dt = Math.min(100, Math.max(0, now - lastNow))
    lastNow = now
    if (visible && playing) {
      elapsed += dt
    }
    const C = colors(canvas)
    ctx.clearRect(0, 0, W, H)
    render(ctx, W, H, elapsed, C, ptr)
    if (options?.onProgress) {
      const p = (elapsed % cycleMs) / cycleMs
      const bucket = Math.floor(p * 100)
      if (bucket !== lastReportedBucket) {
        lastReportedBucket = bucket
        options.onProgress(p)
      }
    }
    raf = requestAnimationFrame(frame)
  }
  raf = requestAnimationFrame(frame)

  return {
    setPlaying(p: boolean) {
      playing = p
      lastNow = performance.now()
    },
    seekProgress(p: number) {
      elapsed = clamp(p, 0, 0.999) * cycleMs
      lastNow = performance.now()
    },
    replay() {
      elapsed = 0
      playing = true
      lastNow = performance.now()
    },
    destroy() {
      dead = true
      cancelAnimationFrame(raf)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerleave', onPointerLeave)
      ro.disconnect()
      io.disconnect()
    },
  }
}
