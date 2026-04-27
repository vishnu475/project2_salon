import { motion } from 'framer-motion'
import { ShieldCheck, Scissors, Sparkles } from 'lucide-react'
import SectionHeading from './SectionHeading'
import { menHighlights } from '../data/content'

const icons = [Scissors, ShieldCheck, Sparkles]

function MenGrooming() {
  return (
    <section className="bg-neutral-900/70 px-6 py-20 md:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Boys & Men"
          title="Dedicated Grooming for Boys and Men"
          description="We now include modern male grooming needs, from school cuts to professional beard and scalp care routines."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {menHighlights.map((item, index) => {
            const Icon = icons[index % icons.length]
            return (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="rounded-2xl border border-white/10 bg-black/35 p-6 shadow-lg"
              >
                <Icon className="text-amber-300" size={24} />
                <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-neutral-300">{item.description}</p>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default MenGrooming
