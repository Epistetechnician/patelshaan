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
  /** Optional scrubbed epoch coordinate in [0, 1] for scrubbable journeys */
  epochPhase?: number | null
}

export type WorldHudInfo = {
  epoch: string
  coords: string
  metric: string
  epochIndex?: number
  epochPhase?: number
}

export type EpochStop = {
  label: string
  shortLabel: string
  time: string
  detail: string
  note: string
}

export const UNIVERSAL_EPOCHS: EpochStop[] = [
  {
    label: 'PLANCK FOAM',
    shortLabel: '10⁻⁴³s',
    time: 't = 10⁻⁴³ s',
    detail: 'scale a ~ 10⁻³⁵ m · T ≈ 1.4×10³² K',
    note: 'At the Planck wall, geometry dissolves into quantum foam, the UV boundary where classical spacetime ceases to be a smooth manifold.',
  },
  {
    label: 'COSMIC INFLATION',
    shortLabel: '10⁻³²s',
    time: 't = 10⁻³² s',
    detail: 'e⁶⁰ expansion · T ≈ 10²⁷ K',
    note: 'Exponential vacuum expansion stretches microscopic quantum fluctuations across super-horizon scales, seeding every future galaxy.',
  },
  {
    label: 'CMB LAST SCATTERING',
    shortLabel: '380 kyr',
    time: 't = 380 kyr',
    detail: 'z = 1,089 · T = 3,000 K',
    note: 'Photons decouple from neutral hydrogen, freezing a crisp acoustic snapshot of the early universe onto the cosmic microwave sky.',
  },
  {
    label: 'COSMIC DAWN · POP III',
    shortLabel: '180 Myr',
    time: 't = 180 Myr',
    detail: 'z = 20 · T = 60 K',
    note: 'First metal-free stars ignite inside dark matter minihalos, ending the dark ages and forging the first heavy elements.',
  },
  {
    label: 'GALACTIC FILAMENTS',
    shortLabel: '3.2 Gyr',
    time: 't = 3.2 Gyr',
    detail: 'z = 2.1 · T = 8.4 K',
    note: 'Gravity weaves matter into luminous cosmic web filaments and voids at peak star-formation noon.',
  },
  {
    label: 'SOLAR ACCRETION',
    shortLabel: '9.2 Gyr',
    time: 't = 9.2 Gyr',
    detail: '4.6 Gyr ago · T = 3.9 K',
    note: 'A metal-enriched molecular cloud collapses into the Sun and protoplanetary disk; third-generation stardust assembling planets.',
  },
  {
    label: 'BIOSPHERE & COGNITION',
    shortLabel: '13.79 Gyr',
    time: 't = 13.79 Gyr',
    detail: 'z = 0.00 · T = 2.725 K',
    note: 'Self-replicating chemistry crosses into nervous systems and symbolic compression; matter beginning to audit its own models.',
  },
  {
    label: 'NOOSPHERE · 2026 CE',
    shortLabel: '2026 CE',
    time: 't = 13.80 Gyr',
    detail: 'shaan4d.xyz · T = 2.725 K',
    note: 'Machine-verified proofs, sealed holdout ledgers, and multi-agent cognition emerge inside a tiny 2.725 K corner of the light-cone.',
  },
  {
    label: 'BLACK HOLE ERA',
    shortLabel: '10⁴⁰ yr',
    time: 't = 10⁴⁰ yr',
    detail: 'Hawking glow · T → 10⁻²⁹ K',
    note: 'After stars extinguish, spinning Kerr horizons become the final heat engines, slowly radiating their entropy into deep time.',
  },
]

export const PSYCHO_EPOCHS: EpochStop[] = [
  {
    label: 'SUMERIAN LEDGERS',
    shortLabel: '3000 BCE',
    time: '3000 BCE',
    detail: 'clay accounting · first statebooks',
    note: 'Before poetry, writing begins as barley and silver accounting on cuneiform tablets; humanity’s first verifiable statebooks.',
  },
  {
    label: 'AXIAL AGE REFORM',
    shortLabel: '500 BCE',
    time: '500 BCE',
    detail: 'symbolic compression across Eurasia',
    note: 'Coinage, alphabetic literacy, and formal logic co-emerge across Greece, India, and China; compressing institutional trust.',
  },
  {
    label: 'SONG JIAOZI NOTES',
    shortLabel: '1024 CE',
    time: '1024 CE',
    detail: 'first state-backed paper credit ledger',
    note: 'Sichuan merchants and the Song state decouple settlement from heavy coin, inventing the first scalable credit-coherence challenge.',
  },
  {
    label: 'AMSTERDAM BOURSE',
    shortLabel: '1602 CE',
    time: '1602 CE',
    detail: 'continuous joint-stock price discovery',
    note: 'Continuous secondary trading turns collective expectation into a live geometric signal, and births the first multi-leg arbitrage.',
  },
  {
    label: 'PEEL BANK CHARTER',
    shortLabel: '1844 CE',
    time: '1844 CE',
    detail: 'central bank reserve discipline',
    note: 'Industrial liquidity cycles force explicit reserve rules, separating monetary issuance from discretionary credit expansion.',
  },
  {
    label: 'BRETTON WOODS BREAK',
    shortLabel: '1971 CE',
    time: '1971 CE',
    detail: 'floating macro regime bifurcation',
    note: 'Floating fiat currencies couple global bond yields, volatility indices, and expectations into a single high-dimensional macro manifold.',
  },
  {
    label: 'MULTI-LEG OBSTRUCTION',
    shortLabel: '2026 CE',
    time: '2026 CE',
    detail: 'AUROC 0.9810 · E_t = 1.00e12 certified',
    note: 'Across 1,673 real Polymarket & Kalshi events, coherence obstructions + causal FRED macro certify extreme mispricing corrections at E_t = 1e12.',
  },
]

