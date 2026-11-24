import React from 'react'
import katex from 'katex'

// Tokenize display math ($$...$$), inline math ($...$), sidenote refs ([^id]),
// inline code (`...`), bold (**...**), and italic (*...*).
const TOKEN_RE =
  /(\$\$[^$]+?\$\$|\$(?!\s)[^$\n]+?(?<!\s)\$|\[\^[a-zA-Z0-9_-]+\]|`[^`\n]+`|\*\*[^*\n]+?\*\*|\*(?!\s)[^*\n]+?(?<!\s)\*)/g

export type SidenoteRegistry = {
  indexFor: (id: string) => number | undefined
}

function renderMath(tex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(tex.trim(), {
      displayMode,
      throwOnError: false,
      strict: 'ignore',
    })
  } catch {
    return tex
  }
}

export function RichText({
  text,
  sidenotes,
}: {
  text: string
  sidenotes?: SidenoteRegistry
}) {
  const parts = text.split(TOKEN_RE)
  return (
    <>
      {parts.map((part, idx) => {
        if (!part) return null
        if (part.startsWith('$$') && part.endsWith('$$') && part.length >= 4) {
          return (
            <span
              key={idx}
              className="rt-math-block"
              dangerouslySetInnerHTML={{ __html: renderMath(part.slice(2, -2), true) }}
            />
          )
        }
        if (part.startsWith('$') && part.endsWith('$') && part.length >= 3) {
          return (
            <span
              key={idx}
              className="rt-math-inline"
              dangerouslySetInnerHTML={{ __html: renderMath(part.slice(1, -1), false) }}
            />
          )
        }
        if (part.startsWith('[^') && part.endsWith(']') && part.length >= 4) {
          const id = part.slice(2, -1)
          const num = sidenotes?.indexFor(id)
          if (num !== undefined) {
            return (
              <sup key={idx} className="rp-fn-ref">
                <a
                  href={`#fn-${id}`}
                  data-fn-ref={id}
                  onClick={(e) => {
                    e.preventDefault()
                    document.getElementById(`fn-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                  }}
                >
                  {num}
                </a>
              </sup>
            )
          }
          return null
        }
        if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
          return <code key={idx}>{part.slice(1, -1)}</code>
        }
        if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
          return (
            <strong key={idx}>
              <RichText text={part.slice(2, -2)} sidenotes={sidenotes} />
            </strong>
          )
        }
        if (part.startsWith('*') && part.endsWith('*') && part.length >= 3) {
          return <em key={idx}>{part.slice(1, -1)}</em>
        }
        return <React.Fragment key={idx}>{part}</React.Fragment>
      })}
    </>
  )
}
