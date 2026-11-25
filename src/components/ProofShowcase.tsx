import { lazy, Suspense, useEffect, useState } from 'react'
import { WikiChip } from '../WikiDrawer'

const LazyPostAnimCanvas = lazy(() =>
  import('../viz/ResearchAnims').then((mod) => ({ default: mod.PostAnimCanvas })),
)

type ProofEntry = {
  id: string
  tab: string
  domain: string
  title: string
  metric: string
  metricLabel: string
  animId: string
  prose: string
  ceiling: string
  bundleFile: string
  monographHref: string
  monographLabel: string
  secondaryHref?: string
  secondaryLabel?: string
  wikiId: string
  wikiLabel: string
  dispatchAliases: string[]
}

const PROOFS: ProofEntry[] = [
  {
    id: 'arc-membrane',
    tab: 'ARC Membrane',
    domain: 'Orthogonal Subspace Projection · A100 MATH-500',
    title: 'Updating reasoning weights without eroding what the model already knows.',
    metric: '+36.5 pp · 180×',
    metricLabel: '400 sealed MATH-500 problems · replay KL reduction',
    animId: 'arc-membrane',
    prose:
      'Naive weight updates buy accuracy at the price of silent drift (replay KL 0.1088). Projecting candidate updates onto the orthogonal complement ΔW(I − QQᵀ) of a QR-factored replay basis cuts drift 180× to 0.000605 while flipping 152 problems from fail to pass against only 6 regressions across all 400 sealed A100 problems.',
    ceiling:
      'Verified on Qwen2.5-7B-Instruct MATH-500 (400 sealed problems) and H100/A100 single-host loops; open-ended continual agents across drifting domains remain ahead.',
    bundleFile: 'arc-membrane.json',
    monographHref: '#/research/arc-membrane',
    monographLabel: 'Read ARC Membrane monograph →',
    secondaryHref: 'https://github.com/Epistetechnician/patelshaan-lab',
    secondaryLabel: 'Source & receipts ↗',
    wikiId: 'evidence-bounded',
    wikiLabel: 'Evidence-Bounded AI',
    dispatchAliases: ['arc-membrane'],
  },
  {
    id: 'holdout-formasec',
    tab: 'Holdout & Kernels',
    domain: 'Anytime e-Processes · Lean 4 / Rust / TDX',
    title: 'Separating untrusted proposers from byte-exact admission kernels and priced holdouts.',
    metric: '0 / 59,200 · 600 / 600',
    metricLabel: 'false holdout certificates · Python / Rust / Lean parity',
    animId: 'holdout-broker-waterfall',
    prose:
      'When an autonomous loop grades itself against a static benchmark, standard confidence bounds break silently. Bit-priced holdout ledgers held zero false certificates across 59,200 confirmatory runs, while our FormaSec admission kernel matched 600/600 across Python, Kani-checked Rust, and Lean 4, paired with a trajectory gate that separates 33.7% admitted from 7.1% rejected Gemma-4 SWE runs and blocks 83/83 injected test-tamper mutations.',
    ceiling:
      'Empirical-Bernstein width gain narrows toward Hoeffding on high-variance binary SWE tasks, and the 238-trace trajectory lift is retrospective across 34 tasks pending prospective out-of-sample Track A.',
    bundleFile: 'holdout-eprocess.json',
    monographHref: '#/research/holdout-ledger',
    monographLabel: 'Read Holdout Ledger monograph →',
    secondaryHref: '#/research/formasec',
    secondaryLabel: 'FormaSec kernel →',
    wikiId: 'holdout-ledger',
    wikiLabel: 'Holdout Ledger',
    dispatchAliases: ['holdout-ledger', 'formasec-saos', 'playbox-caduceus', 'composed-zk'],
  },
  {
    id: 'kailas-corpus',
    tab: 'Mount Kailash',
    domain: 'Computational Humanities · 2,626 Passages',
    title: 'Unbundling spatial mandala and liturgical time across fifteen languages.',
    metric: '+44.1 · p = 0.0022',
    metricLabel: 'Bon spatial lift · Hajj vs. Kailash liturgical clock',
    animId: 'sacred-geography-kailas',
    prose:
      'A broad conjecture about sacred pilgrimage looked like a clean null until space and liturgy were tested separately. Across 2,626 blind-coded passages and 126 coded kora episodes, Mount Kailash binds cosmological register directly to physical trail position φ = f(r), while calendar-decoupled two-clock liturgy belongs decisively to Hajj and Holy Land traditions (16.7% vs. 3.0%).',
    ceiling:
      'Passage coders to date are blind LLM raters (κ = 0.90 Tibetan overlaps, α = 0.86 episodes); blinded Sanskrit (233), Tibetan/Bon (243), and 40-episode review sheets await human philologist scoring.',
    bundleFile: 'kailas-two-clock.json',
    monographHref: '#/research/sacred-geography-kailas',
    monographLabel: 'Read Mount Kailash monograph →',
    secondaryHref: 'https://github.com/Epistetechnician/kailas-corpus',
    secondaryLabel: 'kailas-corpus ↗',
    wikiId: 'sacred-geography-kailas',
    wikiLabel: 'Mount Kailash Study',
    dispatchAliases: ['kailas-corpus'],
  },
  {
    id: 'honest-nulls',
    tab: 'Nulls & Coherence',
    domain: 'Mechanistic Interpretability · Market Coherence',
    title: 'Keeping disproved geometry and live market residuals in the same ledger.',
    metric: 'r = 0.855 · 6.30%',
    metricLabel: 'norm-matched PCA vs. J-space · Polymarket partition gap',
    animId: 'jspace-pca-equiv',
    prose:
      'On 2,000 H100 prompts across OLMo-2-7B and Llama-3.1-8B, once perturbation norms are matched, plain PCA tracks Jacobian-space drift almost identically (r = 0.855 on DPO, 0.854 on Instruct), a clean geometric null we refused to bury. The same accounting discipline runs in Statebook, where a signed read-only audit of 188 active Polymarket contracts surfaces a 6.30% cross-outcome partition residual.',
    ceiling:
      'Interpretability equivalence covers checkpoints ≤8B and eight planted flaw families; Statebook is a read-only coherence specification and does not execute trades or hold collateral.',
    bundleFile: 'jspace-equivalence.json',
    monographHref: '#/research/mech-interp-unified',
    monographLabel: 'Read Mech-Interp Audit →',
    secondaryHref: '/publications/statebook-whitepaper.pdf',
    secondaryLabel: 'Statebook whitepaper PDF ↗',
    wikiId: 'statebook',
    wikiLabel: 'Statebook',
    dispatchAliases: ['mech-interp-audit', 'statebook-coherence', 'temporal-grid', 'hyperintel-provenance', 'ecdsa-fail'],
  },
]