export const KAILAS_STOPS: EpochStop[] = [
  {
    label: 'DARCHEN BASE',
    shortLabel: '0 km',
    time: '0.0 km · 4,670 m',
    detail: 'south face approach · φ = 0.00 rad',
    note: 'At Darchen (4,670 m), pilgrims step off calendar time and onto the 52 km spatial coordinate ring encircling Mount Kailas.',
  },
  {
    label: 'TARBOCHE FLAGPOLE',
    shortLabel: '8 km',
    time: '8.0 km · 4,740 m',
    detail: 'charnel ground · 84 mahasiddhas',
    note: 'At Tarboche and the Choku valley mouth, narrative framing shifts from biographical travel into spatial ritual thresholds.',
  },
  {
    label: 'DIRAPUK NORTH FACE',
    shortLabel: '20 km',
    time: '20.0 km · 5,080 m',
    detail: 'sheer north pyramid · ཏི་སེ Ti Se',
    note: 'Below the sheer black north face at Dirapuk, classical Tibetan and Bon Kangyur passages anchor cosmological perception directly to radial distance.',
  },
  {
    label: 'DOLMA LA PASS',
    shortLabel: '29 km',
    time: '29.0 km · 5,630 m',
    detail: 'summit saddle · Gauri Kund · α=0.86',
    note: 'Crossing Dolma La at 5,630 m marks the kora inflection point where spatial phase φ = f(r) peaks across Thubron and indigenous accounts.',
  },
  {
    label: 'ZUTULPUK CAVE',
    shortLabel: '39 km',
    time: '39.0 km · 4,820 m',
    detail: 'east valley · Milarepa retreat',
    note: 'Descending the eastern valley past Zutulpuk, pilgrims transition from high-pass intensity back toward linear valley duration.',
  },
  {
    label: 'BARKHA LOOP CLOSURE',
    shortLabel: '52 km',
    time: '52.0 km · 4,670 m',
    detail: 'circuit closed · φ = 2π rad',
    note: 'Completing the 52 km circuit closes the spatial mandala: confirming the double dissociation against calendar-locked Hajj and Holy Land pilgrimages.',
  },
]

export const HORIZON_STOPS: EpochStop[] = [
  {
    label: 'SCHWARZSCHILD LIMIT',
    shortLabel: 'a*=0.00',
    time: 'a* = 0.000 M',
    detail: 'static horizon · r_ISCO = 3.0 r_s',
    note: 'At zero spin, spacetime is spherically symmetric: the accretion glow forms a balanced ring without frame-dragging asymmetry.',
  },
  {
    label: 'MODERATE SPIN',
    shortLabel: 'a*=0.35',
    time: 'a* = 0.350 M',
    detail: 'ergosphere emerges · Doppler β = 0.28c',
    note: 'As angular momentum rises, the approaching limb begins beaming brighter while background rays deflect asymmetrically around the shadow.',
  },
  {
    label: 'RELATIVISTIC KERR',
    shortLabel: 'a*=0.70',
    time: 'a* = 0.700 M',
    detail: 'r_ph = 1.6 r_s · Doppler β = 0.48c',
    note: 'Frame dragging pulls equatorial plasma tighter toward the horizon, sharpening upper and lower gravitationally lensed Einstein arcs.',
  },
  {
    label: 'THORNE SPIN CAP',
    shortLabel: 'a*=0.95',
    time: 'a* = 0.950 M',
    detail: 'prograde ISCO tightens · β = 0.59c',
    note: 'Near the Thorne radiative spin ceiling, the shadow flattens on the prograde edge and Doppler contrast dominates the photon ring.',
  },
  {
    label: 'EXTREMAL KERR',
    shortLabel: 'a*=0.998',
    time: 'a* = 0.998 M',
    detail: 'r_ph → 1.5 r_s · Doppler β = 0.62c',
    note: 'At extremal spin a* = 0.998 M, light loops multiple times around the razor-thin photon sphere before escaping toward the observer.',
  },
]

export const TESSERACT_STOPS: EpochStop[] = [
  {
    label: 'LOWER 4D BOUNDARY',
    shortLabel: 'w=−1.0',
    time: 'w = −1.00',
    detail: 'inner 3-cell compressed · S³ south pole',
    note: 'At w = −1.00, the hypercube projects from the far fourth-dimensional pole, compressing its inner cubic cell inside the outer frame.',
  },
  {
    label: 'NEGATIVE HYPERPLANE',
    shortLabel: 'w=−0.5',
    time: 'w = −0.50',
    detail: 'XW rotation −π/4 · Villarceau twist',
    note: 'Tilting across the negative w-hyperplane reveals how orthogonal 4D edges shear into nested hexahedral frustums in 3D.',
  },
  {
    label: 'EQUATORIAL 3-SLICE',
    shortLabel: 'w=0.0',
    time: 'w = 0.00',
    detail: 'symmetric S³ equator · 16v/32e balanced',
    note: 'At the equatorial slice w = 0, stereographic Hopf fibers thread symmetrically through all eight cubic boundary cells.',
  },
  {
    label: 'POSITIVE HYPERPLANE',
    shortLabel: 'w=+0.5',
    time: 'w = +0.50',
    detail: 'XW rotation +π/4 · dual cell emergence',
    note: 'Passing into positive w-coordinates turns the inner cell outward: showing how lower-dimensional shadows hide higher-dimensional invariants.',
  },
  {
    label: 'UPPER 4D BOUNDARY',
    shortLabel: 'w=+1.0',
    time: 'w = +1.00',
    detail: 'full cell inversion · S³ north pole',
    note: 'At w = +1.00, the tesseract completes its inside-out inversion through ℝ⁴ without ever breaking a single right angle in four dimensions.',
  },
]

