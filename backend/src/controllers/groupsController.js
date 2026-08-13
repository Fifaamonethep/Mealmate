import { db } from '../config/db.js'

export const getGroups = async (req, res) => {
  try {
    let groups = await db.getGroups()
    const currentUserId = req.user?.id
    const isAdmin = req.user?.role === 'admin'

    if (currentUserId && !isAdmin) {
      groups = groups.filter(g => g.ownerId === currentUserId || (g.members || []).includes(currentUserId))
    }

    res.json(groups)
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to fetch groups' })
  }
}

export const getGroupById = async (req, res) => {
  try {
    const group = await db.getGroupById(req.params.id)
    if (!group) {
      return res.status(404).json({ message: 'Group not found!' })
    }

    const currentUserId = req.user?.id
    const isAdmin = req.user?.role === 'admin'

    if (currentUserId && !isAdmin) {
      const isMember = (group.members || []).includes(currentUserId) || group.ownerId === currentUserId
      if (!isMember) {
        return res.status(403).json({ message: 'Access denied: You are not a member of this group!' })
      }
    }

    res.json(group)
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to fetch group' })
  }
}

export const createGroup = async (req, res) => {
  try {
    const { name, description, avatar, members } = req.body
    if (!name) {
      return res.status(400).json({ message: 'Group name required!' })
    }

    const ownerId = req.user.id
    const groupMembers = Array.from(new Set([ownerId, ...(members || [])]))

    const newGroup = {
      id: `g-${Date.now()}`,
      name,
      description: description || '',
      ownerId,
      avatar: avatar || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&auto=format&fit=crop',
      members: groupMembers,
      createdAt: new Date().toISOString()
    }

    const created = await db.addGroup(newGroup)
    res.status(201).json(created)
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to create group' })
  }
}

export const updateGroup = async (req, res) => {
  try {
    const groupId = req.params.id
    const group = await db.getGroupById(groupId)
    if (!group) {
      return res.status(404).json({ message: 'Group not found!' })
    }

    const currentUserId = req.user?.id
    const isAdmin = req.user?.role === 'admin'

    if (currentUserId && !isAdmin) {
      const isMember = (group.members || []).includes(currentUserId) || group.ownerId === currentUserId
      if (!isMember) {
        return res.status(403).json({ message: 'Access denied: You are not a member of this group!' })
      }
    }

    const updated = await db.updateGroup(groupId, req.body)
    res.json(updated)
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to update group' })
  }
}

export const deleteGroup = async (req, res) => {
  try {
    const groupId = req.params.id
    const group = await db.getGroupById(groupId)
    if (!group) {
      return res.status(404).json({ message: 'Group not found!' })
    }

    const currentUserId = req.user?.id
    const isAdmin = req.user?.role === 'admin'

    if (currentUserId && !isAdmin) {
      const isOwner = group.ownerId === currentUserId
      if (!isOwner) {
        return res.status(403).json({ message: 'Access denied: Only group owner can disband the group!' })
      }
    }

    await db.deleteGroup(groupId)
    res.json({ message: 'Group disbanded successfully!' })
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to delete group' })
  }
}

export const addMember = async (req, res) => {
  try {
    const groupId = req.params.id
    const { userId } = req.body

    const group = await db.getGroupById(groupId)
    if (!group) {
      return res.status(404).json({ message: 'Group not found!' })
    }

    const currentUserId = req.user?.id
    const isAdmin = req.user?.role === 'admin'

    if (currentUserId && !isAdmin) {
      const isMember = (group.members || []).includes(currentUserId) || group.ownerId === currentUserId
      if (!isMember) {
        return res.status(403).json({ message: 'Access denied: You are not a member of this group!' })
      }
    }

    if (group.members.includes(userId)) {
      return res.status(400).json({ message: 'Member already in group!' })
    }

    const updatedMembers = [...group.members, userId]
    const updated = await db.updateGroup(groupId, { members: updatedMembers })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to add member' })
  }
}

export const removeMember = async (req, res) => {
  try {
    const { id: groupId, userId } = req.params

    const group = await db.getGroupById(groupId)
    if (!group) {
      return res.status(404).json({ message: 'Group not found!' })
    }

    const currentUserId = req.user?.id
    const isAdmin = req.user?.role === 'admin'

    if (currentUserId && !isAdmin) {
      const isMember = (group.members || []).includes(currentUserId) || group.ownerId === currentUserId
      if (!isMember) {
        return res.status(403).json({ message: 'Access denied: You are not a member of this group!' })
      }
    }

    if (userId === group.ownerId) {
      return res.status(400).json({ message: 'Cannot remove group owner!' })
    }

    const updatedMembers = group.members.filter(m => m !== userId)
    const updated = await db.updateGroup(groupId, { members: updatedMembers })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to remove member' })
  }
}

