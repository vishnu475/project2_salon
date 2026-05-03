import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import Database from 'better-sqlite3'

import fs from 'node:fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// In production (Render), we store the DB on a persistent disk mount
const dataDir = process.env.DATA_DIR || path.join(__dirname, 'data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const dbPath = path.join(dataDir, 'salon.sqlite')
const db = new Database(dbPath)

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    passwordHash TEXT,
    phone TEXT NOT NULL,
    emailVerified INTEGER DEFAULT 0,
    registeredAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    brief TEXT,
    price TEXT,
    duration TEXT,
    image TEXT NOT NULL,
    category TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS admins (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    customer TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    service TEXT NOT NULL,
    date TEXT,
    slot TEXT,
    specialist TEXT,
    status TEXT NOT NULL,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    customer TEXT NOT NULL,
    service TEXT NOT NULL,
    amount REAL,
    method TEXT,
    status TEXT,
    date TEXT,
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS password_resets (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    otp TEXT NOT NULL,
    expiresAt INTEGER NOT NULL,
    attempts INTEGER DEFAULT 0,
    createdAt TEXT NOT NULL,
    verifiedAt TEXT,
    usedAt TEXT
  );

  CREATE TABLE IF NOT EXISTS pending_users (
    email TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    passwordHash TEXT NOT NULL,
    otp TEXT NOT NULL,
    expiresAt INTEGER NOT NULL,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS specialists (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    rating REAL DEFAULT 5.0,
    experience TEXT,
    image TEXT,
    bio TEXT
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    customerId TEXT NOT NULL,
    customerName TEXT NOT NULL,
    serviceId TEXT,
    rating INTEGER NOT NULL,
    comment TEXT,
    date TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS gift_cards (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    amount REAL NOT NULL,
    balance REAL NOT NULL,
    recipientEmail TEXT,
    status TEXT DEFAULT 'Active',
    createdAt TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_users_registeredAt ON users(registeredAt);
  CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
  CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
  CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
  CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(date);
  CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets(email);
`)

function ensureColumn(tableName, columnName, definition) {
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all()
  const hasColumn = columns.some((column) => column.name === columnName)
  if (!hasColumn) {
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`)
  }
}

ensureColumn('users', 'passwordHash', 'TEXT')
ensureColumn('users', 'emailVerified', 'INTEGER DEFAULT 0')
ensureColumn('users', 'loyaltyPoints', 'INTEGER DEFAULT 0')
ensureColumn('bookings', 'email', 'TEXT')
ensureColumn('bookings', 'pointsEarned', 'INTEGER DEFAULT 0')

db.exec('CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(email)')

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const derivedKey = crypto.scryptSync(String(password), salt, 64).toString('hex')
  return `${salt}:${derivedKey}`
}

function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) {
    return false
  }

  const [salt, derivedKey] = storedHash.split(':')
  const compareKey = crypto.scryptSync(String(password), salt, 64)
  const expectedKey = Buffer.from(derivedKey, 'hex')
  return compareKey.length === expectedKey.length && crypto.timingSafeEqual(compareKey, expectedKey)
}

function normalizeAdminPasswordValue(password) {
  const rawPassword = String(password || '')
  return rawPassword.includes(':') ? rawPassword : hashPassword(rawPassword)
}

export function getUserByEmail(email) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email)
}

export function getUserByPhone(phone) {
  return db.prepare('SELECT * FROM users WHERE phone = ?').get(phone)
}

export function createUser(user) {
  db.prepare(
    `INSERT INTO users (id, name, email, passwordHash, phone, emailVerified, registeredAt)
     VALUES (@id, @name, @email, @passwordHash, @phone, @emailVerified, @registeredAt)`,
  ).run(user)
}

export function getUserByIdentifier(identifier) {
  return db.prepare('SELECT * FROM users WHERE email = ? OR name = ?').get(identifier, identifier)
}

export function verifyUserLogin(identifier, password) {
  const user = getUserByIdentifier(identifier)
  if (!user || !user.emailVerified) {
    return null
  }

  if (!verifyPassword(password, user.passwordHash)) {
    return null
  }

  return user
}

export { hashPassword }

