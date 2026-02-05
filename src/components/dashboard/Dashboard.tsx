'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  GraduationCap, 
  UserCheck,
  Building,
  Clock,
  Bell,
  TrendingUp,
  Download,
  Upload,
  FileText,
  AlertTriangle,
  Award,
  MapPin,
  Phone,
  Mail,
  Loader2,
  User,
  BookOpen,
  Target
} from 'lucide-react'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  AreaChart, 
  Area,
  CartesianGrid
} from 'recharts'

interface DashboardProps {
  activeMenu: string
  onMenuChange: (menu: string) => void
  user: {
    name: string
    role: 'ADMIN' | 'HOMEROOM' | 'TEACHER' | 'P5_COORDINATOR' | 'EXTRA_COACH'
    email: string
  }
}

const attendanceData = [
  { name: 'Sen', value: 92 },
  { name: 'Sel', value: 88 },
  { name: 'Rab', value: 95 },
  { name: 'Kam', value: 91 },
  { name: 'Jum', value: 94 },
  { name: 'Sab', value: 85 },
]

const studentTrends = [
  { year: '2020', students: 850 },
  { year: '2021', students: 1100 },
  { year: '2022', students: 1400 },
  { year: '2023', students: 1800 },
  { year: '2024', students: 2100 },
]

