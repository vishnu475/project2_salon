import { motion } from 'framer-motion'
import SectionHeading from './SectionHeading'
import { blogPosts } from '../data/content'

function Blog() {
  return (
    <section id="blog" className="mx-auto max-w-7xl px-6 py-20 md:px-8">
      <SectionHeading
        eyebrow="Blog"
        title="Beauty Insights and Expert Tips"
        description="Stay informed with practical guides from our salon professionals."
      />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {blogPosts.map((post, index) => (
          <motion.article
            key={post.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ rotateX: 5, rotateY: 5, scale: 1.02 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: index * 0.07 }}
            style={{ transformStyle: 'preserve-3d' }}
            className="overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 shadow-lg [perspective:1000px]"
          >
            <motion.img
              src={post.image}
              alt={post.title}
              whileHover={{ z: 40, scale: 1.08 }}
              transition={{ duration: 0.35 }}
              className="h-52 w-full object-cover"
            />
            <div className="p-6 [transform:translateZ(20px)]">
              <p className="mb-3 inline-flex rounded-full bg-amber-300/15 px-3 py-1 text-xs font-medium text-amber-300">
                {post.category}
              </p>
              <h3 className="text-lg font-semibold">{post.title}</h3>
              <p className="mt-3 text-sm text-neutral-300">{post.preview}</p>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  )
}

export default Blog
