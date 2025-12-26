'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, FileEdit, UserCheck, AlertCircle, Search, Save, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface HomeroomManagementProps {
    user?: {
        name: string
        email: string
        role: string
    }
}

export default function HomeroomManagement({ user }: HomeroomManagementProps) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [classInfo, setClassInfo] = useState<any>(null)
  const [students, setStudents] = useState<any[]>([])
  const [semester, setSemester] = useState('GANJIL')
  const [schoolYear, setSchoolYear] = useState('2024/2025')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (user?.email) {
        fetchMyClass()
    }
  }, [user, semester, schoolYear])

  const fetchMyClass = async () => {
    setLoading(true)
    try {
        // Fetch class for this homeroom teacher
        const resClass = await fetch(`/api/classes?homeroomEmail=${user?.email}`)
        const dataClass = await resClass.json()
        
        if (dataClass.classes && dataClass.classes.length > 0) {
            const myClass = dataClass.classes[0]
            setClassInfo(myClass)
            fetchStudents(myClass.id)
        }
    } catch (err) {
        console.error('Error fetching class:', err)
    } finally {
        setLoading(false)
    }
  }

  const fetchStudents = async (classId: string) => {
      try {
        const res = await fetch(`/api/homeroom?classId=${classId}&semester=${semester}&schoolYear=${schoolYear}`)
        const data = await res.json()
        if (data.students) {
            // Map to include notes/attendance from the first note entry if exists
            const mapped = data.students.map((s: any) => ({
                id: s.id,
                name: s.name,
                nis: s.nis,
                s: s.homeroomNotes?.[0]?.attendance_s || 0,
                i: s.homeroomNotes?.[0]?.attendance_i || 0,
                a: s.homeroomNotes?.[0]?.attendance_a || 0,
                notes: s.homeroomNotes?.[0]?.notes || ''
            }))
            setStudents(mapped)
        }
      } catch (err) {
          console.error(err)
      }
  }

  const handleInputChange = (id: string, field: string, value: string | number) => {
      setStudents(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s))
  }

  const handleSave = async () => {
      if (!classInfo) return
      setSaving(true)
      try {
        const payload = {
            classId: classInfo.id,
            semester: semester,
            schoolYear: schoolYear,
            data: students.map(s => ({
                studentId: s.id,
                s: s.s,
                i: s.i,
                a: s.a,
                notes: s.notes
            }))
        }

        const res = await fetch('/api/homeroom', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        
        if (res.ok) {
            alert('Data berhasil disimpan!')
        } else {
            alert('Gagal menyimpan data')
        }
      } catch (err) {
          console.error(err)
          alert('Terjadi kesalahan')
      } finally {
          setSaving(false)
      }
  }

  const filteredStudents = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <div className="text-center py-20"><Loader2 className="w-10 h-10 animate-spin mx-auto text-brand-purple" /></div>

  if (!classInfo) {
      return (
          <div className="text-center py-20">
              <h2 className="text-xl font-bold text-gray-700">Anda belum ditugaskan sebagai Wali Kelas.</h2>
              <p className="text-gray-500">Silakan hubungi admin untuk pengaturan kelas.</p>
          </div>
      )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex-1">
          <h1 className="text-3xl font-extrabold text-brand-deep">Manajemen Wali Kelas</h1>
          <p className="text-gray-400 font-medium pb-2">Monitoring kelas {classInfo.name}</p>
          <div className="flex gap-4 items-center bg-gray-50/50 p-2 rounded-3xl border border-gray-100 mt-2">
             <div className="flex items-center gap-2">
                <Select value={semester} onValueChange={setSemester}>
                   <SelectTrigger className="w-[120px] rounded-2xl border-none bg-white h-10 font-bold text-xs focus:ring-brand-purple shadow-sm">
                      <SelectValue />
                   </SelectTrigger>
                   <SelectContent className="rounded-2xl">
                      <SelectItem value="GANJIL">Ganjil</SelectItem>
                      <SelectItem value="GENAP">Genap</SelectItem>
                   </SelectContent>
                </Select>

                <Input 
                   value={schoolYear} 
                   onChange={e => setSchoolYear(e.target.value)} 
                   className="w-[120px] rounded-2xl border-none bg-white h-10 font-bold text-xs focus-visible:ring-brand-purple px-4 shadow-sm text-center" 
                   placeholder="Tahun..."
                />
             </div>
          </div>
        </div>
        <div className="flex gap-4">
           
           <Button onClick={handleSave} disabled={saving} className="rounded-2xl bg-brand-deep hover:bg-brand-deep/90 shadow-lg px-8 py-6 h-auto transform hover:scale-105 transition-all">
              {saving ? <Loader2 className="w-5 h-5 mr-3 animate-spin" /> : <Save className="w-5 h-5 mr-3" />}
              <span className="font-bold">Simpan Perubahan</span>
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="rounded-3xl border-none bg-indigo-50/50 p-6 shadow-sm border border-indigo-100/50">
           <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1 block">Total Siswa</span>
           <div className="text-3xl font-bold text-brand-deep">{students.length}</div>
        </Card>
        {/* Statistics could be calculated dynamically */}
        <Card className="rounded-3xl border-none bg-emerald-50/50 p-6 shadow-sm border border-emerald-100/50">
           <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1 block">Kehadiran Hari Ini</span>
           <div className="text-3xl font-bold text-brand-deep">-</div>
        </Card>
      </div>

      <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-white">
        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
           <h3 className="text-xl font-black text-brand-deep flex items-center">
              <FileEdit className="w-6 h-6 mr-3 text-brand-purple" />
              Ketidakhadiran & Catatan
           </h3>
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama siswa..." 
                className="pl-12 rounded-2xl border-none bg-gray-50 h-12 font-medium w-64 focus-visible:ring-brand-purple" 
              />
           </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="font-bold text-brand-deep px-8 py-5">Siswa</TableHead>
                <TableHead className="font-bold text-brand-deep px-8 py-5 text-center">Sakit</TableHead>
                <TableHead className="font-bold text-brand-deep px-8 py-5 text-center">Izin</TableHead>
                <TableHead className="font-bold text-brand-deep px-8 py-5 text-center">Alpa</TableHead>
                <TableHead className="font-bold text-brand-deep px-8 py-5">Catatan Wali Kelas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((s) => (
                <TableRow key={s.id} className="hover:bg-gray-50 transition-colors border-gray-50">
                  <TableCell className="px-8 py-6">
                    <div>
                       <p className="font-bold text-gray-900">{s.name}</p>
                       <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">NIS: {s.nis}</p>
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-6 text-center">
                     <Input 
                        type="number" 
                        value={s.s} 
                        onChange={(e) => handleInputChange(s.id, 's', e.target.value)}
                        className="w-16 mx-auto rounded-xl border-gray-100 text-center font-bold h-10" 
                     />
                  </TableCell>
                  <TableCell className="px-8 py-6 text-center">
                     <Input 
                        type="number" 
                        value={s.i} 
                        onChange={(e) => handleInputChange(s.id, 'i', e.target.value)}
                        className="w-16 mx-auto rounded-xl border-gray-100 text-center font-bold h-10" 
                     />
                  </TableCell>
                  <TableCell className="px-8 py-6 text-center">
                     <Input 
                        type="number" 
                        value={s.a} 
                        onChange={(e) => handleInputChange(s.id, 'a', e.target.value)}
                        className="w-16 mx-auto rounded-xl border-gray-100 text-center font-bold h-10" 
                     />
                  </TableCell>
                  <TableCell className="px-8 py-6">
                     <Textarea 
                        value={s.notes} 
                        onChange={(e) => handleInputChange(s.id, 'notes', e.target.value)}
                        className="min-h-[60px] rounded-2xl border-gray-100 font-medium text-sm focus-visible:ring-brand-purple" 
                        placeholder="Masukkan catatan untuk siswa ini di rapor..." 
                     />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
