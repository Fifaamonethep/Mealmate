import { defineStore } from 'pinia'
import { ref } from 'vue'
import { INITIAL_GROUPS } from '../mock/seedData'
import { useAuthStore } from './auth'

export const useGroupsStore = defineStore('groups', () => {
  const loadedGroups = JSON.parse(localStorage.getItem('mealmate_groups')) || INITIAL_GROUPS
  // Migration: ensure every group has an ownerId
  const groups = ref(loadedGroups.map(g => ({
    ...g,
    ownerId: g.ownerId || (g.members && g.members[0]) || 'u-alice'
  })))

  function saveGroups() {
    localStorage.setItem('mealmate_groups', JSON.stringify(groups.value))
  }

  function getGroupById(id) {
    return groups.value.find(g => g.id === id)
  }

  function createGroup(groupData) {
    const authStore = useAuthStore()
    const ownerId = groupData.ownerId || authStore.currentUserId || 'u-alice'
    
    // Ensure owner is in members array
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

  function addMember(groupId, userId) {
    const g = groups.value.find(item => item.id === groupId)
    if (g && !g.members.includes(userId)) {
      g.members.push(userId)
      saveGroups()
    }
  }

  function removeMember(groupId, userId) {
    const g = groups.value.find(item => item.id === groupId)
    if (g) {
      g.members = g.members.filter(id => id !== userId)
      saveGroups()
    }
  }

  function updateGroup(groupId, updatedData) {
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
      g.members = g.members.filter(id => id !== userId)
      saveGroups()
    }
  }

  function deleteGroup(groupId) {
    groups.value = groups.value.filter(g => g.id !== groupId)
    saveGroups()
  }

  return {
    groups,
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
