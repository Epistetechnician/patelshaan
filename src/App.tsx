import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ExplorerFeed } from './ExplorerFeed'
import { WikiChip, WikiDrawer } from './WikiDrawer'
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
      {text.split('`').map((part, i) =>
        i % 2 ? <code key={i}>{part}</code> : <span key={i}>{part}</span>,
      )}
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

const terminalSamples = [
  {
    id: 'containment',
    chip: 'formal containment',
    prompt: 'How do you keep untrusted agent proposers from executing unsafe actions?',
    body: `FormaSec pairs untrusted LLM/enumerator search with a tiny
deterministic kernel verified across Python, Kani-checked Rust,
and Lean 4 (600/600 structural agreements, 135/135 byte-exact
receipts, 0/552 hostile admissions) before Linux Landlock runs.

sources: formasec · security-alignment-os (20/20 TDX scenarios)
ceiling: MachineAttestedReproduction (independent second host pending)`,
  },
  {
    id: 'holdout',
    chip: 'holdout certificates',
    prompt: 'How do you keep RSI loops from overfitting their judge?',
    body: `Holdout Ledger prices every verdict bit released by a sealed
holdout against patch description length (MDL): 0 / 59,200 false
certificates across 9/9 pre-registered simulated hypotheses (where
zero-bit Wald bounds fail 100% under attack).

sources: holdout-ledger (PREREG_COMMIT) · Evidence-Bounded AI
ceiling: simulation-only; prospective SWE-bench run preregistered`,
  },
  {
    id: 'nulls',
    chip: 'honest nulls',
    prompt: 'Which negative results changed your architecture?',
    body: `1) v16 safety eval-rate confound inflated 60% gain to 95%.
2) Norm-matched PCA tied J-space geometry on 7B–8B models.
3) Caduceus phrase tripwire held 41% of benign skills (kept off).
4) Kailash pooled 2-clock null split into spatial φ = f(r) mandala.

sources: temporal-grid-safety · mech-interp-unified · kailas-corpus
mode: grounded corpus (offline-capable)`,
  },
  {
    id: 'commons',
    chip: 'public goods',
    prompt: 'How do you think about public goods?',
    body: `Gitcoin mattered because it turned caring about public goods
into allocative power. Durable funding needs a stack: quadratic
matching, retroactive rewards, delegated domain judgment, and
visible Ostrom-style governance rules.

sources: Gitcoin & Public Goods · Sacred Economics
mode: grounded corpus (offline-capable)`,
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
  shortTab: string
  eyebrow: string
  title: string
  role: string
  summary: string
  details: string[]
  video: ExperienceVideo
  links?: ExperienceLink[]
  secondaryVideo?: ExperienceVideo
  wikiIds: string[]
}

type WritingCategory = 'all' | 'featured' | 'ai' | 'crypto' | 'markets' | 'commons'

type WritingEntry = {
  slug: string
  title: string
  meta: string
  summary: string
  contentHtml: string
  featured: boolean
  category: Exclude<WritingCategory, 'all' | 'featured'>
}

type SocialLink = {
  id: 'x' | 'github' | 'linkedin' | 'telegram'
  label: string
  href: string
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
    shortTab: 'Halo Labs',
    eyebrow: '2025 — 2026',
    title: 'Halo Labs',
    role: 'Co-Founder & Head of AI',
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
    wikiIds: ['power', 'trust', 'formasec', 'security-alignment-os'],
  },
  {
    shortTab: 'NPC Capital',
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
    wikiIds: ['statebook', 'measure', 'commons', 'poovey'],
  },
  {
    shortTab: 'Public Goods',
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
    wikiIds: ['commons', 'ostrom', 'mauss', 'playbox'],
  },
]

const foundations = [
  {
    label: 'Discipline',
    body: 'Trained in Economics and Data Science, with early work in sustainable development and environmental impact assessment. Drawn to where formal mechanisms meet living, adaptive systems.',
    wikiId: 'measure',
  },
  {
    label: 'Questions',
    body: 'Products and protocols that make complex environments legible and accountable: verifiable AI, cryptographic assurance, market coherence, governance design, and durable public goods.',
    wikiId: 'power',
  },
  {
    label: 'Off-screen',
    body: 'Permaculture, DIY engineering, long runs, bike rides, cooking, yoga, soccer, chess, Go, and Catan.',
    wikiId: 'sacred',
  },
]

