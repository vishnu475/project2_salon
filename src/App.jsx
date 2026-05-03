import Navbar from './components/Navbar'
import Hero from './components/Hero'
import AboutMatters from './components/AboutMatters'
import Services from './components/Services'
import WhyChooseUs from './components/WhyChooseUs'
import LiveServices from './components/LiveServices'
import MenGrooming from './components/MenGrooming'
import Pricing from './components/Pricing'
import Testimonials from './components/Testimonials'
import Blog from './components/Blog'
import Booking from './components/Booking'
import Footer from './components/Footer'
import AIChatbot from './components/AIChatbot'
import AIMakeover from './components/AIMakeover'

import { ArrowUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function App() {
  const [showScroll, setShowScroll] = useState(false)

  useEffect(() => {
    const checkScroll = () => {
      if (window.scrollY > 400) setShowScroll(true)
      else setShowScroll(false)
    }
    window.addEventListener('scroll', checkScroll)
    return () => window.removeEventListener('scroll', checkScroll)
  }, [])

  return (
    <div className="relative bg-neutral-950 text-white selection:bg-amber-300 selection:text-black">
      <Navbar />
      <Hero />
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        <AboutMatters />
        <Services />
        <WhyChooseUs />
        <LiveServices />
        <MenGrooming />
        <Pricing />
        <Testimonials />
        <Blog />
        <Booking />
      </motion.div>
      <Footer />
      <AIChatbot />
      <AIMakeover />

      <AnimatePresence>
        {showScroll && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-8 right-8 z-[60] flex h-12 w-12 items-center justify-center rounded-full bg-amber-300 text-black shadow-2xl transition hover:bg-amber-200"
          >
            <ArrowUp size={24} strokeWidth={2.5} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
