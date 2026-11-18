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
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}

const cliCommands = [
  {
    group: 'install',
    label: 'cargo',
    title: 'Install from source',
    command: 'cargo install --git https://github.com/Epistetechnician/spatel-cv.git --bin spatel',
    note: 'Installs the terminal browser and grounded Q&A engine directly from the repository.',
  },
  {
    group: 'install',
    label: 'curl',
    title: 'One-line shell install',
    command: 'curl -fsSL https://raw.githubusercontent.com/Epistetechnician/spatel-cv/master/install.sh | sh',
    note: 'Fetches the latest prebuilt binary for macOS or Linux.',
  },
  {
    group: 'install',
    label: 'gh',
    title: 'GitHub release binary',
    command: 'gh release download --repo Epistetechnician/spatel-cv --pattern "spatel-*"',
    note: 'Downloads release tarballs directly via the GitHub CLI.',
  },
  {
    group: 'run',
    label: 'ask',
    title: 'Ask one grounded question',
    command: 'spatel --ask "What are you working on right now?"',
    note: 'Retrieves relevant CV entries and essay notes before answering.',
  },
  {
    group: 'run',
    label: 'chat',
    title: 'Interactive shell',
    command: 'spatel --chat',
    note: 'Opens a conversational session grounded in working notes and essays.',
  },
  {
    group: 'run',
    label: 'model',
    title: 'Build local Ollama model',
    command: 'spatel --build-pico-model',
    note: 'Creates `shaanpatel-cv-pico` atop a local `qwen2.5:0.5b` base; falls back offline if absent.',
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

  return (
    <div className="sound-toggle">
      <div id="landing-music-player" className="sound-toggle__player" />
      <button
        type="button"
        className={`sound-toggle__btn${playback === 'playing' ? ' is-playing' : ''}`}
        onClick={toggleSound}
        disabled={playback === 'loading'}
        aria-pressed={playback === 'playing'}
        aria-label={playback === 'playing' ? 'Mute ambient audio' : 'Play ambient audio'}
      >
        <span className="sound-bars" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="sound-toggle__text">
          {playback === 'playing' ? 'Sound on' : playback === 'loading' ? 'Loading' : 'Sound'}
        </span>
      </button>
    </div>
  )
}

const experienceCards: ExperienceCard[] = [
  {
    eyebrow: '2025 — 2026',
    title: 'Halo Labs',
    role: 'Co-Founder & COO',
    summary:
      'Leading research on a confidential stablecoin network and verifiable AI inside trusted execution environments, alongside documentation, developer onboarding, and ecosystem partnerships.',
    details: [
      'Research on verifiable AI execution combining TEEs and zero-knowledge proofs.',
      'Authored technical documentation and light-client onboarding guides.',
      'Coordinated infrastructure partnerships across Phala, Fairblocks, and ecosystem teams.',
    ],
    video: {
      src: '/ascii/loomhalo-web.mp4',
      poster: '/ascii/loomhalo-poster.jpg',
      label: 'halo labs / light client',
      caption: 'Halo light-client walkthrough',
      stats: 'live walkthrough',
      renderMode: 'video',
      numColumns: 88,
      blend: 18,
      highlight: 14,
      brightness: 1.24,
    },
    links: [
      {
        href: 'https://docs.halo-labs.xyz/',
        label: 'Halo Documentation',
        description: 'Architecture and protocol docs',
      },
      {
        href: 'https://github.com/Halo-Labs-xyz/halo-verus',
        label: 'Halo Verus',
        description: 'Verifiable AI with TEEs & ZK',
      },
      {
        href: 'https://honeysuckle-snowplow-195.notion.site/halomodular-2b40848a31bf80ff89ffe52c7f6fac59?source=copy_link',
        label: 'Modular Privacy Note',
        description: 'Research memo on modular privacy',
      },
    ],
    secondaryVideo: {
      src: '/ascii/lorenz.mp4',
      label: 'lorenz attractor',
      caption: 'Lorenz chaotic system in ASCII',
      stats: 'rendered',
      renderMode: 'ascii',
      fitMode: 'ambient',
      focalY: 0.42,
      posterTime: 4,
      numColumns: 96,
      blend: 12,
      highlight: 18,
      brightness: 1.25,
    },
  },
  {
    eyebrow: '2024 — 2025',
    title: 'NPC Capital',
    role: 'Full-Stack Developer & Researcher',
    summary:
      'Liquid digital-asset fund focused on decentralized market structure, built in partnership with Polygon.',
    details: [
      'Designed operator and investor heads-up displays for live portfolio context.',
      'Built cross-chain data pipelines informing capital allocation decisions.',
      'Collaborated with Hyperliquid validators to evaluate real-yield strategies.',
    ],
    video: {
      src: '/ascii/npc-skyline.mp4',
      label: 'markets / skyline',
      caption: 'Skyline ASCII study',
      stats: 'synced',
      numColumns: 96,
      blend: 10,
      highlight: 10,
      brightness: 1.18,
    },
    secondaryVideo: {
      src: '/ascii/npc-skyline.mp4',
      label: 'npc skyline',
      caption: 'Skyline in ASCII',
      stats: 'rendered',
      renderMode: 'ascii',
      posterTime: 2,
      numColumns: 124,
      blend: 8,
      highlight: 14,
      brightness: 1.15,
    },
    links: [
      {
        href: 'https://npcgroup.xyz/',
        label: 'NPC Capital',
        description: 'Fund overview',
      },
    ],
  },
  {
    eyebrow: '2022 — 2024',
    title: 'Public Goods & Open Source',
    role: 'Solana Foundation, Celo, Dream DAO, Eco DAO',
    summary:
      'Developer documentation, public-goods funding design, and governance stewardship across open-source communities.',
    details: [
      'Solana Foundation: Tightened SDK versioning, examples, and developer lessons.',
      'Celo: Shaped public-goods strategy around account abstraction and quadratic funding.',
      'Dream DAO & Eco DAO: Co-stewarded builder cohorts, governance tooling, and ecological primitives.',
    ],
    video: {
      src: '/ascii/public-goods-nature.mp4',
      label: 'commons',
      caption: 'Canopy in ASCII',
      stats: 'alive',
      numColumns: 92,
      blend: 6,
      highlight: 16,
      brightness: 1.1,
    },
    secondaryVideo: {
      src: '/ascii/public-goods-nature.mp4',
      label: 'canopy',
      caption: 'Forest canopy in ASCII',
      stats: 'rendered',
      renderMode: 'ascii',
      posterTime: 2,
      numColumns: 120,
      blend: 6,
      highlight: 16,
      brightness: 1.08,
    },
  },
]

const foundations = [
  {
    label: 'Discipline',
    body: 'Trained in Economics and Data Science, with early work in sustainable development and environmental impact assessment. Drawn to where formal mechanisms meet living, adaptive systems.',
  },
  {
    label: 'Questions',
    body: 'Products and protocols that make complex environments legible and accountable: verifiable AI, cryptographic assurance, market coherence, governance design, and durable public goods.',
  },
  {
    label: 'Off-screen',
    body: 'Permaculture, DIY engineering, long runs, bike rides, cooking, yoga, soccer, chess, Go, and Catan.',
  },
]

const favoriteBlogHref = 'https://www.ribbonfarm.com/series/psychohistory/'

const socialLinks: SocialLink[] = [
  { id: 'x', label: 'X', href: 'https://x.com/epistetechnic' },
  { id: 'github', label: 'GitHub', href: 'https://github.com/Epistetechnician' },
  { id: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/shaan-patel21/' },
  { id: 'telegram', label: 'Telegram', href: 'https://t.me/epistetechnician' },
]

const systemsProjects: SystemsProject[] = [
  {
    index: '01',
    title: 'Holdout Ledger',
    discipline: 'Adaptive evaluation integrity',
    summary:
      'A pre-registered hash-chained ledger pricing the verdict bits a sealed holdout releases to a self-improvement loop against output description length—0 certificate violations across 59,200 confirmatory runs while standard Wald bounds fail under adaptive reuse.',
    boundary:
      'Confirmed on tabular ensembles and stylized patch proposers with core Lean 4 counting proofs; gains around 0.001 remain uncertifiable up to n = 100,000.',
    links: [
      {
        href: '#/research/holdout-ledger',
        label: 'Research page & demo',
        description: '59,200-run table & MDL simulator',
      },
      {
        href: 'https://github.com/Epistetechnician/holdout-ledger',
        label: 'Repository',
        description: 'PREREG.md & HoldoutLedger.lean',
      },
    ],
  },
  {
    index: '02',
    title: 'FormaSec & Security Alignment OS',
    discipline: 'Certified kernels & hardware attestation',
    summary:
      'Separating untrusted LLM proposers from small admission kernels: Python, Kani-checked Rust, and Lean 4 agree across 600 cases with 0 unsafe admissions over 552 hostile proposals, paired with a 279-test capability broker attested on Intel TDX.',
    boundary:
      'Solver proof objects sit outside the Lean TCB, and the TDX run is a single-host attestation awaiting independent second-host replication.',
    links: [
      {
        href: '#/research/formasec',
        label: 'FormaSec',
        description: 'Python / Rust / Lean kernel & DAG checker',
      },
      {
        href: '#/research/security-alignment-os',
        label: 'Security Alignment OS',
        description: 'Capability broker & TDX attestation',
      },
    ],
  },
  {
    index: '03',
    title: 'Statebook',
    discipline: 'Financial coherence & finality boundaries',
    summary:
      'Normalizing federated contract terms into StateKeys, bounded payoff comparisons, seven non-compensating completeness checks, and three separated finality clocks before treating a cross-venue position as coherent.',
    boundary:
      'Read-only architecture research; does not execute trades, hold collateral, authorize releases, or settle value.',
    essaySlug: 'statebooks-convergence-with-coherence',
    links: [
      {
        href: '/publications/statebook-whitepaper.pdf',
        label: 'Whitepaper (PDF)',
        description: '72-page specification',
      },
      {
        href: '/publications/statebook-layer-map.svg',
        label: 'Layer diagram',
        description: 'Coherence & authority map',
      },
    ],
  },
  {
    index: '04',
    title: 'Playbox & Caduceus',
    discipline: 'Attenuated rooms & governed skill evolution',
    summary:
      'An 8-crate Rust room substrate under attenuated Biscuit grants whose H100 gate caught a planted dev-set memorizer, paired with Caduceus’s 13-lane skill release ledger (+0.245 Haiku, +0.305 Sonnet, 43/43 attacks refused).',
    boundary:
      'Single-relay v0; cross-family latent vectors still trail plain-text summaries, and phrase tripwires remain off after a 41% false-hold audit.',
    links: [
      {
        href: '#/research/playbox',
        label: 'Playbox',
        description: 'Biscuit rooms & H100 verification',
      },
      {
        href: '#/research/caduceus',
        label: 'Caduceus',
        description: '13-lane skill admission & Merkle log',
      },
    ],
  },
  {
    index: '05',
    title: 'Mech-Interp Unified & Temporal Grid Safety',
    discipline: 'Planted-flaw audits & benign-drift safety',
    summary:
      'Out-of-family causal neuron replication on Qwen3-1.7B, an 8-class planted-flaw audit showing no single auditor catches every flaw, norm-matched PCA equivalence on OLMo-2/Tulu-3, and frozen discriminant adapters retaining 0.95 vs 0.27 refusals under benign OOD fine-tuning.',
    boundary:
      'Discriminant adapters target benign drift rather than white-box attacks; all experiments sit at or below 8B parameters.',
    links: [
      {
        href: '#/research/mech-interp-unified',
        label: 'Mech-Interp Unified',
        description: 'Planted-flaw audit & subspace tests',
      },
      {
        href: '#/research/temporal-grid-safety',
        label: 'Temporal Grid Safety',
        description: 'Refusal retention & v16 confound',
      },
    ],
  },
  {
    index: '06',
    title: 'Composed ZK Benchmark OS',
    discipline: 'Semantic trace oracles & mutation testing',
    summary:
      'Generating nine control-flow workload families and 14 adversarial mutation classes so a fast prover backend that accepts an invalid trace ranks strictly below a slower one that rejects it.',
    boundary:
      'Local semantic harness; not presented as external zkVM throughput benchmarks or kernel-checked prover proofs.',
    links: [
      {
        href: '#/research/composed-zk-benchmark-os',
        label: 'Research page',
        description: 'Interactive trace-mutation oracle',
      },
      {
        href: 'https://github.com/Epistetechnician/composed-zk-benchmark-os',
        label: 'Repository',
        description: 'Harness source & FINDINGS.md',
      },
    ],
  },
  {
    index: '07',
    title: 'Lusis Mesh & Recoverable Ghost States',
    discipline: 'Operator control planes & state recovery',
    summary:
      'Policy-guided infrastructure remediation with Merkle-anchored run logs and explicit operator gates, alongside continual-learning state recovery validation.',
    boundary:
      'Local validation packets do not claim unattended production autonomy.',
    links: [
      {
        href: 'https://lusislabs.com/',
        label: 'Lusis Labs',
        description: 'Project overview',
      },
      {
        href: '/publications/recoverable-ghost-states-paper.pdf',
        label: 'Research paper (PDF)',
        description: '17-page continual-learning study',
      },
    ],
  },
  {
    index: '08',
    title: 'ECDSA.fail',
    discipline: 'Reversible quantum-circuit optimization',
    summary:
      'Evaluator-verified open autoresearch on reversible secp256k1 point addition inside Shor’s algorithm, cutting the Q × T cost metric by 86.1% under exactness, uncomputation, and phase checks.',
    boundary:
      'Coherent windowed figures reflect per-call sensitivity models rather than full-Shor end-to-end fault-tolerant estimates.',
    links: [
      {
        href: 'https://arxiv.org/abs/2609.09582',
        label: 'arXiv:2609.09582',
        description: 'September 2026 v2 paper',
      },
      {
        href: 'https://ecdsa.fail/',
        label: 'Challenge surface',
        description: 'Live Pareto frontier & harness',
      },
    ],
  },
  {
    index: '09',
    title: 'Sacred Geography as Multi-Temporal Structure',
    discipline: 'Multilingual corpora & pilgrimage coding',
    summary:
      'Pre-registered study of Mount Kailas across 2,362 passages in 15+ languages and 195 dual-coded pilgrim episodes (α = 0.82), testing whether complex time (`kime`) outperforms simpler `(lap, progress)` coordinates.',
    boundary:
      'Both tests return clean nulls (5.6% decoupled episodes vs 10% threshold); blinded Tibetan, Bon, and Sanskrit packs await specialist review.',
    links: [
      {
        href: '#/research/sacred-geography-kailas',
        label: 'Field study',
        description: 'Methods, null results & reading list',
      },
      {
        href: 'https://github.com/Epistetechnician/kailas-corpus',
        label: 'Corpus repository',
        description: 'Manifests, lexicons & handoff packs',
      },
    ],
  },
]

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
    const normalizedRightIndex = rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex
    return normalizedLeftIndex - normalizedRightIndex
  })

