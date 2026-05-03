import express from 'express'
import cors from 'cors'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import {
  createBookingWithPayment,
  createUser,
  hashPassword,
  getAdminSummary,
  getExportPayload,
  getUserByEmail,
  getUserByPhone,
  verifyUserLogin,
  getPasswordResetByEmail,
  upsertPasswordReset,
  updatePasswordResetAttempts,
  deletePasswordReset,
  updateUserPassword,
  updateBookingStatus,
  updatePaymentStatus,
  getBookings,
  getAdminByEmail,
  createAdmin,
  verifyAdmin,
  deleteBooking,
  deletePayment,
  deleteUser,
  getAllServices,
  seedServices,
  createService,
  updateService,
  deleteService,
  getAllSpecialists,
  seedSpecialists,
  addUserPoints,
  createReview,
  getAllReviews,
  createGiftCard,
  verifyGiftCard,
} from './db.js'

const app = express()
const PORT = process.env.PORT || 4000
const OTP_TTL_MS = 10 * 60 * 1000
const OTP_RESEND_COOLDOWN_MS = 30 * 1000
const OTP_DAILY_LIMIT = 10
const otpStore = new Map()
const otpDailyCounter = new Map()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load root .env first, then let server/.env override it when present.
dotenv.config({ path: path.resolve(__dirname, '..', '.env') })
dotenv.config({ path: path.resolve(__dirname, '.env'), override: true })

app.use(cors())
app.use(express.json())

function normalizePhone(phone) {
  return String(phone || '').replace(/\D/g, '')
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

function hashOtp(otp) {
  return crypto.createHash('sha256').update(String(otp || '').trim()).digest('hex')
}

function isTruthyEnv(value) {
  const normalized = String(value || '').trim().toLowerCase()
  return normalized === 'true' || normalized === '1' || normalized === 'yes'
}

function isPlaceholder(value) {
  const v = String(value || '').trim().toLowerCase()
  if (!v) return true
  if (v.includes('example.com')) return true
  if (v.includes('your_email')) return true
  if (v.includes('your_email_password') || v.includes('password_or_app_password')) return true
  if (v === 'smtp.example.com') return true
  return false
}

function hasSmtpConfig() {
  const missing = getMissingSmtpKeys()
  return missing.length === 0
}

function getSmtpConfigError() {
  const missingKeys = getMissingSmtpKeys()
  if (missingKeys.length === 0) {
    return null
  }
  return `SMTP is not configured. Missing: ${missingKeys.join(', ')}. Set these in your .env file.`
}

function getMissingSmtpKeys() {
  const requiredKeys = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'FROM_EMAIL']
  return requiredKeys.filter((key) => {
    const val = String(process.env[key] || '').trim()
    return !val || isPlaceholder(val)
  })
}

function createSmtpTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
    secure: isTruthyEnv(process.env.SMTP_SECURE),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      // Do not fail on invalid certs
      rejectUnauthorized: false,
    },
  })
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

function getOtpKey(purpose, target) {
  return `${purpose}:${String(target || '').trim().toLowerCase()}`
}

function getDailyCounterKey(purpose, target) {
  const dayKey = new Date().toISOString().slice(0, 10)
  return `${getOtpKey(purpose, target)}:${dayKey}`
}

function canSendOtp(purpose, target) {
  const otpKey = getOtpKey(purpose, target)
  const dailyKey = getDailyCounterKey(purpose, target)
  const existingOtp = otpStore.get(otpKey)
  const now = Date.now()

  if (existingOtp && now < existingOtp.expiresAt && now - existingOtp.sentAt < OTP_RESEND_COOLDOWN_MS) {
    const waitSeconds = Math.ceil((OTP_RESEND_COOLDOWN_MS - (now - existingOtp.sentAt)) / 1000)
    return {
      ok: false,
      status: 429,
      message: `Please wait ${waitSeconds} seconds before requesting another OTP.`,
    }
  }

  const sentToday = Number(otpDailyCounter.get(dailyKey) || 0)
  if (sentToday >= OTP_DAILY_LIMIT) {
    return {
      ok: false,
      status: 429,
      message: 'Daily OTP limit reached for this email. Please try again tomorrow.',
    }
  }

  return { ok: true }
}

