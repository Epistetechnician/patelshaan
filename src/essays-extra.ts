import type { Essay, Figure, Section, Source } from './essays'
import { essays } from './essays'

type Extra = {
  voice: string[]
  sources: Source[]
  /** demo placed after the section at this index */
  demo?: { after: number; id: string }
  context: Section
  roadmap: Extract<Figure, { kind: 'roadmap' }>
}

const arxiv = (id: string) => `https://arxiv.org/abs/${id}`

const extras: Record<string, Extra> = {
  'holdout-ledger': {
    voice: [
      'Autonomous research loops are arriving faster than humans can review what they report. The scarce thing is no longer generating another candidate; it is answering, cheaply and mechanically, whether a reported gain is real and how much of the holdout was spent finding out.',
      'This is the cleanest piece in the portfolio: one idea, pre-registered before confirmatory runs, nine of nine hypotheses passing, zero certificate violations across 59,200 runs, and an explicit late-stage regime where it certifies nothing.',
    ],
    sources: [
      { label: 'Dwork et al. (2015), The Reusable Holdout: Preserving Validity in Adaptive Data Analysis', url: 'https://www.science.org/doi/10.1126/science.aaa9375', why: 'Foundational formulation of adaptive overfitting when an analyst queries a holdout repeatedly.' },
      { label: 'Blum and Hardt (2015), The Ladder: A Reliable Leaderboard for Machine Learning Competitions', url: arxiv('1502.04585'), why: 'Thresholded holdout feedback to bound adaptive leakage on public leaderboards.' },
      { label: 'Rissanen (1978), Modeling by Shortest Data Description', url: 'https://doi.org/10.1016/0005-1098(78)90005-5', why: 'Minimum Description Length principle behind pricing the compressible core of an admitted system.' },
    ],
    demo: { after: 1, id: 'holdout' },
    context: {
      title: 'Why pricing description length unlocks long loops',
      body: [
        'Pure information-accounting charges one bit per binary query, which makes a 20,000-example holdout vacuous well before 1,000 iterations. Yet genuine engineering wins are short to state—a small swap list, a clean hyper-parameter schedule, a compact patch—whereas holdout memorization requires bits proportional to the examples fit.',
        'Charging the minimum of released verdict bits and core description length lets a self-improvement loop run many iterations as long as what it actually ships stays simple, while automatically stripping or refusing high-description patches.',
      ],
    },
    roadmap: {
      kind: 'roadmap',
      title: 'Where this stands',
      done: ['Pre-registered 59,200-run confirmatory grid: 9 / 9 hypotheses pass, 0 certificate violations', 'Lean 4 counting union-bound and monotonicity proofs', 'Complexity-priced online MDL gate & 64-candidate batching'],
      next: ['Publish standalone 8-page paper and invite external red-teaming on the MDL gate', 'Replace scripted proposers with a live LLM agent told explicitly to game the gate on a second dataset'],
      blocked: ['Late-regime tiny gains (~0.001) remain uncertifiable up to n = 100,000', 'Python implementation is cross-checked, not formally verified'],
      caption: 'Caduceus and Playbox F3 already consume its Hoeffding-union accounting.',
    },
  },

  caduceus: {
    voice: [
      'Most self-improving agent demos let the agent append "lessons learned" to its own system prompt and call the result continual learning. In practice that is an unmediated write channel into the agent’s authority.',
      'I built Caduceus so a skill change is treated like a kernel patch: provenance-tagged, sandboxed, checked against paired held-out tasks, and recorded in a Merkle ledger—including the gate lane that failed our own false-positive bar.',
    ],
    sources: [
      { label: 'RFC 9162, Certificate Transparency Version 2.0', url: 'https://www.rfc-editor.org/rfc/rfc9162', why: 'Merkle tree structure used by the Caduceus append-only skill ledger.' },
      { label: 'Linux Landlock LSM documentation', url: 'https://docs.kernel.org/userspace-api/landlock.html', why: 'Unprivileged OS sandboxing used by the broker during skill evaluation.' },
    ],
    context: {
      title: 'Why false-positive gates must fail too',
      body: [
        'Security filters usually fail silently in one direction: they block legitimate work until operators turn the whole system off. Testing our `authority` phrase-tripwire against 188 real third-party skills caught a 41.0% false-hold rate against a pre-registered 5% ceiling.',
        'Keeping that lane disabled—and leaning instead on structural provenance (which blocked 12 of 12 hostile-after-untrusted writes)—kept the governance layer usable enough to deliver +0.245 to +0.305 real task gains.',
      ],
    },
    roadmap: {
      kind: 'roadmap',
      title: 'Where this stands',
      done: ['13-lane admission gate, Landlock broker, RFC 9162 Merkle ledger, 340 passing tests', 'Paired evaluations on Haiku (+0.245) and Sonnet (+0.305)', 'Leakage radius cross-checked with Holdout Ledger across 135 configs'],
      next: ['Run a multi-week autonomous skill-evolution loop priced by the live Holdout Ledger budget', 'Evaluate on external SWE/agent benchmarks with independent reviewers'],
      blocked: ['Hostile writes made without prior untrusted input (insider/prompt-free) are outside provenance scope', 'Phrase-tripwire authority lane remains off pending semantic replacement'],
      caption: 'Every result JSON in `ledgers/` verifies with the stdlib readback script.',
    },
  },

  'hsi-lab': {
    voice: [
      'Everyone hopes models can bootstrap endlessly on their own synthetic experience. I wanted frozen packets and stdlib-recomputable receipts so I could not talk myself into seeing a compounding curve where none existed.',
      'The contrast between +0.238 in verified rule worlds and −0.0025 on 7B code—paired with `cl7b` showing independent weight deltas destroy fluency when summed—is the sharpest map I have of where synthetic scaling works and what has to be solved next.',
    ],
    sources: [
      { label: 'Shumailov et al. (2024), AI models collapse when trained on recursively generated data', url: 'https://www.nature.com/articles/s41586-024-07566-y', why: 'Why unverified recursive synthetic training degrades without external grounding or verification.' },
      { label: 'Shenfeld et al. (2026), Self-Distillation Fine-Tuning (SDFT)', url: arxiv('2601.19897'), why: 'On-policy distillation arm tested in our companion `cl7b` continual-learning harness.' },
    ],
    context: {
      title: 'Pool size vs verification—and fast vs slow weights',
      body: [
        'Without `E6-poolctl`, we would have credited verification with +0.238 when nearly half of that gain came simply from expanding the state pool. Matched-pool controls should be mandatory in synthetic-data papers.',
        'Similarly, in `cl7b`, single rank-16 task deltas toggle cleanly on a frozen 4-bit or fp base, but summing four independent deltas breaks the model, and 1/K scaling trades retention directly against capability. Replay-anchored consolidation (`replay_kl` at 0.997) remains the bar any fast-to-slow memory architecture must clear.',
      ],
    },
    roadmap: {
      kind: 'roadmap',
      title: 'Where this stands',
      done: ['Frozen packets E1–E10 with 25 stdlib-recomputed receipts', 'Pool-matched verification isolate (+0.141) & typed codec win (+0.640)', '7B code null (−0.0025) and Qwen3-1.7B delta-composition diagnosis (`cl7b`)'],
      next: ['Build scheduled fast-delta → on-policy KL consolidation at 7B against the 3-seed `replay_kl` bar', 'Test real-data share mixtures and diversity gates on code'],
      blocked: ['Unverified LLM recursion closed as negative', 'GPU tensor-digest determinism across CUDA runs (statistical verdicts replicate, raw digests drift)'],
      caption: 'Run `python3 scripts/verify_all.py` to recompute every receipt from raw trial logs.',
    },
  },

  playbox: {
    voice: [
      'Collaboration between agents of different people is a constitutional design problem before it is a multi-agent prompting problem: whose authority is spent, how is a bad candidate rejected, and can every owner verify the room transcript afterward?',
      'Testing latent “telepathy” inside the same repo taught me a complementary lesson: cross-family activation transfer is real (87.5%), and a single English word still beats it by ten points. Measure the boring baseline.',
    ],
    sources: [
      { label: 'Biscuit authorization token specification', url: 'https://www.biscuitsec.org/', why: 'Public-key, offline-attenuatable capability tokens used for multi-owner room grants.' },
      { label: 'Rimsky et al. (2024), Steering Llama 2 via Contrastive Activation Addition', url: arxiv('2312.06681'), why: 'Activation-steering lineage behind the cross-family concept-channel experiments.' },
    ],
    context: {
      title: 'Why rooms and sealed holdouts belong together',
      body: [
        'When multiple untrusted agents propose code or training edits into a shared room, benchmark gaming is the default outcome unless the evaluator sits across a cryptographic boundary. In the F3 H100 pilot, an injected memorizer achieved a +0.866 dev-set gain and was immediately caught by the sealed holdout (2.203+ bpb vs 1.195 limit).',
        'Combining multi-owner Biscuit rooms with bit-priced holdout gates gives open agent collectives a way to pool search without pooling trust.',
      ],
    },
    roadmap: {
      kind: 'roadmap',
      title: 'Where this stands',
      done: ['8-crate Rust workspace (v0.3.2), Biscuit grants, Ed25519 histories, MCP server', 'Tier-B 2.84× verified hill-climb & H100 F3 pilot catching planted memorizer', '79-claim documentation self-audit (`docs/audit-claims.md`)'],
      next: ['Run multi-agent GPU F3 campaign long enough to promote genuine capability wins', 'Patch git 2.43.0 hostile-bundle import edge case and federate Commons beyond one relay'],
      blocked: ['Latent vectors trail plain text on topic accuracy (61–68% vs 71–77%)', 'Single-relay Commons v0 has no multi-operator consensus yet'],
      caption: 'All F3 pilot receipts and Tier-B logs ship in the repository.',
    },
  },

  formasec: {
    voice: [
      'After eighty phases of trying to extract Rust proofs in an earlier project, I inverted the architecture: keep the proposers completely untrusted, shrink the admission kernel until Python, Rust, Kani, and Lean 4 can agree on every edge, and isolate execution with Landlock.',
      'Watching 552 hostile proposals and 7 free LLMs hit zero unsafe admissions—while catching a 2^n DAG memory bomb along the way—convinced me this is the practical path to certified agent action.',
    ],
    sources: [
      { label: 'Lean 4 theorem prover', url: 'https://lean-lang.org/', why: 'Used to mechanize `admitAlg` and `plan_sound` for obligation planning.' },
      { label: 'Kani Rust Verifier', url: 'https://model-checking.github.io/kani/', why: 'Bit-precise model-checking applied to the pure Rust admission decision core.' },
      { label: 'Z3 and cvc5 SMT solvers', url: 'https://cvc5.github.io/', why: 'Dual-solver checking used on T3z semantic obligations.' },
    ],
    demo: { after: 0, id: 'formasec' },
    context: {
      title: 'Why implementation diversity + small proofs beat giant TCBs',
      body: [
        'Proving an entire LLM runtime is impossible; proving a 300-line admission algebra and cross-checking Python, Rust, and Lean across 600 structural cases and 75 mutants is achievable in weeks.',
        'By forcing every LLM or enumerator output to compile into a bounded obligation DAG with byte-identical receipts before Landlock executes anything, model capability scales search while the kernel’s smallness scales assurance.',
      ],
    },
    roadmap: {
      kind: 'roadmap',
      title: 'Where this stands',
      done: ['135/135 byte-identical Python/Rust admissions & 600/600 Lean structural checks', 'Kani proofs on pure Rust core; 0/552 hostile admissions; 75/75 mutants caught', 'Documented Bend parallel-search negative'],
      next: ['Independent external replay by a second party (closing M6 exit criterion)', 'Automate repeatable zklean / SP1 proof-carrying certificate emission'],
      blocked: ['Solver proof objects are not checked inside Lean (trusts Z3 + cvc5 not both wrong)', 'Operator adapter trust remains at the T3z boundary'],
      caption: 'See DESIGN.md §§18–29 and SOUNDNESS.md for full threat boundaries.',
    },
  },

  'mech-interp-unified': {
    voice: [
      'Two weeks of negative and positive interpretability runs taught me one lesson: without norm-matched controls and planted-flaw audits, interpretability instruments routinely mistake vector width or residual-stream norm damage for causal mechanism.',
      'Having Qwen3-1.7B replicate our Pythia neuron gate at p = 0.000999 while J-space collapsed to 0.00 against norm-matched PCA—and watching rules gates catch 0 of 8 planted flaws—gives us the exact ingredients for an honest interpretability benchmark.',
    ],
    sources: [
      { label: 'Barez et al. (2026), Baselines and Validity Controls for Mechanistic Interpretability', url: arxiv('2611.08438'), why: 'Methodological framework behind our norm-matched PCA, random-k, and equivalence-testing baselines.' },
      { label: 'Sharkey et al. (2025), Open Problems in Mechanistic Interpretability', url: arxiv('2501.16496'), why: 'Frames superposition, circuit faithfulness, and instrument validation as open measurement problems.' },
    ],
    demo: { after: 2, id: 'flawaudit' },
    context: {
      title: 'Why auditing the auditor changes the field',
      body: [
        'When an interpretability paper reports a negative or a positive, readers rarely know whether the gate itself could have detected a planted confound. In `F2`, planting eight concrete flaw classes exposed that static rules gates caught none and even informed probes caught three.',
        'Pairing known-ground-truth flaw injections (`F2`) with damage-matched subspace baselines (`jspace-pilot`) turns isolated nulls into a reusable calibration suite for future interpretability methods.',
      ],
    },
    roadmap: {
      kind: 'roadmap',
      title: 'Where this stands',
      done: ['Out-of-family neuron-gate replication on Qwen3-1.7B-Base (R6, p=0.000999) & GPT-2 XL', 'F2 200-seed planted-flaw audit across 8 flaw classes', 'OLMo-2-7B & Tulu-3 norm-matched PCA equivalence tests + 1,000-prompt lens refit'],
      next: ['Publish unified Planted-Flaw & Norm-Matched Benchmark with held-out flaw classes', 'Characterize V60 device/dtype unit-selection sensitivity (`V62`)'],
      blocked: ['J-ablation efficiency plateaus near 0.50–0.55', 'Paid LLM-judge arm A4 in F2 held unrun by budget rule'],
      caption: 'Run `python3 -m audit.verify` in `mech-interp-unified` to verify all 200-seed F2 decisions.',
    },
  },

  'temporal-grid-safety': {
    voice: [
      'Catching the v16 bug—where our attacker accidentally inherited the defender’s slow learning rates—hurt, because it killed five versions of apparent wins. It is also the reason I trust the v29 and v30 discriminant-adapter result.',
      'Open-weight models are fine-tuned every day on benign customer data and quietly lose their safety training. Keeping 95% of held-out refusals vs 27% for replay is a practical foothold worth scaling properly.',
    ],
    sources: [
      { label: 'Qi et al. (2023), Fine-tuning Aligned Language Models Compromises Safety, Even When Users Do Not Intend To!', url: arxiv('2310.03693'), why: 'Demonstrated that benign fine-tuning erodes alignment guardrails—the exact regime v29/v30 addresses.' },
    ],
    context: {
      title: 'Separating benign drift from white-box attackers',
      body: [
        'Conflating accidental fine-tuning drift with a white-box weight attacker makes every defense look either miraculous (on weak attackers) or useless (against 64-step LoRA removal).',
        'Stating both halves cleanly—slow grids do not stop a fair attacker, while frozen discriminant adapters preserve refusals through benign OOD drift across three 7B–8B families—tells builders where the primitive actually belongs: hosted fine-tuning APIs and continual domain adaptation.',
      ],
    },
    roadmap: {
      kind: 'roadmap',
      title: 'Where this stands',
      done: ['Self-caught v16 attacker confound & v20 fair-attacker null', 'v29/v30 benign-drift refusal retention across OLMo-2-7B (0.95 vs 0.27), Qwen3-8B, and Mistral-7B', 'v32 AdvBench / HarmBench / GSM8K evaluation harness committed'],
      next: ['Scale discriminant-adapter runs to >= 20 seeds and full-weight fine-tuning on v32', 'Pair refusal retention with benign-contrast over-refusal and GSM8K capability checks'],
      blocked: ['White-box adaptive fine-tuning attackers still break refusals within ~64 steps', 'Current v30 cell size is n = 6 to 20 seeds'],
      caption: 'Per-run JSONs and combined summaries live in `out20/`, `out29/`, and `out30/`.',
    },
  },

  'aligned-holistic-continual-learning': {
    voice: [
      'I keep coming back to one small, uncomfortable fact: the model I test on Monday is not the model that exists the following Monday. Everyone building systems that keep learning lives with that gap. I wanted to see whether it can be measured before an update ships, instead of discovered after.',
      'The synthetic pass is the easy part and I will not oversell it. The part I am proudest of is the gate that failed, because it is the check most safety claims in this area quietly skip.',
    ],
    sources: [
      { label: 'Kirkpatrick et al., Overcoming catastrophic forgetting in neural networks', url: arxiv('1612.00796'), why: 'The EWC baseline this monitor is compared against.' },
      { label: 'De Lange et al., A continual learning survey', url: arxiv('1909.08383'), why: 'Why retention and plasticity have to be reported together, and why evaluation protocols differ so much.' },
      { label: 'Holm (1979), A simple sequentially rejective multiple test procedure', url: 'https://www.jstor.org/stable/4615733', why: 'The correction behind the open joint-power question that keeps the model-backed run closed.' },
    ],
    demo: { after: 2, id: 'matched' },
    context: {
      title: 'Why the comparison protocol is the result',
      body: [
        'Continual-learning papers usually report end-of-training numbers. That makes “less harm” and “learned less” indistinguishable, and a conservative method looks safer for free. The matched-progress gate exists to separate the two: it asks whether harm is lower at the same amount of learning.',
        'I think this transfers beyond this repository. Any claim that an update policy is safer should say what it was matched on. If it cannot, the number is a description of how little the method did.',
      ],
    },
    roadmap: {
      kind: 'roadmap',
      title: 'Where this stands',
      done: ['Deterministic synthetic qualification, all gates passed', 'Matched-progress replication, failure recorded', 'Quarantining admission kernel (Rust) and independent validator'],
      next: ['Independent review of the power design, including joint power under Holm correction', 'Then run the model-backed integrated experiment once, not repeatedly'],
      blocked: ['One interpretability lane needs a Torch pin with no matching macOS arm64 wheel', 'No real-model result exists yet'],
      caption: 'The integrated experiment stays closed until the statistics are settled. A negative result I could not interpret would be worse than waiting.',
    },
  },

  'theseus-lab': {
    voice: [
      'The Ship of Theseus is usually a puzzle about identity. For a language model it is an engineering question: if you replace a part and the outputs do not change, did you keep the thing that mattered? I built this lab to find out how often the honest answer is “you cannot tell from outputs alone.”',
      'Most of what is here is a negative result, and I have tried to make each one precise enough to be useful to someone else. The permutation experiment is my favorite, because it makes the problem impossible to unsee.',
    ],
    sources: [
      { label: 'Geiger et al., Causal Abstraction: A Theoretical Foundation for Mechanistic Interpretability', url: arxiv('2301.04709'), why: 'The framework for saying when a high-level explanation faithfully describes a lower-level mechanism.' },
      { label: 'Hase et al., Does Localization Inform Editing?', url: arxiv('2301.04213'), why: 'Evidence that where a fact appears localized is not where editing it works, the same gap between behavior and mechanism.' },
      { label: 'Ainsworth et al., Git Re-Basin: Merging Models modulo Permutation Symmetries', url: arxiv('2209.04836'), why: 'Permutation symmetry in neural networks, which the GPT-2 experiment exploits.' },
      { label: 'Sharkey et al., Open Problems in Mechanistic Interpretability', url: arxiv('2501.16496'), why: 'The wider field’s own list of unresolved validity questions.' },
      { label: 'Zheng et al., Judging LLM-as-a-Judge', url: arxiv('2306.05685'), why: 'Known limits of using one model to grade another, relevant to the two-grader Qwen result.' },
    ],
    demo: { after: 1, id: 'permutation' },
    context: {
      title: 'Why this matters for safety work',
      body: [
        'Safety arguments often lean on a mechanism: “this feature is the refusal feature,” “this circuit is responsible.” If a relabeling that changes nothing about behavior can make an intervention look unrelated to itself, then claims have to be stated relative to a representation, with the mapping to any other representation written down.',
        'The same applies to replacement. A cheaper module that matches outputs on the probes you thought of is evidence about your probes. The V31 result, where random and zero blocks kept full accuracy, is the cleanest warning I have: the test could not have failed.',
      ],
    },
    roadmap: {
      kind: 'roadmap',
      title: 'Where this stands',
      done: ['Permutation invariance of causal labels, shown on GPT-2', 'Narrow positive: affine projection, 9 / 9', 'Diagnosis of the V39 failure as derivative underfitting'],
      next: ['Test whether objectives that match local derivatives close the Jacobian gap', 'Add a second independent evaluator to the Qwen safeguard slice'],
      blocked: ['The second independent evaluator is currently blocked', 'Whole-block replacement has no qualified candidate'],
      caption: 'Planned, not started. Each would be a new frozen protocol, not a rerun of an old one.',
    },
  },

  'security-alignment-os': {
    voice: [
      'I do not think the right question for agent safety is “how much do we trust the model?” I think it is “what can a bad proposal cause, and who can prove afterward what happened?” That is a question about authority, and authority is something engineers already know how to build.',
      'So I built the control plane first, with no model in it, and attacked it myself. I would rather show you the five gaps I know about than have you find them.',
    ],
    sources: [
      { label: 'Saltzer and Schroeder (1975), The Protection of Information in Computer Systems', url: 'https://web.mit.edu/Saltzer/www/publications/protection/', why: 'The origin of least privilege, fail-safe defaults and complete mediation, which the loop is built on.' },
      { label: 'Greenblatt et al., AI Control: Improving Safety Despite Intentional Subversion', url: arxiv('2312.06942'), why: 'The case for safety measures that hold even if the model is trying to subvert them.' },
      { label: 'Google Cloud, Confidential Space', url: 'https://cloud.google.com/docs/security/confidential-space', why: 'The attested execution environment used for the 20-scenario run.' },
    ],
    demo: { after: 0, id: 'gate' },
    context: {
      title: 'Why a boring kernel is the point',
      body: [
        'Control-style safety work asks what remains true if the model is adversarial. This repository answers a narrow slice of that: even a perfectly malicious proposal can only act through gates that do not consult the proposer. The classic security principles apply almost unchanged: least privilege, complete mediation, fail-safe defaults.',
        'What it does not do is tell you whether a particular model would behave. It makes the thing you would have to trust smaller, checkable and replayable.',
      ],
    },
    roadmap: {
      kind: 'roadmap',
      title: 'Where this stands',
      done: ['Rust reference kernel, 279 tests', 'Adversarial runner against the broker', 'One attested 20-scenario run on TDX'],
      next: ['Independent replication on a second, separately administered host', 'Encrypt persisted state', 'Place a model inside the loop and measure what the boundary still holds'],
      blocked: ['Protection against a hostile process under the same user ID', 'Linux sandbox beyond compile-check on x86_64'],
      caption: 'The replication gate stays inconclusive until the second host runs it.',
    },
  },

  'composed-zk-benchmark-os': {
    voice: [
      'I got interested in zero-knowledge systems because they promise something rare: a claim you can check without trusting the claimant. That makes how we benchmark them a safety question. A leaderboard that rewards speed can hide a backend that accepts what it should reject.',
      'This repository is also where I practiced the habit I now care most about: write down the ceiling of a claim before you run the experiment, and keep the failures.',
    ],
    sources: [
      { label: 'Ho and Protzenko, Aeneas: Rust Verification by Functional Translation', url: arxiv('2206.07185'), why: 'The Rust-to-proof-assistant translation I tried for roughly 80 phases.' },
      { label: 'Lean theorem prover', url: 'https://lean-lang.org/', why: 'Where the kernel-checked theorem about the checker model lives.' },
      { label: 'Z3 theorem prover', url: 'https://github.com/Z3Prover/z3', why: 'The solver behind the digest-binding unsat result.' },
      { label: 'Lieberum et al., Gemma Scope', url: arxiv('2408.05147'), why: 'Related interpretability tooling for Gemma 2; the Gemma 3 work here is a separate measurement qualification.' },
    ],
    demo: { after: 1, id: 'mutation' },
    context: {
      title: 'Why claim ceilings are a safety tool',
      body: [
        'Over-claiming is the failure mode that scales. A benchmark pass reported as a proof, or a local replay reported as an official result, spreads further than any bug. A ledger that refuses to promote evidence past its level is a small, dull defense against that.',
        'The Aeneas phases are the honest cost of the same idea: extraction ran, nothing was promoted, and the cost of discipline is on the record.',
      ],
    },
    roadmap: {
      kind: 'roadmap',
      title: 'Where this stands',
      done: ['Semantic benchmark OS, nine families, 14 mutation classes', 'Z3 result, diverse checker, Lean theorem over a model', 'Gemma 3 V4 measurement qualification'],
      next: ['Benchmark external zkVM backends (SP1, RISC Zero, Plonky3) against the 14 mutation classes', 'Take one claim from Level 1 to an independent reproduction'],
      blocked: ['No official benchmark result or backend performance claim yet', 'Raw model traces for interpretability sit in owner-only custody'],
      caption: 'Level 2 and above has not been produced, and nothing here pretends otherwise.',
    },
  },

  hyperintel: {
    voice: [
      'Every marketplace eventually asks you to take someone’s word for what happened. I wanted to see how far you can push that back: a buyer, a provider and a stranger should all be able to check a receipt without calling the operator.',
      'The Z3 check is deliberately small, and the two ignored tests are named on the page, because a claim you cannot see the edges of is not much use to the next person.',
    ],
    sources: [
      { label: 'RFC 6962, Certificate Transparency', url: 'https://www.rfc-editor.org/rfc/rfc6962', why: 'The append-only, publicly checkable log model behind verifiable receipts.' },
      { label: 'The Update Framework specification', url: 'https://theupdateframework.github.io/specification/latest/', why: 'Caller-supplied trust roots: a verifier should not accept keys from the thing it verifies.' },
      { label: 'Z3 theorem prover', url: 'https://github.com/Z3Prover/z3', why: 'Used for the router abstraction, bound to the source hash.' },
    ],
    demo: { after: 0, id: 'tamper' },
    context: {
      title: 'Why offline verification matters',
      body: [
        'If the only way to check a receipt is to ask the party that issued it, the receipt adds little. Deriving identities so that any edit breaks the chain, and checking against a separately supplied trust registry, moves trust from the operator to a small, auditable rule.',
        'It does not make the operator honest. It makes dishonesty detectable by someone who was not there.',
      ],
    },
    roadmap: {
      kind: 'roadmap',
      title: 'Where this stands',
      done: ['Deterministic route-to-settlement-intent loop', 'Durable compare-and-swap replay store', 'Z3 router property bound to the source hash', 'Offline CLI verifier for V1 to V4 bundles'],
      next: ['Make the two ignored journal tests pass, or remove the behavior they cover', 'Run a staked independent-verifier incentive experiment'],
      blocked: ['Replicated, rollback-resistant replay enforcement', 'Any network, wallet or real settlement'],
      caption: 'The ignored tests were failing at release staging and are marked unverified until they pass.',
    },
  },
}

