export type InstallTab = { label: string; note?: string; command: string }

export type ResearchCategory =
  | 'evaluation'
  | 'security'
  | 'interpretability'

export type ResearchRepo = {
  slug: string
  category: ResearchCategory
  name: string
  repo: string
  releaseLabel?: string
  tagline: string
  question: string
  headline: string
  notShown: string
  results: { value: string; label: string }[]
  install: InstallTab[]
  reproduce: string
  usage: { title: string; note: string; code: string }[]
  limits: string[]
  custody?: string
  docs: { label: string; path: string }[]
}

export const researchCategories: { id: ResearchCategory; title: string; subtitle: string }[] = [
  {
    id: 'evaluation',
    title: 'Evaluation Integrity & Governed Self-Improvement',
    subtitle: 'Pricing holdout leakage, governing skill updates, verifying synthetic experience, and multi-owner collaboration rooms.',
  },
  {
    id: 'security',
    title: 'Security, Certified Composition & Verifiable Compute',
    subtitle: 'Small formal kernels, hardware-attested capability loops, offline-verifiable inference receipts, and semantic ZK benchmarks.',
  },
  {
    id: 'interpretability',
    title: 'Mechanistic Interpretability, Continual Learning & Alignment',
    subtitle: 'Planted-flaw audits, cross-family causal neuron gates, norm-matched subspace equivalence, and drift-resistant safety adapters.',
  },
]

const GH = 'https://github.com/Epistetechnician'
const TAG = 'v0.1.0'

export const repoUrl = (repo: string) => `${GH}/${repo}`

