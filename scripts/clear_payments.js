import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Database from 'better-sqlite3'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dbPath = path.resolve(__dirname, '..', 'server', 'data', 'salon.sqlite')
const db = new Database(dbPath)

const ids = process.argv.slice(2)
if (ids.length === 0) {
  console.error('No payment IDs provided. Usage: node scripts/clear_payments.js PAY-1001 PAY-1002')
  process.exit(1)
}

const update = db.prepare("UPDATE payments SET amount = 0, method = NULL, status = 'Pending', date = NULL WHERE id = ?")
const select = db.prepare(`SELECT id, customer, service, amount, method, status, date FROM payments WHERE id IN (${ids.map(() => '?').join(',')})`)

const tx = db.transaction((idsList) => {
  for (const id of idsList) update.run(id)
})

try {
  tx(ids)
  const rows = select.all(...ids)
  console.log('Updated payments:')
  for (const r of rows) console.table(r)
  console.log('Done.')
} catch (err) {
  console.error('Failed to update payments:', err)
  process.exit(2)
}
