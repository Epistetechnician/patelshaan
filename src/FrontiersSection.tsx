import { useState } from 'react'
import {
  frontierPillars,
  type FrontierDomainId,
  type FrontierPillar,
} from './frontiers'

function InlineCode({ text }: { text: string }) {
  return (
    <>
      {text.split('`').map((part, i) =>
        i % 2 ? <code key={i}>{part}</code> : <span key={i}>{part}</span>,
      )}
    </>
  )
}

function PillarSheet({
  pillar,
  onOpenEssay,
}: {
  pillar: FrontierPillar
  onOpenEssay: (slug: string) => void
}) {
  return (
    <article className="frontier-sheet" aria-labelledby={`pillar-${pillar.id}`}>
      <header className="frontier-sheet__header">
        <div className="frontier-sheet__titles">
          <p className="frontier-sheet__meta">
            <span>{pillar.index}</span> — {pillar.subtitle}
          </p>
          <h3 id={`pillar-${pillar.id}`}>{pillar.title}</h3>
        </div>
        <p className="frontier-sheet__question">{pillar.question}</p>
      </header>

      <div className="frontier-sheet__grid">
        <div className="frontier-col">
          <h4 className="frontier-col__label">Established in artifacts</h4>
          <ul className="frontier-list">
            {pillar.established.map((item) => (
              <li key={item.title} className="frontier-entry">
                <div className="frontier-entry__head">
                  <h5>{item.title}</h5>
                  <span className="frontier-entry__metric">{item.metric}</span>
                </div>
                <p>
                  <InlineCode text={item.detail} />
                </p>
                <div className="frontier-entry__foot">
                  <span className="frontier-entry__ref">{item.artifact}</span>
                  {item.essaySlug ? (
                    <button
                      type="button"
                      className="text-link"
                      onClick={() => onOpenEssay(item.essaySlug!)}
                    >
                      Read note →
                    </button>
                  ) : item.href ? (
                    <a
                      className="text-link"
                      href={item.href}
                      target={item.href.startsWith('#') ? undefined : '_blank'}
                      rel={item.href.startsWith('#') ? undefined : 'noreferrer'}
                    >
                      Artifact →
                    </a>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="frontier-col frontier-col--right">
          <h4 className="frontier-col__label">Open horizon &amp; next threshold</h4>
          <ul className="frontier-list">
            {pillar.approaching.map((item) => (
              <li key={item.title} className="frontier-entry">
                <div className="frontier-entry__head">
                  <h5>{item.title}</h5>
                  <span className="frontier-entry__metric">{item.horizon}</span>
                </div>
                <p>
                  <InlineCode text={item.bottleneck} />
                </p>
                <p className="frontier-entry__sub">
                  <InlineCode text={item.unlock} />
                </p>
                {item.href ? (
                  <div className="frontier-entry__foot">
                    <a
                      className="text-link"
                      href={item.href}
                      target={item.href.startsWith('#') ? undefined : '_blank'}
                      rel={item.href.startsWith('#') ? undefined : 'noreferrer'}
                    >
                      Foundation →
                    </a>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>

          <p className="frontier-sheet__ceiling">
            <span>Scope ceiling — </span>
            <InlineCode text={pillar.ceiling} />
          </p>
        </div>
      </div>
    </article>
  )
}

export function FrontiersSection({
  onOpenEssay,
}: {
  onOpenEssay: (slug: string) => void
}) {
  const defaultDomain = frontierPillars[0]?.id ?? 'all'
  const [selected, setSelected] = useState<'all' | FrontierDomainId>(defaultDomain)
  const visible =
    selected === 'all'
      ? frontierPillars
      : frontierPillars.filter((p) => p.id === selected)

  return (
    <section className="ed-section frontiers-section" id="frontiers">
      <div className="ed-section__head ed-section__head--split">
        <div>
          <p className="ed-eyebrow">03 — Research Programme</p>
          <h2>What held, what broke, and what remains open.</h2>
        </div>

        <div className="ed-lead">
          <p>
            Across twelve repositories, architecture papers, and field studies,
            the work asks one question in six places: how do we make claims
            about intelligence, authority, markets, and shared culture inspectable
            without asking strangers to take an operator&apos;s word?
          </p>
          <p className="ed-lead__links">
            <button
              type="button"
              className="text-link"
              onClick={() => onOpenEssay('approaching-breakthroughs-across-systems')}
            >
              Read synthesis essay →
            </button>
            <a className="text-link" href="#/research">
              Full research monograph →
            </a>
            <a className="text-link" href="#/playbook">
              Post-Ergodic RMF Playbook →
            </a>
          </p>
        </div>
      </div>

      <nav className="frontier-index" role="tablist" aria-label="Research domains">
        {frontierPillars.map((pillar) => (
          <button
            key={pillar.id}
            type="button"
            role="tab"
            aria-selected={selected === pillar.id}
            className={`frontier-index__tab${selected === pillar.id ? ' is-active' : ''}`}
            onClick={() => setSelected(pillar.id)}
          >
            <span>{pillar.index}</span>
            {pillar.shortLabel}
          </button>
        ))}
        <button
          type="button"
          role="tab"
          aria-selected={selected === 'all'}
          className={`frontier-index__tab${selected === 'all' ? ' is-active' : ''}`}
          onClick={() => setSelected('all')}
        >
          All six
        </button>
      </nav>

      <div className="frontier-sheets">
        {visible.map((pillar) => (
          <PillarSheet
            key={pillar.id}
            pillar={pillar}
            onOpenEssay={onOpenEssay}
          />
        ))}
      </div>
    </section>
  )
}
