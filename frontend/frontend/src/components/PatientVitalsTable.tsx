import type { Patient } from '../types'
import { StatusPill } from './StatusPill'
import { StatusReason } from './StatusReason'

export function PatientVitalsTable({
  patients,
  compact = false,
  showStatusReason = true,
}: {
  patients: Patient[]
  compact?: boolean
  showStatusReason?: boolean
}) {
  return (
    <div className={`data-table ${compact ? 'doctor-table' : ''}`}>
      <div className="table-row table-head">
        <span>Patient</span>
        <span>Heart Rate</span>
        <span>SpO2</span>
        <span>Temp</span>
        <span>Status</span>
      </div>
      {patients.map((patient) => (
        <div className="table-row" key={patient.id}>
          <span>{patient.name}</span>
          <span>{patient.vitals.heartRate}</span>
          <span>{patient.vitals.spo2}%</span>
          <span>{patient.vitals.temp}</span>
          <span>
            <StatusPill status={patient.status} />
            {showStatusReason && patient.status !== 'normal' && (
              <StatusReason patient={patient} compact />
            )}
          </span>
        </div>
      ))}
    </div>
  )
}
