/**
 * Grounded local fallback shell + 24-bit TrueColor ANSI & clickable inline command parser.
 *
 * Mirrors the upgraded `rpi5-terminal/server.py` harness (rich box headers, tables,
 * dual e-process sparklines, 5-stop guided tour, essays, timeline, and contextual
 * follow-up suggestions) so interaction is equally rich online or offline.
 */

import { researchRepos } from '../research'
import { WORLD_BY_ID, WORLD_CATALOG, type WorldId } from './etherWorlds'

export type SuggestionItem = {
  label: string
  command: string
}

export type AnsiSpan = {
  text: string
  color?: string
  bold?: boolean
  dim?: boolean
  command?: string
}

export type LocalCommandResult = {
  ansi?: string
  suggestions?: SuggestionItem[]
  clear?: boolean
  portal?: WorldId
  connectUrl?: string
  disconnect?: boolean
}

const R = '\x1b[0m'
const B = '\x1b[1m'
const GOLD = '\x1b[38;2;223;208;178m'
const INK = '\x1b[38;2;220;216;206m'
const BRIGHT = '\x1b[38;2;244;241;234m'
const MUTED = '\x1b[38;2;138;134;126m'
const EMERALD = '\x1b[38;2;126;214;168m'
const CYAN = '\x1b[38;2;132;204;224m'
const AMBER = '\x1b[38;2;232;180;104m'
const CORAL = '\x1b[38;2;226;125;114m'
const VIOLET = '\x1b[38;2;184;164;236m'

const ESC = String.fromCharCode(27)
const SGR_RE = new RegExp(`${ESC}\\[([0-9;]*)m`, 'g')
const CLICKABLE_CMD_PREFIXES = [
  'verify',
  'search ',
  'search',
  'tour',
  'worlds',
  'travel ',
  'research',
  'essays',
  'psychohistory',
  'kailas',
  'nulls',
  'eprocess',
  'qrproj',
  'timeline',
  'status',
  'ls',
  'cat /',
  'help',
  'ask ',
  'reset',
  'clear',
]

function isClickableCommand(candidate: string): boolean {
  const clean = candidate.trim().toLowerCase()
  if (!clean || clean.length > 64) return false
  return CLICKABLE_CMD_PREFIXES.some(
    (prefix) => clean === prefix.trim() || clean.startsWith(prefix),
  )
}

function splitClickableInline(span: AnsiSpan): AnsiSpan[] {
  if (!span.text.includes('`')) return [span]
  const parts = span.text.split('`')
  if (parts.length < 3) return [span]
  const out: AnsiSpan[] = []
  for (let i = 0; i < parts.length; i++) {
    const piece = parts[i]
    if (!piece) continue
    if (i % 2 === 1 && isClickableCommand(piece)) {
      out.push({
        text: piece,
        color: span.color,
        bold: span.bold,
        dim: span.dim,
        command: piece.trim(),
      })
    } else if (i % 2 === 1) {
      out.push({ ...span, text: `\`${piece}\`` })
    } else {
      out.push({ ...span, text: piece })
    }
  }
  return out
}

export function parseAnsi(input: string): AnsiSpan[] {
  const rawSpans: AnsiSpan[] = []
  let color: string | undefined
  let bold = false
  let dim = false
  let lastIndex = 0

  SGR_RE.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = SGR_RE.exec(input)) !== null) {
    if (match.index > lastIndex) {
      rawSpans.push({
        text: input.slice(lastIndex, match.index),
        color,
        bold,
        dim,
      })
    }
    const codes = match[1].split(';').map((c) => Number.parseInt(c || '0', 10))
    let i = 0
    while (i < codes.length) {
      const code = codes[i]
      if (code === 0) {
        color = undefined
        bold = false
        dim = false
      } else if (code === 1) {
        bold = true
      } else if (code === 2) {
        dim = true
      } else if (code === 38 && codes[i + 1] === 2 && i + 4 < codes.length) {
        color = `rgb(${codes[i + 2]}, ${codes[i + 3]}, ${codes[i + 4]})`
        i += 4
      }
      i++
    }
    lastIndex = SGR_RE.lastIndex
  }

  if (lastIndex < input.length) {
    rawSpans.push({ text: input.slice(lastIndex), color, bold, dim })
  }

  // Also detect backtick-wrapped commands that cross color boundaries (e.g. `` `${GOLD}tour${INK}` ``)
  const merged: AnsiSpan[] = []
  let pendingBacktick = false
  let cmdBuffer: AnsiSpan[] = []

  for (const span of rawSpans) {
    const pieces = splitClickableInline(span)
    for (const p of pieces) {
      if (p.command) {
        merged.push(p)
        continue
      }
      if (!pendingBacktick && p.text.endsWith('`') && !p.text.slice(0, -1).includes('`')) {
        const before = p.text.slice(0, -1)
        if (before) merged.push({ ...p, text: before })
        pendingBacktick = true
        cmdBuffer = []
      } else if (pendingBacktick && p.text.startsWith('`')) {
        const combined = cmdBuffer.map((b) => b.text).join('')
        if (isClickableCommand(combined)) {
          merged.push({
            text: combined,
            color: cmdBuffer[0]?.color,
            bold: cmdBuffer[0]?.bold,
            command: combined.trim(),
          })
        } else {
          merged.push({ text: `\`${combined}\``, color: cmdBuffer[0]?.color })
        }
        const after = p.text.slice(1)
        if (after) merged.push({ ...p, text: after })
        pendingBacktick = false
        cmdBuffer = []
      } else if (pendingBacktick) {
        cmdBuffer.push(p)
      } else {
        merged.push(p)
      }
    }
  }
  if (pendingBacktick && cmdBuffer.length) {
    merged.push({ text: '`' })
    merged.push(...cmdBuffer)
  }
  return merged
}

function boxHeader(title: string, subtitle = ''): string {
  const sub = subtitle ? `  ${MUTED}${subtitle}${R}` : ''
  const rule = '─'.repeat(Math.min(70, Math.max(28, title.length + 18)))
  return `${GOLD}${B}╭─ ${title}${R}${sub}\n${MUTED}│${rule}${R}`
}

type CorpusDoc = {
  id: string
  title: string
  ceiling: string
  metrics: string[]
  aliases: string[]
  body: string
  followups: SuggestionItem[]
}

