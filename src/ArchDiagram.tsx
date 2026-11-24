import { useEffect, useId, useRef, useState } from 'react'
import { archs } from './arch'
import { RichText } from './components/RichText'

type MermaidApi = {
  initialize: (config: Record<string, unknown>) => void
  render: (id: string, definition: string) => Promise<{ svg: string }>
}

declare global {
  interface Window {
    mermaid?: MermaidApi
  }
}

let mermaidLoader: Promise<MermaidApi> | null = null

function loadMermaid(): Promise<MermaidApi> {
  if (typeof window !== 'undefined' && window.mermaid) {
    return Promise.resolve(window.mermaid)
  }
  if (!mermaidLoader) {
    mermaidLoader = new Promise<MermaidApi>((resolve, reject) => {
      const script = document.createElement('script')
      script.src = '/vendor/mermaid.min.js'
      script.async = true
      script.onload = () => {
        if (window.mermaid) resolve(window.mermaid)
        else reject(new Error('Mermaid failed to initialize'))
      }
      script.onerror = () => reject(new Error('Failed to load /vendor/mermaid.min.js'))
      document.head.appendChild(script)
    })
  }
  return mermaidLoader
}

function useIsLightMode(): boolean {
  const [light, setLight] = useState(() =>
    typeof document !== 'undefined' ? document.documentElement.classList.contains('light-mode') : false,
  )
  useEffect(() => {
    const sync = () => setLight(document.documentElement.classList.contains('light-mode'))
    sync()
    const mo = new MutationObserver(sync)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => mo.disconnect()
  }, [])
  return light
}

export function ArchDiagram({ slug }: { slug: string }) {
  const spec = archs[slug]
  const light = useIsLightMode()
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, '')
  const [svg, setSvg] = useState<string>('')
  const [err, setErr] = useState<string>('')
  const seqRef = useRef(0)

  useEffect(() => {
    if (!spec) return
    let alive = true
    const renderId = `mmd-${rawId}-${++seqRef.current}`

    loadMermaid()
      .then(async (mermaid) => {
        if (!alive) return
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'loose',
          theme: 'base',
          fontFamily: 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: 'basis',
            nodeSpacing: 32,
            rankSpacing: 40,
            padding: 16,
            wrappingWidth: 220,
          },
          sequence: {
            useMaxWidth: true,
            actorMargin: 36,
            boxMargin: 10,
            messageMargin: 34,
            mirrorActors: false,
            wrap: true,
          },
          themeVariables: light
            ? {
                background: '#ffffff',
                primaryColor: '#f6f8fa',
                primaryTextColor: '#1f2328',
                primaryBorderColor: '#4d7596',
                secondaryColor: '#f6f5f0',
                secondaryTextColor: '#1f2328',
                secondaryBorderColor: '#c98b1e',
                tertiaryColor: '#faf9f7',
                tertiaryTextColor: '#1f2328',
                tertiaryBorderColor: '#d8d4cc',
                lineColor: '#5b8aa6',
                textColor: '#1f2328',
                mainBkg: '#f6f8fa',
                nodeBorder: '#4d7596',
                clusterBkg: '#faf9f7',
                clusterBorder: '#d0d7de',
                actorBkg: '#f6f8fa',
                actorBorder: '#4d7596',
                actorTextColor: '#1f2328',
                actorLineColor: '#8c959f',
                signalColor: '#4d7596',
                signalTextColor: '#1f2328',
                noteBkgColor: '#f6f8fa',
                noteBorderColor: '#d0d7de',
                noteTextColor: '#1f2328',
                labelBoxBkgColor: '#ffffff',
                labelBoxBorderColor: '#d0d7de',
                labelTextColor: '#1f2328',
                edgeLabelBackground: '#ffffff',
                fontSize: '13.5px',
              }
            : {
                background: '#141414',
                primaryColor: '#1c2128',
                primaryTextColor: '#f0f3f6',
                primaryBorderColor: '#5b8aa6',
                secondaryColor: '#221f1a',
                secondaryTextColor: '#f0f3f6',
                secondaryBorderColor: '#e0a83f',
                tertiaryColor: '#181818',
                tertiaryTextColor: '#e6edf3',
                tertiaryBorderColor: '#30363d',
                lineColor: '#6ca2c2',
                textColor: '#f0f3f6',
                mainBkg: '#1c2128',
                nodeBorder: '#5b8aa6',
                clusterBkg: '#171a1f',
                clusterBorder: '#30363d',
                actorBkg: '#1c2128',
                actorBorder: '#5b8aa6',
                actorTextColor: '#f0f3f6',
                actorLineColor: '#484f58',
                signalColor: '#6ca2c2',
                signalTextColor: '#f0f3f6',
                noteBkgColor: '#1c2128',
                noteBorderColor: '#30363d',
                noteTextColor: '#e6edf3',
                labelBoxBkgColor: '#161b22',
                labelBoxBorderColor: '#30363d',
                labelTextColor: '#e6edf3',
                edgeLabelBackground: '#141414',
                fontSize: '13.5px',
              },
        })
        const out = await mermaid.render(renderId, spec.diagram)
        if (alive) {
          setSvg(out.svg)
          setErr('')
        }
      })
      .catch((e: unknown) => {
        if (alive) setErr(e instanceof Error ? e.message : 'Diagram render error')
      })

    return () => {
      alive = false
    }
  }, [spec, light, rawId])

  if (!spec) return null

  return (
    <figure className="arch arch-mermaid">
      <div className="arch-mermaid__head">
        <span>{spec.title}</span>
        <code>mermaid</code>
      </div>
      <div className="arch-mermaid__stage">
        {svg ? (
          <div className="arch-mermaid__svg" dangerouslySetInnerHTML={{ __html: svg }} />
        ) : err ? (
          <pre className="arch-mermaid__fallback">{spec.diagram}</pre>
        ) : (
          <div className="arch-mermaid__loading">Rendering architecture graph…</div>
        )}
      </div>
      <figcaption>
        <RichText text={spec.caption} />
      </figcaption>
    </figure>
  )
}
