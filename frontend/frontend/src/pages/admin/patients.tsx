import { useEffect, useState } from 'react'
import { apiFetch } from '../../auth'

type Doctor = { id: string; user: { firstName: string; lastName: string } }
type Patient = { id: string; firstName: string; lastName: string; birthDate?: string | null; gender?: string | null; bloodGroup?: string | null; doctor?: Doctor | null }
type FormState = { firstName: string; lastName: string; birthDate: string; gender: string; bloodGroup: string; doctorId: string }
const emptyForm: FormState = { firstName: '', lastName: '', birthDate: '', gender: '', bloodGroup: '', doctorId: '' }

async function errorMessage(response: Response) { try { return ((await response.json()) as { message?: string }).message ?? 'Request failed.' } catch { return 'Request failed.' } }

export function AdminPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [filters, setFilters] = useState({
    name: '',
    birthDate: '',
    gender: '',
    doctor: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  async function load() {
    try {
      const [patientsResponse, doctorsResponse] = await Promise.all([apiFetch('/patients'), apiFetch('/admin/doctors')])
      if (!patientsResponse.ok || !doctorsResponse.ok) throw new Error('Could not load administration data.')
      setPatients((await patientsResponse.json()) as Patient[])
      setDoctors((await doctorsResponse.json()) as Doctor[])
      setError('')
    } catch (loadError) { setError(loadError instanceof Error ? loadError.message : 'Could not load administration data.') } finally { setLoading(false) }
  }
  useEffect(() => { void load() }, [])

  function openForm(patient?: Patient) {
    setEditingId(patient?.id ?? null)
    setForm(patient ? { firstName: patient.firstName, lastName: patient.lastName, birthDate: patient.birthDate?.slice(0, 10) ?? '', gender: patient.gender ?? '', bloodGroup: patient.bloodGroup ?? '', doctorId: patient.doctor?.id ?? '' } : emptyForm)
    setError(''); setOpen(true)
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError('')
    const body = { ...form, doctorId: form.doctorId || undefined, birthDate: form.birthDate || undefined }
    const response = await apiFetch(editingId ? `/patients/${editingId}` : '/patients', { method: editingId ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (!response.ok) setError(await errorMessage(response)); else { setOpen(false); await load() }
    setSaving(false)
  }
  async function remove(patient: Patient) {
    if (!window.confirm(`Delete ${patient.firstName} ${patient.lastName}?`)) return
    const response = await apiFetch(`/patients/${patient.id}`, { method: 'DELETE' })
    if (!response.ok) setError(await errorMessage(response)); else await load()
  }
  const visible = patients.filter((patient) => {
    const doctorName = patient.doctor
      ? `${patient.doctor.user.firstName} ${patient.doctor.user.lastName}`
      : 'Unassigned'

    return (
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(filters.name.toLowerCase()) &&
      (patient.birthDate?.slice(0, 10) ?? '').includes(filters.birthDate) &&
      (patient.gender ?? '').toLowerCase().includes(filters.gender.toLowerCase()) &&
      doctorName.toLowerCase().includes(filters.doctor.toLowerCase())
    )
  })

  return <section className="panel admin-management"><div className="section-heading"><div><h2>Patients</h2><span>{patients.length} registered patients</span></div><button className="primary-button" onClick={() => openForm()}>Add patient</button></div><div className="column-filters"><input placeholder="Filter name" value={filters.name} onChange={(event) => setFilters({ ...filters, name: event.target.value })} /><input placeholder="Filter birth date" value={filters.birthDate} onChange={(event) => setFilters({ ...filters, birthDate: event.target.value })} /><input placeholder="Filter gender" value={filters.gender} onChange={(event) => setFilters({ ...filters, gender: event.target.value })} /><input placeholder="Filter doctor" value={filters.doctor} onChange={(event) => setFilters({ ...filters, doctor: event.target.value })} /><button type="button" onClick={() => setFilters({ name: '', birthDate: '', gender: '', doctor: '' })}>Clear</button></div>{error && <p className="admin-error">{error}</p>}{loading ? <p className="empty-state">Loading patients...</p> : <div className="data-table admin-table"><div className="table-row table-head"><span>Name</span><span>Birth date</span><span>Gender</span><span>Doctor</span><span>Actions</span></div>{visible.map((patient) => <div className="table-row" key={patient.id}><span>{patient.firstName} {patient.lastName}</span><span>{patient.birthDate?.slice(0, 10) ?? '—'}</span><span>{patient.gender || '—'}</span><span>{patient.doctor ? `Dr. ${patient.doctor.user.firstName} ${patient.doctor.user.lastName}` : 'Unassigned'}</span><span className="row-actions"><button onClick={() => openForm(patient)}>Edit</button><button onClick={() => void remove(patient)}>Delete</button></span></div>)}</div>}{open && <div className="modal-overlay"><div className="modal-card"><div className="modal-header"><h3>{editingId ? 'Edit patient' : 'Add patient'}</h3><button onClick={() => setOpen(false)} aria-label="Close">×</button></div><form className="modal-form" onSubmit={submit}><div className="modal-form-grid"><label>First name<input required value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} /></label><label>Last name<input required value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} /></label><label>Birth date<input type="date" value={form.birthDate} onChange={(event) => setForm({ ...form, birthDate: event.target.value })} /></label><label>Gender<select value={form.gender} onChange={(event) => setForm({ ...form, gender: event.target.value })}><option value="">Select gender</option><option value="MALE">MALE</option><option value="FEMALE">FEMALE</option><option value="Other">Other</option></select></label><label>Blood group<select value={form.bloodGroup} onChange={(event) => setForm({ ...form, bloodGroup: event.target.value })}><option value="">Select blood group</option><option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option><option value="AB+">AB+</option><option value="AB-">AB-</option><option value="O+">O+</option><option value="O-">O-</option></select></label><label>Doctor<select value={form.doctorId} onChange={(event) => setForm({ ...form, doctorId: event.target.value })}><option value="">Unassigned</option>{doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>Dr. {doctor.user.firstName} {doctor.user.lastName}</option>)}</select></label></div>{error && <p className="admin-error">{error}</p>}<button className="primary-button" disabled={saving}>{saving ? 'Saving...' : 'Save patient'}</button></form></div></div>}</section>
}
