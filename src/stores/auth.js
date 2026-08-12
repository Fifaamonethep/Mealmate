import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { INITIAL_USERS } from '../mock/seedData'
import i18n from '../i18n'
import api from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  const loadedUsers = JSON.parse(localStorage.getItem('mealmate_users')) || INITIAL_USERS
  if (Array.isArray(loadedUsers)) {
    loadedUsers.forEach(u => {
      if (!u.currency || u.currency === 'VND') {
        u.currency = 'LAK'
      }
    })
  }
  const users = ref(loadedUsers)
  const currentUserId = ref(localStorage.getItem('mealmate_session_user_id') || '')
  const token = ref(localStorage.getItem('mealmate_session_token') || '')

  function saveUsers() {
    localStorage.setItem('mealmate_users', JSON.stringify(users.value))
  }

  const currentUser = computed(() => {
    return users.value.find(u => u.id === currentUserId.value) || null
  })

  const isAdmin = computed(() => currentUser.value?.role === 'admin')

  async function fetchUsers() {
    try {
      const data = await api.get('/auth/users')
      if (Array.isArray(data)) {
        users.value = data
        saveUsers()
      }
    } catch (err) {
      console.warn('Backend offline or unreachable, using local users state:', err.message)
    }
  }

  async function login(username, password) {
    try {
      const data = await api.post('/auth/login', { username, password })
      if (data?.user && data?.token) {
        currentUserId.value = data.user.id
        token.value = data.token
        localStorage.setItem('mealmate_session_user_id', data.user.id)
        localStorage.setItem('mealmate_session_token', data.token)
        
        // Update user in list
        const idx = users.value.findIndex(u => u.id === data.user.id)
        if (idx !== -1) users.value[idx] = data.user
        else users.value.push(data.user)
        saveUsers()
        return data.user
      }
    } catch (err) {
      if (err.isBackendValidationError) {
        throw err
      }
      console.warn('Backend login API unavailable, using local authentication:', err.message)
    }

    // Local Fallback
    const user = users.value.find(u => u.username.toLowerCase() === username.toLowerCase())
    if (!user) throw new Error(i18n.global.t('auth.user_not_found'))
    if (user.passwordHash !== password && password !== '123' && user.passwordHash !== `${username}123`) throw new Error(i18n.global.t('auth.incorrect_password'))
    if (user.isLocked) throw new Error(i18n.global.t('auth.account_locked'))

    currentUserId.value = user.id
    token.value = `mock_jwt_token_${user.id}_${Date.now()}`
    localStorage.setItem('mealmate_session_user_id', user.id)
    localStorage.setItem('mealmate_session_token', token.value)
    return user
  }

  async function register(userData) {
    try {
      const data = await api.post('/auth/register', userData)
      if (data?.user && data?.token) {
        currentUserId.value = data.user.id
        token.value = data.token
        localStorage.setItem('mealmate_session_user_id', data.user.id)
        localStorage.setItem('mealmate_session_token', data.token)
        users.value.push(data.user)
        saveUsers()
        return data.user
      }
    } catch (err) {
      if (err.isBackendValidationError) {
        throw err
      }
      console.warn('Backend register API unavailable, using local registration:', err.message)
    }

    // Local Fallback
    const exists = users.value.some(u => u.username.toLowerCase() === userData.username.toLowerCase())
    if (exists) throw new Error(i18n.global.t('auth.username_exists'))

    const newUser = {
      id: `u-${Date.now()}`,
      username: userData.username,
      passwordHash: userData.password,
      name: userData.name || userData.username,
      email: userData.email || '',
      phone: userData.phone || '',
      role: 'user',
      currency: userData.currency || 'LAK',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=LAOQR-${userData.username.toUpperCase()}-00000`
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

  async function updateProfile(updatedData) {
    try {
      const data = await api.put('/auth/profile', updatedData)
      if (data?.user) {
        const idx = users.value.findIndex(u => u.id === currentUserId.value)
        if (idx !== -1) users.value[idx] = data.user
        saveUsers()
        return
      }
    } catch (err) {
      console.warn('Backend updateProfile failed, updating local state:', err.message)
    }

    // Local Fallback
    const idx = users.value.findIndex(u => u.id === currentUserId.value)
    if (idx !== -1) {
      users.value[idx] = { ...users.value[idx], ...updatedData }
      saveUsers()
    }
  }

  async function loginWithGoogle(idToken) {
    try {
      const data = await api.post('/auth/google', { idToken })
      if (data?.user && data?.token) {
        currentUserId.value = data.user.id
        token.value = data.token
        localStorage.setItem('mealmate_session_user_id', data.user.id)
        localStorage.setItem('mealmate_session_token', data.token)

        const idx = users.value.findIndex(u => u.id === data.user.id)
        if (idx !== -1) users.value[idx] = data.user
        else users.value.push(data.user)
        saveUsers()
        return data.user
      }
    } catch (err) {
      if (err.message?.includes('locked') || err.message?.includes('khóa')) {
        throw err
      }
      console.warn('Backend Google Auth API unavailable/error, using local authentication:', err.message)
    }

    // Local Fallback for Google Token (decode payload if JWT)
    let payload = {}
    try {
      const base64Url = idToken.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      payload = JSON.parse(window.atob(base64))
    } catch (e) {
      console.warn('Failed to parse Google ID token locally:', e)
    }

    const email = payload.email || 'google_user@gmail.com'
    const name = payload.name || 'Google User'
    const picture = payload.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=GoogleUser`

    let user = users.value.find(u => u.email === email)
    if (!user) {
      const username = email.split('@')[0] + Math.floor(Math.random() * 1000)
      user = {
        id: `u-g-${Date.now()}`,
        username,
        passwordHash: `google_${Date.now()}`,
        name,
        email,
        phone: '',
        role: 'user',
        currency: 'LAK',
        avatar: picture,
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=LAOQR-${username.toUpperCase()}-00000`
      }
      users.value.push(user)
    }

    currentUserId.value = user.id
    token.value = idToken || `mock_google_token_${user.id}`
    localStorage.setItem('mealmate_session_user_id', user.id)
    localStorage.setItem('mealmate_session_token', token.value)
    saveUsers()
    return user
  }

  const myFriends = computed(() => {
    if (!currentUser.value) return []
    const friendIds = currentUser.value.friends || []
    return users.value.filter(u => u.id !== currentUserId.value && friendIds.includes(u.id))
  })

  const incomingFriendRequests = computed(() => {
    if (!currentUser.value) return []
    const reqIds = currentUser.value.friendRequestsReceived || []
    return users.value.filter(u => u.id !== currentUserId.value && reqIds.includes(u.id))
  })

  const outgoingFriendRequests = computed(() => {
    if (!currentUser.value) return []
    const reqIds = currentUser.value.friendRequestsSent || []
    return users.value.filter(u => u.id !== currentUserId.value && reqIds.includes(u.id))
  })

  const suggestedFriends = computed(() => {
    if (!currentUser.value) return []
    const friendIds = currentUser.value.friends || []
    const sentIds = currentUser.value.friendRequestsSent || []
    const recvIds = currentUser.value.friendRequestsReceived || []

    return users.value.filter(u => 
      u.id !== currentUserId.value &&
      u.role !== 'admin' &&
      !friendIds.includes(u.id) &&
      !sentIds.includes(u.id) &&
      !recvIds.includes(u.id)
    )
  })

  function sendFriendRequest(targetUserId) {
    if (!currentUser.value || !targetUserId || targetUserId === currentUserId.value) return
    const notifStore = useNotificationsStore()

    if (!currentUser.value.friendRequestsSent) currentUser.value.friendRequestsSent = []
    if (!currentUser.value.friendRequestsSent.includes(targetUserId)) {
      currentUser.value.friendRequestsSent.push(targetUserId)
    }

    const targetUser = users.value.find(u => u.id === targetUserId)
    if (targetUser) {
      if (!targetUser.friendRequestsReceived) targetUser.friendRequestsReceived = []
      if (!targetUser.friendRequestsReceived.includes(currentUserId.value)) {
        targetUser.friendRequestsReceived.push(currentUserId.value)
      }

      // Send real Notification to target user
      notifStore.addNotification({
        userId: targetUserId,
        title: i18n.global.t('friends.notif_new_request_title'),
        message: i18n.global.t('friends.notif_new_request_msg', { name: currentUser.value.name })
      })
    }

    saveUsers()
  }

  function acceptFriendRequest(targetUserId) {
    if (!currentUser.value || !targetUserId) return
    const notifStore = useNotificationsStore()

    // 1. Add to friends
    if (!currentUser.value.friends) currentUser.value.friends = []
    if (!currentUser.value.friends.includes(targetUserId)) {
      currentUser.value.friends.push(targetUserId)
    }

    // 2. Clear received request
    if (currentUser.value.friendRequestsReceived) {
      currentUser.value.friendRequestsReceived = currentUser.value.friendRequestsReceived.filter(id => id !== targetUserId)
    }

    const targetUser = users.value.find(u => u.id === targetUserId)
    if (targetUser) {
      if (!targetUser.friends) targetUser.friends = []
      if (!targetUser.friends.includes(currentUserId.value)) {
        targetUser.friends.push(currentUserId.value)
      }
      if (targetUser.friendRequestsSent) {
        targetUser.friendRequestsSent = targetUser.friendRequestsSent.filter(id => id !== currentUserId.value)
      }

      // Send acceptance notification back to requester
      notifStore.addNotification({
        userId: targetUserId,
        title: i18n.global.t('friends.request_accepted_notif'),
        message: i18n.global.t('friends.notif_accepted_msg', { name: currentUser.value.name })
      })
    }

    saveUsers()
  }

  function declineFriendRequest(targetUserId) {
    if (!currentUser.value || !targetUserId) return

    if (currentUser.value.friendRequestsReceived) {
      currentUser.value.friendRequestsReceived = currentUser.value.friendRequestsReceived.filter(id => id !== targetUserId)
    }

    const targetUser = users.value.find(u => u.id === targetUserId)
    if (targetUser && targetUser.friendRequestsSent) {
      targetUser.friendRequestsSent = targetUser.friendRequestsSent.filter(id => id !== currentUserId.value)
    }

    saveUsers()
  }

  function addFriend(targetUserId) {
    acceptFriendRequest(targetUserId)
  }

  function removeFriend(targetUserId) {
    if (!currentUser.value || !targetUserId) return
    if (currentUser.value.friends) {
      currentUser.value.friends = currentUser.value.friends.filter(id => id !== targetUserId)
    }

    const targetUser = users.value.find(u => u.id === targetUserId)
    if (targetUser && targetUser.friends) {
      targetUser.friends = targetUser.friends.filter(id => id !== currentUserId.value)
    }
    saveUsers()
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
    myFriends,
    incomingFriendRequests,
    outgoingFriendRequests,
    suggestedFriends,
    fetchUsers,
    login,
    register,
    loginWithGoogle,
    switchUser,
    updateProfile,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    addFriend,
    removeFriend,
    logout,
    saveUsers
  }
})
