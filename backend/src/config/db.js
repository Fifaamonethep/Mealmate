import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { supabase } from './supabase.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DB_DIR = path.join(__dirname, '../../database')
const DB_FILE = path.join(DB_DIR, 'mealmate_db.json')

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true })
}

// ----------------------------------------------------
// Transformers between DB (snake_case) & App (camelCase)
// ----------------------------------------------------
function toAppUser(row) {
  if (!row) return null
  return {
    id: row.id,
    username: row.username,
    passwordHash: row.password_hash,
    name: row.name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    currency: row.currency,
    avatar: row.avatar,
    qrCodeUrl: row.qr_code_url,
    googleId: row.google_id,
    isLocked: row.is_locked,
    createdAt: row.created_at
  }
}

function toDbUser(u) {
  const obj = {}
  if (u.id !== undefined) obj.id = u.id
  if (u.username !== undefined) obj.username = u.username
  if (u.passwordHash !== undefined) obj.password_hash = u.passwordHash
  if (u.name !== undefined) obj.name = u.name
  if (u.email !== undefined) obj.email = u.email
  if (u.phone !== undefined) obj.phone = u.phone
  if (u.role !== undefined) obj.role = u.role
  if (u.currency !== undefined) obj.currency = u.currency
  if (u.avatar !== undefined) obj.avatar = u.avatar
  if (u.qrCodeUrl !== undefined) obj.qr_code_url = u.qrCodeUrl
  if (u.googleId !== undefined) obj.google_id = u.googleId
  if (u.isLocked !== undefined) obj.is_locked = u.isLocked
  if (u.createdAt !== undefined) obj.created_at = u.createdAt
  return obj
}

function toAppGroup(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    ownerId: row.owner_id,
    avatar: row.avatar,
    members: Array.isArray(row.members) ? row.members : (typeof row.members === 'string' ? JSON.parse(row.members) : []),
    createdAt: row.created_at
  }
}

function toDbGroup(g) {
  const obj = {}
  if (g.id !== undefined) obj.id = g.id
  if (g.name !== undefined) obj.name = g.name
  if (g.description !== undefined) obj.description = g.description
  if (g.ownerId !== undefined) obj.owner_id = g.ownerId
  if (g.avatar !== undefined) obj.avatar = g.avatar
  if (g.members !== undefined) obj.members = g.members
  if (g.createdAt !== undefined) obj.created_at = g.createdAt
  return obj
}

function toAppMeal(row) {
  if (!row) return null
  return {
    id: row.id,
    groupId: row.group_id,
    title: row.title,
    totalAmount: Number(row.total_amount),
    paidBy: row.paid_by,
    splitType: row.split_type,
    splitDetails: typeof row.split_details === 'string' ? JSON.parse(row.split_details) : (row.split_details || {}),
    participants: typeof row.participants === 'string' ? JSON.parse(row.participants) : (row.participants || []),
    imageUrl: row.image_url,
    note: row.note,
    createdAt: row.created_at
  }
}

function toDbMeal(m) {
  const obj = {}
  if (m.id !== undefined) obj.id = m.id
  if (m.groupId !== undefined) obj.group_id = m.groupId
  if (m.title !== undefined) obj.title = m.title
  if (m.totalAmount !== undefined) obj.total_amount = m.totalAmount
  if (m.paidBy !== undefined) obj.paid_by = m.paidBy
  if (m.splitType !== undefined) obj.split_type = m.splitType
  if (m.splitDetails !== undefined) obj.split_details = m.splitDetails
  if (m.participants !== undefined) obj.participants = m.participants
  if (m.imageUrl !== undefined) obj.image_url = m.imageUrl
  if (m.note !== undefined) obj.note = m.note
  if (m.createdAt !== undefined) obj.created_at = m.createdAt
  return obj
}

