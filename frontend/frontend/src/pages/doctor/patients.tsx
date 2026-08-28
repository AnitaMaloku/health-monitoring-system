import { useEffect, useState } from 'react'
import { apiFetch } from '../../auth'

type BackendPatient = {
  id: string
  firstName: string
  lastName: string
  birthDate?: string | null
  gender?: string | null
  bloodGroup?: string | null
  createdAt: string
}

type PatientRow = {
  id: string
  name: string
  birthDate: string
  dateOfBirth: string
  age: number | string
  gender: string
  bloodGroup: string
  createdAt: string
}

type PatientFormState = {
  firstName: string
  lastName: string
  birthDate: string
  gender: string
  bloodGroup: string
}


const emptyForm: PatientFormState = {
  firstName: '',
  lastName: '',
  birthDate: '',
  gender: 'MALE',
  bloodGroup: 'O+',
}

function calculateAge(birthDate?: string | null): number | string {
  if (!birthDate) return '—'

  const birth = new Date(birthDate)
  if (Number.isNaN(birth.getTime())) return '—'

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

function formatDate(dateString?: string | null): string {
  if (!dateString) return '—'

  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function mapPatient(patient: BackendPatient): PatientRow {
  return {
    id: patient.id,
    name:
      `${patient.firstName ?? ''} ${patient.lastName ?? ''}`.trim() ||
      'Unknown patient',
    birthDate: patient.birthDate ?? '',
    dateOfBirth: formatDate(patient.birthDate),
    age: calculateAge(patient.birthDate),
    gender: patient.gender || '—',
    bloodGroup: patient.bloodGroup || '—',
    createdAt: formatDate(patient.createdAt),
  }
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const errorBody = (await response.json()) as { message?: string }
    return errorBody?.message ?? 'Request failed.'
  } catch {
    return 'Request failed.'
  }
}

export function DoctorPatientsPage() {
  const [patients, setPatients] = useState<PatientRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<PatientFormState>(emptyForm)
  const [filters, setFilters] = useState({
    name: '',
    dateOfBirth: '',
    age: '',
    gender: '',
    bloodGroup: '',
  })

  const loadPatients = async () => {
    try {
      const response = await apiFetch('/patients')

      if (!response.ok) {
        throw new Error('Could not load patients from the database.')
      }

      const data = (await response.json()) as BackendPatient[]
      setPatients(data.map(mapPatient))
      setError('')
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Could not load patients from the database.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPatients()
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

  const handleEdit = (patient: PatientRow) => {
    setIsFormOpen(true)
    setEditingId(patient.id)
    setError('')
    setFormData({
      firstName: patient.name.split(' ')[0] ?? '',
      lastName: patient.name.split(' ').slice(1).join(' ') ?? '',
      birthDate: patient.birthDate || '',
      gender: patient.gender === '—' ? 'MALE' : patient.gender,
      bloodGroup: patient.bloodGroup === '—' ? 'O+' : patient.bloodGroup,
    })
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('First name and last name are required.')
      return
    }

    setIsSaving(true)
    setError('')

    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        birthDate: formData.birthDate || undefined,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
      }

      const response = editingId
        ? await apiFetch(`/patients/${editingId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        : await apiFetch('/patients', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })

      if (!response.ok) {
        throw new Error(await readErrorMessage(response))
      }

      resetForm()
      await loadPatients()
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : 'Could not save patient.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (patientId: string) => {
    const confirmed = window.confirm('Delete this patient?')
    if (!confirmed) return

    try {
      const response = await apiFetch(`/patients/${patientId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(await readErrorMessage(response))
      }

      setPatients((current) => current.filter((patient) => patient.id !== patientId))
      setError('')
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : 'Could not delete patient.',
      )
    }
  }

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(filters.name.toLowerCase()) &&
    patient.dateOfBirth.toLowerCase().includes(filters.dateOfBirth.toLowerCase()) &&
    String(patient.age).toLowerCase().includes(filters.age.toLowerCase()) &&
    patient.gender.toLowerCase().includes(filters.gender.toLowerCase()) &&
    patient.bloodGroup.toLowerCase().includes(filters.bloodGroup.toLowerCase())
  )

  return (
    <section className="panel">
      <div className="section-heading">
        <h2>Patients</h2>
        <button className="primary-button" type="button" onClick={openAddModal}>
          + Add Patient
        </button>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="column-filters doctor-column-filters">
        <input placeholder="Filter name" value={filters.name} onChange={(event) => setFilters({ ...filters, name: event.target.value })} />
        <input placeholder="Filter date of birth" value={filters.dateOfBirth} onChange={(event) => setFilters({ ...filters, dateOfBirth: event.target.value })} />
        <input placeholder="Filter age" value={filters.age} onChange={(event) => setFilters({ ...filters, age: event.target.value })} />
        <input placeholder="Filter gender" value={filters.gender} onChange={(event) => setFilters({ ...filters, gender: event.target.value })} />
        <input placeholder="Filter blood group" value={filters.bloodGroup} onChange={(event) => setFilters({ ...filters, bloodGroup: event.target.value })} />
        <button type="button" onClick={() => setFilters({ name: '', dateOfBirth: '', age: '', gender: '', bloodGroup: '' })}>Clear</button>
      </div>

      {isFormOpen && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? 'Edit Patient' : 'Add Patient'}</h3>
              <button type="button" onClick={resetForm} aria-label="Close patient form">
                ✕
              </button>
            </div>

            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="modal-form-grid">
                <label>
                  First name
                  <input
                    value={formData.firstName}
                    onChange={(event) =>
                      setFormData((current) => ({ ...current, firstName: event.target.value }))
                    }
                    placeholder="John"
                  />
                </label>

                <label>
                  Last name
                  <input
                    value={formData.lastName}
                    onChange={(event) =>
                      setFormData((current) => ({ ...current, lastName: event.target.value }))
                    }
                    placeholder="Doe"
                  />
                </label>

                <label>
                  Birth date
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(event) =>
                      setFormData((current) => ({ ...current, birthDate: event.target.value }))
                    }
                  />
                </label>

                <label>
                  Gender
                  <select
                    value={formData.gender}
                    onChange={(event) =>
                      setFormData((current) => ({ ...current, gender: event.target.value }))
                    }
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </label>

                <label>
                  Blood group
                  <select
                    value={formData.bloodGroup}
                    onChange={(event) =>
                      setFormData((current) => ({ ...current, bloodGroup: event.target.value }))
                    }
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={resetForm}>
                  Cancel
                </button>
                <button className="primary-button" type="submit" disabled={isSaving}>
                  {isSaving ? 'Saving...' : editingId ? 'Update Patient' : 'Save Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="data-table patient-table">
        <div className="table-row table-head">
          <span>Name</span>
          <span>Date of Birth</span>
          <span>Age</span>
          <span>Gender</span>
          <span>Blood Group</span>
          <span>Actions</span>
        </div>

        {isLoading && <div className="empty-state">Loading patients...</div>}
        {!isLoading && patients.length === 0 && (
          <div className="empty-state">No patients found in the database.</div>
        )}
        {!isLoading && patients.length > 0 && filteredPatients.length === 0 && (
          <div className="empty-state">No patients match your search.</div>
        )}

        {!isLoading &&
          filteredPatients.map((patient) => (
            <div className="table-row" key={patient.id}>
              <span>{patient.name}</span>
              <span>{patient.dateOfBirth}</span>
              <span>{patient.age}</span>
              <span>{patient.gender}</span>
              <span>{patient.bloodGroup}</span>
              <span className="actions">
                <button type="button" onClick={() => handleEdit(patient)}>
                  Edit
                </button>
                <button type="button" onClick={() => handleDelete(patient.id)}>
                  Delete
                </button>
              </span>
            </div>
          ))}
      </div>
    </section>
  )
}
