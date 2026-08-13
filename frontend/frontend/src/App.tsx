import { useEffect, useMemo, useState } from 'react'
import { io, type Socket } from 'socket.io-client'
import { mergeLatestMeasurement } from './data/health-data'
import { DoctorAlertsPage } from './pages/doctor/alerts'
import { DoctorDashboard } from './pages/doctor/dashboard'
import { DoctorDevicesPage } from './pages/doctor/devices'
import { DoctorPatientDetailsPage } from './pages/doctor/patient-details'
import { DoctorPatientsPage } from './pages/doctor/patients'
import { DoctorPatientsHealthPage } from './pages/doctor/patientsHealth'
import type { Alert, HealthMeasurement, Patient, Route } from './types'
import './App.css'

const socketUrl = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:3003'
const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3003'

type BackendPatient = {
  id: string
  firstName?: string | null
  lastName?: string | null
  birthDate?: string | null
  patientDevices?: Array<{
    device?: {
      serialNumber?: string | null
    } | null
  }> | null
}

type BackendAlert = {
  id: string
  patientId: string
  level: 'WARNING' | 'CRITICAL'
  metric?: string | null
  value?: number | string | null
  message?: string | null
  createdAt?: string | null
  patient?: {
    firstName?: string | null
    lastName?: string | null
  } | null
}

function calculateAge(birthDate?: string | null): number {
  if (!birthDate) return 0

  const birth = new Date(birthDate)
  if (Number.isNaN(birth.getTime())) return 0

  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDifference = today.getMonth() - birth.getMonth()

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birth.getDate())
  ) {
    age -= 1
  }

  return age
}

function mapPatientFromDb(patient: BackendPatient): Patient {
  const fullName = `${patient.firstName ?? ''} ${patient.lastName ?? ''}`.trim()
  const device =
    patient.patientDevices?.find((assignment) => assignment.device?.serialNumber)
      ?.device?.serialNumber ?? 'No device'

  return {
    id: patient.id,
    name: fullName || 'Unknown patient',
    age: calculateAge(patient.birthDate),
    device,
    status: 'normal',
    hasLiveData: false,
    vitals: {
      serialNumber: device,
      heartRate: 0,
      spo2: 0,
      temp: 0.0,
      systolicPressure: 0,
      diastolicPressure: 0,
      respiratoryRate: 0,
    },
  }
}

function mapAlertFromDb(alert: BackendAlert): Alert {
  const patientName =
    alert.patient && (alert.patient.firstName || alert.patient.lastName)
      ? `${alert.patient.firstName ?? ''} ${alert.patient.lastName ?? ''}`.trim()
      : 'Unknown patient'

  const metricLabel = alert.metric ? alert.metric.replace(/([A-Z])/g, ' $1') : 'Vital'

  return {
    id: alert.id,
    patientId: alert.patientId,
    level: alert.level.toLowerCase() as Alert['level'],
    title: alert.message || `${metricLabel} alert`,
    patient: patientName,
    value: alert.value !== null && alert.value !== undefined ? String(alert.value) : 'N/A',
    time: alert.createdAt ? new Date(alert.createdAt).toLocaleString() : 'Just now',
    createdAt: alert.createdAt ?? undefined,
    message: alert.message ?? undefined,
    metric: alert.metric ?? undefined,
  }
}

const doctorNav: Array<{ label: string; route: Route }> = [
  { label: 'Dashboard', route: '/doctor/dashboard' },
  { label: 'Patients Health', route: '/doctor/patientsHealth' },
    { label: 'Patients', route: '/doctor/patients' },

  { label: 'Devices', route: '/doctor/devices' },
  { label: 'Alerts', route: '/doctor/alerts' },
]



const validRoutes = new Set<Route>([
  ...doctorNav.map((item) => item.route),
  '/doctor/patient-details',
])

function getCurrentRoute(): Route {
  const hashRoute = window.location.hash
    .replace('#', '')
    .split('?')[0] as Route
  return validRoutes.has(hashRoute) ? hashRoute : '/doctor/dashboard'
}

function getPatientIdFromHash(): string | null {
  const hash = window.location.hash.replace('#', '')
  const queryString = hash.split('?')[1]
  if (!queryString) return null

  const params = new URLSearchParams(queryString)
  const patientId = params.get('patientId')
  return patientId && patientId.trim().length > 0 ? patientId : null
}

