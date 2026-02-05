'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Menu,
  Home,
  Users,
  GraduationCap,
  BookOpen,
  UserCheck,
  FileText,
  Building,
  Settings,
  Bell,
  Search,
  LogOut,
  User,
  X,
  MapPin,
  Target,
  Layers,
  ChevronRight,
  Sparkles
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Badge } from '@/components/ui/badge'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  activeMenu: string
  onMenuChange: (menu: string) => void
  user: {
    name: string
    role: 'ADMIN' | 'HOMEROOM' | 'TEACHER' | 'P5_COORDINATOR' | 'EXTRA_COACH'
    email: string
  }
  isMobile?: boolean
  onClose?: () => void
}

interface LayoutProps {
  children: React.ReactNode
  activeMenu: string
  onMenuChange: (menu: string) => void
  user: {
    name: string
    role: 'ADMIN' | 'HOMEROOM' | 'TEACHER' | 'P5_COORDINATOR' | 'EXTRA_COACH'
    email: string
  }
}

const getMenuItems = (role: string) => {
  const baseMenus = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
  ]

  const adminMenus = [
    { id: 'school', icon: Building, label: 'Data Sekolah' },
    { id: 'students', icon: Users, label: 'Data Siswa' },
    { id: 'teachers', icon: GraduationCap, label: 'Data Guru' },
    { id: 'users', icon: User, label: 'Data Admin' },
    { id: 'academic', icon: BookOpen, label: 'Akademik' },
    { id: 'extracurricular', icon: MapPin, label: 'Ekstrakurikuler' },
    { id: 'p5', icon: GraduationCap, label: 'Target P5' },
    { id: 'reports', icon: FileText, label: 'Leger & Rapor' },
    { id: 'smart-features', icon: Sparkles, label: 'Smart Features' },
  ]

  const homeroomMenus = [
    { id: 'classes', icon: Building, label: 'Data Kelas' },
    { id: 'academic', icon: BookOpen, label: 'Mata Pelajaran' },
    { id: 'tp', icon: Target, label: 'Kompetensi (CP/TP)' },
    { id: 'formative-grades', icon: FileText, label: 'Penilaian Formatif' },
    { id: 'summative-grades', icon: Layers, label: 'Penilaian Sumatif' },
    { id: 'grades', icon: GraduationCap, label: 'Input Nilai (PTS/PAS)' },
    { id: 'attendance', icon: UserCheck, label: 'Ketidakhadiran' },
    { id: 'homeroom-notes', icon: FileText, label: 'Catatan Wali' },
    { id: 'reports', icon: FileText, label: 'Leger & Rapor' },
  ]

  const teacherMenus = [
    { id: 'tp', icon: Target, label: 'Kompetensi (CP/TP)' },
    { id: 'formative-grades', icon: FileText, label: 'Penilaian Formatif' },
    { id: 'summative-grades', icon: Layers, label: 'Penilaian Sumatif' },
    { id: 'grades', icon: GraduationCap, label: 'Input Nilai (PTS/PAS)' },
  ]

  const profileMenu = { id: 'profile', icon: User, label: 'Profil Akun' }

  let roleMenus: { id: string, icon: any, label: string }[] = []
  switch (role) {
    case 'ADMIN': roleMenus = adminMenus; break;
    case 'HOMEROOM': roleMenus = homeroomMenus; break;
    case 'TEACHER': roleMenus = teacherMenus; break;
    default: roleMenus = adminMenus;
  }

  return [...baseMenus, ...roleMenus, profileMenu]
}

