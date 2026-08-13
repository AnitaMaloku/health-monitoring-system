import { useEffect, useState } from 'react'

type DeviceStatus = 'Active' | 'Inactive' | 'Maintenance' | 'Retired'

type DeviceRow = {
  id: string
  serial: string
  type: string
  status: DeviceStatus
  patient: string
}

type BackendDevice = {
  id: string
  serialNumber: string
  deviceType: string
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'RETIRED'
  patientDevices?: Array<{
    patient?: {
      firstName?: string
      lastName?: string
    }
  }>
}

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3010'

function toDeviceStatus(status: BackendDevice['status']): DeviceStatus {
  const statuses: Record<BackendDevice['status'], DeviceStatus> = {
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
    MAINTENANCE: 'Maintenance',
    RETIRED: 'Retired',
  }

  return statuses[status]
}

function toApiStatus(status: DeviceStatus) {
  return status.toUpperCase()
}

function mapDevice(device: BackendDevice): DeviceRow {
  const assignedPatient = device.patientDevices?.[0]?.patient
  const patientName = assignedPatient
    ? `${assignedPatient.firstName ?? ''} ${assignedPatient.lastName ?? ''}`.trim()
    : ''

  return {
    id: device.id,
    serial: device.serialNumber,
    type: device.deviceType,
    status: toDeviceStatus(device.status),
    patient: patientName || '-',
  }
}

export function DoctorDevicesPage() {
  const [devices, setDevices] = useState<DeviceRow[]>([])
  const [isAddingDevice, setIsAddingDevice] = useState(false)
  const [serial, setSerial] = useState('')
  const [deviceType, setDeviceType] = useState('Wearable monitor')
  const [status, setStatus] = useState<DeviceStatus>('Inactive')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const loadDevices = async () => {
      try {
        const response = await fetch(`${apiUrl}/devices`)

        if (!response.ok) {
          throw new Error('Could not load devices from the database.')
        }

        const data = (await response.json()) as BackendDevice[]
        setDevices(data.map(mapDevice))
        setError('')
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Could not load devices from the database.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadDevices()
  }, [])

  const handleAddDevice = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const normalizedSerial = serial.trim()
    const normalizedType = deviceType.trim()

    if (!normalizedSerial || !normalizedType) {
      setError('Serial number and device type are required.')
      return
    }

    if (
      devices.some(
        (device) =>
          device.serial.toLowerCase() === normalizedSerial.toLowerCase(),
      )
    ) {
      setError('A device with this serial number already exists.')
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch(`${apiUrl}/devices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serialNumber: normalizedSerial,
          deviceType: normalizedType,
          status: toApiStatus(status),
        }),
      })

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as
          | { message?: string }
          | null

        throw new Error(errorBody?.message ?? 'Could not save device.')
      }

      const createdDevice = (await response.json()) as BackendDevice
      setDevices((currentDevices) => [mapDevice(createdDevice), ...currentDevices])
      setSerial('')
      setDeviceType('Wearable monitor')
      setStatus('Inactive')
      setError('')
      setIsAddingDevice(false)
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Could not save device.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="page-stack">
      <section className="panel">
        <div className="section-heading">
          <h2>Devices</h2>
          <button
            className="primary-button"
            type="button"
            onClick={() => setIsAddingDevice((current) => !current)}
          >
            {isAddingDevice ? 'Cancel' : '+ Add Device'}
          </button>
        </div>

        {isAddingDevice && (
          <form className="device-form" onSubmit={handleAddDevice}>
            <label>
              Serial Number
              <input
                value={serial}
                onChange={(event) => setSerial(event.target.value)}
                placeholder="SIM-004"
              />
            </label>
            <label>
              Device Type
              <input
                value={deviceType}
                onChange={(event) => setDeviceType(event.target.value)}
                placeholder="Wearable monitor"
              />
            </label>
            <label>
              Status
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as DeviceStatus)}
              >
                <option>Inactive</option>
                <option>Active</option>
                <option>Maintenance</option>
                <option>Retired</option>
              </select>
            </label>
            <button className="primary-button" type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Device'}
            </button>
            {error && <p className="form-error">{error}</p>}
          </form>
        )}

        <div className="data-table device-table">
          <div className="table-row table-head">
            <span>Serial Number</span>
            <span>Type</span>
            <span>Status</span>
            <span>Patient</span>
            <span>Actions</span>
          </div>
          {isLoading && <div className="empty-state">Loading devices...</div>}
          {!isLoading && devices.length === 0 && (
            <div className="empty-state">No devices added yet.</div>
          )}
          {!isLoading && devices.map((device) => (
            <div className="table-row" key={device.serial}>
              <span>{device.serial}</span>
              <span>{device.type}</span>
              <span>
                <span className={`device-state ${device.status.toLowerCase()}`}>
                  {device.status}
                </span>
              </span>
              <span>{device.patient}</span>
              <span className="actions">
                <button type="button">Assign</button>
                <button type="button">Unassign</button>
                <button type="button">Status</button>
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
