export function MiniChart({ title, values }: { title: string; values: number[] }) {
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = max - min || 1
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1 || 1)) * 100
      const y = 74 - ((value - min) / range) * 52
      return `${x},${y}`
    })
    .join(' ')

  return (
    <article className="chart-card">
      <h3>{title}</h3>
      <svg viewBox="0 0 100 84" role="img" aria-label={title}>
        <line x1="0" x2="100" y1="74" y2="74" />
        <polyline points={points} />
      </svg>
    </article>
  )
}