export const RULIAD_STOPS: EpochStop[] = [
  {
    label: 'GENESIS RULE',
    shortLabel: 't=0',
    time: 'STEP 0001',
    detail: 'seed hyperedge · branching κ = 1.00',
    note: 'A minimal local rewrite rule seeds the causal graph before multiway branches diverge into distinct observer histories.',
  },
  {
    label: 'CAUSAL CONE',
    shortLabel: 't=10²',
    time: 'STEP 0128',
    detail: 'light-cone foliation · low entanglement',
    note: 'Causal edges knit into an emergent spacetime foliation where spacelike-separated rewrites commute cleanly.',
  },
  {
    label: 'BRANCHIAL WEB',
    shortLabel: 't=10³',
    time: 'STEP 1024',
    detail: 'multiway interference caustics · κ = 1.35',
    note: 'Competing rewrite paths interfere across branchial space, creating caustic ridges where distinct computations reconverge.',
  },
  {
    label: 'OBSERVER HORIZON',
    shortLabel: 't=5×10³',
    time: 'STEP 4800',
    detail: 'coarse-grained equivalence classes',
    note: 'Any computationally bounded observer must quotient equivalent branches: the same compression boundary formalised in our Lean 4 Kraft theorems.',
  },
  {
    label: 'ASYMPTOTIC RULIAD',
    shortLabel: 't=10⁴',
    time: 'STEP 9999',
    detail: 'entangled limit · maximal foliation',
    note: 'In the asymptotic limit, all consistent rules coexist in one entangled hypergraph; only local verification receipts carve a legible path.',
  },
]

export const LORENZ_STOPS: EpochStop[] = [
  {
    label: 'UNPROJECTED SFT',
    shortLabel: 'KL 0.11',
    time: 'λ_QR = 0.00',
    detail: 'Arm B unprojected · replay KL = 0.1088',
    note: 'Without orthogonal projection, weight updates perturb protected replay directions, driving replay KL drift to 0.1088 and 16.3% routing flips.',
  },
  {
    label: 'PARTIAL DAMPING',
    shortLabel: 'λ=0.25',
    time: 'λ_QR = 0.25',
    detail: 'subspace attenuation · KL ≈ 0.048',
    note: 'Quarter-strength projection trims the largest replay perturbations while chaotic attractor lobes still bleed across the protection plane.',
  },
  {
    label: 'MID-PROJECTION',
    shortLabel: 'λ=0.50',
    time: 'λ_QR = 0.50',
    detail: '844 MoE bases active · KL ≈ 0.014',
    note: 'Halfway into the QR nullspace, expert updates begin separating task gain from replay drift across layers 40–47.',
  },
  {
    label: 'NEAR-ORTHOGONAL',
    shortLabel: 'λ=0.85',
    time: 'λ_QR = 0.85',
    detail: 'first-layer flips → 0.0% · KL ≈ 0.002',
    note: 'Near full orthogonality, first-layer MoE routing stabilizes completely while MATH-500 capability climbs sharply.',
  },
  {
    label: 'QR NULLSPACE LOCK',
    shortLabel: 'KL 0.0006',
    time: 'λ_QR = 1.00',
    detail: '||ΔW_⊥·Q|| = 1.06e-8 · 76.25% MATH-500',
    note: 'Full QR-nullspace projection locks replay KL at 0.000605 (180× lower than Arm B) while lifting sealed MATH-500 from 39.75% to 76.25%.',
  },
]

export const NOOSPHERE_STOPS: EpochStop[] = [
  {
    label: 'SEED NODE',
    shortLabel: 'k=(1,1)',
    time: 'mode k=(1,1,2)',
    detail: 'isolated verifier · Ψ = 0.68',
    note: 'A single verifiable node establishes local integrity, but commons stewardship requires legible coordination across peers.',
  },
  {
    label: 'DYAD RESONANCE',
    shortLabel: 'k=(2,3)',
    time: 'mode k=(2,3,5)',
    detail: 'bilateral signed receipts · Ψ = 0.76',
    note: 'Paired principals exchange attenuated Biscuit capabilities and signed commitments without surrendering sovereignty.',
  },
  {
    label: 'TRIAD HARMONIC',
    shortLabel: 'k=(3,5)',
    time: 'mode k=(3,5,8)',
    detail: 'non-Euclidean lattice · Ψ = 0.84',
    note: 'Quadratic preference discovery, retroactive outcome funding, and Ostrom rules interlock into a resonant civic mesh.',
  },
  {
    label: 'CATHEDRAL VAULT',
    shortLabel: 'k=(5,8)',
    time: 'mode k=(5,8,13)',
    detail: 'standing epistemic arches · Ψ = 0.91',
    note: 'Independent replications reinforce shared truth across disciplines: AI containment, market coherence, and cultural archives alike.',
  },
  {
    label: 'AKASHIC LATTICE',
    shortLabel: 'k=(8,13)',
    time: 'mode k=(8,13,21)',
    detail: 'maximal coherence · Ψ = 0.97',
    note: 'At maximal harmonic coherence, every claim carries its own replayable proof receipt across the collective lattice.',
  },
]

