import { defineStore } from 'pinia'
import { ref } from 'vue'
import { INITIAL_GROUPS } from '../mock/seedData'
import { useAuthStore } from './auth'
import api from '../services/api'

export const useGroupsStore = defineStore('groups', () => {
  let loadedGroups = JSON.parse(localStorage.getItem('mealmate_groups'))
  if (!loadedGroups || !Array.isArray(loadedGroups) || loadedGroups.length === 0) {
    loadedGroups = INITIAL_GROUPS
  }
  const groups = ref(loadedGroups.map(g => ({
    ...g,
    ownerId: g.ownerId || (g.members && g.members[0]) || 'u-alice'
  })))

  function saveGroups() {
    localStorage.setItem('mealmate_groups', JSON.stringify(groups.value))
  }

  async function fetchGroups() {
    try {
      const data = await api.get('/groups')
      if (Array.isArray(data)) {
        groups.value = data
        saveGroups()
      }
    } catch (err) {
      console.warn('Backend fetchGroups failed, using local state:', err.message)
    }
  }

  function getGroupById(id) {
    return groups.value.find(g => g.id === id)
  }

  async function createGroup(groupData) {
    const authStore = useAuthStore()
    const ownerId = groupData.ownerId || authStore.currentUserId || 'u-alice'

    try {
      const data = await api.post('/groups', { ...groupData, ownerId })
      if (data?.id) {
        groups.value.unshift(data)
        saveGroups()
        return data
      }
    } catch (err) {
      console.warn('Backend createGroup failed, using local fallback:', err.message)
    }

    // Local Fallback
    let members = groupData.members || []
    if (!members.includes(ownerId)) {
      members = [ownerId, ...members]
    }

    const owner = authStore.users.find(u => u.id === ownerId)

    const newGroup = {
      id: `g-${Date.now()}`,
      name: groupData.name,
      description: groupData.description || '',
      ownerId: ownerId,
      avatar: groupData.avatar || owner?.avatar || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&auto=format&fit=crop',
      members: members,
      createdAt: new Date().toISOString()
    }
    groups.value.unshift(newGroup)
    saveGroups()
    return newGroup
  }

  async function addMember(groupId, userId) {
    try {
      const data = await api.post(`/groups/${groupId}/members`, { userId })
      if (data?.id) {
        const idx = groups.value.findIndex(g => g.id === groupId)
        if (idx !== -1) groups.value[idx] = data
        saveGroups()
        return
      }
    } catch (err) {
      console.warn('Backend addMember failed, using local fallback:', err.message)
    }

    // Local Fallback
    const g = groups.value.find(item => item.id === groupId)
    if (g && !g.members.includes(userId)) {
      g.members.push(userId)
      saveGroups()
    }
  }

  async function removeMember(groupId, userId) {
    try {
      const data = await api.delete(`/groups/${groupId}/members/${userId}`)
      if (data?.id) {
        const idx = groups.value.findIndex(g => g.id === groupId)
        if (idx !== -1) groups.value[idx] = data
        saveGroups()
        return
      }
    } catch (err) {
      console.warn('Backend removeMember failed, using local fallback:', err.message)
    }

    // Local Fallback
    const g = groups.value.find(item => item.id === groupId)
    if (g) {
      g.members = g.members.filter(id => id !== userId)
      saveGroups()
    }
  }

  async function updateGroup(groupId, updatedData) {
    try {
      const data = await api.put(`/groups/${groupId}`, updatedData)
      if (data?.id) {
        const idx = groups.value.findIndex(g => g.id === groupId)
        if (idx !== -1) groups.value[idx] = data
        saveGroups()
        return
      }
    } catch (err) {
      console.warn('Backend updateGroup failed, using local fallback:', err.message)
    }

    // Local Fallback
    const idx = groups.value.findIndex(g => g.id === groupId)
    if (idx !== -1) {
      groups.value[idx] = { ...groups.value[idx], ...updatedData }
      saveGroups()
    }
  }

  function leaveGroup(groupId, userId) {
    const g = groups.value.find(item => item.id === groupId)
    if (g) {
      if (g.ownerId === userId) {
        throw new Error('Chủ nhóm không thể rời nhóm khi chưa chuyển quyền hoặc giải tán nhóm!')
      }
      removeMember(groupId, userId)
    }
  }

  async function deleteGroup(groupId) {
    try {
      await api.delete(`/groups/${groupId}`)
    } catch (err) {
      console.warn('Backend deleteGroup failed, using local fallback:', err.message)
    }

    groups.value = groups.value.filter(g => g.id !== groupId)
    saveGroups()
  }

  return {
    groups,
    fetchGroups,
    getGroupById,
    createGroup,
    addMember,
    removeMember,
    updateGroup,
    leaveGroup,
    deleteGroup,
    saveGroups
  }
})
