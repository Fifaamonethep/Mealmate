import { defineStore } from 'pinia'
import { ref } from 'vue'
import { INITIAL_NOTIFICATIONS } from '../mock/seedData'
import { formatCurrency } from '../utils/currency'
import i18n from '../i18n'
import api from '../services/api'

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref(JSON.parse(localStorage.getItem('mealmate_notifications')) || INITIAL_NOTIFICATIONS)

  function saveNotifications() {
    localStorage.setItem('mealmate_notifications', JSON.stringify(notifications.value))
  }

  async function fetchNotifications() {
    try {
      const data = await api.get('/notifications')
      if (Array.isArray(data)) {
        notifications.value = data
        saveNotifications()
      }
    } catch (err) {
      console.warn('Backend fetchNotifications failed, using local state:', err.message)
    }
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

  async function markAllAsRead(userId) {
    try {
      await api.put('/notifications/read-all')
    } catch (err) {
      console.warn('Backend markAllAsRead failed, using local fallback:', err.message)
    }

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
    const locale = i18n.global.locale.value || 'lo'

    payments.forEach(p => {
      if (p.debtorId === currentUserId && p.status === 'pending') {
        const createdTime = new Date(p.createdAt).getTime()
        if (createdTime < threeDaysAgo) {
          const formattedAmt = formatCurrency(p.amount, 'LAK', locale)
          const exists = notifications.value.some(
            n => n.userId === currentUserId && (n.message.includes(`${p.amount}`) || n.message.includes(formattedAmt))
          )
          if (!exists) {
            addNotification({
              userId: currentUserId,
              title: i18n.global.t('notifications.overdue_reminder_title'),
              message: i18n.global.t('notifications.overdue_reminder_msg', { amount: formattedAmt })
            })
          }
        }
      }
    })
  }

  return {
    notifications,
    fetchNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    triggerOverdueReminderCheck,
    saveNotifications
  }
})
