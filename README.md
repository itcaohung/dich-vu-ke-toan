# Kế Toán Minh Châu — Hệ thống Website & Quản trị

Hệ thống website dịch vụ kế toán gồm 3 thành phần: **website công khai**, **trang quản trị (admin)** và **API server**.

---

## Tổng quan kiến trúc

```
ke-toan-minh-chau/
├── client/     # Website công khai        → http://localhost:5173
├── admin/      # Trang quản trị           → http://localhost:5174
└── server/     # REST API + Database      → http://localhost:4001
```

### Tech stack

| Thành phần | Công nghệ |
|---|---|
| Frontend (client & admin) | React 19, TypeScript, Vite, Tailwind CSS |
| State & Data fetching | TanStack React Query, Axios |
| Form & Validation | React Hook Form, Zod |
| Rich text editor | TipTap |
| Drag & drop | DnD Kit |
| Backend | Node.js, Express, TypeScript |
| ORM | Prisma 5 |
| Database | PostgreSQL |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Upload | Multer |

---

## Cài đặt & Chạy

### Yêu cầu

- Node.js >= 18
- PostgreSQL đang chạy
- Tạo database: `createdb ketoanminhchau`

### 1. Cài dependencies

```bash
cd server && npm install
cd ../client && npm install
cd ../admin && npm install
```

### 2. Cấu hình môi trường

**`server/.env`**
```env
DATABASE_URL="postgresql://<user>@localhost:5432/ketoanminhchau"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
PORT=4001
NODE_ENV=development
PRISMA_QUERY_LOG=false
CLIENT_URL="http://localhost:5173"
ADMIN_URL="http://localhost:5174"
```

**`client/.env`**
```env
VITE_API_URL=http://localhost:4001/api
```

**`admin/.env`**
```env
VITE_API_URL=http://localhost:4001/api
```

### 3. Khởi tạo database

```bash
cd server
npx prisma migrate dev    # Chạy migrations
npm run db:seed           # Seed dữ liệu mẫu
```

Tài khoản admin mặc định sau khi seed:
- **Email:** `admin@ketoanminhchau.vn`
- **Mật khẩu:** `Admin@123456`

### 4. Chạy ứng dụng

Mở 3 terminal riêng biệt:

```bash
# Terminal 1 — Server
cd server && npm run dev

# Terminal 2 — Website
cd client && npm run dev

# Terminal 3 — Admin
cd admin && npm run dev
```

---

## Database Schema

### Bảng chính

| Model | Mô tả |
|---|---|
| `User` | Tài khoản admin (role: `SUPER_ADMIN`, `ADMIN`) |
| `Post` | Bài viết / Tin tức (có soft delete) |
| `Category` | Danh mục bài viết |
| `Service` | Dịch vụ cung cấp (có soft delete) |
| `Page` | Trang tĩnh CMS (có soft delete) |
| `Contact` | Khách hàng gửi form liên hệ |
| `Banner` | Banner trang chủ |
| `Office` | Thông tin văn phòng chi nhánh |
| `MenuItem` | Menu điều hướng (hỗ trợ nested) |
| `Setting` | Cài đặt website (key-value) |
| `Testimonial` | Đánh giá khách hàng |
| `TeamMember` | Thành viên đội ngũ |

> Các bảng có `deletedAt` hỗ trợ **soft delete** — dữ liệu không bị xóa vĩnh viễn ngay, có thể khôi phục từ Thùng rác.

---

## API Endpoints

### Public (không cần đăng nhập)

```
GET  /api/posts                  Danh sách bài viết (phân trang, tìm kiếm, lọc category)
GET  /api/posts/:slug            Chi tiết bài viết + bài liên quan
GET  /api/services               Danh sách dịch vụ
GET  /api/services/:slug         Chi tiết dịch vụ
GET  /api/categories             Danh sách danh mục
GET  /api/pages/:slug            Trang CMS theo slug
GET  /api/banners                Danh sách banner
GET  /api/offices                Danh sách văn phòng
GET  /api/menu                   Menu điều hướng (nested)
GET  /api/testimonials           Đánh giá khách hàng
GET  /api/team                   Thành viên đội ngũ
GET  /api/settings               Cài đặt công khai
POST /api/contacts               Gửi form liên hệ
GET  /health                     Health check
```

