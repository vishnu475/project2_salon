import { motion } from 'framer-motion'

function SectionHeading({ eyebrow, title, description }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6 }}
      className="mx-auto mb-12 max-w-3xl text-center"
    >
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">{eyebrow}</p>
      <h2 className="mb-4 text-3xl font-semibold text-white md:text-4xl">{title}</h2>
      <p className="text-neutral-300">{description}</p>
    </motion.div>
  )
}

export default SectionHeading
