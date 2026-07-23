// src/components/AdminShell.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, FileText, Users, Flag, LogOut, Menu, X } from 'lucide-react';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900 antialiased">
      
      {/* Mobile Overlay (Darkens background when sidebar is open) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0f172a] text-slate-300 flex flex-col shadow-xl transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-6 mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-black text-white tracking-tight">
            PartTime<span className="text-[#e3b23c]">Admin</span>
          </h1>
          {/* Mobile Close Button */}
          <button onClick={closeSidebar} className="md:hidden text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-1.5">
          <Link href="/" onClick={closeSidebar} className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 text-white font-medium rounded-xl transition-colors border border-slate-700/50">
            <LayoutDashboard size={20} className="text-[#e3b23c]" /> 
            Dashboard
          </Link>
          <Link href="/posts" onClick={closeSidebar} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/50 hover:text-white font-medium rounded-xl transition-colors">
            <FileText size={20} /> 
            Manage Posts
          </Link>
          <Link href="/reports" onClick={closeSidebar} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/50 hover:text-white font-medium rounded-xl transition-colors">
            <Flag size={20} /> 
            Reports
          </Link>
          <Link href="/users" onClick={closeSidebar} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/50 hover:text-white font-medium rounded-xl transition-colors">
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-64 min-w-0">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            {/* Hamburger Menu Button (Mobile Only) */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-bold text-slate-800 hidden sm:block">Control Panel</h2>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-500 hidden sm:block">Admin Mode</span>
            <div className="w-9 h-9 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold border border-emerald-200 shadow-sm">
              A
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="p-4 md:p-8 flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}