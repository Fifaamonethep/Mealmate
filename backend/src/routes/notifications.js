import express from 'express'
import { getNotifications, markAllRead } from '../controllers/notificationsController.js'
import { authenticateToken } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', authenticateToken, getNotifications)
router.put('/read-all', authenticateToken, markAllRead)

export default router
