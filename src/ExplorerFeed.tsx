import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import ParetoChart from './ParetoChart'
import { WikiChip } from './WikiDrawer'
import { RichText } from './components/RichText'
import { frontierPillars } from './frontiers'

const LazyDemo = lazy(() =>
  import('./Demos').then((mod) => ({ default: mod.Demo })),
)

export type ChannelId =
  | 'featured'
  | 'all'
  | 'security'
  | 'scalability'
  | 'cs-ml'
  | 'decentralization'
  | 'socio-economic'
  | 'socio-cultural'
  | 'nulls'
  | 'horizons'

type DispatchStatus = 'verified' | 'null' | 'paper' | 'field'

export type DispatchItem = {
  id: string
  featured?: boolean
  status: DispatchStatus
  statusLabel: string
  domainLabel: string
  channels: Exclude<ChannelId, 'featured' | 'all' | 'horizons'>[]
  title: string
  summary: string
  metric: string
  metricSub: string
  whatHeld: string
  ceiling: string
  nextStep: string
  reproduceCmd?: string
  demoId?:
    | 'holdout'
    | 'formasec'
    | 'flawaudit'
    | 'matched'
    | 'permutation'
    | 'netswap'
    | 'gate'
    | 'mutation'
    | 'tamper'
    | 'kora'
    | 'pareto'
  embedLabel?: string
  wikiIds: string[]
  monographHref?: string
  essaySlug?: string
  repoHref?: string
  repoLabel?: string
}

