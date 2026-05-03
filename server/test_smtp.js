import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '..', '.env') })
dotenv.config({ path: path.resolve(__dirname, '.env'), override: true })

console.log('Testing SMTP with:')
console.log('  HOST:', process.env.SMTP_HOST)
console.log('  PORT:', process.env.SMTP_PORT)
console.log('  USER:', process.env.SMTP_USER)
console.log('  PASS:', process.env.SMTP_PASS ? '✅ Set (' + process.env.SMTP_PASS.length + ' chars)' : '❌ Missing')

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: { rejectUnauthorized: false }
})

console.log('\nVerifying connection...')
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP connection FAILED:', error.message)
  } else {
    console.log('✅ SMTP connection SUCCESS! Now sending test email...')
    transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: process.env.SMTP_USER,
      subject: 'Salon Luxe - SMTP Test',
      text: 'Your test OTP is: 123456'
    }, (err, info) => {
      if (err) console.error('❌ Send failed:', err.message)
      else console.log('✅ Email sent! Message ID:', info.messageId)
    })
  }
})
