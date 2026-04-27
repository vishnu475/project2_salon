import { Link, useParams } from 'react-router-dom'
import { CheckCircle2, ArrowLeft, Wrench, ShieldCheck } from 'lucide-react'
import { serviceDetails, services } from '../data/content'

function ServiceDetailsPage() {
  const { slug } = useParams()
  const service = services.find((item) => item.slug === slug)
  const details = serviceDetails[slug]

  if (!service || !details) {
    return (
      <div className="mx-auto min-h-screen max-w-4xl px-6 py-20 text-white">
        <h1 className="text-3xl font-semibold">Service not found</h1>
        <p className="mt-3 text-neutral-300">This service page is not available right now.</p>
        <Link to="/" className="mt-6 inline-flex items-center gap-2 text-amber-300 hover:text-amber-200">
          <ArrowLeft size={16} />
          Back to home
        </Link>
      </div>
    )
  }

  return (
    <main className="bg-neutral-950 text-white">
      <section className="mx-auto max-w-7xl px-6 py-14 md:px-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-amber-300 hover:text-amber-200">
          <ArrowLeft size={16} />
          Back to services
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h1 className="text-4xl font-semibold md:text-5xl">{service.title}</h1>
            <p className="mt-4 text-neutral-300">{details.brief}</p>
            <img src={service.image} alt={service.title} className="mt-6 h-72 w-full rounded-2xl object-cover" />
          </div>
          <div className="rounded-2xl border border-white/10 bg-neutral-900 p-6">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-amber-300">
              <Wrench size={20} />
              Tools We Use
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-neutral-200">
              {details.tools.map((tool) => (
                <li key={tool} className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-400" />
                  {tool}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-neutral-900 p-6 md:col-span-2">
            <h3 className="text-xl font-semibold text-amber-300">About This Service</h3>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-neutral-200">
              {details.about || details.brief}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-neutral-900 p-6">
            <h3 className="text-xl font-semibold text-amber-300">Benefits</h3>
            <ul className="mt-4 space-y-2 text-sm text-neutral-200">
              {details.benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-400" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-neutral-900 p-6">
            <h3 className="flex items-center gap-2 text-xl font-semibold text-amber-300">
              <ShieldCheck size={20} />
              Requirements
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-neutral-200">
              {details.requirements.map((rule) => (
                <li key={rule} className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-400" />
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>

      </section>
    </main>
  )
}

export default ServiceDetailsPage