### Auth

```
POST /api/auth/login             Đăng nhập
GET  /api/auth/me                Thông tin user hiện tại (cần token)
PUT  /api/auth/change-password   Đổi mật khẩu (cần token)
```

### Admin (cần Bearer token)

```
/api/admin/posts           CRUD bài viết
/api/admin/services        CRUD dịch vụ
/api/admin/categories      CRUD danh mục
/api/admin/pages           CRUD trang CMS
/api/admin/banners         CRUD banner
/api/admin/offices         CRUD văn phòng
/api/admin/menu            CRUD menu
/api/admin/testimonials    CRUD testimonial
/api/admin/team            CRUD thành viên đội ngũ
/api/admin/contacts        Xem & quản lý liên hệ
/api/admin/settings        Cài đặt website
/api/admin/users           Quản lý tài khoản
/api/admin/upload          Upload ảnh
/api/admin/trash           Xem & khôi phục dữ liệu đã xóa
/api/admin/import          Import bài viết từ WordPress
/api/admin/stats           Thống kê Dashboard
```

---

## Cấu trúc thư mục

### Server

```
server/src/
├── index.ts              Entry point (Express setup, CORS, rate limit)
├── routes/
│   ├── auth.ts           Auth routes
│   ├── public.ts         Public routes
│   └── admin/            Admin routes (protected)
├── middleware/
│   ├── auth.ts           JWT middleware
│   ├── error.ts          Global error handler
│   └── upload.ts         Multer config
└── lib/
    ├── prisma.ts          Prisma client singleton
    └── slugify.ts         Tiện ích tạo slug tiếng Việt
```

### Client (Website công khai)

```
client/src/
├── pages/
│   ├── HomePage.tsx
│   ├── BlogPage.tsx / BlogDetailPage.tsx
│   ├── ServicesPage.tsx / ServiceDetailPage.tsx
│   ├── ContactPage.tsx
│   ├── AboutPage.tsx
│   ├── ThanhLap*.tsx      Các trang thành lập công ty theo tỉnh
│   └── DynamicPage.tsx    Trang CMS động
├── components/
│   ├── layout/            Header, Footer, Layout
│   └── ui/                ContactForm
└── api/index.ts           API client (Axios + export API_BASE)
```

### Admin

```
admin/src/
├── pages/
│   ├── DashboardPage.tsx
│   ├── LoginPage.tsx
│   ├── posts/             Bài viết (danh sách, form, import WordPress)
│   ├── services/          Dịch vụ
│   ├── categories/        Danh mục
│   ├── pages/             Trang CMS
│   ├── banners/           Banner
│   ├── offices/           Văn phòng
│   ├── menu/              Menu
│   ├── testimonials/      Đánh giá
│   ├── team/              Đội ngũ
│   ├── contacts/          Liên hệ
│   ├── settings/          Cài đặt
│   ├── users/             Tài khoản
│   └── trash/             Thùng rác
├── components/
│   ├── layout/            AdminLayout, Sidebar
│   ├── editor/            RichEditor (TipTap)
│   └── ui/                UI components dùng chung
├── contexts/AuthContext.tsx
└── api/client.ts          Axios client + export API_BASE
```

---

## Scripts hữu ích

```bash
# Database
npm run db:migrate    # Tạo & chạy migration mới
npm run db:seed       # Seed dữ liệu mẫu
npm run db:studio     # Mở Prisma Studio (GUI xem DB)
npm run db:push       # Sync schema không cần migration (dev)

# Build production
cd server && npm run build && npm start
cd client && npm run build
cd admin && npm run build
```

---

## Lưu ý vận hành

- **Upload files** được lưu tại `server/uploads/` và serve qua `/uploads/*`
- **Soft delete**: dữ liệu xóa không mất ngay — vào **Thùng rác** trong admin để khôi phục hoặc xóa vĩnh viễn
- **Rate limit**: API giới hạn 300 request / 15 phút / IP
- **CORS**: Server chỉ chấp nhận request từ `CLIENT_URL` và `ADMIN_URL` trong `.env`
- Khi thay đổi `.env` của client hoặc admin, cần **restart Vite** để nhận biến mới
