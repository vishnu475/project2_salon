import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Database from 'better-sqlite3'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dbPath = path.join(__dirname, 'data', 'salon.sqlite')
const db = new Database(dbPath)

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    registeredAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    customer TEXT NOT NULL,
    phone TEXT NOT NULL,
    service TEXT NOT NULL,
    date TEXT NOT NULL,
    slot TEXT NOT NULL,
    specialist TEXT NOT NULL,
    status TEXT NOT NULL,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    customer TEXT NOT NULL,
    service TEXT NOT NULL,
    amount REAL NOT NULL,
    method TEXT NOT NULL,
    status TEXT NOT NULL,
    date TEXT NOT NULL,
    createdAt TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_users_registeredAt ON users(registeredAt);
  CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
  CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
  CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
  CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(date);
`)

export function getUserByEmail(email) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email)
}

export function getUserByPhone(phone) {
  return db.prepare('SELECT * FROM users WHERE phone = ?').get(phone)
}

export function createUser(user) {
  db.prepare(
    `INSERT INTO users (id, name, email, phone, registeredAt)
     VALUES (@id, @name, @email, @phone, @registeredAt)`,
  ).run(user)
}

export function createBookingWithPayment(booking, payment) {
  const insertBooking = db.prepare(
    `INSERT INTO bookings (id, customer, phone, service, date, slot, specialist, status, createdAt)
     VALUES (@id, @customer, @phone, @service, @date, @slot, @specialist, @status, @createdAt)`,
  )
  const insertPayment = db.prepare(
    `INSERT INTO payments (id, customer, service, amount, method, status, date, createdAt)
     VALUES (@id, @customer, @service, @amount, @method, @status, @date, @createdAt)`,
  )

  const tx = db.transaction(() => {
    insertBooking.run(booking)
    insertPayment.run(payment)
  })
  tx()
}

export function getAdminSummary() {
  const users = db.prepare('SELECT * FROM users ORDER BY registeredAt DESC').all()
  const bookings = db.prepare('SELECT * FROM bookings ORDER BY createdAt DESC').all()
  const payments = db.prepare('SELECT * FROM payments ORDER BY createdAt DESC').all()

  const totalUsers = users.length
  const totalBookings = bookings.length
  const totalPayments = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
  const paidPayments = payments.filter((payment) => payment.status === 'Paid').length
  const pendingPayments = payments.filter((payment) => payment.status === 'Pending').length
  const confirmedBookings = bookings.filter((booking) => booking.status === 'Confirmed').length
  const inProgressBookings = bookings.filter((booking) => booking.status === 'In Progress').length

  return {
    totalUsers,
    totalBookings,
    totalPayments,
    paidPayments,
    pendingPayments,
    confirmedBookings,
    inProgressBookings,
    users,
    bookings,
    payments,
  }
}

export function updateBookingStatus(bookingId, status) {
  const allowed = ['Pending', 'Confirmed', 'In Progress', 'Cancelled']
  if (!allowed.includes(status)) {
    throw new Error('Invalid booking status.')
  }
  const result = db
    .prepare('UPDATE bookings SET status = ? WHERE id = ?')
    .run(status, bookingId)
  return result.changes > 0
}

export function updatePaymentStatus(paymentId, status) {
  const allowed = ['Pending', 'Paid', 'Failed']
  if (!allowed.includes(status)) {
    throw new Error('Invalid payment status.')
  }
  const result = db
    .prepare('UPDATE payments SET status = ?, method = CASE WHEN ? = "Paid" THEN "Card" ELSE method END WHERE id = ?')
    .run(status, status, paymentId)
  return result.changes > 0
}

export function getExportPayload() {
  return {
    exportedAt: new Date().toISOString(),
    ...getAdminSummary(),
  }
}

export function getBookings() {
  return db.prepare('SELECT * FROM bookings ORDER BY createdAt DESC').all()
}
