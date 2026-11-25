import type { ThreadId } from './humanities'

/*
 * For each inquiry: who is on the other end of it, what older question it is a
 * technical form of, and what to read next. Written to sit beside the findings,
 * never to stand in for them.
 */

export type Lineage = {
  epigraph?: { text: string; by: string; lang?: string; gloss?: string }
  /** the people behind the numbers */
  people: string
  sections: { title: string; body: string[] }[]
  threads: ThreadId[]
  shelf: string[]
}

export const lineage: Record<string, Lineage> = {
  'holdout-ledger': {
    epigraph: {
      text: 'The first principle is that you must not fool yourself, and you are the easiest person to fool.',
      by: 'Richard P. Feynman, “Cargo Cult Science”, 1974',
    },
    people:
      'Any engineer or scientist running an automated optimization loop overnight and waking up to a +12% score that vanishes the day real users touch it.',
    sections: [
      {
        title: 'The reusable exam and Goodhart’s ratchet',
        body: [
          'Civil-service examinations, clinical trials, and machine-learning leaderboards all face the same decay: the moment an exam stays fixed while candidates iterate against its pass/fail signal, the score stops measuring the underlying skill and starts measuring familiarity with the judge. Cynthia Dwork and colleagues formalized that decay in 2015: even one bit of feedback per round leaks holdout information into the analyst’s next choice.',
          'Holdout Ledger turns that theorem into double-entry accounting. Every query bills bits onto an append-only hash chain, and no claim leaves the room without paying its adaptive tab.',
        ],
      },
      {
        title: 'Occam’s razor as an audit certificate',
        body: [
          'Jorma Rissanen’s Minimum Description Length principle reframed Occam’s razor as arithmetic: a hypothesis earns belief only to the extent that describing the hypothesis plus its errors takes fewer bits than memorizing the data. A two-line swap of ensemble weights is short; a lookup table of flipped test margins is long.',
          'By certifying the cheaper of released verdict bits and core description length, and stripping incompressible patches automatically,the ledger lets honest, simple engineering iterate hundreds of times without giving memorizers a free pass.',
        ],
      },
    ],
    threads: ['measure', 'failure', 'trust'],
    shelf: ['dwork', 'rissanen', 'strathern', 'porter', 'feynman', 'pacioli'],
  },

  caduceus: {
    people:
      'Anyone running a personal or team coding agent that saves “skills” from yesterday’s browsing session, and would rather not let a poisoned webpage rewrite tomorrow’s shell permissions.',
    sections: [
      {
        title: 'Precedent, quarantine, and standing orders',
        body: [
          'Common-law courts distinguish a passing remark (obiter dictum) from a binding rule (ratio decidendi), because turning every episode into standing law quickly corrupts the code. An agent that promotes its own scratch notes into reusable skills is writing standing orders for its future self.',
          'Caduceus treats skill promotion like quarantine harbor inspection: provenance marks whether untrusted input touched the session, Landlock confines evaluation, paired clusters test whether the skill actually helps, and an RFC 9162 Merkle log records every admission and refusal.',
        ],
      },
      {
        title: 'When the guard blocks the citizens',
        body: [
          'A censor who flags four out of ten honest books gets fired or ignored. When our `authority` phrase-tripwire held 41% of 188 real third-party skills against a 5% ceiling, keeping that lane disabled honored Saltzer and Schroeder’s psychological acceptability principle: a security gate that makes normal work impossible teaches operators to route around security.',
        ],
      },
    ],
    threads: ['power', 'trust', 'measure'],
    shelf: ['saltzer', 'hardy', 'miller', 'poovey', 'strathern'],
  },

  'hsi-lab': {
    people:
      'Teams betting compute budgets on synthetic data flywheels who need to know whether their model is genuinely compounding capability or quietly rehearsing its own habits.',
    sections: [
      {
        title: 'Photocopies of photocopies, and Lind’s control',
        body: [
          'Scribes copying manuscripts from copies rather than exemplars accumulated characteristic drift until textual critics learned to reconstruct stemmata and check witnesses independently. Unverified recursive training has the same failure mode at GPU speed.',
          'James Lind’s 1747 scurvy trial, matching conditions across pairs so citrus was isolated from shipboard routine,is the ancestor of `E6-poolctl` here, which showed half of verified synthetic data’s apparent gain was simply pool size, and of `E8-7b`, which showed the remaining toy-world gain hits 0.00 on 7B code.',
        ],
      },
    ],
    threads: ['memory', 'failure', 'trust'],
    shelf: ['lind', 'hill', 'borges', 'mccloskey', 'feynman', 'rosenthal'],
  },

  playbox: {
    epigraph: {
      text: 'Capabilities unify designation and authority.',
      by: 'Norm Hardy & Mark S. Miller, object-capability tradition',
    },
    people:
      'Two builders or research groups who want their agents to collaborate inside one workspace without handing each other root access to their machines, keys, or private repos.',
    sections: [
      {
        title: 'Hospitality laws and attenuated seals',
        body: [
          'Diplomatic safe-conduct letters and medieval guild halls solved a recurring human problem: how strangers from rival houses work under one roof with bounded rights and a witnessed record of disputes. Playbox’s Biscuit grants are cryptographic safe-conducts, each holder can narrow a token before passing it on and can never widen it.',
          'Inside the room, Ed25519 hash-chained histories and sealed-holdout F3 challenges let rival proposers compete on a shared benchmark while catching a dev-set memorizer automatically.',
        ],
      },
      {
        title: 'Telepathy versus plain speech',
        body: [
          'Philosophers from Locke onward worried about how an idea in one mind crosses into another through words. Showing that a gated activation vector crosses from Qwen3 to OLMo-2 at 87.5%, and still loses to a single English word (71–77% vs 61–68%),is a healthy reminder that natural language is already a remarkably compressed, cross-architecture protocol.',
        ],
      },
    ],
    threads: ['power', 'trust', 'commons'],
    shelf: ['miller', 'hardy', 'ostrom', 'shapinSchaffer', 'quine'],
  },

  formasec: {
    epigraph: {
      text: 'Program testing can be used to show the presence of bugs, but never to show their absence!',
      by: 'Edsger W. Dijkstra, Notes on Structured Programming, 1970',
    },
    people:
      'Engineers deploying code-generating or tool-composing models in environments where “usually safe” is unacceptable and the trusted computing base has to fit in one person’s head.',
    sections: [
      {
        title: 'Proof-carrying proposals and small clerks',
        body: [
          'In double-entry counting houses and constitutional courts alike, the petitioner may argue however creatively they please, while the clerk checks a short, rigid list of invariants before stamping the writ. FormaSec turns that division of labor into software: 7 free LLMs or a hostile enumerator propose compositions; a tiny kernel checked across Python, Rust (Kani), and Lean 4 (`admitAlg`, `plan_sound`) decides admission.',
          'Lakatos’s monsters showed up right on schedule in `M6`, when a hostile proposer built a valid-looking diamond DAG with 2^n paths and exhausted 14 GB of RAM, forcing resource bounds into the formal plan alongside type soundness.',
        ],
      },
    ],
    threads: ['power', 'trust', 'measure'],
    shelf: ['dijkstra', 'lakatos', 'saltzer', 'miller', 'madison'],
  },

  'mech-interp-unified': {
    people:
      'Researchers and safety auditors trying to tell whether a “discovered circuit” or subspace is a real causal handle on behavior, or an artifact of residual norm damage and broken rulers.',
    sections: [
      {
        title: 'Who calibrates the ruler?',
        body: [
          'Nineteenth-century metrologists learned that before comparing two pendulums or thermometers, you have to test the ruler against thermal expansion and zero-drift. Our F2 planted-flaw audit asks that metrological question of mechanistic interpretability: if we deliberately plant eight classes of broken features and confounds, do current gates ring the alarm? Static rules caught zero; informed probes caught three.',
          'The J-space equivalence test tells the companion story. Against a random subspace, J-ablation looked strongly causal (+0.39 logits); against damage-equalized top-PCA (`pcanorm`), the advantage was 0.00 across OLMo-2-7B and Tulu-3. Meanwhile, Qwen3-1.7B replicated the Pythia agreement-unit gate at p = 0.000999. Better controls separate what survives from what merely sounded plausible.',
        ],
      },
    ],
    threads: ['measure', 'failure', 'memory'],
    shelf: ['lind', 'hill', 'rosenthal', 'quine', 'lakatos', 'feynman'],
  },

  'temporal-grid-safety': {
    people:
      'Anyone fine-tuning an open-weight model for a clinic, school, or business who wants domain adaptation not to quietly erase the model’s refusal boundaries.',
    sections: [
      {
        title: 'Catching your own thumb on the scale',
        body: [
          'Feynman’s Cargo Cult Science warns about the subtle ways an experimenter’s setup favors the desired arm. In versions v11–v15 our slow-parameter grid beat baselines handsomely because the attacker script had quietly inherited each arm’s learning-rate multiplier. Catching that in v16 killed the headline and saved the science.',
          'What survived on the clean harness, frozen discriminant adapters keeping 95% of held-out refusals under benign OOD drift where replay falls to 27%,answers Parfit’s continuity question in practical miniature: you cannot freeze a whole model against a white-box attacker, and you can preserve a specific behavioral commitment across everyday learning.',
        ],
      },
    ],
    threads: ['memory', 'failure', 'power'],
    shelf: ['feynman', 'lind', 'parfit', 'mccloskey', 'elster'],
  },

  'aligned-holistic-continual-learning': {
    epigraph: {
      text: 'Pensar es olvidar diferencias, es generalizar, abstraer.',
      by: 'Jorge Luis Borges, “Funes el memorioso”, 1942',
      lang: 'es',
      gloss: 'To think is to forget differences, to generalize, to abstract.',
    },
    people:
      'A tutor that is quietly updated overnight. A clinical summarizer that learns from corrections. A model on someone’s laptop that adapts to its owner. The person relying on any of them never agreed to a new system each Monday, and has no way to ask what changed.',
    sections: [
      {
        title: 'Forgetting has a long history',
        body: [
          'In the Phaedrus, Plato has Socrates tell the story of the god Theuth offering writing to the king of Egypt, who refuses it on the grounds that it will implant forgetfulness in people’s souls. Every technology of memory has since been argued over in the same terms: what it keeps, and what it quietly lets go. Hermann Ebbinghaus put numbers on human forgetting in 1885, with a curve measured on himself. A century later McCloskey and Cohen gave machine learning its own word for the problem, catastrophic interference.',
          'The older material is useful because it refuses to treat forgetting as only a defect. A system that cannot let go of anything cannot generalize, and a system that lets go of the wrong things has lost what we valued in it. The monitor in this project is asked to tell those two apart before an update ships.',
        ],
      },
      {
        title: 'The man who could not forget',
        body: [
          'Borges’s Funes remembers every leaf of every tree he has seen and every time he has seen it. He cannot think, because thinking is the forgetting of differences. Luria’s clinical study of a real man with an apparently limitless memory, published in 1968, reads like a documentary version of the same story: remembering everything turned out to be a burden on understanding anything.',
          'That is why this page reports retention harm and adaptation gain side by side, as paired quantities. A claim that an update is safer because the model forgot less is also, possibly, a claim that it learned less.',
        ],
      },
      {
        title: 'Comparing like with like',
        body: [
          'In 1747 James Lind divided twelve sailors with scurvy into six pairs aboard one ship, gave each pair a different remedy, and kept everything else as equal as he could. Citrus won. The design is the ancestor of the matched-progress gate here, which asks whether harm is lower at the same amount of learning, and not merely whether it is lower.',
          'The gate failed. A. Bradford Hill, writing about how to move from association to cause, was careful to call his nine considerations viewpoints, not rules. The failure is the part of this project worth the most, and the record keeps it.',
        ],
      },
      {
        title: 'A promise made before the change',
        body: [
          'Hannah Arendt thought promising was the human remedy for an unpredictable future: a way of binding oneself in advance, so that others can rely on what has not yet happened. A prediction locked before assessment works the same way. It is a promise about what the monitor will say, made before anyone knows whether it will be right.',
          'Promises can be broken and misjudged, which is why the admission kernel quarantines by default and asks for independent, held-out evidence before anything is admitted.',
        ],
      },
    ],
    threads: ['memory', 'measure', 'failure'],
    shelf: ['borges', 'luria', 'mccloskey', 'lind', 'hill', 'arendt', 'parfit'],
  },

  'theseus-lab': {
    people:
      'Anyone who has been handed an explanation of why a model did what it did and had to decide how much weight to put on it, such as an auditor, a regulator, a researcher or a user who asked why.',
    sections: [
      {
        title: 'A ship, a shrine, a person',
        body: [
          'Plutarch records that the Athenians preserved the ship in which Theseus returned from Crete, replacing its planks one by one as they rotted, until it became a standing example among philosophers of a thing that persists through change. Hobbes added the twist that is harder to answer: suppose someone collects the discarded planks and rebuilds the first ship. Which of the two is the ship of Theseus?',
          'At Ise in Japan the main shrine is rebuilt every twenty years on an adjacent plot, to the same plan, and has been, with long interruptions, since the late seventh century. There the answer is cultural: what persists is the form and the practice of renewal. Derek Parfit made a similar move about persons, arguing that what matters is continuity of connection and not sameness of material. This project asks what a comparable claim would require for a network whose parts are swapped.',
        ],
      },
      {
        title: 'Same behavior, different mind',
        body: [
          'Quine’s thought experiment of radical translation imagines a linguist hearing the word “gavagai” as a rabbit scurries by. All the speaker’s behavior, Quine argued, is compatible with several incompatible translations, and nothing observable settles the question. Behavior underdetermines meaning.',
          'The permutation result here is a small, exact instance. Reordering a network’s hidden units changed every selected position and left the behavior intact, which means any account of what “unit 417” does is an account of a labeling. A mechanism claim that does not survive a change of representation is a claim about the representation.',
        ],
      },
      {
        title: 'The null that stays in the notebook',
        body: [
          'In 1887 Michelson and Morley found nothing and said so, and the nothing turned out to matter. Robert Rosenthal’s file-drawer problem names what happens when nulls are not said: the literature drifts toward results that were easier to publish than to believe.',
          'Several experiments here are frozen before they run, so a miss by 10⁻⁴ is recorded as a miss even when a later analysis shows the cause was float32 rounding. Elster would recognize the logic. A gate that can be adjusted afterwards is not a gate, in the same way that a rope you can untie from the mast is not a rope.',
        ],
      },
    ],
    threads: ['memory', 'failure', 'power'],
    shelf: ['plutarch', 'hobbes', 'parfit', 'quine', 'rosenthal', 'elster'],
  },

  'security-alignment-os': {
    epigraph: {
      text: 'Ambition must be made to counteract ambition.',
      by: 'James Madison, The Federalist No. 51, 1788',
    },
    people:
      'The person who hands a task to an agent and cannot watch every step, and the people downstream of whatever the agent does while they are not watching.',
    sections: [
      {
        title: 'Power that cannot act alone',
        body: [
          'The Roman Republic’s answer to emergency was the dictator, a magistrate with sweeping authority and a term of at most six months. In the story Livy tells, Cincinnatus laid down the office after sixteen days. The point of the story was never the power. It was the expiry date.',
          'Montesquieu generalized the instinct into a rule that power should check power, and Madison made it practical: a government in which no part has to be trusted to restrain itself. A broker that lives in a separate process from the thing it brokers, and a capability that works once and then lapses, are that rule at small scale.',
        ],
      },
      {
        title: 'The warrant',
        body: [
          'The Fourth Amendment does not forbid searches. It requires that a warrant describe “the place to be searched, and the persons or things to be seized” with particularity. Authority is granted for an act, against a target, once. Everything that makes a warrant trustworthy sits in what it leaves out.',
          'The single-use capability in this design has the same shape. The agent proposes, evidence is reviewed, a narrow authorization is issued, the action happens inside a sandbox, and the authorization is spent. An agent that must come back for each act is slower than one with standing authority, and that slowness is the whole intent.',
        ],
      },
      {
        title: 'Rope and mast',
        body: [
          'Odysseus ordered his crew to bind him to the mast and to ignore his later orders to be freed. Jon Elster used the scene to define precommitment: restricting your future options because you expect your future self to be unreliable. Saltzer and Schroeder’s fail-safe defaults make the same bet for software, and the freeze-or-rollback step here does the same for an agent that fails a check.',
          'Norm Hardy’s “confused deputy” supplies the cautionary tale. A compiler running with the authority to write a billing file was tricked into overwriting it by a user who supplied the file’s name as its output. The deputy had real authority and no way to tell whose errand it was running, which is the situation of any agent acting for more than one principal.',
        ],
      },
    ],
    threads: ['power', 'trust'],
    shelf: ['montesquieu', 'madison', 'elster', 'saltzer', 'hardy', 'arendt'],
  },

  'composed-zk-benchmark-os': {
    epigraph: {
      text: 'When a measure becomes a target, it ceases to be a good measure.',
      by: 'Marilyn Strathern, on Goodhart’s law, 1997',
    },
    people:
      'The engineer choosing a proving system from a leaderboard, and the user who will one day depend on a proof without being able to read it.',
    sections: [
      {
        title: 'A treaty between strangers',
        body: [
          'Theodore Porter’s history of quantification argues that numbers earn their authority where trust is thin. Bureaucracies, professions and engineers adopt them because strangers can agree on a number when they cannot agree on a judgment. A benchmark is such an agreement.',
          'It is also, therefore, a target. Once a number decides who is believed, effort drifts toward the number. The design response here is to score what the backend rejects as well as what it accepts, so that a fast backend that accepts an invalid trace ranks below a slow one that refuses it.',
        ],
      },
      {
        title: 'Let the monsters in',
        body: [
          'Lakatos’s Proofs and Refutations stages a classroom argument over Euler’s formula for polyhedra. Each proof is met with a counterexample, a “monster”, and each monster forces the proof or its terms to improve. The lesson is that counterexamples are not interruptions to the work. They are the work.',
          'Fourteen classes of adversarial mutation play that part here: they take a valid trace, damage it in a known way, and expect rejection. If a backend accepts the damaged trace, the proof had a gap.',
        ],
      },
      {
        title: 'Proving without telling',
        body: [
          'Goldwasser, Micali and Rackoff showed in 1985 that one can convince another party of a fact without revealing why it is true. Quisquater and colleagues later explained the idea with a cave that has a magic door: a prover who knows the word can leave by whichever exit the verifier names, and a prover who does not will be caught about half the time, so repeating the test drives the odds down.',
          'The cave carries a quiet warning for benchmarks. Emerging from the correct exit proves nothing once. It proves something only across many challenges the prover could not predict, which is why the mutation classes are varied and the claims here stay at Level 1.',
        ],
      },
      {
        title: 'Presence, never absence',
        body: [
          'Dijkstra put it plainly in 1970: testing can show the presence of bugs, never their absence. Roughly eighty phases of attempts to produce a kernel-checked witness did not produce one, and the record says so. A passing test suite on this page is evidence that nothing has gone wrong yet.',
        ],
      },
    ],
    threads: ['measure', 'trust', 'failure'],
    shelf: ['porter', 'strathern', 'lakatos', 'gmr', 'quisquater', 'dijkstra'],
  },

  hyperintel: {
    epigraph: {
      text: 'Nullius in verba',
      by: 'Motto of the Royal Society, 1660s, usually glossed “take nobody’s word for it”',
      lang: 'la',
    },
    people: 'Anyone paying for a result they cannot inspect, and anyone selling one who would like to be believed.',
    sections: [
      {
        title: 'Receipts before writing',
        body: [
          'Denise Schmandt-Besserat argued that the clay tokens of the ancient Near East, sealed inside hollow clay envelopes as records of goods owed, were an early step toward writing. The claim is debated in its details. The intuition is hard to shake: accounting came first, and the proof of an obligation had to travel between people who could not meet.',
          'The English Exchequer later split wooden tally sticks lengthwise, so that debtor and creditor each held a half that fit only its partner. In 1494 Luca Pacioli set out double-entry bookkeeping in print, and Mary Poovey has argued that the habit of recording transactions in checkable form helped create the modern idea of a fact. A receipt that verifies offline belongs to this line.',
        ],
      },
      {
        title: 'Whose word counts',
        body: [
          'The Royal Society’s motto declined to take anyone’s word, and the Society nonetheless depended on whose word it took. Steven Shapin’s social history of truth shows that seventeenth-century experimenters relied on the testimony of gentlemen, because gentlemen were presumed to have no reason to lie. Shapin and Schaffer’s account of Boyle’s air-pump adds that witnesses were also staged, with the experiment written up so that readers could feel they had been there.',
          'The design here swaps the gentleman for a registry the verifier supplies. A receipt is checked against keys the caller already trusts, and not against keys the receipt brings with it. Trust has not been removed. It has been moved somewhere a stranger can inspect.',
        ],
      },
      {
        title: 'Markets that cannot see quality',
        body: [
          'George Akerlof’s 1970 paper on used cars explained how a market can collapse when buyers cannot distinguish good goods from bad: sellers of good goods leave, and the average quality falls. An inference marketplace has the same problem in a new form. A buyer cannot tell whether the model they paid for served their request.',
          'Hayek’s point that knowledge is dispersed and no single party sees it all sets the limit of the answer. Evidence-carrying receipts let the buyer check a claim about the past. They do not make a market, which is why the page says that nothing here is live.',
        ],
      },
    ],
    threads: ['trust', 'commons'],
    shelf: ['schmandt', 'pacioli', 'poovey', 'shapin', 'shapinSchaffer', 'akerlof', 'hayek'],
  },
}
