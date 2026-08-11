import { db } from '../config/db.js'

export const getNotifications = (req, res) => {
  const userId = req.user.id
  res.json(db.getNotifications(userId))
}

export const markAllRead = (req, res) => {
  const userId = req.user.id
  db.markNotificationsRead(userId)
  res.json({ message: 'All notifications marked as read' })
}
