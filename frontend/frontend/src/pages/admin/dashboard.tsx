import { useEffect, useState } from 'react'
import { apiFetch } from '../../auth'
import { Metric } from '../../components/Metric'

type Patient = { id: string; firstName: string; lastName: string; createdAt: string; doctor?: { user: { firstName: string; lastName: string } } | null }
type Doctor = { id: string; user: { firstName: string; lastName: string }; _count: { patients: number } }
type Device = { id: string; status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'RETIRED'; patientDevices?: Array<{ patient?: { id: string } }> }

async function getError(response: Response) {
    try { return ((await response.json()) as { message?: string }).message ?? 'Unable to load dashboard data.' } catch { return 'Unable to load dashboard data.' }
}

export function Dashboard() {
    const [patients, setPatients] = useState<Patient[]>([])
    const [doctors, setDoctors] = useState<Doctor[]>([])
    const [devices, setDevices] = useState<Device[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        async function loadDashboard() {
            try {
                const responses = await Promise.all([apiFetch('/patients'), apiFetch('/admin/doctors'), apiFetch('/devices')])
                const failedResponse = responses.find((response) => !response.ok)
                if (failedResponse) throw new Error(await getError(failedResponse))
                setPatients((await responses[0].json()) as Patient[])
                setDoctors((await responses[1].json()) as Doctor[])
                setDevices((await responses[2].json()) as Device[])
            } catch (loadError) { setError(loadError instanceof Error ? loadError.message : 'Unable to load dashboard data.') } finally { setLoading(false) }
        }
        void loadDashboard()
    }, [])

    const assignedDevices = devices.filter((device) => device.patientDevices?.some((assignment) => assignment.patient)).length
    const availableDevices = devices.filter((device) => device.status === 'INACTIVE').length
    const attentionDevices = devices.filter((device) => device.status === 'MAINTENANCE' || device.status === 'RETIRED').length

    return <div className="admin-dashboard page-stack">
        <section className="admin-welcome"><div><p className="eyebrow">System overview</p><p>Keep track of the people, care teams, and connected equipment in Health Monitor.</p></div><div className="admin-date">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}</div></section>
        {error && <p className="admin-error">{error}</p>}
        {loading ? <section className="panel empty-state">Loading system overview...</section> : <>
            <section className="metric-grid admin-metrics" aria-label="System totals"><Metric label="Registered patients" value={patients.length} tone="normal" /><Metric label="Active doctors" value={doctors.length} /><Metric label="Total devices" value={devices.length} /><Metric label="Assigned devices" value={assignedDevices} tone="normal" /></section>
            <section className="admin-overview-grid"><article className="panel"><div className="section-heading"><div><h2>Device readiness</h2><span>Current equipment allocation</span></div><a href="#/admin/devices">Manage devices</a></div><div className="status-summary"><div><strong>{assignedDevices}</strong><span>Assigned</span><i className="summary-bar summary-active" /></div><div><strong>{availableDevices}</strong><span>Available</span><i className="summary-bar summary-inactive" /></div><div><strong>{attentionDevices}</strong><span>Attention</span><i className="summary-bar summary-warning" /></div></div></article><article className="panel"><div className="section-heading"><div><h2>Care team</h2><span>Patients per doctor</span></div><a href="#/admin/doctors">Manage doctors</a></div><div className="doctor-summary">{doctors.length === 0 ? <p className="empty-state">No doctors registered yet.</p> : doctors.slice(0, 4).map((doctor) => <div className="doctor-summary-row" key={doctor.id}><span className="avatar">{doctor.user.firstName[0]}{doctor.user.lastName[0]}</span><span><strong>Dr. {doctor.user.firstName} {doctor.user.lastName}</strong><small>{doctor._count.patients} {doctor._count.patients === 1 ? 'patient' : 'patients'}</small></span></div>)}</div></article></section>
            <section className="panel"><div className="section-heading"><div><h2>Recently added patients</h2><span>Latest registrations in the system</span></div><a href="#/admin/patients">View all patients</a></div>{patients.length === 0 ? <p className="empty-state">No patients registered yet.</p> : <div className="recent-patient-list">{patients.slice(0, 5).map((patient) => <div className="recent-patient" key={patient.id}><span className="avatar patient-avatar">{patient.firstName[0]}{patient.lastName[0]}</span><span><strong>{patient.firstName} {patient.lastName}</strong><small>{patient.doctor ? `Dr. ${patient.doctor.user.firstName} ${patient.doctor.user.lastName}` : 'No doctor assigned'}</small></span><time>{new Date(patient.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</time></div>)}</div>}</section>
        </>}
    </div>
}