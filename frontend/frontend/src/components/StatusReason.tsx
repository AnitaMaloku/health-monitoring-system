import type { Patient } from '../types'

export function getStatusReason(patient: Patient) {
  if (!patient.hasLiveData) {
    return 'No live measurements available yet.'
  }

  const reasons = []

  if (patient.vitals.heartRate >= 130) {
    reasons.push(`heart rate is critical at ${patient.vitals.heartRate} BPM`)
  } else if (patient.vitals.heartRate >= 105) {
    reasons.push(`heart rate is high at ${patient.vitals.heartRate} BPM`)
  }

  if (patient.vitals.spo2 <= 90) {
    reasons.push(`SpO2 is critical at ${patient.vitals.spo2}%`)
  } else if (patient.vitals.spo2 <= 94) {
    reasons.push(`SpO2 is low at ${patient.vitals.spo2}%`)
  }

  if (patient.vitals.temp >= 39) {
    reasons.push(`temperature is critical at ${patient.vitals.temp} C`)
  } else if (patient.vitals.temp >= 37.8) {
    reasons.push(`temperature is high at ${patient.vitals.temp} C`)
  }

  if (patient.vitals.respiratoryRate >= 24) {
    reasons.push(
      `respiratory rate is critical at ${patient.vitals.respiratoryRate} breaths/min`,
    )
  } else if (patient.vitals.respiratoryRate >= 20) {
    reasons.push(
      `respiratory rate is high at ${patient.vitals.respiratoryRate} breaths/min`,
    )
  }

  if (reasons.length === 0) {
    return 'All vital signs are within the normal range.'
  }

  return `Status is ${patient.status} because ${reasons.join(' and ')}.`
}

export function StatusReason({
  patient,
  compact = false,
}: {
  patient: Patient
  compact?: boolean
}) {
  return (
    <p className={`status-reason status-reason-${patient.status} ${compact ? 'compact' : ''}`}>
      {getStatusReason(patient)}
    </p>
  )
}
