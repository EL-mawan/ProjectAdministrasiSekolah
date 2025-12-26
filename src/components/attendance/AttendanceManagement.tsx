'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { UserCheck, UserX, Clock, Loader2, Save, Calendar } from 'lucide-react'

interface Student {
  id: string
  name: string
  nis: string
}

interface User {
  id: string
}

interface ClassData {
  id: string
  name: string
}

interface AttendanceManagementProps {
  activeMenu: string
}

export default function AttendanceManagement({ activeMenu }: AttendanceManagementProps) {
  const [classes, setClasses] = useState<ClassData[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedClass, setSelectedClass] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [attendanceData, setAttendanceData] = useState<Record<string, string>>({})
  const [userId, setUserId] = useState<string>('')

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      // Fetch classes
      const classRes = await fetch('/api/classes')
      const classData = await classRes.json()
      if (classRes.ok) setClasses(classData.classes)

      // Fetch first user to use as recorder (temporary until auth session)
      const userRes = await fetch('/api/users?limit=1')
      const userData = await userRes.json()
      if (userRes.ok && userData.users.length > 0) {
        setUserId(userData.users[0].id)
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    if (selectedClass) {
      fetchStudentsInClass()
    }
  }, [selectedClass])


  const fetchStudentsInClass = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/students?classId=${selectedClass}&limit=100`)
      const data = await res.json()
      if (res.ok) {
        setStudents(data.students)
        // Initialize attendance data
        const initial: Record<string, string> = {}
        data.students.forEach((s: any) => initial[s.id] = 'PRESENT')
        setAttendanceData(initial)
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleAttendanceChange = (studentId: string, status: string) => {
    setAttendanceData(prev => ({ ...prev, [studentId]: status }))
  }

  const handleSaveAttendance = async () => {
    if (!userId) {
      alert('Informasi user tidak ditemukan. Gagal menyimpan.')
      return
    }

    try {
      setLoading(true)
      const promises = Object.entries(attendanceData).map(([studentId, status]) => {
        return fetch('/api/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId,
            status,
            date,
            userId: userId
          })
        })
      })

      await Promise.all(promises)
      alert('Absensi berhasil disimpan')
    } catch (e) {
      console.error(e)
      alert('Gagal menyimpan absensi')
    } finally {
      setLoading(false)
    }
  }

  const todayStr = new Date().toLocaleDateString('id-ID', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  })

  if (loading && students.length === 0 && !selectedClass) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-brand-purple" />
      </div>
    )
  }

  return (
    <Card className="rounded-[2.5rem] border-none shadow-2xl p-8 bg-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-deep">Manajemen Absensi</h1>
          <p className="text-brand-purple font-bold mt-1 uppercase tracking-widest text-xs flex items-center">
             <Calendar className="w-3 h-3 mr-2" />
             {todayStr}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <Card className="rounded-3xl border-none bg-emerald-50/50 p-6 shadow-sm border border-emerald-100/50">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-emerald-600 uppercase mb-2">Hadir (H)</span>
            <div className="text-3xl font-black text-brand-deep">{Object.values(attendanceData).filter(v => v === 'PRESENT').length}</div>
          </div>
        </Card>
        <Card className="rounded-3xl border-none bg-indigo-50/50 p-6 shadow-sm border border-indigo-100/50">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-indigo-600 uppercase mb-2">Izin (I)</span>
            <div className="text-3xl font-black text-brand-deep">{Object.values(attendanceData).filter(v => v === 'PERMISSION').length}</div>
          </div>
        </Card>
        <Card className="rounded-3xl border-none bg-orange-50/50 p-6 shadow-sm border border-orange-100/50">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-orange-600 uppercase mb-2">Sakit (S)</span>
            <div className="text-3xl font-black text-brand-deep">{Object.values(attendanceData).filter(v => v === 'SICK').length}</div>
          </div>
        </Card>
        <Card className="rounded-3xl border-none bg-red-50/50 p-6 shadow-sm border border-red-100/50">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-red-600 uppercase mb-2">Alpa (A)</span>
            <div className="text-3xl font-black text-brand-deep">{Object.values(attendanceData).filter(v => v === 'ABSENT').length}</div>
          </div>
        </Card>
      </div>

      <div className="bg-gray-50/50 p-8 rounded-4xl border border-gray-100 mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col gap-1">
             <h3 className="text-xl font-bold text-brand-deep">Input Kehadiran</h3>
             <p className="text-sm text-gray-400 font-medium">Pilih kelas dan tentukan status kehadiran siswa</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
             <div className="w-56">
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="rounded-2xl border-none shadow-sm bg-white py-6 font-bold text-brand-deep">
                    <SelectValue placeholder="Pilih Kelas" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-xl">
                    {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
             </div>
             <Input 
               type="date" 
               value={date} 
               onChange={e => setDate(e.target.value)} 
               className="w-44 rounded-2xl border-none shadow-sm bg-white py-6 font-bold text-brand-deep" 
             />
          </div>
        </div>
      </div>

      <div className="rounded-4xl border border-gray-100 overflow-hidden shadow-sm">
        {!selectedClass ? (
          <div className="text-center py-24 bg-white">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
               <UserCheck className="w-8 h-8 text-gray-200" />
            </div>
            <p className="text-gray-400 font-bold">Silakan pilih kelas terlebih dahulu untuk memulai absensi</p>
          </div>
        ) : loading ? (
          <div className="text-center py-24 bg-white">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-brand-purple mb-4" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Memuat data siswa...</p>
          </div>
        ) : (
          <div className="bg-white">
            <Table>
              <TableHeader className="bg-gray-50/80">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="font-bold text-brand-deep px-8 py-5">NIS</TableHead>
                  <TableHead className="font-bold text-brand-deep px-8 py-5">Identitas Siswa</TableHead>
                  <TableHead className="text-center font-bold text-brand-deep px-8 py-5">Status Kehadiran</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id} className="hover:bg-gray-50/50 transition-colors border-gray-50">
                    <TableCell className="px-8 py-5 font-bold text-gray-400">{student.nis}</TableCell>
                    <TableCell className="px-8 py-5">
                       <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                             {student.name.substring(0, 1)}
                          </div>
                          <span className="font-bold text-gray-900">{student.name}</span>
                       </div>
                    </TableCell>
                    <TableCell className="px-8 py-5">
                      <RadioGroup 
                        value={attendanceData[student.id]} 
                        onValueChange={(v) => handleAttendanceChange(student.id, v)}
                        className="flex justify-center items-center gap-3"
                      >
                        {[
                          { val: 'PRESENT', label: 'H', color: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-600' },
                          { val: 'PERMISSION', label: 'I', color: 'bg-indigo-500', bg: 'bg-indigo-50', text: 'text-indigo-600' },
                          { val: 'SICK', label: 'S', color: 'bg-orange-500', bg: 'bg-orange-50', text: 'text-orange-600' },
                          { val: 'ABSENT', label: 'A', color: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-600' }
                        ].map((opt) => (
                          <div key={opt.val} className="flex items-center">
                            <RadioGroupItem value={opt.val} id={`${opt.val}-${student.id}`} className="sr-only" />
                            <Label 
                              htmlFor={`${opt.val}-${student.id}`}
                              className={`
                                cursor-pointer w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all duration-200 border-2
                                ${attendanceData[student.id] === opt.val 
                                  ? `${opt.color} text-white border-transparent shadow-lg scale-110` 
                                  : `bg-white border-gray-100 text-gray-300 hover:border-gray-300`
                                }
                              `}
                            >
                              {opt.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="p-8 bg-gray-50/50 flex justify-end border-t border-gray-100">
              <Button 
                onClick={handleSaveAttendance} 
                className="rounded-2xl bg-brand-deep hover:bg-brand-deep/90 shadow-xl shadow-brand-deep/20 px-10 py-6 h-auto transition-all transform hover:scale-105 active:scale-95"
                disabled={loading}
              >
                <Save className="w-5 h-5 mr-3" />
                <span className="font-bold text-base">Simpan Seluruh Absensi</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
