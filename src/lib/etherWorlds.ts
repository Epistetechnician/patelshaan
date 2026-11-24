/**
 * High-resolution procedural ASCII / 2x4 Braille / Half-Block multidimensional
 * world renderer for the Shaan Patel Ether Terminal.
 *
 * Worlds span human psychohistory, sacred spatial geometry, relativistic physics,
 * 4D geometry, chaotic attractors, computational hypergraphs, and universal history.
 */

export type WorldId =
  | 'psychohistory'
  | 'universal'
  | 'tesseract'
  | 'kailas'
  | 'horizon'
  | 'ruliad'
  | 'lorenz'
  | 'noosphere'

export type RenderMode = 'braille' | 'ascii' | 'halfblock'

export type PaletteId = 'obsidian' | 'ether' | 'infrared' | 'phosphor' | 'spectral'

export type WorldMeta = {
  id: WorldId
  index: number
  name: string
  shortLabel: string
  span: string
  summary: string
  caption: string
  defaultPalette: PaletteId
}

export const WORLD_CATALOG: WorldMeta[] = [
  {
    id: 'psychohistory',
    index: 1,
    name: 'Psychohistory Phase Manifold',
    shortLabel: 'psychohistory',
    span: '3000 BCE → 2026 CE · Human Collective History',
    summary:
      'Multi-leg market belief obstruction ridges, secular cycles, and live e-process certification shockwaves.',
    caption: 'Seldon secular waves × Polymarket/Kalshi obstruction curvature (E_t ≥ 20)',
    defaultPalette: 'obsidian',
  },
  {
    id: 'universal',
    index: 2,
    name: 'Universal History Light-Cone',
    shortLabel: 'universal history',
    span: '10⁻⁴³ s → 10⁴⁰ yr · Cosmic Deep Time',
    summary:
      'Logarithmic spacetime tunnel flying from Planck foam through cosmic dawn, galaxies, biosphere, and black hole era.',
    caption: 'Scroll / zoom to scrub 13.8 Gyr+ across cosmic epochs · drag to tilt light-cone',
    defaultPalette: 'ether',
  },
  {
    id: 'tesseract',
    index: 3,
    name: '4D Tesseract & Hopf Ether',
    shortLabel: '4d tesseract',
    span: 'ℝ⁴ → S³ → ℝ² · Multidimensional Reality',
    summary:
      'Continuous XW/YW/ZW 4D polychoron rotation laced with stereographic Hopf fibration ether rings.',
    caption: '4D hyperspace rotation projected stereographically through S³ into high-res Braille',
    defaultPalette: 'spectral',
  },
  {
    id: 'kailas',
    index: 4,
    name: 'Mount Kailas Spatial Mandala',
    shortLabel: 'kailas mandala',
    span: '52 km Kora · φ = f(r) Sacred Topography',
    summary:
      'Concentric circumambulation geodesics, Tibetan/Bon directional harmonics, and phase-locked mountain relief.',
    caption: 'Spatial-mandala double dissociation · 2,626 blind-labeled passages · Ti Se ཏི་སེ',
    defaultPalette: 'obsidian',
  },
  {
    id: 'horizon',
    index: 5,
    name: 'Kerr Event Horizon',
    shortLabel: 'event horizon',
    span: 'r_s = 2GM/c² · Relativistic Lensing',
    summary:
      'Gravitational light bending around a spinning black hole with Doppler-beamed plasma and photon ring.',
    caption: 'Relativistic ray deflection · upper & lower Einstein lensed accretion arcs',
    defaultPalette: 'infrared',
  },
  {
    id: 'ruliad',
    index: 6,
    name: 'The Ruliad Branchial Ether',
    shortLabel: 'ruliad',
    span: 'Multiway Hypergraph · Computational Reality',
    summary:
      'Entangled causal branches, multiway wave interference caustics, and observer foliation slices.',
    caption: 'Branchial space foliation × entangled multiway interference caustics',
    defaultPalette: 'ether',
  },
  {
    id: 'lorenz',
    index: 7,
    name: 'Lorenz Attractor & QR Nullspace',
    shortLabel: 'lorenz · qr',
    span: 'σ=10, ρ=28 · Orthogonal Protection Plane',
    summary:
      'RK4-integrated twin-lobe chaotic attractor sliced by an invariant replay-protected QR nullspace plane.',
    caption: 'ΔW_⊥ = ΔW − (ΔW·Q)Qᵀ · ||ΔW_⊥·Q|| ~ 10⁻⁸ · 180× lower replay drift',
    defaultPalette: 'phosphor',
  },
  {
    id: 'noosphere',
    index: 8,
    name: 'Noosphere Akashic Lattice',
    shortLabel: 'noosphere',
    span: 'Non-Euclidean Mindspace · Collective Cognition',
    summary:
      'Cathedral of resonant memory nodes, drifting wavepackets, and standing harmonic interference in the ether.',
    caption: 'Harmonic lattice of minds · drag to drift through non-Euclidean arches',
    defaultPalette: 'spectral',
  },
]

export const WORLD_BY_ID: Record<WorldId, WorldMeta> = Object.fromEntries(
  WORLD_CATALOG.map((w) => [w.id, w]),
) as Record<WorldId, WorldMeta>

export const PALETTE_ORDER: PaletteId[] = [
  'obsidian',
  'ether',
  'infrared',
  'phosphor',
  'spectral',
]

