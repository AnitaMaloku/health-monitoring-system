export type Route =
  | '/doctor/dashboard'
  | '/doctor/patients'
  | '/doctor/patientsHealth'
  | '/doctor/patient-details'
  | '/doctor/devices'
  | '/doctor/alerts'
  | '/patient/dashboard'

export type HealthMeasurement = {
  id?: number
  serialNumber?: string
  patientDeviceId?: number
  heartRate?: number | null
  spo2?: number | null
  temp?: number | null
  systolicPressure?: number | null
  diastolicPressure?: number | null
  respiratoryRate?: number | null
  timestamp?: string
}

export type PatientStatus = 'normal' | 'warning' | 'critical'

export type PatientVitals = {
  serialNumber: string
  heartRate: number
  spo2: number
  temp: number
  systolicPressure: number
  diastolicPressure: number
  respiratoryRate: number
}

export type Patient = {
  id: number
  name: string
  age: number
  device: string
  status: PatientStatus
  vitals: PatientVitals
}

export type Alert = {
  level: 'warning' | 'critical'
  title: string
  patient: string
  value: string
  time: string
}
