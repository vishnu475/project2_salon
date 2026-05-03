import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import SectionHeading from './SectionHeading'
import { serviceDetails, services } from '../data/content'
import { ROOT_URL } from '../config'

function Services() {
  const [dbServices, setDbServices] = useState([])
  const [sampleTick, setSampleTick] = useState(0)

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch(`${ROOT_URL}/api/services`)
        const data = await response.json()
        if (data.services) setDbServices(data.services)
      } catch (err) {
        console.error('Failed to fetch dynamic services', err)
      }
    }
    fetchServices()

    const id = setInterval(() => {
      setSampleTick((prev) => prev + 1)
    }, 2800)
    return () => clearInterval(id)
  }, [])

  const displayServices = dbServices.length > 0 ? dbServices : services

  return (
    <section id="services" className="mx-auto max-w-7xl px-6 py-20 md:px-8">
      <SectionHeading
        eyebrow="Our Services"
        title="Luxury Treatments Crafted for You"
        description="From precision hair styling to skin rejuvenation, discover services tailored to your beauty goals."
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {displayServices.map((service, index) => {
          // Use DB values or fallback to static detail object
          const detail = serviceDetails[service.slug] || {
            brief: service.brief,
            sampleImages: [],
          }
          const sampleImages = detail?.sampleImages?.length ? detail.sampleImages : [service.image]
          const liveSample = sampleImages[sampleTick % sampleImages.length]

          return (
            <motion.article
              key={service.slug}
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute left-3 top-3 rounded-full bg-amber-300/20 px-2 py-1 text-[11px] font-medium text-amber-300 backdrop-blur-md border border-amber-300/30">
                  Dynamic Sample
                </span>
                {service.price && (
                  <span className="absolute bottom-3 right-3 rounded-lg bg-black/50 px-3 py-1 text-sm font-semibold text-white backdrop-blur-md border border-white/10">
                    Starting {service.price}
                  </span>
                )}
              </div>
              <div className="p-6 [transform:translateZ(24px)]">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{service.title}</h3>
                  <span className="text-[10px] uppercase tracking-widest text-neutral-500">{service.category || 'Luxury'}</span>
                </div>
                <p className="mt-2 text-sm text-neutral-300 line-clamp-2">{service.description}</p>
                <p className="mt-2 text-xs italic text-neutral-500">{detail?.brief?.slice(0, 85)}...</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <Link
                    to={`/services/${service.slug}`}
                    className="flex-1 text-center rounded-full border border-amber-300/50 px-4 py-2 text-sm text-amber-300 transition hover:bg-amber-300 hover:text-black"
                  >
                    Learn More
                  </Link>
                  <Link
                    to={`/book?service=${encodeURIComponent(service.title)}`}
                    className="flex-1 text-center rounded-full bg-amber-300 px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-200"
                  >
                    Book
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
