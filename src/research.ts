export type InstallTab = { label: string; note?: string; command: string }

export type ResearchRepo = {
  slug: string
  name: string
  repo: string
  tagline: string
  question: string
  headline: string
  notShown: string
  results: { value: string; label: string }[]
  install: InstallTab[]
  reproduce: string
  limits: string[]
  custody?: string
  docs: { label: string; path: string }[]
}

const GH = 'https://github.com/Epistetechnician'
const TAG = 'v0.1.0'

export const repoUrl = (repo: string) => `${GH}/${repo}`

export const researchRepos: ResearchRepo[] = [
  {
    slug: 'aligned-holistic-continual-learning',
    name: 'Aligned Holistic Continual Learning',
    repo: 'aligned-holistic-continual-learning',
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
    limits: [
      'Synthetic task only; no model downloaded or run.',
      'The model-backed experiment is designed and closed pending review of its power analysis.',
    ],
    docs: [
      { label: 'RESEARCH.md', path: 'blob/main/RESEARCH.md' },
      { label: 'README', path: '#readme' },
    ],
  },
  {
    slug: 'theseus-lab',
    name: 'Theseus Lab',
    repo: 'theseus-lab',
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
    limits: [
      'Three modules need the owner’s frozen runtime pins or private custody and report SKIPPED-OWNER-ENV elsewhere.',
      'Many experiments are negative by design and are kept.',
    ],
    custody:
      'Raw model outputs live in owner-only custody. Results that depend on them are marked in RESEARCH.md.',
    docs: [
      { label: 'RESEARCH.md', path: 'blob/main/RESEARCH.md' },
      { label: 'README', path: '#readme' },
    ],
  },
  {
    slug: 'security-alignment-os',
    name: 'Security Alignment OS',
    repo: 'security-alignment-os-maintenance',
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
    slug: 'composed-zk-benchmark-os',
    name: 'Composed ZK Benchmark OS',
    repo: 'composed-zk-benchmark-os',
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
    slug: 'hyperintel',
    name: 'HyperIntel',
    repo: 'HyperIntel',
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
    limits: [
      'The Z3 check covers a two-candidate abstraction of the router, not the full system.',
      'Journal and replay store are separate databases; cross-database atomicity is not claimed.',
    ],
    docs: [
      { label: 'RESEARCH.md', path: 'blob/main/RESEARCH.md' },
      { label: 'README', path: '#readme' },
    ],
  },
]
