export const INITIAL_USERS = [
  {
    id: 'u-admin',
    username: 'admin',
    passwordHash: '123',
    name: 'Quản trị viên (Admin)',
    email: 'admin@mealmate.com',
    phone: '0901234567',
    role: 'admin',
    currency: 'VND',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Admin',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=VIETQR-ADMIN-123456789'
  },
  {
    id: 'u-alice',
    username: 'alice',
    passwordHash: '123',
    name: 'Alice Nguyễn',
    email: 'alice@gmail.com',
    phone: '0912345678',
    role: 'user',
    currency: 'VND',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=VIETQR-ALICE-987654321'
  },
  {
    id: 'u-bob',
    username: 'bob',
    passwordHash: '123',
    name: 'Bob Trần',
    email: 'bob@gmail.com',
    phone: '0987654321',
    role: 'user',
    currency: 'VND',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=VIETQR-BOB-456789012'
  },
  {
    id: 'u-charlie',
    username: 'charlie',
    passwordHash: '123',
    name: 'Charlie Phạm',
    email: 'charlie@gmail.com',
    phone: '0933445566',
    role: 'user',
    currency: 'VND',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=VIETQR-CHARLIE-1122334455'
  },
  {
    id: 'u-david',
    username: 'david',
    passwordHash: '123',
    name: 'David Lê',
    email: 'david@gmail.com',
    phone: '0977889900',
    role: 'user',
    currency: 'THB',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=PROMPTPAY-DAVID-66778899'
  }
]

export const INITIAL_GROUPS = [
  {
    id: 'g-1',
    name: 'Chuyến đi Đà Nẵng 🏖️',
    description: 'Du lịch hè cùng nhóm bạn thân',
    ownerId: 'u-alice',
    avatar: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&auto=format&fit=crop',
    members: ['u-alice', 'u-bob', 'u-charlie', 'u-david'],
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: 'g-2',
    name: 'Phòng 302 🏢',
    description: 'Chi phí sinh hoạt chung và ăn uống phòng 302',
    ownerId: 'u-bob',
    avatar: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=200&auto=format&fit=crop',
    members: ['u-alice', 'u-bob', 'u-charlie'],
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString()
  },
  {
    id: 'g-3',
    name: 'Team Cty TechCorp 💻',
    description: 'Ăn trưa & Cà phê chạy deadline',
    ownerId: 'u-alice',
    avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&auto=format&fit=crop',
    members: ['u-alice', 'u-bob', 'u-david', 'u-charlie'],
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
  }
]

export const INITIAL_MEALS = [
  {
    id: 'm-1',
    title: 'Hải Sản Bé Mặn Đà Nẵng',
    totalAmount: 1200000,
    currency: 'VND',
    paidById: 'u-alice',
    groupId: 'g-1',
    receiptUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop',
    splitType: 'equal',
    participants: ['u-alice', 'u-bob', 'u-charlie', 'u-david'],
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString()
  },
  {
    id: 'm-2',
    title: 'Lẩu Thái YumYum',
    totalAmount: 600000,
    currency: 'VND',
    paidById: 'u-bob',
    groupId: 'g-2',
    receiptUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop',
    splitType: 'equal',
    participants: ['u-alice', 'u-bob', 'u-charlie'],
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'm-3',
    title: 'Cà phê Highland & Bánh mì',
    totalAmount: 240000,
    currency: 'VND',
    paidById: 'u-charlie',
    groupId: 'g-2',
    receiptUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&auto=format&fit=crop',
    splitType: 'custom',
    participants: ['u-alice', 'u-bob', 'u-charlie'],
    customSplits: {
      'u-alice': 90000,
      'u-bob': 80000,
      'u-charlie': 70000
    },
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
  }
]

export const INITIAL_PAYMENTS = [
  // Payments for meal m-1 (total 1,200,000 / 4 = 300,000 per person)
  {
    id: 'p-1',
    mealId: 'm-1',
    debtorId: 'u-bob',
    creditorId: 'u-alice',
    amount: 300000,
    status: 'pending',
    slipUrl: null,
    rejectReason: null,
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString()
  },
  {
    id: 'p-2',
    mealId: 'm-1',
    debtorId: 'u-charlie',
    creditorId: 'u-alice',
    amount: 300000,
    status: 'slip_sent',
    slipUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop',
    rejectReason: null,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: 'p-3',
    mealId: 'm-1',
    debtorId: 'u-david',
    creditorId: 'u-alice',
    amount: 300000,
    status: 'confirmed',
    slipUrl: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=600&auto=format&fit=crop',
    rejectReason: null,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
  },

  // Payments for meal m-2 (total 600,000 / 3 = 200,000 per person)
  {
    id: 'p-4',
    mealId: 'm-2',
    debtorId: 'u-alice',
    creditorId: 'u-bob',
    amount: 200000,
    status: 'pending',
    slipUrl: null,
    rejectReason: null,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'p-5',
    mealId: 'm-2',
    debtorId: 'u-charlie',
    creditorId: 'u-bob',
    amount: 200000,
    status: 'rejected',
    slipUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop',
    rejectReason: 'Ảnh hoá đơn bị mờ, không khớp mã giao dịch ngân hàng.',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
  },

  // Payments for meal m-3 (Custom split)
  {
    id: 'p-6',
    mealId: 'm-3',
    debtorId: 'u-alice',
    creditorId: 'u-charlie',
    amount: 90000,
    status: 'pending',
    slipUrl: null,
    rejectReason: null,
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 'p-7',
    mealId: 'm-3',
    debtorId: 'u-bob',
    creditorId: 'u-charlie',
    amount: 80000,
    status: 'pending',
    slipUrl: null,
    rejectReason: null,
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
  }
]

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'n-1',
    userId: 'u-alice',
    title: 'Bill chuyển khoản mới',
    message: 'Charlie Phạm vừa gửi ảnh bill thanh toán 300,000 VND cho bữa ăn Hải Sản Bé Mặn Đà Nẵng.',
    isRead: false,
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString()
  },
  {
    id: 'n-2',
    userId: 'u-charlie',
    title: 'Thanh toán bị từ chối',
    message: 'Bob Trần đã từ chối bill của bạn với lý do: "Ảnh hoá đơn bị mờ, không khớp mã giao dịch ngân hàng."',
    isRead: false,
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString()
  },
  {
    id: 'n-3',
    userId: 'u-bob',
    title: 'Nhắc nợ tự động (Quá 3 ngày)',
    message: 'Bạn chưa thanh toán khoản nợ 300,000 VND cho Alice Nguyễn (Bữa ăn Hải Sản Bé Mặn Đà Nẵng). Vui lòng gửi bill sớm!',
    isRead: false,
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString()
  }
]
