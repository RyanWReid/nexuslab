import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Server, Box, CheckCircle2, AlertTriangle,
  Cpu, MemoryStick, HardDrive, Thermometer,
  ExternalLink, ArrowUpRight, Clock
} from 'lucide-react'
import GlassCard from '@/components/shared/GlassCard'
import StatusDot from '@/components/shared/StatusDot'
import CircularGauge from '@/components/shared/CircularGauge'
import UptimeBar from '@/components/shared/UptimeBar'
import { config, getMockMetrics } from '@/data/homelab'
import { formatUptime } from '@/lib/utils'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState(getMockMetrics())

  useEffect(() => {
    const interval = setInterval(() => setMetrics(getMockMetrics()), 3000)
    return () => clearInterval(interval)
  }, [])

  const onlineServices = config.services.filter(s => s.status === 'online').length
  const totalVMs = config.nodes.filter(n => n.type === 'vm').length
  const totalCTs = config.nodes.filter(n => n.type === 'container').length
  const alerts = config.services.filter(s => s.status !== 'online').length

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Dashboard</h1>
        <p className="text-sm text-text-secondary mt-0.5">
          {config.lab.name} • {config.lab.host}
        </p>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div variants={item}>
          <GlassCard className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Server size={18} className="text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">{totalVMs}</p>
              <p className="text-xs text-text-secondary">Virtual Machines</p>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={item}>
          <GlassCard className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#818cf8]/10 flex items-center justify-center">
              <Box size={18} className="text-[#818cf8]" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">{totalCTs}</p>
              <p className="text-xs text-text-secondary">Containers</p>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={item}>
          <GlassCard className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-status-online/10 flex items-center justify-center">
              <CheckCircle2 size={18} className="text-status-online" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">{onlineServices}/{config.services.length}</p>
              <p className="text-xs text-text-secondary">Services Online</p>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={item}>
          <GlassCard className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-status-warning/10 flex items-center justify-center">
              <AlertTriangle size={18} className="text-status-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">{alerts}</p>
              <p className="text-xs text-text-secondary">Active Alerts</p>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Host metrics + Services grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Host metrics card */}
        <motion.div variants={item}>
          <GlassCard glow className="lg:row-span-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-text-primary">Host System</h3>
                <p className="text-xs text-text-muted mt-0.5">{config.lab.cpu}</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                <Clock size={12} />
                <span className="tabular-nums">{formatUptime(metrics.pve.uptime)}</span>
              </div>
            </div>
            <div className="flex items-center justify-around py-2">
              <CircularGauge value={metrics.pve.cpu} label="CPU" size={80} strokeWidth={5} />
              <CircularGauge value={metrics.pve.ram} label="RAM" size={80} strokeWidth={5} />
              <CircularGauge value={metrics.pve.disk} label="Disk" size={80} strokeWidth={5} />
            </div>
            <div className="mt-3 pt-3 border-t border-border-primary flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                <Thermometer size={12} />
                <span className="tabular-nums">{Math.round(metrics.pve.temp)}°C</span>
              </div>
              <div className="text-xs text-text-muted">{config.lab.ram} • {config.lab.storage}</div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Services quick links */}
        <motion.div variants={item} className="lg:col-span-2">
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-text-primary">Quick Access</h3>
              <span className="text-xs text-text-muted">{config.services.length} services</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {config.services.map((svc) => (
                <a
                  key={svc.id}
                  href={svc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-transparent hover:border-border-glow hover:bg-white/[0.04] transition-all group"
                >
                  <StatusDot status={svc.status} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary truncate">{svc.name}</p>
                    <p className="text-[10px] text-text-muted truncate">{svc.description}</p>
                  </div>
                  <ArrowUpRight size={14} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </a>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Uptime overview */}
      <motion.div variants={item}>
        <GlassCard>
          <h3 className="text-sm font-medium text-text-primary mb-4">System Uptime</h3>
          <UptimeBar segments={45} uptime={99.7} />
        </GlassCard>
      </motion.div>

      {/* Network overview */}
      <motion.div variants={item}>
        <GlassCard>
          <h3 className="text-sm font-medium text-text-primary mb-4">Networks</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {config.networks.map((net) => (
              <div
                key={net.id}
                className="p-3 rounded-lg bg-white/[0.02] border border-border-primary"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: net.color }} />
                  <span className="text-sm font-medium text-text-primary">{net.name}</span>
                </div>
                <p className="text-xs text-text-muted font-mono">{net.subnet}</p>
                <p className="text-xs text-text-muted mt-1">
                  {config.nodes.filter(n => n.network === net.id).length} nodes
                </p>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  )
}
