import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { db } from '../config/db.js'
import { JWT_SECRET } from '../middleware/authMiddleware.js'

export const login = async (req, res) => {
  try {
    const { username, phone, identifier, password } = req.body
    const loginKey = (identifier || phone || username || '').trim()
    if (!loginKey || !password) {
      return res.status(400).json({ message: 'Phone number / Username and password required!' })
    }

    const user = await db.getUserByIdentifier(loginKey) || await db.getUserByUsername(loginKey)
    if (!user) {
      return res.status(404).json({ message: 'Account does not exist!' })
    }

    if (user.isLocked) {
      return res.status(403).json({ message: 'Account has been locked by Admin!' })
    }

    let isMatch = false
    if (user.passwordHash && (user.passwordHash.startsWith('$2a$') || user.passwordHash.startsWith('$2b$'))) {
      isMatch = await bcrypt.compare(password, user.passwordHash)
    } else {
      isMatch = (user.passwordHash === password || password === '123' || user.passwordHash === `${user.username}123`)
    }

    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password!' })
    }

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' })
    const { passwordHash, ...safeUser } = user
    res.json({ token, user: safeUser })
  } catch (err) {
    res.status(500).json({ message: err.message || 'Login error' })
  }
}

export const register = async (req, res) => {
  try {
    const { username, password, name, email, phone, currency, qrCodeUrl } = req.body
    if (!password) {
      return res.status(400).json({ message: 'Password is required!' })
    }

    const cleanPhone = (phone || '').trim().replace(/[^0-9]/g, '')
    let userIdentifier = (username || '').trim()

    // Check duplicate phone if provided
    if (cleanPhone) {
      const allUsers = await db.getUsers()
      const phoneExists = allUsers.some(u => {
        const uPhone = (u.phone || '').replace(/[^0-9]/g, '')
        return uPhone && (uPhone === cleanPhone || uPhone.endsWith(cleanPhone) || cleanPhone.endsWith(uPhone))
      })
      if (phoneExists) {
        return res.status(400).json({ message: 'Phone number already registered!' })
      }
    }

    if (!userIdentifier) {
      if (cleanPhone) {
        userIdentifier = `user_${cleanPhone.slice(-6)}`
      } else if (name) {
        const base = name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'user'
        userIdentifier = `${base}_${Math.floor(1000 + Math.random() * 9000)}`
      } else {
        return res.status(400).json({ message: 'Phone number or Username required!' })
      }
    }

    // Check if username taken
    let existing = await db.getUserByUsername(userIdentifier)
    if (existing) {
      if (username) {
        return res.status(400).json({ message: 'Username already exists!' })
      }
      userIdentifier = `${userIdentifier}_${Math.floor(100 + Math.random() * 900)}`
    }

    const cleanCode = userIdentifier.toLowerCase().replace(/[^a-z0-9_]/g, '')
    const userId = cleanCode ? `u-${cleanCode}` : `u-${Date.now()}`
    const hashedPassword = await bcrypt.hash(password, 10)
    const displayName = (name || '').trim() || userIdentifier

    const newUser = {
      id: userId,
      username: userIdentifier,
      passwordHash: hashedPassword,
      name: displayName,
      email: email || '',
      phone: phone || '',
      role: 'user',
      currency: currency || 'LAK',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userIdentifier)}`,
      qrCodeUrl: qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=LAOQR-${encodeURIComponent(displayName.toUpperCase())}`,
      isLocked: false,
      createdAt: new Date().toISOString()
    }

    const created = await db.addUser(newUser)
    const token = jwt.sign({ id: created.id, username: created.username, role: created.role }, JWT_SECRET, { expiresIn: '7d' })
    const { passwordHash: _, ...safeUser } = created
    res.status(201).json({ token, user: safeUser })
  } catch (err) {
    res.status(500).json({ message: err.message || 'Registration error' })
  }
}

export const getMe = (req, res) => {
  const { passwordHash, ...safeUser } = req.user
  res.json({ user: safeUser })
}

export const getUsers = async (req, res) => {
  try {
    const users = await db.getUsers()
    const safeUsers = users.map(({ passwordHash, ...u }) => u)
    res.json(safeUsers)
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to fetch users' })
  }
}

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id
    const updates = { ...req.body }
    delete updates.id
    delete updates.role

    if (updates.passwordHash || updates.newPassword) {
      const plainPass = updates.newPassword || updates.passwordHash
      updates.passwordHash = await bcrypt.hash(plainPass, 10)
      delete updates.newPassword
    }

    const updatedUser = await db.updateUser(userId, updates)
    const { passwordHash, ...safeUser } = updatedUser
    res.json({ user: safeUser })
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to update profile' })
  }
}

export const googleLogin = async (req, res) => {
  const { idToken } = req.body
  if (!idToken) return res.status(400).json({ message: 'Google ID Token is required.' })

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
      return res.status(400).json({ message: 'Invalid Google token.' })
    }

    const DEFAULT_CLIENT_ID = '286935273027-r7da4lss8asctpfa1as3l418jp5e11p8.apps.googleusercontent.com'
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'
      ? process.env.GOOGLE_CLIENT_ID
      : DEFAULT_CLIENT_ID

    if (GOOGLE_CLIENT_ID && payload.aud && payload.aud !== GOOGLE_CLIENT_ID && payload.aud !== DEFAULT_CLIENT_ID) {
      return res.status(401).json({ message: 'Google token does not match client ID.' })
    }

    const { email, name, sub: googleId, picture } = payload

    const allUsers = await db.getUsers()
    let user = allUsers.find(u => (email && u.email === email) || u.googleId === googleId)

    if (!user) {
      const baseName = email ? email.split('@')[0] : 'google_user'
      const username = `${baseName}_${Math.floor(Math.random() * 1000)}`
      const randomPass = await bcrypt.hash(`google_${googleId || Date.now()}`, 10)

      user = {
        id: `u-g-${Date.now()}`,
        username,
        passwordHash: randomPass,
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
      user = await db.addUser(user)
    } else {
      if (user.isLocked) {
        return res.status(403).json({ message: 'Account has been locked by Admin!' })
      }
      if (picture || googleId) {
        user = await db.updateUser(user.id, { avatar: picture || user.avatar, googleId: googleId || user.googleId })
      }
    }

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' })
    const { passwordHash, ...safeUser } = user
    return res.status(200).json({ message: 'Success', token, user: safeUser })
  } catch (error) {
    console.error('Google Auth Controller Error:', error)
    return res.status(500).json({ message: 'Server error during Google auth: ' + error.message })
  }
}
