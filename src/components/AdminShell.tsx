// src/components/AdminShell.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, Users, Flag, LogOut, Menu, X, ShieldCheck } from 'lucide-react';

// Separate KYC from Users
const navLinks = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Manage Posts', href: '/posts', icon: FileText },
  { name: 'Reports', href: '/reports', icon: Flag },
  { name: 'KYC Reviews', href: '/kyc', icon: ShieldCheck },
  { name: 'All Users', href: '/users', icon: Users },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname(); // Gets the current URL path

  const closeSidebar = () => setIsSidebarOpen(false);

  // Quick sign out handler (you can wire this to Supabase later)
  const handleSignOut = () => {
    // Add your supabase signout logic here later
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900 antialiased">
      
      {/* Mobile Overlay (Darkens background when sidebar is open) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0f172a] text-slate-300 flex flex-col shadow-2xl transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-6 mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-black text-white tracking-tight">
            PartTime<span className="text-[#e3b23c]">Admin</span>
          </h1>
          {/* Mobile Close Button */}
          <button onClick={closeSidebar} className="md:hidden text-slate-400 hover:text-white transition-colors active:scale-90 p-1">
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            // Check if active (exact match for home, or starts with for sub-pages)
            const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);

            return (
              <Link 
                key={link.name}
                href={link.href} 
                onClick={closeSidebar} 
                className={`flex items-center gap-3 px-4 py-3 font-medium rounded-xl transition-all active:scale-95 ${
                  isActive 
                    ? 'bg-slate-800 text-white shadow-sm border border-slate-700' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white border border-transparent'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-[#e3b23c]' : 'opacity-70'} /> 
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800/50 mt-auto">
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 w-full hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 font-medium rounded-xl transition-all active:scale-95"
          >
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
              className="md:hidden p-2.5 -ml-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors active:scale-90"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-bold text-slate-800 hidden sm:block">Control Panel</h2>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest hidden sm:block">Admin Mode</span>
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 text-white rounded-full flex items-center justify-center font-bold shadow-sm border-2 border-white ring-2 ring-emerald-50">
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