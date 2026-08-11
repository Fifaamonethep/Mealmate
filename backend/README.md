# MealMate Node.js REST API Backend 🚀

Hệ thống **Backend REST API** hoàn chỉnh cho ứng dụng Web App quản lý nợ & chia tiền bữa ăn **MealMate**.

---

## 🛠️ Công nghệ sử dụng
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Zero-config File-backed Database / SQLite (`backend/database/mealmate_db.json`)
- **Authentication**: JWT (JSON Web Tokens) Bearer Tokens
- **Middleware**: CORS, Body Parser, Error Handler, Authorization

---

## ⚡ Hướng dẫn Chạy Backend

### 1. Di chuyển vào thư mục backend
```bash
cd backend
```

### 2. Cài đặt Thư viện (Dependencies)
```bash
npm install
```

### 3. Khởi chạy Server Backend
- **Chế độ Dev (Tự động khôi phục khi sửa code)**:
  ```bash
  npm run dev
  ```
- **Chế độ Production**:
  ```bash
  npm start
  ```

Máy chủ API sẽ chạy tại địa chỉ: **`http://localhost:5000`**

---

## 📋 Danh sách API Endpoints

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Đăng nhập tài khoản |
| `POST` | `/api/auth/register` | Đăng ký tài khoản mới |
| `GET` | `/api/auth/me` | Lấy thông tin tài khoản hiện tại |
| `GET` | `/api/auth/users` | Lấy danh sách tất cả thành viên |
| `PUT` | `/api/auth/profile` | Cập nhật hồ sơ cá nhân |

### 🍽️ Meals (`/api/meals`)
| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/api/meals` | Lấy danh sách bữa ăn |
| `GET` | `/api/meals/:id` | Xem chi tiết bữa ăn |
| `POST` | `/api/meals` | Tạo bữa ăn mới & tự chia tiền |
| `DELETE` | `/api/meals/:id` | Xóa bữa ăn |

### 💸 Debts (`/api/debts`)
| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/api/debts` | Lấy danh sách công nợ |
| `PUT` | `/api/debts/:id/slip` | Gửi ảnh Bill chuyển khoản |
| `PUT` | `/api/debts/:id/confirm` | Xác nhận đã nhận đủ tiền |
| `PUT` | `/api/debts/:id/reject` | Từ chối bill kèm lý do |
| `PUT` | `/api/debts/:id/force` | *(Admin)* Duyệt/từ chối cưỡng chế |

### 👥 Groups (`/api/groups`)
| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/api/groups` | Lấy danh sách nhóm |
| `POST` | `/api/groups` | Tạo nhóm mới |
| `PUT` | `/api/groups/:id` | Sửa thông tin nhóm |
| `DELETE` | `/api/groups/:id` | Giải tán nhóm |
| `POST` | `/api/groups/:id/members` | Thêm thành viên vào nhóm |
| `DELETE` | `/api/groups/:id/members/:userId` | Xóa thành viên khỏi nhóm |

### 🔔 Notifications (`/api/notifications`)
| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/api/notifications` | Lấy danh sách thông báo |
| `PUT` | `/api/notifications/read-all` | Đánh dấu đã đọc tất cả |

### 🛡️ Admin (`/api/admin`)
| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/api/admin/users` | Danh sách người dùng |
| `PUT` | `/api/admin/users/:id/lock` | Khóa / Mở khóa tài khoản |
| `PUT` | `/api/admin/users/:id/role` | Cập nhật vai trò (User/Admin) |
| `PUT` | `/api/admin/users/:id/password` | Đổi mật khẩu tài khoản |
| `GET` | `/api/admin/matrix` | Lấy Ma trận nợ toàn hệ thống |
