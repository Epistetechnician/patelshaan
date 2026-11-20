export type FrontierDomainId =
  | 'security'
  | 'scalability'
  | 'ml'
  | 'decentralization'
  | 'socioeconomic'
  | 'sociocultural'

export type FrontierId = FrontierDomainId

export type BreakthroughItem = {
  kind: 'established' | 'falsification'
  title: string
  metric: string
  detail: string
  artifact: string
  href?: string
  essaySlug?: string
}

export type ApproachingItem = {
  title: string
  horizon: string
  bottleneck: string
  unlock: string
  href?: string
}

export type FrontierPillar = {
  id: FrontierDomainId
  index: string
  shortLabel: string
  title: string
  subtitle: string
  question: string
  ceiling: string
  established: BreakthroughItem[]
  approaching: ApproachingItem[]
}

export const portfolioVitalSigns = [
  {
    value: '0 / 59,200',
    label: 'holdout certificate violations across 9/9 pre-registered hypotheses',
    href: '#/research/holdout-ledger',
  },
  {
    value: '0 / 552',
    label: 'unsafe admissions across hostile proposals in Python, Rust & Lean 4 kernels',
    href: '#/research/formasec',
  },
  {
    value: '0.95 vs 0.27',
    label: 'held-out safety refusal retention under OOD fine-tuning vs replay',
    href: '#/research/temporal-grid-safety',
  },
  {
    value: '−86.1%',
    label: 'reversible secp256k1 point-addition Q × T score reduction (arXiv:2609.09582)',
    href: 'https://arxiv.org/abs/2609.09582',
  },
  {
    value: '+0.305',
    label: 'governed agent skill lift on Sonnet (+0.245 Haiku), 43/43 attacks refused',
    href: '#/research/caduceus',
  },
  {
    value: '2,362 + 195',
    label: 'multilingual sacred-text passages & coded pilgrim episodes (α = 0.82)',
    href: '#/research/sacred-geography-kailas',
  },
]