export const MODE_ORDER: RenderMode[] = ['braille', 'ascii', 'halfblock']

const DENSE_ASCII =
  " .'`^\",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@"

type RGB = [number, number, number]

const PALETTES: Record<PaletteId, { bg: string; stops: RGB[] }> = {
  obsidian: {
    bg: '#060708',
    stops: [
      [14, 15, 18],
      [62, 68, 82],
      [142, 122, 88],
      [223, 208, 178],
      [250, 246, 236],
    ],
  },
  ether: {
    bg: '#04060a',
    stops: [
      [10, 14, 28],
      [48, 66, 148],
      [114, 96, 214],
      [108, 224, 244],
      [238, 249, 255],
    ],
  },
  infrared: {
    bg: '#070406',
    stops: [
      [18, 8, 14],
      [112, 26, 44],
      [216, 78, 54],
      [246, 178, 88],
      [255, 245, 214],
    ],
  },
  phosphor: {
    bg: '#030805',
    stops: [
      [8, 24, 14],
      [26, 94, 54],
      [68, 184, 112],
      [134, 239, 172],
      [232, 255, 240],
    ],
  },
  spectral: {
    bg: '#05060a',
    stops: [
      [14, 16, 36],
      [74, 88, 226],
      [64, 212, 202],
      [238, 198, 114],
      [255, 134, 164],
    ],
  },
}

function samplePalette(palette: PaletteId, v: number, hueShift = 0): RGB {
  const stops = PALETTES[palette].stops
  const t = Math.max(0, Math.min(1, v))
  const scaled = t * (stops.length - 1)
  const i = Math.min(stops.length - 2, Math.floor(scaled))
  const f = scaled - i
  const a = stops[i]
  const b = stops[i + 1]
  let r = a[0] + (b[0] - a[0]) * f
  let g = a[1] + (b[1] - a[1]) * f
  let bl = a[2] + (b[2] - a[2]) * f

  if (hueShift !== 0 && t > 0.14) {
    const s = Math.sin(hueShift) * 28 * t
    const c = Math.cos(hueShift) * 24 * t
    r = Math.max(0, Math.min(255, r + s))
    g = Math.max(0, Math.min(255, g + c * 0.5))
    bl = Math.max(0, Math.min(255, bl - s * 0.7))
  }
  return [r | 0, g | 0, bl | 0]
}

// Precomputed 4D Tesseract geometry (16 vertices, 32 edges)
const TESS_VERTS: [number, number, number, number][] = []
for (let i = 0; i < 16; i++) {
  TESS_VERTS.push([
    i & 1 ? 1 : -1,
    i & 2 ? 1 : -1,
    i & 4 ? 1 : -1,
    i & 8 ? 1 : -1,
  ])
}
const TESS_EDGES: [number, number][] = []
for (let i = 0; i < 16; i++) {
  for (let bit = 0; bit < 4; bit++) {
    const j = i ^ (1 << bit)
    if (j > i) TESS_EDGES.push([i, j])
  }
}

// Precomputed Lorenz attractor trajectory (720 RK4 points)
const LORENZ_POINTS: [number, number, number][] = (() => {
  const pts: [number, number, number][] = []
  let x = 0.1
  let y = 0
  let z = 0
  const sigma = 10
  const rho = 28
  const beta = 8 / 3
  const dt = 0.0085
  // Burn-in
  for (let i = 0; i < 350; i++) {
    const dx = sigma * (y - x)
    const dy = x * (rho - z) - y
    const dz = x * y - beta * z
    x += dx * dt
    y += dy * dt
    z += dz * dt
  }
  for (let i = 0; i < 820; i++) {
    const dx = sigma * (y - x)
    const dy = x * (rho - z) - y
    const dz = x * y - beta * z
    x += dx * dt
    y += dy * dt
    z += dz * dt
    pts.push([x / 20, y / 20, (z - 25) / 20])
  }
  return pts
})()

export type WorldCamera = {
  yaw: number
  pitch: number
  zoom: number
  time: number
}

export type WorldHudInfo = {
  epoch: string
  coords: string
  metric: string
}

const UNIVERSAL_EPOCHS = [
  { label: 'PLANCK FOAM', time: 't = 10⁻⁴³ s', temp: 'T ≈ 1.4×10³² K', scale: 'a ~ 10⁻³⁵ m' },
  { label: 'COSMIC INFLATION', time: 't = 10⁻³² s', temp: 'T ≈ 10²⁷ K', scale: 'e⁶⁰ expansion' },
  { label: 'CMB LAST SCATTERING', time: 't = 380 kyr', temp: 'T = 3,000 K', scale: 'z = 1,089' },
  { label: 'COSMIC DAWN · POP III', time: 't = 180 Myr', temp: 'T = 60 K', scale: 'z = 20' },
  { label: 'GALACTIC FILAMENTS', time: 't = 3.2 Gyr', temp: 'T = 8.4 K', scale: 'z = 2.1' },
  { label: 'SOLAR ACCRETION', time: 't = 9.2 Gyr', temp: 'T = 3.9 K', scale: '4.6 Gyr ago' },
  { label: 'BIOSPHERE & COGNITION', time: 't = 13.79 Gyr', temp: 'T = 2.725 K', scale: 'z = 0.00' },
  { label: 'NOOSPHERE · 2026 CE', time: 't = 13.80 Gyr', temp: 'T = 2.725 K', scale: 'shaan4d.xyz' },
  { label: 'BLACK HOLE ERA', time: 't = 10⁴⁰ yr', temp: 'T → 10⁻²⁹ K', scale: 'Hawking glow' },
]