const DISPATCHES: DispatchItem[] = [
  {
    id: 'holdout-ledger',
    featured: true,
    status: 'verified',
    statusLabel: 'Verified Sim · Lean 4 + 59.2k runs',
    domainLabel: 'Adaptive Evaluation',
    channels: ['scalability', 'cs-ml', 'security'],
    title: 'Holdout Ledger & Anytime e-Process Certificates',
    summary:
      'Hash-chained bit-pricing and anytime-valid empirical-Bernstein e-processes stop self-improving loops from silently overfitting their judge.',
    metric: '0 / 59,200',
    metricSub: 'simulated violations (prospective SWE run next)',
    whatHeld:
      'All 9 pre-registered hypotheses pass with 0 false certificates across 59,200 confirmatory simulated runs (where zero-bit Wald bounds fail 100% under attack), while anytime e-process simulation (sd = 0.09) preserves 0/1,000 sequential violations.',
    ceiling:
      'Simulation-only so far (EB width gain narrows toward Hoeffding on real binary sd ≈ 0.4–0.5 SWE outcomes; late ~0.001 regime exceeds n = 100,000).',
    nextStep:
      'Execute locked Track A prospective validation across 150–200 unseen SWE-bench Verified tasks + external signed replay.',
    reproduceCmd:
      'git clone https://github.com/Epistetechnician/holdout-ledger.git && cd holdout-ledger && lean formal/HoldoutLedger.lean',
    demoId: 'holdout',
    embedLabel: 'Interactive holdout simulator',
    wikiIds: ['holdout-ledger', 'measure', 'dwork', 'rissanen'],
    monographHref: '#/research/holdout-ledger',
    essaySlug: 'evidence-bounded-intelligence',
    repoHref: 'https://github.com/Epistetechnician/holdout-ledger',
    repoLabel: 'holdout-ledger ↗',
  },
  {
    id: 'formasec-saos',
    featured: true,
    status: 'verified',
    statusLabel: 'Verified · Rust / Lean / TDX',
    domainLabel: 'Certified Kernels',
    channels: ['security', 'scalability'],
    title: 'FormaSec Kernels & Sanitizing Trajectory Gates',
    summary:
      'Separating untrusted model proposers from byte-exact Python/Rust/Lean admission kernels, hardware-attested brokers, and sanitizing SWE trajectory gates.',
    metric: '0 / 552 · 33.7%',
    metricSub: 'hostile admissions · admitted SWE rate (retrospective)',
    whatHeld:
      '600/600 cross-implementation parity across Python, Kani-checked Rust, and Lean 4 (0 unsafe admissions across 552 hostile proposals), paired with a 279-test Intel TDX broker and retrospective 238-trace Gemma-4 trajectory gating (33.7% admitted vs 7.1% rejected, catching 83/83 injected test-tamper mutations).',
    ceiling:
      'External SMT proof certificates stay outside the Lean TCB; TDX attestation is single-operator; SWE trajectory gate lift is retrospective across 34 tasks (9 ever solved).',
    nextStep:
      'Prospective out-of-sample SWE-bench Verified gate evaluation + independent second-party replay.',
    reproduceCmd:
      'git clone https://github.com/Epistetechnician/formasec.git && cd formasec && cargo test',
    demoId: 'formasec',
    embedLabel: 'Interactive 6-gate admission kernel',
    wikiIds: ['formasec', 'security-alignment-os', 'power', 'saltzer'],
    monographHref: '#/research/formasec',
    essaySlug: 'verifiable-ai-agents',
    repoHref: 'https://github.com/Epistetechnician/formasec',
    repoLabel: 'formasec ↗',
  },
  {
    id: 'statebook-coherence',
    featured: true,
    status: 'paper',
    statusLabel: '72-pp Spec + Live Receipt',
    domainLabel: 'Market Coherence',
    channels: ['socio-economic', 'decentralization'],
    title: 'Statebook: Cross-Venue Coherence & Separated Finality Clocks',
    summary:
      'Normalizing federated contract terms into StateKeys, seven non-compensating completeness checks, and separated execution/oracle/chain finality clocks.',
    metric: '6.30% · 188',
    metricSub: 'Polymarket partition gap · active contracts',
    whatHeld:
      'Live read-only audit across 13 Polymarket negRisk/cumulative events and 188 contracts surfaces a 6.30% max partition residual (3.90% gross Dutch-book gap prior to fees, 0.00% cumulative calendar inversion, 5.04 bps weighted half-spread) signed under SHA-256 + HMAC.',
    ceiling:
      'Read-only coherence and accounting specification; does not execute trades, hold collateral, or settle funds (finality windows reflect protocol-nominal UMA defaults pending historical dispute ingestion).',
    nextStep:
      'Ingest historical resolved Polymarket, Kalshi, and UMA oracle timestamps across 1,000+ resolved markets.',
    wikiIds: ['statebook', 'commons', 'poovey', 'ostrom'],
    essaySlug: 'statebooks-convergence-with-coherence',
    repoHref: '/publications/statebook-whitepaper.pdf',
    repoLabel: 'Whitepaper PDF ↗',
  },
  {
    id: 'mech-interp-audit',
    featured: true,
    status: 'null',
    statusLabel: 'Audit + Clean Null',
    domainLabel: 'Mechanistic Interpretability',
    channels: ['cs-ml', 'nulls'],
    title: 'Planted-Flaw Auditor Suite & Norm-Matched PCA Equivalence',
    summary:
      'Planting 8 known flaw classes proves no single interpretability gate suffices, while norm-matched PCA ties J-space geometry on 7B–8B checkpoints.',
    metric: '8 flaws · PCA tie',
    metricSub: 'complementary gates · honest geometric null',
    whatHeld:
      'Out-of-family causal MLP neuron interventions replicate cleanly on Qwen3-1.7B, an 8-flaw benchmark maps exact blind spots of activation/attribution/perturbation auditors, and norm-matched PCA matches J-space drift detection on OLMo-2-7B & Llama-3.1-8B.',
    ceiling:
      'Covers checkpoints at or below 8B parameters and eight enumerated flaw families; not a completeness proof over arbitrary deceptive circuits.',
    nextStep:
      'Causal feature-dictionary interventions that predict out-of-distribution behavioral failure before deployment.',
    reproduceCmd:
      'git clone https://github.com/Epistetechnician/mech-interp-unified.git && cd mech-interp-unified && pytest',
    demoId: 'flawaudit',
    embedLabel: 'Interactive 8-flaw auditor matrix',
    wikiIds: ['mech-interp-unified', 'failure', 'quine', 'lakatos'],
    monographHref: '#/research/mech-interp-unified',
    essaySlug: 'mechanistic-interpretability-negative-results',
    repoHref: 'https://github.com/Epistetechnician/mech-interp-unified',
    repoLabel: 'mech-interp-unified ↗',
  },
  {
    id: 'kailas-corpus',
    featured: true,
    status: 'field',
    statusLabel: '2,626 Passages · Double Dissociation',
    domainLabel: 'Computational Humanities',
    channels: ['socio-cultural', 'nulls'],
    title: 'Mount Kailash: Spatial Mandala vs. Liturgical Ritual Time',
    summary:
      'Unbundling spatial and temporal cosmology across 15+ languages resolves an apparent null into a double dissociation across 2,626 passages and 416+ coded windows.',
    metric: '+44.1 · p = 0.0022',
    metricSub: 'Bon spatial lift · Hajj vs Kailas clock',
    whatHeld:
      'Across 2,626 blind-labeled passages and 416+ coded windows, Kailash locks cosmological registers to physical trail position φ = f(r) (20.0% strict route-aligned in Thubron, p = 0.0017; +44.1 Bon spatial lift), whereas calendar-decoupled two-clock time belongs to Hajj & Holy Land liturgy (16.7% vs 3.0%, p = 0.0022).',
    ceiling:
      'Passage coders to date are blind LLM raters (κ = 0.90 Tibetan overlaps, α = 0.86 episodes); blinded Sanskrit, Tibetan, and Bon sheets await human philologist scoring.',
    nextStep:
      'External specialist double-scoring of the 233 Sanskrit, 243 Tibetan/Bon, and 40-episode blinded review sheets.',
    demoId: 'kora',
    embedLabel: 'Interactive 52-km kora & mandala explorer',
    wikiIds: ['sacred-geography-kailas', 'sacred', 'geertz', 'eliadeSacred'],
    monographHref: '#/research/sacred-geography-kailas',
    essaySlug: 'approaching-breakthroughs-across-systems',
    repoHref: 'https://github.com/Epistetechnician/kailas-corpus',
    repoLabel: 'kailas-corpus ↗',
  },
  {
    id: 'playbox-caduceus',
    featured: true,
    status: 'verified',
    statusLabel: '8-Crate Rust + 13-Lane Gate',
    domainLabel: 'Governed Multi-Agent Rooms',
    channels: ['decentralization', 'scalability', 'nulls'],
    title: 'Playbox Collaboration Rooms & Caduceus Skill Evolution',
    summary:
      'Attenuated Biscuit capability rooms and Merkle-logged skill promotion lift agent resolution (+0.245 / +0.305) while catching memorizers and bad gates.',
    metric: '+0.305 · 43/43',
    metricSub: 'Sonnet skill lift · hostile skills refused',
    whatHeld:
      'Playbox’s H100 evaluation gate caught a planted dev-set memorizer (dev 1.000, holdout −0.250); Caduceus lifted Haiku (+0.245) and Sonnet (+0.305) resolution, refused 43/43 attacks, and kept a failed 41.0% false-hold phrase tripwire disabled.',
    ceiling:
      'Playbox v0 uses a single relay and plain-text summaries still beat cross-family latent bridges; Caduceus evaluations are single-owner contracts.',
    nextStep:
      'Byzantine-resilient multi-relay federation with cross-owner holdout-budget accounting.',
    demoId: 'gate',
    embedLabel: 'Interactive admission gate & memorizer trap',
    wikiIds: ['playbox', 'caduceus', 'trust', 'ostrom'],
    monographHref: '#/research/caduceus',
    essaySlug: 'verifiable-ai-agents',
    repoHref: 'https://github.com/Epistetechnician/caduceus',
    repoLabel: 'caduceus ↗',
  },
  {
    id: 'temporal-grid',
    featured: true,
    status: 'null',
    statusLabel: 'Refusal Adapter + Confound Audit',
    domainLabel: 'Benign-Drift Alignment',
    channels: ['cs-ml', 'security', 'nulls'],
    title: 'Temporal Grid Safety & Self-Caught v16 Attacker Confound',
    summary:
      'Frozen discriminant safety adapters retain 0.95 vs 0.27 refusal under benign OOD fine-tuning, after stripping our own 35-point eval-rate confound.',
    metric: '0.95 vs 0.27',
    metricSub: 'refusal retained · v16 confound corrected',
    whatHeld:
      'Retains 0.95 refusal (vs 0.27 standard LoRA) across 3 OOD benign fine-tuning domains while exposing and fixing a v16 evaluation-rate mismatch that had inflated an apparent 95% gain over real 60% survival.',
    ceiling:
      'Targets benign capability fine-tuning drift rather than adaptive white-box weight-space adversaries; evaluated at n = 6–20 LoRA seeds.',
    nextStep:
      'Scale v32 harness to ≥20 seeds, full-weight fine-tuning, HarmBench/AdvBench, and loss-matched adaptive attackers.',
    demoId: 'matched',
    embedLabel: 'Interactive matched-progress replay test',
    wikiIds: ['temporal-grid-safety', 'failure', 'memory', 'feynman'],
    monographHref: '#/research/temporal-grid-safety',
    essaySlug: 'continual-learning-and-alignment-benchmarks',
    repoHref: 'https://github.com/Epistetechnician/temporal-grid-safety',
    repoLabel: 'temporal-grid-safety ↗',
  },
  {
    id: 'composed-zk',
    status: 'verified',
    statusLabel: '14 Trace Mutations · 9 Families',
    domainLabel: 'Verifiable Compute Oracles',
    channels: ['security', 'decentralization'],
    title: 'Composed ZK Benchmark OS: Soundness-First Trace Mutation',
    summary:
      'Adversarial trace mutations ensure a fast prover backend that accepts a forged witness always ranks below a slower backend that rejects it.',
    metric: '14 classes',
    metricSub: 'semantic trace mutations across 9 workloads',
    whatHeld:
      'Generates 9 control-flow workload families and 14 adversarial witness/trace mutation classes with soundness-first ranking invariants.',
    ceiling:
      'Local semantic mutation harness; not external multi-machine zkVM throughput benchmarks.',
    nextStep:
      'Run identical mutation suites across RISC Zero, SP1, Jolt, and Boojum recursive pipelines.',
    demoId: 'mutation',
    embedLabel: 'Interactive trace-mutation oracle',
    wikiIds: ['composed-zk-benchmark-os', 'measure', 'gmr', 'dijkstra'],
    monographHref: '#/research/composed-zk-benchmark-os',
    essaySlug: 'zero-knowledge-mpc-and-post-quantum-security',
    repoHref: 'https://github.com/Epistetechnician/composed-zk-benchmark-os',
    repoLabel: 'composed-zk-benchmark-os ↗',
  },
  {
    id: 'hyperintel-provenance',
    status: 'verified',
    statusLabel: 'ed25519 + SHA-256 Bundles',
    domainLabel: 'Decentralized Provenance',
    channels: ['decentralization', 'socio-economic'],
    title: 'HyperIntel: Caller-Rooted Offline Provenance Receipts',
    summary:
      'Portable cryptographic inference bundles let any stranger detect tampered outputs or forged worker claims offline without vendor keys.',
    metric: '100% offline',
    metricSub: 'tamper detection without central registry',
    whatHeld:
      'Caller-rooted ed25519 + SHA-256 provenance receipts verify inference inputs, model digests, and execution envelopes completely offline.',
    ceiling:
      'Cryptographic envelope binds provenance to signing keys; economic slashing and TEE hardware binding are external layers.',
    nextStep:
      'Bind caller-rooted bundles to multi-vendor TEE quotes and deterministic GPU replay spot-checks.',
    demoId: 'tamper',
    embedLabel: 'Interactive receipt tamper inspector',
    wikiIds: ['hyperintel', 'trust', 'commons', 'shapinSchaffer'],
    monographHref: '#/research/hyperintel',
    essaySlug: 'decentralized-compute-and-data-provenance',
    repoHref: 'https://github.com/Epistetechnician/hyperintel',
    repoLabel: 'hyperintel ↗',
  },
  {
    id: 'theseus-replacement',
    status: 'null',
    statusLabel: 'Derivative Gap Exposed',
    domainLabel: 'Modular Replacement',
    channels: ['cs-ml', 'nulls'],
    title: 'Theseus Lab: Why Output MSE Misses Jacobian Drift in Live Swaps',
    summary:
      'Swapping learned replacements into a running network reveals a 0.89 Jacobian error hiding behind 0.11 value error until derivatives are matched.',
    metric: '0.89 vs 0.11',
    metricSub: 'Jacobian drift vs output MSE',
    whatHeld:
      'Demonstrates empirically why local value-matching fails under composition and establishes Sobolev/Jacobian matching gates before live module swap.',
    ceiling:
      'Validated on controlled synthetic and small transformer blocks rather than full frontier-scale block swaps.',
    nextStep:
      'Apply Jacobian-matched grafting to 7B+ cross-checkpoint continual upgrades.',
    demoId: 'netswap',
    embedLabel: 'Interactive live module-swap simulator',
    wikiIds: ['theseus-lab', 'memory', 'plutarch', 'parfit'],
    monographHref: '#/research/theseus-lab',
    essaySlug: 'evidence-bounded-intelligence',
    repoHref: 'https://github.com/Epistetechnician/theseus-lab',
    repoLabel: 'theseus-lab ↗',
  },
  {
    id: 'ecdsa-fail',
    status: 'paper',
    statusLabel: 'arXiv:2609.09582 · v2',
    domainLabel: 'Quantum Cryptanalysis',
    channels: ['security'],
    title: 'ECDSA.fail: Evaluator-Verified Quantum Point-Addition Frontier',
    summary:
      'Open autoresearch under exactness, ancilla-uncomputation, and phase gates reduces reversible secp256k1 point-addition Q × T cost by 86.1%.',
    metric: '−86.1% Q × T',
    metricSub: '1.496B paper cutoff · 1.259B live frontier',
    whatHeld:
      'Automated candidate search paired with strict reversible-circuit verification cut width × T-count by 86.1% on secp256k1 Shor point addition.',
    ceiling:
      'Coherent windowed figures reflect per-call sensitivity models rather than full-Shor fault-tolerant surface-code physical qubit totals.',
    nextStep:
      'Full-Shor end-to-end lattice surgery & magic-state factory compilation.',
    demoId: 'pareto',
    embedLabel: 'Interactive Q × T Pareto frontier',
    wikiIds: ['ecdsa-fail', 'measure', 'lakatos'],
    essaySlug: 'zero-knowledge-mpc-and-post-quantum-security',
    repoHref: 'https://arxiv.org/abs/2609.09582',
    repoLabel: 'arXiv:2609.09582 ↗',
  },
  {
    id: 'lusis-ghost-states',
    status: 'paper',
    statusLabel: 'Control Plane + 17-pp Study',
    domainLabel: 'Operator Remediation',
    channels: ['scalability', 'cs-ml'],
    title: 'Lusis Mesh & Recoverable Continual-Learning Ghost States',
    summary:
      'Policy-guided infrastructure remediation with Merkle-anchored operator gates alongside latent state-recovery studies after apparent forgetting.',
    metric: 'Merkle gated',
    metricSub: 'operator control plane + ghost-state recovery',
    whatHeld:
      'Separates automated remediation proposals from Merkle-logged human/policy execution gates; companions 17-page study on recovering overwritten representations.',
    ceiling:
      'Local validation packets do not claim unattended production remediation autonomy.',
    nextStep:
      'Unify ghost-state subspace diagnostics with calibrated discriminant safety adapters.',
    wikiIds: ['power', 'memory', 'arendt'],
    repoHref: '/publications/recoverable-ghost-states-paper.pdf',
    repoLabel: 'Ghost States PDF ↗',
  },
]

