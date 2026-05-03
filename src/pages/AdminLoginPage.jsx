import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function AdminLoginPage() {
  const { loginAdmin, logoutAdmin, isAdminAuthenticated, adminProfile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  const from = location.state?.from?.pathname || '/admin/dashboard'

  if (isAdminAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      await loginAdmin(formData)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message)
    }
  }

  const handleClearSession = () => {
    logoutAdmin()
    setFormData({ email: '', password: '' })
    setError('Cleared saved admin session. Try signing in again.')
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 py-12 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-black/45 p-8 shadow-xl backdrop-blur-sm">
        <p className="text-xs uppercase tracking-[0.25em] text-amber-300">Admin Access</p>
        <h1 className="mt-3 text-3xl font-semibold">Admin Login</h1>
        <p className="mt-2 text-sm text-neutral-300">Only authorized administrators can access the dashboard.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="email"
            placeholder="Admin Email"
            value={formData.email}
            onChange={(event) => {
              setFormData((prev) => ({ ...prev, email: event.target.value }))
              setError('')
            }}
            className="w-full rounded-xl border border-white/20 bg-neutral-900 px-4 py-3 text-sm outline-none ring-amber-300 focus:ring-2"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(event) => {
              setFormData((prev) => ({ ...prev, password: event.target.value }))
              setError('')
            }}
            className="w-full rounded-xl border border-white/20 bg-neutral-900 px-4 py-3 text-sm outline-none ring-amber-300 focus:ring-2"
            required
          />
          {error ? <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p> : null}
          <button
            type="submit"
            className="w-full rounded-xl bg-amber-300 px-5 py-3 text-sm font-semibold text-black transition hover:bg-amber-200"
          >
            Login as Admin
          </button>
        </form>
        <button
          type="button"
          onClick={handleClearSession}
          className="mt-3 w-full rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-neutral-200 transition hover:border-amber-300 hover:text-amber-300"
        >
          Clear Saved Admin Session
        </button>
        <p className="mt-2 text-xs text-neutral-400">
          If you see invalid credentials, clear the saved admin session and re-enter the exact email/password from admin register.
        </p>
        <p className="mt-5 text-sm text-neutral-300">
          Need to create admin credentials?{' '}
          <Link to="/admin/register" className="font-semibold text-amber-300 hover:text-amber-200">
            Admin register
          </Link>
        </p>
        <p className="mt-2 text-xs text-neutral-400">If login fails, re-register admin once to refresh saved credentials.</p>
      </div>
    </main>
  )
}

export default AdminLoginPage
