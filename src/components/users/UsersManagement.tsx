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
import { Plus, Shield, UserCog, Key, Users, Loader2, Trash2, Edit } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface User {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  createdAt: string
}

interface UsersManagementProps {
  activeMenu: string
}

export default function UsersManagement({ activeMenu }: UsersManagementProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'password123',
    role: 'TEACHER',
    isActive: true,
    subjectId: '',
    classId: ''
  })
  
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    role: 'TEACHER',
    isActive: true,
    subjectId: '',
    classId: ''
  })

  const [classes, setClasses] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])

  useEffect(() => {
    fetchUsers()
    fetchClasses()
    fetchSubjects()
  }, [])

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/classes')
      const data = await res.json()
      if (res.ok) setClasses(data.classes)
    } catch (error) { console.error(error) }
  }

  const fetchSubjects = async () => {
    try {
      const res = await fetch('/api/subjects')
      const data = await res.json()
      if (res.ok) setSubjects(data.subjects)
    } catch (error) { console.error(error) }
  }

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/users')
      const data = await res.json()
      if (res.ok) setUsers(data.users)
    } finally { setLoading(false) }
  }

  const handleCreate = async () => {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    if (res.ok) {
      await fetchUsers()
      setIsAddOpen(false)
      alert('User berhasil ditambahkan')
    } else {
      const data = await res.json()
      alert(`Error: ${data.error}`)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Hapus user ini?')) {
      await fetch(`/api/users/${id}`, { method: 'DELETE' }).then(fetchUsers)
    }
  }

  const toggleActive = async (user: User) => {
    await fetch(`/api/users/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !user.isActive })
    }).then(fetchUsers)
  }

  const handleEdit = async () => {
    if (!editingUser) return
    
    setIsSubmitting(true)
    
    try {
      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      })
      
      if (res.ok) {
        await fetchUsers()
        setIsEditOpen(false)
        setEditingUser(null)
        toast({
          title: "Berhasil!",
          description: "Data user berhasil diperbarui",
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
      setIsSubmitting(false)
    }
  }

  const openEditDialog = (user: User) => {
    setEditingUser(user)
    setEditFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      // @ts-ignore
      subjectId: (user as any).teacherProfile?.subjects?.[0]?.id || '',
      // @ts-ignore
      classId: (user as any).teacherProfile?.classes?.[0]?.id || ''
    })
    setIsEditOpen(true)
  }

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-brand-purple" />
      </div>
    )
  }

  return (
    <Card className="rounded-[2.5rem] border-none shadow-2xl p-8 bg-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-deep">Manajemen Akses</h1>
          <p className="text-gray-400 font-medium">Kelola hak akses dan akun pengguna sistem secara terpusat</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-2xl bg-brand-deep hover:bg-brand-deep/90 shadow-lg shadow-brand-deep/20 px-8 py-6 h-auto transition-all transform hover:scale-105 active:scale-95">
              <Plus className="w-5 h-5 mr-3" />
              <span className="font-bold">Tambah Pengguna</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl rounded-4xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-brand-deep">Daftarkan User Baru</DialogTitle>
              <DialogDescription>Input data pengguna untuk memberikan akses ke dashboard</DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-6 font-medium">
              <div className="grid gap-2">
                <Label className="text-gray-700 font-bold">Nama Lengkap</Label>
                <Input className="rounded-xl border-gray-100 py-6 px-4" placeholder="Contoh: Ahmad Subarjo" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label className="text-gray-700 font-bold">Alamat Email</Label>
                <Input type="email" className="rounded-xl border-gray-100 py-6 px-4" placeholder="nama@sekolah.sch.id" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-gray-700 font-bold">Peran (Role)</Label>
                  <Select value={formData.role} onValueChange={v => setFormData({...formData, role: v})}>
                    <SelectTrigger className="rounded-xl border-gray-100 py-6 px-4"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                      <SelectItem value="ADMIN">Administrator</SelectItem>
                      <SelectItem value="TEACHER">Guru Pendidik</SelectItem>
                      <SelectItem value="STAFF">Staff TU</SelectItem>
                      <SelectItem value="OPERATOR">Operator Sistem</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label className="text-gray-700 font-bold">Katasandi Default</Label>
                  <Input className="rounded-xl border-gray-100 py-6 px-4" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsAddOpen(false)} className="rounded-xl font-bold">Batal</Button>
              <Button onClick={handleCreate} className="rounded-xl bg-brand-deep px-8 font-bold">Proses Aktivasi Akun</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Edit User */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-xl rounded-4xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-brand-deep">Edit Data Pengguna</DialogTitle>
              <DialogDescription>Perbarui informasi akun {editingUser?.name}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-6 font-medium">
              <div className="grid gap-2">
                <Label className="text-gray-700 font-bold">Nama Lengkap</Label>
                <Input 
                  className="rounded-xl border-gray-100 py-6 px-4" 
                  placeholder="Contoh: Ahmad Subarjo" 
                  value={editFormData.name} 
                  onChange={e => setEditFormData({...editFormData, name: e.target.value})} 
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-gray-700 font-bold">Alamat Email</Label>
                <Input 
                  type="email" 
                  className="rounded-xl border-gray-100 py-6 px-4" 
                  placeholder="nama@sekolah.sch.id" 
                  value={editFormData.email} 
                  onChange={e => setEditFormData({...editFormData, email: e.target.value})} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-gray-700 font-bold">Peran (Role)</Label>
                  <Select value={editFormData.role} onValueChange={v => setEditFormData({...editFormData, role: v})}>
                    <SelectTrigger className="rounded-xl border-gray-100 py-6 px-4"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                      <SelectItem value="ADMIN">Administrator</SelectItem>
                      <SelectItem value="TEACHER">Guru Pendidik</SelectItem>
                      <SelectItem value="STAFF">Staff TU</SelectItem>
                      <SelectItem value="OPERATOR">Operator Sistem</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label className="text-gray-700 font-bold">Status Akun</Label>
                  <Select value={editFormData.isActive ? "true" : "false"} onValueChange={v => setEditFormData({...editFormData, isActive: v === "true"})}>
                    <SelectTrigger className="rounded-xl border-gray-100 py-6 px-4"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="true">Aktif</SelectItem>
                      <SelectItem value="false">Nonaktif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsEditOpen(false)} className="rounded-xl font-bold" disabled={isSubmitting}>Batal</Button>
              <Button onClick={handleEdit} className="rounded-xl bg-brand-deep px-8 font-bold" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <Card className="rounded-3xl border-none bg-brand-deep/5 p-6 shadow-sm border border-brand-deep/10">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-brand-deep uppercase tracking-widest mb-2">Total Pengguna</span>
            <div className="text-3xl font-black text-brand-deep">{users.length}</div>
            <p className="text-[10px] text-gray-400 font-medium mt-1">Terdaftar dalam database</p>
          </div>
        </Card>
        <Card className="rounded-3xl border-none bg-emerald-50/50 p-6 shadow-sm border border-emerald-100/50">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Akun Aktif</span>
            <div className="text-3xl font-black text-brand-deep">{users.filter(u => u.isActive).length}</div>
            <p className="text-[10px] text-gray-400 font-medium mt-1">Memiliki izin akses penuh</p>
          </div>
        </Card>
      </div>

      <div className="rounded-4xl border border-gray-100 overflow-hidden shadow-sm bg-white">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="font-bold text-brand-deep px-8 py-5">Identitas Pengguna</TableHead>
              <TableHead className="font-bold text-brand-deep px-8 py-5">Level Izin</TableHead>
              <TableHead className="font-bold text-brand-deep px-8 py-5">Status Akun</TableHead>
              <TableHead className="font-bold text-brand-deep px-8 py-5">Tanggal Dibuat</TableHead>
              <TableHead className="text-right font-bold text-brand-deep px-8 py-5">Baris Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(u => (
              <TableRow key={u.id} className="hover:bg-gray-50/50 transition-colors border-gray-50">
                <TableCell className="px-8 py-5">
                   <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-2xl bg-brand-deep flex items-center justify-center text-white font-black text-sm shadow-lg shadow-brand-deep/10">
                         {u.name.substring(0, 1)}
                      </div>
                      <div>
                         <p className="font-bold text-gray-900 leading-none mb-1">{u.name}</p>
                         <p className="text-xs text-gray-400 font-medium">{u.email}</p>
                      </div>
                   </div>
                </TableCell>
                <TableCell className="px-8 py-5">
                  <Badge variant="outline" className="rounded-lg border-gray-100 text-[10px] font-black uppercase tracking-tight text-gray-400 px-3 py-1">
                    {u.role.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell className="px-8 py-5">
                  <Badge 
                    className={`rounded-xl px-4 py-1 border-none shadow-sm cursor-pointer transition-all hover:scale-105 active:scale-95 ${
                      u.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'
                    }`}
                    onClick={() => toggleActive(u)}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full mr-2 ${u.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                    {u.isActive ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                </TableCell>
                <TableCell className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-tighter">
                  {new Date(u.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                </TableCell>
                <TableCell className="text-right px-8 py-5">
                   <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(u)} className="rounded-xl hover:bg-indigo-50 hover:text-indigo-600">
                         <UserCog className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(u.id)} className="rounded-xl hover:bg-red-50 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                   </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
