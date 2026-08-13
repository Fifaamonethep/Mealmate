import { db } from '../config/db.js'

export const getDebts = async (req, res) => {
  try {
    let debts = await db.getDebts()
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 20
    const total = debts.length

    if (req.query.page || req.query.limit) {
      const startIndex = (page - 1) * limit
      const paginated = debts.slice(startIndex, startIndex + limit)
      return res.json({
        data: paginated,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      })
    }

    res.json(debts)
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to fetch debts' })
  }
}

export const sendSlip = async (req, res) => {
  try {
    const debtId = req.params.id
    const { slipUrl, proofImage } = req.body
    const image = slipUrl || proofImage

    if (!image) {
      return res.status(400).json({ message: 'Payment slip URL or image required!' })
    }

    // Basic URL / data URI format validation
    const isValidImage = typeof image === 'string' && (
      image.startsWith('data:image/') ||
      image.startsWith('http://') ||
      image.startsWith('https://')
    )

    if (!isValidImage) {
      return res.status(400).json({ message: 'Invalid payment slip image format!' })
    }

    const debt = await db.getDebtById(debtId)
    if (!debt) {
      return res.status(404).json({ message: 'Debt payment record not found!' })
    }

    const updated = await db.updateDebt(debtId, {
      status: 'PAID',
      slipUrl: image,
      proofImage: image,
      rejectReason: null,
      updatedAt: new Date().toISOString()
    })

    const debtorId = debt.fromUser || debt.debtorId
    const creditorId = debt.toUser || debt.creditorId

    const debtor = await db.getUserById(debtorId)
    const meal = debt.mealId ? await db.getMealById(debt.mealId) : null

    // Notify creditor
    await db.addNotification({
      id: `n-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: creditorId,
      title: 'Bill chuyển khoản mới',
      message: `${debtor?.name || 'Bạn bè'} vừa gửi ảnh bill chuyển khoản cho khoản nợ ${debt.amount.toLocaleString()} ${meal?.currency || 'LAK'}. Vui lòng kiểm tra và xác nhận.`,
      type: 'DEBT',
      isRead: false,
      createdAt: new Date().toISOString()
    })

    res.json(updated)
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to send slip' })
  }
}

export const confirmPayment = async (req, res) => {
  try {
    const debtId = req.params.id
    const debt = await db.getDebtById(debtId)
    if (!debt) {
      return res.status(404).json({ message: 'Debt record not found!' })
    }

    const updated = await db.updateDebt(debtId, {
      status: 'VERIFIED',
      updatedAt: new Date().toISOString()
    })
    const meal = debt.mealId ? await db.getMealById(debt.mealId) : null

    const debtorId = debt.fromUser || debt.debtorId

    // Notify debtor
    await db.addNotification({
      id: `n-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: debtorId,
      title: 'Thanh toán đã được duyệt! 🎉',
      message: `Chủ nợ đã xác nhận nhận đủ tiền chuyển khoản (${debt.amount.toLocaleString()} ${meal?.currency || 'LAK'}). Khoản nợ đã hoàn tất.`,
      type: 'DEBT',
      isRead: false,
      createdAt: new Date().toISOString()
    })

    res.json(updated)
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to confirm payment' })
  }
}

export const rejectPayment = async (req, res) => {
  try {
    const debtId = req.params.id
    const { reason } = req.body
    const debt = await db.getDebtById(debtId)
    if (!debt) {
      return res.status(404).json({ message: 'Debt record not found!' })
    }

    const updated = await db.updateDebt(debtId, {
      status: 'REJECTED',
      rejectReason: reason || 'Bị từ chối bởi chủ nợ',
      updatedAt: new Date().toISOString()
    })

    const debtorId = debt.fromUser || debt.debtorId

    // Notify debtor
    await db.addNotification({
      id: `n-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: debtorId,
      title: 'Thanh toán bị từ chối ⚠️',
      message: `Bill chuyển khoản của bạn bị từ chối với lý do: "${reason || 'Bị từ chối bởi chủ nợ'}". Vui lòng kiểm tra lại!`,
      type: 'DEBT',
      isRead: false,
      createdAt: new Date().toISOString()
    })

    res.json(updated)
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to reject payment' })
  }
}

export const forceAdminAction = async (req, res) => {
  try {
    const debtId = req.params.id
    const { status, reason } = req.body

    const debt = await db.getDebtById(debtId)
    if (!debt) {
      return res.status(404).json({ message: 'Debt record not found!' })
    }

    const updates = { status, updatedAt: new Date().toISOString() }
    if (status === 'REJECTED' || status === 'rejected') {
      updates.rejectReason = reason || 'Admin action'
    } else {
      updates.rejectReason = null
    }

    const updated = await db.updateDebt(debtId, updates)

    const debtorId = debt.fromUser || debt.debtorId
    const creditorId = debt.toUser || debt.creditorId

    // Notify both
    for (const uid of [debtorId, creditorId]) {
      if (uid) {
        await db.addNotification({
          id: `n-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          userId: uid,
          title: 'Admin đã cập nhật trạng thái nợ',
          message: `Admin đã thay đổi trạng thái khoản nợ sang [${status.toUpperCase()}].`,
          type: 'DEBT',
          isRead: false,
          createdAt: new Date().toISOString()
        })
      }
    }

    res.json(updated)
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to update debt' })
  }
}
