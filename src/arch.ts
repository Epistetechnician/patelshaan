export type MermaidArchSpec = {
  title: string
  diagram: string
  caption: string
}

/**
 * 14 bespoke Mermaid architecture graphs engineered to render at ~0.85x–1.00x native scale
 * inside a 40rem (640px) reading column:
 * - Short single-line subgraph titles (no numbered Markdown list prefixes like "1. ")
 * - Balanced 1–2 column vertical stacks (natural SVG width <= 640px)
 * - Clean semantic shapes (["pill"], [("store")], {"gate"}), thick (==>) primary paths,
 *   and dashed (-.->) audit edges modeled on playbox/README.md.
 */
export const archs: Record<string, MermaidArchSpec> = {
  'arc-membrane': {
    title: 'Sovereign Self-Compiling Agent Stack',
    diagram: `flowchart TB
    Q(["Incoming query q"]) ==> L7["L7 inference membrane<br/>trace router & MDL budget"]

    L7 -- "recurring<br/>K(P) &lt; K(Δθ)" --> CPU["CPU-ARC compiled code<br/>35.7 µs · 58/58 pass"]
    L7 == "novel / private" ==> ENC

    subgraph PRIV["Maverick private GPU path"]
        direction TB
        ENC["Local blind encode<br/>x̃ = G_xᵀ x + e (≤ 4N ops)"]
        GPU["Untrusted remote GPU<br/>coded matmul ỹ = W x̃ + δ"]
        SYN{"Syndrome check<br/>G_y ỹ = 0 ?"}
        ENC ==> GPU ==> SYN
    end

    SYN -. "s ≠ 0: cheat" .-> REJ["Fail-closed reject<br/>soundness ≤ 2⁻ᵏ"]
    SYN == "s = 0: exact y" ==> QR

    subgraph REWRITE["Track 5 MoE consolidation"]
        direction TB
        QR["QR-nullspace SFT<br/>ΔW⊥ = ΔW(I − QQᵀ)<br/>844 bases · KL 0.000605"]
        EP{"Anytime EB+MDL<br/>e-Process gate"}
        KEEP[("KEEP · Ed25519 signed<br/>76.25% MATH-500 (n=400)")]
        REV["REVERT / Null<br/>Arm B KL 0.1088 · T4 null"]
        QR ==> EP
        EP == "+36.5 pp<br/>p = 1.1e-37" ==> KEEP
        EP -. "drift or null" .-> REV
    end`,
    caption:
      'Top-to-bottom execution flow: recurring traces compile to 35.7 µs CPU-ARC code, private prompts delegate via Maverick Dual-LPN syndrome checks, and irreducible failures consolidate via QR-nullspace MoE SFT gated by anytime e-processes.',
  },

  'holdout-ledger': {
    title: 'Sanitizing SWE Broker & Anytime e-Process Ledger',
    diagram: `flowchart TB
    subgraph PROP["Adaptive proposers"]
        direction LR
        HON["Honest swaps<br/>K ≈ 98b · Batch-64"]
        PAT["Holdout patch<br/>K ≈ 1,400b"]
    end

    HON & PAT ==> BRK{"Sanitizing SWE broker<br/>strip repro.py · block tamper<br/>65.1% budget saved"}

    BRK -. "155/238 rejected<br/>7.1% solved" .-> DROP["Dropped pre-holdout<br/>83/83 tamper recall"]
    BRK == "83/238 admitted<br/>33.7% solved (4.75×)" ==> GATE["Sealed holdout + EB martingale<br/>E₀ = 2⁻ᴷ⁽ᶜ⁾ · predictable λ_t"]

    subgraph CERT["Dual-route certificate"]
        direction TB
        ROUTES["min(Info verdict bits, MDL core bits)<br/>strips incompressible patch"]
        LED[("Hash-chained ledger<br/>Ville α⁻¹ = 20 · 0 / 59,200 viol.")]
        ROUTES ==> LED
    end

    GATE ==> ROUTES
    LEAN["Lean 4 counting proofs<br/>HoldoutLedger.lean"] -. "verifies bound" .-> LED`,
    caption:
      'Candidates cross the deterministic SWE trajectory broker before paying adaptive verdict bits into the hash-chained Empirical-Bernstein + MDL ledger.',
  },

  caduceus: {
    title: 'Caduceus 13-Lane Skill Gate & Merkle Ledger',
    diagram: `flowchart TB
    DIFF(["Proposed Hermes skill diff"]) ==> PROV["Provenance tagging<br/>trusted vs external input"]

    subgraph GATES["Deterministic gate"]
        direction LR
        ACT["12 active lanes<br/>schema · AST · bounds<br/>43/43 attacks refused"]
        AUTH["Authority phrase lane<br/>41.0% FP > 5% limit<br/>DISABLED ON RECORD"]
    end

    PROV ==> ACT
    PROV -. "r28 audit: OFF" .-> AUTH

    ACT ==> LAND["Landlock broker sandbox<br/>paired eval · 40 clusters (200 units)"]
    LAND ==> LED[("RFC 9162 Merkle ledger<br/>+0.245 Haiku · +0.305 Sonnet")]
    RDB["Stdlib readback verifier<br/>340 hermetic tests"] -. "offline audit" .-> LED`,
    caption:
      'Skill promotions pass provenance, 12 active deterministic lanes, Landlock sandboxing, and paired cluster bootstrap evaluation into an append-only Merkle ledger; the noisy authority lane stays visibly off.',
  },

  'hsi-lab': {
    title: 'Frozen Experiment Packets (E1–E10) & Receipt Recompute',
    diagram: `flowchart TB
    SPEC(["Frozen packets E1–E10<br/>external lock salt"]) ==> POS & NULLS

    subgraph ARMS["Matched-byte & pool arms"]
        direction LR
        POS["Positive lifts<br/>E1 typed: +0.640<br/>E6 synth: +0.238 (+0.141 ctl)"]
        NULLS["Nulls & ceiling<br/>E8-7B: −0.0025<br/>E9: −0.019 · E10: +0.038 (inc.)"]
    end

    POS & NULLS ==> RCP[("25 signed JSON receipts<br/>cluster-bootstrapped 95% CIs")]
    VER["scripts/verify_all.py<br/>zero-dep recompute · 200 tests"] -. "recomputes logs" .-> RCP`,
    caption:
      'All positive lifts and tight nulls flow through the same external-salt harness and recompute offline via verify_all.py.',
  },

  playbox: {
    title: 'Multi-Owner Zero-Trust Room & F3 Sealed Hill-Climb',
    diagram: `sequenceDiagram
    autonumber
    participant H as Host & Biscuit
    participant G as Guest Agent
    participant R as Sandbox Room
    participant F as F3 Holdout

    H->>H: playbox up, mint attenuated grant
    H-->>G: Scoped Biscuit grant (never widens)
    G->>R: Push branch + Ed25519 hash link
    R->>F: Evaluate against pinned baseline
    alt Beats baseline cleanly (Tier-B)
        F-->>R: Admit (2.84× speedup, 6/6 receipts)
    else Noisy or dev-set memorizer
        F-->>R: Reject & log (0 false promotions)
    end`,
    caption:
      'Modeled directly on Playbox’s room protocol: attenuated Biscuit grants, isolated runner execution, Ed25519 history, and sealed F3 holdout admission.',
  },

  formasec: {
    title: 'Untrusted Proposer Search vs. Verified Dual Kernel',
    diagram: `flowchart TB
    UNTRUST(["Untrusted proposers (7 free LLMs)<br/>552 hostile proposals · 75 mutants"]) ==> PY & RS

    subgraph KERNEL["Dual admission kernel"]
        direction LR
        PY["Python reference<br/>135/135 byte-exact"]
        RS["Rust kernel + Kani<br/>600/600 structural match"]
        PY <--> RS
    end

    LEAN["Lean 4 soundness proofs<br/>admitAlg · plan_sound"] -. "formal spec" .-> RS

    RS == "proved valid" ==> LAND[("Linux Landlock sandbox<br/>0 / 552 unsafe admits")]
    RS -. "mutant or unsafe" .-> DENY["Fail-closed reject<br/>75 / 75 mutants caught"]`,
    caption:
      'Splits untrusted synthesis from a tiny dual-implementation kernel cross-checked across Python, Rust, Kani, and Lean 4 before Linux Landlock execution.',
  },

  'mech-interp-unified': {
    title: 'Causal Gates (R6), J-Space Equivalence & F2 Flaw Audit',
    diagram: `flowchart TB
    subgraph POS["Bounded positive (R6)"]
        direction TB
        Q1["Qwen3-1.7B-Base<br/>selected 1.437 vs control max 0.044"]
    end

    subgraph JP["Equivalence null (jspace-pilot)"]
        direction TB
        OLM["OLMo-2-7B & Tulu-3<br/>J-abl vs norm-matched PCA: +0.0005<br/>equivalent within ±0.20 (11/12)"]
    end

    subgraph F2["Real F2 audit (Qwen3-1.7B L21)"]
        direction TB
        FL["6 planted flaws + 2 real causal subspaces"]
        FL --> NA["Naive necessity: 0 / 6 caught"]
        FL --> PR["Probe + donor: 4 / 6 caught"]
        FL ==> UN["Unified invariants: 6 / 6 caught · 0 FP"]
    end

    Q1 --> OLM --> FL`,
    caption:
      'Combines the R6 positive replication, the J-space norm-matched PCA equivalence null, and the live Qwen3-1.7B Layer-21 auditor benchmark.',
  },

  'temporal-grid-safety': {
    title: 'Retracted Attacker Confound vs. Benign-Drift Retention',
    diagram: `flowchart TB
    BASE(["Safety-aligned model<br/>OLMo-2-7B · Qwen3-8B · Mistral-7B"]) ==> REG{"Perturbation regime"}

    subgraph ADV["White-box LoRA attacker (v20)"]
        direction TB
        NUL["Grid effect ≈ +0.05 AUC (CI spans 0)<br/>NotConfirmed · v16 confound retracted"]
    end

    subgraph BEN["Benign OOD drift (v30, n = 6)"]
        direction LR
        REP["Free replay<br/>held-out: 0.268<br/>(collapses)"]
        DISC["Discriminant adapter<br/>held-out: 0.951<br/>in-dist: 1.000"]
    end

    REG -. "equal-LR attack" .-> ADV
    REG == "benign drift" ==> BEN`,
    caption:
      'Separates the retracted white-box attacker confound (v16/v20) from the surviving benign-drift defense where frozen discriminant adapters retain 95.1% held-out refusals.',
  },

  'aligned-holistic-continual-learning': {
    title: 'Lock-and-Quarantine Qualification State Machine',
    diagram: `stateDiagram-v2
    [*] --> FitMonitor: Fit monitor on disjoint split
    FitMonitor --> LockPredictor: Lock predictor & freeze gates
    LockPredictor --> RealLabels: Synthetic stream assessment
    RealLabels --> ShuffledControl: R² ∈ [0.83, 0.90] (PASS)
    ShuffledControl --> MatchedProgress: Shuffled R² < 0 (PASS)
    MatchedProgress --> QuarantinedStop: Matched-progress FAILED
    QuarantinedStop --> [*]: Halt before real-model claim`,
    caption:
      'Fail-closed qualification lifecycle: strong synthetic R² and clean shuffled controls never bypass a failed matched-progress gate.',
  },

  'theseus-lab': {
    title: 'Coordinate-Relative Identity & Replacement-Loss Ladder',
    diagram: `flowchart TB
    NET(["Trained network<br/>GPT-2 · OPT-125M · SmolLM2-135M"]) ==> P

    subgraph SYM["Permutation symmetry audit"]
        direction TB
        P["Exact permutation P<br/>100% positions moved · Δ = 3×10⁻⁷"]
        P -. "same-index probe" .-> BAD["cos = −0.983<br/>(labeling artifact)"]
        P == "inverse-mapped P⁻¹" ==> OK["cos = 0.9999996<br/>(true identity)"]
    end

    subgraph LAD["Replacement-loss ladder"]
        direction TB
        CH["Exact channel split: 6 / 6 PASS"]
        AFF["V8 affine projection: 9 / 9 PASS (≥256 prompts)"]
        BLK["V16 whole block: 0 / 9 FAIL (V39 Jac nRMSE 0.89)"]
        CH ==> AFF -. "nonlinear boundary" .-> BLK
    end

    OK ==> CH`,
    caption:
      'Stacked vertically at 1:1 native scale: pairs exact permutation invariance (P⁻¹) with the replacement-loss ladder showing where whole nonlinear blocks fail from derivative underfitting (V39).',
  },

  'security-alignment-os': {
    title: 'Zero-Model-Trust Control Plane',
    diagram: `sequenceDiagram
    autonumber
    participant P as Proposal
    participant K as Kernel & Eval
    participant B as Capability Broker
    participant R as Receipt Journal

    P->>K: Submit patch or tool action
    K->>K: Structural check (no code exec)
    K->>B: Mint single-use monotonic nonce
    alt Valid nonce, policy & budget
        B->>B: Run attenuated syscall in sandbox
        B-->>R: Signed receipt (279/279 green)
    else Escape, replay or forged receipt
        B-->>R: Fail-closed FREEZE (0 escapes)
    end`,
    caption:
      '4-participant control-plane sequence verified by 279 Rust tests including an adversarial broker-attack runner.',
  },

  'composed-zk-benchmark-os': {
    title: 'Semantics-First ZK Benchmark & Mutation Suite',
    diagram: `flowchart TB
    SEM(["Semantic spec<br/>state machines · guards · invariants"]) ==> GEN["Workload generator<br/>9 families · 14 mutation classes"]

    subgraph AUDIT["Soundness & oracle checks"]
        direction LR
        ORC["Oracle audit &<br/>distinguishability matrix"]
        Z3["Local Z3 unsat +<br/>Lean checker (256 cases)"]
    end

    GEN ==> ORC & Z3
    ORC & Z3 ==> CEIL[("Claim ladder: Level 1<br/>1,107 core tests · local deterministic")]`,
    caption:
      'Evaluates semantic soundness and mutation detection independently of prover speed, explicitly capped at Claim Ladder Level 1.',
  },

  hyperintel: {
    title: 'Deterministic Route-to-Settlement & Offline Verify',
    diagram: `sequenceDiagram
    autonumber
    participant B as Buyer & Registry
    participant R as Cost Router
    participant S as CAS Store & Exec

    B->>R: Request + signed provider offers
    R->>S: Atomic CAS admission (reject stale)
    S-->>B: Metering + settlement + bundle (V1–V4)
    B->>B: Verify offline against trust registry
    Note over B,S: 115 tests pass; 2 concurrency tests marked unverified`,
    caption:
      'End-to-end deterministic route, metering, and settlement bundle verified offline without calling the operator.',
  },

  'sacred-geography-kailas': {
    title: 'Multilingual Kailas Corpus v3 & Two-Clock MDL',
    diagram: `flowchart TB
    subgraph DATA["Open-license corpora"]
        direction LR
        COR["2,626 blind passages<br/>EN · SA · 282 Tibetan & Bon"]
        KORA["48 Thubron kora + 368 windows<br/>24 quarantined · 0 in Tiers 1–2"]
    end

    subgraph TEST["Statistical tests"]
        direction LR
        DISS["Mandala dissociation<br/>route-locked φ = f(r)"]
        MDL["Two-Clock Rissanen MDL<br/>Kailas +2.03 vs Hajj −1.40 bits"]
    end

    COR ==> DISS
    KORA ==> MDL
    DISS & MDL ==> HAND[("Blinded philologist handoff<br/>233 Sanskrit · 243 Tibetan/Bon")]`,
    caption:
      'Separates spatial axis-mundi cosmology from liturgical calendar decoupling across 2,626 passages, 48 full-circuit kora episodes, and blinded scholar sheets.',
  },
}
