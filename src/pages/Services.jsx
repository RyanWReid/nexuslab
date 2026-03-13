import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ExternalLink, ArrowUpRight, Server, Box, Shield, Globe, Rocket,
  GitBranch, Workflow, Bot, LayoutDashboard, Filter
} from 'lucide-react'
import GlassCard from '@/components/shared/GlassCard'
import StatusDot from '@/components/shared/StatusDot'
import UptimeBar from '@/components/shared/UptimeBar'
import { config, getMockMetrics } from '@/data/homelab'

const iconMap = {
  Server, Shield, Globe, Rocket, GitBranch, Workflow, Bot, LayoutDashboard, Box,
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
}
const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
}

export default function Services() {
  const [filter, setFilter] = useState('all')
  const categories = ['all', ...Object.keys(config.categories)]
  const metrics = getMockMetrics()

  const filtered = filter === 'all'
    ? config.services
    : config.services.filter(s => s.category === filter)

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Services</h1>
          <p className="text-sm text-text-secondary mt-0.5">Quick access to all your services</p>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === cat
                ? 'bg-accent/15 text-accent border border-accent/20'
                : 'bg-white/[0.03] text-text-secondary border border-border-primary hover:border-border-glow hover:text-text-primary'
            }`}
          >
            {cat === 'all' ? 'All Services' : config.categories[cat].label}
          </button>
        ))}
      </div>

      {/* Service cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((svc) => {
          const Icon = iconMap[svc.icon] || Globe
          const svcMetrics = metrics.services[svc.id] || {}
          const catColor = config.categories[svc.category]?.color || '#2dd4bf'

          return (
            <motion.div key={svc.id} variants={item}>
              <a
                href={svc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <GlassCard className="group cursor-pointer hover:glow-accent transition-all duration-300">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${catColor}15` }}
                      >
                        <Icon size={18} style={{ color: catColor }} />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors">
                          {svc.name}
                        </h3>
                        <p className="text-xs text-text-muted">{svc.description}</p>
                      </div>
                    </div>
                    <ArrowUpRight size={16} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* Status row */}
                  <div className="flex items-center gap-4 py-2 px-3 rounded-lg bg-white/[0.02]">
                    <div className="flex items-center gap-1.5">
                      <StatusDot status={svc.status} size="sm" />
                      <span className="text-xs text-text-secondary capitalize">{svc.status}</span>
                    </div>
                    <div className="text-xs text-text-muted">
                      <span className="tabular-nums">{svcMetrics.latency}ms</span> latency
                    </div>
                    <div className="text-xs text-text-muted ml-auto">
                      <span className="tabular-nums">{svcMetrics.uptime?.toFixed(1)}%</span> uptime
                    </div>
                  </div>

                  {/* Mini uptime bar */}
                  <div className="mt-3">
                    <UptimeBar segments={20} uptime={svcMetrics.uptime || 99.9} />
                  </div>

                  {/* Footer */}
                  <div className="mt-3 pt-3 border-t border-border-primary flex items-center justify-between text-xs text-text-muted">
                    <span className="font-mono">{svc.node}</span>
                    <span className="font-mono">:{svc.port}</span>
                  </div>
                </GlassCard>
              </a>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
