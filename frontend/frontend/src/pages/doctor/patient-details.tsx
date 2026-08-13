import { HealthHistoryTable } from '../../components/HealthHistoryTable'
import { StatusPill } from '../../components/StatusPill'
import { StatusReason } from '../../components/StatusReason'
import { VitalCards } from '../../components/VitalCards'
import type { Patient } from '../../types'

type DetailTab = 'live' | 'history'

export function DoctorPatientDetailsPage({
  patient,
  tab,
  setTab,
}: {
  patient: Patient
  tab: DetailTab
  setTab: (tab: DetailTab) => void
}) {
  return (
    <div className="page-stack">
      <section className="panel patient-header">
        <h2>{patient.name}</h2>
          <p>Device: {patient.device}</p>
        <div>
          
          <StatusReason patient={patient} />
        </div>
        <StatusPill status={patient.status} />
      </section>

      <div className="tabbar" role="tablist" aria-label="Patient detail tabs">
        {(['live', 'history'] as const).map((item) => (
          <button
            className={tab === item ? 'active' : ''}
            type="button"
            onClick={() => setTab(item)}
            key={item}
          >
            {item === 'live'
              ? 'Live Monitoring'
              : item.charAt(0).toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'live' && (
        <VitalCards patient={patient} />
      )}

      {tab === 'history' && (
        <section className="panel">
          <div className="section-heading">
            <h2>History</h2>
            <span>Last 20 measurements</span>
          </div>
          <HealthHistoryTable patient={patient} />
        </section>
      )}
    </div>
  )
}
