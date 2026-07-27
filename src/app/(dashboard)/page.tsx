// src/app/(dashboard)/page.tsx
import { createClient } from '../../utils/supabase';
import { redirect } from 'next/navigation';

export default async function Home() {
  const supabase = await createClient();

  // 1. Secure the page: check if logged in
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // 2. Fetch live counts from Supabase
  const { count: activePosts } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'open');

  const { count: pendingReports } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true });

  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  return (
    <div className="w-full max-w-7xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-4 sm:mb-6">Platform Overview</h1>
      
      {/* Changed to grid-cols-2 on medium screens for better mobile-tablet flow */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Active Posts Card */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          {/* Decorative background icon */}
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <svg className="w-16 h-16 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M20 6h-4V4c0-1.103-.897-2-2-2h-4c-1.103 0-2 .897-2 2v2H4c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V8c0-1.103-.897-2-2-2zM10 4h4v2h-4V4z"/></svg>
          </div>
          <p className="text-xs sm:text-sm font-bold tracking-wide uppercase text-slate-500">Active Posts</p>
          <p className="text-3xl sm:text-4xl font-black text-slate-900 mt-2">{activePosts || 0}</p>
        </div>
        
        {/* Pending Reports Card */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <svg className="w-16 h-16 text-rose-600" fill="currentColor" viewBox="0 0 24 24"><path d="M11.953 2C6.465 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.493 2 11.953 2zM13 17h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
          </div>
          <p className="text-xs sm:text-sm font-bold tracking-wide uppercase text-slate-500">Pending Reports</p>
          <p className="text-3xl sm:text-4xl font-black text-rose-500 mt-2">{pendingReports || 0}</p>
        </div>
        
        {/* Total Users Card */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <svg className="w-16 h-16 text-emerald-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/><path d="M12 7c-1.654 0-3 1.346-3 3s1.346 3 3 3 3-1.346 3-3-1.346-3-3-3zm0 4.5c-.827 0-1.5-.673-1.5-1.5s.673-1.5 1.5-1.5 1.5.673 1.5 1.5-.673 1.5-1.5 1.5zM15.938 17.5c-.218-2.213-2.072-3.92-4.321-3.92H12.38c-2.249 0-4.103 1.707-4.321 3.92l1.983.218c.135-1.378 1.285-2.454 2.684-2.454h.346c1.399 0 2.55 1.076 2.684 2.454l1.983-.218z"/></svg>
          </div>
          <p className="text-xs sm:text-sm font-bold tracking-wide uppercase text-slate-500">Total Users</p>
          <p className="text-3xl sm:text-4xl font-black text-slate-900 mt-2">{totalUsers || 0}</p>
        </div>

      </div>
    </div>
  );
}