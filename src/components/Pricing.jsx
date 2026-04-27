import { motion } from 'framer-motion'
import SectionHeading from './SectionHeading'
import { pricing } from '../data/content'

function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-6 py-20 md:px-8">
      <SectionHeading
        eyebrow="Pricing"
        title="Transparent Packages, Premium Service"
        description="Choose from curated service categories with clear pricing and estimated duration."
      />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Object.entries(pricing).map(([category, plans], index) => (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: index * 0.07 }}
            className="rounded-2xl border border-white/10 bg-neutral-900 p-6 shadow-lg"
          >
            <h3 className="mb-4 text-2xl font-semibold text-amber-300">{category}</h3>
            <div className="space-y-3">
              {plans.map((plan) => (
                <div key={plan.name} className="rounded-xl bg-black/30 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{plan.name}</span>
                    <span className="font-semibold text-amber-300">{plan.price}</span>
                  </div>
                  <p className="mt-1 text-xs text-neutral-400">{plan.duration}</p>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export default Pricing