function getWritingFromHash(hash: string): WritingEntry | null {
  const match = hash.match(/^#\/?writing\/([\w-]+)$/)
  if (!match?.[1]) return null
  return writings.find((entry) => entry.slug === match[1]) ?? null
}

function LazyWalkthroughVideo({
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
  }, [])

  return (
    <figure className="work-reel" aria-label={`${title} walkthrough`}>
      <div className="work-reel__frame">
        <video
          ref={videoNodeRef}
          className="work-reel__video"
          src={shouldLoad ? video.src : undefined}
          poster={video.poster}
          muted
          loop
          playsInline
          preload={shouldLoad ? 'metadata' : 'none'}
        />
      </div>
      <figcaption className="work-reel__caption">{video.caption}</figcaption>
    </figure>
  )
}

const inquiryName = (slug: string) =>
  researchRepos.find((r) => r.slug === slug)?.name ?? getField(slug)?.name ?? slug

function EssayNotes({ slug }: { slug: string }) {
  const notes = essayNotes[slug]
  if (!notes) return null
  return (
    <footer className="reader-after">
      <h3>Beside this essay</h3>
      <p className="reader-chips">
        {notes.threads.map((t) => (
          <a key={t} href={`#/research?t=${t}`}>
            {threadById(t).title}
          </a>
        ))}
      </p>
      {notes.inquiries?.length ? (
        <>
          <h4>Related research</h4>
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
      className="reader-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`writing-title-${writing.slug}`}
      onClick={onClose}
    >
      <div className="reader-modal__backdrop" />

      <div
        className="reader-modal__sheet"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="reader-modal__bar">
          <button
            ref={closeBtnRef}
            type="button"
            className="reader-modal__back"
            onClick={onClose}
            aria-label={`Close ${writing.title}`}
          >
            ← Back
          </button>
          <span className="reader-modal__meta-top">{writing.meta}</span>
        </div>

        <article className="reader-modal__body">
          <header className="reader-modal__header">
            <h2 id={`writing-title-${writing.slug}`}>{writing.title}</h2>
            <p className="reader-modal__lede">{writing.summary}</p>
          </header>

          <div
            className="reader-modal__prose"
            dangerouslySetInnerHTML={{ __html: writing.contentHtml }}
          />
          <EssayNotes slug={writing.slug} />
        </article>
      </div>
    </div>
  )
}

function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 32)
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

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className={`site-nav${isScrolled ? ' is-scrolled' : ''}${menuOpen ? ' is-open' : ''}`}>
      <div className="site-nav__inner">
        <a
          href="#top"
          className="site-nav__wordmark"
          onClick={(event) => {
            event.preventDefault()
            closeMenu()
            if (window.location.hash) {
              window.history.replaceState(null, '', window.location.pathname + window.location.search)
            }
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        >
          Shaan Patel
        </a>

        <nav className="site-nav__links" aria-label="Primary">
          <a href="#about">About</a>
          <a href="#archive">Work</a>
          <a href="#frontiers">Programme</a>
          <a href="#systems">Systems</a>
          <a href="#writings">Writing</a>
          <a href="#/research">Research</a>
          <a href="#install">Terminal</a>
        </nav>

        <div className="site-nav__right">
          <AmbientSoundControl />
          <a href="#/research" className="site-nav__mobile-link">
            Research
          </a>
          <button
            type="button"
            className="site-nav__menu-trigger"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-sheet"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? 'Close' : 'Index'}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <>
          <div className="site-nav__scrim" aria-hidden="true" onClick={closeMenu} />
          <nav id="mobile-nav-sheet" className="site-nav__drawer" aria-label="Section index">
            <a href="#about" onClick={closeMenu}>
              <span>01</span> About &amp; Foundations
            </a>
            <a href="#archive" onClick={closeMenu}>
              <span>02</span> Selected Work
            </a>
            <a href="#frontiers" onClick={closeMenu}>
              <span>03</span> Research Programme
            </a>
            <a href="#systems" onClick={closeMenu}>
              <span>04</span> Systems &amp; Publications
            </a>
            <a href="#writings" onClick={closeMenu}>
              <span>05</span> Essays &amp; Notes
            </a>
            <a href="#install" onClick={closeMenu}>
              <span>06</span> Terminal (spatel)
            </a>
            <a href="#/research" className="site-nav__drawer-research" onClick={closeMenu}>
              <span>→</span> Research Monograph &amp; Commonplace Book
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
  const [cliTab, setCliTab] = useState(0)

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

  useEffect(() => {
    const id = window.location.hash.slice(1)
    if (id && !id.startsWith('/') && !id.startsWith('writing/')) {
      window.requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView())
    }
  }, [])

  const activeCli = cliCommands[cliTab] ?? cliCommands[0]

  return (
    <div className="page-shell" id="top">
      <SiteHeader />

      <main className="page-main">
        {/* HERO — Pure living ASCII cinema + restrained monograph intro */}
        <section className="hero">
          <div className="hero__canvas" aria-hidden="true">
            <Video2Ascii
              key={`hero-${heroVideoSrc}`}
              src={heroVideoSrc}
              numColumns={176}
              colored={true}
              blend={12}
              highlight={0}
              brightness={1.06}
              fitMode="ambient"
              focalY={0.38}
              posterTime={3.0}
              audioEffect={0}
              enableMouse={false}
              enableRipple={false}
              charset="detailed"
              isPlaying={true}
              autoPlay={true}
              priority={true}
            />
          </div>
          <div className="hero__vignette" aria-hidden="true" />

          <div className="hero__content">
            <div className="hero__intro">
              <h1 className="hero__headline">
                Researcher, operator, and builder working across verifiable AI,
                cryptography, market design, and public goods.
              </h1>

              <div className="hero__actions">
                <a href="#systems" className="btn-primary">
                  Selected work
                </a>
                <a href="#/research" className="btn-quiet">
                  Research monograph <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 01 — ABOUT & FOUNDATIONS */}
        <section className="ed-section" id="about">
          <div className="ed-section__head">
            <p className="ed-eyebrow">01 — Foundations</p>
            <h2>Beyond the curriculum vitae.</h2>
          </div>

          <div className="about-layout">
            <figure className="about-figure">
              <div className="about-figure__stage">
                <Video2Ascii
                  key={`about-${aboutVideoSrc}`}
                  src={aboutVideoSrc}
                  numColumns={104}
                  colored={true}
                  blend={8}
                  highlight={16}
                  brightness={1.12}
                  posterTime={1.0}
                  audioEffect={0}
                  enableMouse={true}
                  enableRipple={true}
                  charset="detailed"
                  isPlaying={true}
                  autoPlay={true}
                  enableSpacebarToggle={true}
                />
              </div>
              <figcaption className="about-figure__caption">
                Interactive glyph study — move or tap across the frame.
              </figcaption>
            </figure>

            <div className="about-editorial">
              <blockquote className="about-pullquote">
                “I like to think that our collective actions become notes in the
                opening melody of the symphony of life.”
              </blockquote>

              <div className="about-columns">
                {foundations.map((item) => (
                  <div key={item.label} className="about-column">
                    <h3>{item.label}</h3>
                    <p>{item.body}</p>
                  </div>
                ))}
              </div>

              <div className="about-colophon">
                <div className="about-colophon__item">
                  <span>Reading touchstone</span>
                  <a href={favoriteBlogHref} target="_blank" rel="noreferrer" className="text-link">
                    Venkatesh Rao’s Psychohistory ↗
                  </a>
                </div>

                <div className="about-colophon__item">
                  <span>Portable archive</span>
                  <a href="#install" className="text-link">
                    spatel command-line companion ↓
                  </a>
                </div>

                <div className="about-colophon__item">
                  <span>Elsewhere</span>
                  <div className="inline-socials">
                    {socialLinks.map((link) => (
                      <a key={link.id} href={link.href} target="_blank" rel="noreferrer">
                        {link.label} ↗
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 02 — SELECTED WORK */}
        <section className="ed-section" id="archive">
          <div className="ed-section__head">
            <p className="ed-eyebrow">02 — Selected Work</p>
            <h2>Operatorship, engineering, and stewardship.</h2>
          </div>

          <div className="work-chapters">
            {experienceCards.map((card) => {
              const hasWalkthrough = card.video.renderMode === 'video'

              return (
                <article className="work-chapter" key={card.title}>
                  {card.secondaryVideo ? (
                    <div className="work-chapter__ambient" aria-hidden="true">
                      <Video2Ascii
                        key={`${card.title}-${card.secondaryVideo.src}`}
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
                      />
                      <div className="work-chapter__wash" />
                    </div>
                  ) : null}

                  <div className={`work-chapter__inner${hasWalkthrough ? ' has-media' : ''}`}>
                    <div className="work-chapter__prose">
                      <div className="work-chapter__meta">
                        <span>{card.eyebrow}</span>
                        <span>{card.role}</span>
                      </div>

                      <h3>{card.title}</h3>
                      <p className="work-chapter__summary">{card.summary}</p>

                      <ul className="work-chapter__points">
                        {card.details.map((detail) => (
                          <li key={detail}>{detail}</li>
                        ))}
                      </ul>

                      {card.links?.length ? (
                        <div className="work-chapter__links" aria-label={`${card.title} references`}>
                          {card.links.map((link) => (
                            <a
                              key={link.href}
                              href={link.href}
                              target="_blank"
                              rel="noreferrer"
                              className="work-link"
                            >
                              <span className="work-link__title">{link.label} ↗</span>
                              <span className="work-link__desc">{link.description}</span>
                            </a>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    {hasWalkthrough ? (
                      <LazyWalkthroughVideo title={card.title} video={card.video} />
                    ) : null}
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        {/* 03 — RESEARCH PROGRAMME (Tabbed Monograph Sheet) */}
        <FrontiersSection
          onOpenEssay={(slug) => {
            const writing = writings.find((entry) => entry.slug === slug)
            if (writing) {
              openWriting(writing)
            }
          }}
        />

        {/* 04 — SYSTEMS & PUBLICATIONS */}
        <section className="ed-section" id="systems">
          <div className="ed-section__head ed-section__head--split">
            <div>
              <p className="ed-eyebrow">04 — Systems &amp; Publications</p>
              <h2>Making technical claims earn their weight.</h2>
            </div>

            <div className="ed-lead">
              <p>
                How we generate adversarial tests, bound authority, preserve
                provenance, and separate a clean local result from a claim
                strangers can rely on. Every entry states its scope ceiling.
              </p>
            </div>
          </div>

          <div className="flagship-duo">
            <article className="flagship-item" aria-labelledby="featured-essay-title">
              <p className="flagship-item__kicker">Position Paper · 2026</p>
              <h3 id="featured-essay-title">
                Evidence-Bounded Intelligence: Why Authority Over AI Systems Should
                Follow Evidence, Not Capability
              </h3>
              <p className="flagship-item__body">
                Built from experiments across safety grading, module replacement,
                and attested kernels—mostly from the runs that failed. Every
                figure points to a reproducible repository report.
              </p>

              <dl className="marginalia-stats">
                <div>
                  <dt>15.4% vs 53.6%</dt>
                  <dd>Two safety graders on identical model outputs</dd>
                </div>
                <div>
                  <dt>0.89 vs 0.11</dt>
                  <dd>Jacobian error vs value error in learned replacements</dd>
                </div>
                <div>
                  <dt>279 / 279</dt>
                  <dd>Kernel tests passed on a single attested TDX host</dd>
                </div>
              </dl>

              <div className="flagship-item__links">
                <button
                  type="button"
                  className="btn-quiet"
                  onClick={() => {
                    const writing = writings.find(
                      (entry) => entry.slug === 'evidence-bounded-intelligence',
                    )
                    if (writing) openWriting(writing)
                  }}
                >
                  Read essay →
                </button>
                <a className="text-link" href="#/research">
                  Inspect repositories →
                </a>
                <a className="text-link" href="#/research?t=failure">
                  Commonplace notes →
                </a>
              </div>
            </article>

            <article className="flagship-item flagship-item--paper" aria-labelledby="featured-paper-title">
              <p className="flagship-item__kicker">arXiv:2609.09582 · Sep 2026</p>
              <h3 id="featured-paper-title">
                ECDSA.Fail: Open Autoresearch for Optimizing Elliptic-Curve Point
                Addition in Shor’s Algorithm
              </h3>
              <p className="flagship-item__body">
                Evaluator-verified open research loop for reversible secp256k1
                point-addition circuits, achieving an 86.1% Q × T reduction
                (1.496B at paper cutoff; 1.259B post-cutoff).
              </p>

              <a
                className="paper-figure"
                href="https://arxiv.org/abs/2609.09582"
                target="_blank"
                rel="noreferrer"
                aria-label="Open ECDSA.Fail paper on arXiv"
              >
                <ParetoChart />
              </a>

              <div className="flagship-item__links">
                <a href="https://arxiv.org/abs/2609.09582" target="_blank" rel="noreferrer" className="btn-quiet">
                  Read arXiv paper ↗
                </a>
                <a href="https://github.com/Layr-Labs/ecdsafail-challenge" target="_blank" rel="noreferrer" className="text-link">
                  Challenge harness ↗
                </a>
                <a href="https://ecdsa.fail/" target="_blank" rel="noreferrer" className="text-link">
                  ecdsa.fail ↗
                </a>
              </div>
            </article>
          </div>

          <div className="ledger" aria-label="Systems and research index">
            {systemsProjects.map((project) => (
              <article className="ledger-row" key={project.title}>
                <span className="ledger-row__num" aria-hidden="true">
                  {project.index}
                </span>

                <div className="ledger-row__main">
                  <p className="ledger-row__discipline">{project.discipline}</p>
                  <h3>{project.title}</h3>
                  <p className="ledger-row__summary">{project.summary}</p>
                  <p className="ledger-row__ceiling">
                    <span>Ceiling — </span>
                    {project.boundary}
                  </p>
                  {project.essaySlug ? (
                    <button
                      type="button"
                      className="text-link ledger-row__essay"
                      onClick={() => {
                        const writing = writings.find((e) => e.slug === project.essaySlug)
                        if (writing) openWriting(writing)
                      }}
                    >
                      Companion essay →
                    </button>
                  ) : null}
                </div>

                {project.links?.length ? (
                  <div className="ledger-row__refs" aria-label={`${project.title} links`}>
                    {project.links.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        target={link.href.startsWith('#') ? undefined : '_blank'}
                        rel={link.href.startsWith('#') ? undefined : 'noreferrer'}
                        className="ledger-ref"
                      >
                        <span>{link.label} {link.href.startsWith('#') ? '→' : '↗'}</span>
                        <small>{link.description}</small>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="ledger-row__access">{project.access}</p>
                )}
              </article>
            ))}
          </div>
        </section>

        {/* 05 — WRITING (Literary Table of Contents) */}
        <section className="ed-section" id="writings">
          <div className="ed-section__head ed-section__head--split">
            <div>
              <p className="ed-eyebrow">05 — Writing</p>
              <h2>Essays and field notes.</h2>
            </div>

            <div className="ed-lead">
              <p>
                Long-form notes on AI assurance, mechanistic interpretability
                nulls, market coherence, sacred economics, and public-goods
                institutions—written with their negative results intact.
              </p>
            </div>
          </div>

          <div className="essay-index" role="list" aria-label="Essay archive">
            {writings.map((writing, idx) => (
              <button
                key={writing.slug}
                type="button"
                role="listitem"
                className="essay-row"
                onClick={() => openWriting(writing)}
              >
                <span className="essay-row__num" aria-hidden="true">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div className="essay-row__body">
                  <h3>{writing.title}</h3>
                  <p>{writing.summary}</p>
                </div>
                <span className="essay-row__meta">{writing.meta}</span>
              </button>
            ))}
          </div>
        </section>

        {/* 06 — TERMINAL COMPANION */}
        <section className="ed-section" id="install">
          <div className="ed-section__head ed-section__head--split">
            <div>
              <p className="ed-eyebrow">06 — Terminal Companion</p>
              <h2>An inspectable CLI archive.</h2>
            </div>

            <div className="ed-lead">
              <p>
                <code>spatel</code> packages my CV, essays, and working notes into
                a portable Rust binary with an interactive TUI, retrieved Q&amp;A,
                and an optional local <code>qwen2.5:0.5b</code> Ollama persona
                that degrades cleanly offline.
              </p>
            </div>
          </div>

          <div className="terminal-layout">
            <div className="terminal-transcript" aria-label="Sample spatel session">
              <div className="terminal-transcript__head">
                <span>spatel — session</span>
                <span>rust + local rag</span>
              </div>
              <pre>{`$ spatel --ask "How do you think about public goods?"

Gitcoin mattered because it turned caring about
public goods into allocative power. Durable funding
needs a stack: quadratic matching, retroactive
rewards, delegated domain judgment, and maintenance.

sources: Gitcoin & Public Goods · Sacred Economics
mode: grounded corpus (offline-capable)

[/] live prompt   [tab] history   [q] quit`}</pre>
            </div>

            <div className="terminal-controls">
              <div className="cli-tabs" role="tablist" aria-label="spatel commands">
                {cliCommands.map((item, idx) => (
                  <button
                    key={item.label}
                    type="button"
                    role="tab"
                    aria-selected={cliTab === idx}
                    className={`cli-tab${cliTab === idx ? ' is-active' : ''}`}
                    onClick={() => setCliTab(idx)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {activeCli ? (
                <div className="cli-panel" role="tabpanel">
                  <div className="cli-panel__head">
                    <span>{activeCli.group === 'install' ? 'Installation' : 'Execution'}</span>
                    <h3>{activeCli.title}</h3>
                  </div>
                  <CopyCommand command={activeCli.command} />
                  <p className="cli-panel__note">
                    <Inline text={activeCli.note} />
                  </p>
                </div>
              ) : null}

              <dl className="terminal-specs">
                <div>
                  <dt>Corpus</dt>
                  <dd>CV entries, research ceilings, and essay-grounded notes.</dd>
                </div>
                <div>
                  <dt>Fallback</dt>
                  <dd>Synthesizes directly from embedded passages when Ollama is absent.</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>
      </main>

      <footer className="colophon">
        <div className="colophon__inner">
          <div className="colophon__left">
            <span className="colophon__name">Shaan Patel</span>
            <span className="colophon__note">Systems, Terminals &amp; Environments</span>
          </div>

          <nav className="colophon__nav" aria-label="Footer">
            <a href="#top">Top ↑</a>
            <a href="#archive">Work</a>
            <a href="#frontiers">Programme</a>
            <a href="#writings">Writing</a>
            <a href="#/research">Research</a>
          </nav>

          <div className="colophon__socials">
            {socialLinks.map((link) => (
              <a key={link.id} href={link.href} target="_blank" rel="noreferrer">
                {link.label}
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
