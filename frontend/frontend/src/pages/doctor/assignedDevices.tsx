import { useEffect, useState } from 'react'
import { apiFetch } from '../../auth'

type AssignedPatient = {
	id: string
	firstName: string
	lastName: string
	patientDevices?: Array<{
		device?: {
			id?: string
			serialNumber?: string | null
			deviceType?: string | null
			status?: string | null
		} | null
	}>
}

type AssignedDeviceRow = {
	patientId: string
	deviceId: string
	patient: string
	serial: string
	type: string
	status: string
}

async function readErrorMessage(response: Response): Promise<string> {
	try {
		const body = (await response.json()) as { message?: string }
		return body.message ?? 'Request failed.'
	} catch {
		return 'Request failed.'
	}
}

export function DoctorAssignedDevicesPage() {
	const [devices, setDevices] = useState<AssignedDeviceRow[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [isUnassigningId, setIsUnassigningId] = useState<string | null>(null)
	const [error, setError] = useState('')
	const [filters, setFilters] = useState({ patient: '', serial: '', type: '', status: '' })

	const loadDevices = async () => {
		try {
			const response = await apiFetch('/patients/with-device')
			if (!response.ok) throw new Error(await readErrorMessage(response))

			const patients = (await response.json()) as AssignedPatient[]
			setDevices(
				patients.flatMap((patient) => {
					const device = patient.patientDevices?.[0]?.device
					if (!device) return []

					return [{
						patientId: patient.id,
						deviceId: device.id ?? '',
						patient: `${patient.firstName} ${patient.lastName}`.trim(),
						serial: device.serialNumber ?? '—',
						type: device.deviceType ?? '—',
						status: device.status ?? 'ACTIVE',
					}]
				}),
			)
			setError('')
		} catch (loadError) {
			setError(loadError instanceof Error ? loadError.message : 'Could not load assigned devices.')
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		void Promise.resolve().then(loadDevices)
	}, [])

	const handleUnassign = async (deviceId: string) => {
		if (!window.confirm('Unassign this device from the patient?')) return

		setIsUnassigningId(deviceId)
		setError('')
		try {
			const response = await apiFetch(`/devices/${deviceId}/unassign`, { method: 'POST' })
			if (!response.ok) throw new Error(await readErrorMessage(response))
			await loadDevices()
		} catch (unassignError) {
			setError(unassignError instanceof Error ? unassignError.message : 'Could not unassign device.')
		} finally {
			setIsUnassigningId(null)
		}
	}

	const filteredDevices = devices.filter((device) =>
		device.patient.toLowerCase().includes(filters.patient.toLowerCase()) &&
		device.serial.toLowerCase().includes(filters.serial.toLowerCase()) &&
		device.type.toLowerCase().includes(filters.type.toLowerCase()) &&
		device.status.toLowerCase().includes(filters.status.toLowerCase()),
	)

	return (
		<section className="panel">
			<div className="section-heading">
				<div>
					<h2>Assigned Devices</h2>
					<span>Devices currently assigned to your patients</span>
				</div>
				<strong>{devices.length}</strong>
			</div>
			{error && <p className="form-error">{error}</p>}
			<div className="column-filters doctor-column-filters four-columns">
				<input placeholder="Filter patient" value={filters.patient} onChange={(event) => setFilters({ ...filters, patient: event.target.value })} />
				<input placeholder="Filter serial number" value={filters.serial} onChange={(event) => setFilters({ ...filters, serial: event.target.value })} />
				<input placeholder="Filter type" value={filters.type} onChange={(event) => setFilters({ ...filters, type: event.target.value })} />
				<input placeholder="Filter status" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })} />
				<button type="button" onClick={() => setFilters({ patient: '', serial: '', type: '', status: '' })}>Clear</button>
			</div>
			<div className="data-table device-table">
				<div className="table-row table-head">
					<span>Patient</span>
					<span>Serial Number</span>
					<span>Type</span>
					<span>Status</span>
					<span>Actions</span>
				</div>
				{isLoading && <div className="empty-state">Loading assigned devices...</div>}
				{!isLoading && devices.length === 0 && <div className="empty-state">No devices are assigned to your patients.</div>}
				{!isLoading && filteredDevices.length === 0 && <div className="empty-state">No assigned devices match your filters.</div>}
				{!isLoading && filteredDevices.map((device) => (
					<div className="table-row" key={device.deviceId}>
						<span>{device.patient}</span>
						<span>{device.serial}</span>
						<span>{device.type}</span>
						<span><span className={`device-state ${device.status.toLowerCase()}`}>{device.status}</span></span>
						<span className="actions">
							<button type="button" onClick={() => void handleUnassign(device.deviceId)} disabled={isUnassigningId === device.deviceId}>
								{isUnassigningId === device.deviceId ? 'Unassigning...' : 'Unassign'}
							</button>
						</span>
					</div>
				))}
			</div>
		</section>
	)
}
