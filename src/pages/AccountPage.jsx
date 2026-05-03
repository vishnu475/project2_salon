import { motion } from 'framer-motion'
import { Scissors, CheckCircle2, Calendar, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function AccountPage() {
  const { currentUser, bookingSlots } = useAuth()

  // Filter bookings for this specific user
  const myBookings = bookingSlots.filter(b => b.email === currentUser?.email)

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-20 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-amber-300">Member Portal</p>
            <h1 className="mt-3 text-4xl font-bold">Welcome back, {currentUser?.name.split(' ')[0]}</h1>
            <p className="mt-2 text-sm text-neutral-400">View your treatment history and manage your profile.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/" className="rounded-full border border-white/10 bg-white/5 px-6 py-2 text-xs font-semibold hover:bg-white/10 transition">
              Back to Home
            </Link>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-3xl border border-white/10 bg-neutral-900/50 p-8 backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-6">Profile Details</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-neutral-500">Full Name</p>
                  <p className="text-sm font-medium mt-1">{currentUser?.name}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-neutral-500">Email Address</p>
                  <p className="text-sm font-medium mt-1 truncate">{currentUser?.email}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-neutral-500">Phone</p>
                  <p className="text-sm font-medium mt-1">{currentUser?.phone}</p>
                </div>
                <div className="pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] uppercase tracking-widest text-amber-300 font-bold">Luxe Points</p>
                    <span className="text-lg font-bold text-white">{currentUser?.loyaltyPoints || 0}</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                    <div 
                      className="h-full bg-amber-300 transition-all duration-1000" 
                      style={{ width: `${Math.min(((currentUser?.loyaltyPoints || 0) % 100), 100)}%` }}
                    />
                  </div>
                  <p className="mt-2 text-[9px] text-neutral-500 italic">
                    {100 - ((currentUser?.loyaltyPoints || 0) % 100)} points until your next free treatment!
                  </p>
                </div>
              </div>
            </div>

            {/* Rewards Card */}
            <div className="rounded-3xl border border-white/10 bg-amber-300 p-6 text-black">
              <h4 className="text-sm font-bold uppercase tracking-widest mb-4">Luxe Rewards</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/10 text-xs font-bold">1</div>
                  <p className="text-xs font-medium">100 Pts: Free Scalp Detox</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/10 text-xs font-bold">2</div>
                  <p className="text-xs font-medium">250 Pts: 20% Off All Facials</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bookings & Gifts Section */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gift Card Redemption */}
            <div className="rounded-3xl border border-white/10 bg-neutral-900/50 p-6 backdrop-blur-sm">
              <h4 className="text-sm font-bold uppercase tracking-widest mb-4">Redeem Gift Card</h4>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  placeholder="Enter Code (e.g. LUXE-XXXXXX)" 
                  className="flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-amber-300"
                />
                <button className="rounded-xl bg-white/5 border border-white/10 px-6 py-3 text-xs font-bold hover:bg-white/10 transition">
                  Apply
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                My Bookings
                <span className="rounded-full bg-amber-300/10 px-2 py-0.5 text-[10px] text-amber-300 border border-amber-300/20">
                  {myBookings.length}
                </span>
              </h3>

              {myBookings.length > 0 ? (
                <div className="grid gap-6">
                  {myBookings.map((booking) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="overflow-hidden rounded-3xl border border-white/10 bg-neutral-900 p-1 shadow-xl"
                    >
                      <div className="bg-black/40 p-6 rounded-[calc(1.5rem-4px)]">
                        {/* Brand & Status */}
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-300/10 text-amber-300">
                              <Scissors size={16} />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest italic">Salon Luxe</span>
                          </div>
                          <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-bold text-emerald-500 border border-emerald-500/20">
                            <CheckCircle2 size={12} />
                            Confirmed
                          </div>
                        </div>

                        {/* Detail Table Style */}
                        <div className="space-y-3">
                          <div className="flex justify-between items-center border-b border-white/5 pb-2">
                            <span className="text-[10px] text-neutral-500 uppercase tracking-widest">Service</span>
                            <span className="text-sm font-semibold">{booking.service}</span>
                          </div>
                          <div className="flex justify-between items-center border-b border-white/5 pb-2">
                            <span className="text-[10px] text-neutral-500 uppercase tracking-widest">Schedule</span>
                            <span className="text-sm font-medium flex items-center gap-2">
                              <Calendar size={12} className="text-neutral-400" />
                              {booking.date}
                              <Clock size={12} className="text-neutral-400 ml-1" />
                              {booking.slot}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-neutral-500 uppercase tracking-widest">Booking ID</span>
                            <span className="text-[10px] font-mono text-neutral-400">{booking.id}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 py-20 text-center">
                  <div className="h-16 w-16 items-center justify-center rounded-full bg-white/5 text-neutral-600 flex mb-4">
                    <Calendar size={32} />
                  </div>
                  <h4 className="text-neutral-300 font-medium">No bookings yet</h4>
                  <p className="mt-1 text-xs text-neutral-500">Explore our services and book your first treatment.</p>
                  <Link to="/#services" className="mt-6 rounded-full bg-amber-300 px-6 py-2 text-xs font-bold text-black hover:bg-amber-200 transition">
                    Book a Session
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default AccountPage
