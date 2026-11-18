import { lazy, Suspense, useEffect, useState } from 'react'
import App from './App.tsx'

const ResearchModule = lazy(() => import('./ResearchPage.tsx'))

export default function Root() {
  const [hash, setHash] = useState(window.location.hash)
  useEffect(() => {
    const onChange = () => {
      setHash(window.location.hash)
      // Only #/research routes are pages. In-page anchors such as #systems scroll on their own,
      // and a thread link (#/research?t=memory) scrolls to its chapter.
      const next = window.location.hash
      if (next.startsWith('#/') && !next.includes('?t=')) window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  const match = hash.match(/^#\/research\/?([\w-]*)(?:\?t=([\w-]+))?/)
  useEffect(() => {
    document.documentElement.classList.toggle('paper', Boolean(match))
  }, [match])
  if (match) {
    return (
      <Suspense fallback={<div className="rp"><p className="rp-lede">Loading research monograph…</p></div>}>
        <ResearchModule slug={match[1] || undefined} thread={match[2]} />
      </Suspense>
    )
  }
  return <App />
}
