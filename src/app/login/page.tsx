'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { 
  GraduationCap, 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  UserSquare2, 
  BookOpen,
  Loader2
} from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'ADMIN' | 'HOMEROOM' | 'TEACHER'>('ADMIN')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Login gagal')
      }

      localStorage.setItem('user', JSON.stringify(data.user))
      toast.success('Login Berhasil', { description: `Selamat datang, ${data.user.name}` })
      router.push('/')
    } catch (error: any) {
      console.error('Login Error:', error)
      toast.error('Login Gagal', { description: error.message || 'Periksa kembali email dan password Anda.' })
    } finally {
      setLoading(false)
    }
  }

  // Effect to set default credentials based on tab (optional, for demo convenience)
  useEffect(() => {
    if (activeTab === 'ADMIN') {
      setEmail('admin@sdn1.sch.id')
      setPassword('admin123')
    } else if (activeTab === 'HOMEROOM') {
      setEmail('walikelas1@sdn1.sch.id') 
      setPassword('walikelas123')
    } else if (activeTab === 'TEACHER') {
      setEmail('guru1@sdn1.sch.id') 
      setPassword('guru123')
    } else {
      // Other
      setEmail('')
      setPassword('')
    }
  }, [activeTab])

  return (
    <div className="min-h-screen bg-[#f1f3f9] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-brand-deep/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-brand-purple/5 rounded-full blur-[100px]"></div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white rounded-[3rem] shadow-2xl overflow-hidden relative z-10">
        {/* Left Side: Illustration */}
        <div className="hidden lg:flex flex-col justify-between p-16 bg-brand-deep relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          
          <div className="relative z-10">
            <div className="flex items-center space-x-4 mb-12">
               <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-xl">
                  <GraduationCap className="text-white w-7 h-7" />
               </div>
               <span className="text-3xl font-black text-white tracking-tight">Smart School</span>
            </div>
            <h1 className="text-5xl font-black text-white leading-tight mb-6">
              Sistem Manajemen <br /> <span className="text-indigo-300">Sekolah Modern.</span>
            </h1>
            <p className="text-indigo-100 text-lg font-medium leading-relaxed max-w-md opacity-80">
              Platform terpadu untuk mengelola seluruh operasional sekolah dengan efisiensi maksimal dan desain yang memukau.
            </p>
          </div>

          <div className="relative z-10">
             <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-400 flex items-center justify-center text-brand-deep">
                   <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                   <p className="text-white font-bold">Terproteksi & Aman</p>
                   <p className="text-indigo-200 text-xs font-medium">Enkripsi data standar industri pendidikan</p>
                </div>
             </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-12 lg:p-20 flex flex-col justify-center bg-white">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-black text-brand-deep mb-3">Selamat Datang</h2>
            <p className="text-gray-400 font-bold">Silakan masuk untuk mengakses dashboard Anda</p>
          </div>

          <div className="flex bg-gray-50 p-1.5 rounded-2xl mb-10">
            <button 
              onClick={() => setActiveTab('ADMIN')}
              className={`flex-1 flex items-center justify-center py-4 rounded-xl text-sm font-black transition-all ${activeTab === 'ADMIN' ? 'bg-white text-brand-deep shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <ShieldCheck className="w-4 h-4 mr-2" /> Admin
            </button>
            <button 
              onClick={() => setActiveTab('HOMEROOM')}
              className={`flex-1 flex items-center justify-center py-4 rounded-xl text-sm font-black transition-all ${activeTab === 'HOMEROOM' ? 'bg-white text-brand-deep shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <UserSquare2 className="w-4 h-4 mr-2" /> Wali Kelas
            </button>
            <button 
              onClick={() => setActiveTab('TEACHER')}
              className={`flex-1 flex items-center justify-center py-4 rounded-xl text-sm font-black transition-all ${activeTab === 'TEACHER' ? 'bg-white text-brand-deep shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <BookOpen className="w-4 h-4 mr-2" /> Guru
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</Label>
              <div className="relative">
                 <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                 <Input 
                   type="email" 
                   placeholder="name@school.id" 
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   className="pl-12 py-7 rounded-2xl border-gray-100 bg-gray-50/50 font-bold focus-visible:ring-brand-purple" 
                   required
                 />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <Label className="text-xs font-black text-gray-400 uppercase tracking-widest">Password</Label>
                <button type="button" className="text-xs font-bold text-brand-deep hover:underline">Forgot password?</button>
              </div>
              <div className="relative">
                 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                 <Input 
                   type="password" 
                   placeholder="••••••••" 
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="pl-12 py-7 rounded-2xl border-gray-100 bg-gray-50/50 font-bold focus-visible:ring-brand-purple" 
                   required
                 />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full py-8 rounded-3xl bg-brand-deep hover:bg-brand-deep/90 text-white font-bold text-lg shadow-2xl shadow-brand-deep/20 flex items-center justify-center space-x-3 transition-all transform hover:scale-[1.02] active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Sedang Masuk...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Dashboard</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-12 text-center text-gray-400 font-medium text-sm">
            Butuh bantuan akses? <span className="text-brand-deep font-bold cursor-pointer hover:underline">Hubungi Tim IT Sekolah</span>
          </p>
        </div>
      </div>
    </div>
  )
}
