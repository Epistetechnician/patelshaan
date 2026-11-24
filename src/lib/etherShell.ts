/**
 * Grounded local fallback shell + 24-bit TrueColor ANSI SGR parser for EtherTerminal.
 *
 * Mirrors the exact command set of `rpi5-terminal/server.py` so visitors get a rich,
 * real-time interactive experience even when the Raspberry Pi 5 WebSocket tunnel is offline.
 */

import { researchRepos } from '../research'
import { WORLD_BY_ID, WORLD_CATALOG, type WorldId } from './etherWorlds'

export type AnsiSpan = {
  text: string
  color?: string
  bold?: boolean
  dim?: boolean
}

export type LocalCommandResult = {
  ansi?: string
  clear?: boolean
  portal?: WorldId
  connectUrl?: string
  disconnect?: boolean
}

// ANSI color escape helpers (matching rpi5-terminal/server.py)
const R = '\x1b[0m'
const B = '\x1b[1m'
const GOLD = '\x1b[38;2;223;208;178m'
const INK = '\x1b[38;2;220;216;206m'
const MUTED = '\x1b[38;2;138;134;126m'
const EMERALD = '\x1b[38;2;126;214;168m'
const CYAN = '\x1b[38;2;132;204;224m'
const AMBER = '\x1b[38;2;232;180;104m'
const CORAL = '\x1b[38;2;226;125;114m'

const ESC = String.fromCharCode(27)
const SGR_RE = new RegExp(`${ESC}\\[([0-9;]*)m`, 'g')

