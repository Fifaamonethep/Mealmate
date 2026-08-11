import { db } from '../config/db.js'

export const getMeals = (req, res) => {
  res.json(db.getMeals())
}

export const getMealById = (req, res) => {
  const meal = db.getMealById(req.params.id)
  if (!meal) {
    return res.status(404).json({ message: 'Meal not found!' })
  }
  res.json(meal)
}

export const createMeal = (req, res) => {
  const { title, totalAmount, currency, paidById, groupId, receiptUrl, splitType, participants, customSplits } = req.body

  if (!title || !totalAmount || !paidById || !participants || participants.length === 0) {
    return res.status(400).json({ message: 'Missing required meal fields!' })
  }

  const mealId = `m-${Date.now()}`
  const newMeal = {
    id: mealId,
    title,
    totalAmount: Number(totalAmount),
    currency: currency || 'VND',
    paidById,
    groupId: groupId || null,
    receiptUrl: receiptUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop',
    splitType: splitType || 'equal',
    participants,
    customSplits: customSplits || {},
    createdAt: new Date().toISOString()
  }

  db.addMeal(newMeal)

  // Calculate debts for debtors
  const debtors = participants.filter(id => id !== paidById)
  let equalShare = Math.round(Number(totalAmount) / participants.length)

  debtors.forEach(debtorId => {
    const debtAmount = splitType === 'equal'
      ? equalShare
      : Number(customSplits?.[debtorId] || 0)

    if (debtAmount > 0) {
      db.addDebt({
        id: `p-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        mealId,
        debtorId,
        creditorId: paidById,
        amount: debtAmount,
        status: 'pending',
        slipUrl: null,
        rejectReason: null,
        createdAt: new Date().toISOString()
      })

      // Add notification for debtor
      db.addNotification({
        id: `n-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        userId: debtorId,
        title: 'Bữa ăn mới cần chia tiền',
        message: `Bạn được thêm vào bữa ăn "${newMeal.title}". Bạn nợ ${debtAmount.toLocaleString()} ${newMeal.currency}.`,
        isRead: false,
        createdAt: new Date().toISOString()
      })
    }
  })

  res.status(201).json(newMeal)
}

export const deleteMeal = (req, res) => {
  const mealId = req.params.id
  const meal = db.getMealById(mealId)
  if (!meal) {
    return res.status(404).json({ message: 'Meal not found!' })
  }

  db.deleteMeal(mealId)
  res.json({ message: 'Meal deleted successfully!' })
}
