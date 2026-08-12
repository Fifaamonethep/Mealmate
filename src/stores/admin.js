import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useAuthStore } from './auth'
import { useMealsStore } from './meals'
import { useDebtsStore } from './debts'
import api from '../services/api'

export const useAdminStore = defineStore('admin', () => {
  const authStore = useAuthStore()
  const mealsStore = useMealsStore()
  const debtsStore = useDebtsStore()

  const systemMetrics = computed(() => {
    const totalUsers = authStore.users.length
    const totalMeals = mealsStore.meals.length
    const totalVolume = mealsStore.meals.reduce((sum, m) => sum + (Number(m.totalAmount) || 0), 0)
    const totalUnpaid = debtsStore.payments
      .filter(p => p.status !== 'confirmed')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)

    return {
      totalUsers,
      totalMeals,
      totalVolume,
      totalUnpaid
    }
  })

  // Cross-table matrix computation: Matrix[debtorId][creditorId] = net debt amount
  const debtMatrix = computed(() => {
    const users = authStore.users
    const matrix = {}

    users.forEach(u => {
      matrix[u.id] = {}
      users.forEach(other => {
        matrix[u.id][other.id] = 0
      })
    })

    debtsStore.payments.forEach(p => {
      if (p.status !== 'confirmed') {
        if (matrix[p.debtorId] && matrix[p.debtorId][p.creditorId] !== undefined) {
          matrix[p.debtorId][p.creditorId] += Number(p.amount)
        }
      }
    })

    return matrix
  })

  async function toggleUserLock(userId) {
    try {
      const data = await api.put(`/admin/users/${userId}/lock`)
      if (data?.id) {
        const idx = authStore.users.findIndex(u => u.id === userId)
        if (idx !== -1) authStore.users[idx] = data
        authStore.saveUsers()
        return
      }
    } catch (err) {
      console.warn('Backend toggleUserLock failed, using local fallback:', err.message)
    }

    // Local Fallback
    const user = authStore.users.find(u => u.id === userId)
    if (user && user.role !== 'admin') {
      user.isLocked = !user.isLocked
      authStore.saveUsers()
    }
  }

  async function changeUserRole(userId, newRole) {
    try {
      const data = await api.put(`/admin/users/${userId}/role`, { role: newRole })
      if (data?.id) {
        const idx = authStore.users.findIndex(u => u.id === userId)
        if (idx !== -1) authStore.users[idx] = data
        authStore.saveUsers()
        return
      }
    } catch (err) {
      console.warn('Backend changeUserRole failed, using local fallback:', err.message)
    }

    // Local Fallback
    const user = authStore.users.find(u => u.id === userId)
    if (user) {
      user.role = newRole
      authStore.saveUsers()
    }
  }

  async function resetUserPassword(userId, newPassword) {
    try {
      await api.put(`/admin/users/${userId}/password`, { newPassword })
    } catch (err) {
      console.warn('Backend resetUserPassword failed, using local fallback:', err.message)
    }

    // Local Fallback
    const user = authStore.users.find(u => u.id === userId)
    if (user) {
      user.passwordHash = newPassword
      authStore.saveUsers()
    }
  }

  return {
    systemMetrics,
    debtMatrix,
    toggleUserLock,
    changeUserRole,
    resetUserPassword
  }
})
