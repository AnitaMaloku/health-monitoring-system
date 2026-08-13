import { AlertList } from '../../components/AlertList'
import { Metric } from '../../components/Metric'
import { PatientVitalsTable } from '../../components/PatientVitalsTable'
import { alerts } from '../../data/health-data'
import type { Patient } from '../../types'

export function DoctorDashboard({ patients }: { patients: Patient[] }) {
  const activeDevices = patients.filter((patient) => patient.device !== '-').length
  const criticalAlerts = patients.filter(
    (patient) => patient.status === 'critical',
  ).length

  return (
    <div className="page-stack">
      <section className="metric-grid" aria-label="Doctor summary">
        <Metric label="Patients" value={patients.length} />
        <Metric label="Active Devices" value={activeDevices} />
        <Metric label="Critical Alerts" value={criticalAlerts} tone="critical" />
        <Metric label="System Status" value="Online" tone="normal" />
      </section>

      <section className="panel">
        <div className="section-heading">
          <h2>Recent Patients</h2>
          <span>{patients.length} currently monitored</span>
        </div>
        <PatientVitalsTable patients={patients} compact showStatusReason={false} />
      </section>

      <section className="panel">
        <div className="section-heading">
          <h2>Recent Alerts</h2>
          <a href="#/doctor/alerts">View all</a>
        </div>
        <AlertList alerts={alerts} />
      </section>
    </div>
  )
}
