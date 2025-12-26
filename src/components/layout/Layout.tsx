'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
  ChevronDown,
  Clock,
  X,
  MapPin,
  Target, // Added
  Layers // Added
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
}

interface HeaderProps {
  userName: string
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

const Sidebar = ({ isOpen, onToggle, activeMenu, onMenuChange, user }: SidebarProps) => {
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

  const menuItems = getMenuItems(user.role)

  const handleLogout = () => {
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  return (
    <aside 
      className={`${isOpen ? 'w-80' : 'w-24'} fixed left-4 top-4 bottom-4 glass rounded-[2.5rem] shadow-2xl transition-all duration-500 z-50 flex flex-col border border-white/20`}
    >
      <div className="p-8 flex items-center justify-between">
        <div className={`flex items-center space-x-3 transition-opacity duration-300 ${!isOpen && 'opacity-0 invisible'}`}>
          <div className="w-10 h-10 bg-brand-deep rounded-2xl flex items-center justify-center shadow-lg shadow-brand-deep/20">
            <GraduationCap className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tight text-brand-deep">Smart School</span>
        </div>
        <button 
          onClick={onToggle}
          className="p-2 hover:bg-white/50 rounded-xl transition-all"
        >
          {isOpen ? <X className="w-5 h-5 text-gray-500" /> : <Menu className="w-5 h-5 text-gray-500 mx-auto" />}
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto overflow-x-hidden scrollbar-hide py-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onMenuChange(item.id)}
            className={`w-full flex items-center px-4 py-4 rounded-3xl transition-all duration-300 group relative
              ${activeMenu === item.id 
                ? 'bg-brand-deep text-white shadow-xl shadow-brand-deep/20' 
                : 'text-gray-500 hover:bg-white/50 hover:px-6'
              }`}
          >
            <item.icon className={`w-6 h-6 min-w-[24px] ${activeMenu === item.id ? 'text-white' : 'text-gray-400 group-hover:text-brand-deep'}`} />
            {isOpen && <span className="ml-4 font-bold text-sm tracking-wide">{item.label}</span>}
            {activeMenu === item.id && !isOpen && (
              <div className="absolute left-0 w-1.5 h-8 bg-white rounded-r-full"></div>
            )}
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-white/20">
        <div className={`transition-all duration-300 ${!isOpen ? 'opacity-0 scale-90 invisible h-0' : 'opacity-100 scale-100'}`}>
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
              className={`w-full rounded-2xl justify-start hover:bg-red-50 group hover:px-6 transition-all duration-300 ${!isOpen && 'justify-center px-2'}`}
            >
              <LogOut className="w-5 h-5 text-red-500" />
              {isOpen && <span className="ml-4 text-red-500 font-bold text-sm">Logout</span>}
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
    </aside>
  )
}

const Header = ({ userName }: { userName: string }) => {
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

  return (
    <div className="dark-gradient rounded-[2.5rem] p-8 mb-8 text-white relative overflow-hidden shadow-2xl">
      <div className="absolute top-[-50%] right-[-10%] w-[300px] h-[300px] bg-brand-purple/20 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-[200px] h-[200px] bg-brand-pink/10 rounded-full blur-[80px]"></div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold mb-2 text-white">Halo! {userName}</h2>
          <p className="text-gray-300 text-sm">Pantau dan berikan pengalaman terbaik bagi para siswa.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari..." 
              className="bg-white/10 border-white/10 rounded-2xl pl-10 pr-4 py-2 text-sm w-48 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all placeholder:text-gray-400"
            />
          </div>
          
          <div className="flex items-center space-x-4 bg-black/20 px-4 py-2 rounded-2xl text-xs font-medium">
            <div className="flex items-center">
               <FileText className="w-3 h-3 mr-2 opacity-60" />
               <span>Hari Ini, {today}</span>
            </div>
            <div className="w-px h-4 bg-white/10"></div>
            <div className="flex items-center">
               <Clock className="w-3 h-3 mr-2 opacity-60" />
               <span>Pukul {time} WIB</span>
            </div>
          </div>

          <button className="relative p-2 bg-white/10 rounded-2xl hover:bg-white/20 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-brand-pink rounded-full border-2 border-brand-deep"></span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Layout({ children, activeMenu, onMenuChange, user }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-[#f1f3f9] text-gray-900 font-sans">
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        activeMenu={activeMenu}
        onMenuChange={onMenuChange}
        user={user}
      />
      
      <main className={`transition-all duration-300 min-h-screen ${sidebarOpen ? 'pl-[290px]' : 'pl-[110px]'} pr-6 py-6 overflow-x-hidden`}>
        <div className="max-w-[1400px] mx-auto">
          <Header userName={user.name} />
          <div className="min-h-[600px]">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}