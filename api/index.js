import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import { seedInitialData } from '../backend/src/database/seed.js'
import authRoutes from '../backend/src/routes/auth.js'
import mealsRoutes from '../backend/src/routes/meals.js'
import debtsRoutes from '../backend/src/routes/debts.js'
import groupsRoutes from '../backend/src/routes/groups.js'
import notificationsRoutes from '../backend/src/routes/notifications.js'
import adminRoutes from '../backend/src/routes/admin.js'
import friendsRoutes from '../backend/src/routes/friends.js'
import usersRoutes from '../backend/src/routes/users.js'

dotenv.config()

const app = express()

seedInitialData()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Health check
app.get('/api', (req, res) => {
  res.json({
    status: 'online',
    app: 'MealMate API (Serverless)',
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

export default app
