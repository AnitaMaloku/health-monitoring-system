import { useEffect, useMemo, useState } from 'react'
import { io, type Socket } from 'socket.io-client'
import { mergeLatestMeasurement } from './data/health-data'
import { DoctorDashboard } from './pages/doctor/dashboard'
import { DoctorDevicesPage } from './pages/doctor/devices'
import { DoctorPatientDetailsPage } from './pages/doctor/patient-details'
import { DoctorPatientsPage } from './pages/doctor/patients'
import { DoctorPatientsHealthPage } from './pages/doctor/patientsHealth'
import type { HealthMeasurement, Patient, Route } from './types'
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
  const fullName =
    `${patient.firstName ?? ''} ${patient.lastName ?? ''}`.trim()

  const device =
    patient.patientDevices?.find(
      (assignment) => assignment.device?.serialNumber,
    )?.device?.serialNumber ?? 'No device'

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

const doctorNav: Array<{ label: string; route: Route }> = [
  { label: 'Dashboard', route: '/doctor/dashboard' },
  { label: 'Patients Health', route: '/doctor/patientsHealth' },
  { label: 'Patients', route: '/doctor/patients' },
  { label: 'Devices', route: '/doctor/devices' },
]

const validRoutes = new Set<Route>([
  ...doctorNav.map((item) => item.route),
  '/doctor/patient-details',
])

function getCurrentRoute(): Route {
  const hashRoute = window.location.hash
    .replace('#', '')
    .split('?')[0] as Route

  return validRoutes.has(hashRoute)
    ? hashRoute
    : '/doctor/dashboard'
}

function getPatientIdFromHash(): string | null {
  const hash = window.location.hash.replace('#', '')
  const queryString = hash.split('?')[1]

  if (!queryString) return null

  const params = new URLSearchParams(queryString)
  const patientId = params.get('patientId')

  return patientId && patientId.trim().length > 0
    ? patientId
    : null
}

