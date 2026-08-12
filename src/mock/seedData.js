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
    friends: ['u-alice', 'u-bob', 'u-charlie']
  },
  {
    id: 'u-alice',
    username: 'alice',
    passwordHash: '123',
    name: 'Alice Vongxay',
    email: 'alice@gmail.com',
    phone: '2055667788',
    role: 'user',
    currency: 'LAK',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=LAOQR-ALICE-55667788',
    friends: ['u-bob', 'u-charlie']
  },
  {
    id: 'u-bob',
    username: 'bob',
    passwordHash: '123',
    name: 'Bob Soukthavy',
    email: 'bob@gmail.com',
    phone: '2099887766',
    role: 'user',
    currency: 'LAK',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=LAOQR-BOB-99887766',
    friends: ['u-alice', 'u-charlie']
  },
  {
    id: 'u-charlie',
    username: 'charlie',
    passwordHash: '123',
    name: 'Charlie Keomany',
    email: 'charlie@gmail.com',
    phone: '2077889900',
    role: 'user',
    currency: 'LAK',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=LAOQR-CHARLIE-77889900',
    friends: ['u-alice', 'u-bob']
  }
]

export const INITIAL_GROUPS = [
  {
    id: 'g-1',
    name: 'ກຸ່ມທ່ຽວ ວັງວຽງ 🏖️',
    description: 'ທ່ອງທ່ຽວພັກຜ່ອນກັບກຸ່ມໝູ່ເພື່ອນ ວັງວຽງ 2026',
    ownerId: 'u-alice',
    avatar: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&auto=format&fit=crop',
    members: ['u-admin', 'u-alice', 'u-bob', 'u-charlie'],
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: 'g-2',
    name: 'ຫ້ອງ 302 🏢',
    description: 'ຄ່າໃຊ້ຈ່າຍສ່ວນລວມແລະອາຫານຫ້ອງ 302',
    ownerId: 'u-bob',
    avatar: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=200&auto=format&fit=crop',
    members: ['u-alice', 'u-bob', 'u-charlie'],
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString()
  },
  {
    id: 'g-3',
    name: 'Team Cty TechCorp 💻',
    description: 'ກິນເຂົ້າສາຍ ກາເຟ ແລະ ງານລ້ຽງບໍລິສັດ',
    ownerId: 'u-admin',
    avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&auto=format&fit=crop',
    members: ['u-admin', 'u-alice', 'u-bob', 'u-charlie'],
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'g-4',
    name: 'ກຸ່ມຕີບານ & ກິລາ ⚽',
    description: 'ຄ່າເດີນຕີບານ ແລະ ນ້ຳດື່ມທຸກໆທ້າຍອາທິດ',
    ownerId: 'u-charlie',
    avatar: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=200&auto=format&fit=crop',
    members: ['u-admin', 'u-alice', 'u-bob', 'u-charlie'],
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 'g-5',
    name: 'ກຸ່ມກິນດື່ມທ້າຍອາທິດ 🍲',
    description: 'ສັງສັນກິນດື່ມໝູກະທະ ແລະ ຊາບູ ທຸກວັນສຸກ',
    ownerId: 'u-admin',
    avatar: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop',
    members: ['u-admin', 'u-alice', 'u-bob', 'u-charlie'],
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
  }
]

export const INITIAL_MEALS = []
export const INITIAL_PAYMENTS = []
export const INITIAL_NOTIFICATIONS = []
