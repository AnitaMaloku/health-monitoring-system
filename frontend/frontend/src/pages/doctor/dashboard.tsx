import { Metric } from '../../components/Metric'
import { PatientVitalsTable } from '../../components/PatientVitalsTable'
import type { Patient } from '../../types'

export function DoctorDashboard({ patients }: { patients: Patient[] }) {
  const activeDevices = patients.filter(
    (patient) => patient.device !== '-' && patient.device !== 'No device',
  ).length
  const criticalAlerts = patients.filter(
    (patient) => patient.status === 'critical',
  ).length
  const warningAlerts = patients.filter(
    (patient) => patient.status === 'warning',
  ).length

  return (
    <div className="page-stack">
      <section className="metric-grid" aria-label="Doctor summary">
        <Metric label="Patients" value={patients.length} />
        <Metric label="Active Devices" value={activeDevices} />
        <Metric label="Critical Alerts" value={criticalAlerts} tone="critical" />
        <Metric label="Warning Alerts" value={warningAlerts} tone="warning" />
      </section>

      <section className="panel">
        <div className="section-heading">
          <h2>Recent Patients</h2>
          <span>{patients.length} assigned patients</span>
        </div>
        <PatientVitalsTable patients={patients} compact showStatusReason={false} />
      </section>
    </div>
  )
}
