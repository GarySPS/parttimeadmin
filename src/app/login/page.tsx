// src/app/login/page.tsx
import { login } from './action'
import { ShieldCheck } from 'lucide-react'

export default async function LoginPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ error?: string }> 
}) {
  const resolvedParams = await searchParams;
  const error = resolvedParams?.error;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-slate-900 text-[#e3b23c] rounded-xl flex items-center justify-center mb-4 shadow-inner">
            <ShieldCheck size={28} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Login</h1>
          <p className="text-slate-500 text-sm mt-1">Sign in to manage PartTimeMM</p>
        </div>

        <form action={login} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5" htmlFor="email">Email Address</label>
            <input 
              id="email" name="email" type="email" required 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#e3b23c]/50 focus:border-[#e3b23c] outline-none transition-all"
              placeholder="admin@parttimemm.com"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5" htmlFor="password">Password</label>
            <input 
              id="password" name="password" type="password" required 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#e3b23c]/50 focus:border-[#e3b23c] outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
          
          {error && (
            <div className="p-3 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-sm font-medium text-center">
              {error}
            </div>
          )}

          <button type="submit" className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-md hover:shadow-lg mt-2">
            Secure Sign In
          </button>
        </form>
      </div>
    </div>
  )
}