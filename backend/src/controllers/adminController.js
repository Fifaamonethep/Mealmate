import { db } from '../config/db.js'

export const getUsers = (req, res) => {
  const users = db.getUsers().map(({ passwordHash, ...u }) => u)
  res.json(users)
}

export const toggleLockUser = (req, res) => {
  const { id } = req.params
  const user = db.getUserById(id)
  if (!user) {
    return res.status(404).json({ message: 'User not found!' })
  }

  if (user.role === 'admin') {
    return res.status(403).json({ message: 'Cannot lock Admin account!' })
  }

  const updated = db.updateUser(id, { isLocked: !user.isLocked })
  const { passwordHash, ...safeUser } = updated
  res.json(safeUser)
}

export const updateUserRole = (req, res) => {
  const { id } = req.params
  const { role } = req.body

  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role!' })
  }

  const user = db.getUserById(id)
  if (!user) {
    return res.status(404).json({ message: 'User not found!' })
  }

  const updated = db.updateUser(id, { role })
  const { passwordHash, ...safeUser } = updated
  res.json(safeUser)
}

export const resetUserPassword = (req, res) => {
  const { id } = req.params
  const { newPassword } = req.body

  if (!newPassword || newPassword.length < 3) {
    return res.status(400).json({ message: 'New password must be at least 3 characters!' })
  }

  const user = db.getUserById(id)
  if (!user) {
    return res.status(404).json({ message: 'User not found!' })
  }

  db.updateUser(id, { passwordHash: newPassword })
  res.json({ message: 'Password reset successfully!' })
}

export const getDebtMatrix = (req, res) => {
  const users = db.getUsers()
  const debts = db.getDebts().filter(d => d.status !== 'confirmed')

  const matrix = {}
  users.forEach(debtor => {
    matrix[debtor.id] = {}
    users.forEach(creditor => {
      matrix[debtor.id][creditor.id] = 0
    })
  })

  debts.forEach(d => {
    if (matrix[d.debtorId] && matrix[d.debtorId][d.creditorId] !== undefined) {
      matrix[d.debtorId][d.creditorId] += d.amount
    }
  })

  res.json({ users: users.map(({ passwordHash, ...u }) => u), matrix })
}
