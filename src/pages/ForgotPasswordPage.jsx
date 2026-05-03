import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ForgotPasswordPage() {
  const { requestPasswordReset, resetPassword } = useAuth()
  const [formData, setFormData] = useState({ email: '', otp: '', password: '', confirmPassword: '' })
  const [step, setStep] = useState('request')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    const nextValue = name === 'otp' ? value.replace(/\D/g, '').slice(0, 6) : value
    setFormData((prev) => ({ ...prev, [name]: nextValue }))
    setError('')
    setSuccess('')
  }

  const handleSendRecovery = async (event) => {
    event.preventDefault()

    try {
      const data = await requestPasswordReset({ email: formData.email.trim() })
      setStep('reset')
      setSuccess(data.message || 'Recovery code sent to your email.')
    } catch (err) {
      setError(err.message)
    }
  }

  const handleResetPassword = async (event) => {
    event.preventDefault()

    if (formData.password.trim() !== formData.confirmPassword.trim()) {
      setError('Passwords do not match.')
      return
    }

    try {
      await resetPassword({
        email: formData.email.trim(),
        otp: formData.otp.trim(),
        password: formData.password.trim(),
      })
      setSuccess('Password reset successfully. You can now login.')
      setError('')
      setStep('done')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 py-12 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-black/45 p-8 shadow-xl backdrop-blur-sm">
        <p className="text-xs uppercase tracking-[0.25em] text-amber-300">Salon Luxe</p>
        <h1 className="mt-3 text-3xl font-semibold">Forgot Password</h1>
        <p className="mt-2 text-sm text-neutral-300">Request a recovery code and reset your password.</p>

        {step === 'request' ? (
          <form onSubmit={handleSendRecovery} className="mt-6 space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Enter your account email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/20 bg-neutral-900 px-4 py-3 text-sm outline-none ring-amber-300 focus:ring-2"
              required
            />

            {error ? <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p> : null}

            <button
              type="submit"
              className="w-full rounded-xl bg-amber-300 px-5 py-3 text-sm font-semibold text-black transition hover:bg-amber-200"
            >
              Send Recovery Code
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/20 bg-neutral-900 px-4 py-3 text-sm outline-none ring-amber-300 focus:ring-2"
              required
            />
            <input
              type="text"
              name="otp"
              placeholder="6-digit recovery code"
              value={formData.otp}
              onChange={handleChange}
              maxLength={6}
              className="w-full rounded-xl border border-white/20 bg-neutral-900 px-4 py-3 text-sm outline-none ring-amber-300 focus:ring-2"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="New password"
              value={formData.password}
              onChange={handleChange}
              minLength={6}
              className="w-full rounded-xl border border-white/20 bg-neutral-900 px-4 py-3 text-sm outline-none ring-amber-300 focus:ring-2"
              required
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm new password"
              value={formData.confirmPassword}
              onChange={handleChange}
              minLength={6}
              className="w-full rounded-xl border border-white/20 bg-neutral-900 px-4 py-3 text-sm outline-none ring-amber-300 focus:ring-2"
              required
            />

            {error ? <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p> : null}
            {success ? <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{success}</p> : null}

            <button
              type="submit"
              className="w-full rounded-xl bg-amber-300 px-5 py-3 text-sm font-semibold text-black transition hover:bg-amber-200"
            >
              Reset Password
            </button>
          </form>
        )}

        <p className="mt-5 text-sm text-neutral-300">
          Back to{' '}
          <Link to="/login" className="font-semibold text-amber-300 hover:text-amber-200">
            login
          </Link>
        </p>
      </div>
    </main>
  )
}

export default ForgotPasswordPage