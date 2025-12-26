'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Save, Search, AlertCircle, Loader2, CheckSquare, ChevronRight, User, BookOpen, Clock, Filter, GraduationCap, XCircle, RotateCcw, FileText } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

function Label({ children, className }: { children: React.ReactNode, className?: string }) {
   return <span className={className}>{children}</span>
}

// Skeleton Components for Premium Loading Feel
const CardSkeleton = () => (
    <Card className="rounded-3xl border-none shadow-xl bg-white p-6 animate-pulse">
        <div className="h-2 w-16 bg-gray-100 rounded mb-4"></div>
        <div className="h-14 bg-gray-50 rounded-2xl"></div>
    </Card>
)

const RowSkeleton = () => (
    <TableRow className="border-gray-50 animate-pulse">
        <TableCell className="px-8 py-6"><div className="flex items-center space-x-4"><div className="w-10 h-10 rounded-2xl bg-gray-100"></div><div className="space-y-2"><div className="h-4 w-32 bg-gray-100 rounded"></div><div className="h-3 w-20 bg-gray-50 rounded"></div></div></div></TableCell>
        <TableCell className="px-8 py-6"><div className="w-20 h-12 bg-gray-100 rounded-xl mx-auto"></div></TableCell>
        <TableCell className="px-8 py-6"><div className="h-20 bg-gray-50 rounded-xl w-full"></div></TableCell>
    </TableRow>
)

