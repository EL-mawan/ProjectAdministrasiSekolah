'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  Filter,
  Loader2,
  X,
  MapPin,
  TrendingUp,
  Users,
  FileSpreadsheet,
  FileDown
} from 'lucide-react'
import * as XLSX from 'xlsx'

interface Student {
  id: string
  nis: string
  nisn?: string
  name: string
  gender: 'MALE' | 'FEMALE'
  birthDate: string
  birthPlace: string
  address: string
  phone?: string
  email?: string
  // New Fields
  religion?: string
  familyStatus?: string
  childNumber?: number
  previousSchool?: string
  fatherName?: string
  motherName?: string
  fatherJob?: string
  motherJob?: string
  parentAddress?: string
  homePhone?: string
  photo?: string
  
  classId?: string
  status: 'ACTIVE' | 'GRADUATED' | 'TRANSFERRED' | 'DROPOUT'
  enrollmentDate: string
  class?: {
    id: string
    name: string
    level: string
  }
}

interface StudentsManagementProps {
  activeMenu: string
}

import { useDebounce } from '@/hooks/useDebounce'

export default function StudentsManagement({ activeMenu }: StudentsManagementProps) {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)
  const [filterClass, setFilterClass] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [schoolId, setSchoolId] = useState<string>('')
  const [classes, setClasses] = useState<any[]>([])
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [viewStudent, setViewStudent] = useState<Student | null>(null)

  const [formData, setFormData] = useState({
    nis: '',
    nisn: '',
    name: '',
    gender: '',
    birthDate: '',
    birthPlace: '',
    address: '',
    phone: '',
    email: '',
    classId: '',
    status: 'ACTIVE',
    // New Fields
    religion: '',
    familyStatus: '',
    childNumber: '',
    previousSchool: '',
    fatherName: '',
    motherName: '',
    fatherJob: '',
    motherJob: '',
    parentAddress: '',
    homePhone: '',
    photo: ''
  })

  // Load static data once
  useEffect(() => {
    fetchSchool()
    fetchClasses()
  }, [])

  // Load students when query changes
  useEffect(() => {
    // Only fetch if classes are loaded (unless searching/filtering explicitly)
    if (classes.length > 0 || search || filterClass) {
        fetchStudents()
    }
  }, [debouncedSearch, filterClass, filterStatus, currentPage, classes.length])

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

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes')
      const data = await response.json()
      if (response.ok) {
        setClasses(data.classes)
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
    }
  }

  const fetchStudents = async () => {
    try {
      setLoading(true)
      
      // Class-based Pagination Logic
      // If specific class filter is ON, use it and show 1 page.
      // If NO filter, use currentPage to validly select 1 class from the list.
      let targetClassId = filterClass
      
      if (!filterClass && classes.length > 0) {
        // Enforce range
        const validIndex = Math.min(Math.max(0, currentPage - 1), classes.length - 1)
        targetClassId = classes[validIndex].id
      }

      const params = new URLSearchParams({
        page: '1', // Always page 1 for the API since we want *all* items of that class
        limit: '200', // Large limit to show all students
        ...(search && { search }),
        ...(targetClassId && { classId: targetClassId }),
        ...(filterStatus && { status: filterStatus })
      })

      const response = await fetch(`/api/students?${params}`)
      const data = await response.json()

      if (response.ok) {
        setStudents(data.students)
        // If filtering manually, 1 page. Else pages = total classes
        setTotalPages(filterClass ? 1 : classes.length)
      } else {
        console.error('Error fetching students:', data.error)
      }
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddStudent = async () => {
    if (!schoolId) {
      alert('School ID tidak ditemukan. Silakan refresh halaman.')
      return
    }

    try {
      const response = await fetch('/api/students', {
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
        fetchStudents()
        alert('Data siswa berhasil ditambahkan')
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error adding student:', error)
      alert('Terjadi kesalahan server')
    }
  }

  const handleEditStudent = async () => {
    if (!selectedStudent) return

    try {
      const response = await fetch(`/api/students/${selectedStudent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setIsEditDialogOpen(false)
        resetForm()
        fetchStudents()
        alert('Data siswa berhasil diperbarui')
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error updating student:', error)
      alert('Terjadi kesalahan server')
    }
  }

  const handleDeleteStudent = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data siswa ini?')) return

    try {
      const response = await fetch(`/api/students/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        fetchStudents()
        alert('Data siswa berhasil dihapus')
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error deleting student:', error)
      alert('Terjadi kesalahan server')
    }
  }

  const handleExport = () => {
    if (students.length === 0) return
    
    const headers = ['NIS', 'NISN', 'Nama', 'L/P', 'Alamat', 'Status']
    const rows = students.map(s => [
      s.nis, 
      s.nisn || '', 
      s.name, 
      s.gender === 'MALE' ? 'L' : 'P',
      s.address,
      s.status
    ])
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "data_siswa.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleImport = () => {
    alert('Fitur Import Excel akan tersedia pada update mendatang.')
  }

  const resetForm = () => {
    setFormData({
      nis: '',
      nisn: '',
      name: '',
      gender: '',
      birthDate: '',
      birthPlace: '',
      address: '',
      phone: '',
      email: '',
      classId: '',
      status: 'ACTIVE',
      religion: '',
      familyStatus: '',
      childNumber: '',
      previousSchool: '',
      fatherName: '',
      motherName: '',
      fatherJob: '',
      motherJob: '',
      parentAddress: '',
      homePhone: '',
      photo: ''
    })
    setSelectedStudent(null)
  }

  const openEditDialog = (student: Student) => {
    setSelectedStudent(student)
    setFormData({
      nis: student.nis,
      nisn: student.nisn || '',
      name: student.name,
      gender: student.gender,
      birthDate: student.birthDate.split('T')[0],
      birthPlace: student.birthPlace,
      address: student.address,
      phone: student.phone || '',
      email: student.email || '',
      classId: student.classId || '',
      status: student.status,
      religion: student.religion || '',
      familyStatus: student.familyStatus || '',
      childNumber: student.childNumber?.toString() || '',
      previousSchool: student.previousSchool || '',
      fatherName: student.fatherName || '',
      motherName: student.motherName || '',
      fatherJob: student.fatherJob || '',
      motherJob: student.motherJob || '',
      parentAddress: student.parentAddress || '',
      homePhone: student.homePhone || '',
      photo: student.photo || ''
    })
    setIsEditDialogOpen(true)
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert('Ukuran foto maksimal 2MB')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'ACTIVE': 'default',
      'GRADUATED': 'secondary',
      'TRANSFERRED': 'outline',
      'DROPOUT': 'destructive'
    }
    
    const labels: Record<string, string> = {
      'ACTIVE': 'Aktif',
      'GRADUATED': 'Lulus',
      'TRANSFERRED': 'Pindah',
      'DROPOUT': 'Keluar'
    }

    return (
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    )
  }

  const [isImportOpen, setIsImportOpen] = useState(false)

  const handleImportExcel = () => {
    setIsImportOpen(true)
  }

  const handleDownloadTemplate = () => {
    const headers = [
      {
        'NIS': '',
        'NISN': '',
        'Nama Lengkap': '',
        'L/P (Laki-laki/Perempuan)': '',
        'Tempat Lahir': '',
        'Tanggal Lahir (YYYY-MM-DD)': '',
        'Agama': '',
        'Status dalam Keluarga': '',
        'Anak Ke-': '',
        'Alamat': '',
        'Sekolah Asal': '',
        'Nama Ayah': '',
        'Pekerjaan Ayah': '',
        'Nama Ibu': '',
        'Pekerjaan Ibu': '',
        'Alamat Orang Tua': '',
        'No. Telepon HP': '',
        'Telepon Rumah': ''
      }
    ]

    const worksheet = XLSX.utils.json_to_sheet(headers)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template Siswa")
    
    // Set column widths
    const wscols = [
      {wch: 15}, {wch: 15}, {wch: 30}, {wch: 5}, {wch: 20}, {wch: 20},
      {wch: 15}, {wch: 20}, {wch: 10}, {wch: 40}, {wch: 30}, {wch: 25},
      {wch: 20}, {wch: 25}, {wch: 20}, {wch: 40}, {wch: 15}, {wch: 15}
    ]
    worksheet['!cols'] = wscols

    XLSX.writeFile(workbook, "Template_Data_Siswa.xlsx")
  }

  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      alert(`Berhasil mengunggah: ${e.target.files[0].name}. Memproses data...`)
      setIsImportOpen(false)
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
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-extrabold text-brand-deep">Database Siswa</h1>
          <p className="text-gray-400 text-sm md:text-base font-medium">Kelola dan pantau data profil seluruh siswa secara terpusat</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="rounded-2xl border-gray-100 hover:bg-gray-50 font-bold px-6 py-6 h-auto transition-all" onClick={handleImportExcel}>
            <Upload className="w-5 h-5 mr-3 text-brand-purple" />
            Import Excel
          </Button>

          <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
            <DialogContent className="max-w-md rounded-[2.5rem] p-8 border-none overflow-hidden text-center">
              <DialogHeader className="flex flex-col items-center">
                <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-brand-purple mb-6 shadow-sm">
                  <FileSpreadsheet className="w-10 h-10" />
                </div>
                <DialogTitle className="text-2xl font-black text-brand-deep mb-2">Import Data Siswa</DialogTitle>
                <DialogDescription className="text-gray-400 text-sm font-medium">
                  Unggah file Excel (.xlsx) untuk menambahkan data siswa secara massal ke database sekolah.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 pt-6">
                
                <div className="space-y-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={handleDownloadTemplate}
                    className="w-full rounded-2xl border-indigo-100 text-indigo-600 font-bold py-6 h-auto hover:bg-indigo-50"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Unduh Template Excel
                  </Button>
                  
                  <div className="relative group">
                    <input
                      type="file"
                      id="excel-upload"
                      accept=".xlsx, .xls"
                      onChange={handleUploadFile}
                      className="hidden"
                    />
                    <label
                      htmlFor="excel-upload"
                      className="flex items-center justify-center w-full rounded-2xl bg-brand-deep text-white font-bold py-6 h-auto cursor-pointer shadow-lg shadow-brand-deep/20 hover:bg-brand-deep/90 transition-all transform group-hover:scale-[1.02]"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Pilih & Unggah File
                    </label>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" className="rounded-2xl border-gray-100 hover:bg-gray-50 font-bold px-6 py-6 h-auto transition-all" onClick={handleExport}>
            <Download className="w-5 h-5 mr-3 text-brand-purple" />
            Export Data
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="w-full md:w-auto rounded-2xl bg-brand-deep hover:bg-brand-deep/90 shadow-lg shadow-brand-deep/20 px-8 py-6 h-auto transition-all transform hover:scale-105 active:scale-95">
                <Plus className="w-5 h-5 mr-3" />
                <span className="font-bold">Tambah Siswa</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl w-[95vw] rounded-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-brand-deep">Pendaftaran Siswa Baru</DialogTitle>
                <DialogDescription className="font-medium text-gray-400">Pastikan data yang dimasukkan sudah sesuai dengan dokumen resmi siswa</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 font-medium max-h-[60vh] overflow-y-auto pr-4">
                {/* Photo Upload */}
                <div className="md:col-span-2 flex flex-col items-center justify-center mb-4">
                   <div className="w-32 h-40 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative group cursor-pointer mb-2">
                      {formData.photo ? (
                        <img src={formData.photo} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center text-gray-400">
                           <Upload className="w-8 h-8 mx-auto mb-2" />
                           <span className="text-xs font-bold">Foto 3x4</span>
                        </div>
                      )}
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                   </div>
                   <p className="text-xs text-gray-400 font-bold">Klik untuk unggah foto (Maks 2MB)</p>
                </div>

                <div className="md:col-span-2"><h3 className="font-extrabold text-brand-deep border-b pb-2 mb-2">1. Identitas Pribadi</h3></div>

                <div className="space-y-2">
                  <Label className="font-bold text-gray-700">Nama Lengkap *</Label>
                  <Input className="rounded-xl border-gray-100 py-6 px-4" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Nama Lengkap Siswa" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold text-gray-700">NIS *</Label>
                    <Input className="rounded-xl border-gray-100 py-6 px-4" value={formData.nis} onChange={e => setFormData({ ...formData, nis: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-gray-700">NISN</Label>
                    <Input className="rounded-xl border-gray-100 py-6 px-4" value={formData.nisn} onChange={e => setFormData({ ...formData, nisn: e.target.value })} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold text-gray-700">Tempat Lahir *</Label>
                  <Input className="rounded-xl border-gray-100 py-6 px-4" value={formData.birthPlace} onChange={e => setFormData({ ...formData, birthPlace: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-gray-700">Tanggal Lahir *</Label>
                  <Input className="rounded-xl border-gray-100 py-6 px-4" type="date" value={formData.birthDate} onChange={e => setFormData({ ...formData, birthDate: e.target.value })} />
                </div>

                <div className="space-y-2">
                  <Label className="font-bold text-gray-700">Jenis Kelamin *</Label>
                  <Select value={formData.gender} onValueChange={value => setFormData({ ...formData, gender: value })}>
                    <SelectTrigger className="rounded-xl border-gray-100 py-6 px-4"><SelectValue placeholder="Pilih Gender" /></SelectTrigger>
                    <SelectContent className="rounded-xl"><SelectItem value="MALE">Laki-laki</SelectItem><SelectItem value="FEMALE">Perempuan</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                   <Label className="font-bold text-gray-700">Agama</Label>
                   <Select value={formData.religion} onValueChange={value => setFormData({ ...formData, religion: value })}>
                      <SelectTrigger className="rounded-xl border-gray-100 py-6 px-4"><SelectValue placeholder="Pilih Agama" /></SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="Islam">Islam</SelectItem>
                        <SelectItem value="Kristen">Kristen</SelectItem>
                        <SelectItem value="Katolik">Katolik</SelectItem>
                        <SelectItem value="Hindu">Hindu</SelectItem>
                        <SelectItem value="Buddha">Buddha</SelectItem>
                        <SelectItem value="Konghucu">Konghucu</SelectItem>
                      </SelectContent>
                   </Select>
                </div>

                <div className="space-y-2">
                   <Label className="font-bold text-gray-700">Status dalam Keluarga</Label>
                   <Input className="rounded-xl border-gray-100 py-6 px-4" value={formData.familyStatus} onChange={e => setFormData({ ...formData, familyStatus: e.target.value })} placeholder="Contoh: Anak Kandung" />
                </div>
                <div className="space-y-2">
                   <Label className="font-bold text-gray-700">Anak ke-</Label>
                   <Input type="number" className="rounded-xl border-gray-100 py-6 px-4" value={formData.childNumber} onChange={e => setFormData({ ...formData, childNumber: e.target.value })} />
                </div>

                <div className="md:col-span-2"><h3 className="font-extrabold text-brand-deep border-b pb-2 mb-2 mt-4">2. Kontak & Alamat</h3></div>

                <div className="md:col-span-2 space-y-2">
                  <Label className="font-bold text-gray-700">Alamat Peserta Didik *</Label>
                  <Input className="rounded-xl border-gray-100 py-6 px-4" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-gray-700">Nomor Telepon HP</Label>
                  <Input className="rounded-xl border-gray-100 py-6 px-4" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-gray-700">Telepon Rumah</Label>
                  <Input className="rounded-xl border-gray-100 py-6 px-4" value={formData.homePhone} onChange={e => setFormData({ ...formData, homePhone: e.target.value })} />
                </div>

                <div className="md:col-span-2"><h3 className="font-extrabold text-brand-deep border-b pb-2 mb-2 mt-4">3. Data Akademik</h3></div>

                <div className="space-y-2">
                   <Label className="font-bold text-gray-700">Sekolah Asal</Label>
                   <Input className="rounded-xl border-gray-100 py-6 px-4" value={formData.previousSchool} onChange={e => setFormData({ ...formData, previousSchool: e.target.value })} placeholder="Nama Sekolah Sebelumnya" />
                </div>
                 <div className="space-y-2">
                  <Label className="font-bold text-gray-700">Kelas Saat Ini</Label>
                  <Select value={formData.classId} onValueChange={value => setFormData({ ...formData, classId: value })}>
                    <SelectTrigger className="rounded-xl border-gray-100 py-6 px-4"><SelectValue placeholder="Pilih Kelas" /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {classes.map(c => (<SelectItem key={c.id} value={c.id!}>{c.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-gray-700">Status Siswa</Label>
                  <Select value={formData.status} onValueChange={value => setFormData({ ...formData, status: value })}>
                    <SelectTrigger className="rounded-xl border-gray-100 py-6 px-4"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="ACTIVE">Aktif Belajar</SelectItem>
                      <SelectItem value="GRADUATED">Telah Lulus</SelectItem>
                      <SelectItem value="TRANSFERRED">Pindah Sekolah</SelectItem>
                      <SelectItem value="DROPOUT">Keluar (DO)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2"><h3 className="font-extrabold text-brand-deep border-b pb-2 mb-2 mt-4">4. Data Orang Tua</h3></div>

                <div className="space-y-2">
                   <Label className="font-bold text-gray-700">Nama Ayah</Label>
                   <Input className="rounded-xl border-gray-100 py-6 px-4" value={formData.fatherName} onChange={e => setFormData({ ...formData, fatherName: e.target.value })} />
                </div>
                <div className="space-y-2">
                   <Label className="font-bold text-gray-700">Pekerjaan Ayah</Label>
                   <Input className="rounded-xl border-gray-100 py-6 px-4" value={formData.fatherJob} onChange={e => setFormData({ ...formData, fatherJob: e.target.value })} />
                </div>
                <div className="space-y-2">
                   <Label className="font-bold text-gray-700">Nama Ibu</Label>
                   <Input className="rounded-xl border-gray-100 py-6 px-4" value={formData.motherName} onChange={e => setFormData({ ...formData, motherName: e.target.value })} />
                </div>
                <div className="space-y-2">
                   <Label className="font-bold text-gray-700">Pekerjaan Ibu</Label>
                   <Input className="rounded-xl border-gray-100 py-6 px-4" value={formData.motherJob} onChange={e => setFormData({ ...formData, motherJob: e.target.value })} />
                </div>
                <div className="md:col-span-2 space-y-2">
                   <Label className="font-bold text-gray-700">Alamat Orang Tua</Label>
                   <Input className="rounded-xl border-gray-100 py-6 px-4" value={formData.parentAddress} onChange={e => setFormData({ ...formData, parentAddress: e.target.value })} placeholder="Samakan jika tinggal bersama" />
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="ghost" onClick={() => setIsAddDialogOpen(false)} className="rounded-xl font-bold">Batal</Button>
                <Button onClick={handleAddStudent} className="rounded-xl bg-brand-deep px-8 font-bold">Simpan Data Siswa</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Summary Area */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <Card className="rounded-3xl border-none bg-brand-deep/5 p-6 shadow-sm border border-brand-deep/10">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-brand-deep uppercase tracking-widest mb-2">Total Siswa</span>
            <div className="text-3xl font-black text-brand-deep">{students.length}</div>
            <p className="text-[10px] text-gray-400 font-medium mt-1 font-bold">Siswa terdaftar aktif</p>
          </div>
        </Card>
        <Card className="rounded-3xl border-none bg-brand-purple/5 p-6 shadow-sm border border-brand-purple/10">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-brand-purple uppercase tracking-widest mb-2">Laki-Laki</span>
            <div className="text-3xl font-black text-brand-deep">{students.filter(s => s.gender === 'MALE').length}</div>
            <p className="text-[10px] text-gray-400 font-medium mt-1 font-bold">Total siswa pria</p>
          </div>
        </Card>
        <Card className="rounded-3xl border-none bg-brand-pink/5 p-6 shadow-sm border border-brand-pink/10">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-brand-pink uppercase tracking-widest mb-2">Perempuan</span>
            <div className="text-3xl font-black text-brand-deep">{students.filter(s => s.gender === 'FEMALE').length}</div>
            <p className="text-[10px] text-gray-400 font-medium mt-1 font-bold">Total siswa wanita</p>
          </div>
        </Card>
        <Card className="rounded-3xl border-none bg-emerald-50/50 p-6 shadow-sm border border-emerald-100/50">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Status Aktif</span>
            <div className="text-3xl font-black text-brand-deep">{students.filter(s => s.status === 'ACTIVE').length}</div>
            <p className="text-[10px] text-gray-400 font-medium mt-1 font-bold">Terupdate hari ini</p>
          </div>
        </Card>
      </div>

      {/* Filter Section */}
      <div className="bg-gray-50/50 rounded-4xl p-6 mb-8 border border-gray-100 flex flex-col lg:flex-row gap-4 items-center">
        <div className="flex-1 w-full relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Cari siswa berdasarkan nama atau nomor induk..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-12 rounded-2xl border-none bg-white shadow-sm font-medium py-6 h-auto"
          />
        </div>
        <div className="flex gap-4 w-full lg:w-auto">
          <Select value={filterClass} onValueChange={setFilterClass}>
            <SelectTrigger className="w-[180px] rounded-2xl border-none bg-white shadow-sm py-6 h-auto font-bold text-gray-500">
               <div className="flex items-center"><Filter className="w-4 h-4 mr-2" /><SelectValue placeholder="Pilih Kelas" /></div>
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {classes.map(c => (<SelectItem key={c.id} value={c.id!}>{c.name}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px] rounded-2xl border-none bg-white shadow-sm py-6 h-auto font-bold text-gray-500">
               <SelectValue placeholder="Status Siswa" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="ACTIVE">Aktif</SelectItem>
              <SelectItem value="GRADUATED">Lulus</SelectItem>
              <SelectItem value="TRANSFERRED">Pindah</SelectItem>
              <SelectItem value="DROPOUT">Keluar</SelectItem>
            </SelectContent>
          </Select>
          {(search || filterClass || filterStatus) && (
            <Button variant="ghost" onClick={() => { setSearch(''); setFilterClass(''); setFilterStatus(''); }} className="rounded-2xl text-red-500 font-bold px-6">
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Main Table Content */}
      <div className="rounded-3xl md:rounded-4xl border border-gray-100 overflow-x-auto shadow-sm bg-white scrollbar-hide">
        <div className="min-w-[800px]">
          <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="font-bold text-brand-deep px-8 py-5">Siswa</TableHead>
              <TableHead className="font-bold text-brand-deep px-8 py-5">NIS/NISN</TableHead>
              <TableHead className="font-bold text-brand-deep px-8 py-5">Tempat, Tgl Lahir</TableHead>
              <TableHead className="font-bold text-brand-deep px-8 py-5">Gender & Agama</TableHead>
              <TableHead className="font-bold text-brand-deep px-8 py-5">Orang Tua (Ibu)</TableHead>
              <TableHead className="font-bold text-brand-deep px-8 py-5">Alamat</TableHead>
              <TableHead className="font-bold text-brand-deep px-8 py-5 text-center">Status</TableHead>
              <TableHead className="text-right font-bold text-brand-deep px-8 py-5">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length === 0 ? (
               <TableRow><TableCell colSpan={6} className="text-center py-20 font-bold text-gray-400">Tidak ada data siswa ditemukan</TableCell></TableRow>
            ) : students.map((student) => (
              <TableRow key={student.id} className="hover:bg-gray-50/50 transition-colors border-gray-50">
                <TableCell className="px-8 py-5">
                   <div className="flex items-center space-x-4 min-w-[200px]">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md ${student.gender === 'MALE' ? 'bg-indigo-400 shadow-indigo-100' : 'bg-pink-400 shadow-pink-100'}`}>
                         {student.name.substring(0, 1)}
                      </div>
                      <div>
                         <p className="font-bold text-gray-900 leading-none mb-1 text-sm">{student.name}</p>
                         <p className="text-[10px] text-brand-purple font-black uppercase tracking-tight">{student.class?.name || 'Tanpa Kelas'}</p>
                      </div>
                   </div>
                </TableCell>
                <TableCell className="px-8 py-5 min-w-[140px]">
                   <p className="text-sm font-bold text-gray-700">{student.nis}</p>
                   <p className="text-[10px] text-gray-400 font-medium">{student.nisn || '-'}</p>
                </TableCell>
                <TableCell className="px-8 py-5 min-w-[200px]">
                   <p className="text-sm font-bold text-gray-700">{student.birthPlace}</p>
                   <p className="text-[10px] text-gray-400 font-medium">{new Date(student.birthDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </TableCell>
                <TableCell className="px-8 py-5 min-w-[150px]">
                   <div className="flex flex-col space-y-1">
                      <Badge variant="outline" className={`w-fit rounded-lg border-none text-[9px] font-black uppercase px-2 py-0.5 ${student.gender === 'MALE' ? 'bg-indigo-50 text-indigo-600' : 'bg-pink-50 text-pink-600'}`}>
                         {student.gender === 'MALE' ? 'Laki-laki' : 'Perempuan'}
                      </Badge>
                      <span className="text-[10px] font-bold text-gray-500 pl-1">{student.religion || '-'}</span>
                   </div>
                </TableCell>
                <TableCell className="px-8 py-5 min-w-[150px]">
                   <div className="flex items-center space-x-2">
                       <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                          <Users className="w-4 h-4 text-gray-400" />
                       </div>
                       <div>
                          <p className="text-xs font-bold text-gray-700 leading-none mb-1">{student.motherName || '-'}</p>
                          <p className="text-[10px] text-gray-400 font-medium italic">Ibu Kandung</p>
                       </div>
                   </div>
                </TableCell>
                <TableCell className="px-8 py-5 min-w-[250px]">
                   <div className="flex items-start space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-brand-purple mt-0.5" />
                      <p className="text-[11px] font-medium text-gray-600 leading-relaxed line-clamp-2">{student.address}</p>
                   </div>
                </TableCell>
                <TableCell className="px-8 py-5 text-center">
                   <div className="flex flex-col items-center justify-center">
                      {getStatusBadge(student.status)}
                   </div>
                </TableCell>
                <TableCell className="text-right px-8 py-5">
                   <div className="flex justify-end space-x-3">
                      <Button variant="ghost" size="icon" className="rounded-xl hover:bg-gray-100 text-gray-400 hover:text-brand-deep" onClick={() => { setViewStudent(student); setIsViewDialogOpen(true); }}>
                        <Eye className="w-5 h-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="rounded-xl hover:bg-indigo-50 text-gray-400 hover:text-indigo-600" onClick={() => openEditDialog(student)}>
                        <Edit className="w-5 h-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500" onClick={() => handleDeleteStudent(student.id)}>
                        <Trash2 className="w-5 h-5" />
                      </Button>
                   </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl rounded-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-brand-deep">Edit Profil Siswa</DialogTitle>
            <DialogDescription className="font-medium text-gray-400">Pembaruan data akademis dan data diri siswa</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 font-medium max-h-[60vh] overflow-y-auto pr-4">
                {/* Photo Upload */}
                <div className="md:col-span-2 flex flex-col items-center justify-center mb-4">
                   <div className="w-32 h-40 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative group cursor-pointer mb-2">
                      {formData.photo ? (
                        <img src={formData.photo} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center text-gray-400">
                           <Upload className="w-8 h-8 mx-auto mb-2" />
                           <span className="text-xs font-bold">Foto 3x4</span>
                        </div>
                      )}
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                   </div>
                   <p className="text-xs text-gray-400 font-bold">Klik untuk ubah foto (Maks 2MB)</p>
                </div>

                <div className="md:col-span-2"><h3 className="font-extrabold text-brand-deep border-b pb-2 mb-2">1. Identitas Pribadi</h3></div>

                <div className="space-y-2">
                  <Label className="font-bold text-gray-700">Nama Lengkap *</Label>
                  <Input className="rounded-xl border-gray-100 py-6 px-4" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Nama Lengkap Siswa" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold text-gray-700">NIS *</Label>
                    <Input className="rounded-xl border-gray-100 py-6 px-4" value={formData.nis} onChange={e => setFormData({ ...formData, nis: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-gray-700">NISN</Label>
                    <Input className="rounded-xl border-gray-100 py-6 px-4" value={formData.nisn} onChange={e => setFormData({ ...formData, nisn: e.target.value })} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold text-gray-700">Tempat Lahir *</Label>
                  <Input className="rounded-xl border-gray-100 py-6 px-4" value={formData.birthPlace} onChange={e => setFormData({ ...formData, birthPlace: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-gray-700">Tanggal Lahir *</Label>
                  <Input className="rounded-xl border-gray-100 py-6 px-4" type="date" value={formData.birthDate} onChange={e => setFormData({ ...formData, birthDate: e.target.value })} />
                </div>

                <div className="space-y-2">
                  <Label className="font-bold text-gray-700">Jenis Kelamin *</Label>
                  <Select value={formData.gender} onValueChange={value => setFormData({ ...formData, gender: value })}>
                    <SelectTrigger className="rounded-xl border-gray-100 py-6 px-4"><SelectValue placeholder="Pilih Gender" /></SelectTrigger>
                    <SelectContent className="rounded-xl"><SelectItem value="MALE">Laki-laki</SelectItem><SelectItem value="FEMALE">Perempuan</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                   <Label className="font-bold text-gray-700">Agama</Label>
                   <Select value={formData.religion} onValueChange={value => setFormData({ ...formData, religion: value })}>
                      <SelectTrigger className="rounded-xl border-gray-100 py-6 px-4"><SelectValue placeholder="Pilih Agama" /></SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="Islam">Islam</SelectItem>
                        <SelectItem value="Kristen">Kristen</SelectItem>
                        <SelectItem value="Katolik">Katolik</SelectItem>
                        <SelectItem value="Hindu">Hindu</SelectItem>
                        <SelectItem value="Buddha">Buddha</SelectItem>
                        <SelectItem value="Konghucu">Konghucu</SelectItem>
                      </SelectContent>
                   </Select>
                </div>

                <div className="space-y-2">
                   <Label className="font-bold text-gray-700">Status dalam Keluarga</Label>
                   <Input className="rounded-xl border-gray-100 py-6 px-4" value={formData.familyStatus} onChange={e => setFormData({ ...formData, familyStatus: e.target.value })} placeholder="Contoh: Anak Kandung" />
                </div>
                <div className="space-y-2">
                   <Label className="font-bold text-gray-700">Anak ke-</Label>
                   <Input type="number" className="rounded-xl border-gray-100 py-6 px-4" value={formData.childNumber} onChange={e => setFormData({ ...formData, childNumber: e.target.value })} />
                </div>

                <div className="md:col-span-2"><h3 className="font-extrabold text-brand-deep border-b pb-2 mb-2 mt-4">2. Kontak & Alamat</h3></div>

                <div className="md:col-span-2 space-y-2">
                  <Label className="font-bold text-gray-700">Alamat Peserta Didik *</Label>
                  <Input className="rounded-xl border-gray-100 py-6 px-4" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-gray-700">Nomor Telepon HP</Label>
                  <Input className="rounded-xl border-gray-100 py-6 px-4" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-gray-700">Telepon Rumah</Label>
                  <Input className="rounded-xl border-gray-100 py-6 px-4" value={formData.homePhone} onChange={e => setFormData({ ...formData, homePhone: e.target.value })} />
                </div>

                <div className="md:col-span-2"><h3 className="font-extrabold text-brand-deep border-b pb-2 mb-2 mt-4">3. Data Akademik</h3></div>

                <div className="space-y-2">
                   <Label className="font-bold text-gray-700">Sekolah Asal</Label>
                   <Input className="rounded-xl border-gray-100 py-6 px-4" value={formData.previousSchool} onChange={e => setFormData({ ...formData, previousSchool: e.target.value })} placeholder="Nama Sekolah Sebelumnya" />
                </div>
                 <div className="space-y-2">
                  <Label className="font-bold text-gray-700">Kelas Saat Ini</Label>
                  <Select value={formData.classId} onValueChange={value => setFormData({ ...formData, classId: value })}>
                    <SelectTrigger className="rounded-xl border-gray-100 py-6 px-4"><SelectValue placeholder="Pilih Kelas" /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {classes.map(c => (<SelectItem key={c.id} value={c.id!}>{c.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-gray-700">Status Siswa</Label>
                  <Select value={formData.status} onValueChange={value => setFormData({ ...formData, status: value })}>
                    <SelectTrigger className="rounded-xl border-gray-100 py-6 px-4"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="ACTIVE">Aktif Belajar</SelectItem>
                      <SelectItem value="GRADUATED">Telah Lulus</SelectItem>
                      <SelectItem value="TRANSFERRED">Pindah Sekolah</SelectItem>
                      <SelectItem value="DROPOUT">Keluar (DO)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2"><h3 className="font-extrabold text-brand-deep border-b pb-2 mb-2 mt-4">4. Data Orang Tua</h3></div>

                <div className="space-y-2">
                   <Label className="font-bold text-gray-700">Nama Ayah</Label>
                   <Input className="rounded-xl border-gray-100 py-6 px-4" value={formData.fatherName} onChange={e => setFormData({ ...formData, fatherName: e.target.value })} />
                </div>
                <div className="space-y-2">
                   <Label className="font-bold text-gray-700">Pekerjaan Ayah</Label>
                   <Input className="rounded-xl border-gray-100 py-6 px-4" value={formData.fatherJob} onChange={e => setFormData({ ...formData, fatherJob: e.target.value })} />
                </div>
                <div className="space-y-2">
                   <Label className="font-bold text-gray-700">Nama Ibu</Label>
                   <Input className="rounded-xl border-gray-100 py-6 px-4" value={formData.motherName} onChange={e => setFormData({ ...formData, motherName: e.target.value })} />
                </div>
                <div className="space-y-2">
                   <Label className="font-bold text-gray-700">Pekerjaan Ibu</Label>
                   <Input className="rounded-xl border-gray-100 py-6 px-4" value={formData.motherJob} onChange={e => setFormData({ ...formData, motherJob: e.target.value })} />
                </div>
                <div className="md:col-span-2 space-y-2">
                   <Label className="font-bold text-gray-700">Alamat Orang Tua</Label>
                   <Input className="rounded-xl border-gray-100 py-6 px-4" value={formData.parentAddress} onChange={e => setFormData({ ...formData, parentAddress: e.target.value })} placeholder="Samakan jika tinggal bersama" />
                </div>
              </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)} className="rounded-xl font-bold">Batal Ubah</Button>
            <Button onClick={handleEditStudent} className="rounded-xl bg-brand-deep px-8 font-bold">Simpan Perubahan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pagination Container */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-6 mt-12 bg-white p-4 rounded-3xl shadow-sm border border-gray-50 w-fit mx-auto">
          <Button
            variant="ghost"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="rounded-2xl font-bold text-brand-deep disabled:opacity-30"
          >
            Kembali
          </Button>
          <div className="flex items-center font-black text-brand-deep">
             <span className="text-brand-purple">
                {!filterClass && classes[currentPage - 1] 
                  ? classes[currentPage - 1].name 
                  : `Halaman ${currentPage}`}
             </span>
             <span className="mx-2 text-gray-300">/</span>
             <span className="text-gray-400">{totalPages} Kelas</span>
          </div>
          <Button
            variant="ghost"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="rounded-2xl font-bold text-brand-deep disabled:opacity-30"
          >
            Lanjut
          </Button>
        </div>
      )}
      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-xl rounded-4xl p-0 overflow-hidden border-none shadow-3xl">
          <DialogHeader className="hidden">
             <DialogTitle>{viewStudent?.name || 'Detail Siswa'}</DialogTitle>
             <DialogDescription>Detail informasi profil siswa</DialogDescription>
          </DialogHeader>
          <div className="bg-brand-deep p-8 text-white relative overflow-hidden">
             <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
             <div className="relative z-10 flex gap-6 items-center">
                <div className="w-24 h-32 bg-white rounded-xl overflow-hidden shadow-lg shrink-0">
                  {viewStudent?.photo ? (
                    <img src={viewStudent.photo} alt={viewStudent.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                      <Users className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div>
                  <Badge className="bg-white/20 text-white border-none rounded-lg px-3 py-1 mb-2 font-bold">Profil Siswa</Badge>
                  <h2 className="text-2xl font-black mb-1 leading-tight">{viewStudent?.name}</h2>
                  <p className="text-indigo-100 font-medium opacity-80 text-sm">{viewStudent?.nis} / {viewStudent?.nisn || '-'} • {viewStudent?.class?.name || 'Tanpa Kelas'}</p>
                </div>
             </div>
          </div>
          <div className="p-8 space-y-6 bg-white max-h-[60vh] overflow-y-auto">
            {viewStudent && (
              <>
                <div>
                   <h4 className="text-xs font-black text-brand-purple uppercase tracking-widest mb-4 border-b pb-2">Identitas Pribadi</h4>
                   <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">TTL</p>
                        <p className="font-bold text-gray-800 text-sm">{viewStudent.birthPlace}, {new Date(viewStudent.birthDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Jenis Kelamin</p>
                        <p className="font-bold text-gray-800 text-sm">{viewStudent.gender === 'MALE' ? 'Laki-laki' : 'Perempuan'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Agama</p>
                        <p className="font-bold text-gray-800 text-sm">{viewStudent.religion || '-'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Anak Ke-</p>
                        <p className="font-bold text-gray-800 text-sm">{viewStudent.childNumber ? `${viewStudent.childNumber} (${viewStudent.familyStatus || '-'})` : '-'}</p>
                      </div>
                   </div>
                </div>

                <div>
                   <h4 className="text-xs font-black text-brand-purple uppercase tracking-widest mb-4 border-b pb-2">Kontak & Sekolah</h4>
                   <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                      <div className="md:col-span-2 space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Alamat</p>
                        <p className="font-bold text-gray-800 text-sm">{viewStudent.address}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Telepon</p>
                        <p className="font-bold text-gray-800 text-sm">{viewStudent.phone || '-'} / {viewStudent.homePhone || '-'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sekolah Asal</p>
                        <p className="font-bold text-gray-800 text-sm">{viewStudent.previousSchool || '-'}</p>
                      </div>
                   </div>
                </div>
                
                <div>
                  <h4 className="text-xs font-black text-brand-purple uppercase tracking-widest mb-4 border-b pb-2">Data Orang Tua</h4>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ayah</p>
                      <p className="font-bold text-gray-800 text-sm">{viewStudent.fatherName || '-'}</p>
                      <p className="text-xs text-gray-500">{viewStudent.fatherJob}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ibu</p>
                      <p className="font-bold text-gray-800 text-sm">{viewStudent.motherName || '-'}</p>
                      <p className="text-xs text-gray-500">{viewStudent.motherJob}</p>
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Alamat Orang Tua</p>
                      <p className="font-bold text-gray-800 text-sm">{viewStudent.parentAddress || '-'}</p>
                    </div>
                  </div>
                </div>
              </>
            )}
            <div className="flex justify-end pt-4">
              <Button onClick={() => setIsViewDialogOpen(false)} className="rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold px-8 border-none h-auto py-4">Tutup Detail</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}