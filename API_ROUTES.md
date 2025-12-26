# 📚 API Routes - Sistem Manajemen Sekolah

## ✅ API Routes yang Sudah Dibuat

### 1. Students API
- `GET /api/students` - List students dengan pagination & filter
- `POST /api/students` - Create student
- `GET /api/students/[id]` - Get student detail
- `PUT /api/students/[id]` - Update student
- `DELETE /api/students/[id]` - Delete student

### 2. Teachers API ✅ BARU
- `GET /api/teachers` - List teachers dengan pagination & filter
- `POST /api/teachers` - Create teacher (includes user creation)
- `GET /api/teachers/[id]` - Get teacher detail
- `PUT /api/teachers/[id]` - Update teacher
- `DELETE /api/teachers/[id]` - Delete teacher (includes user deletion)

### 3. Classes API ✅ BARU
- `GET /api/classes` - List classes dengan filter by school year
- `POST /api/classes` - Create class
- `GET /api/classes/[id]` - Get class detail
- `PUT /api/classes/[id]` - Update class
- `DELETE /api/classes/[id]` - Delete class

### 4. Dashboard API
- `GET /api/dashboard` - Get statistik dashboard

### 5. School API
- `GET /api/school` - Get default school info

## 🔨 API Routes yang Perlu Dibuat

### 6. Subjects API (Mata Pelajaran)
```
GET    /api/subjects
POST   /api/subjects
GET    /api/subjects/[id]
PUT    /api/subjects/[id]
DELETE /api/subjects/[id]
```

### 7. Attendance API (Absensi)
```
GET    /api/attendance
POST   /api/attendance
GET    /api/attendance/[id]
PUT    /api/attendance/[id]
DELETE /api/attendance/[id]
```

### 8. Grades API (Nilai)
```
GET    /api/grades
POST   /api/grades
GET    /api/grades/[id]
PUT    /api/grades/[id]
DELETE /api/grades/[id]
```

### 9. Facilities API (Sarana Prasarana)
```
GET    /api/facilities
POST   /api/facilities
GET    /api/facilities/[id]
PUT    /api/facilities/[id]
DELETE /api/facilities/[id]
```

### 10. Documents API (Surat & Dokumen)
```
GET    /api/documents
POST   /api/documents
GET    /api/documents/[id]
PUT    /api/documents/[id]
DELETE /api/documents/[id]
```

### 11. Achievements API (Prestasi)
```
GET    /api/achievements
POST   /api/achievements
GET    /api/achievements/[id]
PUT    /api/achievements/[id]
DELETE /api/achievements/[id]
```

### 12. Violations API (Pelanggaran)
```
GET    /api/violations
POST   /api/violations
GET    /api/violations/[id]
PUT    /api/violations/[id]
DELETE /api/violations/[id]
```

### 13. Users API (Manajemen User)
```
GET    /api/users
POST   /api/users
GET    /api/users/[id]
PUT    /api/users/[id]
DELETE /api/users/[id]
```

## 📊 Status Progress

| No | Module | API Created | Frontend Updated | Status |
|----|--------|------------|------------------|--------|
| 1 | Students | ✅ | ✅ | Complete |
| 2 | Teachers | ✅ | ⏳ | API Done |
| 3 | Classes | ✅ | ⏳ | API Done |
| 4 | Dashboard | ✅ | ✅ | Complete |
| 5 | School | ✅ | ✅ | Complete |
| 6 | Subjects | ⏳ | ⏳ | Pending |
| 7 | Attendance | ⏳ | ⏳ | Pending |
| 8 | Grades | ⏳ | ⏳ | Pending |
| 9 | Facilities | ⏳ | ⏳ | Pending |
| 10 | Documents | ⏳ | ⏳ | Pending |
| 11 | Achievements | ⏳ | ⏳ | Pending |
| 12 | Violations | ⏳ | ⏳ | Pending |
| 13 | Users | ⏳ | ⏳ | Pending |

## 🎯 Next Steps

1. ✅ Teachers API - DONE
2. ✅ Classes API - DONE
3. 🔄 Create remaining APIs (Subjects, Attendance, Grades, etc.)
4. 🔄 Update frontend components to use APIs
5. 🔄 Add loading states
6. 🔄 Add error handling
7. 🔄 Add success notifications

## 📝 Notes

- All APIs use Prisma ORM with SQLite database
- Pagination implemented where needed
- Search and filter capabilities
- Proper error handling
- TypeScript type safety
