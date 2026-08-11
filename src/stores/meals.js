import { defineStore } from 'pinia'
import { ref } from 'vue'
import { INITIAL_MEALS } from '../mock/seedData'
import { useDebtsStore } from './debts'
import { useNotificationsStore } from './notifications'
import { formatCurrency } from '../utils/currency'
import i18n from '../i18n'

export const useMealsStore = defineStore('meals', () => {
  const meals = ref(JSON.parse(localStorage.getItem('mealmate_meals')) || INITIAL_MEALS)

  function saveMeals() {
    localStorage.setItem('mealmate_meals', JSON.stringify(meals.value))
  }

  function getMealById(id) {
    return meals.value.find(m => m.id === id)
  }

  function createMeal(mealData) {
    const debtsStore = useDebtsStore()
    const notificationsStore = useNotificationsStore()

    const mealId = `m-${Date.now()}`
    const newMeal = {
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

    const locale = i18n.global.locale.value || 'vi'

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

  function deleteMeal(mealId) {
    const debtsStore = useDebtsStore()
    meals.value = meals.value.filter(m => m.id !== mealId)
    saveMeals()
    debtsStore.deletePaymentsByMealId(mealId)
  }

  return {
    meals,
    getMealById,
    createMeal,
    deleteMeal,
    saveMeals
  }
})
