import { useState } from 'react'
import { EssayFigure } from './EssayFigure'
import { romans } from './essays'
import { getEssay } from './essays-extra'
import { Replay } from './Replay'
import { repoUrl, researchRepos, type ResearchRepo } from './research'

function CopyBlock({ command }: { command: string }) {
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

function Install({ repo }: { repo: ResearchRepo }) {
  const [tab, setTab] = useState(0)
  const active = repo.install[tab]
  return (
    <div>
      <div className="rp-tabs" role="tablist">
        {repo.install.map((item, i) => (
          <button
            key={item.label}
            type="button"
            role="tab"
            aria-selected={i === tab}
            onClick={() => setTab(i)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {active.note ? <p className="rp-note">{active.note}</p> : null}
      <CopyBlock command={active.command} />
    </div>
  )
}

export function ResearchIndex() {
  return (
    <div className="rp">
      <a className="rp-back" href="#/">
        ← shaan4d.xyz
      </a>
      <h1>Research repositories</h1>
      <p className="rp-lede">
        Five public repositories. Inspect the findings, then pull a release into
        your own workflow. Every result is bounded and unreplicated, and each page
        says what it does not show.
      </p>
      <ul className="rp-list">
        {researchRepos.map((r) => (
          <li key={r.slug}>
            <a href={`#/research/${r.slug}`}>
              <strong>{r.name}</strong>
              <span>{r.tagline}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ResearchPage({ slug }: { slug: string }) {
  const repo = researchRepos.find((r) => r.slug === slug)
  if (!repo) return <ResearchIndex />
  const essay = getEssay(repo.slug)
  const url = repoUrl(repo.repo)
  const extra = ['Build with it', 'What this does not show']
  const toc = [...essay.sections.map((x) => x.title), ...extra]
  const id = (i: number) => `s${i + 1}`
  const base = essay.sections.length
  return (
    <div className="rp rp-essay">
      <a className="rp-back" href="#/research">
        ← all research repositories
      </a>
      <p className="rp-eyebrow">Research · v0.1.0 · Apache-2.0</p>
      <h1>{repo.name}</h1>
      <p className="rp-lede">{repo.tagline}</p>
      <CopyBlock command={repo.install[0].command} />

      <Replay slug={repo.slug} />

      <blockquote className="rp-callout">{essay.callout}</blockquote>
      {essay.voice ? (
        <div className="rp-voice">
          {essay.voice.map((v) => (
            <p key={v.slice(0, 30)}>{v}</p>
          ))}
        </div>
      ) : null}

      <nav className="rp-toc" aria-label="Sections">
        {toc.map((t, i) => (
          <a key={t} href={`#/research/${slug}`} onClick={(e) => { e.preventDefault(); document.getElementById(id(i))?.scrollIntoView({ behavior: 'smooth' }) }}>
            <span>{romans[i]}</span> {t}
          </a>
        ))}
      </nav>

      {essay.sections.map((sec, i) => (
        <section key={sec.title} id={id(i)} className="rp-sec">
          <h3>
            <span>{romans[i]}</span> {sec.title}
          </h3>
          {sec.body.map((p) => (
            <p key={p.slice(0, 40)}>{p}</p>
          ))}
          {sec.aside ? <aside className="rp-aside">{sec.aside}</aside> : null}
          {sec.figures?.map((f, j) => (
            <EssayFigure key={j} fig={f} />
          ))}
        </section>
      ))}

      <section id={id(base)} className="rp-sec">
        <h3>
          <span>{romans[base]}</span> Build with it
        </h3>
        <p>Pull the pinned release into your workflow, then run the check before you trust anything.</p>
        <Install repo={repo} />
        <p className="rp-note">
          Pinned to <code>v0.1.0</code>.{' '}
          <a href={`${url}/releases/latest`} target="_blank" rel="noreferrer">
            All releases
          </a>
        </p>
        {repo.usage.map((u) => (
          <div key={u.title}>
            <p className="rp-note">
              <strong>{u.title}.</strong> {u.note}
            </p>
            <CopyBlock command={u.code} />
          </div>
        ))}
        <p className="rp-note">Check it works:</p>
        <CopyBlock command={repo.reproduce} />
        {repo.custody ? <p className="rp-note">{repo.custody}</p> : null}
      </section>

      <section id={id(base + 1)} className="rp-sec">
        <h3>
          <span>{romans[base + 1]}</span> What this does not show
        </h3>
        <p>{repo.notShown}</p>
        <ul>
          {repo.limits.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </section>

      <section className="rp-sec rp-appendix">
        <h3>
          <span>Appendix</span> Sources and further reading
        </h3>
        <ul className="rp-sources">
          {essay.sources?.map((src) => (
            <li key={src.url}>
              <a href={src.url} target="_blank" rel="noreferrer">
                {src.label}
              </a>
              <em>{src.why}</em>
            </li>
          ))}
        </ul>
        <h3>
          <span>Appendix</span> Read the research
        </h3>
        <p className="rp-links">
          {repo.docs.map((d) => (
            <a key={d.label} href={d.path.startsWith('#') ? `${url}${d.path}` : `${url}/${d.path}`} target="_blank" rel="noreferrer">
              {d.label}
            </a>
          ))}
          <a href={url} target="_blank" rel="noreferrer">GitHub</a>
          <a href="#/research">Other repositories</a>
        </p>
      </section>
    </div>
  )
}
