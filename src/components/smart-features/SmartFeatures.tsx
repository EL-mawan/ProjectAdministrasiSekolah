'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Printer, 
  QrCode, 
  UserCheck, 
  Search, 
  Loader2, 
  Download, 
  Calendar,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import jsPDF from 'jspdf'

interface Student {
  id: string
  name: string
  nis: string
  nisn?: string
  class?: {
    name: string
  }
}

export default function SmartFeatures() {
  const [students, setStudents] = useState<Student[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('exam-card')

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/classes')
      const data = await res.json()
      if (res.ok) setClasses(data.classes)
    } catch (e) { console.error(e) }
  }

  const fetchStudents = async (classId: string) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/students?classId=${classId}&limit=100`)
      const data = await res.json()
      if (res.ok) setStudents(data.students)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => {
    if (selectedClass) fetchStudents(selectedClass)
  }, [selectedClass])

  const printExamCard = (student: Student) => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [100, 70] // Card size
    })

    // Background
    doc.setFillColor(99, 102, 241) // brand-purple
    doc.rect(0, 0, 100, 15, 'F')

    // Header
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('KARTU PESERTA UJIAN', 50, 8, { align: 'center' })
    doc.setFontSize(7)
    doc.text('SMART SCHOOL MANAGEMENT SYSTEM', 50, 12, { align: 'center' })

    // Content
    doc.setTextColor(50, 50, 50)
    doc.setFontSize(8)
    doc.text('Nama :', 10, 25)
    doc.text(student.name.toUpperCase(), 30, 25)
    
    doc.text('NIS :', 10, 32)
    doc.text(student.nis, 30, 32)

    doc.text('Kelas :', 10, 39)
    doc.text(student.class?.name || '-', 30, 39)

    doc.text('Sesi :', 10, 46)
    doc.text('Sesi 01 (Pagi)', 30, 46)

    // QR Code Placeholder (Simplified for logic)
    doc.setDrawColor(200, 200, 200)
    doc.rect(70, 22, 22, 22)
    doc.setFontSize(6)
    doc.text('SCAN ABSEN', 81, 48, { align: 'center' })

    // Footer
    doc.setFontSize(5)
    doc.setTextColor(150, 150, 150)
    doc.text('* Kartu ini wajib dibawa saat pelaksanaan ujian berkas', 10, 65)

    doc.autoPrint()
    window.open(doc.output('bloburl'), '_blank')
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-deep">Smart Features</h1>
          <p className="text-gray-400 font-medium">Fitur operasional pintar untuk efisiensi sekolah</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex h-auto mb-8">
          <TabsTrigger value="exam-card" className="flex-1 rounded-xl py-4 font-bold data-[state=active]:bg-brand-deep data-[state=active]:text-white transition-all">
            <CreditCard className="w-4 h-4 mr-2" />
            Cetak Kartu Ujian
          </TabsTrigger>
          <TabsTrigger value="qr-attendance" className="flex-1 rounded-xl py-4 font-bold data-[state=active]:bg-brand-deep data-[state=active]:text-white transition-all">
            <QrCode className="w-4 h-4 mr-2" />
            Absensi QR Code
          </TabsTrigger>
        </TabsList>

        <TabsContent value="exam-card">
          <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-white">
            <CardHeader className="p-8 bg-gray-50/50 border-b border-gray-100">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div>
                  <CardTitle className="text-2xl font-black text-brand-deep">Cetak Kartu Ujian</CardTitle>
                  <CardDescription className="font-medium">Generate kartu ujian otomatis beserta QR Code untuk setiap siswa</CardDescription>
                </div>
                <div className="w-64">
                   <Select value={selectedClass} onValueChange={setSelectedClass}>
                      <SelectTrigger className="rounded-2xl border-none shadow-sm bg-white py-6 font-bold text-brand-deep">
                        <SelectValue placeholder="Pilih Kelas" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-none shadow-xl">
                        {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                   </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                   <Loader2 className="w-12 h-12 animate-spin text-brand-purple mb-4" />
                   <p className="font-bold text-gray-400 uppercase tracking-widest text-xs">Menyiapkan data siswa...</p>
                </div>
              ) : students.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {students.map(s => (
                    <Card key={s.id} className="rounded-3xl border border-gray-100 p-6 hover:shadow-xl transition-all group">
                       <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center space-x-4">
                             <div className="w-12 h-12 rounded-2xl bg-brand-deep/5 flex items-center justify-center text-brand-deep font-black shadow-sm group-hover:bg-brand-deep group-hover:text-white transition-colors">
                                {s.name.substring(0, 1)}
                             </div>
                             <div>
                                <h4 className="font-bold text-gray-900 leading-none mb-1">{s.name}</h4>
                                <p className="text-xs text-brand-purple font-black">NIS: {s.nis}</p>
                             </div>
                          </div>
                          <div className="p-2 bg-gray-50 rounded-xl">
                             <QRCodeSVG value={JSON.stringify({ id: s.id, type: 'EXAM' })} size={40} />
                          </div>
                       </div>
                       <Button 
                         onClick={() => printExamCard(s)}
                         className="w-full rounded-2xl bg-brand-deep/5 hover:bg-brand-deep hover:text-white text-brand-deep font-black py-6 h-auto transition-all border-none"
                       >
                         <Printer className="w-4 h-4 mr-2" />
                         Cetak Kartu
                       </Button>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                   <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CreditCard className="w-8 h-8 text-gray-200" />
                   </div>
                   <p className="text-gray-400 font-bold">Silakan pilih kelas untuk menampilkan daftar siswa</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qr-attendance">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* QR Scanner Mode Simulation */}
            <Card className="lg:col-span-2 rounded-[2.5rem] border-none shadow-2xl bg-white overflow-hidden">
               <div className="p-8 bg-brand-deep text-white">
                  <h3 className="text-2xl font-black mb-2 flex items-center">
                    <QrCode className="w-6 h-6 mr-3" />
                    Mode Scanner Absensi
                  </h3>
                  <p className="opacity-80 font-medium">Dekatkan QR Code kartu ujian siswa ke kamera untuk absensi otomatis</p>
               </div>
               <CardContent className="p-0">
                  <div className="aspect-video bg-gray-900 flex items-center justify-center relative">
                     <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
                     <div className="w-64 h-64 border-4 border-white/20 rounded-3xl relative flex items-center justify-center">
                        <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-brand-purple rounded-tl-xl animate-pulse"></div>
                        <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-brand-purple rounded-tr-xl animate-pulse"></div>
                        <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-brand-purple rounded-bl-xl animate-pulse"></div>
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-brand-purple rounded-br-xl animate-pulse"></div>
                        
                        <div className="w-full h-1 bg-brand-purple/50 shadow-[0_0_15px_rgba(99,102,241,0.5)] absolute top-0 animate-[scan_2s_infinite]"></div>
                        
                        <Button className="rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-black border-none px-8 py-6 h-auto">
                           Aktifkan Kamera
                        </Button>
                     </div>
                  </div>
               </CardContent>
            </Card>

            {/* Recent Scans */}
            <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white p-8">
               <h3 className="font-black text-brand-deep text-xl mb-6">Hasil Scan Terakhir</h3>
               <div className="space-y-4">
                  {[
                    { name: 'Ahmad Fauzi', time: '07:45', status: 'SUCCESS' },
                    { name: 'Siti Aminah', time: '07:48', status: 'SUCCESS' },
                    { name: 'Budi Santoso', time: '07:50', status: 'FAILED' },
                  ].map((scan, i) => (
                    <div key={i} className={`p-4 rounded-3xl border flex items-center justify-between transition-all ${scan.status === 'SUCCESS' ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                       <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${scan.status === 'SUCCESS' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                             {scan.status === 'SUCCESS' ? <UserCheck className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                          </div>
                          <div>
                             <p className="text-sm font-black text-gray-900 leading-none mb-1">{scan.name}</p>
                             <p className="text-[10px] font-bold text-gray-400 flex items-center">
                                <Clock className="w-3 h-3 mr-1" /> {scan.time} WIB
                             </p>
                          </div>
                       </div>
                       {scan.status === 'SUCCESS' ? (
                         <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                       ) : (
                         <XCircle className="w-5 h-5 text-red-500" />
                       )}
                    </div>
                  ))}
               </div>
               
               <div className="mt-8 p-6 rounded-3xl bg-indigo-50 border border-indigo-100">
                  <p className="text-[10px] font-black text-brand-purple uppercase tracking-widest mb-2">Statistik Hari Ini</p>
                  <div className="flex justify-between items-end">
                     <div>
                        <span className="text-3xl font-black text-brand-deep">142</span>
                        <span className="text-sm font-bold text-gray-400 ml-2">Siswa</span>
                     </div>
                     <Badge className="bg-brand-purple text-white mb-1">92% Hadir</Badge>
                  </div>
               </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <style jsx global>{`
        @keyframes scan {
          0%, 100% { top: 0%; }
          50% { top: 100%; }
        }
      `}</style>
    </div>
  )
}
