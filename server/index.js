import express from 'express'
import cors from 'cors'
import nodemailer from 'nodemailer'
import {
  createBookingWithPayment,
  createUser,
  getAdminSummary,
  getExportPayload,
  getUserByEmail,
  getUserByPhone,
  updateBookingStatus,
  updatePaymentStatus,
  getBookings,
} from './db.js'

const app = express()
const PORT = process.env.PORT || 4000
const OTP_TTL_MS = 10 * 60 * 1000
const otpStore = new Map()

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

function normalizePhone(phone) {
  return String(phone || '').replace(/\D/g, '')
}

function buildSmsRecipient(phone) {
  const trimmed = String(phone || '').trim()
  if (trimmed.startsWith('+')) {
    return trimmed
  }

  const countryCode = process.env.DEFAULT_COUNTRY_CODE || '+91'
  return `${countryCode}${normalizePhone(trimmed)}`
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

function getOtpKey(purpose, phone) {
  return `${purpose}:${normalizePhone(phone)}`
}

function storeOtp(purpose, phone, otp) {
  otpStore.set(getOtpKey(purpose, phone), {
    otp,
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
  })
}

function consumeOtp(purpose, phone, otp) {
  const key = getOtpKey(purpose, phone)
  const record = otpStore.get(key)

  if (!record) {
    return { ok: false, message: 'OTP not found. Please request a new code.' }
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(key)
    return { ok: false, message: 'OTP has expired. Please request a new code.' }
  }

  if (record.otp !== String(otp).trim()) {
    record.attempts += 1
    if (record.attempts >= 5) {
      otpStore.delete(key)
      return { ok: false, message: 'Too many invalid attempts. Please request a new code.' }
    }
    otpStore.set(key, record)
    return { ok: false, message: 'Invalid OTP.' }
  }

  otpStore.delete(key)
  return { ok: true }
}

async function sendSmsOtp(phone, otp) {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_PHONE_NUMBER
  const to = buildSmsRecipient(phone)
  const message = `Your Salon Luxe OTP is ${otp}. It expires in 10 minutes.`

  if (!sid || !token || !from) {
    // eslint-disable-next-line no-console
    console.log(`SMS OTP (dev mode) to ${to}: ${otp}`)
    return { devMode: true, to }
  }

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      To: to,
      From: from,
      Body: message,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to send SMS OTP: ${errorText}`)
  }

  return response.json()
}

app.get('/', (_req, res) => {
  res.json({
    message: 'Salon backend is running.',
    health: '/api/health',
    summary: '/api/admin/summary',
  })
})

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'salon-backend' })
})

app.post('/api/users/register', (req, res) => {
  const { name, email, phone } = req.body
  if (!name || !email || !phone) {
    return res.status(400).json({ message: 'name, email and phone are required.' })
  }

  const normalizedEmail = email.trim().toLowerCase()
  const existing = getUserByEmail(normalizedEmail)
  if (existing) {
    return res.status(409).json({ message: 'User already exists.' })
  }

  const newUser = {
    id: `USR-${Date.now()}`,
    name: name.trim(),
    email: normalizedEmail,
    phone: phone.trim(),
    registeredAt: new Date().toISOString(),
  }

  createUser(newUser)
  return res.status(201).json(newUser)
})

app.post('/api/otp/send', async (req, res) => {
  const { phone, purpose = 'register', email } = req.body
  const normalizedPhone = normalizePhone(phone)

  if (!normalizedPhone) {
    return res.status(400).json({ message: 'Phone number is required.' })
  }

  if (purpose === 'register') {
    if (email && getUserByEmail(String(email).trim().toLowerCase())) {
      return res.status(409).json({ message: 'An account with this email already exists.' })
    }
    if (getUserByPhone(normalizedPhone)) {
      return res.status(409).json({ message: 'An account with this phone number already exists.' })
    }
  }

  if (purpose === 'login' && !getUserByPhone(normalizedPhone)) {
    return res.status(404).json({ message: 'No account found for this phone number.' })
  }

  const otp = generateOtp()
  storeOtp(purpose, normalizedPhone, otp)

  try {
    const smsResult = await sendSmsOtp(normalizedPhone, otp)
    return res.json({
      message: 'OTP sent successfully.',
      devMode: Boolean(smsResult?.devMode),
      ...(smsResult?.devMode ? { devOtp: otp } : {}),
    })
  } catch (error) {
    otpStore.delete(getOtpKey(purpose, normalizedPhone))
    return res.status(500).json({ message: error.message || 'Failed to send OTP.' })
  }
})

app.post('/api/auth/register', async (req, res) => {
  const { name, email, phone, otp } = req.body
  const normalizedEmail = String(email || '').trim().toLowerCase()
  const normalizedPhone = normalizePhone(phone)

  if (!name || !normalizedEmail || !normalizedPhone || !otp) {
    return res.status(400).json({ message: 'name, email, phone and otp are required.' })
  }

  if (getUserByEmail(normalizedEmail)) {
    return res.status(409).json({ message: 'An account with this email already exists.' })
  }

  if (getUserByPhone(normalizedPhone)) {
    return res.status(409).json({ message: 'An account with this phone number already exists.' })
  }

  const otpCheck = consumeOtp('register', normalizedPhone, otp)
  if (!otpCheck.ok) {
    return res.status(400).json({ message: otpCheck.message })
  }

  const newUser = {
    id: `USR-${Date.now()}`,
    name: String(name).trim(),
    email: normalizedEmail,
    phone: normalizedPhone,
    registeredAt: new Date().toISOString(),
  }

  createUser(newUser)
  return res.status(201).json(newUser)
})

app.post('/api/auth/login', (req, res) => {
  const { phone, otp } = req.body
  const normalizedPhone = normalizePhone(phone)

  if (!normalizedPhone || !otp) {
    return res.status(400).json({ message: 'phone and otp are required.' })
  }

  const otpCheck = consumeOtp('login', normalizedPhone, otp)
  if (!otpCheck.ok) {
    return res.status(400).json({ message: otpCheck.message })
  }

  const user = getUserByPhone(normalizedPhone)
  if (!user) {
    return res.status(404).json({ message: 'No account found for this phone number.' })
  }

  return res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
  })
})

app.post('/api/bookings', async (req, res) => {
  const { customerName, phone, service, date, slot, email } = req.body
  if (!customerName || !phone || !service || !date || !slot) {
    return res.status(400).json({ message: 'All booking fields are required.' })
  }

  const booking = {
    id: `BKG-${Date.now()}`,
    customer: customerName.trim(),
    phone: phone.trim(),
    service: service.trim(),
    date: date.trim(),
    slot: slot.trim(),
    specialist: ['Emma', 'Luna', 'Olivia', 'James', 'Sophia'][Math.floor(Math.random() * 5)],
    status: 'Pending',
    createdAt: new Date().toISOString(),
  }

  const payment = {
    id: `PAY-${Date.now() + 1}`,
    customer: booking.customer,
    service: booking.service,
    amount: 50,
    method: 'Pending',
    status: 'Pending',
    date: booking.date,
    createdAt: new Date().toISOString(),
  }

  createBookingWithPayment(booking, payment)

  // send confirmation email if email provided
  if (email) {
    try {
      // create transporter from env or use ethereal for dev
      let transporter
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
          secure: Boolean(process.env.SMTP_SECURE),
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        })
      } else {
        // fallback: create ethereal test account
        // eslint-disable-next-line no-console
        console.log('No SMTP config found, creating Ethereal test account for email preview')
        const testAccount = await nodemailer.createTestAccount()
        transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        })
      }

      const mailBody = `Hello ${booking.customer},\n\nYour booking is confirmed. Details:\n- Service: ${booking.service}\n- Date: ${booking.date}\n- Slot: ${booking.slot}\n- Specialist: ${booking.specialist}\n- Booking ID: ${booking.id}\n\nThank you!`;

      const info = await transporter.sendMail({
        from: process.env.FROM_EMAIL || 'no-reply@salon.local',
        to: email,
        subject: `Booking confirmation: ${booking.service} on ${booking.date}`,
        text: mailBody,
      })

      // log preview url when using ethereal
      if (nodemailer.getTestMessageUrl && nodemailer.getTestMessageUrl(info)) {
        // eslint-disable-next-line no-console
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info))
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to send booking email', err)
    }
  }

  return res.status(201).json({ booking, payment })
})

app.get('/api/admin/summary', (_req, res) => {
  res.json(getAdminSummary())
})

app.get('/api/bookings', (_req, res) => {
  try {
    const bookings = getBookings()
    return res.json({ bookings })
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch bookings.' })
  }
})

app.patch('/api/admin/bookings/:id/status', (req, res) => {
  const { id } = req.params
  const { status } = req.body
  try {
    const updated = updateBookingStatus(id, status)
    if (!updated) {
      return res.status(404).json({ message: 'Booking not found.' })
    }
    return res.json({ message: 'Booking status updated.' })
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
})

app.patch('/api/admin/payments/:id/status', (req, res) => {
  const { id } = req.params
  const { status } = req.body
  try {
    const updated = updatePaymentStatus(id, status)
    if (!updated) {
      return res.status(404).json({ message: 'Payment not found.' })
    }
    return res.json({ message: 'Payment status updated.' })
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
})

app.get('/api/admin/export', (_req, res) => {
  const payload = getExportPayload()
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Content-Disposition', `attachment; filename="salon-backup-${Date.now()}.json"`)
  res.status(200).send(JSON.stringify(payload, null, 2))
})

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Salon backend running on http://localhost:${PORT}`)
})
