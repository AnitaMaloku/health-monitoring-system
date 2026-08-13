import { useState } from 'react'
import { Metric } from '../../components/Metric'
import { PatientVitalsTable } from '../../components/PatientVitalsTable'
import type { Patient } from '../../types'

export function DoctorDashboard({ patients }: { patients: Patient[] }) {
  const [searchTerm, setSearchTerm] = useState('')
  
  const activeDevices = patients.filter((patient) => patient.device !== '-').length
  const criticalAlerts = patients.filter(
    (patient) => patient.status === 'critical',
  ).length
  const warningAlerts = patients.filter(
    (patient) => patient.status === 'warning',
  ).length

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.device.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
          <span>{patients.length} currently monitored</span>
        </div>
        <input
          type="text"
          className="search-input"
          placeholder="Search by patient name or device..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <PatientVitalsTable patients={filteredPatients} compact showStatusReason={false} />
      </section>
    </div>
  )
}