export default function SummativeGradesManagement({ user, onNavigate }: { user: any, onNavigate?: (menu: string) => void }) {
  const [classes, setClasses] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [grades, setGrades] = useState<Record<string, number>>({})
  const [descriptions, setDescriptions] = useState<Record<string, string>>({})

  const [selectedClassId, setSelectedClassId] = useState('')
  const [selectedSubjectId, setSelectedSubjectId] = useState('')
  const selectedType = 'SUMMATIVE' // Hardcoded for Summative Assessment page
  const [semester, setSemester] = useState('1')
  const [schoolYear, setSchoolYear] = useState('2024/2025')
  
  const [search, setSearch] = useState('')
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true)
  const [isLoadingStudents, setIsLoadingStudents] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingMetadata(true)
      try {
        const resClasses = await fetch('/api/classes')
        const dataClasses = await resClasses.json()
        setClasses(dataClasses.classes || [])
        if (dataClasses.classes?.length > 0) setSelectedClassId(dataClasses.classes[0].id)

        let urlSubjects = '/api/subjects'
        if (user.role === 'TEACHER' && user.teacherProfile?.id) {
           urlSubjects += `?teacherId=${user.teacherProfile.id}`
        }
        const resSubjects = await fetch(urlSubjects)
        const dataSubjects = await resSubjects.json()
        setSubjects(dataSubjects.subjects || [])
        if (dataSubjects.subjects?.length > 0) setSelectedSubjectId(dataSubjects.subjects[0].id)

      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Gagal memuat data metadata')
      } finally {
        setIsLoadingMetadata(false)
      }
    }
    fetchData()
  }, [user])

  useEffect(() => {
    if (!selectedClassId || !selectedSubjectId) return

    const fetchStudentsAndGrades = async () => {
      setIsLoadingStudents(true)
      try {
        const resStudents = await fetch(`/api/students?classId=${selectedClassId}&limit=100`)
        const dataStudents = await resStudents.json()
        setStudents(dataStudents.students || [])

        const resGrades = await fetch(`/api/grades?subjectId=${selectedSubjectId}&semester=${semester}&schoolYear=${schoolYear}`)
        const dataGrades = await resGrades.json()
        
        const gradeMap: Record<string, number> = {}
        const descMap: Record<string, string> = {}
        dataGrades.grades.forEach((g: any) => {
           if (g.type === selectedType) {
              gradeMap[g.student.id] = g.score
              if (g.notes) descMap[g.student.id] = g.notes
           }
        })
        setGrades(gradeMap)
        setDescriptions(descMap)

      } catch (error) {
        console.error("Error fetching students/grades", error)
        toast.error("Gagal memuat data nilai")
      } finally {
        setIsLoadingStudents(false)
      }
    }

    fetchStudentsAndGrades()
  }, [selectedClassId, selectedSubjectId, selectedType, semester, schoolYear])

  const handleScoreChange = (studentId: string, value: string) => {
    const score = parseFloat(value)
    if (!isNaN(score)) {
      setGrades(prev => ({ ...prev, [studentId]: score }))
    } else {
       const newGrades = {...grades}
       delete newGrades[studentId]
       setGrades(newGrades)
    }
  }

  const handleSave = async () => {
    if (!selectedClassId || !selectedSubjectId) {
      toast.error('Pilih Kelas dan Mapel terlebih dahulu')
      return
    }
    
    setIsSaving(true)
    try {
      const promises = students.map(async (student) => {
         const score = grades[student.id]
         if (score === undefined) return 
         
         const payload = {
            studentId: student.id,
            subjectId: selectedSubjectId,
            type: selectedType,
            score: score,
            maxScore: 100,
            semester: semester,
            schoolYear: schoolYear,
            notes: descriptions[student.id] || getAutoDescription(score)
         }

         const res = await fetch('/api/grades', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
         })
         
         if (!res.ok) throw new Error('Failed to save')
         return res.json()
      })

      await Promise.all(promises)
      toast.success(`Nilai ${selectedType} berhasil disimpan`, {
          description: `Telah memperbarui ${students.length} catatan nilai.`
      })
    } catch (error: any) {
      toast.error('Gagal menyimpan nilai')
    } finally {
      setIsSaving(false)
    }
  }

  const [tps, setTps] = useState<any[]>([])
  const [selectedTpIds, setSelectedTpIds] = useState<string[]>([])

  useEffect(() => {
     if(!selectedSubjectId) return
     const fetchAssociatedTPs = async () => {
        const cls = classes.find(c => c.id === selectedClassId)
        const gradeLevel = cls ? cls.grade : ''
        
        try {
            let url = `/api/learning-objectives?subjectId=${selectedSubjectId}&grade=${gradeLevel}`
            const res = await fetch(url)
            const data = await res.json()
            setTps(data.learningObjectives || [])
        } catch(e) { console.error(e) }
     }
     fetchAssociatedTPs()
  }, [selectedSubjectId, selectedClassId])

  const handleToggleTp = (tpId: string) => {
      const nextTpIds = selectedTpIds.includes(tpId) 
        ? selectedTpIds.filter(id => id !== tpId) 
        : [...selectedTpIds, tpId]
        
      setSelectedTpIds(nextTpIds)
      
      // Automatically adjust all descriptions based on new TP selection
      const updatedDescs = { ...descriptions }
      students.forEach(student => {
          const score = grades[student.id]
          if (score !== undefined) {
              updatedDescs[student.id] = getAutoDescription(score, nextTpIds)
          }
      })
      setDescriptions(updatedDescs)
  }

  const getAutoDescription = (score: number, customTpIds?: string[]) => {
    if (!score && score !== 0) return '-'
    const targetTpIds = customTpIds || selectedTpIds
    const selectedTps = tps.filter(tp => targetTpIds.includes(tp.id))
    
    if (selectedTps.length === 0) {
        if (score >= 93) return "Menunjukkan penguasaan yang sangat baik dalam materi pembelajaran."
        if (score >= 84) return "Menunjukkan penguasaan yang baik dalam materi pembelajaran."
        if (score >= 75) return "Menunjukkan penguasaan yang cukup dalam materi pembelajaran."
        return "Perlu bimbingan lebih lanjut dalam materi pembelajaran."
    }

    // Retrieve unique CP elements for context
    const cpElement = selectedTps[0].cp?.element ? ` pada elemen ${selectedTps[0].cp.element}` : ''
    
    // Format TP descriptions into a comma-separated list
    const descs = selectedTps.map(tp => tp.description)
    if (descs.length === 1) {
        const tpText = descs[0]
        return generateText(score, tpText, cpElement)
    }
    
    const lastTp = descs.pop()
    const tpText = descs.join(', ') + ' dan ' + lastTp
    return generateText(score, tpText, cpElement)
  }

  const generateText = (score: number, tpText: string, cpElement: string) => {
    if (score >= 90) {
      return `Menunjukkan penguasaan yang sangat baik dalam memahami ${tpText}${cpElement}.`
    } else if (score >= 80) {
      return `Menunjukkan penguasaan yang baik dalam memahami ${tpText}${cpElement}.`
    } else if (score >= 70) {
      return `Menunjukkan penguasaan yang cukup dalam memahami ${tpText}${cpElement}, perlu sedikit bimbingan pada beberapa bagian.`
    }
    return `Perlu bimbingan intensif dalam penguasaan materi ${tpText}${cpElement}.`
  }

  const getScoreStatus = (score: number) => {
      if (score >= 93) return { label: 'Sangat Baik', color: 'bg-emerald-100 text-emerald-700' }
      if (score >= 84) return { label: 'Baik', color: 'bg-blue-100 text-blue-700' }
      if (score >= 75) return { label: 'Cukup', color: 'bg-amber-100 text-amber-700' }
      return { label: 'Kurang', color: 'bg-rose-100 text-rose-700' }
  }

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.nis.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-8 pb-32 max-w-[1600px] mx-auto transition-all duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white/40 backdrop-blur-md p-8 rounded-[3rem] border border-white/40 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-1">
             <div className="p-3 bg-brand-deep rounded-2xl shadow-lg shadow-brand-deep/20 text-white">
                <GraduationCap className="w-6 h-6" />
             </div>
             <Badge className="bg-brand-purple/10 text-brand-purple border-none font-black px-4 py-1.5 rounded-full text-[10px] uppercase tracking-wider">
                Penilaian Akademik
             </Badge>
          </div>
          <h1 className="text-4xl font-black text-brand-deep tracking-tight">Input Nilai <span className="text-brand-purple">Pembelajaran</span></h1>
          <p className="text-gray-500 font-medium max-w-md">Lengkapi nilai harian, UTS, dan UAS dengan teknologi deskripsi otomatis berbasis TP.</p>
        </div>
        <div className="flex gap-4">
        </div>
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2">
         {isLoadingMetadata ? (
             <>
                <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
             </>
         ) : (
            <>
                <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-7 text-left hover:shadow-2xl hover:translate-y-[-4px] transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-4">
                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Mata Pelajaran</Label>
                        <BookOpen className="w-4 h-4 text-gray-300 group-hover:text-brand-purple transition-colors" />
                    </div>
                    <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
                    <SelectTrigger className="w-full rounded-2xl border-none bg-gray-50 h-14 font-bold text-brand-deep px-4 group-hover:bg-indigo-50/50 transition-colors">
                        <SelectValue placeholder="Pilih Mapel" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl">
                        {subjects.map(s => (
                            <SelectItem key={s.id} value={s.id} className="rounded-xl my-1">{s.name}</SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </Card>

                <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-7 text-left hover:shadow-2xl hover:translate-y-[-4px] transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-4">
                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Kelas Target</Label>
                        <User className="w-4 h-4 text-gray-300 group-hover:text-brand-purple transition-colors" />
                    </div>
                    <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                    <SelectTrigger className="w-full rounded-2xl border-none bg-gray-50 h-14 font-bold text-brand-deep px-4 group-hover:bg-indigo-50/50 transition-colors">
                        <SelectValue placeholder="Pilih Kelas" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl">
                        {classes.map(c => (
                            <SelectItem key={c.id} value={c.id} className="rounded-xl my-1">{c.name}</SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </Card>



                <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-7 text-left hover:shadow-2xl hover:translate-y-[-4px] transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-4">
                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Periode Belajar</Label>
                        <Clock className="w-4 h-4 text-gray-300 group-hover:text-brand-purple transition-colors" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <Select value={semester} onValueChange={setSemester}>
                            <SelectTrigger className="w-full rounded-2xl border-none bg-gray-50 h-14 font-bold text-brand-deep px-3 group-hover:bg-indigo-50/50">
                            <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-none">
                            <SelectItem value="1" className="rounded-xl">Ganjil</SelectItem>
                            <SelectItem value="2" className="rounded-xl">Genap</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={schoolYear} onValueChange={setSchoolYear}>
                            <SelectTrigger className="w-full rounded-2xl border-none bg-gray-50 h-14 font-bold text-brand-deep px-3 focus-visible:ring-brand-purple group-hover:bg-indigo-50/50 text-center">
                                <SelectValue placeholder="Tahun..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-none shadow-2xl max-h-[300px]">
                                {Array.from({length: 221}, (_, i) => { 
                                    const start = 2002 + i; 
                                    const yearStr = `${start}/${start+1}`;
                                    return (
                                        <SelectItem key={yearStr} value={yearStr} className="rounded-xl my-1 justify-center font-bold text-gray-600 focus:text-brand-purple focus:bg-indigo-50">
                                            {yearStr}
                                        </SelectItem>
                                    )
                                })}
                            </SelectContent>
                        </Select>
                    </div>
                </Card>
            </>
         )}
      </div>

      {/* TP Selection - Smart Assistant Area */}
      <Card className="rounded-[3rem] border-none bg-indigo-50/50 p-8 shadow-xl relative overflow-hidden group">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
             <div className="flex items-center">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mr-4">
                   <CheckSquare className="w-6 h-6 text-brand-purple" />
                </div>
                <div>
                   <h4 className="font-black text-xl text-brand-deep tracking-tight">Tujuan Pembelajaran (TP)</h4>
                   <p className="text-gray-400 text-sm font-medium">Pilih TP yang ingin dicantumkan dalam deskripsi rapor secara otomatis</p>
                </div>
             </div>
             {tps.length > 0 && (
                 <Badge className="bg-white/80 backdrop-blur-sm border-indigo-100 text-brand-deep font-bold px-4 py-2 rounded-xl text-xs">
                     {selectedTpIds.length} TP Terpilih
                 </Badge>
             )}
          </div>

          {tps.length === 0 ? (
              <div className="bg-white/60 backdrop-blur-sm rounded-[2rem] p-12 text-center border border-white/40">
                  <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                     <AlertCircle className="w-10 h-10 text-gray-300" />
                  </div>
                  <h5 className="font-bold text-gray-500 mb-2">Belum ada data TP yang terdaftar</h5>
                  <p className="text-gray-400 text-sm max-w-sm mx-auto mb-8">Silakan kelola data CP/TP pada menu kompetensi sebelum melakukan input nilai.</p>
                  <Button 
                    variant="outline" 
                    onClick={() => onNavigate?.('tp')}
                    className="rounded-2xl border-brand-purple text-brand-purple hover:bg-brand-purple hover:text-white px-8 py-6 h-auto font-black flex items-center mx-auto transition-all"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Kelola Kompetensi (TP)
                  </Button>
              </div>
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {tps.map(tp => (
                      <div key={tp.id} 
                           className={`p-5 rounded-[2rem] border-2 cursor-pointer transition-all duration-300 group/item relative overflow-hidden ${selectedTpIds.includes(tp.id) ? 'bg-white border-brand-purple shadow-xl translate-y-[-2px]' : 'bg-white/40 border-transparent hover:bg-white/80 hover:border-indigo-100'}`}
                           onClick={() => handleToggleTp(tp.id)}
                      >
                          {selectedTpIds.includes(tp.id) && (
                              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple/5 rounded-full blur-2xl -mr-16 -mt-16"></div>
                          )}
                          <div className="flex items-start gap-4 relative z-10">
                              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${selectedTpIds.includes(tp.id) ? 'bg-brand-purple border-brand-purple rotate-0' : 'border-gray-200 rotate-[-15deg]'}`}>
                                  {selectedTpIds.includes(tp.id) && <CheckSquare className="w-4 h-4 text-white" />}
                              </div>
                              <div>
                                  <div className="flex flex-wrap items-center gap-2 mb-2">
                                     <span className="text-[10px] font-black text-brand-purple uppercase tracking-tighter bg-indigo-50 px-2 py-0.5 rounded-md">{tp.code}</span>
                                     {tp.cp?.element && (
                                         <Badge className="bg-amber-50 text-amber-600 border-none text-[8px] font-bold uppercase py-0">{tp.cp.element}</Badge>
                                     )}
                                  </div>
                                  <p className="text-[12px] text-gray-600 leading-relaxed font-semibold line-clamp-3 group-hover/item:line-clamp-none transition-all">{tp.description}</p>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          )}
      </Card>

      {/* Student List Table Section */}
      <Card className="rounded-[3.5rem] border-none shadow-2xl overflow-hidden bg-white">
        <div className="p-10 border-b border-gray-50 flex flex-col lg:flex-row items-center justify-between bg-gray-50/20 gap-8">
           <div className="flex items-center">
              <div className="w-14 h-14 bg-indigo-50 rounded-[1.5rem] flex items-center justify-center mr-5 shadow-inner">
                 <UsersIcon className="w-7 h-7 text-brand-purple" />
              </div>
              <div>
                 <h3 className="text-2xl font-black text-brand-deep tracking-tight">Data Catatan Nilai</h3>
                 <p className="text-gray-400 font-medium text-sm">Kelola penilaian aktif untuk rombel terpilih</p>
              </div>
           </div>
           
           <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                <Input 
                  placeholder="Cari nama atau NIS..." 
                  className="pl-14 pr-12 rounded-2xl border-none bg-white shadow-xl shadow-indigo-100/10 font-bold h-14 text-sm focus-visible:ring-brand-purple transition-all" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                    <button 
                        onClick={() => setSearch('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 transition-colors"
                    >
                        <XCircle className="w-4 h-4" />
                    </button>
                )}
              </div>
              <div className="hidden sm:block h-6 w-px bg-gray-200 mx-2"></div>
              <div className="flex items-center gap-2 bg-indigo-50/50 p-2 rounded-2xl border border-indigo-100/50">
                 <Badge className="bg-brand-purple text-white border-none font-black rounded-xl px-4 py-2 text-[10px] shadow-lg shadow-brand-purple/25">
                    Deskripsi Otomatis
                 </Badge>
              </div>
           </div>
        </div>

        <div className="overflow-x-auto">
          {isLoadingStudents ? (
             <Table>
                <TableBody>
                   <RowSkeleton /><RowSkeleton /><RowSkeleton /><RowSkeleton />
                </TableBody>
             </Table>
          ) : filteredStudents.length === 0 ? (
             <div className="py-32 text-center flex flex-col items-center">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <XCircle className="w-12 h-12 text-gray-200" />
                </div>
                <h4 className="font-extrabold text-gray-800 text-xl">Mahasiswa Tidak Ditemukan</h4>
                <p className="text-gray-400 max-w-sm mt-2 font-medium">Coba gunakan kata kunci lain atau pastikan filter kelas sudah sesuai.</p>
                <Button variant="ghost" className="mt-6 text-brand-purple hover:bg-brand-purple/5 font-bold" onClick={() => setSearch('')}>Hapus Pencarian</Button>
             </div>
          ) : (
          <Table>
            <TableHeader className="bg-gray-50/30">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="font-black text-[10px] text-gray-400 uppercase tracking-[0.2em] px-10 py-8">Profil Siswa</TableHead>
                <TableHead className="font-black text-[10px] text-gray-400 uppercase tracking-[0.2em] px-10 py-8 text-center w-40">Skor Akhir</TableHead>
                <TableHead className="font-black text-[10px] text-gray-400 uppercase tracking-[0.2em] px-10 py-8">Wawasan Capaian & Deskripsi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => {
                 const currentScore = grades[student.id]
                 const status = getScoreStatus(currentScore || 0)
                 return (
                <TableRow key={student.id} className="hover:bg-indigo-50/10 transition-colors border-gray-50 group/row">
                  <TableCell className="px-10 py-8">
                    <div className="flex items-center space-x-5">
                       <div className="relative group/avatar">
                          <div className="w-14 h-14 rounded-[1.2rem] bg-indigo-100 flex items-center justify-center text-brand-deep font-black text-xl overflow-hidden shadow-sm transition-transform group-hover/avatar:scale-110">
                            {student.photo ? (
                                <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="opacity-60">{student.name.substring(0,1).toUpperCase()}</span>
                            )}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white ${currentScore !== undefined ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                       </div>
                       <div>
                          <p className="font-black text-gray-800 text-lg tracking-tight group-hover/row:text-brand-deep transition-colors">{student.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                             <span className="text-[10px] font-bold text-gray-400 tracking-wider">NIS: {student.nis}</span>
                             <div className="w-1 h-1 rounded-full bg-gray-200"></div>
                             {currentScore === undefined ? (
                                 <span className="text-[9px] font-black text-amber-500 uppercase tracking-tighter bg-amber-50 px-2 py-0.5 rounded-md">Menunggu Nilai</span>
                             ) : (
                                 <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter bg-emerald-50 px-2 py-0.5 rounded-md">Sudah Dinilai</span>
                             )}
                          </div>
                       </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-10 py-8 text-center">
                    <div className="relative group/score inline-block">
                        <Input 
                        type="number" 
                        min="0" max="100"
                        value={currentScore !== undefined ? currentScore : ''} 
                        onChange={(e) => handleScoreChange(student.id, e.target.value)}
                        placeholder="--"
                        className={`w-24 mx-auto rounded-2xl border-none text-center font-black h-16 text-2xl transition-all shadow-sm group-hover/score:shadow-lg focus:ring-4 focus:ring-indigo-100 ${currentScore === undefined ? 'bg-gray-50 text-gray-300' : (currentScore < 75 ? 'text-rose-600 bg-rose-50' : 'text-brand-deep bg-indigo-50')}`} 
                        />
                        {currentScore !== undefined && (
                            <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 py-1 px-3 rounded-full text-[9px] font-black uppercase tracking-widest leading-none shadow-sm whitespace-nowrap z-20 ${status.color}`}>
                               {status.label}
                            </div>
                        )}
                    </div>
                  </TableCell>
                  <TableCell className="px-10 py-8 w-[45%] min-w-[350px]">
                     <div className="relative group/text">
                        <div className="absolute top-3 right-3 opacity-0 group-hover/text:opacity-100 transition-opacity">
                            <FileText className="w-4 h-4 text-brand-purple/40" />
                        </div>
                        <textarea
                            className="w-full min-h-[110px] rounded-3xl border-none p-5 text-sm font-bold text-gray-700 bg-gray-50/50 hover:bg-indigo-50/30 focus:bg-white transition-all outline-none focus:ring-1 focus:ring-brand-purple italic leading-relaxed shadow-sm resize-none scrollbar-hide"
                            value={descriptions[student.id] || getAutoDescription(currentScore || 0)}
                            onChange={(e) => setDescriptions(prev => ({ ...prev, [student.id]: e.target.value }))}
                            placeholder="Deskripsi pencapaian akan muncul otomatis di sini..."
                        />
                        <div className="mt-2 flex items-center justify-between px-2">
                           <div className="flex items-center gap-2">
                              {currentScore !== undefined && !descriptions[student.id] && (
                                 <Badge className="bg-brand-purple/5 text-brand-purple border-none rounded-md px-2 py-0.5 text-[8px] font-black uppercase">Otomatis</Badge>
                              )}
                           </div>
                           <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 text-[9px] font-black p-0 text-brand-purple/60 hover:text-brand-purple uppercase tracking-widest flex items-center gap-1" 
                              onClick={() => {
                               const auto = getAutoDescription(currentScore || 0);
                               setDescriptions(prev => ({ ...prev, [student.id]: auto }));
                               toast.info('Deskripsi direset ke format otomatis', { position: 'bottom-right' });
                           }}>
                              <RotateCcw className="w-3 h-3" />
                              Reset Deskripsi
                           </Button>
                        </div>
                     </div>
                  </TableCell>
                </TableRow>
              )})}
            </TableBody>
          </Table>
          )}
        </div>
      </Card>
      
      {/* Footer Action */}
      <div className="flex justify-end px-4">
          <Button 
              onClick={handleSave} 
              disabled={isSaving || isLoadingStudents}
              className="group relative overflow-hidden rounded-[2rem] bg-brand-deep hover:bg-brand-deep/90 shadow-2xl shadow-brand-deep/25 px-12 py-10 h-auto transform transition-all active:scale-95 min-w-[300px]"
          >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              {isSaving ? <Loader2 className="w-6 h-6 mr-4 animate-spin" /> : <Save className="w-6 h-6 mr-4 group-hover:rotate-12 transition-transform" />}
              <span className="font-black text-2xl">{isSaving ? 'Menyimpan...' : 'Simpan Semua Nilai'}</span>
          </Button>
      </div>

      {/* Footer Insight */}
      <div className="flex items-center p-10 rounded-[3rem] bg-indigo-950 text-white relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[60px] -mr-20 -mt-20 rotate-45"></div>
         <div className="w-16 h-16 bg-white/10 rounded-[1.5rem] flex items-center justify-center mr-8 shrink-0 backdrop-blur-md border border-white/5 shadow-2xl">
            <AlertCircle className="w-8 h-8 text-indigo-200" />
         </div>
         <div>
            <h5 className="font-black text-xl mb-1 tracking-tight">Tips Pengisian Efisien</h5>
            <p className="text-indigo-200/70 text-sm font-medium leading-relaxed max-w-3xl">
                Gunakan tab kompetensi (AI Smart Deskripsi) untuk menghasilkan narasi rapor yang berkualitas tinggi secara otomatis. Anda tetap dapat menyesuaikan deskripsi secara manual pada setiap kolom teks siswa. Pastikan semua perubahan disimpan sebelum berpindah halaman.
            </p>
         </div>
      </div>
    </div>
  )
}

function PlusIcon(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 12h14" />
        <path d="M12 5v14" />
      </svg>
    )
  }

function UsersIcon(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    )
  }