const LOCAL_CORPUS: CorpusDoc[] = [
  {
    id: 'formasec',
    title: 'FormaSec · Security Alignment OS',
    ceiling: 'MachineAttestedReproduction (independent second host pending)',
    metrics: [
      '600/600 structural agreements (Python · Kani Rust · Lean 4)',
      '135/135 byte-exact receipts · 0/552 hostile admissions',
      '20/20 Intel TDX Confidential Space scenarios',
    ],
    aliases: ['formasec', 'containment', 'sandbox', 'landlock', 'lean', 'kani', 'untrusted', 'proposer', 'tdx', 'kernel'],
    body: 'FormaSec pairs untrusted LLM/enumerator search with a tiny deterministic kernel verified across Python, Kani-checked Rust, and Lean 4 (600/600 structural agreements, 135/135 byte-exact receipts, 0/552 hostile admissions) before Linux Landlock runs. Security Alignment OS extends this loop across 20/20 Intel TDX scenarios.',
    followups: [
      { label: 'Inspect sandbox policy', command: 'cat /etc/sandbox.policy' },
      { label: 'Inspect Holdout Ledger', command: 'research holdout-ledger' },
      { label: 'Honest nulls ledger', command: 'nulls' },
      { label: 'Enter 4D Tesseract ✦', command: 'travel tesseract' },
    ],
  },
  {
    id: 'holdout-ledger',
    title: 'Holdout Ledger · Evidence-Bounded AI',
    ceiling: 'simulation-verified (9/9 hypotheses); prospective SWE-bench run preregistered',
    metrics: [
      '0 / 59,200 false certificates under adaptive attack',
      '9/9 pre-registered simulated hypotheses passed',
      'Zero-bit Wald bounds fail 100% under the same attacker',
    ],
    aliases: ['holdout', 'ledger', 'mdl', 'e-process', 'eprocess', 'rsi', 'overfit', 'judge', 'certificate', 'certificates'],
    body: 'Holdout Ledger prices every verdict bit released by a sealed holdout against patch description length (MDL): 0 / 59,200 false certificates across 9/9 pre-registered simulated hypotheses (where zero-bit Wald bounds fail 100% under adaptive attack).',
    followups: [
      { label: 'Run e-process compare', command: 'eprocess compare' },
      { label: 'Inspect ARC Membrane', command: 'research arc-membrane' },
      { label: 'Read Epistemic essay', command: 'essays epistemic' },
      { label: 'Enter Lorenz · QR ✦', command: 'travel lorenz' },
    ],
  },
  {
    id: 'arc-membrane',
    title: 'ARC Membrane (Sovereign Self-Compiling Stack)',
    ceiling: 'Single-A100 study (n=400 MATH-500, Ed25519 receipt pinned); external replication pending',
    metrics: [
      '76.25% sealed MATH-500 (+36.5 pp over 39.75% base, n=400)',
      '180× lower replay KL drift (0.000605 vs 0.1088 unprojected)',
      '1.06×10⁻⁸ max QR orthogonality residual across 844 expert bases',
    ],
    aliases: ['arc', 'membrane', 'qr', 'nullspace', 'moe', 'math500', 'math-500', 'sft', 'drift', 'self-compiling'],
    body: 'On sealed MATH-500 (n=400, Qwen3-30B-A3B), Track 4 single-step steering yields an honest null (-1.0 pp, p=0.644), whereas Track 5 QR-Nullspace Projected SFT across 844 orthogonal bases lifts accuracy from 39.75% to 76.25% (+36.5 pp) while holding replay KL at 0.000605; 180× lower drift than unprojected SFT (0.1088).',
    followups: [
      { label: 'Visualize QR nullspace', command: 'qrproj' },
      { label: 'Enter Lorenz · QR Plane ✦', command: 'travel lorenz' },
      { label: 'Honest nulls ledger', command: 'nulls' },
    ],
  },
  {
    id: 'psychohistory',
    title: 'Psychohistory & Historical Statebook v2',
    ceiling: 'Pure D_real_hold (n=669 across Polymarket & Kalshi); 4/12 P1 & 1/12 P2 cells certified',
    metrics: [
      '1,673 real multi-leg events (1,004 train / 669 hold · 0 overlap)',
      '1,673/1,673 Lean 4 Pinsker + weak-duality + causal macro invariants',
      'Extreme mispricing correction: +0.3822 bits · E_t=1e12 · AUROC 0.9810',
    ],
    aliases: ['psychohistory', 'statebook', 'polymarket', 'kalshi', 'obstruction', 'macro', 'fred', 'markets', 'history', 'seldon'],
    body: 'Psychohistory & Historical Statebook v2 evaluates multi-leg coherence obstructions + causal FRED macro series on strict chronological holdouts (1,673 real events, 0 overlap, 1,673/1,673 Lean 4 invariants). M2 certifies E_t ≥ 20 over M1 on 4/12 cells (pooled extreme mispricing correction +0.3822 bits, E_t=1e12, AUROC 0.9810), while reporting all 8 uncertified/null cells verbatim.',
    followups: [
      { label: 'Full Psychohistory table', command: 'psychohistory' },
      { label: 'Enter Psychohistory ✦', command: 'travel psychohistory' },
      { label: 'Enter Universal History ✦', command: 'travel universal' },
      { label: 'Run e-process compare', command: 'eprocess compare' },
    ],
  },
  {
    id: 'kailas',
    title: 'Kailas Corpus · Spatial Mandala Double Dissociation',
    ceiling: '2,626 blind-labeled passages + 368-window study; blinded scholar handoff active',
    metrics: [
      '2,626 blind-labeled passages across 15+ languages',
      '282 recovered classical Tibetan (ཏི་སེ) & Bon Kangyur passages',
      '368 windows · Krippendorff α=0.86 · p=0.0022',
    ],
    aliases: ['kailas', 'kailash', 'tibet', 'tibetan', 'mandala', 'kora', 'pilgrimage', 'thubron', 'bon', 'sacred'],
    body: 'Across 2,626 blind-labeled passages in 15+ languages (including 282 recovered classical Tibetan ti se and Bon Kangyur passages), a pooled 2-clock Rissanen MDL null split into a Spatial-Mandala φ = f(r) vs. Multi-Temporal double dissociation (368 windows, α=0.86, p=0.0022).',
    followups: [
      { label: 'View Kailas dossier', command: 'kailas' },
      { label: 'Enter Mount Kailas ✦', command: 'travel kailas' },
      { label: 'Read Kailas essay', command: 'essays kailas' },
    ],
  },
  {
    id: 'honest-nulls',
    title: 'Honest Nulls & Self-Caught Confounds',
    ceiling: 'Reported verbatim alongside every positive claim across all active repos',
    metrics: ['6 documented negative results & self-caught confounds'],
    aliases: ['null', 'nulls', 'negative', 'failed', 'confound', 'j-space', 'jspace', 'caduceus', 'pca', 'honest'],
    body: '1) temporal-grid-safety v16 eval-rate confound inflated 60% gain to 95% (caught & fixed).\n2) jspace-pilot norm-matched PCA tied J-space geometry on 7B–8B models.\n3) Caduceus phrase tripwire held 41% of benign skills (kept off).\n4) ARC Membrane Track 4 steering yielded -1.0 pp (p=0.644) before Track 5 QR-SFT succeeded.\n5) Kailas pooled 2-clock null split into spatial φ = f(r) mandala structure.',
    followups: [
      { label: 'View nulls ledger', command: 'nulls' },
      { label: 'Psychohistory v2 table', command: 'psychohistory' },
      { label: 'Start 5-stop tour', command: 'tour' },
    ],
  },
  {
    id: 'public-goods',
    title: 'Gitcoin, Public Goods & Sacred Economics',
    ceiling: 'Operator record + essays (grounded corpus)',
    metrics: ['Layered stack: quadratic matching + retroactive rewards + delegated judgment + Ostrom rules'],
    aliases: ['public', 'goods', 'gitcoin', 'quadratic', 'ostrom', 'dao', 'economics', 'funding', 'commons'],
    body: 'Gitcoin mattered because it turned caring about public goods into allocative power. Durable funding needs a stack: quadratic matching, retroactive rewards, delegated domain judgment, and visible Ostrom-style governance rules.',
    followups: [
      { label: 'Read Sacred Economics', command: 'essays sacred' },
      { label: 'Browse all essays', command: 'essays' },
      { label: 'Enter Noosphere ✦', command: 'travel noosphere' },
    ],
  },
  {
    id: 'about',
    title: 'Shaan Patel · Epistetechnician',
    ceiling: 'Verified CV & working portfolio (shaan4d.xyz)',
    metrics: ['13 research repos + Kailas multilingual corpus + shaanpatel-cv-pico'],
    aliases: ['who', 'shaan', 'patel', 'about', 'bio', 'cv', 'working', 'now', 'background', 'hi', 'hello'],
    body: 'I am Shaan Patel (@Epistetechnician); independent researcher & systems engineer working on formal containment (FormaSec), anytime evaluation integrity (Holdout Ledger, ARC Membrane), mechanistic interpretability audits, and epistemic history/markets (Psychohistory v2, Kailas Corpus).',
    followups: [
      { label: 'Start 5-stop tour', command: 'tour' },
      { label: 'Browse research', command: 'research' },
      { label: 'Open 8 ASCII worlds ✦', command: 'worlds' },
    ],
  },
]