const roadmapIntros: Record<string, string> = {
  'holdout-ledger':
    'The math held cleanly in simulation; the real test starts the moment a live coding agent tries to outsmart the MDL gate on an unfamiliar benchmark.',
  caduceus:
    'The hard part of governed skill growth is keeping the guardrails light enough that people leave them turned on. That is where the next iteration lives.',
  'hsi-lab':
    'Knowing where synthetic self-training stops working is half the map. The next stretch tests whether scheduled consolidation can cross the 7B boundary without a growing replay archive.',
  playbox:
    'The rooms and receipts exist; now they need to survive a long multi-agent run across machines owned by people who genuinely do not share keys.',
  formasec:
    'Once a kernel is small enough to hold in one mind, the remaining question is social as much as technical: will a second pair of hands replay it and find what we missed?',
  'mech-interp-unified':
    'Every flaw we planted taught us a blind spot in our own tools. Turning that private calibration notebook into a shared, out-of-sample suite is what comes next.',
  'temporal-grid-safety':
    'After catching our own confound, every step forward has to earn its keep across more seeds, full-weight updates, and benign-helpfulness checks side by side.',
  'aligned-holistic-continual-learning':
    'Waiting on a statistical power review feels slow, yet running an uncalibrated experiment is slower still. The harness stays sealed until the math earns the run.',
  'theseus-lab':
    'The narrow positive taught us how much coverage matters; the failures taught us to watch the derivatives. Both now shape the next frozen protocol.',
  'security-alignment-os':
    'A control plane earns trust when someone you did not coordinate with runs it on hardware you do not control and watches it hold.',
  'composed-zk-benchmark-os':
    'Semantics-first testing only changes the field once real zkVM provers run through the same fourteen mutations and publish where they crack.',
  hyperintel:
    'Offline verification moves the proof out of the operator’s hands; the open chapter is pairing those receipts with live incentives and closing the two ignored concurrency tests.',
}

export function getEssay(slug: string): Essay {
  const base = essays[slug]
  const x = extras[slug]
  if (!x) return base
  const sections: Section[] = base.sections.map((s) => ({ ...s, figures: [...(s.figures ?? [])] }))
  if (x.demo && sections[x.demo.after]) {
    sections[x.demo.after].figures!.push({ kind: 'demo', id: x.demo.id })
  }
  sections.splice(sections.length - 1 > 2 ? 2 : sections.length, 0, x.context)
  sections.push({
    title: 'Where this goes',
    body: [roadmapIntros[slug] ?? 'What sits ahead is narrower than a manifesto: the specific checks that could overturn or confirm what held so far.'],
    figures: [x.roadmap],
  })
  return { ...base, voice: x.voice, sources: x.sources, sections }
}
