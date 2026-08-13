import { StatusPill } from '../../components/StatusPill'
import type { Patient } from '../../types'

export function DoctorPatientsHealthPage({
  patients,
  onOpenPatient,
}: {
  patients: Patient[]
  onOpenPatient: (id: number) => void
}) {
  return (
    <section className="panel">
      <div className="section-heading">
        <h2>Patients</h2>

      </div>

      <div className="data-table patient-table">
        <div className="table-row table-head">
          <span>Name</span>
          <span>Age</span>
          <span>Device</span>
          <span>Status</span>
          <span>Action</span>
        </div>
        {patients.map((patient) => (
          <div className="table-row" key={patient.id}>
            <span>{patient.name}</span>
            <span>{patient.age}</span>
            <span>{patient.device}</span>
            <span>
              <StatusPill status={patient.status} />
            </span>
            <span>
              <button type="button" onClick={() => onOpenPatient(patient.id)}>
                Open
              </button>
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