function storeOtp(purpose, target, otp) {
  const otpKey = getOtpKey(purpose, target)
  const dailyKey = getDailyCounterKey(purpose, target)
  otpStore.set(otpKey, {
    otpHash: hashOtp(otp),
    sentAt: Date.now(),
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
  })
  otpDailyCounter.set(dailyKey, Number(otpDailyCounter.get(dailyKey) || 0) + 1)
  // Debug: always log stored OTP to aid tracing during local testing
  // eslint-disable-next-line no-console
  console.log(`storeOtp: purpose=${purpose}, target=${target}, otp=${otp}`)
}

function clearStoredOtp(purpose, target, rollbackDaily = false) {
  const otpKey = getOtpKey(purpose, target)
  otpStore.delete(otpKey)

  if (rollbackDaily) {
    const dailyKey = getDailyCounterKey(purpose, target)
    const currentCount = Number(otpDailyCounter.get(dailyKey) || 0)
    if (currentCount <= 1) {
      otpDailyCounter.delete(dailyKey)
    } else {
      otpDailyCounter.set(dailyKey, currentCount - 1)
    }
  }
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

  if (record.otpHash !== hashOtp(otp)) {
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

async function sendEmailOtp(email, otp) {
  const message = `Your Salon Luxe verification code is ${otp}. It expires in 10 minutes.`;
  const smtpError = getSmtpConfigError();
  if (smtpError) {
    console.log(`Email OTP (dev mode) to ${email}: ${otp}`);
    return { devMode: true, to: email, otp };
  }

  const transporter = createSmtpTransport();

  try {
    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL || `"Salon Luxe" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Salon Luxe email verification code',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #d97706; margin-bottom: 16px;">Verify Your Email</h2>
          <p style="color: #334155; line-height: 1.5;">Hello,</p>
          <p style="color: #334155; line-height: 1.5;">Thank you for registering with Salon Luxe. Please use the following code to complete your registration:</p>
          <div style="background-color: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 16px; margin: 24px 0; text-align: center;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #92400e;">${otp}</span>
          </div>
          <p style="color: #64748b; font-size: 14px;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} Salon Luxe. All rights reserved.</p>
        </div>
      `,
      text: message,
    });

    console.log('sendEmailOtp: sendMail info=', {
      messageId: info.messageId,
      response: info.response,
    });

    return { info };
  } catch (err) {
    console.error('Failed to send email OTP:', err);
    throw new Error(`Email delivery failed: ${err.message}`);
  }
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

app.post('/api/smtp/test', async (req, res) => {
  const { email } = req.body || {}
  const targetEmail = normalizeEmail(email) || normalizeEmail(process.env.SMTP_USER)
  const smtpError = getSmtpConfigError()

  if (smtpError) {
    return res.status(500).json({ message: smtpError })
  }

  if (!targetEmail) {
    return res.status(400).json({ message: 'A target email is required.' })
  }

  try {
    const transporter = createSmtpTransport()
    await transporter.verify()

    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: targetEmail,
      subject: 'Salon Luxe SMTP test email',
      text: 'SMTP test successful. Your Salon Luxe backend can send emails.',
    })

    return res.json({ message: `SMTP test email sent to ${targetEmail}.` })
  } catch (error) {
    return res.status(500).json({ message: error.message || 'SMTP test failed.' })
  }
})

app.post('/api/users/register', (req, res) => {
  const { name, email, phone, password, otp } = req.body
  const normalizedEmail = normalizeEmail(email)
  const normalizedPhone = normalizePhone(phone)
  const normalizedName = String(name || '').trim()
  const normalizedPassword = String(password || '').trim()

  if (!normalizedName || !normalizedEmail || !normalizedPhone || !normalizedPassword || !otp) {
    return res.status(400).json({ message: 'name, email, phone, password and otp are required.' })
  }

  if (normalizedPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' })
  }

  if (getUserByEmail(normalizedEmail)) {
    return res.status(409).json({ message: 'An account with this email already exists.' })
  }

  if (getUserByPhone(normalizedPhone)) {
    return res.status(409).json({ message: 'An account with this phone number already exists.' })
  }

  const otpCheck = consumeOtp('register', normalizedEmail, otp)
  if (!otpCheck.ok) {
    return res.status(400).json({ message: otpCheck.message })
  }

  const newUser = {
    id: `USR-${Date.now()}`,
    name: normalizedName,
    email: normalizedEmail,
    passwordHash: hashPassword(normalizedPassword),
    phone: normalizedPhone,
    emailVerified: 1,
    registeredAt: new Date().toISOString(),
  }

  createUser(newUser)
  return res.status(201).json({
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    phone: newUser.phone,
    emailVerified: true,
  })
})

