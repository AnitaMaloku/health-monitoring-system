import { useEffect, useState } from 'react'

type DeviceStatus = 'Active' | 'Inactive' | 'Maintenance' | 'Retired'

type DeviceFormState = {
  serial: string
  deviceType: string
}

type DeviceRow = {
  id: string
  serial: string
  type: string
  status: DeviceStatus
  patient: string
  isAssigned: boolean
}

type PatientOption = {
  id: string
  firstName?: string | null
  lastName?: string | null
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

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3003'

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
    isAssigned: Boolean(assignedPatient),
  }
}

const emptyForm: DeviceFormState = {
  serial: '',
  deviceType: 'Wearable monitor',
}

const emptyAssignment = {
  patientId: '',
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const errorBody = (await response.json()) as { message?: string }
    return errorBody?.message ?? 'Request failed.'
  } catch {
    return 'Request failed.'
  }
}

export function DoctorDevicesPage() {
  const [devices, setDevices] = useState<DeviceRow[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<DeviceFormState>(emptyForm)
  const [assignmentDevice, setAssignmentDevice] = useState<DeviceRow | null>(null)
  const [assignmentData, setAssignmentData] = useState(emptyAssignment)
  const [availablePatients, setAvailablePatients] = useState<PatientOption[]>([])
  const [isAssignmentOpen, setIsAssignmentOpen] = useState(false)
  const [isLoadingPatients, setIsLoadingPatients] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)
  const [isUnassigningId, setIsUnassigningId] = useState<string | null>(null)

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

  useEffect(() => {
    loadDevices()
  }, [])

  const resetForm = () => {
    setFormData(emptyForm)
    setEditingId(null)
    setIsFormOpen(false)
    setError('')
  }

  const openAddModal = () => {
    setEditingId(null)
    setFormData(emptyForm)
    setError('')
    setIsFormOpen(true)
  }

  const handleEdit = (device: DeviceRow) => {
    setIsFormOpen(true)
    setEditingId(device.id)
    setError('')
    setFormData({
      serial: device.serial,
      deviceType: device.type,
    })
  }

  const handleAddDevice = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const normalizedSerial = formData.serial.trim()
    const normalizedType = formData.deviceType.trim()

    if (!normalizedSerial || !normalizedType) {
      setError('Serial number and device type are required.')
      return
    }

    if (
      devices.some((device) => {
        const isSameDevice = editingId ? device.id === editingId : false

        return (
          !isSameDevice &&
          device.serial.toLowerCase() === normalizedSerial.toLowerCase()
        )
      })
    ) {
      setError('A device with this serial number already exists.')
      return
    }

    setIsSaving(true)

    try {
      const payload = editingId
        ? {
            serialNumber: normalizedSerial,
            deviceType: normalizedType,
          }
        : {
            serialNumber: normalizedSerial,
            deviceType: normalizedType,
            status: toApiStatus('Inactive' as DeviceStatus),
          }

      const response = editingId
        ? await fetch(`${apiUrl}/devices/${editingId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          })
        : await fetch(`${apiUrl}/devices`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          })

      if (!response.ok) {
        throw new Error(await readErrorMessage(response))
      }

      const createdDevice = (await response.json()) as BackendDevice
      const mappedDevice = mapDevice(createdDevice)

      setDevices((currentDevices) =>
        editingId
          ? currentDevices.map((device) =>
              device.id === editingId ? mappedDevice : device,
            )
          : [mappedDevice, ...currentDevices],
      )
      resetForm()
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

  const handleDelete = async (deviceId: string) => {
    const confirmed = window.confirm('Delete this device?')
    if (!confirmed) return

    try {
      const response = await fetch(`${apiUrl}/devices/${deviceId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(await readErrorMessage(response))
      }

      setDevices((currentDevices) =>
        currentDevices.filter((device) => device.id !== deviceId),
      )
      setError('')
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Could not delete device.',
      )
    }
  }

  const openAssignModal = async (device: DeviceRow) => {
    setAssignmentDevice(device)
    setAssignmentData(emptyAssignment)
    setAvailablePatients([])
    setIsAssignmentOpen(true)
    setError('')
    setIsLoadingPatients(true)

    try {
      const response = await fetch(`${apiUrl}/patients/without-device`)

      if (!response.ok) {
        throw new Error('Could not load available patients.')
      }

      const data = (await response.json()) as PatientOption[]
      setAvailablePatients(data)
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Could not load available patients.',
      )
    } finally {
      setIsLoadingPatients(false)
    }
  }

  const resetAssignment = () => {
    setAssignmentDevice(null)
    setAssignmentData(emptyAssignment)
    setAvailablePatients([])
    setIsAssignmentOpen(false)
    setError('')
  }

  const handleAssign = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!assignmentDevice || !assignmentData.patientId) {
      setError('Choose a patient without an assigned device.')
      return
    }

    setIsAssigning(true)
    setError('')

    try {
      const response = await fetch(`${apiUrl}/devices/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: assignmentData.patientId,
          deviceId: assignmentDevice.id,
        }),
      })

      if (!response.ok) {
        throw new Error(await readErrorMessage(response))
      }

      await loadDevices()
      resetAssignment()
    } catch (assignError) {
      setError(
        assignError instanceof Error
          ? assignError.message
          : 'Could not assign device.',
      )
    } finally {
      setIsAssigning(false)
    }
  }

  const handleUnassign = async (deviceId: string) => {
    const confirmed = window.confirm('Unassign this device from the patient?')
    if (!confirmed) return

    setIsUnassigningId(deviceId)
    setError('')

    try {
      const response = await fetch(`${apiUrl}/devices/${deviceId}/unassign`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error(await readErrorMessage(response))
      }

      await loadDevices()
    } catch (unassignError) {
      setError(
        unassignError instanceof Error
          ? unassignError.message
          : 'Could not unassign device.',
      )
    } finally {
      setIsUnassigningId(null)
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
            onClick={openAddModal}
          >
            + Add Device
          </button>
        </div>

        {error && <p className="form-error">{error}</p>}

        {isFormOpen && (
          <div className="modal-overlay" onClick={resetForm}>
            <div className="modal-card" onClick={(event) => event.stopPropagation()}>
              <div className="modal-header">
                <h3>{editingId ? 'Edit Device' : 'Add Device'}</h3>
                <button type="button" onClick={resetForm} aria-label="Close device form">
                  ✕
                </button>
              </div>

              <form className="modal-form" onSubmit={handleAddDevice}>
                <div className="modal-form-grid">
                  <label>
                    Serial Number
                    <input
                      value={formData.serial}
                      onChange={(event) =>
                        setFormData((current) => ({ ...current, serial: event.target.value }))
                      }
                      placeholder="SIM-004"
                    />
                  </label>

                  <label>
                    Device Type
                    <input
                      value={formData.deviceType}
                      onChange={(event) =>
                        setFormData((current) => ({
                          ...current,
                          deviceType: event.target.value,
                        }))
                      }
                      placeholder="Wearable monitor"
                    />
                  </label>

                </div>

                <div className="modal-actions">
                  <button type="button" onClick={resetForm}>
                    Cancel
                  </button>
                  <button className="primary-button" type="submit" disabled={isSaving}>
                    {isSaving ? 'Saving...' : editingId ? 'Update Device' : 'Save Device'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isAssignmentOpen && assignmentDevice && (
          <div className="modal-overlay" onClick={resetAssignment}>
            <div className="modal-card" onClick={(event) => event.stopPropagation()}>
              <div className="modal-header">
                <h3>Assign Device</h3>
                <button type="button" onClick={resetAssignment} aria-label="Close assignment form">
                  ✕
                </button>
              </div>

              <form className="modal-form" onSubmit={handleAssign}>
                <div className="modal-form-grid">
                  <label>
                    Device
                    <input value={`${assignmentDevice.serial} - ${assignmentDevice.type}`} disabled />
                  </label>

                  <label>
                    Patient without device
                    <select
                      value={assignmentData.patientId}
                      onChange={(event) =>
                        setAssignmentData({ patientId: event.target.value })
                      }
                      disabled={isLoadingPatients}
                    >
                      <option value="">
                        {isLoadingPatients ? 'Loading patients...' : 'Select patient'}
                      </option>
                      {availablePatients.map((patient) => {
                        const fullName = `${patient.firstName ?? ''} ${patient.lastName ?? ''}`.trim()

                        return (
                          <option key={patient.id} value={patient.id}>
                            {fullName || 'Unknown patient'}
                          </option>
                        )
                      })}
                    </select>
                  </label>
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={resetAssignment}>
                    Cancel
                  </button>
                  <button className="primary-button" type="submit" disabled={isAssigning || isLoadingPatients}>
                    {isAssigning ? 'Assigning...' : 'Assign Device'}
                  </button>
                </div>
              </form>
            </div>
          </div>
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
            <div className="table-row" key={device.id}>
              <span>{device.serial}</span>
              <span>{device.type}</span>
              <span>
                <span className={`device-state ${device.status.toLowerCase()}`}>
                  {device.status}
                </span>
              </span>
              <span>{device.patient}</span>
              <span className="actions">
                {!device.isAssigned && device.status !== 'Active' && (
                  <button type="button" onClick={() => openAssignModal(device)}>
                    Assign
                  </button>
                )}
                {device.isAssigned && (
                  <button
                    type="button"
                    onClick={() => handleUnassign(device.id)}
                    disabled={isUnassigningId === device.id}
                  >
                    {isUnassigningId === device.id ? 'Unassigning...' : 'Unassign'}
                  </button>
                )}
                <button type="button" onClick={() => handleEdit(device)}>
                  Edit
                </button>
                <button type="button" onClick={() => handleDelete(device.id)}>
                  Delete
                </button>
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
