import { BadgeCheck, HeartHandshake, ShieldCheck, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import SectionHeading from './SectionHeading'
import { features } from '../data/content'

const iconMap = { Sparkles, BadgeCheck, HeartHandshake, ShieldCheck }

function WhyChooseUs() {
  return (
    <section className="bg-neutral-900/70 px-6 py-20 md:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Why Choose Us"
          title="Beautiful Results with Trusted Care"
          description="Our salon combines elegant hospitality, skilled professionals, and modern tools for an elevated experience."
        />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = iconMap[feature.icon]
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="rounded-2xl border border-white/10 bg-black/40 p-6 shadow-lg transition hover:-translate-y-1 hover:border-amber-300/50"
              >
                <Icon className="text-amber-300" size={28} />
                <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-neutral-300">{feature.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default WhyChooseUs
