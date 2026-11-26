import { useEffect, useMemo, useRef, useState } from 'react'
import { EssayFigure } from './EssayFigure'
import { type Essay } from './essays'
import { getEssay } from './essays-extra'
import { ArchDiagram } from './ArchDiagram'
import { Demo } from './Demos'
import { ReplayWindow } from './Replay'
import { repoUrl, researchRepos, type ResearchRepo } from './research'
import { RichText, type SidenoteRegistry } from './components/RichText'
import { ReceiptVerifier } from './components/ReceiptVerifier'
import { CitationBlock } from './components/CitationBlock'
import { WorkList } from './components/WorkList'
import { fieldStrands, getField, type FieldStrand } from './field'
import { threads } from './humanities'
import { lineage, type Lineage } from './lineage'
import { PostAnimCanvas } from './viz/ResearchAnims'

type CollectedNote = {
  id: string
  num: number
  text: string
  anchorSelector: string
}

type IndexEntry = {
  slug: string
  title: string
  year: string
  category: string
  searchBlob: string
}

/* ---------- Nathan.rs scroll-spy TOC hook (33% viewport trigger) ---------- */
function useActiveToc(sectionIds: string[]): string {
  const [active, setActive] = useState(sectionIds[0] ?? '')
  useEffect(() => {
    if (!sectionIds.length) return
    let ticking = false
    const update = () => {
      const trigger = window.scrollY + window.innerHeight * 0.33
      let cur = sectionIds[0]
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i])
        if (!el) continue
        const top = el.getBoundingClientRect().top + window.scrollY
        if (trigger >= top) {
          cur = sectionIds[i]
          break
        }
      }
      setActive(cur)
      ticking = false
    }
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update)
        ticking = true
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    update()
    return () => window.removeEventListener('scroll', onScroll)
  }, [sectionIds])
  return active
}

/* ---------- Nathan.rs collision-free Tufte sidenotes (post-enhancements.js) ---------- */
function useSidenotePositions(
  gridRef: React.RefObject<HTMLDivElement | null>,
  contentRef: React.RefObject<HTMLDivElement | null>,
  notes: CollectedNote[],
) {
  const [tops, setTops] = useState<Record<string, number>>({})
  const noteRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    if (!notes.length) return
    const layout = () => {
      const grid = gridRef.current
      const content = contentRef.current
      if (!grid || !content || window.matchMedia('(max-width: 1100px)').matches) {
        setTops({})
        return
      }
      const gridTop = grid.getBoundingClientRect().top + window.scrollY
      const placed: { top: number; height: number }[] = []
      const next: Record<string, number> = {}
      notes.forEach((n) => {
        const anchor = content.querySelector(n.anchorSelector)
        if (!anchor) return
        const refTop = anchor.getBoundingClientRect().top + window.scrollY - gridTop
        const last = placed[placed.length - 1]
        const top = last ? Math.max(refTop, last.top + last.height + 18) : Math.max(0, refTop)
        const h = noteRefs.current[n.id]?.offsetHeight || 68
        next[n.id] = top
        placed.push({ top, height: h })
      })
      setTops(next)
    }

    const raf = window.requestAnimationFrame(layout)
    const t = window.setTimeout(layout, 450)
    window.addEventListener('resize', layout)
    return () => {
      window.cancelAnimationFrame(raf)
      window.clearTimeout(t)
      window.removeEventListener('resize', layout)
    }
  }, [gridRef, contentRef, notes])

  return { tops, noteRefs }
}

function collectEssayNotes(essay: Essay): { notes: CollectedNote[]; registry: SidenoteRegistry } {
  const notes: CollectedNote[] = []
  const map = new Map<string, number>()
  essay.sections.forEach((sec, idx) => {
    if (sec.sidenotes) {
      sec.sidenotes.forEach((sn) => {
        const num = notes.length + 1
        map.set(sn.id, num)
        notes.push({
          id: sn.id,
          num,
          text: sn.text,
          anchorSelector: `[data-fn-ref="${sn.id}"]`,
        })
      })
    }
    if (sec.aside) {
      const id = `aside-s${idx + 1}`
      const num = notes.length + 1
      notes.push({
        id,
        num,
        text: sec.aside,
        anchorSelector: `#s${idx + 1} h2`,
      })
    }
  })
  return {
    notes,
    registry: { indexFor: (id: string) => map.get(id) },
  }
}

