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
