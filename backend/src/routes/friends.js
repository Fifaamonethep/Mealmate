import express from 'express'
import {
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  unfriend,
  getFriends,
  getFriendRequests
} from '../controllers/friendsController.js'
import { authenticateToken } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(authenticateToken)

router.get('/', getFriends)
router.get('/requests', getFriendRequests)
router.post('/request', sendFriendRequest)
router.post('/:id/accept', acceptFriendRequest)
router.post('/:id/decline', declineFriendRequest)
router.delete('/:id', unfriend)

export default router
