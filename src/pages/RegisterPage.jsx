import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function RegisterPage() {
  const { register, requestOtp } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({ name: '', email: '', phone: '' })
  const [otpData, setOtpData] = useState({ smsOtp: '' })
  const [otpSent, setOtpSent] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    let nextValue = value

    if (name === 'phone') {
      nextValue = value.replace(/\D/g, '').slice(0, 10)
    }

    setFormData((prev) => ({ ...prev, [name]: nextValue }))
    setError('')
    setSuccessMessage('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailPattern.test(formData.email.trim().toLowerCase())) {
      setError('Please enter a valid email address.')
      return
    }
    if (!otpSent) {
      setError('Please send and verify the SMS OTP before registration.')
      return
    }
    try {
      await register({ ...formData, otp: otpData.smsOtp.trim() })
      setError('')
      setSuccessMessage('Successfully registered.')
      setTimeout(() => {
        navigate('/', { replace: true })
      }, 1200)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSendOtp = () => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(formData.email.trim().toLowerCase())) {
      setError('Enter a valid email before OTP verification.')
      return
    }
    if (formData.phone.trim().length !== 10) {
      setError('Enter a valid 10-digit phone number before OTP verification.')
      return
    }

    requestOtp({ phone: formData.phone.trim(), email: formData.email.trim(), purpose: 'register' })
      .then((data) => {
        setOtpSent(true)
        setError('')
        setSuccessMessage(data.devMode ? `Dev OTP: ${data.devOtp}` : 'Verification code sent to your mobile number.')
      })
      .catch((err) => {
        setError(err.message)
      })
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 py-12 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-black/45 p-8 shadow-xl backdrop-blur-sm">
        <p className="text-xs uppercase tracking-[0.25em] text-amber-300">Salon Luxe</p>
        <h1 className="mt-3 text-3xl font-semibold">Register</h1>
        <p className="mt-2 text-sm text-neutral-300">Create your account to access a faster booking experience.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/20 bg-neutral-900 px-4 py-3 text-sm outline-none ring-amber-300 focus:ring-2"
            required
          />
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
            <div className="grid gap-3">
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
            </div>
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
            Create Account After OTP
          </button>
        </form>

        <p className="mt-5 text-sm text-neutral-300">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-amber-300 hover:text-amber-200">
            Login
          </Link>
        </p>
      </div>
    </main>
  )
}

export default RegisterPage
