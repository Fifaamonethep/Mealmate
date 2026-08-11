import express from 'express'
import { getUsers, toggleLockUser, updateUserRole, resetUserPassword, getDebtMatrix } from '../controllers/adminController.js'
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(authenticateToken, requireAdmin)

router.get('/users', getUsers)
router.put('/users/:id/lock', toggleLockUser)
router.put('/users/:id/role', updateUserRole)
router.put('/users/:id/password', resetUserPassword)
router.get('/matrix', getDebtMatrix)

export default router
