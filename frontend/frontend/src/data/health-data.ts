import type { HealthMeasurement, Patient, PatientStatus } from '../types'


export function classifyVitals(vitals: Patient['vitals']): PatientStatus {
  // CRITICAL
  if (
    vitals.heartRate >= 130 || vitals.heartRate <= 40 ||
    vitals.spo2 <= 90 ||
    vitals.temp >= 39 || vitals.temp <= 35 ||
    vitals.respiratoryRate >= 24 || vitals.respiratoryRate <= 8 ||
    vitals.systolicPressure >= 180 || vitals.systolicPressure <= 90 ||
    vitals.diastolicPressure >= 120 || vitals.diastolicPressure <= 50
  ) {
    return 'critical'
  }

  // WARNING
  if (
    vitals.heartRate >= 105 || vitals.heartRate <= 60 ||
    vitals.spo2 <= 94 ||
    vitals.temp >= 37.8 || vitals.temp <= 36 ||
    vitals.respiratoryRate >= 20 || vitals.respiratoryRate <= 12 ||
    vitals.systolicPressure >= 140 || vitals.systolicPressure <= 100 ||
    vitals.diastolicPressure >= 90 || vitals.diastolicPressure <= 60
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

    // Convert temp to number if it's a string (from Prisma Decimal)
    let tempValue = patient.vitals.temp
    if (latest.temp !== null && latest.temp !== undefined) {
      const parsedTemp = typeof latest.temp === 'string' ? parseFloat(latest.temp) : latest.temp
      tempValue = Number.isFinite(parsedTemp) ? parsedTemp : patient.vitals.temp
    }

    const vitals = {
      serialNumber: latest.serialNumber ?? patient.device,
      heartRate: latest.heartRate ?? patient.vitals.heartRate,
      spo2: latest.spo2 ?? patient.vitals.spo2,
      temp: tempValue,
      systolicPressure:
        latest.systolicPressure ?? patient.vitals.systolicPressure,
      diastolicPressure:
        latest.diastolicPressure ?? patient.vitals.diastolicPressure,
      respiratoryRate: latest.respiratoryRate ?? patient.vitals.respiratoryRate,
    }

    return {
      ...patient,
      device: vitals.serialNumber,
      hasLiveData: true,
      vitals,
      status: classifyVitals(vitals),
    }
  })
}
