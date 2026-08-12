import { defineStore } from 'pinia'
import { ref } from 'vue'
import { INITIAL_MEALS } from '../mock/seedData'
import { useDebtsStore } from './debts'
import { useNotificationsStore } from './notifications'
import { formatCurrency } from '../utils/currency'
import i18n from '../i18n'
import api from '../services/api'

export const useMealsStore = defineStore('meals', () => {
  const meals = ref(JSON.parse(localStorage.getItem('mealmate_meals')) || INITIAL_MEALS)

  function saveMeals() {
    localStorage.setItem('mealmate_meals', JSON.stringify(meals.value))
  }

  async function fetchMeals() {
    try {
      const data = await api.get('/meals')
      if (Array.isArray(data)) {
        meals.value = data
        saveMeals()
      }
    } catch (err) {
      console.warn('Backend fetchMeals failed, using local state:', err.message)
    }
  }

  function getMealById(id) {
    return meals.value.find(m => m.id === id)
  }

  async function createMeal(mealData) {
    const debtsStore = useDebtsStore()
    const notificationsStore = useNotificationsStore()

    let newMeal = null
    try {
      const data = await api.post('/meals', mealData)
      if (data?.id) {
        newMeal = data
        meals.value.unshift(newMeal)
        saveMeals()
        await debtsStore.fetchDebts()
        return newMeal
      }
    } catch (err) {
      console.warn('Backend createMeal failed, falling back to local creation:', err.message)
    }

    // Local Fallback
    const mealId = `m-${Date.now()}`
    newMeal = {
      id: mealId,
      title: mealData.title,
      totalAmount: Number(mealData.totalAmount),
      currency: mealData.currency || 'LAK',
      paidById: mealData.paidById,
      groupId: mealData.groupId || null,
      receiptUrl: mealData.receiptUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop',
      splitType: mealData.splitType, // 'equal' | 'custom'
      participants: mealData.participants,
      customSplits: mealData.customSplits || {},
      createdAt: new Date().toISOString()
    }

    meals.value.unshift(newMeal)
    saveMeals()

    // Calculate individual payment obligations via Greedy Multi-Payer Settlement
    const participants = mealData.participants || []
    const totalBill = Number(mealData.totalAmount || 0)
    const payerType = mealData.payerType || 'single'
    const paidAmounts = mealData.paidAmounts || {}
    const splitType = mealData.splitType || 'equal'
    const customSplits = mealData.customSplits || {}

    const equalShare = participants.length ? Math.round(totalBill / participants.length) : 0

    // Compute net balance for each participant: net = upfrontPaid - fairShare
    const creditors = []
    const debtors = []

    participants.forEach(pid => {
      const upfrontPaid = payerType === 'single'
        ? (pid === mealData.paidById ? totalBill : 0)
        : Number(paidAmounts[pid] || 0)

      const fairShare = splitType === 'equal'
        ? equalShare
        : Number(customSplits[pid] || 0)

      const net = upfrontPaid - fairShare
      if (net > 0) {
        creditors.push({ id: pid, amount: net })
      } else if (net < 0) {
        debtors.push({ id: pid, amount: -net })
      }
    })

    // Sort to optimize minimal transactions
    creditors.sort((a, b) => b.amount - a.amount)
    debtors.sort((a, b) => b.amount - a.amount)

    let cIdx = 0
    let dIdx = 0
    const locale = i18n.global.locale.value || 'lo'

    while (cIdx < creditors.length && dIdx < debtors.length) {
      const creditor = creditors[cIdx]
      const debtor = debtors[dIdx]

      const transferAmount = Math.min(creditor.amount, debtor.amount)
      if (transferAmount > 0) {
        debtsStore.createPayment({
          mealId,
          debtorId: debtor.id,
          creditorId: creditor.id,
          amount: transferAmount
        })

        // Send notification to debtor
        notificationsStore.addNotification({
          userId: debtor.id,
          title: i18n.global.t('notifications.new_meal_split_title'),
          message: i18n.global.t('notifications.new_meal_split_msg', {
            title: newMeal.title,
            amount: formatCurrency(transferAmount, newMeal.currency, locale)
          })
        })
      }

      creditor.amount -= transferAmount
      debtor.amount -= transferAmount

      if (creditor.amount <= 0) cIdx++
      if (debtor.amount <= 0) dIdx++
    }

    return newMeal
  }

  async function deleteMeal(mealId) {
    const debtsStore = useDebtsStore()
    try {
      await api.delete(`/meals/${mealId}`)
    } catch (err) {
      console.warn('Backend deleteMeal failed, using local fallback:', err.message)
    }
    meals.value = meals.value.filter(m => m.id !== mealId)
    saveMeals()
    debtsStore.deletePaymentsByMealId(mealId)
  }

  return {
    meals,
    fetchMeals,
    getMealById,
    createMeal,
    deleteMeal,
    saveMeals
  }
})
