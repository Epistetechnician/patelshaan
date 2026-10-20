import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './research.css'
import App from './App.tsx'
import { ResearchIndex, ResearchPage } from './ResearchPage.tsx'

function Root() {
  const [hash, setHash] = useState(window.location.hash)
  useEffect(() => {
    const onChange = () => {
      setHash(window.location.hash)
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  const match = hash.match(/^#\/research\/?([\w-]*)/)
  if (match) {
    return match[1] ? <ResearchPage slug={match[1]} /> : <ResearchIndex />
  }
  return <App />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
