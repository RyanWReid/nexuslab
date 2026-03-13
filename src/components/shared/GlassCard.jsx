import { cn } from '@/lib/utils'

export default function GlassCard({ children, className, hover = true, glow = false, ...props }) {
  return (
    <div
      className={cn(
        'glass rounded-xl p-4',
        hover && 'glass-hover cursor-default transition-all duration-200',
        glow && 'glow-accent',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
