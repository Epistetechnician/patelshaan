import { useEffect, useMemo, useRef, useState } from 'react'
import replays from './replays.json'

type TestData = { lines: string[]; highlight: string }
type AhclData = {
  targets: { name: string; r2: number; sign: number; shuffled: number }[]
  gates: Record<string, number>
  status: string
  log: string[]
}

const COMMANDS: Record<string, string> = {
  'security-alignment-os': 'cargo test --all-targets',
  hyperintel: 'tools/pinned-cargo test --workspace',
  'composed-zk-benchmark-os': 'cargo test -p zkbench-core',
  'theseus-lab': 'PYTHON=python3 scripts/run_public_tests.sh',
  'aligned-holistic-continual-learning': 'python -m ahcl.run && python -m ahcl.validate',
}

const SUMMARY: Record<string, string> = {
  'security-alignment-os': 'tests passed',
  hyperintel: 'tests passed',
  'composed-zk-benchmark-os': 'tests passed',
  'theseus-lab': 'test modules passed',
}

function useRun(total: number, durationMs: number) {
  const [n, setN] = useState(0)
  const [run, setRun] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || started) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setStarted(true)
    })
    io.observe(el)
    return () => io.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return
    setN(0)
    const begin = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const p = Math.min(1, (now - begin) / durationMs)
      setN(Math.floor(p * total))
      if (p < 1) raf = requestAnimationFrame(tick)
      else setN(total)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [started, run, total, durationMs])

  return { n, ref, replay: () => { setStarted(true); setRun((r) => r + 1) } }
}

function TestReplay({ slug, data }: { slug: string; data: TestData }) {
  const total = data.lines.length
  const { n, ref, replay } = useRun(total, 7000)
  const re = useMemo(() => new RegExp(data.highlight, 'i'), [data.highlight])
  const flags = useMemo(() => data.lines.map((l) => re.test(l)), [data, re])
  const hl = flags.filter(Boolean).length
  const shown = data.lines.slice(Math.max(0, n - 14), n)
  const cols = total > 600 ? 48 : total > 200 ? 28 : 14

  return (
    <figure className="rv" ref={ref}>
      <div className="rv-head">
        <div>
          <span className="rv-chip">real run</span>
          <code>{COMMANDS[slug]}</code>
        </div>
        <div className="rv-stat">
          <strong>
            {n} / {total}
          </strong>{' '}
          {SUMMARY[slug]} · <span className="rv-hl">{flags.slice(0, n).filter(Boolean).length}</span> of{' '}
          {hl} with adversarial, tamper, replay or mutation in the name
        </div>
      </div>
      <div className="rv-body">
        <div className="rv-grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }} aria-hidden="true">
          {data.lines.map((_, i) => (
            <i key={i} className={i < n ? (flags[i] ? 'on hl' : 'on') : ''} />
          ))}
        </div>
        <pre className="rv-term" aria-live="off">
          {shown.map((l, i) => (
            <div key={n - shown.length + i}>
              <span className="rv-ok">ok</span> {l}
            </div>
          ))}
        </pre>
      </div>
      <figcaption>
        Output of a real run on the v0.1.0 source, captured 2026-10-20. Test names are
        verbatim; the pacing is compressed.{' '}
        <button type="button" onClick={replay}>
          Replay
        </button>
      </figcaption>
    </figure>
  )
}

function AhclReplay({ data }: { data: AhclData }) {
  const [shuffled, setShuffled] = useState(false)
  const { n, ref, replay } = useRun(data.log.join('\n').length, 2500)
  const text = data.log.join('\n').slice(0, n)
  const gate = data.gates
  return (
    <figure className="rv" ref={ref}>
      <div className="rv-head">
        <div>
          <span className="rv-chip">real run</span>
          <code>{COMMANDS['aligned-holistic-continual-learning']}</code>
        </div>
        <div className="rv-stat">
          status <strong>{data.status}</strong> · validator <strong>valid</strong>
        </div>
        <div className="rv-toggle" role="group" aria-label="Label source">
          <button type="button" aria-pressed={!shuffled} onClick={() => setShuffled(false)}>
            Real labels
          </button>
          <button type="button" aria-pressed={shuffled} onClick={() => setShuffled(true)}>
            Shuffled labels (control)
          </button>
        </div>
      </div>
      <div className="rv-body">
        <div className="rv-bars">
          {data.targets.map((t) => {
            const v = shuffled ? t.shuffled : t.r2
            const pass = shuffled ? v <= gate.shuffled_control_max_r2 : v >= gate.minimum_r2
            return (
              <div key={t.name} className="rv-bar">
                <span>{t.name.replace(/_/g, ' ')}</span>
                <div className="rv-track">
                  <div className="rv-zero" />
                  <div
                    className={`rv-fill ${v < 0 ? 'neg' : ''}`}
                    style={{
                      left: v < 0 ? `${50 + v * 50}%` : '50%',
                      width: `${Math.abs(v) * 50}%`,
                    }}
                  />
                </div>
                <b>
                  R² {v.toFixed(3)} {pass ? '✓' : '✗'}
                </b>
              </div>
            )
          })}
          <p className="rv-gate">
            Gate: R² ≥ {gate.minimum_r2} on real labels; ≤ {gate.shuffled_control_max_r2} on shuffled labels.
          </p>
        </div>
        <pre className="rv-term">{text}</pre>
      </div>
      <figcaption>
        Output of a real run on the v0.1.0 source, captured 2026-10-20 (deterministic, synthetic
        task, no model). Numbers are read from the result file.{' '}
        <button type="button" onClick={replay}>
          Replay
        </button>
      </figcaption>
    </figure>
  )
}

export function Replay({ slug }: { slug: string }) {
  const data = (replays as Record<string, unknown>)[slug]
  if (!data) return null
  if (slug === 'aligned-holistic-continual-learning') return <AhclReplay data={data as AhclData} />
  return <TestReplay slug={slug} data={data as TestData} />
}
