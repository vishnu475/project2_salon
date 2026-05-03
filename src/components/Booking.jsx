import { motion } from 'framer-motion'
import { ROOT_URL } from '../config'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import SectionHeading from './SectionHeading'
import { useAuth } from '../context/AuthContext'
import PaymentModal from './PaymentModal'

function Booking() {
  const [dynamicServices, setDynamicServices] = useState([])
  const [specialists, setSpecialists] = useState([])
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [pendingBookingData, setPendingBookingData] = useState(null)
  
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, createBooking } = useAuth()
  const [selectedService, setSelectedService] = useState('Select Service')
  const [selectedSpecialist, setSelectedSpecialist] = useState('Any Specialist')
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: '',
    slot: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, specialistsRes] = await Promise.all([
          fetch(`${ROOT_URL}/api/services`),
          fetch(`${ROOT_URL}/api/specialists`)
        ])
        const servicesData = await servicesRes.json()
        const specialistsData = await specialistsRes.json()
        
        if (servicesData.services) setDynamicServices(servicesData.services)
        if (specialistsData.specialists) setSpecialists(specialistsData.specialists)
      } catch (err) {
        console.error('Failed to fetch data for booking', err)
      }
    }
    fetchData()
  }, [])

  const selectedServiceDetails = dynamicServices.find(s => s.title === selectedService)

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `${location.pathname}${location.search}` } } })
      return
    }

    if (selectedService === 'Select Service') {
      window.alert('Please choose a service before submitting booking.')
      return
    }

    // Instead of immediate booking, open payment modal
    setPendingBookingData({
      customerName: formData.name,
      phone: formData.phone,
      service: selectedService,
      specialist: selectedSpecialist,
      date: formData.date,
      slot: formData.slot,
    })
    setIsPaymentModalOpen(true)
  }

  const handlePaymentSuccess = async (method) => {
    try {
      await createBooking({
        ...pendingBookingData,
        paymentMethod: method,
        amount: selectedServiceDetails?.price || '$0',
        paymentStatus: 'Paid'
      })
      setIsPaymentModalOpen(false)
      window.alert('Payment successful and booking confirmed!')
      setFormData({ name: '', phone: '', date: '', slot: '' })
      setSelectedService('Select Service')
    } catch (error) {
      window.alert('Booking failed after payment: ' + error.message)
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const serviceFromQuery = params.get('service')
    if (serviceFromQuery) {
      setSelectedService(serviceFromQuery)
    }
  }, [location.search])

  return (
    <section id="contact" className="bg-neutral-900/70 px-6 py-20 md:px-8">
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
        amount={selectedServiceDetails?.price || '$0'}
        serviceName={selectedService}
      />
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
            <option disabled>Select Service</option>
            {dynamicServices.map((service) => (
              <option key={service.id} value={service.title}>
                {service.title}
              </option>
            ))}
          </select>

          <select
            value={selectedSpecialist}
            onChange={(event) => setSelectedSpecialist(event.target.value)}
            className="rounded-xl border border-white/20 bg-neutral-900 px-4 py-3 text-sm outline-none ring-amber-300 focus:ring-2"
          >
            <option value="Any Specialist">Any Specialist</option>
            {specialists.map((spec) => (
              <option key={spec.id} value={spec.name}>
                {spec.name} ({spec.role})
              </option>
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