app.get('/api/specialists', (_req, res) => {
  res.json({ specialists: getAllSpecialists() })
})

app.get('/api/reviews', (_req, res) => {
  res.json({ reviews: getAllReviews() })
})

app.post('/api/reviews', (req, res) => {
  const { customerId, customerName, serviceId, rating, comment } = req.body
  const review = {
    id: `REV-${Date.now()}`,
    customerId,
    customerName,
    serviceId,
    rating,
    comment,
    date: new Date().toISOString()
  }
  createReview(review)
  res.status(201).json(review)
})

app.post('/api/ai/virtual-makeover', (req, res) => {
  // Placeholder for AI transformation logic
  res.json({ 
    message: 'Transformation successful', 
    transformedImage: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=600&q=80',
    details: 'AI analysis suggests a medium-brown balayage to complement your skin tone.'
  })
})

app.post('/api/gift-cards/buy', (req, res) => {
  const { amount, recipientEmail } = req.body
  const card = {
    id: `GFT-${Date.now()}`,
    code: `LUXE-${Math.random().toString(36).toUpperCase().slice(2, 8)}`,
    amount,
    balance: amount,
    recipientEmail,
    createdAt: new Date().toISOString()
  }
  createGiftCard(card)
  res.status(201).json(card)
})

app.post('/api/otp/send', async (req, res) => {
  const { email, purpose = 'register', userData } = req.body
  const normalizedEmail = normalizeEmail(email)

  if (!normalizedEmail) {
    return res.status(400).json({ message: 'Email address is required.' })
  }

  if (purpose === 'register') {
    if (getUserByEmail(normalizedEmail)) {
      return res.status(409).json({ message: 'An account with this email already exists.' })
    }

    if (userData) {
      // Validate userData if provided
      const { name, phone, password } = userData
      if (!name || !phone || !password) {
        return res.status(400).json({ message: 'Registration data (name, phone, password) is incomplete.' })
      }
    }
  }

  const sendGate = canSendOtp(purpose, normalizedEmail)
  if (!sendGate.ok) {
    return res.status(sendGate.status).json({ message: sendGate.message })
  }

  const otp = generateOtp()
  
  try {
    await sendEmailOtp(normalizedEmail, otp)
    
    if (purpose === 'register' && userData) {
      createPendingUser({
        email: normalizedEmail,
        name: userData.name.trim(),
        phone: normalizePhone(userData.phone),
        passwordHash: hashPassword(userData.password.trim()),
        otp: hashOtp(otp),
        expiresAt: Date.now() + OTP_TTL_MS,
        createdAt: new Date().toISOString()
      })
    } else {
      storeOtp(purpose, normalizedEmail, otp)
    }

    return res.json({ message: 'OTP sent successfully to email.' })
  } catch (error) {
    console.error('OTP send failed:', error)
    return res.status(500).json({ message: error.message || 'Failed to send OTP.' })
  }
})

app.post('/api/auth/register', async (req, res) => {
  const { email, otp } = req.body
  const normalizedEmail = normalizeEmail(email)

  if (!normalizedEmail || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required.' })
  }

  const pendingUser = getPendingUser(normalizedEmail)
  if (!pendingUser) {
    return res.status(400).json({ message: 'No registration session found. Please request a new OTP.' })
  }

  if (Date.now() > pendingUser.expiresAt) {
    deletePendingUser(normalizedEmail)
    return res.status(400).json({ message: 'OTP has expired. Please request a new code.' })
  }

  if (pendingUser.otp !== hashOtp(otp)) {
    return res.status(400).json({ message: 'Invalid OTP.' })
  }

  // Create user in main table
  const newUser = {
    id: `USR-${Date.now()}`,
    name: pendingUser.name,
    email: pendingUser.email,
    passwordHash: pendingUser.passwordHash,
    phone: pendingUser.phone,
    emailVerified: 1,
    registeredAt: new Date().toISOString(),
  }

  try {
    createUser(newUser)
    deletePendingUser(normalizedEmail)
    
    return res.status(201).json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      emailVerified: true,
    })
  } catch (error) {
    console.error('Final registration failed:', error)
    return res.status(500).json({ message: 'Registration failed during database save.' })
  }
})

