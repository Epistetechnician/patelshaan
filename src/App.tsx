import { useCallback, useEffect, useRef, useState } from 'react'
import ParetoChart from './ParetoChart'
import { FrontiersSection } from './FrontiersSection'
import Video2Ascii from './components/LocalVideo2Ascii'
import { WorkList } from './components/WorkList'
import { getField } from './field'
import { essayNotes, threadById } from './humanities'
import { researchRepos } from './research'
import './App.css'

/** Renders `backticked` spans as inline code. */
function Inline({ text }: { text: string }) {
  return (
    <>
      {text.split('`').map((part, i) => (i % 2 ? <code key={i}>{part}</code> : <span key={i}>{part}</span>))}
    </>
  )
}

function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="cmd-box">
      <code>{command}</code>
      <button
        type="button"
        className={`cmd-box__copy${copied ? ' is-copied' : ''}`}
        onClick={handleCopy}
        aria-label={`Copy command: ${command}`}
      >
        {copied ? 'copied' : 'copy'}
      </button>
    </div>
  )
}

const installOptions = [
  {
    label: 'cargo',
    title: 'Install from the repo',
    command: 'cargo install --git https://github.com/Epistetechnician/spatel-cv.git --bin spatel',
    note: 'Best developer-friendly path and the fastest way to install the TUI plus personal Q&A stack from source.',
  },
  {
    label: 'curl',
    title: 'Install latest release',
    command: 'curl -fsSL https://raw.githubusercontent.com/Epistetechnician/spatel-cv/master/install.sh | sh',
    note: 'Best one-command path for macOS and Linux once release artifacts are published.',
  },
  {
    label: 'gh',
    title: 'Download latest release',
    command: 'gh release download --repo Epistetechnician/spatel-cv --pattern "spatel-*"',
    note: 'Useful for power users who want the latest binary directly.',
  },
]

const modelCommands = [
  {
    label: 'build',
    title: 'Create the local persona model',
    command: 'spatel --build-pico-model',
    note: 'Builds `shaanpatel-cv-pico` on top of a small local `qwen2.5:0.5b` base through Ollama.',
  },
  {
    label: 'ask',
    title: 'Ask one grounded question',
    command: 'spatel --ask "What are you working on right now?"',
    note: 'Answers with retrieved context, then uses the local model when it exists.',
  },
  {
    label: 'chat',
    title: 'Open the interactive shell',
    command: 'spatel --chat',
    note: 'Runs a conversational CLI for experience, worldview, and current focus questions.',
  },
  {
    label: 'fallback',
    title: 'Force the offline corpus path',
    command: 'spatel --ask "How do you think about public goods?" --offline-only',
    note: 'Skips Ollama entirely and synthesizes from the embedded Shaan corpus.',
  },
]

const modelHighlights = [
  {
    eyebrow: 'Grounded corpus',
    title: 'CV plus worldview, not vibes',
    body: 'The answer engine is fed by resume entries, personal notes, and essay-grounded worldview summaries so the output stays tied to actual experience.',
  },
  {
    eyebrow: 'Tiny runtime',
    title: 'Built around a small local base',
    body: 'The production path uses a tiny `qwen2.5:0.5b` Ollama base and creates a personalized `shaanpatel-cv-pico` derivative.',
  },
  {
    eyebrow: 'Two interfaces',
    title: 'CLI and TUI both ask back',
    body: 'You can use `--ask` and `--chat` in the CLI or press `/` inside the TUI to open a live question prompt.',
  },
  {
    eyebrow: 'Failure mode',
    title: 'Still works when the model is absent',
    body: 'If Ollama is unavailable, `spatel` falls back to a retrieval-first offline answer instead of failing blankly.',
  },
]

type ExperienceVideo = {
  src: string
  poster?: string
  label: string
  caption: string
  stats: string
  renderMode?: 'ascii' | 'video'
  fitMode?: 'cover' | 'ambient'
  focalY?: number
  posterTime?: number
  numColumns: number
  blend: number
  highlight: number
  brightness: number
}

type ExperienceLink = {
  href: string
  label: string
  description: string
}

type ExperienceCard = {
  eyebrow: string
  title: string
  role: string
  summary: string
  details: string[]
  video: ExperienceVideo
  links?: ExperienceLink[]
  secondaryVideo?: ExperienceVideo
}

type WritingEntry = {
  slug: string
  title: string
  meta: string
  summary: string
  contentHtml: string
}

type SocialLink = {
  id: 'x' | 'github' | 'linkedin' | 'telegram'
  label: string
  href: string
}

type SystemsProject = {
  index: string
  title: string
  discipline: string
  summary: string
  boundary: string
  access?: string
  links?: ExperienceLink[]
  linkLayout?: 'stacked'
  essaySlug?: string
}

type YouTubePlayer = {
  destroy: () => void
  getPlayerState: () => number
  pauseVideo: () => void
  playVideo: () => void
}

type YouTubeNamespace = {
  Player: new (
    elementId: string,
    options: {
      videoId: string
      playerVars: Record<string, number | string>
      events: {
        onError: () => void
        onReady: (event: { target: YouTubePlayer }) => void
        onStateChange: (event: { data: number }) => void
      }
    },
  ) => YouTubePlayer
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void
    YT?: YouTubeNamespace
  }
}

const landingMusicVideoId = 'oe8kgXNqLFI'

function AmbientSoundControl() {
  const playerRef = useRef<YouTubePlayer | null>(null)
  const pendingPlayRef = useRef(false)
  const [playback, setPlayback] = useState<'idle' | 'loading' | 'playing' | 'paused'>('idle')

  useEffect(() => {
    return () => {
      playerRef.current?.destroy()
      playerRef.current = null
    }
  }, [])

  const initAndPlay = useCallback(() => {
    setPlayback('loading')
    pendingPlayRef.current = true

    const createPlayer = () => {
      if (!window.YT || playerRef.current) {
        if (playerRef.current && pendingPlayRef.current) {
          pendingPlayRef.current = false
          playerRef.current.playVideo()
        }
        return
      }

      playerRef.current = new window.YT.Player('landing-music-player', {
        videoId: landingMusicVideoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          loop: 1,
          playlist: landingMusicVideoId,
          playsinline: 1,
          rel: 0,
        },
        events: {
          onReady: ({ target }) => {
            if (pendingPlayRef.current) {
              pendingPlayRef.current = false
              target.playVideo()
            }
          },
          onStateChange: ({ data }) => {
            if (data === 1) {
              setPlayback('playing')
            } else if (data === 2 || data === 0) {
              setPlayback('paused')
            }
          },
          onError: () => {
            pendingPlayRef.current = false
            setPlayback('idle')
          },
        },
      })
    }

    if (window.YT) {
      createPlayer()
      return
    }

    window.onYouTubeIframeAPIReady = createPlayer
    if (!document.getElementById('youtube-iframe-api')) {
      const script = document.createElement('script')
      script.id = 'youtube-iframe-api'
      script.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(script)
    }
  }, [])

  const toggleSound = () => {
    const player = playerRef.current
    if (!player) {
      initAndPlay()
      return
    }

    if (playback === 'playing') {
      player.pauseVideo()
      setPlayback('paused')
    } else {
      player.playVideo()
    }
  }

  const label =
    playback === 'playing'
      ? 'pause sound'
      : playback === 'loading'
        ? 'starting...'
        : 'sound'

  return (
    <div className="ambient-sound">
      <div id="landing-music-player" className="landing-music__player" />
      <button
        type="button"
        className={`landing-music__control${playback === 'playing' ? ' is-playing' : ''}`}
        onClick={toggleSound}
        disabled={playback === 'loading'}
        aria-pressed={playback === 'playing'}
        aria-label={playback === 'playing' ? 'Pause ambient music' : 'Play ambient music'}
      >
        <span className="landing-music__indicator" aria-hidden="true" />
        <span className="landing-music__label">{label}</span>
      </button>
    </div>
  )
}

