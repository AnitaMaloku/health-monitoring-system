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
  const vitals = [
    {
      label: 'Heart Rate',
      value: patient.vitals.heartRate,
      unit: 'BPM',
      tone: vitalTone('Heart Rate', patient.vitals.heartRate),
    },
    {
      label: 'SpO2',
      value: patient.vitals.spo2,
      unit: '%',
      tone: vitalTone('SpO2', patient.vitals.spo2),
    },
    {
      label: 'Temperature',
      value: patient.vitals.temp,
      unit: 'C',
      tone: vitalTone('Temperature', patient.vitals.temp),
    },
    {
      label: 'Blood Pressure',
      value: `${patient.vitals.systolicPressure} / ${patient.vitals.diastolicPressure}`,
      unit: 'mmHg',
      tone: 'normal',
    },
    {
      label: 'Respiratory Rate',
      value: patient.vitals.respiratoryRate,
      unit: 'breaths/min',
      tone: vitalTone('Respiratory Rate', patient.vitals.respiratoryRate),
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
