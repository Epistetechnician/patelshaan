import { useEffect, useState } from 'react'
import App from './App.tsx'
import { ResearchIndex, ResearchPage } from './ResearchPage.tsx'

export default function Root() {
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
  useEffect(() => {
    document.documentElement.classList.toggle('paper', Boolean(match))
  }, [match])
  if (match) {
    return match[1] ? <ResearchPage slug={match[1]} /> : <ResearchIndex />
  }
  return <App />
}
