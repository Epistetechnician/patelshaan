export type Figure =
  | { kind: 'replay' }
  | { kind: 'bars'; title: string; unit?: string; max: number; rows: { label: string; value: number; note?: string; tone?: 'good' | 'bad' | 'warn' }[]; caption: string }
  | { kind: 'compare'; items: { value: string; label: string; tone?: 'good' | 'bad' }[]; caption: string }
  | { kind: 'chips'; title: string; rows: { label: string; status: 'pass' | 'fail' | 'stop' | 'open'; note?: string }[]; caption: string }
  | { kind: 'matrix'; title: string; cols: string[]; rows: { label: string; cells: ('tie' | 'regress' | 'clear')[] }[]; caption: string }
  | { kind: 'flow'; title: string; steps: string[]; tail: string; caption: string }
  | { kind: 'ladder'; title: string; levels: string[]; at: number; caption: string }
  | { kind: 'demo'; id: string }
  | { kind: 'roadmap'; title: string; done: string[]; next: string[]; blocked: string[]; caption: string }
  | { kind: 'table'; title: string; head: string[]; rows: string[][]; caption: string }

export type Section = {
  title: string
  body: string[]
  aside?: string
  figures?: Figure[]
}

export type Source = { label: string; url: string; why: string }

export type Essay = {
  callout: string
  voice?: string[]
  sources?: Source[]
  sections: Section[]
}