/* ---------- Nathan.rs sticky frosted top nav with top-right ☼ / ☾ toggle ---------- */
function TopBar() {
  const [light, setLight] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      return localStorage.getItem('rp-theme-v2') === 'light'
    } catch {
      return false
    }
  })

  useEffect(() => {
    document.documentElement.classList.toggle('light-mode', light)
    const themeMeta = document.getElementById('theme-color-meta')
    if (themeMeta) {
      themeMeta.setAttribute('content', light ? '#ffffff' : '#141414')
    }
    try {
      localStorage.setItem('rp-theme-v2', light ? 'light' : 'dark')
    } catch {
      /* storage unavailable */
    }
  }, [light])

  return (
    <header className="site-top-nav">
      <nav className="site-top-nav-inner" aria-label="Primary">
        <a href="#/" className="site-top-nav-brand">
          shaan4d.xyz
        </a>
        <div className="site-top-nav-links">
          <a href="#/research">Research</a>
          <a
            href="#frontiers"
            onClick={() => {
              window.location.hash = '#frontiers'
            }}
          >
            Frontiers
          </a>
          <a href="https://github.com/Epistetechnician" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <button
            type="button"
            className="theme-toggle"
            onClick={() => setLight((v) => !v)}
            aria-label={light ? 'Switch to dark mode' : 'Switch to light mode'}
            title={light ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {light ? '☾' : '☼'}
          </button>
        </div>
      </nav>
    </header>
  )
}

