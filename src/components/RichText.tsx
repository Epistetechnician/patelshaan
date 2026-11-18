import React from 'react'

const INLINE_TOKEN_RE = /(`[^`\n]+`|\*\*[^*\n]+?\*\*|\*(?!\s)[^*\n]+?(?<!\s)\*)/g

export function RichText({ text }: { text: string }) {
  const parts = text.split(INLINE_TOKEN_RE)
  return (
    <>
      {parts.map((part, idx) => {
        if (!part) return null
        if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
          return <code key={idx}>{part.slice(1, -1)}</code>
        }
        if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
          return <strong key={idx}><RichText text={part.slice(2, -2)} /></strong>
        }
        if (part.startsWith('*') && part.endsWith('*') && part.length >= 3) {
          return <em key={idx}>{part.slice(1, -1)}</em>
        }
        return <React.Fragment key={idx}>{part}</React.Fragment>
      })}
    </>
  )
}
