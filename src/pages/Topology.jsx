import { useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Position,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import GlassCard from '@/components/shared/GlassCard'
import StatusDot from '@/components/shared/StatusDot'
import { config } from '@/data/homelab'

// Custom node component
function InfraNode({ data }) {
  const typeColors = {
    hypervisor: '#2dd4bf',
    vm: '#818cf8',
    container: '#f472b6',
    external: '#38bdf8',
    network: '#6b7280',
  }
  const color = typeColors[data.nodeType] || '#6b7280'

  return (
    <div
      className="glass rounded-xl px-4 py-3 min-w-[160px] transition-all hover:glow-accent-strong"
      style={{ borderColor: `${color}30`, borderWidth: 1 }}
    >
      <div className="flex items-center gap-2 mb-1">
        <StatusDot status={data.status} size="sm" />
        <span className="text-sm font-medium text-text-primary">{data.label}</span>
      </div>
      <p className="text-[10px] text-text-muted font-mono">{data.ip}</p>
      {data.os && <p className="text-[10px] text-text-muted mt-0.5">{data.os}</p>}
      <div
        className="mt-2 px-2 py-0.5 rounded-full text-[9px] font-medium inline-block"
        style={{ backgroundColor: `${color}15`, color }}
      >
        {data.nodeType}
      </div>
    </div>
  )
}

const nodeTypes = { infra: InfraNode }

function buildTopology() {
  const nodes = []
  const edges = []

  // Proxmox host at center top
  nodes.push({
    id: 'pve',
    type: 'infra',
    position: { x: 400, y: 0 },
    data: {
      label: 'pve01',
      ip: '192.168.8.10',
      os: 'Proxmox VE 9.0.3',
      status: 'online',
      nodeType: 'hypervisor',
    },
  })

  // Networks as invisible grouping
  const lanNodes = config.nodes.filter(n => n.network === 'vmbr0' && n.id !== 'pve')
  const devNodes = config.nodes.filter(n => n.network === 'vmbr1')
  const hackNodes = config.nodes.filter(n => n.network === 'vmbr2')
  const tsNodes = config.nodes.filter(n => n.network === 'tailscale')

  // LAN nodes
  lanNodes.forEach((node, i) => {
    const x = 80 + i * 190
    const y = 180
    nodes.push({
      id: node.id,
      type: 'infra',
      position: { x, y },
      data: {
        label: node.name,
        ip: node.ip,
        os: node.os,
        status: node.status,
        nodeType: node.type,
      },
    })
    edges.push({
      id: `e-pve-${node.id}`,
      source: 'pve',
      target: node.id,
      style: { stroke: '#2dd4bf40', strokeWidth: 1.5 },
      animated: node.status === 'online',
    })
  })

  // Dev net nodes
  devNodes.forEach((node, i) => {
    const x = 100 + i * 220
    const y = 380
    nodes.push({
      id: node.id,
      type: 'infra',
      position: { x, y },
      data: {
        label: node.name,
        ip: node.ip,
        os: node.os,
        status: node.status,
        nodeType: node.type,
      },
    })
    edges.push({
      id: `e-pve-${node.id}`,
      source: 'pve',
      target: node.id,
      style: { stroke: '#818cf840', strokeWidth: 1.5 },
      animated: node.status === 'online',
    })
  })

  // Hack lab nodes
  hackNodes.forEach((node, i) => {
    const x = 500 + i * 220
    const y = 380
    nodes.push({
      id: node.id,
      type: 'infra',
      position: { x, y },
      data: {
        label: node.name,
        ip: node.ip,
        os: node.os,
        status: node.status,
        nodeType: node.type,
      },
    })
    edges.push({
      id: `e-pve-${node.id}`,
      source: 'pve',
      target: node.id,
      style: { stroke: '#f472b640', strokeWidth: 1.5 },
      animated: node.status === 'online',
    })
  })

  // Tailscale / external nodes
  tsNodes.forEach((node, i) => {
    const x = 700 + i * 200
    const y = 160
    nodes.push({
      id: node.id,
      type: 'infra',
      position: { x, y },
      data: {
        label: node.name,
        ip: node.ip,
        os: node.os,
        status: node.status,
        nodeType: node.type,
      },
    })
    edges.push({
      id: `e-pve-${node.id}`,
      source: 'pve',
      target: node.id,
      style: { stroke: '#38bdf840', strokeWidth: 1.5, strokeDasharray: '5 5' },
      animated: node.status === 'online',
    })
  })

  return { nodes, edges }
}

export default function Topology() {
  const topology = useMemo(() => buildTopology(), [])
  const [nodes, setNodes, onNodesChange] = useNodesState(topology.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(topology.edges)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Network Topology</h1>
          <p className="text-sm text-text-secondary mt-0.5">Interactive infrastructure map</p>
        </div>
        <div className="flex gap-3">
          {config.networks.map(net => (
            <div key={net.id} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: net.color }} />
              <span className="text-xs text-text-secondary">{net.name}</span>
            </div>
          ))}
        </div>
      </div>

      <GlassCard className="p-0 overflow-hidden" hover={false}>
        <div style={{ height: 560 }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            proOptions={{ hideAttribution: true }}
            style={{ background: 'transparent' }}
          >
            <Background color="#ffffff08" gap={20} size={1} />
            <Controls
              className="!bg-bg-card !border-border-primary !rounded-lg"
              style={{ button: { backgroundColor: '#16161f', borderColor: 'rgba(255,255,255,0.06)' } }}
            />
            <MiniMap
              nodeColor={(n) => {
                const colors = { hypervisor: '#2dd4bf', vm: '#818cf8', container: '#f472b6', external: '#38bdf8' }
                return colors[n.data?.nodeType] || '#6b7280'
              }}
              maskColor="rgba(10,10,15,0.8)"
              style={{ backgroundColor: '#12121a', borderColor: 'rgba(255,255,255,0.06)' }}
            />
          </ReactFlow>
        </div>
      </GlassCard>
    </motion.div>
  )
}
