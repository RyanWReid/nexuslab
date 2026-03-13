import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Terminal, ChevronDown } from 'lucide-react'
import GlassCard from '@/components/shared/GlassCard'
import { config } from '@/data/homelab'

const mockLogLines = [
  { ts: '12:34:01', level: 'info', service: 'proxmox', msg: 'VM 203 health check passed' },
  { ts: '12:34:05', level: 'info', service: 'n8n', msg: 'Workflow "Daily Backup" completed successfully' },
  { ts: '12:34:12', level: 'warn', service: 'npm', msg: 'SSL certificate for lab.local expires in 14 days' },
  { ts: '12:34:18', level: 'info', service: 'coolify', msg: 'Deployment nexuslab-prod completed in 42s' },
  { ts: '12:34:22', level: 'info', service: 'claudeclaw', msg: 'Heartbeat OK - all systems nominal' },
  { ts: '12:34:30', level: 'error', service: 'forgejo', msg: 'Git push rejected: branch protection rule violated' },
  { ts: '12:34:35', level: 'info', service: 'proxmox', msg: 'CT 110 resource usage: CPU 8%, RAM 45%' },
  { ts: '12:34:41', level: 'info', service: 'opnsense', msg: 'Firewall rule updated: allow TCP/3100 from Tailscale' },
  { ts: '12:34:48', level: 'warn', service: 'proxmox', msg: 'Storage local-lvm usage at 78%' },
  { ts: '12:34:55', level: 'info', service: 'n8n', msg: 'Webhook received: GitHub push event' },
  { ts: '12:35:02', level: 'info', service: 'claudeclaw', msg: 'Telegram command received from user 7847797281' },
  { ts: '12:35:10', level: 'info', service: 'homepage', msg: 'Config reload: services.yaml updated' },
  { ts: '12:35:15', level: 'error', service: 'coolify', msg: 'Build failed: nexuslab-staging - missing env vars' },
  { ts: '12:35:22', level: 'info', service: 'proxmox', msg: 'Backup job started for VM 200' },
  { ts: '12:35:30', level: 'info', service: 'npm', msg: 'Proxy host n8n.lab.local → 192.168.8.110:5678 OK' },
]

const levelColors = {
  info: 'text-text-secondary',
  warn: 'text-status-warning',
  error: 'text-status-offline',
}

const levelBg = {
  info: 'bg-transparent',
  warn: 'bg-status-warning/5',
  error: 'bg-status-offline/5',
}

export default function Logs() {
  const [filter, setFilter] = useState('all')
  const [logs, setLogs] = useState(mockLogLines)
  const scrollRef = useRef(null)

  const services = ['all', ...new Set(config.services.map(s => s.id))]

  const filtered = filter === 'all'
    ? logs
    : logs.filter(l => l.service === filter)

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [filtered])

  // Simulate new logs
  useEffect(() => {
    const interval = setInterval(() => {
      const line = mockLogLines[Math.floor(Math.random() * mockLogLines.length)]
      const now = new Date()
      setLogs(prev => [
        ...prev.slice(-100),
        { ...line, ts: now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) },
      ])
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Logs</h1>
        <p className="text-sm text-text-secondary mt-0.5">Live event feed across all services</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {services.map(svc => (
          <button
            key={svc}
            onClick={() => setFilter(svc)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === svc
                ? 'bg-accent/15 text-accent border border-accent/20'
                : 'bg-white/[0.03] text-text-secondary border border-border-primary hover:border-border-glow'
            }`}
          >
            {svc === 'all' ? 'All' : svc}
          </button>
        ))}
      </div>

      {/* Log viewer */}
      <GlassCard className="p-0" hover={false}>
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border-primary">
          <Terminal size={14} className="text-accent" />
          <span className="text-xs text-text-secondary font-mono">live feed</span>
          <span className="text-xs text-text-muted ml-auto">{filtered.length} entries</span>
        </div>
        <div
          ref={scrollRef}
          className="h-[500px] overflow-y-auto font-mono text-xs p-2 space-y-0"
        >
          {filtered.map((log, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex gap-3 px-3 py-1.5 rounded hover:bg-white/[0.02] ${levelBg[log.level]}`}
            >
              <span className="text-text-muted tabular-nums w-16 flex-shrink-0">{log.ts}</span>
              <span className={`w-10 flex-shrink-0 uppercase font-semibold ${levelColors[log.level]}`}>
                {log.level}
              </span>
              <span className="text-accent/70 w-24 flex-shrink-0 truncate">{log.service}</span>
              <span className="text-text-secondary">{log.msg}</span>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </motion.div>
  )
}
