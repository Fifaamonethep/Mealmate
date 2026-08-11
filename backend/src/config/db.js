import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DB_DIR = path.join(__dirname, '../../database')
const DB_FILE = path.join(DB_DIR, 'mealmate_db.json')

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true })
}

class JsonDB {
  constructor(filePath) {
    this.filePath = filePath
    this.data = {
      users: [],
      meals: [],
      debts: [],
      groups: [],
      notifications: []
    }
    this.load()
  }

  load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8')
        this.data = JSON.parse(raw)
      } else {
        this.save()
      }
    } catch (err) {
      console.error('Error loading DB file, re-initializing:', err.message)
      this.save()
    }
  }

  save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8')
    } catch (err) {
      console.error('Error saving DB file:', err.message)
    }
  }

  // Users
  getUsers() { return this.data.users }
  getUserById(id) { return this.data.users.find(u => u.id === id) }
  getUserByUsername(username) {
    return this.data.users.find(u => u.username.toLowerCase() === username.toLowerCase())
  }
  addUser(user) {
    this.data.users.push(user)
    this.save()
    return user
  }
  updateUser(id, updates) {
    const idx = this.data.users.findIndex(u => u.id === id)
    if (idx !== -1) {
      this.data.users[idx] = { ...this.data.users[idx], ...updates }
      this.save()
      return this.data.users[idx]
    }
    return null
  }

  // Meals
  getMeals() { return this.data.meals }
  getMealById(id) { return this.data.meals.find(m => m.id === id) }
  addMeal(meal) {
    this.data.meals.unshift(meal)
    this.save()
    return meal
  }
  deleteMeal(id) {
    this.data.meals = this.data.meals.filter(m => m.id !== id)
    this.data.debts = this.data.debts.filter(d => d.mealId !== id)
    this.save()
  }

  // Debts
  getDebts() { return this.data.debts }
  getDebtById(id) { return this.data.debts.find(d => d.id === id) }
  addDebt(debt) {
    this.data.debts.unshift(debt)
    this.save()
    return debt
  }
  updateDebt(id, updates) {
    const idx = this.data.debts.findIndex(d => d.id === id)
    if (idx !== -1) {
      this.data.debts[idx] = { ...this.data.debts[idx], ...updates }
      this.save()
      return this.data.debts[idx]
    }
    return null
  }

  // Groups
  getGroups() { return this.data.groups }
  getGroupById(id) { return this.data.groups.find(g => g.id === id) }
  addGroup(group) {
    this.data.groups.unshift(group)
    this.save()
    return group
  }
  updateGroup(id, updates) {
    const idx = this.data.groups.findIndex(g => g.id === id)
    if (idx !== -1) {
      this.data.groups[idx] = { ...this.data.groups[idx], ...updates }
      this.save()
      return this.data.groups[idx]
    }
    return null
  }
  deleteGroup(id) {
    this.data.groups = this.data.groups.filter(g => g.id !== id)
    this.save()
  }

  // Notifications
  getNotifications(userId) {
    if (!userId) return this.data.notifications
    return this.data.notifications.filter(n => n.userId === userId)
  }
  addNotification(notif) {
    this.data.notifications.unshift(notif)
    this.save()
    return notif
  }
  markNotificationsRead(userId) {
    this.data.notifications.forEach(n => {
      if (n.userId === userId) n.isRead = true
    })
    this.save()
  }
}

export const db = new JsonDB(DB_FILE)
