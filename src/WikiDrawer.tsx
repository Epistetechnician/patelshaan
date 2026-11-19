import { useEffect, useMemo, useRef } from 'react'
import { kailas } from './field'
import {
  essayNotes,
  threadById,
  threads,
  works,
  type ThreadId,
} from './humanities'
import { lineage } from './lineage'
import { repoUrl, researchRepos } from './research'

export type WikiResolvedNode = {
  id: string
  kind: 'inquiry' | 'concept' | 'thread' | 'work'
  eyebrow: string
  title: string
  badge?: string
  subtitle: string
  body: string[]
  stats?: { value: string; label: string }[]
  ceiling?: string
  relatedIds: { id: string; label: string; kind: string }[]
  essaySlug?: string
  monographHref?: string
  externalHref?: string
  externalLabel?: string
  embedDispatchId?: string
}

type ConceptSpec = {
  id: string
  eyebrow: string
  title: string
  badge: string
  subtitle: string
  body: string[]
  stats: { value: string; label: string }[]
  ceiling: string
  relatedIds: string[]
  essaySlug?: string
  monographHref?: string
  externalHref?: string
  externalLabel?: string
  embedDispatchId?: string
}

const CONCEPT_NODES: Record<string, ConceptSpec> = {
  'evidence-bounded': {
    id: 'evidence-bounded',
    eyebrow: 'Position Paper · Programme Spine',
    title: 'Evidence-Bounded Intelligence',
    badge: 'Thesis',
    subtitle:
      'Why operational authority over self-improving and autonomous AI systems must scale with adversarial verification receipts—never raw capability scores.',
    body: [
      'Across safety grading, learned module replacement, and self-improvement loops, single evaluators routinely disagree (15.4% vs 53.6% on identical model outputs) or miss high-order sensitivity drift (0.89 Jacobian error at 0.11 value error).',
      'An evidence-bounded architecture separates untrusted proposers from small formal/attested kernels, prices every holdout query in bits, and keeps null results and self-caught confounds in the permanent ledger.',
    ],
    stats: [
      { value: '15.4% vs 53.6%', label: 'Grader disagreement on identical outputs' },
      { value: '0 / 59,200', label: 'Holdout certificate violations under attack' },
      { value: '0 / 552', label: 'Hostile actions admitted by FormaSec kernel' },
    ],
    ceiling:
      'Establishes verifiable admission gates on bounded kernels, single-host TDX, and ≤8B open-weight models; does not claim solved open-world alignment.',
    relatedIds: ['holdout-ledger', 'formasec', 'failure', 'power', 'measure', 'feynman'],
    essaySlug: 'evidence-bounded-intelligence',
    monographHref: '#/research',
  },
  statebook: {
    id: 'statebook',
    eyebrow: 'Architecture & Live Receipt · Socio-Economics',
    title: 'Statebook: Coherence & Finality Clocks',
    badge: '72-pp Spec + Live Receipt',
    subtitle:
      'Normalizing federated contract terms into StateKeys, seven non-compensating completeness checks, and separated finality clocks before treating cross-venue positions as coherent.',
    body: [
      'Cross-venue markets routinely treat economically distinct claims as fungible collateral while conflating execution speed with legal or oracle settlement finality.',
      'A live read-only receipt across 13 Polymarket negRisk/cumulative events and 188 contracts surfaces a 6.30% max partition residual (3.90% gross Dutch-book gap prior to fees, 0.00% cumulative calendar inversion, 5.04 bps weighted half-spread) signed under SHA-256 + HMAC.',
    ],
    stats: [
      { value: '188 contracts', label: 'Live Polymarket partition audit (13 events)' },
      { value: '6.30%', label: 'Observed cross-outcome partition residual' },
      { value: '5.04 bps', label: 'Liquidity-weighted half-spread' },
    ],
    ceiling:
      'Read-only coherence and accounting specification; does not execute trades, custody collateral, or settle funds (historical cross-venue settlement logs remain next).',
    relatedIds: ['commons', 'trust', 'measure', 'hyperintel', 'ostrom', 'poovey'],
    essaySlug: 'statebooks-convergence-with-coherence',
    externalHref: '/publications/statebook-whitepaper.pdf',
    externalLabel: 'Whitepaper PDF ↗',
    embedDispatchId: 'statebook-coherence',
  },
  'ecdsa-fail': {
    id: 'ecdsa-fail',
    eyebrow: 'Publication · arXiv:2609.09582',
    title: 'ECDSA.fail: Reversible Quantum Point Addition',
    badge: '−86.1% Q × T',
    subtitle:
      'Evaluator-verified open autoresearch loop optimizing reversible secp256k1 elliptic-curve point-addition circuits inside Shor’s algorithm.',
    body: [
      'Every candidate circuit transformation must pass exact arithmetic equivalence, ancilla uncomputation, and phase-cleanliness gates before admission onto the public Pareto frontier.',
      'Reduced the width × T-count metric by 86.1% relative to published baselines (reaching 1.496B Q × T at paper cutoff and 1.259B post-cutoff).',
    ],
    stats: [
      { value: '−86.1%', label: 'Q × T reduction over baseline circuits' },
      { value: '1.259B', label: 'Post-cutoff verified Q × T frontier' },
      { value: '100%', label: 'Exactness & uncomputation gate enforcement' },
    ],
    ceiling:
      'Coherent windowed figures reflect per-call sensitivity models rather than full-Shor end-to-end fault-tolerant physical qubit estimates.',
    relatedIds: ['composed-zk-benchmark-os', 'holdout-ledger', 'measure', 'lakatos'],
    essaySlug: 'zero-knowledge-mpc-and-post-quantum-security',
    externalHref: 'https://arxiv.org/abs/2609.09582',
    externalLabel: 'Read arXiv:2609.09582 ↗',
    embedDispatchId: 'ecdsa-fail',
  },
}

