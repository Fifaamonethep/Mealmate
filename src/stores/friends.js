import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import api from '../services/api'
import { useAuthStore } from './auth'

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
      const data = await api.get('/friends')
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
      console.warn('Backend friends API unavailable, using authStore myFriends:', err.message)
      friends.value = Array.isArray(authStore.myFriends) ? authStore.myFriends : []
    } finally {
      isLoading.value = false
    }
  }

  async function fetchRequests() {
    try {
      const data = await api.get('/friends/requests')
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
      console.warn('Backend friend requests API unavailable:', err.message)
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
      const data = await api.get(url)
      if (Array.isArray(data)) {
        searchResults.value = data
      }
    } catch (err) {
      console.warn('Backend search API unavailable, using local users filtering:', err.message)
      const q = (query || '').trim().toLowerCase().replace(/^@/, '')
      const myFriendIds = (authStore.currentUser?.friends || [])
      const mySentIds = (authStore.currentUser?.friendRequestsSent || [])
      const myRecvIds = (authStore.currentUser?.friendRequestsReceived || [])

      searchResults.value = (authStore.users || [])
        .filter(u => u.id !== authStore.currentUserId && u.role !== 'admin' && (
          !q ||
          u.username.toLowerCase().includes(q) ||
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
      await api.post('/friends/request', { targetUserId })
      await Promise.all([fetchFriends(), fetchRequests(), searchUsers()])
    } catch (err) {
      console.warn('Backend sendRequest failed, applying local fallback:', err.message)
      authStore.sendFriendRequest(targetUserId)
      await Promise.all([fetchFriends(), fetchRequests(), searchUsers()])
    }
  }

  async function acceptRequest(friendshipIdOrUserId) {
    try {
      await api.post(`/friends/${friendshipIdOrUserId}/accept`)
      await Promise.all([fetchFriends(), fetchRequests(), searchUsers()])
    } catch (err) {
      console.warn('Backend acceptRequest failed, applying local fallback:', err.message)
      authStore.acceptFriendRequest(friendshipIdOrUserId)
      await Promise.all([fetchFriends(), fetchRequests(), searchUsers()])
    }
  }

  async function declineRequest(friendshipIdOrUserId) {
    try {
      await api.post(`/friends/${friendshipIdOrUserId}/decline`)
      await Promise.all([fetchFriends(), fetchRequests(), searchUsers()])
    } catch (err) {
      console.warn('Backend declineRequest failed, applying local fallback:', err.message)
      authStore.declineFriendRequest(friendshipIdOrUserId)
      await Promise.all([fetchFriends(), fetchRequests(), searchUsers()])
    }
  }

  async function removeFriend(targetUserId) {
    try {
      await api.delete(`/friends/${targetUserId}`)
      await Promise.all([fetchFriends(), fetchRequests(), searchUsers()])
    } catch (err) {
      console.warn('Backend removeFriend failed, applying local fallback:', err.message)
      authStore.removeFriend(targetUserId)
      await Promise.all([fetchFriends(), fetchRequests(), searchUsers()])
    }
  }

  // Refresh friends when switching users
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
