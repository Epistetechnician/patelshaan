import { useState } from 'react'
import { Demo } from './Demos'
import { ManimFilm } from './components/ManimFilm'
import { RichText } from './components/RichText'
import type { Figure } from './essays'
import { PostAnimCanvas } from './viz/ResearchAnims'

const chipLabel = { pass: 'pass', fail: 'fail', stop: 'stop', open: 'open' }

function SnippetFigure({
  kind,
  title,
  lang,
  content,
  caption,
}: {
  kind: 'code' | 'terminal'
  title: string
  lang?: string
  content: string
  caption: string
}) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1400)
    } catch {
      /* clipboard unavailable */
    }
  }
  return (
    <figure className={`ef ef-snippet ef-snippet--${kind}`}>
      <div className="ef-snippet__head">
        <span>
          <span className="demo-tag">{kind === 'terminal' ? 'output' : lang ?? 'code'}</span>
          {title}
        </span>
        <button type="button" onClick={copy}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre>
        <code>{content}</code>
      </pre>
      <figcaption>
        <RichText text={caption} />
      </figcaption>
    </figure>
  )
}

export function EssayFigure({ fig }: { fig: Figure }) {
  switch (fig.kind) {
    case 'replay':
      return null
    case 'demo':
      return <Demo id={fig.id} />
    case 'anim':
      return <PostAnimCanvas id={fig.id} variant="inline" />
    case 'film':
      return <ManimFilm film={fig} />
    case 'code':
      return (
        <SnippetFigure
          kind="code"
          title={fig.title}
          lang={fig.lang}
          content={fig.code}
          caption={fig.caption}
        />
      )
    case 'terminal':
      return (
        <SnippetFigure
          kind="terminal"
          title={fig.title}
          content={fig.output}
          caption={fig.caption}
        />
      )
    case 'plate':
      return (
        <figure className="ef ef-plate">
          <h4><RichText text={fig.title} /></h4>
          <div className="ef-plate__frame">
            <img src={fig.src} alt={fig.alt} loading="lazy" />
          </div>
          {fig.legend?.length ? (
            <dl className="ef-plate__legend">
              {fig.legend.map((item) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd><RichText text={item.detail} /></dd>
                </div>
              ))}
            </dl>
          ) : null}
          <figcaption><RichText text={fig.caption} /></figcaption>
        </figure>
      )
    case 'roadmap':
      return (
        <figure className="ef">
          <h4><RichText text={fig.title} /></h4>
          <div className="roadmap">
            {([['done', 'Done', fig.done], ['next', 'Next', fig.next], ['blocked', 'Blocked or open', fig.blocked]] as const).map(([k, h, items]) => (
              <div key={k} className={k}>
                <h5>{h}</h5>
                <ul>
                  {items.map((i) => (
                    <li key={i}><RichText text={i} /></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <figcaption><RichText text={fig.caption} /></figcaption>
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
          <div className="ef-scroll">
            <div className="ef-matrix" style={{ gridTemplateColumns: `5rem repeat(${fig.cols.length}, minmax(5.5rem, 1fr))` }}>
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
          <h4><RichText text={fig.title} /></h4>
          <div className="ef-scroll">
            <table className="ef-table">
              <thead>
                <tr>
                  {fig.head.map((h) => (
                    <th key={h}><RichText text={h} /></th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fig.rows.map((r) => (
                  <tr key={r[0]}>
                    {r.map((c, i) => (
                      <td key={i}><RichText text={c} /></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <figcaption><RichText text={fig.caption} /></figcaption>
        </figure>
      )
  }
}
