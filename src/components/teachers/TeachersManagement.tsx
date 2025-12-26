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
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Edit, Trash2, Filter, Loader2, Upload, FileSpreadsheet, Download } from 'lucide-react'

interface Teacher {
  id: string
  nip: string | null
  name: string
  email: string
  gender: string
  status: string
  position: string | null
  phone: string | null
  createdAt: string
}

interface TeachersManagementProps {
  activeMenu: string
}

import { useDebounce } from '@/hooks/useDebounce'

export default function TeachersManagement({ activeMenu }: TeachersManagementProps) {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [schoolId, setSchoolId] = useState<string>('')

  const [formData, setFormData] = useState({
    nip: '',
    name: '',
    email: '',
    password: 'password123',
    gender: 'MALE',
    birthDate: '1990-01-01',
    birthPlace: 'Jakarta',
    address: 'Jl. Utama No. 1',
    phone: '',
    hireDate: new Date().toISOString().split('T')[0],
    status: 'ACTIVE',
    position: 'GURU_MATA_PELAJARAN'
  })

  useEffect(() => {
    fetchSchool()
  }, [])

  useEffect(() => {
    fetchTeachers()
  }, [debouncedSearch, filterStatus, currentPage])

  const fetchSchool = async () => {
    try {
      const response = await fetch('/api/school')
      const data = await response.json()
      if (response.ok && data.school) {
        setSchoolId(data.school.id)
      }
    } catch (error) {
      console.error('Error fetching school:', error)
    }
  }

  const fetchTeachers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(filterStatus !== 'ALL' && { status: filterStatus })
      })

      const response = await fetch(`/api/teachers?${params}`)
      const data = await response.json()

      if (response.ok) {
        setTeachers(data.teachers)
        setTotalPages(data.pagination.pages)
      }
    } catch (error) {
      console.error('Error fetching teachers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTeacher = async () => {
    if (!schoolId) {
      alert('School ID tidak ditemukan. Silakan refresh halaman.')
      return
    }

    try {
      const response = await fetch('/api/teachers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          schoolId
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsAddDialogOpen(false)
        resetForm()
        fetchTeachers()
        alert('Data guru berhasil ditambahkan')
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error adding teacher:', error)
      alert('Terjadi kesalahan server')
    }
  }

  const handleUpdateTeacher = async () => {
    if (!selectedTeacher) return

    try {
      const response = await fetch(`/api/teachers/${selectedTeacher.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setIsEditDialogOpen(false)
        setSelectedTeacher(null)
        resetForm()
        fetchTeachers()
        alert('Data guru berhasil diperbarui')
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error updating teacher:', error)
      alert('Terjadi kesalahan server')
    }
  }

  const handleDeleteTeacher = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data guru ini? User terkait juga akan dihapus.')) return

    try {
      const response = await fetch(`/api/teachers/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchTeachers()
        alert('Data guru berhasil dihapus')
      } else {
        const data = await response.json()
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error deleting teacher:', error)
      alert('Terjadi kesalahan server')
    }
  }

  const resetForm = () => {
    setFormData({
      nip: '',
      name: '',
      email: '',
      password: 'password123',
      gender: 'MALE',
      birthDate: '1990-01-01',
      birthPlace: 'Jakarta',
      address: 'Jl. Utama No. 1',
      phone: '',
      hireDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
      position: 'GURU_MATA_PELAJARAN'
    })
  }

  const openEditDialog = (teacher: Teacher) => {
    setSelectedTeacher(teacher)
    setFormData({
      nip: teacher.nip || '',
      name: teacher.name,
      email: teacher.email,
      password: '', // Don't show password on edit
      gender: teacher.gender,
      birthDate: '1990-01-01', // Should fetch from API ideally
      birthPlace: 'Jakarta',
      address: 'Jl. Utama',
      phone: teacher.phone || '',
      hireDate: new Date().toISOString().split('T')[0],
      status: teacher.status,
      position: teacher.position || 'GURU_MATA_PELAJARAN'
    })
    setIsEditDialogOpen(true)
  }

  const handleImportExcel = () => {
    setIsImportOpen(true)
  }

  return (
    <Card className="rounded-[2.5rem] border-none shadow-2xl p-8 bg-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-deep">Manajemen Guru & Staff</h1>
          <p className="text-gray-400 font-medium">Kelola data tenaga pendidik dan staff administrasi sekolah</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-2xl border-gray-100 font-bold px-6 py-6 h-auto transition-all" onClick={handleImportExcel}>
            <Upload className="w-5 h-5 mr-3 text-brand-purple" />
            Import Excel
          </Button>

          <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
            <DialogContent className="max-w-md rounded-[2.5rem] p-8 border-none overflow-hidden text-center">
              <DialogHeader className="flex flex-col items-center">
                <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-brand-purple mb-6 shadow-sm">
                  <FileSpreadsheet className="w-10 h-10" />
                </div>
                <DialogTitle className="text-2xl font-black text-brand-deep mb-2">Import Data Guru</DialogTitle>
                <DialogDescription className="text-gray-400 text-sm font-medium">
                  Unggah file Excel untuk menambahkan data guru secara massal.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 pt-6">
                  <Button variant="outline" className="w-full rounded-2xl border-indigo-100 text-indigo-600 font-bold py-6 h-auto">
                    <Download className="w-4 h-4 mr-2" /> Unduh Template
                  </Button>
                  <label className="flex items-center justify-center w-full rounded-2xl bg-brand-deep text-white font-bold py-6 h-auto cursor-pointer shadow-lg transform hover:scale-[1.02] transition-all">
                    <Upload className="w-4 h-4 mr-2" /> Pilih File Excel
                    <input type="file" className="hidden" accept=".xlsx, .xls" />
                  </label>
                </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => { resetForm(); setIsAddDialogOpen(true); }}
                className="rounded-2xl bg-brand-deep hover:bg-brand-deep/90 shadow-lg shadow-brand-deep/20 px-8 py-6 h-auto transition-all duration-300"
              >
                <Plus className="w-5 h-5 mr-3" />
                <span className="font-bold">Tambah Guru</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl rounded-4xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-brand-deep">Tambah Guru Baru</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Isi data guru dengan lengkap. Email akan digunakan untuk login sistem.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-6 py-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-bold text-gray-700">Nama Lengkap</Label>
                  <Input id="name" className="rounded-xl border-gray-100" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-bold text-gray-700">Email (Username)</Label>
                  <Input id="email" className="rounded-xl border-gray-100" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nip" className="font-bold text-gray-700">NIP</Label>
                  <Input id="nip" className="rounded-xl border-gray-100" value={formData.nip} onChange={(e) => setFormData({ ...formData, nip: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender" className="font-bold text-gray-700">Jenis Kelamin</Label>
                  <Select value={formData.gender} onValueChange={(v) => setFormData({ ...formData, gender: v })}>
                    <SelectTrigger className="rounded-xl border-gray-100"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="MALE">Laki-laki</SelectItem>
                      <SelectItem value="FEMALE">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsAddDialogOpen(false)} className="rounded-xl font-bold">Batal</Button>
                <Button onClick={handleAddTeacher} className="rounded-xl bg-brand-deep px-8">Simpan Data</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="rounded-3xl border-none bg-indigo-50/50 p-6 shadow-sm">
           <p className="text-xs font-bold text-indigo-600 uppercase mb-2">Total Guru</p>
           <div className="text-3xl font-black text-brand-deep">{teachers.length}</div>
        </Card>
        <Card className="rounded-3xl border-none bg-emerald-50/50 p-6 shadow-sm">
           <p className="text-xs font-bold text-emerald-600 uppercase mb-2">Aktif</p>
           <div className="text-3xl font-black text-brand-deep">{teachers.filter(t => t.status === 'ACTIVE').length}</div>
        </Card>
        <Card className="rounded-3xl border-none bg-orange-50/50 p-6 shadow-sm">
           <p className="text-xs font-bold text-orange-600 uppercase mb-2">Nonaktif</p>
           <div className="text-3xl font-black text-brand-deep">{teachers.filter(t => t.status !== 'ACTIVE').length}</div>
        </Card>
        <Card className="rounded-3xl border-none bg-purple-50/50 p-6 shadow-sm">
           <p className="text-xs font-bold text-purple-600 uppercase mb-2">Posisi</p>
           <div className="text-3xl font-black text-brand-deep">Pendidik</div>
        </Card>
      </div>

      <div className="bg-gray-50/50 p-6 rounded-4xl border border-gray-100 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input 
              placeholder="Cari guru berdasarkan nama atau NIP..." 
              className="pl-12 py-6 rounded-2xl border-none bg-white shadow-sm focus-visible:ring-brand-purple/20 transition-all font-medium" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full md:w-56 py-6 rounded-2xl border-none bg-white shadow-sm font-bold text-brand-deep">
              <div className="flex items-center">
                <Filter className="w-4 h-4 mr-2 opacity-50" />
                <SelectValue placeholder="Filter Status" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-none shadow-xl">
              <SelectItem value="ALL">Semua Status</SelectItem>
              <SelectItem value="ACTIVE">Aktif</SelectItem>
              <SelectItem value="INACTIVE">Nonaktif</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-4xl border border-gray-100 overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="font-bold text-brand-deep px-8 py-5">Identitas Guru</TableHead>
              <TableHead className="font-bold text-brand-deep px-8 py-5">NIP</TableHead>
              <TableHead className="font-bold text-brand-deep px-8 py-5">Email</TableHead>
              <TableHead className="font-bold text-brand-deep px-8 py-5">Status</TableHead>
              <TableHead className="text-right font-bold text-brand-deep px-8 py-5">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20">
                  <Loader2 className="w-10 h-10 animate-spin mx-auto text-brand-purple" />
                  <p className="mt-4 text-gray-400 font-bold">Memuat Data Guru...</p>
                </TableCell>
              </TableRow>
            ) : teachers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20 text-gray-500 font-bold">
                  Data tidak ditemukan
                </TableCell>
              </TableRow>
            ) : (
              teachers.map((teacher) => (
                <TableRow key={teacher.id} className="hover:bg-gray-50/50 transition-colors border-gray-50">
                  <TableCell className="px-8 py-5">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-2xl bg-brand-deep/5 flex items-center justify-center text-brand-deep font-black text-xs uppercase">
                        {teacher.name.substring(0, 2)}
                      </div>
                      <div className="font-bold text-gray-900">{teacher.name}</div>
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-5 font-medium text-gray-500">{teacher.nip || '-'}</TableCell>
                  <TableCell className="px-8 py-5 text-gray-500">{teacher.email}</TableCell>
                  <TableCell className="px-8 py-5">
                    <Badge className={`rounded-lg px-3 py-1 border-none shadow-sm ${
                      teacher.status === 'ACTIVE' 
                        ? 'bg-emerald-50 text-emerald-600' 
                        : 'bg-red-50 text-red-600'
                    }`}>
                      {teacher.status === 'ACTIVE' ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right px-8 py-5">
                    <div className="flex items-center justify-end space-x-2">
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         onClick={() => openEditDialog(teacher)}
                         className="rounded-xl text-brand-purple hover:bg-brand-purple/5 transition-all"
                       >
                         <Edit className="w-4 h-4" />
                       </Button>
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         onClick={() => handleDeleteTeacher(teacher.id)}
                         className="rounded-xl text-red-500 hover:bg-red-50 transition-all"
                       >
                         <Trash2 className="w-4 h-4" />
                       </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl rounded-4xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-brand-deep">Edit Data Guru</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="font-bold text-gray-700">Nama Lengkap</Label>
              <Input id="edit-name" className="rounded-xl border-gray-100" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-nip" className="font-bold text-gray-700">NIP</Label>
              <Input id="edit-nip" className="rounded-xl border-gray-100" value={formData.nip} onChange={(e) => setFormData({ ...formData, nip: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status" className="font-bold text-gray-700">Status</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                <SelectTrigger className="rounded-xl border-gray-100"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="ACTIVE">Aktif</SelectItem>
                  <SelectItem value="INACTIVE">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)} className="rounded-xl font-bold">Batal</Button>
            <Button onClick={handleUpdateTeacher} className="rounded-xl bg-brand-deep px-8">Simpan Perubahan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
