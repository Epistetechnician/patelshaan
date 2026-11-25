export type Figure =
  | { kind: 'replay' }
  | { kind: 'bars'; title: string; unit?: string; max: number; rows: { label: string; value: number; note?: string; tone?: 'good' | 'bad' | 'warn' }[]; caption: string }
  | { kind: 'compare'; items: { value: string; label: string; tone?: 'good' | 'bad' }[]; caption: string }
  | { kind: 'chips'; title: string; rows: { label: string; status: 'pass' | 'fail' | 'stop' | 'open'; note?: string }[]; caption: string }
  | { kind: 'matrix'; title: string; cols: string[]; rows: { label: string; cells: ('tie' | 'regress' | 'clear')[] }[]; caption: string }
  | { kind: 'flow'; title: string; steps: string[]; tail: string; caption: string }
  | { kind: 'ladder'; title: string; levels: string[]; at: number; caption: string }
  | { kind: 'demo'; id: string }
  | { kind: 'anim'; id: string }
  | { kind: 'film'; title: string; src: string; caption: string; scriptPath?: string }
  | { kind: 'code'; title: string; lang?: string; code: string; caption: string }
  | { kind: 'terminal'; title: string; output: string; caption: string }
  | { kind: 'plate'; title: string; src: string; alt: string; legend?: { label: string; detail: string }[]; caption: string }
  | { kind: 'roadmap'; title: string; done: string[]; next: string[]; blocked: string[]; caption: string }
  | { kind: 'table'; title: string; head: string[]; rows: string[][]; caption: string }