const CHANNELS: { id: ChannelId; label: string; count?: number }[] = [
  { id: 'featured', label: 'Featured', count: DISPATCHES.filter((d) => d.featured).length },
  { id: 'all', label: 'All Dispatches', count: DISPATCHES.length },
  { id: 'security', label: 'Security' },
  { id: 'scalability', label: 'Scalability & RSI' },
  { id: 'cs-ml', label: 'CS & ML' },
  { id: 'decentralization', label: 'Decentralization' },
  { id: 'socio-economic', label: 'Socio-Economics' },
  { id: 'socio-cultural', label: 'Culture & Time' },
  { id: 'nulls', label: 'Nulls & Confounds', count: DISPATCHES.filter((d) => d.channels.includes('nulls')).length },
  {
    id: 'horizons',
    label: 'Open Horizons',
    count: frontierPillars.reduce((sum, p) => sum + p.approaching.length, 0),
  },
]

function InlineCopy({ command }: { command: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="feed-repro">
      <code>{command}</code>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(command)
            setCopied(true)
            window.setTimeout(() => setCopied(false), 1500)
          } catch {
            /* clipboard unavailable */
          }
        }}
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}

export function ExplorerFeed({
  onOpenEssay,
  onOpenWiki,
  focusedDispatchRequest,
}: {
  onOpenEssay: (slug: string) => void
  onOpenWiki: (id: string) => void
  focusedDispatchRequest: { id: string; nonce: number } | null
}) {
  const [channel, setChannel] = useState<ChannelId>('featured')
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({
    'holdout-ledger': false,
  })
  const [showFlagshipChart, setShowFlagshipChart] = useState(false)

  useEffect(() => {
    if (!focusedDispatchRequest) return
    const target = DISPATCHES.find((d) => d.id === focusedDispatchRequest.id)
    if (!target) return

    if (channel === 'horizons' || (channel === 'featured' && !target.featured)) {
      setChannel('all')
    } else if (
      channel !== 'all' &&
      channel !== 'featured' &&
      !target.channels.includes(channel)
    ) {
      setChannel('all')
    }

    setExpandedIds((prev) => ({ ...prev, [target.id]: true }))
    window.requestAnimationFrame(() => {
      window.setTimeout(() => {
        document
          .getElementById(`dispatch-${target.id}`)
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 60)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedDispatchRequest])

  const visibleDispatches = useMemo(() => {
    if (channel === 'horizons') return []
    if (channel === 'featured') return DISPATCHES.filter((d) => d.featured)
    if (channel === 'all') return DISPATCHES
    return DISPATCHES.filter((d) => d.channels.includes(channel))
  }, [channel])

  const allHorizons = useMemo(
    () =>
      frontierPillars.flatMap((pillar) =>
        pillar.approaching.map((item) => ({
          domain: pillar.shortLabel,
          ...item,
        })),
      ),
    [],
  )

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <section className="ed-section explorer-section" id="frontiers">
      {/* Anchor alias so #systems links resolve cleanly without duplicating 9 rows */}
      <div id="systems" className="explorer-anchor" aria-hidden="true" />

      <div className="ed-section__head ed-section__head--split">
        <div>
          <p className="ed-eyebrow">03: Research Stream &amp; Live Embeds</p>
          <h2>Dig in at your own depth.</h2>
        </div>

        <div className="ed-lead">
          <p>
            Every claim is paired with an executable receipt, an explicit scope
            ceiling, and connected{' '}
            <WikiChip id="evidence-bounded" label="Wiki Nodes" onOpen={onOpenWiki} />.
            Unfold any thread for its live interactive embed, or jump straight to
            the{' '}
            <a href="#/research" className="text-link">
              full monograph →
            </a>
          </p>
        </div>
      </div>

      {/* Compact Pinned Publications Bar */}
      <div className="pinned-duo" aria-label="Pinned flagship publications">
        <article className="pinned-card">
          <div className="pinned-card__top">
            <span className="pinned-card__kicker">Position Paper · Research Spine</span>
            <span className="pinned-card__stat">15.4% vs 53.6% grader split</span>
          </div>
          <h3>Evidence-Bounded Intelligence</h3>
          <p>
            Why operational authority over AI systems must follow adversarial
            verification receipts rather than benchmark capability.
          </p>
          <div className="pinned-card__bar">
            <button
              type="button"
              className="btn-quiet pinned-card__btn"
              onClick={() => onOpenEssay('evidence-bounded-intelligence')}
            >
              Read paper →
            </button>
            <WikiChip id="evidence-bounded" label="Thesis Node" onOpen={onOpenWiki} />
            <WikiChip id="failure" label="Nulls & Confounds" onOpen={onOpenWiki} />
          </div>
        </article>

        <article className="pinned-card">
          <div className="pinned-card__top">
            <span className="pinned-card__kicker">arXiv:2609.09582 · Quantum Circuits</span>
            <span className="pinned-card__stat">−86.1% Q × T cost</span>
          </div>
          <h3>ECDSA.fail: Reversible Point Addition in Shor’s Algorithm</h3>
          <p>
            Evaluator-verified open autoresearch on secp256k1 quantum circuits
            (1.496B Q × T at paper cutoff; 1.259B post-cutoff).
          </p>
          <div className="pinned-card__bar">
            <button
              type="button"
              className="feed-embed-trigger"
              aria-expanded={showFlagshipChart}
              onClick={() => setShowFlagshipChart((v) => !v)}
            >
              {showFlagshipChart ? '▾ Hide Pareto chart' : '▸ Embed Pareto chart'}
            </button>
            <a
              href="https://arxiv.org/abs/2609.09582"
              target="_blank"
              rel="noreferrer"
              className="text-link"
            >
              arXiv ↗
            </a>
            <a
              href="https://ecdsa.fail/"
              target="_blank"
              rel="noreferrer"
              className="text-link"
            >
              ecdsa.fail ↗
            </a>
          </div>
          {showFlagshipChart ? (
            <div className="pinned-card__embed">
              <ParetoChart />
            </div>
          ) : null}
        </article>
      </div>

      {/* Forum / Channel Filter Bar */}
      <div className="feed-toolbar" role="navigation" aria-label="Research stream channels">
        <div className="feed-channels" role="tablist" aria-label="Filter dispatches">
          {CHANNELS.map((c) => {
            const active = channel === c.id
            return (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={`feed-channel${active ? ' is-active' : ''}${c.id === 'nulls' ? ' is-null-lens' : ''}`}
                onClick={() => setChannel(c.id)}
              >
                <span>{c.label}</span>
                {c.count !== undefined ? <small>{c.count}</small> : null}
              </button>
            )
          })}
        </div>
      </div>

      {/* Stream Body: Dispatches OR Open Horizons */}
      {channel === 'horizons' ? (
        <div className="horizon-stream" aria-label="Approaching research thresholds">
          <p className="horizon-stream__intro">
            Open problems across the six fronts, each stated with what a genuine
            unlock requires and the exact bottleneck currently blocking it.
          </p>
          <div className="horizon-stream__grid">
            {allHorizons.map((h) => (
              <article key={h.title} className="horizon-mini">
                <div className="horizon-mini__top">
                  <span className="horizon-mini__domain">{h.domain}</span>
                  <span className="horizon-mini__target">{h.horizon}</span>
                </div>
                <h3><RichText text={h.title} /></h3>
                <p className="horizon-mini__threshold"><RichText text={h.unlock} /></p>
                <p className="horizon-mini__gap">
                  <span>Blocking: </span>
                  <RichText text={h.bottleneck} />
                </p>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <div className="dispatch-feed" role="list" aria-label="Research dispatches">
          {visibleDispatches.map((item) => {
            const isOpen = !!expandedIds[item.id]
            return (
              <article
                key={item.id}
                id={`dispatch-${item.id}`}
                role="listitem"
                className={`dispatch-card${isOpen ? ' is-open' : ''}`}
              >
                <div
                  className="dispatch-card__summary"
                  onClick={() => toggleExpand(item.id)}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isOpen}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      toggleExpand(item.id)
                    }
                  }}
                >
                  <div className="dispatch-card__meta">
                    <span className={`dispatch-status is-${item.status}`}>
                      {item.statusLabel}
                    </span>
                    <span className="dispatch-domain">{item.domainLabel}</span>
                  </div>

                  <div className="dispatch-card__main">
                    <h3>{item.title}</h3>
                    <p>{item.summary}</p>
                  </div>

                  <div className="dispatch-card__right">
                    <div className="dispatch-metric">
                      <strong>{item.metric}</strong>
                      <span>{item.metricSub}</span>
                    </div>
                  </div>
                </div>

                {/* Subtle Forum Footer Row: Embed Toggle + Wiki Backlinks + Direct Link */}
                <div className="dispatch-card__bar">
                  <button
                    type="button"
                    className={`feed-embed-trigger${item.demoId ? ' has-sim' : ''}`}
                    aria-expanded={isOpen}
                    onClick={() => toggleExpand(item.id)}
                  >
                    {isOpen
                      ? '▾ Collapse thread'
                      : item.embedLabel
                        ? `▸ ${item.embedLabel}`
                        : '▸ Unfold receipt & ceiling'}
                  </button>

                  <div className="dispatch-card__wikis" aria-label="Connected wiki nodes">
                    {item.wikiIds.map((wid) => (
                      <WikiChip key={wid} id={wid} onOpen={onOpenWiki} />
                    ))}
                  </div>

                  <div className="dispatch-card__quicklinks">
                    {item.monographHref ? (
                      <a href={item.monographHref} className="dispatch-link">
                        Monograph →
                      </a>
                    ) : null}
                    {item.repoHref && item.repoLabel ? (
                      <a
                        href={item.repoHref}
                        target={item.repoHref.startsWith('#') ? undefined : '_blank'}
                        rel={item.repoHref.startsWith('#') ? undefined : 'noreferrer'}
                        className="dispatch-link"
                      >
                        {item.repoLabel}
                      </a>
                    ) : null}
                  </div>
                </div>

                {/* Expanded Progressive-Disclosure Sheet + Live Interactive Embed */}
                {isOpen ? (
                  <div className="dispatch-card__sheet">
                    <div className="dispatch-digest">
                      <div className="dispatch-digest__col">
                        <h4>Established in artifacts</h4>
                        <p><RichText text={item.whatHeld} /></p>
                      </div>
                      <div className="dispatch-digest__col is-ceiling">
                        <h4>Scope ceiling</h4>
                        <p><RichText text={item.ceiling} /></p>
                      </div>
                      <div className="dispatch-digest__col">
                        <h4>Next falsifiable threshold</h4>
                        <p><RichText text={item.nextStep} /></p>
                      </div>
                    </div>

                    {item.demoId ? (
                      <div className="dark-embed" aria-label="Live interactive research embed">
                        <div className="dark-embed__bar">
                          <span>Live Interactive Embed</span>
                          <span>Manipulate parameters inline</span>
                        </div>
                        <div className="dark-embed__stage">
                          {item.demoId === 'pareto' ? (
                            <ParetoChart />
                          ) : (
                            <Suspense
                              fallback={
                                <p className="dark-embed__loading">
                                  Loading interactive simulation…
                                </p>
                              }
                            >
                              <LazyDemo id={item.demoId} />
                            </Suspense>
                          )}
                        </div>
                      </div>
                    ) : null}

                    {item.reproduceCmd ? (
                      <InlineCopy command={item.reproduceCmd} />
                    ) : null}

                    <div className="dispatch-sheet__foot">
                      {item.monographHref ? (
                        <a href={item.monographHref} className="btn-quiet">
                          Open full monograph &amp; figures →
                        </a>
                      ) : null}
                      {item.essaySlug ? (
                        <button
                          type="button"
                          className="btn-quiet"
                          onClick={() => onOpenEssay(item.essaySlug!)}
                        >
                          Read companion essay →
                        </button>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </article>
            )
          })}
        </div>
      )}

      {/* Progressive Disclosure Footer */}
      {channel === 'featured' ? (
        <div className="feed-more-bar">
          <button
            type="button"
            className="btn-quiet"
            onClick={() => setChannel('all')}
          >
            Show all {DISPATCHES.length} research dispatches ↓
          </button>
          <button
            type="button"
            className="btn-quiet"
            onClick={() => setChannel('nulls')}
          >
            Inspect 5 nulls &amp; confounds →
          </button>
          <button
            type="button"
            className="btn-quiet"
            onClick={() => setChannel('horizons')}
          >
            11 open horizons →
          </button>
        </div>
      ) : null}
    </section>
  )
}