const experienceCards: ExperienceCard[] = [
  {
    eyebrow: '2025-2026',
    title: 'Halo Labs',
    role: 'Co-Founder and COO',
    summary:
      'Leading research around building a confidential stablecoins network with verifiable AI leveraging trusted execution environments while coordinating partnerships, docs, and developer onboarding.',
    details: [
      'Lead research on developing verifiable AI using TEEs and zk-proofs',
      'Maintaining website and relevant documentation',
      'Onboard developers to our light client',
      'Leading collaborations with our service providers like Phala and Fairblocks',
    ],
    video: {
      src: '/ascii/loomhalo-web.mp4',
      poster: '/ascii/loomhalo-poster.jpg',
      label: 'halo labs / loom reel',
      caption: 'A live Halo light client walk through',
      stats: 'docs + loom / live',
      renderMode: 'video',
      numColumns: 88,
      blend: 18,
      highlight: 14,
      brightness: 1.24,
    },
    links: [
      {
        href: 'https://docs.halo-labs.xyz/',
        label: 'Open Halo docs',
        description: 'Read the Halo Network docs and architecture overview.',
      },
      {
        href: 'https://github.com/Halo-Labs-xyz/halo-verus',
        label: 'Halo Verus Repository',
        description: 'Browse my work towards verifiable AI with trusted execution environments and zk-proofs.',
      },
      {
        href: 'https://honeysuckle-snowplow-195.notion.site/halomodular-2b40848a31bf80ff89ffe52c7f6fac59?source=copy_link',
        label: 'Modular Privacy Research',
        description: 'Read about a modular approach to Privacy',
      },
    ],
    secondaryVideo: {
      src: '/ascii/lorenz.mp4',
      label: 'lorenz attractor / ascii',
      caption: 'The Lorenz attractor now renders as the ASCII counterpart for Halo.',
      stats: 'chaotic system / rendered',
      renderMode: 'ascii',
      fitMode: 'ambient',
      focalY: 0.34,
      posterTime: 4,
      numColumns: 96,
      blend: 18,
      highlight: 28,
      brightness: 1.32,
    },
  },
  {
    eyebrow: '2024-2025',
    title: 'NPC Capital',
    role: 'Full Stack Developer and Researcher',
    summary:
      'A liquid crypto fund focused on building the future of decentralized finance, partnered with Polygon.',
    details: [
      'Built heads up display for fund investors',
      'Established cross chain data pipelines to assist in fund investment decisions',
      'Worked with validators in the Hyperliquid ecosystem to test real yield strategies',
    ],
    video: {
      src: '/ascii/npc-skyline.mp4',
      label: 'markets / skyline / dashboards',
      caption: 'A clear skyline and kinetic city texture echoes fund interfaces, market context, and live operator tooling.',
      stats: 'cross-chain / synced',
      numColumns: 96,
      blend: 10,
      highlight: 10,
      brightness: 1.18,
    },
    secondaryVideo: {
      src: '/ascii/npc-skyline.mp4',
      label: 'npc skyline / ascii background',
      caption: 'The NPC skyline now renders as the ASCII background for the card.',
      stats: 'market context / rendered',
      renderMode: 'ascii',
      posterTime: 2,
      numColumns: 128,
      blend: 10,
      highlight: 18,
      brightness: 1.2,
    },
    links: [
      {
        href: 'https://npcgroup.xyz/',
        label: 'Visit NPC Capital',
        description: 'Open the NPC Capital website.',
      },
    ],
  },
  {
    eyebrow: 'Ecosystem',
    title: 'Public Goods + Open Source',
    role: 'Celo, Dream DAO, Eco DAO, Solana Foundation',
    summary:
      'My work spanned across open-source education, public-goods strategy, DAO governance, and ecosystem coordination to help mission-driven communities turn ideas into usable systems.',
    details: [
      'Solana Foundation: Updated developer documentation by simplifying wording, tightening versioning across examples, and merging newer SDK commands into lessons.',
      'Celo: Built content pipelines and public-goods strategy to highlight open-source contributions and initiatives using tools like account abstraction and quadratic funding.',
      'Dream DAO: Co-stewarded a community of about 100 young builders, helped shape DAO governance, and hosted over 40 online and 4 IRL learning gatherings.',
      'Eco DAO: Onboarded 3 organizations and 50+ individuals, implemented governance tooling, researched carbon offset financial primitives, and supported 3 NFT launches.',
    ],
    video: {
      src: '/ascii/public-goods-nature.mp4',
      label: 'commons / learning / growth',
      caption: 'A softer organic clip makes the public-goods card feel like stewardship, coordination, and long-term compounding.',
      stats: 'ecosystem / alive',
      numColumns: 92,
      blend: 6,
      highlight: 16,
      brightness: 1.1,
    },
    secondaryVideo: {
      src: '/ascii/public-goods-nature.mp4',
      label: 'public goods / ascii background',
      caption: 'The public-goods nature clip now renders behind the full card in ASCII.',
      stats: 'commons / rendered',
      renderMode: 'ascii',
      posterTime: 2,
      numColumns: 122,
      blend: 7,
      highlight: 24,
      brightness: 1.14,
    },
  },
]

const foundations = [
  'Economics and Data Science, with research spanning from sustainable development to environmental impact assessments and more. My work sits between technical and natural systems, bio-memetic antifragile design, and post-capitalist musings. ',
  'I like products and protocols that make complicated environments feel legible, navigable, and alive. I found a passion for sacred economics, secure + verifiable AI, governance design, decentralized networks, public goods, and more.',
  'Interests that keep me grounded: permaculture, DIY engineering, running, biking, cooking, yoga, soccer, chess, Go, and Catan.',
]

const showDigitalLibrary = false
const digitalLibraryHref = 'https://shaanpatel.dev/library'
const favoriteBlogHref = 'https://www.ribbonfarm.com/series/psychohistory/'

const socialLinks: SocialLink[] = [
  {
    id: 'x',
    label: 'X',
    href: 'https://x.com/epistetechnic',
  },
  {
    id: 'github',
    label: 'GitHub',
    href: 'https://github.com/Epistetechnician',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/shaan-patel21/',
  },
  {
    id: 'telegram',
    label: 'Telegram',
    href: 'https://t.me/epistetechnician',
  },
]

