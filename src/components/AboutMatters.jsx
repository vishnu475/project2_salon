import { motion } from 'framer-motion'
import SectionHeading from './SectionHeading'
import { aboutHighlights } from '../data/content'

function AboutMatters() {
  return (
    <section id="about" className="bg-neutral-900/70 px-6 py-20 md:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
        <div>
          <SectionHeading
            eyebrow="About Us"
            title="Where Luxury Meets Clinical Precision"
            description="Salon Luxe was built for modern clients who want both elegance and measurable beauty results. Every treatment starts with consultation, skin or hair mapping, and a curated service plan."
          />
          <p className="text-sm leading-7 text-neutral-300">
            We combine hospitality and high-performance treatment protocols so each visit feels comfortable yet
            effective. Our team continuously trains on global trends, product chemistry, and device safety standards.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {aboutHighlights.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className="rounded-2xl border border-white/10 bg-black/40 p-6 text-center shadow-lg"
            >
              <p className="text-3xl font-semibold text-amber-300">{item.value}</p>
              <p className="mt-2 text-sm text-neutral-300">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default AboutMatters