const jump = (id: string) => (e: React.MouseEvent) => {
  e.preventDefault()
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

function CopyBlock({ command }: { command: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard unavailable */
    }
  }
  return (
    <div className="rp-code">
      <code>{command}</code>
      <button type="button" onClick={copy} aria-label="Copy command">
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}

function Install({ repo }: { repo: ResearchRepo }) {
  const [tab, setTab] = useState(0)
  const active = repo.install[tab]
  return (
    <div>
      <div className="rp-tabs" role="tablist">
        {repo.install.map((item, i) => (
          <button
            key={item.label}
            type="button"
            role="tab"
            aria-selected={i === tab}
            onClick={() => setTab(i)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {active.note ? <p className="rp-note">{active.note}</p> : null}
      <CopyBlock command={active.command} />
    </div>
  )
}

function EssaySections({ essay, sidenotes }: { essay: Essay; sidenotes: SidenoteRegistry }) {
  return (
    <>
      {essay.sections.map((sec, i) => (
        <section key={sec.title} id={`s${i + 1}`} className="post-section">
          <h2>
            <RichText text={sec.title} sidenotes={sidenotes} />
          </h2>
          {sec.body.map((p) => (
            <p key={p.slice(0, 40)}>
              <RichText text={p} sidenotes={sidenotes} />
            </p>
          ))}
          {sec.aside ? (
            <aside className="post-aside-mobile">
              <RichText text={sec.aside} sidenotes={sidenotes} />
            </aside>
          ) : null}
          {sec.sidenotes?.length ? (
            <div className="post-footnotes-mobile">
              {sec.sidenotes.map((sn) => (
                <p key={sn.id} id={`fn-${sn.id}`}>
                  <span className="post-sidenote-number">{sidenotes.indexFor(sn.id)}</span>
                  <RichText text={sn.text} />
                </p>
              ))}
            </div>
          ) : null}
          {sec.figures?.map((f, j) => (
            <EssayFigure key={j} fig={f} />
          ))}
        </section>
      ))}
    </>
  )
}

function ReadingGrid({
  toc,
  slug,
  notes,
  children,
}: {
  toc: { id: string; title: string }[]
  slug: string
  notes: CollectedNote[]
  children: React.ReactNode
}) {
  const gridRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const ids = useMemo(() => toc.map((t) => t.id), [toc])
  const activeId = useActiveToc(ids)
  const { tops, noteRefs } = useSidenotePositions(gridRef, contentRef, notes)

  return (
    <div ref={gridRef} className="post-reading-grid">
      <aside className="post-toc" aria-label="Table of contents">
        <nav>
          <ul>
            {toc.map((item) => (
              <li key={item.id}>
                <a
                  href={`#/research/${slug}`}
                  className={activeId === item.id ? 'active' : undefined}
                  onClick={jump(item.id)}
                >
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div ref={contentRef} className="book-post-content">
        {children}
      </div>

      <aside className="post-sidenotes" aria-label="Footnotes">
        {notes.map((n) => (
          <div
            key={n.id}
            ref={(el) => {
              noteRefs.current[n.id] = el
            }}
            className="post-sidenote"
            style={tops[n.id] !== undefined ? { top: `${tops[n.id]}px`, opacity: 1 } : { opacity: 0 }}
          >
            <span className="post-sidenote-number">{n.num}</span>
            <RichText text={n.text} />
          </div>
        ))}
      </aside>
    </div>
  )
}

function LineageBlock({ data, id }: { data: Lineage; id: string }) {
  return (
    <section id={id} className="post-section">
      <h2>Older versions of the question</h2>
      {data.epigraph ? (
        <figure className="post-epigraph">
          <blockquote lang={data.epigraph.lang}>{data.epigraph.text}</blockquote>
          {data.epigraph.gloss ? <p className="post-epigraph-gloss">{data.epigraph.gloss}</p> : null}
          <figcaption>{data.epigraph.by}</figcaption>
        </figure>
      ) : null}
      {data.sections.map((sec) => (
        <div key={sec.title}>
          <h3>{sec.title}</h3>
          {sec.body.map((p) => (
            <p key={p.slice(0, 40)}>
              <RichText text={p} />
            </p>
          ))}
        </div>
      ))}
      <h3>On the shelf</h3>
      <WorkList ids={data.shelf} />
    </section>
  )
}

function Sources({ sources }: { sources?: { label: string; url: string; why: string }[] }) {
  if (!sources?.length) return null
  return (
    <ul className="post-sources">
      {sources.map((src) => (
        <li key={src.url}>
          <a href={src.url} target="_blank" rel="noreferrer">
            {src.label}
          </a>
          <em>
            <RichText text={src.why} />
          </em>
        </li>
      ))}
    </ul>
  )
}

/* ---------- Nathan.rs year-gutter writing block list ---------- */
function WritingBlock({ title, items }: { title: string; items: IndexEntry[] }) {
  if (!items.length) return null
  return (
    <section className="writing-block">
      <h3>{title}</h3>
      <ul className="block-list">
        {items.map((item, i) => {
          const showYear = i === 0 || items[i - 1].year !== item.year
          const verifyTarget = PI5_VERIFY_TARGET[item.slug]
          return (
            <li key={`${title}-${item.slug}`}>
              <span className="block-year">{showYear ? item.year : ''}</span>
              <span className="block-entry">
                <a href={`#/research/${item.slug}`}>{item.title}</a>
                {verifyTarget ? (
                  <a
                    href="#install"
                    className="block-verify-link"
                    title={`Run verify ${verifyTarget} live on Raspberry Pi 5`}
                    onClick={(e) => {
                      e.preventDefault()
                      launchPi5Verify(verifyTarget)
                    }}
                  >
                    Verify live on Pi 5 ↗
                  </a>
                ) : null}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

const FEATURED_SLUGS = [
  'arc-membrane',
  'holdout-ledger',
  'mech-interp-unified',
  'temporal-grid-safety',
  'sacred-geography-kailas',
]

/* ============================================================================
   MAIN RESEARCH INDEX (#/research): Zero-fluff nathan.rs design + 4K banner
   ============================================================================ */
export function ResearchIndex({ thread }: { thread?: string }) {
  const [query, setQuery] = useState('')
  const [showCommonplace, setShowCommonplace] = useState(Boolean(thread))

  useEffect(() => {
    if (!thread) return
    window.requestAnimationFrame(() => document.getElementById(`thread-${thread}`)?.scrollIntoView())
  }, [thread])

  const allEntries: IndexEntry[] = useMemo(() => {
    const repoItems: IndexEntry[] = researchRepos.map((r) => ({
      slug: r.slug,
      title: r.name,
      year: '2026',
      category: r.category,
      searchBlob: `${r.name} ${r.slug} ${r.tagline} ${r.headline}`.toLowerCase(),
    }))
    const fieldItems: IndexEntry[] = fieldStrands.map((f) => ({
      slug: f.slug,
      title: f.name,
      year: '2026',
      category: 'humanities',
      searchBlob: `${f.name} ${f.slug} ${f.tagline} ${f.headline}`.toLowerCase(),
    }))
    return [...repoItems, ...fieldItems]
  }, [])

  const q = query.trim().toLowerCase()
  const match = (e: IndexEntry) => !q || e.searchBlob.includes(q)
  const bySlug = (slugs: string[]) =>
    slugs
      .map((s) => allEntries.find((e) => e.slug === s))
      .filter((x): x is IndexEntry => Boolean(x && match(x)))

  const blocks = [
    { title: 'Featured', items: bySlug(FEATURED_SLUGS) },
    {
      title: 'Evaluation & Self-Improvement',
      items: allEntries.filter((e) => e.category === 'evaluation' && match(e)),
    },
    {
      title: 'Interpretability & Alignment',
      items: allEntries.filter((e) => e.category === 'interpretability' && match(e)),
    },
    {
      title: 'Security & Verifiable Compute',
      items: allEntries.filter((e) => e.category === 'security' && match(e)),
    },
    {
      title: 'Computational Humanities',
      items: allEntries.filter((e) => e.category === 'humanities' && match(e)),
    },
  ]

  return (
    <div className="rp site-modern">
      <TopBar />
      <main className="site-page-shell">
        <article className="markdown site-home-grid">
          <div className="site-home-main">
            <figure className="home-vignette-wrap">
              <img
                className="home-vignette-spiral"
                src="/illustrations/fibonacci-spiral-vignette.webp"
                alt="Fibonacci Spiral: illuminated medieval Iranian and Mughal geometric artwork by Anita Chowdry (2012), floating horizontally on transparent ground"
              />
            </figure>

            <p className="home-intro">
              Research notes and systems by <a href="#/">Shaan Patel</a> across evaluation integrity,
              self-compiling agents, mechanistic interpretability, verifiable compute, and computational humanities.
              Every post reports its positive findings alongside nulls, confounds, and reproducible receipts.
            </p>

            <section className="site-writing-index" id="writing">
              <div className="writing-search">
                <input
                  type="search"
                  className="writing-search-input"
                  placeholder="Search research…"
                  aria-label="Search research posts"
                  autoComplete="off"
                  spellCheck={false}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              <div className="writing-blocks">
                {blocks.map((b) => (
                  <WritingBlock key={b.title} title={b.title} items={b.items} />
                ))}
              </div>
            </section>

            <footer className="site-index-footer">
              <details open={showCommonplace} onToggle={(e) => setShowCommonplace(e.currentTarget.open)}>
                <summary>Commonplace book &amp; reading threads ({threads.length})</summary>
                <div className="commonplace-drawer">
                  {threads.map((t) => (
                    <article key={t.id} id={`thread-${t.id}`} className="commonplace-item">
                      <h4>{t.title}</h4>
                      <p className="commonplace-q">{t.question}</p>
                      {t.essay.map((p) => (
                        <p key={p.slice(0, 40)}>
                          <RichText text={p} />
                        </p>
                      ))}
                      <WorkList ids={t.works} />
                    </article>
                  ))}
                </div>
              </details>
            </footer>
          </div>
        </article>
      </main>
    </div>
  )
}

/* ============================================================================
   FIELD STUDY MONOGRAPH PAGE (#/research/sacred-geography-kailas)
   ============================================================================ */
function FieldPage({ field }: { field: FieldStrand }) {
  const essay = field.essay
  const base = essay.sections.length
  const totalCount = researchRepos.length + fieldStrands.length
  const { notes, registry } = useMemo(() => collectEssayNotes(essay), [essay])
  const tocItems = useMemo(
    () => [
      { id: 'introduction', title: 'Introduction' },
      ...essay.sections.map((x, i) => ({ id: `s${i + 1}`, title: x.title })),
      { id: `s${base + 1}`, title: 'Architecture' },
      { id: `s${base + 2}`, title: 'Older versions' },
      { id: `s${base + 3}`, title: 'What this does not show' },
    ],
    [essay, base],
  )
  const id = (i: number) => `s${i + 1}`

  return (
    <div className="rp site-modern site-post-page">
      <TopBar />
      <article className="markdown book-post">
        <header className="post-masthead">
          <h1>{field.name}</h1>
          <p className="post-description">{field.tagline}</p>
          <div className="post-byline">
            <span>Shaan Patel</span>
            <span>Nov 2026</span>
            <a href="/viz-data/kailas-two-clock.json" target="_blank" rel="noreferrer">
              Verified dataset (JSON) ↗
            </a>
          </div>
        </header>

        <div className="post-hero">
          <PostAnimCanvas key={field.slug} id={field.slug} variant="hero" />
        </div>

        <ReadingGrid toc={tocItems} slug={field.slug} notes={notes}>
          <div id="introduction" className="post-intro-block">
            <p className="post-lead">
              <RichText text={essay.callout} />
            </p>
            <dl className="post-metrics">
              {field.results.map((r) => (
                <div key={r.label}>
                  <dt>{r.value}</dt>
                  <dd>{r.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <EssaySections essay={essay} sidenotes={registry} />

          <section id={id(base)} className="post-section">
            <h2>Architecture</h2>
            <ArchDiagram slug={field.slug} />
          </section>

          <section id={id(base + 1)} className="post-section">
            <h2>Older versions of the question</h2>
            <p>
              Pilgrimage has been studied by historians, anthropologists and the pilgrims themselves for a long time.
              The books below are the ones the study stands on, or coded directly.
            </p>
            <WorkList ids={field.shelf} />
          </section>

          <section id={id(base + 2)} className="post-section">
            <h2>What this does not show</h2>
            <p>
              <RichText text={field.notShown} />
            </p>
            <ul>
              {field.limits.map((l) => (
                <li key={l}>
                  <RichText text={l} />
                </li>
              ))}
            </ul>
          </section>

          <section className="post-section post-appendix">
            <h2>Sources &amp; verification</h2>
            <ReceiptVerifier key={field.slug} slug={field.slug} />
            {PI5_VERIFY_TARGET[field.slug] ? (
              <p className="rp-links">
                <a
                  href="#install"
                  onClick={(e) => {
                    e.preventDefault()
                    launchPi5Verify(PI5_VERIFY_TARGET[field.slug])
                  }}
                >
                  Verify live on Pi 5 (<code>verify {PI5_VERIFY_TARGET[field.slug]}</code>) ↗
                </a>
              </p>
            ) : null}
            <Sources sources={field.sources} />
            <CitationBlock slug={field.slug} title={field.name} />
            <p className="post-back-link">
              <a href="#/research">← All {totalCount} research posts</a>
            </p>
          </section>
        </ReadingGrid>
      </article>
    </div>
  )
}

const PI5_VERIFY_TARGET: Record<string, string> = {
  'arc-membrane': 'arc-membrane',
  'holdout-ledger': 'holdout-ledger',
  formasec: 'formasec',
  'security-alignment-os': 'formasec',
  psychohistory: 'psychohistory',
  'sacred-geography-kailas': 'kailas-corpus',
  'kailas-corpus': 'kailas-corpus',
  'track-b': 'track-b',
}

function launchPi5Verify(target: string) {
  try {
    window.sessionStorage.setItem('spatel_pending_cmd', `verify ${target}`)
  } catch {
    /* ignore storage errors */
  }
  window.location.hash = '#install'
}

/* ============================================================================
   REPOSITORY MONOGRAPH PAGE (#/research/<slug>): Pure nathan.rs/posts style
   ============================================================================ */
function RepoPage({ repo }: { repo: ResearchRepo }) {
  const essay = useMemo(() => getEssay(repo.slug), [repo.slug])
  const lin = lineage[repo.slug]
  const url = repoUrl(repo.repo)
  const totalCount = researchRepos.length + fieldStrands.length
  const { notes, registry } = useMemo(() => collectEssayNotes(essay), [essay])

  const base = essay.sections.length
  const archIdx = base
  const lineIdx = lin ? base + 1 : -1
  const buildIdx = base + 1 + (lin ? 1 : 0)
  const id = (i: number) => `s${i + 1}`

  const tocItems = useMemo(() => {
    const list = [
      { id: 'introduction', title: 'Introduction' },
      ...essay.sections.map((x, i) => ({ id: `s${i + 1}`, title: x.title })),
      { id: `s${archIdx + 1}`, title: 'Architecture' },
    ]
    if (lin) list.push({ id: `s${lineIdx + 1}`, title: 'Older versions' })
    list.push({ id: `s${buildIdx + 1}`, title: 'Reproduce' })
    list.push({ id: `s${buildIdx + 2}`, title: 'What this does not show' })
    return list
  }, [essay, lin, archIdx, lineIdx, buildIdx])

  return (
    <div className="rp site-modern site-post-page">
      <TopBar />
      <article className="markdown book-post">
        <header className="post-masthead">
          <h1>{repo.name}</h1>
          <p className="post-description">{repo.tagline}</p>
          <div className="post-byline">
            <span>Shaan Patel</span>
            <span>Nov 2026</span>
            <a href={url} target="_blank" rel="noreferrer">
              {repo.repo} ↗
            </a>
          </div>
        </header>

        <div className="post-hero">
          <PostAnimCanvas key={repo.slug} id={repo.slug} variant="hero" />
        </div>

        <ReadingGrid toc={tocItems} slug={repo.slug} notes={notes}>
          <div id="introduction" className="post-intro-block">
            <p className="post-lead">
              <RichText text={essay.callout} />
            </p>
            <dl className="post-metrics">
              {repo.results.slice(0, 4).map((r) => (
                <div key={r.label}>
                  <dt>{r.value}</dt>
                  <dd>{r.label}</dd>
                </div>
              ))}
            </dl>
            {repo.slug === 'theseus-lab' ? <Demo id="netswap" /> : null}
            <ReplayWindow slug={repo.slug} repo={repo.repo} />
          </div>

          <EssaySections essay={essay} sidenotes={registry} />

          <section id={id(archIdx)} className="post-section">
            <h2>Architecture</h2>
            <ArchDiagram slug={repo.slug} />
          </section>

          {lin ? <LineageBlock data={lin} id={id(lineIdx)} /> : null}

          <section id={id(buildIdx)} className="post-section">
            <h2>Reproduce</h2>
            <p>Clone the repository and run the verification gate before trusting any number.</p>
            <Install repo={repo} />
            {repo.usage.map((u) => (
              <div key={u.title}>
                <p className="rp-note">
                  <strong>{u.title}.</strong> {u.note}
                </p>
                <CopyBlock command={u.code} />
              </div>
            ))}
            <p className="rp-note">Verify:</p>
            <CopyBlock command={repo.reproduce} />
            <ReceiptVerifier key={repo.slug} slug={repo.slug} />
            {PI5_VERIFY_TARGET[repo.slug] ? (
              <p className="rp-links">
                <a
                  href="#install"
                  onClick={(e) => {
                    e.preventDefault()
                    launchPi5Verify(PI5_VERIFY_TARGET[repo.slug])
                  }}
                >
                  Verify live on Pi 5 (<code>verify {PI5_VERIFY_TARGET[repo.slug]}</code>) ↗
                </a>
              </p>
            ) : null}
            {repo.custody ? <p className="rp-note">{repo.custody}</p> : null}
          </section>

          <section id={id(buildIdx + 1)} className="post-section">
            <h2>What this does not show</h2>
            <p>
              <RichText text={repo.notShown} />
            </p>
            <ul>
              {repo.limits.map((l) => (
                <li key={l}>
                  <RichText text={l} />
                </li>
              ))}
            </ul>
          </section>

          <section className="post-section post-appendix">
            <h2>Sources &amp; artifacts</h2>
            <Sources sources={essay.sources} />
            <p className="rp-links">
              {repo.docs.map((d) => (
                <a
                  key={d.label}
                  href={
                    d.path.startsWith('http') || d.path.startsWith('/')
                      ? d.path
                      : d.path.startsWith('#')
                        ? `${url}${d.path}`
                        : `${url}/${d.path}`
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  {d.label}
                </a>
              ))}
              <a href={url} target="_blank" rel="noreferrer">
                GitHub
              </a>
            </p>
            <CitationBlock slug={repo.slug} title={repo.name} />
            <p className="post-back-link">
              <a href="#/research">← All {totalCount} research posts</a>
            </p>
          </section>
        </ReadingGrid>
      </article>
    </div>
  )
}

export default function ResearchRoute({ slug, thread }: { slug?: string; thread?: string }) {
  return slug ? <ResearchPage slug={slug} /> : <ResearchIndex thread={thread} />
}

export function ResearchPage({ slug }: { slug: string }) {
  const field = getField(slug)
  const repo = researchRepos.find((r) => r.slug === slug)
  if (field) return <FieldPage field={field} />
  if (!repo) return <ResearchIndex />
  return <RepoPage repo={repo} />
}
