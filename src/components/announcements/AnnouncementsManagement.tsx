'use client'

interface Announcement {
  id: string
  title: string
  content: string
  date: string
  category: string
  isImportant: boolean
}

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Bell, 
  Plus, 
  Megaphone, 
  Calendar, 
  Star, 
  Search, 
  Trash2, 
  MoreVertical,
  ChevronRight,
  Loader2
} from 'lucide-react'
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

export default function AnnouncementsManagement({ activeMenu }: { activeMenu: string }) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    { 
      id: '1', 
      title: 'Libur Semester Ganjil 2024', 
      content: 'Diberitahukan kepada seluruh siswa bahwa libur semester akan dimulai pada tanggal 23 Desember 2024.',
      date: '2024-12-20',
      category: 'AKADEMIK',
      isImportant: true
    },
    { 
      id: '2', 
      title: 'Rapat Orang Tua Murid', 
      content: 'Undangan rapat pembagian raport semester ganjil akan dilaksanakan di Aula Utama.',
      date: '2024-12-18',
      category: 'KEGIATAN',
      isImportant: false
    },
    { 
      id: '3', 
      title: 'Pemeliharaan Sistem Dashboard', 
      content: 'Dashboard akan mengalami pemeliharaan rutin pada hari Minggu jam 22:00 WIB.',
      date: '2024-12-15',
      category: 'PENGUMUMAN',
      isImportant: false
    }
  ])
  const [loading, setLoading] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'PENGUMUMAN',
    isImportant: false
  })

  const handleAdd = () => {
    const newAnn = {
      ...formData,
      id: Math.random().toString(),
      date: new Date().toISOString().split('T')[0]
    }
    setAnnouncements([newAnn, ...announcements])
    setIsAddOpen(false)
    setFormData({ title: '', content: '', category: 'PENGUMUMAN', isImportant: false })
  }

  const handleDelete = (id: string) => {
    if (confirm('Hapus pengumuman ini?')) {
      setAnnouncements(announcements.filter(a => a.id !== id))
    }
  }

  return (
    <Card className="rounded-[2.5rem] border-none shadow-2xl p-8 bg-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-deep">Pusat Pengumuman</h1>
          <p className="text-gray-400 font-medium">Kelola pesan dan informasi penting untuk seluruh civitas sekolah</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-2xl bg-brand-deep hover:bg-brand-deep/90 shadow-lg shadow-brand-deep/20 px-8 py-6 h-auto transition-all transform hover:scale-105 active:scale-95">
              <Megaphone className="w-5 h-5 mr-3" />
              <span className="font-bold">Kirim Pengumuman</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl rounded-4xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-brand-deep">Buat Pengumuman Baru</DialogTitle>
              <DialogDescription>Informasi ini akan tampil di dashboard guru dan siswa</DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-6">
              <div className="space-y-2">
                <Label className="font-bold text-gray-700">Judul Pengumuman</Label>
                <Input 
                   className="rounded-xl border-gray-100" 
                   placeholder="Tulis judul yang singkat dan jelas..." 
                   value={formData.title}
                   onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label className="font-bold text-gray-700">Kategori</Label>
                    <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                      <SelectTrigger className="rounded-xl border-gray-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="PENGUMUMAN">Umum</SelectItem>
                        <SelectItem value="AKADEMIK">Akademik</SelectItem>
                        <SelectItem value="KEGIATAN">Kegiatan</SelectItem>
                        <SelectItem value="DARURAT">Darurat</SelectItem>
                      </SelectContent>
                    </Select>
                 </div>
                 <div className="space-y-2">
                    <Label className="font-bold text-gray-700">Tingkat Penekanan</Label>
                    <Select 
                      value={formData.isImportant ? 'IMPORTANT' : 'NORMAL'} 
                      onValueChange={v => setFormData({...formData, isImportant: v === 'IMPORTANT'})}
                    >
                      <SelectTrigger className="rounded-xl border-gray-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="NORMAL">Normal</SelectItem>
                        <SelectItem value="IMPORTANT">Sangat Penting</SelectItem>
                      </SelectContent>
                    </Select>
                 </div>
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-gray-700">Isi Pesan</Label>
                <textarea 
                   className="w-full min-h-[120px] rounded-xl border border-gray-100 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all"
                   placeholder="Tuliskan detail pengumuman di sini..."
                   value={formData.content}
                   onChange={e => setFormData({...formData, content: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsAddOpen(false)} className="rounded-xl font-bold">Batal</Button>
              <Button onClick={handleAdd} className="rounded-xl bg-brand-deep px-8 font-bold">Publikasikan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-brand-deep flex items-center">
                 <Calendar className="w-5 h-5 mr-3 text-brand-purple" />
                 Riwayat Pengumuman
              </h2>
              <div className="relative">
                 <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                 <Input className="pl-10 rounded-2xl border-none bg-gray-50 text-xs w-48" placeholder="Cari info..." />
              </div>
           </div>

           <div className="space-y-4">
              {announcements.map((ann) => (
                <div key={ann.id} className="group p-6 rounded-[2rem] border border-gray-50 bg-gray-50/50 hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 relative overflow-hidden">
                   {ann.isImportant && (
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-pink"></div>
                   )}
                   <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1">
                         <div className="flex items-center gap-3 mb-2">
                            <Badge className={`rounded-lg px-2 py-0.5 text-[10px] font-black border-none ${
                                ann.category === 'AKADEMIK' ? 'bg-indigo-50 text-indigo-600' :
                                ann.category === 'KEGIATAN' ? 'bg-emerald-50 text-emerald-600' :
                                'bg-brand-purple/10 text-brand-purple'
                            }`}>
                               {ann.category}
                            </Badge>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(ann.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                         </div>
                         <h3 className="text-lg font-black text-brand-deep mb-2">{ann.title}</h3>
                         <p className="text-sm text-gray-500 leading-relaxed font-medium">{ann.content}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                         <Button variant="ghost" size="icon" className="rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors" onClick={() => handleDelete(ann.id)}>
                            <Trash2 className="w-4 h-4" />
                         </Button>
                         <Button variant="ghost" size="icon" className="rounded-xl">
                            <ChevronRight className="w-5 h-5 text-gray-300" />
                         </Button>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>

        <div className="space-y-8">
           <Card className="rounded-[2.5rem] border-none shadow-xl p-8 bg-brand-deep text-white relative overflow-hidden">
              <div className="absolute right-[-20px] top-[-20px] w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
              <Star className="w-8 h-8 text-brand-pink mb-4" />
              <h3 className="text-xl font-bold mb-2">Pesan Penting Hari Ini</h3>
              <p className="text-indigo-100/80 text-sm leading-relaxed mb-6">
                Pastikan seluruh guru sudah mengunggah nilai raport semester ganjil sebelum batas waktu 22 Desember.
              </p>
              <Button className="w-full rounded-2xl bg-white/10 hover:bg-white/20 border-none text-white font-bold">
                 Tandai Sudah Dibaca
              </Button>
           </Card>

           <Card className="rounded-[2.5rem] border-none shadow-lg p-8 bg-white border border-gray-50">
              <h3 className="font-bold text-brand-deep mb-4 flex items-center">
                 <Bell className="w-4 h-4 mr-2 text-brand-purple" />
                 Tips Pengumuman
              </h3>
              <ul className="space-y-4">
                 {[
                   'Gunakan kalimat yang persuasif',
                   'Cantumkan tanggal yang jelas',
                   'Berikan kategori yang sesuai',
                   'Gunakan pin untuk info mendesak'
                 ].map((tip, i) => (
                   <li key={i} className="flex items-start text-xs text-gray-500 font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-purple/30 mr-3 mt-1 underline-offset-4"></div>
                      {tip}
                   </li>
                 ))}
              </ul>
           </Card>
        </div>
      </div>
    </Card>
  )
}
