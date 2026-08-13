import { defineStore } from 'pinia'
import { ref } from 'vue'
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
      }
    } catch (err) {
      console.warn('Backend friends API unavailable, using authStore myFriends:', err.message)
      friends.value = authStore.myFriends
    } finally {
      isLoading.value = false
    }
  }

  async function fetchRequests() {
    try {
      const data = await api.get('/friends/requests')
      if (data) {
        incomingRequests.value = data.incoming || []
        outgoingRequests.value = data.outgoing || []
      }
    } catch (err) {
      console.warn('Backend friend requests API unavailable:', err.message)
    }
  }

  async function searchUsers(query) {
    if (!query || !query.trim()) {
      searchResults.value = []
      return
    }
    try {
      const data = await api.get(`/users/search?q=${encodeURIComponent(query.trim())}`)
      if (Array.isArray(data)) {
        searchResults.value = data
      }
    } catch (err) {
      console.warn('Backend search API unavailable, using local users filtering:', err.message)
      const q = query.trim().toLowerCase().replace(/^@/, '')
      searchResults.value = (authStore.users || [])
        .filter(u => u.id !== authStore.currentUserId && (
          u.username.toLowerCase().includes(q) ||
          (u.email && u.email.toLowerCase().includes(q)) ||
          (u.name && u.name.toLowerCase().includes(q))
        ))
        .map(u => ({
          ...u,
          friendshipStatus: (authStore.currentUser?.friends || []).includes(u.id) ? 'ACCEPTED' : 'NONE'
        }))
    }
  }

  async function sendRequest(targetUserId) {
    try {
      await api.post('/friends/request', { targetUserId })
      await Promise.all([fetchRequests(), searchUsers(targetUserId)])
    } catch (err) {
      // Local fallback
      authStore.sendFriendRequest(targetUserId)
      await fetchFriends()
    }
  }

  async function acceptRequest(friendshipIdOrUserId) {
    try {
      await api.post(`/friends/${friendshipIdOrUserId}/accept`)
      await Promise.all([fetchFriends(), fetchRequests()])
    } catch (err) {
      // Local fallback
      authStore.acceptFriendRequest(friendshipIdOrUserId)
      await fetchFriends()
    }
  }

  async function declineRequest(friendshipIdOrUserId) {
    try {
      await api.post(`/friends/${friendshipIdOrUserId}/decline`)
      await Promise.all([fetchFriends(), fetchRequests()])
    } catch (err) {
      // Local fallback
      authStore.declineFriendRequest(friendshipIdOrUserId)
      await fetchFriends()
    }
  }

  async function removeFriend(targetUserId) {
    try {
      await api.delete(`/friends/${targetUserId}`)
      await fetchFriends()
    } catch (err) {
      // Local fallback
      authStore.removeFriend(targetUserId)
      await fetchFriends()
    }
  }

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