const systemsProjects: SystemsProject[] = [
  {
    index: '01',
    title: 'Holdout Ledger',
    discipline: 'Adaptive evaluation integrity and bit-priced holdouts',
    summary:
      'A pre-registered hash-chained ledger pricing the verdict bits a sealed holdout releases to a self-improvement loop against output description length, achieving 0 certificate violations across 59,200 confirmatory runs (9/9 hypotheses passed) while standard Wald bounds fail in 100% of attacked runs.',
    boundary:
      'Confirmed on tabular ensembles and stylized patch proposers with core Lean 4 counting proofs; in the late regime (true gain ~0.001) nothing is certifiable up to n = 100,000.',
    links: [
      {
        href: '#/research/holdout-ledger',
        label: 'Read research page & live demo',
        description: 'Inspect the 59,200-run confirmatory table and interactive MDL budget simulator.',
      },
      {
        href: 'https://github.com/Epistetechnician/holdout-ledger',
        label: 'GitHub repository',
        description: 'Open PREREG.md, confirmatory runs, and HoldoutLedger.lean.',
      },
    ],
  },
  {
    index: '02',
    title: 'FormaSec & Security Alignment OS',
    discipline: 'Certified composition and hardware-attested agent kernels',
    summary:
      'Separating untrusted LLM/enumerator proposers from small kernels: Python, Rust (Kani-checked), and Lean 4 agree on 600 structural cases with 0 unsafe admissions across 552 hostile proposals, paired with a 279-test capability broker attested across 20 scenarios on Intel TDX.',
    boundary:
      'Solver proof objects sit outside the Lean TCB, and the TDX run is a single-host machine-attested reproduction awaiting independent second-host replication.',
    links: [
      {
        href: '#/research/formasec',
        label: 'FormaSec research page',
        description: 'Explore the Python/Rust/Lean admission kernel and interactive DAG checker.',
      },
      {
        href: '#/research/security-alignment-os',
        label: 'Security Alignment OS',
        description: 'Inspect the capability-broker loop and 20-scenario TDX attestation.',
      },
    ],
  },
  {
    index: '03',
    title: 'Statebook',
    discipline: 'Financial coherence and bounded externalization',
    summary:
      'An architecture for normalizing federated contract terms into StateKeys, bounded payoff comparisons, seven non-compensating completeness reports, and three separated finality clocks before treating a cross-venue position or externalization path as coherent.',
    boundary:
      'The current work is read-only architecture research. It does not execute trades, recognize margin, hold collateral, authorize releases, or settle value.',
    essaySlug: 'statebooks-convergence-with-coherence',
    linkLayout: 'stacked',
    links: [
      {
        href: '/publications/statebook-whitepaper.pdf',
        label: 'Read whitepaper',
        description: 'Open the updated 72-page research paper and its bounded design claims.',
      },
      {
        href: '/publications/statebook-layer-map.svg',
        label: 'View architecture',
        description: 'Open the semantic-coherence and authority-boundary map.',
      },
    ],
  },
  {
    index: '04',
    title: 'Playbox & Caduceus',
    discipline: 'Multi-owner collaboration rooms and governed skill evolution',
    summary:
      'An 8-crate Rust room substrate under attenuated Biscuit grants whose F3 H100 gate caught a planted dev-set memorizer (plus 2.84× Tier-B speedup), paired with Caduceus’s 13-lane skill release ledger (+0.245 Haiku, +0.305 Sonnet, 43/43 attacks refused).',
    boundary:
      'Commons v0 runs on a single relay, cross-family latent vectors (87.5%) still trail plain-text words (71–77% vs 61–68%), and Caduceus’s phrase-tripwire lane stays off after a 41% false-hold audit.',
    links: [
      {
        href: '#/research/playbox',
        label: 'Playbox research page',
        description: 'Multi-owner Biscuit rooms, F3 H100 verification, and latent-steering controls.',
      },
      {
        href: '#/research/caduceus',
        label: 'Caduceus research page',
        description: '13-lane Hermes skill admission, RFC 9162 Merkle ledger, and paired Claude lifts.',
      },
    ],
  },
  {
    index: '05',
    title: 'Mech-Interp Unified & Temporal Grid Safety',
    discipline: 'Planted-flaw audits, subspace equivalence, and drift-resistant safety',
    summary:
      'Out-of-family causal neuron replication on Qwen3-1.7B (p = 0.000999), an F2 planted-flaw audit showing no auditor catches all 8 flaw classes, OLMo-2/Tulu-3 J-space equivalence to norm-matched PCA (0.00 gap), and frozen discriminant adapters retaining 0.95 vs 0.27 held-out refusals under benign OOD fine-tuning.',
    boundary:
      'Neuron selection shifts with device/dtype, discriminant adapters protect against benign drift rather than 64-step white-box attackers, and all runs sit at or below 8B parameters.',
    links: [
      {
        href: '#/research/mech-interp-unified',
        label: 'Mech-Interp & J-Space',
        description: 'R6 replication, F2 planted-flaw interactive audit, and norm-matched PCA equivalence.',
      },
      {
        href: '#/research/temporal-grid-safety',
        label: 'Temporal Grid Safety',
        description: 'Self-caught v16 attacker confound and 0.95 vs 0.27 benign-drift refusal retention.',
      },
    ],
  },
  {
    index: '06',
    title: 'Composed ZK Benchmark OS',
    discipline: 'Semantics, adversarial trace mutations, and evidence ceilings',
    summary:
      'A semantics-first benchmark architecture generating nine control-flow workload families and 14 adversarial mutation classes so a fast backend that accepts an invalid trace ranks strictly below a slow one that rejects it.',
    boundary:
      'The work is deliberately Level 1 local infrastructure: replay and mutation harnesses are not presented as external zkVM performance numbers or kernel-checked Rust source proofs.',
    links: [
      {
        href: '#/research/composed-zk-benchmark-os',
        label: 'Read research page',
        description: 'Try the interactive trace-mutation oracle and inspect the formal ladder.',
      },
      {
        href: 'https://github.com/Epistetechnician/composed-zk-benchmark-os',
        label: 'GitHub repository',
        description: 'Open the benchmark architecture and FINDINGS.md.',
      },
    ],
  },
  {
    index: '07',
    title: 'Lusis Mesh & Recoverable Ghost States',
    discipline: 'Bounded operator control and continual-learning proof packs',
    summary:
      'Policy-guided infrastructure remediation with Merkle-anchored run events and operator steering by default, alongside bounded-governed continual-learning recovery and validation packets.',
    boundary:
      'Passing local validation packets do not claim hosted production autonomy; live external runtime replication remains explicitly gated.',
    links: [
      {
        href: 'https://lusislabs.com/',
        label: 'Visit Lusis Labs',
        description: 'Open the Lusis Labs public site.',
      },
      {
        href: '/publications/recoverable-ghost-states-paper.pdf',
        label: 'Read research paper',
        description: 'Open the 17-page paper on bounded-governed continual learning.',
      },
    ],
  },
  {
    index: '08',
    title: 'ECDSA.fail',
    discipline: 'Reversible quantum-circuit autoresearch',
    summary:
      'Evaluator-verified open autoresearch on reversible secp256k1 point addition inside Shor’s algorithm: achieving an 86.1% Q × T score reduction while respecting exactness, uncomputation, and phase invariants.',
    boundary:
      'Coherent windowed variants reflect per-call sensitivity models rather than full-Shor success estimates across differing interface conventions.',
    links: [
      {
        href: 'https://arxiv.org/abs/2609.09582',
        label: 'Read arXiv paper',
        description: 'Open the September 2026 v2 paper and complete author list.',
      },
      {
        href: '/publications/ecdsafail-open-autoresearch-v3.1.pdf',
        label: 'Earlier research edition',
        description: 'Open the 62-page project paper on Open Autoresearch.',
      },
      {
        href: 'https://ecdsa.fail/',
        label: 'Challenge site',
        description: 'Open the public challenge surface and benchmark context.',
      },
    ],
  },
  {
    index: '09',
    title: 'Sacred Geography as Multi-Temporal Structure',
    discipline: 'Multilingual corpora, pilgrimage coding, and complex time',
    summary:
      'Two pre-registered open-data studies of Mount Kailas: 2,362 blind-labeled passages across 15+ languages and 195 dual-coded pilgrim-account episodes (α = 0.82) testing whether complex time (`kime`) beats `(lap, progress)`.',
    boundary:
      'Both Kailas tests are null (Sanskrit −3.4; decoupled episodes 5.6% vs 10% threshold, Kailas 1.3% vs Hajj/Holy Land 14.7%). Blinded Tibetan/Bon (115-row) and Sanskrit (233-row) scholar handoff packs await specialist review.',
    links: [
      {
        href: '#/research/sacred-geography-kailas',
        label: 'Read the field study',
        description: 'The 15-language passage test, 20-account pilgrimage coding, and scholar handoff.',
      },
      {
        href: 'https://github.com/Epistetechnician/kailas-corpus',
        label: 'Open corpus repository',
        description: 'Browse manifests, lexicons, coding results, and blinded handoff builders.',
      },
    ],
  },
]