export const essays: Record<string, Essay> = {
  'aligned-holistic-continual-learning': {
    callout:
      'A dashboard that correlates with harm but changes no decision protects no one. This project asks for a monitor that does both, and records where it does not.',
    sections: [
      {
        title: 'The question, stated so it can fail',
        body: [
          'A model that keeps learning without discipline forgets, drifts, and can quietly lose the behavior we valued. The thing we tested is not the thing that exists a week later.',
          'So the question is narrow. Can a fixed causal-feature monitor predict four consequences of an update (adaptation gain, retention harm, calibration harm, policy-violation harm) while the base model stays locked? It must also change the update policy and beat plain SGD, replay, EWC and behavioral guards on locked, held-out streams.',
        ],
        aside: 'The prediction is locked before assessment. Fit, tune and assessment steps are disjoint, so the monitor cannot be quietly retuned to the result.',
      },
      {
        title: 'What passed: the harness',
        body: [
          'A deterministic synthetic qualification passes every primary and control gate. Real labels clear the R² gate easily. Shuffled labels score negative on every target, as a control must. Toggle the panel above to see both.',
          'What this establishes is that the lifecycle works end to end: stream, interventions, lock, assessment, validator and a quarantining admission kernel, on a task where the answer is known by construction. It qualifies the harness, not the hypothesis. No model was downloaded.',
        ],
        figures: [
          {
            kind: 'bars',
            title: 'Assessment R² by target',
            max: 1,
            rows: [
              { label: 'Adaptation gain', value: 0.83, note: 'sign agreement 0.979', tone: 'good' },
              { label: 'Retention harm', value: 0.853, note: 'sign agreement 0.979', tone: 'good' },
              { label: 'Policy-violation harm', value: 0.83, note: 'sign agreement 0.979', tone: 'good' },
              { label: 'Calibration harm', value: 0.9, note: 'sign agreement 0.938', tone: 'good' },
            ],
            caption: 'Gate: R² of at least 0.25. Shuffled-label controls scored −0.27 to −0.51 against a ceiling of 0.20.',
          },
        ],
      },
      {
        title: 'What failed: matched progress',
        body: [
          'A five-seed replication froze disjoint fit, tune and assessment steps. The candidate policy beat its reference on aggregate protected harm, with a strict improvement on four seeds.',
          'Then I compared harm at matched progress: at cumulative incoming gain of 0.5, 1.0 and 1.5, using interpolation between observed checkpoints and never extrapolating. A seed passes only if the candidate is no worse at every target and strictly better at one.',
          'It failed. The lower unmatched harm was largely explained by the candidate also learning less. Comparing harm at the end of training rewards whichever method learned the least, so a continual-learning safety claim without a matched-progress comparison is not yet a claim.',
        ],
        figures: [
          {
            kind: 'matrix',
            title: 'Matched-progress gate, by seed',
            cols: ['gain 0.5', 'gain 1.0', 'gain 1.5'],
            rows: [
              { label: 'seed 17', cells: ['tie', 'tie', 'tie'] },
              { label: 'seed 19', cells: ['regress', 'clear', 'clear'] },
              { label: 'seed 23', cells: ['tie', 'tie', 'tie'] },
              { label: 'seed 29', cells: ['clear', 'regress', 'regress'] },
              { label: 'seed 31', cells: ['clear', 'clear', 'regress'] },
            ],
            caption: '“Clear” means no regression at that point; it is not a win. A seed passes only with no regression and a strict improvement somewhere. None did.',
          },
        ],
      },
      {
        title: 'Real models: a record of honest stops',
        body: [
          'Many lines in the real-model record are infrastructure failures, not scientific ones. I record them as stops. Folding a crashed run into “did not work” would be a false negative about the idea, just as hiding it would be a false positive.',
        ],
        figures: [
          {
            kind: 'chips',
            title: 'Run ledger',
            rows: [
              { label: 'BillSum V2, V3', status: 'stop', note: 'stopped before model load' },
              { label: 'BillSum V4', status: 'stop', note: 'wall-clock limit' },
              { label: 'BillSum V5', status: 'stop', note: 'out of memory' },
              { label: 'BillSum V6', status: 'stop', note: 'unexpected adapter file' },
              { label: 'BillSum V7', status: 'fail', note: 'completed; missed selected-vs-random ROUGE-L gate (NoCandidate)' },
              { label: 'Plasticity recovery V1, V2', status: 'fail', note: 'NoCandidate; mechanism family closed' },
              { label: 'Recursive policy V2', status: 'fail', note: '64-case campaign; recursive selection lost to random' },
              { label: 'Oak Lab V2', status: 'fail', note: 'four real panels, power 0.8074; no algorithm passed' },
              { label: 'Integrated model-backed run', status: 'open', note: 'designed; held closed pending review of a Holm joint-power question' },
            ],
            caption: 'pass, fail (scientific), stop (infrastructure), open.',
          },
        ],
      },
    ],
  },

  'theseus-lab': {
    callout:
      'If the same behavior can sit on top of a different mechanism, then a passing behavioral test tells you little about what a system is doing or whether it will keep doing it.',
    sections: [
      {
        title: 'Behavior and mechanism come apart',
        body: [
          'In a deterministic state machine, a structural split keeps visible and held-out behavior at 1.0 while mechanism continuity falls to 0.4167. A replacement that matches visible probes can fail held-out probes, so visible equivalence can be a probe-coverage artifact.',
        ],
        figures: [
          {
            kind: 'bars',
            title: 'After a structural split',
            max: 1,
            rows: [
              { label: 'Visible behavior', value: 1, tone: 'good' },
              { label: 'Held-out behavior', value: 1, tone: 'good' },
              { label: 'Mechanism continuity', value: 0.4167, tone: 'bad' },
            ],
            caption: 'Same behavior, different mechanism. The state machine is deterministic and the numbers are exact.',
          },
        ],
      },
      {
        title: 'Labels and positions are not causal identity',
        body: [
          'In GPT-2, a function-preserving MLP permutation changed 100% of the selected positions yet preserved top-1 behavior, with a mean relative logit error of 3e-7. The same-label ablation then looked unrelated. The inverse-mapped ablation matched.',
          'So a mechanism claim has to be representation-relative. A PyTorch and Transformers reference matched the NumPy implementation to 4.9e-7, and 48 permutation cases passed.',
        ],
        figures: [
          {
            kind: 'compare',
            items: [
              { value: '−0.983', label: 'cosine, same-label ablation after permutation', tone: 'bad' },
              { value: '0.9999996', label: 'cosine, inverse-mapped ablation', tone: 'good' },
            ],
            caption: 'The same intervention, read in two coordinate systems. Only one of them tracks the mechanism.',
          },
        ],
      },
      {
        title: 'What replaced cleanly, and what did not',
        body: [
          'Exact structural replacement is easy; learned replacement is hard. Splitting a trained MLP channel into two children (exact algebra) passed 6 of 6 across OPT-125M and SmolLM2-135M, with all 12 wrong-source and random controls failing as required. That is a constructed positive control, not independent retraining.',
          'Only one narrow learned replacement worked: an independently fitted affine output projection reproduced in 9 of 9 fresh checkpoint-by-seed cases. Whole nonlinear blocks did not replicate under the frozen gates.',
        ],
        figures: [
          {
            kind: 'chips',
            title: 'Replacement ledger',
            rows: [
              { label: 'Exact channel split', status: 'pass', note: '6 / 6 models; 12 / 12 controls failed as required' },
              { label: 'V8 affine output projection', status: 'pass', note: '9 / 9 fresh cases; strongest bounded positive' },
              { label: 'V28 repeat on fresh targets', status: 'fail', note: 'treatment held; frozen numeric-tolerance control gate failed' },
              { label: 'V16 whole-MLP replacement', status: 'fail', note: 'high activation similarity, causal prediction failed 9 / 9' },
              { label: 'V17, V18 causal objectives', status: 'fail', note: 'behavior kept; module and downstream-effect gates failed' },
              { label: 'V14 absolute retention', status: 'fail', note: '0 / 12 despite relative gains over affine' },
              { label: 'V31 target indispensability', status: 'fail', note: 'random and zero blocks kept 100% accuracy' },
              { label: 'V9 ladder', status: 'fail', note: '21 / 27 stages passed; overall FAIL' },
            ],
            caption: 'V31 matters most: if a zero block keeps 100% accuracy, the target was never behaviorally indispensable and the test could not have failed.',
          },
        ],
      },
      {
        title: 'Diagnosing the V39 failure',
        body: [
          'Adaptation-only diagnostics found that the fitted module matches values but not local derivatives, with large error even along the training directions. The module learns where the function is, not how it bends. That is derivative underfitting.',
          'A later check found that final-token-only fitting leaves prefix positions badly fit (nRMSE 0.40 to 0.67 against 0.014 to 0.020).',
        ],
        figures: [
          {
            kind: 'bars',
            title: 'Normalized RMSE of the fitted module',
            max: 1,
            unit: 'nRMSE',
            rows: [
              { label: 'Values', value: 0.11, note: 'about 0.10 to 0.12', tone: 'good' },
              { label: 'Jacobian (local derivatives)', value: 0.885, note: '0.88 to 0.89', tone: 'bad' },
              { label: 'Along training directions', value: 0.86, note: '0.83 to 0.89', tone: 'bad' },
            ],
            caption: 'Bars show the midpoint of each reported range.',
          },
        ],
      },
      {
        title: 'A measurement-validity result',
        body: [
          'A lexical refusal proxy matched 145 of 939 Qwen responses (15.4%, Wilson 95% CI 13.3 to 17.9%) against a 90% target. A separate assessor scored 53.6% effective safe (CI 50.4 to 56.7%) on the harmful set and flagged 62% of benign contrast prompts unsafe.',
          'Both locked targets failed, and the two instruments do not give a calibrated verdict. A second independent evaluator is blocked, so no alignment conclusion follows. The finding is about the measuring instrument.',
        ],
        figures: [
          {
            kind: 'compare',
            items: [
              { value: '15.4%', label: 'lexical proxy, matched', tone: 'bad' },
              { value: '53.6%', label: 'assessor, effective safe', tone: 'bad' },
              { value: '62%', label: 'benign prompts flagged unsafe', tone: 'bad' },
            ],
            caption: 'Same outputs, different graders, no agreement.',
          },
        ],
      },
    ],
  },

  'security-alignment-os': {
    callout:
      'The usual way to make an agent safe is to prompt it carefully and hope. This is the opposite: an agent earns every action by passing through evidence, admission, a single-use capability, a broker and a sandbox.',
    sections: [
      {
        title: 'The loop',
        body: [
          'The question is whether the proposal-to-rollback loop can be built so that an untrusted proposal can act only through exact-subject evidence, deterministic admission, a single-use kernel-bound capability, a separate capability broker and a sandboxed operation, with every step replayable and every failure closing to freeze or rollback.',
          'The person affected by an agent’s action should be able to ask what exactly happened and who allowed it, and get an answer that does not depend on trusting the agent. No model runs in the loop. The point was to get the control plane right first, so the boundary does not depend on the model behaving.',
        ],
        figures: [
          {
            kind: 'flow',
            title: 'Proposal to receipt',
            steps: ['Untrusted proposal', 'Evidence review', 'Deterministic admission', 'Single-use capability', 'Separate broker process', 'Sandboxed operation', 'Signed receipt'],
            tail: 'Any failure closes to freeze or rollback.',
            caption: 'The maintenance evaluator checks patch structure in its own sandboxed process and never executes candidate code.',
          },
        ],
      },
      {
        title: 'What the tests say',
        body: [
          'The suite passes 279 tests with none failing, including an adversarial runner that attacks the broker directly: path escape, replay, forged receipts, malformed child operations and telemetry containment. The grid above is a real run; amber cells are tests whose names say adversarial, replay, forged or escape.',
          'The kernel is small and replayable. Policy, budgets, single-use execution, lifecycle, journaling, an independent checker and signed receipts compose without a shared trusted component beyond the caller-owned policy and clock.',
        ],
        aside: 'Try it: `cargo test replay` runs only the replay-rejection tests.',
      },
      {
        title: 'One attested run',
        body: [
          'One execution on a Google Confidential Space Intel TDX instance passed all 20 required scenarios. The signed attestation verified every field below. This is a machine-attested reproduction. It is not an independent replication, and that gate stays inconclusive until a second, separately administered host runs it.',
        ],
        figures: [
          {
            kind: 'table',
            title: 'What the attestation covered',
            head: ['Verified', 'Note'],
            rows: [
              ['Nonce, issuer, audience', 'freshness and binding'],
              ['TDX model, Secure Boot, debug disabled', 'hardware state'],
              ['Intel TCB', 'platform trust'],
              ['Immutable image digest, source revision', 'what code ran'],
              ['Instance, project, zone, service account', 'where it ran'],
            ],
            caption: 'Newer packet versions also bind the broker executable digest and the per-host runner digest into signed reports. Older packets stay verifiable under their original identities.',
          },
        ],
      },
      {
        title: 'Gaps I am not hiding',
        body: [
          'Persisted state is plaintext, so digests catch accidents, not an attacker who can rewrite both content and digest. There is no protection against a hostile process under the same user ID. The confidential-compute runner prints its attestation token to standard output and must not be launched outside a controlled test. The Linux sandbox backend was compile-checked on x86_64 only.',
        ],
        figures: [
          {
            kind: 'chips',
            title: 'Open gates',
            rows: [
              { label: 'Independent replication, second host', status: 'open' },
              { label: 'Encrypted persisted state', status: 'open' },
              { label: 'Isolation from a same-user hostile process', status: 'open' },
              { label: 'Linux sandbox tested beyond compile-check', status: 'open' },
            ],
            caption: 'None of these is claimed.',
          },
        ],
      },
    ],
  },

  'composed-zk-benchmark-os': {
    callout:
      'A fast backend that accepts a mutated, invalid trace is worse than a slow one that rejects it, and a speed leaderboard hides the difference. This project starts from meaning instead.',
    sections: [
      {
        title: 'Claims with ceilings',
        body: [
          'Progress is measured in claims, and each claim is bound to an exact state slice, a protocol, a custody identity, an independent validation path and a ceiling. Models may propose evidence; they cannot approve it, widen their own capabilities, modify the evaluator or promote an update.',
          'A benchmark pass is not a proof, a local replay is not official benchmark evidence, and a recursion proof is not semantic proof. Everything in this repository sits at Level 1.',
        ],
        figures: [
          {
            kind: 'ladder',
            title: 'Claim ladder',
            levels: ['0 design note', '1 local replay', '2', '3', '4', '5', '6 independently reproduced'],
            at: 1,
            caption: 'Level 1: local, deterministic infrastructure. No official external benchmark, backend performance claim or Level 2+ evidence exists.',
          },
        ],
      },
      {
        title: 'A benchmark that starts from meaning',
        body: [
          'Most ZK benchmarks compare known circuits. This one starts from semantics: state machines, transitions, guards, loops, invariants and expected accept or reject outcomes. It generates workloads across nine families, applies 14 classes of adversarial mutation with expected verdicts, replays them locally and scores performance separately from soundness evidence.',
          'An oracle-completeness audit and a distinguishability matrix show which generated constructs the shipped oracle can and cannot evaluate. I count that as a feature.',
        ],
        figures: [
          {
            kind: 'compare',
            items: [
              { value: '9', label: 'workload families' },
              { value: '14', label: 'adversarial mutation classes' },
              { value: '1107', label: 'core tests in the replay above' },
            ],
            caption: 'The amber cells in the replay are tests with “mutat” in the name.',
          },
        ],
      },
      {
        title: 'The formal ladder, and what it refuses to claim',
        body: [
          'There is one real local Z3 unsat result for a tiny digest-binding obligation. An implementation-diverse checker agreed on a golden vector, 18 mutations, opposite set orders and 256 generated cases. A Lean kernel-checked theorem covers a handwritten model of the checker. None of that proves the Rust source or the hash function.',
          'I also tried Rust-to-Lean extraction with Aeneas across roughly 80 phases. Extraction ran, but no complete kernel-checked witness resulted. The attempts ended in tooling, environment and execution-protocol stops, each recorded and cleaned up. The lasting product was a fail-closed execution state machine and a 102-command source ledger that make such attempts auditable.',
        ],
        figures: [
          {
            kind: 'chips',
            title: 'Formal evidence',
            rows: [
              { label: 'Z3 digest-binding obligation', status: 'pass', note: 'unsat, tiny obligation' },
              { label: 'Diverse checker', status: 'pass', note: 'golden vector, 18 mutations, 256 cases' },
              { label: 'Lean theorem over handwritten model', status: 'pass', note: 'kernel-checked; model only' },
              { label: 'Aeneas extraction, ~80 phases', status: 'stop', note: 'no complete kernel-checked witness' },
              { label: 'Proof of the Rust source', status: 'open' },
            ],
            caption: 'Protocol discipline dominated cost. The accepted-evidence path still blocks formal claims it has not earned.',
          },
        ],
      },
      {
        title: 'Interpretability: one narrow positive, then terminal negatives',
        body: [
          'Gemma 3 V4 trace qualification passed, with pooled NMSE of 0.0457 against a 0.05 gate, and parity, repeat, no-op, intervention reach, event replay and feature stability all passing. It is a measurement qualification for one model, runtime and asset set, not a causal-graph result.',
          'Gemma causal-feature-effects V2 failed on tune sign agreement (0.75 against 0.80), one Holm gate failed, and the held-out split was never opened. Astral V42 to V46 and V48 all ended NoCandidate. The program stopped instead of searching more layers, wrappers or corpora.',
        ],
        figures: [
          {
            kind: 'bars',
            title: 'Gate versus result',
            max: 1,
            rows: [
              { label: 'Gemma 3 V4 NMSE (lower is better; gate 0.05)', value: 0.0457, tone: 'good' },
              { label: 'Gemma causal V2 sign agreement (gate 0.80)', value: 0.75, tone: 'bad' },
            ],
            caption: 'The V4 gate was met; the V2 gate was not, and the held-out split stayed closed.',
          },
        ],
        aside: 'The continual-learning and interpretability negatives are collected in FINDINGS.md.',
      },
    ],
  },

  hyperintel: {
    callout:
      'Can an inference marketplace be deterministic, replayable and fail closed before any network, wallet or real money exists? The point is that anyone can check a receipt without calling the operator.',
    sections: [
      {
        title: 'Route to settlement, deterministically',
        body: [
          'A complete route-to-settlement-intent loop can be fully deterministic. Route, usage, settlement and evidence identities are derived, so tampering with route, metering, settlement or evidence is rejected offline against a separately supplied trust registry.',
          'Routing optimizes the buyer’s expected successful cost, not platform revenue. Provider price and platform fee are separate signed fields, and hidden spread is prohibited by the economics contract.',
        ],
        figures: [
          {
            kind: 'flow',
            title: 'Evidence chain',
            steps: ['Signed capacity offer', 'Eligibility and routing', 'Authenticated admission', 'Execution harness', 'Metering', 'Settlement intent', 'Offline-verifiable bundle'],
            tail: 'A verifier needs only the bundle and a trust registry it supplies.',
            caption: 'The CLI verifies bundles from V1 to V4. Try it with the fixtures in the repository.',
          },
        ],
      },
      {
        title: 'Replay protection and crash states',
        body: [
          'Replay protection needs a durable compare-and-swap, not just a nonce. The SQLite store registers an exact initial state and advances it atomically. Exact retries are idempotent and a competing writer is rejected as stale.',
          'Crash states must be classified, not resumed. A consumed admission with no terminal record fails closed and demands a fresh authenticated nonce or operator reconciliation. Resuming silently is how an agent ends up acting twice. The journal and replay store are separate databases, so cross-database atomicity is explicitly not claimed.',
        ],
        figures: [
          {
            kind: 'table',
            title: 'What the store does',
            head: ['Situation', 'Outcome'],
            rows: [
              ['Exact retry of an advance', 'idempotent; same result'],
              ['Competing writer', 'rejected as stale'],
              ['Consumed admission, no terminal record', 'fails closed; needs a fresh nonce or reconciliation'],
              ['Tampered route, usage, settlement or evidence', 'rejected offline'],
            ],
            caption: 'Each row is exercised by a test in the workspace.',
          },
        ],
      },
      {
        title: 'Prove the narrow thing',
        body: [
          'With Z3 4.15.0, a two-candidate abstraction of the router cannot select an ineligible offer (unsat), and a deliberately weakened selector can (sat). The check is bound to the SHA-256 of the routing source, because a proof about a file that has since changed proves nothing.',
        ],
        figures: [
          {
            kind: 'compare',
            items: [
              { value: 'unsat', label: 'real router abstraction: ineligible offer cannot be selected', tone: 'good' },
              { value: 'sat', label: 'deliberately weakened selector: it can', tone: 'bad' },
            ],
            caption: 'The pair matters: the weakened selector shows the check can fail.',
          },
        ],
      },
      {
        title: 'What is and is not verified',
        body: [
          'The local gate passes 115 tests with 0 failures and 2 ignored. The two ignored tests cover the provider-agent journal wrapper under concurrency and crash recovery. They were failing at the release-staging snapshot, are marked ignored with that reason, and should be treated as unverified until they pass.',
          'The replay store is a local file that is not encrypted, replicated or tenant-isolated, and the harness makes no confidentiality or no-retention claim. There is no live market and no real settlement.',
        ],
        figures: [
          {
            kind: 'chips',
            title: 'Test status',
            rows: [
              { label: 'Workspace gate', status: 'pass', note: '115 passed, 0 failed' },
              { label: 'Concurrent exact-retry wrapper test', status: 'open', note: 'ignored; unverified' },
              { label: 'Provider-agent terminal derivation test', status: 'open', note: 'ignored; unverified' },
              { label: 'Confidentiality of the replay store', status: 'open', note: 'not claimed' },
            ],
            caption: 'The ignored tests are named in RESEARCH.md.',
          },
        ],
      },
    ],
  },
}

export const romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']
