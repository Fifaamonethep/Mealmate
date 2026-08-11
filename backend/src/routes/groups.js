import express from 'express'
import { getGroups, getGroupById, createGroup, updateGroup, deleteGroup, addMember, removeMember } from '../controllers/groupsController.js'
import { authenticateToken } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', authenticateToken, getGroups)
router.get('/:id', authenticateToken, getGroupById)
router.post('/', authenticateToken, createGroup)
router.put('/:id', authenticateToken, updateGroup)
router.delete('/:id', authenticateToken, deleteGroup)
router.post('/:id/members', authenticateToken, addMember)
router.delete('/:id/members/:userId', authenticateToken, removeMember)

export default router