app.post('/api/auth/login', (req, res) => {
  const { identifier, password } = req.body
  const normalizedIdentifier = String(identifier || '').trim().toLowerCase()
  const normalizedPassword = String(password || '').trim()

  if (!normalizedIdentifier || !normalizedPassword) {
    return res.status(400).json({ message: 'identifier and password are required.' })
  }

  const user = verifyUserLogin(normalizedIdentifier, normalizedPassword)
  if (!user) {
    return res.status(401).json({ message: 'Invalid username/email or password, or email is not verified.' })
  }

  return res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
  })
})

app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body
  const normalizedEmail = normalizeEmail(email)

  if (!normalizedEmail) {
    return res.status(400).json({ message: 'Email address is required.' })
  }

  const user = getUserByEmail(normalizedEmail)
  if (!user) {
    return res.json({ message: 'If an account exists, a recovery code has been sent.' })
  }

  const sendGate = canSendOtp('reset-password', normalizedEmail)
  if (!sendGate.ok) {
    return res.status(sendGate.status).json({ message: sendGate.message })
  }

  const otp = generateOtp()
  storeOtp('reset-password', normalizedEmail, otp)
  const resetRecord = {
    id: `PWD-${Date.now()}`,
    email: normalizedEmail,
    otp: hashOtp(otp),
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
    createdAt: new Date().toISOString(),
    verifiedAt: null,
    usedAt: null,
  }

  upsertPasswordReset(resetRecord)

  try {
    await sendEmailOtp(normalizedEmail, otp)
    return res.json({ message: 'If an account exists, a recovery code has been sent.' })
  } catch (error) {
    clearStoredOtp('reset-password', normalizedEmail, true)
    deletePasswordReset(normalizedEmail)
    return res.status(500).json({ message: error.message || 'Failed to send recovery code.' })
  }
})

app.post('/api/auth/reset-password', (req, res) => {
  const { email, otp, password } = req.body
  const normalizedEmail = normalizeEmail(email)
  const normalizedPassword = String(password || '').trim()
  const normalizedOtp = String(otp || '').trim()

  if (!normalizedEmail || !normalizedOtp || !normalizedPassword) {
    return res.status(400).json({ message: 'email, otp and password are required.' })
  }

  if (normalizedPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' })
  }

  const resetRecord = getPasswordResetByEmail(normalizedEmail)
  if (!resetRecord) {
    return res.status(400).json({ message: 'Recovery code not found. Request a new one.' })
  }

  if (Date.now() > Number(resetRecord.expiresAt)) {
    clearStoredOtp('reset-password', normalizedEmail)
    deletePasswordReset(normalizedEmail)
    return res.status(400).json({ message: 'Recovery code has expired. Request a new one.' })
  }

  const incomingOtpHash = hashOtp(normalizedOtp)
  const storedOtp = String(resetRecord.otp || '')
  // Backward compatibility: support older plaintext OTP rows if any exist.
  const otpMatches = storedOtp === incomingOtpHash || storedOtp === normalizedOtp

  if (!otpMatches) {
    const nextAttempts = Number(resetRecord.attempts || 0) + 1
    updatePasswordResetAttempts(normalizedEmail, nextAttempts)
    if (nextAttempts >= 5) {
      clearStoredOtp('reset-password', normalizedEmail)
      deletePasswordReset(normalizedEmail)
      return res.status(400).json({ message: 'Too many invalid attempts. Request a new recovery code.' })
    }
    return res.status(400).json({ message: 'Invalid recovery code.' })
  }

  const updated = updateUserPassword(normalizedEmail, hashPassword(normalizedPassword))
  if (!updated) {
    return res.status(404).json({ message: 'Account not found.' })
  }

  clearStoredOtp('reset-password', normalizedEmail)
  deletePasswordReset(normalizedEmail)
  return res.json({ message: 'Password reset successfully.' })
})

// Admin endpoints
app.post('/api/admin/register', (req, res) => {
  const { name, email, password } = req.body
  const normalizedEmail = String(email || '').trim().toLowerCase()
  const normalizedName = String(name || '').trim()
  const normalizedPassword = String(password || '').trim()

  if (!normalizedName || !normalizedEmail || !normalizedPassword) {
    return res.status(400).json({ message: 'name, email and password are required.' })
  }

  if (normalizedPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' })
  }

  if (getAdminByEmail(normalizedEmail)) {
    return res.status(409).json({ message: 'Admin with this email already exists.' })
  }

  const newAdmin = {
    id: `ADM-${Date.now()}`,
    name: normalizedName,
    email: normalizedEmail,
    password: normalizedPassword,
    role: 'admin',
    createdAt: new Date().toISOString(),
  }

  createAdmin(newAdmin)
  return res.status(201).json({
    id: newAdmin.id,
    name: newAdmin.name,
    email: newAdmin.email,
    role: newAdmin.role,
  })
})