export function createBookingWithPayment(booking, payment) {
  const normalizedBooking = {
    ...booking,
    email: booking.email || null,
    customer: String(booking.customer || '').trim(),
    phone: String(booking.phone || '').trim(),
    service: String(booking.service || '').trim(),
    date: booking.date || new Date().toISOString().slice(0, 10),
    slot: booking.slot || '00:00',
    specialist: booking.specialist || 'Assigned Later',
    status: booking.status || 'Pending',
    createdAt: booking.createdAt || new Date().toISOString(),
  }

  const insertBooking = db.prepare(
    `INSERT INTO bookings (id, customer, email, phone, service, date, slot, specialist, status, createdAt)
     VALUES (@id, @customer, @email, @phone, @service, @date, @slot, @specialist, @status, @createdAt)`,
  )
  const insertPayment = db.prepare(
    `INSERT INTO payments (id, customer, service, amount, method, status, date, createdAt)
     VALUES (@id, @customer, @service, @amount, @method, @status, @date, @createdAt)`,
  )

  // ensure there's always a payment record (default/placeholder) so UI can show zeros until payment completes
  if (!payment) {
    payment = {
      id: `PAY-${Date.now() + 1}`,
      customer: normalizedBooking.customer,
      service: normalizedBooking.service,
      amount: 0,
      method: 'Pending',
      status: 'Pending',
      date: normalizedBooking.date,
      createdAt: new Date().toISOString(),
    }
  }

  const normalizedPayment = {
    ...payment,
    customer: String(payment.customer || normalizedBooking.customer).trim(),
    service: String(payment.service || normalizedBooking.service).trim(),
    amount: Number.isFinite(Number(payment.amount)) ? Number(payment.amount) : 0,
    method: payment.method || 'Pending',
    status: payment.status || 'Pending',
    date: payment.date || normalizedBooking.date,
    createdAt: payment.createdAt || new Date().toISOString(),
  }

  const tx = db.transaction(() => {
    insertBooking.run(normalizedBooking)
    insertPayment.run(normalizedPayment)
  })
  tx()

  return {
    booking: normalizedBooking,
    payment: normalizedPayment,
  }
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

export function getAdminByEmail(email) {
  return db.prepare('SELECT * FROM admins WHERE email = ?').get(email)
}

export function createAdmin(admin) {
  db.prepare(
    `INSERT INTO admins (id, name, email, password, role, createdAt)
     VALUES (@id, @name, @email, @password, @role, @createdAt)`,
  ).run({
    ...admin,
    password: normalizeAdminPasswordValue(admin.password),
  })
}

export function verifyAdmin(email, password) {
  const admin = db.prepare('SELECT id, name, email, password, role FROM admins WHERE email = ?').get(email)
  if (!admin) {
    return null
  }

  const passwordMatches = admin.password && admin.password.includes(':')
    ? verifyPassword(password, admin.password)
    : admin.password === password

  if (!passwordMatches) {
    return null
  }

  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
  }
}

export function deleteBooking(bookingId) {
  const result = db.prepare('DELETE FROM bookings WHERE id = ?').run(bookingId)
  return result.changes > 0
}

export function deletePayment(paymentId) {
  const result = db.prepare('DELETE FROM payments WHERE id = ?').run(paymentId)
  return result.changes > 0
}

export function deleteUser(userId) {
  const result = db.prepare('DELETE FROM users WHERE id = ?').run(userId)
  return result.changes > 0
}

export function deleteAllUsers() {
  const result = db.prepare('DELETE FROM users').run()
  return result.changes
}

export function deleteAllPayments() {
  const result = db.prepare('DELETE FROM payments').run()
  return result.changes
}

export function deleteAllBookings() {
  const result = db.prepare('DELETE FROM bookings').run()
  return result.changes
}

export function getPasswordResetByEmail(email) {
  return db.prepare('SELECT * FROM password_resets WHERE email = ?').get(email)
}

export function upsertPasswordReset(resetRecord) {
  db.prepare(
    `INSERT INTO password_resets (id, email, otp, expiresAt, attempts, createdAt, verifiedAt, usedAt)
     VALUES (@id, @email, @otp, @expiresAt, @attempts, @createdAt, @verifiedAt, @usedAt)
     ON CONFLICT(email) DO UPDATE SET
       id = excluded.id,
       otp = excluded.otp,
       expiresAt = excluded.expiresAt,
       attempts = excluded.attempts,
       createdAt = excluded.createdAt,
       verifiedAt = excluded.verifiedAt,
       usedAt = excluded.usedAt`,
  ).run(resetRecord)
}

export function updatePasswordResetAttempts(email, attempts) {
  db.prepare('UPDATE password_resets SET attempts = ? WHERE email = ?').run(attempts, email)
}

export function markPasswordResetVerified(email) {
  db.prepare('UPDATE password_resets SET verifiedAt = ? WHERE email = ?').run(new Date().toISOString(), email)
}

export function markPasswordResetUsed(email) {
  db.prepare('UPDATE password_resets SET usedAt = ? WHERE email = ?').run(new Date().toISOString(), email)
}

