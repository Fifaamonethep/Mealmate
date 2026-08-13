import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import swaggerUi from 'swagger-ui-express'

import { seedInitialData } from './src/database/seed.js'
import { swaggerSpec } from './src/config/swagger.js'
import authRoutes from './src/routes/auth.js'
import mealsRoutes from './src/routes/meals.js'
import debtsRoutes from './src/routes/debts.js'
import groupsRoutes from './src/routes/groups.js'
import notificationsRoutes from './src/routes/notifications.js'
import adminRoutes from './src/routes/admin.js'
import friendsRoutes from './src/routes/friends.js'
import usersRoutes from './src/routes/users.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Initialize seed data
seedInitialData()

// Middlewares
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`)
  next()
})

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Root route
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    app: 'MealMate REST API Backend',
    version: '1.0.0',
    swaggerDocs: 'http://localhost:5000/api-docs',
    timestamp: new Date().toISOString()
  })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/friends', friendsRoutes)
app.use('/api/meals', mealsRoutes)
app.use('/api/debts', debtsRoutes)
app.use('/api/groups', groupsRoutes)
app.use('/api/notifications', notificationsRoutes)
app.use('/api/admin', adminRoutes)

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err)
  res.status(err.status || 500).json({
    error: true,
    message: err.message || 'Internal Server Error'
  })
})

app.listen(PORT, () => {
  console.log(`==================================================`)
  console.log(`🚀 MealMate Backend Server running on http://localhost:${PORT}`)
  console.log(`📖 Swagger API Docs available at http://localhost:${PORT}/api-docs`)
  console.log(`==================================================`)
})
