import { db } from '../config/db.js'

export const getGroups = (req, res) => {
  res.json(db.getGroups())
}

export const getGroupById = (req, res) => {
  const group = db.getGroupById(req.params.id)
  if (!group) {
    return res.status(404).json({ message: 'Group not found!' })
  }
  res.json(group)
}

export const createGroup = (req, res) => {
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

  db.addGroup(newGroup)
  res.status(201).json(newGroup)
}

export const updateGroup = (req, res) => {
  const groupId = req.params.id
  const group = db.getGroupById(groupId)
  if (!group) {
    return res.status(404).json({ message: 'Group not found!' })
  }

  const updated = db.updateGroup(groupId, req.body)
  res.json(updated)
}

export const deleteGroup = (req, res) => {
  const groupId = req.params.id
  const group = db.getGroupById(groupId)
  if (!group) {
    return res.status(404).json({ message: 'Group not found!' })
  }

  db.deleteGroup(groupId)
  res.json({ message: 'Group disbanded successfully!' })
}

export const addMember = (req, res) => {
  const groupId = req.params.id
  const { userId } = req.body

  const group = db.getGroupById(groupId)
  if (!group) {
    return res.status(404).json({ message: 'Group not found!' })
  }

  if (group.members.includes(userId)) {
    return res.status(400).json({ message: 'Member already in group!' })
  }

  const updatedMembers = [...group.members, userId]
  const updated = db.updateGroup(groupId, { members: updatedMembers })
  res.json(updated)
}

export const removeMember = (req, res) => {
  const { id: groupId, userId } = req.params

  const group = db.getGroupById(groupId)
  if (!group) {
    return res.status(404).json({ message: 'Group not found!' })
  }

  if (userId === group.ownerId) {
    return res.status(400).json({ message: 'Cannot remove group owner!' })
  }

  const updatedMembers = group.members.filter(m => m !== userId)
  const updated = db.updateGroup(groupId, { members: updatedMembers })
  res.json(updated)
}
