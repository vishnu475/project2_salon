import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [formData, setFormData] = useState({ identifier: '', password: '' })
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const from = location.state?.from?.pathname || '/'

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError('')
    setSuccessMessage('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      await login({ identifier: formData.identifier.trim(), password: formData.password.trim() })
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 py-12 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-black/45 p-8 shadow-xl backdrop-blur-sm">
        <p className="text-xs uppercase tracking-[0.25em] text-amber-300">Salon Luxe</p>
        <h1 className="mt-3 text-3xl font-semibold">Login</h1>
        <p className="mt-2 text-sm text-neutral-300">Sign in with your email or username and password.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="text"
            name="identifier"
            placeholder="Email or Username"
            value={formData.identifier}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/20 bg-neutral-900 px-4 py-3 text-sm outline-none ring-amber-300 focus:ring-2"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/20 bg-neutral-900 px-4 py-3 text-sm outline-none ring-amber-300 focus:ring-2"
            minLength={6}
            required
          />

          {error ? <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p> : null}
          {successMessage ? (
            <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-300">
              {successMessage}
            </p>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-xl bg-amber-300 px-5 py-3 text-sm font-semibold text-black transition hover:bg-amber-200"
          >
            Login Now
          </button>
        </form>

        <p className="mt-5 text-sm text-neutral-300">
          New here?{' '}
          <Link to="/register" className="font-semibold text-amber-300 hover:text-amber-200">
            Create an account
          </Link>
        </p>
        <p className="mt-2 text-sm text-neutral-300">
          Forgot your password?{' '}
          <Link to="/forgot-password" className="font-semibold text-amber-300 hover:text-amber-200">
            Recover it here
          </Link>
        </p>
        <div className="mt-4">
          <Link
            to="/forgot-password"
            className="block w-full rounded-xl border border-amber-300/60 bg-amber-300/10 px-5 py-3 text-center text-sm font-semibold text-amber-300 transition hover:bg-amber-300 hover:text-black"
          >
            Reset Password
          </Link>
        </div>
      </div>
    </main>
  )
}

export default LoginPage
