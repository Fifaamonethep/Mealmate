import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Attach JWT Token to every outgoing request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('mealmate_session_token') || localStorage.getItem('mealmate_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

export const apiService = {
  // Auth
  login: (username, password) => apiClient.post('/auth/login', { username, password }),
  register: (userData) => apiClient.post('/auth/register', userData),
  getMe: () => apiClient.get('/auth/me'),
  getUsers: () => apiClient.get('/auth/users'),
  updateProfile: (data) => apiClient.put('/auth/profile', data),

  // Meals
  getMeals: () => apiClient.get('/meals'),
  getMealById: (id) => apiClient.get(`/meals/${id}`),
  createMeal: (data) => apiClient.post('/meals', data),
  deleteMeal: (id) => apiClient.delete(`/meals/${id}`),

  // Debts
  getDebts: () => apiClient.get('/debts'),
  sendSlip: (id, slipUrl) => apiClient.put(`/debts/${id}/slip`, { slipUrl }),
  confirmPayment: (id) => apiClient.put(`/debts/${id}/confirm`),
  rejectPayment: (id, reason) => apiClient.put(`/debts/${id}/reject`, { reason }),
  forceAdminAction: (id, status, reason) => apiClient.put(`/debts/${id}/force`, { status, reason }),

  // Groups
  getGroups: () => apiClient.get('/groups'),
  createGroup: (data) => apiClient.post('/groups', data),
  updateGroup: (id, data) => apiClient.put(`/groups/${id}`, data),
  deleteGroup: (id) => apiClient.delete(`/groups/${id}`),
  addGroupMember: (groupId, userId) => apiClient.post(`/groups/${groupId}/members`, { userId }),
  removeGroupMember: (groupId, userId) => apiClient.delete(`/groups/${groupId}/members/${userId}`),

  // Notifications
  getNotifications: () => apiClient.get('/notifications'),
  markNotificationsRead: () => apiClient.put('/notifications/read-all'),

  // Admin
  getAdminUsers: () => apiClient.get('/admin/users'),
  toggleLockUser: (userId) => apiClient.put(`/admin/users/${userId}/lock`),
  updateUserRole: (userId, role) => apiClient.put(`/admin/users/${userId}/role`, { role }),
  resetUserPassword: (userId, newPassword) => apiClient.put(`/admin/users/${userId}/password`, { newPassword }),
  getDebtMatrix: () => apiClient.get('/admin/matrix')
}
