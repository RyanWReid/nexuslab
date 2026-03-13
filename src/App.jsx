import { useState, useEffect, useCallback } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import CommandPalette from '@/components/shared/CommandPalette'
import Dashboard from '@/pages/Dashboard'
import Services from '@/pages/Services'
import Monitoring from '@/pages/Monitoring'
import Topology from '@/pages/Topology'
import Logs from '@/pages/Logs'

const pages = {
  dashboard: Dashboard,
  services: Services,
  monitoring: Monitoring,
  topology: Topology,
  logs: Logs,
}

export default function App() {
  const [activePage, setActivePage] = useState('dashboard')
  const [searchOpen, setSearchOpen] = useState(false)

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const ActivePage = pages[activePage] || Dashboard

  return (
    <div className="min-h-screen bg-bg-primary gradient-mesh">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      <div className="ml-16 min-h-screen flex flex-col">
        <TopBar
          onOpenSearch={() => setSearchOpen(true)}
          alerts={[]}
        />

        <main className="flex-1 p-6 max-w-[1400px] w-full mx-auto">
          <ActivePage />
        </main>
      </div>

      <CommandPalette
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </div>
  )
}
