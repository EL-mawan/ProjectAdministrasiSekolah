import { PrismaClient, UserRole, Gender, StudentStatus, TeacherStatus, Day, GradeType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Helper to generate random int
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

// Helper for random item from array
const randomItem = <T>(arr: T[]): T => arr[randomInt(0, arr.length - 1)]

// Helper for random date
const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

// Names data
const firstNameMale = [
  'Ahmad', 'Budi', 'Chandra', 'Dedi', 'Eko', 'Fajar', 'Gunawan', 'Hadi', 'Indra', 'Joko', 
  'Kurniawan', 'Lukman', 'Muhammad', 'Nur', 'Oki', 'Putra', 'Rizky', 'Satria', 'Tegu', 'Wahyu', 
  'Yudi', 'Zainal', 'Adit', 'Bayu', 'Cahyo', 'Dimas', 'Fery', 'Gilang', 'Heru', 'Irfan', 
  'Kevin', 'Lutfi', 'Mahendra', 'Nanda', 'Oscar', 'Pandu', 'Qori', 'Rian', 'Sandi', 'Taufik',
  'Usman', 'Vicky', 'Wildan', 'Yusuf', 'Zaki'
]
const firstNameFemale = [
  'Ayu', 'Bunga', 'Citra', 'Dewi', 'Eka', 'Fitri', 'Gita', 'Hani', 'Indah', 'Juwita', 
  'Kartika', 'Lestari', 'Maya', 'Nurul', 'Ovi', 'Putri', 'Ratna', 'Sari', 'Tari', 'Wulan', 
  'Yuni', 'Zahra', 'Amel', 'Bella', 'Cindy', 'Dinda', 'Elisa', 'Fanny', 'Gaby', 'Hana',
  'Intan', 'Jasmine', 'Kirana', 'Lina', 'Mawar', 'Nadia', 'Olive', 'Prilly', 'Rina', 'Siska',
  'Tiara', 'Uly', 'Vina', 'Winda', 'Yola', 'Zaskia'
]
const lastNames = [
  'Santoso', 'Wijaya', 'Saputra', 'Hidayat', 'Pratama', 'Nugroho', 'Wibowo', 'Kusuma', 'Suryana', 'Fauzi', 
  'Ramadhan', 'Gunawan', 'Setiawan', 'Utama', 'Siregar', 'Lubis', 'Pasaribu', 'Nasution', 'Basri', 'Maulana',
  'Hakim', 'Waskito', 'Purnomo', 'Kurnia', 'Susanto', 'Mulyadi', 'Firmansyah', 'Anggara', 'Saputro', 'Wahyudi',
  'Irawan', 'Kusnadi', 'Suharto', 'Handayani', 'Wulandari', 'Rahmawati', 'Puspitasari', 'Novitasari', 'Yuliana', 'Hartono'
]

const generateName = (gender: 'MALE' | 'FEMALE') => {
  const first = gender === 'MALE' ? randomItem(firstNameMale) : randomItem(firstNameFemale)
  const last = randomItem(lastNames)
  return `${first} ${last}`
}

async function main() {
  console.log('🌱 Starting comprehensive SD seeding...')

  // Cleanup existing data
  await prisma.$transaction([
    prisma.learningObjective.deleteMany(),
    prisma.capaianPembelajaran.deleteMany(),
    prisma.grade.deleteMany(),
    prisma.attendance.deleteMany(),
    prisma.p5Target.deleteMany(),
    prisma.p5Member.deleteMany(),
    prisma.p5Project.deleteMany(),
    prisma.extraMember.deleteMany(),
    prisma.homeroomNote.deleteMany(), // Added missing relation cleanup
    prisma.extracurricular.deleteMany(),
    prisma.student.deleteMany(),
    prisma.schedule.deleteMany(),
    prisma.class.deleteMany(),
    prisma.subject.deleteMany(),
    prisma.teacher.deleteMany(),
    prisma.staff.deleteMany(),
    prisma.user.deleteMany(),
    prisma.school.deleteMany(),
  ])
  console.log('🧹 Cleaned up existing data')

  // 1. Create School (SD)
  // ... (keep existing school code) ...
  const school = await prisma.school.create({
    data: {
      name: 'SD Negeri 1 Harapan Bangsa',
      address: 'Jl. Merdeka No. 45',
      npsn: '20202020',
      level: 'SD',
      accreditation: 'A',
      activeSemester: 'GANJIL',
      activeSchoolYear: '2024/2025',
      isActive: true,
      email: 'info@sdn1harapan.sch.id',
      phone: '021-5556789',
      principalName: 'Dr. Asep Supriyadi, M.Pd',
      principalNip: '197501012000031001'
    }
  })
  console.log('🏫 School created:', school.name)

  // 2. Create Admin
  const adminPwd = await bcrypt.hash('admin123', 10)
  await prisma.user.create({
    data: {
      email: 'admin@sdn1.sch.id',
      name: 'Admin Sekolah',
      password: adminPwd,
      role: 'ADMIN',
      isActive: true
    }
  })

  // 2b. Create Homeroom Teachers (Wali Kelas) - 12 for each class
  const homeroomPwd = await bcrypt.hash('walikelas123', 10)
  const homeroomTeachers: any[] = []
  
  for (let i = 1; i <= 12; i++) {
    const gender = Math.random() > 0.5 ? 'MALE' : 'FEMALE'
    const name = generateName(gender) // Clean name without prefix
    const email = `walikelas${i}@sdn1.sch.id`
    
    let user = await prisma.user.create({
      data: {
        email,
        name,
        password: homeroomPwd,
        role: 'HOMEROOM',
        teacherProfile: {
          create: {
            name,
            nip: `19${randomInt(70, 99)}${randomInt(10, 12)}${randomInt(10, 30)}200${randomInt(1, 9)}`,
            gender: gender as Gender,
            birthDate: randomDate(new Date('1970-01-01'), new Date('1995-12-31')),
            birthPlace: 'Jakarta',
            address: 'Jl. Wali Kelas No. ' + i,
            hireDate: new Date('2015-01-01'),
            status: 'ACTIVE',
            schoolId: school.id,
            position: 'Wali Kelas'
          }
        }
      },
      include: { teacherProfile: true }
    })
    
    if (user && user.teacherProfile) {
      homeroomTeachers.push(user.teacherProfile)
    }
  }
  console.log(`👨‍🏫 Created ${homeroomTeachers.length} homeroom teachers (wali kelas)`)

  // 3. Create Teachers (Guru Mata pelajaran)
  const teachers: any[] = []
  const teacherPwd = await bcrypt.hash('guru123', 10)
  
  for (let i = 1; i <= 15; i++) {
    const gender = Math.random() > 0.5 ? 'MALE' : 'FEMALE'
    const name = generateName(gender)
    const email = `guru${i}@sdn1.sch.id`
    
    // Check if user exists first
    let user = await prisma.user.create({
            data: {
              email,
              name,
              password: teacherPwd,
              role: 'TEACHER', 
              teacherProfile: {
                create: {
                  name,
                  nip: `19${randomInt(70, 99)}${randomInt(10, 12)}${randomInt(10, 30)}200${randomInt(1, 9)}`,
                  gender: gender as Gender,
                  birthDate: randomDate(new Date('1970-01-01'), new Date('1995-12-31')),
                  birthPlace: 'Jakarta',
                  address: 'Jl. Guru No. ' + i,
                  hireDate: new Date('2015-01-01'),
                  status: 'ACTIVE',
                  schoolId: school.id,
                  position: 'Guru Mata Pelajaran'
                }
              }
            },
            include: { teacherProfile: true }
        })
    
    if (user && user.teacherProfile) {
        teachers.push(user.teacherProfile)
    }
  }
  console.log(`👨‍🏫 Created ${teachers.length} teachers (guru mata pelajaran)`)

  // 4. Create Classes (1A, 1B, ... 6A, 6B) - Total 12 classes
  const classes: any[] = []
  const grades = ['1', '2', '3', '4', '5', '6']
  const parallels = ['A', 'B']
  
  let homeroomIndex = 0
  for (const grade of grades) {
    for (const parallel of parallels) {
      const className = `Kelas ${grade}${parallel}`
      // Assign homeroom teacher (Wali Kelas) from homeroomTeachers array
      const homeroom = homeroomTeachers[homeroomIndex % homeroomTeachers.length]
      homeroomIndex++
      
      const cls = await prisma.class.create({
        data: {
          name: className,
          level: 'SD',
          grade: grade,
          schoolYear: '2024/2025',
          schoolId: school.id,
          homeroomId: homeroom?.id,
          capacity: 36
        }
      })
      classes.push(cls)
    }
  }
  console.log(`🏫 Created ${classes.length} classes with homeroom teachers`)

  // 5. Create Students (Randomly assigned to classes)
  const students: any[] = []
  let nisCounter = 1000 // Global NIS counter to ensure uniqueness
  
  for (const cls of classes) {
     const studentCount = randomInt(30, 35) // 30-35 students per class (Requested)
     for (let j = 0; j < studentCount; j++) {
        const gender = Math.random() > 0.5 ? 'MALE' : 'FEMALE'
        const name = generateName(gender)
        
        // Use sequential NIS to guarantee uniqueness
        const nis = `${nisCounter}`.padStart(6, '0')
        nisCounter++
        
        // Birth year depends on grade
        const gradeNum = parseInt(cls.grade)
        const birthYear = 2024 - (6 + gradeNum) // Approx calculation
        
        const student = await prisma.student.create({
            data: {
                nis,
                nisn: `00${randomInt(10000000, 99999999)}`,
                name,
                gender: gender as Gender,
                birthDate: randomDate(new Date(`${birthYear}-01-01`), new Date(`${birthYear}-12-31`)),
                birthPlace: 'Jakarta',
                address: 'Jl. Siswa No. ' + randomInt(1, 999),
                schoolId: school.id,
                classId: cls.id,
                status: 'ACTIVE',
                // Parent data
                fatherName: generateName('MALE'),
                motherName: generateName('FEMALE'),
                parentPhone: '08' + randomInt(1000000000, 9999999999)
            }
        })
        students.push(student)
     }
  }
  console.log(`👨‍🎓 Created ${students.length} students`)

  // 6. Extracurriculars
  const extraData = [
    { name: 'Pramuka Siaga', schedule: 'Jumat, 15:00', location: 'Halaman', desc: 'Wajib untuk kelas 1-3' },
    { name: 'Pramuka Penggalang', schedule: 'Jumat, 16:00', location: 'Halaman', desc: 'Wajib untuk kelas 4-6' },
    { name: 'Tari Tradisional', schedule: 'Senin, 14:00', location: 'Aula', desc: 'Seni tari daerah' },
    { name: 'Drumband', schedule: 'Sabtu, 08:00', location: 'Lapangan', desc: 'Musik perkusi' },
    { name: 'Pencak Silat', schedule: 'Rabu, 15:30', location: 'Aula', desc: 'Bela diri' },
    { name: 'Dokter Kecil', schedule: 'Selasa, 13:00', location: 'UKS', desc: 'Kesehatan' },
    { name: 'Tahfidz', schedule: 'Kamis, 15:00', location: 'Masjid', desc: 'Hafalan Quran' }
  ]

  const createdExtras: any[] = []
  for (const extra of extraData) {
      const coach = randomItem(teachers)
      const newExtra = await prisma.extracurricular.create({
          data: {
              name: extra.name,
              description: extra.desc,
              schedule: extra.schedule,
              location: extra.location,
              schoolId: school.id,
              coachId: coach.userId // Use userId, not teacher profile id
          }
      })
      createdExtras.push(newExtra)

      // Add random members
      const numMembers = randomInt(10, 30)
      const randomStudents = students.sort(() => 0.5 - Math.random()).slice(0, numMembers)
      
      for (const s of randomStudents) {
          await prisma.extraMember.create({
              data: {
                  extracurricularId: newExtra.id,
                  studentId: s.id
              }
          }).catch(() => {}) // Ignore duplicates
      }
  }
  console.log(`⚽ Created ${createdExtras.length} extracurriculars with members`)

  // 6b. Subjects (Kurikulum Merdeka)
  const subjectsData = [
    { code: 'PABP', name: 'Pendidikan Agama dan Budi Pekerti', desc: 'Membentuk karakter religius dan akhlak mulia', category: 'WAJIB' },
    { code: 'PP', name: 'Pendidikan Pancasila', desc: 'Membentuk profil pelajar Pancasila', category: 'WAJIB' },
    { code: 'BIN', name: 'Bahasa Indonesia', desc: 'Kemampuan literasi dan berkomunikasi', category: 'WAJIB' },
    { code: 'MAT', name: 'Matematika', desc: 'Kemampuan numerasi dan berpikir logis', category: 'WAJIB' },
    { code: 'IPAS', name: 'Ilmu Pengetahuan Alam dan Sosial', desc: 'Memahami alam dan sosial (Fase B & C)', category: 'WAJIB' },
    { code: 'PJOK', name: 'Pendidikan Jasmani, Olahraga, dan Kesehatan', desc: 'Kebugaran dan kesehatan', category: 'WAJIB' },
    { code: 'SRUPA', name: 'Seni Rupa', desc: 'Seni Rupa (Pilihan Seni)', category: 'SENI' },
    { code: 'SMUSIK', name: 'Seni Musik', desc: 'Seni Musik (Pilihan Seni)', category: 'SENI' },
    { code: 'STARI', name: 'Seni Tari', desc: 'Seni Tari (Pilihan Seni)', category: 'SENI' },
    { code: 'STEATER', name: 'Seni Teater', desc: 'Seni Teater (Pilihan Seni)', category: 'SENI' },
    { code: 'BIG', name: 'Bahasa Inggris', desc: 'Bahasa Asing Pilihan', category: 'PILIHAN' },
    { code: 'MULOK1', name: 'Muatan Lokal: Bahasa Daerah', desc: 'Bahasa Daerah setempat', category: 'MULOK' },
    { code: 'MULOK2', name: 'Muatan Lokal: PLBJ', desc: 'Pendidikan Lingkungan dan Budaya Jakarta', category: 'MULOK' }
  ]

  const createdSubjects: any[] = []
  for (const subj of subjectsData) {
      const teacher = randomItem(teachers) // Assign a random teacher as subject lead
      const subject = await prisma.subject.upsert({
          where: { code: subj.code },
          update: {},
          create: {
              code: subj.code,
              name: subj.name,
              description: subj.desc,
              credits: 1,
              curriculum: 'Kurikulum Merdeka',
              schoolId: school.id,
              teachers: { connect: { id: teacher.id } } // Many-to-many relationship
          }
      })
      createdSubjects.push(subject)
  }
  console.log(`📚 Created ${createdSubjects.length} subjects (Kurikulum Merdeka)`)

  // 6c. Schedules (Jadwal Pelajaran)
  console.log('📅 Generating Class Schedules...')
  const days: Day[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
  const timeSlots = ['07:00-08:00', '08:00-09:00', '09:30-10:30', '10:30-11:30', '12:30-13:30']

  for (const cls of classes) {
    const gradeNum = parseInt(cls.grade)
    
    // Filter subjects suitable for the grade
    // IPAS start from Grade 3
    const classSubjects = createdSubjects.filter(s => {
      if (s.code === 'IPAS' && gradeNum < 3) return false
      return true
    })

    // Create ~15 schedule slots per class
    for (let day of days) {
        // 3 slots per day
        for (let i=0; i<3; i++) {
            const subject = randomItem(classSubjects)
            const teacher = randomItem(teachers)

            await prisma.schedule.create({
                data: {
                    classId: cls.id,
                    subjectId: subject.id,
                    teacherId: teacher.id,
                    day: day,
                    startTime: timeSlots[i].split('-')[0],
                    endTime: timeSlots[i].split('-')[1],
                    semester: 'GANJIL',
                    schoolYear: '2024/2025'
                }
            })
        }
    }
  }
  console.log('📅 Schedules created for all classes')

  // 6d. Grades (Nilai) - Optimized with batch insert
  console.log('📝 Generating Random Grades...')
  const gradeTypes: GradeType[] = ['FORMATIVE', 'SUMMATIVE']
  const gradesToCreate: any[] = []
  
  for (const cls of classes) {
      // Find students in this class
      const classStudents = students.filter(s => s.classId === cls.id)
      const gradeNum = parseInt(cls.grade)
      
       // Filter subjects again for grade logic
      const classSubjects = createdSubjects.filter(s => {
        if (s.code === 'IPAS' && gradeNum < 3) return false
        return true
      })

      for (const student of classStudents) {
          // Generate grades for 3 random subjects (reduced for speed)
          const selectedSubjects = classSubjects.sort(() => 0.5 - Math.random()).slice(0, 3)
          
          for (const subj of selectedSubjects) {
              for (const type of gradeTypes) {
                  // 50% chance to have a grade
                  if (Math.random() > 0.5) {
                      gradesToCreate.push({
                          studentId: student.id,
                          subjectId: subj.id,
                          type: type,
                          score: randomInt(75, 98),
                          maxScore: 100,
                          semester: 'GANJIL',
                          schoolYear: '2024/2025',
                          notes: `Nilai ${type} ${subj.name}`
                      })
                  }
              }
          }
      }
  }
  
  // Batch insert all grades at once (MUCH faster)
  if (gradesToCreate.length > 0) {
      await prisma.grade.createMany({
          data: gradesToCreate,
          skipDuplicates: true
      })
  }
  console.log(`📝 Grades generated (${gradesToCreate.length} records)`)

  // 7. P5 Projects and Targets (Fase A, B, C)
  // Fase A (Kelas 1-2), Fase B (Kelas 3-4), Fase C (Kelas 5-6)
  const p5Data = [
    { 
      phase: 'A', 
      projects: [
        { title: 'Gaya Hidup Berkelanjutan', desc: 'Cerdik Mengelola Plastik' },
        { title: 'Kearifan Lokal', desc: 'Permainan Tradisional' }
      ] 
    },
    { 
      phase: 'B', 
      projects: [
        { title: 'Bhennika Tunggal Ika', desc: 'Berbeda tapi Tetap Asik' },
        { title: 'Bangunlah Jiwa Raganya', desc: 'Sehat Jiwa Raga' }
      ] 
    },
    {
       phase: 'C',
       projects: [
         { title: 'Kewirausahaan', desc: 'Market Day Cilik' },
         { title: 'Rekayasa Teknologi', desc: 'Membuat Filter Air Sederhana' }
       ]
    }
  ]
  enum P5Phase {
      A = 'A',
      B = 'B',
      C = 'C',
      D = 'D',
      E = 'E',
      F = 'F'
  }

  const p5TargetsSeed = [
      { dim: 'Beriman', el: 'Akhlak Beragama', sub: 'Mengenal sifat tuhan', target: 'Menyebutkan sifat-sifat Tuhan' },
      { dim: 'Mandiri', el: 'Pemahaman Diri', sub: 'Mengenali emosi', target: 'Mampu mengekspresikan emosi dengan wajar' },
      { dim: 'Kreatif', el: 'Menghasilkan Karya', sub: 'Karya Orisinal', target: 'Membuat karya sederhana dari bahan bekas' },
      { dim: 'Gotong Royong', el: 'Kolaborasi', sub: 'Kerjasama', target: 'Mampu bekerjasama dalam kelompok kecil' }
  ]

  for (const p of p5Data) {
      for (const proj of p.projects) {
          const coordinator = randomItem(teachers)
          const project = await prisma.p5Project.create({
              data: {
                  title: proj.title,
                  description: proj.desc,
                  phase: p.phase as P5Phase,
                  schoolId: school.id,
                  schoolYear: '2024/2025',
                  coordinatorId: coordinator.userId
              }
          })
          
          // Add targets
          for (const t of p5TargetsSeed) {
              await prisma.p5Target.create({
                  data: {
                      projectId: project.id,
                      dimension: t.dim,
                      element: t.el,
                      subElement: t.sub,
                      target: `${t.target} (Fase ${p.phase})`
                  }
              })
          }

          // Add random members from relevant grades
          let targetGrades: string[] = []
          if (p.phase === 'A') targetGrades = ['1', '2']
          if (p.phase === 'B') targetGrades = ['3', '4']
          if (p.phase === 'C') targetGrades = ['5', '6']

          // Find classes in these grades
          const targetClasses = classes.filter(c => targetGrades.includes(c.grade)).map(c => c.id)
          
          // Find students in these classes
          // Actually we have student objects with classId, finding directly from 'students' array
          const candidateStudents = students.filter(s => targetClasses.includes(s.classId || ''))
          const selectedStudents = candidateStudents.sort(() => 0.5 - Math.random()).slice(0, 40) // Pick 40 students

          for (const s of selectedStudents) {
              await prisma.p5Member.create({
                  data: {
                      projectId: project.id,
                      studentId: s.id
                  }
              }).catch(() => {})
          }
      }
  }
  console.log('🇮🇩 Created P5 Projects, Targets, and Members')

  // 11. Create CP & TP (Kurikulum Merdeka 2024 Reference)
  console.log('📚 Seeding Kurikulum Merdeka CP & TP...')
  
  const cpData = [
    // PENDIDIKAN AGAMA DAN BUDI PEKERTI (PABP)
    {
      subjectCode: 'PABP', phase: 'A', element: 'Al-Qur’an dan Hadis',
      description: 'Peserta didik mampu mengenal huruf hijaiyah dan harakatnya, huruf hijaiyah bersambung, dan mampu membaca surah-surah pendek Al-Qur’an dengan baik.'
    },
    {
      subjectCode: 'PABP', phase: 'A', element: 'Aqidah',
      description: 'Peserta didik mengenal rukun iman kepada Allah melalui nama-nama-Nya yang agung (Asmaulhusna) dan mengenal para malaikat serta tugas yang diembannya.'
    },
    {
      subjectCode: 'PABP', phase: 'B', element: 'Fiqih',
      description: 'Peserta didik mampu melaksanakan puasa, salat jumat dan salat sunah dengan baik, memahami ketentuan baligh dan tanggung jawab yang menyertainya.'
    },
    {
      subjectCode: 'PABP', phase: 'C', element: 'Akhlak',
      description: 'Peserta didik menghormati dan berbakti kepada orang tua dan guru, serta menyampaikan ungkapan-ungkapan positif (kalimah ṭayyibah) dalam keseharian.'
    },

    // BAHASA INDONESIA
    {
      subjectCode: 'BIN', phase: 'A', element: 'Menyimak',
      description: 'Peserta didik mampu bersikap menjadi pendengar yang penuh perhatian. Peserta didik menunjukkan minat pada tuturan yang didengar serta mampu memahami pesan lisan.'
    },
    {
      subjectCode: 'BIN', phase: 'A', element: 'Membaca dan Memirsa',
      description: 'Peserta didik mampu bersikap menjadi pembaca dan pemirsa yang menunjukkan minat terhadap teks yang dibaca atau dipirsa. Peserta didik mampu membaca kata-kata yang dikenal sehari-hari.'
    },
    {
      subjectCode: 'BIN', phase: 'B', element: 'Menulis',
      description: 'Peserta didik mampu menulis teks narasi, teks deskripsi, teks rekon, teks prosedur, dan teks eksposisi dengan rangkaian kalimat yang beragam dan informasi yang rinci.'
    },
    {
      subjectCode: 'BIN', phase: 'C', element: 'Berbicara dan Mempresentasikan',
      description: 'Peserta didik mampu menyampaikan gagasan, pikiran, pandangan, arahan atau pesan untuk tujuan pengajuan usul, pemecahan masalah, dan pemberian solusi secara lisan.'
    },
    
    // MATEMATIKA
    {
      subjectCode: 'MAT', phase: 'A', element: 'Bilangan',
      description: 'Peserta didik menunjukkan pemahaman dan memiliki intuisi bilangan (number sense) pada bilangan cacah sampai 100, mereka dapat membaca, menulis, menentukan nilai tempat.'
    },
    {
      subjectCode: 'MAT', phase: 'B', element: 'Pengukuran',
      description: 'Peserta didik dapat mengukur panjang dan berat benda menggunakan satuan baku. Mereka dapat menentukan hubungan antar-satuan baku panjang (cm, m).'
    },
    {
      subjectCode: 'MAT', phase: 'C', element: 'Data dan Peluang',
      description: 'Peserta didik dapat mengurutkan, membandingkan, menyajikan, dan menganalisis data banyak benda dan data hasil pengukuran dalam bentuk gambar, piktogram, diagram batang, dan diagram garis.'
    },

    // PJOK
    {
      subjectCode: 'PJOK', phase: 'A', element: 'Keterampilan Gerak',
      description: 'Peserta didik mampu menirukan aktivitas pola gerak dasar, aktivitas senam, aktivitas gerak berirama, dan aktivitas permainan dan olahraga air (kondisional).'
    },
    {
      subjectCode: 'PJOK', phase: 'B', element: 'Pemanfaatan Gerak',
      description: 'Peserta didik mampu menerapkan prosedur latihan pengembangan kebugaran jasmani sederhana dan pola perilaku hidup sehat.'
    },
    {
      subjectCode: 'PJOK', phase: 'C', element: 'Pengembangan Karakter',
      description: 'Peserta didik secara konsisten menerapkan nilai-nilai sportivitas, kerjasama, dan tanggung jawab dalam berbagai aktivitas jasmani.'
    },

    // IPAS
    {
      subjectCode: 'IPAS', phase: 'B', element: 'Pemahaman IPAS',
      description: 'Peserta didik menganalisis hubungan antara bentuk serta fungsi bagian tubuh pada manusia (pancaindra). Peserta didik dapat membuat simulasi siklus hidup makhluk hidup.'
    },
    {
      subjectCode: 'IPAS', phase: 'C', element: 'Pemahaman IPAS',
      description: 'Peserta didik melakukan simulasi dengan menggunakan gambar/bagan/alat/media sederhana tentang sistem organ tubuh manusia (sistem pernafasan/pencernaan/peredaran darah).'
    },

    // PANCASILA
    {
      subjectCode: 'PP', phase: 'A', element: 'Pancasila',
      description: 'Peserta didik mampu mengenal dan menceritakan simbol dan sila-sila Pancasila dalam lambang negara Garuda Pancasila.'
    },
    {
      subjectCode: 'PP', phase: 'B', element: 'Undang-Undang Dasar Negara Republik Indonesia Tahun 1945',
      description: 'Peserta didik mampu mengidentifikasi aturan di keluarga, sekolah, dan lingkungan sekitar tempat tinggal.'
    }
  ]

  for (const cp of cpData) {
     const subject = await prisma.subject.findFirst({ where: { code: cp.subjectCode } })
     if (subject) {
        const createdCP = await prisma.capaianPembelajaran.create({
            data: {
                subjectId: subject.id,
                element: cp.element,
                phase: cp.phase,
                description: cp.description,
            }
        })

        // Auto-generate some TPs based on CP for relevant grades
        let targetGrades: string[] = []
        if (cp.phase === 'A') targetGrades = ['1', '2']
        if (cp.phase === 'B') targetGrades = ['3', '4']
        if (cp.phase === 'C') targetGrades = ['5', '6']

        for (const grade of targetGrades) {
            // Find a teacher for this subject (random pick) needs to be available
            const teacher = teachers[0] // Just pick first teacher as owner for now
            
            await prisma.learningObjective.create({
                data: {
                    subjectId: subject.id,
                    teacherId: teacher.id, // In real app, this should be specific teacher
                    cpId: createdCP.id,
                    code: `TP.${cp.subjectCode}.${grade}.${randomInt(1,5)}`,
                    grade: grade,
                    semester: '1',
                    schoolYear: '2024/2025',
                    description: `Peserta didik mampu ${cp.description.split('mampu')[1]?.split('.')[0] || 'memahami materi tersebut'}.`,
                }
            })
             await prisma.learningObjective.create({
                data: {
                    subjectId: subject.id,
                    teacherId: teacher.id,
                    cpId: createdCP.id,
                    code: `TP.${cp.subjectCode}.${grade}.${randomInt(6,9)}`,
                    grade: grade,
                    semester: '2',
                    schoolYear: '2024/2025',
                    description: `Peserta didik dapat mempraktikkan ${cp.element} dalam konteks kehidupan sehari-hari.`,
                }
            })
        }
     }
  }

  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })