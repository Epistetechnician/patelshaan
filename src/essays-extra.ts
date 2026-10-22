import type { Essay, Figure, Section, Source } from './essays'
import { essays } from './essays'

type Extra = {
  voice: string[]
  sources: Source[]
  /** demo placed after the section at this index */
  demo: { after: number; id: string }
  demo2?: { after: number; id: string }
  context: Section
  roadmap: Extract<Figure, { kind: 'roadmap' }>
}

const arxiv = (id: string) => `https://arxiv.org/abs/${id}`

const extras: Record<string, Extra> = {
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
    demo2: { after: 2, id: 'netswap' },
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
      next: ['Either obtain a complete kernel-checked extracted witness or close that line deliberately', 'Take one claim from Level 1 to an independent reproduction'],
      blocked: ['No official benchmark result or backend performance claim', 'Raw model traces for interpretability sit in owner-only custody'],
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
      next: ['Make the two ignored journal tests pass, or remove the behavior they cover', 'Exercise Windows and Linux builds'],
      blocked: ['Replicated, rollback-resistant replay enforcement', 'Any network, wallet or real settlement'],
      caption: 'The ignored tests were failing at release staging and are marked unverified until they pass.',
    },
  },
}

export function getEssay(slug: string): Essay {
  const base = essays[slug]
  const x = extras[slug]
  if (!x) return base
  const sections: Section[] = base.sections.map((s) => ({ ...s, figures: [...(s.figures ?? [])] }))
  sections[x.demo.after].figures!.push({ kind: 'demo', id: x.demo.id })
  if (x.demo2) sections[x.demo2.after].figures!.unshift({ kind: 'demo', id: x.demo2.id })
  sections.splice(sections.length - 1 > 2 ? 2 : sections.length, 0, x.context)
  sections.push({ title: 'Where this goes', body: ['This is the part I care about most. A result matters less than whether the next one is better than the last.'], figures: [x.roadmap] })
  return { ...base, voice: x.voice, sources: x.sources, sections }
}
