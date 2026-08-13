import express from 'express'
import rateLimit from 'express-rate-limit'
import { login, register, getMe, getUsers, updateProfile, googleLogin } from '../controllers/authController.js'
import { authenticateToken } from '../middleware/authMiddleware.js'

const router = express.Router()

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: 'Too many authentication attempts from this IP, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
})

router.post('/login', authLimiter, login)
router.post('/register', authLimiter, register)
router.post('/google', authLimiter, googleLogin)
router.get('/me', authenticateToken, getMe)
router.get('/users', authenticateToken, getUsers)
router.put('/profile', authenticateToken, updateProfile)

export default router
