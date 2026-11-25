import { lazy, Suspense, useEffect, useState } from 'react'
import App from './App.tsx'

const loadResearch = () => import('./ResearchPage.tsx')
const ResearchModule = lazy(loadResearch)

function readSavedLightMode(): boolean {
  try {
    return localStorage.getItem('rp-theme-v2') === 'light'
  } catch {
    return false
  }
}

export default function Root() {
  const [hash, setHash] = useState(window.location.hash)

  useEffect(() => {
    const onChange = () => {
      const next = window.location.hash
      setHash(next)
      if (next.startsWith('#/research') && !next.includes('?t=')) {
        window.scrollTo(0, 0)
      }
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadResearch()
    }, 1500)
    return () => window.clearTimeout(timer)
  }, [])

  const match = hash.match(/^#\/research\/?([\w-]*)(?:\?t=([\w-]+))?/)
  const isPaperRoute = Boolean(match)

  useEffect(() => {
    document.documentElement.classList.toggle('paper', isPaperRoute)
    const isLight = readSavedLightMode()
    document.documentElement.classList.toggle('light-mode', isLight)
    const themeMeta = document.getElementById('theme-color-meta')
    if (themeMeta) {
      themeMeta.setAttribute('content', isLight ? '#ffffff' : '#141414')
    }
  }, [isPaperRoute])

  if (match) {
    return (
      <Suspense fallback={<div className="rp" aria-busy="true" />}>
        <ResearchModule slug={match[1] || undefined} thread={match[2]} />
      </Suspense>
    )
  }
  return <App />
}