const PSYCHO_EPOCHS = [
  { label: 'SUMERIAN LEDGERS', time: '3000 BCE', metric: 'clay accounting · first statebooks' },
  { label: 'AXIAL AGE REFORM', time: '500 BCE', metric: 'symbolic compression across Eurasia' },
  { label: 'AMSTERDAM BOURSE', time: '1602 CE', metric: 'continuous joint-stock price discovery' },
  { label: 'BRETTON WOODS BREAK', time: '1971 CE', metric: 'floating macro regime bifurcation' },
  { label: 'MULTI-LEG OBSTRUCTION', time: '2026 CE', metric: 'AUROC 0.9810 · E_t = 1.00e12 certified' },
]

export function getWorldHud(world: WorldId, cam: WorldCamera): WorldHudInfo {
  if (world === 'universal') {
    const phase = ((cam.time * 0.065 + (cam.zoom - 1) * 0.35) % 1 + 1) % 1
    const idx = Math.min(
      UNIVERSAL_EPOCHS.length - 1,
      Math.floor(phase * UNIVERSAL_EPOCHS.length),
    )
    const ep = UNIVERSAL_EPOCHS[idx]
    return {
      epoch: `${ep.label} · ${ep.time}`,
      coords: `scale ${ep.scale} · ${ep.temp}`,
      metric: `θ=${cam.yaw.toFixed(2)} φ=${cam.pitch.toFixed(2)} zoom=${cam.zoom.toFixed(2)}×`,
    }
  }
  if (world === 'psychohistory') {
    const idx =
      Math.floor(((cam.time * 0.08) % 1 + 1) % 1 * PSYCHO_EPOCHS.length) %
      PSYCHO_EPOCHS.length
    const ep = PSYCHO_EPOCHS[idx]
    return {
      epoch: `${ep.label} (${ep.time})`,
      coords: ep.metric,
      metric: `holdout n=669 · Lean4 1673/1673`,
    }
  }
  if (world === 'tesseract') {
    return {
      epoch: `4D POLYCHORON · XW/YW/ZW ROTATION`,
      coords: `w-slice=${Math.sin(cam.time * 0.5).toFixed(2)} · Hopf S³→S²`,
      metric: `16v/32e + 18 Villarceau fibers`,
    }
  }
  if (world === 'kailas') {
    const koraKm = ((cam.time * 2.1) % 52).toFixed(1)
    return {
      epoch: `MOUNT KAILAS · KORA ${koraKm} / 52.0 km`,
      coords: `φ = f(r) · Dolma La 5,630m · α=0.86`,
      metric: `2,626 passages · 282 Tibetan/Bon`,
    }
  }
  if (world === 'horizon') {
    return {
      epoch: `KERR METRIC · a* = 0.998 M`,
      coords: `r_ph = 1.5 r_s · Doppler β = 0.62c`,
      metric: `inclination=${(18 + cam.pitch * 24).toFixed(1)}°`,
    }
  }
  if (world === 'ruliad') {
    return {
      epoch: `RULIAD FOLIATION · STEP ${Math.floor(cam.time * 18) % 9999}`,
      coords: `branchial entanglement · multiway slice`,
      metric: `observer horizon κ=${(1.2 + 0.3 * Math.sin(cam.time)).toFixed(2)}`,
    }
  }
  if (world === 'lorenz') {
    return {
      epoch: `LORENZ FLOW ∩ QR NULLSPACE`,
      coords: `σ=10 ρ=28 β=8/3 · ||ΔW_⊥·Q||=1.06e-8`,
      metric: `replay KL 0.000605 (180× lower)`,
    }
  }
  return {
    epoch: `NOOSPHERE AKASHIC LATTICE`,
    coords: `harmonic modes k=(3,5,8) · non-Euclidean`,
    metric: `coherence Ψ=${(0.82 + 0.14 * Math.sin(cam.time * 0.7)).toFixed(3)}`,
  }
}

/**
 * Reusable pixel field buffer for high-res procedural sampling.
 * For Braille mode, width = cols * 2 and height = rows * 4 (e.g. 200x120!).
 */
export class EtherFieldRenderer {
  private lum = new Float32Array(0)
  private hue = new Float32Array(0)
  private pw = 0
  private ph = 0

  private ensureSize(pw: number, ph: number) {
    if (this.pw !== pw || this.ph !== ph) {
      this.pw = pw
      this.ph = ph
      this.lum = new Float32Array(pw * ph)
      this.hue = new Float32Array(pw * ph)
    } else {
      this.lum.fill(0)
      this.hue.fill(0)
    }
  }

  private plot(x: number, y: number, intensity: number, hueShift = 0) {
    const ix = Math.round(x)
    const iy = Math.round(y)
    if (ix < 0 || iy < 0 || ix >= this.pw || iy >= this.ph) return
    const idx = iy * this.pw + ix
    if (intensity > this.lum[idx]) {
      this.lum[idx] = Math.min(1, intensity)
      this.hue[idx] = hueShift
    }
  }

