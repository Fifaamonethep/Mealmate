import { db } from '../config/db.js'

export const getDebts = (req, res) => {
  res.json(db.getDebts())
}

export const sendSlip = (req, res) => {
  const debtId = req.params.id
  const { slipUrl } = req.body

  if (!slipUrl) {
    return res.status(400).json({ message: 'Payment slip URL or image required!' })
  }

  const debt = db.getDebtById(debtId)
  if (!debt) {
    return res.status(404).json({ message: 'Debt payment record not found!' })
  }

  const updated = db.updateDebt(debtId, {
    status: 'slip_sent',
    slipUrl,
    rejectReason: null
  })

  const debtor = db.getUserById(debt.debtorId)
  const meal = db.getMealById(debt.mealId)

  // Notify creditor
  db.addNotification({
    id: `n-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId: debt.creditorId,
    title: 'Bill chuyển khoản mới',
    message: `${debtor?.name || 'Bạn bè'} vừa gửi ảnh bill chuyển khoản cho khoản nợ ${debt.amount.toLocaleString()} ${meal?.currency || 'VND'}. Vui lòng kiểm tra và xác nhận.`,
    isRead: false,
    createdAt: new Date().toISOString()
  })

  res.json(updated)
}

export const confirmPayment = (req, res) => {
  const debtId = req.params.id
  const debt = db.getDebtById(debtId)
  if (!debt) {
    return res.status(404).json({ message: 'Debt record not found!' })
  }

  const updated = db.updateDebt(debtId, { status: 'confirmed' })
  const meal = db.getMealById(debt.mealId)

  // Notify debtor
  db.addNotification({
    id: `n-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId: debt.debtorId,
    title: 'Thanh toán đã được duyệt! 🎉',
    message: `Chủ nợ đã xác nhận nhận đủ tiền chuyển khoản (${debt.amount.toLocaleString()} ${meal?.currency || 'LAK'}). Khoản nợ đã hoàn tất.`,
    isRead: false,
    createdAt: new Date().toISOString()
  })

  res.json(updated)
}

export const rejectPayment = (req, res) => {
  const debtId = req.params.id
  const { reason } = req.body
  const debt = db.getDebtById(debtId)
  if (!debt) {
    return res.status(404).json({ message: 'Debt record not found!' })
  }

  const updated = db.updateDebt(debtId, {
    status: 'rejected',
    rejectReason: reason || 'Bị từ chối bởi chủ nợ'
  })

  // Notify debtor
  db.addNotification({
    id: `n-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId: debt.debtorId,
    title: 'Thanh toán bị từ chối ⚠️',
    message: `Bill chuyển khoản của bạn bị từ chối với lý do: "${updated.rejectReason}". Vui lòng kiểm tra lại!`,
    isRead: false,
    createdAt: new Date().toISOString()
  })

  res.json(updated)
}

export const forceAdminAction = (req, res) => {
  const debtId = req.params.id
  const { status, reason } = req.body

  const debt = db.getDebtById(debtId)
  if (!debt) {
    return res.status(404).json({ message: 'Debt record not found!' })
  }

  const updates = { status }
  if (status === 'rejected') {
    updates.rejectReason = reason || 'Admin action'
  } else {
    updates.rejectReason = null
  }

  const updated = db.updateDebt(debtId, updates)

  // Notify both
  ['debtorId', 'creditorId'].forEach(field => {
    db.addNotification({
      id: `n-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: debt[field],
      title: 'Admin đã cập nhật trạng thái nợ',
      message: `Admin đã thay đổi trạng thái khoản nợ sang [${status.toUpperCase()}].`,
      isRead: false,
      createdAt: new Date().toISOString()
    })
  })

  res.json(updated)
}
