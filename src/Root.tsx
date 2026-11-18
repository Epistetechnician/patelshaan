import { lazy, Suspense, useEffect, useState } from 'react'
import App from './App.tsx'

const loadResearch = () => import('./ResearchPage.tsx')
const ResearchModule = lazy(loadResearch)
const loadPlaybook = () => import('./PlaybookPage.tsx')
const PlaybookModule = lazy(loadPlaybook)

export default function Root() {
  const [hash, setHash] = useState(window.location.hash)

  useEffect(() => {
    const onChange = () => {
      const next = window.location.hash
      setHash(next)
      if ((next.startsWith('#/research') || next.startsWith('#/playbook')) && !next.includes('?t=')) {
        window.scrollTo(0, 0)
      }
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadResearch()
      void loadPlaybook()
    }, 1500)
    return () => window.clearTimeout(timer)
  }, [])

  const match = hash.match(/^#\/research\/?([\w-]*)(?:\?t=([\w-]+))?/)
  const isPlaybookRoute = hash.startsWith('#/playbook')
  const isPaperRoute = Boolean(match) || isPlaybookRoute

  useEffect(() => {
    document.documentElement.classList.toggle('paper', isPaperRoute)
    const themeMeta = document.getElementById('theme-color-meta')
    if (themeMeta) {
      themeMeta.setAttribute('content', isPaperRoute ? '#fdfcfa' : '#08090a')
    }
  }, [isPaperRoute])

  if (isPlaybookRoute) {
    return (
      <Suspense fallback={<div className="rp" aria-busy="true" />}>
        <PlaybookModule />
      </Suspense>
    )
  }

  if (match) {
    return (
      <Suspense fallback={<div className="rp" aria-busy="true" />}>
        <ResearchModule slug={match[1] || undefined} thread={match[2]} />
      </Suspense>
    )
  }
  return <App />
}
