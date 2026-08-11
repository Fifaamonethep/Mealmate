import jwt from 'jsonwebtoken'
import { db } from '../config/db.js'

const JWT_SECRET = process.env.JWT_SECRET || 'mealmate_secret_key_2026'

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Authentication token missing!' })
  }

  // Handle mock tokens format: mock_jwt_token_u-alice_123456
  if (token.startsWith('mock_jwt_token_')) {
    const parts = token.split('_')
    const userId = parts[3]
    const user = db.getUserById(userId)
    if (!user) {
      return res.status(403).json({ message: 'Invalid or expired session token' })
    }
    if (user.isLocked) {
      return res.status(403).json({ message: 'Account is locked by Admin!' })
    }
    req.user = user
    return next()
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    const user = db.getUserById(decoded.id)
    if (!user) {
      return res.status(403).json({ message: 'User no longer exists' })
    }
    if (user.isLocked) {
      return res.status(403).json({ message: 'Account is locked by Admin!' })
    }
    req.user = user
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

export { JWT_SECRET }
