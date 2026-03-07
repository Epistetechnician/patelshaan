import { useEffect, useRef, useState } from 'react'
import Video2Ascii from './components/LocalVideo2Ascii'
import './App.css'

const installOptions = [
  {
    label: 'cargo',
    title: 'Install from the repo',
    command: 'cargo install --git https://github.com/Epistetechnician/spatel-cv.git --bin spatel',
    note: 'Best developer-friendly path and the fastest way to install from source.',
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

type ExperienceVideo = {
  src: string
  label: string
  caption: string
  stats: string
  renderMode?: 'ascii' | 'video'
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

const experienceCards: ExperienceCard[] = [
  {
    eyebrow: '2025-2026',
    title: 'Halo Labs',
    role: 'Co-Founder and COO',
    summary:
      'Leading research around building a confidential stablecoins network with verifiable AI leveraging trusted execution environments while coordinating partnerships, docs, and developer onboarding.',
    details: [
      'Lead research on developing verifiable AI using TEEs and zk-proofs',
      'Mantaining website and relevant documentation',
      'Onboard developers to our light client',
      'Leading collaborations with our service providers like Phala and Fairblocks',
    ],
    video: {
      src: '/loomhalo.mp4',
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
      src: '/LorenzAttractorNoEquations.mp4',
      label: 'lorenz attractor / ascii',
      caption: 'The Lorenz attractor now renders as the ASCII counterpart for Halo.',
      stats: 'chaotic system / rendered',
      renderMode: 'ascii',
      numColumns: 84,
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
      'A liquid crypto fund that focused on building the future of decentralized finance parterned with Polygon.',
    details: [
      'Built heads up display for fund investors',
      'Established cross chain data pipelines to assist in fund investment decisions',
      'Worked with validators in the Hyperliquid ecosystem to test real yield strategies',
    ],
    video: {
      src: '/npc-skyline.mp4',
      label: 'markets / skyline / dashboards',
      caption: 'A clear skyline and kinetic city texture echoes fund interfaces, market context, and live operator tooling.',
      stats: 'cross-chain / synced',
      numColumns: 96,
      blend: 10,
      highlight: 10,
      brightness: 1.18,
    },
    secondaryVideo: {
      src: '/npc-skyline.mp4',
      label: 'npc skyline / ascii background',
      caption: 'The NPC skyline now renders as the ASCII background for the card.',
      stats: 'market context / rendered',
      renderMode: 'ascii',
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
    summary: 'My work spanned across open-source education, public-goods strategy, DAO governance, and ecosystem coordination to help mission-driven communities turn ideas into usable systems.',
    details: [
      'Solana Foundation: Updated developer documentation by simplifying wording, tightening versioning across examples, and merging newer SDK commands into lessons.',
      'Celo: Built content pipelines and public-goods strategy to highlight open-source contributions and initiatives using tools like account abstraction and quadratic funding.',
      'Dream DAO: Co-stewarded a community of about 100 young builders, helped shape DAO governance, and hosted over 40 online and 4 IRL learning gatherings.',
      'Eco DAO: Onboarded 3 organizations and 50+ individuals, implemented governance tooling, researched carbon offset financial primitives, and supported 3 NFT launches.',
    ],
    video: {
      src: '/public-goods-nature.mp4',
      label: 'commons / learning / growth',
      caption: 'A softer organic clip makes the public-goods card feel like stewardship, coordination, and long-term compounding.',
      stats: 'ecosystem / alive',
      numColumns: 92,
      blend: 6,
      highlight: 16,
      brightness: 1.1,
    },
    secondaryVideo: {
      src: '/public-goods-nature.mp4',
      label: 'public goods / ascii background',
      caption: 'The public-goods nature clip now renders behind the full card in ASCII.',
      stats: 'commons / rendered',
      renderMode: 'ascii',
      numColumns: 122,
      blend: 7,
      highlight: 24,
      brightness: 1.14,
    },
  },
]

const foundations = [
  'Economics and Data Science at Columbia University, with research spanning from sustainable development to environmental impact assessments and more. My work sits between technical and natural systems, bio-memetic antifragile design, and post-capitalist musings. ',
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

// Keep writing source inside the app so Railway builds do not depend on parent folders.
const writingModules = import.meta.glob('./content/writings/*.html', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

const writingOrder = [
  'sacred-economics-crypto',
  'gitcoin-grants',
  'dao-capital-flows',
  'civic-innovation-genz',
  'mrv-onchain',
  'p2p-humanitarian',
  'architecture-unsecured-credit',
]

function parseWritingDocument(filePath: string, rawHtml: string): WritingEntry {
  const slug = filePath.split('/').pop()?.replace(/\.html$/, '') ?? filePath
  const document = new DOMParser().parseFromString(rawHtml, 'text/html')
  const title =
    document.querySelector('.article-title')?.textContent?.trim() ??
    slug.replace(/-/g, ' ')
  const meta =
    document.querySelector('.article-meta')?.textContent?.trim() ?? 'Essay'
  const contentHtml =
    document.querySelector('.article-content')?.innerHTML.trim() ?? ''
  const summary =
    document
      .querySelector('.article-content p')
      ?.textContent?.replace(/\s+/g, ' ')
      .trim() ?? ''

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
  const [completedCount, setCompletedCount] = useState(0)

  useEffect(() => {
    const node = contentRef.current

    if (!node) {
      return
    }

    const observedNode = node.closest('.experience-card') ?? node

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.intersectionRatio >= 0.18
        setIsInView(visible)

        if (visible) {
          setHasStarted(true)
        }
      },
      {
        threshold: 0.18,
        rootMargin: '0px 0px -6% 0px',
      },
    )

    observer.observe(observedNode)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!hasStarted || !isInView || completedCount >= details.length) {
      return
    }

    const currentDetail = details[completedCount]
    let timeoutId: number

    if (typedLength < currentDetail.length) {
      timeoutId = window.setTimeout(() => {
        setTypedLength((current) => Math.min(current + 2, currentDetail.length))
      }, 8)
    } else {
      timeoutId = window.setTimeout(() => {
        setTypedLength(0)
        setCompletedCount((current) => current + 1)
      }, 140)
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
        if (index > completedCount) {
          return null
        }

        const visibleText =
          index < completedCount ? detail : detail.slice(0, typedLength)
        const showCursor =
          index === completedCount &&
          completedCount < details.length &&
          isInView

        if (!visibleText && !showCursor) {
          return null
        }

        return (
          <p key={`${title}-detail-${index}`} className="experience-details__line">
            {visibleText}
            {showCursor ? (
              <span className="experience-details__cursor" aria-hidden="true">
                |
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
  if (video.renderMode === 'video') {
    return (
      <div className="experience-media">
        <div className="experience-media__video-stack" aria-label={`${title} related video`}>
          <div className="experience-media__video-shell">
            <video
              key={`${title}-${video.src}`}
              className="experience-media__video"
              src={video.src}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
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

function WritingReaderModal({
  writing,
  onClose,
}: {
  writing: WritingEntry
  onClose: () => void
}) {
  useEffect(() => {
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

function App() {
  const heroVideoSrc = '/hero-blackhole-20s.mp4'
  const aboutVideoSrc = '/about-flower.mp4'
  const [activeWriting, setActiveWriting] = useState<WritingEntry | null>(null)

  return (
    <div className="page-shell">
      <div className="page-noise" />

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
              brightness={1.08}
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
            <div className="hero-copy__top">
              <p className="hero-name">shaan patel</p>
            </div>

            <div className="hero-copy__bottom">
              <h3 className="hero-summary">
                AI researcher, operator, and systems builder working across
                crypto, public goods, and technical storytelling.
              </h3>

              <div className="hero-actions">
                <a href="#install" className="button button--solid">
                  install me
                </a>
                <a href="#about" className="button button--ghost">
                  about me
                </a>
              </div>
            </div>
          </div>

        </section>

        <section className="install-section" id="install">
          <div className="section-heading">
            <p className="eyebrow">01 / terminal path</p>
            <h2>Learn more by installing my digital CV.</h2>
          </div>

          <div className="install-grid">
            <div className="terminal-card">
              <div className="terminal-card__bar">
                <span />
                <span />
                <span />
              </div>
              <pre>{`$ spatel --about

booting archive.................... ok
loading experience timeline........ ok
mounting section navigator......... ok
mounting links + install paths..... ok

press [h/l] to move sections
press [j/k] to move entries
press [enter] to open a link
press [q] to quit`}</pre>
            </div>

            <div className="install-options">
              {installOptions.map((option) => (
                <article key={option.label} className="install-option">
                  <p className="install-option__label">{option.label}</p>
                  <h3>{option.title}</h3>
                  <code>{option.command}</code>
                  <p>{option.note}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="about-section" id="about">
          <div className="section-heading">
            <p className="eyebrow">02 / foundations</p>
            <h2>A fuller picture of myself.</h2>
          </div>

          <div className="about-showcase">
            <div className="media-frame">
              <div className="media-frame__body">
                <Video2Ascii
                  key={`about-${aboutVideoSrc}`}
                  src={aboutVideoSrc}
                  numColumns={100}
                  colored={true}
                  blend={8}
                  highlight={18}
                  brightness={1.15}
                  audioEffect={0}
                  enableMouse={true}
                  enableRipple={true}
                  charset="detailed"
                  isPlaying={true}
                  autoPlay={true}
                  enableSpacebarToggle={true}
                  className="video-ascii"
                />
                <article className="about-copy-card about-copy-card--overlay">
                  <p className="eyebrow">about me / beyond the cv</p>
                  <h3>Research-minded builder with an eye for beauty in systems and design.</h3>
                  <h4 className="about-quote">
                    I like to think that our collective actions become notes in the opening melody of the symphony of life.
                  </h4>
              
                </article>
              </div>
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

        <section className="archive-section" id="archive">
          <div className="section-heading">
            <p className="eyebrow">03 / Proof of work</p>
            <h2>Experiences that I'm proud of</h2>
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

        <section className="writings-section" id="writings">
          <div className="section-heading">
            <p className="eyebrow">04 / writings</p>
            <h2>Public-goods essays and open-systems notes.</h2>
            <p className="writings-section__intro">
              These writings sit closest to how I think about public goods,
              coordination, infrastructure, civic experimentation, and the
              kinds of systems that deserve long-term stewardship.
            </p>
          </div>

          <div className="writings-panel">
            <div className="writings-grid" aria-label="Writing archive">
              {writings.map((writing) => (
                <button
                  key={writing.slug}
                  type="button"
                  className="writing-card"
                  onClick={() => setActiveWriting(writing)}
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
      </main>

      {activeWriting ? (
        <WritingReaderModal
          writing={activeWriting}
          onClose={() => setActiveWriting(null)}
        />
      ) : null}
    </div>
  )
}

export default App
