'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  User, 
  Fingerprint, 
  Camera,
  Save,
  ShieldCheck,
  Calendar,
  Info,
  Loader2
} from 'lucide-react'

export default function SchoolManagement() {
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    npsn: '',
    nss: '',
    address: '',
    postalCode: '',
    phone: '',
    email: '',
    website: '',
    principalName: '',
    principalNip: '',
    foundedYear: '1985' // Mock or add to DB
  })

  useEffect(() => {
    fetchSchoolData()
  }, [])

  const fetchSchoolData = async () => {
    try {
      const res = await fetch('/api/school')
      const data = await res.json()
      if (data.school) {
        setFormData({
            name: data.school.name || '',
            npsn: data.school.npsn || '',
            nss: data.school.nss || '',
            address: data.school.address || '',
            postalCode: data.school.postalCode || '',
            phone: data.school.phone || '',
            email: data.school.email || '',
            website: data.school.website || '',
            principalName: data.school.principalName || '',
            principalNip: data.school.principalNip || '',
            foundedYear: data.school.established?.toString() || '1985'
        })
      }
    } catch (err) {
      console.error('Failed to fetch school data:', err)
    } finally {
        setFetching(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
        const res = await fetch('/api/school', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
        const data = await res.json()
        if (data.error) throw new Error(data.error)
        alert('Data sekolah berhasil diperbarui!')
    } catch (err) {
        console.error(err)
        alert('Gagal menyimpan data sekolah')
    } finally {
        setLoading(false)
    }
  }

  if (fetching) {
      return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-purple" /></div>
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-deep">Identitas Sekolah</h1>
          <p className="text-gray-400 font-medium">Kelola informasi dasar dan legalitas institusi pendidikan</p>
        </div>
        <Button 
          onClick={handleSave}
          disabled={loading}
          className="rounded-2xl bg-brand-deep hover:bg-brand-deep/90 shadow-2xl shadow-brand-deep/20 px-8 py-7 h-auto transform hover:scale-105 active:scale-95 transition-all min-w-[180px]"
        >
          {loading ? (
            <div className="flex items-center">
              <Loader2 className="w-5 h-5 animate-spin mr-3" />
              <span>Menyimpan...</span>
            </div>
          ) : (
            <>
              <Save className="w-5 h-5 mr-3" />
              <span className="font-bold">Simpan Perubahan</span>
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Kolom Kiri: Logo & Info Utama */}
        <div className="space-y-8">
          <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-white">
            <CardHeader className="p-8 pb-0 text-center">
              <CardTitle className="text-xl font-black text-brand-deep">Logo Sekolah</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="relative group mx-auto w-48 h-48">
                <div className="w-full h-full rounded-[2.5rem] bg-gray-50 border-2 border-dashed border-gray-100 flex items-center justify-center overflow-hidden transition-all group-hover:border-brand-purple/50">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-contain p-4" />
                  ) : (
                    <div className="text-center">
                      <Camera className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Format PNG/JPG</p>
                    </div>
                  )}
                </div>
                <label className="absolute inset-0 cursor-pointer">
                  <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                </label>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-brand-deep text-white rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform pointer-events-none">
                  <Camera className="w-5 h-5" />
                </div>
              </div>
              <p className="text-center text-xs text-gray-400 leading-relaxed font-medium">Klik pada area di atas untuk mengganti logo sekolah. Gunakan gambar dengan resolusi tinggi.</p>
            </CardContent>
          </Card>

          <Card className="rounded-[2.5rem] border-none shadow-2xl bg-brand-deep p-8 text-white relative overflow-hidden">
             <div className="absolute top-[-50%] right-[-10%] w-[200px] h-[200px] bg-white/10 rounded-full blur-[80px]"></div>
             <div className="relative z-10 space-y-6">
                <div>
                   <h3 className="text-2xl font-black">Status Sekolah</h3>
                   <div className="flex gap-2 mt-3">
                      <Badge className="bg-white/20 hover:bg-white/30 text-white border-none rounded-lg px-3 py-1 font-bold">Terakreditasi A</Badge>
                      <Badge className="bg-emerald-400 text-brand-deep border-none rounded-lg px-3 py-1 font-bold">Aktif</Badge>
                   </div>
                </div>
                <div className="space-y-4 pt-4">
                   <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                         <ShieldCheck className="w-5 h-5 text-indigo-200" />
                      </div>
                      <div>
                         <p className="text-[10px] uppercase font-black text-indigo-200 tracking-widest">NPSN</p>
                         <p className="text-lg font-bold">{formData.npsn || '-'}</p>
                      </div>
                   </div>
                   <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                         <Calendar className="w-5 h-5 text-indigo-200" />
                      </div>
                      <div>
                         <p className="text-[10px] uppercase font-black text-indigo-200 tracking-widest">Berdiri Sejak</p>
                         <p className="text-lg font-bold">{formData.foundedYear}</p>
                      </div>
                   </div>
                </div>
             </div>
          </Card>
        </div>

        {/* Kolom Tengah & Kanan: Form Data */}
        <div className="xl:col-span-2 space-y-8">
           <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white overflow-hidden">
              <div className="p-10 border-b border-gray-50 bg-gray-50/30">
                 <h3 className="text-2xl font-black text-brand-deep flex items-center">
                    <Building2 className="w-8 h-8 mr-4 text-brand-purple" />
                    Informasi Umum & Legalitas
                 </h3>
              </div>
              <CardContent className="p-10">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <Label className="text-sm font-bold text-gray-700 ml-1">Nama Sekolah</Label>
                       <div className="relative">
                          <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-purple/50" />
                          <Input value={formData.name} onChange={e => handleChange('name', e.target.value)} className="pl-12 py-7 rounded-2xl border-gray-100 bg-gray-50/50 font-bold focus-visible:ring-brand-purple" />
                       </div>
                    </div>
                    <div className="space-y-3">
                       <Label className="text-sm font-bold text-gray-700 ml-1">NPSN</Label>
                       <div className="relative">
                          <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-purple/50" />
                          <Input value={formData.npsn} onChange={e => handleChange('npsn', e.target.value)} className="pl-12 py-7 rounded-2xl border-gray-100 bg-gray-50/50 font-bold focus-visible:ring-brand-purple" />
                       </div>
                    </div>
                    <div className="space-y-3">
                       <Label className="text-sm font-bold text-gray-700 ml-1">NSS</Label>
                       <div className="relative">
                          <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-purple/50" />
                          <Input value={formData.nss} onChange={e => handleChange('nss', e.target.value)} className="pl-12 py-7 rounded-2xl border-gray-100 bg-gray-50/50 font-bold focus-visible:ring-brand-purple" />
                       </div>
                    </div>
                    <div className="space-y-3">
                       <Label className="text-sm font-bold text-gray-700 ml-1">Kode Pos</Label>
                       <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-purple/50" />
                          <Input value={formData.postalCode} onChange={e => handleChange('postalCode', e.target.value)} className="pl-12 py-7 rounded-2xl border-gray-100 bg-gray-50/50 font-bold focus-visible:ring-brand-purple" />
                       </div>
                    </div>
                    <div className="md:col-span-2 space-y-3">
                       <Label className="text-sm font-bold text-gray-700 ml-1">Alamat Lengkap</Label>
                       <div className="relative">
                          <MapPin className="absolute left-4 top-6 w-4 h-4 text-brand-purple/50" />
                          <Textarea 
                            value={formData.address} 
                            onChange={e => handleChange('address', e.target.value)}
                            className="pl-12 pt-5 min-h-[120px] rounded-2xl border-gray-100 bg-gray-50/50 font-bold focus-visible:ring-brand-purple" 
                          />
                       </div>
                    </div>
                 </div>
              </CardContent>
           </Card>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Card: Kontak */}
              <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white overflow-hidden">
                <div className="p-8 border-b border-gray-50">
                   <h3 className="text-xl font-black text-brand-deep flex items-center">
                      <Phone className="w-6 h-6 mr-3 text-brand-purple" />
                      Kontak & Digital
                   </h3>
                </div>
                <CardContent className="p-8 space-y-6">
                   <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email Sekolah</Label>
                      <div className="relative">
                         <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-purple/50" />
                         <Input value={formData.email} onChange={e => handleChange('email', e.target.value)} className="pl-12 py-6 rounded-xl border-gray-100 bg-gray-50/50 font-bold" />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nomor Telepon</Label>
                      <div className="relative">
                         <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-purple/50" />
                         <Input value={formData.phone} onChange={e => handleChange('phone', e.target.value)} className="pl-12 py-6 rounded-xl border-gray-100 bg-gray-50/50 font-bold" />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Website</Label>
                      <div className="relative">
                         <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-purple/50" />
                         <Input value={formData.website} onChange={e => handleChange('website', e.target.value)} className="pl-12 py-6 rounded-xl border-gray-100 bg-gray-50/50 font-bold" />
                      </div>
                   </div>
                </CardContent>
              </Card>

              {/* Card: Kepemimpinan */}
              <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white overflow-hidden">
                <div className="p-8 border-b border-gray-50">
                   <h3 className="text-xl font-black text-brand-deep flex items-center">
                      <User className="w-6 h-6 mr-3 text-brand-purple" />
                      Pimpinan Sekolah
                   </h3>
                </div>
                <CardContent className="p-8 space-y-6">
                   <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nama Kepala Sekolah</Label>
                      <div className="relative">
                         <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-purple/50" />
                         <Input value={formData.principalName} onChange={e => handleChange('principalName', e.target.value)} className="pl-12 py-6 rounded-xl border-gray-100 bg-gray-50/50 font-bold" />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">NIP Kepala Sekolah</Label>
                      <div className="relative">
                         <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-purple/50" />
                         <Input value={formData.principalNip} onChange={e => handleChange('principalNip', e.target.value)} className="pl-12 py-6 rounded-xl border-gray-100 bg-gray-50/50 font-bold" />
                      </div>
                   </div>
                   <div className="pt-2">
                      <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-start space-x-3">
                         <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                         <p className="text-[11px] text-indigo-700 font-medium leading-relaxed">
                            Pastikan data kepala sekolah sesuai dengan SK Penangkatan terbaru untuk keperluan cetak rapor dan ijazah.
                         </p>
                      </div>
                   </div>
                </CardContent>
              </Card>
           </div>
        </div>
      </div>
    </div>
  )
}
