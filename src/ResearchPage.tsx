import { useState } from 'react'
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
  const url = repoUrl(repo.repo)
  return (
    <div className="rp">
      <a className="rp-back" href="#/research">
        ← all research repositories
      </a>
      <h1>{repo.name}</h1>
      <p className="rp-lede">{repo.tagline}</p>
      <CopyBlock command={repo.install[0].command} />

      <h2>The question</h2>
      <p>{repo.question}</p>

      <h2>What you get</h2>
      <p>{repo.headline}</p>
      <div className="rp-metrics">
        {repo.results.map((m) => (
          <div key={m.label}>
            <strong>{m.value}</strong>
            <span>{m.label}</span>
          </div>
        ))}
      </div>

      <h2>Pull a release</h2>
      <Install repo={repo} />
      <p className="rp-note">
        Pinned to <code>v0.1.0</code>.{' '}
        <a href={`${url}/releases/latest`} target="_blank" rel="noreferrer">
          All releases
        </a>
      </p>

      <h2>Check it works</h2>
      <CopyBlock command={repo.reproduce} />
      {repo.custody ? <p className="rp-note">{repo.custody}</p> : null}

      <h2>What this does not show</h2>
      <p>{repo.notShown}</p>
      <ul>
        {repo.limits.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>

      <h2>Read the research</h2>
      <p className="rp-links">
        {repo.docs.map((d) => (
          <a
            key={d.label}
            href={d.path.startsWith('#') ? `${url}${d.path}` : `${url}/${d.path}`}
            target="_blank"
            rel="noreferrer"
          >
            {d.label}
          </a>
        ))}
        <a href={url} target="_blank" rel="noreferrer">
          GitHub
        </a>
        <a href="#/research">Other repositories</a>
      </p>
      <p className="rp-foot">Apache-2.0. Part of the evidence-bounded research series.</p>
    </div>
  )
}