  private drawLine(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    intensity: number,
    hueShift = 0,
  ) {
    const dx = x1 - x0
    const dy = y1 - y0
    const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy)))
    for (let s = 0; s <= steps; s++) {
      const f = s / steps
      this.plot(x0 + dx * f, y0 + dy * f, intensity, hueShift)
    }
  }

  private sampleField(world: WorldId, cam: WorldCamera) {
    const { pw, ph, lum, hue } = this
    const t = cam.time
    const yaw = cam.yaw
    const pitch = cam.pitch
    const zoom = cam.zoom
    const aspect = pw / Math.max(1, ph)

    if (world === 'psychohistory') {
      // 3D undulating probability obstruction manifold + e-process shockwaves
      const cy = Math.cos(yaw * 0.65)
      const sy = Math.sin(yaw * 0.65)
      for (let py = 0; py < ph; py++) {
        const ny = (py / ph) * 2 - 1
        for (let px = 0; px < pw; px++) {
          const nx = ((px / pw) * 2 - 1) * aspect * 0.72
          // Perspective ground plane projection
          const depth = 1.45 / Math.max(0.16, ny + 1.18 - pitch * 0.25)
          const wx = (nx * depth * cy - depth * sy) / zoom
          const wz = (nx * depth * sy + depth * cy) / zoom - t * 0.85

          // Secular historical wave + multi-leg obstruction ridge
          const secular =
            Math.sin(wx * 1.4 + t * 0.35) * Math.cos(wz * 0.9) * 0.45 +
            Math.sin((wx + wz) * 2.2 - t * 0.8) * 0.22
          const ridge = Math.exp(-Math.pow(wx - Math.sin(wz * 0.55) * 1.3, 2) * 1.8) * 0.65
          const shockDist = Math.hypot(wx * 0.9, ((wz + t * 0.85) % 4.2) - 2.1)
          const shock = Math.exp(-Math.pow(shockDist - (t * 1.35) % 3.6, 2) * 14) * 0.85

          // Crisp topographic grid & contour lines
          const gridX = Math.abs(Math.sin(wx * Math.PI * 1.35))
          const gridZ = Math.abs(Math.sin(wz * Math.PI * 1.35))
          const contour = Math.abs(Math.sin((secular + ridge) * 9.5))
          const line =
            (gridX < 0.085 || gridZ < 0.085 ? 0.52 : 0) +
            (contour < 0.1 ? 0.55 : 0)

          const horizonFade = ny < -0.52 ? Math.max(0, 1 + (ny + 0.52) * 2.6) : 1
          const distFade = Math.exp(-depth * 0.22)
          let val = (0.12 + Math.max(0, secular * 0.4 + ridge * 0.65) + line * 0.55 + shock) * distFade * horizonFade

          // Starry epistemic sky above horizon
          if (ny < -0.45) {
            const starHash = Math.sin(px * 12.9898 + py * 78.233) * 43758.5453
            const starFrac = starHash - Math.floor(starHash)
            if (starFrac > 0.992) {
              val = Math.max(val, 0.45 + 0.45 * Math.sin(t * 3 + px))
            }
            // Horizon glow band
            val = Math.max(val, Math.exp(-Math.pow(ny + 0.48, 2) * 65) * 0.55)
          }

          const idx = py * pw + px
          lum[idx] = Math.min(1, Math.max(0, val))
          hue[idx] = shock * 2.2 + ridge * 0.9 - secular * 0.5
        }
      }
      return
    }

    if (world === 'universal') {
      // Logarithmic cosmic light-cone & evolving cosmic web across 13.8 Gyr+
      const epochPhase = ((t * 0.065 + (zoom - 1) * 0.35) % 1 + 1) % 1
      for (let py = 0; py < ph; py++) {
        const ny = (py / ph) * 2 - 1
        for (let px = 0; px < pw; px++) {
          const nx = ((px / pw) * 2 - 1) * aspect * 0.72
          const rx = nx + Math.sin(yaw) * 0.22
          const ry = ny + Math.sin(pitch) * 0.22
          const r = Math.hypot(rx, ry) + 1e-4
          const theta = Math.atan2(ry, rx)

          // Tunnel logarithmic depth coordinate
          const logZ = 1.65 / (r + 0.14) - t * 1.25
          const spiral = theta * 3.0 + logZ * 1.15 - t * 0.35

          // Cosmic web filaments + expanding epoch rings
          const filamentA = Math.sin(spiral) * Math.cos(logZ * 2.1 + Math.sin(theta * 5) * 0.7)
          const filamentB = Math.sin(theta * 7 - logZ * 1.6 + t * 0.5) * Math.cos(r * 9 - t * 1.4)
          const web = Math.pow(Math.max(0, 1 - Math.abs(filamentA * 0.65 + filamentB * 0.35)), 3.2)

          // Light-cone horizon rings
          const ring = Math.pow(Math.max(0, Math.cos(logZ * Math.PI * 1.5)), 10)
          // Core singularity / Planck brilliance at center
          const core = Math.exp(-r * r * (14 - epochPhase * 6)) * (1.15 - epochPhase * 0.35)
          // Background galaxies / stars
          const h = Math.sin(Math.floor(theta * 24) * 19.1 + Math.floor(logZ * 4) * 91.7) * 43758.5453
          const star = h - Math.floor(h) > 0.96 ? 0.75 * Math.min(1, r * 2.2) : 0

          const val = core + web * 0.72 * Math.min(1, r * 2.4) + ring * 0.38 + star
          const idx = py * pw + px
          lum[idx] = Math.min(1, Math.max(0, val))
          hue[idx] = epochPhase * 3.2 + r * 1.4 + filamentA
        }
      }
      return
    }

    if (world === 'tesseract') {
      // Soft ambient Hopf fibration ether backdrop + crisp 4D rotated tesseract + dual
      const cx = pw * 0.5
      const cy = ph * 0.5
      const scale = Math.min(pw * 0.44, ph * 0.72) * zoom

      // 1. Stereographic Hopf fibration Villarceau rings in S^3 -> R^2
      const numFibers = 16
      const steps = 64
      for (let f = 0; f < numFibers; f++) {
        const eta = 0.42 + (f / numFibers) * 0.85
        const phi0 = (f / numFibers) * Math.PI * 2 + t * 0.22
        let prevX = 0
        let prevY = 0
        for (let s = 0; s <= steps; s++) {
          const xi = (s / steps) * Math.PI * 2
          const x4 = Math.cos(xi + phi0) * Math.sin(eta)
          const y4 = Math.sin(xi + phi0) * Math.sin(eta)
          const z4 = Math.cos(xi - phi0) * Math.cos(eta)
          const w4 = Math.sin(xi - phi0) * Math.cos(eta)

          // Rotate in XW and YZ
          const ca = Math.cos(t * 0.42 + yaw)
          const sa = Math.sin(t * 0.42 + yaw)
          const rx = x4 * ca - w4 * sa
          const rw = x4 * sa + w4 * ca
          const cb = Math.cos(t * 0.31 + pitch)
          const sb = Math.sin(t * 0.31 + pitch)
          const ry = y4 * cb - z4 * sb
          const rz = y4 * sb + z4 * cb

          const p4 = 1.65 / (2.35 - rw)
          const sx = cx + rx * p4 * scale * 0.78
          const sy = cy + ry * p4 * scale * 0.56
          const depthLum = Math.max(0.18, Math.min(0.62, (rw + 1.4) * 0.26 + (rz + 1.2) * 0.14))
          if (s > 0) {
            this.drawLine(prevX, prevY, sx, sy, depthLum, f * 0.4 + rw)
          }
          prevX = sx
          prevY = sy
        }
      }

      // 2. Project 4D Tesseract (outer) + scaled inner hypercube
      const project4D = (v: [number, number, number, number], rScale: number) => {
        let [x, y, z, w] = v
        x *= rScale
        y *= rScale
        z *= rScale
        w *= rScale
        // XW rotation
        const a1 = t * 0.55 + yaw
        const c1 = Math.cos(a1)
        const s1 = Math.sin(a1)
        ;[x, w] = [x * c1 - w * s1, x * s1 + w * c1]
        // YW rotation
        const a2 = t * 0.38 + pitch
        const c2 = Math.cos(a2)
        const s2 = Math.sin(a2)
        ;[y, w] = [y * c2 - w * s2, y * s2 + w * c2]
        // XZ rotation
        const a3 = t * 0.24
        const c3 = Math.cos(a3)
        const s3 = Math.sin(a3)
        ;[x, z] = [x * c3 - z * s3, x * s3 + z * c3]

        const d4 = 2.65 / (3.3 - w)
        const x3 = x * d4
        const y3 = y * d4
        const z3 = z * d4
        const d3 = 2.6 / (4.1 - z3)
        return {
          sx: cx + x3 * d3 * scale * 0.48,
          sy: cy + y3 * d3 * scale * 0.36,
          depth: Math.max(0.35, Math.min(1, (w + 1.6) * 0.34 + 0.32)),
          w,
        }
      }

      const outer = TESS_VERTS.map((v) => project4D(v, 1.0))
      const inner = TESS_VERTS.map((v) => project4D(v, 0.48))

      for (const [i, j] of TESS_EDGES) {
        const a = outer[i]
        const b = outer[j]
        this.drawLine(a.sx, a.sy, b.sx, b.sy, (a.depth + b.depth) * 0.55, (a.w + b.w) * 0.8)
        const ia = inner[i]
        const ib = inner[j]
        this.drawLine(ia.sx, ia.sy, ib.sx, ib.sy, (ia.depth + ib.depth) * 0.42, (ia.w + ib.w) * 1.1 + 1.2)
      }
      // Glowing vertices
      for (const v of outer) {
        this.plot(v.sx, v.sy, 1, v.w)
        this.plot(v.sx + 1, v.sy, 0.85, v.w)
        this.plot(v.sx - 1, v.sy, 0.85, v.w)
      }
      return
    }

    if (world === 'kailas') {
      // Mount Kailas 3D pyramidal summit + concentric spatial mandala phi = f(r) rings
      const ca = Math.cos(yaw + t * 0.14)
      const sa = Math.sin(yaw + t * 0.14)
      for (let py = 0; py < ph; py++) {
        const ny = (py / ph) * 2 - 1
        for (let px = 0; px < pw; px++) {
          const nx = ((px / pw) * 2 - 1) * aspect * 0.72
          // Polar coordinates in tilted mandala plane
          const tilt = 0.54 + pitch * 0.18
          const mx = (nx * ca - (ny / tilt) * sa) / zoom
          const mz = (nx * sa + (ny / tilt) * ca) / zoom
          const r = Math.hypot(mx, mz)
          const phi = Math.atan2(mz, mx)

          // Iconic four-faced pyramidal Mount Kailas elevation profile
          const fourFace = Math.abs(Math.cos(phi * 2)) * 0.22 + Math.abs(Math.sin(phi * 2)) * 0.14
          const peakHeight = Math.exp(-r * (1.85 + fourFace)) * 1.15
          const snowRidge = Math.exp(-Math.pow(r - 0.35, 2) * 18) * Math.abs(Math.cos(phi * 4)) * 0.45

          // Concentric 52 km kora spatial mandala rings (phi = f(r))
          const koraRing = Math.exp(-Math.pow((r * 4.2) % 1 - 0.5, 2) * 95) * (r > 0.38 && r < 1.55 ? 0.65 : 0)
          const cardinalGate =
            Math.exp(-Math.pow(Math.sin(phi * 2), 2) * 120) * (r > 0.45 && r < 1.48 ? 0.42 : 0)
          // Orbiting pilgrim light-packets along the kora circuit
          const pilgrimAngle = (phi - t * 0.48 + Math.PI * 4) % (Math.PI * 2)
          const pilgrim =
            Math.exp(-Math.pow(r - 0.95, 2) * 90) *
            Math.exp(-Math.pow(pilgrimAngle - 1.0, 2) * 18) *
            1.15

          // Elevation relief shading
          const strata = Math.abs(Math.sin(peakHeight * 18)) < 0.13 ? 0.58 : 0
          const val =
            peakHeight * 0.65 +
            snowRidge +
            strata * (r < 0.85 ? 0.75 : 0.2) +
            koraRing +
            cardinalGate +
            pilgrim

          // High Himalayan night sky stars at outer edges
          let star = 0
          if (r > 1.35) {
            const h = Math.sin(px * 17.3 + py * 53.7) * 43758.5453
            if (h - Math.floor(h) > 0.991) star = 0.5 + 0.4 * Math.sin(t * 2.5 + px)
          }

          const idx = py * pw + px
          lum[idx] = Math.min(1, Math.max(0, val + star))
          hue[idx] = pilgrim * 2.2 + koraRing * 1.1 - peakHeight * 0.6
        }
      }
      return
    }

    if (world === 'horizon') {
      // Relativistic Kerr Event Horizon with gravitationally lensed upper/lower accretion arcs
      const inc = 0.24 + pitch * 0.22
      for (let py = 0; py < ph; py++) {
        const ny = ((py / ph) * 2 - 1) / zoom
        for (let px = 0; px < pw; px++) {
          const nx = (((px / pw) * 2 - 1) * aspect * 0.68) / zoom
          const r = Math.hypot(nx, ny)
          const theta = Math.atan2(ny, nx)

          const shadowR = 0.34
          // Gravitational bending warp
          const bend = (shadowR * shadowR) / Math.max(0.05, r * r)
          const diskY = ny / Math.max(0.14, inc)
          const diskR = Math.hypot(nx, diskY)

          // Primary equatorial accretion disk
          const swirl =
            0.55 +
            0.45 * Math.sin(Math.atan2(diskY, nx) * 4 - t * 2.4 + diskR * 9.5) *
              Math.cos(diskR * 14 - t * 1.6)
          const mainDisk =
            Math.exp(-Math.pow(ny - Math.sin(nx * 2.2 + yaw) * 0.04, 2) * 85) *
            (diskR > shadowR * 0.95 && diskR < 1.35 ? 1 : 0) *
            Math.exp(-(diskR - shadowR) * 1.35) *
            swirl

          // Lensed upper & lower Einstein halo (light bent from back side of disk over poles)
          const haloR = shadowR * 1.14
          const lensedHalo =
            Math.exp(-Math.pow(r - haloR, 2) * 135) *
            (0.62 + 0.38 * Math.sin(theta * 3 + t * 2.1 + bend * 4))

          // Razor-sharp inner photon ring
          const photonRing = Math.exp(-Math.pow(r - shadowR * 1.01, 2) * 420) * 1.15

          // Relativistic Doppler beaming (left approaching side brighter)
          const doppler = 1.0 - nx * 0.42

          // Black hole shadow masks interior except foreground equatorial strip
          const inShadow = r < shadowR * 0.97 && Math.abs(ny) > 0.055
          let val = inShadow ? 0 : (mainDisk * 1.25 + lensedHalo * 0.92 + photonRing) * doppler

          // Gravitationally deflected background starfield
          if (!inShadow && r > shadowR * 1.25) {
            const sx = Math.round((nx * (1 - bend * 0.35)) * 70)
            const sy = Math.round((ny * (1 - bend * 0.35)) * 70)
            const h = Math.sin(sx * 12.9898 + sy * 78.233) * 43758.5453
            if (h - Math.floor(h) > 0.992) {
              val = Math.max(val, 0.55 + 0.35 * Math.sin(t * 2 + sx))
            }
          }

          const idx = py * pw + px
          lum[idx] = Math.min(1, Math.max(0, val))
          hue[idx] = -nx * 1.4 + photonRing * 1.1
        }
      }
      return
    }

    if (world === 'ruliad') {
      // Multiway branchial interference caustics + evolving hypergraph nodes
      for (let py = 0; py < ph; py++) {
        const ny = ((py / ph) * 2 - 1) / zoom
        for (let px = 0; px < pw; px++) {
          const nx = (((px / pw) * 2 - 1) * aspect * 0.72) / zoom
          let wave = 0
          for (let k = 0; k < 5; k++) {
            const ang = (k / 5) * Math.PI * 2 + yaw * 0.5 + t * 0.14 * (k % 2 ? 1 : -1)
            const ox = Math.cos(ang) * 0.65
            const oy = Math.sin(ang) * 0.45
            const d = Math.hypot(nx - ox, ny - oy)
            wave += Math.sin(d * 15 - t * 2.2 + k * 1.3) / (0.65 + d * 1.3)
          }
          const caustic = Math.pow(Math.abs(Math.sin(wave * 1.4)), 3.0)
          const branchLine = Math.abs(wave) < 0.22 ? 0.78 : 0
          const envelope = Math.exp(-(nx * nx + ny * ny) * 0.32)
          const val = (caustic * 0.62 + branchLine * 0.55) * envelope
          const idx = py * pw + px
          lum[idx] = Math.min(1, Math.max(0, val))
          hue[idx] = wave * 0.85
        }
      }
      // Overlay crisp multiway causal graph edges
      const cx = pw * 0.5
      const cy = ph * 0.5
      const rScale = Math.min(pw, ph) * 0.42 * zoom
      for (let layer = 0; layer < 4; layer++) {
        const count = 4 + layer * 3
        const rad = (layer + 1) * 0.26 * rScale
        for (let i = 0; i < count; i++) {
          const a = (i / count) * Math.PI * 2 + t * 0.18 * (layer % 2 ? 1 : -1) + yaw
          const x = cx + Math.cos(a) * rad * 1.35
          const y = cy + Math.sin(a) * rad * 0.88
          this.plot(x, y, 1, layer * 0.7)
          if (layer > 0) {
            const pCount = 4 + (layer - 1) * 3
            const pRad = layer * 0.26 * rScale
            const pa =
              ((i % pCount) / pCount) * Math.PI * 2 +
              t * 0.18 * ((layer - 1) % 2 ? 1 : -1) +
              yaw
            const px2 = cx + Math.cos(pa) * pRad * 1.35
            const py2 = cy + Math.sin(pa) * pRad * 0.88
            this.drawLine(x, y, px2, py2, 0.55, layer * 0.5)
          }
        }
      }
      return
    }

    if (world === 'lorenz') {
      // Lorenz chaotic strange attractor + glowing QR-nullspace orthogonal plane
      const cx = pw * 0.5
      const cy = ph * 0.5
      const scale = Math.min(pw * 0.36, ph * 0.56) * zoom
      const ay = yaw + t * 0.35
      const ax = pitch + 0.35
      const cyaw = Math.cos(ay)
      const syaw = Math.sin(ay)
      const cp = Math.cos(ax)
      const sp = Math.sin(ax)

      const project3D = (x: number, y: number, z: number) => {
        const rx = x * cyaw - z * syaw
        const rz1 = x * syaw + z * cyaw
        const ry = y * cp - rz1 * sp
        const rz = y * sp + rz1 * cp
        const persp = 3.2 / (4.4 - rz)
        return {
          sx: cx + rx * persp * scale,
          sy: cy + ry * persp * scale * 0.82,
          depth: Math.max(0.2, Math.min(1, (rz + 1.8) * 0.34)),
        }
      }

      // Draw orthogonal QR-nullspace protection grid plane (y = 0)
      for (let g = -5; g <= 5; g++) {
        const u = g * 0.28
        const a = project3D(u, 0, -1.4)
        const b = project3D(u, 0, 1.4)
        this.drawLine(a.sx, a.sy, b.sx, b.sy, 0.28, -1.2)
        const c = project3D(-1.4, 0, u)
        const d = project3D(1.4, 0, u)
        this.drawLine(c.sx, c.sy, d.sx, d.sy, 0.28, -1.2)
      }

      // Draw animated Lorenz trajectories with moving head pulses
      const headA = Math.floor(t * 75) % LORENZ_POINTS.length
      const headB = (headA + Math.floor(LORENZ_POINTS.length / 2)) % LORENZ_POINTS.length
      let prev = project3D(LORENZ_POINTS[0][0], LORENZ_POINTS[0][1], LORENZ_POINTS[0][2])
      for (let i = 1; i < LORENZ_POINTS.length; i++) {
        const pt = LORENZ_POINTS[i]
        const cur = project3D(pt[0], pt[1], pt[2])
        const distA = (headA - i + LORENZ_POINTS.length) % LORENZ_POINTS.length
        const distB = (headB - i + LORENZ_POINTS.length) % LORENZ_POINTS.length
        const pulse = Math.max(
          Math.exp(-distA * 0.045),
          Math.exp(-distB * 0.045),
        )
        const intensity = Math.min(1, cur.depth * 0.55 + pulse * 0.72)
        this.drawLine(prev.sx, prev.sy, cur.sx, cur.sy, intensity, pulse * 2.2)
        prev = cur
      }
      return
    }

    // Default: noosphere — Ethereal Cathedral of Minds (Akashic Lattice)
    for (let py = 0; py < ph; py++) {
      const ny = ((py / ph) * 2 - 1) / zoom
      for (let px = 0; px < pw; px++) {
        const nx = (((px / pw) * 2 - 1) * aspect * 0.72) / zoom
        // Cathedral vaulted arches + non-Euclidean resonant lattice
        const r = Math.hypot(nx, ny)
        const z = 1.8 / (0.35 + Math.abs(nx) * 0.75 + Math.abs(ny) * 0.55) - t * 0.65
        const arch = Math.cos(nx * 5.2 + Math.sin(z * 0.9 + yaw) * 0.9) * Math.cos(ny * 4.4 - z * 0.7)
        const harmonic =
          Math.sin(r * 10 - t * 1.9 + Math.atan2(ny, nx) * 3) * 0.5 +
          Math.cos((nx * 3 - ny * 4) * 2.4 + t * 1.2) * 0.5
        const vault = Math.pow(Math.max(0, 1 - Math.abs(arch)), 4.0)
        const node = Math.pow(Math.max(0, harmonic), 4.0) * Math.exp(-r * 0.65)
        const val = vault * 0.65 * Math.exp(-r * 0.35) + node * 0.9
        const idx = py * pw + px
        lum[idx] = Math.min(1, Math.max(0, val))
        hue[idx] = z * 0.35 + harmonic * 1.4
      }
    }
  }

  public renderToCanvas(
    ctx: CanvasRenderingContext2D,
    widthPx: number,
    heightPx: number,
    world: WorldId,
    mode: RenderMode,
    palette: PaletteId,
    cam: WorldCamera,
  ) {
    const pal = PALETTES[palette]
    ctx.fillStyle = pal.bg
    ctx.fillRect(0, 0, widthPx, heightPx)

    // Choose crisp monospace cell size for high resolution
    const fontSize = widthPx >= 820 ? 12 : widthPx >= 560 ? 11 : 10
    const cellW = Math.max(6, Math.round(fontSize * 0.62))
    const cellH = Math.max(11, Math.round(fontSize * 1.12))
    const cols = Math.max(36, Math.floor(widthPx / cellW))
    const rows = Math.max(16, Math.floor(heightPx / cellH))
    const offsetX = Math.floor((widthPx - cols * cellW) / 2)
    const offsetY = Math.floor((heightPx - rows * cellH) / 2)

    ctx.font = `500 ${fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`
    ctx.textBaseline = 'top'

    if (mode === 'braille') {
      // 2x4 subpixel resolution per terminal cell!
      this.ensureSize(cols * 2, rows * 4)
      this.sampleField(world, cam)
      const { lum, hue, pw } = this
      // Braille dot bit mapping:
      // (0,0)=0x01, (0,1)=0x02, (0,2)=0x04, (0,3)=0x40
      // (1,0)=0x08, (1,1)=0x10, (1,2)=0x20, (1,3)=0x80
      const bits = [0x01, 0x08, 0x02, 0x10, 0x04, 0x20, 0x40, 0x80]
      const threshold = 0.17

      for (let r = 0; r < rows; r++) {
        const yPx = offsetY + r * cellH
        const py0 = r * 4
        for (let c = 0; c < cols; c++) {
          const px0 = c * 2
          let mask = 0
          let maxL = 0
          let sumL = 0
          let sumH = 0
          let lit = 0
          for (let dy = 0; dy < 4; dy++) {
            const rowOff = (py0 + dy) * pw + px0
            for (let dx = 0; dx < 2; dx++) {
              const l = lum[rowOff + dx]
              if (l > threshold) {
                mask |= bits[dy * 2 + dx]
                sumL += l
                sumH += hue[rowOff + dx]
                lit++
                if (l > maxL) maxL = l
              }
            }
          }
          if (mask === 0) continue
          const avgL = (sumL / lit) * 0.55 + maxL * 0.45
          const avgH = sumH / lit
          const [cr, cg, cb] = samplePalette(palette, avgL, avgH)
          ctx.fillStyle = `rgb(${cr},${cg},${cb})`
          ctx.fillText(String.fromCharCode(0x2800 + mask), offsetX + c * cellW, yPx)
        }
      }
      return
    }

    if (mode === 'halfblock') {
      // 1x2 subpixel resolution per cell using upper half-block '▀' (fg=top, bg=bottom)
      this.ensureSize(cols, rows * 2)
      this.sampleField(world, cam)
      const { lum, hue, pw } = this
      for (let r = 0; r < rows; r++) {
        const yPx = offsetY + r * cellH
        const topOff = r * 2 * pw
        const botOff = (r * 2 + 1) * pw
        for (let c = 0; c < cols; c++) {
          const lTop = lum[topOff + c]
          const lBot = lum[botOff + c]
          if (lTop < 0.06 && lBot < 0.06) continue
          const [br, bg, bb] = samplePalette(palette, lBot, hue[botOff + c])
          if (lBot >= 0.06) {
            ctx.fillStyle = `rgb(${br},${bg},${bb})`
            ctx.fillRect(offsetX + c * cellW, yPx, cellW, cellH)
          }
          if (lTop >= 0.06) {
            const [tr, tg, tb] = samplePalette(palette, lTop, hue[topOff + c])
            ctx.fillStyle = `rgb(${tr},${tg},${tb})`
            ctx.fillText('▀', offsetX + c * cellW, yPx)
          }
        }
      }
      return
    }

    // High-density 68-char luminance ASCII mode
    this.ensureSize(cols, rows)
    this.sampleField(world, cam)
    const { lum, hue, pw } = this
    const maxChar = DENSE_ASCII.length - 1
    for (let r = 0; r < rows; r++) {
      const yPx = offsetY + r * cellH
      const rowOff = r * pw
      for (let c = 0; c < cols; c++) {
        const l = lum[rowOff + c]
        if (l < 0.08) continue
        const ch = DENSE_ASCII[Math.min(maxChar, Math.floor(l * maxChar))]
        const [cr, cg, cb] = samplePalette(palette, l, hue[rowOff + c])
        ctx.fillStyle = `rgb(${cr},${cg},${cb})`
        ctx.fillText(ch, offsetX + c * cellW, yPx)
      }
    }
  }
}
