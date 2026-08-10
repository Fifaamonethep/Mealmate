import { defineStore } from 'pinia'
import { ref } from 'vue'
import { INITIAL_PAYMENTS } from '../mock/seedData'
import { useNotificationsStore } from './notifications'
import { useAuthStore } from './auth'
import { useToastStore } from './toast'

export const useDebtsStore = defineStore('debts', () => {
  const payments = ref(JSON.parse(localStorage.getItem('mealmate_payments')) || INITIAL_PAYMENTS)

  function savePayments() {
    localStorage.setItem('mealmate_payments', JSON.stringify(payments.value))
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

  function sendSlip(paymentId, slipUrl) {
    const notifStore = useNotificationsStore()
    const authStore = useAuthStore()
    const toastStore = useToastStore()
    const p = payments.value.find(item => item.id === paymentId)
    if (!p) return

    p.status = 'slip_sent'
    p.slipUrl = slipUrl
    p.rejectReason = null
    savePayments()

    const senderName = authStore.users.find(u => u.id === p.debtorId)?.name || 'Bạn bè'
    notifStore.addNotification({
      userId: p.creditorId,
      title: 'Hóa đơn thanh toán mới',
      message: `${senderName} vừa gửi ảnh bill chuyển khoản cho khoản nợ ${p.amount.toLocaleString()} VND. Vui lòng kiểm tra và xác nhận.`
    })
    toastStore.showToast('Đã gửi ảnh bill chuyển khoản thành công!', 'success')
  }

  function confirmPayment(paymentId) {
    const notifStore = useNotificationsStore()
    const toastStore = useToastStore()
    const p = payments.value.find(item => item.id === paymentId)
    if (!p) return

    p.status = 'confirmed'
    savePayments()

    notifStore.addNotification({
      userId: p.debtorId,
      title: 'Thanh toán đã được duyệt! 🎉',
      message: `Chủ nợ đã xác nhận nhận đủ tiền chuyển khoản (${p.amount.toLocaleString()} VND). Khoản nợ đã hoàn tất.`
    })
    toastStore.showToast('Đã xác nhận duyệt bill thanh toán!', 'success')
  }

  function rejectPayment(paymentId, reason) {
    const notifStore = useNotificationsStore()
    const toastStore = useToastStore()
    const p = payments.value.find(item => item.id === paymentId)
    if (!p) return

    p.status = 'rejected'
    p.rejectReason = reason || 'Thông tin chuyển khoản không trùng khớp.'
    savePayments()

    notifStore.addNotification({
      userId: p.debtorId,
      title: 'Thanh toán bị từ chối ⚠️',
      message: `Bill chuyển khoản của bạn bị từ chối với lý do: "${p.rejectReason}". Vui lòng kiểm tra lại!`
    })
    toastStore.showToast('Đã từ chối bill thanh toán', 'warning')
  }

  function forceAdminAction(paymentId, status, reason = '') {
    const notifStore = useNotificationsStore()
    const toastStore = useToastStore()
    const p = payments.value.find(item => item.id === paymentId)
    if (!p) return

    p.status = status
    if (status === 'rejected') {
      p.rejectReason = reason || 'Admin đã can thiệp từ chối giao dịch.'
    } else {
      p.rejectReason = null
    }
    savePayments()

    notifStore.addNotification({
      userId: p.debtorId,
      title: 'Admin đã cập nhật trạng thái nợ',
      message: `Admin đã thay đổi trạng thái khoản nợ sang [${status.toUpperCase()}].`
    })
    notifStore.addNotification({
      userId: p.creditorId,
      title: 'Admin đã cập nhật trạng thái nợ',
      message: `Admin đã thay đổi trạng thái khoản nợ sang [${status.toUpperCase()}].`
    })
    toastStore.showToast(`Admin đã đổi trạng thái nợ sang ${status.toUpperCase()}`, 'info')
  }

  function deletePaymentsByMealId(mealId) {
    payments.value = payments.value.filter(p => p.mealId !== mealId)
    savePayments()
  }

  return {
    payments,
    createPayment,
    sendSlip,
    confirmPayment,
    rejectPayment,
    forceAdminAction,
    deletePaymentsByMealId,
    savePayments
  }
})
