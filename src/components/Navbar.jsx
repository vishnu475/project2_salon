import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, Scissors } from 'lucide-react'
import { motion } from 'framer-motion'
import { navItems } from '../data/content'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { isAuthenticated, currentUser, logout } = useAuth()

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-8">
        <a href="/" className="flex items-center gap-2 text-xl font-semibold tracking-wide text-white">
          <Scissors className="text-amber-300" size={20} />
          Salon Luxe
        </a>
        <ul className="hidden items-center gap-7 text-sm text-neutral-200 md:flex">
          {navItems.map((item) => (
            <li key={item}>
              <a href={`/#${item.toLowerCase()}`} className="transition hover:text-amber-300">
                {item}
              </a>
            </li>
          ))}
          <li>
            <Link
              to="/admin/login"
              className="rounded-full border border-amber-300/60 bg-amber-300/10 px-4 py-2 text-xs font-semibold text-amber-300 transition hover:bg-amber-300 hover:text-black"
            >
              Admin
            </Link>
          </li>
        </ul>
        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <Link
                to="/account"
                className="rounded-full border border-white/30 px-4 py-2 text-xs font-semibold text-white transition hover:border-amber-300 hover:text-amber-300"
              >
                My Account
              </Link>
              <span className="text-sm text-neutral-200">Hi, {currentUser.name.split(' ')[0]}</span>
              <button
                type="button"
                onClick={logout}
                className="rounded-full border border-white/30 px-4 py-2 text-xs font-semibold text-white transition hover:border-amber-300 hover:text-amber-300"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full border border-white/30 px-4 py-2 text-xs font-semibold text-white transition hover:border-amber-300 hover:text-amber-300"
              >
                Login
              </Link>
              <Link to="/register" className="rounded-full bg-amber-300 px-4 py-2 text-xs font-semibold text-black transition hover:bg-amber-200">
                Register
              </Link>
            </>
          )}
        </div>
        <button
          className="text-white md:hidden"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {isOpen && (
        <motion.ul
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="space-y-2 border-t border-white/10 bg-neutral-950 px-6 py-4 md:hidden"
        >
          {navItems.map((item) => (
            <li key={item}>
              <a
                href={`/#${item.toLowerCase()}`}
                className="block rounded-lg px-3 py-2 text-neutral-200 transition hover:bg-white/10 hover:text-amber-300"
                onClick={() => setIsOpen(false)}
              >
                {item}
              </a>
            </li>
          ))}
          <li>
            <Link
              to="/admin/login"
              onClick={() => setIsOpen(false)}
              className="block rounded-lg border border-amber-300/60 bg-amber-300/10 px-3 py-2 text-center font-semibold text-amber-300 transition hover:bg-amber-300 hover:text-black"
            >
              Admin
            </Link>
          </li>
          <li>
            {isAuthenticated ? (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/account"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg border border-white/20 px-3 py-2 text-center text-neutral-200 transition hover:border-amber-300 hover:text-amber-300"
                >
                  My Account
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout()
                    setIsOpen(false)
                  }}
                  className="block w-full rounded-lg border border-white/20 px-3 py-2 text-left text-neutral-200 transition hover:border-amber-300 hover:text-amber-300"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg border border-white/20 px-3 py-2 text-center text-neutral-200 transition hover:border-amber-300 hover:text-amber-300"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg bg-amber-300 px-3 py-2 text-center font-semibold text-black transition hover:bg-amber-200"
                >
                  Register
                </Link>
              </div>
            )}
          </li>
        </motion.ul>
      )}
    </header>
  )
}

export default Navbar