export function parseAnsi(input: string): AnsiSpan[] {
  const spans: AnsiSpan[] = []
  let color: string | undefined
  let bold = false
  let dim = false
  let lastIndex = 0

  SGR_RE.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = SGR_RE.exec(input)) !== null) {
    if (match.index > lastIndex) {
      spans.push({
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
    spans.push({ text: input.slice(lastIndex), color, bold, dim })
  }
  return spans
}

type CorpusDoc = {
  id: string
  title: string
  ceiling: string
  aliases: string[]
  body: string
}

const LOCAL_CORPUS: CorpusDoc[] = [
  {
    id: 'formasec',
    title: 'FormaSec · Security Alignment OS',
    ceiling: 'MachineAttestedReproduction (independent second host pending)',
    aliases: [
      'formasec',
      'containment',
      'sandbox',
      'landlock',
      'lean',
      'kani',
      'untrusted',
      'proposer',
      'tdx',
      'kernel',
    ],
    body: 'FormaSec pairs untrusted LLM/enumerator search with a tiny deterministic kernel verified across Python, Kani-checked Rust, and Lean 4 (600/600 structural agreements, 135/135 byte-exact receipts, 0/552 hostile admissions) before Linux Landlock runs. Security Alignment OS extends this loop across 20/20 Intel TDX scenarios.',
  },
  {
    id: 'holdout-ledger',
    title: 'Holdout Ledger · Evidence-Bounded AI',
    ceiling: 'simulation-verified (9/9 hypotheses); prospective SWE-bench run preregistered',
    aliases: [
      'holdout',
      'ledger',
      'mdl',
      'e-process',
      'eprocess',
      'rsi',
      'overfit',
      'judge',
      'certificate',
      'certificates',
    ],
    body: 'Holdout Ledger prices every verdict bit released by a sealed holdout against patch description length (MDL): 0 / 59,200 false certificates across 9/9 pre-registered simulated hypotheses (where zero-bit Wald bounds fail 100% under adaptive attack).',
  },
  {
    id: 'arc-membrane',
    title: 'ARC Membrane (Sovereign Self-Compiling Stack)',
    ceiling: 'Single-A100 study (n=400 MATH-500, Ed25519 receipt pinned); external replication pending',
    aliases: [
      'arc',
      'membrane',
      'qr',
      'nullspace',
      'moe',
      'math500',
      'math-500',
      'sft',
      'drift',
      'self-compiling',
    ],
    body: 'On sealed MATH-500 (n=400, Qwen3-30B-A3B), Track 4 single-step steering yields an honest null (-1.0 pp, p=0.644), whereas Track 5 QR-Nullspace Projected SFT across 844 orthogonal bases lifts accuracy from 39.75% to 76.25% (+36.5 pp) while holding replay KL at 0.000605 — 180× lower drift than unprojected SFT (0.1088).',
  },
  {
    id: 'psychohistory',
    title: 'Psychohistory & Historical Statebook v2',
    ceiling: 'Pure D_real_hold (n=669 across Polymarket & Kalshi); 4/12 P1 & 1/12 P2 cells certified',
    aliases: [
      'psychohistory',
      'statebook',
      'polymarket',
      'kalshi',
      'obstruction',
      'macro',
      'fred',
      'markets',
      'history',
      'seldon',
    ],
    body: 'Psychohistory & Historical Statebook v2 evaluates multi-leg coherence obstructions + causal FRED macro series on strict chronological holdouts (1,673 real events, 0 overlap, 1,673/1,673 Lean 4 invariants). M2 certifies E_t >= 20 over M1 on 4/12 cells (pooled extreme mispricing correction +0.3822 bits, E_t=1e12, AUROC 0.9810), while reporting all 8 uncertified/null cells verbatim.',
  },
  {
    id: 'kailas',
    title: 'Kailas Corpus · Spatial Mandala Double Dissociation',
    ceiling: '2,626 blind-labeled passages + 368-window study; blinded scholar handoff active',
    aliases: [
      'kailas',
      'kailash',
      'tibet',
      'tibetan',
      'mandala',
      'kora',
      'pilgrimage',
      'thubron',
      'bon',
      'sacred',
    ],
    body: 'Across 2,626 blind-labeled passages in 15+ languages (including 282 recovered classical Tibetan ti se and Bon Kangyur passages), a pooled 2-clock Rissanen MDL null split into a Spatial-Mandala φ = f(r) vs. Multi-Temporal double dissociation (368 windows, α=0.86, p=0.0022).',
  },
  {
    id: 'honest-nulls',
    title: 'Honest Nulls & Self-Caught Confounds',
    ceiling: 'Reported verbatim alongside every positive claim across all active repos',
    aliases: ['null', 'nulls', 'negative', 'failed', 'confound', 'j-space', 'jspace', 'caduceus', 'pca', 'honest'],
    body: '1) temporal-grid-safety v16 eval-rate confound inflated 60% gain to 95% (caught & fixed).\n2) jspace-pilot norm-matched PCA tied J-space geometry on 7B–8B models.\n3) Caduceus phrase tripwire held 41% of benign skills (kept off).\n4) ARC Membrane Track 4 steering yielded -1.0 pp (p=0.644) before Track 5 QR-SFT succeeded.\n5) Kailas pooled 2-clock null split into spatial φ = f(r) mandala structure.',
  },
  {
    id: 'public-goods',
    title: 'Gitcoin, Public Goods & Sacred Economics',
    ceiling: 'Operator record + essays (grounded corpus)',
    aliases: ['public', 'goods', 'gitcoin', 'quadratic', 'ostrom', 'dao', 'economics', 'funding', 'commons'],
    body: 'Gitcoin mattered because it turned caring about public goods into allocative power. Durable funding needs a stack: quadratic matching, retroactive rewards, delegated domain judgment, and visible Ostrom-style governance rules.',
  },
  {
    id: 'about',
    title: 'Shaan Patel · Epistetechnician',
    ceiling: 'Verified CV & working portfolio (shaan4d.xyz)',
    aliases: ['who', 'shaan', 'patel', 'about', 'bio', 'cv', 'working', 'now', 'background'],
    body: 'I am Shaan Patel (@Epistetechnician) — independent researcher & systems engineer working on formal containment (FormaSec), anytime evaluation integrity (Holdout Ledger, ARC Membrane), mechanistic interpretability audits, and epistemic history/markets (Psychohistory v2, Kailas Corpus).',
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
  'help',
  'ask',
  'worlds',
  'travel',
  'research',
  'nulls',
  'psychohistory',
  'kailas',
  'eprocess',
  'qrproj',
  'status',
  'ls',
  'cat',
  'connect',
  'disconnect',
  'clear',
  ...WORLD_CATALOG.map((w) => w.id),
]

const VIRTUAL_FS: Record<string, string> = {
  '/README.md':
    'SPATEL // ETHER SANDBOX\nInteract with Shaan Patel’s personal model, inspect verified research receipts & honest nulls, run live e-process / QR-nullspace tools, or launch 8 high-resolution multidimensional ASCII worlds (`worlds`, `travel <world>`).',
  '/etc/sandbox.policy':
    'SANDBOX CONTAINMENT POLICY\nshell_exec     : DISABLED (zero bash/sh/subprocess)\nfilesystem     : READ-ONLY VIRTUAL TREE\ncontainer_rpi5 : --read-only --cap-drop=ALL --security-opt=no-new-privileges\nrate_limit     : 36 cmds/min · 10 LLM queries/min per IP · 512B max line',
  '/corpus/psychohistory.v2':
    'PSYCHOHISTORY & HISTORICAL STATEBOOK v2 (Pure D_real_hold)\nEvents         : 1,673 real (1,004 train / 669 hold · 0 overlap)\nLean 4 checks  : 1,673 / 1,673 (100.0%) Pinsker + weak-duality + causal macro\nP1 Certified   : pooled high_resolution_surprise (+0.1721b, E_t=3.43e6)\n                 pooled extreme_mispricing_correction (+0.3822b, E_t=1e12, AUROC 0.9810)\n                 polymarket_only extreme_mispricing (+0.1091b, E_t=6.50e5)\n                 kalshi_only extreme_mispricing (+1.1023b, E_t=1e12)\nP2 Certified   : pooled delayed_settlement_median (+0.0152b, E_t=36.79)\nHonest Nulls   : 8/12 P1 cells & 11/12 P2 cells reported verbatim',
  '/corpus/kailas.mandala':
    'KAILAS CORPUS — SPATIAL MANDALA DOUBLE DISSOCIATION\nPassages       : 2,626 blind-labeled across 15+ languages\nRecovered      : 282 classical Tibetan (ཏི་སེ) & Bon Kangyur passages\nPilgrimage     : 368 windows · α=0.86 · p=0.0022 (spatial φ=f(r) vs calendar clocks)\nThubron kora   : 48 episodes · 20.0% strict / 34.3% loose route-aligned phase',
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
    const hay = `${doc.title} ${doc.body}`.toLowerCase()
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
        `${MUTED}Zero /bin/sh or subprocess exists in this runtime. Run ${GOLD}cat /etc/sandbox.policy${MUTED}.${R}\n`,
    }
  }

  const parts = line.split(/\s+/)
  const cmd = parts[0].toLowerCase()
  const args = parts.slice(1)

  if (cmd === 'clear' || cmd === 'cls') return { clear: true }

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
        `${GOLD}${B}COMMANDS — SPATEL ETHER SANDBOX${R}`,
        `  ${GOLD}<any question>${R}        Talk to Shaan's personal model (RPi5 Ollama or grounded RAG)`,
        `  ${GOLD}worlds${R}                Catalog of 8 high-resolution multidimensional ASCII worlds`,
        `  ${GOLD}travel <world>${R}        Enter a world (psychohistory, universal, tesseract, kailas,`,
        `                        horizon, ruliad, lorenz, noosphere)`,
        `  ${GOLD}research [slug]${R}       Inspect all ${researchRepos.length} verified research repos & ceilings`,
        `  ${GOLD}nulls${R}                 Inspect honest negative results & self-caught confounds`,
        `  ${GOLD}psychohistory${R}         Psychohistory v2 venue-stratified obstruction matrix`,
        `  ${GOLD}kailas${R}                Kailas spatial-mandala φ=f(r) double dissociation`,
        `  ${GOLD}eprocess [null|signal]${R} Live anytime Empirical-Bernstein e-process sparkline`,
        `  ${GOLD}qrproj${R}                ARC Membrane Track 5 QR-nullspace projection summary`,
        `  ${GOLD}ls / cat <path>${R}       Browse read-only virtual corpus & /etc/sandbox.policy`,
        `  ${GOLD}connect <wss://...>${R}   Connect live to your Raspberry Pi 5 WebSocket tunnel`,
        `  ${GOLD}status / clear${R}        Inspect telemetry or clear terminal scrollback`,
      ].join('\n') + '\n',
    }
  }

  if (cmd === 'worlds' || cmd === 'portals' || cmd === 'ether') {
    const rows = [
      `${GOLD}${B}HIGH-RESOLUTION MULTIDIMENSIONAL ASCII WORLDS${R}`,
      `${MUTED}Run ${GOLD}travel <id>${MUTED} (or click a ✦ chip above). Inside: drag=orbit, scroll=zoom, [m]=mode, [p]=palette, [q]=exit.${R}`,
      '',
      ...WORLD_CATALOG.map(
        (w) =>
          `  ${CYAN}[${w.index}]${R} ${GOLD}${B}${w.id.padEnd(14)}${R} ${INK}${w.name}${R}\n      ${MUTED}${w.span} — ${w.summary}${R}`,
      ),
    ]
    return { ansi: rows.join('\n') + '\n' }
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
        `${GOLD}${B}SANDBOX TELEMETRY (LOCAL FALLBACK)${R}`,
        `  ${MUTED}rpi5 endpoint :${R} ${CYAN}${wsUrl}${R}`,
        `  ${MUTED}connection    :${R} ${AMBER}offline fallback (run \`connect <wss://...>\` when Pi tunnel is up)${R}`,
        `  ${MUTED}model         :${R} ${GOLD}grounded corpus RAG (switches to live shaanpatel-cv-pico on Pi)${R}`,
        `  ${MUTED}containment   :${R} ${EMERALD}zero-shell · read-only · browser-isolated${R}`,
      ].join('\n') + '\n',
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
          `${GOLD}${B}${hit.name}${R}  ${MUTED}[${hit.slug}]${R}`,
          `${INK}${hit.headline}${R}`,
          `${MUTED}metrics :${R} ${CYAN}${hit.results.map((x) => `${x.value} (${x.label})`).slice(0, 3).join(' · ')}${R}`,
          `${MUTED}ceiling :${R} ${AMBER}${hit.notShown}${R}`,
        ].join('\n') + '\n',
      }
    }
    const list = [
      `${GOLD}${B}VERIFIED RESEARCH MONOGRAPH (${researchRepos.length} REPOS · run \`research <slug>\`)${R}`,
      ...researchRepos.map(
        (r) => `  ${CYAN}•${R} ${GOLD}${r.slug.padEnd(28)}${R} ${INK}${r.name}${R}`,
      ),
    ]
    return { ansi: list.join('\n') + '\n' }
  }

  if (cmd === 'nulls' || cmd === 'failures' || cmd === 'confounds') {
    const doc = LOCAL_CORPUS.find((d) => d.id === 'honest-nulls')!
    return {
      ansi: `${GOLD}${B}HONEST NULLS & SELF-CAUGHT CONFOUNDS${R}\n${INK}${doc.body}${R}\n`,
    }
  }

  if (cmd === 'psychohistory') {
    return {
      ansi:
        `${INK}${VIRTUAL_FS['/corpus/psychohistory.v2']}${R}\n` +
        `${MUTED}Tip: run ${GOLD}travel psychohistory${MUTED} to fly over the live 3D obstruction manifold.${R}\n`,
    }
  }

  if (cmd === 'kailas' || cmd === 'kailash' || cmd === 'mandala') {
    return {
      ansi:
        `${INK}${VIRTUAL_FS['/corpus/kailas.mandala']}${R}\n` +
        `${MUTED}Tip: run ${GOLD}travel kailas${MUTED} to enter the spatial mandala φ=f(r) renderer.${R}\n`,
    }
  }

  if (cmd === 'eprocess' || cmd === 'holdout' || cmd === 'e-process') {
    const mode = args[0]?.toLowerCase() === 'null' ? 'null' : 'signal'
    const mu = mode === 'null' ? 0.0 : 0.15
    let eVal = 1.0
    const lam = 0.45
    const sparks = '▁▂▃▄▅▆▇█'
    const series: number[] = []
    let certStep: number | null = null
    for (let step = 1; step <= 36; step++) {
      // Box-Muller sample
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
    const bar = series
      .map((v) => sparks[Math.min(7, Math.floor(((v - lo) / span) * 7.99))])
      .join('')
    const verdict =
      certStep !== null
        ? `${EMERALD}CERTIFIED at step ${certStep} (E_t=${eVal.toFixed(2)} ≥ 20)${R}`
        : `${AMBER}HELD / UNCERTIFIED (E_t=${eVal.toFixed(2)} < 20 — honest null preserved)${R}`
    return {
      ansi: [
        `${GOLD}${B}ANYTIME EMPIRICAL-BERNSTEIN E-PROCESS${R} ${MUTED}(mode=${mode}, α=0.05, threshold E_t ≥ 20)${R}`,
        `  ${CYAN}log10(E_t):${R} ${GOLD}${bar}${R}`,
        `  ${MUTED}verdict   :${R} ${verdict}`,
        `  ${MUTED}try \`${GOLD}eprocess null${MUTED}\` vs \`${GOLD}eprocess signal${MUTED}\`${R}`,
      ].join('\n') + '\n',
    }
  }

  if (cmd === 'qrproj' || cmd === 'qr' || cmd === 'nullspace') {
    return {
      ansi: [
        `${GOLD}${B}ARC MEMBRANE TRACK 5 — QR-NULLSPACE PROJECTION${R}`,
        `  ${MUTED}Equation :${R} ${CYAN}ΔW_⊥ = ΔW − (ΔW · Q) · Qᵀ${R} ${MUTED}(844 orthonormal expert bases)${R}`,
        `  ${MUTED}Residual :${R} ${EMERALD}||ΔW_⊥ · Q||_max = 1.06 × 10⁻⁸${R}`,
        `  ${MUTED}MATH-500 :${R} ${GOLD}39.75% → 76.25% (+36.5 pp, n=400 sealed)${R}`,
        `  ${MUTED}Drift KL :${R} ${EMERALD}0.000605${R} vs ${CORAL}0.1088${R} unprojected (${GOLD}180× lower drift${R})`,
        `  ${MUTED}Run \`${GOLD}travel lorenz${MUTED}\` to inspect the invariant protection plane in 3D Braille.${R}`,
      ].join('\n') + '\n',
    }
  }

  if (cmd === 'ls' || cmd === 'dir' || cmd === 'tree') {
    return {
      ansi: [
        `${GOLD}${B}READ-ONLY VIRTUAL FILESYSTEM${R}`,
        ...Object.keys(VIRTUAL_FS).map((p) => `  ${CYAN}${p}${R}`),
      ].join('\n') + '\n',
    }
  }

  if (cmd === 'cat') {
    const rawPath = args[0]
    if (!rawPath) {
      return { ansi: `${MUTED}Usage: ${GOLD}cat /etc/sandbox.policy${MUTED} (run \`ls\` for files)${R}\n` }
    }
    if (rawPath.includes('..')) {
      return { ansi: `${AMBER}[sandbox-containment]${R} path traversal blocked.\n` }
    }
    const norm = rawPath.startsWith('/') ? rawPath : `/${rawPath}`
    const body = VIRTUAL_FS[norm]
    if (!body) {
      return { ansi: `${AMBER}cat: ${norm}: not in read-only virtual tree (run \`ls\`)${R}\n` }
    }
    return { ansi: `${INK}${body}${R}\n` }
  }

  if (cmd === 'whoami') {
    return { ansi: `${INK}traveler@shaan4d-sandbox (unprivileged · read-only)${R}\n` }
  }

  if (cmd === 'uname') {
    return { ansi: `${INK}FormaSec-Sandbox/0.3 (zero-shell · browser-fallback · rpi5-ready)${R}\n` }
  }

  // Single-token world shortcut (e.g., typing `universal` or `tesseract`)
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

  // Personal model grounded Q&A (either `ask <q>` or natural language)
  const question =
    cmd === 'ask' || cmd === 'chat' || cmd === 'spatel'
      ? args.join(' ').replace(/^["']|["']$/g, '').trim()
      : line

  if (!question) {
    return { ansi: `${MUTED}Ask anything about Shaan's work, research, or essays — or run ${GOLD}worlds${MUTED}.${R}\n` }
  }

  const hits = retrieveLocal(question)
  const body = hits.map((h) => h.body).join('\n\n')
  const sources = hits.map((h) => h.title).join(' · ')
  const ceiling = hits[0].ceiling
  return {
    ansi:
      `${INK}${body}${R}\n\n` +
      `${MUTED}sources : ${GOLD}${sources}${R}\n` +
      `${MUTED}ceiling : ${AMBER}${ceiling}${R}\n` +
      `${MUTED}mode    : ${CYAN}grounded corpus (local sandbox — connect RPi5 for live shaanpatel-cv-pico)${R}\n`,
  }
}