export const frontierPillars: FrontierPillar[] = [
  {
    id: 'security',
    index: '01',
    shortLabel: 'Security',
    title: 'Security, Certified Authority & Post-Quantum Readiness',
    subtitle: 'Small kernels, formal admission, hardware attestation, and quantum circuit bounds',
    question:
      'Can untrusted models and proposers search freely while a tiny, formally checked kernel, single-use capabilities, and attested sandboxes guarantee nothing unsafe executes?',
    ceiling:
      'Level 1 local deterministic verification + single-host Intel TDX attestation (MachineAttestedReproduction); independent second-host replication and post-quantum receipt primitives remain open.',
    established: [
      {
        kind: 'established',
        title: 'Certified composition across Python, Rust, Lean 4, and Kani',
        metric: '135 / 135 byte-identical · 0 / 552 hostile admissions',
        detail:
          'FormaSec pairs untrusted LLM and enumerator proposers with a small kernel verified across 600 structural cases in Python, Rust, and Lean 4 (`admitAlg`, `plan_sound`), Kani proofs on the pure Rust decision core, 75 mutants (0 false accepts), and Landlock execution.',
        artifact: 'formasec · DESIGN.md §§18–29',
        href: '#/research/formasec',
      },
      {
        kind: 'established',
        title: 'Hardware-attested proposal-to-rollback control loop',
        metric: '279 / 279 tests · 20 / 20 Intel TDX scenarios',
        detail:
          'Security Alignment OS enforces exact-subject evidence, deterministic admission, single-use capabilities, a separate broker process, and fail-closed rollback, verified on Google Confidential Space Intel TDX.',
        artifact: 'security-alignment-os',
        href: '#/research/security-alignment-os',
      },
      {
        kind: 'established',
        title: 'Reversible secp256k1 resource frontier in Shor’s algorithm',
        metric: '−86.1% Q × T score · 1.496B cutoff (1.259B windowed)',
        detail:
          'ECDSA.Fail ran an evaluator-verified open autoresearch loop compressing elliptic-curve point-addition circuits, tightening empirical planning inputs for post-quantum signature migration.',
        artifact: 'arXiv:2609.09582 v2',
        href: 'https://arxiv.org/abs/2609.09582',
      },
      {
        kind: 'established',
        title: 'Sanitizing broker trajectory gate, closed-loop reflex & supply-chain defense',
        metric: '33.7% vs 7.1% admitted (retrospective) · 83/83 hacks caught',
        detail:
          'Across 238 retrospective Gemma-4 SWE trajectories (34 tasks, 9 ever solved), enforcing passing post-edit checks + blocking post-failure test edits while broker-stripping `repro.py` lifts admitted solve rate from 7.1% to 33.7% (saving 65.1% of holdout runs), catches 83/83 injected test-tamper mutations, and recovers 9/34 solves in a `k20 -> v3` reflex while saving 41.2% of stage-2 runs (prospective SWE-bench Verified validation locked next).',
        artifact: 'patelshaan-lab · primitives/verified_loop.py',
        href: 'https://github.com/Epistetechnician/patelshaan-lab',
      },
    ],
    approaching: [
      {
        title: 'Cross-operator TEE replication + proof-carrying zklean/SP1 admission',
        horizon: 'Next gate · Multi-host verification',
        bottleneck:
          'TDX attestation currently binds one operator project, and SP1/zklean certificate generation was exercised once rather than continuously.',
        unlock:
          'Separately administered TDX/SEV-SNP verification plus repeatable proof-carrying admission receipts that outlive hardware-vendor trust.',
        href: '#/research/formasec',
      },
      {
        title: 'Semantics-mutated post-quantum agent receipts',
        horizon: 'Approaching · PQ cryptography',
        bottleneck:
          'Existing Ed25519/ECDSA receipt chains inherit elliptic-curve quantum exposure.',
        unlock:
          'Applying our 14-class adversarial trace-mutation harness to hash- and lattice-based signature verifiers inside agent capability receipts.',
        href: '#/research/composed-zk-benchmark-os',
      },
    ],
  },
  {
    id: 'scalability',
    index: '02',
    shortLabel: 'Scalability & RSI',
    title: 'Scalability, Holdout Pricing & Self-Improving Loops',
    subtitle: 'Scaling autonomous research without adaptive overfitting or unverified drift',
    question:
      'When autonomous loops run thousands of experiments faster than humans can review, how do we certify real improvements mechanically without burning the holdout or gaming the grader?',
    ceiling:
      'Pre-registered 59,200-run confirmatory simulation + synthetic e-process sim (sd = 0.09) + live H100 pilot catching planted memorization + paired Claude skill evaluations; prospective SWE-bench Verified validation (`TRACK_A_PREREGISTRATION.md`) is next.',
    established: [
      {
        kind: 'established',
        title: 'Bit-priced adaptive holdouts & anytime Empirical-Bernstein e-processes (simulation)',
        metric: '0 / 59,200 violations · 0 / 1,000 sequential sim violations',
        detail:
          'Holdout Ledger passes 9/9 pre-registered simulated hypotheses (Wald 100% wrong under attack); extending to predictable Empirical-Bernstein + MDL betting martingales keeps 0/1,000 anytime sequential violations in low-variance simulation (sd = 0.09, −40.4% width vs Hoeffding; margin narrows toward Hoeffding on real binary SWE outcomes).',
        artifact: 'holdout-ledger + primitives/verified_loop.py',
        href: '#/research/holdout-ledger',
      },
      {
        kind: 'established',
        title: 'Live H100 hill-climb gate catching a planted dev-set memorizer',
        metric: '1 / 1 planted memorizer caught · 2.84× Tier-B speedup',
        detail:
          'Playbox F3 sealed-holdout governance rejected a candidate showing +0.866 dev gain after holdout bpb spiked to 2.203–2.434 against a 1.195 ceiling, with every receipt cryptographically re-verified.',
        artifact: 'playbox · docs/f3/pilot/verify.txt',
        href: '#/research/playbox',
      },
      {
        kind: 'established',
        title: 'Governed agent skill evolution with honest lane falsification',
        metric: '+0.245 Haiku · +0.305 Sonnet · 43 / 43 attacks refused',
        detail:
          'Caduceus governs Hermes Agent skill updates across 13 admission lanes and RFC 9162 Merkle proofs; when its phrase-tripwire lane held 41.0% of real skills (vs 5% limit), the gate kept it off.',
        artifact: 'caduceus · exp-002 / exp-003',
        href: '#/research/caduceus',
      },
      {
        kind: 'falsification',
        title: 'Verified synthetic experience gains & the 7B real-code wall',
        metric: '+0.640 typed codecs · +0.238 verified synth · −0.0025 at 7B code',
        detail:
          'HSI Lab (25 stdlib-recomputed receipts) proves typed event codecs and verified synthetic data pay in rule worlds (+0.141 above pool-size control) while isolating a tight 7B real-code null.',
        artifact: 'hsi-lab · E1–E10 receipts',
        href: '#/research/hsi-lab',
      },
    ],
    approaching: [
      {
        title: 'Live LLM self-improvement loops governed by MDL holdout pricing',
        horizon: 'Immediate · Unattended RSI',
        bottleneck:
          'Holdout Ledger was confirmed on tabular ensembles, while Caduceus and Playbox F3 ran short pilots.',
        unlock:
          'Wiring `holdout-ledger` + `sim.py` root-cause memory directly into multi-hundred-step LLM code and pretraining hill-climbs with provable false-discovery bounds.',
        href: '#/research/holdout-ledger',
      },
      {
        title: 'Fast-to-slow consolidation against the 3-seed replay_kl bar (`cl7b`)',
        horizon: 'Approaching · Continual scaling',
        bottleneck:
          'Independent rank-16 task deltas collapse when summed (`15.96` fp / `17.74` 4-bit wiki NLL) and `1/K` erases facts, leaving 3-seed `replay_kl` (`0.997` fact acc, `3.60` wiki NLL) unbeaten without replay.',
        unlock:
          'Scheduled on-policy KL consolidation that preserves `replay_kl`-level retention without unbounded replay buffers at 7B+ scale.',
        href: '#/research/hsi-lab',
      },
    ],
  },
  {
    id: 'ml',
    index: '03',
    shortLabel: 'CS & ML Research',
    title: 'Mechanistic Interpretability, Continual Learning & Alignment',
    subtitle: 'Auditing the instruments, norm-matched controls, and drift-resistant safety adapters',
    question:
      'Do our interpretability and alignment methods survive representation changes, norm-matched baselines, planted instrument flaws, and fine-tuning drift?',
    ceiling:
      'Real open-weight runs across GPT-2 XL, Pythia-2.8B, Qwen3-1.7B/8B, Mistral-7B, OLMo-2-7B, and Tulu-3 (up to 8B parameters, 6–200 seeds depending on study); external replication pending.',
    established: [
      {
        kind: 'established',
        title: 'Planted-flaw interpretability auditing (F2) & cross-family neuron gate (R6)',
        metric: 'Rules 0/8 · Probes 3/8 (0/3 out-of-sample) · Qwen3 R6 p = 0.000999',
        detail:
          'In F2 Phase 1–2, static rules gates catch 0/8 planted flaw classes and an informed probe battery catches 3/8 in-sample but 0/3 new out-of-sample flaws (`underpowered_null` missed 200/200 seeds), alongside out-of-family causal unit replication on Pythia-2.8B, Qwen3-1.7B-Base (1.437 vs 0.044), and GPT-2 XL.',
        artifact: 'mech-interp-unified · R6 & F2',
        href: '#/research/mech-interp-unified',
      },
      {
        kind: 'falsification',
        title: 'Equivalence-tested null on J-space specificity vs norm-matched PCA',
        metric: '0.00 [−0.05, +0.05] DPO gap · 11 / 12 runs within ±0.2 logits',
        detail:
          'Across OLMo-2-7B (up to 4,000 prompts + 1,000-prompt lens refit) and Tulu-3, J-space ablation beats random subspaces (+0.39) but matches damage-equalized top-PCA while exposing a +2-logit clean-margin confound.',
        artifact: 'jspace-pilot · baseline_writeup.md',
        href: '#/research/mech-interp-unified',
      },
      {
        kind: 'established',
        title: 'Frozen discriminant adapters preserve safety refusals through benign drift',
        metric: '0.95 vs 0.27 held-out refusals (OLMo-2) · 0.96 vs 0.20 (Qwen/Mistral)',
        detail:
          'After catching its own v16 attacker-rate confound and proving slow-update grids null under fair attackers, Temporal Grid Safety showed discriminant adapters retain refusals across OOD benign fine-tuning on three model families.',
        artifact: 'temporal-grid-safety · v29 / v30',
        href: '#/research/temporal-grid-safety',
      },
      {
        kind: 'falsification',
        title: 'Coordinate relabeling invariance & Jacobian underfitting',
        metric: '100% positions moved (3e-7 err) · 0.885 Jacobian vs 0.11 value nRMSE',
        detail:
          'Theseus Lab proved raw neuron indices carry zero representation-independent identity (−0.983 same-label cosine vs 0.9999996 mapped), fitted modules miss local derivatives, and safety graders disagree 3.5× (15.4% vs 53.6%).',
        artifact: 'theseus-lab · V8–V39',
        href: '#/research/theseus-lab',
      },
      {
        kind: 'falsification',
        title: 'Matched-progress continual-learning falsification',
        metric: '0 / 5 seeds pass when compared at equal learning progress',
        detail:
          'Aligned Holistic Continual Learning proved end-of-training safety wins vanish when interpolated at matched incoming gain (0.5, 1.0, 1.5), establishing matched-progress controls as mandatory.',
        artifact: 'aligned-holistic-continual-learning',
        href: '#/research/aligned-holistic-continual-learning',
      },
    ],
    approaching: [
      {
        title: 'Out-of-sample Planted-Flaw Benchmark for Interpretability Instruments',
        horizon: 'Paper-ready synthesis · ML evaluation',
        bottleneck:
          'F2’s probe battery was authored alongside the initial 8 flaw classes (making 3/8 an upper bound).',
        unlock:
          'Combining F2, the Lean-proved neuron gate, and J-space’s norm-matched PCA / positive-control arms against held-out flaw classes to benchmark SAE, transcoder, and circuit tools.',
        href: '#/research/mech-interp-unified',
      },
      {
        title: '20-seed full-weight & AdvBench/HarmBench discriminant safety adapters',
        horizon: 'Immediate · Open-weight fine-tuning safety',
        bottleneck:
          'v30 benign-drift retention used 6–20 LoRA seeds and exact-match refusal proxies; v32 harness is built and ready.',
        unlock:
          'A drop-in, low-overhead adapter recipe that preserves calibrated refusal behavior during customer fine-tuning without collapsing benign helpfulness.',
        href: '#/research/temporal-grid-safety',
      },
    ],
  },
  {
    id: 'decentralization',
    index: '04',
    shortLabel: 'Decentralization',
    title: 'Decentralization, Multi-Owner Rooms & Verifiable Markets',
    subtitle: 'Offline-checkable receipts, attenuated Biscuit grants, TEEs, and semantic ZK benchmarks',
    question:
      'How can agents, compute buyers, and communities collaborate across untrusted operators so every participant can verify outcomes offline and exit without permission?',
    ceiling:
      'Working Rust/TypeScript/TEE prototypes, 494+ Playbox tests, 115 HyperIntel tests, 1,107 ZK benchmark core tests, and live Halo light-client docs; live real-money settlement is intentionally unlaunched.',
    established: [
      {
        kind: 'established',
        title: 'Multi-owner collaboration rooms & cross-family concept channels',
        metric: '46K+ LoC Rust · Biscuit grants · 87.5% cross-family concept gate',
        detail:
          'Playbox lets agents of different owners collaborate under signed Biscuit capabilities and Ed25519 hash-chained logs; latent steering crosses Qwen3-8B → OLMo-2-7B at 87.5% (1/72 control FPs), while honestly reporting plain text still wins (71–77% vs 61–68%).',
        artifact: 'playbox · v0.3.2',
        href: '#/research/playbox',
      },
      {
        kind: 'established',
        title: 'Offline-verifiable inference routing with Z3-bound source hashes',
        metric: '115 / 115 active tests · Z3 unsat router check · 0 hidden spread',
        detail:
          'HyperIntel derives route, metering, settlement, and evidence digests verifiable offline against caller-supplied trust roots, with compare-and-swap replay stores and fail-closed crash classification.',
        artifact: 'HyperIntel · hyperintel-cli',
        href: '#/research/hyperintel',
      },
      {
        kind: 'established',
        title: 'Semantics-first ZK benchmark OS scoring soundness before speed',
        metric: '9 workload families · 14 mutation classes · 1,107 core tests',
        detail:
          'Composed ZK Benchmark OS mutates valid state-machine traces across 14 adversarial classes so a fast prover that accepts a forged trace ranks strictly below a slow prover that rejects it.',
        artifact: 'composed-zk-benchmark-os',
        href: '#/research/composed-zk-benchmark-os',
      },
      {
        kind: 'established',
        title: 'Confidential stablecoins & verifiable AI light-client stack',
        metric: 'Halo Labs Co-Founder & Head of AI · Phala & Fairblocks integrations',
        detail:
          'Leading verifiable AI + TEE/ZK architecture (`halo-verus`), modular privacy research, and developer onboarding for confidential stablecoin rails.',
        artifact: 'Halo Labs · docs.halo-labs.xyz',
        href: 'https://docs.halo-labs.xyz/',
      },
    ],
    approaching: [
      {
        title: 'External zkVM soundness-vs-speed matrix (SP1, RISC Zero, Plonky3)',
        horizon: 'Approaching · Verifiable compute',
        bottleneck:
          'Composed ZK’s 14 mutation classes currently replay against the local semantic oracle rather than external prover backends.',
        unlock:
          'First public zkVM benchmark that empirically pairs proving cost with adversarial trace-rejection completeness.',
        href: '#/research/composed-zk-benchmark-os',
      },
      {
        title: 'Staked independent verification across federated Playbox + HyperIntel nodes',
        horizon: 'Approaching · Sovereign networks',
        bottleneck:
          'Commons v0 runs on a single relay and HyperIntel settlement is zero-value mock by design.',
        unlock:
          'Multi-operator rooms where independent verifiers are paid to re-run receipts and challenge divergent outputs.',
        href: '#/research/playbox',
      },
    ],
  },
  {
    id: 'socioeconomic',
    index: '05',
    shortLabel: 'Socio-Economics',
    title: 'Socio-Economic Architecture, Credit & Public Goods',
    subtitle: 'Market coherence, productive unsecured credit, sacred economics, and ecological MRV',
    question:
      'What institutional and financial primitives let capital price real risk, fund shared maintenance, and serve productive cash-flow borrowers rather than purely speculative collateral?',
    ceiling:
      '72-page Statebook whitepaper, multi-ecosystem operator track record (Halo, NPC Capital, Celo, Dream DAO, Eco DAO, Solana), and published architectural syntheses.',
    established: [
      {
        kind: 'established',
        title: 'Statebook: 7 completeness vectors & live 188-contract Polymarket receipt',
        metric: '72-page paper · 6.30% live partition gap · 5.04 bps spread',
        detail:
          'Normalizes event, perp, and option contracts into `StateKeys` and 3 separated finality clocks; a live read-only Polymarket Gamma receipt (13 partitions/ladders, 188 contracts, HMAC/SHA-256 verified) measured 6.30% max partition residual, 3.90% gross Dutch-book gap, 0.00% cumulative calendar inversion, and 5.04 bps weighted half-spread.',
        artifact: 'statebook-whitepaper.pdf + primitives/multi_clock.py',
        href: '/publications/statebook-whitepaper.pdf',
        essaySlug: 'statebooks-convergence-with-coherence',
      },
      {
        kind: 'established',
        title: 'Cash-flow & tranche architecture for on-chain unsecured credit',
        metric: 'Blended identity · Receivable waterfalls · Shared default memory',
        detail:
          'Moves beyond overcollateralized DeFi leverage by pairing probabilistic reputation, programmable revenue escrows, shared workout registries, and transparent senior/junior/equity tranching.',
        artifact: 'writings · Unsecured Credit',
        essaySlug: 'architecture-unsecured-credit',
      },
      {
        kind: 'established',
        title: 'Four-layer public-goods & DAO capital-velocity stack',
        metric: 'QF + RetroPGF + Delegated Budgets + Streaming Maintenance',
        detail:
          'Grounded in stewarding ~100 young builders at Dream DAO (40+ online, 4 IRL gatherings), onboarding 50+ contributors at Eco DAO, Celo public-goods pipelines, and NPC Capital cross-chain analytics.',
        artifact: 'writings · Sacred Economics & DAO Flows',
        essaySlug: 'sacred-economics-crypto',
      },
      {
        kind: 'established',
        title: 'Accountable ecological memory via hybrid on-chain MRV',
        metric: 'Versioned public methodologies · Multi-sensor provenance',
        detail:
          'Reframes carbon and nature-based finance from wrapper tokens into contestable public methodologies integrating satellite sensing, field audits, and retirement lineage.',
        artifact: 'writings · MRV On-Chain',
        essaySlug: 'mrv-onchain',
      },
    ],
    approaching: [
      {
        title: 'Read-only Statebook monitor over live prediction & derivatives books',
        horizon: 'Next build · Financial coherence',
        bottleneck:
          'Statebook currently evaluates synthetic contract fixtures rather than live venue feeds.',
        unlock:
          'Ingesting live Polymarket, Kalshi, and perp/options terms to surface real-time payoff residuals and settlement-clock mismatches before capital is deployed.',
        href: '/publications/statebook-whitepaper.pdf',
      },
      {
        title: 'Privacy-preserving cash-flow credit attestations',
        horizon: 'Approaching · Productive DeFi',
        bottleneck:
          'Real-world borrowers cannot expose raw customer invoices on public ledgers, yet lenders need verifiable repayment coverage.',
        unlock:
          'Combining TEE/ZK revenue attestations with programmable tranche waterfalls so small businesses and cooperatives can borrow on cash flow without doxxing counterparties.',
      },
    ],
  },
  {
    id: 'sociocultural',
    index: '06',
    shortLabel: 'Socio-Cultural',
    title: 'Socio-Cultural Inquiry & Computational Humanities',
    subtitle: 'Sacred geography, multilingual corpora, complex time, and the intellectual history of trust',
    question:
      'How do human traditions encode multiple coexisting worlds and clocks in a single landscape, and where do computational instruments distort cultural meaning unless checked by philology?',
    ceiling:
      'Open-license corpus across 15+ languages (`2,626` blind-labeled passages incl. `282` recovered classical Tibetan `ཏི་སེ` & Bon Kangyur `གཡུང་དྲུང་དགུ་བརྩེགས` passages) + `416`-446 dual-coded pilgrimage windows (`α = 0.86`) including full-circuit locator-only coding of Colin Thubron’s *To a Mountain in Tibet* (`r ∈ [0, 1]`); blinded Tibetan/Bon (`115 + 68`-row) and Sanskrit (`233`-row) scholar handoff packs prepared.',
    established: [
      {
        kind: 'established',
        title: 'Spatial-Mandala vs. Multi-Temporal double dissociation across 2,626 blind passages',
        metric: '2,626 passages · Spatial `cat e`: sa +3.38, bo Tise +21.1, Bon +44.1 · Temporal `a,b,d,f` negative/null',
        detail:
          'Decomposing the 2,362 v2 blind labels and recovering 264 classical Tibetan `ཏི་སེ` (N=173, 113 works) & Bon Kangyur `གཡུང་དྲུང་དགུ་བརྩེགས` (N=109, 32 works; overlap κ = 0.90) passages resolves the pooled Sanskrit/Tibetan nulls: Kailas/Tise/Yungdrung Gutsek is significantly enriched in spatial axis/mandala structure (`cat e`) across English (+1.22), Sanskrit (+3.38), Tibetan `ཏི་སེ` (+21.1; Kangyur/Bon +42.0), and Bon (+44.1), while significantly depleted or tightly null on multi-temporal concepts (`a,b,d,f`: en −6.37, sa −8.43, hi −23.33, bo +1.2/+1.5).',
        artifact: 'kailas-corpus · RESULTS_V3.md',
        href: '#/research/sacred-geography-kailas',
      },
      {
        kind: 'established',
        title: 'Route-locked spatial mandala (`φ = f(r)`) vs. calendar-decoupled liturgical time (`φ ≠ f(r)`)',
        metric: '416+ windows (α = 0.86) · Hajj/Holy Land 16.7% vs Kailas 3.0% (p = 0.0022) · Thubron kora 20.0% aligned',
        detail:
          'Expanding public-domain coding to 368 windows (254 experience episodes, 20 books) proves calendar-decoupled clocks concentrate in Hajj & Holy Land liturgy (16.7% vs 3.0% Kailas explorers, p = 0.0022). Locator-only full-circuit coding of Thubron’s *To a Mountain in Tibet* (48 episodes, 35 along r ∈ [0, 1], α = 0.83) shows 100% multi-frame braiding, 20.0% strict (34.3% loose) route-aligned mandala phase (9× higher than 19th-c. surveyors, p = 0.0017), and 0.0% (0/24) calendar decoupling on Stages 2–5 once past the Stage 1 Saga Dawa flagpole gathering.',
        artifact: 'kailas-corpus · RESULTS_CODING_V2.md',
        href: '#/research/sacred-geography-kailas',
      },
      {
        kind: 'falsification',
        title: 'Ancient Kaṭapayādi numerology falsified (−2.89b) vs. pramāṇa & mandala registers (+111b)',
        metric: '1,084 passages · Kaṭapayādi −2.89b vs Mandala +110.98b',
        detail:
          'Across 482 IAST-normalized Sanskrit and 602 Classical Tibetan/Bon passages, unconstrained consonant-digit hits fall below 200 shuffled-akṣara permutations (−2.89 bits stream MDL), whereas cosmographic pramāṇa metrology (+11.12 bits) and Tibetan/Bon architectural-mandala tiers (+53.79 bits; +110.98 bits pooled) compress spatial cosmology.',
        artifact: 'ciphers.py · pramana_colophons.py',
        href: '#/research/sacred-geography-kailas',
      },
      {
        kind: 'established',
        title: 'Commonplace book: engineering concepts traced to legal, ritual & accounting roots',
        metric: '7 humanities threads · 40+ primary texts linked to live code',
        detail:
          'Situates capabilities, witnesses, receipts, forgetting, and Goodhart’s law inside Plutarch, Parfit, Borges, Lind, Saltzer & Schroeder, Madison, Shapin & Schaffer, Pacioli, Ostrom, Mauss, and Geertz.',
        artifact: 'site · #/research commonplace book',
        href: '#/research?t=trust',
      },
    ],
    approaching: [
      {
        title: 'Tibetan, Bon & Sanskrit scholar handoff (115 + 68 + 233 rows) & human double-coding benchmark',
        horizon: 'Ready to ship · Philological review',
        bottleneck:
          'Current passage raters and episode coders are models (κ = 0.90 on Tibetan v3 overlaps; α = 0.86 on episodes), and core Bon Dzogchen scans (Zhang Zhung Nyan Gyud, Gzer mig) remain un-OCRed.',
        unlock:
          'Scoring our seeded blind sheets (`115` Tibetan v2 + `68` Tibetan/Bon v3 canonical supplement + `233` Sanskrit rows with test-retest repeats and 40-episode `human_pack.csv`) with domain scholars to benchmark LLM cultural-reading validity.',
        href: '#/research/sacred-geography-kailas',
      },
    ],
  },
]

export const frontiers = frontierPillars
