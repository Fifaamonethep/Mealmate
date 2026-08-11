import { defineStore } from 'pinia'
import { ref } from 'vue'
import { INITIAL_PAYMENTS } from '../mock/seedData'
import { useNotificationsStore } from './notifications'
import { useAuthStore } from './auth'
import { useToastStore } from './toast'
import { useMealsStore } from './meals'
import { formatCurrency } from '../utils/currency'
import i18n from '../i18n'
import api from '../services/api'

export const useDebtsStore = defineStore('debts', () => {
  const payments = ref(JSON.parse(localStorage.getItem('mealmate_payments')) || INITIAL_PAYMENTS)

  function savePayments() {
    localStorage.setItem('mealmate_payments', JSON.stringify(payments.value))
  }

  async function fetchDebts() {
    try {
      const data = await api.get('/debts')
      if (Array.isArray(data)) {
        payments.value = data
        savePayments()
      }
    } catch (err) {
      console.warn('Backend fetchDebts failed, using local state:', err.message)
    }
  }

  function createPayment(paymentData) {
    const newPayment = {
      id: `p-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      mealId: paymentData.mealId,
      debtorId: paymentData.debtorId,
      creditorId: paymentData.creditorId,
      amount: Number(paymentData.amount),
      status: 'pending',
      slipUrl: null,
      rejectReason: null,
      createdAt: new Date().toISOString()
    }
    payments.value.unshift(newPayment)
    savePayments()
    return newPayment
  }

  async function sendSlip(paymentId, slipUrl) {
    const notifStore = useNotificationsStore()
    const authStore = useAuthStore()
    const toastStore = useToastStore()
    const mealsStore = useMealsStore()

    try {
      const data = await api.put(`/debts/${paymentId}/slip`, { slipUrl })
      if (data.payment) {
        const idx = payments.value.findIndex(p => p.id === paymentId)
        if (idx !== -1) payments.value[idx] = data.payment
        savePayments()
        toastStore.showToast(i18n.global.t('debts.slip_sent_toast'), 'success')
        return
      }
    } catch (err) {
      console.warn('Backend sendSlip failed, using local fallback:', err.message)
    }

    // Local Fallback
    const p = payments.value.find(item => item.id === paymentId)
    if (!p) return

    p.status = 'slip_sent'
    p.slipUrl = slipUrl
    p.rejectReason = null
    savePayments()

    const meal = mealsStore.getMealById(p.mealId)
    const currency = meal?.currency || 'LAK'
    const locale = i18n.global.locale.value || 'lo'

    const senderName = authStore.users.find(u => u.id === p.debtorId)?.name || 'Friends'
    notifStore.addNotification({
      userId: p.creditorId,
      title: i18n.global.t('notifications.notif_new_slip_title'),
      message: i18n.global.t('notifications.notif_new_slip_msg', { senderName, amount: formatCurrency(p.amount, currency, locale) })
    })
    toastStore.showToast(i18n.global.t('debts.slip_sent_toast'), 'success')
  }

  async function confirmPayment(paymentId) {
    const notifStore = useNotificationsStore()
    const toastStore = useToastStore()
    const mealsStore = useMealsStore()

    try {
      const data = await api.put(`/debts/${paymentId}/confirm`)
      if (data.payment) {
        const idx = payments.value.findIndex(p => p.id === paymentId)
        if (idx !== -1) payments.value[idx] = data.payment
        savePayments()
        toastStore.showToast(i18n.global.t('debts.payment_approved_toast'), 'success')
        return
      }
    } catch (err) {
      console.warn('Backend confirmPayment failed, using local fallback:', err.message)
    }

    // Local Fallback
    const p = payments.value.find(item => item.id === paymentId)
    if (!p) return

    p.status = 'confirmed'
    savePayments()

    const meal = mealsStore.getMealById(p.mealId)
    const currency = meal?.currency || 'LAK'
    const locale = i18n.global.locale.value || 'lo'

    notifStore.addNotification({
      userId: p.debtorId,
      title: i18n.global.t('notifications.notif_approved_title'),
      message: i18n.global.t('notifications.notif_approved_msg', { amount: formatCurrency(p.amount, currency, locale) })
    })
    toastStore.showToast(i18n.global.t('debts.payment_approved_toast'), 'success')
  }

  async function rejectPayment(paymentId, reason) {
    const notifStore = useNotificationsStore()
    const toastStore = useToastStore()

    try {
      const data = await api.put(`/debts/${paymentId}/reject`, { reason })
      if (data.payment) {
        const idx = payments.value.findIndex(p => p.id === paymentId)
        if (idx !== -1) payments.value[idx] = data.payment
        savePayments()
        toastStore.showToast(i18n.global.t('debts.payment_rejected_toast'), 'warning')
        return
      }
    } catch (err) {
      console.warn('Backend rejectPayment failed, using local fallback:', err.message)
    }

    // Local Fallback
    const p = payments.value.find(item => item.id === paymentId)
    if (!p) return

    p.status = 'rejected'
    p.rejectReason = reason || i18n.global.t('debts.payment_rejected_toast')
    savePayments()

    notifStore.addNotification({
      userId: p.debtorId,
      title: i18n.global.t('notifications.notif_rejected_title'),
      message: i18n.global.t('notifications.notif_rejected_msg', { reason: p.rejectReason })
    })
    toastStore.showToast(i18n.global.t('debts.payment_rejected_toast'), 'warning')
  }

  async function forceAdminAction(paymentId, status, reason = '') {
    const notifStore = useNotificationsStore()
    const toastStore = useToastStore()

    try {
      const data = await api.put(`/debts/${paymentId}/force`, { status, reason })
      if (data.payment) {
        const idx = payments.value.findIndex(p => p.id === paymentId)
        if (idx !== -1) payments.value[idx] = data.payment
        savePayments()
        toastStore.showToast(i18n.global.t('debts.admin_status_changed_toast', { status: status.toUpperCase() }), 'info')
        return
      }
    } catch (err) {
      console.warn('Backend forceAdminAction failed, using local fallback:', err.message)
    }

    // Local Fallback
    const p = payments.value.find(item => item.id === paymentId)
    if (!p) return

    p.status = status
    if (status === 'rejected') {
      p.rejectReason = reason || 'Admin action'
    } else {
      p.rejectReason = null
    }
    savePayments()

    notifStore.addNotification({
      userId: p.debtorId,
      title: i18n.global.t('notifications.notif_admin_update_title'),
      message: i18n.global.t('notifications.notif_admin_update_msg', { status: status.toUpperCase() })
    })
    notifStore.addNotification({
      userId: p.creditorId,
      title: i18n.global.t('notifications.notif_admin_update_title'),
      message: i18n.global.t('notifications.notif_admin_update_msg', { status: status.toUpperCase() })
    })
    toastStore.showToast(i18n.global.t('debts.admin_status_changed_toast', { status: status.toUpperCase() }), 'info')
  }

  function deletePaymentsByMealId(mealId) {
    payments.value = payments.value.filter(p => p.mealId !== mealId)
    savePayments()
  }

  return {
    payments,
    fetchDebts,
    createPayment,
    sendSlip,
    confirmPayment,
    rejectPayment,
    forceAdminAction,
    deletePaymentsByMealId,
    savePayments
  }
})
