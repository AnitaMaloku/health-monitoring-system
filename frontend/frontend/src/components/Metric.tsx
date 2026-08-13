type MetricTone = 'default' | 'normal' | 'critical' | 'warning'

export function Metric({
  label,
  value,
  tone = 'default',
}: {
  label: string
  value: string | number
  tone?: MetricTone
}) {
  return (
    <article className={`metric metric-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  )
}
