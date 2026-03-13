import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Cpu, MemoryStick, HardDrive, Thermometer, Wifi, Clock } from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import GlassCard from '@/components/shared/GlassCard'
import CircularGauge from '@/components/shared/CircularGauge'
import StatusDot from '@/components/shared/StatusDot'
import { config, getMockMetrics } from '@/data/homelab'
import { formatUptime, formatBytes } from '@/lib/utils'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

function generateHistory(points = 30) {
  return Array.from({ length: points }, (_, i) => ({
    time: `${points - i}m`,
    cpu: 8 + Math.random() * 20,
    ram: 60 + Math.random() * 15,
    network: Math.random() * 50,
  }))
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-lg px-3 py-2 text-xs">
      <p className="text-text-muted mb-1">{label} ago</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {p.value.toFixed(1)}%
        </p>
      ))}
    </div>
  )
}

export default function Monitoring() {
  const [metrics, setMetrics] = useState(getMockMetrics())
  const [history] = useState(generateHistory)

  useEffect(() => {
    const interval = setInterval(() => setMetrics(getMockMetrics()), 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Monitoring</h1>
        <p className="text-sm text-text-secondary mt-0.5">Real-time system metrics</p>
      </div>

      {/* Main gauges */}
      <motion.div variants={item}>
        <GlassCard glow className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-medium text-text-primary">Host: pve01</h3>
            <div className="flex items-center gap-1.5 text-xs text-text-secondary">
              <Clock size={12} />
              <span className="tabular-nums">{formatUptime(metrics.pve.uptime)}</span>
            </div>
          </div>
          <div className="flex items-center justify-around flex-wrap gap-6">
            <CircularGauge value={metrics.pve.cpu} label="CPU Usage" size={120} strokeWidth={7} />
            <CircularGauge value={metrics.pve.ram} label="Memory" size={120} strokeWidth={7} />
            <CircularGauge value={metrics.pve.disk} label="Storage" size={120} strokeWidth={7} />
            <CircularGauge value={metrics.pve.temp} max={100} label="Temperature" unit="°C" size={120} strokeWidth={7} />
          </div>
        </GlassCard>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div variants={item}>
          <GlassCard>
            <h3 className="text-sm font-medium text-text-primary mb-4">CPU History (30m)</h3>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" hide />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="cpu"
                  name="CPU"
                  stroke="#2dd4bf"
                  fill="url(#cpuGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>

        <motion.div variants={item}>
          <GlassCard>
            <h3 className="text-sm font-medium text-text-primary mb-4">Memory History (30m)</h3>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="ramGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" hide />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="ram"
                  name="RAM"
                  stroke="#818cf8"
                  fill="url(#ramGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>
      </div>

      {/* Node table */}
      <motion.div variants={item}>
        <GlassCard>
          <h3 className="text-sm font-medium text-text-primary mb-4">Node Status</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-primary">
                  <th className="text-left py-2 px-3 text-xs text-text-muted font-medium">Node</th>
                  <th className="text-left py-2 px-3 text-xs text-text-muted font-medium">Type</th>
                  <th className="text-left py-2 px-3 text-xs text-text-muted font-medium">IP</th>
                  <th className="text-left py-2 px-3 text-xs text-text-muted font-medium">Status</th>
                  <th className="text-left py-2 px-3 text-xs text-text-muted font-medium">OS</th>
                  <th className="text-right py-2 px-3 text-xs text-text-muted font-medium">RAM</th>
                </tr>
              </thead>
              <tbody>
                {config.nodes.map((node) => (
                  <tr key={node.id} className="border-b border-border-primary/50 hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 px-3">
                      <span className="text-text-primary font-medium">{node.name}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/[0.04] text-text-secondary capitalize">
                        {node.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-text-secondary font-mono text-xs">{node.ip}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <StatusDot status={node.status} size="sm" />
                        <span className="text-xs text-text-secondary capitalize">{node.status}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-xs text-text-muted">{node.os}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="text-xs text-text-secondary tabular-nums">
                        {node.ram ? formatBytes(node.ram * 1024 * 1024) : '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  )
}
