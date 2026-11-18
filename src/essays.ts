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
  'holdout-ledger': {
    callout:
      'Every time a self-improvement loop asks a sealed holdout “did that help?”, a bit of the holdout enters the next proposal. This project prices those bits on a hash-chained ledger and certifies the cheaper of what the holdout leaked and what the final system took to describe.',
    sections: [
      {
        title: 'The problem: a sealed holdout still leaks',
        body: [
          'Hiding test examples inside an isolated process stops an agent from reading them directly. It does not stop adaptive overfitting. Across 1,024 one-bit queries, a proposer that keeps whatever clears the gate accumulates holdout noise, and the usual confidence interval treats the thousandth adaptive query as if it were the first.',
          'Holdout Ledger keeps a hash-chained record of every verdict bit released alongside the description length of the admitted artifact, then certifies a lower bound on true gain using the cheaper of the information route and the description route, with a compressible-core fallback when an incompressible patch is attached.',
        ],
        aside: 'All 9 hypotheses and thresholds were pre-registered in PREREG.md (commit recorded in PREREG_COMMIT) before the 200 confirmatory seeds ran.',
      },
      {
        title: '59,200 confirmatory runs, zero violations',
        body: [
          'Across 59,200 simulated runs, every one of the nine pre-registered hypotheses passed. Standard Wald bounds failed in 100% of patch-attacked runs and 54% of mixed runs. The ledger certificate violated true reserve gain 0 times in 59,200 (one-sided 95% upper bound 0.0001).',
          'Adding an online complexity-priced admission gate (`mdl`) blocked holdout-fitting patches entirely while keeping 94.4% of true honest gain, lifting certified gain from 0.098 to 0.152. Batching 64 candidates per verdict kept 98.6% of gain while billing 96 bits instead of 1,024.',
        ],
        figures: [
          {
            kind: 'table',
            title: 'Early regime (n = 20,000 holdout, 1,024 queries, 1-bit gate)',
            head: ['Proposer', 'Admitted gain', 'True reserve gain', 'Standard 95% Wald', 'Ledger bound'],
            rows: [
              ['Pool swaps (honest)', '0.229', '0.229', '0.223 (3% viol.)', '0.098 (0% viol.)'],
              ['Patch (holdout fitting)', '0.037', '0.006', '0.033 (100% wrong)', '−0.002 (no claim)'],
              ['Mixed proposer', '0.217', '0.211', '0.211 (54% wrong)', '0.112 (0% viol.)'],
              ['Mixed + MDL gate', '0.205', '0.205', '—', '0.152 (94.4% kept)'],
              ['Batch-64 (96 bits)', '0.226', '0.226', '—', '0.166 (98.6% kept)'],
            ],
            caption: 'At 1,024 one-bit queries the raw information route is vacuous (−0.038); the description route (~100 bits for swaps) carries the certificate, while core fallback strips patches.',
          },
        ],
      },
      {
        title: 'Where the certificate honestly certifies nothing',
        body: [
          'Hypothesis H6 tested the late regime: 15 ensemble members already tuned, where genuine remaining improvements are around 0.001. Even at n = 100,000 holdout examples, the ledger certifies 0.00. Saying where an instrument runs out of resolution is part of the result.',
          'Core Lean 4 proofs (`formal/HoldoutLedger.lean`, standard axioms only) verify the counting union bounds and monotonicity of the certificate, while treating the Hoeffding concentration inequality as an explicit hypothesis.',
        ],
        figures: [
          {
            kind: 'chips',
            title: 'Confirmatory ledger (H1–H9)',
            rows: [
              { label: 'H1–H3 calibration & attack sanity', status: 'pass', note: '0/59,200 ledger violations; zero-bit bound wrong in 100% of attacked cells' },
              { label: 'H4 core fallback under mixed proposer', status: 'pass', note: 'strips incompressible patch, certifies the compressible swap core' },
              { label: 'H5 / H5b MDL online gate', status: 'pass', note: 'admits 0 patches, retains 94.4% of true gain' },
              { label: 'H6 late-regime horizon limit', status: 'pass', note: 'correctly certifies 0.00 when true gain ~0.001 at n <= 100,000' },
              { label: 'H7–H9 batching & budget utilization', status: 'pass', note: '64-batching retains 98.6% gain at 96 bits' },
            ],
            caption: 'Raw runs ship in `results/confirmatory.jsonl.gz` with pinned SHA-256.',
          },
        ],
      },
    ],
  },

  caduceus: {
    callout:
      'Letting an agent rewrite its own skills is a release-engineering problem: every proposed skill must clear provenance, capability bounds, paired evaluation, and a holdout-leakage account before it joins the prompt.',
    sections: [
      {
        title: 'Governing skill evolution across 13 lanes',
        body: [
          'Hermes agents accumulate skills from experience, which creates an obvious attack and drift surface: a poisoned document can plant a hostile instruction into a saved skill, or a noisy edit can degrade downstream work. Caduceus wraps skill admission in a 13-lane deterministic gate, a Landlock-sandboxed broker, an RFC 9162 Merkle ledger, and an independent Python stdlib readback verifier.',
          'Its holdout-leakage radius is cross-checked against Holdout Ledger across 135 parameter combinations so repeated skill promotions pay their adaptive query cost.',
        ],
        figures: [
          {
            kind: 'flow',
            title: 'Skill admission pipeline',
            steps: ['Proposed skill diff', 'Provenance check', '12 active admission lanes', 'Landlock broker eval', 'Paired cluster bootstrap', 'RFC 9162 Merkle receipt'],
            tail: 'Any hostile provenance or regression holds the skill out of release.',
            caption: '43 of 43 seeded skill attacks were refused across the 340-test gate.',
          },
        ],
      },
      {
        title: 'Paired task gains—and a gate that caught our own over-reach',
        body: [
          'In pre-registered paired tests over 40 task clusters (200 units, 0 excluded), admitted skills lifted Claude Haiku 5.5 by +0.245 [+0.11, +0.39] over no skill and +0.24 [+0.095, +0.39] over wrong-source skills (`exp-002`). On a harder v2 contract with Claude Sonnet 5.5 (`exp-003`), lift rose to +0.305 [+0.17, +0.445] vs no skill and +0.27 [+0.13, +0.415] vs wrong-source.',
          'Equally important is the lane that failed. An `authority` phrase-tripwire lane held 77 of 188 real third-party skills (41.0%) against a pre-registered 5% false-hold limit (`r28`). Rather than tuning phrases to hide the false positives, the lane stays disabled on the record.',
        ],
        figures: [
          {
            kind: 'bars',
            title: 'Paired resolution lift & false-hold audit',
            max: 0.5,
            rows: [
              { label: 'Sonnet 5.5 vs no skill (exp-003)', value: 0.305, note: 'CI [+0.17, +0.445]', tone: 'good' },
              { label: 'Haiku 5.5 vs no skill (exp-002)', value: 0.245, note: 'CI [+0.11, +0.39]', tone: 'good' },
              { label: 'Phrase-tripwire false-hold rate', value: 0.41, note: '77 / 188 real skills (limit 0.05 -> OFF)', tone: 'bad' },
            ],
            caption: 'Provenance tracking blocks 12/12 hostile-after-untrusted writes, while honestly recording 3/3 unblocked when no untrusted input preceded the write.',
          },
        ],
      },
    ],
  },

  'hsi-lab': {
    callout:
      'Synthetic self-training works cleanly in toy rule worlds and hits a wall on 7B code. Keeping both numbers on the same recomputable receipt ledger shows exactly what is real and what was pool size.',
    sections: [
      {
        title: 'What pays at matched bytes and matched pool size',
        body: [
          'HSI Lab runs frozen experiment packets (E1–E10) with an external lock salt and 25 JSON receipts recomputable by a zero-dependency Python script (`verify_all.py`). In controlled rule worlds, structured typed-event codecs beat raw text at equal byte budgets by +0.640 [0.614, 0.667] (`E1`), fixed multi-agent graphs beat single agents by +0.352 (`E3`), and adaptive topologies add +0.421 under a compute cap (`E5`).',
          'For recursive synthetic data (`E6-verified`), verified synthetic experience beats unverified replay by +0.238 [0.205, 0.270]. Adding a pool-size-matched control (`E6-poolctl`) revealed that roughly half that gain came simply from seeing more unique states, leaving a genuine +0.141 [0.106, 0.177] verification effect.',
        ],
        figures: [
          {
            kind: 'bars',
            title: 'Paired effect sizes across frozen packets',
            max: 0.7,
            rows: [
              { label: 'E1 typed codec vs equal-byte text', value: 0.64, note: '[0.614, 0.667]', tone: 'good' },
              { label: 'E6 verified synth vs replay', value: 0.238, note: '[0.205, 0.270]', tone: 'good' },
              { label: 'E6 verified vs pool-matched control', value: 0.141, note: '[0.106, 0.177]', tone: 'good' },
              { label: 'E10 recursive chain vs +0.05 bar', value: 0.038, note: 'INCONCLUSIVE', tone: 'warn' },
            ],
            caption: 'All intervals are cluster-bootstrapped and verified from raw logs via `scripts/verify_all.py`.',
          },
        ],
      },
      {
        title: 'The 7B code wall—and why task deltas do not compose for free',
        body: [
          'When the same verified-synthetic recipe moved to Qwen2.5-7B on real code (`E8-7b`), the effect collapsed to a tight null: −0.0025 [−0.025, +0.020], with every arm within 0.04 of the 0.674 base. `E9` (−0.019) also overturned an earlier reading that verifier precision alone was driving gains, after auditing showed an early “exact oracle” had only 19–43% true ground-truth optimality.',
          'A companion continual-learning study on Qwen3-1.7B (`rsi-loops/cl7b`) tested whether per-task rank-16 MLP deltas on fp and 4-bit bases can serve as modular fast memories. Across 3 seeds, `replay_kl` retained 0.997 of facts vs 0.825 for SFT, whereas summing 4 independent deltas blew wiki NLL from 3.29 to 15.96 (17.74 on 4-bit), and scaling by 1/K restored fluency only by erasing learned facts back to chance (0.125).',
        ],
        figures: [
          {
            kind: 'chips',
            title: 'Where recursion stops transferring',
            rows: [
              { label: 'E6-ood out-of-distribution transfer', status: 'fail', note: '+0.091 gain, failed diversity guardrail -> NO_CANDIDATE' },
              { label: 'E8-7b Qwen2.5-7B code self-training', status: 'fail', note: '−0.0025 [−0.025, +0.020], tight null' },
              { label: 'cl7b independent rank-16 delta sum', status: 'fail', note: 'wiki NLL 15.96 fp / 17.74 4-bit; 1/K erases facts to chance' },
              { label: 'cl7b 3-seed replay_kl baseline', status: 'pass', note: '0.997 fact retention (1.0/1.0/1.0 on oldest task), the bar to beat' },
            ],
            caption: 'Toy-world recursion and naive delta addition are closed; scheduled fast-to-slow consolidation against `replay_kl` is the live frontier.',
          },
        ],
      },
    ],
  },

  playbox: {
    callout:
      'Agents from different owners need a room where authority is attenuated by cryptography, history is hash-chained, and optimization candidates face a sealed holdout before promotion.',
    sections: [
      {
        title: 'Multi-owner rooms and verified hill-climbing (F3)',
        body: [
          'Playbox is an 8-crate Rust collaboration substrate (46,348 lines, 494 tests, 12 fuzz targets) where agents owned by distinct principals work in shared rooms governed by attenuated Biscuit capability tokens, sandboxed runners, an MCP server, and Ed25519 hash-chained event histories.',
          'On top of those rooms sits the F3 verified hill-climb protocol. On the Mac Tier-B benchmark, multi-step optimization reached a 2.84× cumulative speedup over the pinned baseline while rejecting 4 of 6 submissions and re-verifying 6 of 6 signed receipts. On the H100 pretraining pilot, the sealed-holdout gate rejected all 7 noisy candidates and caught a planted dev-set memorizer red-handed (+0.866 dev gain, holdout bpb 2.203–2.434 vs 1.195 ceiling).',
        ],
        figures: [
          {
            kind: 'compare',
            items: [
              { value: '2.84×', label: 'Tier-B speedup over pinned baseline (6/6 receipts verified)', tone: 'good' },
              { value: '1 / 1', label: 'planted dev-set memorizer caught on H100 (0 false promotions)', tone: 'good' },
              { value: '55.7% vs 44.5%', label: 'swarm novelty-filter recall vs single agent', tone: 'good' },
            ],
            caption: 'Receipts verify offline (`docs/f3/pilot/verify.txt`).',
          },
        ],
      },
      {
        title: 'Cross-model latent “telepathy” vs a single plain word',
        body: [
          'Playbox also tested whether agents across different model families (Qwen3-8B to OLMo-2-7B) can transmit a concept through a gated latent vector projection. Topic transfer hit 140 of 160 = 87.5% (95% CI 81–92%) with only 1 false positive across 72 controls.',
          'Then we ran the control that most latent-communication papers omit: sending the topic word as plain text. Plain text scored 71–77% against 61–68% for the latent vector on the matched split. A vector crosses model families, which is real; it is not better than a word, and our README states that plainly.',
        ],
        aside: 'A documentation self-audit (`docs/audit-claims.md`) reviewed 79 claims across the repo, retracting an early KV-hybrid throughput benchmark that failed its control and documenting a git 2.43.0 hostile-bundle import bug.',
      },
    ],
  },

  formasec: {
    callout:
      'Let the proposer be as wild, heuristic, or hallucination-prone as it wants—provided every composition has to pass a tiny kernel checked across Python, Rust, Kani, and Lean 4 before a single syscall runs.',
    sections: [
      {
        title: 'Separating search from soundness',
        body: [
          'FormaSec splits synthesis into an untrusted proposer (enumerators, Bend, or 7 live LLMs) and a tiny trusted admission kernel implemented twice—a Python reference and a Rust production core—backed by Lean 4 soundness theorems (`admitAlg`, `plan_sound`), Kani model-checking on the pure Rust decision logic, and Linux Landlock execution.',
          'Across 135 full admission cases (37 valid, 98 invalid), Python and Rust produce zero differences and byte-identical receipts (`M2`). Across 600 random structural cases, Python, Rust, and Lean agree 600 out of 600 times. Across 75 generated spec mutants and 11 receipt/ledger tamper attacks (`M1`), false accepts and false rejects are both 0—and disabling hash or certificate verification immediately trips the meta-test.',
        ],
        figures: [
          {
            kind: 'compare',
            items: [
              { value: '0 / 552', label: 'unsafe admissions in hostile proposer sessions', tone: 'good' },
              { value: '600 / 600', label: 'Python · Rust · Lean structural agreement', tone: 'good' },
              { value: '75 / 75', label: 'spec mutants caught (0 false accepts, 0 false rejects)', tone: 'good' },
            ],
            caption: 'Real-LLM runs across 7 models solved up to 5/7 specs with 0 unsafe admissions.',
          },
        ],
      },
      {
        title: 'What broke under attack, and what did not speed up',
        body: [
          'During the 552-proposal hostile campaign (`M6`), zero unsafe compositions were admitted, but an adversarial proposer synthesized a valid-looking DAG with 2^n execution paths that exhausted 14 GB of RAM on the dev VM and forced a hard reset—prompting explicit path-count bounds in obligation planning.',
          'We also tested Bend as a massively parallel proposer (`M3`). It was slower than plain Python at depths 1–2 and timed out at 240 seconds on depth 3 (10.2M candidates). That negative is kept in DESIGN.md §20 so nobody repeats the port expecting free throughput.',
        ],
        figures: [
          {
            kind: 'chips',
            title: 'Milestones & honest boundaries',
            rows: [
              { label: 'M1 mutant & tamper harness', status: 'pass', note: '75 mutants + 11 ledger attacks, 0 false accepts' },
              { label: 'M2 Python / Rust / Lean parity', status: 'pass', note: '135 byte-identical receipts; 600 structural agreements' },
              { label: 'M3 Bend parallel enumerator', status: 'fail', note: 'no speedup; depth 3 timed out at 240 s' },
              { label: 'M6 552-proposal hostile session', status: 'pass', note: '0 unsafe admissions; 2^n DAG OOM caught and patched' },
              { label: 'Independent external replay', status: 'open', note: 'currently same-author MachineReplay; solver proof objects outside TCB' },
            ],
            caption: 'SOUNDNESS.md documents exact trust assumptions: Z3 and cvc5 are assumed not to err identically on T3z checks.',
          },
        ],
      },
    ],
  },

  'mech-interp-unified': {
    callout:
      'Interpretability is moving from “find a feature” to “prove your instrument would notice if the feature were generic or broken.” When we ran norm-matched controls and planted 8 flaws into standard gates, the controls rewrote the story.',
    sections: [
      {
        title: 'Where small causal unit sets actually replicate (Astral & R6)',
        body: [
          'Consolidating the Astral neuron lane (`V49–V65`) with new pre-registered protocols (`R1–R6`), a Lean-proved null-calibrated gate (1,000 matched-random draws, p floor 1/(1+n)) identified 7 swap units in Pythia-2.8B whose ablation drops agreement by 0.482 logits against a control maximum of 0.019 (`V61`).',
          'Out-of-family replication succeeded on Qwen3-1.7B-Base (`R6`): selected units scored 1.437 vs control max 0.044 on T0 (L: 1.158 vs 0.038; P: 1.550 vs 0.044; p = 0.000999 across all three) and replicated upstream on GPT-2 XL (`V64/V65`). Yet Pythia-1.4B failed the frozen 0.5-logit floor (`V55`), and `V60` showed unit selection shifts across GPU/CPU precision—making these necessary, concentrated unit sets rather than representation-invariant circuits.',
        ],
        figures: [
          {
            kind: 'bars',
            title: 'Selected unit effect vs matched-random control max (logits)',
            max: 1.6,
            rows: [
              { label: 'Qwen3-1.7B-Base R6 (selected)', value: 1.437, note: 'control max 0.044, p=0.000999', tone: 'good' },
              { label: 'GPT-2 XL V65 layers 20/32/44', value: 1.08, note: 'control max <= 0.007', tone: 'good' },
              { label: 'Pythia-2.8B V53 assess', value: 0.812, note: 'p=0.001', tone: 'good' },
              { label: 'Pythia-2.8B V61 cloud 7-unit swap', value: 0.482, note: 'control max 0.019', tone: 'good' },
            ],
            caption: 'Positive and scoped: concentrated causal leverage replicates across three model families, while failing on Pythia-1.4B.',
          },
        ],
      },
      {
        title: 'Norm-matched PCA matches J-space ablation (jspace-pilot)',
        body: [
          'In the companion `jspace-pilot` study on OLMo-2-7B (Base, SFT, DPO, Instruct; up to 4,000 prompts) and Tulu-3, ablating a Jacobian (“J-space”) basis removed far more injected valence effect than a same-rank random subspace (+0.39 to +0.42 logits). Without a harder baseline, that would look like a workspace discovery.',
          'Against a damage-matched top-PCA subspace (`pcanorm`), the gap collapsed to 0.00 [−0.05, +0.05] on DPO and −0.02 [−0.08, +0.05] on Instruct—statistically equivalent within ±0.2 logits in 11 of 12 runs, and unchanged after refitting the lens on 5× more prompts (1,000 prompts, fidelity 0.51 → 0.52) and accounting for a +2-logit clean-margin shift.',
        ],
        figures: [
          {
            kind: 'table',
            title: 'OLMo-2-7B J-space ablation vs random & norm-matched PCA',
            head: ['Checkpoint / Run', 'J-abl vs random subspace', 'J-abl vs norm-matched PCA', 'Equiv. within ±0.2'],
            rows: [
              ['SFT (40 × 100 = 4,000 prompts)', '+0.32 [0.27, 0.39]', '+0.10 [0.08, 0.13]', 'yes'],
              ['DPO (200-prompt lens)', '+0.39 [0.30, 0.49]', '0.00 [−0.05, +0.05]', 'yes'],
              ['DPO (1,000-prompt lens, shared)', '+0.42', '−0.00 [−0.06, +0.05]', 'yes'],
              ['Instruct', '+0.42 [0.32, 0.53]', '−0.02 [−0.08, +0.05]', 'yes'],
            ],
            caption: 'Pre-registered J-specificity threshold (+0.50 logit) failed in every run across OLMo-2-7B and Tulu-3.',
          },
        ],
      },
      {
        title: 'F2: auditing the auditors with 8 planted flaws',
        body: [
          'Why did our reproduction of Goodfire’s “neurons are already clean” (`R5`) fail to detect planted superposition? Because its job-count metric was measuring weight-vector width (`P(>=2 jobs) ≈ 0.91` for generic vectors). That prompted `F2`: 200 seeds across 8 planted instrument-flaw classes.',
          'A static rules gate (`A1`) caught 0 of 8 flaw classes. The `R5b` superposition audit (`A2`) caught pairs (1.00) but missed diffuse superposition (0.30; overall TPR 0.650, FPR 0.000). Even a probe battery written with knowledge of the flaws (`A3`) caught only 3 of 8. No auditor covered the set.',
        ],
      },
    ],
  },

  'temporal-grid-safety': {
    callout:
      'First we caught a confound in our own fine-tuning defense that erased a +1.00 apparent win. Then, on the clean harness, frozen discriminant adapters preserved 95% of held-out safety refusals through benign OOD drift where replay collapsed to 27%.',
    sections: [
      {
        title: 'Killing our own best result: the v16 attacker confound',
        body: [
          'Versions v11 through v15 of Temporal Grid Safety appeared to show that placing safety-critical parameters on a slow-update schedule with consensus anchoring beat baselines by +0.41 to +1.00 under adversarial fine-tuning. In v16 we audited the attacker harness and found why: the adversary had inherited each defense arm’s per-group learning rates, handicapping itself on the slow arm.',
          'Under an identical, calibrated attacker across Qwen3-8B and Mistral-7B (`v18–v20`), the grid effect shrank to roughly +0.05 AUC with confidence intervals spanning zero (`NotConfirmed`). Even provider-chosen discriminant adapters only delayed a LoRA attacker 3.7–6× on Qwen3-8B (not Mistral-7B), with the attacker winning by 64 steps.',
        ],
        aside: 'Preregistration did not prevent the v16 bug; reading why the win looked too clean did. Both the retracted table and the fix stay in REPORT.md.',
      },
      {
        title: 'What survived: benign-drift refusal retention across three families',
        body: [
          'Customer and domain fine-tuning is usually benign OOD drift, not a white-box jailbreak adversary—yet standard fine-tuning and replay still erode refusals rapidly. In `v29` and `v30`, freezing low-rank discriminant safety adapters kept refusals intact through benign OOD fine-tuning across Qwen3-8B, Mistral-7B, and OLMo-2-7B.',
          'On OLMo-2-7B (`n = 6` seeds), discriminant adapters retained 1.00 in-distribution and 0.9505 held-out refusals, while free replay collapsed to 0.2682 held-out (`out30/olmo_refuse.combine.txt`). On Qwen3-8B and Mistral-7B, held-out harmful-keyword refusal stayed at 0.96 vs 0.20 for replay.',
        ],
        figures: [
          {
            kind: 'bars',
            title: 'Held-out safety refusal retention after OOD benign fine-tuning',
            max: 1,
            rows: [
              { label: 'OLMo-2-7B discriminant adapter', value: 0.951, note: 'in-dist 1.00 (n = 6)', tone: 'good' },
              { label: 'OLMo-2-7B free replay baseline', value: 0.268, note: 'collapsed on held-out', tone: 'bad' },
              { label: 'Qwen3 / Mistral discriminant adapter', value: 0.96, note: 'held-out harmful keywords', tone: 'good' },
              { label: 'Qwen3 / Mistral replay baseline', value: 0.2, note: 'benign OOD drift', tone: 'bad' },
            ],
            caption: 'Strong on accidental benign drift; explicitly not claimed against white-box adaptive attackers.',
          },
        ],
      },
    ],
  },

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
          'A later scale-up traced that narrow result to adaptation coverage. Fitted on natural wikitext, the affine projection passes all nine cases at 256 or more prompts and mostly fails at 128. The pattern replicated on news text (CNN/DailyMail): 9 of 9 again at 256 and 512 prompts. Two caveats stay attached: that is two text domains, not language in general, and at 6.7 to 7B one of two models still fails a per-stratum gate even though its module fit is near exact.',
        ],
        figures: [
          {
            kind: 'chips',
            title: 'Replacement ledger',
            rows: [
              { label: 'Exact channel split', status: 'pass', note: '6 / 6 models; 12 / 12 controls failed as required' },
              { label: 'V8 affine output projection', status: 'pass', note: '9 / 9 fresh cases; strongest bounded positive' },
              { label: 'Natural-text fit, 256 and 512 prompts', status: 'pass', note: '9 / 9 Band A cases per arm on wikitext-2 and again on news text; 3 / 9 at 128, so the failure is coverage' },
              { label: 'r6 natural fit and challenge', status: 'fail', note: 'every per-case gate passes; recorded FAIL on the frozen 1e-4 equivalence check, which r7 traced to float32 rounding' },
              { label: 'Band B at 6.7 to 7B', status: 'fail', note: 'opt-6.7b passes at 512; open_llama_7b fails the compositional stratum. A float64 diagnostic (r8) lifts its cosines from 0.80 to 0.99+: the miss is float32 measurement resolution, not fit quality. The recorded FAIL stands.' },
              { label: 'r10 float64 gate', status: 'pass', note: 'all 45 positive cases pass a float64 gate, and the opt-6.7b 256-prompt negative control still fails (0 of 3, narrowly: min cosine 0.887). This measures the instrument only; every earlier outcome stands. One lineage caveat is open: a manifest hash recorded under a different definition.' },
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
          'A follow-up gave the two LLM judges a positive control of 120 redacted items. One judge caught all 40 unsafe stubs; the other caught 17 of 40. The labels are author-made and owner-adopted, not independently reviewed, so this shows the judges differ, not that either detects real harm.',
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
        aside: 'Later neuron-level work (V49–V65 and Qwen3 R6) was consolidated into `mech-interp-unified` alongside the F2 planted-flaw audit.',
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

export const romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI']