const DISPATCH_EMBED_BY_SLUG: Record<string, string> = {
  'holdout-ledger': 'holdout-ledger',
  formasec: 'formasec-saos',
  'security-alignment-os': 'formasec-saos',
  caduceus: 'playbox-caduceus',
  playbox: 'playbox-caduceus',
  'mech-interp-unified': 'mech-interp-audit',
  'temporal-grid-safety': 'temporal-grid',
  'composed-zk-benchmark-os': 'composed-zk',
  'sacred-geography-kailas': 'kailas-corpus',
  'hsi-lab': 'temporal-grid',
  hyperintel: 'hyperintel-provenance',
}

function getNodeShortLabel(id: string): string {
  if (CONCEPT_NODES[id]) {
    const shortMap: Record<string, string> = {
      'evidence-bounded': 'Evidence-Bounded AI',
      statebook: 'Statebook',
      'ecdsa-fail': 'ECDSA.fail',
    }
    return shortMap[id] ?? CONCEPT_NODES[id].title
  }
  const repo = researchRepos.find((r) => r.slug === id)
  if (repo) return repo.name
  if (id === kailas.slug) return 'Mount Kailash Study'
  const thread = threads.find((t) => t.id === id)
  if (thread) return thread.title
  const work = works[id]
  if (work) return `${work.by.split('&')[0].split(',')[0].trim()} (${work.year})`
  return id
}

function getNodeKindLabel(id: string): string {
  if (CONCEPT_NODES[id]) return 'Primitive'
  if (researchRepos.some((r) => r.slug === id)) return 'Inquiry'
  if (id === kailas.slug) return 'Field Study'
  if (threads.some((t) => t.id === id)) return 'Thread'
  if (works[id]) return 'Reading'
  return 'Node'
}

