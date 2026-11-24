import { useState } from 'react'

export function CitationBlock({
  slug,
  title,
  year = '2026',
}: {
  slug: string
  title: string
  year?: string
}) {
  const [copied, setCopied] = useState(false)
  const key = `patel${year}${slug.replace(/[^a-z0-9]/gi, '')}`
  const bibtex = `@misc{${key},
  title  = {${title}},
  author = {Patel, Shaan},
  year   = {${year}},
  url    = {https://shaan4d.xyz/#/research/${slug}}
}`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(bibtex)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1400)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="post-citation">
      <div className="post-citation__head">
        <span>BibTeX</span>
        <button type="button" onClick={copy}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre>
        <code>{bibtex}</code>
      </pre>
    </div>
  )
}