function App() {
  const [route, setRoute] = useState<Route>(getCurrentRoute)
  const [socketStatus, setSocketStatus] = useState<
    'connecting' | 'connected' | 'offline'
  >('connecting')
  const [measurements, setMeasurements] = useState<HealthMeasurement[]>([])
  const [dbPatients, setDbPatients] = useState<Patient[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [selectedPatientId, setSelectedPatientId] = useState<string | number | null>(null)
  const [detailTab, setDetailTab] = useState<'live' | 'history' | 'alerts'>(
    'live',
  )

  useEffect(() => {
    const onHashChange = () => setRoute(getCurrentRoute())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadPatients = async () => {
      try {
        const response = await fetch(`${apiUrl}/patients`)
        if (!response.ok) {
          throw new Error('Could not load patients from the database.')
        }

        const data = (await response.json()) as BackendPatient[]
        if (!isMounted) return

        const mapped = data.map(mapPatientFromDb)
        setDbPatients(mapped)
        setSelectedPatientId((current) => {
          const hashPatientId = getPatientIdFromHash()
          return current ?? hashPatientId ?? mapped[0]?.id ?? null
        })
      } catch {
        if (isMounted) setDbPatients([])
      }
    }

    const loadAlerts = async () => {
      try {
        const response = await fetch(`${apiUrl}/alerts`)
        if (!response.ok) {
          throw new Error('Could not load alerts from the database.')
        }

        const data = (await response.json()) as BackendAlert[]
        if (!isMounted) return

        setAlerts(data.map(mapAlertFromDb))
      } catch {
        if (isMounted) setAlerts([])
      }
    }

    loadPatients()
    loadAlerts()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    const socket: Socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
    })

    socket.on('connect', () => setSocketStatus('connected'))
    socket.on('disconnect', () => setSocketStatus('offline'))
    socket.on('connect_error', () => setSocketStatus('offline'))
    socket.on('healthMeasurement', (measurement: HealthMeasurement) => {
      setMeasurements((current) => [measurement, ...current].slice(0, 16))
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  const patients = useMemo(
    () =>
      mergeLatestMeasurement(dbPatients, measurements[0]).filter(
        (patient) => patient.device && patient.device !== 'No device',
      ),
    [dbPatients, measurements],
  )
  const selectedPatient =
    patients.find((patient) => patient.id === selectedPatientId) ?? patients[0]

  useEffect(() => {
    if (route !== '/doctor/patient-details' || !selectedPatient) return

    const hashPatientId = getPatientIdFromHash()
    const selectedId = String(selectedPatient.id)

    if (hashPatientId === selectedId) return

    window.location.hash = `/doctor/patient-details?patientId=${encodeURIComponent(selectedId)}`
  }, [route, selectedPatient])

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#/doctor/dashboard">
          <span className="brand-mark">HM</span>
          <span>
            Health Monitor
          </span>
        </a>

        <RoleNav title="Doctor" items={doctorNav} route={route} />
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">
              {route.startsWith('/doctor') ? 'Doctor portal' : 'Patient portal'}
            </p>
            <h1>{pageTitle(route)}</h1>
          </div>
          <span className={`connection connection-${socketStatus}`}>
            {socketStatus}
          </span>
        </header>

        {route === '/doctor/dashboard' && (
          <DoctorDashboard patients={patients} alerts={alerts} />
        )}
        {route === '/doctor/patients' && <DoctorPatientsPage />}
        {route === '/doctor/patientsHealth' && (
          <DoctorPatientsHealthPage
            patients={patients}
            onOpenPatient={(id) => {
              setSelectedPatientId(id)
              window.location.hash = `/doctor/patient-details?patientId=${encodeURIComponent(String(id))}`
            }}
          />
        )}
        {route === '/doctor/patient-details' && selectedPatient && (
          <DoctorPatientDetailsPage
            patient={selectedPatient}
            tab={detailTab}
            setTab={setDetailTab}
            alerts={alerts.filter(
              (alert) => alert.patient === selectedPatient.name,
            )}
          />
        )}
        {route === '/doctor/devices' && <DoctorDevicesPage />}
        {route === '/doctor/alerts' && <DoctorAlertsPage alerts={alerts} />}
      </main>
    </div>
  )
}

function RoleNav({
  title,
  items,
  route,
}: {
  title: string
  items: Array<{ label: string; route: Route }>
  route: Route
}) {
  return (
    <nav className="nav-group" aria-label={`${title} navigation`}>
      <p>{title}</p>
      {items.map((item) => (
        <a
          className={route === item.route ? 'active' : ''}
          href={`#${item.route}`}
          key={item.route}
        >
          {item.label}
        </a>
      ))}
    </nav>
  )
}

function pageTitle(route: Route) {
  const titles: Record<Route, string> = {
    '/doctor/dashboard': 'Doctor Dashboard',
    '/doctor/patients': 'Patients',
    '/doctor/patientsHealth': 'Patients Health',
    '/doctor/patient-details': 'Patient Details',
    '/doctor/devices': 'Devices',
    '/doctor/alerts': 'Alerts',
  }

  return titles[route]
}

export default App
