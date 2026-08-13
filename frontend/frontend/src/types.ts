export type Route =
  | '/doctor/dashboard'
  | '/doctor/patients'
  | '/doctor/patientsHealth'
  | '/doctor/patient-details'
  | '/doctor/devices'
  | '/doctor/alerts'

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
  id: string | number
  name: string
  age: number
  device: string
  status: PatientStatus
  hasLiveData: boolean
  vitals: PatientVitals
}

export type Alert = {
  id?: string
  patientId?: string
  level: 'warning' | 'critical'
  title?: string
  patient?: string
  metric?: string
  value?: string | number
  message?: string
  time?: string
  createdAt?: string
  resolvedAt?: string | null
}