const SidebarContent = ({ activeMenu, onMenuChange, user, isOpen, onToggle, isMobile, onClose }: SidebarProps) => {
  const menuItems = getMenuItems(user.role)

  const handleLogout = () => {
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  return (
    <div className="flex flex-col h-full bg-white md:bg-transparent">
      <div className="p-8 flex items-center justify-between">
        <div className={`flex items-center space-x-3 transition-opacity duration-300 ${(isOpen || isMobile) ? 'opacity-100' : 'opacity-0 invisible'}`}>
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand-deep/10 border border-gray-100 overflow-hidden">
            <img src="/logo-ar.png" alt="Smart School Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-2xl font-black tracking-tight text-brand-deep">Smart School</span>
        </div>
        {!isMobile && isOpen && (
          <button 
            onClick={onToggle}
            className="p-2 hover:bg-white/50 rounded-xl transition-all group"
          >
            <X className="w-6 h-6 text-gray-400 group-hover:text-brand-deep" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto overflow-x-hidden scrollbar-hide py-4">
        {!isMobile && !isOpen && (
          <button 
            onClick={onToggle}
            className="w-full flex items-center justify-center py-4 rounded-3xl transition-all duration-300 group hover:bg-white/50 mb-4"
          >
            <Menu className="w-6 h-6 text-gray-400 group-hover:text-brand-deep" />
          </button>
        )}
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              onMenuChange(item.id)
              if (onClose) onClose()
            }}
            className={`w-full flex items-center px-4 py-4 rounded-3xl transition-all duration-300 group relative
              ${activeMenu === item.id 
                ? 'bg-brand-deep text-white shadow-xl shadow-brand-deep/20' 
                : 'text-gray-500 hover:bg-white/50 hover:px-6'
              }`}
          >
            <item.icon className={`w-6 h-6 min-w-[24px] ${activeMenu === item.id ? 'text-white' : 'text-gray-400 group-hover:text-brand-deep'}`} />
            {(isOpen || isMobile) && <span className="ml-4 font-bold text-sm tracking-wide">{item.label}</span>}
            {activeMenu === item.id && !isOpen && !isMobile && (
              <div className="absolute left-0 w-1.5 h-8 bg-white rounded-r-full"></div>
            )}
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-white/20">
        <div className={`transition-all duration-300 ${(!isOpen && !isMobile) ? 'opacity-0 scale-90 invisible h-0' : 'opacity-100 scale-100'}`}>
          <div className="p-4 rounded-4xl bg-brand-deep/5 flex items-center space-x-3 mb-4 border border-brand-deep/10">
            <div className="w-10 h-10 rounded-full bg-brand-deep flex items-center justify-center text-white font-bold">
              {user.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
               <p className="text-xs font-bold text-brand-deep">{user.name}</p>
               <p className="text-[10px] text-gray-400 uppercase tracking-widest">{user.role}</p>
            </div>
          </div>
        </div>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="ghost" 
              className={`w-full rounded-2xl justify-start hover:bg-red-50 group hover:px-6 transition-all duration-300 ${(!isOpen && !isMobile) && 'justify-center px-2'}`}
            >
              <LogOut className="w-5 h-5 text-red-500" />
              {(isOpen || isMobile) && <span className="ml-4 text-red-500 font-bold text-sm">Logout</span>}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-3xl p-8">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-black text-brand-deep">Konfirmasi Keluar</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin keluar dari aplikasi? Sesi Anda akan berakhir.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl font-bold">Batal</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold"
              >
                Ya, Keluar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

const Header = ({ userName, user, onMenuChange }: { userName: string, user: any, onMenuChange: (menu: string) => void }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Laporan Siap', message: 'Leger semester ganjil sudah dapat diunduh.', time: '2 menit yang lalu', read: false },
    { id: 2, title: 'Update Sistem', message: 'Fitur baru Input Nilai Otomatis telah aktif.', time: '1 jam yang lalu', read: false },
    { id: 3, title: 'Jadwal Rapat', message: 'Rapat guru diadakan besok pukul 08:00 WIB.', time: '3 jam yang lalu', read: true },
  ])
  
  const today = new Date().toLocaleDateString('id-ID', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  })
  const time = new Date().toLocaleTimeString('id-ID', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })

  const menuItems = getMenuItems(user.role)
  const filteredItems = menuItems.filter(item => 
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5)

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="dark-gradient rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 mb-6 md:mb-8 text-white relative shadow-2xl z-20">
      <div className="absolute inset-0 overflow-hidden rounded-3xl md:rounded-[2.5rem] pointer-events-none">
        <div className="absolute top-[-50%] right-[-10%] w-[300px] h-[300px] bg-brand-purple/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[200px] h-[200px] bg-brand-pink/10 rounded-full blur-[80px]"></div>
      </div>

      <div className="relative z-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-white">Halo! {userName}</h2>
          <p className="text-gray-300 text-sm">Pantau dan berikan pengalaman terbaik bagi para siswa.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari menu..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setShowResults(true)
              }}
              onFocus={() => setShowResults(true)}
              className="bg-white/10 border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 bg-blur-md transition-all placeholder:text-gray-400 border shadow-inner"
            />
            
            {showResults && searchQuery && (
              <div className="absolute top-[calc(100%+12px)] left-0 w-full md:w-80 bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 z-100 border border-gray-100">
                <div className="p-3 bg-gray-50/50 border-b border-gray-50">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Hasil Pencarian Menu</p>
                </div>
                <div className="max-h-[300px] overflow-y-auto p-2">
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          onMenuChange(item.id)
                          setSearchQuery('')
                          setShowResults(false)
                        }}
                        className="w-full flex items-center space-x-3 p-3 rounded-2xl hover:bg-brand-deep/5 transition-all group text-left"
                      >
                        <div className="w-10 h-10 rounded-xl bg-brand-deep/5 flex items-center justify-center text-brand-deep group-hover:bg-brand-deep group-hover:text-white transition-all">
                          <item.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800 group-hover:text-brand-deep">{item.label}</p>
                          <p className="text-[10px] text-gray-400 font-medium">Navigasi ke halaman {item.label}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 ml-auto text-gray-300 group-hover:text-brand-deep group-hover:translate-x-1 transition-all" />
                      </button>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <Search className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                      <p className="text-sm font-bold text-gray-400">Menu tidak ditemukan</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            {showResults && searchQuery && (
              <button 
                onClick={() => {
                  setSearchQuery('')
                  setShowResults(false)
                }}
                className="fixed inset-0 z-[-1] cursor-default"
              />
            )}
          </div>
          
          <div className="flex items-center space-x-4 bg-black/20 px-4 py-2 rounded-2xl text-[10px] md:text-xs font-medium">
            <div className="flex items-center">
               <span className="hidden sm:inline">Hari Ini, </span>{today}
            </div>
            <div className="w-px h-4 bg-white/10"></div>
            <div className="flex items-center">
               <span>{time} WIB</span>
            </div>
          </div>

          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 bg-white/10 rounded-2xl hover:bg-white/20 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-brand-pink rounded-full border-2 border-brand-deep animate-pulse"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute top-[calc(100%+12px)] right-0 w-80 md:w-96 bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 z-100 border border-gray-100">
                <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-black text-brand-deep">Pemberitahuan</span>
                    {unreadCount > 0 && (
                      <span className="bg-brand-pink text-white rounded-full px-2 py-0.5 text-[10px] font-black">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={() => {
                      setNotifications(notifications.map(n => ({ ...n, read: true })))
                    }}
                    className="text-[10px] font-black text-brand-purple hover:text-brand-deep uppercase tracking-widest transition-colors"
                  >
                    Tandai Semua Dibaca
                  </button>
                </div>
                <div className="max-h-[400px] overflow-y-auto p-2">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={`p-4 rounded-2xl mb-1 transition-all relative group cursor-pointer ${n.read ? 'hover:bg-gray-50' : 'bg-indigo-50/30 hover:bg-indigo-50/50'}`}
                        onClick={() => {
                          setNotifications(notifications.map(notif => notif.id === n.id ? { ...notif, read: true } : notif))
                        }}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <h4 className={`text-sm font-bold ${n.read ? 'text-gray-700' : 'text-brand-deep'}`}>{n.title}</h4>
                          <span className="text-[9px] font-medium text-gray-400">{n.time}</span>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed font-medium">{n.message}</p>
                        {!n.read && (
                          <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-brand-purple rounded-full opacity-50"></div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center text-gray-400">
                       <Bell className="w-10 h-10 mx-auto mb-4 opacity-20" />
                       <p className="font-bold">Tidak ada pemberitahuan baru</p>
                    </div>
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="p-3 border-t border-gray-50 bg-gray-50/30">
                    <button 
                      onClick={() => setNotifications([])}
                      className="w-full text-center text-[10px] font-black text-gray-400 hover:text-red-500 uppercase tracking-widest transition-colors"
                    >
                      Bersihkan Semua
                    </button>
                  </div>
                )}
              </div>
            )}
            {showNotifications && (
              <button 
                onClick={() => setShowNotifications(false)}
                className="fixed inset-0 z-[-1] cursor-default"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Layout({ children, activeMenu, onMenuChange, user }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#f1f3f9] text-gray-900 font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <aside 
          className={`${sidebarOpen ? 'w-80' : 'w-24'} fixed left-4 top-4 bottom-4 glass rounded-[2.5rem] shadow-2xl transition-all duration-500 z-50 flex flex-col border border-white/20`}
        >
          <SidebarContent 
            isOpen={sidebarOpen} 
            onToggle={() => setSidebarOpen(!sidebarOpen)}
            activeMenu={activeMenu}
            onMenuChange={onMenuChange}
            user={user}
          />
        </aside>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-5 sticky top-0 bg-[#f1f3f9]/80 backdrop-blur-md z-40 border-b border-white/20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-brand-deep/10 border border-gray-100 overflow-hidden">
            <img src="/logo-ar.png" alt="Smart School Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-brand-deep leading-tight">Smart School</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{user.role}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="relative p-2 bg-white rounded-xl shadow-sm border border-gray-100">
             <Bell className="w-5 h-5 text-gray-500" />
             <span className="absolute top-2 right-2 w-2 h-2 bg-brand-pink rounded-full border-2 border-white"></span>
          </button>
          <div className="w-10 h-10 rounded-full bg-brand-deep border-2 border-white shadow-sm flex items-center justify-center text-white font-bold text-xs" onClick={() => onMenuChange('profile')}>
             {user.name.substring(0, 2).toUpperCase()}
          </div>
        </div>
      </div>
      
      <main className={`transition-all duration-300 min-h-screen px-4 md:px-6 py-4 md:py-6 ${sidebarOpen ? 'md:pl-[340px]' : 'md:pl-[120px]'} pb-32 md:pb-6`}>
        <div className="max-w-[1400px] mx-auto">
          <div className="hidden md:block">
            <Header userName={user.name} user={user} onMenuChange={onMenuChange} />
          </div>
          <div className="min-h-[600px]">
            {children}
          </div>
        </div>
      </main>

      {/* Bottom Navigation for Mobile */}
      <div className="md:hidden fixed bottom-6 left-6 right-6 z-50">
        <nav className="bg-white/95 backdrop-blur-2xl border border-white/50 rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] px-2 py-2 flex items-center justify-between relative">
          <div className="absolute inset-0 bg-linear-to-tr from-brand-deep/5 via-transparent to-brand-purple/5 rounded-[2.5rem] pointer-events-none"></div>
          
          <button 
            onClick={() => onMenuChange('dashboard')}
            className={`flex-1 flex flex-col items-center justify-center py-2 rounded-3xl transition-all duration-300 relative z-10 group ${
              activeMenu === 'dashboard' 
                ? 'bg-brand-deep text-white shadow-lg shadow-brand-deep/20 scale-105' 
                : 'text-gray-400 hover:text-brand-deep'
            }`}
          >
            <Home className={`w-[18px] h-[18px] transition-transform duration-300 ${activeMenu === 'dashboard' ? 'text-white scale-110' : 'group-active:scale-90'}`} />
            <span className={`text-[9px] font-bold mt-1 transition-all duration-300 ${activeMenu === 'dashboard' ? 'opacity-100' : 'opacity-70 group-hover:opacity-100 uppercase tracking-tighter'}`}>
              Beranda
            </span>
          </button>

          <button 
            onClick={() => onMenuChange(user.role === 'ADMIN' ? 'students' : (user.role === 'HOMEROOM' ? 'classes' : 'tp'))}
            className={`flex-1 flex flex-col items-center justify-center py-2 rounded-3xl transition-all duration-300 relative z-10 group ${
              ['students', 'classes', 'tp'].includes(activeMenu) 
                ? 'bg-brand-deep text-white shadow-lg shadow-brand-deep/20 scale-105' 
                : 'text-gray-400 hover:text-brand-deep'
            }`}
          >
            {user.role === 'ADMIN' ? (
              <Users className={`w-[18px] h-[18px] transition-transform duration-300 ${activeMenu === 'students' ? 'text-white scale-110' : 'group-active:scale-90'}`} />
            ) : (user.role === 'HOMEROOM' ? (
              <Building className={`w-[18px] h-[18px] transition-transform duration-300 ${activeMenu === 'classes' ? 'text-white scale-110' : 'group-active:scale-90'}`} />
            ) : (
              <Target className={`w-[18px] h-[18px] transition-transform duration-300 ${activeMenu === 'tp' ? 'text-white scale-110' : 'group-active:scale-90'}`} />
            ))}
            <span className={`text-[9px] font-bold mt-1 transition-all duration-300 ${['students', 'classes', 'tp'].includes(activeMenu) ? 'opacity-100' : 'opacity-70 group-hover:opacity-100 uppercase tracking-tighter'}`}>
              {user.role === 'ADMIN' ? 'Siswa' : (user.role === 'HOMEROOM' ? 'Kelas' : 'CP/TP')}
            </span>
          </button>

          <div className="flex-1 flex justify-center relative z-20">
            <button 
              onClick={() => onMenuChange('smart-features')}
              className={`w-12 h-12 rounded-2xl border-4 border-[#f1f3f9] shadow-2xl flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-95 ${
                activeMenu === 'smart-features' 
                  ? 'bg-brand-purple text-white rotate-[360deg] shadow-brand-purple/40 ring-4 ring-brand-purple/20' 
                  : 'bg-brand-deep text-white shadow-brand-deep/30'
              }`}
            >
              <Sparkles className={`w-6 h-6 ${activeMenu === 'smart-features' ? 'animate-pulse' : ''}`} />
            </button>
          </div>

          <button 
            onClick={() => onMenuChange(user.role === 'ADMIN' ? 'academic' : 'grades')}
            className={`flex-1 flex flex-col items-center justify-center py-2 rounded-3xl transition-all duration-300 relative z-10 group ${
              ['academic', 'grades', 'formative-grades', 'summative-grades'].includes(activeMenu) 
                ? 'bg-brand-deep text-white shadow-lg shadow-brand-deep/20 scale-105' 
                : 'text-gray-400 hover:text-brand-deep'
            }`}
          >
            <BookOpen className={`w-[18px] h-[18px] transition-transform duration-300 ${activeMenu === 'academic' || activeMenu === 'grades' ? 'text-white scale-110' : 'group-active:scale-90'}`} />
            <span className={`text-[9px] font-bold mt-1 transition-all duration-300 ${['academic', 'grades'].includes(activeMenu) ? 'opacity-100' : 'opacity-70 group-hover:opacity-100 uppercase tracking-tighter'}`}>
              {user.role === 'ADMIN' ? 'Akademik' : 'Nilai'}
            </span>
          </button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button 
                className="flex-1 flex flex-col items-center justify-center py-2 rounded-3xl text-gray-400 hover:text-red-500 transition-all duration-300 relative z-10 group active:scale-90"
              >
                <LogOut className="w-[18px] h-[18px] transition-transform duration-300 group-hover:scale-110" />
                <span className="text-[9px] font-bold mt-1 opacity-70 group-hover:opacity-100 uppercase tracking-tighter">Logout</span>
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-3xl p-8">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-xl font-black text-brand-deep">Konfirmasi Keluar</AlertDialogTitle>
                <AlertDialogDescription>
                  Apakah Anda yakin ingin keluar? Sesi Anda akan berakhir dan Anda harus masuk kembali.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl font-bold">Batal</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => {
                    localStorage.removeItem('user')
                    window.location.href = '/login'
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold"
                >
                  Ya, Keluar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </nav>
      </div>
    </div>
  )
}