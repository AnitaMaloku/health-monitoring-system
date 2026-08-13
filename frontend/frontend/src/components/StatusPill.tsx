import type { PatientStatus } from '../types'

function statusLabel(status: PatientStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export function StatusPill({ status }: { status: PatientStatus }) {
  return <span className={`status-pill ${status}`}>{statusLabel(status)}</span>
}
