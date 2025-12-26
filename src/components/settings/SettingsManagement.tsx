'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Settings, 
  User, 
  Shield, 
  Bell, 
  Database, 
  Globe, 
  Building, 
  Save, 
  Loader2,
  Lock,
  Mail,
  Smartphone,
  CheckCircle2,
  Users
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import UsersManagement from '../users/UsersManagement'

export default function SettingsManagement({ activeMenu }: { activeMenu: string }) {
  const [loading, setLoading] = useState(false)
  const [schoolInfo, setSchoolInfo] = useState({
    name: 'SMK Negeri 1 Jakarta',
    address: 'Jl. Utama No. 123, Jakarta Pusat',
    phone: '021-1234567',
    email: 'info@smkn1jkt.sch.id',
    npsn: '12345678',
    accreditation: 'A',
    level: 'SMA'
  })

  const [activeSemester, setActiveSemester] = useState('GANJIL')
  const [activeSchoolYear, setActiveSchoolYear] = useState('2024/2025')

  const [generalSettings, setGeneralSettings] = useState({
    academicYear: '2024/2025',
    semester: 'Ganjil',
    autoAttendance: true,
    notifications: true
  })

  useEffect(() => {
    fetchSchoolData()
  }, [])

  const fetchSchoolData = async () => {
    try {
      const res = await fetch('/api/school')
      const data = await res.json()
      if (data.school) {
        setActiveSemester(data.school.activeSemester || 'GANJIL')
        setActiveSchoolYear(data.school.activeSchoolYear || '2024/2025')
      }
    } catch (error) {
      console.error('Error fetching school data:', error)
    }
  }

  const handleSaveSchool = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/school', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...schoolInfo,
          activeSemester,
          activeSchoolYear
        })
      })
      
      if (res.ok) {
        alert('Informasi sekolah berhasil diperbarui!')
      } else {
        alert('Gagal memperbarui informasi sekolah')
      }
    } catch (error) {
      alert('Terjadi kesalahan koneksi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="rounded-[2.5rem] border-none shadow-2xl p-8 bg-white min-h-[600px]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-deep">Pengaturan Sistem</h1>
          <p className="text-gray-400 font-medium">Konfigurasi profile, keamanan, dan identitas sekolah Anda</p>
        </div>
        <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-2xl">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
           <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Sistem Online</span>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-gray-50/50 p-1.5 rounded-3xl mb-10 inline-flex flex-wrap h-auto gap-2">
           <TabsTrigger value="profile" className="rounded-2xl px-6 py-3 data-[state=active]:bg-brand-deep data-[state=active]:text-white data-[state=active]:shadow-xl transition-all font-bold text-sm">
              <Building className="w-4 h-4 mr-2" />
              Identitas Sekolah
           </TabsTrigger>
           <TabsTrigger value="users" className="rounded-2xl px-6 py-3 data-[state=active]:bg-brand-deep data-[state=active]:text-white data-[state=active]:shadow-xl transition-all font-bold text-sm">
              <Users className="w-4 h-4 mr-2" />
              Manajemen User
           </TabsTrigger>
           <TabsTrigger value="security" className="rounded-2xl px-6 py-3 data-[state=active]:bg-brand-deep data-[state=active]:text-white data-[state=active]:shadow-xl transition-all font-bold text-sm">
              <Shield className="w-4 h-4 mr-2" />
              Keamanan
           </TabsTrigger>
           <TabsTrigger value="system" className="rounded-2xl px-6 py-3 data-[state=active]:bg-brand-deep data-[state=active]:text-white data-[state=active]:shadow-xl transition-all font-bold text-sm">
              <Database className="w-4 h-4 mr-2" />
              Sistem & DB
           </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="focus-visible:outline-none">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-8">
                 <div className="space-y-6">
                    <h3 className="text-xl font-bold text-brand-deep flex items-center">
                       <Globe className="w-5 h-5 mr-3 text-brand-purple" />
                       Informasi Dasar
                    </h3>
                    <div className="grid gap-6">
                       <div className="grid gap-2">
                          <Label className="font-bold text-gray-700">Nama Instansi Sekolah</Label>
                          <Input className="rounded-xl border-gray-100 py-6" value={schoolInfo.name} onChange={e => setSchoolInfo({...schoolInfo, name: e.target.value})} />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                             <Label className="font-bold text-gray-700">NPSN</Label>
                             <Input className="rounded-xl border-gray-100 py-6" value={schoolInfo.npsn} onChange={e => setSchoolInfo({...schoolInfo, npsn: e.target.value})} />
                          </div>
                          <div className="grid gap-2">
                             <Label className="font-bold text-gray-700">Akreditasi</Label>
                             <Select value={schoolInfo.accreditation} onValueChange={v => setSchoolInfo({...schoolInfo, accreditation: v})}>
                                <SelectTrigger className="rounded-xl border-gray-100 py-6"><SelectValue /></SelectTrigger>
                                <SelectContent className="rounded-xl">
                                   <SelectItem value="A">A (Sangat Baik)</SelectItem>
                                   <SelectItem value="B">B (Baik)</SelectItem>
                                   <SelectItem value="C">C (Cukup)</SelectItem>
                                </SelectContent>
                             </Select>
                          </div>
                       </div>
                       <div className="grid gap-2">
                          <Label className="font-bold text-gray-700">Jenjang Sekolah</Label>
                          <Select value={schoolInfo.level} onValueChange={v => setSchoolInfo({...schoolInfo, level: v})}>
                             <SelectTrigger className="rounded-xl border-gray-100 py-6"><SelectValue placeholder="Pilih Jenjang" /></SelectTrigger>
                             <SelectContent className="rounded-xl">
                                <SelectItem value="SD">Sekolah Dasar (SD)</SelectItem>
                                <SelectItem value="SMP">Sekolah Menengah Pertama (SMP)</SelectItem>
                                <SelectItem value="SMA">Sekolah Menengah Atas (SMA)</SelectItem>
                                <SelectItem value="SMK">Sekolah Menengah Kejuruan (SMK)</SelectItem>
                             </SelectContent>
                          </Select>
                       </div>
                       <div className="grid gap-2">
                          <Label className="font-bold text-gray-700">Alamat Lengkap</Label>
                          <textarea className="w-full min-h-[100px] rounded-xl border border-gray-100 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all font-medium" value={schoolInfo.address} onChange={e => setSchoolInfo({...schoolInfo, address: e.target.value})} />
                       </div>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <h3 className="text-xl font-bold text-brand-deep flex items-center">
                       <Smartphone className="w-5 h-5 mr-3 text-brand-purple" />
                       Kontak & Hubungan Luar
                    </h3>
                    <div className="grid gap-6">
                       <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                             <Label className="font-bold text-gray-700">Email Resmi</Label>
                             <Input className="rounded-xl border-gray-100 py-6" value={schoolInfo.email} onChange={e => setSchoolInfo({...schoolInfo, email: e.target.value})} />
                          </div>
                          <div className="grid gap-2">
                             <Label className="font-bold text-gray-700">Nomor Telepon</Label>
                             <Input className="rounded-xl border-gray-100 py-6" value={schoolInfo.phone} onChange={e => setSchoolInfo({...schoolInfo, phone: e.target.value})} />
                          </div>
                       </div>
                     </div>
                  </div>

                  <div className="space-y-6">
                     <h3 className="text-xl font-bold text-brand-deep flex items-center">
                        <Settings className="w-5 h-5 mr-3 text-brand-purple" />
                        Pengaturan Akademik
                     </h3>
                     <div className="grid gap-6">
                        <div className="grid grid-cols-2 gap-4">
                           <div className="grid gap-2">
                              <Label className="font-bold text-gray-700">Semester Aktif</Label>
                              <Select value={activeSemester} onValueChange={setActiveSemester}>
                                 <SelectTrigger className="rounded-xl border-gray-100 py-6"><SelectValue /></SelectTrigger>
                                 <SelectContent className="rounded-xl">
                                    <SelectItem value="GANJIL">Semester Ganjil</SelectItem>
                                    <SelectItem value="GENAP">Semester Genap</SelectItem>
                                 </SelectContent>
                              </Select>
                           </div>
                           <div className="grid gap-2">
                              <Label className="font-bold text-gray-700">Tahun Pelajaran</Label>
                              <Input 
                                 className="rounded-xl border-gray-100 py-6" 
                                 value={activeSchoolYear} 
                                 onChange={e => setActiveSchoolYear(e.target.value)}
                                 placeholder="Contoh: 2024/2025"
                              />
                           </div>
                        </div>
                     </div>
                  </div>

                  <Button 
                    className="rounded-2xl bg-brand-deep hover:bg-brand-deep/90 shadow-xl shadow-brand-deep/20 px-10 py-6 h-auto transition-all transform hover:scale-105 active:scale-95"
                    onClick={handleSaveSchool}
                    disabled={loading}
                 >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Save className="w-5 h-5 mr-3" />}
                    <span className="font-bold">Simpan Perubahan</span>
                 </Button>
              </div>

              <div className="space-y-8">
                 <Card className="rounded-[2.5rem] border-none shadow-xl bg-gray-50/50 p-8 border border-gray-100">
                    <h3 className="text-lg font-black text-brand-deep mb-6">Pratinjau Profil Publik</h3>
                    <div className="space-y-6">
                       <div className="flex items-center space-x-6">
                          <div className="w-24 h-24 rounded-3xl bg-brand-deep flex items-center justify-center text-white shadow-2xl">
                             <Building className="w-10 h-10" />
                          </div>
                          <div>
                             <p className="text-2xl font-black text-brand-deep">{schoolInfo.name}</p>
                             <div className="flex items-center space-x-2 mt-1">
                               <Badge className="bg-brand-purple/10 text-brand-purple border-none rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">{schoolInfo.level}</Badge>
                               <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">NPSN: {schoolInfo.npsn}</p>
                             </div>
                          </div>
                       </div>
                       <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                          <div>
                             <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter mb-1">Status Akreditasi</p>
                             <Badge className="bg-emerald-50 text-emerald-600 border-none rounded-lg px-3 py-1 font-bold">Terakreditasi {schoolInfo.accreditation}</Badge>
                          </div>
                          <div>
                             <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter mb-1">Email Sekolah</p>
                             <p className="text-sm font-bold text-gray-700">{schoolInfo.email}</p>
                          </div>
                       </div>
                    </div>
                 </Card>

                 <Card className="rounded-[2.5rem] border-none shadow-lg p-8 bg-white border border-gray-50">
                    <h3 className="font-bold text-brand-deep mb-6 flex items-center">
                       <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" />
                       Status Verifikasi
                    </h3>
                    <div className="space-y-4">
                       {[
                         { label: 'Domain Sekolah (.sch.id)', status: 'Terverifikasi' },
                         { label: 'Data Pokok Pendidikan (Dapodik)', status: 'Sinkron' },
                         { label: 'Server DBMS MySQL', status: 'Terhubung' }
                       ].map((item, i) => (
                         <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50/50">
                            <span className="text-xs font-bold text-gray-600">{item.label}</span>
                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg uppercase tracking-wider">{item.status}</span>
                         </div>
                       ))}
                    </div>
                 </Card>
              </div>
           </div>
        </TabsContent>

        <TabsContent value="users" className="focus-visible:outline-none">
           <div className="bg-gray-50/30 rounded-[2.5rem] p-1 border border-gray-100 overflow-hidden">
              <UsersManagement activeMenu="users" />
           </div>
        </TabsContent>

        <TabsContent value="security" className="focus-visible:outline-none">
           <div className="max-w-2xl space-y-8 py-4">
              <div className="flex items-center space-x-4 p-6 rounded-3xl bg-orange-50/50 border border-orange-100">
                 <Shield className="w-8 h-8 text-orange-500" />
                 <div>
                    <p className="font-bold text-orange-800">Keamanan Super Admin</p>
                    <p className="text-sm text-orange-600 font-medium">Anda sedang mengakses pengaturan sensitif. Pastikan untuk tidak memberikan akses ke pihak tidak berwenang.</p>
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="grid gap-6">
                    <div className="grid gap-2">
                       <Label className="font-bold text-gray-700">Ubah Password Admin</Label>
                       <div className="relative">
                          <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          <Input className="rounded-xl border-gray-100 py-6 pl-11" type="password" placeholder="Password Baru..." />
                       </div>
                    </div>
                    <div className="grid gap-2">
                       <Label className="font-bold text-gray-700">Konfirmasi Password Baru</Label>
                       <div className="relative">
                          <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          <Input className="rounded-xl border-gray-100 py-6 pl-11" type="password" placeholder="Ulangi Password Baru..." />
                       </div>
                    </div>
                 </div>
                 <Button className="rounded-2xl bg-brand-deep px-10 py-6 h-auto font-bold">Update Password Keamanan</Button>
              </div>
           </div>
        </TabsContent>

        <TabsContent value="system" className="focus-visible:outline-none">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
              <Card className="rounded-4xl border-none shadow-xl p-8 bg-gray-900 text-white">
                 <div className="flex items-center justify-between mb-8">
                    <Database className="w-8 h-8 text-brand-purple" />
                    <Badge className="bg-brand-purple/20 text-brand-purple border-none rounded-lg px-3 py-1 font-bold">PostgreSQL Active</Badge>
                 </div>
                 <h4 className="text-xl font-bold mb-2">Pencadangan Database</h4>
                 <p className="text-gray-400 text-sm mb-8 leading-relaxed">System secara otomatis melakukan pencadangan setiap hari Minggu pukul 00:00 WIB.</p>
                 <Button className="w-full rounded-2xl bg-white/10 hover:bg-white/20 border-none py-6 font-bold h-auto">Keluarkan CSV / SQL Sekarang</Button>
              </Card>

              <Card className="rounded-4xl border-none shadow-xl p-8 bg-white border border-gray-50 flex flex-col justify-between">
                 <div>
                    <h4 className="text-xl font-bold text-brand-deep mb-2">Versi Sistem</h4>
                    <p className="text-gray-400 text-sm">Versi dashboard: v2.4.0-premium</p>
                 </div>
                 <div className="pt-8 space-y-4">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                       <span>Pembaruan Terakhir</span>
                       <span className="text-brand-deep">20 Des 2024</span>
                    </div>
                    <Button variant="outline" className="w-full rounded-2xl border-gray-100 py-6 h-auto font-bold">Periksa Pembaruan Sistem</Button>
                 </div>
              </Card>
           </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
