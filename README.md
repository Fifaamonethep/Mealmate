# MealMate Web Application 🍽️💰

MealMate là ứng dụng Web App quản lý nợ & tự động chia tiền bữa ăn xây dựng bằng **Vue 3 (Composition API)**, **Vite**, **Pinia**, **Vue Router**, **Tailwind CSS**, **Lucide Icons**, và **Axios**.

---

## ⚡ Hướng dẫn Chạy Dự án tại Máy Local

### 1. Cài đặt Thư viện Dependencies
Mở Terminal tại thư mục dự án và chạy:
```bash
npm install
```

### 2. Chạy Dev Server
Chạy lệnh bên dưới để bắt đầu máy chủ phát triển:
```bash
npm run dev
```
Truy cập trình duyệt tại địa chỉ: **http://localhost:3000/**

### 3. Build Sản Phẩm Production (Tùy chọn)
```bash
npm run build
```

---

## 🔐 Tài Khoản Đăng Nhập Mẫu (Test Accounts)

Bạn có thể đăng nhập bằng các tài khoản mẫu sau (mật khẩu mặc định đính kèm bên dưới):

| Username | Password | Tên Hiển Thị | Vai Trò (Role) |
| :--- | :--- | :--- | :--- |
| `admin` | `123` | ຜູ້ດູແລລະບົບ (Admin) | **Admin System** |
| `alice` | `123` | Alice Vongxay | User (Chủ nợ / Quản lý nhóm) |
| `bob` | `123` | Bob Soukthavy | User |

*Mẹo: Bạn có thể chọn nhanh tài khoản trên thanh **Test Accounts** ở đầu giao diện để chuyển đổi giữa các tài khoản tức thì mà không cần thoát ra!*

---

## 🛠️ Tính năng Nổi bật

1. **Auth & Profile**: Đăng nhập/Đăng ký JWT, Cập nhật ảnh **QR Ngân hàng / PromptPay**, Tiền tệ mặc định, Dark/Light Mode.
2. **Bữa ăn & Chia tiền**: Tạo bữa ăn, chia đều / chia tùy chỉnh, tích hợp **AI Face Recognition Scanner** tự động chọn thành viên từ ảnh chụp bàn ăn.
3. **Quản lý Nợ & Duyệt Bill**: Nợ tôi trả & Mọi người nợ tôi. Gửi ảnh bill chuyển khoản (`slip_sent`) -> Chủ nợ duyệt (`confirmed`) hoặc từ chối (`rejected`).
4. **Quản lý Nhóm**: Tạo nhóm, xem chi tiết nhóm tại `/groups/:id`, thêm/xóa thành viên bằng Email/Username, ma trận nợ nội bộ nhóm.
5. **Thông báo Real-time & Toast System**: Cập nhật trạng thái nợ, nhắc nợ tự động quá 3 ngày.
6. **Bảng điều khiển Admin**: Thống kê toàn hệ thống, **Ma trận công nợ chéo (Debt Matrix)**, Duyệt cưỡng chế (Force Confirm/Reject), Quản lý người dùng (Khóa/Đổi Pass).