function toAppDebt(row) {
  if (!row) return null
  return {
    id: row.id,
    mealId: row.meal_id,
    groupId: row.group_id,
    fromUser: row.from_user,
    toUser: row.to_user,
    amount: Number(row.amount),
    status: row.status,
    proofImage: row.proof_image,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

function toDbDebt(d) {
  const obj = {}
  if (d.id !== undefined) obj.id = d.id
  if (d.mealId !== undefined) obj.meal_id = d.mealId
  if (d.groupId !== undefined) obj.group_id = d.groupId
  if (d.fromUser !== undefined) obj.from_user = d.fromUser
  if (d.toUser !== undefined) obj.to_user = d.toUser
  if (d.amount !== undefined) obj.amount = d.amount
  if (d.status !== undefined) obj.status = d.status
  if (d.proofImage !== undefined) obj.proof_image = d.proofImage
  if (d.createdAt !== undefined) obj.created_at = d.createdAt
  if (d.updatedAt !== undefined) obj.updated_at = d.updatedAt
  return obj
}

function toAppNotification(row) {
  if (!row) return null
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    message: row.message,
    type: row.type,
    isRead: row.is_read,
    link: row.link,
    createdAt: row.created_at
  }
}

function toDbNotification(n) {
  const obj = {}
  if (n.id !== undefined) obj.id = n.id
  if (n.userId !== undefined) obj.user_id = n.userId
  if (n.title !== undefined) obj.title = n.title
  if (n.message !== undefined) obj.message = n.message
  if (n.type !== undefined) obj.type = n.type
  if (n.isRead !== undefined) obj.is_read = n.isRead
  if (n.link !== undefined) obj.link = n.link
  if (n.createdAt !== undefined) obj.created_at = n.createdAt
  return obj
}

// ----------------------------------------------------
// JsonDB Engine (Fallback)
// ----------------------------------------------------
class JsonDB {
  constructor(filePath) {
    this.filePath = filePath
    this.data = {
      users: [],
      meals: [],
      debts: [],
      groups: [],
      notifications: [],
      friendships: []
    }
    this.load()
  }

  load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8')
        this.data = JSON.parse(raw)
        if (!Array.isArray(this.data.friendships)) this.data.friendships = []
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

  getUsers() { return this.data.users }
  getUserById(id) { return this.data.users.find(u => u.id === id) }
  getUserByUsername(username) {
    return this.data.users.find(u => u.username.toLowerCase() === username.toLowerCase())
  }
  getUserByIdentifier(identifier) {
    if (!identifier) return null
    const q = identifier.trim().toLowerCase().replace(/^@/, '')
    const cleanPhone = identifier.replace(/[^0-9]/g, '')
    return this.data.users.find(u => {
      const uPhone = (u.phone || '').replace(/[^0-9]/g, '')
      const matchPhone = cleanPhone && uPhone && (uPhone === cleanPhone || uPhone.endsWith(cleanPhone) || cleanPhone.endsWith(uPhone))
      return (
        u.username?.toLowerCase() === q ||
        (u.email && u.email.toLowerCase() === q) ||
        matchPhone
      )
    })
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

  getFriendships() { return this.data.friendships || [] }
  addFriendship(f) {
    if (!this.data.friendships) this.data.friendships = []
    this.data.friendships.push(f)
    this.save()
    return f
  }
  updateFriendship(id, updates) {
    if (!this.data.friendships) this.data.friendships = []
    const idx = this.data.friendships.findIndex(f => f.id === id)
    if (idx !== -1) {
      this.data.friendships[idx] = { ...this.data.friendships[idx], ...updates }
      this.save()
      return this.data.friendships[idx]
    }
    return null
  }
  deleteFriendship(id) {
    if (!this.data.friendships) this.data.friendships = []
    this.data.friendships = this.data.friendships.filter(f => f.id !== id)
    this.save()
  }
}

const localJsonDb = new JsonDB(DB_FILE)

// Graceful database initialization:
if (process.env.NODE_ENV === 'production' && !supabase) {
  console.warn('⚠️ NOTICE: SUPABASE_URL / SUPABASE_KEY not provided in production environment. Running with local JsonDB engine (mealmate_db.json).')
}

// ----------------------------------------------------
// Unified Async Data Access Layer (Supabase / JsonDB)
// ----------------------------------------------------
export const db = {
  // Sync fallback property access for initial seed check
  get data() { return localJsonDb.data },

  // USERS
  async getUsers() {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: true })
        if (error) {
          console.warn('⚠️ Supabase getUsers warning (fallback to JsonDB):', error.message || error)
          return localJsonDb.getUsers()
        }
        return (data || []).map(toAppUser)
      } catch (err) {
        console.warn('⚠️ Supabase getUsers error (fallback to JsonDB):', err.message || err)
        return localJsonDb.getUsers()
      }
    }
    return localJsonDb.getUsers()
  },

  async getUserById(id) {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('users').select('*').eq('id', id).single()
        if (error && error.code !== 'PGRST116') {
          console.warn('⚠️ Supabase getUserById warning (fallback to JsonDB):', error.message || error)
          return localJsonDb.getUserById(id)
        }
        return toAppUser(data)
      } catch (err) {
        return localJsonDb.getUserById(id)
      }
    }
    return localJsonDb.getUserById(id)
  },

  async getUserByUsername(username) {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('users').select('*').ilike('username', username).single()
        if (error && error.code !== 'PGRST116') {
          return localJsonDb.getUserByUsername(username)
        }
        return toAppUser(data)
      } catch (err) {
        return localJsonDb.getUserByUsername(username)
      }
    }
    return localJsonDb.getUserByUsername(username)
  },

  async getUserByIdentifier(identifier) {
    if (supabase) {
      try {
        const users = await this.getUsers()
        const q = (identifier || '').trim().toLowerCase().replace(/^@/, '')
        const cleanPhone = (identifier || '').replace(/[^0-9]/g, '')
        return users.find(u => {
          const uPhone = (u.phone || '').replace(/[^0-9]/g, '')
          const matchPhone = cleanPhone && uPhone && (uPhone === cleanPhone || uPhone.endsWith(cleanPhone) || cleanPhone.endsWith(uPhone))
          return (
            u.username?.toLowerCase() === q ||
            (u.email && u.email.toLowerCase() === q) ||
            matchPhone
          )
        }) || null
      } catch (err) {
        return localJsonDb.getUserByIdentifier(identifier)
      }
    }
    return localJsonDb.getUserByIdentifier(identifier)
  },

  async addUser(user) {
    if (supabase) {
      try {
        const dbRow = toDbUser(user)
        const { data, error } = await supabase.from('users').insert([dbRow]).select().single()
        if (error) {
          console.warn('⚠️ Supabase addUser error (fallback to JsonDB):', error.message || error)
          return localJsonDb.addUser(user)
        }
        return toAppUser(data)
      } catch (err) {
        return localJsonDb.addUser(user)
      }
    }
    return localJsonDb.addUser(user)
  },

  async updateUser(id, updates) {
    if (supabase) {
      try {
        const dbRow = toDbUser(updates)
        const { data, error } = await supabase.from('users').update(dbRow).eq('id', id).select().single()
        if (error) {
          return localJsonDb.updateUser(id, updates)
        }
        return toAppUser(data)
      } catch (err) {
        return localJsonDb.updateUser(id, updates)
      }
    }
    return localJsonDb.updateUser(id, updates)
  },

  // GROUPS
  async getGroups() {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('groups').select('*').order('created_at', { ascending: false })
        if (error) {
          console.warn('⚠️ Supabase getGroups warning (fallback to JsonDB):', error.message || error)
          return localJsonDb.getGroups()
        }
        return (data || []).map(toAppGroup)
      } catch (err) {
        return localJsonDb.getGroups()
      }
    }
    return localJsonDb.getGroups()
  },

  async getGroupById(id) {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('groups').select('*').eq('id', id).single()
        if (error && error.code !== 'PGRST116') {
          return localJsonDb.getGroupById(id)
        }
        return toAppGroup(data)
      } catch (err) {
        return localJsonDb.getGroupById(id)
      }
    }
    return localJsonDb.getGroupById(id)
  },

  async addGroup(group) {
    if (supabase) {
      try {
        const dbRow = toDbGroup(group)
        const { data, error } = await supabase.from('groups').insert([dbRow]).select().single()
        if (error) return localJsonDb.addGroup(group)
        return toAppGroup(data)
      } catch (err) {
        return localJsonDb.addGroup(group)
      }
    }
    return localJsonDb.addGroup(group)
  },

  async updateGroup(id, updates) {
    if (supabase) {
      try {
        const dbRow = toDbGroup(updates)
        const { data, error } = await supabase.from('groups').update(dbRow).eq('id', id).select().single()
        if (error) return localJsonDb.updateGroup(id, updates)
        return toAppGroup(data)
      } catch (err) {
        return localJsonDb.updateGroup(id, updates)
      }
    }
    return localJsonDb.updateGroup(id, updates)
  },

  async deleteGroup(id) {
    if (supabase) {
      try {
        const { error } = await supabase.from('groups').delete().eq('id', id)
        if (error) return localJsonDb.deleteGroup(id)
        return true
      } catch (err) {
        return localJsonDb.deleteGroup(id)
      }
    }
    return localJsonDb.deleteGroup(id)
  },

  // MEALS
  async getMeals() {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('meals').select('*').order('created_at', { ascending: false })
        if (error) {
          console.warn('⚠️ Supabase getMeals warning (fallback to JsonDB):', error.message || error)
          return localJsonDb.getMeals()
        }
        return (data || []).map(toAppMeal)
      } catch (err) {
        return localJsonDb.getMeals()
      }
    }
    return localJsonDb.getMeals()
  },

  async getMealById(id) {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('meals').select('*').eq('id', id).single()
        if (error && error.code !== 'PGRST116') return localJsonDb.getMealById(id)
        return toAppMeal(data)
      } catch (err) {
        return localJsonDb.getMealById(id)
      }
    }
    return localJsonDb.getMealById(id)
  },

  async addMeal(meal) {
    if (supabase) {
      try {
        const dbRow = toDbMeal(meal)
        const { data, error } = await supabase.from('meals').insert([dbRow]).select().single()
        if (error) return localJsonDb.addMeal(meal)
        return toAppMeal(data)
      } catch (err) {
        return localJsonDb.addMeal(meal)
      }
    }
    return localJsonDb.addMeal(meal)
  },

  async deleteMeal(id) {
    if (supabase) {
      try {
        const { error: debtErr } = await supabase.from('debts').delete().eq('meal_id', id)
        if (debtErr) console.warn('Warning deleting meal debts:', debtErr.message)
        const { error } = await supabase.from('meals').delete().eq('id', id)
        if (error) return localJsonDb.deleteMeal(id)
        return true
      } catch (err) {
        return localJsonDb.deleteMeal(id)
      }
    }
    return localJsonDb.deleteMeal(id)
  },

  // DEBTS
  async getDebts() {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('debts').select('*').order('created_at', { ascending: false })
        if (error) {
          console.warn('⚠️ Supabase getDebts warning (fallback to JsonDB):', error.message || error)
          return localJsonDb.getDebts()
        }
        return (data || []).map(toAppDebt)
      } catch (err) {
        return localJsonDb.getDebts()
      }
    }
    return localJsonDb.getDebts()
  },

  async getDebtById(id) {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('debts').select('*').eq('id', id).single()
        if (error && error.code !== 'PGRST116') return localJsonDb.getDebtById(id)
        return toAppDebt(data)
      } catch (err) {
        return localJsonDb.getDebtById(id)
      }
    }
    return localJsonDb.getDebtById(id)
  },

  async addDebt(debt) {
    if (supabase) {
      try {
        const dbRow = toDbDebt(debt)
        const { data, error } = await supabase.from('debts').insert([dbRow]).select().single()
        if (error) return localJsonDb.addDebt(debt)
        return toAppDebt(data)
      } catch (err) {
        return localJsonDb.addDebt(debt)
      }
    }
    return localJsonDb.addDebt(debt)
  },

  async updateDebt(id, updates) {
    if (supabase) {
      try {
        const dbRow = toDbDebt(updates)
        const { data, error } = await supabase.from('debts').update(dbRow).eq('id', id).select().single()
        if (error) return localJsonDb.updateDebt(id, updates)
        return toAppDebt(data)
      } catch (err) {
        return localJsonDb.updateDebt(id, updates)
      }
    }
    return localJsonDb.updateDebt(id, updates)
  },

  // NOTIFICATIONS
  async getNotifications(userId) {
    if (supabase) {
      try {
        let query = supabase.from('notifications').select('*').order('created_at', { ascending: false })
        if (userId) query = query.eq('user_id', userId)
        const { data, error } = await query
        if (error) return localJsonDb.getNotifications(userId)
        return (data || []).map(toAppNotification)
      } catch (err) {
        return localJsonDb.getNotifications(userId)
      }
    }
    return localJsonDb.getNotifications(userId)
  },

  async addNotification(notif) {
    if (supabase) {
      try {
        const dbRow = toDbNotification(notif)
        const { data, error } = await supabase.from('notifications').insert([dbRow]).select().single()
        if (error) return localJsonDb.addNotification(notif)
        return toAppNotification(data)
      } catch (err) {
        return localJsonDb.addNotification(notif)
      }
    }
    return localJsonDb.addNotification(notif)
  },

  async markNotificationsRead(userId) {
    if (supabase) {
      try {
        let query = supabase.from('notifications').update({ is_read: true })
        if (userId) query = query.eq('user_id', userId)
        const { error } = await query
        if (error) return localJsonDb.markNotificationsRead(userId)
        return true
      } catch (err) {
        return localJsonDb.markNotificationsRead(userId)
      }
    }
    return localJsonDb.markNotificationsRead(userId)
  },

  // FRIENDSHIPS
  async getFriendships() {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('friendships').select('*')
        if (error) return localJsonDb.getFriendships()
        return data || []
      } catch (err) {
        return localJsonDb.getFriendships()
      }
    }
    return localJsonDb.getFriendships()
  },

  async addFriendship(friendship) {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('friendships').insert([friendship]).select().single()
        if (error) return localJsonDb.addFriendship(friendship)
        return data
      } catch (err) {
        return localJsonDb.addFriendship(friendship)
      }
    }
    return localJsonDb.addFriendship(friendship)
  },

  async updateFriendship(id, updates) {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('friendships').update(updates).eq('id', id).select().single()
        if (error) return localJsonDb.updateFriendship(id, updates)
        return data
      } catch (err) {
        return localJsonDb.updateFriendship(id, updates)
      }
    }
    return localJsonDb.updateFriendship(id, updates)
  },

  async deleteFriendship(id) {
    if (supabase) {
      try {
        const { error } = await supabase.from('friendships').delete().eq('id', id)
        if (error) return localJsonDb.deleteFriendship(id)
        return true
      } catch (err) {
        return localJsonDb.deleteFriendship(id)
      }
    }
    return localJsonDb.deleteFriendship(id)
  }
}

