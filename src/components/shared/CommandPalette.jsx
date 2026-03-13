import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ExternalLink, Server, Box, Globe, X } from 'lucide-react'
import { config } from '@/data/homelab'

export default function CommandPalette({ open, onClose }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (open) onClose()
        else onClose() // toggle handled by parent
      }
      if (e.key === 'Escape' && open) onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  const allItems = [
    ...config.services.map(s => ({
      type: 'service',
      id: s.id,
      name: s.name,
      description: s.description,
      url: s.url,
      icon: Globe,
    })),
    ...config.nodes.map(n => ({
      type: 'node',
      id: n.id,
      name: n.name,
      description: `${n.os} • ${n.ip}`,
      icon: n.type === 'container' ? Box : Server,
    })),
  ]

  const filtered = query.trim()
    ? allItems.filter(item =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
      )
    : allItems.slice(0, 8)

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg z-[101]"
          >
            <div className="glass rounded-xl overflow-hidden glow-accent">
              {/* Input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border-primary">
                <Search size={18} className="text-text-muted flex-shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search services, nodes, IP addresses..."
                  className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
                />
                <button onClick={onClose} className="p-1 rounded hover:bg-white/[0.05]">
                  <X size={14} className="text-text-muted" />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-80 overflow-y-auto py-2">
                {filtered.length === 0 && (
                  <p className="px-4 py-8 text-sm text-text-muted text-center">No results found</p>
                )}
                {filtered.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (item.url) window.open(item.url, '_blank')
                        onClose()
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.03] transition-colors text-left group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/[0.03] flex items-center justify-center flex-shrink-0">
                        <Icon size={15} className="text-text-secondary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-text-primary truncate">{item.name}</p>
                        <p className="text-xs text-text-muted truncate">{item.description}</p>
                      </div>
                      {item.url && (
                        <ExternalLink size={14} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
