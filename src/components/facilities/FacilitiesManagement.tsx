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
import { Plus, Building, Wrench, CheckCircle, AlertTriangle, Loader2, Trash2 } from 'lucide-react'

interface Facility {
  id: string
  code: string | null
  name: string
  type: string
  condition: string
  status: string
  quantity: number
  location: string | null
}

interface FacilitiesManagementProps {
  activeMenu: string
}

export default function FacilitiesManagement({ activeMenu }: FacilitiesManagementProps) {
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [loading, setLoading] = useState(true)
  const [schoolId, setSchoolId] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'ROOM',
    condition: 'GOOD',
    status: 'AVAILABLE',
    quantity: 1,
    location: ''
  })

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      const schoolRes = await fetch('/api/school')
      const schoolData = await schoolRes.json()
      if (schoolRes.ok) setSchoolId(schoolData.school.id)
      await fetchFacilities()
    } finally { setLoading(false) }
  }

  const fetchFacilities = async () => {
    const res = await fetch('/api/facilities')
    const data = await res.json()
    if (res.ok) setFacilities(data.facilities)
  }

  const handleCreate = async () => {
    if (!schoolId) return
    const res = await fetch('/api/facilities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, schoolId })
    })
    if (res.ok) {
      await fetchFacilities()
      setIsAddOpen(false)
      alert('Aset berhasil ditambahkan')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus aset ini?')) return
    const res = await fetch(`/api/facilities/${id}`, { method: 'DELETE' })
    if (res.ok) fetchFacilities()
  }

  const stats = {
    total: facilities.length,
    good: facilities.filter(f => f.condition === 'GOOD').length,
    repair: facilities.filter(f => f.condition === 'REPAIR').length,
    broken: facilities.filter(f => f.condition === 'BROKEN').length
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-extrabold text-brand-deep">Sarana & Prasarana</h1>
          <p className="text-gray-400 text-sm md:text-base font-medium">Kelola inventaris dan fasilitas sekolah</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto rounded-xl md:rounded-2xl bg-brand-deep hover:bg-brand-deep/90 shadow-lg shadow-brand-deep/20 px-8 py-6 h-auto transition-all">
              <Plus className="w-5 h-5 mr-3" />
              <span className="font-bold">Tambah Fasilitas</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl w-[95vw] rounded-3xl md:rounded-4xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-brand-deep">Tambah Asset Baru</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Nama Barang/Ruangan</Label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Kategori</Label>
                  <Select value={formData.type} onValueChange={v => setFormData({...formData, type: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ROOM">Ruangan</SelectItem>
                      <SelectItem value="EQUIPMENT">Peralatan</SelectItem>
                      <SelectItem value="FURNITURE">Mebel</SelectItem>
                      <SelectItem value="ELECTRONIC">Elektronik</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Kondisi</Label>
                  <Select value={formData.condition} onValueChange={v => setFormData({...formData, condition: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GOOD">Baik</SelectItem>
                      <SelectItem value="REPAIR">Perlu Perbaikan</SelectItem>
                      <SelectItem value="BROKEN">Rusak</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Lokasi</Label>
                <Input value={formData.location || ''} onChange={e => setFormData({...formData, location: e.target.value})} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate} className="w-full rounded-xl bg-brand-deep font-bold py-6 h-auto">Simpan Asset</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-10">
        <Card className="rounded-3xl md:rounded-3xl border-none bg-blue-50/50 p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm font-bold text-blue-600 uppercase tracking-wider mb-1">Total Aset</p>
              <div className="text-2xl md:text-3xl font-black text-brand-deep">{stats.total}</div>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-xl md:rounded-2xl flex items-center justify-center text-blue-600">
              <Building className="w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>
        </Card>
        <Card className="rounded-3xl md:rounded-3xl border-none bg-emerald-50/50 p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm font-bold text-emerald-600 uppercase tracking-wider mb-1">Kondisi Baik</p>
              <div className="text-2xl md:text-3xl font-black text-brand-deep">{stats.good}</div>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-100 rounded-xl md:rounded-2xl flex items-center justify-center text-emerald-600">
              <CheckCircle className="w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>
        </Card>
        <Card className="rounded-3xl md:rounded-3xl border-none bg-orange-50/50 p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm font-bold text-orange-600 uppercase tracking-wider mb-1">Perlu Perbaikan</p>
              <div className="text-2xl md:text-3xl font-black text-brand-deep">{stats.repair}</div>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-100 rounded-xl md:rounded-2xl flex items-center justify-center text-orange-600">
              <Wrench className="w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>
        </Card>
        <Card className="rounded-3xl md:rounded-3xl border-none bg-red-50/50 p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm font-bold text-red-600 uppercase tracking-wider mb-1">Rusak</p>
              <div className="text-2xl md:text-3xl font-black text-brand-deep">{stats.broken}</div>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-red-100 rounded-xl md:rounded-2xl flex items-center justify-center text-red-600">
              <AlertTriangle className="w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="rounded-[2.5rem] border-none shadow-2xl p-8 bg-white">
        <CardHeader className="px-0 pt-0 pb-8">
          <CardTitle className="text-2xl font-bold text-brand-deep">Daftar Inventaris</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-3xl md:rounded-4xl border border-gray-100 overflow-x-auto shadow-sm scrollbar-hide">
            <div className="min-w-[800px]">
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="font-bold text-brand-deep px-6 py-4">Kode</TableHead>
                    <TableHead className="font-bold text-brand-deep px-6 py-4">Nama</TableHead>
                    <TableHead className="font-bold text-brand-deep px-6 py-4">Kategori</TableHead>
                    <TableHead className="font-bold text-brand-deep px-6 py-4">Kondisi</TableHead>
                    <TableHead className="font-bold text-brand-deep px-6 py-4">Lokasi</TableHead>
                    <TableHead className="text-right font-bold text-brand-deep px-6 py-4">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-20"><Loader2 className="w-10 h-10 animate-spin mx-auto text-brand-purple" /></TableCell></TableRow>
                  ) : facilities.map(f => (
                    <TableRow key={f.id} className="hover:bg-gray-50/50 transition-colors border-gray-50">
                      <TableCell className="px-6 py-4">{f.code || '-'}</TableCell>
                      <TableCell className="font-bold px-6 py-4 text-gray-900">{f.name}</TableCell>
                      <TableCell className="px-6 py-4 uppercase text-xs font-bold text-gray-500">{f.type}</TableCell>
                      <TableCell className="px-6 py-4">
                        <Badge variant={f.condition === 'GOOD' ? 'default' : f.condition === 'REPAIR' ? 'secondary' : 'destructive'} className="rounded-lg px-3">
                          {f.condition === 'GOOD' ? 'Baik' : f.condition === 'REPAIR' ? 'Perlu Perbaikan' : 'Rusak'}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-gray-600">{f.location || '-'}</TableCell>
                      <TableCell className="text-right px-6 py-4">
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(f.id)} className="rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 transition-all">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
