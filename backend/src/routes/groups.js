import express from 'express'
import { getGroups, getGroupById, createGroup, updateGroup, deleteGroup, addMember, removeMember } from '../controllers/groupsController.js'
import { authenticateToken, requireGroupMember } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', authenticateToken, getGroups)
router.get('/:id', authenticateToken, requireGroupMember, getGroupById)
router.post('/', authenticateToken, createGroup)
router.put('/:id', authenticateToken, requireGroupMember, updateGroup)
router.delete('/:id', authenticateToken, requireGroupMember, deleteGroup)
router.post('/:id/members', authenticateToken, requireGroupMember, addMember)
router.delete('/:id/members/:userId', authenticateToken, requireGroupMember, removeMember)

export default router

