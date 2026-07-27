// src/app/(dashboard)/users/page.tsx
import { createClient } from '../../../utils/supabase';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const supabase = await createClient();

  // Secure the route
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // --- PAGINATION LOGIC ---
  const resolvedSearchParams = await searchParams;
  const currentPage = Number(resolvedSearchParams?.page) || 1;
  const itemsPerPage = 10; // Change this to show more/less per page
  
  const from = (currentPage - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  // Fetch profiles WITH count and range limits
  const { data: profiles, count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  const totalPages = count ? Math.ceil(count / itemsPerPage) : 1;

  return (
    <div className="w-full max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">Users & KYC</h1>
        <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs sm:text-sm font-bold border border-slate-200 shadow-sm">
          {count || 0} Total Users
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        
        {/* =========================================
            MOBILE VIEW: Stacked Cards
            ========================================= */}
        <div className="block md:hidden divide-y divide-slate-100">
          {profiles?.map((profile) => {
            const displayName = profile.contact_username || profile.handle || 'Unknown User';
            const profileLink = `https://parttimemm.com/user/${profile.id}`;

            return (
              <div key={profile.id} className="p-4 flex flex-col gap-3 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                      {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                      )}
                    </div>
                    <div>
                      <a 
                        href={profileLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-bold text-slate-900 hover:text-blue-600 flex items-center gap-1.5 leading-snug line-clamp-1"
                      >
                        {displayName}
                      </a>
                      <span className="text-xs font-semibold text-slate-500 capitalize">{profile.role || 'User'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-1">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    profile.is_verified ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>
                    {profile.is_verified ? 'Verified' : 'Unverified'}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    profile.is_blocked ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                  }`}>
                    {profile.is_blocked ? 'Blocked' : 'Active'}
                  </span>
                </div>

                <div className="mt-2 pt-3 border-t border-slate-100 flex gap-2">
                  <button className="flex-1 py-2.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl text-xs font-bold transition-colors border border-slate-200">
                    Toggle KYC
                  </button>
                  <button className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-colors border shadow-sm ${
                    profile.is_blocked ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                  }`}>
                    {profile.is_blocked ? 'Unblock' : 'Block'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* =========================================
            DESKTOP VIEW: Data Table
            ========================================= */}
        <div className="hidden md:block overflow-x-auto flex-1">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px] tracking-wider">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">KYC Status</th>
                <th className="px-6 py-4">Account</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {profiles?.map((profile) => {
                const displayName = profile.contact_username || profile.handle || 'Unknown User';
                const profileLink = `https://parttimemm.com/user/${profile.id}`;

                return (
                  <tr key={profile.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                          {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                          ) : (
                            <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                          )}
                        </div>
                        <a 
                          href={profileLink} target="_blank" rel="noopener noreferrer"
                          className="font-semibold text-slate-900 hover:text-blue-600 hover:underline max-w-[200px] truncate"
                        >
                          {displayName}
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold capitalize text-slate-700">
                      {profile.role || 'User'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        profile.is_verified ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {profile.is_verified ? 'Verified' : 'Unverified'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        profile.is_blocked ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                      }`}>
                        {profile.is_blocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                      <button className="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl text-xs font-bold transition-colors border border-slate-200 shadow-sm active:scale-95">
                        Toggle KYC
                      </button>
                      <button className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors border shadow-sm active:scale-95 ${
                        profile.is_blocked ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                      }`}>
                        {profile.is_blocked ? 'Unblock' : 'Block'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* =========================================
            PAGINATION CONTROLS
            ========================================= */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-t border-slate-200 bg-slate-50 mt-auto">
          <Link
            href={currentPage > 1 ? `/users?page=${currentPage - 1}` : '#'}
            className={`px-4 py-2 text-sm font-bold rounded-xl transition-all shadow-sm ${
              currentPage > 1 
                ? 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 active:scale-95' 
                : 'bg-slate-100 text-slate-400 border border-transparent opacity-50 cursor-not-allowed pointer-events-none'
            }`}
          >
            Previous
          </Link>
          
          <span className="text-sm font-semibold text-slate-600">
            Page {currentPage} of {totalPages}
          </span>
          
          <Link
            href={currentPage < totalPages ? `/users?page=${currentPage + 1}` : '#'}
            className={`px-4 py-2 text-sm font-bold rounded-xl transition-all shadow-sm ${
              currentPage < totalPages 
                ? 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 active:scale-95' 
                : 'bg-slate-100 text-slate-400 border border-transparent opacity-50 cursor-not-allowed pointer-events-none'
            }`}
          >
            Next
          </Link>
        </div>

        {(!profiles || profiles.length === 0) && (
          <div className="p-8 text-center text-slate-500 text-sm font-medium border-t border-slate-100">
            No users found.
          </div>
        )}
      </div>
    </div>
  );
}