export function deletePasswordReset(email) {
  const result = db.prepare('DELETE FROM password_resets WHERE email = ?').run(email)
  return result.changes > 0
}

export function updateUserPassword(email, passwordHash) {
  const result = db.prepare('UPDATE users SET passwordHash = ? WHERE email = ?').run(passwordHash, email)
  return result.changes > 0
}

export function createPendingUser(pending) {
  db.prepare(
    `INSERT INTO pending_users (email, name, phone, passwordHash, otp, expiresAt, createdAt)
     VALUES (@email, @name, @phone, @passwordHash, @otp, @expiresAt, @createdAt)
     ON CONFLICT(email) DO UPDATE SET
       name = excluded.name,
       phone = excluded.phone,
       passwordHash = excluded.passwordHash,
       otp = excluded.otp,
       expiresAt = excluded.expiresAt,
       createdAt = excluded.createdAt`,
  ).run(pending)
}

export function getPendingUser(email) {
  return db.prepare('SELECT * FROM pending_users WHERE email = ?').get(email)
}

export function deletePendingUser(email) {
  db.prepare('DELETE FROM pending_users WHERE email = ?').run(email)
}

export function verifyUserEmail(email) {
  db.prepare('UPDATE users SET emailVerified = 1 WHERE email = ?').run(email)
}

export function getAllServices() {
  return db.prepare('SELECT * FROM services').all()
}

export function seedServices(services) {
  const insert = db.prepare(
    `INSERT OR IGNORE INTO services (id, title, slug, description, brief, price, duration, image, category)
     VALUES (@id, @title, @slug, @description, @brief, @price, @duration, @image, @category)`,
  )
  const tx = db.transaction((data) => {
    for (const item of data) insert.run(item)
  })
  tx(services)
}

export function createService(service) {
  const insert = db.prepare(
    `INSERT INTO services (id, title, slug, description, brief, price, duration, image, category)
     VALUES (@id, @title, @slug, @description, @brief, @price, @duration, @image, @category)`,
  )
  return insert.run(service)
}

export function updateService(id, updates) {
  const keys = Object.keys(updates)
  const setClause = keys.map((key) => `${key} = ?`).join(', ')
  const values = keys.map((key) => updates[key])
  const update = db.prepare(`UPDATE services SET ${setClause} WHERE id = ?`)
  return update.run(...values, id)
}

export function deleteService(id) {
  return db.prepare('DELETE FROM services WHERE id = ?').run(id)
}

// Specialist Functions
export function getAllSpecialists() {
  return db.prepare('SELECT * FROM specialists').all()
}

export function seedSpecialists() {
  const specialists = [
    { id: 'SPEC-1', name: 'Emma Wilson', role: 'Master Stylist', experience: '10 years', rating: 4.9, image: 'https://images.unsplash.com/photo-1595959183082-7b570b7e08e2?auto=format&fit=crop&w=300&q=80', bio: 'Expert in creative coloring and precision cuts.' },
    { id: 'SPEC-2', name: 'James Miller', role: 'Skin Specialist', experience: '8 years', rating: 4.8, image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80', bio: 'Specializes in advanced facial treatments and skin rejuvenation.' },
    { id: 'SPEC-3', name: 'Sophia Chen', role: 'Nail Artist', experience: '5 years', rating: 5.0, image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80', bio: 'Award-winning nail designer and luxury manicure expert.' }
  ]
  const insert = db.prepare('INSERT OR IGNORE INTO specialists (id, name, role, experience, rating, image, bio) VALUES (@id, @name, @role, @experience, @rating, @image, @bio)')
  specialists.forEach(s => insert.run(s))
}

// Loyalty Functions
export function addUserPoints(userId, points) {
  return db.prepare('UPDATE users SET loyaltyPoints = loyaltyPoints + ? WHERE id = ?').run(points, userId)
}

// Review Functions
export function createReview(review) {
  return db.prepare('INSERT INTO reviews (id, customerId, customerName, serviceId, rating, comment, date) VALUES (@id, @customerId, @customerName, @serviceId, @rating, @comment, @date)').run(review)
}

export function getAllReviews() {
  return db.prepare('SELECT * FROM reviews ORDER BY date DESC').all()
}

// Gift Card Functions
export function createGiftCard(card) {
  return db.prepare('INSERT INTO gift_cards (id, code, amount, balance, recipientEmail, createdAt) VALUES (@id, @code, @amount, @balance, @recipientEmail, @createdAt)').run(card)
}

export function verifyGiftCard(code) {
  return db.prepare('SELECT * FROM gift_cards WHERE code = ? AND status = "Active"').get(code)
}
