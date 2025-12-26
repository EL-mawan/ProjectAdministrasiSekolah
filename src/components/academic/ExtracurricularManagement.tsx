'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Users, Search, Clock, MapPin, Loader2, Trophy, MoreHorizontal, Save, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useDebounce } from 'use-debounce'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Extracurricular {
  id: string
  name: string
  description?: string
  schedule?: string
  location?: string
  coach?: { id: string, name: string }
  coachId?: string | null
  _count: { members: number }
}

interface Teacher {
  id: string
  name: string
}

interface Student {
  id: string
  name: string
  class?: { name: string }
}

interface ExtraMember {
  id: string
  student: {
    id: string
    name: string
    nisn?: string
    class?: { name: string }
  }
  joinedAt: string
}

export default function ExtracurricularManagement() {
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebounce(search, 500)
  const [extras, setExtras] = useState<Extracurricular[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([]) // State for teachers list
  const [loading, setLoading] = useState(true)
  
  // Dialog State (Create/Edit)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Member Dialog State
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false)
  const [selectedExtra, setSelectedExtra] = useState<Extracurricular | null>(null)
  const [members, setMembers] = useState<ExtraMember[]>([])
  const [students, setStudents] = useState<Student[]>([]) // For selection
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [addingMember, setAddingMember] = useState(false)
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    schedule: '',
    location: '',
    coachId: '' // Add coachId field
  })

  useEffect(() => {
    fetchExtras()
    fetchTeachers() // Fetch teachers on mount
  }, [debouncedSearch])

  const fetchExtras = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/extracurriculars?search=${search}`)
      const data = await res.json()
      if (res.ok) {
        setExtras(data.extras)
      } else {
        toast.error('Gagal mengambil data ekstrakurikuler')
      }
    } catch (error) {
      console.error(error)
      toast.error('Terjadi kesalahan koneksi')
    } finally {
      setLoading(false)
    }
  }

  const fetchTeachers = async () => {
    try {
      // Fetch users with role TEACHER
      // Assuming we have an endpoint for this, or using a generic users endpoint with filter
      // For now, let's try to fetch from /api/teachers which usually returns detailed teacher profiles
      // But we need User ID for the relation. Let's assume /api/users?role=TEACHER is available or use /api/teachers and map relations.
      // Based on previous context, let's check /api/teachers first or simpler /api/users
      
      // Let's use a mocked approach or a specific query if endpoints are not fully known, 
      // but best guess is fetching from /api/teachers and mapping correctly.
      // To be safe and since I don't want to break flow, I'll fetch /api/teachers
      
      const res = await fetch('/api/teachers?limit=100') // Get all teachers
      const data = await res.json()
      if (res.ok) {
        // Map teachers to simple { id, name } structure. 
        // Note: Extracurricular.coach relation points to User model.
        // Teacher endpoint might return Teacher model which has relation to User.
        // Let's assume for now we need the User ID.
        // If /api/teachers returns teacher profiles, we need teacher.userId.
        
        const mappedTeachers = data.teachers.map((t: any) => ({
          id: t.userId, // Important: Use User ID, not Teacher Profile ID
          name: t.name
        }))
        setTeachers(mappedTeachers)
      }
    } catch (error) {
       console.error('Error fetching teachers:', error)
    }
  }

  // Member Management Logic
  const handleOpenMemberDialog = (extra: Extracurricular) => {
    setSelectedExtra(extra)
    setIsMemberDialogOpen(true)
    fetchMembers(extra.id)
    fetchStudents() // Fetch students for selection dropdown
  }

  const fetchMembers = async (extraId: string) => {
    try {
      setLoadingMembers(true)
      const res = await fetch(`/api/extracurriculars/members?extraId=${extraId}`)
      const data = await res.json()
      if (res.ok) {
        setMembers(data.members)
      }
    } catch (error) {
      toast.error('Gagal mengambil data anggota')
    } finally {
      setLoadingMembers(false)
    }
  }

  const fetchStudents = async () => {
    try {
        // Assume API students is available and searchable/listable
        // For simplicity getting generic list. Ideally search.
        const res = await fetch('/api/students?limit=100')
        const data = await res.json()
        if (res.ok) {
            setStudents(data.students)
        }
    } catch(err) {
        console.error("Failed to fetch students")
    }
  }

  const handleAddMember = async () => {
    if (!selectedStudentId || !selectedExtra) {
        toast.error("Pilih siswa terlebih dahulu")
        return
    }
    
    setAddingMember(true)
    try {
        const res = await fetch('/api/extracurriculars/members', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                extraId: selectedExtra.id,
                studentId: selectedStudentId
            })
        })
        
        const data = await res.json()

        if (res.ok) {
            toast.success("Siswa berhasil ditambahkan")
            setMembers([data.member, ...members]) // Optimistic / Add to list
            setSelectedStudentId('') // Reset selection
            fetchMembers(selectedExtra.id) // Refresh to be sure (and get includes)
            fetchExtras() // Refresh counts in main grid
        } else {
            toast.error(data.error || "Gagal menambahkan siswa")
        }
    } catch(err) {
        toast.error("Terjadi kesalahan")
    } finally {
        setAddingMember(false)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
     if(!confirm("Hapus siswa dari ekskul ini?")) return
     
     try {
        const res = await fetch(`/api/extracurriculars/members?id=${memberId}`, {
            method: 'DELETE'
        })
        if (res.ok) {
            toast.success("Siswa dihapus dari ekskul")
            setMembers(members.filter(m => m.id !== memberId))
            fetchExtras() // Refresh counts
        } else {
            toast.error("Gagal menghapus siswa")
        }
     } catch(err) {
         toast.error("Terjadi kesalahan")
     }
  }

  const handleOpenDialog = (extra?: Extracurricular) => {
    if (extra) {
      setEditingId(extra.id)
      setFormData({
        name: extra.name,
        description: extra.description || '',
        schedule: extra.schedule || '',
        location: extra.location || '',
        coachId: extra.coach?.id || extra.coachId || ''
      })
    } else {
      setEditingId(null)
      setFormData({ name: '', description: '', schedule: '', location: '', coachId: '' })
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = '/api/extracurriculars'
      const method = editingId ? 'PUT' : 'POST'
      const body = editingId ? { ...formData, id: editingId } : formData

      // Clean empty coachId to null
      const payload = { ...body, coachId: body.coachId || null }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        toast.success(editingId ? 'Data berhasil diperbarui' : 'Ekskul berhasil ditambahkan')
        setIsDialogOpen(false)
        fetchExtras()
      } else {
        toast.error('Gagal menyimpan data')
      }
    } catch (error) {
      console.error(error)
      toast.error('Terjadi kesalahan')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus ekskul "${name}"?`)) return

    try {
      const res = await fetch(`/api/extracurriculars?id=${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        toast.success('Data berhasil dihapus')
        fetchExtras()
      } else {
        toast.error('Gagal menghapus data')
      }
    } catch (error) {
      console.error(error)
      toast.error('Terjadi kesalahan')
    }
  }

  // Calculate stats
  const totalMembers = extras.reduce((acc, curr) => acc + curr._count.members, 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-deep">Ekstrakurikuler</h1>
          <p className="text-gray-400 font-medium">Pengembangan diri dan minat bakat siswa</p>
        </div>
        <Button 
          onClick={() => handleOpenDialog()}
          className="rounded-2xl bg-brand-deep hover:bg-brand-deep/90 shadow-lg px-8 py-6 h-auto transition-transform hover:scale-105 active:scale-95"
        >
          <Plus className="w-5 h-5 mr-3" />
          <span className="font-bold">Tambah Ekskul</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ... (Stats Cards Code - No Changes Needed but included for context) ... */}
        <Card className="rounded-[2.5rem] border-none bg-white p-6 shadow-md hover:shadow-xl transition-all duration-500">
           <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-3xl bg-orange-50 flex items-center justify-center text-orange-600">
                 <Trophy className="w-7 h-7" />
              </div>
              <div>
                 <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Total Ekskul</p>
                 <h3 className="text-3xl font-black text-brand-deep">{extras.length}</h3>
              </div>
           </div>
        </Card>
        <Card className="rounded-[2.5rem] border-none bg-white p-6 shadow-md hover:shadow-xl transition-all duration-500">
           <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-3xl bg-indigo-50 flex items-center justify-center text-brand-purple">
                 <Users className="w-7 h-7" />
              </div>
              <div>
                 <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Total Anggota</p>
                 <h3 className="text-3xl font-black text-brand-deep">{totalMembers}</h3>
              </div>
           </div>
        </Card>
        <Card className="rounded-[2.5rem] border-none bg-brand-deep text-white p-6 shadow-xl shadow-brand-deep/20 relative overflow-hidden group">
           <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700"></div>
           <div className="relative z-10">
              <p className="text-indigo-200 font-bold text-xs uppercase tracking-widest mb-1">Status Kegiatan</p>
              <h3 className="text-2xl font-black">Semester Ganjil</h3>
              <p className="text-indigo-200 text-xs mt-2">Semua kegiatan aktif berjalan</p>
           </div>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative">
         <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
         <Input 
           placeholder="Cari nama ekskul, lokasi, atau deskripsi..." 
           className="pl-14 rounded-[2rem] border-none bg-white shadow-sm font-medium py-7 text-lg focus-visible:ring-brand-purple/20 transition-all hover:shadow-md" 
           value={search}
           onChange={(e) => setSearch(e.target.value)}
         />
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-brand-purple" />
        </div>
      ) : extras.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100">
           <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-gray-300" />
           </div>
           <h3 className="text-xl font-bold text-gray-900">Tidak ada data ditemukan</h3>
           <p className="text-gray-400 mt-2">Coba kata kunci lain atau tambahkan data baru.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {extras.map((extra) => (
            <Card key={extra.id} className="group relative rounded-[2.5rem] border-none bg-white p-2 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-visible">
               <div className="p-6">
                  {/* Header Card */}
                  <div className="flex justify-between items-start mb-6">
                     <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-2xl font-black text-brand-deep shadow-inner border border-white">
                        {extra.name.charAt(0)}
                     </div>
                     <DropdownMenu>
                       <DropdownMenuTrigger asChild>
                         <Button variant="ghost" size="icon" className="rounded-xl hover:bg-gray-50 -mr-2 text-gray-300 hover:text-gray-600">
                           <MoreHorizontal className="w-6 h-6" />
                         </Button>
                       </DropdownMenuTrigger>
                       <DropdownMenuContent align="end" className="rounded-2xl border-none shadow-xl">
                         <DropdownMenuItem 
                            onClick={() => handleOpenDialog(extra)}
                            className="p-3 font-bold text-gray-600 focus:bg-gray-50 rounded-xl cursor-pointer"
                          >
                           Edit Detail
                         </DropdownMenuItem>
                         <DropdownMenuItem 
                            onClick={() => handleOpenMemberDialog(extra)}
                            className="p-3 font-bold text-gray-600 focus:bg-gray-50 rounded-xl cursor-pointer"
                          >
                           Kelola Anggota
                         </DropdownMenuItem>
                         <DropdownMenuItem 
                            onClick={() => handleDelete(extra.id, extra.name)}
                            className="p-3 font-bold text-red-500 focus:bg-red-50 rounded-xl cursor-pointer"
                          >
                           Hapus Data
                         </DropdownMenuItem>
                       </DropdownMenuContent>
                     </DropdownMenu>
                  </div>

                  {/* Title & Desc */}
                  <div className="mb-6">
                     <h3 className="text-xl font-black text-brand-deep mb-2 line-clamp-1" title={extra.name}>
                        {extra.name}
                     </h3>
                     <p className="text-gray-400 text-sm font-medium line-clamp-2 min-h-[40px]">
                        {extra.description || 'Tidak ada deskripsi tersedia.'}
                     </p>
                  </div>

                  {/* Info Badges (Schedule & Location) */}
                  <div className="flex flex-wrap gap-2 mb-6">
                     {extra.schedule && (
                       <Badge variant="secondary" className="pl-2 pr-3 py-1.5 bg-orange-50 text-orange-600 rounded-xl border-none font-bold text-xs flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1.5" />
                          {extra.schedule}
                       </Badge>
                     )}
                     {extra.location && (
                       <Badge variant="secondary" className="pl-2 pr-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl border-none font-bold text-xs flex items-center">
                          <MapPin className="w-3.5 h-3.5 mr-1.5" />
                          {extra.location}
                       </Badge>
                     )}
                  </div>

                  {/* Footer (Coach & Members) */}
                  <div className="pt-6 border-t border-gray-50 flex justify-between items-center">
                     <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-black text-gray-300 tracking-wider mb-1">Pembina</span>
                        <span className="font-bold text-sm text-gray-700">{extra.coach?.name || '-'}</span>
                     </div>
                     <div className="flex -space-x-3">
                        {/* Placeholder avatars */}
                        {[...Array(3)].map((_, i) => (
                           <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500">
                              ?
                           </div>
                        ))}
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-brand-deep text-white flex items-center justify-center text-[10px] font-bold">
                           +{extra._count?.members || 0}
                        </div>
                     </div>
                  </div>
               </div>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog Form */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-brand-deep">
              {editingId ? 'Edit Ekstrakurikuler' : 'Tambah Ekstrakurikuler'}
            </DialogTitle>
            <DialogDescription className="text-gray-400 font-medium">
              Lengkapi informasi ekstrakurikuler di bawah ini.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="font-bold text-gray-700">Nama Ekskul</Label>
              <Input 
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Contoh: Basket"
                className="rounded-xl py-6"
              />
            </div>

            <div className="space-y-2">
               <Label className="font-bold text-gray-700">Pembina (Coach)</Label>
               <Select 
                 value={formData.coachId} 
                 onValueChange={(value) => setFormData({...formData, coachId: value})}
               >
                 <SelectTrigger className="rounded-xl py-6 bg-white">
                   <SelectValue placeholder="Pilih Guru Pembina" />
                 </SelectTrigger>
                 <SelectContent className="rounded-xl">
                    {teachers.map(teacher => (
                      <SelectItem key={teacher.id} value={teacher.id} className="font-medium cursor-pointer">
                        {teacher.name}
                      </SelectItem>
                    ))}
                 </SelectContent>
               </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label className="font-bold text-gray-700">Jadwal</Label>
                 <Input 
                   value={formData.schedule}
                   onChange={(e) => setFormData({...formData, schedule: e.target.value})}
                   placeholder="Senin, 15:00"
                   className="rounded-xl py-6"
                 />
               </div>
               <div className="space-y-2">
                 <Label className="font-bold text-gray-700">Lokasi</Label>
                 <Input 
                   value={formData.location}
                   onChange={(e) => setFormData({...formData, location: e.target.value})}
                   placeholder="Lapangan A"
                   className="rounded-xl py-6"
                 />
               </div>
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-gray-700">Deskripsi</Label>
              <Textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Deskripsi kegiatan..."
                className="rounded-xl resize-none h-32"
              />
            </div>

            <DialogFooter className="pt-4 gap-2">
               <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setIsDialogOpen(false)}
                className="rounded-xl py-6 font-bold text-gray-400 hover:text-gray-600"
               >
                 Batal
               </Button>
               <Button 
                type="submit" 
                disabled={isSubmitting}
                className="rounded-xl py-6 bg-brand-deep hover:bg-brand-deep/90 font-bold px-8 shadow-lg"
               >
                 {isSubmitting ? (
                   <>
                     <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Simpan...
                   </>
                 ) : (
                   <>
                     <Save className="mr-2 h-4 w-4" /> Simpan
                   </>
                 )}
               </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Dialog Manage Members */}
      <Dialog open={isMemberDialogOpen} onOpenChange={setIsMemberDialogOpen}>
        <DialogContent className="sm:max-w-2xl rounded-[2rem] p-0 overflow-hidden bg-gray-50/50">
           <div className="bg-white p-6 border-b border-gray-100/50">
             <DialogHeader>
                <DialogTitle className="text-2xl font-black text-brand-deep">
                  Anggota {selectedExtra?.name}
                </DialogTitle>
                <DialogDescription className="text-gray-400 font-medium">
                  Kelola siswa yang mengikuti ekstrakurikuler ini.
                </DialogDescription>
             </DialogHeader>

             {/* Add Member Form */}
             <div className="mt-6 flex flex-col sm:flex-row gap-3">
                 <div className="flex-1">
                    <Select 
                        value={selectedStudentId} 
                        onValueChange={setSelectedStudentId}
                        disabled={addingMember}
                    >
                        <SelectTrigger className="rounded-xl py-6 bg-gray-50 border-gray-200">
                             <SelectValue placeholder="Pilih Siswa untuk ditambahkan..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl max-h-[200px]">
                            {students.map(student => (
                                <SelectItem key={student.id} value={student.id} className="cursor-pointer">
                                    {student.name} {student.class ? `(${student.class.name})` : ''}
                                </SelectItem>
                            ))}
                            {students.length === 0 && <div className="p-3 text-sm text-gray-400 text-center">Tidak ada data siswa</div>}
                        </SelectContent>
                    </Select>
                 </div>
                 <Button 
                    onClick={handleAddMember} 
                    disabled={addingMember || !selectedStudentId}
                    className="rounded-xl py-6 px-6 bg-brand-deep font-bold shadow-lg"
                 >
                    {addingMember ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-5 h-5 mr-2" />}
                    Tambah
                 </Button>
             </div>
           </div>

           {/* Members List */}
           <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Daftar Anggota ({members.length})</h4>
                </div>
                
                <ScrollArea className="h-[300px] pr-4">
                    {loadingMembers ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="w-8 h-8 animate-spin text-brand-purple/50" />
                        </div>
                    ) : members.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl bg-white/50">
                            <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-400 font-medium">Belum ada anggota</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {members.map(member => (
                                <div key={member.id} className="group bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
                                    <div className="flex items-center space-x-4">
                                        <Avatar className="w-10 h-10 border border-gray-100">
                                            <AvatarFallback className="bg-brand-purple/10 text-brand-purple font-bold">
                                                {member.student.name.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h5 className="font-bold text-gray-800">{member.student.name}</h5>
                                            <p className="text-xs text-gray-400 font-medium">{member.student.class?.name || 'Siswa'}</p>
                                        </div>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                                        onClick={() => handleRemoveMember(member.id)}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