export default function Dashboard({ activeMenu, onMenuChange, user }: DashboardProps) {
  const [statistics, setStatistics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/dashboard')
      const data = await response.json()
      if (response.ok) setStatistics(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTask = () => {
    alert('Fitur tambah tugas cepat segera hadir! Sedang mengintegrasikan kalender akademik...')
  }

  const handleExport = () => {
    alert('Mengekspor laporan sistem... Unduhan Anda akan segera dimulai.')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-brand-purple" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
      {/* Kolom Kiri - Statistik Utama */}
      <div className="xl:col-span-3 space-y-8">
        {/* Fitur Akses Cepat (Mobile Only - Hidden on Desktop) */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:hidden gap-4">
          {[
            ...(user.role === 'ADMIN' ? [
              { id: 'school', icon: Building, label: 'Sekolah', color: 'bg-blue-50 text-blue-600' },
              { id: 'teachers', icon: GraduationCap, label: 'Guru', color: 'bg-indigo-50 text-indigo-600' },
              { id: 'users', icon: User, label: 'Admin', color: 'bg-purple-50 text-purple-600' },
            ] : []),
            ...(user.role === 'HOMEROOM' ? [
              { id: 'attendance', icon: UserCheck, label: 'Presensi', color: 'bg-emerald-50 text-emerald-600' },
              { id: 'homeroom-notes', icon: FileText, label: 'Catatan', color: 'bg-orange-50 text-orange-600' },
            ] : []),
            { id: 'academic', icon: BookOpen, label: 'Mapel', color: 'bg-sky-50 text-sky-600' },
            { id: 'extracurricular', icon: MapPin, label: 'Ekskul', color: 'bg-rose-50 text-rose-600' },
            { id: 'p5', icon: Target, label: 'P5', color: 'bg-amber-50 text-amber-600' },
            { id: 'reports', icon: FileText, label: 'Rapor', color: 'bg-teal-50 text-teal-600' },
            { id: 'profile', icon: User, label: 'Profil', color: 'bg-gray-50 text-gray-600' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onMenuChange(item.id)}
              className="flex flex-col items-center p-4 rounded-3xl bg-white shadow-sm hover:shadow-md transition-all group border border-white/50"
            >
              <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl ${item.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                <item.icon className="w-6 h-6 md:w-7 md:h-7" />
              </div>
              <span className="text-[10px] md:text-xs font-black text-gray-600 text-center line-clamp-1">{item.label}</span>
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Kartu 1: Siswa Aktif */}
          <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden hover:scale-[1.02] transition-transform duration-300">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-gray-500 font-bold text-sm">Siswa Aktif</CardTitle>
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-none rounded-lg">+12%</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                   <div className="text-4xl font-extrabold text-brand-deep mb-1">
                     {statistics?.overview?.totalStudents?.toLocaleString() || '0'}
                   </div>
                   <p className="text-gray-400 text-xs flex items-center">
                     <Clock className="w-3 h-3 mr-1" />
                     Per {new Date().toLocaleDateString('id-ID')}
                   </p>
                </div>
                <div className="h-20 w-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statistics?.weeklyAttendance || attendanceData}>
                      <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Kartu 2: Pertumbuhan Sekolah */}
          <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden hover:scale-[1.02] transition-transform duration-300">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-gray-500 font-bold text-sm">Pertumbuhan Sekolah</CardTitle>
                <Badge variant="secondary" className="bg-brand-purple/10 text-brand-purple border-none rounded-lg">+34%</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                   <div className="text-4xl font-extrabold text-brand-deep mb-1">
                     {statistics?.overview?.totalTeachers?.toLocaleString() || '0'}
                   </div>
                   <p className="text-gray-400 text-xs flex items-center">
                     <GraduationCap className="w-3 h-3 mr-1" />
                     Tenaga Pendidik Profesional
                   </p>
                </div>
                <div className="h-20 w-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={statistics?.growth || studentTrends}>
                      <defs>
                        <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="students" stroke="#ec4899" fillOpacity={1} fill="url(#colorStudents)" />
                    </AreaChart>
                   </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Grafik Besar: Tren Kehadiran */}
        <Card className="rounded-[2.5rem] border-none shadow-xl">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-brand-deep">Analisis Kehadiran</CardTitle>
                <CardDescription>Pemantauan kehadiran real-time dari DBMS</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="rounded-xl border-gray-100" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Laporan
                </Button>
                <Select defaultValue="weekly">
                  <SelectTrigger className="w-32 rounded-xl bg-gray-50 border-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Mingguan</SelectItem>
                    <SelectItem value="monthly">Bulanan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={statistics?.weeklyAttendance || []}>
                  <defs>
                    <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={4} fill="url(#colorTrend)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Seksi Tugas */}
        <Card className="rounded-3xl md:rounded-[3rem] border-none shadow-xl p-6 md:p-8 bg-white">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
             <h3 className="font-bold text-lg md:text-xl text-brand-deep flex items-center">
               <FileText className="w-5 h-5 md:w-6 md:h-6 mr-3 text-brand-purple" />
               Daftar Tugas
             </h3>
             <Button variant="outline" className="w-full sm:w-auto rounded-xl md:rounded-2xl border-gray-100 py-4 md:py-2 h-auto" onClick={handleAddTask}>
               + Tambah Tugas Baru
             </Button>
          </div>
          <div className="space-y-4">
             {(statistics?.tasks || []).map((task: any, i: number) => (
               <div key={i} className="group p-4 rounded-2xl md:rounded-3xl border border-gray-50 bg-gray-50/50 hover:bg-white hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center space-x-3 md:space-x-4">
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center ${task.status === 'Selesai' ? 'bg-emerald-50 text-emerald-500' : 'bg-brand-purple/10 text-brand-purple'}`}>
                           {task.status === 'Selesai' ? <UserCheck className="w-5 h-5 md:w-6 md:h-6" /> : <Clock className="w-5 h-5 md:w-6 md:h-6" />}
                        </div>
                        <div>
                           <p className="font-bold text-sm md:text-base text-gray-900 line-clamp-1">{task.title}</p>
                           <p className="text-[10px] md:text-sm text-gray-500 line-clamp-1">{task.desc}</p>
                        </div>
                     </div>
                     <Badge className={`rounded-xl px-3 md:px-4 py-1 border-none text-[10px] md:text-xs ${
                       task.status === 'Selesai' ? 'bg-emerald-50 text-emerald-600' : 
                       task.status === 'Dalam Proses' ? 'bg-indigo-50 text-indigo-600' : 
                       'bg-orange-50 text-orange-600'
                     }`}>
                       {task.status}
                     </Badge>
                  </div>
               </div>
             ))}
          </div>
        </Card>
      </div>

      {/* Kolom Kanan - Peringkat & Info Samping */}
      <div className="space-y-8">
        <Card className="rounded-[2.5rem] border-none shadow-2xl p-6 bg-white sticky top-6">
           <h3 className="font-extrabold text-xl text-brand-deep mb-6">Siswa Berprestasi</h3>
           <div className="space-y-6">
              {(statistics?.leaderboard || []).map((s: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer group">
                   <div className="flex items-center">
                     <div className="w-10 h-10 rounded-2xl bg-brand-deep/5 font-bold text-xs flex items-center justify-center mr-4 group-hover:bg-brand-purple group-hover:text-white transition-colors">
                        {s.avatar}
                     </div>
                     <div>
                        <p className="font-bold text-sm text-gray-900">{s.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{s.status}</p>
                     </div>
                   </div>
                   <div className="text-right">
                      <p className="font-extrabold text-brand-purple text-sm">{s.score}</p>
                      <p className="text-[10px] text-gray-400">Nilai</p>
                   </div>
                </div>
              ))}
           </div>
           
           <Button 
             variant="ghost" 
             onClick={() => onMenuChange('students')}
             className="w-full mt-8 rounded-2xl text-brand-purple font-bold hover:bg-brand-purple/5 transition-all"
           >
              Lihat Semua Peringkat
           </Button>
        </Card>

        {/* Kartu Kapasitas Sekolah */}
        <Card className="rounded-[2.5rem] border-none shadow-xl p-8 dark-gradient text-white overflow-hidden relative">
           <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
              <Building className="w-32 h-32" />
           </div>
           <h4 className="font-bold text-gray-400 text-sm mb-4">Utilitas Kapasitas</h4>
           <div className="text-3xl font-extrabold mb-2">
             {statistics?.overview?.totalStudents ? Math.round((statistics.overview.totalStudents / (statistics.overview.totalClasses * 36)) * 100) : 0}%
           </div>
           <div className="w-full bg-white/10 rounded-full h-2 mb-4">
              <div 
                className="bg-brand-pink h-2 rounded-full transition-all duration-1000" 
                style={{ width: `${statistics?.overview?.totalStudents ? Math.round((statistics.overview.totalStudents / (statistics.overview.totalClasses * 36)) * 100) : 0}%` }}
              ></div>
           </div>
           <p className="text-xs text-gray-400 leading-relaxed">
             {statistics?.overview?.schoolName || 'Sekolah kami'} saat ini menampung {statistics?.overview?.totalStudents || 0} siswa di {statistics?.overview?.totalClasses || 0} kelas.
           </p>
        </Card>
      </div>
    </div>
  )
}