export type ScrubberSpec = {
  minLabel: string
  maxLabel: string
  epochs: EpochStop[]
}

export function getWorldScrubberSpec(world: WorldId): ScrubberSpec | null {
  if (world === 'universal') {
    return { minLabel: '10⁻⁴³ s', maxLabel: '10⁴⁰ yr', epochs: UNIVERSAL_EPOCHS }
  }
  if (world === 'psychohistory') {
    return { minLabel: '3000 BCE', maxLabel: '2026 CE', epochs: PSYCHO_EPOCHS }
  }
  if (world === 'kailas') {
    return { minLabel: '0 km', maxLabel: '52 km', epochs: KAILAS_STOPS }
  }
  if (world === 'horizon') {
    return { minLabel: 'a*=0', maxLabel: '0.998M', epochs: HORIZON_STOPS }
  }
  if (world === 'tesseract') {
    return { minLabel: 'w=−1', maxLabel: 'w=+1', epochs: TESSERACT_STOPS }
  }
  if (world === 'ruliad') {
    return { minLabel: 'Step 0', maxLabel: '10⁴', epochs: RULIAD_STOPS }
  }
  if (world === 'lorenz') {
    return { minLabel: 'KL 0.11', maxLabel: '0.0006', epochs: LORENZ_STOPS }
  }
  return { minLabel: 'k=(1,1)', maxLabel: 'k=(8,13)', epochs: NOOSPHERE_STOPS }
}

export function getWorldEpochPhase(world: WorldId, cam: WorldCamera): number {
  if (typeof cam.epochPhase === 'number' && Number.isFinite(cam.epochPhase)) {
    return Math.max(0, Math.min(0.9999, cam.epochPhase))
  }
  if (world === 'universal') {
    return (((cam.time * 0.055 + (cam.zoom - 1) * 0.25) % 1) + 1) % 1
  }
  if (world === 'psychohistory') {
    return (((cam.time * 0.065) % 1) + 1) % 1
  }
  return (((cam.time * 0.05) % 1) + 1) % 1
}

export const WORLD_DEFAULT_NOTES: Record<WorldId, string> = {
  psychohistory: PSYCHO_EPOCHS[PSYCHO_EPOCHS.length - 1].note,
  universal: UNIVERSAL_EPOCHS[2].note,
  tesseract:
    'Stereographic S³ Hopf fibers thread a rotating 4D hypercube: lifting dimensions reveals orthogonal structure hidden in 2D shadows.',
  kailas:
    'Around Mount Kailas’s 52 km kora, pilgrimage phenomenology locks to radial spatial phase φ = f(r) across 2,626 blind-labeled passages (α = 0.86, p = 0.0022).',
  horizon:
    'Near r_ph = 1.5 r_s, Kerr frame dragging bends back-side plasma into upper and lower Einstein arcs while Doppler beaming brightens the approaching limb.',
  ruliad:
    'Branchial space holds all entangled multiway evaluations: any bounded observer only sees a coarse foliation, echoing anytime-valid holdout bounds.',
  lorenz:
    'Chaotic twin-lobe flow evolves while the invariant QR-nullspace plane remains untouched, the geometry behind Track 5’s 180× lower replay KL (0.000605).',
  noosphere:
    'Standing wave harmonics across collective memory nodes: durable commons pair quadratic preference discovery with Ostrom-legible stewardship.',
}