// Keep writing source inside the app so Railway builds do not depend on parent folders.
const writingModules = import.meta.glob('./content/writings/*.html', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

const writingOrder = [
  'approaching-breakthroughs-across-systems',
  'evidence-bounded-intelligence',
  'statebooks-convergence-with-coherence',
  'ai-research-map-evolution-intelligence-safety-security',
  'continual-learning-and-alignment-benchmarks',
  'hybrid-synthetic-data-and-evaluation',
  'mechanistic-interpretability-negative-results',
  'verifiable-ai-agents',
  'zero-knowledge-mpc-and-post-quantum-security',
  'decentralized-compute-and-data-provenance',
  'architecture-unsecured-credit',
  'sacred-economics-crypto',
  'dao-capital-flows',
  'mrv-onchain',
  'p2p-humanitarian',
  'gitcoin-grants',
  'civic-innovation-genz',
]

function parseWritingDocument(filePath: string, rawHtml: string): WritingEntry {
  const slug = filePath.split('/').pop()?.replace(/\.html$/, '') ?? filePath
  const document = new DOMParser().parseFromString(rawHtml, 'text/html')
  const content = document.querySelector('.article-content')
  const title =
    document.querySelector('.article-title')?.textContent?.trim() ??
    slug.replace(/-/g, ' ')
  const meta =
    document.querySelector('.article-meta')?.textContent?.trim() ?? 'Essay'
  const summary =
    content
      ?.querySelector('p')
      ?.textContent?.replace(/\s+/g, ' ')
      .trim() ?? ''
  content?.querySelector('p')?.remove()
  const contentHtml = content?.innerHTML.trim() ?? ''

  return {
    slug,
    title,
    meta,
    summary,
    contentHtml,
  }
}

const writings = Object.entries(writingModules)
  .map(([filePath, rawHtml]) => parseWritingDocument(filePath, rawHtml))
  .sort((left, right) => {
    const leftIndex = writingOrder.indexOf(left.slug)
    const rightIndex = writingOrder.indexOf(right.slug)

    const normalizedLeftIndex = leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex
    const normalizedRightIndex =
      rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex

    return normalizedLeftIndex - normalizedRightIndex
  })

function getWritingFromHash(hash: string): WritingEntry | null {
  const match = hash.match(/^#\/?writing\/([\w-]+)$/)
  if (!match?.[1]) return null
  return writings.find((entry) => entry.slug === match[1]) ?? null
}

function StoryDetails({
  title,
  details,
}: {
  title: string
  details: string[]
}) {
  const contentRef = useRef<HTMLDivElement | null>(null)
  const [typedLength, setTypedLength] = useState(0)
  const [isInView, setIsInView] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [completedCount, setCompletedCount] = useState(() =>
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? details.length
      : 0,
  )

  useEffect(() => {
    const node = contentRef.current
    if (!node || completedCount >= details.length) {
      return
    }

    const observedNode = node.closest('.experience-card') ?? node

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = Boolean(entry && entry.intersectionRatio >= 0.14)
        setIsInView(visible)
        if (visible) {
          setHasStarted(true)
        }
      },
      {
        threshold: [0, 0.14, 0.3],
        rootMargin: '0px 0px -4% 0px',
      },
    )

    observer.observe(observedNode)

    return () => observer.disconnect()
  }, [completedCount, details.length])

  useEffect(() => {
    if (!hasStarted || !isInView || completedCount >= details.length) {
      return
    }

    const currentDetail = details[completedCount]
    if (!currentDetail) return
    let timeoutId: number

    if (typedLength < currentDetail.length) {
      timeoutId = window.setTimeout(() => {
        setTypedLength((current) => Math.min(current + 3, currentDetail.length))
      }, 10)
    } else {
      timeoutId = window.setTimeout(() => {
        setTypedLength(0)
        setCompletedCount((current) => current + 1)
      }, 110)
    }

    return () => window.clearTimeout(timeoutId)
  }, [completedCount, details, hasStarted, isInView, typedLength])

  return (
    <div
      ref={contentRef}
      className="experience-details"
      aria-label={`${title} role details`}
    >
      {details.map((detail, index) => {
        const isDone = index < completedCount
        const isCurrent = index === completedCount && completedCount < details.length
        const shownPart = isDone ? detail : isCurrent ? detail.slice(0, typedLength) : ''
        const hiddenPart = isDone ? '' : isCurrent ? detail.slice(typedLength) : detail
        const showCursor = isCurrent && isInView && hasStarted

        return (
          <p key={`${title}-detail-${index}`} className="experience-details__line">
            <span>{shownPart}</span>
            {showCursor ? (
              <span className="experience-details__cursor" aria-hidden="true">
                |
              </span>
            ) : null}
            {hiddenPart ? (
              <span className="experience-details__untyped" aria-hidden="true">
                {hiddenPart}
              </span>
            ) : null}
          </p>
        )
      })}
    </div>
  )
}

