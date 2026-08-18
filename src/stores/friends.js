import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import api from '../services/api'
import { useAuthStore } from './auth'
import { INITIAL_USERS } from '../mock/seedData'

export const useFriendsStore = defineStore('friends', () => {
  const authStore = useAuthStore()

  const friends = ref([])
  const incomingRequests = ref([])
  const outgoingRequests = ref([])
  const searchResults = ref([])
  const isLoading = ref(false)

  async function fetchFriends() {
    isLoading.value = true
    try {
      console.log('🔍 [FriendsStore] GET /api/friends requesting...')
      const data = await api.get('/friends')
      console.log('✅ [FriendsStore] GET /api/friends response:', data)
      if (Array.isArray(data)) {
        friends.value = data
        if (authStore.currentUser) {
          authStore.currentUser.friends = data.map(f => f.id)
          authStore.saveUsers()
        }
      } else {
        friends.value = Array.isArray(authStore.myFriends) ? authStore.myFriends : []
      }
    } catch (err) {
      console.warn('⚠️ [FriendsStore] GET /api/friends failed, fallback to local state:', err.message)
      friends.value = Array.isArray(authStore.myFriends) ? authStore.myFriends : []
    } finally {
      isLoading.value = false
    }
  }

  async function fetchRequests() {
    try {
      console.log('🔍 [FriendsStore] GET /api/friends/requests requesting...')
      const data = await api.get('/friends/requests')
      console.log('✅ [FriendsStore] GET /api/friends/requests response:', data)
      if (data && typeof data === 'object') {
        incomingRequests.value = Array.isArray(data.incoming) ? data.incoming : []
        outgoingRequests.value = Array.isArray(data.outgoing) ? data.outgoing : []
        
        if (authStore.currentUser) {
          authStore.currentUser.friendRequestsReceived = incomingRequests.value.map(r => r.user?.id).filter(Boolean)
          authStore.currentUser.friendRequestsSent = outgoingRequests.value.map(r => r.user?.id).filter(Boolean)
          authStore.saveUsers()
        }
      } else {
        fallbackRequests()
      }
    } catch (err) {
      console.warn('⚠️ [FriendsStore] GET /api/friends/requests failed, using local fallback:', err.message)
      fallbackRequests()
    }
  }

  function fallbackRequests() {
    const inc = Array.isArray(authStore.incomingFriendRequests) ? authStore.incomingFriendRequests : []
    const out = Array.isArray(authStore.outgoingFriendRequests) ? authStore.outgoingFriendRequests : []
    incomingRequests.value = inc.map(u => ({
      friendshipId: `f-local-${u.id}`,
      user: u,
      createdAt: new Date().toISOString()
    }))
    outgoingRequests.value = out.map(u => ({
      friendshipId: `f-local-${u.id}`,
      user: u,
      createdAt: new Date().toISOString()
    }))
  }

  async function searchUsers(query = '') {
    try {
      const q = (query || '').trim()
      const url = q ? `/friends/search?q=${encodeURIComponent(q)}` : '/friends/search'
      console.log(`🔍 [FriendsStore] GET ${url} requesting...`)
      const data = await api.get(url)
      console.log('✅ [FriendsStore] Search API response:', data)
      if (Array.isArray(data)) {
        searchResults.value = data
      }
    } catch (err) {
      console.warn('⚠️ [FriendsStore] Search API failed, applying local filter fallback:', err.message)
      const q = (query || '').trim().toLowerCase().replace(/^@/, '')
      const myFriendIds = (authStore.currentUser?.friends || [])
      const mySentIds = (authStore.currentUser?.friendRequestsSent || [])
      const myRecvIds = (authStore.currentUser?.friendRequestsReceived || [])

      const userList = (Array.isArray(authStore.users) && authStore.users.length > 0) ? authStore.users : INITIAL_USERS

      searchResults.value = userList
        .filter(u => u && u.id !== authStore.currentUserId && u.role !== 'admin' && (
          !q ||
          (u.username && u.username.toLowerCase().includes(q)) ||
          (u.name && u.name.toLowerCase().includes(q)) ||
          (u.email && u.email.toLowerCase().includes(q))
        ))
        .map(u => {
          let friendshipStatus = 'NONE'
          if (myFriendIds.includes(u.id)) friendshipStatus = 'ACCEPTED'
          else if (mySentIds.includes(u.id)) friendshipStatus = 'PENDING_SENT'
          else if (myRecvIds.includes(u.id)) friendshipStatus = 'PENDING_RECEIVED'

          return {
            ...u,
            friendshipStatus
          }
        })
    }
  }

  async function sendRequest(targetUserId) {
    try {
      console.log(`🔍 [FriendsStore] POST /api/friends/request for target: ${targetUserId}`)
      await api.post('/friends/request', { targetUserId })
      await Promise.all([fetchFriends(), fetchRequests(), searchUsers()])
    } catch (err) {
      console.warn('⚠️ [FriendsStore] sendRequest API failed, applying local fallback:', err.message)
      authStore.sendFriendRequest(targetUserId)
      await Promise.all([fetchFriends(), fetchRequests(), searchUsers()])
    }
  }

  async function acceptRequest(friendshipIdOrUserId) {
    try {
      console.log(`🔍 [FriendsStore] POST /api/friends/${friendshipIdOrUserId}/accept`)
      await api.post(`/friends/${friendshipIdOrUserId}/accept`)
      await Promise.all([fetchFriends(), fetchRequests(), searchUsers()])
    } catch (err) {
      console.warn('⚠️ [FriendsStore] acceptRequest API failed, applying local fallback:', err.message)
      authStore.acceptFriendRequest(friendshipIdOrUserId)
      await Promise.all([fetchFriends(), fetchRequests(), searchUsers()])
    }
  }

  async function declineRequest(friendshipIdOrUserId) {
    try {
      console.log(`🔍 [FriendsStore] POST /api/friends/${friendshipIdOrUserId}/decline`)
      await api.post(`/friends/${friendshipIdOrUserId}/decline`)
      await Promise.all([fetchFriends(), fetchRequests(), searchUsers()])
    } catch (err) {
      console.warn('⚠️ [FriendsStore] declineRequest API failed, applying local fallback:', err.message)
      authStore.declineFriendRequest(friendshipIdOrUserId)
      await Promise.all([fetchFriends(), fetchRequests(), searchUsers()])
    }
  }

  async function removeFriend(targetUserId) {
    try {
      console.log(`🔍 [FriendsStore] DELETE /api/friends/${targetUserId}`)
      await api.delete(`/friends/${targetUserId}`)
      await Promise.all([fetchFriends(), fetchRequests(), searchUsers()])
    } catch (err) {
      console.warn('⚠️ [FriendsStore] removeFriend API failed, applying local fallback:', err.message)
      authStore.removeFriend(targetUserId)
      await Promise.all([fetchFriends(), fetchRequests(), searchUsers()])
    }
  }

  // Refresh friends state when switching logged-in user
  watch(() => authStore.currentUserId, (newId) => {
    if (newId) {
      fetchFriends()
      fetchRequests()
      searchUsers()
    } else {
      friends.value = []
      incomingRequests.value = []
      outgoingRequests.value = []
      searchResults.value = []
    }
  })

  return {
    friends,
    incomingRequests,
    outgoingRequests,
    searchResults,
    isLoading,
    fetchFriends,
    fetchRequests,
    searchUsers,
    sendRequest,
    acceptRequest,
    declineRequest,
    removeFriend
  }
})
