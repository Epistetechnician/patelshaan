import { useEffect, useState } from 'react'
import { EcdsaLivePareto } from './EcdsaLivePareto'
import { ManimFilm, type ManimFilmSpec } from './ManimFilm'

interface ProofEntry {
  id: string
  tab: string
  domain: string
  title: string
  metric: string
  metricLabel: string
  film: ManimFilmSpec
  prose: string
  ceiling: string
  monographHref: string
  monographLabel: string
  secondaryHref?: string
  secondaryLabel?: string
  wikiId: string
  wikiLabel: string
  dispatchAliases: string[]
  includeEcdsaGraph?: boolean
  verifyTarget?: string
}

function launchPi5Verify(target: string) {
  const cmd = `verify ${target}`
  try {
    sessionStorage.setItem('spatel_pending_cmd', cmd)
  } catch {
    /* ignore storage errors */
  }
  window.dispatchEvent(new CustomEvent('spatel:run-cmd', { detail: cmd }))
  window.location.hash = '#install'
  window.setTimeout(() => {
    document.getElementById('install')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, 60)
}

const PROOFS: ProofEntry[] = [
  {
    id: 'arc-membrane',
    tab: 'ARC Membrane (Track 5 + 5B)',
    domain: 'Two-Domain Orthogonal Null-Space Projection · Qwen3-30B-A3B',
    title: 'Exact QR null-space weight rewrites across sealed Math & Coding with 212×–534× lower replay drift',
    metric: '+36.5 / +38.3 pp · 534×',
    metricLabel: 'Sealed MATH-500 & Coding · max replay KL drop · 0/200 MMLU flips',
    film: {
      title: 'Two-Domain Orthogonal Subspace Projection ΔW⊥ = ΔW(I − QQᵀ)',
      src: '/viz-media/subspace-null-projection.mp4',
      caption:
        'ManimGX 3D render from `arc-membrane-2domain.json`: QR null-space projection on Qwen3-30B-A3B layers 40–47 (router frozen) across sealed MATH-500 (N=400, +36.5 pp, 212× replay KL) and sealed Coding (HumanEval-164 + MBPP-test-100, N=264, +38.3 pp, +48.8 pp zero-shot HumanEval, 534× replay KL, 117× unseen-text KL, 0/200 MMLU flips, orthogonality error ≤ 1.26×10⁻⁸).',
      scriptPath: 'viz/manimgx/subspace_null_projection.py',
    },
    prose:
      'Projecting MoE LoRA updates into the exact orthogonal complement ΔW⊥ = ΔW(I − QQᵀ) of a frozen-router QR replay basis holds on Qwen3-30B-A3B across two independent sealed domains: +36.5 pp on MATH-500 (N=400, 152 fail-to-pass vs 6 regressions) and +38.3 pp on Coding (N=264, including +48.8 pp zero-shot HumanEval from MBPP-dev alone). Replay KL drops 212×–534×, unseen-text KL drops 52.5×–117.3×, and general MMLU shows 0/200 answer flips — reproduced offline on a clean Linux x86_64 VM.',
    ceiling:
      'Single 30B MoE base family (Qwen3-30B-A3B, layers 40–47) with frozen router; highest verification tier is CrossAgentReproduction via the SHA-256 offline kit, not yet IndependentHumanReplication.',
    monographHref: '#/research/arc-membrane',
    monographLabel: 'Read ARC Membrane →',
    secondaryHref: '/publications/arc-membrane-paper.pdf',
    secondaryLabel: 'Paper PDF ↗',
    wikiId: 'arc-membrane',
    wikiLabel: 'ARC Membrane',
    dispatchAliases: ['subspace-null-projection', 'subspace-null-projection-3d'],
    verifyTarget: 'arc-membrane',
  },
  {
    id: 'track-b-superinfo',
    tab: 'Track B & Lean 4 Gate',
    domain: 'Prospective SWE-bench Verified (N=150) · 26 Lean 4 Theorems · FormaSec',
    title: 'Anytime-valid Empirical-Bernstein + MDL promotion gate blocking 2/2 tamper controls and 0/2 null spikes',
    metric: '2/2 · 0/2 · 26 Lean',
    metricLabel: 'Red-team tamper blocked · null false promotions · proved Lean 4 theorems',
    film: {
      title: 'Track B Prospective SWE-bench Gate & Lean 4 Superinformation Core',
      src: '/viz-media/track-b-superinfo-gate.mp4',
      caption:
        'ManimGX render from `track-b-superinfo.json`: 1,800 live H100 episodes across N=150 frozen SWE-bench Verified tasks ($29.27 metered). Neutralizes a raw +5.3 pp null_01 spike to 0.0 pp admitted, blocks 2/2 red-team tamper controls, achieves 55.9% semantic dedup savings, and anchors to 26 Lean 4 Core.lean theorems + 600/600 Python/Rust/Lean FormaSec parity.',
      scriptPath: 'viz/manimgx/track_b_superinfo_gate.py',
    },
    prose:
      'In a prospective N=150 frozen SWE-bench Verified run (1,800 live H100 episodes, Qwen3-Coder-30B-A3B-FP8), the Empirical-Bernstein + MDL sequential membrane neutralized a raw +5.3 pp null-control spike (54/150 vs 46/150 baseline) to 0.0 pp admitted, blocked 2/2 red-team harness tamper injections, and cut evaluation spend 55.9% via semantic deduplication with 49–52% narrower confidence intervals than Hoeffding — backed by 26 Lean 4 theorems and 600/600 exact FormaSec kernel parity.',
    ceiling:
      'Validates the fail-closed anti-tamper and sequential statistical gate, not a coding-agent performance lift: 0/8 tested coding prompt scaffolds passed promotion. Offline replay is CrossAgentReproduction.',
    monographHref: '#/research/holdout-supermartingale',
    monographLabel: 'Read Track B & Holdout →',
    secondaryHref: '/publications/holdout-whitepaper.pdf',
    secondaryLabel: 'Whitepaper PDF ↗',
    wikiId: 'holdout',
    wikiLabel: 'Holdout',
    dispatchAliases: ['eprocess-martingale', 'formasec-kernel-gate', 'hsi-receipt-forest', 'holdout-formasec'],
    verifyTarget: 'track-b',
  },
  {
    id: 'pqc-pqai-ecdsa',
    tab: 'PQC, PQAI & ECDSA.fail',
    domain: 'Post-Quantum Cryptography · Intel TDX Attestation · Shor Circuit Optimization',
    title: '−86.1% secp256k1 quantum circuit cost paired with Lean-proved TDX + FIPS 204/205 PQAI custody',
    metric: '−86.1% · 28/28 · 5/5',
    metricLabel: 'ECDSA.fail Q×T drop · PQAI adversarial catches · live TDX gates',
    film: {
      title: 'PQC & PQAI: ECDSA.fail Quantum Compression Meets Playbox T3 Intel TDX',
      src: '/viz-media/pqai-tdx-ecdsa.mp4',
      caption:
        'ManimGX render from `pqai-tdx-ecdsa.json`: Connects offensive quantum resource estimation on secp256k1 (−86.1% reversible point-addition cost to 1.82B Q×T, BLS12-381 6.64B analytical) with defensive Post-Quantum AI custody — GCP Intel TDX Confidential Space (5/5 gates, secboot=true, dbgstat=disabled), FIPS 204/205 tri-signed roots proved in Lean 4 (0 sorry), 28/28 adversarial EIP-8288/8479 mutations caught (vs 2/28 unsound baseline), and Maverick WAN 60/60 honest + 1-LSB cheat detection.',
      scriptPath: 'viz/manimgx/pqai_tdx_ecdsa.py',
    },
    prose:
      'My cryptography and AI-security work sits at the PQC / PQAI boundary: measuring how fast quantum attack costs on classical curves compress (ECDSA.fail: −86.1% reversible secp256k1 point-addition cost, 1.82B Q×T evaluator-verified) while building hardware-attested post-quantum defenses in Playbox T3 — live GCP Intel TDX Confidential Space 5-gate attestation, hybrid Ed25519 + ML-DSA-65 (FIPS 204) + SLH-DSA (FIPS 205) roots with 0-sorry Lean 4 proofs, 28/28 adversarial mutation catches, and 100% Python/Rust differential parity.',
    ceiling:
      'ECDSA.fail is classical-curve quantum resource estimation (not a PQC algorithm); Playbox PQAI covers local formal verification, Apple Silicon measurements, and GCP TDX attestation — not an external audit or mainnet deployment.',
    monographHref: '#/research/zk-maverick-stack',
    monographLabel: 'Read PQC / PQAI & Maverick →',
    secondaryHref: 'https://ecdsa.fail/',
    secondaryLabel: 'ecdsa.fail benchmark ↗',
    wikiId: 'maverick',
    wikiLabel: 'Playbox & PQAI',
    dispatchAliases: ['ecdsa-fail', 'maverick-lpn-delegation', 'zk-mutation-lattice', 'pqai'],
    includeEcdsaGraph: true,
  },
  {
    id: 'psychohistory-nulls',
    tab: 'Psychohistory & Nulls',
    domain: 'Multi-Venue Prediction Markets (1,673 Events) · Mechanistic Interpretability Null',
    title: 'Certified real-market obstruction on 669 chronological holdouts alongside the J-space = PCA falsification',
    metric: '1,673 · 4/12 · r = 0.855',
    metricLabel: 'Real market events · certified E_t≥20 cells · PCA vs. J-space null',
    film: {
      title: 'Psychohistory v2 Certified Obstruction & Norm-Matched PCA Null',
      src: '/viz-media/psychohistory-jspace.mp4',
      caption:
        'ManimGX render from `psychohistory-v2.json` and `jspace-equivalence.json`: 1,673 real Polymarket (1,023) + Kalshi (650) events with 669 strict chronological holdouts (zero synthetic rows, 1,673/1,673 Lean 4 invariants, 4/12 cells certified up to AUROC 0.981, E_t = 10¹² and 8/12 nulls reported verbatim), paired with the H100 OLMo-2-7B norm-matched PCA vs. J-space falsification (r = 0.855 DPO, 0.854 Instruct).',
      scriptPath: 'viz/manimgx/psychohistory_jspace.py',
    },
    prose:
      'Across 1,673 real Polymarket and Kalshi events split strictly chronologically (669 pure real holdouts, zero synthetic leakage, 1,673/1,673 Lean 4 invariants), Psychohistory v2 certifies E_t ≥ 20 on 4/12 hypothesis cells — reaching AUROC 0.981 (E_t = 10¹²) on extreme mispricing corrections — while reporting all 8/12 honest nulls verbatim. The same falsification standard governs our H100 interpretability audit, where norm-matched PCA tracks Jacobian-space drift almost identically (r = 0.855 DPO, 0.854 Instruct).',
    ceiling:
      'Psychohistory v2 is an offline chronological evaluation (not live trading) with 8/12 negative/null cells kept intact; J-space equivalence covers checkpoints ≤ 8B across eight planted flaw families.',
    monographHref: '#/research/mech-interp-unified',
    monographLabel: 'Read Epistemic & Interp Audits →',
    secondaryHref: '/publications/statebook-whitepaper.pdf',
    secondaryLabel: 'Statebook whitepaper PDF ↗',
    wikiId: 'statebook',
    wikiLabel: 'Psychohistory & Statebook',
    dispatchAliases: ['mech-interp-audit', 'statebook-coherence', 'honest-nulls', 'kailas-corpus', 'kailas-mandala-3d'],
    verifyTarget: 'psychohistory',
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
    claim: 'Zero prompt scaffolds promoted on SWE-bench',
    figure: '0 / 8',
    detail: 'Track B gate neutralized a raw +5.3 pp null spike; no prompt scaffold beat baseline.',
    href: '#/research/holdout-supermartingale',
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
          <p className="ed-eyebrow">03 · Research · PQC &amp; PQAI</p>
          <h2>Strongest verified proofs.</h2>
        </div>

        <div className="ed-lead">
          <p>
            Four highest-evidence strands rendered directly in ManimGX from SHA-256-indexed
            GPU, Lean 4, Intel TDX, and real-market runs — spanning neural weight rewriting,
            formal gates, post-quantum cryptography (PQC/PQAI &amp; ECDSA.fail), and honest nulls.
          </p>
        </div>
      </div>

      <div className="proof-tabs" role="tablist" aria-label="Featured research strands">
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

        <div className="proof-stage__film">
          <ManimFilm key={active.film.src} film={active.film} />
        </div>

        {active.includeEcdsaGraph ? <EcdsaLivePareto /> : null}

        <div className="proof-stage__details">
          <p className="proof-stage__prose">{active.prose}</p>

          <p className="proof-stage__ceiling">
            <span>Scope ceiling</span>
            {active.ceiling}
          </p>

          <div className="proof-stage__links">
            <a href={active.monographHref} className="text-link">
              {active.monographLabel}
            </a>
            {active.secondaryHref && active.secondaryLabel ? (
              <a
                href={active.secondaryHref}
                target="_blank"
                rel="noreferrer"
                className="text-link text-link--muted"
              >
                {active.secondaryLabel}
              </a>
            ) : null}
            {active.verifyTarget ? (
              <a
                href="#install"
                className="text-link"
                onClick={(e) => {
                  e.preventDefault()
                  launchPi5Verify(active.verifyTarget!)
                }}
              >
                Verify live on VM ↗
              </a>
            ) : null}
            <button
              type="button"
              className="wiki-chip"
              onClick={() => onOpenWiki(active.wikiId)}
            >
              Wiki: {active.wikiLabel}
            </button>
          </div>
        </div>
      </article>

      <div className="null-ledger" aria-label="Negative and null findings">
        <div className="null-ledger__head">
          <span className="ed-eyebrow">Honest Nulls &amp; Negative Results</span>
          <span className="null-ledger__sub">
            Kept on the front page beside every positive claim
          </span>
        </div>
        <ul className="null-ledger__list">
          {HONEST_NULLS.map((n) => (
            <li key={n.claim} className="null-ledger__item">
              <a href={n.href} className="null-ledger__link">
                <strong className="null-ledger__fig">{n.figure}</strong>
                <span className="null-ledger__claim">{n.claim}</span>
                <span className="null-ledger__detail">{n.detail}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
