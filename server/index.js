import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const server = createServer(app)
const io = new Server(server, { cors: { origin: '*' } })

const PORT = process.env.PORT || 3101

// Proxmox API config (from env)
const PVE_HOST = process.env.PVE_HOST || '192.168.8.10'
const PVE_PORT = process.env.PVE_PORT || 8006
const PVE_TOKEN = process.env.PVE_TOKEN || ''
const PVE_TOKEN_NAME = process.env.PVE_TOKEN_NAME || 'root@pam!mcp-server'

// ---- Service health checker ----
const services = [
  { id: 'proxmox', url: `https://${PVE_HOST}:${PVE_PORT}`, insecure: true },
  { id: 'opnsense', url: 'https://192.168.8.1', insecure: true },
  { id: 'npm', url: 'http://192.168.8.101:81' },
  { id: 'coolify', url: 'http://192.168.8.107:8000' },
  { id: 'forgejo', url: 'http://192.168.8.108:3000' },
  { id: 'n8n', url: 'http://192.168.8.110:5678' },
  { id: 'claudeclaw', url: 'http://10.10.10.203:4632' },
  { id: 'homepage', url: 'http://192.168.8.106:3000' },
]

async function checkService(svc) {
  const start = Date.now()
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    await fetch(svc.url, {
      signal: controller.signal,
      ...(svc.insecure ? { rejectUnauthorized: false } : {}),
    })

    clearTimeout(timeout)
    return {
      id: svc.id,
      status: 'online',
      latency: Date.now() - start,
      lastCheck: new Date().toISOString(),
    }
  } catch (err) {
    return {
      id: svc.id,
      status: 'offline',
      latency: -1,
      lastCheck: new Date().toISOString(),
      error: err.message,
    }
  }
}

async function checkAllServices() {
  const results = await Promise.all(services.map(checkService))
  return results.reduce((acc, r) => { acc[r.id] = r; return acc }, {})
}

// ---- Proxmox metrics fetcher ----
async function fetchPveMetrics() {
  if (!PVE_TOKEN) {
    // Return mock data if no token configured
    return {
      cpu: 10 + Math.random() * 15,
      ram: 65 + Math.random() * 10,
      disk: 42,
      uptime: 1234567,
      temp: 44 + Math.random() * 6,
    }
  }

  try {
    const res = await fetch(
      `https://${PVE_HOST}:${PVE_PORT}/api2/json/nodes/pve01/status`,
      {
        headers: { Authorization: `PVEAPIToken=${PVE_TOKEN_NAME}=${PVE_TOKEN}` },
        rejectUnauthorized: false,
      }
    )
    const json = await res.json()
    const d = json.data
    return {
      cpu: (d.cpu || 0) * 100,
      ram: ((d.memory?.used || 0) / (d.memory?.total || 1)) * 100,
      disk: ((d.rootfs?.used || 0) / (d.rootfs?.total || 1)) * 100,
      uptime: d.uptime || 0,
      temp: 45, // Proxmox API doesn't expose temp directly
    }
  } catch (err) {
    console.error('PVE fetch error:', err.message)
    return {
      cpu: 10 + Math.random() * 15,
      ram: 65 + Math.random() * 10,
      disk: 42,
      uptime: 0,
      temp: 45,
    }
  }
}

// ---- API Routes ----
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.get('/api/metrics', async (req, res) => {
  const [pve, serviceStatus] = await Promise.all([
    fetchPveMetrics(),
    checkAllServices(),
  ])
  res.json({ pve, services: serviceStatus })
})

app.get('/api/services', async (req, res) => {
  const status = await checkAllServices()
  res.json(status)
})

// ---- Serve static frontend in production ----
const distPath = path.join(__dirname, '..', 'dist')
app.use(express.static(distPath))
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

// ---- WebSocket for real-time updates ----
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)

  // Send initial data
  Promise.all([fetchPveMetrics(), checkAllServices()]).then(([pve, svcStatus]) => {
    socket.emit('metrics', { pve, services: svcStatus })
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

// Broadcast metrics every 10 seconds
setInterval(async () => {
  const [pve, svcStatus] = await Promise.all([
    fetchPveMetrics(),
    checkAllServices(),
  ])
  io.emit('metrics', { pve, services: svcStatus })
}, 10000)

// ---- Start ----
server.listen(PORT, '0.0.0.0', () => {
  console.log(`NexusLab API running on port ${PORT}`)
  console.log(`PVE: https://${PVE_HOST}:${PVE_PORT} (token: ${PVE_TOKEN ? 'configured' : 'not set'})`)
})
