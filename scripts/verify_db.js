import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const db = new Database(path.resolve(__dirname, '..', 'server', 'data', 'salon.sqlite'))

console.log('\n=== DATABASE VERIFICATION ===\n')

// Check tables exist
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()
console.log('✓ Tables in database:', tables.map(t => t.name).join(', '))

console.log('\n=== ADMINS ===')
const admins = db.prepare('SELECT id, name, email, role, createdAt FROM admins').all()
if (admins.length === 0) {
  console.log('No admins registered yet.')
} else {
  console.table(admins)
}

console.log('\n=== USERS ===')
const users = db.prepare('SELECT id, name, email, phone, registeredAt FROM users').all()
if (users.length === 0) {
  console.log('No users registered yet.')
} else {
  console.table(users)
}

console.log('\n=== BOOKINGS ===')
const bookings = db.prepare('SELECT id, customer, phone, service, date, slot, status, createdAt FROM bookings').all()
if (bookings.length === 0) {
  console.log('No bookings yet.')
} else {
  console.table(bookings)
}

console.log('\n=== PAYMENTS ===')
const payments = db.prepare('SELECT id, customer, service, amount, method, status, date FROM payments').all()
if (payments.length === 0) {
  console.log('No payments yet.')
} else {
  console.table(payments)
}

console.log('\n=== SUMMARY ===')
console.log(`Total Admins: ${admins.length}`)
console.log(`Total Users: ${users.length}`)
console.log(`Total Bookings: ${bookings.length}`)
console.log(`Total Payments: ${payments.length}`)
console.log('\n✓ Database structure is valid.\n')
