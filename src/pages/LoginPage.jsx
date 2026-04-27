import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [formData, setFormData] = useState({ phone: '' })
  const [otpData, setOtpData] = useState({ smsOtp: '' })
  const [otpSent, setOtpSent] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const from = location.state?.from?.pathname || '/'

  const handleChange = (event) => {
    const { name, value } = event.target
    const nextValue = name === 'phone' ? value.replace(/\D/g, '').slice(0, 10) : value
    setFormData((prev) => ({ ...prev, [name]: nextValue }))
    setError('')
    setSuccessMessage('')
  }

  const handleSendOtp = async () => {
    if (formData.phone.trim().length !== 10) {
      setError('Enter a valid 10-digit phone number first.')
      return
    }

    try {
      const response = await fetch('http://localhost:4000/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone.trim(), purpose: 'login' }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP.')
      }

      setOtpSent(true)
      setSuccessMessage(data.devMode ? `Dev OTP: ${data.devOtp}` : 'Verification code sent to your mobile number.')
      setError('')
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      if (!otpSent) {
        throw new Error('Please send and verify the SMS OTP before logging in.')
      }

      await login({ phone: formData.phone.trim(), otp: otpData.smsOtp.trim() })
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
        <p className="mt-2 text-sm text-neutral-300">Sign in to continue with your bookings and profile.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/20 bg-neutral-900 px-4 py-3 text-sm outline-none ring-amber-300 focus:ring-2"
            pattern="[0-9]{10}"
            required
          />

          <button
            type="button"
            onClick={handleSendOtp}
            className="w-full rounded-xl border border-amber-300/60 bg-amber-300/10 px-5 py-3 text-sm font-semibold text-amber-300 transition hover:bg-amber-300 hover:text-black"
          >
            Send SMS OTP
          </button>

          {otpSent ? (
            <input
              type="text"
              placeholder="SMS OTP"
              value={otpData.smsOtp}
              onChange={(event) => {
                setOtpData((prev) => ({ ...prev, smsOtp: event.target.value.replace(/\D/g, '').slice(0, 6) }))
                setError('')
              }}
              className="w-full rounded-xl border border-white/20 bg-neutral-900 px-4 py-3 text-sm outline-none ring-amber-300 focus:ring-2"
              maxLength={6}
              required
            />
          ) : null}

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
            Login With OTP
          </button>
        </form>

        <p className="mt-5 text-sm text-neutral-300">
          New here?{' '}
          <Link to="/register" className="font-semibold text-amber-300 hover:text-amber-200">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  )
}

export default LoginPage
