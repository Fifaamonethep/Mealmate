import { db } from '../config/db.js'

export const getUsers = (req, res) => {
  const users = db.getUsers().map(({ passwordHash, ...u }) => u)
  res.json(users)
}

export const toggleLockUser = (req, res) => {
  const { id } = req.params
  const requester = req.user
  const user = db.getUserById(id)
  if (!user) {
    return res.status(404).json({ message: 'User not found!' })
  }

  // Hierarchy check: Admin cannot lock Admin or SuperAdmin
  if (requester.role === 'admin' && (user.role === 'admin' || user.role === 'superadmin')) {
    return res.status(403).json({ message: 'Admins cannot lock other Admins or SuperAdmins!' })
  }
  if (user.id === requester.id) {
    return res.status(400).json({ message: 'You cannot lock your own account!' })
  }

  const updated = db.updateUser(id, { isLocked: !user.isLocked })
  const { passwordHash, ...safeUser } = updated
  res.json(safeUser)
}

export const updateUserRole = (req, res) => {
  const { id } = req.params
  const { role } = req.body
  const requester = req.user

  if (!['user', 'admin', 'superadmin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role!' })
  }

  const user = db.getUserById(id)
  if (!user) {
    return res.status(404).json({ message: 'User not found!' })
  }

  // Only SuperAdmin can grant or revoke SuperAdmin role
  if (role === 'superadmin' && requester.role !== 'superadmin') {
    return res.status(403).json({ message: 'Only SuperAdmin can assign the SuperAdmin role!' })
  }

  // Admins cannot change role of other Admins or SuperAdmins
  if (requester.role === 'admin' && (user.role === 'admin' || user.role === 'superadmin')) {
    return res.status(403).json({ message: 'Admins cannot change roles of other Admins or SuperAdmins!' })
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
