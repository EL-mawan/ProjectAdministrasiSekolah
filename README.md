# 🎓 Sistem Manajemen Sekolah

Sistem informasi manajemen sekolah modern yang dibangun dengan teknologi terkini untuk mengelola data siswa, guru, staff, dan operasional sekolah secara efisien.

## ✨ Fitur Utama

### 👥 Manajemen Pengguna
- **Multi-level User Roles** - Super Admin, Admin, Kurikulum, Kesiswaan, Sarana Prasarana, Operator, Guru, Staff
- **Autentikasi & Otorisasi** - Login aman dengan NextAuth.js
- **Manajemen Akses** - Role-based access control (RBAC)

### 📚 Manajemen Akademik
- **Data Siswa** - Registrasi, biodata lengkap, riwayat akademik
- **Data Guru & Staff** - Profil lengkap, riwayat kepegawaian
- **Kelas & Mata Pelajaran** - Pengelolaan kelas dan kurikulum
- **Jadwal Pelajaran** - Penjadwalan otomatis dan manual
- **Nilai & Rapor** - Input dan cetak nilai siswa

### 📊 Manajemen Kesiswaan
- **Absensi** - Pencatatan kehadiran siswa, guru, dan staff
- **Pelanggaran** - Tracking pelanggaran dan sanksi
- **Prestasi** - Pencatatan achievement siswa
- **Alumni** - Database alumni sekolah

### 🏢 Manajemen Sarana Prasarana
- **Inventaris** - Pencatatan aset dan fasilitas sekolah
- **Peminjaman** - Sistem peminjaman fasilitas
- **Maintenance** - Tracking kondisi dan perawatan

### 📄 Manajemen Surat & Dokumen
- **Surat Masuk/Keluar** - Pengelolaan korespondensi
- **Sertifikat** - Generate sertifikat otomatis
- **Laporan** - Berbagai jenis laporan sekolah

## 🚀 Teknologi Stack

### Core Framework
- **⚡ Next.js 15** - React framework dengan App Router
- **📘 TypeScript 5** - Type-safe development
- **🎨 Tailwind CSS 4** - Utility-first CSS framework

### UI Components
- **🧩 shadcn/ui** - Komponen UI modern dan accessible
- **🎯 Lucide React** - Icon library
- **🌈 Framer Motion** - Animasi smooth
- **📊 Recharts** - Data visualization

### Database & ORM
- **🗄️ Prisma** - TypeScript ORM
- **💾 SQLite** - Database (development)
- **🔄 Migration System** - Database version control

### Forms & Validation
- **🎣 React Hook Form** - Form management
- **✅ Zod** - Schema validation
- **🔐 bcryptjs** - Password hashing

## 📦 Instalasi

```bash
# Install dependencies
bun install

# Setup database
bun run db:push

# Seed initial data
bun run db:seed

# Start development server
bun run dev
```

## 🔧 Environment Variables

Buat file `.env` di root project:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   bun install
   ```

2. **Setup database**
   ```bash
   bun run db:push
   ```

3. **Seed data awal**
   ```bash
   bun run db:seed
   ```

4. **Run development server**
   ```bash
   bun run dev
   ```

5. **Buka aplikasi**
   ```
   http://localhost:3000
   ```

## 👤 Default Login

Setelah seeding, gunakan kredensial berikut untuk login:

- **Email**: `admin@school.sch.id`
- **Password**: `admin123`
- **Role**: Super Admin

## 📁 Struktur Project

```
src/
├── app/                 # Next.js App Router pages
│   ├── api/            # API routes
│   ├── page.tsx        # Homepage
│   └── layout.tsx      # Root layout
├── components/          # React components
│   ├── dashboard/      # Dashboard components
│   ├── students/       # Student management
│   ├── layout/         # Layout components
│   └── ui/             # shadcn/ui components
├── hooks/              # Custom React hooks
└── lib/                # Utility functions

prisma/
├── schema.prisma       # Database schema
└── seed.ts            # Seed data
```

## 🗄️ Database Schema

### Main Models
- **User** - Pengguna sistem dengan berbagai role
- **School** - Data sekolah
- **Student** - Data siswa
- **Teacher** - Data guru
- **Staff** - Data staff
- **Class** - Kelas
- **Subject** - Mata pelajaran
- **Schedule** - Jadwal
- **Attendance** - Kehadiran
- **Grade** - Nilai
- **Violation** - Pelanggaran
- **Achievement** - Prestasi
- **Facility** - Sarana prasarana
- **Document** - Dokumen
- **ActivityLog** - Log aktivitas

## 📊 Database Commands

```bash
# Push schema to database
bun run db:push

# Generate Prisma Client
bun run db:generate

# Create migration
bun run db:migrate

# Reset database
bun run db:reset

# Seed database
bun run db:seed
```

## 🔐 User Roles & Permissions

- **SUPER_ADMIN** - Akses penuh ke seluruh sistem
- **ADMIN** - Administrasi umum sekolah
- **CURRICULUM** - Manajemen kurikulum dan akademik
- **STUDENT_AFFAIRS** - Manajemen kesiswaan
- **FACILITY** - Manajemen sarana prasarana
- **OPERATOR** - Operator data entry
- **TEACHER** - Guru (input nilai, absensi)
- **STAFF** - Staff administrasi

## 🎨 UI Components

Menggunakan shadcn/ui dengan komponen:
- Forms (Input, Select, Checkbox, Radio)
- Data Display (Table, Card, Badge)
- Feedback (Toast, Alert, Dialog)
- Navigation (Menu, Breadcrumb, Pagination)
- Layout (Sidebar, Header, Container)

## 📱 Responsive Design

- ✅ Desktop (1200px+)
- ✅ Tablet (768px - 1199px)
- ✅ Mobile (< 768px)

## 🔄 Development Workflow

1. **Development**
   ```bash
   bun run dev
   ```

2. **Build**
   ```bash
   bun run build
   ```

3. **Production**
   ```bash
   bun start
   ```

## 📝 License

MIT License - Silakan digunakan untuk keperluan pendidikan dan pengembangan.

---

Dibuat dengan ❤️ untuk pendidikan Indonesia 🇮🇩
