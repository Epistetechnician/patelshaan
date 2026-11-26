import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { WikiChip, WikiDrawer } from './WikiDrawer'
import { EtherTerminal } from './components/EtherTerminal'
import Video2Ascii, { type CharsetKey } from './components/LocalVideo2Ascii'
import { ProofShowcase } from './components/ProofShowcase'
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

type ExperienceVideo = {
  src: string
  poster?: string
  caption: string
  renderMode?: 'video'
}

type ExperienceLink = {
  href: string
  label: string
  description: string
}

type ExperienceAmbient = {
  src: string
  poster: string
  numColumns: number
  blend: number
  highlight: number
  brightness: number
  saturation: number
  bloom: number
  fitMode?: 'cover' | 'ambient'
  focalY?: number
  posterTime?: number
}

type ExperienceCard = {
  shortTab: string
  eyebrow: string
  title: string
  role: string
  narrative: string
  shipped: string[]
  video?: ExperienceVideo
  ambientVideo: ExperienceAmbient
  links?: ExperienceLink[]
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
  setVolume?: (volume: number) => void
  unMute?: () => void
}

type YouTubeNamespace = {
  Player: new (
    element: string | HTMLElement,
    options: {
      videoId: string
      playerVars: Record<string, number | string>
      events: {
        onAutoplayBlocked?: () => void
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

type SynthEngine = {
  ctx: AudioContext
  master: GainNode
  stop: () => void
}

function createCosmicSynth(): SynthEngine | null {
  if (typeof window === 'undefined') return null
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctx) return null
  try {
    const ctx = new Ctx()
    const master = ctx.createGain()
    master.gain.setValueAtTime(0.0001, ctx.currentTime)

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(340, ctx.currentTime)
    filter.Q.setValueAtTime(0.9, ctx.currentTime)

    // Slow cosmic breathing LFO modulating filter cutoff
    const lfo = ctx.createOscillator()
    const lfoGain = ctx.createGain()
    lfo.type = 'sine'
    lfo.frequency.setValueAtTime(0.075, ctx.currentTime)
    lfoGain.gain.setValueAtTime(140, ctx.currentTime)
    lfo.connect(lfoGain)
    lfoGain.connect(filter.frequency)

    const freqs = [55, 82.41, 110, 164.81, 220]
    const oscs: OscillatorNode[] = []
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle'
      osc.frequency.setValueAtTime(f, ctx.currentTime)
      osc.detune.setValueAtTime((idx - 2) * 3.5, ctx.currentTime)
      g.gain.setValueAtTime(0.18 / (idx + 1), ctx.currentTime)
      osc.connect(g)
      g.connect(filter)
      osc.start()
      oscs.push(osc)
    })

    lfo.start()
    filter.connect(master)
    master.connect(ctx.destination)

    return {
      ctx,
      master,
      stop: () => {
        try {
          oscs.forEach((o) => o.stop())
          lfo.stop()
          void ctx.close()
        } catch {
          /* ignore */
        }
      },
    }
  } catch {
    return null
  }
}

/** Auto-playing ambient audio: YouTube primary + warm Web Audio cosmic pad fallback for strict iOS/Safari. */
function AmbientSoundControl() {
  const playerHostRef = useRef<HTMLDivElement | null>(null)
  const playerRef = useRef<YouTubePlayer | null>(null)
  const synthRef = useRef<SynthEngine | null>(null)
  const readyRef = useRef(false)
  const ytPlayingRef = useRef(false)
  const userMutedRef = useRef(false)
  const pendingPlayOnReadyRef = useRef(true)
  const [playback, setPlayback] = useState<'idle' | 'loading' | 'playing' | 'paused'>('loading')

  const fadeSynth = useCallback((active: boolean) => {
    const synth = synthRef.current
    if (!synth) return
    const now = synth.ctx.currentTime
    if (active) {
      if (synth.ctx.state === 'suspended') {
        void synth.ctx.resume().catch(() => undefined)
      }
      synth.master.gain.cancelScheduledValues(now)
      synth.master.gain.setTargetAtTime(0.085, now, 0.45)
    } else {
      synth.master.gain.cancelScheduledValues(now)
      synth.master.gain.setTargetAtTime(0.0001, now, 0.25)
    }
  }, [])

  const ensureSynthPlaying = useCallback(() => {
    if (userMutedRef.current || ytPlayingRef.current) return false
    if (!synthRef.current) {
      synthRef.current = createCosmicSynth()
    }
    const synth = synthRef.current
    if (!synth) return false
    if (synth.ctx.state === 'suspended') {
      void synth.ctx.resume().catch(() => undefined)
    }
    fadeSynth(true)
    setPlayback('playing')
    return true
  }, [fadeSynth])

  const startPlayer = useCallback(
    (host: HTMLDivElement, isDisposed: () => boolean) => {
      let readyTimeoutTimer: number | undefined

      const clearTimer = () => {
        if (readyTimeoutTimer !== undefined) {
          window.clearTimeout(readyTimeoutTimer)
          readyTimeoutTimer = undefined
        }
      }

      const createPlayer = () => {
        if (isDisposed() || !window.YT?.Player || playerRef.current) {
          return
        }

        const mountNode = document.createElement('div')
        mountNode.id = 'landing-music-player'
        host.replaceChildren(mountNode)

        playerRef.current = new window.YT.Player(mountNode, {
          videoId: landingMusicVideoId,
          playerVars: {
            autoplay: 1,
            controls: 0,
            enablejsapi: 1,
            loop: 1,
            origin: window.location.origin,
            playlist: landingMusicVideoId,
            playsinline: 1,
            rel: 0,
          },
          events: {
            onReady: ({ target }) => {
              if (isDisposed()) return
              readyRef.current = true
              clearTimer()
              if (!userMutedRef.current && pendingPlayOnReadyRef.current) {
                target.unMute?.()
                target.setVolume?.(70)
                target.playVideo()
              }
            },
            onAutoplayBlocked: () => {
              if (isDisposed()) return
              ytPlayingRef.current = false
              if (!synthRef.current || synthRef.current.ctx.state !== 'running') {
                setPlayback('paused')
              }
            },
            onStateChange: ({ data }) => {
              if (isDisposed()) return
              if (data === 1) {
                ytPlayingRef.current = true
                fadeSynth(false)
                setPlayback('playing')
              } else if (data === 2 || data === 0) {
                ytPlayingRef.current = false
                if (!userMutedRef.current && synthRef.current?.ctx.state === 'running') {
                  fadeSynth(true)
                  setPlayback('playing')
                } else {
                  setPlayback('paused')
                }
              }
            },
            onError: () => {
              if (isDisposed()) return
              clearTimer()
              ytPlayingRef.current = false
              if (synthRef.current?.ctx.state === 'running') {
                setPlayback('playing')
              } else {
                setPlayback('paused')
              }
            },
          },
        })
      }

      readyTimeoutTimer = window.setTimeout(() => {
        if (!isDisposed() && !readyRef.current) {
          setPlayback((cur) => (cur === 'playing' ? 'playing' : 'paused'))
        }
      }, 4500)

      if (window.YT?.Player) {
        createPlayer()
        return clearTimer
      }

      const prevReady = window.onYouTubeIframeAPIReady
      const handleApiReady = () => {
        prevReady?.()
        createPlayer()
      }
      window.onYouTubeIframeAPIReady = handleApiReady

      if (!document.getElementById('youtube-iframe-api')) {
        const script = document.createElement('script')
        script.id = 'youtube-iframe-api'
        script.src = 'https://www.youtube.com/iframe_api'
        script.onerror = () => {
          script.remove()
          if (!isDisposed()) {
            clearTimer()
            setPlayback((cur) => (cur === 'playing' ? 'playing' : 'paused'))
          }
        }
        document.head.appendChild(script)
      }

      return () => {
        clearTimer()
        if (window.onYouTubeIframeAPIReady === handleApiReady) {
          window.onYouTubeIframeAPIReady = prevReady
        }
      }
    },
    [fadeSynth],
  )

  // Mount and attempt autoplay immediately; unlock synchronously on first tap/click/key anywhere on mobile
  useEffect(() => {
    const host = playerHostRef.current
    if (!host) return
    let disposed = false
    const cleanupPlayer = startPlayer(host, () => disposed)

    const onFirstInteraction = (event: Event) => {
      if (disposed || userMutedRef.current) return
      const target = event.target as HTMLElement | null
      if (target?.closest('.sound-toggle')) return

      pendingPlayOnReadyRef.current = true
      const player = playerRef.current
      if (player && readyRef.current) {
        try {
          if (player.getPlayerState?.() !== 1) {
            player.unMute?.()
            player.setVolume?.(70)
            player.playVideo()
          }
        } catch {
          /* fallback to Web Audio cosmic pad below */
        }
      }
      // Guarantee immediate sound on iOS Safari even if cross-origin YouTube iframe blocks parent-gesture play
      if (!ytPlayingRef.current) {
        ensureSynthPlaying()
      }
    }

    window.addEventListener('touchend', onFirstInteraction, { passive: true })
    window.addEventListener('pointerup', onFirstInteraction, { passive: true })
    window.addEventListener('click', onFirstInteraction, { passive: true })
    window.addEventListener('keydown', onFirstInteraction, { passive: true })

    return () => {
      disposed = true
      cleanupPlayer?.()
      window.removeEventListener('touchend', onFirstInteraction)
      window.removeEventListener('pointerup', onFirstInteraction)
      window.removeEventListener('click', onFirstInteraction)
      window.removeEventListener('keydown', onFirstInteraction)
      readyRef.current = false
      ytPlayingRef.current = false
      synthRef.current?.stop()
      synthRef.current = null
      playerRef.current?.destroy()
      playerRef.current = null
      host.replaceChildren()
    }
  }, [ensureSynthPlaying, startPlayer])

  const toggleSound = () => {
    const player = playerRef.current
    if (playback === 'playing') {
      userMutedRef.current = true
      pendingPlayOnReadyRef.current = false
      ytPlayingRef.current = false
      fadeSynth(false)
      try {
        player?.pauseVideo()
      } catch {
        /* ignore */
      }
      setPlayback('paused')
      return
    }

    userMutedRef.current = false
    pendingPlayOnReadyRef.current = true
    if (player && readyRef.current) {
      try {
        player.unMute?.()
        player.setVolume?.(70)
        player.playVideo()
      } catch {
        /* ignore */
      }
    }
    ensureSynthPlaying()
  }

  return (
    <div className="sound-toggle">
      <div ref={playerHostRef} className="sound-toggle__player" />
      <button
        type="button"
        className={`sound-toggle__btn${playback === 'playing' ? ' is-playing' : ''}`}
        onClick={toggleSound}
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
    eyebrow: '2025 - 2026',
    title: 'Halo Labs',
    role: 'Co-Founder & Head of AI',
    narrative:
      'At Halo Labs I worked on the hardest seam in confidential finance: how to make private settlement and autonomous execution provable to counterparties who should never have to trust an operator. That meant pairing trusted execution environments with zero-knowledge verification, writing the protocol documentation developers actually build from, and shipping a light client that makes privacy legible.',
    shipped: [
      'Architected Halo Verus, verifiable AI execution binding TEE hardware attestation to zero-knowledge proofs.',
      'Authored protocol architecture documentation and light-client onboarding guides.',
      'Built infrastructure partnerships across Phala, Fairblocks, and confidential-compute ecosystem teams.',
    ],
    video: {
      src: '/ascii/loomhalo-web.mp4',
      poster: '/ascii/loomhalo-poster.jpg',
      caption: 'Halo light-client walkthrough',
      renderMode: 'video',
    },
    ambientVideo: {
      src: '/ascii/lorenz.mp4',
      poster: '/ascii/lorenz-poster.webp',
      numColumns: 132,
      blend: 14,
      highlight: 22,
      brightness: 1.38,
      saturation: 1.32,
      bloom: 0.44,
      fitMode: 'ambient',
      focalY: 0.42,
      posterTime: 4,
    },
    links: [
      {
        href: 'https://docs.halo-labs.xyz/',
        label: 'Halo Documentation',
        description: 'Architecture and protocol reference',
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
    wikiIds: ['power', 'trust', 'formasec', 'security-alignment-os'],
  },
  {
    shortTab: 'NPC Capital',
    eyebrow: '2024 - 2025',
    title: 'NPC Capital',
    role: 'Full-Stack Developer & Researcher',
    narrative:
      'In liquid digital-asset markets, mispricing is rarely an absence of data. It is a failure of accounting across venues with incompatible settlement clocks. Alongside Polygon and Hyperliquid validators, I built the telemetry and portfolio interfaces that kept capital allocation anchored to live on-chain state rather than lagging spreadsheets.',
    shipped: [
      'Designed operator and investor heads-up displays surfacing live cross-venue portfolio risk.',
      'Built cross-chain telemetry pipelines grounding allocation decisions in verifiable on-chain state.',
      'Evaluated real-yield validator economics directly with Hyperliquid operators, laying the groundwork for Statebook.',
    ],
    ambientVideo: {
      src: '/ascii/npc-skyline.mp4',
      poster: '/ascii/npc-skyline-poster.webp',
      numColumns: 138,
      blend: 10,
      highlight: 12,
      brightness: 1.18,
      saturation: 1.24,
      bloom: 0.28,
      fitMode: 'cover',
      focalY: 0.46,
      posterTime: 2,
    },
    links: [
      {
        href: 'https://npcgroup.xyz/',
        label: 'NPC Capital',
        description: 'Fund overview',
      },
      {
        href: '/publications/statebook-whitepaper.pdf',
        label: 'Statebook Specification',
        description: '72-pp market coherence paper',
      },
    ],
    wikiIds: ['statebook', 'measure', 'commons', 'poovey'],
  },
  {
    shortTab: 'Public Goods',
    eyebrow: '2022 - 2024',
    title: 'Public Goods & Open Source',
    role: 'Solana Foundation · Celo · Dream DAO · Eco DAO',
    narrative:
      'Before formal kernels and verifiable models, I spent two years inside open-source institutions asking why public goods either endure or quietly decay. The answer was almost always legibility: clear developer tooling, transparent funding mechanisms, and governance rules that survive contact with real incentives.',
    shipped: [
      'Solana Foundation: tightened SDK versioning, reference examples, and hands-on developer lessons.',
      'Celo: shaped public-goods funding strategy around account abstraction and quadratic funding.',
      'Dream DAO & Eco DAO: co-stewarded builder cohorts, governance tooling, and ecological primitives.',
    ],
    ambientVideo: {
      src: '/ascii/public-goods-nature.mp4',
      poster: '/ascii/public-goods-nature-poster.webp',
      numColumns: 134,
      blend: 8,
      highlight: 14,
      brightness: 1.14,
      saturation: 1.26,
      bloom: 0.26,
      fitMode: 'cover',
      focalY: 0.48,
      posterTime: 2,
    },
    wikiIds: ['commons', 'ostrom', 'mauss', 'playbox'],
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
  'epistemic-engineering-vision-paper',
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
  'epistemic-engineering-vision-paper',
  'approaching-breakthroughs-across-systems',
  'evidence-bounded-intelligence',
  'statebooks-convergence-with-coherence',
  'mechanistic-interpretability-negative-results',
  'continual-learning-and-alignment-benchmarks',
  'sacred-economics-crypto',
])

const writingCategoryBySlug: Record<string, Exclude<WritingCategory, 'all' | 'featured'>> = {
  'epistemic-engineering-vision-paper': 'ai',
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
  const doc = new DOMParser().parseFromString(rawHtml, 'text/html')
  const content = doc.querySelector('.article-content')
  const title =
    doc.querySelector('.article-title')?.textContent?.trim() ??
    slug.replace(/-/g, ' ')
  const meta =
    doc.querySelector('.article-meta')?.textContent?.trim() ?? 'Essay'
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

    let removeGestureFallback: (() => void) | null = null

    const clearGesture = () => {
      removeGestureFallback?.()
      removeGestureFallback = null
    }

    const attachGesture = () => {
      if (removeGestureFallback) return
      const onGesture = () => {
        if (!isVisible) return
        el.play()
          .then(clearGesture)
          .catch(() => undefined)
      }
      window.addEventListener('touchend', onGesture, { passive: true })
      window.addEventListener('pointerup', onGesture, { passive: true })
      window.addEventListener('click', onGesture, { passive: true })
      removeGestureFallback = () => {
        window.removeEventListener('touchend', onGesture)
        window.removeEventListener('pointerup', onGesture)
        window.removeEventListener('click', onGesture)
      }
    }

    const tryPlay = () => {
      if (isVisible) {
        el.play()
          .then(clearGesture)
          .catch(() => {
            attachGesture()
          })
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
      clearGesture()
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
            ← Back to archive
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

function SiteHeader({
  onOpenWiki,
  lightMode,
  onToggleTheme,
}: {
  onOpenWiki: (id: string) => void
  lightMode: boolean
  onToggleTheme: () => void
}) {
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
          <a href="#frontiers">Proofs</a>
          <a href="#writings">Writing</a>
          <a href="#install">Terminal</a>
          <a href="#/research">Research</a>
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
          <button
            type="button"
            className="site-nav__theme-btn"
            onClick={onToggleTheme}
            aria-label={lightMode ? 'Switch to dark mode' : 'Switch to light mode'}
            title={lightMode ? 'Dark mode' : 'Light mode'}
          >
            {lightMode ? '☾' : '☼'}
          </button>
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
              <span>01</span> Foundations
            </a>
            <a href="#archive" onClick={closeMenu}>
              <span>02</span> Selected Work
            </a>
            <a href="#frontiers" onClick={closeMenu}>
              <span>03</span> Verified Research &amp; Nulls
            </a>
            <a href="#writings" onClick={closeMenu}>
              <span>04</span> Essays &amp; Field Notes
            </a>
            <a href="#install" onClick={closeMenu}>
              <span>05</span> Live Terminal (spatel)
            </a>
            <a href="#/research" className="site-nav__drawer-research" onClick={closeMenu}>
              <span>→</span> Full Research &amp; Receipts
            </a>
          </nav>
        </>
      ) : null}
    </header>
  )
}

function readInitialLightMode(): boolean {
  try {
    return localStorage.getItem('rp-theme-v2') === 'light'
  } catch {
    return false
  }
}

const HERO_LENSES: { key: CharsetKey; label: string }[] = [
  { key: 'cinematic', label: 'cinematic' },
  { key: 'braille', label: 'braille' },
  { key: 'detailed', label: 'detailed' },
  { key: 'blocks', label: 'blocks' },
]

function App() {
  const heroVideoSrc = '/ascii/hero-blackhole.mp4'
  const heroPosterSrc = '/ascii/hero-blackhole-poster.webp'
  const aboutVideoSrc = '/ascii/about-flower.mp4'
  const aboutPosterSrc = '/ascii/about-flower-poster.webp'

  const [heroCharset, setHeroCharset] = useState<CharsetKey>('cinematic')
  const [heroEdges, setHeroEdges] = useState(true)
  const [heroBloom, setHeroBloom] = useState(true)
  const [heroPlaying, setHeroPlaying] = useState(true)
  const [aboutCharset, setAboutCharset] = useState<CharsetKey>('cinematic')

  const [lightMode, setLightMode] = useState<boolean>(readInitialLightMode)
  const [activeWriting, setActiveWriting] = useState<WritingEntry | null>(() =>
    typeof window !== 'undefined' ? getWritingFromHash(window.location.hash) : null,
  )
  const [workIdx, setWorkIdx] = useState(0)
  const [writingCat, setWritingCat] = useState<WritingCategory>('featured')
  const [cliTab, setCliTab] = useState(0)

  const [wikiTrail, setWikiTrail] = useState<string[]>([])
  const [focusedDispatchRequest, setFocusedDispatchRequest] = useState<{
    id: string
    nonce: number
  } | null>(null)

  const openedViaPushRef = useRef(false)
  const triggerElementRef = useRef<HTMLElement | null>(null)

  const toggleTheme = useCallback(() => {
    setLightMode((prev) => {
      const next = !prev
      document.documentElement.classList.toggle('light-mode', next)
      try {
        localStorage.setItem('rp-theme-v2', next ? 'light' : 'dark')
      } catch {
        /* storage unavailable */
      }
      const themeMeta = document.getElementById('theme-color-meta')
      if (themeMeta) {
        themeMeta.setAttribute('content', next ? '#ffffff' : '#141414')
      }
      return next
    })
  }, [])

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
  const activeWorkHasWalkthrough = activeWork.video?.renderMode === 'video'

  const filteredWritings = useMemo(() => {
    if (writingCat === 'all') return writings
    if (writingCat === 'featured') return writings.filter((w) => w.featured)
    return writings.filter((w) => w.category === writingCat)
  }, [writingCat])

  const activeCli = cliCommands[cliTab] ?? cliCommands[0]

  return (
    <div className="page-shell" id="top">
      <SiteHeader
        onOpenWiki={openWiki}
        lightMode={lightMode}
        onToggleTheme={toggleTheme}
      />

      <main className="page-main">
        {/* HERO: Pure living SOTA GPU ASCII cinema + singular authorial thesis */}
        <section className="hero">
          <div className="hero__canvas" aria-hidden="true">
            <Video2Ascii
              key={`hero-${heroVideoSrc}`}
              src={heroVideoSrc}
              poster={heroPosterSrc}
              numColumns={192}
              colored={true}
              blend={14}
              highlight={0}
              brightness={1.12}
              saturation={1.26}
              bloom={heroBloom ? 0.36 : 0}
              edgeAware={heroEdges}
              lensing={0.62}
              fitMode="ambient"
              focalY={0.36}
              posterTime={3.0}
              audioEffect={0}
              enableMouse={true}
              enableRipple={true}
              listenWindowPointer={true}
              trailLength={12}
              rippleSpeed={34}
              charset={heroCharset}
              isPlaying={heroPlaying}
              autoPlay={true}
              priority={true}
            />
          </div>
          <div className="hero__vignette" aria-hidden="true" />

          <div className="hero__content">
            <div className="hero__intro">
              <h1 className="hero__headline">
                The universe never takes anyone’s word for it. Neither should
                our intelligence, our economies, or our histories.
              </h1>

              <p className="hero__sub">
                I engineer self-rewriting models, formal Rust and Lean kernels,
                coherent markets, and open archives where proof is native to
                the design, and every claim ships with the runs, hashes, and
                broken theories that forged it.
              </p>

              <div className="hero__actions">
                <a href="#/research" className="btn-primary">
                  Research <span aria-hidden="true">→</span>
                </a>
                <a href="#frontiers" className="btn-quiet">
                  Selected proofs ↓
                </a>
                <a href="#install" className="btn-quiet">
                  My terminal ↓
                </a>
              </div>
            </div>

            <div className="hero__cinema-bar" role="toolbar" aria-label="Hero GPU ASCII shader controls">
              <span className="hero__cinema-kicker">kerr horizon · webgl2 · move or tap</span>
              <div className="hero__cinema-group">
                {HERO_LENSES.map((lens) => (
                  <button
                    key={lens.key}
                    type="button"
                    className={`hero__cinema-btn${heroCharset === lens.key ? ' is-active' : ''}`}
                    onClick={() => setHeroCharset(lens.key)}
                  >
                    {lens.label}
                  </button>
                ))}
                <span className="hero__cinema-sep" aria-hidden="true" />
                <button
                  type="button"
                  className={`hero__cinema-btn${heroEdges ? ' is-active' : ''}`}
                  onClick={() => setHeroEdges((v) => !v)}
                  title="Toggle Sobel directional edge sculpting"
                >
                  edges
                </button>
                <button
                  type="button"
                  className={`hero__cinema-btn${heroBloom ? ' is-active' : ''}`}
                  onClick={() => setHeroBloom((v) => !v)}
                  title="Toggle phosphor bloom"
                >
                  bloom
                </button>
                <button
                  type="button"
                  className="hero__cinema-btn"
                  onClick={() => setHeroPlaying((v) => !v)}
                  aria-label={heroPlaying ? 'Pause hero ASCII cinema' : 'Play hero ASCII cinema'}
                >
                  {heroPlaying ? 'pause' : 'play'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 01 · FOUNDATIONS */}
        <section className="ed-section" id="about">
          <div className="ed-section__head">
            <p className="ed-eyebrow">01 · Foundations</p>
            <h2>Background.</h2>
          </div>

          <div className="about-layout">
            <figure className="about-figure">
              <div className="about-figure__stage">
                <Video2Ascii
                  key={`about-${aboutVideoSrc}`}
                  src={aboutVideoSrc}
                  poster={aboutPosterSrc}
                  numColumns={116}
                  colored={true}
                  blend={10}
                  highlight={12}
                  brightness={1.14}
                  saturation={1.24}
                  bloom={0.32}
                  edgeAware={true}
                  lensing={0.48}
                  posterTime={1.0}
                  audioEffect={0}
                  enableMouse={true}
                  enableRipple={true}
                  charset={aboutCharset}
                  isPlaying={true}
                  autoPlay={true}
                  enableSpacebarToggle={true}
                />
              </div>
              <figcaption className="about-figure__caption about-figure__caption--split">
                <span>Interactive glyph study: move or tap across the frame.</span>
                <span className="about-figure__lenses" role="group" aria-label="Glyph study lens">
                  {(['cinematic', 'braille', 'detailed'] as CharsetKey[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      className={`about-lens-btn${aboutCharset === key ? ' is-active' : ''}`}
                      onClick={() => setAboutCharset(key)}
                    >
                      {key}
                    </button>
                  ))}
                </span>
              </figcaption>
            </figure>

            <div className="about-editorial">
              <blockquote className="about-pullquote">
                “Together, our actions compose the opening melody of life’s
                symphony.”
              </blockquote>

              <div className="about-prose">
                <p>
                  I trained in economics and data science, beginning in sustainable
                  development and environmental impact assessment, fields where a
                  sloppy measurement model quietly warps every decision built atop
                  it. That same seam pulled me toward verifiable AI, formal
                  admission kernels, market coherence, and computational
                  humanities: building small, checkable instruments that hold up
                  when incentives or stakes turn adversarial.
                </p>
                <p>
                  Every empirical claim on this site links back to a reproducible
                  run, a cryptographic digest, or an honest ceiling. When a clean
                  hypothesis breaks, whether a geometric probe ties plain PCA or a
                  sacred-geography conjecture reverses under blind coding, the
                  negative result stays in the ledger beside what held.
                </p>
              </div>

              <div className="about-colophon">
                <div className="about-colophon__item">
                  <span>Off-screen</span>
                  <p className="about-colophon__text">
                    Permaculture, DIY engineering, long runs, cycling, cooking,
                    yoga, soccer, chess, Go, and Catan.
                  </p>
                </div>

                <div className="about-colophon__item">
                  <span>Reading &amp; notes</span>
                  <a
                    href={favoriteBlogHref}
                    target="_blank"
                    rel="noreferrer"
                    className="text-link"
                  >
                    Venkatesh Rao’s Psychohistory ↗
                  </a>
                  <WikiChip id="evidence-bounded" label="Commonplace Graph" onOpen={openWiki} />
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

        {/* 02 · SELECTED WORK (Living GPU ASCII Cinema Stage) */}
        <section className="ed-section" id="archive">
          <div className="ed-section__head ed-section__head--split">
            <div>
              <p className="ed-eyebrow">02 · Selected Work</p>
              <h2>Selected work.</h2>
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
            <div className="work-chapter__ambient" aria-hidden="true">
              <Video2Ascii
                key={`${activeWork.title}-${activeWork.ambientVideo.src}`}
                src={activeWork.ambientVideo.src}
                poster={activeWork.ambientVideo.poster}
                numColumns={activeWork.ambientVideo.numColumns}
                colored={true}
                blend={activeWork.ambientVideo.blend}
                highlight={activeWork.ambientVideo.highlight}
                brightness={activeWork.ambientVideo.brightness}
                saturation={activeWork.ambientVideo.saturation}
                bloom={activeWork.ambientVideo.bloom}
                edgeAware={true}
                lensing={0.28}
                fitMode={activeWork.ambientVideo.fitMode}
                focalY={activeWork.ambientVideo.focalY}
                posterTime={activeWork.ambientVideo.posterTime}
                audioEffect={0}
                enableMouse={false}
                enableRipple={false}
                charset="cinematic"
                isPlaying={true}
                autoPlay={true}
              />
              <div className="work-chapter__wash" />
            </div>

            <div className={`work-chapter__inner${activeWorkHasWalkthrough ? ' has-media' : ''}`}>
              <div className="work-chapter__prose">
                <div className="work-chapter__meta">
                  <span>{activeWork.eyebrow}</span>
                  <span>{activeWork.role}</span>
                </div>

                <h3>{activeWork.title}</h3>
                <p className="work-chapter__summary">{activeWork.narrative}</p>

                <ul className="work-chapter__points">
                  {activeWork.shipped.map((detail) => (
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
                </div>
              </div>

              {activeWorkHasWalkthrough && activeWork.video ? (
                <LazyWalkthroughVideo title={activeWork.title} video={activeWork.video} />
              ) : null}
            </div>
          </article>
        </section>

        {/* 03 · VERIFIED RESEARCH & HONEST NULLS (Live SHA-256 Raw-Data Showcase) */}
        <ProofShowcase
          onOpenWiki={openWiki}
          focusedDispatchRequest={focusedDispatchRequest}
        />

        {/* 04 · WRITING (Clean Typographic Index + Book-Grade Palatino Sheet) */}
        <section className="ed-section" id="writings">
          <div className="ed-section__head ed-section__head--split">
            <div>
              <p className="ed-eyebrow">04 · Writing</p>
              <h2>Essays and field notes.</h2>
            </div>

            <div className="ed-lead">
              <p>
                Long-form notes on AI assurance, mechanistic interpretability
                nulls, market coherence, sacred economics, and public-goods
                institutions, written with their negative results intact.
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
                Read all {writings.length} essays &amp; notes ↓
              </button>
            </div>
          ) : null}
        </section>

        {/* 05 · LIVE SANDBOXED TERMINAL */}
        <section className="ed-section" id="install">
          <div className="ed-section__head ed-section__head--split">
            <div>
              <p className="ed-eyebrow">05 · Live Sandboxed Terminal</p>
              <h2>Interactive terminal.</h2>
            </div>

            <div className="ed-lead">
              <p>
                A read-only terminal bridged from my Raspberry Pi 5 running{' '}
                <code>shaanpatel-cv-pico</code>, with an instant in-browser
                fallback. Query any paper or confound live, run interactive
                tools, or open eight Braille/ASCII worlds from human
                psychohistory to deep time.
              </p>
            </div>
          </div>

          <div className="terminal-layout">
            <EtherTerminal />

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
                  <dt>RPi5 Sandbox</dt>
                  <dd>
                    Zero-shell container (<code>--read-only</code>, <code>--cap-drop=ALL</code>) streaming{' '}
                    <code>shaanpatel-cv-pico</code> over WSS.
                  </dd>
                </div>
                <div>
                  <dt>Ether Portals</dt>
                  <dd>Eight interactive 2×4 Braille/ASCII worlds from Psychohistory to Universal History.</dd>
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
            <a href="#/research" className="colophon__receipt">
              14 research entries · 16 SHA-256 verified bundles · 22 ManimGX renders
            </a>
          </div>

          <nav className="colophon__nav" aria-label="Footer">
            <a href="#top">Top ↑</a>
            <a href="#archive">Work</a>
            <a href="#frontiers">Proofs</a>
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
