import express from 'express'
import { login, register, getMe, getUsers, updateProfile, googleLogin } from '../controllers/authController.js'
import { authenticateToken } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/login', login)
router.post('/register', register)
router.post('/google', googleLogin)
router.get('/me', authenticateToken, getMe)
router.get('/users', authenticateToken, getUsers)
router.put('/profile', authenticateToken, updateProfile)

export default router
