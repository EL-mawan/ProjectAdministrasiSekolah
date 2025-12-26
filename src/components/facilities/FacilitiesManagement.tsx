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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sarana & Prasarana</h1>
          <p className="text-gray-600">Kelola inventaris dan fasilitas sekolah</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Tambah Fasilitas</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Tambah Asset Baru</DialogTitle></DialogHeader>
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
            <DialogFooter><Button onClick={handleCreate}>Simpan</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Aset</CardTitle>
            <Building className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Kondisi Baik</CardTitle>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.good}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-orange-600">Perlu Perbaikan</CardTitle>
            <Wrench className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.repair}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Rusak</CardTitle>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.broken}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Daftar Inventaris</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Kondisi</TableHead>
                <TableHead>Lokasi</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-10"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" /></TableCell></TableRow>
              ) : facilities.map(f => (
                <TableRow key={f.id}>
                  <TableCell>{f.code || '-'}</TableCell>
                  <TableCell className="font-medium">{f.name}</TableCell>
                  <TableCell>{f.type}</TableCell>
                  <TableCell>
                    <Badge variant={f.condition === 'GOOD' ? 'default' : f.condition === 'REPAIR' ? 'secondary' : 'destructive'}>
                      {f.condition}
                    </Badge>
                  </TableCell>
                  <TableCell>{f.location || '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(f.id)} className="text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
