import { useMemo, useState } from 'react'
import {
  PLAYBOOK_BENCHMARK,
  PLAYBOOK_CATEGORIES,
  PLAYBOOK_SUBCATEGORIES,
  type DispositionId,
  type FailureModeId,
  type FunctionId,
  type PlaybookSubcategory,
} from './playbook-data'

const FUNCTION_ORDER: readonly FunctionId[] = ['GOVERN', 'MAP', 'MEASURE', 'MANAGE', 'CONTAIN']

const DISPOSITION_LABELS: Record<DispositionId, string> = {
  ADOPT_RECEIPTED: 'Adopt + Receipt (15)',
  RECOMPILE_KERNEL: 'Recompile to Kernel (57)',
  EXTEND_CONTAIN: 'Extend: CONTAIN (12)',
}

const FAILURE_LABELS: Record<FailureModeId, string> = {
  MULE_TAIL: 'Mule / Heavy-Tail Leverage',
  REFLEXIVE_GOODHART: 'Reflexive Goodhart / Axiom 2',
  CANON_PHASE_SHIFT: 'Canon Event / Phase Shift',
  CLOCK_DESYNC: 'Multi-Clock Desynchronization',
  CROSS_OWNER_CASCADE: 'Cross-Owner Kinetic Cascade',
  UNATTESTED_PROSE: 'Unattested Operator Prose',
}

function CopyCmd({ command }: { command: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard unavailable */
    }
  }
  return (
    <div className="rp-code">
      <code>{command}</code>
      <button type="button" onClick={copy} aria-label="Copy command">
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}

function SubcategoryRow({ item }: { item: PlaybookSubcategory }) {
  const badgeTone =
    item.disposition === 'EXTEND_CONTAIN'
      ? 'pass'
      : item.disposition === 'RECOMPILE_KERNEL'
        ? 'stop'
        : 'open'
  const shortDisp =
    item.disposition === 'EXTEND_CONTAIN'
      ? 'EXTEND'
      : item.disposition === 'RECOMPILE_KERNEL'
        ? 'KERNEL'
        : 'RECEIPT'

  return (
    <div
      style={{
        padding: '0.85rem 0',
        borderBottom: '1px solid var(--rule)',
        display: 'grid',
        gap: '0.35rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: '0.5rem',
        }}
      >
        <div>
          <strong style={{ fontFamily: "'SF Mono', ui-monospace, Menlo, monospace", fontSize: '0.9rem' }}>
            {item.id}
          </strong>{' '}
          <span className={`ef-chip ${badgeTone}`} style={{ marginLeft: '0.45rem' }}>
            [{shortDisp}]
          </span>{' '}
          <span
            style={{
              fontFamily: "'SF Mono', ui-monospace, Menlo, monospace",
              fontSize: '0.74rem',
              color: 'var(--mute)',
              marginLeft: '0.45rem',
            }}
          >
            {FAILURE_LABELS[item.failure_mode]}
          </span>
        </div>
        <code>{item.gate_id}</code>
      </div>

      <p style={{ margin: 0, fontSize: '0.93rem', color: 'var(--mute)' }}>
        <strong style={{ color: 'var(--ink)', fontWeight: 600 }}>NIST 1.0 (L0):</strong>{' '}
        {item.nist_summary}{' '}
        <em>({item.ergodic_assumption})</em>
      </p>

      <p style={{ margin: 0, fontSize: '0.95rem' }}>
        <strong style={{ color: 'var(--good)', fontWeight: 600 }}>Post-Ergodic Invariant (L2):</strong>{' '}
        {item.mechanical_invariant}{' '}
        <span style={{ fontSize: '0.82rem', color: 'var(--mute)' }}>
          — <code>{item.evidence_anchor}</code>
        </span>
      </p>
    </div>
  )
}

