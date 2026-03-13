import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export default function UptimeBar({ segments = 30, uptime = 99.9 }) {
  // Generate mock uptime segments (will be real data later)
  const bars = Array.from({ length: segments }, (_, i) => {
    const rand = Math.random()
    if (rand > 0.97) return 'down'
    if (rand > 0.93) return 'degraded'
    return 'up'
  })

  return (
    <div className="space-y-1.5">
      <div className="flex gap-[2px]">
        {bars.map((status, i) => (
          <motion.div
            key={i}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: i * 0.02, duration: 0.2 }}
            className={cn(
              'flex-1 h-5 rounded-sm origin-bottom',
              status === 'up' && 'bg-status-online/60 hover:bg-status-online/80',
              status === 'degraded' && 'bg-status-warning/60 hover:bg-status-warning/80',
              status === 'down' && 'bg-status-offline/60 hover:bg-status-offline/80'
            )}
            title={`${segments - i} days ago`}
          />
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-text-muted">
        <span>{segments}d ago</span>
        <span className="text-text-secondary">{uptime.toFixed(1)}% uptime</span>
        <span>Now</span>
      </div>
    </div>
  )
}