function ExperienceMedia({
  title,
  video,
}: {
  title: string
  video: ExperienceVideo
}) {
  const videoNodeRef = useRef<HTMLVideoElement | null>(null)
  const [shouldLoad, setShouldLoad] = useState(
    () => typeof IntersectionObserver === 'undefined',
  )

  useEffect(() => {
    if (video.renderMode !== 'video') return
    const el = videoNodeRef.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        if (entry.isIntersecting) {
          setShouldLoad(true)
        }
        if (entry.intersectionRatio >= 0.15) {
          void el.play().catch(() => undefined)
        } else {
          el.pause()
        }
      },
      {
        rootMargin: '40% 0px',
        threshold: [0, 0.15],
      },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [video.renderMode])

  if (video.renderMode === 'video') {
    return (
      <div className="experience-media">
        <div className="experience-media__video-stack" aria-label={`${title} related video`}>
          <div className="experience-media__video-shell">
            <video
              ref={videoNodeRef}
              key={`${title}-${video.src}`}
              className="experience-media__video"
              src={shouldLoad ? video.src : undefined}
              poster={video.poster}
              muted
              loop
              playsInline
              preload={shouldLoad ? 'metadata' : 'none'}
            />
          </div>
          <p className="experience-media__caption">{video.caption}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="experience-media">
      <div className="experience-media__frame" aria-label={`${title} related ASCII video`}>
        <div className="experience-media__topline">
          <span>{video.label}</span>
          <span>{video.stats}</span>
        </div>

        <div className="experience-media__body">
          <Video2Ascii
            key={`${title}-${video.src}`}
            src={video.src}
            numColumns={video.numColumns}
            colored={true}
            blend={video.blend}
            highlight={video.highlight}
            brightness={video.brightness}
            fitMode={video.fitMode}
            focalY={video.focalY}
            posterTime={video.posterTime}
            audioEffect={0}
            enableMouse={false}
            enableRipple={false}
            charset="detailed"
            isPlaying={true}
            autoPlay={true}
            className="experience-media__ascii"
          />
          <div className="experience-media__overlay">
            <p>{title}</p>
            <p>{video.caption}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

const inquiryName = (slug: string) =>
  researchRepos.find((r) => r.slug === slug)?.name ?? getField(slug)?.name ?? slug

function EssayNotes({ slug }: { slug: string }) {
  const notes = essayNotes[slug]
  if (!notes) return null
  return (
    <footer className="writing-modal__after">
      <h3>Beside this essay</h3>
      <p className="writing-modal__chips">
        {notes.threads.map((t) => (
          <a key={t} href={`#/research?t=${t}`}>
            {threadById(t).title}
          </a>
        ))}
      </p>
      {notes.inquiries?.length ? (
        <>
          <h4>Research that sits with it</h4>
          <ul>
            {notes.inquiries.map((s) => (
              <li key={s}>
                <a href={`#/research/${s}`}>{inquiryName(s)}</a>
              </li>
            ))}
          </ul>
        </>
      ) : null}
      <h4>Further reading</h4>
      <WorkList ids={notes.reading} />
    </footer>
  )
}

function WritingReaderModal({
  writing,
  onClose,
}: {
  writing: WritingEntry
  onClose: () => void
}) {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    closeBtnRef.current?.focus({ preventScroll: true })

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  return (
    <div
      className="writing-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`writing-title-${writing.slug}`}
      onClick={onClose}
    >
      <div className="writing-modal__backdrop" />

      <div
        className="writing-modal__shell"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="writing-modal__chrome">
          <p className="writing-modal__eyebrow">reading mode / archive</p>
          <button
            ref={closeBtnRef}
            type="button"
            className="writing-modal__close"
            onClick={onClose}
            aria-label={`Close ${writing.title}`}
          >
            close
          </button>
        </div>

        <article className="writing-modal__article">
          <header className="writing-modal__header">
            <p className="writing-modal__meta">{writing.meta}</p>
            <h2 id={`writing-title-${writing.slug}`}>{writing.title}</h2>
            <p className="writing-modal__summary">{writing.summary}</p>
          </header>

          <div
            className="writing-modal__content"
            dangerouslySetInnerHTML={{ __html: writing.contentHtml }}
          />
          <EssayNotes slug={writing.slug} />
        </article>
      </div>
    </div>
  )
}

function SocialIcon({ id }: { id: SocialLink['id'] }) {
  switch (id) {
    case 'x':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M18.244 2H21l-6.57 7.51L22.16 22h-6.05l-4.74-6.77L5.45 22H2.69l7.03-8.03L2.34 2h6.2l4.28 6.13L18.244 2Zm-0.97 18.34h1.53L7.71 3.57H6.07l11.204 16.77Z"
          />
        </svg>
      )
    case 'github':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 2C6.477 2 2 6.589 2 12.25c0 4.528 2.865 8.369 6.839 9.724.5.096.682-.223.682-.495 0-.245-.009-.894-.014-1.755-2.782.62-3.369-1.39-3.369-1.39-.455-1.189-1.11-1.505-1.11-1.505-.908-.638.069-.625.069-.625 1.004.073 1.532 1.059 1.532 1.059.892 1.567 2.341 1.115 2.91.852.091-.666.349-1.115.635-1.372-2.221-.261-4.555-1.14-4.555-5.074 0-1.121.39-2.037 1.029-2.755-.103-.262-.446-1.314.098-2.74 0 0 .84-.277 2.75 1.052A9.305 9.305 0 0 1 12 6.836c.85.004 1.706.118 2.505.346 1.909-1.329 2.748-1.052 2.748-1.052.546 1.426.202 2.478.1 2.74.64.718 1.027 1.634 1.027 2.755 0 3.944-2.337 4.809-4.566 5.064.359.318.68.946.68 1.907 0 1.377-.012 2.488-.012 2.826 0 .274.18.596.688.494C19.138 20.615 22 16.776 22 12.25 22 6.589 17.523 2 12 2Z"
          />
        </svg>
      )
    case 'linkedin':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M6.94 8.5H3.56V20h3.38V8.5ZM5.25 3C4.17 3 3.3 3.9 3.3 5s.87 2 1.95 2 1.95-.9 1.95-2S6.33 3 5.25 3Zm15.45 9.86c0-3.48-1.82-5.1-4.56-5.1-2.11 0-3.05 1.19-3.58 2.03V8.5H9.18c.04.85 0 11.5 0 11.5h3.38v-6.42c0-.34.02-.68.12-.92.27-.68.88-1.39 1.91-1.39 1.35 0 1.89 1.05 1.89 2.58V20H20v-6.78Z"
          />
        </svg>
      )
    case 'telegram':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M21.448 4.478a1.55 1.55 0 0 0-1.72-.223L3.804 10.93c-.76.323-.72 1.416.062 1.682l3.934 1.34 1.498 4.626c.232.718 1.126.91 1.617.346l2.196-2.522 4.31 3.183c.626.463 1.523.122 1.682-.64l2.522-12.13a1.56 1.56 0 0 0-.177-1.337ZM9.12 13.264l8.75-5.366-6.967 6.996a.82.82 0 0 0-.22.391l-.605 2.616-.958-2.957Zm8.63 4.244-4.044-2.988 5.903-5.928-1.86 8.916Z"
          />
        </svg>
      )
  }
}

