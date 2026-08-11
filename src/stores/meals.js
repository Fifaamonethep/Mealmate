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
      if (data.meal) {
        newMeal = data.meal
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

    // Calculate individual payment obligations
    const debtors = mealData.participants.filter(id => id !== mealData.paidById)
    
    let amountPerPerson = 0
    if (mealData.splitType === 'equal') {
      amountPerPerson = Math.round(Number(mealData.totalAmount) / mealData.participants.length)
    }

    const locale = i18n.global.locale.value || 'lo'

    debtors.forEach(debtorId => {
      const debtAmount = mealData.splitType === 'equal' 
        ? amountPerPerson 
        : Number(mealData.customSplits[debtorId] || 0)

      if (debtAmount > 0) {
        debtsStore.createPayment({
          mealId,
          debtorId,
          creditorId: mealData.paidById,
          amount: debtAmount
        })

        // Send notification to debtor
        notificationsStore.addNotification({
          userId: debtorId,
          title: i18n.global.t('notifications.new_meal_split_title'),
          message: i18n.global.t('notifications.new_meal_split_msg', {
            title: newMeal.title,
            amount: formatCurrency(debtAmount, newMeal.currency, locale)
          })
        })
      }
    })

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