const favoriteBlogHref = 'https://www.ribbonfarm.com/series/psychohistory/'

const socialLinks: SocialLink[] = [
  { id: 'x', label: 'X', href: 'https://x.com/epistetechnic' },
  { id: 'github', label: 'GitHub', href: 'https://github.com/Epistetechnician' },
  { id: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/shaan-patel21/' },
  { id: 'telegram', label: 'Telegram', href: 'https://t.me/epistetechnician' },
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

const featuredWritingSlugs = new Set([
  'approaching-breakthroughs-across-systems',
  'evidence-bounded-intelligence',
  'statebooks-convergence-with-coherence',
  'mechanistic-interpretability-negative-results',
  'continual-learning-and-alignment-benchmarks',
  'sacred-economics-crypto',
])

const writingCategoryBySlug: Record<string, Exclude<WritingCategory, 'all' | 'featured'>> = {
  'approaching-breakthroughs-across-systems': 'ai',
  'evidence-bounded-intelligence': 'ai',
  'statebooks-convergence-with-coherence': 'markets',
  'ai-research-map-evolution-intelligence-safety-security': 'ai',
  'continual-learning-and-alignment-benchmarks': 'ai',
  'hybrid-synthetic-data-and-evaluation': 'ai',
  'mechanistic-interpretability-negative-results': 'ai',
  'verifiable-ai-agents': 'crypto',
  'zero-knowledge-mpc-and-post-quantum-security': 'crypto',
  'decentralized-compute-and-data-provenance': 'crypto',
  'architecture-unsecured-credit': 'markets',
  'sacred-economics-crypto': 'markets',
  'dao-capital-flows': 'markets',
  'mrv-onchain': 'commons',
  'p2p-humanitarian': 'commons',
  'gitcoin-grants': 'commons',
  'civic-innovation-genz': 'commons',
}

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
    featured: featuredWritingSlugs.has(slug),
    category: writingCategoryBySlug[slug] ?? 'commons',
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

const writingCategories: { id: WritingCategory; label: string; count?: number }[] = [
  { id: 'featured', label: 'Featured', count: writings.filter((w) => w.featured).length },
  { id: 'all', label: 'All Essays', count: writings.length },
  { id: 'ai', label: 'AI & Verification' },
  { id: 'crypto', label: 'Crypto & Compute' },
  { id: 'markets', label: 'Markets & Coherence' },
  { id: 'commons', label: 'Commons & Governance' },
]

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
  const [isVisible, setIsVisible] = useState(
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
        setIsVisible(entry.isIntersecting)
      },
      {
        rootMargin: '40% 0px',
        threshold: 0.01,
      },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const el = videoNodeRef.current
    if (!el || !shouldLoad) return

    el.muted = true
    el.defaultMuted = true
    el.playsInline = true
    el.setAttribute('muted', '')
    el.setAttribute('playsinline', '')
    el.setAttribute('webkit-playsinline', 'true')

    const tryPlay = () => {
      if (isVisible) {
        void el.play().catch(() => undefined)
      } else {
        el.pause()
      }
    }

    const onEnded = () => {
      if (!isVisible) return
      el.currentTime = 0
      void el.play().catch(() => undefined)
    }

    el.addEventListener('canplay', tryPlay)
    el.addEventListener('ended', onEnded)
    tryPlay()

    return () => {
      el.removeEventListener('canplay', tryPlay)
      el.removeEventListener('ended', onEnded)
    }
  }, [isVisible, shouldLoad, video.src])

  return (
    <figure className="work-reel" aria-label={`${title} walkthrough`}>
      <div className="work-reel__frame">
        <video
          ref={videoNodeRef}
          className="work-reel__video"
          src={shouldLoad ? video.src : undefined}
          poster={video.poster}
          autoPlay={isVisible}
          muted
          loop
          playsInline
          preload={shouldLoad ? 'auto' : 'none'}
        />
      </div>
      <figcaption className="work-reel__caption">{video.caption}</figcaption>
    </figure>
  )
}

const inquiryName = (slug: string) =>
  researchRepos.find((r) => r.slug === slug)?.name ?? getField(slug)?.name ?? slug

