import { useEffect, useState } from 'react'
import { apiFetch } from '../../auth'

type Device = {
	id: string
	serialNumber: string
	deviceType: string
	status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'RETIRED'
}

type Patient = {
	id: string
	firstName?: string | null
	lastName?: string | null
}

async function readErrorMessage(response: Response): Promise<string> {
	try {
		const body = (await response.json()) as { message?: string }
		return body.message ?? 'Request failed.'
	} catch {
		return 'Request failed.'
	}
}

export function DoctorAvailableDevicesPage() {
	const [devices, setDevices] = useState<Device[]>([])
	const [patients, setPatients] = useState<Patient[]>([])
	const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
	const [selectedPatientId, setSelectedPatientId] = useState('')
	const [isLoading, setIsLoading] = useState(true)
	const [isAssigning, setIsAssigning] = useState(false)
	const [error, setError] = useState('')
	const [filters, setFilters] = useState({ serial: '', type: '', status: '' })

	const loadData = async () => {
		try {
			const [devicesResponse, patientsResponse] = await Promise.all([
				apiFetch('/devices'),
				apiFetch('/patients/without-device'),
			])
			if (!devicesResponse.ok) throw new Error(await readErrorMessage(devicesResponse))
			if (!patientsResponse.ok) throw new Error(await readErrorMessage(patientsResponse))

			const allDevices = (await devicesResponse.json()) as Device[]
			setDevices(allDevices.filter((device) => device.status === 'INACTIVE'))
			setPatients((await patientsResponse.json()) as Patient[])
			setError('')
		} catch (loadError) {
			setError(loadError instanceof Error ? loadError.message : 'Could not load available devices.')
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		void Promise.resolve().then(loadData)
	}, [])

	const handleAssign = async () => {
		if (!selectedDevice || !selectedPatientId) return

		setIsAssigning(true)
		setError('')
		try {
			const response = await apiFetch('/devices/assign', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ deviceId: selectedDevice.id, patientId: selectedPatientId }),
			})
			if (!response.ok) throw new Error(await readErrorMessage(response))

			setSelectedDevice(null)
			setSelectedPatientId('')
			await loadData()
		} catch (assignError) {
			setError(assignError instanceof Error ? assignError.message : 'Could not assign device.')
		} finally {
			setIsAssigning(false)
		}
	}

	const filteredDevices = devices.filter((device) =>
		device.serialNumber.toLowerCase().includes(filters.serial.toLowerCase()) &&
		device.deviceType.toLowerCase().includes(filters.type.toLowerCase()) &&
		device.status.toLowerCase().includes(filters.status.toLowerCase()),
	)

	return (
		<section className="panel">
			<div className="section-heading">
				<div>
					<h2>Available Devices</h2>
					<span>Inactive devices ready for assignment</span>
				</div>
				<strong>{devices.length}</strong>
			</div>
			{error && <p className="form-error">{error}</p>}
			<div className="column-filters doctor-column-filters three-columns">
				<input placeholder="Filter serial number" value={filters.serial} onChange={(event) => setFilters({ ...filters, serial: event.target.value })} />
				<input placeholder="Filter type" value={filters.type} onChange={(event) => setFilters({ ...filters, type: event.target.value })} />
				<input placeholder="Filter status" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })} />
				<button type="button" onClick={() => setFilters({ serial: '', type: '', status: '' })}>Clear</button>
			</div>
			<div className="data-table device-table">
				<div className="table-row table-head">
					<span>Serial Number</span>
					<span>Type</span>
					<span>Status</span>
					<span>Actions</span>
				</div>
				{isLoading && <div className="empty-state">Loading available devices...</div>}
				{!isLoading && devices.length === 0 && <div className="empty-state">No inactive devices are available.</div>}
				{!isLoading && filteredDevices.length === 0 && <div className="empty-state">No available devices match your filters.</div>}
				{!isLoading && filteredDevices.map((device) => (
					<div className="table-row" key={device.id}>
						<span>{device.serialNumber}</span>
						<span>{device.deviceType}</span>
						<span><span className="device-state inactive">Inactive</span></span>
						<span className="actions"><button type="button" onClick={() => setSelectedDevice(device)}>Assign</button></span>
					</div>
				))}
			</div>

			{selectedDevice && (
				<div className="modal-overlay" onClick={() => setSelectedDevice(null)}>
					<div className="modal-card" onClick={(event) => event.stopPropagation()}>
						<div className="modal-header">
							<h3>Assign Device</h3>
							<button type="button" onClick={() => setSelectedDevice(null)} aria-label="Close assignment form">✕</button>
						</div>
						<div className="modal-form">
							<label>
								Device
								<input value={`${selectedDevice.serialNumber} - ${selectedDevice.deviceType}`} disabled />
							</label>
							<label>
								Patient without device
								<select value={selectedPatientId} onChange={(event) => setSelectedPatientId(event.target.value)}>
									<option value="">Select patient</option>
									{patients.map((patient) => (
										<option key={patient.id} value={patient.id}>
											{`${patient.firstName ?? ''} ${patient.lastName ?? ''}`.trim() || 'Unknown patient'}
										</option>
									))}
								</select>
							</label>
							<div className="modal-actions">
								<button type="button" onClick={() => setSelectedDevice(null)}>Cancel</button>
								<button className="primary-button" type="button" onClick={() => void handleAssign()} disabled={isAssigning || !selectedPatientId}>
									{isAssigning ? 'Assigning...' : 'Assign Device'}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</section>
	)
}
