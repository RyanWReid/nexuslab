import { cn } from '@/lib/utils'

export default function StatusDot({ status = 'unknown', size = 'sm', pulse = true }) {
  const sizeClasses = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  }

  const colorClasses = {
    online: 'bg-status-online',
    offline: 'bg-status-offline',
    warning: 'bg-status-warning',
    unknown: 'bg-status-unknown',
  }

  return (
    <span
      className={cn(
        'rounded-full inline-block flex-shrink-0',
        sizeClasses[size],
        colorClasses[status],
        pulse && status === 'online' && 'status-pulse'
      )}
    />
  )
}
