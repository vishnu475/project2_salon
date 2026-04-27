import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import SectionHeading from './SectionHeading'
import { serviceDetails, services } from '../data/content'

function Services() {
  const [sampleTick, setSampleTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setSampleTick((prev) => prev + 1)
    }, 2800)
    return () => clearInterval(id)
  }, [])

  return (
    <section id="services" className="mx-auto max-w-7xl px-6 py-20 md:px-8">
      <SectionHeading
        eyebrow="Our Services"
        title="Luxury Treatments Crafted for You"
        description="From precision hair styling to skin rejuvenation, discover services tailored to your beauty goals."
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {services.map((service, index) => {
          const detail = serviceDetails[service.slug]
          const sampleImages = detail?.sampleImages?.length ? detail.sampleImages : [service.image]
          const liveSample = sampleImages[sampleTick % sampleImages.length]

          return (
            <motion.article
              key={service.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ rotateX: 6, rotateY: -6, scale: 1.02 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              style={{ transformStyle: 'preserve-3d' }}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 shadow-lg [perspective:1000px]"
            >
              <div className="relative h-52 overflow-hidden">
                <motion.img
                  key={liveSample}
                  src={liveSample}
                  alt={`${service.title} live sample`}
                  initial={{ opacity: 0.4, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ z: 40, scale: 1.08 }}
                  transition={{ duration: 0.35 }}
                  className="h-full w-full object-cover transition duration-500"
                />
                <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2 py-1 text-[11px] text-amber-300">
                  Live sample
                </span>
              </div>
              <div className="p-6 [transform:translateZ(24px)]">
                <h3 className="text-xl font-semibold">{service.title}</h3>
                <p className="mt-2 text-sm text-neutral-300">{service.description}</p>
                <p className="mt-2 text-xs text-neutral-400">{detail?.brief?.slice(0, 85)}...</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link
                    to={`/services/${service.slug}`}
                    className="inline-flex rounded-full border border-amber-300/50 px-4 py-2 text-sm text-amber-300 transition hover:bg-amber-300 hover:text-black"
                  >
                    Learn More
                  </Link>
                  <Link
                    to={`/book?service=${encodeURIComponent(service.title)}`}
                    className="inline-flex rounded-full bg-amber-300 px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-200"
                  >
                    Book Slot
                  </Link>
                </div>
              </div>
            </motion.article>
          )
        })}
      </div>
    </section>
  )
}

export default Services