export const researchRepos: ResearchRepo[] = [
  {
    slug: 'holdout-ledger',
    category: 'evaluation',
    name: 'Holdout Ledger',
    repo: 'holdout-ledger',
    releaseLabel: 'main (PREREG_COMMIT pinned)',
    tagline: 'Pricing adaptive holdout leakage in bits so self-improvement loops cannot silently overfit their judge.',
    question:
      'When a self-improvement loop asks a sealed holdout “did that help?” hundreds of times, how much information leaks into the next proposal, and can a hash-chained ledger certify true gain without ever being fooled by holdout-fitting patches?',
    headline:
      'Across 59,200 pre-registered confirmatory runs, all 9 hypotheses pass with 0 certificate violations (95% upper bound 0.0001), whereas standard zero-bit Wald bounds fail in 100% of attacked runs.',
    notShown:
      'Simulated over Covertype tabular ensembles and scripted proposers, not yet a live multi-day LLM coding loop; in the late regime (15 members already tuned, true gain ~0.001) nothing is certifiable up to n = 100,000.',
    results: [
      { value: '0 / 59,200', label: 'certificate violations across all confirmatory runs (H2)' },
      { value: '9 / 9', label: 'pre-registered hypotheses passed (PREREG_COMMIT)' },
      { value: '100%', label: 'attacked runs where standard zero-bit Wald bounds fail (H3)' },
      { value: '94.4% / 98.6%', label: 'true gain kept by the MDL gate (94.4%) and 64-batching at 96 bits (98.6%)' },
    ],
    install: [
      {
        label: 'Git',
        note: 'Python 3.11+ plus Lean 4 for the counting-bound proofs',
        command: `git clone ${GH}/holdout-ledger.git && cd holdout-ledger`,
      },
      {
        label: 'Source',
        command: `curl -L ${GH}/holdout-ledger/archive/refs/heads/main.tar.gz | tar xz`,
      },
    ],
    reproduce:
      'python -m hl.pool && python -m hl.prepare && python -m hl.analyze results/confirmatory.jsonl.gz results/',
    usage: [
      {
        title: 'Check the Lean counting & monotonicity theorems',
        note: 'Uses standard Lean 4 axioms only; concentration inequality is an explicit hypothesis.',
        code: 'lean formal/HoldoutLedger.lean',
      },
      {
        title: 'Price a sequence of holdout verdicts in Python',
        note: 'Charges min(verdict bits, description bits) with a compressible-core fallback.',
        code: `from hl.ledger import HoldoutLedger

ledger = HoldoutLedger(n_holdout=20_000, delta=0.05)
cert = ledger.certify(admitted_gain=0.217, verdict_bits=96, core_desc_bits=104)`,
      },
    ],
    limits: [
      'Confirmatory grid uses Covertype 1 vs 2 tabular ensembles and stylized low-margin patch attackers.',
      'No adaptive LLM proposer was explicitly prompted to defeat the `mdl` complexity gate; the union bound, not the gate, carries the formal guarantee.',
      'In the late regime (true gain ~0.001), sample complexity exceeds n = 100,000.',
    ],
    docs: [
      {
        label: 'Flagship Preprint (Anytime e-Process + Broker)',
        path: `${GH}/patelshaan-lab/blob/master/writings/paper-anytime-holdouts-and-trajectory-brokers.md`,
      },
      { label: 'PREREG.md', path: 'blob/main/PREREG.md' },
      { label: 'RESULTS.md', path: 'blob/main/results/RESULTS.md' },
      { label: 'HoldoutLedger.lean', path: 'blob/main/formal/HoldoutLedger.lean' },
      { label: 'README', path: '#readme' },
    ],
  },
  {
    slug: 'caduceus',
    category: 'evaluation',
    name: 'Caduceus',
    repo: 'caduceus',
    releaseLabel: 'main (R28 gate)',
    tagline: 'A 13-lane governed release process for agent skill self-improvement, paired with a Merkle ledger.',
    question:
      'Can an agent evolve its own reusable skills under a deterministic admission gate, Landlock broker, and holdout-leakage account—and does governed skill evolution actually improve task resolution on held-out contracts?',
    headline:
      'Paired cluster-bootstrapped evaluations lift task resolution by +0.245 [+0.11, +0.39] on Haiku and +0.305 [+0.17, +0.445] on Sonnet, refuse 43 of 43 seeded attacks, and catch an over-blocking authority lane (41.0% false holds on 188 real skills).',
    notShown:
      'Evaluations are single-owner scenarios and contracts; the holdout-leakage radius is cross-checked against Holdout Ledger across 135 combinations, but a multi-week autonomous evolution loop has not yet run through it.',
    results: [
      { value: '+0.245', label: 'Haiku 5.5 paired lift vs no skill [+0.11, +0.39], 200 units (exp-002)' },
      { value: '+0.305', label: 'Sonnet 5.5 paired lift on harder contract v2 [+0.17, +0.445] (exp-003)' },
      { value: '43 / 43', label: 'seeded hostile skill attacks refused; 340 tests passing' },
      { value: '41.0% vs 5%', label: 'real third-party skills held by phrase-tripwire lane — failed gate, kept off' },
    ],
    install: [
      {
        label: 'Git',
        note: 'Python stdlib core + Hermes plugin & Landlock broker',
        command: `git clone ${GH}/caduceus.git && cd caduceus && pip install -e .`,
      },
      {
        label: 'Source',
        command: `curl -L ${GH}/caduceus/archive/refs/heads/main.tar.gz | tar xz`,
      },
    ],
    reproduce: 'pytest -q && python3 -m caduceus.readback ledgers/exp-002.result.json',
    usage: [
      {
        title: 'Independently verify a ledger & RFC 9162 Merkle proof',
        note: 'Stdlib-only readback verifier checks digest chains and paired bootstrap receipts.',
        code: 'python3 -m caduceus.readback ledgers/exp-002.result.json',
      },
    ],
    limits: [
      'Provenance lane blocks 12/12 hostile-after-untrusted writes, but cannot block hostile writes made without prior untrusted input (3/3 admitted, documented).',
      'Evaluated on author-constructed task clusters rather than external third-party benchmarks.',
    ],
    docs: [
      { label: 'CLAIMS.md', path: 'blob/main/docs/CLAIMS.md' },
      { label: 'PRD.md', path: 'blob/main/docs/PRD.md' },
      { label: 'README', path: '#readme' },
    ],
  },
  {
    slug: 'hsi-lab',
    category: 'evaluation',
    name: 'HSI Lab',
    repo: 'hsi-lab',
    releaseLabel: 'main (E1–E10 frozen packets)',
    tagline: 'Frozen-packet experiments on verified synthetic experience, typed codecs, and where recursive gains hit a wall.',
    question:
      'When agents train on synthetic experience or communicate through typed event codecs at matched byte and compute budgets, how much gain survives a pool-size control—and does it transfer to 7B code?',
    headline:
      'Across E1–E10 (25 stdlib-recomputable receipts), typed events beat text by +0.640 at equal bytes and verified synthetic data beats replay by +0.238 (+0.141 above pool-size control), while 7B code hits a tight null (−0.0025).',
    notShown:
      'Rule-world synthetic recursion works while real 7B code recursion hits a tight null (−0.0025); companion continual-learning runs in `rsi-loops/cl7b` show summing independent rank-16 task deltas breaks capability (15.96 wiki NLL) and `1/K` erases facts, leaving 3-seed `replay_kl` (0.997 fact acc) as the bar to beat.',
    results: [
      { value: '+0.640', label: 'typed event codec vs raw text at equal bytes [0.614, 0.667] (E1)' },
      { value: '+0.238', label: 'verified synthetic experience vs unverified replay [0.205, 0.270] (E6)' },
      { value: '+0.141', label: 'verified synthetic minus pool-size-matched control [0.106, 0.177]' },
      { value: '−0.0025', label: 'Qwen2.5-7B real code self-training tight null [−0.025, +0.020] (E8-7b)' },
    ],
    install: [
      {
        label: 'Git',
        note: 'Stdlib receipt verifier (`verify_all.py`) requires zero third-party packages',
        command: `git clone ${GH}/hsi-lab.git && cd hsi-lab`,
      },
      {
        label: 'Source',
        command: `curl -L ${GH}/hsi-lab/archive/refs/heads/main.tar.gz | tar xz`,
      },
    ],
    reproduce: 'python3 scripts/verify_all.py && pytest -q',
    usage: [
      {
        title: 'Recompute all 25 experiment receipts from raw trial logs',
        note: 'Uses Python standard library only to check bootstrap CIs, paired diffs, and lock digests.',
        code: 'python3 scripts/verify_all.py',
      },
    ],
    limits: [
      'CUDA GPU nondeterminism meant 96/175 exact tensor digests matched on A3 rerun, though statistical conclusions replicated.',
      'An early “visible-evidence verifier” kept samples of which only 19–43% were truly ground-truth optimal; E9 weakened the naive precision-only reading (−0.019).',
    ],
    docs: [
      { label: 'REPORT.md', path: 'blob/main/docs/REPORT.md' },
      { label: 'Assurance', path: 'blob/main/docs/assurance.md' },
      { label: 'README', path: '#readme' },
    ],
  },
  {
    slug: 'playbox',
    category: 'evaluation',
    name: 'Playbox',
    repo: 'playbox',
    releaseLabel: 'v0.3.2',
    tagline: 'Signed rooms where agents of different owners collaborate under Biscuit grants, plus verified GPU hill-climbing.',
    question:
      'Can agents belonging to different principals collaborate inside shared rooms with attenuated Biscuit capabilities and signed Ed25519 histories—and can we govern multi-agent optimization and cross-model latent communication under hard controls?',
    headline:
      'An 8-crate Rust workspace (46K+ LoC, 494 tests, 12 fuzz targets): F3 H100 pilot caught a planted dev-set memorizer (0 false promotions), Tier-B challenge hit 2.84× speedup, and cross-family concept steering hit 87.5%—while proving plain text still beats latent vectors (71–77% vs 61–68%).',
    notShown:
      'Commons v0 runs on one relay rather than a multi-operator BFT network; on git 2.43.0 one hostile-bundle import edge case remains open and documented; F3 GPU pilot rejected all 7 noisy candidates and caught 1 planted cheat, so a positive GPU promotion at scale is still ahead.',
    results: [
      { value: '2.84×', label: 'Tier-B cumulative speedup over pinned baseline, 6/6 receipts re-verified' },
      { value: '1 caught', label: 'planted dev-set memorizer rejected on H100 (+0.866 dev, 2.20+ holdout bpb)' },
      { value: '87.5%', label: 'Qwen3-8B → OLMo-2-7B concept transfer (140/160, 1/72 control FP)' },
      { value: '71–77% vs 61–68%', label: 'plain text word beats latent vector on matched comparison' },
    ],
    install: [
      {
        label: 'Rust',
        note: '8-crate Rust workspace + MCP server (13 tools)',
        command: `git clone --branch v0.3.2 ${GH}/playbox.git && cd playbox && cargo build --release`,
      },
      {
        label: 'Source',
        command: `curl -L ${GH}/playbox/archive/refs/tags/v0.3.2.tar.gz | tar xz`,
      },
    ],
    reproduce: 'cargo test --workspace && python3 scripts/verify_claims.py',
    usage: [
      {
        title: 'Re-verify the F3 H100 sealed-holdout receipts',
        note: 'Checks Ed25519 signatures, holdout bpb ceilings, and rejection of the memorizer.',
        code: 'cat docs/f3/pilot/verify.txt && python3 scripts/verify_claims.py',
      },
    ],
    limits: [
      'Self-audit (`docs/audit-claims.md`) classified 79 historical doc claims and retracted an early KV-hybrid throughput number that failed a matched control.',
      'Hardware T3 attestation proves the confidential VM image, not behavioral alignment of the agent inside it.',
    ],
    docs: [
      { label: 'Claims self-audit', path: 'blob/main/docs/audit-claims.md' },
      { label: 'F3 H100 pilot', path: 'blob/main/docs/f3/pilot/README.md' },
      { label: 'Latent steering', path: 'blob/main/docs/steering.md' },
      { label: 'README', path: '#readme' },
    ],
  },
  {
    slug: 'formasec',
    category: 'security',
    name: 'FormaSec',
    repo: 'formasec',
    releaseLabel: 'main (62 commits)',
    tagline: 'Certified composition: untrusted LLM and enumerator proposers gated by a Python, Rust, Lean 4, and Kani kernel.',
    question:
      'Can untrusted proposers (enumerators, Bend, or free LLMs) synthesize multi-step compositions while a tiny verified kernel and Landlock executor guarantee zero unsafe admissions?',
    headline:
      'Python and Rust kernels produce byte-identical receipts across 135 full admission cases and agree with Lean 4 across 600 structural cases, recording 0 unsafe admissions across 552 hostile proposals, 75 mutants, and 7 live LLMs.',
    notShown:
      'Trusts Z3 and cvc5 not to fail identically on T3z obligations (solver proof objects are outside the TCB); replay is single-author MachineReplay rather than independent third-party audit; Bend parallel search gave no speedup (timed out at depth 3).',
    results: [
      { value: '0 / 552', label: 'unsafe admissions in hostile proposer sessions (plus 7 live LLMs)' },
      { value: '135 / 135', label: 'byte-identical Python vs Rust full admission cases (37 admitted)' },
      { value: '600 / 600', label: 'Python, Rust (Kani), and Lean 4 (`admitAlg`, `plan_sound`) structural agreements' },
      { value: '75 mutants', label: '0 false accepts, 0 false rejects; disabling hash/cert checks trips meta-test' },
    ],
    install: [
      {
        label: 'Git',
        note: 'Rust kernel + Python reference checker + Lean 4 proofs',
        command: `git clone ${GH}/formasec.git && cd formasec`,
      },
      {
        label: 'Source',
        command: `curl -L ${GH}/formasec/archive/refs/heads/main.tar.gz | tar xz`,
      },
    ],
    reproduce: 'cargo test --manifest-path kernel/Cargo.toml && pytest search/tests',
    usage: [
      {
        title: 'Run the M1 mutant & receipt-attack suite',
        note: 'Verifies 0 false accepts across 75 spec mutants and 11 ledger/receipt tamper vectors.',
        code: 'pytest search/tests/test_m1.py',
      },
      {
        title: 'Build the Rust production kernel',
        note: 'Pure decision core checked with Kani; Linux execution isolated with Landlock.',
        code: 'cargo test --manifest-path kernel/Cargo.toml',
      },
    ],
    limits: [
      'A hostile proposer discovered a 2^n-path DAG that exhausted 14 GB RAM before node/path caps were added (`DESIGN.md` §23).',
      'Bend GPU/parallel enumerator was slower than Python at depths 1–2 and timed out at 240 s on depth 3 (10.2M candidates).',
    ],
    docs: [
      { label: 'DESIGN.md', path: 'blob/main/DESIGN.md' },
      { label: 'SOUNDNESS.md', path: 'blob/main/SOUNDNESS.md' },
      { label: 'README', path: '#readme' },
    ],
  },
  {
    slug: 'security-alignment-os',
    category: 'security',
    name: 'Security Alignment OS',
    repo: 'security-alignment-os-maintenance',
    releaseLabel: TAG,
    tagline: 'An agent should have to earn every action.',
    question:
      'Can an agent’s proposal-to-rollback loop be built so an untrusted proposal acts only through evidence, deterministic admission, a single-use capability, a separate broker and a sandbox?',
    headline:
      'A Rust reference implementation with an adversarial runner that attacks the broker directly, plus one attested 20-scenario run on a TDX confidential-compute instance.',
    notShown:
      'No model runs in the loop. The attested run is a reproduction, not an independent replication.',
    results: [
      { value: '279 / 279', label: 'tests passing' },
      { value: '20 / 20', label: 'attested scenarios, one host' },
      { value: '0', label: 'independent replications so far' },
    ],
    install: [
      {
        label: 'Rust',
        command: `cargo add security-alignment-os --git ${GH}/security-alignment-os-maintenance --tag ${TAG}`,
      },
      {
        label: 'Source',
        command: `curl -L ${GH}/security-alignment-os-maintenance/archive/refs/tags/${TAG}.tar.gz | tar xz`,
      },
    ],
    reproduce: 'cargo test --all-targets',
    usage: [
      {
        title: 'Run the local control-loop demo',
        note: 'Prints a JSON decision with digests and the claim ceiling.',
        code: 'cargo run --bin local_demo',
      },
      {
        title: 'Run the attack tests',
        note: 'Run only the replay-rejection tests; try `escape` or `forged` to select path-escape and forged-state tests.',
        code: 'cargo test replay',
      },
    ],
    limits: [
      'Persisted state is plaintext; digests catch accidents, not a determined attacker.',
      'No protection against a hostile process under the same user ID.',
      'The Linux sandbox backend was compile-checked on x86_64 only.',
    ],
    docs: [
      { label: 'RESEARCH.md', path: 'blob/main/RESEARCH.md' },
      { label: 'README', path: '#readme' },
    ],
  },
  {
    slug: 'hyperintel',
    category: 'security',
    name: 'HyperIntel',
    repo: 'HyperIntel',
    releaseLabel: TAG,
    tagline: 'Inference routing and settlement that can be checked offline.',
    question:
      'Can a policy-compliant, evidence-carrying inference marketplace be deterministic, replayable and fail closed before any network, wallet or real money exists?',
    headline:
      'Receipts verify offline against a separate trust registry, replay protection uses a durable compare-and-swap, and one routing property is machine-checked with Z3 and bound to the source hash.',
    notShown:
      'No live market, no real settlement, and no confidentiality claim: the replay store is a local unencrypted file.',
    results: [
      { value: '115 passed', label: '0 failed, 2 ignored' },
      { value: '13 crates', label: 'Rust workspace' },
      { value: 'Z3 4.15.0', label: 'router property, bound to SHA-256' },
    ],
    install: [
      {
        label: 'Rust CLI',
        note: 'offline evidence verifier; uses the pinned toolchain',
        command: `cargo install --git ${GH}/HyperIntel --tag ${TAG} hyperintel-cli`,
      },
      {
        label: 'Source',
        command: `curl -L ${GH}/HyperIntel/archive/refs/tags/${TAG}.tar.gz | tar xz`,
      },
    ],
    reproduce: 'tools/pinned-cargo test --workspace -- --skip contract_policy_non_widening',
    usage: [
      {
        title: 'Verify an evidence bundle offline',
        note: 'Checks a receipt against a trust registry you supply. No operator call. Fixtures ship in the repo.',
        code: `f=crates/hyperintel-cli/tests/fixtures
hyperintel-cli $f/evidence-v4.json $f/trusted-keys-v4.json
# verified market evidence bundle 0539...
hyperintel-cli $f/evidence-v4.json $f/empty-trusted-keys.json
# verification failed: not an exact caller-trusted key`,
      },
    ],
    limits: [
      'The Z3 check covers a two-candidate abstraction of the router, not the full system.',
      'Journal and replay store are separate databases; cross-database atomicity is not claimed.',
    ],
    docs: [
      { label: 'RESEARCH.md', path: 'blob/main/RESEARCH.md' },
      { label: 'README', path: '#readme' },
    ],
  },
  {
    slug: 'composed-zk-benchmark-os',
    category: 'security',
    name: 'Composed ZK Benchmark OS',
    repo: 'composed-zk-benchmark-os',
    releaseLabel: TAG,
    tagline: 'A ZK benchmark that starts from meaning, and a long record of honest stops.',
    question:
      'Can a zero-knowledge benchmark start from program semantics, so a fast backend that accepts an invalid trace scores worse than a slow one that rejects it?',
    headline:
      'Nine workload families, 14 adversarial mutation classes, and claim ceilings enforced by the ledger. Interpretability and continual-learning negatives are summarized in FINDINGS.md.',
    notShown:
      'No official benchmark result, no backend performance claim, and no proof of the Rust source. Everything is Level 1, local.',
    results: [
      { value: '9 families', label: 'semantic workloads' },
      { value: '14 classes', label: 'adversarial mutations' },
      { value: '~80 phases', label: 'Aeneas attempts, no kernel-checked witness' },
    ],
    install: [
      {
        label: 'Rust',
        command: `cargo add zkbench-core --git ${GH}/composed-zk-benchmark-os --tag ${TAG}`,
      },
      {
        label: 'Source',
        command: `curl -L ${GH}/composed-zk-benchmark-os/archive/refs/tags/${TAG}.tar.gz | tar xz`,
      },
    ],
    reproduce: 'cargo test --workspace',
    usage: [
      {
        title: 'Run only the adversarial mutation tests',
        note: 'Selects the tests that mutate a valid trace and expect rejection.',
        code: 'cargo test -p zkbench-core mutat',
      },
    ],
    limits: [
      'A very long implementation log; read FINDINGS.md first.',
      'Raw model traces for the interpretability work are held in owner-only custody.',
    ],
    custody:
      'Items that do not need custody replay with cargo test. Custody-dependent results are marked in RESEARCH.md.',
    docs: [
      { label: 'FINDINGS.md', path: 'blob/master/FINDINGS.md' },
      { label: 'RESEARCH.md', path: 'blob/master/RESEARCH.md' },
    ],
  },
  {
    slug: 'mech-interp-unified',
    category: 'interpretability',
    name: 'Mechanistic Interpretability Unified',
    repo: 'mech-interp-unified',
    releaseLabel: 'main (R1–R6, F1, F2 + jspace-pilot)',
    tagline: 'Cross-family causal neuron gates, norm-matched subspace equivalence, and planted-flaw audits of interpretability instruments.',
    question:
      'Do small, intervention-selected neuron sets or Jacobian subspaces carry behavior causally across model families and norm-matched PCA controls—and can standard auditors catch planted instrument flaws?',
    headline:
      'Selected agreement units replicate out of family on Qwen3-1.7B-Base (1.437 vs 0.044 control max, p = 0.000999) and Pythia-2.8B; J-space ablation is equivalent to norm-matched PCA across OLMo-2-7B & Tulu-3 (0.00 [−0.05, +0.05]); and F2 planted-flaw audits show static rules catch 0/8 flaws and a probe battery catches 3/8 in-sample (0/3 new out-of-sample flaws).',
    notShown:
      'Selected unit sets are necessary and partly sufficient rather than exhaustive circuits, and raw index selection shifts with device/dtype (`V60`); J-space ablation efficiency plateaued near 0.50–0.55 even after a 1,000-prompt lens refit; F2 Phase 2 auditors caught 0/3 out-of-sample flaws.',
    results: [
      { value: '0/8 · 3/8 (0/3 OOS)', label: 'planted flaws caught in F2 (rules 0/8, probe battery 3/8 in-sample, 0/3 out-of-sample)' },
      { value: '1.437 vs 0.044', label: 'Qwen3-1.7B-Base R6 selected vs matched-random max (p = 0.000999)' },
      { value: '0.00 [−0.05, 0.05]', label: 'OLMo-2-7B DPO J-space gap vs norm-matched PCA (11/12 runs within ±0.2)' },
      { value: '0.650', label: 'R5b superposition audit TPR (0.30 on diffuse superposition, 0.000 FPR)' },
    ],
    install: [
      {
        label: 'Git',
        note: 'Includes Lean 4.30 neuron-gate proofs, F2 planted-flaw verifier, and F1 transfer bench',
        command: `git clone ${GH}/mech-interp-unified.git && cd mech-interp-unified`,
      },
      {
        label: 'J-Space Pilot',
        note: 'Companion OLMo-2 / Tulu-3 norm-matched PCA gate in patelshaan-lab',
        command: `git clone ${GH}/patelshaan-lab.git && cd patelshaan-lab/jspace-pilot`,
      },
    ],
    reproduce: 'python3 -m audit.verify && pytest -q',
    usage: [
      {
        title: 'Verify the 200-seed F2 planted-flaw audit verdicts',
        note: 'Checks `audit/results/f2_phase1.json` across all 8 flaw classes and 3 auditors.',
        code: 'python3 -m audit.verify',
      },
      {
        title: 'Run J-space golden-prompt and linear-algebra checks',
        note: 'Verifies deterministic prompt SHA-256 hashes and orthonormal pursuit projections.',
        code: 'cd ../patelshaan-lab && ./scripts/check',
      },
    ],
    limits: [
      'A3 probe battery in F2 was written after enumerating the 8 flaw classes, making 3/8 an upper bound until tested on held-out flaws.',
      'Pythia-1.4B failed the frozen 0.5-logit floor (`V55 InstrumentNotValid`), showing causal concentration is scale-dependent.',
      'J-space tests one behavior family (valence/exit) and one A–B logit-margin readout at 7B.',
    ],
    docs: [
      { label: 'Synthesis INDEX.md', path: 'blob/main/docs/INDEX.md' },
      { label: 'R6 Qwen3 result', path: 'blob/main/docs/protocols/R6-result.md' },
      { label: 'F2 Audit REPORT.md', path: 'blob/main/audit/REPORT.md' },
      { label: 'README', path: '#readme' },
    ],
  },
  {
    slug: 'temporal-grid-safety',
    category: 'interpretability',
    name: 'Temporal Grid Safety',
    repo: 'temporal-grid-safety',
    releaseLabel: 'main (v1–v32)',
    tagline: 'Safety properties under fine-tuning: a self-caught attacker confound, and frozen discriminant adapters that survive benign drift.',
    question:
      'Can slow-update parameter groups or frozen discriminant adapters keep a language model’s refusal behavior intact through benign or adversarial fine-tuning?',
    headline:
      'After catching a v16 confound where the attacker inherited defender learning rates (erasing an apparent +0.41 to +1.00 win), v29/v30 found a genuine positive: frozen discriminant adapters keep held-out refusals at 0.95 vs 0.27 for replay on OLMo-2-7B, and 0.96 vs 0.20 across Qwen3-8B and Mistral-7B.',
    notShown:
      'Not a defense against a determined adaptive fine-tuning attacker (delays Qwen3-8B 3.7–6×, fails on Mistral-7B, broken by 64 steps); current runs use LoRA updates, 6–20 seeds, and exact-match refusal proxies.',
    results: [
      { value: '0.95 vs 0.27', label: 'OLMo-2-7B held-out refusal retention, discriminant adapter vs replay (n = 6)' },
      { value: '0.96 vs 0.20', label: 'held-out harmful-keyword refusal retention on Qwen3-8B & Mistral-7B' },
      { value: '+0.05 AUC (ns)', label: 'pooled slow-grid effect under an identical fair attacker (CI spans 0, v20)' },
      { value: '3.7–6× delay', label: 'temporary slowdown of LoRA attacker on Qwen3-8B before 64-step break' },
    ],
    install: [
      {
        label: 'Git',
        note: 'PyTorch + HuggingFace PEFT/Transformers harnesses (v1–v32)',
        command: `git clone ${GH}/temporal-grid-safety.git && cd temporal-grid-safety`,
      },
      {
        label: 'Source',
        command: `curl -L ${GH}/temporal-grid-safety/archive/refs/heads/main.tar.gz | tar xz`,
      },
    ],
    reproduce: 'cat results_v20.txt && cat out30/olmo_refuse.combine.txt',
    usage: [
      {
        title: 'Inspect the v30 OLMo-2 benign-drift retention summary',
        note: 'Compares frozen discriminant adapters against free SFT and replay across in-distribution and held-out refusals.',
        code: 'cat out30/olmo_refuse.combine.txt',
      },
    ],
    limits: [
      'Sample sizes are 6 to 20 seeds per cell; full-weight fine-tuning and calibrated multi-judge refusal scoring (`v32` AdvBench/HarmBench/GSM8K harness) are prepared next.',
      'Protects against accidental benign-drift erosion, not weight-access white-box removal.',
    ],
    docs: [
      { label: 'REPORT.md', path: 'blob/main/REPORT.md' },
      { label: 'RECIPE.md', path: 'blob/main/RECIPE.md' },
      { label: 'README', path: '#readme' },
    ],
  },
  {
    slug: 'theseus-lab',
    category: 'interpretability',
    name: 'Theseus Lab',
    repo: 'theseus-lab',
    releaseLabel: TAG,
    tagline: 'When a module is swapped, does behavior match while mechanism changes?',
    question:
      'When a learned module replaces part of a language model, does behavior match while the mechanism changes, and can mechanism claims survive a change of representation?',
    headline:
      'A function-preserving permutation changed 100% of selected positions and left behavior intact. Whole nonlinear-block replacement did not replicate under frozen gates.',
    notShown:
      'No interpretability method that works on whole blocks, and no independent retraining.',
    results: [
      { value: '100%', label: 'positions changed, behavior preserved (GPT-2)' },
      { value: '9 / 9', label: 'affine projection replacements, the one narrow positive' },
      { value: '0.88 to 0.89', label: 'Jacobian nRMSE in the V39 diagnosis' },
      { value: '9 / 9 vs 3 / 9', label: 'Band A affine replacements pass at 256+ natural-text prompts and mostly fail at 128: the failure is adaptation coverage. It replicates on news text (9 / 9 at 256 and 512)' },
      { value: 'FAIL by 1e-4', label: 'r6 natural-fit arms pass every per-case gate but miss the frozen equivalence check; r7 shows the misses are float32 rounding (float64 error about 1e-13). Recorded outcome stays FAIL.' },
      { value: '45 / 45 vs 0 / 3', label: 'r10 float64 gate: every positive case (all three Band A models, both corpora, Band B at 512) passes; the opt-6.7b N256 negative control still fails, narrowly (min cosine 0.887). Measures the instrument only: all earlier outcomes stand. One lineage gap open (manifest file hash).' },
      { value: '1 of 2', label: '7B models pass at 512 prompts: opt-6.7b yes, open_llama_7b fails the compositional stratum, a miss r8 traced to float32 resolution (float64 cosines 0.99+); recorded FAIL stands; the rows-per-width rule is falsified' },
    ],
    install: [
      {
        label: 'Source',
        note: 'A research harness, not a package',
        command: `curl -L ${GH}/theseus-lab/archive/refs/tags/${TAG}.tar.gz | tar xz && cd theseus-lab-* && pip install -r requirements.txt`,
      },
      {
        label: 'Git',
        command: `git clone --branch ${TAG} ${GH}/theseus-lab.git`,
      },
    ],
    reproduce: 'PYTHON=python3 scripts/run_public_tests.sh',
    usage: [
      {
        title: 'Run one experiment module',
        note: 'Each experiment ships with a frozen test module you can run on its own.',
        code: 'PYTHONPATH=. python -m unittest tests.test_replacement_loss_v8',
      },
    ],
    limits: [
      'Three modules need the owner’s frozen runtime pins or private custody and report SKIPPED-OWNER-ENV elsewhere.',
      'Many experiments are negative by design and are kept.',
      'The natural-text result now holds on two corpora (wikitext-2 and CNN/DailyMail news), but with 3 seeds, one projection, synthetic interventions, CPU float32 and a single owner; SmolLM2 predicts less well on news (cosine 0.98 versus 1.00).',
      'The safety-judge controls are template-built with owner-adopted labels; they say nothing about real harmful output.',
    ],
    custody:
      'Raw model outputs live in owner-only custody. Results that depend on them are marked in RESEARCH.md.',
    docs: [
      { label: 'RESEARCH.md', path: 'blob/main/RESEARCH.md' },
      { label: 'Protocol index (r2 to r7, Band B)', path: 'blob/main/docs/research-index.md' },
      { label: 'Band B diagnosis', path: 'blob/main/docs/bandb-open-llama-diagnosis.md' },
      { label: 'r7 logit-floor analysis', path: 'blob/main/docs/r7-logit-floor-analysis.md' },
      { label: 'README', path: '#readme' },
    ],
  },
  {
    slug: 'aligned-holistic-continual-learning',
    category: 'interpretability',
    name: 'Aligned Holistic Continual Learning',
    repo: 'aligned-holistic-continual-learning',
    releaseLabel: TAG,
    tagline: 'Can a monitor predict what a learning update will do before it ships?',
    question:
      'Can a fixed causal-feature monitor predict what a continual-learning update does to competence, calibration and policy compliance, with the base model locked?',
    headline:
      'The synthetic qualification passes every primary and control gate. The matched-progress comparison, which asks whether lower harm is just learning less, failed.',
    notShown:
      'Nothing model-backed. No model was run, so this qualifies the harness, not the hypothesis.',
    results: [
      { value: '0.830 to 0.900', label: 'assessment R² across four targets' },
      { value: '-0.27 to -0.51', label: 'shuffled-label control R²' },
      { value: 'Failed', label: 'matched-progress gate' },
    ],
    install: [
      {
        label: 'Python',
        note: 'Python 3.11+, no dependencies',
        command: `pip install "git+${GH}/aligned-holistic-continual-learning.git@${TAG}"`,
      },
      {
        label: 'Rust',
        note: 'admission kernel crate',
        command: `cargo add admission-core --git ${GH}/aligned-holistic-continual-learning --tag ${TAG}`,
      },
      {
        label: 'Source',
        command: `curl -L ${GH}/aligned-holistic-continual-learning/archive/refs/tags/${TAG}.tar.gz | tar xz`,
      },
    ],
    reproduce:
      'python -m ahcl.run --output result.json && python -m ahcl.validate result.json',
    usage: [
      {
        title: 'Gate your own result files (Python)',
        note: 'Refuse any monitor result that fails the schema, finiteness and gate checks.',
        code: `import json
from ahcl.validate import validate_result

validate_result(json.load(open("result.json")))  # raises ValidationError if invalid`,
      },
      {
        title: 'Quarantine by default (Rust)',
        note: 'A pure function: a candidate is admitted only at review, with independent, prediction-locked, held-out evidence.',
        code: `use admission_core::{evaluate, Candidate, Decision, Stage};

let decision = evaluate(&candidate);
assert!(matches!(decision, Decision::Quarantined | Decision::Admitted | Decision::Rejected));`,
      },
    ],
    limits: [
      'Synthetic task only; no model downloaded or run.',
      'The model-backed experiment is designed and closed pending review of its power analysis.',
    ],
    docs: [
      { label: 'RESEARCH.md', path: 'blob/main/RESEARCH.md' },
      { label: 'README', path: '#readme' },
    ],
  },
]