const ESSAYS = [
  {
    slug: 'epistemic',
    title: 'Epistemic Engineering & Anytime Holdouts',
    theme: 'AI Assurance · Evaluation Integrity',
    excerpt:
      'Adaptive self-improving agents silently exhaust static benchmarks. By pricing every verdict bit via Rissanen MDL and Empirical-Bernstein e-processes, evaluation becomes an auditable thermodynamic budget rather than a one-shot leaderboard.',
  },
  {
    slug: 'sacred',
    title: 'Sacred Economics & Durable Public Goods',
    theme: 'Commons · Mechanism Design',
    excerpt:
      'Public goods fail when stewardship is invisible. Durable commons pair quadratic preference discovery, retroactive outcome funding, and Ostrom-legible governance so communities can coordinate capital without capturing the substrate.',
  },
  {
    slug: 'kailas',
    title: 'The Mountain That Decoupled From the Clock',
    theme: 'Humanities · Spatial Geometry',
    excerpt:
      'Across 2,626 multilingual passages and 368 pilgrimage windows, Mount Kailas refuses purely liturgical calendar timing: its phenomenology locks instead to radial kora distance φ = f(r) around a 52 km sacred circuit.',
  },
  {
    slug: 'psychohistory',
    title: 'Historical Statebooks & Collective Belief Obstructions',
    theme: 'Markets · Psychohistory',
    excerpt:
      'Every civilization keeps a ledger of what it expects next. When multi-leg market prices violate global coherence, the geometric obstruction measures real stress in collective belief before resolution arrives.',
  },
]

const TOUR_STOPS = [
  {
    step: 1,
    title: 'Formal Containment & Hardware Attestation',
    body: 'Start at the security boundary: FormaSec pairs untrusted LLM proposers with a tiny deterministic kernel verified across Python, Kani Rust, and Lean 4 (600/600 structural agreements, 0/552 hostile admissions) before Linux Landlock runs. Even this RPi5 terminal obeys the same philosophy: zero bash/sh, read-only rootfs, cap-drop=ALL.',
    next: 'tour 2',
    extra: [
      { label: 'Inspect sandbox policy', command: 'cat /etc/sandbox.policy' },
      { label: 'Ask model about FormaSec', command: 'ask How does FormaSec work with Intel TDX?' },
    ],
  },
  {
    step: 2,
    title: 'Anytime Holdouts & QR-Nullspace Self-Rewriting',
    body: 'How can AI systems improve themselves without overfitting their judge or forgetting safety? Holdout Ledger prices every holdout bit (0/59,200 false certificates), while ARC Membrane Track 5 projects MoE weight updates strictly orthogonal to replay bases (||ΔW_⊥·Q|| ~ 1.06×10⁻⁸), lifting sealed MATH-500 from 39.75% → 76.25% at 180× lower drift.',
    next: 'tour 3',
    extra: [
      { label: 'Run e-process compare', command: 'eprocess compare' },
      { label: 'Enter Lorenz · QR ✦', command: 'travel lorenz' },
    ],
  },
  {
    step: 3,
    title: 'Honest Nulls & Epistemic Rigor',
    body: 'Progress requires reporting what broke: the v16 eval-rate confound (95% → 60%), norm-matched PCA tying J-space geometry on 7B–8B models, Caduceus holding 41% of benign skills, and ARC Track 4’s −1.0 pp null. Every negative result directly shaped the architecture that followed.',
    next: 'tour 4',
    extra: [
      { label: 'Full Honest Nulls ledger', command: 'nulls' },
      { label: 'Ask what failed', command: 'ask Which negative result changed your architecture most?' },
    ],
  },
  {
    step: 4,
    title: 'Human Psychohistory & Sacred Spatial Geometry',
    body: 'Beyond silicon: Psychohistory v2 tests multi-leg Polymarket+Kalshi obstructions across 1,673 real events (AUROC 0.9810, E_t=1e12 on extreme mispricing correction), while the Kailas Corpus uncovers a spatial-mandala φ = f(r) double dissociation across 2,626 blind-labeled passages in 15+ languages.',
    next: 'tour 5',
    extra: [
      { label: 'Psychohistory v2 table', command: 'psychohistory' },
      { label: 'Enter Mount Kailas ✦', command: 'travel kailas' },
    ],
  },
  {
    step: 5,
    title: 'Step Into the Multidimensional Ether',
    body: 'Eight real-time high-resolution 2×4 Braille / dense ASCII worlds connect human psychohistory to universal cosmic deep time, from 10⁻⁴³ s Planck foam to 10⁴⁰ yr black holes, 4D Hopf fibrations, Kerr lensing, and the Ruliad branchial ether.',
    next: 'worlds',
    extra: [
      { label: 'Enter Universal History ✦', command: 'travel universal' },
      { label: 'Enter 4D Tesseract ✦', command: 'travel tesseract' },
      { label: 'Enter Kerr Horizon ✦', command: 'travel horizon' },
    ],
  },
]

const WORLD_ALIASES: Record<string, WorldId> = {
  '1': 'psychohistory',
  '2': 'universal',
  '3': 'tesseract',
  '4': 'kailas',
  '5': 'horizon',
  '6': 'ruliad',
  '7': 'lorenz',
  '8': 'noosphere',
  history: 'universal',
  universe: 'universal',
  cosmic: 'universal',
  '4d': 'tesseract',
  hypercube: 'tesseract',
  blackhole: 'horizon',
  kerr: 'horizon',
  gargantua: 'horizon',
  mandala: 'kailas',
  kailash: 'kailas',
  chaos: 'lorenz',
  mind: 'noosphere',
  ether: 'noosphere',
}

