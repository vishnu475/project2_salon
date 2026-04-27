import { createContext, useContext, useMemo, useState } from 'react'
import { bookingSlots as seedBookingSlots, paymentDetails as seedPaymentDetails } from '../data/adminData'

const AuthContext = createContext(null)

const USERS_KEY = 'salon_users'
const CURRENT_USER_KEY = 'salon_current_user'
const ADMIN_SESSION_KEY = 'salon_admin_session'
const ADMIN_PROFILE_KEY = 'salon_admin_profile'
const BOOKING_SLOTS_KEY = 'salon_booking_slots'
const PAYMENT_DETAILS_KEY = 'salon_payment_details'
const API_BASE_URL = 'http://localhost:4000/api'

function parseStorageItem(key, fallback) {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(() => parseStorageItem(USERS_KEY, []))
  const [currentUser, setCurrentUser] = useState(() => parseStorageItem(CURRENT_USER_KEY, null))
  const [adminSession, setAdminSession] = useState(() => parseStorageItem(ADMIN_SESSION_KEY, null))
  const [adminProfile, setAdminProfile] = useState(() => parseStorageItem(ADMIN_PROFILE_KEY, null))
  const [bookingSlots, setBookingSlots] = useState(() => parseStorageItem(BOOKING_SLOTS_KEY, seedBookingSlots))
  const [paymentDetails, setPaymentDetails] = useState(() => parseStorageItem(PAYMENT_DETAILS_KEY, seedPaymentDetails))

  const requestOtp = async ({ phone, purpose, email }) => {
    const response = await fetch(`${API_BASE_URL}/otp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, purpose, email }),
    })
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send OTP.')
    }

    return data
  }

  const register = async ({ name, email, phone, otp }) => {
    const normalizedEmail = email.trim().toLowerCase()
    const normalizedPhone = phone.trim()
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!normalizedEmail || !name.trim() || !normalizedPhone || !otp) {
      throw new Error('All fields and OTP are required.')
    }
    if (!emailPattern.test(normalizedEmail)) {
      throw new Error('Please enter a valid email address.')
    }

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        email: normalizedEmail,
        phone: normalizedPhone,
        otp,
      }),
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'Failed to register user.')
    }

    const newUser = data

    const nextUsers = [...users, newUser]
    setUsers(nextUsers)
    setCurrentUser({ id: newUser.id, name: newUser.name, email: newUser.email })

    localStorage.setItem(USERS_KEY, JSON.stringify(nextUsers))
    localStorage.setItem(
      CURRENT_USER_KEY,
      JSON.stringify({ id: newUser.id, name: newUser.name, email: newUser.email }),
    )
  }

  const login = async ({ phone, otp }) => {
    const normalizedPhone = phone.trim()

    if (!normalizedPhone || !otp) {
      throw new Error('Phone and OTP are required.')
    }

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: normalizedPhone, otp }),
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'Invalid login OTP.')
    }

    const safeUser = { id: data.id, name: data.name, email: data.email }
    setCurrentUser(safeUser)
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser))
  }

  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem(CURRENT_USER_KEY)
  }

  const registerAdmin = ({ name, email, password }) => {
    const normalizedEmail = email.trim().toLowerCase()
    const normalizedName = name.trim()
    const normalizedPassword = password.trim()

    if (!normalizedName || !normalizedEmail || !normalizedPassword) {
      throw new Error('All admin fields are required.')
    }

    const nextAdminProfile = {
      id: Date.now(),
      name: normalizedName,
      email: normalizedEmail,
      password: normalizedPassword,
      role: 'admin',
    }

    setAdminProfile(nextAdminProfile)
    localStorage.setItem(ADMIN_PROFILE_KEY, JSON.stringify(nextAdminProfile))
  }

  const loginAdmin = ({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase()
    const normalizedPassword = password.trim()

    if (!adminProfile) {
      throw new Error('Admin is not registered yet. Please register admin first.')
    }

    if (normalizedEmail !== adminProfile.email || normalizedPassword !== adminProfile.password) {
      throw new Error('Invalid admin credentials.')
    }

    const admin = { email: adminProfile.email, role: 'admin', name: adminProfile.name }
    setAdminSession(admin)
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(admin))
  }

  const logoutAdmin = () => {
    setAdminSession(null)
    localStorage.removeItem(ADMIN_SESSION_KEY)
  }

  const createBooking = async ({ customerName, phone, service, date, slot }) => {
    const trimmedName = customerName.trim()
    const trimmedPhone = phone.trim()
    const trimmedService = service.trim()
    const trimmedDate = date.trim()
    const trimmedSlot = slot.trim()

    if (!trimmedName || !trimmedPhone || !trimmedService || !trimmedDate || !trimmedSlot) {
      throw new Error('All booking fields are required.')
    }

    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: trimmedName,
        phone: trimmedPhone,
        service: trimmedService,
        date: trimmedDate,
        slot: trimmedSlot,
      }),
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create booking.')
    }

    const newBooking = data.booking
    const newPayment = data.payment

    const nextBookings = [newBooking, ...bookingSlots]
    const nextPayments = [newPayment, ...paymentDetails]
    setBookingSlots(nextBookings)
    setPaymentDetails(nextPayments)
    localStorage.setItem(BOOKING_SLOTS_KEY, JSON.stringify(nextBookings))
    localStorage.setItem(PAYMENT_DETAILS_KEY, JSON.stringify(nextPayments))
  }

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated: Boolean(currentUser),
      users: users.map(({ password, ...safeUser }) => safeUser),
      bookingSlots,
      paymentDetails,
      adminSession,
      adminProfile: adminProfile ? { id: adminProfile.id, name: adminProfile.name, email: adminProfile.email } : null,
      isAdminAuthenticated: Boolean(adminSession?.role === 'admin'),
      register,
      requestOtp,
      login,
      logout,
      registerAdmin,
      loginAdmin,
      logoutAdmin,
      createBooking,
    }),
    [currentUser, users, bookingSlots, paymentDetails, adminSession, adminProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.')
  }

  return context
}
