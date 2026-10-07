import type { Patient } from '../types'

export function getStatusReason(patient: Patient) {
  if (!patient.hasLiveData) {
    return 'No live measurements available yet.'
  }

  const reasons = []

  if (patient.vitals.heartRate >= 130) {
    reasons.push(`heart rate is critically high at ${patient.vitals.heartRate} BPM`)
  } else if (patient.vitals.heartRate <= 40) {
    reasons.push(`heart rate is critically low at ${patient.vitals.heartRate} BPM`)
  } else if (patient.vitals.heartRate > 100) {
    reasons.push(`heart rate is high at ${patient.vitals.heartRate} BPM`)
  } else if (patient.vitals.heartRate < 60) {
    reasons.push(`heart rate is low at ${patient.vitals.heartRate} BPM`)
  }

  if (patient.vitals.spo2 <= 90) {
    reasons.push(`SpO2 is critical at ${patient.vitals.spo2}%`)
  } else if (patient.vitals.spo2 < 95) {
    reasons.push(`SpO2 is low at ${patient.vitals.spo2}%`)
  }

  if (patient.vitals.temp >= 39) {
    reasons.push(`temperature is critically high at ${patient.vitals.temp} C`)
  } else if (patient.vitals.temp <= 35) {
    reasons.push(`temperature is critically low at ${patient.vitals.temp} C`)
  } else if (patient.vitals.temp > 37.2) {
    reasons.push(`temperature is high at ${patient.vitals.temp} C`)
  } else if (patient.vitals.temp < 36.5) {
    reasons.push(`temperature is low at ${patient.vitals.temp} C`)
  }

  if (patient.vitals.respiratoryRate >= 24) {
    reasons.push(
      `respiratory rate is critically high at ${patient.vitals.respiratoryRate} breaths/min`,
    )
  } else if (patient.vitals.respiratoryRate <= 8) {
    reasons.push(
      `respiratory rate is critically low at ${patient.vitals.respiratoryRate} breaths/min`,
    )
  } else if (patient.vitals.respiratoryRate > 18) {
    reasons.push(
      `respiratory rate is high at ${patient.vitals.respiratoryRate} breaths/min`,
    )
  } else if (patient.vitals.respiratoryRate < 12) {
    reasons.push(
      `respiratory rate is low at ${patient.vitals.respiratoryRate} breaths/min`,
    )
  }

  if (patient.vitals.systolicPressure >= 180) {
    reasons.push(
      `systolic blood pressure is critically high at ${patient.vitals.systolicPressure} mmHg`,
    )
  } else if (patient.vitals.systolicPressure <= 90) {
    reasons.push(
      `systolic blood pressure is critically low at ${patient.vitals.systolicPressure} mmHg`,
    )
  } else if (patient.vitals.systolicPressure > 119) {
    reasons.push(
      `systolic blood pressure is high at ${patient.vitals.systolicPressure} mmHg`,
    )
  } else if (patient.vitals.systolicPressure < 100) {
    reasons.push(
      `systolic blood pressure is low at ${patient.vitals.systolicPressure} mmHg`,
    )
  }

  if (patient.vitals.diastolicPressure >= 120) {
    reasons.push(
      `diastolic blood pressure is critically high at ${patient.vitals.diastolicPressure} mmHg`,
    )
  } else if (patient.vitals.diastolicPressure <= 50) {
    reasons.push(
      `diastolic blood pressure is critically low at ${patient.vitals.diastolicPressure} mmHg`,
    )
  } else if (patient.vitals.diastolicPressure > 79) {
    reasons.push(
      `diastolic blood pressure is high at ${patient.vitals.diastolicPressure} mmHg`,
    )
  } else if (patient.vitals.diastolicPressure < 60) {
    reasons.push(
      `diastolic blood pressure is low at ${patient.vitals.diastolicPressure} mmHg`,
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