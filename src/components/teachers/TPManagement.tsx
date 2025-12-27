'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, CheckCircle, Edit2, Trash2, Search, Target, Loader2, Layers, BookOpen, ArrowRight, ArrowLeft } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

// ... (imports)
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function TPManagement({ user }: { user: any }) {
  const [loading, setLoading] = useState(false)
  const [tps, setTps] = useState<any[]>([])
  const [cps, setCps] = useState<any[]>([]) // CP State
  const [subjects, setSubjects] = useState<any[]>([])
  const [view, setView] = useState<'list' | 'detail'>('list')
  const [activeSubject, setActiveSubject] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('tp') // Tabs: cp, tp, atp
  
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  const [form, setForm] = useState({
      code: '',
      desc: '', // used for TP desc or CP desc
      grade: 'X',
      semester: '1',
      schoolYear: '2024/2025',
      phase: 'E', // for CP
      element: '', // for CP
      atp: '' // for ATP
  })
  
  const [subjectSearch, setSubjectSearch] = useState('')

  useEffect(() => {
      if (user?.teacherProfile?.id) {
          fetchSubjects()
          fetchTPs()
          // fetchCPs called when subject active
      }
  }, [user])

  useEffect(() => {
      if(activeSubject) {
          fetchCPs()
      }
  }, [activeSubject])

  const fetchSubjects = async () =>{
      try {
          let urlSubjects = '/api/subjects'
          if (user.role === 'TEACHER' && user.teacherProfile?.id) {
             urlSubjects += `?teacherId=${user.teacherProfile.id}`
          }
          const res = await fetch(urlSubjects)
          const data = await res.json()
          setSubjects(data.subjects || [])
      } catch (e) { console.error(e) }
  }

  const fetchTPs = async () => {
      setLoading(true)
      try {
          const res = await fetch(`/api/learning-objectives`) 
          const data = await res.json()
          setTps(data.learningObjectives || [])
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
  }

  const fetchCPs = async () => {
      if(!activeSubject) return
      try {
          const res = await fetch(`/api/competency/cp?subjectId=${activeSubject.id}`)
          const data = await res.json()
          setCps(data.cps || [])
      } catch (e) { console.error(e) }
  }

  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
      if (!user?.teacherProfile?.id && activeTab === 'tp') {
         toast.error("Profil guru tidak ditemukan")
         return
      }
      if (!activeSubject) return

      // Validation
      if (!form.desc) {
          toast.error("Deskripsi tidak boleh kosong")
          return
      }
      if (activeTab === 'tp' && !form.code) {
          toast.error("Kode TP tidak boleh kosong")
          return
      }
      
      setIsSaving(true)
      try {
          let url = '/api/learning-objectives'
          let method = editingId ? 'PUT' : 'POST'
          let body: any = {}

          if (activeTab === 'tp') {
              body = {
                  id: editingId, // used for PUT
                  code: form.code,
                  description: form.desc,
                  subjectId: activeSubject.id,
                  teacherId: user.teacherProfile.id,
                  grade: form.grade,
                  semester: form.semester,
                  schoolYear: form.schoolYear,
                  atp: form.atp
              }
          } else if (activeTab === 'cp') {
              url = '/api/competency/cp'
              body = {
                  id: editingId, // used for PUT
                  subjectId: activeSubject.id,
                  code: form.code, // optional
                  description: form.desc,
                  phase: form.phase,
                  element: form.element
              }
          } 

          const res = await fetch(url, {
              method: method,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body)
          })

          if (res.ok) {
              toast.success(`Data berhasil ${editingId ? 'diperbarui' : 'disimpan'}`)
              setIsDialogOpen(false)
              setEditingId(null) // Reset editing state
              if(activeTab === 'tp') fetchTPs()
              if(activeTab === 'cp') fetchCPs()
              setForm({ ...form, code: '', desc: '', atp: '', element: '' })
          } else {
              toast.error('Gagal menyimpan data')
          }
      } catch (e) {
          toast.error('Terjadi kesalahan sistem')
      } finally {
          setIsSaving(false)
      }
  }

  const handleEdit = (item: any, type: 'cp' | 'tp') => {
      setEditingId(item.id)
      if (type === 'cp') {
          setForm({
              ...form,
              desc: item.description,
              phase: item.phase || 'E',
              element: item.element || '',
              // code: item.code || '' // if CP has code
          })
      } else {
          setForm({
              ...form,
              code: item.code,
              desc: item.description,
              grade: item.grade,
              semester: item.semester,
              schoolYear: item.schoolYear,
              atp: item.atp || ''
          })
      }
      setIsDialogOpen(true)
  }

  const handleCloseDialog = (open: boolean) => {
      setIsDialogOpen(open)
      if (!open) {
          setEditingId(null)
          setForm({ ...form, code: '', desc: '', atp: '', element: '' })
      }
  }

  // ... (handleDelete - needs to switch based on tab)
  const handleDelete = async (id: string) => {
      if(!confirm('Hapus data ini?')) return
      const url = activeTab === 'cp' ? `/api/competency/cp?id=${id}` : `/api/learning-objectives?id=${id}`
      await fetch(url, { method: 'DELETE' })
      if(activeTab === 'cp') fetchCPs()
      else fetchTPs()
  }

  const filteredSubjects = subjects.filter(s => 
      s.name.toLowerCase().includes(subjectSearch.toLowerCase()) || 
      s.code.toLowerCase().includes(subjectSearch.toLowerCase())
  )

  const currentSubjectTps = activeSubject ? tps.filter(tp => tp.subjectId === activeSubject.id) : []

  if (view === 'list') {
      // ... (Same list view, just title change maybe?)
      return (
          <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                      <h1 className="text-3xl font-extrabold text-brand-deep">Kelola Kompetensi Pembelajaran</h1>
                      <p className="text-gray-400 font-medium">Manajemen CP, TP, dan ATP per mata pelajaran</p>
                  </div>
                  {/* ... Search Input code ... */}
                  <div className="relative w-full md:w-72">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input 
                        placeholder="Cari Mata Pelajaran..." 
                        value={subjectSearch}
                        onChange={e => setSubjectSearch(e.target.value)}
                        className="pl-10 rounded-2xl bg-white border-none shadow-sm h-12"
                      />
                  </div>
              </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSubjects.map(subject => {
                      const subjectTpCount = tps.filter(tp => tp.subjectId === subject.id).length
                      return (
                          <Card 
                              key={subject.id} 
                              className="rounded-3xl border-none shadow-xl bg-white p-6 hover:shadow-2xl transition-all cursor-pointer group"
                              onClick={() => { setActiveSubject(subject); setView('detail') }}
                          >
                              <div className="flex items-center justify-between mb-4">
                                  <div className="w-12 h-12 rounded-2xl bg-brand-deep/5 flex items-center justify-center text-brand-deep group-hover:bg-brand-deep group-hover:text-white transition-colors">
                                      <BookOpen className="w-6 h-6" />
                                  </div>
                                  <Badge className="bg-indigo-50 text-indigo-600 border-none rounded-lg">{subject.code}</Badge>
                              </div>
                              <h3 className="text-xl font-black text-gray-900 mb-2 group-hover:text-brand-deep transition-colors">{subject.name}</h3>
                              <div className="flex items-center justify-between text-sm text-gray-500 font-bold">
                                  <span>Total TP: {subjectTpCount}</span>
                                  <Button variant="ghost" className="text-brand-purple hover:bg-brand-purple/10 -mr-2">Kelola <ArrowRight className="w-4 h-4 ml-1" /></Button>
                              </div>
                          </Card>
                      )
                  })}
              </div>
          </div>
      )
  }

  return (
    <div className="space-y-8">
        {/* Header & Dialog */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => setView('list')} className="rounded-xl h-12 w-12 p-0 bg-white shadow-sm hover:bg-gray-50">
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </Button>
                <div>
                    <h1 className="text-3xl font-extrabold text-brand-deep">{activeSubject?.name}</h1>
                    <p className="text-gray-400 font-medium">Pengelolaan Capaian & Tujuan Pembelajaran</p>
                </div>
            </div>
            {/* Show Add Button ONLY for CP and TP tabs */}
            {activeTab !== 'atp' && (
                <Button onClick={() => { setEditingId(null); setForm({...form, code:'', desc:'', atp:'', element:''}); setIsDialogOpen(true) }} className="rounded-2xl bg-brand-deep hover:bg-brand-deep/90 shadow-lg px-8 py-6 h-auto transition-all hover:scale-105">
                    <Plus className="w-5 h-5 mr-3" />
                    <span className="font-bold">Tambah {activeTab.toUpperCase()} Baru</span>
                </Button>
            )}
        </div>

        {/* Dialog Content */}
        <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
            <DialogContent className="rounded-4xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-brand-deep">
                        {editingId ? 'Edit' : 'Tambah'} {activeTab === 'cp' ? 'Capaian Pembelajaran (CP)' : 'Tujuan Pembelajaran (TP)'}
                    </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {/* CP FORM */}
                    {activeTab === 'cp' && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Fase</Label>
                                    <Select value={form.phase} onValueChange={v => setForm({...form, phase: v})}>
                                        <SelectTrigger className="rounded-xl border-gray-100"><SelectValue /></SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value="A">Fase A (Kelas 1-2)</SelectItem>
                                            <SelectItem value="B">Fase B (Kelas 3-4)</SelectItem>
                                            <SelectItem value="C">Fase C (Kelas 5-6)</SelectItem>
                                            <SelectItem value="D">Fase D (Kelas 7-9)</SelectItem>
                                            <SelectItem value="E">Fase E (Kelas 10)</SelectItem>
                                            <SelectItem value="F">Fase F (Kelas 11-12)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Elemen</Label>
                                    <Input placeholder="Contoh: Bilangan" value={form.element} onChange={e => setForm({...form, element: e.target.value})} className="rounded-xl" />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Deskripsi CP</Label>
                                <Input placeholder="Peserta didik mampu..." value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} className="rounded-xl" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Semester</Label>
                                    <Select value={form.semester} onValueChange={v => setForm({...form, semester: v})}>
                                        <SelectTrigger className="rounded-xl border-gray-100"><SelectValue /></SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value="1">Semester 1 (Ganjil)</SelectItem>
                                            <SelectItem value="2">Semester 2 (Genap)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Tahun Pelajaran</Label>
                                    <Input placeholder="2024/2025" value={form.schoolYear} onChange={e => setForm({...form, schoolYear: e.target.value})} className="rounded-xl" />
                                </div>
                            </div>
                        </>
                    )}

                    {/* TP FORM */}
                    {activeTab === 'tp' && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Kode TP</Label>
                                    <Input placeholder="Contoh: TP 1.1" value={form.code} onChange={e => setForm({...form, code: e.target.value})} className="rounded-xl" />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Kelas/Fase</Label>
                                    <Select value={form.grade} onValueChange={v => setForm({...form, grade: v})}>
                                        <SelectTrigger className="rounded-xl border-gray-100"><SelectValue /></SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value="1">Kelas 1</SelectItem>
                                            <SelectItem value="2">Kelas 2</SelectItem>
                                            <SelectItem value="3">Kelas 3</SelectItem>
                                            <SelectItem value="4">Kelas 4</SelectItem>
                                            <SelectItem value="5">Kelas 5</SelectItem>
                                            <SelectItem value="6">Kelas 6</SelectItem>
                                            <SelectItem value="7">Kelas 7</SelectItem>
                                            <SelectItem value="8">Kelas 8</SelectItem>
                                            <SelectItem value="9">Kelas 9</SelectItem>
                                            <SelectItem value="10">Kelas 10</SelectItem>
                                            <SelectItem value="11">Kelas 11</SelectItem>
                                            <SelectItem value="12">Kelas 12</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Deskripsi Tujuan Pembelajaran</Label>
                                <Input placeholder="Siswa mampu..." value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} className="rounded-xl" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Semester</Label>
                                    <Select value={form.semester} onValueChange={v => setForm({...form, semester: v})}>
                                        <SelectTrigger className="rounded-xl border-gray-100"><SelectValue /></SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value="1">Semester 1 (Ganjil)</SelectItem>
                                            <SelectItem value="2">Semester 2 (Genap)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Tahun Pelajaran</Label>
                                    <Input placeholder="2024/2025" value={form.schoolYear} onChange={e => setForm({...form, schoolYear: e.target.value})} className="rounded-xl" />
                                </div>
                            </div>
                        </>
                    )}
                </div>
                <DialogFooter>
                    <Button onClick={handleSave} disabled={isSaving} className="w-full rounded-xl bg-brand-deep">
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Simpan'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Tabs for CP, TP, ATP */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6 bg-white p-1 rounded-2xl border flex items-center justify-start h-auto w-full md:w-auto overflow-x-auto no-scrollbar scroll-smooth gap-1">
                <TabsTrigger value="cp" className="rounded-xl px-4 md:px-6 py-3 whitespace-nowrap data-[state=active]:bg-brand-deep data-[state=active]:text-white flex-1 md:flex-none transition-all">Capaian Pembelajaran (CP)</TabsTrigger>
                <TabsTrigger value="tp" className="rounded-xl px-4 md:px-6 py-3 whitespace-nowrap data-[state=active]:bg-brand-deep data-[state=active]:text-white flex-1 md:flex-none transition-all">Tujuan Pembelajaran (TP)</TabsTrigger>
                <TabsTrigger value="atp" className="rounded-xl px-4 md:px-6 py-3 whitespace-nowrap data-[state=active]:bg-brand-deep data-[state=active]:text-white flex-1 md:flex-none transition-all">Alur Tujuan Pembelajaran (ATP)</TabsTrigger>
            </TabsList>

            <TabsContent value="cp" className="w-full">
                 <div className="grid gap-4">
                     {cps.length === 0 ? <p className="text-center py-10 text-gray-400 italic">Belum ada data CP</p> : 
                      cps.map(cp => (
                        <Card key={cp.id} className="p-8 rounded-[2rem] border-none shadow-xl bg-white hover:shadow-2xl transition-all group relative overflow-hidden">
                             <div className="flex justify-between items-start gap-6 relative z-10">
                                 <div className="flex gap-6">
                                     <div className="hidden md:flex w-16 h-16 bg-indigo-50 rounded-2xl items-center justify-center text-brand-purple shrink-0 group-hover:bg-brand-deep group-hover:text-white transition-all shadow-inner">
                                        <Target className="w-8 h-8" />
                                     </div>
                                     <div>
                                         <div className="flex flex-wrap gap-2 mb-3">
                                             <Badge className="bg-blue-50 text-blue-600 border-none px-3 py-1 rounded-lg font-black text-[10px] uppercase tracking-wider">Fase {cp.phase}</Badge>
                                             <Badge className="bg-orange-50 text-orange-600 border-none px-3 py-1 rounded-lg font-black text-[10px] uppercase tracking-wider">{cp.element}</Badge>
                                         </div>
                                         <p className="text-gray-900 font-bold leading-relaxed text-lg group-hover:text-brand-deep transition-colors">{cp.description}</p>
                                     </div>
                                 </div>
                                 <div className="flex gap-2">
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => handleEdit(cp, 'cp')} 
                                        className="h-10 w-10 rounded-xl hover:bg-brand-purple/5 transition-all"
                                    >
                                        <Edit2 className="w-5 h-5 text-gray-400 group-hover:text-brand-purple" />
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => handleDelete(cp.id)} 
                                        className="h-10 w-10 rounded-xl hover:bg-red-50 transition-all"
                                    >
                                        <Trash2 className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
                                    </Button>
                                 </div>
                             </div>
                             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/30 rounded-full blur-3xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </Card>
                      ))}
                 </div>
            </TabsContent>

            <TabsContent value="tp" className="w-full">
                 <div className="grid gap-4">
                     {currentSubjectTps.length === 0 ? <p className="text-center py-10 text-gray-400 italic">Belum ada data TP</p> : 
                      currentSubjectTps.map(tp => (
                        <Card key={tp.id} className="p-8 rounded-[2rem] border-none shadow-xl bg-white hover:shadow-2xl transition-all group relative overflow-hidden">
                             <div className="flex justify-between items-start gap-6 relative z-10">
                                 <div className="flex gap-6">
                                     <div className="hidden md:flex w-16 h-16 bg-brand-deep rounded-2xl items-center justify-center text-white font-black text-xl shrink-0 transition-transform group-hover:scale-110 shadow-lg shadow-brand-deep/20">
                                         {tp.code.split(' ')[1] || tp.code}
                                     </div>
                                     <div>
                                         <div className="flex flex-wrap gap-2 mb-2">
                                             <Badge className="bg-indigo-50 text-indigo-600 border-none px-3 py-1 rounded-lg font-black text-[10px] uppercase tracking-wider">Kelas {tp.grade}</Badge>
                                             {tp.atp && <Badge className="bg-emerald-50 text-emerald-600 border-none px-3 py-1 rounded-lg font-black text-[10px] uppercase tracking-wider">ATP: {tp.atp}</Badge>}
                                         </div>
                                         <p className="text-gray-900 font-bold leading-relaxed text-lg group-hover:text-brand-deep transition-colors">{tp.description}</p>
                                     </div>
                                 </div>
                                 <div className="flex gap-2">
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => handleEdit(tp, 'tp')} 
                                        className="h-10 w-10 rounded-xl hover:bg-brand-purple/5 transition-all"
                                    >
                                        <Edit2 className="w-5 h-5 text-gray-400 group-hover:text-brand-purple" />
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => handleDelete(tp.id)} 
                                        className="h-10 w-10 rounded-xl hover:bg-red-50 transition-all"
                                    >
                                        <Trash2 className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
                                    </Button>
                                 </div>
                             </div>
                             <div className="absolute bottom-0 right-0 w-40 h-40 bg-brand-deep/5 rounded-full blur-3xl -mr-20 -mb-20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </Card>
                      ))}
                 </div>
            </TabsContent>

            <TabsContent value="atp" className="w-full">
                 <Card className="p-8 rounded-[2.5rem] bg-indigo-900 text-white shadow-2xl overflow-hidden relative">
                      <div className="relative z-10"> 
                          <h3 className="text-2xl font-bold mb-6 flex items-center"><Layers className="mr-3" /> Alur Tujuan Pembelajaran</h3>
                          <div className="space-y-6">
                              {currentSubjectTps.sort((a,b) => a.code.localeCompare(b.code)).map((tp, idx) => (
                                  <div key={tp.id} className="flex gap-6 relative">
                                      {/* Timeline Line */}
                                      {idx !== currentSubjectTps.length - 1 && <div className="absolute left-6 top-10 bottom-[-24px] w-0.5 bg-white/20"></div>}
                                      
                                      <div className="w-12 h-12 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center shrink-0 font-bold">
                                          {idx + 1}
                                      </div>
                                      <div className="pt-2">
                                          <div className="flex items-center gap-3 mb-1">
                                            <span className="font-bold text-indigo-200">{tp.code}</span>
                                            <Badge className="bg-indigo-500/50 hover:bg-indigo-500/50 border-none text-white">{tp.grade}</Badge>
                                          </div>
                                          <p className="text-lg font-medium leading-normal">{tp.description}</p>
                                          {tp.atp && <p className="text-sm text-indigo-300 mt-1 italic">{tp.atp}</p>}
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                      {/* Decorative Background */}
                      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                 </Card>
            </TabsContent>
        </Tabs>
    </div>
  )
}
