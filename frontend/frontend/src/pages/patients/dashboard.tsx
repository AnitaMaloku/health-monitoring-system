import { StatusPill } from '../../components/StatusPill'
import { StatusReason } from '../../components/StatusReason'
import { VitalCards } from '../../components/VitalCards'
import type { Patient } from '../../types'

export function PatientDashboardPage({ patient }: { patient: Patient }) {
  return (
    <div className="page-stack">
      <VitalCards patient={patient} />
      <section className="panel patient-status">
        <div>
          <span>Current health status</span>
          <StatusReason patient={patient} />
        </div>
        <StatusPill status={patient.status} />
      </section>
    </div>
  )
}
