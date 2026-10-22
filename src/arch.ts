export type ArchBox = { id: string; label: string; sub?: string; soft?: boolean }
export type ArchCol = { title: string; dashed?: boolean; boxes: ArchBox[] }
export type ArchSpec = {
  cols: ArchCol[]
  links: [string, string][]
  bottom: { label: string; sub?: string }[]
  caption: string
}

export const archs: Record<string, ArchSpec> = {
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
}
