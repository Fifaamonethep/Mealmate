import { db } from '../config/db.js'

function getPairKeys(id1, id2) {
  return id1 < id2 ? { user_id_1: id1, user_id_2: id2 } : { user_id_1: id2, user_id_2: id1 }
}

export const searchUsers = async (req, res) => {
  try {
    const q = (req.query.q || '').trim().toLowerCase().replace(/^@/, '')
    if (!q) {
      return res.json([])
    }

    const currentUserId = req.user.id
    const allUsers = await db.getUsers()
    const friendships = await db.getFriendships()

    const matchedUsers = allUsers.filter(u =>
      u.id !== currentUserId &&
      (
        u.username.toLowerCase().includes(q) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.name && u.name.toLowerCase().includes(q))
      )
    )

    const results = matchedUsers.map(u => {
      const { passwordHash, ...safe } = u
      const pair = getPairKeys(currentUserId, u.id)
      const rel = friendships.find(f => f.user_id_1 === pair.user_id_1 && f.user_id_2 === pair.user_id_2)

      let friendshipStatus = 'NONE'
      let friendshipId = null

      if (rel) {
        friendshipId = rel.id
        if (rel.status === 'accepted') {
          friendshipStatus = 'ACCEPTED'
        } else if (rel.status === 'pending') {
          friendshipStatus = rel.requested_by === currentUserId ? 'PENDING_SENT' : 'PENDING_RECEIVED'
        }
      }

      return {
        ...safe,
        friendshipStatus,
        friendshipId
      }
    })

    res.json(results)
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to search users' })
  }
}

export const sendFriendRequest = async (req, res) => {
  try {
    const currentUserId = req.user.id
    const { targetUserId } = req.body

    if (!targetUserId || targetUserId === currentUserId) {
      return res.status(400).json({ message: 'Invalid target user for friend request!' })
    }

    const targetUser = await db.getUserById(targetUserId)
    if (!targetUser) {
      return res.status(404).json({ message: 'Target user does not exist in MealMate!' })
    }

    const pair = getPairKeys(currentUserId, targetUserId)
    const friendships = await db.getFriendships()
    const existing = friendships.find(f => f.user_id_1 === pair.user_id_1 && f.user_id_2 === pair.user_id_2)

    if (existing) {
      if (existing.status === 'accepted') {
        return res.status(400).json({ message: 'You are already friends with this user!' })
      }
      if (existing.status === 'pending') {
        return res.status(400).json({ message: 'A pending friend request already exists between you!' })
      }
    }

    const friendshipId = `f-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    const newFriendship = {
      id: friendshipId,
      user_id_1: pair.user_id_1,
      user_id_2: pair.user_id_2,
      status: 'pending',
      requested_by: currentUserId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const created = await db.addFriendship(newFriendship)

    // Notify recipient
    await db.addNotification({
      id: `n-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: targetUserId,
      title: 'Lời mời kết bạn mới',
      message: `${req.user.name} đã gửi lời mời kết bạn cho bạn!`,
      type: 'FRIEND_REQUEST',
      isRead: false,
      createdAt: new Date().toISOString()
    })

    res.status(201).json(created)
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to send friend request' })
  }
}

export const acceptFriendRequest = async (req, res) => {
  try {
    const currentUserId = req.user.id
    const id = req.params.id // Can be friendshipId or requesterUserId

    const friendships = await db.getFriendships()
    const friendship = friendships.find(f => f.id === id || f.user_id_1 === id || f.user_id_2 === id)

    if (!friendship) {
      return res.status(404).json({ message: 'Friend request not found!' })
    }

    if (friendship.status === 'accepted') {
      return res.status(400).json({ message: 'Friend request is already accepted!' })
    }

    if (friendship.requested_by === currentUserId) {
      return res.status(400).json({ message: 'You cannot accept a request that you sent yourself!' })
    }

    const updated = await db.updateFriendship(friendship.id, {
      status: 'accepted',
      updated_at: new Date().toISOString()
    })

    // Notify original requester
    const requesterId = friendship.requested_by
    await db.addNotification({
      id: `n-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: requesterId,
      title: 'Lời mời kết bạn đã được chấp nhận 🎉',
      message: `${req.user.name} đã chấp nhận lời mời kết bạn của bạn!`,
      type: 'FRIEND_ACCEPTED',
      isRead: false,
      createdAt: new Date().toISOString()
    })

    res.json(updated)
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to accept friend request' })
  }
}

export const declineFriendRequest = async (req, res) => {
  try {
    const currentUserId = req.user.id
    const id = req.params.id

    const friendships = await db.getFriendships()
    const friendship = friendships.find(f => f.id === id || f.user_id_1 === id || f.user_id_2 === id)

    if (!friendship) {
      return res.status(404).json({ message: 'Friend request not found!' })
    }

    await db.deleteFriendship(friendship.id)
    res.json({ message: 'Friend request declined' })
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to decline friend request' })
  }
}

export const unfriend = async (req, res) => {
  try {
    const currentUserId = req.user.id
    const targetUserId = req.params.id

    const pair = getPairKeys(currentUserId, targetUserId)
    const friendships = await db.getFriendships()
    const friendship = friendships.find(f => f.id === targetUserId || (f.user_id_1 === pair.user_id_1 && f.user_id_2 === pair.user_id_2))

    if (!friendship) {
      return res.status(404).json({ message: 'Friendship record not found!' })
    }

    await db.deleteFriendship(friendship.id)
    res.json({ message: 'Unfriended successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to remove friend' })
  }
}

export const getFriends = async (req, res) => {
  try {
    const currentUserId = req.user.id
    const friendships = await db.getFriendships()
    const allUsers = await db.getUsers()

    const acceptedPairs = friendships.filter(f => f.status === 'accepted' && (f.user_id_1 === currentUserId || f.user_id_2 === currentUserId))
    const friendIds = acceptedPairs.map(f => f.user_id_1 === currentUserId ? f.user_id_2 : f.user_id_1)

    const friends = allUsers
      .filter(u => friendIds.includes(u.id))
      .map(({ passwordHash, ...safe }) => safe)

    res.json(friends)
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to fetch friends' })
  }
}

export const getFriendRequests = async (req, res) => {
  try {
    const currentUserId = req.user.id
    const friendships = await db.getFriendships()
    const allUsers = await db.getUsers()

    const pending = friendships.filter(f => f.status === 'pending' && (f.user_id_1 === currentUserId || f.user_id_2 === currentUserId))

    const incoming = []
    const outgoing = []

    for (const f of pending) {
      const otherId = f.user_id_1 === currentUserId ? f.user_id_2 : f.user_id_1
      const otherUser = allUsers.find(u => u.id === otherId)
      if (!otherUser) continue
      const { passwordHash, ...safeUser } = otherUser

      const item = {
        friendshipId: f.id,
        user: safeUser,
        createdAt: f.created_at
      }

      if (f.requested_by === currentUserId) {
        outgoing.push(item)
      } else {
        incoming.push(item)
      }
    }

    res.json({ incoming, outgoing })
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to fetch friend requests' })
  }
}