export function getWorldHud(world: WorldId, cam: WorldCamera): WorldHudInfo {
  if (world === 'universal') {
    const phase = getWorldEpochPhase('universal', cam)
    const idx = Math.min(
      UNIVERSAL_EPOCHS.length - 1,
      Math.floor(phase * UNIVERSAL_EPOCHS.length),
    )
    const ep = UNIVERSAL_EPOCHS[idx]
    return {
      epoch: `${ep.label} · ${ep.time}`,
      coords: ep.detail,
      metric: `θ=${cam.yaw.toFixed(2)} φ=${cam.pitch.toFixed(2)} zoom=${cam.zoom.toFixed(2)}×`,
      epochIndex: idx,
      epochPhase: phase,
    }
  }
  if (world === 'psychohistory') {
    const phase = getWorldEpochPhase('psychohistory', cam)
    const idx = Math.min(
      PSYCHO_EPOCHS.length - 1,
      Math.floor(phase * PSYCHO_EPOCHS.length),
    )
    const ep = PSYCHO_EPOCHS[idx]
    return {
      epoch: `${ep.label} (${ep.time})`,
      coords: ep.detail,
      metric: `holdout n=669 · Lean4 1673/1673`,
      epochIndex: idx,
      epochPhase: phase,
    }
  }
  if (world === 'tesseract') {
    const phase = getWorldEpochPhase('tesseract', cam)
    const idx = Math.min(TESSERACT_STOPS.length - 1, Math.floor(phase * TESSERACT_STOPS.length))
    const ep = TESSERACT_STOPS[idx]
    const wSlice = (phase * 2 - 1).toFixed(2)
    return {
      epoch: `${ep.label} · w = ${wSlice}`,
      coords: ep.detail,
      metric: `16v/32e + 16 Villarceau Hopf fibers`,
      epochIndex: idx,
      epochPhase: phase,
    }
  }
  if (world === 'kailas') {
    const phase = getWorldEpochPhase('kailas', cam)
    const idx = Math.min(KAILAS_STOPS.length - 1, Math.floor(phase * KAILAS_STOPS.length))
    const ep = KAILAS_STOPS[idx]
    const koraKm = (phase * 52).toFixed(1)
    return {
      epoch: `${ep.label} · KORA ${koraKm} / 52.0 km`,
      coords: ep.detail,
      metric: `2,626 passages · 282 Tibetan/Bon · α=0.86`,
      epochIndex: idx,
      epochPhase: phase,
    }
  }
  if (world === 'horizon') {
    const phase = getWorldEpochPhase('horizon', cam)
    const idx = Math.min(HORIZON_STOPS.length - 1, Math.floor(phase * HORIZON_STOPS.length))
    const ep = HORIZON_STOPS[idx]
    const aStar = (phase * 0.998).toFixed(3)
    return {
      epoch: `${ep.label} · a* = ${aStar} M`,
      coords: ep.detail,
      metric: `inclination=${(18 + cam.pitch * 24).toFixed(1)}°`,
      epochIndex: idx,
      epochPhase: phase,
    }
  }
  if (world === 'ruliad') {
    const phase = getWorldEpochPhase('ruliad', cam)
    const idx = Math.min(RULIAD_STOPS.length - 1, Math.floor(phase * RULIAD_STOPS.length))
    const ep = RULIAD_STOPS[idx]
    return {
      epoch: `${ep.label} · ${ep.time}`,
      coords: ep.detail,
      metric: `observer horizon κ=${(1.0 + phase * 0.75).toFixed(2)}`,
      epochIndex: idx,
      epochPhase: phase,
    }
  }
  if (world === 'lorenz') {
    const phase = getWorldEpochPhase('lorenz', cam)
    const idx = Math.min(LORENZ_STOPS.length - 1, Math.floor(phase * LORENZ_STOPS.length))
    const ep = LORENZ_STOPS[idx]
    const klEst = (0.1088 * Math.pow(0.000605 / 0.1088, phase)).toFixed(4)
    return {
      epoch: `${ep.label} · λ_QR=${phase.toFixed(2)}`,
      coords: ep.detail,
      metric: `replay KL ≈ ${klEst} · 844 MoE bases`,
      epochIndex: idx,
      epochPhase: phase,
    }
  }
  const phase = getWorldEpochPhase('noosphere', cam)
  const idx = Math.min(NOOSPHERE_STOPS.length - 1, Math.floor(phase * NOOSPHERE_STOPS.length))
  const ep = NOOSPHERE_STOPS[idx]
  return {
    epoch: `${ep.label} · ${ep.time}`,
    coords: ep.detail,
    metric: `coherence Ψ=${(0.68 + phase * 0.29).toFixed(3)}`,
    epochIndex: idx,
    epochPhase: phase,
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
      const epochPhase = getWorldEpochPhase('psychohistory', cam)
      const eraFreq = 1.0 + epochPhase * 1.45
      const shockBoost = 0.55 + epochPhase * 0.65
      const cy = Math.cos(yaw * 0.65)
      const sy = Math.sin(yaw * 0.65)
      for (let py = 0; py < ph; py++) {
        const ny = (py / ph) * 2 - 1
        for (let px = 0; px < pw; px++) {
          const nx = ((px / pw) * 2 - 1) * aspect * 0.72
          // Perspective ground plane projection
          const depth = 1.45 / Math.max(0.16, ny + 1.18 - pitch * 0.25)
          const wx = (nx * depth * cy - depth * sy) / zoom
          const wz = (nx * depth * sy + depth * cy) / zoom - t * 0.85 - epochPhase * 9.0

          // Secular historical wave + multi-leg obstruction ridge modulated by scrubbed era
          const secular =
            Math.sin(wx * 1.3 * eraFreq + t * 0.35) * Math.cos(wz * 0.9) * 0.45 +
            Math.sin((wx + wz) * 2.0 * eraFreq - t * 0.8) * 0.22
          const ridge =
            Math.exp(-Math.pow(wx - Math.sin(wz * 0.55 + epochPhase * 3.1) * 1.3, 2) * (1.4 + epochPhase * 1.2)) *
            (0.55 + epochPhase * 0.28)
          const shockDist = Math.hypot(wx * 0.9, ((wz + t * 0.85 + epochPhase * 9.0) % 4.2) - 2.1)
          const shock = Math.exp(-Math.pow(shockDist - (t * 1.35) % 3.6, 2) * 14) * shockBoost

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
          hue[idx] = shock * 2.2 + ridge * 0.9 - secular * 0.5 + epochPhase * 1.6
        }
      }
      return
    }

    if (world === 'universal') {
      // Logarithmic cosmic light-cone & evolving cosmic web across 10^-43 s -> 10^40 yr
      const epochPhase = getWorldEpochPhase('universal', cam)
      const isBlackHoleEra = Math.max(0, (epochPhase - 0.82) / 0.18)
      const isPlanckEra = Math.max(0, 1 - epochPhase * 5.0)
      for (let py = 0; py < ph; py++) {
        const ny = (py / ph) * 2 - 1
        for (let px = 0; px < pw; px++) {
          const nx = ((px / pw) * 2 - 1) * aspect * 0.72
          const rx = nx + Math.sin(yaw) * 0.22
          const ry = ny + Math.sin(pitch) * 0.22
          const r = Math.hypot(rx, ry) + 1e-4
          const theta = Math.atan2(ry, rx)

          // Tunnel logarithmic depth coordinate tied directly to scrubbed cosmic epoch
          const logZ = 1.65 / (r + 0.14) - t * 0.95 - epochPhase * 14.0
          const spiral = theta * (2.0 + Math.round(epochPhase * 3.0)) + logZ * 1.15 - t * 0.35

          // Cosmic web filaments + expanding epoch rings
          const filamentA = Math.sin(spiral) * Math.cos(logZ * 2.1 + Math.sin(theta * 5) * 0.7)
          const filamentB = Math.sin(theta * 7 - logZ * 1.6 + t * 0.5) * Math.cos(r * 9 - t * 1.4)
          const web = Math.pow(Math.max(0, 1 - Math.abs(filamentA * 0.65 + filamentB * 0.35)), 3.2)

          // Light-cone horizon rings
          const ring = Math.pow(Math.max(0, Math.cos(logZ * Math.PI * 1.5)), 10)
          // Core singularity (blazing at Planck foam, dark Hawking ring in Black Hole era)
          const core =
            isBlackHoleEra > 0.15
              ? Math.exp(-Math.pow(r - 0.22, 2) * 180) * 0.95 * isBlackHoleEra
              : Math.exp(-r * r * (12 - isPlanckEra * 7)) * (1.05 + isPlanckEra * 0.55)
          const bhMask = isBlackHoleEra > 0.35 && r < 0.19 ? 1 - isBlackHoleEra * 0.92 : 1
          // Background galaxies / stars
          const h = Math.sin(Math.floor(theta * 24) * 19.1 + Math.floor(logZ * 4) * 91.7) * 43758.5453
          const star = h - Math.floor(h) > 0.96 ? 0.75 * Math.min(1, r * 2.2) * (1 - isPlanckEra * 0.6) : 0

          const val = (core + web * (0.72 - isBlackHoleEra * 0.35) * Math.min(1, r * 2.4) + ring * 0.38 + star) * bhMask
          const idx = py * pw + px
          lum[idx] = Math.min(1, Math.max(0, val))
          hue[idx] = epochPhase * 3.6 + r * 1.4 + filamentA
        }
      }
      return
    }

    if (world === 'tesseract') {
      // Soft ambient Hopf fibration ether backdrop + crisp 4D rotated tesseract + dual
      const wBias = (getWorldEpochPhase('tesseract', cam) * 2 - 1) * Math.PI * 0.85
      const cx = pw * 0.5
      const cy = ph * 0.5
      const scale = Math.min(pw * 0.44, ph * 0.72) * zoom

      // 1. Stereographic Hopf fibration Villarceau rings in S^3 -> R^2
      const numFibers = 16
      const steps = 64
      for (let f = 0; f < numFibers; f++) {
        const eta = 0.42 + (f / numFibers) * 0.85
        const phi0 = (f / numFibers) * Math.PI * 2 + t * 0.22 + wBias * 0.35
        let prevX = 0
        let prevY = 0
        for (let s = 0; s <= steps; s++) {
          const xi = (s / steps) * Math.PI * 2
          const x4 = Math.cos(xi + phi0) * Math.sin(eta)
          const y4 = Math.sin(xi + phi0) * Math.sin(eta)
          const z4 = Math.cos(xi - phi0) * Math.cos(eta)
          const w4 = Math.sin(xi - phi0) * Math.cos(eta)

          // Rotate in XW and YZ
          const ca = Math.cos(t * 0.36 + yaw + wBias)
          const sa = Math.sin(t * 0.36 + yaw + wBias)
          const rx = x4 * ca - w4 * sa
          const rw = x4 * sa + w4 * ca
          const cb = Math.cos(t * 0.28 + pitch + wBias * 0.45)
          const sb = Math.sin(t * 0.28 + pitch + wBias * 0.45)
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
        // XW rotation modulated by scrubbed w-hyperplane
        const a1 = t * 0.42 + yaw + wBias
        const c1 = Math.cos(a1)
        const s1 = Math.sin(a1)
        ;[x, w] = [x * c1 - w * s1, x * s1 + w * c1]
        // YW rotation
        const a2 = t * 0.32 + pitch + wBias * 0.5
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
      const koraPhase = getWorldEpochPhase('kailas', cam)
      const koraRad = koraPhase * Math.PI * 2
      const ca = Math.cos(yaw + koraRad * 0.35 + t * 0.08)
      const sa = Math.sin(yaw + koraRad * 0.35 + t * 0.08)
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
          // Scrubbable pilgrim light-packet locked directly to 0 -> 52 km kora coordinate
          const pilgrimDelta = Math.atan2(Math.sin(phi - koraRad), Math.cos(phi - koraRad))
          const pilgrim =
            Math.exp(-Math.pow(r - (0.92 + 0.08 * Math.sin(koraRad)), 2) * 85) *
            Math.exp(-Math.pow(pilgrimDelta, 2) * 14) *
            1.25

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
      // Relativistic Kerr Event Horizon with scrubbable spin a* in [0, 0.998 M]
      const spin = getWorldEpochPhase('horizon', cam) * 0.998
      const inc = 0.24 + pitch * 0.22
      const dragShift = spin * 0.085
      for (let py = 0; py < ph; py++) {
        const ny = ((py / ph) * 2 - 1) / zoom
        for (let px = 0; px < pw; px++) {
          const nx = (((px / pw) * 2 - 1) * aspect * 0.68) / zoom
          const r = Math.hypot(nx - dragShift, ny)
          const theta = Math.atan2(ny, nx - dragShift)

          const shadowR = 0.37 - spin * 0.045
          // Gravitational bending warp
          const bend = (shadowR * shadowR) / Math.max(0.05, r * r)
          const diskY = ny / Math.max(0.14, inc)
          const diskR = Math.hypot(nx, diskY)

          // Primary equatorial accretion disk
          const swirl =
            0.55 +
            0.45 * Math.sin(Math.atan2(diskY, nx) * (3 + spin * 2) - t * (1.2 + spin * 1.8) + diskR * 9.5) *
              Math.cos(diskR * 14 - t * (1.0 + spin))
          const mainDisk =
            Math.exp(-Math.pow(ny - Math.sin(nx * 2.2 + yaw) * 0.04, 2) * 85) *
            (diskR > shadowR * 0.95 && diskR < 1.35 ? 1 : 0) *
            Math.exp(-(diskR - shadowR) * 1.35) *
            swirl

          // Lensed upper & lower Einstein halo (light bent from back side of disk over poles)
          const haloR = shadowR * (1.18 - spin * 0.05)
          const lensedHalo =
            Math.exp(-Math.pow(r - haloR, 2) * 135) *
            (0.62 + 0.38 * Math.sin(theta * 3 + t * (1.2 + spin * 1.2) + bend * 4))

          // Razor-sharp inner photon ring (sharpens at extremal spin)
          const photonRing = Math.exp(-Math.pow(r - shadowR * 1.01, 2) * (240 + spin * 220)) * (0.8 + spin * 0.4)

          // Relativistic Doppler beaming scales directly with spin a*
          const doppler = 1.0 - nx * (0.08 + spin * 0.42)

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
      const phase = getWorldEpochPhase('ruliad', cam)
      const waveSources = 3 + Math.round(phase * 4) // 3 → 7 causal branch sources
      const freq = 10 + phase * 10
      const branchThickness = 0.28 - phase * 0.12
      for (let py = 0; py < ph; py++) {
        const ny = ((py / ph) * 2 - 1) / zoom
        for (let px = 0; px < pw; px++) {
          const nx = (((px / pw) * 2 - 1) * aspect * 0.72) / zoom
          let wave = 0
          for (let k = 0; k < waveSources; k++) {
            const ang =
              (k / waveSources) * Math.PI * 2 +
              yaw * 0.5 +
              t * (0.1 + phase * 0.12) * (k % 2 ? 1 : -1)
            const ox = Math.cos(ang) * (0.45 + phase * 0.32)
            const oy = Math.sin(ang) * (0.32 + phase * 0.24)
            const d = Math.hypot(nx - ox, ny - oy)
            wave += Math.sin(d * freq - t * (1.6 + phase * 1.4) + k * 1.3) / (0.65 + d * 1.3)
          }
          const caustic = Math.pow(Math.abs(Math.sin(wave * (1.1 + phase * 0.6))), 3.0)
          const branchLine = Math.abs(wave) < branchThickness ? 0.78 : 0
          const envelope = Math.exp(-(nx * nx + ny * ny) * (0.48 - phase * 0.22))
          const val = (caustic * (0.48 + phase * 0.3) + branchLine * 0.55) * envelope
          const idx = py * pw + px
          lum[idx] = Math.min(1, Math.max(0, val))
          hue[idx] = wave * 0.85 + phase * 0.5
        }
      }
      // Overlay crisp multiway causal graph edges (layers grow with rewrite depth)
      const cx = pw * 0.5
      const cy = ph * 0.5
      const rScale = Math.min(pw, ph) * 0.42 * zoom
      const layers = 2 + Math.round(phase * 3) // 2 → 5 causal layers
      for (let layer = 0; layer < layers; layer++) {
        const count = 4 + layer * (2 + Math.round(phase * 2))
        const rad = ((layer + 1) / layers) * 1.04 * rScale
        for (let i = 0; i < count; i++) {
          const a =
            (i / count) * Math.PI * 2 +
            t * (0.12 + phase * 0.14) * (layer % 2 ? 1 : -1) +
            yaw
          const x = cx + Math.cos(a) * rad * 1.35
          const y = cy + Math.sin(a) * rad * 0.88
          this.plot(x, y, 1, layer * 0.7)
          if (layer > 0) {
            const pCount = 4 + (layer - 1) * (2 + Math.round(phase * 2))
            const pRad = (layer / layers) * 1.04 * rScale
            const pa =
              ((i % pCount) / pCount) * Math.PI * 2 +
              t * (0.12 + phase * 0.14) * ((layer - 1) % 2 ? 1 : -1) +
              yaw
            const px2 = cx + Math.cos(pa) * pRad * 1.35
            const py2 = cy + Math.sin(pa) * pRad * 0.88
            this.drawLine(x, y, px2, py2, 0.45 + phase * 0.25, layer * 0.5)
          }
        }
      }
      return
    }

    if (world === 'lorenz') {
      // Lorenz chaotic strange attractor + glowing QR-nullspace orthogonal plane
      // phase: 0 = unprojected KL 0.11 drift, 1 = locked orthogonal QR projection KL 0.0006
      const phase = getWorldEpochPhase('lorenz', cam)
      const drift = 1 - phase
      const cx = pw * 0.5
      const cy = ph * 0.5
      const scale = Math.min(pw * 0.36, ph * 0.56) * zoom
      const ay = yaw + t * (0.28 + drift * 0.22)
      const ax = pitch + 0.35 + drift * 0.18 * Math.sin(t * 0.9)
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

      // Draw orthogonal QR-nullspace protection grid plane (y = 0); sharpens & brightens with phase
      const planeIntensity = 0.08 + phase * 0.44
      const planeHue = -1.2 + phase * 1.8
      for (let g = -5; g <= 5; g++) {
        const u = g * 0.28
        const warp = drift * 0.14 * Math.sin(g * 1.1 + t * 2.1)
        const a = project3D(u, warp, -1.4)
        const b = project3D(u, -warp, 1.4)
        this.drawLine(a.sx, a.sy, b.sx, b.sy, planeIntensity, planeHue)
        const c = project3D(-1.4, warp, u)
        const d = project3D(1.4, -warp, u)
        this.drawLine(c.sx, c.sy, d.sx, d.sy, planeIntensity, planeHue)
      }

      // Draw animated Lorenz trajectories with moving head pulses; unprojected drift adds jitter
      const headA = Math.floor(t * (65 + phase * 25)) % LORENZ_POINTS.length
      const headB = (headA + Math.floor(LORENZ_POINTS.length / 2)) % LORENZ_POINTS.length
      const jitterPt = (pt: [number, number, number], idx: number) => {
        if (drift < 0.01) return project3D(pt[0], pt[1], pt[2])
        const j = drift * 0.16
        return project3D(
          pt[0] + Math.sin(idx * 0.37 + t * 3.1) * j,
          pt[1] + Math.cos(idx * 0.29 - t * 2.7) * j,
          pt[2] + Math.sin(idx * 0.43 + t * 2.3) * j,
        )
      }
      let prev = jitterPt(LORENZ_POINTS[0], 0)
      for (let i = 1; i < LORENZ_POINTS.length; i++) {
        const cur = jitterPt(LORENZ_POINTS[i], i)
        const distA = (headA - i + LORENZ_POINTS.length) % LORENZ_POINTS.length
        const distB = (headB - i + LORENZ_POINTS.length) % LORENZ_POINTS.length
        const pulse = Math.max(
          Math.exp(-distA * 0.045),
          Math.exp(-distB * 0.045),
        )
        const intensity = Math.min(1, cur.depth * (0.48 + phase * 0.16) + pulse * (0.65 + phase * 0.2))
        this.drawLine(prev.sx, prev.sy, cur.sx, cur.sy, intensity, pulse * 2.2 - drift * 0.9)
        prev = cur
      }
      return
    }

    // Default: noosphere: Ethereal Cathedral of Minds (Akashic Lattice)
    // phase: 0 = fundamental mode k=(1,1), 1 = rich Fibonacci harmonic lattice k=(8,13)
    const phase = getWorldEpochPhase('noosphere', cam)
    const modeN = 2 + Math.round(phase * 6) // 2 → 8 angular petals
    const archFreqX = 3.2 + phase * 5.2
    const archFreqY = 2.8 + phase * 4.4
    const harmRadial = 6 + phase * 10
    for (let py = 0; py < ph; py++) {
      const ny = ((py / ph) * 2 - 1) / zoom
      for (let px = 0; px < pw; px++) {
        const nx = (((px / pw) * 2 - 1) * aspect * 0.72) / zoom
        // Cathedral vaulted arches + non-Euclidean resonant lattice
        const r = Math.hypot(nx, ny)
        const z = 1.8 / (0.35 + Math.abs(nx) * 0.75 + Math.abs(ny) * 0.55) - t * (0.5 + phase * 0.4)
        const arch =
          Math.cos(nx * archFreqX + Math.sin(z * 0.9 + yaw) * (0.6 + phase * 0.6)) *
          Math.cos(ny * archFreqY - z * 0.7)
        const harmonic =
          Math.sin(r * harmRadial - t * 1.9 + Math.atan2(ny, nx) * modeN) * 0.5 +
          Math.cos((nx * (2 + phase * 3) - ny * (3 + phase * 3)) * 2.4 + t * 1.2) * 0.5
        const vault = Math.pow(Math.max(0, 1 - Math.abs(arch)), 4.0)
        const node = Math.pow(Math.max(0, harmonic), 4.0 - phase * 1.0) * Math.exp(-r * (0.75 - phase * 0.25))
        const val = vault * (0.55 + phase * 0.22) * Math.exp(-r * 0.35) + node * (0.78 + phase * 0.25)
        const idx = py * pw + px
        lum[idx] = Math.min(1, Math.max(0, val))
        hue[idx] = z * 0.35 + harmonic * (1.1 + phase * 0.6)
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