function resolveWikiNode(id: string): WikiResolvedNode | null {
  const concept = CONCEPT_NODES[id]
  if (concept) {
    return {
      id: concept.id,
      kind: 'concept',
      eyebrow: concept.eyebrow,
      title: concept.title,
      badge: concept.badge,
      subtitle: concept.subtitle,
      body: concept.body,
      stats: concept.stats,
      ceiling: concept.ceiling,
      relatedIds: concept.relatedIds.map((rid) => ({
        id: rid,
        label: getNodeShortLabel(rid),
        kind: getNodeKindLabel(rid),
      })),
      essaySlug: concept.essaySlug,
      monographHref: concept.monographHref,
      externalHref: concept.externalHref,
      externalLabel: concept.externalLabel,
      embedDispatchId: concept.embedDispatchId,
    }
  }

  if (id === kailas.slug) {
    const rel = [...kailas.threads, ...kailas.shelf.slice(0, 5)]
    return {
      id: kailas.slug,
      kind: 'inquiry',
      eyebrow: 'Computational Humanities · Open Corpus',
      title: kailas.name,
      badge: '2,626 Passages',
      subtitle: kailas.question,
      body: [kailas.headline],
      stats: kailas.results.slice(0, 3),
      ceiling: kailas.notShown,
      relatedIds: rel.map((rid) => ({
        id: rid,
        label: getNodeShortLabel(rid),
        kind: getNodeKindLabel(rid),
      })),
      essaySlug: 'approaching-breakthroughs-across-systems',
      monographHref: `#/research/${kailas.slug}`,
      externalHref: 'https://github.com/Epistetechnician/kailas-corpus',
      externalLabel: 'kailas-corpus ↗',
      embedDispatchId: 'kailas-corpus',
    }
  }

  const repo = researchRepos.find((r) => r.slug === id)
  if (repo) {
    const lin = lineage[repo.slug]
    const relIds: string[] = [
      ...(lin?.threads ?? []),
      ...(lin?.shelf.slice(0, 4) ?? []),
    ]
    const matchingEssay = Object.entries(essayNotes).find(([, note]) =>
      note.inquiries?.includes(repo.slug),
    )?.[0]

    return {
      id: repo.slug,
      kind: 'inquiry',
      eyebrow: `Research Inquiry · ${repo.category}`,
      title: repo.name,
      badge: repo.results[0]?.value,
      subtitle: repo.question,
      body: [repo.headline],
      stats: repo.results.slice(0, 3),
      ceiling: repo.notShown,
      relatedIds: relIds.map((rid) => ({
        id: rid,
        label: getNodeShortLabel(rid),
        kind: getNodeKindLabel(rid),
      })),
      essaySlug: matchingEssay,
      monographHref: `#/research/${repo.slug}`,
      externalHref: repoUrl(repo.repo),
      externalLabel: 'GitHub Repository ↗',
      embedDispatchId: DISPATCH_EMBED_BY_SLUG[repo.slug],
    }
  }

  const thread = threads.find((t) => t.id === (id as ThreadId))
  if (thread) {
    const relIds = [...thread.inquiries, ...thread.works.slice(0, 5)]
    const matchingEssay = Object.entries(essayNotes).find(([, note]) =>
      note.threads.includes(thread.id),
    )?.[0]
    return {
      id: thread.id,
      kind: 'thread',
      eyebrow: 'Commonplace Thread · Cross-Disciplinary Question',
      title: thread.title,
      badge: `${thread.inquiries.length} inquiries`,
      subtitle: thread.question,
      body: thread.essay,
      relatedIds: relIds.map((rid) => ({
        id: rid,
        label: getNodeShortLabel(rid),
        kind: getNodeKindLabel(rid),
      })),
      essaySlug: matchingEssay,
      monographHref: `#/research?t=${thread.id}`,
    }
  }

  const work = works[id]
  if (work) {
    const citingThreads = threads
      .filter((t) => t.works.includes(work.id))
      .map((t) => t.id)
    const citingInquiries = Object.entries(lineage)
      .filter(([, l]) => l.shelf.includes(work.id))
      .map(([slug]) => slug)
    const citingEssay = Object.entries(essayNotes).find(([, note]) =>
      note.reading.includes(work.id),
    )?.[0]
    const relIds = [...citingThreads, ...citingInquiries.slice(0, 4)]

    return {
      id: work.id,
      kind: 'work',
      eyebrow: `Canonical Shelf · ${work.year}`,
      title: `${work.by} — ${work.title}`,
      badge: work.year,
      subtitle: 'Why this work sits in the portfolio’s intellectual lineage:',
      body: [
        work.note,
        citingThreads.length
          ? `Connects directly to ${citingThreads.map((tid) => threadById(tid).title).join(', ')}.`
          : 'Referenced across verification and epistemic-humility notes.',
      ],
      relatedIds: relIds.map((rid) => ({
        id: rid,
        label: getNodeShortLabel(rid),
        kind: getNodeKindLabel(rid),
      })),
      essaySlug: citingEssay,
      monographHref: citingThreads[0] ? `#/research?t=${citingThreads[0]}` : '#/research',
      externalHref: work.url,
      externalLabel: work.url ? 'DOI / Source ↗' : undefined,
    }
  }

  return null
}

export function WikiChip({
  id,
  label,
  onOpen,
  className = '',
}: {
  id: string
  label?: string
  onOpen: (id: string) => void
  className?: string
}) {
  const text = label ?? getNodeShortLabel(id)
  return (
    <button
      type="button"
      className={`wiki-chip${className ? ` ${className}` : ''}`}
      onClick={(e) => {
        e.stopPropagation()
        onOpen(id)
      }}
      title={`Inspect [[${text}]] in knowledge graph`}
    >
      <span className="wiki-chip__br" aria-hidden="true">
        [[
      </span>
      <span className="wiki-chip__label">{text}</span>
      <span className="wiki-chip__br" aria-hidden="true">
        ]]
      </span>
    </button>
  )
}

