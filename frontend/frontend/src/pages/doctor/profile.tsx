import { useState } from 'react'
import { apiFetch, type AuthUser, updateSessionUser } from '../../auth'

function getInitials(user: AuthUser): string {
  return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
}

export function DoctorProfilePage({ user, onUserUpdated }: { user: AuthUser; onUserUpdated: (user: AuthUser) => void }) {
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
  })
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fullName = `${formData.firstName} ${formData.lastName}`.trim()

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await apiFetch('/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: formData.firstName, lastName: formData.lastName }),
      })
      const responseBody = (await response.json()) as AuthUser & { message?: string }
      if (!response.ok) throw new Error(responseBody.message ?? 'Could not update your profile.')
      const updatedUser = responseBody as AuthUser

      updateSessionUser(updatedUser)
      onUserUpdated(updatedUser)
      setIsEditing(false)
      setSuccess('Profile updated successfully.')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not update your profile.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({ firstName: user.firstName, lastName: user.lastName })
    setIsEditing(false)
    setError('')
  }

  return (
    <div className="page-stack">
      <section className="profile-hero">
        <div className="profile-avatar" aria-hidden="true">
          {getInitials({ ...user, firstName: formData.firstName, lastName: formData.lastName })}
        </div>
        <div>
          <p className="eyebrow">Your account</p>
          <h2>{fullName || 'Doctor'}</h2>
          <p>Doctor account</p>
        </div>
        <span className="status-pill normal">Active</span>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>Profile information</h2>
            <span>Your account details used across Health Monitor</span>
          </div>
          {!isEditing && <button type="button" onClick={() => { setSuccess(''); setError(''); setIsEditing(true) }}>Edit profile</button>}
        </div>
        {error && <p className="form-error">{error}</p>}
        {success && <p className="form-success">{success}</p>}
        {isEditing ? <form className="profile-form" onSubmit={handleSave}>
          <label>First name<input value={formData.firstName} onChange={(event) => setFormData({ ...formData, firstName: event.target.value })} required /></label>
          <label>Last name<input value={formData.lastName} onChange={(event) => setFormData({ ...formData, lastName: event.target.value })} required /></label>
          <div className="profile-form-actions"><button type="button" onClick={handleCancel}>Cancel</button><button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save changes'}</button></div>
        </form> : <dl className="profile-details">
          <div>
            <dt>First name</dt>
            <dd>{formData.firstName || '—'}</dd>
          </div>
          <div>
            <dt>Last name</dt>
            <dd>{formData.lastName || '—'}</dd>
          </div>
          <div>
            <dt>Email address</dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt>Role</dt>
            <dd>{user.role}</dd>
          </div>
          <div>
            <dt>Account ID</dt>
            <dd className="profile-id">{user.id}</dd>
          </div>
        </dl>}
      </section>
    </div>
  )
}