import { Users, CreditCard, CalendarClock, LogOut } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { API_BASE_URL, ROOT_URL } from '../config'

function getStatusPill(status) {
  if (status === 'Paid' || status === 'Confirmed') {
    return 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
  }
  if (status === 'Pending') {
    return 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
  }
  return 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
}

function AdminDashboardPage() {
  const { users, paymentDetails, bookingSlots, logoutAdmin, isAdminAuthenticated } = useAuth()
  const [liveData, setLiveData] = useState(null)
  const [loading, setLoading] = useState(false)

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin" replace />
  }

  const loadSummary = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${ROOT_URL}/api/admin/summary`)
      if (!response.ok) return
      const data = await response.json()
      setLiveData(data)
    } catch {
      // keep context fallback silently when backend not reachable
    } finally {
      setLoading(false)
    }
  }

  const [newService, setNewService] = useState({
    title: '',
    description: '',
    brief: '',
    price: '',
    duration: '',
    image: '',
    category: 'Beauty',
  })

  const handleCreateService = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`${ROOT_URL}/api/admin/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newService),
      })
      if (response.ok) {
        setNewService({ title: '', description: '', brief: '', price: '', duration: '', image: '', category: 'Beauty' })
        await loadSummary()
      }
    } catch {
      window.alert('Failed to create service.')
    }
  }

  const handleDeleteService = async (id) => {
    if (!window.confirm('Delete this service?')) return
    try {
      await fetch(`${ROOT_URL}/api/admin/services/${id}`, { method: 'DELETE' })
      await loadSummary()
    } catch {
      window.alert('Failed to delete service.')
    }
  }

  useEffect(() => {
    loadSummary()
  }, [])

  const handleBookingStatusUpdate = async (bookingId, nextStatus) => {
    try {
      const response = await fetch(`${ROOT_URL}/api/admin/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      const data = await response.json()
      if (!response.ok) {
        window.alert(data.message || 'Failed to update booking status.')
        return
      }
      await loadSummary()
    } catch {
      window.alert('Could not connect to backend.')
    }
  }

  const handlePaymentStatusUpdate = async (paymentId, nextStatus) => {
    try {
      const response = await fetch(`${ROOT_URL}/api/admin/payments/${paymentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      const data = await response.json()
      if (!response.ok) {
        window.alert(data.message || 'Failed to update payment status.')
        return
      }
      await loadSummary()
    } catch {
      window.alert('Could not connect to backend.')
    }
  }

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return
    try {
      const response = await fetch(`${ROOT_URL}/api/admin/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await response.json()
      if (!response.ok) {
        window.alert(data.message || 'Failed to delete booking.')
        return
      }
      await loadSummary()
    } catch {
      window.alert('Could not connect to backend.')
    }
  }

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm('Are you sure you want to delete this payment?')) return
    try {
      const response = await fetch(`${ROOT_URL}/api/admin/payments/${paymentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await response.json()
      if (!response.ok) {
        window.alert(data.message || 'Failed to delete payment.')
        return
      }
      await loadSummary()
    } catch {
      window.alert('Could not connect to backend.')
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return
    try {
      const response = await fetch(`${ROOT_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await response.json()
      if (!response.ok) {
        window.alert(data.message || 'Failed to delete user.')
        return
      }
      await loadSummary()
    } catch {
      window.alert('Could not connect to backend.')
    }
  }

  const handleDeleteAllUsers = async () => {
    if (!window.confirm('Are you SURE you want to delete ALL users? This action cannot be undone.')) return
    try {
      const response = await fetch(`${ROOT_URL}/api/admin/users`, { method: 'DELETE' })
      const data = await response.json()
      if (!response.ok) {
        window.alert(data.message || 'Failed to delete all users.')
        return
      }
      await loadSummary()
    } catch {
      window.alert('Could not connect to backend.')
    }
  }

  const handleDeleteAllPayments = async () => {
    if (!window.confirm('Are you SURE you want to delete ALL payments? This action cannot be undone.')) return
    try {
      const response = await fetch(`${ROOT_URL}/api/admin/payments`, { method: 'DELETE' })
      const data = await response.json()
      if (!response.ok) {
        window.alert(data.message || 'Failed to delete all payments.')
        return
      }
      await loadSummary()
    } catch {
      window.alert('Could not connect to backend.')
    }
  }

  const handleDeleteAllBookings = async () => {
    if (!window.confirm('Are you SURE you want to delete ALL bookings? This action cannot be undone.')) return
    try {
      const response = await fetch(`${ROOT_URL}/api/admin/bookings`, { method: 'DELETE' })
      const data = await response.json()
      if (!response.ok) {
        window.alert(data.message || 'Failed to delete all bookings.')
        return
      }
      await loadSummary()
    } catch {
      window.alert('Could not connect to backend.')
    }
  }

  const activeUsers = (liveData?.users || users || []).filter(Boolean)
  const activePayments = (liveData?.payments || paymentDetails || []).filter(Boolean)
  const activeBookings = (liveData?.bookings || bookingSlots || []).filter(Boolean)
  const activeServices = liveData?.services || []

  const totalPayments = activePayments.reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const pendingPayments = activePayments.filter((item) => item.status === 'Pending').length
  const paidPayments = activePayments.filter((item) => item.status === 'Paid').length
  const confirmedBookings = activeBookings.filter((item) => item.status === 'Confirmed').length
  const inProgressBookings = activeBookings.filter((item) => item.status === 'In Progress').length
  const totalRevenue = activePayments
    .filter((item) => item.status === 'Paid')
    .reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const completionRate = activeBookings.length
    ? Math.round((confirmedBookings / activeBookings.length) * 100)
    : 0

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-10 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-amber-300">Operations Dashboard</p>
            <h1 className="mt-2 text-3xl font-semibold">Salon Operations Panel</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={`${ROOT_URL}/api/admin/export`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm text-neutral-200 hover:border-amber-300 hover:text-amber-300"
            >
              Export Backup
            </a>
            <button
              onClick={loadSummary}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm text-neutral-200 hover:border-amber-300 hover:text-amber-300"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={logoutAdmin}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm text-neutral-200 hover:border-amber-300 hover:text-amber-300"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-white/10 bg-neutral-900 p-5">
            <p className="flex items-center gap-2 text-sm text-neutral-300">
              <Users size={16} className="text-amber-300" />
              Total Users
            </p>
            <p className="mt-2 text-3xl font-semibold">{activeUsers.length}</p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-neutral-900 p-5">
            <p className="flex items-center gap-2 text-sm text-neutral-300">
              <CreditCard size={16} className="text-amber-300" />
              Total Payments
            </p>
            <p className="mt-2 text-3xl font-semibold">${totalPayments}</p>
            <p className="mt-1 text-xs text-neutral-400">
              Paid: {paidPayments} | Pending: {pendingPayments}
            </p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-neutral-900 p-5">
            <p className="flex items-center gap-2 text-sm text-neutral-300">
              <CalendarClock size={16} className="text-amber-300" />
              Booking Slots
            </p>
            <p className="mt-2 text-3xl font-semibold">{activeBookings.length}</p>
            <p className="mt-1 text-xs text-neutral-400">Confirmed: {confirmedBookings}</p>
          </article>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-4">
          <article className="rounded-2xl border border-white/10 bg-neutral-900 p-5">
            <p className="text-xs uppercase tracking-wider text-neutral-400">Overall Revenue</p>
            <p className="mt-2 text-2xl font-semibold text-amber-300">${totalRevenue}</p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-neutral-900 p-5">
            <p className="text-xs uppercase tracking-wider text-neutral-400">Booking Completion</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-300">{completionRate}%</p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-neutral-900 p-5">
            <p className="text-xs uppercase tracking-wider text-neutral-400">In Progress Slots</p>
            <p className="mt-2 text-2xl font-semibold text-blue-300">{inProgressBookings}</p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-neutral-900 p-5">
            <p className="text-xs uppercase tracking-wider text-neutral-400">Pending Payments</p>
            <p className="mt-2 text-2xl font-semibold text-amber-300">{pendingPayments}</p>
          </article>
        </section>

        <section className="mt-8 rounded-2xl border border-white/10 bg-neutral-900 p-5">
          <h2 className="text-xl font-semibold text-amber-300">Manage Services</h2>
          <form onSubmit={handleCreateService} className="mt-4 grid gap-4 md:grid-cols-3">
            <input
              type="text"
              placeholder="Service Title"
              value={newService.title}
              onChange={(e) => setNewService({ ...newService, title: e.target.value })}
              className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-amber-300 text-white"
              required
            />
            <input
              type="text"
              placeholder="Price (e.g. $50)"
              value={newService.price}
              onChange={(e) => setNewService({ ...newService, price: e.target.value })}
              className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-amber-300 text-white"
            />
            <input
              type="text"
              placeholder="Duration (e.g. 45 min)"
              value={newService.duration}
              onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
              className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-amber-300 text-white"
            />
            <input
              type="text"
              placeholder="Image URL"
              value={newService.image}
              onChange={(e) => setNewService({ ...newService, image: e.target.value })}
              className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-amber-300 text-white"
              required
            />
            <select
              value={newService.category}
              onChange={(e) => setNewService({ ...newService, category: e.target.value })}
              className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-amber-300 text-white"
            >
              <option value="Hair">Hair</option>
              <option value="Beauty">Beauty</option>
              <option value="Laser">Laser</option>
              <option value="Grooming">Grooming</option>
            </select>
            <button type="submit" className="rounded-lg bg-amber-300 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-200">
              Add Service
            </button>
            <textarea
              placeholder="Short Description"
              value={newService.description}
              onChange={(e) => setNewService({ ...newService, description: e.target.value })}
              className="col-span-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-amber-300 text-white"
              rows={2}
              required
            />
          </form>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-neutral-400">
                <tr>
                  <th className="py-2 pr-4">Service</th>
                  <th className="py-2 pr-4">Category</th>
                  <th className="py-2 pr-4">Price</th>
                  <th className="py-2 pr-4">Duration</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeServices.map((service) => (
                  <tr key={service.id} className="border-t border-white/10">
                    <td className="py-2 pr-4 font-medium">{service.title}</td>
                    <td className="py-2 pr-4 text-neutral-400">{service.category}</td>
                    <td className="py-2 pr-4 text-amber-300">{service.price}</td>
                    <td className="py-2 pr-4 text-neutral-400">{service.duration}</td>
                    <td className="py-2 pr-4">
                      <button
                        onClick={() => handleDeleteService(service.id)}
                        className="rounded-md border border-red-500/40 px-2 py-1 text-xs text-red-300 hover:bg-red-500/10"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-white/10 bg-neutral-900 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-amber-300">User Details</h2>
            {activeUsers.length > 0 && (
              <button
                onClick={handleDeleteAllUsers}
                className="rounded-xl border border-red-500/40 px-4 py-2 text-sm text-red-300 hover:bg-red-500/10"
              >
                Delete All Users
              </button>
            )}
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-neutral-400">
                <tr>
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Phone</th>
                  <th className="py-2 pr-4">Registered On</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeUsers.length ? (
                  activeUsers.map((user) => (
                    <tr key={user.id} className="border-t border-white/10">
                      <td className="py-2 pr-4">{user.name}</td>
                      <td className="py-2 pr-4">{user.email}</td>
                      <td className="py-2 pr-4">{user.phone || '-'}</td>
                      <td className="py-2 pr-4">
                        {user.registeredAt ? new Date(user.registeredAt).toLocaleString() : '-'}
                      </td>
                      <td className="py-2 pr-4">
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="rounded-md border border-red-500/40 px-2 py-1 text-xs text-red-300 hover:bg-red-500/10"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-3 text-neutral-400" colSpan={5}>
                      No registered users yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-white/10 bg-neutral-900 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-amber-300">Payment Details</h2>
            {activePayments.length > 0 && (
              <button
                onClick={handleDeleteAllPayments}
                className="rounded-xl border border-red-500/40 px-4 py-2 text-sm text-red-300 hover:bg-red-500/10"
              >
                Delete All Payments
              </button>
            )}
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-neutral-400">
                <tr>
                  <th className="py-2 pr-4">Payment ID</th>
                  <th className="py-2 pr-4">Customer</th>
                  <th className="py-2 pr-4">Service</th>
                  <th className="py-2 pr-4">Amount</th>
                  <th className="py-2 pr-4">Method</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {activePayments.map((payment) => (
                  <tr key={payment.id} className="border-t border-white/10">
                    <td className="py-2 pr-4">{payment.id}</td>
                    <td className="py-2 pr-4">{payment.customer}</td>
                    <td className="py-2 pr-4">{payment.service}</td>
                    <td className="py-2 pr-4">${payment.amount}</td>
                    <td className="py-2 pr-4">{payment.method}</td>
                    <td className="py-2 pr-4">
                      <span className={`rounded-full px-2 py-1 text-xs ${getStatusPill(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="py-2 pr-4">{payment.date}</td>
                    <td className="py-2 pr-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePaymentStatusUpdate(payment.id, 'Paid')}
                          className="rounded-md border border-emerald-500/40 px-2 py-1 text-xs text-emerald-300 hover:bg-emerald-500/10"
                        >
                          Mark Paid
                        </button>
                        <button
                          onClick={() => handlePaymentStatusUpdate(payment.id, 'Pending')}
                          className="rounded-md border border-amber-500/40 px-2 py-1 text-xs text-amber-300 hover:bg-amber-500/10"
                        >
                          Mark Pending
                        </button>
                        <button
                          onClick={() => handleDeletePayment(payment.id)}
                          className="rounded-md border border-red-500/40 px-2 py-1 text-xs text-red-300 hover:bg-red-500/10"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-white/10 bg-neutral-900 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-amber-300">Booking Slot Details</h2>
            {activeBookings.length > 0 && (
              <button
                onClick={handleDeleteAllBookings}
                className="rounded-xl border border-red-500/40 px-4 py-2 text-sm text-red-300 hover:bg-red-500/10"
              >
                Delete All Bookings
              </button>
            )}
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-neutral-400">
                <tr>
                  <th className="py-2 pr-4">Booking ID</th>
                  <th className="py-2 pr-4">Customer</th>
                  <th className="py-2 pr-4">Service</th>
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Slot</th>
                  <th className="py-2 pr-4">Specialist</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeBookings.map((booking) => (
                  <tr key={booking.id} className="border-t border-white/10">
                    <td className="py-2 pr-4">{booking.id}</td>
                    <td className="py-2 pr-4">{booking.customer}</td>
                    <td className="py-2 pr-4">{booking.service}</td>
                    <td className="py-2 pr-4">{booking.date}</td>
                    <td className="py-2 pr-4">{booking.slot}</td>
                    <td className="py-2 pr-4">{booking.specialist}</td>
                    <td className="py-2 pr-4">
                      <span className={`rounded-full px-2 py-1 text-xs ${getStatusPill(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="py-2 pr-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleBookingStatusUpdate(booking.id, 'Confirmed')}
                          className="rounded-md border border-emerald-500/40 px-2 py-1 text-xs text-emerald-300 hover:bg-emerald-500/10"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => handleBookingStatusUpdate(booking.id, 'In Progress')}
                          className="rounded-md border border-blue-500/40 px-2 py-1 text-xs text-blue-300 hover:bg-blue-500/10"
                        >
                          In Progress
                        </button>
                        <button
                          onClick={() => handleDeleteBooking(booking.id)}
                          className="rounded-md border border-red-500/40 px-2 py-1 text-xs text-red-300 hover:bg-red-500/10"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}

export default AdminDashboardPage
