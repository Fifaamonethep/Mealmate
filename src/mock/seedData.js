export const INITIAL_USERS = [
  {
    id: 'u-admin',
    username: 'admin',
    passwordHash: '123',
    name: 'ຜູ້ດູແລລະບົບ (Admin)',
    email: 'sokeskesannouanlaty@gmail.com',
    phone: '2098667856',
    role: 'admin',
    currency: 'LAK',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Admin',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=LAOQR-ADMIN-2098667856',
    friends: []
  }
]

export const INITIAL_GROUPS = [
  {
    id: 'g-3',
    name: 'Team Cty TechCorp 💻',
    description: 'ກິນເຂົ້າສາຍ ກາເຟ ແລະ ງານລ້ຽງບໍລິສັດ',
    ownerId: 'u-admin',
    avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&auto=format&fit=crop',
    members: ['u-admin'],
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
  }
]

export const INITIAL_MEALS = []
export const INITIAL_PAYMENTS = []
export const INITIAL_NOTIFICATIONS = []
