import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function AccountPage() {
  const { currentUser } = useAuth()

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 py-12 text-white">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-black/45 p-8 shadow-xl backdrop-blur-sm">
        <p className="text-xs uppercase tracking-[0.25em] text-amber-300">My Account</p>
        <h1 className="mt-3 text-3xl font-semibold">Welcome, {currentUser?.name}</h1>
        <p className="mt-2 text-sm text-neutral-300">Your profile is secured with login authentication access.</p>

        <div className="mt-6 grid gap-4 rounded-2xl border border-white/10 bg-neutral-900 p-5 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wider text-neutral-400">Name</p>
            <p className="mt-1 text-sm">{currentUser?.name || '-'}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-neutral-400">Email</p>
            <p className="mt-1 text-sm">{currentUser?.email || '-'}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/"
            className="rounded-full border border-white/30 px-4 py-2 text-xs font-semibold text-white transition hover:border-amber-300 hover:text-amber-300"
          >
            Back to Home
          </Link>
          <Link
            to="/services/hair"
            className="rounded-full bg-amber-300 px-4 py-2 text-xs font-semibold text-black transition hover:bg-amber-200"
          >
            Explore Services
          </Link>
        </div>
      </div>
    </main>
  )
}

export default AccountPage
