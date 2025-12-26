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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Trophy, AlertCircle, Loader2, Trash2, Search } from 'lucide-react'

interface Achievement {
  id: string
  student: { id: string; name: string }
  title: string
  type: string
  level: string | null
  date: string
}

interface Violation {
  id: string
  student: { id: string; name: string }
  type: string
  severity: string
  date: string
}

interface Student {
  id: string
  name: string
  nis: string
}

interface StudentAffairsManagementProps {
  activeMenu: string
}

export default function StudentAffairsManagement({ activeMenu }: StudentAffairsManagementProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [violations, setViolations] = useState<Violation[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddAchOpen, setIsAddAchOpen] = useState(false)
  const [isAddVioOpen, setIsAddVioOpen] = useState(false)

  const [achForm, setAchForm] = useState({ studentId: '', title: '', type: 'ACADEMIC', level: 'KABUPATEN', date: new Date().toISOString().split('T')[0] })
  const [vioForm, setVioForm] = useState({ studentId: '', type: 'DISCIPLINE', severity: 'MINOR', date: new Date().toISOString().split('T')[0], description: '' })

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      const resS = await fetch('/api/students?limit=100')
      const dataS = await resS.json()
      if (resS.ok) setStudents(dataS.students)
      await Promise.all([fetchAchievements(), fetchViolations()])
    } finally { setLoading(false) }
  }

  const fetchAchievements = async () => {
    const res = await fetch('/api/achievements')
    const data = await res.json()
    if (res.ok) setAchievements(data.achievements)
  }

  const fetchViolations = async () => {
    const res = await fetch('/api/violations')
    const data = await res.json()
    if (res.ok) setViolations(data.violations)
  }

  const handleCreateAch = async () => {
    const res = await fetch('/api/achievements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(achForm)
    })
    if (res.ok) { fetchAchievements(); setIsAddAchOpen(false); alert('Prestasi berhasil disimpan') }
  }

  const handleCreateVio = async () => {
    const res = await fetch('/api/violations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...vioForm, reportedBy: 'System' })
    })
    if (res.ok) { fetchViolations(); setIsAddVioOpen(false); alert('Pelanggaran berhasil dicatat') }
  }

  const handleDeleteAch = async (id: string) => {
    if (confirm('Hapus record ini?')) await fetch(`/api/achievements/${id}`, { method: 'DELETE' }).then(fetchAchievements)
  }

  const handleDeleteVio = async (id: string) => {
    if (confirm('Hapus record ini?')) await fetch(`/api/violations/${id}`, { method: 'DELETE' }).then(fetchViolations)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kesiswaan</h1>
          <p className="text-gray-600">Prestasi dan Pelanggaran Siswa</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-yellow-50">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-yellow-700">Total Prestasi</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-yellow-800">{achievements.length}</div></CardContent>
        </Card>
        <Card className="bg-red-50">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-red-700">Total Pelanggaran</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-red-800">{violations.length}</div></CardContent>
        </Card>
      </div>

      <Tabs defaultValue="achievements" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="achievements">Prestasi</TabsTrigger>
          <TabsTrigger value="violations">Pelanggaran</TabsTrigger>
        </TabsList>

        <TabsContent value="achievements" className="pt-4 space-y-4">
          <div className="flex justify-end">
            <Dialog open={isAddAchOpen} onOpenChange={setIsAddAchOpen}>
              <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Tambah Prestasi</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Input Prestasi Siswa</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Pilih Siswa</Label>
                    <Select value={achForm.studentId} onValueChange={v => setAchForm({...achForm, studentId: v})}>
                      <SelectTrigger><SelectValue placeholder="Pilih Siswa" /></SelectTrigger>
                      <SelectContent>
                        {students.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Judul Prestasi</Label>
                    <Input value={achForm.title} onChange={e => setAchForm({...achForm, title: e.target.value})} placeholder="Juara 1 Lomba..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Tingkat</Label>
                      <Select value={achForm.level} onValueChange={v => setAchForm({...achForm, level: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="KABUPATEN">Kabupaten</SelectItem>
                          <SelectItem value="PROVINSI">Provinsi</SelectItem>
                          <SelectItem value="NASIONAL">Nasional</SelectItem>
                          <SelectItem value="INTERNASIONAL">Internasional</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Tanggal</Label>
                      <Input type="date" value={achForm.date} onChange={e => setAchForm({...achForm, date: e.target.value})} />
                    </div>
                  </div>
                </div>
                <DialogFooter><Button onClick={handleCreateAch}>Simpan</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Siswa</TableHead>
                  <TableHead>Prestasi</TableHead>
                  <TableHead>Tingkat</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {achievements.map(a => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.student.name}</TableCell>
                    <TableCell>{a.title}</TableCell>
                    <TableCell><Badge variant="outline">{a.level}</Badge></TableCell>
                    <TableCell>{new Date(a.date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => handleDeleteAch(a.id)} className="text-red-600"><Trash2 className="w-4 h-4" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="violations" className="pt-4 space-y-4">
          <div className="flex justify-end">
            <Dialog open={isAddVioOpen} onOpenChange={setIsAddVioOpen}>
              <DialogTrigger asChild><Button variant="destructive"><Plus className="w-4 h-4 mr-2" />Catat Pelanggaran</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Catat Pelanggaran Siswa</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Pilih Siswa</Label>
                    <Select value={vioForm.studentId} onValueChange={v => setVioForm({...vioForm, studentId: v})}>
                      <SelectTrigger><SelectValue placeholder="Pilih Siswa" /></SelectTrigger>
                      <SelectContent>
                        {students.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Kategori</Label>
                      <Select value={vioForm.type} onValueChange={v => setVioForm({...vioForm, type: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DISCIPLINE">Kedisiplinan</SelectItem>
                          <SelectItem value="ACADEMIC">Akademik</SelectItem>
                          <SelectItem value="BEHAVIOR">Etika & Moral</SelectItem>
                          <SelectItem value="ATTENDANCE">Kehadiran</SelectItem>
                          <SelectItem value="UNIFORM">Seragam</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Bobot</Label>
                      <Select value={vioForm.severity} onValueChange={v => setVioForm({...vioForm, severity: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MINOR">Ringan</SelectItem>
                          <SelectItem value="MODERATE">Sedang</SelectItem>
                          <SelectItem value="MAJOR">Berat</SelectItem>
                          <SelectItem value="SEVERE">Sangat Berat</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Keterangan Pelanggaran</Label>
                    <Input value={vioForm.description} onChange={e => setVioForm({...vioForm, description: e.target.value})} />
                  </div>
                </div>
                <DialogFooter><Button variant="destructive" onClick={handleCreateVio}>Catat Pelanggaran</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Siswa</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Bobot</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {violations.map(v => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">{v.student.name}</TableCell>
                    <TableCell>{v.type}</TableCell>
                    <TableCell><Badge variant={v.severity === 'MINOR' ? 'secondary' : v.severity === 'MODERATE' ? 'default' : 'destructive'}>{v.severity}</Badge></TableCell>
                    <TableCell>{new Date(v.date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => handleDeleteVio(v.id)} className="text-red-600"><Trash2 className="w-4 h-4" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
