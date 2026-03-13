import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Bell, Sun, Moon, Command } from 'lucide-react'

export default function TopBar({ onOpenSearch, alerts = [] }) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const unreadAlerts = alerts.filter(a => !a.read).length

  return (
    <header className="h-14 glass border-b border-border-primary flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Search trigger */}
      <button
        onClick={onOpenSearch}
        className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-border-primary hover:border-border-glow transition-all group max-w-md w-80"
      >
        <Search size={15} className="text-text-muted group-hover:text-text-secondary transition-colors" />
        <span className="text-sm text-text-muted group-hover:text-text-secondary transition-colors">Search services, nodes...</span>
        <div className="ml-auto flex items-center gap-1 text-text-muted">
          <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] border border-border-primary font-mono">⌘</kbd>
          <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] border border-border-primary font-mono">K</kbd>
        </div>
      </button>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* Time */}
        <span className="text-sm text-text-secondary font-mono tabular-nums">
          {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Los_Angeles' })}
        </span>

        {/* Alerts */}
        <button className="relative p-2 rounded-lg hover:bg-white/[0.03] transition-colors">
          <Bell size={18} className="text-text-secondary" />
          {unreadAlerts > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-status-offline rounded-full text-[10px] font-bold flex items-center justify-center"
            >
              {unreadAlerts}
            </motion.span>
          )}
        </button>
      </div>
    </header>
  )
}
