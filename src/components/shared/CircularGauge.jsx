import { motion } from 'framer-motion'

export default function CircularGauge({ value, max = 100, label, unit = '%', size = 100, strokeWidth = 6 }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(value / max, 1)
  const offset = circumference * (1 - progress)

  const getColor = (pct) => {
    if (pct > 0.9) return '#ef4444'
    if (pct > 0.75) return '#f59e0b'
    return '#2dd4bf'
  }

  const color = getColor(progress)

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background track */}
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-semibold text-text-primary tabular-nums">
            {Math.round(value)}
          </span>
          <span className="text-[10px] text-text-muted uppercase">{unit}</span>
        </div>
      </div>
      {label && <span className="text-xs text-text-secondary">{label}</span>}
    </div>
  )
}
