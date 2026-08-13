import { db } from '../config/db.js'

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id
    const notifications = await db.getNotifications(userId)
    res.json(notifications)
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to fetch notifications' })
  }
}

export const markAllRead = async (req, res) => {
  try {
    const userId = req.user.id
    await db.markNotificationsRead(userId)
    res.json({ message: 'All notifications marked as read' })
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to mark notifications as read' })
  }
}
