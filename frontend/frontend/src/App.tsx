import { useEffect, useMemo, useState } from 'react'
import { io, type Socket } from 'socket.io-client'
import { alerts, basePatients, mergeLatestMeasurement } from './data/health-data'
import { DoctorAlertsPage } from './pages/doctor/alerts'
import { DoctorDashboard } from './pages/doctor/dashboard'
import { DoctorDevicesPage } from './pages/doctor/devices'
import { DoctorPatientDetailsPage } from './pages/doctor/patient-details'
import { DoctorPatientsPage } from './pages/doctor/patients'
import { DoctorPatientsHealthPage } from './pages/doctor/patientsHealth'
import { PatientDashboardPage } from './pages/patients/dashboard'
import type { HealthMeasurement, Route } from './types'
import './App.css'

const socketUrl = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:3010'

const doctorNav: Array<{ label: string; route: Route }> = [
  { label: 'Dashboard', route: '/doctor/dashboard' },
  { label: 'Patients', route: '/doctor/patients' },
  { label: 'Patients Health', route: '/doctor/patientsHealth' },
  { label: 'Devices', route: '/doctor/devices' },
  { label: 'Alerts', route: '/doctor/alerts' },
]

const patientNav: Array<{ label: string; route: Route }> = [
  { label: 'Dashboard', route: '/patient/dashboard' },
]

const validRoutes = new Set<Route>([
  ...doctorNav.map((item) => item.route),
  '/doctor/patient-details',
  ...patientNav.map((item) => item.route),
])

function getCurrentRoute(): Route {
  const hashRoute = window.location.hash.replace('#', '') as Route
  return validRoutes.has(hashRoute) ? hashRoute : '/doctor/dashboard'
}

function App() {
  const [route, setRoute] = useState<Route>(getCurrentRoute)
  const [socketStatus, setSocketStatus] = useState<
    'connecting' | 'connected' | 'offline'
  >('connecting')
  const [measurements, setMeasurements] = useState<HealthMeasurement[]>([])
  const [selectedPatientId, setSelectedPatientId] = useState(1)
  const [detailTab, setDetailTab] = useState<'live' | 'history' | 'alerts'>(
    'live',
  )

  useEffect(() => {
    const onHashChange = () => setRoute(getCurrentRoute())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
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
    () => mergeLatestMeasurement(basePatients, measurements[0]),
    [measurements],
  )
  const selectedPatient =
    patients.find((patient) => patient.id === selectedPatientId) ?? patients[0]
  const currentPatient = patients[0]

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
        <RoleNav title="Patient" items={patientNav} route={route} />
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

        {route === '/doctor/dashboard' && <DoctorDashboard patients={patients} />}
        {route === '/doctor/patients' && <DoctorPatientsPage />}
        {route === '/doctor/patientsHealth' && (
          <DoctorPatientsHealthPage
            patients={patients}
            onOpenPatient={(id) => {
              setSelectedPatientId(id)
              window.location.hash = '/doctor/patient-details'
            }}
          />
        )}
        {route === '/doctor/patient-details' && (
          <DoctorPatientDetailsPage
            patient={selectedPatient}
            tab={detailTab}
            setTab={setDetailTab}
          />
        )}
        {route === '/doctor/devices' && <DoctorDevicesPage />}
        {route === '/doctor/alerts' && <DoctorAlertsPage alerts={alerts} />}
        {route === '/patient/dashboard' && (
          <PatientDashboardPage patient={currentPatient} />
        )}
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
    '/patient/dashboard': 'My Health',
  }

  return titles[route]
}

export default App
