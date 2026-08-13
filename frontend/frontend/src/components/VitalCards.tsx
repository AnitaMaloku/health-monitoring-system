import type { Patient } from '../types'

function formatValue(value: string | number | null | undefined) {
  return value === null || value === undefined ? '--' : `${value}`
}

function vitalTone(label: string, value: number) {
  if (label === 'Heart Rate') {
    if (value >= 130) return 'critical'
    if (value >= 105) return 'warning'
  }

  if (label === 'SpO2') {
    if (value <= 90) return 'critical'
    if (value <= 94) return 'warning'
  }

  if (label === 'Temperature') {
    if (value >= 39) return 'critical'
    if (value >= 37.8) return 'warning'
  }

  if (label === 'Respiratory Rate') {
    if (value >= 24) return 'critical'
    if (value >= 20) return 'warning'
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
      tone: 'normal',
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
