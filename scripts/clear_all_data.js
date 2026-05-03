import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Database from 'better-sqlite3'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dbPath = path.resolve(__dirname, '..', 'server', 'data', 'salon.sqlite')
const db = new Database(dbPath)

try {
  // Delete all bookings
  const bookingDeleted = db.prepare('DELETE FROM bookings').run()
  console.log(`Deleted ${bookingDeleted.changes} booking records.`)

  // Delete all payments
  const paymentDeleted = db.prepare('DELETE FROM payments').run()
  console.log(`Deleted ${paymentDeleted.changes} payment records.`)

  console.log('✓ All booking slot and payment details cleared.')
} catch (err) {
  console.error('Failed to clear data:', err)
  process.exit(1)
}
