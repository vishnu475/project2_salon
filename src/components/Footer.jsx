import { Globe, Sparkles, Send, Phone, Mail, MapPin } from 'lucide-react'

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black px-6 py-14 md:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
        <div>
          <h3 className="text-lg font-semibold text-white">Salon Luxe</h3>
          <p className="mt-3 text-sm text-neutral-400">
            Premium beauty destination for hair, skin, and wellness in a luxurious setting.
          </p>
        </div>
        <div className="space-y-2 text-sm text-neutral-300">
          <p className="flex items-center gap-2">
            <MapPin size={16} className="text-amber-300" />
            123 Beauty Street, London
          </p>
          <p className="flex items-center gap-2">
            <Phone size={16} className="text-amber-300" />
            +44 20 1234 5678
          </p>
          <p className="flex items-center gap-2">
            <Mail size={16} className="text-amber-300" />
            hello@salonluxe.com
          </p>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-amber-300">Newsletter</p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Your email"
              className="w-full rounded-lg border border-white/20 bg-neutral-900 px-3 py-2 text-sm outline-none ring-amber-300 focus:ring-2"
            />
            <button className="rounded-lg bg-amber-300 px-3 text-black transition hover:bg-amber-200">
              <Send size={16} />
            </button>
          </div>
          <div className="mt-4 flex gap-3 text-neutral-300">
            <a href="#" className="rounded-full bg-white/10 p-2 transition hover:bg-amber-300 hover:text-black">
              <Globe size={16} />
            </a>
            <a href="#" className="rounded-full bg-white/10 p-2 transition hover:bg-amber-300 hover:text-black">
              <Sparkles size={16} />
            </a>
          </div>
        </div>
      </div>
      <p className="mx-auto mt-8 max-w-7xl border-t border-white/10 pt-6 text-xs text-neutral-500">
        © {new Date().getFullYear()} Salon Luxe. All rights reserved.
      </p>
    </footer>
  )
}

export default Footer
