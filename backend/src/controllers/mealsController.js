import { db } from '../config/db.js'

export const getMeals = async (req, res) => {
  try {
    const meals = await db.getMeals()
    res.json(meals)
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to fetch meals' })
  }
}

export const getMealById = async (req, res) => {
  try {
    const meal = await db.getMealById(req.params.id)
    if (!meal) {
      return res.status(404).json({ message: 'Meal not found!' })
    }
    res.json(meal)
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to fetch meal' })
  }
}

export const createMeal = async (req, res) => {
  try {
    const { title, totalAmount, currency, paidById, paidBy, groupId, receiptUrl, imageUrl, splitType, participants, customSplits, splitDetails } = req.body

    const payer = paidById || paidBy
    if (!title || !totalAmount || !payer || !participants || participants.length === 0) {
      return res.status(400).json({ message: 'Missing required meal fields!' })
    }

    const mealId = `m-${Date.now()}`
    const newMeal = {
      id: mealId,
      title,
      totalAmount: Number(totalAmount),
      currency: currency || 'LAK',
      paidBy: payer,
      paidById: payer,
      groupId: groupId || null,
      imageUrl: imageUrl || receiptUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop',
      splitType: splitType || 'EQUAL',
      participants,
      splitDetails: splitDetails || customSplits || {},
      createdAt: new Date().toISOString()
    }

    const createdMeal = await db.addMeal(newMeal)

    // Calculate debts for debtors
    const debtors = participants.filter(id => id !== payer)
    let equalShare = Math.round(Number(totalAmount) / participants.length)

    for (const debtorId of debtors) {
      const debtAmount = (splitType?.toUpperCase() === 'EQUAL' || splitType === 'equal')
        ? equalShare
        : Number(customSplits?.[debtorId] || splitDetails?.[debtorId] || 0)

      if (debtAmount > 0) {
        await db.addDebt({
          id: `p-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          mealId,
          groupId: groupId || null,
          fromUser: debtorId,
          toUser: payer,
          debtorId,
          creditorId: payer,
          amount: debtAmount,
          status: 'PENDING',
          proofImage: null,
          createdAt: new Date().toISOString()
        })

        // Add notification for debtor
        await db.addNotification({
          id: `n-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          userId: debtorId,
          title: 'Bữa ăn mới cần chia tiền',
          message: `Bạn được thêm vào bữa ăn "${newMeal.title}". Bạn nợ ${debtAmount.toLocaleString()} ${newMeal.currency}.`,
          type: 'MEAL',
          isRead: false,
          createdAt: new Date().toISOString()
        })
      }
    }

    res.status(201).json(createdMeal)
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to create meal' })
  }
}

export const deleteMeal = async (req, res) => {
  try {
    const mealId = req.params.id
    const meal = await db.getMealById(mealId)
    if (!meal) {
      return res.status(404).json({ message: 'Meal not found!' })
    }

    await db.deleteMeal(mealId)
    res.json({ message: 'Meal deleted successfully!' })
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to delete meal' })
  }
}
