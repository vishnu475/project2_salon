import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarCheck2, CircleCheckBig, Sparkles } from 'lucide-react'
import { heroSlides } from '../data/content'

function Hero() {
  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(id)
  }, [])

  const slide = heroSlides[activeSlide]

  return (
    <section id="home" className="relative min-h-[92vh] overflow-hidden">
      <div className="absolute inset-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="h-full w-full object-cover"
        >
          <source src="/assets/hero-bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-black/50" />
      </div>

      <div className="relative mx-auto grid min-h-[92vh] max-w-7xl items-center gap-10 px-6 py-20 md:px-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-300/10 px-4 py-2 text-xs font-medium tracking-wider text-amber-300"
          >
            <Sparkles size={14} />
            LUXURY CARE | DERMATOLOGY-INSPIRED PROTOCOLS
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl text-4xl font-semibold leading-tight md:text-6xl"
          >
            {slide.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1 }}
            className="mt-5 max-w-xl text-neutral-200"
          >
            {slide.subtitle}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="mt-8 flex flex-wrap gap-4"
          >
            <a
              href="#contact"
              className="rounded-full bg-amber-300 px-7 py-3 text-sm font-semibold text-black transition hover:bg-amber-200"
            >
              Book Now
            </a>
            <a
              href="#services"
              className="rounded-full border border-white/40 px-7 py-3 text-sm font-semibold transition hover:border-amber-300 hover:text-amber-300"
            >
              Explore Services
            </a>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.95, delay: 0.25 }}
            className="mt-8 grid max-w-xl grid-cols-3 gap-4 text-center"
          >
            <div className="rounded-xl border border-white/15 bg-black/30 px-3 py-4">
              <p className="text-xl font-semibold text-amber-300">18K+</p>
              <p className="text-xs text-neutral-300">Sessions</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-black/30 px-3 py-4">
              <p className="text-xl font-semibold text-amber-300">4.9/5</p>
              <p className="text-xs text-neutral-300">Rating</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-black/30 px-3 py-4">
              <p className="text-xl font-semibold text-amber-300">28</p>
              <p className="text-xs text-neutral-300">Experts</p>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="rounded-3xl border border-white/15 bg-black/45 p-6 backdrop-blur-sm"
        >
          <h3 className="text-lg font-semibold">Today&apos;s Signature Landing Offers</h3>
          <div className="mt-4 space-y-3 text-sm">
            <p className="flex items-center gap-2 text-neutral-200">
              <CircleCheckBig size={16} className="text-emerald-400" />
              50% off first treatment for new clients
            </p>
            <p className="flex items-center gap-2 text-neutral-200">
              <CircleCheckBig size={16} className="text-emerald-400" />
              Free skin analysis with premium facial booking
            </p>
            <p className="flex items-center gap-2 text-neutral-200">
              <CircleCheckBig size={16} className="text-emerald-400" />
              Bridal consultation slots open this week
            </p>
          </div>
          <a
            href="#pricing"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-amber-200"
          >
            <CalendarCheck2 size={16} />
            View Full Price List
          </a>
        </motion.div>
      </div>
    </section>
  )
}

export default Hero
