import { useEffect, useState } from 'react'
import { EssayFigure } from './EssayFigure'
import { romans, type Essay } from './essays'
import { getEssay } from './essays-extra'
import { ArchDiagram } from './ArchDiagram'
import { Demo } from './Demos'
import { ReplayWindow } from './Replay'
import { repoUrl, researchCategories, researchRepos, type ResearchRepo } from './research'
import { WorkList } from './components/WorkList'
import { fieldStrands, getField, type FieldStrand } from './field'
import { threadById, threads, type ThreadId } from './humanities'
import { lineage, type Lineage } from './lineage'

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

function TopBar() {
  return (
    <>
      <header className="rp-top">
        <a href="#/" className="rp-name">Shaan Patel</a>
        <nav>
          <a href="#/">Home</a>
          <a href="#frontiers" onClick={() => { window.location.hash = '#frontiers' }}>Frontiers</a>
          <a href="#/research">Research</a>
          <a href="#/playbook">Playbook</a>
          <a href="https://github.com/Epistetechnician" target="_blank" rel="noreferrer">GitHub</a>
        </nav>
      </header>
      <p className="rp-rule"><span>RESEARCH MONOGRAPH</span></p>
    </>
  )
}

/* ---------- the humanities layer ---------- */

const jump = (id: string) => (e: React.MouseEvent) => {
  e.preventDefault()
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

function ThreadChips({ ids }: { ids: ThreadId[] }) {
  return (
    <p className="rp-chips" aria-label="Threads">
      {ids.map((t) => (
        <a key={t} href={`#/research?t=${t}`}>
          {threadById(t).title}
        </a>
      ))}
    </p>
  )
}

function People({ text }: { text: string }) {
  return (
    <p className="rp-people">
      <span>Who is on the other end</span>
      {text}
    </p>
  )
}

function Epigraph({ epigraph }: { epigraph: NonNullable<Lineage['epigraph']> }) {
  return (
    <figure className="rp-epigraph">
      <blockquote lang={epigraph.lang}>{epigraph.text}</blockquote>
      {epigraph.gloss ? <p className="rp-epigraph__gloss">{epigraph.gloss}</p> : null}
      <figcaption>{epigraph.by}</figcaption>
    </figure>
  )
}

function EssaySections({ essay }: { essay: Essay }) {
  return (
    <>
      {essay.sections.map((sec, i) => (
        <section key={sec.title} id={`s${i + 1}`} className="rp-sec">
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
    </>
  )
}

function LineageBlock({ data, id, numeral }: { data: Lineage; id: string; numeral: string }) {
  return (
    <section id={id} className="rp-sec rp-lineage">
      <h3>
        <span>{numeral}</span> Older versions of the question
      </h3>
      <p className="rp-lineage__intro">
        None of this is new in kind. The questions under the code have long histories in law, ritual, accounting and
        philosophy, and those histories say something about what to build and how to report it.
      </p>
      {data.sections.map((sec) => (
        <div key={sec.title} className="rp-lineage__item">
          <h4>{sec.title}</h4>
          {sec.body.map((p) => (
            <p key={p.slice(0, 40)}>{p}</p>
          ))}
        </div>
      ))}
      <h4 className="rp-shelf-head">On the shelf</h4>
      <WorkList ids={data.shelf} />
    </section>
  )
}

function Sources({ sources }: { sources?: { label: string; url: string; why: string }[] }) {
  if (!sources?.length) return null
  return (
    <ul className="rp-sources">
      {sources.map((src) => (
        <li key={src.url}>
          <a href={src.url} target="_blank" rel="noreferrer">
            {src.label}
          </a>
          <em>{src.why}</em>
        </li>
      ))}
    </ul>
  )
}

export function ResearchIndex({ thread }: { thread?: string }) {
  useEffect(() => {
    if (!thread) return
    window.requestAnimationFrame(() => document.getElementById(`thread-${thread}`)?.scrollIntoView())
  }, [thread])

  return (
    <div className="rp rp-essay">
      <TopBar />
      <h1>Research</h1>
      <p className="rp-lede">
        Twelve research repositories and one multilingual field study, read as a single programme: how do you know that
        an empirical claim about a model, an improvement an agent made to itself, or a coordination promise between
        strangers is real? Every page reports its positive findings, its nulls and self-caught confounds, how to
        recompute or run the artifact, and what it does not yet show.
      </p>

      {researchCategories.map((cat) => {
        const items = researchRepos.filter((r) => r.category === cat.id)
        return (
          <section key={cat.id} className="rp-cat">
            <h2 className="rp-cat__title">{cat.title}</h2>
            <p className="rp-note">{cat.subtitle}</p>
            <ul className="rp-list">
              {items.map((r) => (
                <li key={r.slug}>
                  <a href={`#/research/${r.slug}`}>
                    <strong>{r.name}</strong>
                    <span>{r.tagline}</span>
                    <em>{r.results[0]?.value} · {r.results[0]?.label}</em>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )
      })}

      <section className="rp-cat">
        <h2 className="rp-cat__title">Socio-Cultural &amp; Computational Humanities</h2>
        <p className="rp-note">
          Open-license multilingual corpora, pre-registered narrative episode coding, and blinded philological handoff instruments.
        </p>
        <ul className="rp-list">
          {fieldStrands.map((f) => (
            <li key={f.slug}>
              <a href={`#/research/${f.slug}`}>
                <strong>{f.name}</strong>
                <span>{f.tagline}</span>
                <em>Field study &amp; open-license corpus · {f.results[0]?.value} passages, 195 coded episodes</em>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="rp-sec">
        <h3>Why a research page quotes Plutarch</h3>
        <p>
          The projects here use an engineering vocabulary that was borrowed. <em>Trust</em>, <em>memory</em>,{' '}
          <em>authority</em>, <em>evidence</em>, <em>receipt</em>, <em>witness</em>: the words came from courts,
          shrines, counting-houses and philosophy classrooms, and each arrives carrying a record of what went wrong
          when it was used carelessly.
        </p>
        <p>
          Reading back into those words changes the engineering. It suggests which failures to expect (a measure that
          becomes a target, a deputy that spends authority on the wrong errand, a market that cannot tell good from
          bad), and it suggests a tone for reporting them: the null result that stays in the notebook, the claim that
          names its own ceiling. It also keeps the people in view. Behind every benchmark is someone deciding whom to
          believe.
        </p>
        <p>
          The notes below are a commonplace book, in the old sense: a place to copy down what has been useful from
          other people’s thinking, with the reason it was worth keeping.
        </p>
      </section>

      <section className="rp-sec rp-book" aria-label="Commonplace book">
        <h3>Commonplace book</h3>
        <nav className="rp-toc" aria-label="Threads">
          {threads.map((t, i) => (
            <a key={t.id} href={`#/research?t=${t.id}`} onClick={jump(`thread-${t.id}`)}>
              <span>{romans[i]}</span> {t.title}
            </a>
          ))}
        </nav>
        {threads.map((t, i) => (
          <article key={t.id} id={`thread-${t.id}`} className="rp-thread">
            <h4>
              <span>{romans[i]}</span> {t.title}
            </h4>
            <p className="rp-thread__q">{t.question}</p>
            {t.essay.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
            {t.inquiries.length ? (
              <p className="rp-thread__runs">
                <strong>Runs through:</strong>{' '}
                {t.inquiries.map((s, k) => (
                  <span key={s}>
                    {k ? ', ' : ''}
                    <a href={`#/research/${s}`}>
                      {researchRepos.find((r) => r.slug === s)?.name ?? getField(s)?.name ?? s}
                    </a>
                  </span>
                ))}
              </p>
            ) : null}
            <details>
              <summary>
                On the shelf <small>({t.works.length})</small>
              </summary>
              <WorkList ids={t.works} />
            </details>
          </article>
        ))}
      </section>
    </div>
  )
}

function FieldPage({ field }: { field: FieldStrand }) {
  const essay = field.essay
  const base = essay.sections.length
  const toc = [...essay.sections.map((x) => x.title), 'Older versions of the question', 'What this does not show']
  const id = (i: number) => `s${i + 1}`
  return (
    <div className="rp rp-essay">
      <TopBar />
      <h1>{field.name}</h1>
      <p className="rp-lede">{field.tagline}</p>
      <p className="rp-status">{field.status}</p>
      <ThreadChips ids={field.threads} />

      <dl className="rp-results">
        {field.results.map((r) => (
          <div key={r.label}>
            <dt>{r.value}</dt>
            <dd>{r.label}</dd>
          </div>
        ))}
      </dl>

      <blockquote className="rp-callout">{essay.callout}</blockquote>
      <People text={field.people} />

      <ArchDiagram slug={field.slug} />

      <nav className="rp-toc" aria-label="Sections">
        {toc.map((t, i) => (
          <a key={t} href={`#/research/${field.slug}`} onClick={jump(id(i))}>
            <span>{romans[i]}</span> {t}
          </a>
        ))}
      </nav>

      <EssaySections essay={essay} />

      <section id={id(base)} className="rp-sec rp-lineage">
        <h3>
          <span>{romans[base]}</span> Older versions of the question
        </h3>
        <p>
          Pilgrimage has been studied by historians, anthropologists and the pilgrims themselves for a long time. The
          books below are the ones the study stands on, or coded directly. Most of them are about what a mountain
          or liturgical journey does to the people who walk it, which is the thing a corpus count cannot see.
        </p>
        <WorkList ids={field.shelf} />
      </section>

      <section id={id(base + 1)} className="rp-sec">
        <h3>
          <span>{romans[base + 1]}</span> What this does not show
        </h3>
        <p>{field.notShown}</p>
        <ul>
          {field.limits.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </section>

      <section className="rp-sec rp-appendix">
        <h3>
          <span>Appendix</span> Sources
        </h3>
        <Sources sources={field.sources} />
        <p className="rp-links">
          <a href="#/research">All 13 research pages</a>
        </p>
      </section>
    </div>
  )
}

export default function ResearchRoute({ slug, thread }: { slug?: string; thread?: string }) {
  return slug ? <ResearchPage slug={slug} /> : <ResearchIndex thread={thread} />
}

export function ResearchPage({ slug }: { slug: string }) {
  const field = getField(slug)
  const repo = researchRepos.find((r) => r.slug === slug)
  if (field) return <FieldPage field={field} />
  if (!repo) return <ResearchIndex />
  const essay = getEssay(repo.slug)
  const lin = lineage[repo.slug]
  const url = repoUrl(repo.repo)
  const extra = ['Build with it', 'What this does not show']
  const toc = [
    ...essay.sections.map((x) => x.title),
    ...(lin ? ['Older versions of the question'] : []),
    ...extra,
  ]
  const id = (i: number) => `s${i + 1}`
  const base = essay.sections.length
  const lineIdx = lin ? base : -1
  const buildIdx = base + (lin ? 1 : 0)
  return (
    <div className="rp rp-essay">
      <TopBar />
      <h1>{repo.name}</h1>
      <p className="rp-lede">{repo.tagline}</p>
      <CopyBlock command={repo.install[0].command} />
      {lin ? <ThreadChips ids={lin.threads} /> : null}

      <dl className="rp-results">
        {repo.results.slice(0, 4).map((r) => (
          <div key={r.label}>
            <dt>{r.value}</dt>
            <dd>{r.label}</dd>
          </div>
        ))}
      </dl>

      {repo.slug === 'theseus-lab' ? <Demo id="netswap" /> : null}

      <ReplayWindow slug={repo.slug} repo={repo.repo} />

      <blockquote className="rp-callout">{essay.callout}</blockquote>
      {lin ? <People text={lin.people} /> : null}
      {essay.voice ? (
        <div className="rp-voice">
          {essay.voice.map((v) => (
            <p key={v.slice(0, 30)}>{v}</p>
          ))}
        </div>
      ) : null}
      {lin?.epigraph ? <Epigraph epigraph={lin.epigraph} /> : null}

      <ArchDiagram slug={repo.slug} />

      <nav className="rp-toc" aria-label="Sections">
        {toc.map((t, i) => (
          <a key={t} href={`#/research/${slug}`} onClick={jump(id(i))}>
            <span>{romans[i]}</span> {t}
          </a>
        ))}
      </nav>

      <EssaySections essay={essay} />

      {lin ? <LineageBlock data={lin} id={id(lineIdx)} numeral={romans[lineIdx]} /> : null}

      <section id={id(buildIdx)} className="rp-sec">
        <h3>
          <span>{romans[buildIdx]}</span> Build with it
        </h3>
        <p>Clone or pull the repository into your workflow, then run the verification check before trusting any number.</p>
        <Install repo={repo} />
        <p className="rp-note">
          Target ref: <code>{repo.releaseLabel ?? 'v0.1.0'}</code>.{' '}
          <a href={url} target="_blank" rel="noreferrer">
            Repository &amp; releases
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

      <section id={id(buildIdx + 1)} className="rp-sec">
        <h3>
          <span>{romans[buildIdx + 1]}</span> What this does not show
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
        <Sources sources={essay.sources} />
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
          <a href="#/research">All 13 research pages</a>
        </p>
      </section>
    </div>
  )
}
