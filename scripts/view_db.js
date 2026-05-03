import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const db = new Database(path.resolve(__dirname, '..', 'server', 'data', 'salon.sqlite'))

console.log('\n=== BOOKINGS ===')
const bookings = db.prepare('SELECT * FROM bookings').all()
console.table(bookings)
console.log(`Total: ${bookings.length}`)

console.log('\n=== PAYMENTS ===')
const payments = db.prepare('SELECT * FROM payments').all()
console.table(payments)
console.log(`Total: ${payments.length}`)

console.log('\n=== USERS ===')
const users = db.prepare('SELECT * FROM users').all()
console.table(users)
console.log(`Total: ${users.length}`)
