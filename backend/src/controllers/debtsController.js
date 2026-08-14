import { db } from '../config/db.js'
import { uploadSlipImage, getSignedSlipUrl } from '../config/supabase.js'

async function formatDebtWithSignedUrl(debt) {
  if (!debt) return null
  const signedUrl = await getSignedSlipUrl(debt.proofImage || debt.slipUrl)
  let normStatus = debt.status || 'pending'
  if (normStatus === 'PAID') normStatus = 'slip_sent'
  if (normStatus === 'VERIFIED') normStatus = 'confirmed'
  if (normStatus === 'REJECTED') normStatus = 'rejected'
  if (normStatus === 'PENDING') normStatus = 'pending'

  return {
    ...debt,
    debtorId: debt.debtorId || debt.fromUser,
    creditorId: debt.creditorId || debt.toUser,
    fromUser: debt.fromUser || debt.debtorId,
    toUser: debt.toUser || debt.creditorId,
    status: normStatus,
    proofImage: signedUrl || debt.proofImage || debt.slipUrl,
    slipUrl: signedUrl || debt.slipUrl || debt.proofImage
  }
}

export const getDebts = async (req, res) => {
  try {
    let debts = await db.getDebts()
    const currentUserId = req.user?.id
    const isAdmin = req.user?.role === 'admin'

    // Filter debts to user's authorized groups / debts
    if (currentUserId && !isAdmin) {
      const allGroups = await db.getGroups()
      const userGroupIds = new Set(
        allGroups
          .filter(g => g.ownerId === currentUserId || (g.members || []).includes(currentUserId))
          .map(g => g.id)
      )

      debts = debts.filter(d => {
        const isParty = d.fromUser === currentUserId || d.toUser === currentUserId
        const isGroupMember = d.groupId && userGroupIds.has(d.groupId)
        return isParty || isGroupMember
      })
    }

    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 20
    const total = debts.length

    let resultDebts = debts
    if (req.query.page || req.query.limit) {
      const startIndex = (page - 1) * limit
      resultDebts = debts.slice(startIndex, startIndex + limit)
    }

    const formattedDebts = await Promise.all(resultDebts.map(formatDebtWithSignedUrl))

    if (req.query.page || req.query.limit) {
      return res.json({
        data: formattedDebts,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      })
    }

    res.json(formattedDebts)
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

    const currentUserId = req.user?.id
    const isAdmin = req.user?.role === 'admin'
    const debtorId = debt.fromUser || debt.debtorId
    const creditorId = debt.toUser || debt.creditorId

    // Check group membership / authorization
    if (currentUserId && !isAdmin) {
      let isMember = false
      if (debt.groupId) {
        const group = await db.getGroupById(debt.groupId)
        if (group && ((group.members || []).includes(currentUserId) || group.ownerId === currentUserId)) {
          isMember = true
        }
      }
      if (!isMember && currentUserId !== debtorId && currentUserId !== creditorId) {
        return res.status(403).json({ message: 'Access denied: You are not a member of this group or party to this debt!' })
      }
    }

    // Upload image to private Supabase Storage if configured
    const storedPath = await uploadSlipImage(image, `${debtId}_${Date.now()}.png`)

    const updated = await db.updateDebt(debtId, {
      status: 'slip_sent',
      slipUrl: storedPath,
      proofImage: storedPath,
      rejectReason: null,
      updatedAt: new Date().toISOString()
    })

    const debtor = await db.getUserById(debtorId)
    const meal = debt.mealId ? await db.getMealById(debt.mealId) : null

    // Notify creditor
    await db.addNotification({
      id: `n-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: creditorId,
      title: 'ໃບໂອນເງິນໃໝ່ (New Payment Slip)',
      message: `${debtor?.name || 'Friend'} ໄດ້ສົ່ງໃບໂອນເງິນຈຳນວນ ${debt.amount.toLocaleString()} ${meal?.currency || 'LAK'}. ກະລຸນາກວດສອບ.`,
      type: 'DEBT',
      isRead: false,
      createdAt: new Date().toISOString()
    })

    const result = await formatDebtWithSignedUrl(updated)
    res.json(result)
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

    const currentUserId = req.user?.id
    const isAdmin = req.user?.role === 'admin'
    const creditorId = debt.toUser || debt.creditorId

    // Check group membership / creditor authorization
    if (currentUserId && !isAdmin) {
      let isMember = false
      if (debt.groupId) {
        const group = await db.getGroupById(debt.groupId)
        if (group && ((group.members || []).includes(currentUserId) || group.ownerId === currentUserId)) {
          isMember = true
        }
      }
      if (!isMember && currentUserId !== creditorId) {
        return res.status(403).json({ message: 'Access denied: You are not a member of this group or the creditor!' })
      }
    }

    const updated = await db.updateDebt(debtId, {
      status: 'confirmed',
      updatedAt: new Date().toISOString()
    })
    const meal = debt.mealId ? await db.getMealById(debt.mealId) : null
    const debtorId = debt.fromUser || debt.debtorId

    // Notify debtor
    await db.addNotification({
      id: `n-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: debtorId,
      title: 'ການຊຳລະເງິນໄດ້ຮັບການຢືນຢັນແລ້ວ! 🎉',
      message: `ເຈົ້າໜີ້ໄດ້ຢືນຢັນການຮັບເງິນ (${debt.amount.toLocaleString()} ${meal?.currency || 'LAK'}). ໜີ້ສິນສຳເລັດແລ້ວ.`,
      type: 'DEBT',
      isRead: false,
      createdAt: new Date().toISOString()
    })

    const result = await formatDebtWithSignedUrl(updated)
    res.json(result)
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

    const currentUserId = req.user?.id
    const isAdmin = req.user?.role === 'admin'
    const creditorId = debt.toUser || debt.creditorId

    // Check group membership / creditor authorization
    if (currentUserId && !isAdmin) {
      let isMember = false
      if (debt.groupId) {
        const group = await db.getGroupById(debt.groupId)
        if (group && ((group.members || []).includes(currentUserId) || group.ownerId === currentUserId)) {
          isMember = true
        }
      }
      if (!isMember && currentUserId !== creditorId) {
        return res.status(403).json({ message: 'Access denied: You are not a member of this group or the creditor!' })
      }
    }

    const updated = await db.updateDebt(debtId, {
      status: 'rejected',
      rejectReason: reason || 'Rejected by creditor',
      updatedAt: new Date().toISOString()
    })

    const debtorId = debt.fromUser || debt.debtorId

    // Notify debtor
    await db.addNotification({
      id: `n-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: debtorId,
      title: 'ການຊຳລະຖືກປະຕິເສດ ⚠️',
      message: `ໃບໂອນເງິນຂອງທ່ານຖືກປະຕິເສດຍ້ອນ: "${reason || 'Rejected by creditor'}". ກະລຸນາກວດສອບຄືນ!`,
      type: 'DEBT',
      isRead: false,
      createdAt: new Date().toISOString()
    })

    const result = await formatDebtWithSignedUrl(updated)
    res.json(result)
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
          title: 'Admin updated debt status',
          message: `Admin changed debt status to [${status.toUpperCase()}].`,
          type: 'DEBT',
          isRead: false,
          createdAt: new Date().toISOString()
        })
      }
    }

    const result = await formatDebtWithSignedUrl(updated)
    res.json(result)
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to update debt' })
  }
}

