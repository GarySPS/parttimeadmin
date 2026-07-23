// src/components/Sidebar.tsx
import Link from 'next/link';
import { LayoutDashboard, FileText, Users, Flag, ShieldCheck, LogOut } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-[#0f172a] text-slate-300 flex flex-col h-screen fixed left-0 top-0 shadow-xl">
      <div className="p-6 mb-4">
        <h1 className="text-2xl font-black text-white tracking-tight">
          PartTime<span className="text-[#e3b23c]">Admin</span>
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-1.5">
        <Link href="/" className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 text-white font-medium rounded-xl transition-colors border border-slate-700/50">
          <LayoutDashboard size={20} className="text-[#e3b23c]" /> 
          Dashboard
        </Link>
        <Link href="/posts" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/50 hover:text-white font-medium rounded-xl transition-colors">
          <FileText size={20} /> 
          Manage Posts
        </Link>
        <Link href="/reports" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/50 hover:text-white font-medium rounded-xl transition-colors">
          <Flag size={20} /> 
          Reports
        </Link>
        <Link href="/users" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/50 hover:text-white font-medium rounded-xl transition-colors">
          <Users size={20} /> 
          Users & KYC
        </Link>
      </nav>

      <div className="p-4 border-t border-slate-800 mt-auto">
        <button className="flex items-center gap-3 px-4 py-3 w-full hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 font-medium rounded-xl transition-colors">
          <LogOut size={20} /> 
          Sign Out
        </button>
      </div>
    </aside>
  );
}