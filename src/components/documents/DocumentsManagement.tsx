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
import { Plus, FileText, Download, Upload, Loader2, Trash2 } from 'lucide-react'

interface DocumentRecord {
  id: string
  type: string
  title: string
  number: string | null
  date: string
  sender: string | null
  recipient: string | null
}

interface DocumentsManagementProps {
  activeMenu: string
}

export default function DocumentsManagement({ activeMenu }: DocumentsManagementProps) {
  const [documents, setDocuments] = useState<DocumentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddOpen, setIsAddOpen] = useState(false)

  const [formData, setFormData] = useState({
    type: 'SURAT_MASUK',
    title: '',
    number: '',
    date: new Date().toISOString().split('T')[0],
    sender: '',
    recipient: '',
    content: ''
  })

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/documents')
      const data = await res.json()
      if (res.ok) setDocuments(data.documents)
    } finally { setLoading(false) }
  }

  const handleCreate = async () => {
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, createdBy: 'default-user-id' })
    })
    if (res.ok) {
      await fetchDocuments()
      setIsAddOpen(false)
      alert('Dokumen berhasil dicatat')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus dokumen ini?')) return
    const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' })
    if (res.ok) fetchDocuments()
  }

  if (loading && documents.length === 0) {
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
          <h1 className="text-3xl font-extrabold text-brand-deep">Administrasi Surat</h1>
          <p className="text-gray-400 font-medium">Kelola surat masuk, surat keluar, dan arsip dokumen sekolah</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-2xl bg-brand-deep hover:bg-brand-deep/90 shadow-lg shadow-brand-deep/20 px-8 py-6 h-auto transition-all transform hover:scale-105 active:scale-95">
              <Plus className="w-5 h-5 mr-3" />
              <span className="font-bold">Buat Surat Baru</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl rounded-4xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-brand-deep">Catat Dokumen Baru</DialogTitle>
              <DialogDescription className="text-gray-400 font-medium">Lengkapi informasi dokumen untuk pengarsipan digital</DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-6 font-medium">
              <div className="grid grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <Label className="text-gray-700 font-bold">Jenis Dokumen</Label>
                  <Select value={formData.type} onValueChange={v => setFormData({...formData, type: v})}>
                    <SelectTrigger className="rounded-xl border-gray-100"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="SURAT_MASUK">Surat Masuk</SelectItem>
                      <SelectItem value="SURAT_KELUAR">Surat Keluar</SelectItem>
                      <SelectItem value="SK">Surat Keputusan (SK)</SelectItem>
                      <SelectItem value="CERTIFICATE">Sertifikat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label className="text-gray-700 font-bold">Tanggal</Label>
                  <Input type="date" className="rounded-xl border-gray-100" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="text-gray-700 font-bold">Nomor Surat</Label>
                <Input className="rounded-xl border-gray-100" placeholder="Contoh: 001/SM/2024" value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label className="text-gray-700 font-bold">Perihal / Judul Dokumen</Label>
                <Input className="rounded-xl border-gray-100" placeholder="Masukkan perihal dokumen..." value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <Label className="text-gray-700 font-bold">Pengirim</Label>
                  <Input className="rounded-xl border-gray-100" placeholder="Nama pengirim..." value={formData.sender} onChange={e => setFormData({...formData, sender: e.target.value})} />
                </div>
                <div className="grid gap-2">
                  <Label className="text-gray-700 font-bold">Penerima</Label>
                  <Input className="rounded-xl border-gray-100" placeholder="Nama penerima..." value={formData.recipient} onChange={e => setFormData({...formData, recipient: e.target.value})} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsAddOpen(false)} className="rounded-xl font-bold">Batal</Button>
              <Button onClick={handleCreate} className="rounded-xl bg-brand-deep px-8 font-bold">Simpan Dokumen</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <Card className="rounded-3xl border-none bg-indigo-50/50 p-6 shadow-sm border border-indigo-100/50">
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-indigo-600 uppercase">Surat Masuk</span>
              <Download className="w-5 h-5 text-indigo-400 opacity-60" />
            </div>
            <div className="text-3xl font-black text-brand-deep">{documents.filter(d => d.type === 'SURAT_MASUK').length}</div>
          </div>
        </Card>
        <Card className="rounded-3xl border-none bg-emerald-50/50 p-6 shadow-sm border border-emerald-100/50">
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-600 uppercase">Surat Keluar</span>
              <Upload className="w-5 h-5 text-emerald-400 opacity-60" />
            </div>
            <div className="text-3xl font-black text-brand-deep">{documents.filter(d => d.type === 'SURAT_KELUAR').length}</div>
          </div>
        </Card>
        <Card className="rounded-3xl border-none bg-brand-purple/5 p-6 shadow-sm border border-brand-purple/10">
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-brand-purple uppercase">Lainnya (SK/Sertifikat)</span>
              <FileText className="w-5 h-5 text-brand-purple/40" />
            </div>
            <div className="text-3xl font-black text-brand-deep">{documents.filter(d => !['SURAT_MASUK', 'SURAT_KELUAR'].includes(d.type)).length}</div>
          </div>
        </Card>
      </div>

      <div className="rounded-4xl border border-gray-100 overflow-hidden shadow-sm bg-white">
        <div className="p-6 border-b border-gray-50 bg-gray-50/30">
          <h2 className="text-xl font-bold text-brand-deep">Arsip Dokumen Sekolah</h2>
          <p className="text-sm text-gray-400 font-medium">Daftar rekaman surat dan dokumen yang terdaftar dalam sistem</p>
        </div>
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="font-bold text-brand-deep px-8 py-5">Nomor Surat</TableHead>
              <TableHead className="font-bold text-brand-deep px-8 py-5">Perihal / Judul</TableHead>
              <TableHead className="font-bold text-brand-deep px-8 py-5">Kategori</TableHead>
              <TableHead className="font-bold text-brand-deep px-8 py-5">Tanggal</TableHead>
              <TableHead className="font-bold text-brand-deep px-8 py-5">Keterangan</TableHead>
              <TableHead className="text-right font-bold text-brand-deep px-8 py-5">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-20">
                  <Loader2 className="w-10 h-10 animate-spin mx-auto text-brand-purple" />
                </TableCell>
              </TableRow>
            ) : documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-20 text-gray-500 font-bold uppercase tracking-widest text-xs">
                  Belum ada dokumen yang terdaftar
                </TableCell>
              </TableRow>
            ) : documents.map(d => (
              <TableRow key={d.id} className="hover:bg-gray-50/50 transition-colors border-gray-50">
                <TableCell className="px-8 py-5 font-bold text-indigo-600 text-[11px] font-mono leading-none tracking-tight">
                  {d.number || '-'}
                </TableCell>
                <TableCell className="px-8 py-5 font-bold text-gray-900 max-w-[240px] truncate leading-snug">
                  {d.title}
                </TableCell>
                <TableCell className="px-8 py-5">
                  <Badge className={`rounded-lg px-3 py-1 border-none shadow-sm capitalize ${
                    d.type === 'SURAT_MASUK' ? 'bg-blue-50 text-blue-600' :
                    d.type === 'SURAT_KELUAR' ? 'bg-emerald-50 text-emerald-600' :
                    'bg-brand-purple/10 text-brand-purple'
                  }`}>
                    {d.type.replace('_', ' ').toLowerCase()}
                  </Badge>
                </TableCell>
                <TableCell className="px-8 py-5 text-gray-500 font-medium text-xs">
                  {new Date(d.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                </TableCell>
                <TableCell className="px-8 py-5">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-tighter mb-0.5">
                      {d.type === 'SURAT_MASUK' ? 'Diterima Dari' : 'Dikirim Ke'}
                    </span>
                    <span className="text-sm font-bold text-gray-700 truncate max-w-[150px]">
                      {d.type === 'SURAT_MASUK' ? d.sender : d.recipient}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right px-8 py-5">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDelete(d.id)} 
                    className="rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
