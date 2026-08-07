import { defineStore } from 'pinia'
import { ref } from 'vue'
import { INITIAL_GROUPS } from '../mock/seedData'

export const useGroupsStore = defineStore('groups', () => {
  const groups = ref(JSON.parse(localStorage.getItem('mealmate_groups')) || INITIAL_GROUPS)

  function saveGroups() {
    localStorage.setItem('mealmate_groups', JSON.stringify(groups.value))
  }

  function getGroupById(id) {
    return groups.value.find(g => g.id === id)
  }

  function createGroup(groupData) {
    const newGroup = {
      id: `g-${Date.now()}`,
      name: groupData.name,
      description: groupData.description || '',
      members: groupData.members || [],
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

  return {
    groups,
    getGroupById,
    createGroup,
    addMember,
    removeMember,
    saveGroups
  }
})
