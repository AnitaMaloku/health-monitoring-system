import { AlertList } from '../../components/AlertList'
import type { Alert } from '../../types'

export function DoctorAlertsPage({ alerts }: { alerts: Alert[] }) {
  return (
    <section className="panel">
      <div className="section-heading">
        <h2>Alerts</h2>
        <span>{alerts.length} in 24h</span>
      </div>
      {alerts.length === 0 ? (
        <div className="empty-state">No alerts in the last 24 hours.</div>
      ) : (
        <AlertList alerts={alerts} />
      )}
    </section>
  )
}
