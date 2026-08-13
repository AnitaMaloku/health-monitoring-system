import { AlertList } from '../../components/AlertList'
import type { Alert } from '../../types'

export function DoctorAlertsPage({ alerts }: { alerts: Alert[] }) {
  return (
    <section className="panel">
      <div className="section-heading">
        <h2>Alerts</h2>
        <span>{alerts.length} active</span>
      </div>
      {alerts.length === 0 ? (
        <div className="empty-state">No active alerts.</div>
      ) : (
        <AlertList alerts={alerts} />
      )}
    </section>
  )
}
