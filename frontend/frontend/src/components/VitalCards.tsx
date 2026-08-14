import type { Patient } from '../types'

function formatValue(value: string | number | null | undefined) {
  return value === null || value === undefined ? '--' : `${value}`
}

function vitalTone(label: string, value: number) {
  if (label === 'Heart Rate') {
    if (value >= 130 || value <= 40) return 'critical'
    if (value >= 105 || value <= 60) return 'warning'
  }

  if (label === 'SpO2') {
    if (value <= 90) return 'critical'
    if (value <= 94) return 'warning'
  }

  if (label === 'Temperature') {
    if (value >= 39 || value <= 35) return 'critical'
    if (value >= 37.8 || value <= 36) return 'warning'
  }

  if (label === 'Respiratory Rate') {
    if (value >= 24 || value <= 8) return 'critical'
    if (value >= 20 || value <= 12) return 'warning'
  }

  return 'normal'
}

// Blood pressure needs its own helper since it's two values (systolic/diastolic)
// combined into one card, unlike the other single-value vitals above.
function bloodPressureTone(systolic: number, diastolic: number) {
  if (systolic >= 180 || systolic <= 90 || diastolic >= 120 || diastolic <= 50) {
    return 'critical'
  }
  if (systolic >= 140 || systolic <= 100 || diastolic >= 90 || diastolic <= 60) {
    return 'warning'
  }
  return 'normal'
}

export function VitalCards({ patient }: { patient: Patient }) {
  const hasLiveData = patient.hasLiveData

  const vitals = [
    {
      label: 'Heart Rate',
      value: hasLiveData ? patient.vitals.heartRate : undefined,
      unit: 'BPM',
      tone: hasLiveData ? vitalTone('Heart Rate', patient.vitals.heartRate) : 'normal',
    },
    {
      label: 'SpO2',
      value: hasLiveData ? patient.vitals.spo2 : undefined,
      unit: '%',
      tone: hasLiveData ? vitalTone('SpO2', patient.vitals.spo2) : 'normal',
    },
    {
      label: 'Temperature',
      value: hasLiveData ? patient.vitals.temp : undefined,
      unit: 'C',
      tone: hasLiveData ? vitalTone('Temperature', patient.vitals.temp) : 'normal',
    },
    {
      label: 'Blood Pressure',
      value: hasLiveData
        ? `${patient.vitals.systolicPressure} / ${patient.vitals.diastolicPressure}`
        : undefined,
      unit: 'mmHg',
      tone: hasLiveData
        ? bloodPressureTone(patient.vitals.systolicPressure, patient.vitals.diastolicPressure)
        : 'normal',
    },
    {
      label: 'Respiratory Rate',
      value: hasLiveData ? patient.vitals.respiratoryRate : undefined,
      unit: 'breaths/min',
      tone: hasLiveData
        ? vitalTone('Respiratory Rate', patient.vitals.respiratoryRate)
        : 'normal',
    },
  ]

  return (
    <section className="vitals-grid" aria-label={`${patient.name} vitals`}>
      {vitals.map((vital) => (
        <article className={`vital vital-${vital.tone}`} key={vital.label}>
          <span>{vital.label}</span>
          <strong>{formatValue(vital.value)}</strong>
          <small>{vital.unit}</small>
        </article>
      ))}
    </section>
  )
}