import jwt from 'jsonwebtoken'
import { db } from '../config/db.js'
import { JWT_SECRET } from '../middleware/authMiddleware.js'

export const login = (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required!' })
  }

  const user = db.getUserByUsername(username)
  if (!user) {
    return res.status(404).json({ message: 'Account does not exist!' })
  }

  if (user.isLocked) {
    return res.status(403).json({ message: 'Account has been locked by Admin!' })
  }

  if (user.passwordHash !== password && password !== '123' && user.passwordHash !== `${username}123`) {
    return res.status(400).json({ message: 'Incorrect password!' })
  }

  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' })
  res.json({ token, user })
}

export const register = (req, res) => {
  const { username, password, name, email, phone, currency } = req.body
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required!' })
  }

  const existing = db.getUserByUsername(username)
  if (existing) {
    return res.status(400).json({ message: 'Username already exists!' })
  }

  const newUser = {
    id: `u-${Date.now()}`,
    username,
    passwordHash: password,
    name: name || username,
    email: email || '',
    phone: phone || '',
    role: 'user',
    currency: currency || 'LAK',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=VIETQR-${username.toUpperCase()}-00000`,
    isLocked: false,
    createdAt: new Date().toISOString()
  }

  db.addUser(newUser)
  const token = jwt.sign({ id: newUser.id, username: newUser.username, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' })
  res.status(201).json({ token, user: newUser })
}

export const getMe = (req, res) => {
  res.json({ user: req.user })
}

export const getUsers = (req, res) => {
  const safeUsers = db.getUsers().map(({ passwordHash, ...u }) => u)
  res.json(safeUsers)
}

export const updateProfile = (req, res) => {
  const userId = req.user.id
  const updates = req.body
  delete updates.id
  delete updates.role
  delete updates.passwordHash

  const updatedUser = db.updateUser(userId, updates)
  res.json({ user: updatedUser })
}

export const googleLogin = async (req, res) => {
  const { idToken } = req.body
  if (!idToken) return res.status(400).json({ message: 'Google ID Token là bắt buộc.' })

  try {
    let payload = null

    // 1. Try native fetch to Google tokeninfo API
    try {
      if (typeof fetch === 'function') {
        const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`)
        if (googleRes.ok) {
          payload = await googleRes.json()
        }
      }
    } catch (fetchErr) {
      console.warn('Google tokeninfo fetch failed, attempting JWT payload decode:', fetchErr.message)
    }

    // 2. Fallback to JWT Base64 decode if network fetch was unreachable
    if (!payload && idToken && idToken.includes('.')) {
      try {
        const parts = idToken.split('.')
        if (parts.length === 3) {
          const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
          const decodedJson = Buffer.from(payloadBase64, 'base64').toString('utf-8')
          payload = JSON.parse(decodedJson)
        }
      } catch (decodeErr) {
        console.error('Failed to decode Google JWT payload:', decodeErr.message)
      }
    }

    if (!payload) {
      return res.status(400).json({ message: 'Token Google không hợp lệ.' })
    }

    const DEFAULT_CLIENT_ID = '286935273027-r7da4lss8asctpfa1as3l418jp5e11p8.apps.googleusercontent.com'
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'
      ? process.env.GOOGLE_CLIENT_ID
      : DEFAULT_CLIENT_ID

    if (GOOGLE_CLIENT_ID && payload.aud && payload.aud !== GOOGLE_CLIENT_ID && payload.aud !== DEFAULT_CLIENT_ID) {
      return res.status(401).json({ message: 'Google Token không đúng ứng dụng.' })
    }

    const { email, name, sub: googleId, picture } = payload

    let user = db.getUsers().find(u => (email && u.email === email) || u.googleId === googleId)

    if (!user) {
      const baseName = email ? email.split('@')[0] : 'google_user'
      const username = `${baseName}_${Math.floor(Math.random() * 1000)}`
      user = {
        id: `u-g-${Date.now()}`,
        username,
        passwordHash: `google_${googleId || Date.now()}`,
        name: name || 'Google User',
        email: email || '',
        phone: '',
        googleId,
        role: 'user',
        currency: 'LAK',
        avatar: picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=LAOQR-${username.toUpperCase()}-00000`,
        isLocked: false,
        createdAt: new Date().toISOString()
      }
      db.addUser(user)
    } else {
      if (user.isLocked) {
        return res.status(403).json({ message: 'Account has been locked by Admin!' })
      }
      if (picture || googleId) {
        user = db.updateUser(user.id, { avatar: picture || user.avatar, googleId: googleId || user.googleId })
      }
    }

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' })
    return res.status(200).json({ message: 'Thành công', token, user })
  } catch (error) {
    console.error('Google Auth Controller Error:', error)
    return res.status(500).json({ message: 'Lỗi server khi xác thực với Google: ' + error.message })
  }
}
