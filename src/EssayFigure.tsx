import { Demo } from './Demos'
import type { Figure } from './essays'

const chipLabel = { pass: 'pass', fail: 'fail', stop: 'stop', open: 'open' }

export function EssayFigure({ fig }: { fig: Figure }) {
  switch (fig.kind) {
    case 'replay':
      return null
    case 'demo':
      return <Demo id={fig.id} />
    case 'roadmap':
      return (
        <figure className="ef">
          <h4>{fig.title}</h4>
          <div className="roadmap">
            {([['done', 'Done', fig.done], ['next', 'Next', fig.next], ['blocked', 'Blocked or open', fig.blocked]] as const).map(([k, h, items]) => (
              <div key={k} className={k}>
                <h5>{h}</h5>
                <ul>
                  {items.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <figcaption>{fig.caption}</figcaption>
        </figure>
      )
    case 'bars':
      return (
        <figure className="ef">
          <h4>{fig.title}</h4>
          <div className="ef-bars">
            {fig.rows.map((r) => (
              <div key={r.label} className="ef-row">
                <span>{r.label}</span>
                <div className="ef-track">
                  <div
                    className={`ef-fill ${r.tone ?? 'good'}`}
                    style={{ width: `${Math.min(100, (r.value / fig.max) * 100)}%` }}
                  />
                </div>
                <b>
                  {r.value}
                  {r.note ? <small> {r.note}</small> : null}
                </b>
              </div>
            ))}
          </div>
          <figcaption>{fig.caption}</figcaption>
        </figure>
      )
    case 'compare':
      return (
        <figure className="ef">
          <div className="ef-compare">
            {fig.items.map((i) => (
              <div key={i.label} className={i.tone ?? ''}>
                <strong>{i.value}</strong>
                <span>{i.label}</span>
              </div>
            ))}
          </div>
          <figcaption>{fig.caption}</figcaption>
        </figure>
      )
    case 'chips':
      return (
        <figure className="ef">
          <h4>{fig.title}</h4>
          <ul className="ef-chips">
            {fig.rows.map((r) => (
              <li key={r.label}>
                <span className={`ef-chip ${r.status}`}>{chipLabel[r.status]}</span>
                <b>{r.label}</b>
                {r.note ? <em>{r.note}</em> : null}
              </li>
            ))}
          </ul>
          <figcaption>{fig.caption}</figcaption>
        </figure>
      )
    case 'matrix':
      return (
        <figure className="ef">
          <h4>{fig.title}</h4>
          <div className="ef-matrix" style={{ gridTemplateColumns: `5rem repeat(${fig.cols.length}, 1fr)` }}>
            <span />
            {fig.cols.map((c) => (
              <span key={c} className="ef-colhead">
                {c}
              </span>
            ))}
            {fig.rows.map((r) => (
              <div key={r.label} className="ef-matrix-row">
                <span className="ef-rowhead">{r.label}</span>
                {r.cells.map((c, i) => (
                  <span key={i} className={`ef-cell ${c}`}>
                    {c === 'clear' ? 'no regression' : c}
                  </span>
                ))}
              </div>
            ))}
          </div>
          <figcaption>{fig.caption}</figcaption>
        </figure>
      )
    case 'flow':
      return (
        <figure className="ef">
          <h4>{fig.title}</h4>
          <ol className="ef-flow">
            {fig.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <p className="ef-tail">{fig.tail}</p>
          <figcaption>{fig.caption}</figcaption>
        </figure>
      )
    case 'ladder':
      return (
        <figure className="ef">
          <h4>{fig.title}</h4>
          <ol className="ef-ladder">
            {fig.levels.map((l, i) => (
              <li key={l} className={i === fig.at ? 'here' : i < fig.at ? 'done' : ''}>
                {l}
                {i === fig.at ? <small>we are here</small> : null}
              </li>
            ))}
          </ol>
          <figcaption>{fig.caption}</figcaption>
        </figure>
      )
    case 'table':
      return (
        <figure className="ef">
          <h4>{fig.title}</h4>
          <table className="ef-table">
            <thead>
              <tr>
                {fig.head.map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fig.rows.map((r) => (
                <tr key={r[0]}>
                  {r.map((c, i) => (
                    <td key={i}>{c}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <figcaption>{fig.caption}</figcaption>
        </figure>
      )
  }
}
