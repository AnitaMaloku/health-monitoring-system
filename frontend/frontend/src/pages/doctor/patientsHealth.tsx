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
  const [filters, setFilters] = useState({ name: '', age: '', device: '', status: '' })

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(filters.name.toLowerCase()) &&
    String(patient.age).toLowerCase().includes(filters.age.toLowerCase()) &&
    patient.device.toLowerCase().includes(filters.device.toLowerCase()) &&
    patient.status.toLowerCase().includes(filters.status.toLowerCase())
  )

  return (
    <section className="panel">
      <div className="section-heading">
        <h2>Patients</h2>
      </div>

      <div className="column-filters doctor-column-filters four-columns">
        <input placeholder="Filter name" value={filters.name} onChange={(event) => setFilters({ ...filters, name: event.target.value })} />
        <input placeholder="Filter age" value={filters.age} onChange={(event) => setFilters({ ...filters, age: event.target.value })} />
        <input placeholder="Filter device" value={filters.device} onChange={(event) => setFilters({ ...filters, device: event.target.value })} />
        <input placeholder="Filter status" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })} />
        <button type="button" onClick={() => setFilters({ name: '', age: '', device: '', status: '' })}>Clear</button>
      </div>

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
