import { useState } from 'react'
import { StatusPill } from '../../components/StatusPill'
import type { Patient } from '../../types'

export function DoctorPatientsHealthPage({
  patients,
  onOpenPatient,
}: {
  patients: Patient[]
  onOpenPatient: (id: string | number) => void
}) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.device.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <section className="panel">
      <div className="section-heading">
        <h2>Patients</h2>
      </div>

      <input
        type="text"
        className="search-input"
        placeholder="Search by patient name or device..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="data-table patient-table">
        <div className="table-row table-head">
          <span>Name</span>
          <span>Age</span>
          <span>Device</span>
          <span>Status</span>
          <span>Action</span>
        </div>
        {filteredPatients.length === 0 && (
          <div className="empty-state">No patients match your search.</div>
        )}
        {filteredPatients.map((patient) => (
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