function SiteHeader({ onNavigateSection }: { onNavigateSection?: () => void }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 36)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  const closeMenu = () => {
    setMenuOpen(false)
    onNavigateSection?.()
  }

  return (
    <header className={`site-header${isScrolled ? ' is-scrolled' : ''}${menuOpen ? ' is-menu-open' : ''}`}>
      <div className="site-header__bar">
        <a
          href="#top"
          className="hero-name site-header__brand"
          onClick={(event) => {
            event.preventDefault()
            closeMenu()
            if (window.location.hash) {
              window.history.replaceState(null, '', window.location.pathname + window.location.search)
            }
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        >
          shaan patel
        </a>

        <nav className="site-header__nav" aria-label="Primary sections">
          <a href="#frontiers">frontiers</a>
          <a href="#systems">systems</a>
          <a href="#archive">work</a>
          <a href="#writings">writings</a>
          <a href="#/research" className="site-header__research-link">
            research (13)
          </a>
          <a href="#install">cli</a>
        </nav>

        <div className="site-header__controls">
          <a href="#/research" className="site-header__mobile-research">
            research
          </a>
          <AmbientSoundControl />
          <button
            type="button"
            className="site-header__menu-btn"
            aria-expanded={menuOpen}
            aria-controls="site-mobile-drawer"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="site-header__menu-icon" aria-hidden="true">
              <i />
              <i />
            </span>
            <span>{menuOpen ? 'close' : 'index'}</span>
          </button>
        </div>
      </div>

      {menuOpen ? (
        <>
          <div
            className="site-drawer-backdrop"
            aria-hidden="true"
            onClick={() => setMenuOpen(false)}
          />
          <nav
            id="site-mobile-drawer"
            className="site-drawer"
            aria-label="Mobile navigation"
          >
            <a href="#about" onClick={closeMenu}>
              <span>01</span> Foundations &amp; About
            </a>
            <a href="#frontiers" onClick={closeMenu}>
              <span>02</span> Breakthroughs &amp; Approaching Frontiers
            </a>
            <a href="#archive" onClick={closeMenu}>
              <span>03</span> Proof of Work
            </a>
            <a href="#systems" onClick={closeMenu}>
              <span>04</span> Systems &amp; Publications
            </a>
            <a href="#writings" onClick={closeMenu}>
              <span>05</span> Essays &amp; Writings
            </a>
            <a href="#install" onClick={closeMenu}>
              <span>06</span> Terminal Companion (spatel)
            </a>
            <a href="#/research" className="site-drawer__highlight" onClick={closeMenu}>
              <span>↗</span> Research Monograph (13) &amp; Commonplace Book
            </a>
          </nav>
        </>
      ) : null}
    </header>
  )
}

function App() {
  const heroVideoSrc = '/ascii/hero-blackhole.mp4'
  const aboutVideoSrc = '/ascii/about-flower.mp4'

  const [activeWriting, setActiveWriting] = useState<WritingEntry | null>(() =>
    typeof window !== 'undefined' ? getWritingFromHash(window.location.hash) : null,
  )
  const [installTab, setInstallTab] = useState(0)
  const [modelTab, setModelTab] = useState(0)

  const openedViaPushRef = useRef(false)
  const triggerElementRef = useRef<HTMLElement | null>(null)

  const openWriting = useCallback((writing: WritingEntry) => {
    triggerElementRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    openedViaPushRef.current = true
    window.history.pushState(null, '', `#writing/${writing.slug}`)
    setActiveWriting(writing)
  }, [])

  const closeWriting = useCallback(() => {
    const restoreFocus = () => {
      const trigger = triggerElementRef.current
      triggerElementRef.current = null
      if (trigger) {
        window.requestAnimationFrame(() => trigger.focus({ preventScroll: true }))
      }
    }

    if (openedViaPushRef.current) {
      openedViaPushRef.current = false
      window.history.back()
      restoreFocus()
      return
    }

    if (window.location.hash.startsWith('#writing/') || window.location.hash.startsWith('#/writing/')) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
    }
    setActiveWriting(null)
    restoreFocus()
  }, [])

  useEffect(() => {
    const syncFromLocation = () => {
      const fromHash = getWritingFromHash(window.location.hash)
      if (!fromHash) {
        openedViaPushRef.current = false
      }
      setActiveWriting(fromHash)
    }

    window.addEventListener('hashchange', syncFromLocation)
    window.addEventListener('popstate', syncFromLocation)
    return () => {
      window.removeEventListener('hashchange', syncFromLocation)
      window.removeEventListener('popstate', syncFromLocation)
    }
  }, [])

  // Arriving from a research page via an in-page anchor such as #systems.
  useEffect(() => {
    const id = window.location.hash.slice(1)
    if (id && !id.startsWith('/') && !id.startsWith('writing/')) {
      window.requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView())
    }
  }, [])

  const activeInstall = installOptions[installTab] ?? installOptions[0]
  const activeModelCmd = modelCommands[modelTab] ?? modelCommands[0]

  return (
    <div className="page-shell" id="top">
      <div className="page-noise" />
      <SiteHeader />

      <main className="page-main">
        <section className="hero-panel">
          <div className="hero-panel__ascii-background" aria-hidden="true">
            <Video2Ascii
              key={`hero-${heroVideoSrc}`}
              src={heroVideoSrc}
              numColumns={176}
              colored={true}
              blend={14}
              highlight={0}
              brightness={1.24}
              fitMode="ambient"
              focalY={0.36}
              posterTime={2.0}
              audioEffect={0}
              enableMouse={false}
              enableRipple={false}
              charset="detailed"
              isPlaying={true}
              autoPlay={true}
              priority={true}
              className="hero-panel__ascii-surface"
            />
          </div>
          <div className="hero-panel__background-tint" />

          <div className="hero-copy">
            <div className="hero-copy__spacer" aria-hidden="true" />

            <div className="hero-copy__bottom">
              <p className="hero-eyebrow">ml assurance · certified security · verifiable markets · socio-economic design</p>
              <h1 className="hero-summary">
                Independent ML, security, and socio-economic systems researcher &amp;
                operator—building certified agent kernels, bit-priced evaluation
                ledgers, verifiable compute, and coherent market &amp; cultural
                infrastructure.
              </h1>

              <div className="hero-actions">
                <a href="#frontiers" className="button button--solid">
                  breakthroughs &amp; frontiers
                </a>
                <a href="#/research" className="button button--accent">
                  research monograph (13)
                </a>
                <a href="#about" className="button button--ghost">
                  foundations
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="about-section" id="about">
          <div className="section-heading">
            <p className="eyebrow">01 / foundations</p>
            <h2>A fuller picture of myself.</h2>
          </div>

          <div className="about-showcase">
            <div className="media-frame">
              <div className="media-frame__body">
                <Video2Ascii
                  key={`about-${aboutVideoSrc}`}
                  src={aboutVideoSrc}
                  numColumns={104}
                  colored={true}
                  blend={8}
                  highlight={18}
                  brightness={1.15}
                  posterTime={1.0}
                  audioEffect={0}
                  enableMouse={true}
                  enableRipple={true}
                  charset="detailed"
                  isPlaying={true}
                  autoPlay={true}
                  enableSpacebarToggle={true}
                  className="video-ascii"
                />
                <span className="media-frame__hint" aria-hidden="true">
                  interactive · tap or move
                </span>
                <article className="about-copy-card about-copy-card--overlay about-copy-card--desktop">
                  <p className="eyebrow">about me / beyond the cv</p>
                  <h3>Research-minded builder with an eye for beauty in systems and design.</h3>
                  <h4 className="about-quote">
                    I like to think that our collective actions become notes in the opening melody of the symphony of life.
                  </h4>
                </article>
              </div>

              <article className="about-copy-card about-copy-card--mobile">
                <p className="eyebrow">about me / beyond the cv</p>
                <h3>Research-minded builder with an eye for beauty in systems and design.</h3>
                <p className="about-quote">
                  I like to think that our collective actions become notes in the opening melody of the symphony of life.
                </p>
              </article>
            </div>
          </div>

          <div className="foundation-grid">
            {foundations.map((item) => (
              <article key={item} className="foundation-card">
                <p>{item}</p>
              </article>
            ))}

            {showDigitalLibrary && (
              <article className="foundation-card foundation-card--link">
                <p className="foundation-card__eyebrow">digital library / in progress</p>
                <p>
                  A home for my future multimedia archive across research, visuals,
                  field notes, references, and living artifacts.
                </p>
                <a
                  className="foundation-card__cta"
                  href={digitalLibraryHref}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open digital library
                </a>
              </article>
            )}

            <article className="foundation-card foundation-card--link foundation-card--essay">
              <p className="foundation-card__eyebrow">favorite blog / ribbonfarm</p>
              <h3>Psychohistory</h3>
              <p>
                Venkatesh Rao&apos;s essays helped me see history, technology, and
                institutions as living systems shaped by narrative, incentives,
                and long arcs of coordination.
              </p>
              <p className="foundation-card__note">
                It taught me to look for the hidden currents beneath events:
                streams, equilibria, infrastructure, mood, and the stories
                people use to make complexity feel legible.
              </p>
              <a
                className="foundation-card__cta"
                href={favoriteBlogHref}
                target="_blank"
                rel="noreferrer"
              >
                Read Psychohistory
              </a>
            </article>

            <article className="foundation-card foundation-card--link foundation-card--terminal">
              <p className="foundation-card__eyebrow">a terminal version of me</p>
              <h3>spatel</h3>
              <p>
                A small command-line companion built from my CV, writing, and
                working notes. You can ask it questions, browse the context it
                draws from, or run it entirely on your own machine.
              </p>
              <p className="foundation-card__note">
                I find that interesting because it treats a personal archive as
                something inspectable and portable, not a polished substitute
                for a person. It is an invitation to follow the threads behind
                the résumé and keep the conversation grounded in real work.
              </p>
              <a className="foundation-card__cta" href="#install">
                See how it works
              </a>
            </article>

            <article className="foundation-card foundation-card--socials">
              <p className="foundation-card__eyebrow">find me elsewhere</p>
              <p>
                I share thoughts, code, writing, and ongoing work across these
                corners of the internet.
              </p>
              <div className="social-links" aria-label="Social links">
                {socialLinks.map((link) => (
                  <a
                    key={link.id}
                    className="social-link"
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={link.label}
                    title={link.label}
                  >
                    <SocialIcon id={link.id} />
                  </a>
                ))}
              </div>
            </article>
          </div>
        </section>

        <FrontiersSection
          onOpenEssay={(slug) => {
            const writing = writings.find((entry) => entry.slug === slug)
            if (writing) {
              openWriting(writing)
            }
          }}
        />

        <section className="archive-section" id="archive">
          <div className="section-heading">
            <p className="eyebrow">03 / Proof of work</p>
            <h2>Experiences that I&apos;m proud of</h2>
          </div>

          <div className="experience-stack">
            {experienceCards.map((card) => {
              const hasForegroundMedia = card.video.renderMode === 'video'

              return (
                <article
                  className={`experience-card${card.secondaryVideo ? ' experience-card--with-background' : ''}${hasForegroundMedia ? '' : ' experience-card--copy-only'}`}
                  key={card.title}
                >
                  {card.secondaryVideo ? (
                    <div className="experience-card__background" aria-hidden="true">
                      <Video2Ascii
                        key={`${card.title}-${card.secondaryVideo.src}-background`}
                        src={card.secondaryVideo.src}
                        numColumns={card.secondaryVideo.numColumns}
                        colored={true}
                        blend={card.secondaryVideo.blend}
                        highlight={card.secondaryVideo.highlight}
                        brightness={card.secondaryVideo.brightness}
                        fitMode={card.secondaryVideo.fitMode}
                        focalY={card.secondaryVideo.focalY}
                        posterTime={card.secondaryVideo.posterTime}
                        audioEffect={0}
                        enableMouse={false}
                        enableRipple={false}
                        charset="detailed"
                        isPlaying={true}
                        autoPlay={true}
                        className="experience-card__background-ascii"
                      />
                      <div className="experience-card__background-tint" />
                    </div>
                  ) : null}

                  <div className="experience-card__copy">
                    <p className="eyebrow">{card.eyebrow}</p>
                    <h3>{card.title}</h3>
                    <p className="experience-card__role">{card.role}</p>
                    {card.summary ? <p>{card.summary}</p> : null}
                    <StoryDetails title={card.title} details={card.details} />
                    {card.links?.length ? (
                      <div className="experience-card__links" aria-label={`${card.title} links`}>
                        {card.links.map((link) => (
                          <a
                            key={link.href}
                            className="experience-card__link"
                            href={link.href}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <span>{link.label}</span>
                            <span>{link.description}</span>
                          </a>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  {hasForegroundMedia ? (
                    <ExperienceMedia
                      title={card.title}
                      video={card.video}
                    />
                  ) : null}
                </article>
              )
            })}
          </div>
        </section>

        <section className="systems-section" id="systems">
          <div className="systems-intro">
            <div className="section-heading systems-intro__heading">
              <p className="eyebrow">04 / systems &amp; publications</p>
              <h2>Making technical claims earn their weight.</h2>
            </div>

            <div className="systems-intro__copy">
              <p>
                Recent work has centered on the machinery around consequential
                systems: how we generate tests, bound authority, preserve
                provenance, and distinguish a useful local result from a claim
                the world can rely on.
              </p>
              <p className="systems-intro__note">
                Source availability and the qualification below each project are
                part of the work, not fine print.
              </p>
            </div>
          </div>

          <article className="featured-essay" aria-labelledby="featured-essay-title">
            <div className="featured-essay__meta">
              <span>Flagship essay</span>
              <span>Safety · Security · Intelligence · Sovereignty · Privacy</span>
            </div>
            <h3 id="featured-essay-title">
              Evidence-Bounded Intelligence: Why Authority Over AI Systems Should
              Follow Evidence, Not Capability
            </h3>
            <p className="featured-essay__summary">
              A long-form position built from my own experiments, and mostly
              from the ones that failed. Every figure is tagged to a repository
              report, and every claim carries its ceiling.
            </p>
            <div className="featured-essay__metrics" aria-label="Selected findings">
              <div>
                <strong>0 / 59,200</strong>
                <span>holdout certificate violations across 9/9 pre-registered hypotheses (Wald 100% wrong under attack)</span>
              </div>
              <div>
                <strong>0 / 552</strong>
                <span>unsafe admissions in hostile sessions across Python, Rust, Kani &amp; Lean 4 kernels</span>
              </div>
              <div>
                <strong>0.95 vs 0.27</strong>
                <span>held-out safety refusal retention under benign OOD fine-tuning vs replay</span>
              </div>
              <div>
                <strong>15.4% vs 53.6%</strong>
                <span>two safety graders on the same outputs, plus 62% benign prompts flagged unsafe</span>
              </div>
            </div>
            <div className="featured-essay__actions">
              <button
                type="button"
                className="featured-essay__cta featured-essay__cta--primary"
                onClick={() => {
                  const writing = writings.find(
                    (entry) => entry.slug === 'approaching-breakthroughs-across-systems',
                  )

                  if (writing) {
                    openWriting(writing)
                  }
                }}
              >
                Read 2026 portfolio synthesis
              </button>
              <button
                type="button"
                className="featured-essay__cta featured-essay__cta--primary"
                onClick={() => {
                  const writing = writings.find(
                    (entry) => entry.slug === 'evidence-bounded-intelligence',
                  )

                  if (writing) {
                    openWriting(writing)
                  }
                }}
              >
                Read Evidence-Bounded Intelligence
              </button>
              <a className="featured-essay__cta featured-essay__cta--secondary" href="#/research">
                Inspect all 13 research pages <span aria-hidden="true">→</span>
              </a>
              <a className="featured-essay__cta featured-essay__cta--secondary" href="#/research?t=failure">
                The reading behind the work <span aria-hidden="true">→</span>
              </a>
            </div>
          </article>

          <article className="featured-paper" aria-labelledby="featured-paper-title">
            <a
              className="featured-paper__art"
              href="https://arxiv.org/abs/2609.09582"
              target="_blank"
              rel="noreferrer"
              aria-label="Open the ECDSA.Fail paper on arXiv"
            >
              <ParetoChart />
              <span className="featured-paper__art-label">ECDSA.FAIL / OPEN AUTORESEARCH</span>
            </a>

            <div className="featured-paper__body">
              <div className="featured-paper__meta">
                <span>Featured research</span>
                <span>arXiv:2609.09582 · v2 · 19 Sep 2026</span>
              </div>
              <h3 id="featured-paper-title">
                ECDSA.Fail: Open Autoresearch for Optimizing Elliptic-Curve Point
                Addition in Shor’s Algorithm
              </h3>
              <p className="featured-paper__summary">
                A public, evaluator-verified research loop for improving reversible
                secp256k1 point-addition circuits, a costly primitive inside
                Shor’s algorithm.
              </p>
              <div className="featured-paper__metrics" aria-label="Selected paper results">
                <div>
                  <strong>−86.1%</strong>
                  <span>score reduction reported by participants</span>
                </div>
                <div>
                  <strong>1.496B</strong>
                  <span>Q × T best score at the paper’s 26 Jul cutoff</span>
                </div>
              </div>
              <p className="featured-paper__qualification">
                The paper reports a later 1.259B score separately. Its coherent
                windowed variant is evaluated as a per-call sensitivity model,
                not a full-Shor success estimate; comparisons use different
                interfaces and accounting conventions.
              </p>
              <div className="featured-paper__actions">
                <a href="https://arxiv.org/abs/2609.09582" target="_blank" rel="noreferrer">
                  Read the paper <span aria-hidden="true">↗</span>
                </a>
                <a href="https://github.com/Layr-Labs/ecdsafail-challenge" target="_blank" rel="noreferrer">
                  Explore the challenge <span aria-hidden="true">↗</span>
                </a>
                <a href="https://ecdsa.fail/" target="_blank" rel="noreferrer">
                  Visit ECDSA.fail <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>
          </article>

          <div className="systems-ledger" aria-label="Current systems work">
            {systemsProjects.map((project) => (
              <article className="systems-project" key={project.title}>
                <p className="systems-project__index" aria-hidden="true">
                  {project.index}
                </p>

                <div className="systems-project__content">
                  <p className="systems-project__discipline">{project.discipline}</p>
                  <h3>{project.title}</h3>
                  <p className="systems-project__summary">{project.summary}</p>
                  <p className="systems-project__boundary">
                    <span>Evidence boundary</span>
                    {project.boundary}
                  </p>
                  {project.essaySlug ? (
                    <button
                      type="button"
                      className="systems-project__essay"
                      onClick={() => {
                        const writing = writings.find(
                          (entry) => entry.slug === project.essaySlug,
                        )

                        if (writing) {
                          openWriting(writing)
                        }
                      }}
                    >
                      Read essay
                    </button>
                  ) : null}
                </div>

                {project.links?.length ? (
                  <div
                    className={`systems-project__links${
                      project.linkLayout === 'stacked'
                        ? ' systems-project__links--stacked'
                        : ''
                    }`}
                    aria-label={`${project.title} links`}
                  >
                    {project.links.map((link) => (
                      <a
                        key={link.href}
                        className="systems-project__link"
                        href={link.href}
                        target={link.href.startsWith('#') ? undefined : '_blank'}
                        rel="noreferrer"
                      >
                        <span>{link.label}</span>
                        <span>{link.description}</span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="systems-project__access">{project.access}</p>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="writings-section" id="writings">
          <div className="section-heading">
            <p className="eyebrow">05 / writings</p>
            <h2>Essays and open-systems notes.</h2>
            <p className="writings-section__intro">
              These writings sit closest to how I think about public goods,
              coordination, infrastructure, civic experimentation, and the
              kinds of systems that deserve long-term stewardship. The most
              recent are a research series on AI evolution, intelligence,
              safety, and security, written with their failures included.
            </p>
          </div>

          <div className="writings-panel">
            <div className="writings-grid" aria-label="Writing archive">
              {writings.map((writing) => (
                <button
                  key={writing.slug}
                  type="button"
                  className="writing-card"
                  onClick={() => openWriting(writing)}
                >
                  <p className="writing-card__meta">{writing.meta}</p>
                  <h3>{writing.title}</h3>
                  <p>{writing.summary}</p>
                  <span className="writing-card__cta">Open essay</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="install-section" id="install">
          <div className="section-heading">
            <p className="eyebrow">06 / terminal path</p>
            <h2>Install the terminal version of me.</h2>
          </div>

          <div className="install-grid">
            <div className="terminal-card">
              <div className="terminal-card__bar">
                <span />
                <span />
                <span />
              </div>
              <pre>{`$ spatel --build-pico-model
built shaanpatel-cv-pico........... ok

$ spatel --ask "What breakthroughs are you building toward?"
bit-priced holdouts for unattended RSI,
certified Python/Rust/Lean agent kernels,
planted-flaw ML benchmarks, Statebook
market coherence, and scholar-checked
computational humanities.

press [/] inside the TUI to ask live
press [tab] to toggle answer history
press [q] to quit`}</pre>
            </div>

            <div className="install-options install-options--desktop">
              {installOptions.map((option) => (
                <article key={option.label} className="install-option">
                  <p className="install-option__label">{option.label}</p>
                  <h3>{option.title}</h3>
                  <CopyCommand command={option.command} />
                  <p>{option.note}</p>
                </article>
              ))}
            </div>

            <div className="cli-switcher install-options--mobile">
              <div className="cli-switcher__tabs" role="tablist" aria-label="Install methods">
                {installOptions.map((option, index) => (
                  <button
                    key={option.label}
                    type="button"
                    role="tab"
                    aria-selected={installTab === index}
                    className={`cli-switcher__tab${installTab === index ? ' is-active' : ''}`}
                    onClick={() => setInstallTab(index)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {activeInstall ? (
                <article className="install-option">
                  <p className="install-option__label">{activeInstall.label}</p>
                  <h3>{activeInstall.title}</h3>
                  <CopyCommand command={activeInstall.command} />
                  <p>{activeInstall.note}</p>
                </article>
              ) : null}
            </div>
          </div>
        </section>

        <section className="model-section" id="model">
          <div className="section-heading">
            <p className="eyebrow">07 / personal model</p>
            <h2>Ask the terminal version of me.</h2>
            <p className="model-section__intro">
              <code>spatel</code> is no longer only a browser for my CV. It now ships as a
              grounded personal Q&amp;A surface with a local corpus, a tiny Ollama
              model path, a chat shell, and a TUI question prompt.
            </p>
          </div>

          <div className="model-grid">
            <article className="model-terminal">
              <div className="model-terminal__bar">
                <span />
                <span />
                <span />
              </div>
              <pre>{`$ spatel --ask "How do you think about public goods?"
Gitcoin matters to me because it turned
caring about public goods into allocative
power. My view now is that public-goods
funding needs a stack: quadratic funding,
retroactive rewards, delegated judgment,
and long-lived support for maintenance.

sources: Gitcoin and Public Goods Funding
mode: persona model`}</pre>
            </article>

            <div className="model-stack">
              {modelHighlights.map((item) => (
                <article key={item.title} className="model-card">
                  <p className="model-card__eyebrow">{item.eyebrow}</p>
                  <h3>{item.title}</h3>
                  <p>
                    <Inline text={item.body} />
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="model-command-grid model-command-grid--desktop">
            {modelCommands.map((item) => (
              <article key={item.title} className="model-command">
                <p className="model-command__label">{item.label}</p>
                <h3>{item.title}</h3>
                <CopyCommand command={item.command} />
                <p>
                  <Inline text={item.note} />
                </p>
              </article>
            ))}
          </div>

          <div className="cli-switcher model-command-grid--mobile">
            <div className="cli-switcher__tabs" role="tablist" aria-label="Model commands">
              {modelCommands.map((item, index) => (
                <button
                  key={item.label}
                  type="button"
                  role="tab"
                  aria-selected={modelTab === index}
                  className={`cli-switcher__tab${modelTab === index ? ' is-active' : ''}`}
                  onClick={() => setModelTab(index)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            {activeModelCmd ? (
              <article className="model-command">
                <p className="model-command__label">{activeModelCmd.label}</p>
                <h3>{activeModelCmd.title}</h3>
                <CopyCommand command={activeModelCmd.command} />
                <p>
                  <Inline text={activeModelCmd.note} />
                </p>
              </article>
            ) : null}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="site-footer__inner">
          <div className="site-footer__brand">
            <span className="site-footer__name">shaan patel</span>
            <span className="site-footer__tagline">systems · terminals · environments</span>
          </div>

          <nav className="site-footer__links" aria-label="Footer navigation">
            <a href="#top">top ↑</a>
            <a href="#frontiers">frontiers</a>
            <a href="#systems">systems</a>
            <a href="#writings">writings</a>
            <a href="#/research">research (13)</a>
            <a href="#install">cli</a>
          </nav>

          <div className="site-footer__socials" aria-label="Social profiles">
            {socialLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                aria-label={link.label}
                title={link.label}
              >
                <SocialIcon id={link.id} />
              </a>
            ))}
          </div>
        </div>
      </footer>

      {activeWriting ? (
        <WritingReaderModal
          writing={activeWriting}
          onClose={closeWriting}
        />
      ) : null}
    </div>
  )
}

export default App
