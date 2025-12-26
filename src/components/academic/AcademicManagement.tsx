'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Plus, BookOpen, Calendar, Clock, Edit, Trash2, Loader2, Building } from 'lucide-react'

interface ClassData {
  id: string
  name: string
  level: string
  schoolYear: string
  homeroom: { id: string; name: string } | null
  _count: { students: number }
}

interface Subject {
  id: string
  code: string
  name: string
  credits: number
  curriculum: string
  teacher: { id: string; name: string } | null
}

interface AcademicManagementProps {
  activeMenu: string
}

import { useDebounce } from '@/hooks/useDebounce'
import { Search } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function AcademicManagement({ activeMenu }: AcademicManagementProps) {
  const [classes, setClasses] = useState<ClassData[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [schoolId, setSchoolId] = useState('')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)
  const [isSubmittingClass, setIsSubmittingClass] = useState(false)
  const [isSubmittingSubject, setIsSubmittingSubject] = useState(false)
  const [activeSemester, setActiveSemester] = useState('GANJIL')
  const [activeSchoolYear, setActiveSchoolYear] = useState('2024/2025')
  const { toast } = useToast()

  // Dialog states
  const [isEditClassOpen, setIsEditClassOpen] = useState(false)
  const [isEditSubjectOpen, setIsEditSubjectOpen] = useState(false)
  const [editingClass, setEditingClass] = useState<ClassData | null>(null)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)

  // Form states
  const [classForm, setClassForm] = useState({
    name: '',
    level: 'X',
    grade: '10',
    schoolYear: '2024/2025',
    capacity: 36,
    homeroomId: ''
  })

  const [subjectForm, setSubjectForm] = useState({
    code: '',
    name: '',
    credits: 2,
    curriculum: 'MERDEKA',
    teacherId: ''
  })

  // Edit form states
  const [editClassForm, setEditClassForm] = useState({
    name: '',
    level: 'X',
    grade: '10',
    schoolYear: '2024/2025',
    capacity: 36,
    homeroomId: ''
  })

  const [editSubjectForm, setEditSubjectForm] = useState({
    code: '',
    name: '',
    credits: 2,
    curriculum: 'MERDEKA',
    teacherId: ''
  })

  useEffect(() => {
    fetchTeachers()
    fetchSchool()
  }, [])

  useEffect(() => {
    fetchClasses()
    fetchSubjects()
  }, [debouncedSearch])

  const fetchSchool = async () => {
    try {
      const schoolRes = await fetch('/api/school')
      const schoolData = await schoolRes.json()
      if (schoolRes.ok && schoolData.school) {
        setSchoolId(schoolData.school.id)
        setActiveSemester(schoolData.school.activeSemester || 'GANJIL')
        setActiveSchoolYear(schoolData.school.activeSchoolYear || '2024/2025')
      }
    } catch (e) {}
  }

  const fetchTeachers = async () => {
    try {
      const teachersRes = await fetch('/api/teachers?limit=100')
      const teachersData = await teachersRes.json()
      if (teachersRes.ok) {
        setTeachers(teachersData.teachers)
      }
    } catch (e) {}
  }

  const fetchClasses = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/classes?search=${debouncedSearch}`)
      const data = await res.json()
      if (res.ok) setClasses(data.classes)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubjects = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/subjects?search=${debouncedSearch}`)
      const data = await res.json()
      if (res.ok) setSubjects(data.subjects)
    } finally {
      setLoading(false)
    }
  }

  const handleAddClass = async () => {
    if (!schoolId) return
    const res = await fetch('/api/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...classForm, schoolId })
    })
    if (res.ok) {
      fetchClasses()
      alert('Kelas berhasil ditambahkan')
    }
  }

  const handleAddSubject = async () => {
    if (!schoolId) return
    const res = await fetch('/api/subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...subjectForm, schoolId })
    })
    if (res.ok) {
      fetchSubjects()
      alert('Mata pelajaran berhasil ditambahkan')
    }
  }

  const handleDeleteClass = async (id: string) => {
    if (!confirm('Hapus kelas ini?')) return
    const res = await fetch(`/api/classes/${id}`, { method: 'DELETE' })
    if (res.ok) fetchClasses()
  }

  const handleDeleteSubject = async (id: string) => {
    if (!confirm('Hapus mata pelajaran ini?')) return
    const res = await fetch(`/api/subjects/${id}`, { method: 'DELETE' })
    if (res.ok) fetchSubjects()
  }

  const openEditClass = (classData: ClassData) => {
    setEditingClass(classData)
    setEditClassForm({
      name: classData.name,
      level: classData.level,
      grade: classData.level || '10',
      schoolYear: classData.schoolYear,
      capacity: 36,
      homeroomId: classData.homeroom?.id || ''
    })
    setIsEditClassOpen(true)
  }

  const handleEditClass = async () => {
    if (!editingClass) return
    
    setIsSubmittingClass(true)
    
    try {
      const res = await fetch(`/api/classes/${editingClass.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editClassForm)
      })
      
      if (res.ok) {
        await fetchClasses()
        setIsEditClassOpen(false)
        setEditingClass(null)
        toast({
          title: "Berhasil!",
          description: "Data kelas berhasil diperbarui",
        })
      } else {
        const data = await res.json()
        toast({
          title: "Error",
          description: data.error || "Terjadi kesalahan saat memperbarui data",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan koneksi",
        variant: "destructive"
      })
    } finally {
      setIsSubmittingClass(false)
    }
  }

  const openEditSubject = (subject: Subject) => {
    setEditingSubject(subject)
    setEditSubjectForm({
      code: subject.code,
      name: subject.name,
      credits: subject.credits,
      curriculum: subject.curriculum,
      teacherId: subject.teacher?.id || ''
    })
    setIsEditSubjectOpen(true)
  }

  const handleEditSubject = async () => {
    if (!editingSubject) return
    
    setIsSubmittingSubject(true)
    
    try {
      const res = await fetch(`/api/subjects/${editingSubject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editSubjectForm)
      })
      
      if (res.ok) {
        await fetchSubjects()
        setIsEditSubjectOpen(false)
        setEditingSubject(null)
        toast({
          title: "Berhasil!",
          description: "Data mata pelajaran berhasil diperbarui",
        })
      } else {
        const data = await res.json()
        toast({
          title: "Error",
          description: data.error || "Terjadi kesalahan saat memperbarui data",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan koneksi",
        variant: "destructive"
      })
    } finally {
      setIsSubmittingSubject(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-brand-purple" />
      </div>
    )
  }

  return (
    <Card className="rounded-[2.5rem] border-none shadow-2xl p-8 bg-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-extrabold text-brand-deep">Manajemen Akademik</h1>
          <p className="text-gray-400 text-sm md:text-base font-medium">Kelola data kelas, mata pelajaran, dan struktur akademik</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-10">
        <Card className="rounded-[1.5rem] md:rounded-3xl border-none bg-indigo-50/50 p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm font-bold text-indigo-600 uppercase tracking-wider mb-1">Mata Pelajaran</p>
              <div className="text-2xl md:text-3xl font-black text-brand-deep">{subjects.length}</div>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-100 rounded-xl md:rounded-2xl flex items-center justify-center text-indigo-600">
              <BookOpen className="w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>
        </Card>

        <Card className="rounded-[1.5rem] md:rounded-3xl border-none bg-emerald-50/50 p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm font-bold text-emerald-600 uppercase tracking-wider mb-1">Total Kelas</p>
              <div className="text-2xl md:text-3xl font-black text-brand-deep">{classes.length}</div>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-100 rounded-xl md:rounded-2xl flex items-center justify-center text-emerald-600">
              <Building className="w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>
        </Card>

        <Card className="rounded-[1.5rem] md:rounded-3xl border-none bg-orange-50/50 p-6 shadow-sm hover:shadow-md transition-all sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm font-bold text-orange-600 uppercase tracking-wider mb-1">Semester Aktif</p>
              <div className="text-2xl md:text-3xl font-black text-brand-deep">
                {activeSemester.charAt(0) + activeSemester.slice(1).toLowerCase()}
              </div>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-100 rounded-xl md:rounded-2xl flex items-center justify-center text-orange-600">
              <Clock className="w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="classes" className="w-full">
        <TabsList className="bg-gray-50 p-1 rounded-xl md:rounded-2xl mb-6 overflow-x-auto w-full md:w-auto h-auto min-h-[50px] scrollbar-hide">
          <TabsTrigger value="classes" className="flex-1 md:flex-none rounded-lg md:rounded-xl px-4 md:px-8 py-2 md:py-3 font-bold data-[state=active]:bg-brand-deep data-[state=active]:text-white transition-all text-xs md:text-sm">Data Kelas</TabsTrigger>
          <TabsTrigger value="subjects" className="flex-1 md:flex-none rounded-lg md:rounded-xl px-4 md:px-8 py-2 md:py-3 font-bold data-[state=active]:bg-brand-deep data-[state=active]:text-white transition-all text-xs md:text-sm">Mata Pelajaran</TabsTrigger>
        </TabsList>

        <TabsContent value="classes" className="space-y-4 outline-none">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Cari kelas..." 
                className="pl-12 rounded-2xl border-none bg-gray-100 shadow-sm font-medium py-6 h-auto" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
              />
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full md:w-auto rounded-xl md:rounded-2xl bg-brand-deep hover:bg-brand-deep/90 shadow-lg shadow-brand-deep/20 px-8 py-6 h-auto transition-all">
                  <Plus className="w-5 h-5 mr-3" />
                  <span className="font-bold">Tambah Kelas</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl w-[95vw] rounded-[1.5rem] md:rounded-3xl">
                <DialogHeader>
                  <DialogTitle>Tambah Kelas Baru</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Nama Kelas (Contoh: X IPA 1)</Label>
                    <Input value={classForm.name} onChange={e => setClassForm({...classForm, name: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Tingkat</Label>
                      <Select value={classForm.level} onValueChange={v => setClassForm({...classForm, level: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="1">Kelas 1 (SD)</SelectItem>
                          <SelectItem value="2">Kelas 2 (SD)</SelectItem>
                          <SelectItem value="3">Kelas 3 (SD)</SelectItem>
                          <SelectItem value="4">Kelas 4 (SD)</SelectItem>
                          <SelectItem value="5">Kelas 5 (SD)</SelectItem>
                          <SelectItem value="6">Kelas 6 (SD)</SelectItem>
                          <SelectItem value="7">Kelas 7 (SMP)</SelectItem>
                          <SelectItem value="8">Kelas 8 (SMP)</SelectItem>
                          <SelectItem value="9">Kelas 9 (SMP)</SelectItem>
                          <SelectItem value="10">Kelas 10 (SMA/SMK)</SelectItem>
                          <SelectItem value="11">Kelas 11 (SMA/SMK)</SelectItem>
                          <SelectItem value="12">Kelas 12 (SMA/SMK)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Walikelas</Label>
                      <Select value={classForm.homeroomId} onValueChange={v => setClassForm({...classForm, homeroomId: v})}>
                        <SelectTrigger><SelectValue placeholder="Pilih Guru" /></SelectTrigger>
                        <SelectContent>
                          {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Tahun Pelajaran</Label>
                    <Input value={classForm.schoolYear} onChange={e => setClassForm({...classForm, schoolYear: e.target.value})} placeholder="Contoh: 2024/2025" />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddClass}>Simpan</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="rounded-[1.25rem] md:rounded-3xl border border-gray-100 overflow-x-auto shadow-sm scrollbar-hide">
            <div className="min-w-[700px]">
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="font-bold text-brand-deep px-6 py-4">Nama Kelas</TableHead>
                    <TableHead className="font-bold text-brand-deep px-6 py-4">Tingkat</TableHead>
                    <TableHead className="font-bold text-brand-deep px-6 py-4">Wali Kelas</TableHead>
                    <TableHead className="font-bold text-brand-deep px-6 py-4">Total Siswa</TableHead>
                    <TableHead className="text-right font-bold text-brand-deep px-6 py-4">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classes.map(c => (
                    <TableRow key={c.id} className="hover:bg-gray-50/50 transition-colors border-gray-50">
                      <TableCell className="font-bold px-6 py-4 text-gray-900">{c.name}</TableCell>
                      <TableCell className="px-6 py-4">
                        <Badge variant="outline" className="rounded-lg border-indigo-100 text-indigo-600 px-3">{c.level}</Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 font-medium text-gray-600">{c.homeroom?.name || '-'}</TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-brand-deep">{c._count.students}</span>
                          <span className="text-xs text-gray-400">Siswa</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right px-6 py-4">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => openEditClass(c)} 
                            className="rounded-xl text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteClass(c.id)} 
                            className="rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <Dialog open={isEditClassOpen} onOpenChange={setIsEditClassOpen}>
            <DialogContent className="rounded-[2rem] md:rounded-4xl max-w-xl w-[95vw]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-brand-deep">Edit Data Kelas</DialogTitle>
                <DialogDescription>Perbarui informasi kelas {editingClass?.name}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label className="font-bold text-gray-700">Nama Kelas (Contoh: X IPA 1)</Label>
                  <Input 
                    className="rounded-xl border-gray-100" 
                    value={editClassForm.name} 
                    onChange={e => setEditClassForm({...editClassForm, name: e.target.value})} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="font-bold text-gray-700">Tingkat</Label>
                    <Select value={editClassForm.level} onValueChange={v => setEditClassForm({...editClassForm, level: v})}>
                      <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="1">Kelas 1 (SD)</SelectItem>
                        <SelectItem value="2">Kelas 2 (SD)</SelectItem>
                        <SelectItem value="3">Kelas 3 (SD)</SelectItem>
                        <SelectItem value="4">Kelas 4 (SD)</SelectItem>
                        <SelectItem value="5">Kelas 5 (SD)</SelectItem>
                        <SelectItem value="6">Kelas 6 (SD)</SelectItem>
                        <SelectItem value="7">Kelas 7 (SMP)</SelectItem>
                        <SelectItem value="8">Kelas 8 (SMP)</SelectItem>
                        <SelectItem value="9">Kelas 9 (SMP)</SelectItem>
                        <SelectItem value="10">Kelas 10 (SMA/SMK)</SelectItem>
                        <SelectItem value="11">Kelas 11 (SMA/SMK)</SelectItem>
                        <SelectItem value="12">Kelas 12 (SMA/SMK)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label className="font-bold text-gray-700">Walikelas</Label>
                    <Select value={editClassForm.homeroomId} onValueChange={v => setEditClassForm({...editClassForm, homeroomId: v})}>
                      <SelectTrigger className="rounded-xl"><SelectValue placeholder="Pilih Guru" /></SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="font-bold text-gray-700">Tahun Pelajaran</Label>
                  <Input 
                    className="rounded-xl border-gray-100" 
                    value={editClassForm.schoolYear} 
                    onChange={e => setEditClassForm({...editClassForm, schoolYear: e.target.value})} 
                    placeholder="Contoh: 2024/2025" 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsEditClassOpen(false)} className="rounded-xl font-bold" disabled={isSubmittingClass}>Batal</Button>
                <Button onClick={handleEditClass} className="rounded-xl bg-brand-deep px-8 font-bold" disabled={isSubmittingClass}>
                  {isSubmittingClass && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {isSubmittingClass ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="subjects" className="space-y-4 outline-none">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Cari mata pelajaran..." 
                className="pl-12 rounded-2xl border-none bg-gray-100 shadow-sm font-medium py-6 h-auto" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
              />
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full md:w-auto rounded-xl md:rounded-2xl bg-brand-deep hover:bg-brand-deep/90 shadow-lg shadow-brand-deep/20 px-8 py-6 h-auto transition-all">
                  <Plus className="w-5 h-5 mr-3" />
                  <span className="font-bold">Tambah Mapel</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl w-[95vw] rounded-[1.5rem] md:rounded-4xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-brand-deep">Tambah Mata Pelajaran</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label className="font-bold text-gray-700">Kode</Label>
                      <Input className="rounded-xl border-gray-100" placeholder="Contoh: BING-10" value={subjectForm.code} onChange={e => setSubjectForm({...subjectForm, code: e.target.value})} />
                    </div>
                    <div className="grid gap-2">
                      <Label className="font-bold text-gray-700">Nama Mapel</Label>
                      <Input className="rounded-xl border-gray-100" placeholder="Contoh: Bahasa Inggris" value={subjectForm.name} onChange={e => setSubjectForm({...subjectForm, name: e.target.value})} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label className="font-bold text-gray-700">JP</Label>
                      <Input type="number" className="rounded-xl border-gray-100" value={subjectForm.credits} onChange={e => setSubjectForm({...subjectForm, credits: parseInt(e.target.value)})} />
                    </div>
                    <div className="grid gap-2">
                      <Label className="font-bold text-gray-700">Kurikulum</Label>
                      <Select value={subjectForm.curriculum} onValueChange={v => setSubjectForm({...subjectForm, curriculum: v})}>
                        <SelectTrigger className="rounded-xl border-gray-100"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="MERDEKA">Kurikulum Merdeka</SelectItem>
                          <SelectItem value="K13">K-13</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label className="font-bold text-gray-700">Koordinator</Label>
                    <Select value={subjectForm.teacherId} onValueChange={v => setSubjectForm({...subjectForm, teacherId: v})}>
                      <SelectTrigger className="rounded-xl border-gray-100"><SelectValue placeholder="Pilih Guru" /></SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddSubject} className="w-full rounded-xl bg-brand-deep">Simpan Mata Pelajaran</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="rounded-[1.25rem] md:rounded-3xl border border-gray-100 overflow-x-auto shadow-sm scrollbar-hide">
            <div className="min-w-[800px]">
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="font-bold text-brand-deep px-6 py-4">Kode</TableHead>
                    <TableHead className="font-bold text-brand-deep px-6 py-4">Nama Mapel</TableHead>
                    <TableHead className="font-bold text-brand-deep px-6 py-4">JP</TableHead>
                    <TableHead className="font-bold text-brand-deep px-6 py-4">Kurikulum</TableHead>
                    <TableHead className="font-bold text-brand-deep px-6 py-4">Koordinator</TableHead>
                    <TableHead className="text-right font-bold text-brand-deep px-6 py-4">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.map(s => (
                    <TableRow key={s.id} className="hover:bg-gray-50/50 transition-colors border-gray-50">
                      <TableCell className="font-bold px-6 py-4 text-gray-900">{s.code}</TableCell>
                      <TableCell className="px-6 py-4 font-medium text-gray-600">{s.name}</TableCell>
                      <TableCell className="px-6 py-4">
                        <Badge variant="secondary" className="bg-brand-purple/5 text-brand-purple border-none rounded-lg px-3">{s.credits} JP</Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 font-bold text-brand-deep">{s.curriculum}</TableCell>
                      <TableCell className="px-6 py-4 text-gray-600">{s.teacher?.name || '-'}</TableCell>
                      <TableCell className="text-right px-6 py-4">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => openEditSubject(s)} 
                            className="rounded-xl text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteSubject(s.id)} 
                            className="rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <Dialog open={isEditSubjectOpen} onOpenChange={setIsEditSubjectOpen}>
            <DialogContent className="rounded-4xl max-w-xl w-[95vw]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-brand-deep">Edit Mata Pelajaran</DialogTitle>
                <DialogDescription>Perbarui informasi mata pelajaran {editingSubject?.name}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="font-bold text-gray-700">Kode</Label>
                    <Input 
                      className="rounded-xl border-gray-100" 
                      placeholder="Contoh: BING-10" 
                      value={editSubjectForm.code} 
                      onChange={e => setEditSubjectForm({...editSubjectForm, code: e.target.value})} 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="font-bold text-gray-700">Nama Mapel</Label>
                    <Input 
                      className="rounded-xl border-gray-100" 
                      placeholder="Contoh: Bahasa Inggris" 
                      value={editSubjectForm.name} 
                      onChange={e => setEditSubjectForm({...editSubjectForm, name: e.target.value})} 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="font-bold text-gray-700">JP</Label>
                    <Input 
                      type="number" 
                      className="rounded-xl border-gray-100" 
                      value={editSubjectForm.credits} 
                      onChange={e => setEditSubjectForm({...editSubjectForm, credits: parseInt(e.target.value)})} 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="font-bold text-gray-700">Kurikulum</Label>
                    <Select value={editSubjectForm.curriculum} onValueChange={v => setEditSubjectForm({...editSubjectForm, curriculum: v})}>
                      <SelectTrigger className="rounded-xl border-gray-100"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="MERDEKA">Kurikulum Merdeka</SelectItem>
                        <SelectItem value="K13">K-13</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="font-bold text-gray-700">Koordinator</Label>
                  <Select value={editSubjectForm.teacherId} onValueChange={v => setEditSubjectForm({...editSubjectForm, teacherId: v})}>
                    <SelectTrigger className="rounded-xl border-gray-100"><SelectValue placeholder="Pilih Guru" /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsEditSubjectOpen(false)} className="rounded-xl font-bold" disabled={isSubmittingSubject}>Batal</Button>
                <Button onClick={handleEditSubject} className="rounded-xl bg-brand-deep px-8 font-bold" disabled={isSubmittingSubject}>
                  {isSubmittingSubject && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {isSubmittingSubject ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
