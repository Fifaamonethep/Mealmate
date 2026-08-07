import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { INITIAL_USERS } from '../mock/seedData'

export const useAuthStore = defineStore('auth', () => {
  const users = ref(JSON.parse(localStorage.getItem('mealmate_users')) || INITIAL_USERS)
  const currentUserId = ref(localStorage.getItem('mealmate_session_user_id') || '')
  const token = ref(localStorage.getItem('mealmate_session_token') || '')

  function saveUsers() {
    localStorage.setItem('mealmate_users', JSON.stringify(users.value))
  }

  const currentUser = computed(() => {
    return users.value.find(u => u.id === currentUserId.value) || null
  })

  const isAdmin = computed(() => currentUser.value?.role === 'admin')

  function login(username, password) {
    const user = users.value.find(u => u.username.toLowerCase() === username.toLowerCase())
    if (!user) throw new Error('Tài khoản không tồn tại!')
    if (user.passwordHash !== password) throw new Error('Mật khẩu không chính xác!')
    if (user.isLocked) throw new Error('Tài khoản đã bị khóa bởi Admin!')

    currentUserId.value = user.id
    token.value = `mock_jwt_token_${user.id}_${Date.now()}`
    localStorage.setItem('mealmate_session_user_id', user.id)
    localStorage.setItem('mealmate_session_token', token.value)
    return user
  }

  function register(userData) {
    const exists = users.value.some(u => u.username.toLowerCase() === userData.username.toLowerCase())
    if (exists) throw new Error('Tên đăng nhập đã tồn tại!')

    const newUser = {
      id: `u-${Date.now()}`,
      username: userData.username,
      passwordHash: userData.password,
      name: userData.name || userData.username,
      email: userData.email || '',
      phone: userData.phone || '',
      role: 'user',
      currency: userData.currency || 'VND',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=VIETQR-${userData.username.toUpperCase()}-00000`
    }

    users.value.push(newUser)
    saveUsers()
    
    currentUserId.value = newUser.id
    token.value = `mock_jwt_token_${newUser.id}_${Date.now()}`
    localStorage.setItem('mealmate_session_user_id', newUser.id)
    localStorage.setItem('mealmate_session_token', token.value)
    return newUser
  }

  function switchUser(userId) {
    const target = users.value.find(u => u.id === userId)
    if (!target) return
    currentUserId.value = target.id
    token.value = `mock_jwt_token_${target.id}_${Date.now()}`
    localStorage.setItem('mealmate_session_user_id', target.id)
    localStorage.setItem('mealmate_session_token', token.value)
  }

  function updateProfile(updatedData) {
    const idx = users.value.findIndex(u => u.id === currentUserId.value)
    if (idx !== -1) {
      users.value[idx] = { ...users.value[idx], ...updatedData }
      saveUsers()
    }
  }

  function logout() {
    currentUserId.value = ''
    token.value = ''
    localStorage.removeItem('mealmate_session_user_id')
    localStorage.removeItem('mealmate_session_token')
    localStorage.removeItem('mealmate_current_user_id')
    localStorage.removeItem('mealmate_token')
  }

  return {
    users,
    currentUserId,
    currentUser,
    token,
    isAdmin,
    login,
    register,
    switchUser,
    updateProfile,
    logout,
    saveUsers
  }
})
