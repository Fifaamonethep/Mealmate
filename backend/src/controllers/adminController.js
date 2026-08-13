import { db } from '../config/db.js'

export const getUsers = async (req, res) => {
  try {
    const allUsers = await db.getUsers()
    const users = allUsers.map(({ passwordHash, ...u }) => u)
    res.json(users)
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to fetch users' })
  }
}

export const toggleLockUser = async (req, res) => {
  try {
    const { id } = req.params
    const user = await db.getUserById(id)
    if (!user) {
      return res.status(404).json({ message: 'User not found!' })
    }

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot lock Admin account!' })
    }

    const updated = await db.updateUser(id, { isLocked: !user.isLocked })
    const { passwordHash, ...safeUser } = updated
    res.json(safeUser)
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to toggle user lock state' })
  }
}

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params
    const { role } = req.body

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role!' })
    }

    const user = await db.getUserById(id)
    if (!user) {
      return res.status(404).json({ message: 'User not found!' })
    }

    const updated = await db.updateUser(id, { role })
    const { passwordHash, ...safeUser } = updated
    res.json(safeUser)
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to update user role' })
  }
}

export const resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params
    const { newPassword } = req.body

    if (!newPassword || newPassword.length < 3) {
      return res.status(400).json({ message: 'New password must be at least 3 characters!' })
    }

    const user = await db.getUserById(id)
    if (!user) {
      return res.status(404).json({ message: 'User not found!' })
    }

    await db.updateUser(id, { passwordHash: newPassword })
    res.json({ message: 'Password reset successfully!' })
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to reset password' })
  }
}

export const getDebtMatrix = async (req, res) => {
  try {
    const users = await db.getUsers()
    const debts = (await db.getDebts()).filter(d => d.status !== 'VERIFIED' && d.status !== 'confirmed')

    const matrix = {}
    users.forEach(debtor => {
      matrix[debtor.id] = {}
      users.forEach(creditor => {
        matrix[debtor.id][creditor.id] = 0
      })
    })

    debts.forEach(d => {
      const debtorId = d.fromUser || d.debtorId
      const creditorId = d.toUser || d.creditorId
      if (matrix[debtorId] && matrix[debtorId][creditorId] !== undefined) {
        matrix[debtorId][creditorId] += d.amount
      }
    })

    res.json({ users: users.map(({ passwordHash, ...u }) => u), matrix })
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to generate debt matrix' })
  }
}
