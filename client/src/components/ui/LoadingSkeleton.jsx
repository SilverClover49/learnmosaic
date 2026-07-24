import { motion } from 'framer-motion'

export function SkeletonLine({ width = '100%', height = '1rem', className = '' }) {
  return (
    <div
      className={`bg-[var(--surface-alt)] animate-pulse ${className}`}
      style={{ width, height, borderRadius: 0 }}
    />
  )
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`p-[2px] ${className}`} style={{ background: 'var(--glass-border)' }}>
      <div className="rounded-[calc(var(--radius-xl)-2px)] bg-[var(--surface)] p-6 space-y-4">
        <SkeletonLine width="40%" height="0.75rem" />
        <SkeletonLine width="80%" height="1.5rem" />
        <SkeletonLine width="60%" height="0.75rem" />
        <div className="flex gap-2 pt-2">
          <SkeletonLine width="4rem" height="1.5rem" />
          <SkeletonLine width="4rem" height="1.5rem" />
        </div>
      </div>
    </div>
  )
}

export function ChatSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {[1, 2, 3].map(i => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className="max-w-[70%] p-4 bg-[var(--surface)] border-[2px] border-[var(--bauhaus-black)]"
            style={{ borderRadius: i % 2 === 0 ? '20px 20px 4px 20px' : '20px 20px 20px 4px' }}
          >
            <SkeletonLine width="100%" height="0.75rem" className="mb-2" />
            <SkeletonLine width="85%" height="0.75rem" className="mb-2" />
            <SkeletonLine width="60%" height="0.75rem" />
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
      {[1, 2, 3].map(i => (
        <div
          key={i}
          className="h-48 bg-[var(--surface)] border-[2px] border-[var(--bauhaus-black)] animate-pulse relative overflow-hidden"
        >
          <div className="absolute inset-0 animate-shimmer" />
        </div>
      ))}
    </div>
  )
}

export default SkeletonCard
