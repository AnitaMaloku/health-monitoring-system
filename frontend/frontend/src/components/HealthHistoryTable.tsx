import { useEffect, useState } from 'react'
import type { HealthMeasurement, Patient } from '../types'
import { MiniChart } from './MiniChart'

type HealthHistoryTableProps = {
  patient?: Patient
}

export function HealthHistoryTable({ patient }: HealthHistoryTableProps) {
  const [measurements, setMeasurements] = useState<HealthMeasurement[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3003'

  useEffect(() => {
    if (!patient || patient.id === undefined) {
      setMeasurements([])
      return
    }

    let isMounted = true
    setLoading(true)
    setError(null)

    const fetchMeasurements = async () => {
      try {
        const response = await fetch(
          `${apiUrl}/patients/${patient.id}/measurements?limit=20`,
        )

        if (!response.ok) {
          throw new Error('Failed to fetch measurements')
        }

        const data = (await response.json()) as HealthMeasurement[]

        if (isMounted) {
          setMeasurements(data)
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : 'Unknown error',
          )
          setMeasurements([])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchMeasurements()

    return () => {
      isMounted = false
    }
  }, [patient?.id, apiUrl])

  const formatTimestamp = (timestamp?: string): string => {
    if (!timestamp) return 'N/A'
    try {
      const date = new Date(timestamp)
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return 'N/A'
    }
  }

  const formatTemperature = (temp?: number | string | null): string => {
    if (temp === null || temp === undefined) {
      return 'N/A'
    }
    try {
      const tempNum = typeof temp === 'string' ? parseFloat(temp) : temp
      return Number.isFinite(tempNum) ? tempNum.toFixed(1) : 'N/A'
    } catch {
      return 'N/A'
    }
  }

  const formatBP = (systolic?: number | null, diastolic?: number | null): string => {
    if (
      systolic === undefined ||
      systolic === null ||
      diastolic === undefined ||
      diastolic === null
    ) {
      return 'N/A'
    }
    return `${systolic}/${diastolic}`
  }

  // Extract values for charts (up to last 10 measurements)
  const hrValues = measurements
    .slice(0, 10)
    .reverse()
    .map((m) => m.heartRate ?? 0)
  const tempValues = measurements
    .slice(0, 10)
    .reverse()
    .map((m) => {
      if (m.temp === null || m.temp === undefined) return 0
      const temp = typeof m.temp === 'string' ? parseFloat(m.temp) : m.temp
      return Number.isFinite(temp) ? temp : 0
    })
  const bpValues = measurements
    .slice(0, 10)
    .reverse()
    .map((m) => m.systolicPressure ?? 0)

  if (loading) {
    return <div className="data-table history-table"><p>Loading measurements...</p></div>
  }

  if (error) {
    return <div className="data-table history-table"><p>Error: {error}</p></div>
  }

  return (
    <>
      <div className="data-table history-table">
        <div className="table-row table-head">
          <span>Date/Time</span>
          <span>HR</span>
          <span>SpO2</span>
          <span>Temp</span>
          <span>BP</span>
          <span>Resp. Rate</span>
        </div>
        {measurements.length > 0 ? (
          measurements.map((measurement, index) => (
            <div className="table-row" key={`${measurement.timestamp}-${index}`}>
              <span>{formatTimestamp(measurement.timestamp)}</span>
              <span>{measurement.heartRate ?? 'N/A'}</span>
              <span>
                {measurement.spo2 !== null && measurement.spo2 !== undefined
                  ? `${measurement.spo2}%`
                  : 'N/A'}
              </span>
              <span>
                {formatTemperature(measurement.temp)}
              </span>
              <span>
                {formatBP(
                  measurement.systolicPressure,
                  measurement.diastolicPressure,
                )}
              </span>
              <span>{measurement.respiratoryRate ?? 'N/A'}</span>
            </div>
          ))
        ) : (
          <div className="table-row">
            <span>No measurements available</span>
          </div>
        )}
      </div>

      {measurements.length > 0 && (
        <div className="chart-grid history-charts">
          <MiniChart title="Heart rate over time" values={hrValues} />
          <MiniChart title="Temperature over time" values={tempValues} />
          <MiniChart title="Blood pressure trend" values={bpValues} />
        </div>
      )}
    </>
  )
}