const HONEST_NULLS = [
  {
    claim: 'Norm-matched PCA ties J-space geometry',
    figure: 'r = 0.855',
    detail: 'Matched-dose PCA matches Jacobian drift on H100 OLMo-2-7B & Llama-3.1-8B.',
    href: '#/research/mech-interp-unified',
  },
  {
    claim: 'Naive weight sums erode replay fidelity',
    figure: '0.1088 KL',
    detail: 'Unprojected ΔW degrades retention 180× worse than ΔW(I − QQᵀ).',
    href: '#/research/arc-membrane',
  },
  {
    claim: 'Single LLM safety graders disagree sharply',
    figure: '15.4% vs 53.6%',
    detail: 'Different judges score identical model outputs nearly 40 points apart.',
    href: '#/research/temporal-grid-safety',
  },
  {
    claim: 'Kailash rejects two-clock liturgical decoupling',
    figure: '3.0% vs 16.7%',
    detail: 'Two-clock calendar separation belongs to Hajj & Holy Land, not Kailash.',
    href: '#/research/sacred-geography-kailas',
  },
]

export function ProofShowcase({
  onOpenWiki,
  focusedDispatchRequest,
}: {
  onOpenWiki: (id: string) => void
  focusedDispatchRequest: { id: string; nonce: number } | null
}) {
  const [activeIdx, setActiveIdx] = useState(0)

  useEffect(() => {
    if (!focusedDispatchRequest) return
    const targetIdx = PROOFS.findIndex(
      (p) =>
        p.id === focusedDispatchRequest.id ||
        p.dispatchAliases.includes(focusedDispatchRequest.id),
    )
    if (targetIdx !== -1) {
      const id = window.requestAnimationFrame(() => {
        setActiveIdx(targetIdx)
        document.getElementById('frontiers')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
      return () => window.cancelAnimationFrame(id)
    }
  }, [focusedDispatchRequest])

  const active = PROOFS[activeIdx] ?? PROOFS[0]

  return (
    <section className="ed-section" id="frontiers">
      <div className="ed-section__head ed-section__head--split">
        <div>
          <p className="ed-eyebrow">03 · Verified Research &amp; Honest Nulls</p>
          <h2>Measured on real runs, verified to the byte.</h2>
        </div>

        <div className="ed-lead">
          <p>
            Four flagship strands rendered straight from SHA-256-indexed GPU, Lean 4,
            and corpus bundles. Hover any figure to inspect individual problems,
            trajectories, or prompts.
          </p>
        </div>
      </div>

      <div className="proof-tabs" role="tablist" aria-label="Featured research proofs">
        {PROOFS.map((item, idx) => {
          const isActive = idx === activeIdx
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`proof-tab${isActive ? ' is-active' : ''}`}
              onClick={() => setActiveIdx(idx)}
            >
              <span className="proof-tab__num">0{idx + 1}</span>
              <span>{item.tab}</span>
            </button>
          )
        })}
      </div>

      <article className="proof-stage" key={active.id}>
        <div className="proof-stage__top">
          <div className="proof-stage__meta">
            <span className="proof-stage__domain">{active.domain}</span>
            <h3>{active.title}</h3>
          </div>
          <div className="proof-stage__stat">
            <strong>{active.metric}</strong>
            <span>{active.metricLabel}</span>
          </div>
        </div>

        <div className="proof-stage__canvas">
          <Suspense fallback={<div className="proof-stage__loading">Loading verified run data…</div>}>
            <LazyPostAnimCanvas key={active.animId} id={active.animId} />
          </Suspense>
        </div>

        <div className="proof-stage__details">
          <p className="proof-stage__prose">{active.prose}</p>

          <p className="proof-stage__ceiling">
            <span>Honest ceiling</span>
            {active.ceiling}
          </p>

          <div className="proof-stage__links">
            <a href={active.monographHref} className="text-link">
              {active.monographLabel}
            </a>
            {active.secondaryHref && active.secondaryLabel ? (
              <a
                href={active.secondaryHref}
                target={active.secondaryHref.startsWith('#') ? undefined : '_blank'}
                rel={active.secondaryHref.startsWith('#') ? undefined : 'noreferrer'}
                className="text-link text-link--muted"
              >
                {active.secondaryLabel}
              </a>
            ) : null}
            <WikiChip id={active.wikiId} label={active.wikiLabel} onOpen={onOpenWiki} />
            <span className="proof-stage__bundle" title="Verified JSON bundle under /viz-data/">
              /viz-data/{active.bundleFile}
            </span>
          </div>
        </div>
      </article>

      <div className="null-ledger" aria-label="Selected negative results">
        <div className="null-ledger__head">
          <span className="null-ledger__eyebrow">Negative results kept in the permanent ledger</span>
          <a href="#/research" className="text-link">
            All 14 monographs &amp; SHA-256 receipts →
          </a>
        </div>

        <ul className="null-ledger__list">
          {HONEST_NULLS.map((item) => (
            <li key={item.claim}>
              <a href={item.href} className="null-ledger__row">
                <span className="null-ledger__figure">{item.figure}</span>
                <span className="null-ledger__claim">{item.claim}</span>
                <span className="null-ledger__detail">{item.detail}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
