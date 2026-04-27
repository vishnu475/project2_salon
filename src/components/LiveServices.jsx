import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Clock3, CircleDot } from 'lucide-react'
import SectionHeading from './SectionHeading'
import { liveServiceUpdates, treatmentCatalog } from '../data/content'

function LiveServices() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 md:px-8">
      <SectionHeading
        eyebrow="Live Services"
        title="Real-Time Treatment Desk"
        description="A practical preview of real salon operations: active chairs, expected wait times, and treatment availability."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          className="rounded-2xl border border-white/10 bg-neutral-900 p-6 shadow-lg"
        >
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Today&apos;s Queue</h3>
            <div className="flex items-center gap-2 text-xs text-amber-300">
              <Clock3 size={14} />
              {now.toLocaleTimeString()}
            </div>
          </div>
          <div className="space-y-3">
            {liveServiceUpdates.map((item) => (
              <div key={item.service} className="rounded-xl bg-black/30 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">{item.service}</p>
                  <p className="text-xs text-amber-300">{item.waitTime}</p>
                </div>
                <p className="mt-1 flex items-center gap-2 text-xs text-neutral-400">
                  <CircleDot size={12} className="text-emerald-400" />
                  {item.status}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-white/10 bg-neutral-900 p-6 shadow-lg"
        >
          <h3 className="mb-5 text-lg font-semibold">Treatment Menu (Real-Life Use Cases)</h3>
          <div className="flex flex-wrap gap-2">
            {treatmentCatalog.map((treatment) => (
              <span
                key={treatment}
                className="rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 text-xs text-amber-200"
              >
                {treatment}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default LiveServices