function EssayNotes({
  slug,
  onOpenWiki,
  onCloseModal,
}: {
  slug: string
  onOpenWiki: (id: string) => void
  onCloseModal: () => void
}) {
  const notes = essayNotes[slug]
  if (!notes) return null
  return (
    <footer className="reader-after">
      <h3>Beside this essay</h3>
      <p className="reader-chips">
        {notes.threads.map((t) => (
          <button
            key={t}
            type="button"
            className="reader-chip-btn"
            onClick={() => {
              onCloseModal()
              onOpenWiki(t)
            }}
          >
            [[{threadById(t).title}]]
          </button>
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
  onOpenWiki,
}: {
  writing: WritingEntry
  onClose: () => void
  onOpenWiki: (id: string) => void
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
          <EssayNotes
            slug={writing.slug}
            onOpenWiki={onOpenWiki}
            onCloseModal={onClose}
          />
        </article>
      </div>
    </div>
  )
}

function SiteHeader({ onOpenWiki }: { onOpenWiki: (id: string) => void }) {
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
          <a href="#frontiers">Stream</a>
          <a href="#writings">Writing</a>
          <a href="#install">Terminal</a>
          <a href="#/research">Monograph</a>
        </nav>

        <div className="site-nav__right">
          <button
            type="button"
            className="site-nav__wiki-btn"
            onClick={() => onOpenWiki('evidence-bounded')}
            title="Open [[Wiki]] Knowledge Graph"
          >
            [[Wiki]]
          </button>
          <AmbientSoundControl />
          <a href="#/research" className="site-nav__mobile-link">
            Monograph
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
              <span>01</span> Foundations
            </a>
            <a href="#archive" onClick={closeMenu}>
              <span>02</span> Selected Work
            </a>
            <a href="#frontiers" onClick={closeMenu}>
              <span>03</span> Research Stream &amp; Embeds
            </a>
            <a href="#writings" onClick={closeMenu}>
              <span>04</span> Essays &amp; Notes
            </a>
            <a href="#install" onClick={closeMenu}>
              <span>05</span> Terminal (spatel)
            </a>
            <a href="#/research" className="site-nav__drawer-research" onClick={closeMenu}>
              <span>→</span> Full Research Monograph &amp; Commonplace Book
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
  const [workIdx, setWorkIdx] = useState(0)
  const [writingCat, setWritingCat] = useState<WritingCategory>('featured')
  const [cliTab, setCliTab] = useState(0)
  const [sampleIdx, setSampleIdx] = useState(0)

  const [wikiTrail, setWikiTrail] = useState<string[]>([])
  const [focusedDispatchRequest, setFocusedDispatchRequest] = useState<{
    id: string
    nonce: number
  } | null>(null)

  const openedViaPushRef = useRef(false)
  const triggerElementRef = useRef<HTMLElement | null>(null)

  const openWiki = useCallback((id: string) => {
    setWikiTrail((prev) => {
      if (prev[prev.length - 1] === id) return prev
      const existingIdx = prev.indexOf(id)
      if (existingIdx !== -1) {
        return prev.slice(0, existingIdx + 1)
      }
      return [...prev.slice(-6), id]
    })
  }, [])

  const jumpWikiStep = useCallback((idx: number) => {
    setWikiTrail((prev) => prev.slice(0, idx + 1))
  }, [])

  const closeWiki = useCallback(() => {
    setWikiTrail([])
  }, [])

  const focusDispatch = useCallback((dispatchId: string) => {
    setFocusedDispatchRequest({ id: dispatchId, nonce: Date.now() })
  }, [])

  const openWriting = useCallback((writing: WritingEntry) => {
    triggerElementRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    openedViaPushRef.current = true
    window.history.pushState(null, '', `#writing/${writing.slug}`)
    setActiveWriting(writing)
  }, [])

  const openWritingBySlug = useCallback(
    (slug: string) => {
      const found = writings.find((entry) => entry.slug === slug)
      if (found) openWriting(found)
    },
    [openWriting],
  )

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

    if (
      window.location.hash.startsWith('#writing/') ||
      window.location.hash.startsWith('#/writing/')
    ) {
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

  const activeWork = experienceCards[workIdx] ?? experienceCards[0]
  const activeWorkHasWalkthrough = activeWork.video.renderMode === 'video'

  const filteredWritings = useMemo(() => {
    if (writingCat === 'all') return writings
    if (writingCat === 'featured') return writings.filter((w) => w.featured)
    return writings.filter((w) => w.category === writingCat)
  }, [writingCat])

  const activeCli = cliCommands[cliTab] ?? cliCommands[0]
  const activeSample = terminalSamples[sampleIdx] ?? terminalSamples[0]

  return (
    <div className="page-shell" id="top">
      <SiteHeader onOpenWiki={openWiki} />

      <main className="page-main">
        {/* HERO — Pure living ASCII cinema + progressive entry trail */}
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
                Building provable trust for autonomous AI, cryptography, and
                markets.
              </h1>

              <div className="hero__actions">
                <a href="#frontiers" className="btn-primary">
                  Explore stream &amp; embeds
                </a>
                <a href="#/research" className="btn-quiet">
                  Research monograph <span aria-hidden="true">→</span>
                </a>
              </div>

              <div className="hero__trails" aria-label="Quick entry nodes">
                <span className="hero__trails-label">Start a thread:</span>
                <WikiChip id="evidence-bounded" label="Evidence-Bounded AI" onOpen={openWiki} />
                <WikiChip id="holdout-ledger" label="Holdout Ledger" onOpen={openWiki} />
                <WikiChip id="formasec" label="FormaSec" onOpen={openWiki} />
                <WikiChip id="temporal-grid-safety" label="Discriminant Safety" onOpen={openWiki} />
                <WikiChip id="statebook" label="Statebook" onOpen={openWiki} />
              </div>
            </div>
          </div>
        </section>

        {/* 01 — FOUNDATIONS */}
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
                “Together, our actions compose the opening melody of life’s
                symphony.”
              </blockquote>

              <div className="about-columns">
                {foundations.map((item) => (
                  <div key={item.label} className="about-column">
                    <h3>{item.label}</h3>
                    <div className="about-column__content">
                      <p>{item.body}</p>
                      <div className="about-column__chip">
                        <WikiChip id={item.wikiId} onOpen={openWiki} />
                      </div>
                    </div>
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

        {/* 02 — SELECTED WORK (Clean Interactive Chapter Stage) */}
        <section className="ed-section" id="archive">
          <div className="ed-section__head ed-section__head--split">
            <div>
              <p className="ed-eyebrow">02 — Selected Work</p>
              <h2>Leadership, engineering, and stewardship.</h2>
            </div>

            <div className="work-switcher" role="tablist" aria-label="Selected work chapters">
              {experienceCards.map((card, idx) => {
                const isActive = idx === workIdx
                return (
                  <button
                    key={card.title}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={`work-tab${isActive ? ' is-active' : ''}`}
                    onClick={() => setWorkIdx(idx)}
                  >
                    <span className="work-tab__num">0{idx + 1}</span>
                    <span>{card.shortTab}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <article className="work-chapter work-chapter--staged" key={activeWork.title}>
            {activeWork.secondaryVideo ? (
              <div className="work-chapter__ambient" aria-hidden="true">
                <Video2Ascii
                  key={`${activeWork.title}-${activeWork.secondaryVideo.src}`}
                  src={activeWork.secondaryVideo.src}
                  numColumns={activeWork.secondaryVideo.numColumns}
                  colored={true}
                  blend={activeWork.secondaryVideo.blend}
                  highlight={activeWork.secondaryVideo.highlight}
                  brightness={activeWork.secondaryVideo.brightness}
                  fitMode={activeWork.secondaryVideo.fitMode}
                  focalY={activeWork.secondaryVideo.focalY}
                  posterTime={activeWork.secondaryVideo.posterTime}
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

            <div className={`work-chapter__inner${activeWorkHasWalkthrough ? ' has-media' : ''}`}>
              <div className="work-chapter__prose">
                <div className="work-chapter__meta">
                  <span>{activeWork.eyebrow}</span>
                  <span>{activeWork.role}</span>
                </div>

                <h3>{activeWork.title}</h3>
                <p className="work-chapter__summary">{activeWork.summary}</p>

                <ul className="work-chapter__points">
                  {activeWork.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>

                {activeWork.links?.length ? (
                  <div className="work-chapter__links" aria-label={`${activeWork.title} references`}>
                    {activeWork.links.map((link) => (
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

                <div className="work-chapter__foot">
                  <div className="work-chapter__wikis">
                    {activeWork.wikiIds.map((wid) => (
                      <WikiChip key={wid} id={wid} onOpen={openWiki} />
                    ))}
                  </div>

                  <div className="work-chapter__step">
                    <button
                      type="button"
                      className="work-step-btn"
                      onClick={() =>
                        setWorkIdx((i) => (i - 1 + experienceCards.length) % experienceCards.length)
                      }
                      aria-label="Previous work chapter"
                    >
                      ← Prev
                    </button>
                    <span>
                      {workIdx + 1} / {experienceCards.length}
                    </span>
                    <button
                      type="button"
                      className="work-step-btn"
                      onClick={() => setWorkIdx((i) => (i + 1) % experienceCards.length)}
                      aria-label="Next work chapter"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              </div>

              {activeWorkHasWalkthrough ? (
                <LazyWalkthroughVideo title={activeWork.title} video={activeWork.video} />
              ) : null}
            </div>
          </article>
        </section>

        {/* 03 — UNIFIED RESEARCH STREAM, LIVE EMBEDS & WIKI HOOKS */}
        <ExplorerFeed
          onOpenEssay={openWritingBySlug}
          onOpenWiki={openWiki}
          focusedDispatchRequest={focusedDispatchRequest}
        />

        {/* 04 — WRITING (Filtered Table of Contents + Thread Wiki Chips) */}
        <section className="ed-section" id="writings">
          <div className="ed-section__head ed-section__head--split">
            <div>
              <p className="ed-eyebrow">04 — Writing</p>
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

          <div className="feed-toolbar essay-toolbar" role="tablist" aria-label="Filter essays">
            <div className="feed-channels">
              {writingCategories.map((cat) => {
                const active = writingCat === cat.id
                return (
                  <button
                    key={cat.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    className={`feed-channel${active ? ' is-active' : ''}`}
                    onClick={() => setWritingCat(cat.id)}
                  >
                    <span>{cat.label}</span>
                    {cat.count !== undefined ? <small>{cat.count}</small> : null}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="essay-index" role="list" aria-label="Essay archive">
            {filteredWritings.map((writing) => {
              const globalIdx = writings.findIndex((w) => w.slug === writing.slug)
              const notes = essayNotes[writing.slug]
              return (
                <div
                  key={writing.slug}
                  role="listitem"
                  className="essay-row"
                  onClick={() => openWriting(writing)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      openWriting(writing)
                    }
                  }}
                >
                  <span className="essay-row__num" aria-hidden="true">
                    {String(globalIdx + 1).padStart(2, '0')}
                  </span>
                  <div className="essay-row__body">
                    <h3>{writing.title}</h3>
                    <p>{writing.summary}</p>
                    {notes?.threads.length ? (
                      <div className="essay-row__chips">
                        {notes.threads.slice(0, 3).map((tid) => (
                          <WikiChip
                            key={tid}
                            id={tid}
                            label={threadById(tid).title}
                            onOpen={openWiki}
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <span className="essay-row__meta">{writing.meta}</span>
                </div>
              )
            })}
          </div>

          {writingCat === 'featured' ? (
            <div className="feed-more-bar">
              <button
                type="button"
                className="btn-quiet"
                onClick={() => setWritingCat('all')}
              >
                Browse all {writings.length} essays &amp; notes ↓
              </button>
            </div>
          ) : null}
        </section>

        {/* 05 — TERMINAL COMPANION */}
        <section className="ed-section" id="install">
          <div className="ed-section__head ed-section__head--split">
            <div>
              <p className="ed-eyebrow">05 — Terminal Companion</p>
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
            <div className="terminal-transcript" aria-label="Interactive sample spatel session">
              <div className="terminal-transcript__head">
                <span>spatel — grounded session</span>
                <span>rust + local rag</span>
              </div>
              <div className="terminal-prompts" role="tablist" aria-label="Sample questions">
                {terminalSamples.map((s, idx) => (
                  <button
                    key={s.id}
                    type="button"
                    role="tab"
                    aria-selected={sampleIdx === idx}
                    className={`terminal-prompt-chip${sampleIdx === idx ? ' is-active' : ''}`}
                    onClick={() => setSampleIdx(idx)}
                  >
                    {s.chip}
                  </button>
                ))}
              </div>
              <pre>{`$ spatel --ask "${activeSample.prompt}"

${activeSample.body}

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
            <a href="#frontiers">Stream</a>
            <a href="#writings">Writing</a>
            <a href="#/research">Monograph</a>
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
          onOpenWiki={openWiki}
        />
      ) : null}

      {wikiTrail.length > 0 ? (
        <WikiDrawer
          trail={wikiTrail}
          onNavigate={openWiki}
          onJumpToStep={jumpWikiStep}
          onClose={closeWiki}
          onOpenEssay={openWritingBySlug}
          onFocusDispatch={focusDispatch}
        />
      ) : null}
    </div>
  )
}

export default App
