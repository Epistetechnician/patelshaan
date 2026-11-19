export type ArchBox = { id: string; label: string; sub?: string; soft?: boolean }
export type ArchCol = { title: string; dashed?: boolean; boxes: ArchBox[] }
export type ArchSpec = {
  cols: ArchCol[]
  links: [string, string][]
  bottom: { label: string; sub?: string }[]
  caption: string
}

export const archs: Record<string, ArchSpec> = {
  'holdout-ledger': {
    cols: [
      {
        title: 'PROPOSER',
        boxes: [
          { id: 'hon', label: 'Pool swaps', sub: 'compressible (~100b)' },
          { id: 'pat', label: 'Holdout patch', sub: 'high description bits', soft: true },
          { id: 'bat', label: '64-candidate batch', sub: '96 bits vs 1,024' },
        ],
      },
      {
        title: 'GATE',
        boxes: [
          { id: 'mdl', label: 'MDL price gate', sub: 'complexity-priced' },
          { id: 'bit', label: '1-bit verdict', sub: 'sealed holdout' },
          { id: 'chn', label: 'Hash-chained log', sub: 'bits billed' },
        ],
      },
      {
        title: 'CERTIFICATE',
        boxes: [
          { id: 'inf', label: 'Info route', sub: 'verdict bits' },
          { id: 'dsc', label: 'Description route', sub: 'core + strip patch' },
          { id: 'min', label: 'min(info, desc)', sub: 'Hoeffding union' },
        ],
      },
      {
        title: 'CHECK',
        dashed: true,
        boxes: [
          { id: 'rsv', label: 'Reserve truth', sub: '59,200 runs, 0 viol.' },
          { id: 'ln4', label: 'Lean 4 core', sub: 'counting & monotone' },
        ],
      },
    ],
    links: [
      ['hon', 'mdl'],
      ['pat', 'mdl'],
      ['bat', 'mdl'],
      ['mdl', 'bit'],
      ['bit', 'chn'],
      ['chn', 'inf'],
      ['chn', 'dsc'],
      ['inf', 'min'],
      ['dsc', 'min'],
      ['min', 'rsv'],
      ['rsv', 'ln4'],
    ],
    bottom: [
      { label: 'PREREG_COMMIT', sub: '9 / 9 hypotheses pass' },
      { label: 'HoldoutLedger.lean', sub: 'standard axioms' },
    ],
    caption: 'The reserve column is opened only after confirmatory runs finish to audit certificate violations (0 / 59,200).',
  },
  caduceus: {
    cols: [
      {
        title: 'PROPOSAL',
        boxes: [
          { id: 'skl', label: 'Hermes skill edit' },
          { id: 'prv', label: 'Provenance tag', sub: 'trusted vs untrusted' },
        ],
      },
      {
        title: '13-LANE GATE',
        boxes: [
          { id: 'stx', label: 'Schema & static' },
          { id: 'cap', label: 'Capability bounds' },
          { id: 'lkg', label: 'Leakage account', sub: 'matches holdout-ledger' },
          { id: 'aut', label: 'Phrase tripwire', sub: '41% FP -> kept OFF', soft: true },
        ],
      },
      {
        title: 'BROKER',
        boxes: [
          { id: 'lnd', label: 'Landlock sandbox' },
          { id: 'pai', label: 'Paired eval', sub: '40 task clusters' },
        ],
      },
      {
        title: 'LEDGER',
        dashed: true,
        boxes: [
          { id: 'mrk', label: 'RFC 9162 Merkle', sub: 'append-only JSONL' },
          { id: 'rdb', label: 'Stdlib readback', sub: 'independent check' },
        ],
      },
    ],
    links: [
      ['skl', 'prv'],
      ['prv', 'stx'],
      ['stx', 'cap'],
      ['cap', 'lkg'],
      ['lkg', 'lnd'],
      ['lnd', 'pai'],
      ['pai', 'mrk'],
      ['mrk', 'rdb'],
    ],
    bottom: [
      { label: 'exp-002 / exp-003', sub: '+0.245 Haiku · +0.305 Sonnet' },
      { label: '43 / 43 attacks refused', sub: '340 tests' },
    ],
    caption: 'The soft box (`Phrase tripwire`) failed its 5% false-hold ceiling on 188 real skills and remains disabled on the record.',
  },
  'hsi-lab': {
    cols: [
      {
        title: 'PACKET',
        boxes: [
          { id: 'frz', label: 'Frozen spec', sub: 'E1 to E10' },
          { id: 'slt', label: 'External lock salt', sub: 'held outside repo' },
        ],
      },
      {
        title: 'ARMS',
        boxes: [
          { id: 'cod', label: 'Typed event codec', sub: 'equal-byte control' },
          { id: 'syn', label: 'Verified synthetic', sub: 'vs pool-size match' },
          { id: 'c7b', label: 'Qwen2.5-7B code', sub: 'real-task transfer', soft: true },
        ],
      },
      {
        title: 'LEDGER',
        boxes: [
          { id: 'raw', label: 'Per-trial logs' },
          { id: 'rcp', label: '25 JSON receipts', sub: 'paired bootstrap CIs' },
        ],
      },
      {
        title: 'RECOMPUTE',
        dashed: true,
        boxes: [
          { id: 'vrf', label: 'verify_all.py', sub: 'Python stdlib only' },
          { id: 'cl7', label: 'cl7b delta check', sub: 'replay_kl 0.997 bar', soft: true },
        ],
      },
    ],
    links: [
      ['frz', 'slt'],
      ['slt', 'cod'],
      ['cod', 'syn'],
      ['syn', 'c7b'],
      ['syn', 'raw'],
      ['c7b', 'raw'],
      ['raw', 'rcp'],
      ['rcp', 'vrf'],
      ['vrf', 'cl7'],
    ],
    bottom: [
      { label: 'E1 +0.640 · E6 +0.238' },
      { label: 'E8-7B −0.0025', sub: 'tight code null' },
    ],
    caption: 'Every receipt recomputes from stdlib Python; E8-7B marks the exact boundary where rule-world synthetic gains stop transferring.',
  },
  playbox: {
    cols: [
      {
        title: 'PRINCIPALS',
        boxes: [
          { id: 'own', label: 'Distinct owners' },
          { id: 'bis', label: 'Biscuit grants', sub: 'attenuated, signed' },
        ],
      },
      {
        title: 'ROOM',
        boxes: [
          { id: 'hst', label: 'Ed25519 history', sub: 'hash-chained' },
          { id: 'mcp', label: 'MCP & runner', sub: 'sandboxed tasks' },
          { id: 'ste', label: 'Concept steering', sub: '87.5% cross-family', soft: true },
        ],
      },
      {
        title: 'F3 GATE',
        boxes: [
          { id: 'dev', label: 'Agent hill-climb', sub: 'H100 / Mac Tier B' },
          { id: 'hld', label: 'Sealed holdout', sub: 'catches memorizer' },
        ],
      },
      {
        title: 'ATTEST',
        dashed: true,
        boxes: [
          { id: 'rcp', label: 'Signed receipts', sub: 'verify.txt PASS' },
          { id: 'tdx', label: 'T1 / T3 TDX node', sub: 'platform attested', soft: true },
        ],
      },
    ],
    links: [
      ['own', 'bis'],
      ['bis', 'hst'],
      ['hst', 'mcp'],
      ['mcp', 'ste'],
      ['mcp', 'dev'],
      ['dev', 'hld'],
      ['hld', 'rcp'],
      ['rcp', 'tdx'],
    ],
    bottom: [
      { label: '494 Rust tests · 12 fuzzers' },
      { label: '2.84× Tier B · 0 false promos' },
    ],
    caption: 'Rooms isolate cross-owner collaboration; F3 gates optimization candidates against a sealed holdout before promotion.',
  },
  formasec: {
    cols: [
      {
        title: 'UNTRUSTED',
        boxes: [
          { id: 'llm', label: '7 live LLMs', sub: 'or hostile session' },
          { id: 'enu', label: 'Enumerator / Bend', sub: '552 hostile DAGs', soft: true },
        ],
      },
      {
        title: 'PURE KERNEL',
        boxes: [
          { id: 'pyr', label: 'Python ref. kernel' },
          { id: 'rsk', label: 'Rust prod. kernel', sub: 'Kani-checked core' },
          { id: 'obl', label: 'Obligation plan', sub: 'DAG path-bounded' },
        ],
      },
      {
        title: 'PROOFS',
        boxes: [
          { id: 'ln4', label: 'Lean 4 soundness', sub: 'admitAlg, plan_sound' },
          { id: 'smt', label: 'Z3 + cvc5 T3z', sub: 'dual-solver check', soft: true },
        ],
      },
      {
        title: 'EXECUTE',
        dashed: true,
        boxes: [
          { id: 'ldk', label: 'Landlock sandbox', sub: 'Linux kernel' },
          { id: 'led', label: 'Byte-exact receipt', sub: '135 / 135 match' },
        ],
      },
    ],
    links: [
      ['llm', 'pyr'],
      ['enu', 'pyr'],
      ['pyr', 'rsk'],
      ['rsk', 'obl'],
      ['obl', 'ln4'],
      ['ln4', 'smt'],
      ['obl', 'ldk'],
      ['ldk', 'led'],
    ],
    bottom: [
      { label: '0 / 552 unsafe admissions' },
      { label: '600 / 600 Py · Rust · Lean' },
    ],
    caption: 'Proposers carry zero trust; Python, Rust, and Lean agree on structural admission while solver proof objects stay explicitly outside the TCB.',
  },
  'mech-interp-unified': {
    cols: [
      {
        title: 'CLAIMS',
        boxes: [
          { id: 'neu', label: 'Neuron swap sets', sub: 'Pythia, Qwen3, GPT-2 XL' },
          { id: 'jsp', label: 'J-space basis', sub: 'OLMo-2 & Tulu-3', soft: true },
        ],
      },
      {
        title: 'CONTROLS',
        boxes: [
          { id: 'rnd', label: '1,000 random draws', sub: 'Lean p >= 1/(1+n)' },
          { id: 'pca', label: 'Norm-matched PCA', sub: 'damage-equalized' },
          { id: 'lvl', label: 'Level adjustment', sub: '+2 logit shift check' },
        ],
      },
      {
        title: 'F2 AUDIT',
        boxes: [
          { id: 'flw', label: '8 planted flaws', sub: '200 seeds' },
          { id: 'rul', label: 'Rules gate: 0 / 8', soft: true },
          { id: 'prb', label: 'Probe battery: 3 / 8' },
        ],
      },
      {
        title: 'VERDICT',
        dashed: true,
        boxes: [
          { id: 'r6', label: 'R6 Replicates', sub: 'Qwen3 p=0.000999' },
          { id: 'eqv', label: 'J == PCA-norm', sub: '11/12 within ±0.2' },
        ],
      },
    ],
    links: [
      ['neu', 'rnd'],
      ['jsp', 'pca'],
      ['pca', 'lvl'],
      ['rnd', 'flw'],
      ['lvl', 'flw'],
      ['flw', 'rul'],
      ['rul', 'prb'],
      ['rnd', 'r6'],
      ['lvl', 'eqv'],
    ],
    bottom: [
      { label: 'python3 -m audit.verify', sub: 'F2 200 seeds' },
      { label: 'jspace-pilot', sub: '4,000-prompt gate' },
    ],
    caption: 'Pairs positive cross-family neuron replications (R6) with norm-matched subspace equivalence (jspace) and planted-flaw auditing of the gates themselves (F2).',
  },
  'temporal-grid-safety': {
    cols: [
      {
        title: 'MODELS',
        boxes: [
          { id: 'olm', label: 'OLMo-2-7B' },
          { id: 'qwn', label: 'Qwen3-8B' },
          { id: 'mis', label: 'Mistral-7B' },
        ],
      },
      {
        title: 'DEFENSE ARMS',
        boxes: [
          { id: 'grd', label: 'Slow-update grid', sub: 'v1–v20', soft: true },
          { id: 'dsc', label: 'Discriminant adapter', sub: 'frozen safety dir.' },
          { id: 'rpl', label: 'Replay / anchor', sub: 'matched controls' },
        ],
      },
      {
        title: 'PRESSURE',
        boxes: [
          { id: 'atk', label: 'Fair LoRA attacker', sub: 'v16 confound fixed' },
          { id: 'ood', label: 'OOD benign drift', sub: 'v29 / v30' },
        ],
      },
      {
        title: 'OUTCOME',
        dashed: true,
        boxes: [
          { id: 'nul', label: 'Attacker wins @64', sub: 'grid +0.05 AUC (ns)', soft: true },
          { id: 'ret', label: 'Benign drift: 0.95', sub: 'vs 0.27 replay' },
        ],
      },
    ],
    links: [
      ['olm', 'dsc'],
      ['qwn', 'grd'],
      ['mis', 'rpl'],
      ['grd', 'atk'],
      ['dsc', 'atk'],
      ['dsc', 'ood'],
      ['rpl', 'ood'],
      ['atk', 'nul'],
      ['ood', 'ret'],
    ],
    bottom: [
      { label: 'v16 self-caught confound', sub: 'inherited lr fixed' },
      { label: 'out30/olmo_refuse', sub: '0.95 vs 0.27' },
    ],
    caption: 'Separates adversarial fine-tuning (where LoRA attackers still win by 64 steps) from benign OOD drift (where frozen discriminant adapters preserve refusals).',
  },
  'aligned-holistic-continual-learning': {
    cols: [
      { title: 'STREAM', boxes: [{ id: 'syn', label: 'Synthetic stream' }, { id: 'split', label: 'Fit, tune, assess', sub: 'disjoint steps' }, { id: 'arms', label: 'Update arms', sub: 'SGD, EWC, guards', soft: true }] },
      { title: 'MONITOR', boxes: [{ id: 'feat', label: 'Causal features' }, { id: 'fit', label: 'Fit and tune' }, { id: 'lock', label: 'Prediction lock', sub: 'sealed first' }] },
      { title: 'CHECK', boxes: [{ id: 'assess', label: 'Assessment' }, { id: 'shuf', label: 'Shuffled control' }, { id: 'valid', label: 'Validator', sub: 'ahcl.validate' }] },
      { title: 'ADMISSION', dashed: true, boxes: [{ id: 'kern', label: 'admission-core', sub: 'Rust, pure function' }, { id: 'quar', label: 'Quarantine' }, { id: 'rev', label: 'Review', sub: 'independent evidence' }] },
    ],
    links: [['syn', 'split'], ['split', 'arms'], ['split', 'feat'], ['feat', 'fit'], ['fit', 'lock'], ['lock', 'assess'], ['assess', 'shuf'], ['shuf', 'valid'], ['valid', 'kern'], ['kern', 'quar'], ['quar', 'rev']],
    bottom: [{ label: 'python -m ahcl.run', sub: 'result.json' }, { label: 'Matched progress', sub: 'failed' }],
    caption: 'The dashed column is the admission policy. It is exercised by the validator, but no real model update has gone through it yet.',
  },
  'theseus-lab': {
    cols: [
      { title: 'MODEL', boxes: [{ id: 'ckpt', label: 'Checkpoints', sub: 'GPT-2, OPT, Qwen' }, { id: 'probe', label: 'Probes', sub: 'visible and held-out' }, { id: 'act', label: 'Activations' }] },
      { title: 'SWAP', boxes: [{ id: 'perm', label: 'Permutation' }, { id: 'split', label: 'Exact split' }, { id: 'aff', label: 'Fitted affine' }, { id: 'blk', label: 'Whole-block fit', soft: true }] },
      { title: 'CHECK', boxes: [{ id: 'beh', label: 'Behavior match' }, { id: 'cau', label: 'Causal prediction' }, { id: 'jac', label: 'Derivative audit', sub: 'Jacobian nRMSE' }, { id: 'nul', label: 'Null-block control', sub: 'zero, random' }] },
      { title: 'RECORD', dashed: true, boxes: [{ id: 'frz', label: 'Frozen protocol' }, { id: 'clo', label: 'Closeout' }, { id: 'cus', label: 'Owner custody', sub: 'raw outputs', soft: true }] },
    ],
    links: [['ckpt', 'probe'], ['probe', 'act'], ['act', 'perm'], ['perm', 'split'], ['split', 'aff'], ['aff', 'blk'], ['aff', 'beh'], ['beh', 'cau'], ['cau', 'jac'], ['jac', 'nul'], ['nul', 'frz'], ['frz', 'clo']],
    bottom: [{ label: 'run_public_tests.sh', sub: '50 of 54 modules ran' }, { label: 'RESEARCH.md' }],
    caption: 'Each experiment is a frozen protocol with its own runner and test module. Negative closeouts are kept.',
  },
  'security-alignment-os': {
    cols: [
      { title: 'PROPOSAL', boxes: [{ id: 'prop', label: 'Untrusted proposal' }, { id: 'evid', label: 'Evidence review', sub: 'exact subject' }] },
      { title: 'KERNEL', boxes: [{ id: 'adm', label: 'Admission', sub: 'deterministic' }, { id: 'cap', label: 'Capability', sub: 'single use' }, { id: 'jrn', label: 'Journal', sub: 'replayable' }] },
      { title: 'BROKER', boxes: [{ id: 'brk', label: 'Capability broker', sub: 'separate process' }, { id: 'sbx', label: 'Sandboxed op' }, { id: 'chk', label: 'Checker' }] },
      { title: 'RECORD', boxes: [{ id: 'rec', label: 'Signed receipt' }, { id: 'frz', label: 'Freeze or rollback', sub: 'on any failure', soft: true }] },
      { title: 'ATTEST', dashed: true, boxes: [{ id: 'tdx', label: 'TDX run', sub: '20 scenarios' }, { id: 'rep', label: 'Second host', sub: 'not yet', soft: true }] },
    ],
    links: [['prop', 'evid'], ['evid', 'adm'], ['adm', 'cap'], ['cap', 'jrn'], ['cap', 'brk'], ['brk', 'sbx'], ['sbx', 'chk'], ['chk', 'rec'], ['rec', 'frz'], ['rec', 'tdx'], ['tdx', 'rep']],
    bottom: [{ label: 'local_demo' }, { label: 'Adversarial runner', sub: 'attacks the broker' }],
    caption: 'No model runs in the loop. The dashed column is a single attested reproduction, not an independent replication.',
  },
  'composed-zk-benchmark-os': {
    cols: [
      { title: 'SEMANTICS', boxes: [{ id: 'ir', label: 'Semantic IR' }, { id: 'orc', label: 'Oracle' }, { id: 'gen', label: 'Generators', sub: 'nine families' }] },
      { title: 'ATTACK', boxes: [{ id: 'mut', label: 'Mutation engine', sub: '14 classes' }, { id: 'rep', label: 'Local replay' }, { id: 'dis', label: 'Distinguishability', sub: 'oracle completeness' }] },
      { title: 'EVIDENCE', boxes: [{ id: 'led', label: 'Ledgers' }, { id: 'cei', label: 'Claim ceiling', sub: 'level 0 to 6' }, { id: 'pack', label: 'Pack readiness' }] },
      { title: 'FORMAL', dashed: true, boxes: [{ id: 'z3', label: 'Z3', sub: 'digest binding' }, { id: 'lean', label: 'Lean', sub: 'model of checker' }, { id: 'aen', label: 'Aeneas', sub: '~80 phases, no witness', soft: true }] },
    ],
    links: [['ir', 'orc'], ['orc', 'gen'], ['gen', 'mut'], ['mut', 'rep'], ['rep', 'dis'], ['dis', 'led'], ['led', 'cei'], ['cei', 'pack'], ['pack', 'z3'], ['z3', 'lean'], ['lean', 'aen']],
    bottom: [{ label: 'cargo test' }, { label: 'FINDINGS.md', sub: 'negative results' }],
    caption: 'Everything sits at level 1. The formal column proves facts about a model of the checker, not about the Rust source.',
  },
  hyperintel: {
    cols: [
      { title: 'OFFERS', boxes: [{ id: 'off', label: 'Signed offers' }, { id: 'rel', label: 'Reliability', sub: 'count to PPM' }] },
      { title: 'ROUTE', boxes: [{ id: 'eli', label: 'Eligibility' }, { id: 'rte', label: 'Cost routing', sub: 'buyer cost first' }] },
      { title: 'EXECUTE', boxes: [{ id: 'adm', label: 'Admission' }, { id: 'cas', label: 'Replay store', sub: 'compare-and-swap' }, { id: 'har', label: 'Execution harness' }, { id: 'jrn', label: 'Journal', sub: 'crash classification' }] },
      { title: 'SETTLE', boxes: [{ id: 'met', label: 'Metering' }, { id: 'set', label: 'Settlement intent' }, { id: 'bun', label: 'Evidence bundle', sub: 'V1 to V4' }] },
      { title: 'NETWORK', dashed: true, boxes: [{ id: 'gw', label: 'Gateway', sub: 'not built', soft: true }, { id: 'wal', label: 'Wallet', sub: 'real money: none', soft: true }] },
    ],
    links: [['off', 'rel'], ['rel', 'eli'], ['eli', 'rte'], ['rte', 'adm'], ['adm', 'cas'], ['cas', 'har'], ['har', 'jrn'], ['jrn', 'met'], ['met', 'set'], ['set', 'bun'], ['bun', 'gw'], ['gw', 'wal']],
    bottom: [{ label: 'hyperintel-cli', sub: 'offline verifier' }, { label: 'Trust registry', sub: 'supplied by the caller' }],
    caption: 'The verifier needs only a bundle and a registry it supplies. The dashed column does not exist yet.',
  },
  'sacred-geography-kailas': {
    cols: [
      {
        title: 'PASSAGE CORPUS',
        boxes: [
          { id: 'cor', label: '2,626 passages', sub: '15+ langs · 282 bo v3' },
          { id: 'dec', label: 'Category split', sub: 'cat e vs a,b,d,f' },
        ],
      },
      {
        title: '52-KM KORA CIRCUIT',
        boxes: [
          { id: 'pil', label: '416+ coded windows', sub: 'α = 0.86 · 20+ books' },
          { id: 'cir', label: 'Circuit r ∈ [0, 1]', sub: '114 kora eps · 70.8% ov.' },
          { id: 'lit', label: 'Hajj vs Kailas', sub: '16.7% vs 3.0%, p=0.0022' },
        ],
      },
      {
        title: 'CIPHER & PRAMĀṆA MDL',
        boxes: [
          { id: 'kat', label: 'Katapayadi audit', sub: '−2.89 to −3.16b null' },
          { id: 'prm', label: 'Pramāṇa & Mandala', sub: '+53.8b bo · +111b pool' },
        ],
      },
      {
        title: 'HUMAN VALIDATION',
        dashed: true,
        boxes: [
          { id: 'san', label: 'Sanskrit handoff', sub: '233 blinded rows' },
          { id: 'tib', label: 'Tibetan/Bon sheets', sub: '115 v2 + 128 v3 rows' },
          { id: 'hum', label: 'human_pack.csv', sub: '40-episode double code', soft: true },
        ],
      },
    ],
    links: [
      ['cor', 'dec'],
      ['dec', 'kat'],
      ['kat', 'prm'],
      ['cor', 'pil'],
      ['pil', 'cir'],
      ['cir', 'lit'],
      ['prm', 'san'],
      ['dec', 'tib'],
      ['lit', 'hum'],
    ],
    bottom: [
      { label: 'kailas-corpus', sub: 'RESULTS_V3 & RESULTS_CODING_V2' },
      { label: 'Scholar handoff v2', sub: '233 sa + 243 bo blind' },
    ],
    caption:
      'Separating spatial axis-mundi cosmology from temporal concepts across 2,626 passages, falsifying consonant numerology (−2.89 to −3.16 bits), and preparing blinded scholar sheets.',
  },
}
