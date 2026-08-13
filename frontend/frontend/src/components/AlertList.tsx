import type { Alert } from '../types'

export function AlertList({ alerts }: { alerts: Alert[] }) {
  return (
    <div className="alert-list">
      {alerts.map((alert) => (
        <article className={`alert alert-${alert.level}`} key={alert.title}>
          <div>
            <strong>{alert.level.toUpperCase()}</strong>
            <h3>{alert.title}</h3>
            <p>{alert.patient}</p>
          </div>
          <div>
            <span>{alert.value}</span>
            <small>{alert.time}</small>
          </div>
        </article>
      ))}
    </div>
  )
}
