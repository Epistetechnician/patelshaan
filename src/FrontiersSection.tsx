import { useState } from 'react'
import {
  frontierPillars,
  portfolioVitalSigns,
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

function PillarCard({
  pillar,
  onOpenEssay,
}: {
  pillar: FrontierPillar
  onOpenEssay: (slug: string) => void
}) {
  return (
    <article className="frontier-pillar" aria-labelledby={`pillar-${pillar.id}`}>
      <header className="frontier-pillar__header">
        <div>
          <p className="frontier-pillar__eyebrow">
            <span>{pillar.index}</span> · {pillar.subtitle}
          </p>
          <h3 id={`pillar-${pillar.id}`}>{pillar.title}</h3>
        </div>
        <p className="frontier-pillar__question">{pillar.question}</p>
      </header>

      <div className="frontier-pillar__columns">
        <div className="frontier-col frontier-col--established">
          <h4 className="frontier-col__heading">
            <span className="frontier-dot frontier-dot--established" aria-hidden="true" />
            Breakthroughs established (verified in repo artifacts)
          </h4>
          <ul className="frontier-items">
            {pillar.established.map((item) => (
              <li key={item.title} className="frontier-item">
                <div className="frontier-item__top">
                  <span
                    className={`frontier-badge frontier-badge--${item.kind}`}
                  >
                    {item.kind === 'established' ? 'verified positive / kernel' : 'falsification / control'}
                  </span>
                  <span className="frontier-item__metric">{item.metric}</span>
                </div>
                <h5>{item.title}</h5>
                <p>
                  <InlineCode text={item.detail} />
                </p>
                <div className="frontier-item__foot">
                  <span className="frontier-item__artifact">{item.artifact}</span>
                  {item.essaySlug ? (
                    <button
                      type="button"
                      className="frontier-item__link"
                      onClick={() => onOpenEssay(item.essaySlug!)}
                    >
                      Read essay →
                    </button>
                  ) : item.href ? (
                    <a
                      className="frontier-item__link"
                      href={item.href}
                      target={item.href.startsWith('#') ? undefined : '_blank'}
                      rel={item.href.startsWith('#') ? undefined : 'noreferrer'}
                    >
                      Inspect artifact →
                    </a>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="frontier-col frontier-col--approaching">
          <h4 className="frontier-col__heading">
            <span className="frontier-dot frontier-dot--approaching" aria-hidden="true" />
            Breakthroughs approaching (next gates &amp; horizons)
          </h4>
          <ul className="frontier-items">
            {pillar.approaching.map((item) => (
              <li key={item.title} className="frontier-item frontier-item--next">
                <div className="frontier-item__top">
                  <span className="frontier-badge frontier-badge--next">{item.horizon}</span>
                </div>
                <h5>{item.title}</h5>
                <p className="frontier-item__pair">
                  <strong>Bottleneck isolated:</strong> <InlineCode text={item.bottleneck} />
                </p>
                <p className="frontier-item__pair">
                  <strong>What crossing it unlocks:</strong> <InlineCode text={item.unlock} />
                </p>
                {item.href ? (
                  <div className="frontier-item__foot">
                    <a
                      className="frontier-item__link"
                      href={item.href}
                      target={item.href.startsWith('#') ? undefined : '_blank'}
                      rel={item.href.startsWith('#') ? undefined : 'noreferrer'}
                    >
                      Open foundation →
                    </a>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>

          <p className="frontier-ceiling">
            <span>Evidence ceiling</span>
            {pillar.ceiling}
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
  const [selected, setSelected] = useState<'all' | FrontierDomainId>('all')
  const visible =
    selected === 'all'
      ? frontierPillars
      : frontierPillars.filter((p) => p.id === selected)

  return (
    <section className="frontiers-section" id="frontiers">
      <div className="systems-intro">
        <div className="section-heading systems-intro__heading">
          <p className="eyebrow">02 / breakthroughs &amp; approaching frontiers</p>
          <h2>What held, what broke, and what is within reach.</h2>
        </div>

        <div className="systems-intro__copy">
          <p>
            Across twelve research repositories, architecture papers, and field
            studies, my work asks one question in six places: how do we make
            claims about intelligence, authority, markets, and shared culture
            verifiable without asking strangers to take an operator&apos;s word?
          </p>
          <p className="systems-intro__note">
            Positive mechanisms and falsifications sit side by side below. Killing
            a plausible illusion with a norm-matched control or a planted-flaw
            audit is treated as a breakthrough of the same rank as passing a
            gate—because it isolates the exact threshold left to cross.
          </p>
        </div>
      </div>

      <div className="vital-strip" aria-label="Selected verified results across repositories">
        {portfolioVitalSigns.map((item) => (
          <a
            key={item.label}
            className="vital-card"
            href={item.href}
            target={item.href.startsWith('#') ? undefined : '_blank'}
            rel={item.href.startsWith('#') ? undefined : 'noreferrer'}
          >
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </a>
        ))}
      </div>

      <div className="frontier-toolbar">
        <div className="frontier-tabs" role="tablist" aria-label="Filter research and systems pillars">
          <button
            type="button"
            role="tab"
            aria-selected={selected === 'all'}
            className={`frontier-tab${selected === 'all' ? ' is-active' : ''}`}
            onClick={() => setSelected('all')}
          >
            All 6 fronts
          </button>
          {frontierPillars.map((pillar) => (
            <button
              key={pillar.id}
              type="button"
              role="tab"
              aria-selected={selected === pillar.id}
              className={`frontier-tab${selected === pillar.id ? ' is-active' : ''}`}
              onClick={() => setSelected(pillar.id)}
            >
              <span>{pillar.index}</span> {pillar.shortLabel}
            </button>
          ))}
        </div>

        <div className="frontier-toolbar__actions">
          <button
            type="button"
            className="frontier-SynthesisBtn"
            onClick={() => onOpenEssay('approaching-breakthroughs-across-systems')}
          >
            Read 2026 synthesis essay
          </button>
          <a className="frontier-SynthesisLink" href="#/research">
            Open all 13 research pages →
          </a>
        </div>
      </div>

      <div className="frontier-stack">
        {visible.map((pillar) => (
          <PillarCard
            key={pillar.id}
            pillar={pillar}
            onOpenEssay={onOpenEssay}
          />
        ))}
      </div>
    </section>
  )
}
