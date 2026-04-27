import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function AdminRegisterPage() {
  const { registerAdmin } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    try {
      registerAdmin(formData)
      setError('')
      setSuccess('Admin registration saved successfully.')
      setTimeout(() => {
        navigate('/admin/login', { replace: true })
      }, 900)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 py-12 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-black/45 p-8 shadow-xl backdrop-blur-sm">
        <p className="text-xs uppercase tracking-[0.25em] text-amber-300">Admin Setup</p>
        <h1 className="mt-3 text-3xl font-semibold">Admin Register</h1>
        <p className="mt-2 text-sm text-neutral-300">Create admin credentials. These same details are required at admin login.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="text"
            placeholder="Admin Name"
            value={formData.name}
            onChange={(event) => {
              setFormData((prev) => ({ ...prev, name: event.target.value }))
              setError('')
              setSuccess('')
            }}
            className="w-full rounded-xl border border-white/20 bg-neutral-900 px-4 py-3 text-sm outline-none ring-amber-300 focus:ring-2"
            required
          />
          <input
            type="email"
            placeholder="Admin Email"
            value={formData.email}
            onChange={(event) => {
              setFormData((prev) => ({ ...prev, email: event.target.value }))
              setError('')
              setSuccess('')
            }}
            className="w-full rounded-xl border border-white/20 bg-neutral-900 px-4 py-3 text-sm outline-none ring-amber-300 focus:ring-2"
            required
          />
          <input
            type="password"
            placeholder="Password"
            minLength={6}
            value={formData.password}
            onChange={(event) => {
              setFormData((prev) => ({ ...prev, password: event.target.value }))
              setError('')
              setSuccess('')
            }}
            className="w-full rounded-xl border border-white/20 bg-neutral-900 px-4 py-3 text-sm outline-none ring-amber-300 focus:ring-2"
            required
          />
          {error ? <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p> : null}
          {success ? <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{success}</p> : null}
          <button
            type="submit"
            className="w-full rounded-xl bg-amber-300 px-5 py-3 text-sm font-semibold text-black transition hover:bg-amber-200"
          >
            Save Admin Credentials
          </button>
        </form>
        <p className="mt-5 text-sm text-neutral-300">
          Already registered?{' '}
          <Link to="/admin/login" className="font-semibold text-amber-300 hover:text-amber-200">
            Go to admin login
          </Link>
        </p>
      </div>
    </main>
  )
}

export default AdminRegisterPage
