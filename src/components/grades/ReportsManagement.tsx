'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Printer, Download, FileSpreadsheet, FileText, Search, Filter, Loader2, Calendar, Layout, ChevronRight, FileCheck } from 'lucide-react'
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function ReportsManagement() {
  const [search, setSearch] = useState('')
  const [classes, setClasses] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [loadingStudents, setLoadingStudents] = useState(false)
  
  const [selectedSemester, setSelectedSemester] = useState('GANJIL')
  const [selectedSchoolYear, setSelectedSchoolYear] = useState('2024/2025')
  
  const schoolYears = ['2023/2024', '2024/2025', '2025/2026', '2026/2027']
  
  const [isLegerDialogOpen, setIsLegerDialogOpen] = useState(false)
  const [selectedLegerClass, setSelectedLegerClass] = useState('')
  const [selectedViewClass, setSelectedViewClass] = useState('')
  
  /* const [selectedSemester, setSelectedSemester] = useState('GANJIL') */
  /* const [selectedSchoolYear, setSelectedSchoolYear] = useState('2023/2024') */
  const [exporting, setExporting] = useState(false)
  
  const [isBulkPrintDialogOpen, setIsBulkPrintDialogOpen] = useState(false)
  const [selectedBulkClass, setSelectedBulkClass] = useState('')

  useEffect(() => {
    fetchClasses()
  }, [])

  useEffect(() => {
    if (selectedViewClass) {
      fetchStudents(selectedViewClass)
    }
  }, [selectedViewClass, search])

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/classes')
      const data = await res.json()
      if (data.classes) {
        setClasses(data.classes)
        if (data.classes.length > 0) {
          if (!selectedLegerClass) setSelectedLegerClass(data.classes[0].id)
          if (!selectedViewClass) setSelectedViewClass(data.classes[0].id)
        }
      }
    } catch (err) {
      console.error('Error fetching classes:', err)
    }
  }

  const fetchStudents = async (classId: string) => {
    setLoadingStudents(true)
    try {
      const res = await fetch(`/api/students?classId=${classId}&search=${search}&limit=100`)
      const data = await res.json()
      if (data.students) setStudents(data.students)
    } catch (err) {
      console.error('Error fetching students:', err)
    } finally {
      setLoadingStudents(false)
    }
  }

  const handleDownloadLeger = async (format: 'xlsx' | 'pdf') => {
    if (!selectedLegerClass) {
      alert('Silakan pilih kelas terlebih dahulu')
      return
    }

    setExporting(true)
    try {
      const res = await fetch(`/api/grades/leger?classId=${selectedLegerClass}&semester=${selectedSemester}&schoolYear=${selectedSchoolYear}`)
      const data = await res.json()

      if (data.error) {
        alert(data.error)
        return
      }

      if (format === 'xlsx') {
        exportToExcel(data)
      } else {
        exportToPDF(data)
      }
      setIsLegerDialogOpen(false)
    } catch (err) {
      console.error(err)
      alert('Gagal mendownload leger. Pastikan data sudah diinputkan.')
    } finally {
      setExporting(false)
    }
  }

  const exportToExcel = (data: any) => {
    const wsData = data.students.map((s: any, index: number) => {
      const row: any = {
        'No': index + 1,
        'NIS': s.nis,
        'Nama': s.name,
        'L/P': s.gender,
      }
      
      data.subjects.forEach((sub: any) => {
        const grade = s.grades.find((g: any) => g.subjectId === sub.id)
        row[sub.code] = grade?.score || '-'
      })

      row['TOTAL'] = s.totalScore
      row['RATA-RATA'] = s.average
      row['RANKING'] = s.ranking
      
      return row
    })

    const worksheet = XLSX.utils.json_to_sheet(wsData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Leger')
    XLSX.writeFile(workbook, `Leger_${data.className}_${data.semester}_${data.schoolYear.replace('/', '-')}.xlsx`)
  }

  const exportToPDF = (data: any) => {
    const doc = new jsPDF('l', 'mm', 'a4') as any
    doc.setFontSize(14)
    doc.setTextColor(30, 41, 59)
    doc.text(`E-RAPORT ${data.school.toUpperCase()}`, 14, 15)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text(`LEGER NILAI Kelas ${data.className}`, 14, 25)
    doc.setFontSize(10)
    doc.text(`Semester: ${data.semester} | Tahun Pelajaran: ${data.schoolYear}`, 14, 32)

    const columns = [
      { header: 'No', dataKey: 'no' },
      { header: 'NIS', dataKey: 'nis' },
      { header: 'NAMA', dataKey: 'name' },
      { header: 'L/P', dataKey: 'gender' },
      ...data.subjects.map((s: any) => ({ header: s.code, dataKey: s.code })),
      { header: 'TOTAL', dataKey: 'total' },
      { header: 'RATA', dataKey: 'average' },
      { header: 'RANK', dataKey: 'ranking' }
    ]

    const body = data.students.map((s: any, index: number) => {
      const row: any = {
        no: index + 1,
        nis: s.nis,
        name: s.name,
        gender: s.gender,
        total: s.totalScore,
        average: s.average,
        ranking: s.ranking
      }
      data.subjects.forEach((sub: any) => {
        const grade = s.grades.find((g: any) => g.subjectId === sub.id)
        row[sub.code] = grade?.score || '-'
      })
      return row
    })

    autoTable(doc, {
      columns,
      body,
      startY: 40,
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: 'bold', halign: 'center' },
      bodyStyles: { fontSize: 8 },
    })

    doc.save(`Leger_${data.className}_${data.semester}_${data.schoolYear.replace('/', '-')}.pdf`)
  }

  const handlePrintCompleteness = async (studentId: string) => {
    try {
      const res = await fetch(`/api/students/${studentId}/report?semester=${selectedSemester}&schoolYear=${selectedSchoolYear}`)
      const data = await res.json()
      if (data.error) return alert(data.error)

      const s = data.student
      const sch = s.school
      const doc = new jsPDF('p', 'mm', 'a4')

      try {
        const logoUrl = '/tutwuri.png'
        const response = await fetch(logoUrl)
        const blob = await response.blob()
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(blob)
        })
        
        // Add Logo
        doc.addImage(base64, 'PNG', 85, 20, 40, 40) // Centered, 40x40 size
      } catch (e) {
        console.warn('Logo not found', e)
      }

      // PAGE 1: COVER
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(18)
      doc.text('RAPOR', 105, 75, { align: 'center' })
      doc.setFontSize(16)
      doc.text((sch.name || 'SEKOLAH').toUpperCase(), 105, 85, { align: 'center' })

      doc.setFontSize(12)
      doc.text('NAMA PESERTA DIDIK', 105, 130, { align: 'center' })
      doc.rect(40, 135, 130, 12)
      doc.setFontSize(14)
      doc.text(s.name.toUpperCase(), 105, 143, { align: 'center' })

      doc.setFontSize(12)
      doc.text('NISN / NIS', 105, 170, { align: 'center' })
      doc.rect(50, 175, 110, 12)
      doc.setFontSize(14)
      doc.text(`${s.nisn || '-'} / ${s.nis}`, 105, 183, { align: 'center' })

      doc.setFontSize(14)
      doc.text('KEMENTERIAN PENDIDIKAN, KEBUDAYAAN', 105, 250, { align: 'center' })
      doc.text('RISET, DAN TEKNOLOGI', 105, 257, { align: 'center' })
      doc.text('REPUBLIK INDONESIA', 105, 264, { align: 'center' })

      // PAGE 2: SCHOOL IDENTITY
      doc.addPage()
      doc.setFontSize(16)
      doc.text('RAPOR', 105, 20, { align: 'center' })
      doc.text((sch.name || 'SEKOLAH').toUpperCase(), 105, 28, { align: 'center' })

      let y = 50
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      const labels = [
        ['Nama Sekolah', ': ' + (sch.name || '-')],
        ['NPSN', ': ' + (sch.npsn || '-')],
        ['NIS/NSS/NDS', ': ' + (sch.nss || '-')],
        ['Alamat Sekolah', ': ' + (sch.address || '-')],
        ['Kode Pos', ': ' + (sch.postalCode || '-')],
        ['Website', ': ' + (sch.website || '-')],
        ['Email', ': ' + (sch.email || '-')],
        ['Telepon', ': ' + (sch.phone || '-')]
      ]

      labels.forEach(([label, value]) => {
        doc.text(label, 20, y)
        doc.text(value, 60, y)
        y += 10
      })

      // PAGE 3: STUDENT IDENTITY
      doc.addPage()
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.text('IDENTITAS PESERTA DIDIK', 105, 20, { align: 'center' })
      
      y = 40
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      const sl = [
        ['1.  Nama Lengkap Peserta Didik', ': ' + (s.name || '').toUpperCase()],
        ['2.  Nomor Induk/NISN', ': ' + s.nis + ' / ' + (s.nisn || '-')],
        ['3.  Tempat, Tanggal Lahir', ': ' + s.birthPlace + ', ' + new Date(s.birthDate).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})],
        ['4.  Jenis Kelamin', ': ' + (s.gender === 'MALE' ? 'Laki-Laki' : 'Perempuan')],
        ['5.  Agama', ': ' + (s.religion || '-')],
        ['6.  Status Dalam Keluarga', ': ' + (s.familyStatus || '-')],
        ['7.  Anak Ke', ': ' + (s.childNumber || '-')],
        ['8.  Alamat Peserta Didik', ': ' + s.address],
        ['9.  Nomor Telepon', ': ' + (s.phone || '-')],
        ['10. Sekolah Asal', ': ' + (s.previousSchool || '-')],
        ['11. Diterima di sekolah ini', ''],
        ['    Di Kelas', ': ' + (s.class?.name || '-')],
        ['    Pada Tanggal', ': ' + new Date(s.enrollmentDate).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})],
        ['12. Nama Orang Tua', ''],
        ['    a. Ayah', ': ' + (s.fatherName || '-')],
        ['    b. Ibu', ': ' + (s.motherName || '-')],
        ['13. Alamat Orang Tua', ': ' + (s.parentAddress || '-')],
        ['    Nomor Telepon Rumah', ': ' + (s.homePhone || '-')],
        ['14. Pekerjaan Orang Tua', ''],
        ['    a. Ayah', ': ' + (s.fatherJob || '-')],
        ['    b. Ibu', ': ' + (s.motherJob || '-')]
      ]

      sl.forEach(([label, value]) => {
        doc.text(label, 20, y)
        doc.text(value, 80, y)
        y += 8
      })

      // Signature area
      y += 10
      doc.rect(80, y, 30, 40)
      if (s.photo) {
        try {
           doc.addImage(s.photo, 'JPEG', 80, y, 30, 40)
        } catch(e) { console.warn('Invalid photo data', e); doc.text('Foto 3x4', 95, y + 20, { align: 'center' }) }
      } else {
        doc.text('Foto\n3x4', 95, y + 15, { align: 'center' })
      }
      
      const city = sch.address?.split(',')[0] || 'Tangerang'
      doc.text(`${city}, ${new Date().toLocaleDateString('id-ID')}`, 140, y + 5)
      doc.text('Kepala ' + (sch.name || 'Sekolah'), 140, y + 10)
      doc.setFont('helvetica', 'bold')
      doc.text(sch.principalName || 'Nama Kepala Sekolah, S.Pd', 140, y + 45)
      doc.setFont('helvetica', 'normal')
      doc.text('NIP. ' + (sch.principalNip || '-'), 140, y + 50)

      doc.save(`Kelengkapan_Rapor_${s.name}.pdf`)
    } catch (err) {
      console.error(err)
      alert('Gagal mencetak kelengkapan rapor')
    }
  }

  const handlePrintGrades = async (studentId: string) => {
    console.log('Starting print grades for', studentId)
    try {
      const res = await fetch(`/api/students/${studentId}/report?semester=${selectedSemester}&schoolYear=${selectedSchoolYear}`)
      const data = await res.json()
      console.log('API Response:', data)
      
      if (data.error) {
        console.error('API Error:', data.error)
        return alert(data.error)
      }

      const s = data.student
      const sch = s.school || {}
      
      console.log('Initializing jsPDF')
      const doc = new jsPDF('p', 'mm', 'a4') as any

      // Helper for Phase
      const getPhase = (grade: string) => {
        const g = parseInt(grade);
        if (g >= 1 && g <= 2) return 'A';
        if (g >= 3 && g <= 4) return 'B';
        if (g >= 5 && g <= 6) return 'C';
        if (g >= 7 && g <= 9) return 'D';
        if (g === 10) return 'E';
        if (g >= 11 && g <= 12) return 'F';
        if (grade === 'X') return 'E';
        if (grade === 'XI' || grade === 'XII') return 'F';
        return '-';
      };

      // Header meta data
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text(`Nama Peserta Didik`, 15, 15)
      doc.text(`NIS / NISN`, 15, 20)
      doc.text(`Sekolah`, 15, 25)
      doc.text(`Alamat`, 15, 30)

      doc.setFont('helvetica', 'normal')
      doc.text(`: ${s.name}`, 50, 15)
      doc.text(`: ${s.nis} / ${s.nisn || '-'}`, 50, 20)
      doc.text(`: ${sch.name || '-'}`, 50, 25)
      doc.text(`: ${sch.address || '-'}`, 50, 30)

      doc.setFont('helvetica', 'bold')
      doc.text(`Kelas`, 130, 15)
      doc.text(`Fase`, 130, 20)
      doc.text(`Semester`, 130, 25)
      doc.text(`Tahun Pelajaran`, 130, 30)

      doc.setFont('helvetica', 'normal')
      doc.text(`: ${s.class?.name || '-'}`, 160, 15)
      doc.text(`: ${getPhase(s.class?.grade || s.class?.level || '')}`, 160, 20)
      doc.text(`: ${selectedSemester}`, 160, 25)
      doc.text(`: ${selectedSchoolYear}`, 160, 30)

      doc.setLineWidth(0.5)
      doc.line(15, 35, 195, 35)

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.text('LAPORAN HASIL BELAJAR', 105, 45, { align: 'center' })

      const columns = [
        { header: 'No', dataKey: 'no' },
        { header: 'Mata Pelajaran', dataKey: 'subject' },
        { header: 'Nilai Akhir', dataKey: 'grade' },
        { header: 'Capaian Kompetensi', dataKey: 'notes' }
      ]

      const subjects = data.subjects || [];
      const studentGrades = s.grades || [];

      const body = subjects.map((sub: any, i: number) => {
        // Find all grades for this subject
        const relGrades = studentGrades.filter((g: any) => g.subjectId === sub.id);
        
        // Calculate Weighted Final Grade: (Harian*2 + UTS + UAS) / 4
        const harian = relGrades.find((g: any) => g.type === 'DAILY')?.score || 0;
        const uts = relGrades.find((g: any) => g.type === 'MIDTERM')?.score || 0;
        const uas = relGrades.find((g: any) => g.type === 'FINAL')?.score || 0;
        
        // Count components present to avoid dividing by 4 if some missing
        let count = 0;
        let sum = 0;
        if (harian > 0) { sum += harian * 2; count += 2; }
        if (uts > 0) { sum += uts; count += 1; }
        if (uas > 0) { sum += uas; count += 1; }
        
        const finalScore = count > 0 ? Math.round(sum / count) : 0;

        // Combine and summarize all unique notes from different assessments
        const uniqueNotes = Array.from(new Set(
          relGrades.map(g => g.notes?.trim()).filter(n => n && n !== '-' && n.length > 5)
        ));
        
        let concludedNotes = "";
        if (uniqueNotes.length > 0) {
          concludedNotes = uniqueNotes.join(" ");
        } else if (finalScore > 0) {
          // Fallback templates based on the premium style in user's image
          if (finalScore >= 90) concludedNotes = "Sangat baik dalam memahami seluruh materi dan menunjukkan antusiasme yang tinggi dalam pembelajaran.";
          else if (finalScore >= 80) concludedNotes = "Sudah menguasai materi dengan baik, menunjukkan progres yang stabil dan pemahaman yang kuat.";
          else if (finalScore >= 75) concludedNotes = "Sudah menguasai sebagian besar materi dengan baik, perlu sedikit ketelitian pada detail spesifik.";
          else concludedNotes = "Perlu bimbingan intensif dan latihan tambahan untuk mencapai standar kompetensi yang ditetapkan.";
        } else {
          concludedNotes = "-";
        }

        return {
           no: i + 1,
           subject: sub.name,
           grade: finalScore > 0 ? Math.round(finalScore) : '-',
           notes: concludedNotes
        }
      })

      console.log('Generating Table')
      autoTable(doc, {
        columns,
        body,
        startY: 55,
        theme: 'grid',
        headStyles: { fillColor: [248, 250, 252], textColor: 0, fontStyle: 'bold', halign: 'center' },
        columnStyles: {
          no: { halign: 'center', cellWidth: 10 },
          subject: { cellWidth: 60 },
          grade: { halign: 'center', cellWidth: 20 },
          notes: { fontSize: 8 }
        }
      })

      // PAGE 2: Extracurricular, Attendance, Notes, Decision
      console.log('Adding Page 2')
      doc.addPage()
      
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text(`Nama Peserta Didik`, 15, 15)
      doc.text(`NIS / NISN`, 15, 20)
      doc.text(`Sekolah`, 15, 25)
      doc.text(`Alamat`, 15, 30)

      doc.setFont('helvetica', 'normal')
      doc.text(`: ${s.name}`, 50, 15)
      doc.text(`: ${s.nis} / ${s.nisn || '-'}`, 50, 20)
      doc.text(`: ${sch.name || '-'}`, 50, 25)
      doc.text(`: ${sch.address || '-'}`, 50, 30)

      doc.setFont('helvetica', 'bold')
      doc.text(`Kelas`, 130, 15)
      doc.text(`Fase`, 130, 20)
      doc.text(`Semester`, 130, 25)
      doc.text(`Tahun Pelajaran`, 130, 30)

      doc.setFont('helvetica', 'normal')
      doc.text(`: ${s.class?.name || '-'}`, 160, 15)
      doc.text(`: ${getPhase(s.class?.grade || s.class?.level || '')}`, 160, 20)
      doc.text(`: ${selectedSemester}`, 160, 25)
      doc.text(`: ${selectedSchoolYear}`, 160, 30)
      doc.line(15, 35, 195, 35)

      // Extracurricular Table
      autoTable(doc, {
        head: [['NO', 'Kegiatan Ekstrakurikuler', 'Predikat', 'Keterangan']],
        body: s.extraMembers && s.extraMembers.length > 0 ? s.extraMembers.map((ex: any, i: number) => [
          i + 1,
          ex.extracurricular?.name || '-',
          ex.notes?.split('|')[0] || '-',
          ex.notes?.split('|')[1] || '-'
        ]) : [['-', '-', '-', '-']],
        startY: 40,
        theme: 'grid',
        headStyles: { fillColor: [248, 250, 252], textColor: 0, fontStyle: 'bold', halign: 'center' },
        columnStyles: {
          0: { halign: 'center', cellWidth: 10 },
          1: { cellWidth: 60 },
          2: { halign: 'center', cellWidth: 30 },
          3: { cellWidth: 80 }
        }
      })

      // Attendance Table
      const note = s.homeroomNotes?.[0]
      let lastY = (doc as any).lastAutoTable?.finalY || (doc as any).lastAutoTable?.cursor?.y || 40
      const attendanceY = lastY + 10

      autoTable(doc, {
        body: [
          ['Sakit', `: ${note?.attendance_s || 0} hari`],
          ['Izin', `: ${note?.attendance_i || 0} hari`],
          ['Tanpa Keterangan', `: ${note?.attendance_a || 0} hari`]
        ],
        startY: attendanceY,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 40 }
        }
      })

      // Homeroom Note
      lastY = (doc as any).lastAutoTable?.finalY || (doc as any).lastAutoTable?.cursor?.y || attendanceY + 30
      const noteY = lastY + 10
      doc.setFont('helvetica', 'bold')
      doc.text('CATATAN WALI KELAS', 15, noteY)
      doc.setFont('helvetica', 'normal')
      doc.rect(15, noteY + 2, 180, 15)
      doc.text(note?.notes || '-', 18, noteY + 10)

      // Decision - Only for GENAP
      let sigY = noteY + 25
      if (selectedSemester === 'GENAP') {
        const decisionY = noteY + 25
        doc.setFont('helvetica', 'bold')
        doc.text('KEPUTUSAN', 15, decisionY)
        doc.setFont('helvetica', 'normal')
        doc.rect(15, decisionY + 2, 180, 15)

        // Promotion Logic
        const currentLevel = s.class?.level || '0'
        let nextLevel = '-'
        const currNum = parseInt(currentLevel)
        if (!isNaN(currNum) && currNum > 0) {
          if (currNum < 12) nextLevel = String(currNum + 1)
          else nextLevel = 'LULUS'
        } else {
          if (currentLevel === 'X') nextLevel = 'XI'
          else if (currentLevel === 'XI') nextLevel = 'XII'
          else if (currentLevel === 'XII') nextLevel = 'LULUS'
          else nextLevel = currentLevel
        }

        const decisionText = `Berdasarkan hasil pembelajaran yang dicapai, Peserta Didik ditetapkan: NAIK KE KELAS ${nextLevel}`
        doc.text(decisionText, 18, decisionY + 10)
        sigY = decisionY + 25
      }

      // Signatures
      doc.text('Mengetahui', 15, sigY)
      doc.text('Orang Tua/Wali,', 15, sigY + 5)
      doc.text('..........................................', 15, sigY + 30)

      const city = sch.address?.split(',')[0] || 'Tangerang'
      doc.text(`${city}, ${new Date().toLocaleDateString('id-ID')}`, 140, sigY)
      doc.text('Wali Kelas,', 140, sigY + 5)
      doc.setFont('helvetica', 'bold')
      doc.text(s.class?.homeroom?.name || 'Wali Kelas, S.Pd', 140, sigY + 30)
      doc.setFont('helvetica', 'normal')
      doc.text(`NIP. ${s.class?.homeroom?.nip || '-'}`, 140, sigY + 35)

      doc.text('Mengetahui,', 105, sigY + 45, { align: 'center' })
      doc.text('Kepala Sekolah,', 105, sigY + 50, { align: 'center' })
      doc.setFont('helvetica', 'bold')
      doc.text(sch.principalName || 'Kepala Sekolah', 105, sigY + 75, { align: 'center' })
      doc.setFont('helvetica', 'normal')
      doc.text(`NIP. ${sch.principalNip || '-'}`, 105, sigY + 80, { align: 'center' })

      // Footers
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.line(15, 285, 195, 285);
        doc.text(`Kelas ${s.class?.level || '-'} | ${s.name} | ${s.nis}`, 15, 290);
        doc.text(`Halaman ${i}`, 195, 290, { align: 'right' });
      }

      console.log('Saving PDF...')
      doc.save(`Rapor_Nilai_${s.name}_${selectedSemester.replace('/', '-')}.pdf`)
      console.log('Done')
    } catch (err) {
      console.error('Print Error:', err)
      alert('Gagal mencetak rapor nilai: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  const handleBulkPrint = async () => {
    if (!selectedBulkClass) return alert('Pilih kelas terlebih dahulu!')
    
    setExporting(true)
    try {
        const res = await fetch(`/api/reports/bulk?classId=${selectedBulkClass}&semester=${selectedSemester}&schoolYear=${selectedSchoolYear}`)
        const data = await res.json()

        if (data.error) throw new Error(data.error)
        if (!data.students || data.students.length === 0) throw new Error('Tidak ada siswa di kelas ini')

        const doc = new jsPDF('p', 'mm', 'a4') as any
        
        // Loop through students
        for (let i = 0; i < data.students.length; i++) {
            const s = data.students[i]
            const sch = s.school || {}  
            
            if (i > 0) doc.addPage()

            const getPhase = (grade: string) => {
              const g = parseInt(grade);
              if (g >= 1 && g <= 2) return 'A';
              if (g >= 3 && g <= 4) return 'B';
              if (g >= 5 && g <= 6) return 'C';
              if (g >= 7 && g <= 9) return 'D';
              if (g === 10) return 'E';
              if (g >= 11 && g <= 12) return 'F';
              if (grade === 'X') return 'E';
              if (grade === 'XI' || grade === 'XII') return 'F';
              return '-';
            };

            // Header meta data
            doc.setFontSize(9)
            doc.setFont('helvetica', 'bold')
            doc.text(`Nama Peserta Didik`, 15, 15)
            doc.text(`NIS / NISN`, 15, 20)
            doc.text(`Sekolah`, 15, 25)
            doc.text(`Alamat`, 15, 30)

            doc.setFont('helvetica', 'normal')
            doc.text(`: ${s.name}`, 50, 15)
            doc.text(`: ${s.nis} / ${s.nisn || '-'}`, 50, 20)
            doc.text(`: ${sch.name || '-'}`, 50, 25)
            doc.text(`: ${sch.address || '-'}`, 50, 30)

            doc.setFont('helvetica', 'bold')
            doc.text(`Kelas`, 130, 15)
            doc.text(`Fase`, 130, 20)
            doc.text(`Semester`, 130, 25)
            doc.text(`Tahun Pelajaran`, 130, 30)

            doc.setFont('helvetica', 'normal')
            doc.text(`: ${s.class?.name || '-'}`, 160, 15)
            doc.text(`: ${getPhase(s.class?.grade || s.class?.level || '')}`, 160, 20)
            doc.text(`: ${selectedSemester}`, 160, 25)
            doc.text(`: ${selectedSchoolYear}`, 160, 30)
            doc.setLineWidth(0.5)
            doc.line(15, 35, 195, 35)

            doc.setFont('helvetica', 'bold')
            doc.setFontSize(12)
            doc.text('LAPORAN HASIL BELAJAR', 105, 45, { align: 'center' })

            const columns = [
                { header: 'No', dataKey: 'no' },
                { header: 'Mata Pelajaran', dataKey: 'subject' },
                { header: 'Nilai Akhir', dataKey: 'grade' },
                { header: 'Capaian Kompetensi', dataKey: 'notes' }
            ]

            const subjects = data.subjects || [];
            const studentGrades = s.grades || [];

            const body: any[] = []
            subjects.forEach((sub: any, j: number) => {
              const relGrades = studentGrades.filter((g: any) => g.subjectId === sub.id);
              
              const harian = relGrades.find((g: any) => g.type === 'DAILY')?.score || 0;
              const uts = relGrades.find((g: any) => g.type === 'MIDTERM')?.score || 0;
              const uas = relGrades.find((g: any) => g.type === 'FINAL')?.score || 0;
              
              let count = 0;
              let sum = 0;
              if (harian > 0) { sum += harian * 2; count += 2; }
              if (uts > 0) { sum += uts; count += 1; }
              if (uas > 0) { sum += uas; count += 1; }
              const finalScore = count > 0 ? Math.round(sum / count) : 0;

              let achieved = "-";
              let improvement = "-";

              if (finalScore > 0) {
                 if (finalScore >= 92) {
                   achieved = "Sangat mahir memahami konsep, terampil menerapkan, dan mampu menganalisis masalah kompleks dengan sangat baik.";
                   improvement = "Perlu pengayaan dengan tantangan lebih tinggi untuk mempertahankan motivasi belajar.";
                 } else if (finalScore >= 83) {
                   achieved = "Sudah mampu memahami konsep esensial dan menerapkannya dalam penyelesaian masalah sehari-hari dengan baik.";
                   improvement = "Perlu bimbingan lebih lanjut dalam hal ketelitian dan pendalaman materi yang lebih kompleks.";
                 } else if (finalScore >= 75) {
                   achieved = "Mampu memahami sebagian besar konsep dasar namun masih perlu penguatan dalam penerapannya.";
                   improvement = "Masih perlu bimbingan intensif dalam memahami konsep-konsep kunci dan penyelesaian soal cerita.";
                 } else {
                   achieved = "Mulai memahami konsep dasar dengan bantuan guru namun belum konsisten.";
                   improvement = "Perlu perhatian khusus dan remedial untuk mengejar ketertinggalan dalam capaian pembelajaran.";
                 }
              }

              body.push({
                 no: { content: j + 1, rowSpan: 2, styles: { valign: 'middle' } },
                 subject: { content: sub.name, rowSpan: 2, styles: { valign: 'middle' } },
                 grade: { content: finalScore > 0 ? Math.round(finalScore) : '-', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
                 notes: achieved
              });
              body.push({
                 notes: improvement
              });
            })

            autoTable(doc, {
                columns,
                body,
                startY: 55,
                theme: 'grid',
                headStyles: { fillColor: [248, 250, 252], textColor: 0, fontStyle: 'bold', halign: 'center', lineWidth: 0.1, lineColor: [200, 200, 200] },
                styles: { lineWidth: 0.1, lineColor: [200, 200, 200] },
                columnStyles: {
                no: { halign: 'center', cellWidth: 10 },
                subject: { cellWidth: 60 },
                grade: { halign: 'center', cellWidth: 20 },
                notes: { fontSize: 8, cellPadding: 3 }
                }
            })

            // PAGE 2: Extracurricular, Attendance, Notes, Decision
            // Page 2
            doc.addPage()
            doc.setFontSize(9)
            doc.setFont('helvetica', 'bold')
            doc.text(`Nama Peserta Didik`, 15, 15)
            doc.text(`NIS / NISN`, 15, 20)
            doc.text(`Sekolah`, 15, 25)
            doc.text(`Alamat`, 15, 30)

            doc.setFont('helvetica', 'normal')
            doc.text(`: ${s.name}`, 50, 15)
            doc.text(`: ${s.nis} / ${s.nisn || '-'}`, 50, 20)
            doc.text(`: ${sch.name || '-'}`, 50, 25)
            doc.text(`: ${sch.address || '-'}`, 50, 30)

            doc.setFont('helvetica', 'bold')
            doc.text(`Kelas`, 130, 15)
            doc.text(`Fase`, 130, 20)
            doc.text(`Semester`, 130, 25)
            doc.text(`Tahun Pelajaran`, 130, 30)

            doc.setFont('helvetica', 'normal')
            doc.text(`: ${s.class?.name || '-'}`, 160, 15)
            doc.text(`: ${getPhase(s.class?.grade || s.class?.level || '')}`, 160, 20)
            doc.text(`: ${selectedSemester}`, 160, 25)
            doc.text(`: ${selectedSchoolYear}`, 160, 30)
            doc.line(15, 35, 195, 35)

            // Extracurricular Table
            autoTable(doc, {
                head: [['NO', 'Kegiatan Ekstrakurikuler', 'Predikat', 'Keterangan']],
                body: s.extraMembers && s.extraMembers.length > 0 ? s.extraMembers.map((ex: any, j: number) => [
                    j + 1,
                    ex.extracurricular?.name || '-',
                    ex.notes?.split('|')[0] || '-',
                    ex.notes?.split('|')[1] || '-'
                ]) : [['-', '-', '-', '-']],
                startY: 40,
                theme: 'grid',
                headStyles: { fillColor: [248, 250, 252], textColor: 0, fontStyle: 'bold', halign: 'center' },
                columnStyles: {
                    0: { halign: 'center', cellWidth: 10 },
                    1: { cellWidth: 60 },
                    2: { halign: 'center', cellWidth: 30 },
                    3: { cellWidth: 80 }
                }
            })

            // Attendance Table
            const note = s.homeroomNotes?.[0]
            let lastY = (doc as any).lastAutoTable?.finalY || (doc as any).lastAutoTable?.cursor?.y || 40
            const attendanceY = lastY + 10

            doc.setFont('helvetica', 'bold')
            doc.text('KETIDAKHADIRAN', 15, attendanceY - 3)

            autoTable(doc, {
                body: [
                    ['Sakit', `: ${note?.attendance_s || 0} hari`],
                    ['Izin', `: ${note?.attendance_i || 0} hari`],
                    ['Tanpa Keterangan', `: ${note?.attendance_a || 0} hari`]
                ],
                startY: attendanceY,
                theme: 'grid',
                styles: { fontSize: 10, cellPadding: 2 },
                columnStyles: {
                    0: { cellWidth: 40 },
                    1: { cellWidth: 40 }
                }
            })

            // Homeroom Note
            lastY = (doc as any).lastAutoTable?.finalY || (doc as any).lastAutoTable?.cursor?.y || attendanceY + 30
            const noteY = lastY + 10
            doc.setFont('helvetica', 'bold')
            doc.text('CATATAN WALI KELAS', 15, noteY)
            doc.setFont('helvetica', 'normal')
            doc.rect(15, noteY + 2, 180, 15)
            doc.text(note?.notes || '-', 18, noteY + 10)

            // Decision - Only for GENAP
            let sigY = noteY + 25
            if (selectedSemester === 'GENAP') {
              const decisionY = noteY + 25
              doc.setFont('helvetica', 'bold')
              doc.text('KEPUTUSAN', 15, decisionY)
              doc.setFont('helvetica', 'normal')
              doc.rect(15, decisionY + 2, 180, 15)

              // Promotion Logic
              const currentLevel = s.class?.level || '0'
              let nextLevel = '-'
              const currNum = parseInt(currentLevel)
              if (!isNaN(currNum) && currNum > 0) {
                  if (currNum < 12) nextLevel = String(currNum + 1)
                  else nextLevel = 'LULUS'
              } else {
                  if (currentLevel === 'X') nextLevel = 'XI'
                  else if (currentLevel === 'XI') nextLevel = 'XII'
                  else if (currentLevel === 'XII') nextLevel = 'LULUS'
                  else nextLevel = currentLevel
              }

              const decisionText = `Berdasarkan hasil pembelajaran yang dicapai, Peserta Didik ditetapkan: NAIK KE KELAS ${nextLevel}`
              doc.text(decisionText, 18, decisionY + 10)
              sigY = decisionY + 25
            }

            // Signatures
            doc.text('Mengetahui', 15, sigY)
            doc.text('Orang Tua/Wali,', 15, sigY + 5)
            doc.text('..........................................', 15, sigY + 30)

            const city = sch.address?.split(',')[0] || 'Tangerang'
            doc.text(`${city}, ${new Date().toLocaleDateString('id-ID')}`, 140, sigY)
            doc.text('Wali Kelas,', 140, sigY + 5)
            doc.setFont('helvetica', 'bold')
            doc.text(s.class?.homeroom?.name || 'Wali Kelas, S.Pd', 140, sigY + 30)
            doc.setFont('helvetica', 'normal')
            doc.text(`NIP. ${s.class?.homeroom?.nip || '-'}`, 140, sigY + 35)

            doc.text('Mengetahui,', 105, sigY + 45, { align: 'center' })
            doc.text('Kepala Sekolah,', 105, sigY + 50, { align: 'center' })
            doc.setFont('helvetica', 'bold')
            doc.text(sch.principalName || 'Kepala Sekolah', 105, sigY + 75, { align: 'center' })
            doc.setFont('helvetica', 'normal')
            doc.text(`NIP. ${sch.principalNip || '-'}`, 105, sigY + 80, { align: 'center' })
        }

        // Footers
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.line(15, 285, 195, 285);
            doc.text(`Cetak Sistem | ${selectedSchoolYear} | ${selectedSemester}`, 15, 290);
            doc.text(`Halaman ${i}`, 195, 290, { align: 'right' });
        }

        doc.save(`Rapor_Massal_${selectedSemester}_${selectedSchoolYear.replace('/', '-')}.pdf`)
        setIsBulkPrintDialogOpen(false)

    } catch (err) {
        console.error(err)
        alert('Gagal cetak massal: ' + (err as Error).message)
    } finally {
        setExporting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-brand-deep">Leger & Rapor</h1>
        <p className="text-gray-400 font-medium">Rekapitulasi nilai dan pencetakan hasil belajar siswa</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="rounded-[2.5rem] border-none shadow-xl p-8 bg-white flex flex-col items-center text-center group hover:bg-brand-deep transition-all duration-500">
           <div className="w-16 h-16 rounded-3xl bg-brand-deep/5 flex items-center justify-center text-brand-deep mb-6 group-hover:bg-white transition-all">
              <FileSpreadsheet className="w-8 h-8" />
           </div>
           <h3 className="font-extrabold text-xl text-brand-deep mb-2 group-hover:text-white transition-all">Leger Nilai</h3>
           <p className="text-sm text-gray-400 font-medium group-hover:text-indigo-100 transition-all mb-8">Download rekapitulasi seluruh nilai dalam format Excel / Spreadsheet</p>
           <Button 
            onClick={() => setIsLegerDialogOpen(true)}
            className="w-full rounded-2xl bg-brand-deep group-hover:bg-white group-hover:text-brand-deep shadow-lg py-6 h-auto transition-all"
           >
              <Download className="w-4 h-4 mr-2" />
              Download Leger
           </Button>
        </Card>

        {/* ... Other cards ... */}
        <Card className="rounded-[2.5rem] border-none shadow-xl p-8 bg-white flex flex-col items-center text-center group hover:bg-brand-purple transition-all duration-500">
           <div className="w-16 h-16 rounded-3xl bg-brand-purple/5 flex items-center justify-center text-brand-purple mb-6 group-hover:bg-white transition-all">
              <Printer className="w-8 h-8" />
           </div>
           <h3 className="font-extrabold text-xl text-brand-deep mb-2 group-hover:text-white transition-all">Cetak Rapor</h3>
           <p className="text-sm text-gray-400 font-medium group-hover:text-indigo-100 transition-all mb-8">Cetak laporan hasil belajar siswa per semester secara kolektif</p>
           <Button 
            onClick={() => setIsBulkPrintDialogOpen(true)}
            className="w-full rounded-2xl bg-brand-purple group-hover:bg-white group-hover:text-brand-purple shadow-lg py-6 h-auto transition-all"
           >
              <Printer className="w-4 h-4 mr-2" />
              Cetak Rapor Massal
           </Button>
        </Card>

        <Card className="rounded-[2.5rem] border-none shadow-xl p-8 bg-white flex flex-col items-center text-center group hover:bg-pink-500 transition-all duration-500">
           <div className="w-16 h-16 rounded-3xl bg-pink-50 flex items-center justify-center text-pink-500 mb-6 group-hover:bg-white transition-all">
              <FileText className="w-8 h-8" />
           </div>
           <h3 className="font-extrabold text-xl text-brand-deep mb-2 group-hover:text-white transition-all">Rapor P5</h3>
           <p className="text-sm text-gray-400 font-medium group-hover:text-pink-100 transition-all mb-8">Cetak laporan pencapaian projek profil pelajar pancasila</p>
           <Button 
            onClick={() => alert('Fitur Rapor P5 akan segera hadir!')}
            className="w-full rounded-2xl bg-pink-500 group-hover:bg-white group-hover:text-pink-500 shadow-lg py-6 h-auto transition-all"
           >
              <Printer className="w-4 h-4 mr-2" />
              Cetak Rapor P5
           </Button>
        </Card>
      </div>

      <Dialog open={isLegerDialogOpen} onOpenChange={setIsLegerDialogOpen}>
        {/* ... Leger Dialog Content ... */}
        <DialogContent className="max-w-md rounded-4xl p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-brand-deep">Opsi Export Leger</DialogTitle>
            <DialogDescription className="font-medium text-gray-400">Pilih kelas dan periode untuk mengunduh rekapitulasi nilai.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center"><Layout className="w-4 h-4 mr-2 text-brand-purple" /> Pilih Kelas</label>
              <Select value={selectedLegerClass} onValueChange={setSelectedLegerClass}>
                <SelectTrigger className="rounded-2xl border-gray-100 h-12 font-bold focus:ring-brand-purple">
                  <SelectValue placeholder="Pilih Kelas" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name} ({c.schoolYear})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center"><Calendar className="w-4 h-4 mr-2 text-brand-purple" /> Semester</label>
                  <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                    <SelectTrigger className="rounded-2xl border-gray-100 h-12 font-bold focus:ring-brand-purple">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      <SelectItem value="GANJIL">Ganjil</SelectItem>
                      <SelectItem value="GENAP">Genap</SelectItem>
                    </SelectContent>
                  </Select>
               </div>
               <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center"><Calendar className="w-4 h-4 mr-2 text-brand-purple" /> Tahun Ajaran</label>
                  <Input 
                    value={selectedSchoolYear} 
                    onChange={e => setSelectedSchoolYear(e.target.value)}
                    className="rounded-2xl border-gray-100 h-12 font-bold focus-visible:ring-brand-purple"
                  />
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4">
               <Button onClick={() => handleDownloadLeger('pdf')} disabled={exporting} className="rounded-2xl bg-brand-deep hover:bg-brand-deep/90 h-14 font-bold shadow-lg shadow-brand-deep/20 transition-all active:scale-95">
                 {exporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Printer className="w-4 h-4 mr-2" />} Export PDF
               </Button>
               <Button onClick={() => handleDownloadLeger('xlsx')} disabled={exporting} className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 h-14 font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95">
                 {exporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileSpreadsheet className="w-4 h-4 mr-2" />} Export Excel
               </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Print Dialog */}
      <Dialog open={isBulkPrintDialogOpen} onOpenChange={setIsBulkPrintDialogOpen}>
        <DialogContent className="max-w-md rounded-4xl p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-brand-deep">Cetak Rapor Massal</DialogTitle>
            <DialogDescription className="font-medium text-gray-400">Pilih kelas dan periode untuk mencetak seluruh rapor siswa.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center"><Layout className="w-4 h-4 mr-2 text-brand-purple" /> Pilih Kelas</label>
              <Select value={selectedBulkClass} onValueChange={setSelectedBulkClass}>
                <SelectTrigger className="rounded-2xl border-gray-100 h-12 font-bold focus:ring-brand-purple">
                  <SelectValue placeholder="Pilih Kelas" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name} ({c.schoolYear})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center"><Calendar className="w-4 h-4 mr-2 text-brand-purple" /> Semester</label>
                  <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                    <SelectTrigger className="rounded-2xl border-gray-100 h-12 font-bold focus:ring-brand-purple">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      <SelectItem value="GANJIL">Ganjil</SelectItem>
                      <SelectItem value="GENAP">Genap</SelectItem>
                    </SelectContent>
                  </Select>
               </div>
               <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center"><Calendar className="w-4 h-4 mr-2 text-brand-purple" /> Tahun Ajaran</label>
                  <Input 
                    value={selectedSchoolYear} 
                    onChange={e => setSelectedSchoolYear(e.target.value)}
                    className="rounded-2xl border-gray-100 h-12 font-bold focus-visible:ring-brand-purple"
                  />
               </div>
            </div>
            <div className="pt-4">
               <Button onClick={handleBulkPrint} disabled={exporting} className="w-full rounded-2xl bg-brand-deep hover:bg-brand-deep/90 h-14 font-bold shadow-lg shadow-brand-deep/20 transition-all active:scale-95">
                 {exporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Printer className="w-4 h-4 mr-2" />} Cetak Semua Rapor
               </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="rounded-[2.5rem] border-none shadow-2xl p-8 bg-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
           <h3 className="text-xl font-black text-brand-deep">Daftar Rapor Per Siswa</h3>
            <div className="flex flex-wrap gap-4 items-center bg-gray-50/50 p-2 rounded-3xl border border-gray-100">
               <div className="flex items-center gap-2">
                  <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                    <SelectTrigger className="w-[120px] rounded-2xl border-none bg-white h-10 font-bold text-xs focus:ring-brand-purple shadow-sm">
                      <SelectValue placeholder="Semester" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      <SelectItem value="GANJIL">Ganjil</SelectItem>
                      <SelectItem value="GENAP">Genap</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input 
                    value={selectedSchoolYear} 
                    onChange={(e) => setSelectedSchoolYear(e.target.value)}
                    placeholder="Tahun..."
                    className="w-[120px] rounded-2xl border-none bg-white h-10 font-bold text-xs focus-visible:ring-brand-purple px-4 shadow-sm text-center"
                  />
               </div>

               <div className="w-px h-6 bg-gray-200 mx-2 hidden md:block"></div>

               <Select value={selectedViewClass} onValueChange={setSelectedViewClass}>
                 <SelectTrigger className="w-[180px] rounded-2xl border-none bg-white h-10 font-bold text-xs focus:ring-brand-purple shadow-sm">
                   <div className="flex items-center"><Filter className="w-4 h-4 mr-2 text-brand-purple" /><SelectValue /></div>
                 </SelectTrigger>
                 <SelectContent className="rounded-2xl">
                    {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                 </SelectContent>
               </Select>
               <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                 <Input 
                   placeholder="Cari nama siswa..." 
                   className="pl-12 rounded-2xl border-none bg-white h-10 font-medium text-xs w-64 focus-visible:ring-brand-purple shadow-sm" 
                   value={search}
                   onChange={e => setSearch(e.target.value)}
                 />
               </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loadingStudents ? (
            <div className="col-span-full text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-purple" /></div>
          ) : students.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-400 font-bold">Siswa tidak ditemukan</div>
          ) : students.map((student, i) => (
            <div key={i} className="p-6 rounded-3xl border border-gray-100 hover:shadow-xl transition-all duration-300 group">
               <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-brand-purple font-black shadow-sm group-hover:bg-brand-deep group-hover:text-white transition-all">
                     {student.name.substring(0, 1)}
                  </div>
                  <Badge className={`rounded-lg px-3 py-1 border-none font-bold text-[10px] ${student.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                    {student.status === 'ACTIVE' ? 'AKTIF' : student.status}
                  </Badge>
               </div>
               <h4 className="font-bold text-gray-900 group-hover:text-brand-deep transition-colors">{student.name}</h4>
               <p className="text-xs text-gray-400 font-bold mb-6">NIS: {student.nis}</p>
               <div className="flex space-x-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="flex-1 rounded-xl text-xs font-bold bg-brand-deep shadow-md transition-all active:scale-95">
                        <Printer className="w-3 h-3 mr-2" /> Cetak Rapor
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="rounded-2xl border-none shadow-2xl p-2 min-w-[200px]">
                       <DropdownMenuItem onClick={() => handlePrintCompleteness(student.id)} className="rounded-xl py-3 cursor-pointer focus:bg-indigo-50 font-bold text-gray-700">
                          <FileCheck className="w-4 h-4 mr-3 text-brand-purple" /> Cetak Kelengkapan
                       </DropdownMenuItem>
                       <DropdownMenuItem onClick={() => handlePrintGrades(student.id)} className="rounded-xl py-3 cursor-pointer focus:bg-indigo-50 font-bold text-gray-700">
                          <FileText className="w-4 h-4 mr-3 text-brand-deep" /> Laporan Hasil Belajar
                       </DropdownMenuItem>
                       <DropdownMenuItem onClick={() => alert('Fitur Rapor P5 akan segera hadir!')} className="rounded-xl py-3 cursor-pointer focus:bg-indigo-50 font-bold text-gray-700">
                          <Layout className="w-4 h-4 mr-3 text-pink-500" /> Rapor P5
                       </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
               </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
