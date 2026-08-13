import jwt from 'jsonwebtoken'
import { db } from '../config/db.js'

const JWT_SECRET = process.env.JWT_SECRET || 'mealmate_super_secret_jwt_key_2026'

export async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ message: 'Authentication token missing!' })
    }

    // Handle mock tokens format: mock_jwt_token_u-alice_123456
    if (token.startsWith('mock_jwt_token_')) {
      const parts = token.split('_')
      const userId = parts[3]
      const user = await db.getUserById(userId)
      if (!user) {
        return res.status(403).json({ message: 'Invalid or expired session token' })
      }
      if (user.isLocked) {
        return res.status(403).json({ message: 'Account is locked by Admin!' })
      }
      const { passwordHash, ...safeUser } = user
      req.user = safeUser
      return next()
    }

    const decoded = jwt.verify(token, JWT_SECRET)
    const user = await db.getUserById(decoded.id)
    if (!user) {
      return res.status(403).json({ message: 'User no longer exists' })
    }
    if (user.isLocked) {
      return res.status(403).json({ message: 'Account is locked by Admin!' })
    }
    const { passwordHash, ...safeUser } = user
    req.user = safeUser
    next()
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token' })
  }
}

export function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next()
  } else {
    res.status(403).json({ message: 'Admin privilege required!' })
  }
}

export async function requireGroupMember(req, res, next) {
  try {
    let groupId = req.params.groupId || req.body?.groupId || req.query?.groupId
    const paramId = req.params.id

    let group = null
    if (groupId) {
      group = await db.getGroupById(groupId)
    } else if (paramId) {
      // Check if paramId is a group ID
      group = await db.getGroupById(paramId)
      if (!group) {
        // Check if paramId is a meal ID
        const meal = await db.getMealById(paramId)
        if (meal && meal.groupId) {
          groupId = meal.groupId
          group = await db.getGroupById(groupId)
        }
      } else {
        groupId = paramId
      }
    }

    if (!group) {
      // If endpoint requires group membership and no group found
      if (groupId) {
        return res.status(404).json({ message: 'Group not found!' })
      }
      return next()
    }

    const userId = req.user?.id
    const isMember = (group.members || []).includes(userId) || group.ownerId === userId || req.user?.role === 'admin'

    if (!isMember) {
      return res.status(403).json({ message: 'Access denied: You are not a member of this group!' })
    }

    req.group = group
    next()
  } catch (err) {
    res.status(500).json({ message: 'Authorization check error: ' + err.message })
  }
}

export { JWT_SECRET }

