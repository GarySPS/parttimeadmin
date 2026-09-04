// src/app/(dashboard)/page.tsx

import { createClient } from '../../utils/supabase';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Search, User, MoreVertical } from 'lucide-react'; // Added Lucide icons

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

  // 3. Fetch 3 most recent users for the UI list
  const { data: recentUsers } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3);

  return (
    <div className="w-full max-w-7xl mx-auto pb-10">
      <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-4 sm:mb-6">Platform Overview</h1>
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-10">
        
        {/* Active Posts Card */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
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

      {/* Recent Users Section */}
      <div>
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Recent Users</h2>
          <Link href="/users" className="text-xs font-semibold text-blue-600 hover:underline">
            View All
          </Link>
        </div>

        {/* Modern Search Bar */}
        <div className="relative mb-5">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input 
            type="text" 
            className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow shadow-sm" 
            placeholder="Search users..."
          />
        </div>

        {/* Dynamic User List */}
        <div className="space-y-3">
          {recentUsers && recentUsers.length > 0 ? (
            recentUsers.map((profile) => (
              <div key={profile.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4 hover:border-slate-200 transition-colors">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center text-slate-500">
                  <User size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-sm font-bold text-slate-800 truncate">
                      {profile.full_name || profile.username || `Unknown (${profile.id.substring(0, 4).toUpperCase()})`}
                    </h3>
                    <button className="text-slate-400 hover:text-slate-700 p-1 -mr-1 rounded-lg transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">{profile.role || 'Seeker'}</p>
                  
                  <div className="flex gap-2">
                    {profile.is_verified ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-700">Verified</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">Unverified</span>
                    )}
                    
                    {profile.status === 'blocked' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-700">Blocked</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-700">Active</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 border-dashed">
              <p className="text-sm font-medium text-slate-500">No recent users found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}