export default function PlaybookPage() {
  const [fnFilter, setFnFilter] = useState<'ALL' | FunctionId>('ALL')
  const [dispFilter, setDispFilter] = useState<'ALL' | DispositionId>('ALL')
  const [modeFilter, setModeFilter] = useState<'ALL' | FailureModeId>('ALL')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return PLAYBOOK_SUBCATEGORIES.filter((s) => {
      if (fnFilter !== 'ALL' && s.function !== fnFilter) return false
      if (dispFilter !== 'ALL' && s.disposition !== dispFilter) return false
      if (modeFilter !== 'ALL' && s.failure_mode !== modeFilter) return false
      if (!q) return true
      return (
        s.id.toLowerCase().includes(q) ||
        s.nist_summary.toLowerCase().includes(q) ||
        s.ergodic_assumption.toLowerCase().includes(q) ||
        s.mechanical_invariant.toLowerCase().includes(q) ||
        s.gate_id.toLowerCase().includes(q) ||
        s.evidence_anchor.toLowerCase().includes(q)
      )
    })
  }, [fnFilter, dispFilter, modeFilter, query])

  const visibleCategories = useMemo(() => {
    const activeCatIds = new Set(filtered.map((s) => s.category_id))
    return PLAYBOOK_CATEGORIES.filter((c) => activeCatIds.has(c.id))
  }, [filtered])

  return (
    <div className="rp rp-essay">
      <header className="rp-top">
        <a href="#/" className="rp-name">Shaan Patel</a>
        <nav>
          <a href="#/">Home</a>
          <a href="#frontiers" onClick={() => { window.location.hash = '#frontiers' }}>Frontiers</a>
          <a href="#/research">Research</a>
          <a href="#/playbook">Playbook</a>
          <a href="https://github.com/Epistetechnician/patelshaan-lab" target="_blank" rel="noreferrer">GitHub</a>
        </nav>
      </header>
      <p className="rp-rule"><span>POST-ERGODIC RISK MANAGEMENT PLAYBOOK · PERMF v0.1.0</span></p>

      <h1>Recompiling NIST AI RMF 1.0 for Mules, Canon Events, and Multi-Clock Systems</h1>
      <p className="rp-lede">
        A drop-in recompilation of all 72 NIST AI RMF 1.0 subcategories from prose self-attestation into
        stranger-verifiable runtime invariants, extended with a fifth cross-cutting function (<code>CONTAIN</code>,
        12 subcategories) for heavy-tailed outliers, inevitable phase transitions, reflexive holdout depletion,
        and cross-owner finality lag.
      </p>

      <CopyCmd command="python3 -m permf.cli benchmark --out-dir permf/results && python3 -m permf.cli verify permf/results/permf_ledger_receipt.json" />

      <dl className="rp-results">
        <div>
          <dt>84</dt>
          <dd>Subcategories (72 NIST 1.0 IDs + 12 net-new CONTAIN IDs across 23 categories)</dd>
        </div>
        <div>
          <dt>100%</dt>
          <dd>Mule DAG bombs (16/16), reward hacks (83/83), and tamper mutations (24/24) caught</dd>
        </div>
        <div>
          <dt>0.0%</dt>
          <dd>Anytime holdout false promotions across 250 adaptive Goodharting campaigns</dd>
        </div>
        <div>
          <dt>99.0%</dt>
          <dd>Task retention after surgical unlearning &amp; 98.4% after 4-bit consolidation</dd>
        </div>
      </dl>

      <blockquote className="rp-callout">
        Asimov’s psychohistory holds only under two axioms: (1) individual outliers wash out in the aggregate, and
        (2) subjects cannot read and optimize against the equations governing them. Autonomous AI breaks both at once:
        singular loops carry non-ergodic &ldquo;Mule&rdquo; leverage while overnight hill-climbers Goodhart static
        benchmarks in hours.
      </blockquote>

      <section className="rp-sec" id="s1">
        <h3><span>I</span> Embrace, Compile, Extend</h3>
        <p>
          Inventing four new compliance verbs forces institutions to discard existing statutory and procurement maps.
          Instead, <code>permf</code> keeps 100% of NIST AI 100-1’s address space (<code>GOVERN</code>,{' '}
          <code>MAP</code>, <code>MEASURE</code>, <code>MANAGE</code>) as its outer interface, treats prose-only
          checklists as <code>Level 0 (Ergodic / Unverified)</code>, and compiles each control into one of eight
          deterministic runtime gates:
        </p>
        <table className="ef-table">
          <thead>
            <tr>
              <th>Disposition</th>
              <th>Count</th>
              <th>End-to-End Rule</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>ADOPT_RECEIPTED</code></td>
              <td>15 / 84 (17.9%)</td>
              <td>Irreducible statutory, community-recourse, and human-oversight obligations bound to non-expired, hash-chained witness receipts.</td>
            </tr>
            <tr>
              <td><code>RECOMPILE_KERNEL</code></td>
              <td>57 / 84 (67.9%)</td>
              <td>Ergodic committees, zero-bit test splits, and scalar RAG matrices replaced by trajectory admission, MDL <code>e</code>-processes, planted-flaw checks, and orthogonal delta algebra.</td>
            </tr>
            <tr>
              <td><code>EXTEND_CONTAIN</code></td>
              <td>12 / 84 (14.3%)</td>
              <td>Fifth function (<code>CONTAIN 1..4</code>) isolating <code>2^n</code> Mule DAGs, Canon Event clocks (Shor <code>Q*T</code>, 4-bit consolidation, synthetic walls), RSI freezes, and 3-clock cross-owner coherence.</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="rp-sec" id="s2">
        <h3><span>II</span> Five-Wave Adversarial Scorecard (<code>NIST_L0_STATIC</code> vs. <code>PERMF_L2_KERNEL</code>)</h3>
        <p>
          Every number below is produced deterministically by <code>permf/benchmark.py</code> over real workspace
          trajectories (<code>gemma4-agent</code>), dual-coded cultural/market clock streams (<code>kailas-corpus</code>{' '}
          &amp; <code>Statebook</code>), and continual-learning banks (<code>orthodelta</code>):
        </p>
        <table className="ef-table">
          <thead>
            <tr>
              <th>Wave</th>
              <th>NIST L0 (Static Prose &amp; Splits)</th>
              <th>PERMF L2 (Mechanical Kernel)</th>
            </tr>
          </thead>
          <tbody>
            {PLAYBOOK_BENCHMARK.waves.map((w) => (
              <tr key={w.id}>
                <td>
                  <strong>{w.title}</strong>
                  <br />
                  <small style={{ color: 'var(--mute)' }}>{w.stimulus}</small>
                </td>
                <td style={{ color: 'var(--bad)' }}>{w.nist_l0}</td>
                <td style={{ color: 'var(--good)' }}>{w.permf_l2}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="rp-note">
          Ledger root: <code>{PLAYBOOK_BENCHMARK.ledger_head_sha256.slice(0, 24)}…</code> ({PLAYBOOK_BENCHMARK.ledger_entries}{' '}
          hash-chained + BLAKE2b PQ-dual-committed gate verdicts; claim ceiling: <code>{PLAYBOOK_BENCHMARK.claim_ceiling}</code>).
        </p>
      </section>

      <section className="rp-sec" id="s3">
        <h3><span>III</span> Interactive 84-Subcategory Crosswalk Explorer</h3>
        <p className="rp-note">
          Filter across all 5 functions, 3 compilation dispositions, and 6 post-ergodic failure modes, or search by
          NIST ID, invariant, or runtime gate.
        </p>

        <div className="rp-tabs" role="tablist" aria-label="Functions" style={{ flexWrap: 'wrap' }}>
          <button
            type="button"
            role="tab"
            aria-selected={fnFilter === 'ALL'}
            onClick={() => setFnFilter('ALL')}
          >
            All 5 Functions (84)
          </button>
          {FUNCTION_ORDER.map((fn) => {
            const count = PLAYBOOK_SUBCATEGORIES.filter((s) => s.function === fn).length
            return (
              <button
                key={fn}
                type="button"
                role="tab"
                aria-selected={fnFilter === fn}
                onClick={() => setFnFilter(fn)}
              >
                {fn} ({count})
              </button>
            )
          })}
        </div>

        <div className="demo-ctl" style={{ marginTop: '0.6rem' }}>
          <label>
            <span>Disposition</span>
            <select
              value={dispFilter}
              onChange={(e) => setDispFilter(e.target.value as 'ALL' | DispositionId)}
              style={{
                font: 'inherit',
                fontSize: '0.85rem',
                padding: '0.28rem 0.5rem',
                border: '1px solid #b9c7d6',
                borderRadius: '3px',
                background: 'var(--paper)',
                color: 'var(--ink)',
              }}
            >
              <option value="ALL">All dispositions (84)</option>
              {(Object.keys(DISPOSITION_LABELS) as DispositionId[]).map((d) => (
                <option key={d} value={d}>
                  {DISPOSITION_LABELS[d]}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Broken Ergodic Failure Mode</span>
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value as 'ALL' | FailureModeId)}
              style={{
                font: 'inherit',
                fontSize: '0.85rem',
                padding: '0.28rem 0.5rem',
                border: '1px solid #b9c7d6',
                borderRadius: '3px',
                background: 'var(--paper)',
                color: 'var(--ink)',
              }}
            >
              <option value="ALL">All failure modes</option>
              {(Object.keys(FAILURE_LABELS) as FailureModeId[]).map((m) => (
                <option key={m} value={m}>
                  {FAILURE_LABELS[m]}
                </option>
              ))}
            </select>
          </label>

          <label style={{ flex: '1 1 14rem' }}>
            <span>Search ID / Gate / Invariant</span>
            <input
              type="search"
              value={query}
              placeholder="e.g. MEASURE 2.3, Mule, eprocess, orthodelta…"
              onChange={(e) => setQuery(e.target.value)}
              style={{
                font: 'inherit',
                fontSize: '0.85rem',
                padding: '0.28rem 0.55rem',
                border: '1px solid #b9c7d6',
                borderRadius: '3px',
                background: 'var(--paper)',
                color: 'var(--ink)',
                width: '100%',
              }}
            />
          </label>
        </div>

        <p className="rp-note">
          Showing <strong>{filtered.length}</strong> of 84 subcategories across{' '}
          <strong>{visibleCategories.length}</strong> categories.
        </p>

        {visibleCategories.map((cat) => {
          const items = filtered.filter((s) => s.category_id === cat.id)
          return (
            <section key={cat.id} className="rp-cat">
              <h4 className="rp-cat__title">
                {cat.id} — {cat.title}
              </h4>
              <p className="rp-note">
                <strong>Shift:</strong> {cat.post_ergodic_shift}
              </p>
              <div>
                {items.map((item) => (
                  <SubcategoryRow key={item.id} item={item} />
                ))}
              </div>
            </section>
          )
        })}
      </section>

      <section className="rp-sec rp-appendix">
        <h3><span>Appendix</span> Reproduce &amp; Audit Locally</h3>
        <CopyCmd command="./scripts/check" />
        <CopyCmd command="python3 -m permf.cli inspect &quot;CONTAIN 1.1&quot;" />
        <p className="rp-links">
          <a href="#/research">Research Monograph</a>
          <a href="#/">Portfolio Home</a>
          <a href="https://airc.nist.gov/airmf-resources/playbook/" target="_blank" rel="noreferrer">
            NIST AI RMF 1.0 Playbook (Upstream Reference)
          </a>
        </p>
      </section>
    </div>
  )
}
