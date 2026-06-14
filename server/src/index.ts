import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import path from 'path'
import rateLimit from 'express-rate-limit'

import { errorHandler } from './middleware/error'
import authRouter from './routes/auth'
import publicRouter from './routes/public'
import adminRouter from './routes/admin'

const app = express()
const PORT = process.env.PORT ?? 4000

// ── Security ──────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL ?? 'http://localhost:5173',
      process.env.ADMIN_URL ?? 'http://localhost:5174',
    ],
    credentials: true,
  }),
)
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  }),
)

// ── Body parsing ──────────────────────────────────────────
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// ── Static files (uploads) ────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

// ── Routes ────────────────────────────────────────────────
app.use('/api/auth', authRouter)
app.use('/api', publicRouter)
app.use('/api/admin', adminRouter)

// ── Health check ──────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))

// ── 404 ───────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }))

// ── Error handler ─────────────────────────────────────────
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`)
  console.log(`📋 Health check: http://localhost:${PORT}/health\n`)
})

export default app
