'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Target, Users, BookOpen, Layers, CheckCircle2, MoreHorizontal, Loader2, Save, X, Pencil, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from 'sonner'

interface P5Project {
  id: string
  title: string
  description?: string
  phase: string
  schoolYear: string
  status?: string // Not in schema, assuming derived or static for now, or use 'phase' logic
  _count: { 
    members: number
    targets: number
  }
}

interface P5Target {
  id: string
  projectId: string
  dimension: string
  element: string
  subElement: string
  target: string
  project?: {
    title: string
    phase: string
  }
}

export default function P5Management() {
  const [activePhase, setActivePhase] = useState('E')
  const [projects, setProjects] = useState<P5Project[]>([])
  const [targets, setTargets] = useState<P5Target[]>([])
  const [loading, setLoading] = useState(true)
  
  // Stats
  const [stats, setStats] = useState({
    activeProjects: 0,
    totalTargets: 0,
    totalStudents: 0
  })

  // Project Dialog
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false)
  const [projectFormData, setProjectFormData] = useState({
    title: '',
    description: '',
    phase: 'E',
  })
  const [editingProject, setEditingProject] = useState<P5Project | null>(null)

  // Target Dialog
  const [isTargetDialogOpen, setIsTargetDialogOpen] = useState(false)
  const [targetFormData, setTargetFormData] = useState({
    projectId: '',
    dimension: '',
    element: '',
    subElement: '',
    target: ''
  })
  const [editingTarget, setEditingTarget] = useState<P5Target | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const phases = ['A', 'B', 'C', 'D', 'E', 'F']

  useEffect(() => {
    fetchData()
  }, [activePhase])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch Projects (all or filtered by phase? Typically UI shows list filtered by tab, but here separated)
      // For stats we need all. For list we filter by Active Phase usually? 
      // The designs shows "Daftar Projek" in one tab and "Target Capaian" in another.
      // Targets are filtered by Phase buttons. Projects list might imply showing all or filtered.
      // Let's fetch all projects to calculate stats and show in list (maybe filtered by phase too if desired)
      
      const resProjects = await fetch('/api/p5/projects')
      const dataProjects = await resProjects.json()
      
      // Fetch Targets filtered by active Phase
      const resTargets = await fetch(`/api/p5/targets?phase=${activePhase}`)
      const dataTargets = await resTargets.json()

      if (resProjects.ok && resTargets.ok) {
        setProjects(dataProjects.projects)
        setTargets(dataTargets.targets)
        
        // Calculate Stats
        const totalStudents = dataProjects.projects.reduce((acc: number, curr: any) => acc + curr._count.members, 0)
        const totalTargetsCount = dataProjects.projects.reduce((acc: number, curr: any) => acc + curr._count.targets, 0) // Or use total targets from DB if API supported count
        // For accurate total targets count across ALL phases, we might need a separate stats API or fetch all targets.
        // For now, let's use the local loaded targets count or sum from projects
        
        setStats({
          activeProjects: dataProjects.projects.length,
          totalTargets: totalTargetsCount, 
          totalStudents: totalStudents
        })
      }
    } catch (error) {
      console.error(error)
      toast.error('Gagal mengambil data')
    } finally {
      setLoading(false)
    }
  }

  // --- Project Handlers ---

  const handleOpenProjectDialog = (project?: P5Project) => {
    if (project) {
      setEditingProject(project)
      setProjectFormData({
        title: project.title,
        description: project.description || '',
        phase: project.phase,
      })
    } else {
      setEditingProject(null)
      setProjectFormData({ title: '', description: '', phase: activePhase })
    }
    setIsProjectDialogOpen(true)
  }

  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const url = '/api/p5/projects'
      const method = editingProject ? 'PUT' : 'POST'
      const body = editingProject ? { ...projectFormData, id: editingProject.id } : projectFormData

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (res.ok) {
        toast.success(editingProject ? 'Projek diperbarui' : 'Projek ditambahkan')
        setIsProjectDialogOpen(false)
        fetchData()
      } else {
        toast.error('Gagal menyimpan projek')
      }
    } catch (error) {
       toast.error('Terjadi kesalahan')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Hapus projek ini?')) return
    try {
      const res = await fetch(`/api/p5/projects?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Projek dihapus')
        fetchData()
      } else {
        toast.error('Gagal menghapus')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    }
  }

  // --- Target Handlers ---

  const handleOpenTargetDialog = (target?: P5Target) => {
    if (target) {
      setEditingTarget(target)
      setTargetFormData({
        projectId: target.projectId,
        dimension: target.dimension,
        element: target.element,
        subElement: target.subElement,
        target: target.target
      })
    } else {
      setEditingTarget(null)
      // Default to first project in active phase if available
      const defaultProject = projects.find(p => p.phase === activePhase)
      setTargetFormData({
        projectId: defaultProject?.id || '',
        dimension: '',
        element: '',
        subElement: '',
        target: ''
      })
    }
    setIsTargetDialogOpen(true)
  }

  const handleSubmitTarget = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const url = '/api/p5/targets'
      const method = editingTarget ? 'PUT' : 'POST'
      const body = editingTarget ? { ...targetFormData, id: editingTarget.id } : targetFormData

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (res.ok) {
        toast.success(editingTarget ? 'Target diperbarui' : 'Target ditambahkan')
        setIsTargetDialogOpen(false)
        fetchData()
      } else {
        toast.error('Gagal menyimpan target')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTarget = async (id: string) => {
    if (!confirm('Hapus target ini?')) return
    try {
      const res = await fetch(`/api/p5/targets?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Target dihapus')
        fetchData()
      } else {
        toast.error('Gagal menghapus')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-deep">Projek Penguatan Profil Pelajar Pancasila (P5)</h1>
          <p className="text-gray-400 font-medium">Kelola target capaian dan projek lintas mata pelajaran</p>
        </div>
        <div className="flex gap-3">
            <Button 
                onClick={() => handleOpenProjectDialog()}
                className="rounded-2xl bg-brand-deep hover:bg-brand-deep/90 shadow-lg px-8 py-6 h-auto"
            >
            <Plus className="w-5 h-5 mr-3" />
            <span className="font-bold">Projek Baru</span>
            </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="rounded-3xl border-none bg-indigo-50/50 p-6 shadow-sm border border-indigo-100/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-1">Projek Aktif</p>
              <div className="text-3xl font-black text-brand-deep">{stats.activeProjects}</div>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
              <Layers className="w-6 h-6" />
            </div>
          </div>
        </Card>
        <Card className="rounded-3xl border-none bg-emerald-50/50 p-6 shadow-sm border border-emerald-100/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-1">Target Capaian</p>
              <div className="text-3xl font-black text-brand-deep">{stats.totalTargets}</div>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
              <Target className="w-6 h-6" />
            </div>
          </div>
        </Card>
        <Card className="rounded-3xl border-none bg-orange-50/50 p-6 shadow-sm border border-orange-100/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-orange-600 uppercase tracking-wider mb-1">Siswa Terlibat</p>
              <div className="text-3xl font-black text-brand-deep">{stats.totalStudents}</div>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shadow-sm">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="rounded-[2.5rem] border-none shadow-2xl p-8 bg-white">
        <Tabs defaultValue="targets" className="w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <TabsList className="bg-gray-50 p-1.5 rounded-2xl">
              <TabsTrigger value="targets" className="rounded-xl px-8 font-bold data-[state=active]:bg-brand-deep data-[state=active]:text-white transition-all">Target Capaian</TabsTrigger>
              <TabsTrigger value="projects" className="rounded-xl px-8 font-bold data-[state=active]:bg-brand-deep data-[state=active]:text-white transition-all">Daftar Projek</TabsTrigger>
            </TabsList>

            <div className="flex items-center space-x-2 bg-gray-50 p-1 rounded-2xl">
              {phases.map(p => (
                <button
                  key={p}
                  onClick={() => setActivePhase(p)}
                  className={`px-4 py-2 rounded-xl text-sm font-black transition-all ${activePhase === p ? 'bg-white text-brand-deep shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Fase {p}
                </button>
              ))}
            </div>
          </div>

          <TabsContent value="targets" className="space-y-6 outline-none">
             <div className="flex justify-end">
                <Button onClick={() => handleOpenTargetDialog()} className="rounded-xl font-bold bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-none">
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Target
                </Button>
             </div>

             {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gray-300" /></div>
             ) : targets.length === 0 ? (
                <div className="text-center py-12 text-gray-400">Tidak ada target capaian untuk Fase {activePhase}</div>
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {targets.map((item) => (
                    <Card key={item.id} className="rounded-3xl border border-gray-100 p-6 hover:shadow-lg transition-all group relative">
                     <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-brand-deep" onClick={() => handleOpenTargetDialog(item)}>
                            <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-red-500" onClick={() => handleDeleteTarget(item.id)}>
                            <Trash2 className="w-4 h-4" />
                        </Button>
                     </div>
                    <div className="flex flex-col h-full">
                        <Badge className="w-fit mb-4 bg-brand-purple/10 text-brand-purple border-none rounded-lg px-3 py-1 font-bold text-[10px] uppercase tracking-wider">
                            {item.dimension}
                        </Badge>
                        <h4 className="font-bold text-gray-900 mb-2 group-hover:text-brand-deep transition-colors pr-8">
                            {item.subElement || item.element}
                        </h4>
                        <p className="text-sm text-gray-500 font-medium leading-relaxed flex-1">
                            {item.target}
                        </p>
                        <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.project?.title || '-'}</span>
                        <Badge variant="secondary" className="rounded-lg text-[10px] font-bold">Fase {activePhase}</Badge>
                        </div>
                    </div>
                    </Card>
                ))}
                </div>
             )}
          </TabsContent>

          <TabsContent value="projects" className="space-y-6 outline-none">
            {loading ? (
                 <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gray-300" /></div>
            ) : projects.length === 0 ? (
                 <div className="text-center py-12 text-gray-400">Belum ada data projek</div>
            ) : (
                <div className="space-y-4">
                {projects.map((project) => (
                    <div key={project.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 rounded-3xl border border-gray-100 hover:bg-gray-50 transition-all group gap-4 md:gap-0">
                    <div className="flex items-center space-x-6">
                        <div className="w-16 h-16 rounded-2xl bg-brand-deep/5 flex items-center justify-center text-brand-deep shrink-0">
                             <BookOpen className="w-8 h-8" />
                        </div>
                        <div>
                        <h4 className="font-bold text-lg text-gray-900">{project.title}</h4>
                        <p className="text-sm text-gray-500 font-medium">{project.description || 'Tidak ada deskripsi'}</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between md:justify-end space-x-4 md:space-x-12 w-full md:w-auto">
                        <div className="text-center">
                            <p className="text-xl font-black text-brand-deep">{project._count?.members || 0}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Siswa</p>
                        </div>
                        <Badge variant="outline" className={`rounded-xl px-4 py-1 font-bold bg-blue-50 text-blue-600 border-blue-100`}>
                            Fase {project.phase}
                        </Badge>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white hover:shadow-md transition-all">
                                    <MoreHorizontal className="w-5 h-5 text-gray-400 group-hover:text-brand-deep" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl border-none shadow-lg">
                                <DropdownMenuItem onClick={() => handleOpenProjectDialog(project)} className="rounded-lg cursor-pointer font-medium p-2.5">
                                    Edit Projek
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteProject(project.id)} className="rounded-lg cursor-pointer font-medium p-2.5 text-red-500 focus:text-red-500 focus:bg-red-50">
                                    Hapus Projek
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    </div>
                ))}
                </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>

      {/* Project Dialog */}
      <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-8">
            <DialogHeader>
                <DialogTitle className="text-2xl font-black text-brand-deep">
                    {editingProject ? 'Edit Projek' : 'Projek Baru'}
                </DialogTitle>
                <DialogDescription>
                    Buat projek baru untuk kegiatan P5.
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitProject} className="space-y-4 mt-2">
                <div className="space-y-2">
                    <Label>Judul Projek</Label>
                    <Input 
                        value={projectFormData.title} 
                        onChange={e => setProjectFormData({...projectFormData, title: e.target.value})}
                        placeholder="Contoh: Gaya Hidup Berkelanjutan"
                        className="rounded-xl"
                        required 
                    />
                </div>
                 <div className="space-y-2">
                    <Label>Fase</Label>
                    <Select value={projectFormData.phase} onValueChange={v => setProjectFormData({...projectFormData, phase: v})}>
                        <SelectTrigger className="rounded-xl">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            {phases.map(p => (
                                <SelectItem key={p} value={p}>Fase {p}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Deskripsi / Tema</Label>
                    <Textarea 
                         value={projectFormData.description} 
                         onChange={e => setProjectFormData({...projectFormData, description: e.target.value})}
                         placeholder="Contoh: Pengolahan Sampah Plastik"
                         className="rounded-xl h-24 resize-none"
                    />
                </div>
                <DialogFooter className="pt-4">
                    <Button type="button" variant="ghost" onClick={() => setIsProjectDialogOpen(false)} className="rounded-xl">Batal</Button>
                    <Button type="submit" disabled={isSubmitting} className="rounded-xl bg-brand-deep font-bold">
                        {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : 'Simpan'}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>

      {/* Target Dialog */}
      <Dialog open={isTargetDialogOpen} onOpenChange={setIsTargetDialogOpen}>
        <DialogContent className="sm:max-w-lg rounded-3xl p-8">
            <DialogHeader>
                <DialogTitle className="text-2xl font-black text-brand-deep">
                    {editingTarget ? 'Edit Target' : 'Target Capaian Baru'}
                </DialogTitle>
                <DialogDescription>
                    Tentukan target capaian untuk Fase {activePhase}.
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitTarget} className="space-y-4 mt-2">
                 <div className="space-y-2">
                    <Label>Projek Terkait</Label>
                    <Select 
                        value={targetFormData.projectId} 
                        onValueChange={v => setTargetFormData({...targetFormData, projectId: v})}
                        required
                    >
                        <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Pilih Projek" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            {projects.filter(p => p.phase === activePhase).map(p => (
                                <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                            ))}
                            {projects.filter(p => p.phase === activePhase).length === 0 && (
                                <div className="p-2 text-sm text-gray-400">Tidak ada projek di fase ini</div>
                            )}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Dimensi</Label>
                    <Input 
                        value={targetFormData.dimension}
                        onChange={e => setTargetFormData({...targetFormData, dimension: e.target.value})}
                        placeholder="Contoh: Beriman, Bertakwa..."
                        className="rounded-xl"
                        required
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Elemen</Label>
                        <Input 
                            value={targetFormData.element}
                            onChange={e => setTargetFormData({...targetFormData, element: e.target.value})}
                            placeholder="Elemen"
                            className="rounded-xl"
                        />
                    </div>
                     <div className="space-y-2">
                        <Label>Sub Elemen</Label>
                        <Input 
                            value={targetFormData.subElement}
                            onChange={e => setTargetFormData({...targetFormData, subElement: e.target.value})}
                            placeholder="Sub Elemen"
                            className="rounded-xl"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Target Capaian</Label>
                    <Textarea 
                         value={targetFormData.target} 
                         onChange={e => setTargetFormData({...targetFormData, target: e.target.value})}
                         placeholder="Deskripsi target capaian..."
                         className="rounded-xl h-24 resize-none"
                         required
                    />
                </div>
                <DialogFooter className="pt-4">
                    <Button type="button" variant="ghost" onClick={() => setIsTargetDialogOpen(false)} className="rounded-xl">Batal</Button>
                    <Button type="submit" disabled={isSubmitting} className="rounded-xl bg-brand-deep font-bold">
                        {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : 'Simpan'}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