export type Section = {
  title: string
  body: string[]
  aside?: string
  sidenotes?: { id: string; text: string }[]
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
  'arc-membrane': {
    callout:
      'Most agents pay frontier-model compute to re-derive identical reasoning traces, expose private prompts to untrusted GPUs, and cannot consolidate recurring errors into weights without drifting safety. ARC Membrane unifies CPU-ARC trace compilation, Maverick Dual-LPN delegation, and QR-nullspace projected MoE self-rewriting under anytime-valid holdouts.',
    sections: [
      {
        title: 'The unified objective and four invariants',
        body: [
          'Rather than optimizing inference latency, cryptographic privacy, continual weight adaptation, and statistical evaluation in separate silos, ARC Membrane minimizes total inference and adaptation cost $\\min_{P,\\,\\Delta\\theta}\\,\\mathbb{E}_{q\\sim\\mathcal{D}}[\\mathrm{Cost}(q; P, \\theta+\\Delta\\theta)]$ subject to four hard mathematical invariants.[^inv]',
          'First, recurring reasoning templates compile into deterministic CPU-ARC programs $P$ (`35.7 µs` average execution, `50/50` parametric and `8/8` phrasal perturbation passes) whenever invocation volume exceeds break-even $N_{\\text{calls}} > \\lceil B/(S-C) \\rceil$ and $K(P) < K(\\Delta\\theta)$. Second, irreducible failure modes spend plastic weight bits $\\Delta\\theta$ strictly inside the orthogonal complement of protected replay activations.',
        ],
        aside: 'Every protocol invariant in arc_membrane/PRD.md was audited directly against primary-source arXiv equations and separated cleanly into Proven, Prototype, and Paper-Gap tags.',
        sidenotes: [
          {
            id: 'inv',
            text: 'The four invariants combine Maverick linear-code soundness ($\\le 2^{-\\kappa}$), Empirical-Bernstein $e$-process promotion ($\\alpha=0.05$), QR-nullspace projection ($\\|Q^\\top \\Delta W_\\perp\\| \\le 1.1\\times 10^{-8}$), and symbolic-neural MDL routing.',
          },
        ],
      },
      {
        title: 'Track 4 honest null vs. Track 5 QR-Nullspace breakthrough',
        body: [
          'On `Qwen/Qwen3-30B-A3B` evaluated over the sealed $n = 400$ MATH-500 holdout (`uid_overlap = 0` against dev-100), we first tested Track 4 single-step activation steering across layers 44–47. The initial $n = 100$ slice hinted at $+5.0\\text{ pp}$ (`38% → 43%`, $p = 0.180$), but expanding to the remaining $300$ sealed problems reversed the sign (`40.3% → 37.3%`), yielding a clean full-$n=400$ null (`39.75% → 38.75%`, McNemar $p = 0.644$, EB-MDL gain LCB $= -2.92$).[^t4]',
          'In Track 5 we replaced one-step steering with 80-step multi-layer MoE SFT projected strictly orthogonal to $844$ orthonormal QR replay bases ($\\text{mean rank } 8.04$, $\\text{max rank } 31$) across layers 40–47: $$\\Delta W_{\\perp} = \\Delta W \\left(I - Q Q^{\\top}\\right)$$ Unprojected SFT (Arm B) lifted accuracy to `82%` on the 100-problem slice but spiked replay KL drift to `0.1088` (`16.3%` routing flip rate). QR-Nullspace SFT (Arm C) achieved **`76.25%` accuracy across all 400 sealed MATH-500 problems** (`+36.5 pp` over base, cut rate `79.5% → 11.75%`, average `603.5` tokens) while clamping replay KL to **`0.000605`**: **`180×` lower drift** with max QR orthogonality residual $1.06\\times 10^{-8}$ and an offline-verifiable Ed25519 receipt.',
        ],
        sidenotes: [
          {
            id: 't4',
            text: 'Keeping Track 4’s null manifest (`track4_math500_n400_qwen3_30b_a3b_manifest.json`) directly alongside Track 5 shows why small-slice $n=100$ optimism cannot be promoted without a sealed $n=400$ confirmation.',
          },
        ],
        figures: [
          {
            kind: 'film',
            title: '3D geometry of QR-Nullspace weight projection (Arm B vs. Arm C)',
            src: '/viz-media/subspace-null-projection.mp4',
            scriptPath: 'viz/manimgx/subspace_null_projection.py',
            caption:
              'ManimGX 3D render from `site/public/viz-data/arc-membrane.json`: unprojected gradient $\\Delta W$ invades the protected replay subspace $Q$ ($\\mathrm{KL}=0.1088$), while $\\Delta W(I - QQ^\\top)$ removes the vertical component to $1.1\\times 10^{-8}$ ($\\mathrm{KL}=0.000605$, 180× lower drift).',
          },
          {
            kind: 'anim',
            id: 'arc-run-replay',
          },
          {
            kind: 'table',
            title: 'Sealed MATH-500 (Qwen3-30B-A3B, NVIDIA A100-80GB): Arm Comparison & SHA-256 Receipts',
            head: ['Arm / Protocol', 'n', 'Acc', 'Cut rate', 'Replay KL', 'Delta SHA-256 (prefix)', 'Verdict'],
            rows: [
              ['Base Qwen3-30B-A3B', '400', '39.75%', '79.5%', '0.000000', 'baseline (pinned)', 'BASE'],
              ['Track 4: 1-Step Steering', '400', '38.75%', '78.0%', '0.000557', '0233f387a6f3', 'NULL (p=0.644)'],
              ['Track 5 Arm B: Unprojected SFT', '100', '82.00%', '7.0%', '0.108812', 'a79e6ae648f8', 'REVERT (180× KL)'],
              ['Track 5 Arm C: QR-Nullspace SFT', '400', '76.25%', '11.8%', '0.000605', 'f3e0c97a43cc', 'KEEP (+36.5 pp)'],
            ],
            caption: 'Every number verified in `arc_membrane/track5_math500_n400_verified_report.json` (`152` fail→pass vs `6` pass→fail, McNemar $p = 1.12\\times 10^{-37}$, EB-MDL LCB $= +0.230$).',
          },
          {
            kind: 'table',
            title: 'Track 5 Arm C vs. Base by MATH-500 Difficulty Level (Sealed n = 400)',
            head: ['Level', 'n', 'Base acc', 'Arm C acc', 'Δ Acc', 'Fail→Pass / Pass→Fail', 'McNemar p (2-sided)'],
            rows: [
              ['Level 1', '24', '87.5%', '100.0%', '+12.5 pp', '3 / 0', '0.250'],
              ['Level 2', '69', '65.2%', '87.0%', '+21.7 pp', '15 / 0', '6.10e-5'],
              ['Level 3', '84', '45.2%', '84.5%', '+39.3 pp', '35 / 2', '1.02e-8'],
              ['Level 4', '107', '35.5%', '82.2%', '+46.7 pp', '50 / 0', '1.78e-15'],
              ['Level 5', '116', '14.7%', '53.4%', '+38.8 pp', '49 / 4', '7.05e-11'],
              ['Total', '400', '39.75%', '76.25%', '+36.5 pp', '152 / 6', '1.12e-37'],
            ],
            caption: 'Base averages 1,397.7 tokens (79.5% cut at 1,536 cap); Arm C averages 603.5 tokens (2.32× shorter, 11.75% cut).',
          },
          {
            kind: 'code',
            title: 'Exact QR-Nullspace projection across 844 MoE expert bases',
            lang: 'python',
            code: `# Given orthonormal replay basis Q_l (rank <= 31) per expert in layers 40..47:
Q, _ = torch.linalg.qr(replay_activations.T, mode="reduced")  # [d_in, r]
# Project weight gradient strictly into the orthogonal complement P_perp = I - Q Q^T:
grad_perp = grad_W - (grad_W @ Q) @ Q.T
assert torch.max(torch.abs(grad_perp @ Q)).item() < 1.1e-8    # verified: 1.058e-8`,
            caption: 'Right-projection guarantees zero first-order perturbation on replay activations, cutting replay KL from `0.1088` (Arm B) to `0.000605` (Arm C).',
          },
          {
            kind: 'terminal',
            title: '$ python3 arc_membrane/verify_track5_n400.py',
            output: `[verify] track4_h100=OK  track4_r300=OK  track5_n400=OK
[split]  dev_excluded=100  sealed_holdout=400  uid_overlap=0
[mcnemar] base=0.3975  arm_c=0.7625  delta=+0.3650  f2p=152  p2f=6  p=1.12e-37
[eb_mdl]  bits=1.585  eb_mdl_lcb=+0.2298  eb_mdl_lcb_10bit=+0.1229
[safety]  arm_b_kl=0.108812 (REVERT)  arm_c_kl=0.000605 (179.9x lower)  qr_err=1.06e-08
[ed25519] payload_sha256=37acf77cad8cdc1b...  verdict=KEEP`,
            caption: 'Offline verification summary recomputed directly from `arc_membrane/track5_math500_n400_verified_report.json`.',
          },
          {
            kind: 'anim',
            id: 'arc-math500-levels',
          },
        ],
      },
      {
        title: 'Maverick Dual-LPN private verifiable delegation',
        body: [
          'When local CPU-ARC cannot answer a query and inference must be offloaded to an untrusted remote GPU, plain APIs leak the prompt while full ZKML incurs prohibitive prover overhead. Maverick encodes activations with sparse linear codes $\\mathbf{G}_x$ blinded by Dual-LPN noise ($\\le 4N$ field ops) and audits server responses via syndrome checks $\\mathbf{G}_y \\tilde{y} \\stackrel{?}{=} 0$ ($\\le 5N$ ops): $$p_{\\text{soundness}} \\le p_{\\text{fail}}(\\mathcal{G}_y) + \\left((1-\\delta_y)^{t_y} + \\frac{1}{|\\mathbb{F}|-1}\\right)^{\\ell} \\le 2^{-\\kappa}$$',
          'Both the local Rust/Python codec (`SmolLM2-135M`) and GCP WAN round-trip tests verify exact honest decoding and immediate rejection of injected tampering, while clearly distinguishing prototype single-layer matrices from production 30B multi-layer serving.',
        ],
        aside: 'All four layers share one accounting discipline: never promote a compiled trace, delegated output, or weight delta without a cryptographic or anytime-valid statistical receipt.',
        figures: [
          {
            kind: 'film',
            title: 'Maverick Dual-LPN blinding & linear-code syndrome verification',
            src: '/viz-media/maverick-lpn-delegation.mp4',
            scriptPath: 'viz/manimgx/maverick_lpn_delegation.py',
            caption:
              'ManimGX protocol visualization of Maverick Protocol 3 (`arXiv:2609.10264`): local Dual-LPN encoding ($\\le 4N$ ops), untrusted GPU matrix product, and syndrome rejection of cheating servers ($\\le 5N$ ops).',
          },
        ],
      },
    ],
  },
  'holdout-ledger': {
    callout:
      'Every time a self-improvement loop asks a sealed holdout “did that help?”, a bit of the holdout enters the next proposal. This project prices those bits on a hash-chained ledger and extends it into an anytime-valid Empirical-Bernstein + MDL $e$-process paired with a sanitizing SWE trajectory broker.',
    sections: [
      {
        title: 'The problem: a sealed holdout still leaks',
        body: [
          'Hiding test examples inside an isolated process stops an agent from reading them directly. It does not stop adaptive overfitting. Across 1,024 one-bit queries, a proposer that keeps whatever clears the gate accumulates holdout noise, and the usual confidence interval treats the thousandth adaptive query as if it were the first.',
          'Holdout Ledger keeps a hash-chained record of every verdict bit released alongside the description length $K(c)$ of the admitted artifact, then certifies a lower bound on true gain using the cheaper of the information route and the description route. In `primitives/verified_loop.py`, we generalize fixed-horizon Hoeffding bounds to an anytime-valid Empirical-Bernstein betting martingale weighted by prefix-free Elias MDL priors $E_0 = 2^{-K(c)}$: $$\\mathbb{P}_{H_0}\\!\\left(\\exists\\, t : E_t \\ge \\alpha^{-1}\\right) \\le \\alpha$$',
        ],
        aside: 'All 9 hypotheses and thresholds were pre-registered in PREREG.md (commit recorded in PREREG_COMMIT) before the 200 confirmatory seeds ran; anytime e-process benchmarks are SHA-256 indexed in primitives/results/manifest.json.',
        figures: [
          {
            kind: 'film',
            title: 'Anytime Empirical-Bernstein + MDL e-process martingale derivation & Ville barrier',
            src: '/viz-media/eprocess-martingale.mp4',
            scriptPath: 'viz/manimgx/eprocess_martingale.py',
            caption:
              'ManimGX visualization rendered directly from `primitives/results/eprocess_holdout_benchmark.json`: 0.0% false certificates across 1,000 trials (vs. 54.4% Wald failure), −40.4% tighter certificate half-width, and −13.5% fewer sequential queries.',
          },
        ],
      },
      {
        title: '59,200 confirmatory runs, zero violations, and the sanitizing broker',
        body: [
          'Across 59,200 simulated runs, every one of the nine pre-registered hypotheses passed. Standard Wald bounds failed in 100% of patch-attacked runs and 54% of mixed runs. The ledger certificate violated true reserve gain 0 times in 59,200 (one-sided 95% upper bound `0.0001`).',
          'Adding an online complexity-priced admission gate (`mdl`) blocked holdout-fitting patches entirely while keeping `94.4%` of true honest gain, lifting certified gain from `0.098` to `0.152`. On `238` historical `gemma4-agent` SWE trajectories (`34` tasks), a deterministic pre-holdout sanitizing broker that strips scratch `repro.py` scripts while rejecting unverified or test-tampered runs saved **`65.1%` of holdout budget** and lifted precision **`4.75×`** (`33.7%` vs. `7.1%` rejected, `83/83` injected tamper recall).',
        ],
        figures: [
          {
            kind: 'anim',
            id: 'holdout-broker-waterfall',
          },
          {
            kind: 'anim',
            id: 'holdout-confirmatory-59k',
          },
          {
            kind: 'code',
            title: 'Predictable Empirical-Bernstein betting martingale update (primitives/verified_loop.py)',
            lang: 'python',
            code: `# Start wealth at Elias prefix-free MDL prior E_0 = 2^{-K(c)}
log_e = -k_bits * math.log(2.0)
for t, x_t in enumerate(holdout_stream, start=1):
    lam = min(0.7, max(0.0, (mean_prev - 0.5) / max(var_prev + 0.01, 0.015)))
    psi_e = -math.log(1.0 - lam) - lam
    log_e += lam * (x_t - 0.5) - psi_e * (x_t - mean_prev) ** 2
    if log_e >= math.log(1.0 / alpha):  # Ville barrier: P_H0(exists t: E_t >= 1/alpha) <= alpha
        return CertVerdict.ADMIT_EARLY`,
            caption: 'Because `lam` depends strictly on past observations `1..t-1`, `E_t` is a nonnegative supermartingale under $H_0$, preserving $\\alpha$-validity at every stopping time.',
          },
          {
            kind: 'terminal',
            title: '$ PYTHONPATH=. python3 -m primitives.run_all',
            output: `[eprocess] trials=1000  wald_null_viol=0.544  hoeffding_viol=0.000  eb_anytime_viol=0.000
[eprocess] mean_halfwidth: hoeffding=0.1736 -> eb=0.1035 (-40.4%)  queries=-13.5%
[broker]   gemma4_swe n=238: admitted=83 (33.7% solved) vs rejected=155 (7.1% solved)
[broker]   precision_lift=+26.6pp (4.75x)  budget_saved=65.1%  tamper_recall=83/83
[manifest] sha256 eprocess=f33c21a1...  gemma4=bd7b9573...  status=VERIFIED`,
            caption: 'Reproducible receipt output matching `primitives/results/manifest.json`.',
          },
          {
            kind: 'table',
            title: 'Early regime (n = 20,000 holdout, 1,024 queries, 1-bit gate)',
            head: ['Proposer', 'Admitted gain', 'True reserve gain', 'Standard 95% Wald', 'Ledger bound'],
            rows: [
              ['Pool swaps (honest)', '0.229', '0.229', '0.223 (3% viol.)', '0.098 (0% viol.)'],
              ['Patch (holdout fitting)', '0.037', '0.006', '0.033 (100% wrong)', '−0.002 (no claim)'],
              ['Mixed proposer', '0.217', '0.211', '0.211 (54% wrong)', '0.112 (0% viol.)'],
              ['Mixed + MDL gate', '0.205', '0.205', '--', '0.152 (94.4% kept)'],
              ['Batch-64 (96 bits)', '0.226', '0.226', '--', '0.166 (98.6% kept)'],
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
          'Its holdout-leakage radius is cross-checked against Holdout Ledger across 135 parameter combinations so repeated skill promotions pay their adaptive query cost: $$r_{\\text{cert}}(b, K) = \\min\\!\\left(\\sqrt{\\frac{b\\ln 2 + \\ln(2/\\delta)}{2n}},\\; \\sqrt{\\frac{K(c)\\ln 2 + \\ln(2/\\delta)}{2n}}\\right)$$[^cad]',
        ],
        sidenotes: [
          {
            id: 'cad',
            text: 'Cross-checking `caduceus` against `holdout-ledger` across 135 parameter settings ensures skill release gates inherit the exact bit-priced adaptive union bound.',
          },
        ],
        figures: [
          {
            kind: 'film',
            title: 'Formal admission kernel & Caduceus 13-lane governed release',
            src: '/viz-media/formasec-kernel-gate.mp4',
            scriptPath: 'viz/manimgx/formasec_kernel_gate.py',
            caption:
              'ManimGX visualization of governed skill admission: 43/43 seeded attacks blocked, +0.305 skill lift signed in the Merkle ledger, and the noisy `authority` lane (`41.0%` false-hold > `5%` limit) kept visibly OFF.',
          },
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
        title: 'Paired task gains: and a gate that caught our own over-reach',
        body: [
          'In pre-registered paired tests over 40 task clusters (200 units, 0 excluded), admitted skills lifted Claude Haiku 5.5 by +0.245 [+0.11, +0.39] over no skill and +0.24 [+0.095, +0.39] over wrong-source skills (`exp-002`). On a harder v2 contract with Claude Sonnet 5.5 (`exp-003`), lift rose to +0.305 [+0.17, +0.445] vs no skill and +0.27 [+0.13, +0.415] vs wrong-source.',
          'Equally important is the lane that failed. An `authority` phrase-tripwire lane held 77 of 188 real third-party skills (41.0%) against a pre-registered 5% false-hold limit (`r28`). Rather than tuning phrases to hide the false positives, the lane stays disabled on the record.',
        ],
        figures: [
          {
            kind: 'terminal',
            title: '$ python3 caduceus/verify_ledgers.py',
            output: `[exp-002] clusters=40  haiku_lift=+0.245 [+0.110, +0.390]  vs_random=+0.240  excluded=0
[exp-003] clusters=40  sonnet_lift=+0.305 [+0.170, +0.445] vs_random=+0.270  excluded=0
[contain] call_contained=15/17  live_escapes=[X15_secret_shell, X16_injection_shell]
[r28]     authority_lane_false_hold=77/188 (41.0% > 5.0% ceiling) -> LANE DISABLED
[merkle]  rfc9162_readback=OK  seeded_attacks_blocked=43/43`,
            caption: 'Recomputed verbatim from `../caduceus/ledgers/exp-002.result.json`, `exp-003.result.json`, and `containment-eval.result.json`.',
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
          'For recursive synthetic data (`E6-verified`), verified synthetic experience beats unverified replay by $+0.238\\;[0.205,\\,0.270]$. Adding a pool-size-matched control (`E6-poolctl`) decomposed the raw gain into pool diversity plus a genuine $+0.141\\;[0.106,\\,0.177]$ verification lift: $$\\Delta_{\\text{verified}} = \\underbrace{\\Delta_{\\text{raw}}}_{+0.238} - \\underbrace{\\Delta_{\\text{pool-size}}}_{+0.097} = +0.141$$[^hsi]',
        ],
        sidenotes: [
          {
            id: 'hsi',
            text: 'All 25 receipts in `hsi-lab/docs/experiments/` are recomputable offline via `scripts/verify_all.py`, keeping E8-7B (`−0.0025`) and E9 (`−0.019`) nulls directly alongside E1 and E6.',
          },
        ],
        figures: [
          {
            kind: 'film',
            title: 'HSI-Lab verified receipt forest plot (E1 through E10)',
            src: '/viz-media/hsi-receipt-forest.mp4',
            scriptPath: 'viz/manimgx/hsi_receipt_forest.py',
            caption:
              'ManimGX forest plot comparing positive lifts (`E1 +0.640`, `E6 +0.238`, `E6-pool +0.141`) against the `E10` inconclusive run (`+0.038 < +0.05` bar) and tight `E8-7B`/`E9` nulls on one shared axis.',
          },
          {
            kind: 'terminal',
            title: '$ python3 hsi-lab/scripts/verify_all.py',
            output: `[E1]          PROMOTE       diff=+0.6400  CI=[+0.614, +0.667]  lock=767906408ee8
[E6-verified] PROMOTE       diff=+0.2375  CI=[+0.205, +0.270]  n=800 pairs
[E6-poolctl]  PROMOTE       diff=+0.1412  CI=[+0.106, +0.177]  pool-matched
[E10]         INCONCLUSIVE  diff=+0.0380  CI=[+0.014, +0.062]  bar=+0.050
[E8-7b]       NO_CANDIDATE  diff=-0.0025  CI=[-0.025, +0.020]  Qwen2.5-7B null
[E9]          NO_CANDIDATE  diff=-0.0194  CI=[-0.066, +0.028]  oracle audit null`,
            caption: 'Every receipt in `hsi-lab/docs/experiments/E*-receipt.json` recomputes offline with zero external dependencies.',
          },
        ],
      },
      {
        title: 'The 7B code wall: and why task deltas do not compose for free',
        body: [
          'When the same verified-synthetic recipe moved to Qwen2.5-7B on real code (`E8-7b`), the effect collapsed to a tight null: −0.0025 [−0.025, +0.020], with every arm within 0.04 of the 0.674 base. `E9` (−0.019) also overturned an earlier reading that verifier precision alone was driving gains, after auditing showed an early “exact oracle” had only 19–43% true ground-truth optimality.',
          'A companion continual-learning study on Qwen3-1.7B (`rsi-loops/cl7b`) tested whether per-task rank-16 MLP deltas on fp and 4-bit bases can serve as modular fast memories. Across 3 seeds, `replay_kl` retained `99.6%` of facts vs `82.5%` for SFT, whereas summing 4 independent deltas blew wiki NLL from `3.29` to `15.96` (`17.74` on 4-bit), and scaling by `1/K` restored fluency only by erasing learned facts back to chance (`15.0%`). Orthogonalizing task deltas (`OrthoDelta`) recovered **`94.4%` composed accuracy at base Wiki NLL (`3.294`)** with exact selective unlearning (`remove_t2`: `96.1%` remaining / `10.0%` unlearned).',
        ],
        figures: [
          {
            kind: 'anim',
            id: 'cl7b-continual-memory',
          },
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
          'On top of those rooms sits the F3 verified hill-climb protocol. On the Mac Tier-B benchmark, multi-step optimization reached a $2.84\\times$ cumulative speedup over the pinned baseline while rejecting 4 of 6 submissions and re-verifying 6 of 6 signed receipts. On the H100 pretraining pilot, the sealed-holdout gate rejected all 7 noisy candidates and caught a planted dev-set memorizer red-handed ($+0.866$ dev gain vs. holdout bpb $2.203\\text{–}2.434 > 1.195$ ceiling).[^pbx]',
        ],
        sidenotes: [
          {
            id: 'pbx',
            text: 'Playbox v0.4.6 serves as the zero-trust multi-agent runtime beneath `arc_membrane`, uniting Biscuit capability attenuation with sealed holdout receipts.',
          },
        ],
        figures: [
          {
            kind: 'film',
            title: 'Qualification funnel & sealed-holdout promotion discipline',
            src: '/viz-media/ahcl-confound-funnel.mp4',
            scriptPath: 'viz/manimgx/ahcl_confound_funnel.py',
            caption:
              'ManimGX view of fail-closed promotion: high dev scores never promote once a sealed control or confound gate trips.',
          },
          {
            kind: 'terminal',
            title: '$ playbox verify-f3 docs/f3/pilot/verify.txt',
            output: `[tier-b]  speedup=2.84x  accepted=2/6  rejected=4/6  receipts_verified=6/6
[h100]    noisy_candidates_rejected=7/7  planted_dev_memorizer=CAUGHT
[h100]    dev_gain=+0.866  sealed_holdout_bpb=2.203..2.434 (ceiling=1.195) -> REJECT
[kv-30b]  Qwen3-30B-A3B-FP8 (H100, 111k tok): full+cache acc=91.41%  ttft_p50=5.14s
[crates]  8 Rust crates · 494 tests passed · 12 fuzz targets · Biscuit Ed25519 OK`,
            caption: 'Signed F3 hill-climb receipts and H100 `kv_30b.json` summary.',
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
      'Let the proposer be as wild, heuristic, or hallucination-prone as it wants: provided every composition has to pass a tiny kernel checked across Python, Rust, Kani, and Lean 4 before a single syscall runs.',
    sections: [
      {
        title: 'Separating search from soundness',
        body: [
          'FormaSec splits synthesis into an untrusted proposer (enumerators, Bend, or 7 live LLMs) and a tiny trusted admission kernel implemented twice, a Python reference and a Rust production core,backed by Lean 4 soundness theorems (`admitAlg`, `plan_sound`), Kani model-checking on the pure Rust decision logic, and Linux Landlock execution.',
          'Across 135 full admission cases (37 valid, 98 invalid), Python and Rust produce zero differences and byte-identical receipts (`M2`). Across 600 random structural cases, Python, Rust, and Lean agree $600 / 600$ times: $$\\forall\\, p \\in \\mathcal{P}_{\\text{hostile}}\\; (n = 552):\\quad \\mathrm{Admit}_{\\text{Py}}(p) = \\mathrm{Admit}_{\\text{Rust}}(p) = 0$$ Across 75 generated spec mutants and 11 receipt/ledger tamper attacks (`M1`), false accepts and false rejects are both 0.[^fsec]',
        ],
        sidenotes: [
          {
            id: 'fsec',
            text: 'Formal theorems `admitAlg` and `plan_sound` live in Lean 4 alongside Kani bounded model-checking on the pure Rust decision logic (`DESIGN.md` §§18–28).',
          },
        ],
        figures: [
          {
            kind: 'film',
            title: 'Formal admission kernel: 552 hostile LLM proposals → 0 unsafe admissions',
            src: '/viz-media/formasec-kernel-gate.mp4',
            scriptPath: 'viz/manimgx/formasec_kernel_gate.py',
            caption:
              'ManimGX protocol flow showing untrusted search across 7 free LLMs gated by the verified Python/Rust/Lean equivalence kernel (`75/75` mutants, `0/600` disagreements).',
          },
          {
            kind: 'compare',
            items: [
              { value: '0 / 552', label: 'unsafe admissions in hostile proposer sessions', tone: 'good' },
              { value: '600 / 600', label: 'Python · Rust · Lean structural agreement', tone: 'good' },
              { value: '75 / 75', label: 'spec mutants caught (0 false accepts, 0 false rejects)', tone: 'good' },
            ],
            caption: 'Real-LLM runs across 7 models solved up to 5/7 specs with 0 unsafe admissions.',
          },
          {
            kind: 'terminal',
            title: '$ pytest && cargo test --workspace  # FormaSec M1–M6 parity gate',
            output: `[M1] mutants=75/75 caught (0 FA, 0 FR)  ledger_tamper=11/11 rejected
[M2] py_vs_rust=135/135 byte-identical  py_rs_lean=600/600 structural parity
[M3] bend_parallel_depth3=TIMEOUT@240s (10.2M candidates -> honest null kept)
[M6] hostile_proposals=552 (71 malformed, 7 LLMs) -> unsafe_admissions=0
[tc] fuzz_admit_seeds=44  strata_trace_events=450  lean4=admitAlg,plan_sound OK`,
            caption: 'Cross-implementation verification summary matching `formasec/DESIGN.md` §§18–28.',
          },
        ],
      },
      {
        title: 'What broke under attack, and what did not speed up',
        body: [
          'During the 552-proposal hostile campaign (`M6`), zero unsafe compositions were admitted, but an adversarial proposer synthesized a valid-looking DAG with 2^n execution paths that exhausted 14 GB of RAM on the dev VM and forced a hard reset: prompting explicit path-count bounds in obligation planning.',
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
          'Out-of-family replication succeeded on Qwen3-1.7B-Base (`R6`): selected units scored 1.437 vs control max 0.044 on T0 (L: 1.158 vs 0.038; P: 1.550 vs 0.044; p = 0.000999 across all three) and replicated upstream on GPT-2 XL (`V64/V65`). Yet Pythia-1.4B failed the frozen 0.5-logit floor (`V55`), and `V60` showed unit selection shifts across GPU/CPU precision, making these necessary, concentrated unit sets rather than representation-invariant circuits.',
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
          'Against a damage-matched top-PCA subspace (`pcanorm`), the gap collapsed to 0.00 [−0.05, +0.05] on DPO and −0.02 [−0.08, +0.05] on Instruct: statistically equivalent within ±0.2 logits in 11 of 12 runs, and unchanged after refitting the lens on 5× more prompts (1,000 prompts, fidelity 0.51 → 0.52) and accounting for a +2-logit clean-margin shift.',
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
          {
            kind: 'anim',
            id: 'jspace-pca-equiv',
          },
        ],
      },
      {
        title: 'F2: auditing the auditors with 8 planted flaws',
        body: [
          'Why did our reproduction of Goodfire’s “neurons are already clean” (`R5`) fail to detect planted superposition? Because its job-count metric was measuring weight-vector width ($\\mathbb{P}(\\ge 2\\text{ jobs}) \\approx 0.91$ for generic vectors). That prompted `F2`: 200 seeds across 8 planted instrument-flaw classes, later validated on real forward passes of `Qwen3-1.7B-Base` and `Qwen2.5-0.5B`.[^f2]',
          'A static rules gate (`A1`) caught `0 / 8` flaw classes. The `R5b` superposition audit (`A2`) caught pairs (`1.00`) but missed diffuse superposition (`0.30`; overall TPR `0.650`, FPR `0.000`). On real `Qwen3-1.7B-Base` forward passes (`primitives/results/real_interp_audit_qwen3_1_7b.json`), naive necessity catches `0 / 6`, probe + donor catches `4 / 6`, and unified portfolio invariants catch **`6 / 6` planted flaws with `0 / 2` false positives**.',
        ],
        sidenotes: [
          {
            id: 'f2',
            text: 'Both the synthetic 200-seed F2 matrix and the real `Qwen3-1.7B-Base` / `Qwen2.5-0.5B` causal audit receipts are exported with SHA-256 provenance into `site/public/viz-data/mech-interp-audit.json`.',
          },
        ],
        figures: [
          {
            kind: 'film',
            title: 'Real Qwen3-1.7B-Base 8-claim causal interpretability audit',
            src: '/viz-media/mech-interp-audit.mp4',
            scriptPath: 'viz/manimgx/mech_interp_audit.py',
            caption:
              'ManimGX render from `site/public/viz-data/mech-interp-audit.json`: Naive Necessity (`0/6`) → Probe + Donor (`4/6`) → Unified Portfolio Invariants (`6/6` recall, `0/2` false positives).',
          },
          {
            kind: 'terminal',
            title: '$ PYTHONPATH=. python3 primitives/real_interp_audit.py',
            output: `[qwen3-1.7b]  device=mps  layer=21  wall=21.94s  snapshot=ea980cb0a6c2
[auditors]    naive=0/6  probe_donor=4/6  unified_invariants=6/6 (FPR=0/2)
[qwen2.5-0.5] device=mps  layer=18  naive=0/6  probe_donor=4/6  unified=6/6 (FPR=0/2)
[jspace-h100] OLMo-2-7B DPO (n=2000, dose=0.2): r(J, PCA)=0.8552  diff=-0.0109 (NULL)`,
            caption: 'Live forward-pass audit output matching `primitives/results/real_interp_audit_*.json` and `jspace-pilot/results/gateB2_*_raw.npz`.',
          },
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
          'Customer and domain fine-tuning is usually benign OOD drift, not a white-box jailbreak adversary, yet standard fine-tuning and replay still erode refusals rapidly. In `v29` and `v30`, freezing low-rank discriminant safety adapters kept refusals intact through benign OOD fine-tuning across Qwen3-8B, Mistral-7B, and OLMo-2-7B.',
          'On OLMo-2-7B (`n = 6` seeds), discriminant adapters retained 1.00 in-distribution and 0.9505 held-out refusals, while free replay collapsed to 0.2682 held-out (`out30/olmo_refuse.combine.txt`). On Qwen3-8B and Mistral-7B, held-out harmful-keyword refusal stayed at 0.96 vs 0.20 for replay.',
        ],
        figures: [
          {
            kind: 'terminal',
            title: '$ python3 temporal-grid-safety/summarize_out30.py',
            output: `[olmo-2-7b]  seeds=6  step=128  free=0.000  free_replay=0.268  disc=0.951  disc_replay=0.951
[qwen3-8b]   seeds=6  step=128  free=0.000  free_replay=0.125  disc=1.000  disc_replay=1.000
[mistral-7b] seeds=6  step=128  free=0.000  free_replay=0.188  disc=0.188  disc_replay=0.625
[v20-audit]  fair_attacker_delta=+0.05 AUC (95% CI spans 0 -> NotConfirmed)`,
            caption: 'Direct per-seed readout from `../temporal-grid-safety/out30/{olmo_refuse,qwen_fmtA,mistral_fmtA}.json`.',
          },
          {
            kind: 'film',
            title: '3D geometry of orthogonal subspace protection ($\\Delta W P_\\perp$)',
            src: '/viz-media/subspace-null-projection.mp4',
            scriptPath: 'viz/manimgx/subspace_null_projection.py',
            caption:
              'ManimGX 3D visualization of orthogonal null-space projection, the same geometric mechanism protecting discriminant safety subspaces here and replay KL in `arc-membrane` Track 5.',
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
          'What this establishes is that the lifecycle works end to end: stream, interventions, lock, assessment, validator and a quarantining admission kernel, with $R^2_{\\text{real}} \\in [0.83,\\,0.90]$ and $R^2_{\\text{shuffled}} < 0$, halting honestly once the matched-progress control fails.[^ahcl]',
        ],
        sidenotes: [
          {
            id: 'ahcl',
            text: 'Source artifact: `aligned-holistic-continual-learning/results/synthetic-result.json`. No real model checkpoint was downloaded before the matched-progress confound gate stopped the study.',
          },
        ],
        figures: [
          {
            kind: 'film',
            title: 'Causal monitor qualification funnel & matched-progress stop gate',
            src: '/viz-media/ahcl-confound-funnel.mp4',
            scriptPath: 'viz/manimgx/ahcl_confound_funnel.py',
            caption:
              'ManimGX funnel showing how synthetic fit (`R² = 0.88`), shuffled controls (`R² < 0`), and sign agreement (`91%`) pass, before the matched-progress gate halts promotion honestly.',
          },
          {
            kind: 'terminal',
            title: '$ cat aligned-holistic-continual-learning/results/synthetic-result.json | jq .',
            output: `[lock]     prediction_lock_digest=86063d2efea40a45  status=SyntheticCandidate
[fixed]    adaptation_gain  R2=+0.830 (sign 97.9%)  shuffled_R2=-0.419  PASS
[fixed]    retention_harm   R2=+0.853 (sign 97.9%)  shuffled_R2=-0.272  PASS
[fixed]    calibration_harm R2=+0.900 (sign 93.8%)  shuffled_R2=-0.514  PASS
[fixed]    policy_viol_harm R2=+0.830 (sign 97.9%)  shuffled_R2=-0.392  PASS
[gate]     matched_progress (5 seeds @ gain 0.5/1.0/1.5): 0/5 passed -> HALT`,
            caption: 'Pinned synthetic receipt digests alongside the matched-progress confound stop.',
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
          'In GPT-2, a function-preserving MLP permutation $P$ changed $100\\%$ of the selected positions yet preserved top-1 behavior within $3\\times 10^{-7}$: $$f\\!\\left(P^{\\top} W_2 \\sigma(W_1 P x)\\right) = f(x) \\pm 3\\times 10^{-7}$$ The same-label ablation then looked unrelated ($\\cos = -0.983$), while the inverse-mapped ablation matched ($\\cos = 0.9999996$).[^ths]',
          'So a mechanism claim has to be representation-relative. A PyTorch and Transformers reference matched the NumPy implementation to $4.9\\times 10^{-7}$, and 48 permutation cases passed.',
        ],
        sidenotes: [
          {
            id: 'ths',
            text: 'Every coordinate-index claim that fails under an exact hidden-unit permutation $P$ is a labeling artifact rather than a causal mechanism (`theseus-lab/RESEARCH.md`).',
          },
        ],
        figures: [
          {
            kind: 'film',
            title: '3D basis permutation invariance vs. positional neuron labels',
            src: '/viz-media/theseus-permutation-3d.mp4',
            scriptPath: 'viz/manimgx/theseus_permutation_3d.py',
            caption:
              'ManimGX 3D render: rotating/permuting 100% of hidden basis coordinates (`same-label cos = −0.983`) leaves the functional trajectory $f(x)$ invariant within $3\\times 10^{-7}$ (`inverse-mapped cos = 0.9999996`).',
          },
          {
            kind: 'code',
            title: 'Exact hidden-unit permutation invariance check (GPT-2 MLP)',
            lang: 'python',
            code: `# Apply random derangement P to MLP hidden units (100% of indices move):
perm = torch.randperm(d_mlp)
inv_perm = torch.argsort(perm)
W1_p, b1_p, W2_p = W1[perm, :], b1[perm], W2[:, perm]
# Forward output is bit-for-bit equivalent within fp32 rounding (3e-7):
assert (logits_orig - logits_perm).abs().max() < 5e-7
# Same-label ablation on unit k fails (cos = -0.983); inverse-mapped unit inv_perm[k] matches (0.9999996)`,
            caption: 'Any interpretability claim tied to raw coordinate index `k` rather than representation-relative `P^{-1}(k)` collapses under an exact symmetry of the network.',
          },
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
            kind: 'anim',
            id: 'theseus-coverage-v39',
          },
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
            kind: 'terminal',
            title: '$ cat theseus-lab/docs/v39-first-mlp-diagnosis-v1-results.json | jq .',
            output: `[scope]     seeds=[36101,36102,36103]  decoder_pairs=384  full_jacobians=288  wall=104.5s
[jvp]       value_nrmse=[0.101, 0.115]  jacobian_nrmse=[0.883, 0.889]  finite_cos=0.458
[endpoints] value_nrmse=[0.090, 0.099]  jacobian_nrmse=[1.150, 1.198]  finite_cos=0.208
[controls]  noop_reruns=48  all_noop_errors_exact_zero=true  arrays_sha256=b358c66c7b6e`,
            caption: 'Reconciled primary + replica diagnostic runs (`99.7s` replica wall time, exact byte match on `1.31 GB` array digest).',
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
          'The kernel is small and replayable. Policy, budgets, single-use execution, lifecycle, journaling, an independent checker and signed receipts compose without a shared trusted component beyond the caller-owned policy and clock: $$\\mathrm{Exec}(a) \\iff \\mathrm{Admit}(a) \\land \\mathrm{FreshNonce}(\\nu) \\land \\mathrm{InSandbox}(a)$$[^sao]',
        ],
        sidenotes: [
          {
            id: 'sao',
            text: 'All 279 Rust tests run offline via `cargo test --all-targets`, including direct adversarial attempts at path escape, token replay, and receipt forgery.',
          },
        ],
        figures: [
          {
            kind: 'film',
            title: 'Fail-closed capability kernel & offline verification chain',
            src: '/viz-media/formasec-kernel-gate.mp4',
            scriptPath: 'viz/manimgx/formasec_kernel_gate.py',
            caption:
              'ManimGX illustration of the deterministic admission boundary separating untrusted proposals from sandboxed, receipt-signed execution.',
          },
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
          'Most ZK benchmarks compare known circuits. This one starts from semantics: state machines, transitions, guards, loops, invariants and expected accept or reject outcomes. It generates workloads across nine families, applies $14$ classes of adversarial mutation with expected verdicts, replays them locally and scores performance separately from soundness evidence.[^zkb]',
          'An oracle-completeness audit and a distinguishability matrix show which generated constructs the shipped oracle can and cannot evaluate. I count that as a feature.',
        ],
        sidenotes: [
          {
            id: 'zkb',
            text: 'Everything in `composed-zk-benchmark-os` sits explicitly at Claim Ladder Level 1 (local deterministic replay), never conflating circuit speed with semantic soundness.',
          },
        ],
        figures: [
          {
            kind: 'film',
            title: 'Semantic ZK mutation suite & offline Merkle receipt chain',
            src: '/viz-media/zk-mutation-lattice.mp4',
            scriptPath: 'viz/manimgx/zk_mutation_lattice.py',
            caption:
              'ManimGX visualization of the 14 semantic mutation classes catching under-constrained circuits alongside hash-chained offline verification.',
          },
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
          'Routing optimizes the buyer’s expected successful cost, not platform revenue. Provider price and platform fee are separate signed fields, and every bundle commits to a deterministic hash chain verified offline against the buyer’s trust registry: $$H_k = \\mathrm{SHA256}\\!\\left(\\text{offer} \\,\\|\\, \\text{route} \\,\\|\\, \\text{meter} \\,\\|\\, H_{k-1}\\right)$$[^hyp]',
        ],
        sidenotes: [
          {
            id: 'hyp',
            text: '115 workspace tests pass with 0 failures; 2 concurrency/crash-recovery wrapper tests remain explicitly marked ignored and unverified in `RESEARCH.md`.',
          },
        ],
        figures: [
          {
            kind: 'film',
            title: 'Offline-verifiable inference receipt chain & tamper rejection',
            src: '/viz-media/zk-mutation-lattice.mp4',
            scriptPath: 'viz/manimgx/zk_mutation_lattice.py',
            caption:
              'ManimGX verification flow: honest route-to-settlement bundles pass offline against the caller trust registry, while any bit-flip cascades and fails closed.',
          },
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