function App() {
  const [route, setRoute] = useState<Route>(getCurrentRoute)

  const [socketStatus, setSocketStatus] = useState<
    'connecting' | 'connected' | 'offline'
  >('connecting')

  const [measurements, setMeasurements] = useState<
    HealthMeasurement[]
  >([])

  const [dbPatients, setDbPatients] = useState<Patient[]>([])

  const [selectedPatientId, setSelectedPatientId] = useState<
    string | number | null
  >(null)

  const [detailTab, setDetailTab] = useState<'live' | 'history'>(
    'live',
  )

  // ---------------------------------------------------------
  // Handle route changes
  // ---------------------------------------------------------

  useEffect(() => {
    const onHashChange = () => {
      setRoute(getCurrentRoute())
    }

    window.addEventListener('hashchange', onHashChange)

    return () => {
      window.removeEventListener('hashchange', onHashChange)
    }
  }, [])

  // ---------------------------------------------------------
  // Load patients from backend
  // ---------------------------------------------------------

  useEffect(() => {
    let isMounted = true

    const loadPatients = async () => {
      try {
        const response = await fetch(`${apiUrl}/patients`)

        if (!response.ok) {
          throw new Error(
            'Could not load patients from the database.',
          )
        }

        const data = (await response.json()) as BackendPatient[]

        if (!isMounted) return

        const mapped = data.map(mapPatientFromDb)

        setDbPatients(mapped)

        setSelectedPatientId((current) => {
          const hashPatientId = getPatientIdFromHash()

          return (
            current ??
            hashPatientId ??
            mapped[0]?.id ??
            null
          )
        })
      } catch (error) {
        console.error('Failed to load patients:', error)

        if (isMounted) {
          setDbPatients([])
        }
      }
    }

    loadPatients()

    return () => {
      isMounted = false
    }
  }, [])

  // ---------------------------------------------------------
  // Connect to Socket.IO
  // ---------------------------------------------------------

  useEffect(() => {
    const socket: Socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
    })

    socket.on('connect', () => {
      console.log('Socket.IO connected')

      setSocketStatus('connected')
    })

    socket.on('disconnect', () => {
      console.log('Socket.IO disconnected')

      setSocketStatus('offline')
    })

    socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error)

      setSocketStatus('offline')
    })

    socket.on(
      'healthMeasurement',
      (measurement: HealthMeasurement) => {
        console.log(
          '[frontend] received measurement:',
          measurement,
        )

        setMeasurements((current) => {
          return [measurement, ...current].slice(0, 100)
        })
      },
    )

    return () => {
      socket.disconnect()
    }
  }, [])

  // ---------------------------------------------------------
  // Create latest measurement for EACH device
  // ---------------------------------------------------------

  const patients = useMemo(() => {
    /*
     * Map:
     *
     * SIM-1001 -> latest measurement
     * SIM-1002 -> latest measurement
     * SIM-1003 -> latest measurement
     * SIM-1004 -> latest measurement
     */

    const latestByDevice = new Map<
      string,
      HealthMeasurement
    >()

    /*
     * measurements is ordered newest -> oldest.
     *
     * Therefore, the first measurement we find for a device
     * is its latest measurement.
     */

    for (const measurement of measurements) {
      if (!measurement.serialNumber) {
        continue
      }

      if (!latestByDevice.has(measurement.serialNumber)) {
        latestByDevice.set(
          measurement.serialNumber,
          measurement,
        )
      }
    }

    /*
     * Now update every patient independently.
     */

    return dbPatients
      .map((patient) => {
        const latestMeasurement =
          latestByDevice.get(patient.device)

        /*
         * This patient hasn't received a measurement yet.
         */
        if (!latestMeasurement) {
          return patient
        }

        /*
         * Only this patient receives the measurement belonging
         * to their device.
         */
        const updatedPatient = mergeLatestMeasurement(
          [patient],
          latestMeasurement,
        )[0]

        return updatedPatient
      })
      .filter(
        (patient) =>
          patient.device &&
          patient.device !== 'No device',
      )
  }, [dbPatients, measurements])

  // ---------------------------------------------------------
  // Selected patient
  // ---------------------------------------------------------

  const selectedPatient =
    patients.find(
      (patient) => patient.id === selectedPatientId,
    ) ?? patients[0]

  // ---------------------------------------------------------
  // Patient details route
  // ---------------------------------------------------------

  useEffect(() => {
    if (
      route !== '/doctor/patient-details' ||
      !selectedPatient
    ) {
      return
    }

    const hashPatientId = getPatientIdFromHash()
    const selectedId = String(selectedPatient.id)

    if (hashPatientId === selectedId) {
      return
    }

    window.location.hash =
      `/doctor/patient-details?patientId=${encodeURIComponent(
        selectedId,
      )}`
  }, [route, selectedPatient])

  // ---------------------------------------------------------
  // Render
  // ---------------------------------------------------------

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a
          className="brand"
          href="#/doctor/dashboard"
        >
          <span className="brand-mark">HM</span>

          <span>
            Health Monitor
          </span>
        </a>

        <RoleNav
          title="Doctor"
          items={doctorNav}
          route={route}
        />
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">
              {route.startsWith('/doctor')
                ? 'Doctor portal'
                : 'Patient portal'}
            </p>

            <h1>
              {pageTitle(route)}
            </h1>
          </div>

          <span
            className={`connection connection-${socketStatus}`}
          >
            {socketStatus}
          </span>
        </header>

        {route === '/doctor/dashboard' && (
          <DoctorDashboard
            patients={patients}
          />
        )}

        {route === '/doctor/patients' && (
          <DoctorPatientsPage />
        )}

        {route === '/doctor/patientsHealth' && (
          <DoctorPatientsHealthPage
            patients={patients}
            onOpenPatient={(id) => {
              setSelectedPatientId(id)

              window.location.hash =
                `/doctor/patient-details?patientId=${encodeURIComponent(
                  String(id),
                )}`
            }}
          />
        )}

        {route === '/doctor/patient-details' &&
          selectedPatient && (
            <DoctorPatientDetailsPage
              patient={selectedPatient}
              tab={detailTab}
              setTab={setDetailTab}
            />
          )}

        {route === '/doctor/devices' && (
          <DoctorDevicesPage />
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
  items: Array<{
    label: string
    route: Route
  }>
  route: Route
}) {
  return (
    <nav
      className="nav-group"
      aria-label={`${title} navigation`}
    >
      <p>{title}</p>

      {items.map((item) => (
        <a
          className={
            route === item.route
              ? 'active'
              : ''
          }
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
    '/doctor/dashboard':
      'Doctor Dashboard',

    '/doctor/patients':
      'Patients',

    '/doctor/patientsHealth':
      'Patients Health',

    '/doctor/patient-details':
      'Patient Details',

    '/doctor/devices':
      'Devices',
  }

  return titles[route]
}

export default App