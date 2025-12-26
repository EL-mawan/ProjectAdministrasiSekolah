'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import Layout from '@/components/layout/Layout'
import Dashboard from '@/components/dashboard/Dashboard'
import StudentsManagement from '@/components/students/StudentsManagement'
import TeachersManagement from '@/components/teachers/TeachersManagement'
import AcademicManagement from '@/components/academic/AcademicManagement'
import AttendanceManagement from '@/components/attendance/AttendanceManagement'
import GradesManagement from '@/components/grades/GradesManagement'
import FacilitiesManagement from '@/components/facilities/FacilitiesManagement'
import DocumentsManagement from '@/components/documents/DocumentsManagement'
import StudentAffairsManagement from '@/components/student-affairs/StudentAffairsManagement'
import UsersManagement from '@/components/users/UsersManagement'

import AnnouncementsManagement from '@/components/announcements/AnnouncementsManagement'
import SettingsManagement from '@/components/settings/SettingsManagement'

import P5Management from '@/components/academic/P5Management'
import ExtracurricularManagement from '@/components/academic/ExtracurricularManagement'
import ReportsManagement from '@/components/grades/ReportsManagement'
import HomeroomManagement from '@/components/teachers/HomeroomManagement'
import ProfileManagement from '@/components/users/ProfileManagement'
import TPManagement from '@/components/teachers/TPManagement'
import SchoolManagement from '@/components/school/SchoolManagement'
import FormativeGradesManagement from '@/components/grades/FormativeGradesManagement'
import SummativeGradesManagement from '@/components/grades/SummativeGradesManagement'

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState<{
    id: string;
    name: string;
    role: 'ADMIN' | 'HOMEROOM' | 'TEACHER';
    email: string;
    teacherProfile?: { id: string };
  } | null>(null)

  const [activeMenu, setActiveMenu] = useState('dashboard')

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (!savedUser) {
      router.push('/login')
    } else {
      setUser(JSON.parse(savedUser))
    }
  }, [router])

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f1f3f9] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-brand-purple" />
      </div>
    )
  }

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <Dashboard activeMenu={activeMenu} onMenuChange={setActiveMenu} user={user} />
      case 'students':
        return <StudentsManagement activeMenu={activeMenu} />
      case 'teachers':
        return <TeachersManagement activeMenu={activeMenu} />
      case 'academic':
      case 'classes':
        return <AcademicManagement activeMenu={activeMenu} />
      case 'attendance':
        return <AttendanceManagement activeMenu={activeMenu} />
      case 'grades':
        return <GradesManagement user={user} onNavigate={setActiveMenu} />
      case 'facilities':
        return <FacilitiesManagement activeMenu={activeMenu} />
      case 'documents':
        return <DocumentsManagement activeMenu={activeMenu} />
      case 'announcements':
        return <AnnouncementsManagement activeMenu={activeMenu} />
      case 'settings':
        return <SettingsManagement activeMenu={activeMenu} />
      case 'users':
        return <UsersManagement activeMenu={activeMenu} />
      
      // New Role Based Components
      case 'p5':
        return <P5Management />
      case 'extracurricular':
        return <ExtracurricularManagement />
      case 'reports':
        return <ReportsManagement />
      case 'homeroom-notes':
        return <HomeroomManagement user={user} />
      case 'tp':
        return <TPManagement user={user} />
      case 'school':
        return <SchoolManagement />
      case 'profile':
        return <ProfileManagement user={user} />
      case 'formative-grades':
        return <FormativeGradesManagement user={user} onNavigate={setActiveMenu} />
      case 'summative-grades':
        return <SummativeGradesManagement user={user} onNavigate={setActiveMenu} />
        
      default:
        return <Dashboard activeMenu={activeMenu} onMenuChange={setActiveMenu} user={user} />
    }
  }

  return (
    <Layout activeMenu={activeMenu} onMenuChange={setActiveMenu} user={user}>
      {renderContent()}
    </Layout>
  )
}