import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useAuthStore } from './auth'
import { useMealsStore } from './meals'
import { useDebtsStore } from './debts'

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

  function toggleUserLock(userId) {
    const user = authStore.users.find(u => u.id === userId)
    if (user && user.role !== 'admin') {
      user.isLocked = !user.isLocked
      authStore.saveUsers()
    }
  }

  function changeUserRole(userId, newRole) {
    const user = authStore.users.find(u => u.id === userId)
    if (user) {
      user.role = newRole
      authStore.saveUsers()
    }
  }

  function resetUserPassword(userId, newPassword) {
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
