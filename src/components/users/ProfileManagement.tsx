'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Mail, 
  Shield, 
  Camera,
  Smartphone,
  Check,
  X,
  Loader2,
  Lock
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog'
import { useRouter } from 'next/navigation'

interface UserProfile {
  id: string
  name: string
  role: string
  email: string
}

export default function ProfileManagement({ user }: { user: UserProfile }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email
  })

  // Password Change State
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordLoading, setPasswordLoading] = useState(false)

  // Sync state if user prop updates
  useEffect(() => {
    setFormData({
      name: user.name,
      email: user.email
    })
  }, [user])

  const handleUpdateProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        alert('Profil berhasil diperbarui! Silakan login ulang untuk melihat perubahan.')
        // Update local storage to reflect changes immediately if needed, or force logout
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
        localStorage.setItem('user', JSON.stringify({ ...currentUser, ...formData }))
        window.location.reload()
      } else {
        alert(`Gagal memperbarui profil: ${data.error}`)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Terjadi kesalahan server')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Konfirmasi password tidak cocok')
      return
    }
    if (passwordData.newPassword.length < 6) {
      alert('Password minimal 6 karakter')
      return
    }

    try {
      setPasswordLoading(true)
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordData.newPassword })
      })

      const data = await response.json()

      if (response.ok) {
        alert('Password berhasil diubah. Silakan login kembali dengan password baru.')
        setIsPasswordDialogOpen(false)
        setPasswordData({ newPassword: '', confirmPassword: '' })
        // Logout for security
        localStorage.removeItem('user')
        router.push('/login')
      } else {
        alert(`Gagal mengubah password: ${data.error}`)
      }
    } catch (error) {
      console.error('Error changing password:', error)
      alert('Terjadi kesalahan server')
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-deep">Profil Akun</h1>
          <p className="text-gray-400 font-medium">Informasi personal dan keamanan akun Anda</p>
        </div>
        <Button 
          onClick={handleUpdateProfile}
          disabled={loading}
          className="rounded-2xl bg-brand-deep hover:bg-brand-deep/90 shadow-lg px-8 py-6 h-auto transition-all transform hover:scale-105"
        >
          {loading ? (
             <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...</> 
          ) : (
             'Simpan Perubahan'
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
        {/* Left Card: Identity */}
        <Card className="md:col-span-1 rounded-[2.5rem] border-none shadow-2xl bg-brand-deep p-8 relative overflow-hidden flex flex-col items-center text-center">
           <div className="absolute top-[-20%] right-[-10%] w-[200px] h-[200px] bg-white/10 rounded-full blur-[60px]"></div>
           <div className="relative z-10 space-y-6">
              <div className="relative group">
                 <div className="w-32 h-32 rounded-4xl bg-white/20 backdrop-blur-md flex items-center justify-center border-2 border-white/20 overflow-hidden shadow-2xl">
                    <User className="w-16 h-16 text-white" />
                 </div>
                 <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-500 rounded-2xl flex items-center justify-center border-4 border-brand-deep shadow-xl transform group-hover:scale-110 transition-transform">
                    <Camera className="w-4 h-4 text-white" />
                 </button>
              </div>
              <div>
                 <h3 className="text-2xl font-black">{formData.name}</h3>
                 <Badge className="bg-white/20 hover:bg-white/30 text-white border-none rounded-lg px-3 py-1 font-bold mt-2 uppercase tracking-widest text-[10px]">{user.role}</Badge>
              </div>
              <div className="pt-6 border-t border-white/10 space-y-4 w-full">
                 <div className="flex items-center space-x-3 text-indigo-100/70">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm font-medium">{formData.email}</span>
                 </div>
                 <div className="flex items-center space-x-3 text-indigo-100/70">
                    <Smartphone className="w-4 h-4" />
                    <span className="text-sm font-medium">0812-3456-7890</span>
                 </div>
              </div>
           </div>
        </Card>

        {/* Right Card: Form & Security */}
        <Card className="md:col-span-2 rounded-[2.5rem] border-none shadow-2xl bg-white p-10 space-y-10">
           {/* Personal Info Form */}
           <div className="space-y-8">
              <div className="flex items-center">
                 <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 mr-4">
                    <User className="w-5 h-5" />
                 </div>
                 <h4 className="text-xl font-black text-brand-deep">Informasi Personal</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2 text-gray-900">
                    <Label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Nama Lengkap</Label>
                    <Input 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="py-7 rounded-2xl border-gray-100 bg-gray-50/50 font-bold" 
                    />
                 </div>
                 <div className="space-y-2 text-gray-900">
                    <Label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email</Label>
                    <Input 
                      value={formData.email} 
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="py-7 rounded-2xl border-gray-100 bg-gray-50/50 font-bold" 
                    />
                 </div>
              </div>
           </div>

           {/* Security Section */}
           <div className="space-y-8 pt-6 border-t border-gray-100">
              <div className="flex items-center">
                 <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 mr-4">
                    <Lock className="w-5 h-5" />
                 </div>
                 <h4 className="text-xl font-black text-brand-deep">Keamanan Akun</h4>
              </div>

              <div className="space-y-6">
                 {/* Password Row */}
                 <div className="flex items-center justify-between p-6 rounded-3xl bg-gray-50/50 border border-gray-100 group transition-all hover:bg-white hover:shadow-xl hover:border-transparent">
                    <div className="flex items-center space-x-4">
                       <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:bg-brand-deep group-hover:text-white transition-all text-gray-400">
                          <Shield className="w-6 h-6" />
                       </div>
                       <div>
                          <p className="font-bold text-gray-900">Kata Sandi</p>
                          <p className="text-xs text-gray-400 font-medium">Amankan akun Anda dengan sandi yang kuat</p>
                       </div>
                    </div>
                    
                    <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" className="rounded-xl font-bold text-brand-deep hover:bg-brand-deep hover:text-white">
                          Ganti Sandi
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md rounded-3xl p-8">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-black text-brand-deep">Ubah Kata Sandi</DialogTitle>
                          <DialogDescription>Masukkan kata sandi baru untuk akun Anda.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                           <div className="space-y-2">
                              <Label className="font-bold">Password Baru</Label>
                              <Input 
                                type="password" 
                                className="rounded-xl py-6"
                                value={passwordData.newPassword}
                                onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                              />
                           </div>
                           <div className="space-y-2">
                              <Label className="font-bold">Konfirmasi Password Baru</Label>
                              <Input 
                                type="password" 
                                className="rounded-xl py-6"
                                value={passwordData.confirmPassword}
                                onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                              />
                           </div>
                        </div>
                        <DialogFooter>
                           <Button 
                             onClick={handleChangePassword} 
                             disabled={passwordLoading}
                             className="w-full rounded-xl bg-brand-deep py-6 font-bold"
                           >
                             {passwordLoading ? 'Memproses...' : 'Simpan Password Baru'}
                           </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                 </div>

                 {/* 2FA Row (Mock) */}
                 <div className="flex items-center justify-between p-6 rounded-3xl bg-gray-50/50 border border-gray-100 group transition-all hover:bg-white hover:shadow-xl hover:border-transparent">
                    <div className="flex items-center space-x-4">
                       <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:bg-indigo-500 group-hover:text-white transition-all text-gray-400">
                          <Smartphone className="w-6 h-6" />
                       </div>
                       <div>
                          <p className="font-bold text-gray-900">Verifikasi 2 Langkah</p>
                          <p className="text-xs text-emerald-500 font-bold flex items-center">
                             <Check className="w-3 h-3 mr-1" /> Aktif (Default)
                          </p>
                       </div>
                    </div>
                    {/* Dummy Button */}
                    <Button variant="ghost" disabled className="rounded-xl font-bold text-gray-400">Nonaktifkan</Button>
                 </div>
              </div>
           </div>
        </Card>
      </div>
    </div>
  )
}
