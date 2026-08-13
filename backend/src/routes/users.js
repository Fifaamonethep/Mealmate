import express from 'express'
import { searchUsers } from '../controllers/friendsController.js'
import { authenticateToken } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/search', authenticateToken, searchUsers)

export default router