export function WikiDrawer({
  trail,
  onNavigate,
  onJumpToStep,
  onClose,
  onOpenEssay,
  onFocusDispatch,
}: {
  trail: string[]
  onNavigate: (id: string) => void
  onJumpToStep: (index: number) => void
  onClose: () => void
  onOpenEssay: (slug: string) => void
  onFocusDispatch: (dispatchId: string) => void
}) {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null)
  const activeId = trail[trail.length - 1]
  const node = useMemo(
    () => (activeId ? resolveWikiNode(activeId) : null),
    [activeId],
  )

  useEffect(() => {
    if (!node) return
    closeBtnRef.current?.focus({ preventScroll: true })
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [node, onClose])

  if (!node) return null

  return (
    <div
      className="wiki-drawer-root"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wiki-drawer-title"
      onClick={onClose}
    >
      <div className="wiki-drawer__scrim" aria-hidden="true" />
      <aside
        className="wiki-drawer"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="wiki-drawer__topbar">
          <div className="wiki-drawer__nav">
            {trail.length > 1 ? (
              <button
                type="button"
                className="wiki-drawer__stepback"
                onClick={() => onJumpToStep(trail.length - 2)}
              >
                ← Back
              </button>
            ) : (
              <span className="wiki-drawer__tag">[[Wiki Graph]]</span>
            )}
          </div>

          <button
            ref={closeBtnRef}
            type="button"
            className="wiki-drawer__close"
            onClick={onClose}
            aria-label="Close knowledge node"
          >
            Esc · Close
          </button>
        </div>

        {trail.length > 1 ? (
          <nav className="wiki-breadcrumbs" aria-label="Knowledge trail">
            {trail.map((stepId, idx) => {
              const isCurrent = idx === trail.length - 1
              return (
                <span key={`${stepId}-${idx}`} className="wiki-breadcrumbs__item">
                  <button
                    type="button"
                    className={`wiki-breadcrumbs__btn${isCurrent ? ' is-current' : ''}`}
                    onClick={() => onJumpToStep(idx)}
                    aria-current={isCurrent ? 'step' : undefined}
                  >
                    {getNodeShortLabel(stepId)}
                  </button>
                  {!isCurrent ? <span aria-hidden="true">›</span> : null}
                </span>
              )
            })}
          </nav>
        ) : null}

        <div className="wiki-drawer__body">
          <header className="wiki-drawer__head">
            <div className="wiki-drawer__kicker-row">
              <p className="wiki-drawer__eyebrow">{node.eyebrow}</p>
              {node.badge ? <span className="wiki-drawer__badge">{node.badge}</span> : null}
            </div>
            <h2 id="wiki-drawer-title">{node.title}</h2>
            <p className="wiki-drawer__subtitle">{node.subtitle}</p>
          </header>

          {node.stats?.length ? (
            <dl className="wiki-drawer__stats">
              {node.stats.map((s) => (
                <div key={s.label}>
                  <dt>{s.value}</dt>
                  <dd>{s.label}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          <div className="wiki-drawer__prose">
            {node.body.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>

          {node.ceiling ? (
            <div className="wiki-drawer__ceiling">
              <span>Scope ceiling — </span>
              {node.ceiling}
            </div>
          ) : null}

          {node.relatedIds.length > 0 ? (
            <section className="wiki-drawer__graph" aria-label="Connected nodes">
              <h3>Connected nodes — click to traverse</h3>
              <div className="wiki-drawer__chips">
                {node.relatedIds.map((rel) => (
                  <button
                    key={rel.id}
                    type="button"
                    className="wiki-node-pill"
                    onClick={() => onNavigate(rel.id)}
                  >
                    <span className="wiki-node-pill__kind">{rel.kind}</span>
                    <span className="wiki-node-pill__label">[[{rel.label}]]</span>
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          <footer className="wiki-drawer__actions">
            {node.embedDispatchId ? (
              <button
                type="button"
                className="btn-primary wiki-drawer__cta"
                onClick={() => {
                  onClose()
                  onFocusDispatch(node.embedDispatchId!)
                }}
              >
                Open inline dispatch ↓
              </button>
            ) : null}

            {node.monographHref ? (
              <a
                href={node.monographHref}
                className="btn-quiet"
                onClick={onClose}
              >
                Monograph page →
              </a>
            ) : null}

            {node.essaySlug ? (
              <button
                type="button"
                className="btn-quiet"
                onClick={() => {
                  onClose()
                  onOpenEssay(node.essaySlug!)
                }}
              >
                Companion essay →
              </button>
            ) : null}

            {node.externalHref && node.externalLabel ? (
              <a
                href={node.externalHref}
                target="_blank"
                rel="noreferrer"
                className="text-link"
              >
                {node.externalLabel}
              </a>
            ) : null}
          </footer>
        </div>
      </aside>
    </div>
  )
}
