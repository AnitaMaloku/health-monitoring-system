import type { Alert, HealthMeasurement, Patient, PatientStatus } from '../types'

export const basePatients: Patient[] = [
  {
    id: 1,
    name: 'John Smith',
    age: 45,
    device: 'DEV-001',
    status: 'normal',
    vitals: {
      serialNumber: 'DEV-001',
      heartRate: 78,
      spo2: 98,
      temp: 36.8,
      systolicPressure: 120,
      diastolicPressure: 80,
      respiratoryRate: 16,
    },
  },
  {
    id: 2,
    name: 'Anna Brown',
    age: 62,
    device: 'DEV-002',
    status: 'warning',
    vitals: {
      serialNumber: 'DEV-002',
      heartRate: 115,
      spo2: 94,
      temp: 37.8,
      systolicPressure: 138,
      diastolicPressure: 88,
      respiratoryRate: 20,
    },
  },
  {
    id: 3,
    name: 'Mike Wilson',
    age: 71,
    device: 'DEV-003',
    status: 'critical',
    vitals: {
      serialNumber: 'DEV-003',
      heartRate: 142,
      spo2: 89,
      temp: 39.1,
      systolicPressure: 154,
      diastolicPressure: 96,
      respiratoryRate: 25,
    },
  },
]

export const alerts: Alert[] = [
  {
    level: 'critical',
    title: 'High Heart Rate',
    patient: 'Mike Wilson',
    value: 'Heart Rate: 142 BPM',
    time: '10 seconds ago',
  },
  {
    level: 'warning',
    title: 'High Temperature',
    patient: 'Anna Brown',
    value: 'Temperature: 37.8 C',
    time: '2 minutes ago',
  },
]

export const historyRows = [
  { date: '09 Aug', hr: 78, spo2: '98%', temp: '36.8', bp: '120/80', rr: 16 },
  { date: '08 Aug', hr: 82, spo2: '97%', temp: '36.7', bp: '118/78', rr: 17 },
  { date: '07 Aug', hr: 75, spo2: '99%', temp: '36.6', bp: '121/80', rr: 16 },
  { date: '06 Aug', hr: 80, spo2: '98%', temp: '36.7', bp: '119/79', rr: 18 },
]

export function classifyVitals(vitals: Patient['vitals']): PatientStatus {
  if (
    vitals.heartRate >= 130 ||
    vitals.spo2 <= 90 ||
    vitals.temp >= 39 ||
    vitals.respiratoryRate >= 24
  ) {
    return 'critical'
  }

  if (
    vitals.heartRate >= 105 ||
    vitals.spo2 <= 94 ||
    vitals.temp >= 37.8 ||
    vitals.respiratoryRate >= 20
  ) {
    return 'warning'
  }

  return 'normal'
}

export function mergeLatestMeasurement(
  patients: Patient[],
  latest?: HealthMeasurement,
) {
  if (!latest) {
    return patients
  }

  return patients.map((patient) => {
    if (patient.device !== latest.serialNumber && patient.id !== 1) {
      return patient
    }

    const vitals = {
      serialNumber: latest.serialNumber ?? patient.device,
      heartRate: latest.heartRate ?? patient.vitals.heartRate,
      spo2: latest.spo2 ?? patient.vitals.spo2,
      temp: latest.temp ?? patient.vitals.temp,
      systolicPressure:
        latest.systolicPressure ?? patient.vitals.systolicPressure,
      diastolicPressure:
        latest.diastolicPressure ?? patient.vitals.diastolicPressure,
      respiratoryRate: latest.respiratoryRate ?? patient.vitals.respiratoryRate,
    }

    return {
      ...patient,
      device: vitals.serialNumber,
      vitals,
      status: classifyVitals(vitals),
    }
  })
}
