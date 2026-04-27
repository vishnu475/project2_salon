import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import SectionHeading from './SectionHeading'
import { testimonials } from '../data/content'

function Testimonials() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length)
    }, 4500)
    return () => clearInterval(id)
  }, [])

  return (
    <section className="bg-neutral-900/70 px-6 py-20 md:px-8">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          eyebrow="Testimonials"
          title="What Our Clients Say"
          description="Real stories from clients who trust us for consistent and premium results."
        />
        <motion.div
          key={testimonials[index].name}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-white/10 bg-black/40 p-8 text-center shadow-lg"
        >
          <div className="mb-4 flex justify-center gap-1 text-amber-300">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={18} fill="currentColor" />
            ))}
          </div>
          <p className="text-lg text-neutral-200">"{testimonials[index].review}"</p>
          <p className="mt-4 text-sm font-semibold tracking-wide text-amber-300">{testimonials[index].name}</p>
        </motion.div>
      </div>
    </section>
  )
}

export default Testimonials
