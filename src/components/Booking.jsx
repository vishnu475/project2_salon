import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import SectionHeading from './SectionHeading'
import { useAuth } from '../context/AuthContext'

const SERVICE_OPTIONS = [
  'Hair',
  'Facial',
  'Waxing',
  'Nails',
  'Laser',
  'Men Grooming',
  'Beard Styling',
  'Kids Haircut (Boys)',
]

function Booking() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, createBooking } = useAuth()
  const [selectedService, setSelectedService] = useState('Select Service')
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: '',
    slot: '',
  })

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const serviceFromQuery = params.get('service')
    if (serviceFromQuery && SERVICE_OPTIONS.includes(serviceFromQuery)) {
      setSelectedService(serviceFromQuery)
    }
  }, [location.search])

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `${location.pathname}${location.search}` } } })
      return
    }

    if (selectedService === 'Select Service') {
      window.alert('Please choose a service before submitting booking.')
      return
    }

    try {
      await createBooking({
        customerName: formData.name,
        phone: formData.phone,
        service: selectedService,
        date: formData.date,
        slot: formData.slot,
      })
      window.alert('Booking request submitted successfully. Added to admin dashboard.')
      setFormData({ name: '', phone: '', date: '', slot: '' })
      setSelectedService('Select Service')
    } catch (error) {
      window.alert(error.message)
    }
  }

  return (
    <section id="contact" className="bg-neutral-900/70 px-6 py-20 md:px-8">
      <div className="mx-auto max-w-4xl">
        <SectionHeading
          eyebrow="Book Appointment"
          title="Reserve Your Session Today"
          description="Fill in your details and our team will contact you to confirm your preferred slot."
        />

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="grid gap-4 rounded-2xl border border-white/10 bg-black/40 p-6 shadow-lg md:grid-cols-2"
        >
          <input
            type="text"
            value={formData.name}
            onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="Name"
            className="rounded-xl border border-white/20 bg-neutral-900 px-4 py-3 text-sm outline-none ring-amber-300 focus:ring-2"
            required
          />
          <input
            type="tel"
            value={formData.phone}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, phone: event.target.value.replace(/\D/g, '').slice(0, 10) }))
            }
            placeholder="Phone"
            className="rounded-xl border border-white/20 bg-neutral-900 px-4 py-3 text-sm outline-none ring-amber-300 focus:ring-2"
            required
          />
          <select
            value={selectedService}
            onChange={(event) => setSelectedService(event.target.value)}
            className="rounded-xl border border-white/20 bg-neutral-900 px-4 py-3 text-sm outline-none ring-amber-300 focus:ring-2"
          >
            <option>Select Service</option>
            {SERVICE_OPTIONS.map((service) => (
              <option key={service}>{service}</option>
            ))}
          </select>
          <input
            type="date"
            value={formData.date}
            onChange={(event) => setFormData((prev) => ({ ...prev, date: event.target.value }))}
            className="rounded-xl border border-white/20 bg-neutral-900 px-4 py-3 text-sm outline-none ring-amber-300 focus:ring-2"
            required
          />
          <input
            type="time"
            value={formData.slot}
            onChange={(event) => setFormData((prev) => ({ ...prev, slot: event.target.value }))}
            className="rounded-xl border border-white/20 bg-neutral-900 px-4 py-3 text-sm outline-none ring-amber-300 focus:ring-2"
            required
          />
          <button
            type="submit"
            className="rounded-xl bg-amber-300 px-5 py-3 text-sm font-semibold text-black transition hover:bg-amber-200 md:col-span-2"
          >
            {isAuthenticated ? 'Submit Booking' : 'Login to Book'}
          </button>
        </motion.form>
      </div>
    </section>
  )
}

export default Booking