export const SHELL_COMMANDS = [
  'verify',
  'verify arc-membrane',
  'verify psychohistory',
  'verify holdout-ledger',
  'verify track-b',
  'verify formasec',
  'verify kailas-corpus',
  'search',
  'search --essays',
  'search --research',
  'search --kailas',
  'tour',
  'help',
  'ask',
  'worlds',
  'travel',
  'research',
  'essays',
  'nulls',
  'psychohistory',
  'kailas',
  'eprocess compare',
  'eprocess signal',
  'eprocess null',
  'qrproj',
  'timeline',
  'status',
  'ls',
  'cat /etc/sandbox.policy',
  'cat /corpus/psychohistory.v2',
  'cat /corpus/kailas.mandala',
  'reset',
  'connect',
  'disconnect',
  'clear',
  ...WORLD_CATALOG.map((w) => `travel ${w.id}`),
  ...WORLD_CATALOG.map((w) => w.id),
]

export const DEFAULT_SUGGESTIONS: SuggestionItem[] = [
  { label: 'Verify Ed25519 receipts', command: 'verify' },
  { label: 'Search corpus (QR nullspace)', command: 'search QR nullspace replay KL' },
  { label: 'Start 5-stop tour', command: 'tour' },
  { label: '✦ Universal History', command: 'travel universal' },
]

const VIRTUAL_FS: Record<string, string> = {
  '/README.md':
    'SPATEL // ETHER SANDBOX\nInteract with Shaan Patel’s personal model, run `tour` for a 5-stop walkthrough, inspect verified research & honest nulls, run live `eprocess compare` / `qrproj` tools, or enter 8 high-resolution multidimensional ASCII worlds (`worlds`).',
  '/etc/sandbox.policy':
    'SANDBOX CONTAINMENT POLICY\nshell_exec     : DISABLED (zero bash/sh/subprocess)\nfilesystem     : READ-ONLY VIRTUAL TREE\ncontainer_rpi5 : --read-only --cap-drop=ALL --security-opt=no-new-privileges\nresource_caps  : --pids-limit=64 --memory=256m --cpus=1.0 uid=10001\nrate_limit     : 48 cmds/min · 12 LLM queries/min per IP · 512B max line',
  '/corpus/psychohistory.v2':
    'PSYCHOHISTORY & HISTORICAL STATEBOOK v2 (Pure D_real_hold)\nEvents         : 1,673 real (1,004 train / 669 hold · 0 overlap)\nLean 4 checks  : 1,673 / 1,673 (100.0%) Pinsker + weak-duality + causal macro\nP1 Certified   : pooled high_resolution_surprise (+0.1721b, E_t=3.43e6)\n                 pooled extreme_mispricing_correction (+0.3822b, E_t=1e12, AUROC 0.9810)\n                 polymarket_only extreme_mispricing (+0.1091b, E_t=6.50e5)\n                 kalshi_only extreme_mispricing (+1.1023b, E_t=1e12)\nP2 Certified   : pooled delayed_settlement_median (+0.0152b, E_t=36.79)\nHonest Nulls   : 8/12 P1 cells & 11/12 P2 cells reported verbatim',
  '/corpus/kailas.mandala':
    'KAILAS CORPUS: SPATIAL MANDALA DOUBLE DISSOCIATION\nPassages: 2,626 blind-labeled across 15+ languages\nRecovered: 282 classical Tibetan (ཏི་སེ) & Bon Kangyur passages\nPilgrimage: 368 windows · α=0.86 · p=0.0022 (spatial φ=f(r) vs calendar clocks)\nThubron kora: 48 episodes · 20.0% strict / 34.3% loose route-aligned phase',
}

