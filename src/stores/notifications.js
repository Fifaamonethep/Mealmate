import { defineStore } from 'pinia'
import { ref } from 'vue'
import { INITIAL_NOTIFICATIONS } from '../mock/seedData'

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref(JSON.parse(localStorage.getItem('mealmate_notifications')) || INITIAL_NOTIFICATIONS)

  function saveNotifications() {
    localStorage.setItem('mealmate_notifications', JSON.stringify(notifications.value))
  }

  function addNotification({ userId, title, message }) {
    const newNotif = {
      id: `n-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      userId,
      title,
      message,
      isRead: false,
      createdAt: new Date().toISOString()
    }
    notifications.value.unshift(newNotif)
    saveNotifications()
    return newNotif
  }

  function markAsRead(id) {
    const n = notifications.value.find(item => item.id === id)
    if (n) {
      n.isRead = true
      saveNotifications()
    }
  }

  function markAllAsRead(userId) {
    notifications.value.forEach(n => {
      if (n.userId === userId) {
        n.isRead = true
      }
    })
    saveNotifications()
  }

  // Trigger auto reminder simulation for debts older than 3 days
  function triggerOverdueReminderCheck(payments, currentUserId) {
    const threeDaysAgo = Date.now() - 3 * 86400000
    payments.forEach(p => {
      if (p.debtorId === currentUserId && p.status === 'pending') {
        const createdTime = new Date(p.createdAt).getTime()
        if (createdTime < threeDaysAgo) {
          const exists = notifications.value.some(
            n => n.userId === currentUserId && n.message.includes(`khoản nợ ${p.amount.toLocaleString()}`)
          )
          if (!exists) {
            addNotification({
              userId: currentUserId,
              title: '⏰ Nhắc nợ tự động (>3 ngày)',
              message: `Bạn chưa thanh toán khoản nợ ${p.amount.toLocaleString()} VND. Vui lòng hoàn tất trả nợ!`
            })
          }
        }
      }
    })
  }

  return {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    triggerOverdueReminderCheck,
    saveNotifications
  }
})
