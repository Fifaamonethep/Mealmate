import express from 'express'
import { getDebts, sendSlip, confirmPayment, rejectPayment, forceAdminAction } from '../controllers/debtsController.js'
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', authenticateToken, getDebts)
router.put('/:id/slip', authenticateToken, sendSlip)
router.put('/:id/confirm', authenticateToken, confirmPayment)
router.put('/:id/reject', authenticateToken, rejectPayment)
router.put('/:id/force', authenticateToken, requireAdmin, forceAdminAction)

export default router