const INJECTION_RE = /(;|&&|\|\||`|\$\(|>\s*\/|<\s*\/|\brm\s+-rf\b|\bchmod\b|\bbash\b|\b\/bin\/sh\b)/

function retrieveLocal(query: string): CorpusDoc[] {
  const q = query.toLowerCase()
  const tokens = q.split(/[^a-z0-9-]+/).filter((t) => t.length > 2)
  const scored = LOCAL_CORPUS.map((doc) => {
    let score = 0
    for (const a of doc.aliases) {
      if (q.includes(a)) score += 3.5
    }
    const hay = `${doc.title} ${doc.body} ${doc.metrics.join(' ')}`.toLowerCase()
    for (const tok of tokens) {
      if (hay.includes(tok)) score += 1.2
    }
    return { doc, score }
  }).sort((a, b) => b.score - a.score)

  if (scored[0].score <= 0) {
    return [LOCAL_CORPUS[LOCAL_CORPUS.length - 1]]
  }
  return scored.filter((s) => s.score >= scored[0].score * 0.55).slice(0, 2).map((s) => s.doc)
}

export function resolveWorldId(input: string): WorldId | null {
  const clean = input.trim().toLowerCase()
  if (clean in WORLD_BY_ID) return clean as WorldId
  if (clean in WORLD_ALIASES) return WORLD_ALIASES[clean]
  return null
}

export function executeLocalCommand(
  rawLine: string,
  wsUrl: string,
): LocalCommandResult {
  const line = rawLine.trim()
  if (!line) return {}
  if (line.length > 512) {
    return {
      ansi: `${CORAL}[sandbox]${R} input rejected: exceeds 512-byte containment bound.\n`,
    }
  }
  if (INJECTION_RE.test(line) && !line.toLowerCase().startsWith('ask ')) {
    return {
      ansi:
        `${AMBER}[sandbox-containment]${R} shell metacharacters / exec probes are inert here.\n` +
        `${MUTED}Zero /bin/sh or subprocess exists in this runtime. Run \`${GOLD}cat /etc/sandbox.policy${MUTED}\`.${R}\n`,
      suggestions: [
        { label: 'Inspect sandbox policy', command: 'cat /etc/sandbox.policy' },
        { label: 'Start guided tour', command: 'tour' },
      ],
    }
  }

  const parts = line.split(/\s+/)
  const cmd = parts[0].toLowerCase()
  const args = parts.slice(1)

  if (cmd === 'clear' || cmd === 'cls') return { clear: true }

  if (cmd === 'reset') {
    return {
      ansi: `${EMERALD}Session context reset.${R} Ready for a fresh exploration thread.\n`,
      suggestions: DEFAULT_SUGGESTIONS,
    }
  }

  if (cmd === 'connect') {
    const target = args[0]?.trim() || wsUrl
    return {
      connectUrl: target,
      ansi: `${CYAN}Dialing RPi5 sandboxed terminal -> ${GOLD}${target}${R} ...\n`,
    }
  }

  if (cmd === 'disconnect') {
    return {
      disconnect: true,
      ansi: `${MUTED}Disconnected from remote RPi5 socket. Local grounded sandbox active.${R}\n`,
    }
  }

  if (cmd === 'help' || cmd === '?') {
    return {
      ansi: [
        boxHeader('COMMAND INDEX', 'click any highlighted `command` or type naturally'),
        `  ${GOLD}<any question>${R}        Talk to Shaan's personal model (live RPi5 or grounded RAG)`,
        `  \`${GOLD}verify${R}\`               Live SHA-256 / Ed25519 receipt check (\`arc-membrane\`, \`psychohistory\`, \`holdout-ledger\`)`,
        `  ${GOLD}search <query>${R}        Full-text search across essays, research & Kailas (\`--essays|--research|--kailas\`)`,
        `  \`${GOLD}tour${R}\`                 Guided 5-stop walkthrough of work, nulls, math & worlds`,
        `  \`${GOLD}worlds${R}\`               Catalog of 8 high-resolution multidimensional ASCII portals`,
        `  ${GOLD}travel <world>${R}        Enter a world (\`psychohistory\`, \`universal\`, \`tesseract\`, \`kailas\`,`,
        '                        `horizon`, `ruliad`, `lorenz`, `noosphere`)',
        `  \`${GOLD}research${R}\`             Dossier cards across all ${researchRepos.length} verified research repos`,
        `  \`${GOLD}essays${R}\`               Read curated essay theses (\`epistemic\`, \`sacred\`, \`kailas\`, \`psychohistory\`)`,
        `  \`${GOLD}psychohistory${R}\`        Full venue-stratified Psychohistory v2 results table`,
        `  \`${GOLD}kailas${R}\`               Kailas spatial-mandala φ=f(r) double dissociation`,
        `  \`${GOLD}nulls${R}\`                Honest negative results & self-caught confounds ledger`,
        `  \`${GOLD}eprocess compare${R}\`     Live anytime Empirical-Bernstein e-process simulation`,
        `  \`${GOLD}qrproj${R}\`               ARC Membrane Track 5 QR-nullspace drift breakdown`,
        `  \`${GOLD}timeline${R}\`             Scale ladder from human psychohistory to universal time`,
        `  \`${GOLD}status${R}\` / \`${GOLD}ls${R}\`       Telemetry & read-only virtual corpus`,
      ].join('\n') + '\n',
      suggestions: DEFAULT_SUGGESTIONS,
    }
  }

  if (cmd === 'verify') {
    const repo = (args[0] || 'all').toLowerCase()
    const rows = [
      boxHeader('PINNED CRYPTOGRAPHIC RECEIPTS (LOCAL FALLBACK)', 'connect to RPi5 for live Ed25519+SHA256 replay'),
      `  ${EMERALD}✓${R} ${GOLD}arc-membrane${R}     Ed25519+SHA256  ${CYAN}20cd04d3362929a9${R}  ${MUTED}Track 5 MATH-500 (305/400 = 76.25%, KL=0.000605)${R}`,
      `  ${EMERALD}✓${R} ${GOLD}psychohistory${R}    SHA256-canon    ${CYAN}46cf0c111c0e4769${R}  ${MUTED}1,673 real events · frozen split 529523bc4dd6 · 0 overlap${R}`,
      `  ${EMERALD}✓${R} ${GOLD}holdout-ledger${R}   SHA256-file     ${CYAN}8aef95dbe960abe7${R}  ${MUTED}59,200 confirmatory runs · 0/59,200 false certs · H1–H9 PASS${R}`,
      `  ${EMERALD}✓${R} ${GOLD}track-b${R}          SHA256-chain    ${CYAN}3e1203687fe7491d${R}  ${MUTED}12-link hash chain · Lean 4 26 theorems (0 sorry) · 2/2 tamper blocked${R}`,
      `  ${EMERALD}✓${R} ${GOLD}formasec${R}         zkLean+SHA256   ${CYAN}51c5c7cd1323e83a${R}  ${MUTED}SAO Landlock/broker contracts + zkLean/1 certificate${R}`,
      `  ${EMERALD}✓${R} ${GOLD}kailas-corpus${R}    SHA256-canon    ${CYAN}1e1a6fc1217d6713${R}  ${MUTED}v3 coding receipt · 54-episode blind pack · 0 quarantine leaks${R}`,
      '',
      `  ${MUTED}Target \`${repo}\` · Run \`${GOLD}connect ${wsUrl}${MUTED}\` to execute live byte-level verification on Raspberry Pi 5.${R}`,
    ]
    return {
      ansi: rows.join('\n') + '\n',
      suggestions: [
        { label: 'Reconnect RPi5', command: `connect ${wsUrl}` },
        { label: 'Search corpus', command: 'search QR nullspace replay KL' },
        { label: '✦ Universal History', command: 'travel universal' },
      ],
    }
  }

  if (cmd === 'search' || cmd === 'find' || cmd === 'grep') {
    const q = args.filter((a) => !a.startsWith('-')).join(' ').trim()
    if (!q) {
      return {
        ansi:
          boxHeader('CORPUS SEARCH (LOCAL FALLBACK)', 'live SQLite FTS5 runs on RPi5 /data mount') +
          `\n  ${INK}Usage: \`${GOLD}search <query>${INK}\` (on Pi 5, searches 4,327 indexed chunks across essays, research & Kailas).${R}\n`,
        suggestions: [
          { label: 'Search: QR nullspace', command: 'search QR nullspace' },
          { label: 'Search: Kailas mandala', command: 'search Kailas mandala' },
          { label: 'Verify receipts', command: 'verify' },
        ],
      }
    }
    const docs = retrieveLocal(q)
    const lines = [
      boxHeader(`SEARCH (LOCAL): ${q}`, 'connect to RPi5 for full 4,327-chunk SQLite FTS5 index'),
      ...docs.map(
        (d) =>
          `  ${CYAN}[LOCAL]${R} ${BRIGHT}${d.title}${R}\n    ${MUTED}locator :${R} ${GOLD}corpus:${d.id}${R}\n    ${INK}${d.body}${R}`,
      ),
    ]
    return {
      ansi: lines.join('\n') + '\n',
      suggestions: [
        { label: 'Reconnect RPi5 for FTS5', command: `connect ${wsUrl}` },
        { label: 'Verify receipts', command: 'verify' },
      ],
    }
  }

  if (cmd === 'tour') {
    const rawNum = Number.parseInt(args[0] || '1', 10)
    const idx = Number.isFinite(rawNum) ? Math.max(1, Math.min(TOUR_STOPS.length, rawNum)) : 1
    const stop = TOUR_STOPS[idx - 1]
    const dots = TOUR_STOPS.map((_, i) => (i < idx ? '●' : '○')).join('')
    const nextLabel = idx < TOUR_STOPS.length ? `Next stop (${idx + 1}/5) →` : 'Explore all 8 worlds ✦'
    return {
      ansi: [
        boxHeader(`GUIDED TOUR · STOP ${idx}/5 · ${stop.title}`, dots),
        `${INK}${stop.body}${R}`,
      ].join('\n') + '\n',
      suggestions: [{ label: nextLabel, command: stop.next }, ...stop.extra],
    }
  }

  if (cmd === 'worlds' || cmd === 'portals' || cmd === 'ether') {
    const rows = [
      boxHeader('MULTIDIMENSIONAL ASCII PORTALS', '2×4 Braille · 68-char ASCII · Half-Block'),
      `${MUTED}Click any \`${GOLD}travel <id>${MUTED}\` below (or any ✦ chip). Inside: drag=orbit, scroll=zoom, [m]=mode, [p]=palette.${R}`,
      '',
      ...WORLD_CATALOG.map(
        (w) =>
          `  ${CYAN}[0${w.index}]${R} ${GOLD}${B}${w.id.padEnd(14)}${R} ${BRIGHT}${w.name}${R}  ${MUTED}→ \`${CYAN}travel ${w.id}${MUTED}\`${R}\n` +
          `       ${AMBER}${w.span}${R}\n` +
          `       ${INK}${w.summary}${R}`,
      ),
    ]
    return {
      ansi: rows.join('\n') + '\n',
      suggestions: [
        { label: '✦ Universal History', command: 'travel universal' },
        { label: '✦ Psychohistory', command: 'travel psychohistory' },
        { label: '✦ 4D Tesseract', command: 'travel tesseract' },
        { label: '✦ Mount Kailas', command: 'travel kailas' },
      ],
    }
  }

  if (cmd === 'travel' || cmd === 'enter' || cmd === 'portal' || cmd === 'go' || cmd === 'warp') {
    const target = args[0] || 'universal'
    const worldId = resolveWorldId(target)
    if (!worldId) {
      return {
        ansi: `${AMBER}Unknown world '${target}'.${R} Try: ${GOLD}${WORLD_CATALOG.map((w) => w.id).join(', ')}${R}\n`,
      }
    }
    const meta = WORLD_BY_ID[worldId]
    return {
      portal: worldId,
      ansi: `${EMERALD}✦ Opening portal -> ${GOLD}${B}${meta.name}${R} ${MUTED}(${meta.span})${R}\n`,
    }
  }

  if (cmd === 'status' || cmd === 'pi' || cmd === 'telemetry') {
    return {
      ansi: [
        boxHeader('SANDBOX TELEMETRY (LOCAL FALLBACK)', 'click status pill to dial RPi5'),
        `  ${MUTED}rpi5 endpoint :${R} ${CYAN}${wsUrl}${R}`,
        `  ${MUTED}connection    :${R} ${AMBER}offline fallback (run \`connect ${wsUrl}\` to retry)${R}`,
        `  ${MUTED}model         :${R} ${GOLD}grounded corpus RAG (switches to live shaanpatel-cv-pico on Pi)${R}`,
        `  ${MUTED}containment   :${R} ${EMERALD}zero-shell · read-only · browser-isolated${R}`,
      ].join('\n') + '\n',
      suggestions: [
        { label: 'Reconnect RPi5', command: `connect ${wsUrl}` },
        { label: 'Inspect sandbox policy', command: 'cat /etc/sandbox.policy' },
        { label: 'Start guided tour', command: 'tour' },
      ],
    }
  }

  if (cmd === 'research' || cmd === 'repos') {
    if (args.length > 0) {
      const q = args.join(' ').toLowerCase()
      const hit =
        researchRepos.find(
          (r) =>
            r.slug.toLowerCase().includes(q) ||
            r.name.toLowerCase().includes(q) ||
            r.tagline.toLowerCase().includes(q),
        ) ?? researchRepos[0]
      return {
        ansi: [
          boxHeader(hit.name, `[${hit.slug}]`),
          `${INK}${hit.headline}${R}`,
          '',
          `${GOLD}Verified metrics:${R}`,
          ...hit.results.slice(0, 4).map((x) => `  ${EMERALD}▸${R} ${BRIGHT}${x.value}${R} ${MUTED}: ${x.label}${R}`),
          '',
          `  ${MUTED}evidence ceiling :${R} ${AMBER}${hit.notShown}${R}`,
        ].join('\n') + '\n',
        suggestions: [
          { label: 'Ask model about this repo', command: `ask Explain ${hit.name} and its main limitation.` },
          { label: 'All research repos', command: 'research' },
          { label: 'Honest nulls ledger', command: 'nulls' },
        ],
      }
    }
    const list = [
      boxHeader(`VERIFIED RESEARCH MONOGRAPH (${researchRepos.length} REPOS)`, 'click any `research <slug>`'),
      ...researchRepos.map(
        (r) =>
          `  ${CYAN}▸${R} \`${GOLD}research ${r.slug}${R}\`  ${BRIGHT}${r.name}${R}\n    ${MUTED}${r.results[0]?.value ?? ''}: ${r.results[0]?.label ?? r.tagline}${R}`,
      ),
    ]
    return {
      ansi: list.join('\n') + '\n',
      suggestions: [
        { label: 'ARC Membrane', command: 'research arc-membrane' },
        { label: 'FormaSec', command: 'research formasec' },
        { label: 'Holdout Ledger', command: 'research holdout-ledger' },
        { label: 'Honest nulls', command: 'nulls' },
      ],
    }
  }

  if (cmd === 'essays' || cmd === 'writings' || cmd === 'read') {
    if (args.length > 0) {
      const q = args[0].toLowerCase()
      const hit = ESSAYS.find((e) => e.slug.includes(q) || e.title.toLowerCase().includes(q)) ?? ESSAYS[0]
      return {
        ansi: [
          boxHeader(hit.title, hit.theme),
          `${INK}${hit.excerpt}${R}`,
        ].join('\n') + '\n',
        suggestions: [
          { label: 'Ask model to expand', command: `ask Expand on your thesis in '${hit.title}'.` },
          { label: 'Browse all essays', command: 'essays' },
          { label: 'Browse research', command: 'research' },
        ],
      }
    }
    return {
      ansi: [
        boxHeader('ESSAYS & WORKING THESES', 'click any `essays <slug>` to expand'),
        ...ESSAYS.map(
          (e) =>
            `  ${VIOLET}◆${R} \`${GOLD}essays ${e.slug}${R}\`  ${BRIGHT}${e.title}${R}  ${MUTED}(${e.theme})${R}\n    ${INK}${e.excerpt}${R}`,
        ),
      ].join('\n') + '\n',
      suggestions: ESSAYS.map((e) => ({ label: e.title.split('&')[0].trim(), command: `essays ${e.slug}` })),
    }
  }

  if (cmd === 'nulls' || cmd === 'failures' || cmd === 'confounds') {
    const doc = LOCAL_CORPUS.find((d) => d.id === 'honest-nulls')!
    return {
      ansi: [
        boxHeader('HONEST NULLS & SELF-CAUGHT CONFOUNDS', 'reported verbatim alongside every positive claim'),
        `${INK}${doc.body}${R}`,
      ].join('\n') + '\n',
      suggestions: doc.followups,
    }
  }

  if (cmd === 'psychohistory') {
    return {
      ansi: [
        boxHeader('PSYCHOHISTORY & HISTORICAL STATEBOOK v2', 'Pure D_real_hold · n=669 · 0 overlap'),
        `  ${MUTED}Invariants:${R} ${EMERALD}1,673 / 1,673 Lean 4 Pinsker + weak-duality + causal FRED macro${R}`,
        `  ${MUTED}Perm check:${R} ${CYAN}max permutation E_t = 10.68 (< 20 across all 12 cells)${R}`,
        '',
        `  ${GOLD}${'VIEW / TARGET'.padEnd(40)} ${'ΔBITS'.padStart(8)} ${'AUROC'.padStart(7)} ${'E_t'.padStart(10)}  STATUS${R}`,
        `  ${MUTED}${'─'.repeat(78)}${R}`,
        `  ${INK}${'pooled · extreme_mispricing_correction'.padEnd(40)}${R} ${EMERALD}${'+0.3822'.padStart(8)}${R} ${BRIGHT}${'0.9810'.padStart(7)}${R} ${GOLD}${'1.00e+12'.padStart(10)}${R}  ${EMERALD}CERTIFIED${R}`,
        `  ${INK}${'pooled · high_resolution_surprise'.padEnd(40)}${R} ${EMERALD}${'+0.1721'.padStart(8)}${R} ${BRIGHT}${'0.7690'.padStart(7)}${R} ${GOLD}${'3.43e+06'.padStart(10)}${R}  ${EMERALD}CERTIFIED${R}`,
        `  ${INK}${'polymarket · extreme_mispricing'.padEnd(40)}${R} ${EMERALD}${'+0.1091'.padStart(8)}${R} ${BRIGHT}${'0.8121'.padStart(7)}${R} ${GOLD}${'6.50e+05'.padStart(10)}${R}  ${EMERALD}CERTIFIED${R}`,
        `  ${INK}${'kalshi · extreme_mispricing'.padEnd(40)}${R} ${EMERALD}${'+1.1023'.padStart(8)}${R} ${BRIGHT}${'0.9749'.padStart(7)}${R} ${GOLD}${'1.00e+12'.padStart(10)}${R}  ${EMERALD}CERTIFIED${R}`,
        `  ${INK}${'pooled P2 · delayed_settlement_median'.padEnd(40)}${R} ${CYAN}${'+0.0152'.padStart(8)}${R} ${BRIGHT}${'--'.padStart(7)}${R} ${GOLD}${'36.79'.padStart(10)}${R}  ${EMERALD}CERTIFIED${R}`,
        `  ${MUTED}${'remaining 8/12 P1 & 11/12 P2 cells'.padEnd(40)} ${'mixed/0'.padStart(8)} ${'--'.padStart(7)} ${'< 20'.padStart(10)}  ${AMBER}HONEST NULL${R}`,
        '',
        `  ${MUTED}Fly over the live 3D obstruction manifold with \`${CYAN}travel psychohistory${MUTED}\`.${R}`,
      ].join('\n') + '\n',
      suggestions: [
        { label: '✦ Enter Psychohistory', command: 'travel psychohistory' },
        { label: 'Run e-process compare', command: 'eprocess compare' },
        { label: 'Inspect Kailas Corpus', command: 'kailas' },
      ],
    }
  }

  if (cmd === 'kailas' || cmd === 'kailash' || cmd === 'mandala') {
    return {
      ansi: [
        boxHeader('KAILAS CORPUS: SPATIAL MANDALA φ = f(r)', '2,626 passages · 15+ languages'),
        `  ${EMERALD}▸${R} ${BRIGHT}282 recovered classical Tibetan (ཏི་སེ) & Bon Kangyur passages${R}`,
        `  ${EMERALD}▸${R} ${BRIGHT}368-window pilgrimage coding${R} ${MUTED}(Krippendorff α = 0.86, p = 0.0022)${R}`,
        `  ${EMERALD}▸${R} ${BRIGHT}Double dissociation:${R} ${INK}Hajj & Holy Land lock to calendar clocks; Kailas locks to spatial kora phase φ = f(r).${R}`,
        `  ${EMERALD}▸${R} ${BRIGHT}Thubron 48-episode kora:${R} ${INK}20.0% strict / 34.3% loose route-aligned mandala phase.${R}`,
        '',
        `  ${MUTED}Enter the 3D spatial mandala renderer with \`${CYAN}travel kailas${MUTED}\`.${R}`,
      ].join('\n') + '\n',
      suggestions: [
        { label: '✦ Enter Mount Kailas', command: 'travel kailas' },
        { label: 'Read Kailas essay', command: 'essays kailas' },
        { label: '✦ Enter Universal History', command: 'travel universal' },
      ],
    }
  }

  if (cmd === 'eprocess' || cmd === 'holdout' || cmd === 'e-process') {
    const mode = args[0]?.toLowerCase() || 'compare'
    const sparks = '▁▂▃▄▅▆▇█'
    const sim = (mu: number) => {
      let eVal = 1.0
      const lam = 0.45
      const series: number[] = []
      let certStep: number | null = null
      for (let step = 1; step <= 40; step++) {
        const u1 = Math.max(1e-6, Math.random())
        const u2 = Math.random()
        const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
        const x = Math.max(-1, Math.min(1, mu + z * 0.34))
        eVal = Math.max(0.01, Math.min(1e6, eVal * Math.exp(lam * x - 0.5 * lam * lam * (x * x + 0.08))))
        series.push(Math.log10(Math.max(eVal, 0.05)))
        if (certStep === null && eVal >= 20) certStep = step
      }
      const lo = Math.min(...series)
      const hi = Math.max(...series)
      const span = Math.max(hi - lo, 1e-6)
      const bar = series.map((v) => sparks[Math.min(7, Math.floor(((v - lo) / span) * 7.99))]).join('')
      return { bar, eVal, certStep }
    }
    const modes: [string, number][] =
      mode === 'compare' ? [['null', 0.0], ['signal', 0.16]] : [[mode, mode === 'null' ? 0.0 : 0.16]]
    const out = [boxHeader('ANYTIME EMPIRICAL-BERNSTEIN E-PROCESS', 'α = 0.05 · threshold E_t ≥ 20')]
    for (const [label, mu] of modes) {
      const { bar, eVal, certStep } = sim(mu)
      const verdict =
        certStep !== null
          ? `${EMERALD}CERTIFIED @ step ${certStep} (E_t=${eVal.toFixed(2)})${R}`
          : `${AMBER}HELD / NULL SAFE (E_t=${eVal.toFixed(2)} < 20)${R}`
      out.push(`  ${CYAN}${label.padEnd(7)}${R} ${GOLD}${bar}${R}`)
      out.push(`          ${verdict}`)
    }
    out.push(`\n  ${MUTED}Click \`${GOLD}eprocess compare${MUTED}\` to re-roll fresh martingale draws.${R}`)
    return {
      ansi: out.join('\n') + '\n',
      suggestions: [
        { label: 'Re-roll e-process compare', command: 'eprocess compare' },
        { label: 'Inspect Holdout Ledger', command: 'research holdout-ledger' },
        { label: 'Psychohistory v2 table', command: 'psychohistory' },
      ],
    }
  }

  if (cmd === 'qrproj' || cmd === 'qr' || cmd === 'nullspace') {
    return {
      ansi: [
        boxHeader('ARC MEMBRANE TRACK 5: QR-NULLSPACE PROJECTION', '844 MoE expert bases'),
        `  ${MUTED}Projection :${R} ${CYAN}ΔW_⊥ = ΔW − (ΔW · Q) · Qᵀ${R}`,
        `  ${MUTED}Orthogonal :${R} ${EMERALD}||ΔW_⊥ · Q||_max = 1.06 × 10⁻⁸${R}`,
        '',
        `  ${GOLD}Sealed MATH-500 (n=400)${R}  ${MUTED}Base      ${R} ${AMBER}███████████████░░░░░░░░░░░░░░░${R} ${INK}39.75%${R}`,
        `                           ${MUTED}Track 5 QR${R} ${EMERALD}██████████████████████████████${R} ${BRIGHT}76.25% (+36.5 pp)${R}`,
        `  ${GOLD}Protected Replay KL    ${R}  ${MUTED}Unproj SFT${R} ${CORAL}████████████████████████████░░${R} ${INK}0.1088${R}`,
        `                           ${MUTED}Track 5 QR${R} ${EMERALD}▏                             ${R} ${EMERALD}0.000605 (180× lower)${R}`,
        '',
        `  ${MUTED}Visualize the invariant plane in 3D with \`${CYAN}travel lorenz${MUTED}\`.${R}`,
      ].join('\n') + '\n',
      suggestions: [
        { label: '✦ Enter Lorenz · QR Plane', command: 'travel lorenz' },
        { label: 'Inspect ARC Membrane', command: 'research arc-membrane' },
      ],
    }
  }

  if (cmd === 'timeline') {
    return {
      ansi: [
        boxHeader('SCALE LADDER: HUMAN PSYCHOHISTORY TO UNIVERSAL HISTORY'),
        `  ${VIOLET}10⁻⁴³ s${R}   ${BRIGHT}Planck Foam & Inflation${R}        ${MUTED}→ \`${CYAN}travel universal${MUTED}\`${R}`,
        `  ${CYAN}380 kyr${R}   ${BRIGHT}CMB Last Scattering (3,000 K)${R}  ${MUTED}→ \`${CYAN}travel horizon${MUTED}\`${R}`,
        `  ${AMBER}3000 BCE${R}  ${BRIGHT}Sumerian Ledgers & Statebooks${R}  ${MUTED}→ \`${CYAN}travel psychohistory${MUTED}\`${R}`,
        `  ${GOLD}500 BCE${R}   ${BRIGHT}Kailas Spatial Mandala Texts${R}   ${MUTED}→ \`${CYAN}travel kailas${MUTED}\`${R}`,
        `  ${EMERALD}2026 CE${R}   ${BRIGHT}Epistemic Engineering & Ruliad${R} ${MUTED}→ \`${CYAN}travel ruliad${MUTED}\`${R}`,
        `  ${VIOLET}10⁴⁰ yr${R}   ${BRIGHT}Kerr Black Hole Degenerate Era${R} ${MUTED}→ \`${CYAN}travel noosphere${MUTED}\`${R}`,
      ].join('\n') + '\n',
      suggestions: [
        { label: '✦ Universal History', command: 'travel universal' },
        { label: '✦ Psychohistory', command: 'travel psychohistory' },
        { label: '✦ Mount Kailas', command: 'travel kailas' },
        { label: '✦ Kerr Horizon', command: 'travel horizon' },
      ],
    }
  }

  if (cmd === 'ls' || cmd === 'dir' || cmd === 'tree') {
    return {
      ansi: [
        boxHeader('READ-ONLY VIRTUAL FILESYSTEM', 'click any `cat <path>` to read'),
        ...Object.keys(VIRTUAL_FS).map((p) => `  ${CYAN}▸${R} \`${GOLD}cat ${p}${R}\``),
      ].join('\n') + '\n',
      suggestions: [
        { label: 'Read sandbox policy', command: 'cat /etc/sandbox.policy' },
        { label: 'Read psychohistory.v2', command: 'cat /corpus/psychohistory.v2' },
        { label: 'Read kailas.mandala', command: 'cat /corpus/kailas.mandala' },
      ],
    }
  }

  if (cmd === 'cat') {
    const rawPath = args[0]
    if (!rawPath) {
      return { ansi: `${MUTED}Usage: \`${GOLD}cat /etc/sandbox.policy${MUTED}\` (run \`${GOLD}ls${MUTED}\` for files)${R}\n` }
    }
    if (rawPath.includes('..')) {
      return { ansi: `${AMBER}[sandbox-containment]${R} path traversal blocked.\n` }
    }
    const norm = rawPath.startsWith('/') ? rawPath : `/${rawPath}`
    const body = VIRTUAL_FS[norm]
    if (!body) {
      return { ansi: `${AMBER}cat: ${norm}: not in read-only virtual tree (run \`ls\`)${R}\n` }
    }
    return {
      ansi: `${INK}${body}${R}\n`,
      suggestions: [
        { label: 'List virtual files', command: 'ls' },
        { label: 'Start guided tour', command: 'tour' },
      ],
    }
  }

  if (cmd === 'whoami') {
    return { ansi: `${INK}traveler@shaan4d-sandbox (unprivileged · read-only)${R}\n` }
  }

  if (cmd === 'uname') {
    return { ansi: `${INK}FormaSec-Sandbox/0.4 (zero-shell · browser-fallback · rpi5-ready)${R}\n` }
  }

  if (args.length === 0) {
    const directWorld = resolveWorldId(cmd)
    if (directWorld) {
      const meta = WORLD_BY_ID[directWorld]
      return {
        portal: directWorld,
        ansi: `${EMERALD}✦ Opening portal -> ${GOLD}${B}${meta.name}${R} ${MUTED}(${meta.span})${R}\n`,
      }
    }
  }

  const question =
    cmd === 'ask' || cmd === 'chat' || cmd === 'spatel'
      ? args.join(' ').replace(/^["']|["']$/g, '').trim()
      : line

  if (!question) {
    return {
      ansi: `${MUTED}Ask anything about Shaan's work, research, or essays, or run \`${GOLD}tour${MUTED}\` / \`${GOLD}worlds${MUTED}\`.${R}\n`,
      suggestions: DEFAULT_SUGGESTIONS,
    }
  }

  const hits = retrieveLocal(question)
  const primary = hits[0]
  const bodyLines = [
    primary.body,
    primary.metrics.length
      ? `\n${GOLD}Key verified numbers:${R}\n${primary.metrics.map((m) => `  ${EMERALD}▸${R} ${BRIGHT}${m}${R}`).join('\n')}`
      : '',
    hits[1] ? `\n${INK}${hits[1].body}${R}` : '',
  ].filter(Boolean)
  const sources = hits.map((h) => h.title).join(' · ')
  return {
    ansi:
      `${INK}${bodyLines.join('\n')}${R}\n\n` +
      `${MUTED}├─ sources :${R} ${GOLD}${sources}${R}\n` +
      `${MUTED}├─ ceiling :${R} ${AMBER}${primary.ceiling}${R}\n` +
      `${MUTED}╰─ mode    :${R} ${CYAN}grounded corpus (local sandbox)${R}\n`,
    suggestions: primary.followups,
  }
}
