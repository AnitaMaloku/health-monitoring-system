export type Role = 'ADMIN' | 'DOCTOR'

export type AuthUser = {
  id: string
  email: string
  firstName: string
  lastName: string
  role: Role
}

type AuthResponse = {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3003'
const accessTokenKey = 'health-monitor.access-token'
const refreshTokenKey = 'health-monitor.refresh-token'
const userKey = 'health-monitor.user'

export function getSession(): AuthResponse | null {
  const accessToken = localStorage.getItem(accessTokenKey)
  const refreshToken = localStorage.getItem(refreshTokenKey)
  const user = localStorage.getItem(userKey)
  if (!accessToken || !refreshToken || !user) return null

  try {
    return { accessToken, refreshToken, user: JSON.parse(user) as AuthUser }
  } catch {
    clearSession()
    return null
  }
}

function saveSession(session: AuthResponse) {
  localStorage.setItem(accessTokenKey, session.accessToken)
  localStorage.setItem(refreshTokenKey, session.refreshToken)
  localStorage.setItem(userKey, JSON.stringify(session.user))
}

export function updateSessionUser(user: AuthUser) {
  const session = getSession()
  if (!session) return
  saveSession({ ...session, user })
}

export async function login(email: string, password: string) {
  const response = await fetch(`${apiUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = (await response.json()) as AuthResponse & { message?: string }
  if (!response.ok) throw new Error(data.message ?? 'Unable to sign in')
  saveSession(data)
  return data.user
}

export async function apiFetch(input: string, init: RequestInit = {}) {
  const session = getSession()
  const headers = new Headers(init.headers)
  if (session) headers.set('Authorization', `Bearer ${session.accessToken}`)

  let response = await fetch(`${apiUrl}${input}`, { ...init, headers })
  if (response.status !== 401 || !session) return response

  const refreshResponse = await fetch(`${apiUrl}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: session.refreshToken }),
  })
  if (!refreshResponse.ok) {
    clearSession()
    window.location.hash = '/login'
    return response
  }

  const refreshed = (await refreshResponse.json()) as AuthResponse
  saveSession(refreshed)
  headers.set('Authorization', `Bearer ${refreshed.accessToken}`)
  response = await fetch(`${apiUrl}${input}`, { ...init, headers })
  return response
}

export async function logout() {
  const session = getSession()
  if (session) {
    await fetch(`${apiUrl}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: session.refreshToken }),
    }).catch(() => undefined)
  }
  clearSession()
  window.location.hash = '/login'
}

export function clearSession() {
  localStorage.removeItem(accessTokenKey)
  localStorage.removeItem(refreshTokenKey)
  localStorage.removeItem(userKey)
}
