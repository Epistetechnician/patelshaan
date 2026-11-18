import { works } from '../humanities'

export function WorkList({ ids, compact = false }: { ids: string[]; compact?: boolean }) {
  const items = ids.map((id) => works[id]).filter(Boolean)
  return (
    <ul className={`shelf${compact ? ' shelf--compact' : ''}`}>
      {items.map((w) => (
        <li key={w.id}>
          <p className="shelf__cite">
            <span className="shelf__by">{w.by}</span>
            {', '}
            {w.url ? (
              <a href={w.url} target="_blank" rel="noreferrer">
                <em>{w.title}</em>
              </a>
            ) : (
              <em>{w.title}</em>
            )}{' '}
            <span className="shelf__year">({w.year})</span>
          </p>
          {compact ? null : <p className="shelf__note">{w.note}</p>}
        </li>
      ))}
    </ul>
  )
}