app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body
  const normalizedEmail = String(email || '').trim().toLowerCase()
  const normalizedPassword = String(password || '').trim()

  if (!normalizedEmail || !normalizedPassword) {
    return res.status(400).json({ message: 'email and password are required.' })
  }

  const admin = verifyAdmin(normalizedEmail, normalizedPassword)
  if (!admin) {
    return res.status(401).json({ message: 'Invalid admin credentials.' })
  }

  return res.json({
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
  })
})

// Admin delete endpoints
app.delete('/api/admin/bookings/:id', (req, res) => {
  const { id } = req.params
  try {
    const deleted = deleteBooking(id)
    if (!deleted) {
      return res.status(404).json({ message: 'Booking not found.' })
    }
    return res.json({ message: 'Booking deleted successfully.' })
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
})

app.delete('/api/admin/payments/:id', (req, res) => {
  const { id } = req.params
  try {
    const deleted = deletePayment(id)
    if (!deleted) {
      return res.status(404).json({ message: 'Payment not found.' })
    }
    return res.json({ message: 'Payment deleted successfully.' })
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
})

app.delete('/api/admin/users/:id', (req, res) => {
  const { id } = req.params
  try {
    const deleted = deleteUser(id)
    if (!deleted) {
      return res.status(404).json({ message: 'User not found.' })
    }
    return res.json({ message: 'User deleted successfully.' })
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
})

app.post('/api/bookings', async (req, res) => {
  const { customerName, phone, service, date, slot, email, specialist, payment: paymentPayload } = req.body

  if (!customerName || !phone || !service) {
    return res.status(400).json({ message: 'customerName, phone and service are required.' })
  }

  // Award loyalty points (10 per booking)
  if (email) {
    const user = getUserByEmail(email)
    if (user) {
      addUserPoints(user.id, 10)
    }
  }

  const booking = {
    id: `BKG-${Date.now()}`,
    customer: String(customerName).trim(),
    email: email ? String(email).trim().toLowerCase() : null,
    phone: String(phone).trim(),
    service: String(service).trim(),
    date: date ? String(date).trim() : null,
    slot: slot ? String(slot).trim() : null,
    specialist: specialist || ['Emma', 'James', 'Sophia'][Math.floor(Math.random() * 3)],
    status: paymentPayload && paymentPayload.status === 'Paid' ? 'Confirmed' : 'Pending',
    pointsEarned: 10,
    createdAt: new Date().toISOString(),
  }

  let payment = null
  if (paymentPayload) {
    payment = {
      id: `PAY-${Date.now() + 1}`,
      customer: booking.customer,
      service: booking.service,
      amount: paymentPayload.amount || 50,
      method: paymentPayload.method || 'Card',
      status: paymentPayload.status || 'Pending',
      date: booking.date,
      createdAt: new Date().toISOString(),
    }
  }

  let savedBooking = booking
  let savedPayment = payment
  try {
    const saved = createBookingWithPayment(booking, payment)
    savedBooking = saved.booking
    savedPayment = saved.payment
  } catch (err) {
    return res.status(500).json({ message: 'Failed to create booking.' })
  }

  // send confirmation email only when payment exists (i.e., booking finalized)
  if (email && savedPayment) {
    try {
      const smtpError = getSmtpConfigError()
      if (smtpError) {
        console.log(`Booking confirmation email skipped: ${smtpError}`)
      } else {
        const transporter = createSmtpTransport()

        const mailHtml = `
          <div style="font-family: sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 40px; border-radius: 20px; max-width: 600px; margin: auto; border: 1px solid #333;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="color: #fcd34d; font-size: 40px; margin-bottom: 10px;">✂️</div>
              <h1 style="text-transform: uppercase; font-style: italic; margin: 0; letter-spacing: 2px;">Salon Luxe</h1>
            </div>
            
            <div style="background-color: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); color: #10b981; padding: 15px; border-radius: 50px; text-align: center; margin-bottom: 30px;">
              <strong style="font-size: 18px;">✅ Payment Successful & Booking Confirmed</strong>
            </div>

            <div style="background-color: rgba(255, 255, 255, 0.05); padding: 25px; border-radius: 15px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                  <td style="padding: 10px 0; color: #888; text-transform: uppercase; font-size: 10px; letter-spacing: 1px;">Service</td>
                  <td style="padding: 10px 0; text-align: right; font-weight: bold;">${savedBooking.service}</td>
                </tr>
                <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                  <td style="padding: 10px 0; color: #888; text-transform: uppercase; font-size: 10px; letter-spacing: 1px;">Date & Time</td>
                  <td style="padding: 10px 0; text-align: right; font-weight: bold;">${savedBooking.date || 'TBD'} @ ${savedBooking.slot || 'TBD'}</td>
                </tr>
                <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                  <td style="padding: 10px 0; color: #888; text-transform: uppercase; font-size: 10px; letter-spacing: 1px;">Amount Paid</td>
                  <td style="padding: 10px 0; text-align: right; font-weight: bold; color: #fcd34d;">${savedPayment?.amount || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #888; text-transform: uppercase; font-size: 10px; letter-spacing: 1px;">Booking ID</td>
                  <td style="padding: 10px 0; text-align: right; font-weight: bold;">${savedBooking.id}</td>
                </tr>
              </table>
            </div>

            <div style="text-align: center; margin-top: 30px; color: #888; font-size: 12px;">
              <p>Please show this email at the reception upon arrival.</p>
              <p style="margin-top: 20px;">© ${new Date().getFullYear()} Salon Luxe. All rights reserved.</p>
            </div>
          </div>
        `;

        await transporter.sendMail({
          from: process.env.FROM_EMAIL || 'no-reply@salon.local',
          to: email,
          subject: `Confirmed: ${savedBooking.service} at Salon Luxe`,
          html: mailHtml,
        })
      }

    } catch (err) {
      console.error('Failed to send booking email', err)
    }
  }

  return res.status(201).json({ booking: savedBooking, payment: savedPayment })
})

app.get('/api/admin/summary', (_req, res) => {
  res.json({
    ...getAdminSummary(),
    services: getAllServices()
  })
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

app.get('/api/services', (_req, res) => {
  try {
    const services = getAllServices()
    return res.json({ services })
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch services.' })
  }
})

app.post('/api/admin/services', (req, res) => {
  try {
    const { title, description, brief, price, duration, image, category } = req.body
    if (!title || !description || !image) {
      return res.status(400).json({ message: 'Title, description, and image are required.' })
    }
    const slug = title.toLowerCase().replace(/ /g, '-')
    const id = `SER-${Date.now()}`
    createService({ id, title, slug, description, brief, price, duration, image, category: category || 'General' })
    return res.status(201).json({ message: 'Service created successfully.' })
  } catch (err) {
    return res.status(500).json({ message: 'Failed to create service.' })
  }
})

app.patch('/api/admin/services/:id', (req, res) => {
  try {
    const { id } = req.params
    updateService(id, req.body)
    return res.json({ message: 'Service updated successfully.' })
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update service.' })
  }
})

app.delete('/api/admin/services/:id', (req, res) => {
  try {
    const { id } = req.params
    deleteService(id)
    return res.json({ message: 'Service deleted successfully.' })
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete service.' })
  }
})

app.post('/api/chat', (req, res) => {
  try {
    const { message } = req.body
    const msg = message.toLowerCase()
    const services = getAllServices()

    // 1. Check for booking intent
    if (
      msg.includes('book') ||
      msg.includes('appointment') ||
      msg.includes('slot') ||
      msg.includes('visit') ||
      msg.includes('schedule') ||
      msg.includes('reserve') ||
      msg.includes('pay') ||
      msg.includes('come')
    ) {
      return res.json({
        reply: "I'd be happy to help you book an appointment! You can view our live availability and reserve your slot on the booking page.",
        action: 'book',
      })
    }

    // 2. Check for service-specific queries
    const matchedService = services.find(
      (s) => msg.includes(s.title.toLowerCase()) || msg.includes(s.slug.toLowerCase()),
    )

    if (matchedService) {
      return res.json({
        reply: `Our ${matchedService.title} service is very popular! ${matchedService.description} It starts at ${matchedService.price}. Would you like to book a slot for this?`,
        action: 'book',
      })
    }

    // 3. General suggestions based on keywords
    if (msg.includes('hair')) {
      return res.json({ reply: 'We offer precision cuts, styling, and keratin treatments. Are you looking for a haircut or coloring today?' })
    }
    if (msg.includes('skin') || msg.includes('face') || msg.includes('glow')) {
      return res.json({ reply: 'For a radiant glow, I recommend our Hydra Facial or Skin Boosters. They work wonders for hydration and tone!' })
    }
    if (msg.includes('wedding') || msg.includes('bride') || msg.includes('event')) {
      return res.json({ reply: 'Congratulations! We specialize in Bridal Makeup and complete event glam. We also offer bridal trials to perfect your look.' })
    }
    if (msg.includes('man') || msg.includes('men') || msg.includes('beard')) {
      return res.json({ reply: "Our Men's Grooming section includes everything from sharp fades to beard architecture and scalp detox." })
    }

    // 4. Default response
    return res.json({
      reply: "I'm here to help! I can tell you about our hair, skin, and grooming services, or assist you with booking an appointment. What's on your mind?",
    })
  } catch (err) {
    return res.status(500).json({ message: 'Chatbot error.' })
  }
})

// Serve static assets from the frontend build
const distPath = path.join(__dirname, '..', 'dist')
app.use(express.static(distPath))

// All other routes should serve index.html for the SPA (excluding API calls)
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next()
  }
  res.sendFile(path.join(distPath, 'index.html'))
})

// Seed services
try {
  const initialServices = [
    { id: 'SER-1', slug: 'hair', title: 'Hair', description: 'Precision cuts, creative styling, and nourishing hair treatments.', brief: 'Our hair services are personalized for face shape, hair texture, and lifestyle.', price: '$45', duration: '45 min', image: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=900&q=80', category: 'Hair' },
    { id: 'SER-2', slug: 'facial', title: 'Facial', description: 'Hydrating and anti-aging facials designed for your skin goals.', brief: 'Facial protocols include cleansing, exfoliation, extraction, and hydration lock.', price: '$55', duration: '50 min', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=80', category: 'Beauty' },
    { id: 'SER-3', slug: 'waxing', title: 'Waxing', description: 'Gentle, hygienic hair removal with smooth long-lasting results.', brief: 'Waxing service focuses on hygiene, minimal irritation, and smooth finish.', price: '$35', duration: '30 min', image: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=900&q=80', category: 'Beauty' },
    { id: 'SER-4', slug: 'nails', title: 'Nails', description: 'Manicure and pedicure services with refined, durable finishes.', brief: 'Nail care includes shaping, cuticle care, and polish/gel finish.', price: '$48', duration: '60 min', image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=900&q=80', category: 'Beauty' },
    { id: 'SER-5', slug: 'laser', title: 'Laser', description: 'Advanced laser sessions for skin rejuvenation and hair reduction.', brief: 'Laser sessions are handled by trained specialists with skin-type mapping.', price: '$65', duration: '35 min', image: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=900&q=80', category: 'Laser' },
    { id: 'SER-6', slug: 'bridal-makeup', title: 'Bridal Makeup', description: 'Complete bridal and event-ready glam with long-wear premium products.', brief: 'Bridal makeup includes look planning, skin prep, and long-wear base.', price: '$95', duration: '75 min', image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=900&q=80', category: 'Beauty' },
    { id: 'SER-7', slug: 'skin-boosters', title: 'Skin Boosters', description: 'Targeted glow therapy sessions for hydration and tone correction.', brief: 'Skin boosters target hydration and texture through curated active ingredients.', price: '$75', duration: '45 min', image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80', category: 'Beauty' },
    { id: 'SER-8', slug: 'body-polishing', title: 'Body Polishing', description: 'Detoxifying exfoliation and massage for radiant and refreshed skin.', brief: 'Body polishing combines exfoliation, masking, and massage for brighter tone.', price: '$85', duration: '90 min', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=900&q=80', category: 'Wellness' },
    { id: 'SER-9', slug: 'mens-grooming', title: "Men's Grooming", description: 'Haircuts, beard sculpting, detan, scalp repair, and express clean-up sessions.', brief: "Men's grooming blends haircut, beard architecture, and scalp/skin cleanup.", price: '$25', duration: '35 min', image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=900&q=80', category: 'Grooming' }
  ]
  seedServices(initialServices)
  seedSpecialists()
} catch (err) {
  console.error('Seeding failed:', err)
}

app.listen(PORT, () => {
  console.log(`Salon backend running on http://localhost:${PORT}`)
})
