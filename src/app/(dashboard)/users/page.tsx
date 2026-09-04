// src/app/(dashboard)/users/page.tsx
import { createClient } from '../../../utils/supabase';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import DocumentModal from '@/components/DocumentModal';

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const supabase = await createClient();

  // Secure the route
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // --- PAGINATION & SEARCH LOGIC ---
  const resolvedSearchParams = await searchParams;
  const currentPage = Number(resolvedSearchParams?.page) || 1;
  const searchQuery = resolvedSearchParams?.search || '';
  const itemsPerPage = 10; 
  
  const from = (currentPage - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  // Build query dynamically (Joined with kyc_applications)
  let query = supabase
    .from('profiles')
    .select('*, kyc_applications(id_card_url, selfie_url)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  // If a search term exists, filter by handle OR username
  if (searchQuery) {
    query = query.or(`handle.ilike.%${searchQuery}%,contact_username.ilike.%${searchQuery}%`);
  }

  const { data: profiles, count } = await query;
  const totalPages = count ? Math.ceil(count / itemsPerPage) : 1;

  // Helper to generate temporary view links for private bucket images
  const getImageUrl = async (path: string | null) => {
    if (!path) return null;
    const { data } = await supabase.storage.from('kyc_documents').createSignedUrl(path, 3600);
    return data?.signedUrl;
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">Users & KYC</h1>
        <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs sm:text-sm font-bold border border-slate-200 shadow-sm">
          {count || 0} Total Users
        </span>
      </div>

      {/* Search Bar */}
      <form method="GET" action="/users" className="mb-4 sm:mb-6 flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            name="search"
            defaultValue={searchQuery}
            placeholder="Search by username, phone, email, or handle..."
            className="w-full pl-11 pr-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-[#e3b23c] focus:border-[#e3b23c] text-sm outline-none transition-all"
          />
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
        <button type="submit" className="px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl shadow-sm transition-colors active:scale-95">
          Search
        </button>
        {searchQuery && (
          <Link href="/users" className="px-4 py-2.5 sm:py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-bold rounded-xl shadow-sm transition-colors flex items-center active:scale-95">
            Clear
          </Link>
        )}
      </form>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        
        {/* =========================================
            MOBILE VIEW: Stacked Cards (Compacted)
            ========================================= */}
        <div className="block md:hidden divide-y divide-slate-100">
          {profiles?.map(async (profile) => {
            let displayName = profile.contact_username;
            if (!displayName) {
              displayName = profile.handle?.startsWith('user_') 
                ? `Unknown (${profile.handle.slice(5, 9).toUpperCase()})` 
                : (profile.handle || 'Unknown');
            }
            const profileLink = `https://parttimemm.com/user/${profile.id}`;

            // Extract documents if they exist
            const kycData = profile.kyc_applications?.find((app: any) => app.id_card_url) || profile.kyc_applications?.[0];
            const idCardUrl = await getImageUrl(kycData?.id_card_url);
            const selfieUrl = await getImageUrl(kycData?.selfie_url);

            return (
              <div key={profile.id} className="p-3 sm:p-4 hover:bg-slate-50/50 transition-colors">
                
                {/* User Info */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    )}
                  </div>
                  <div>
                    <a href={profileLink} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-slate-900 hover:text-blue-600 line-clamp-1">
                      {displayName}
                    </a>
                    <span className="text-xs font-semibold text-slate-500 capitalize">{profile.role || 'User'}</span>
                  </div>
                </div>

                {/* Mobile Contact Info Display */}
                {(profile.contact_app || profile.contact_username) && (
                  <div className="mt-3 flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                    <span className="font-bold text-slate-600">{profile.contact_app || 'Contact'}:</span>
                    <span className="text-slate-500 truncate">{profile.contact_username || 'Not provided'}</span>
                  </div>
                )}

                {/* Status Badges, Docs & Action Button */}
                <div className="mt-3 flex items-end justify-between flex-wrap gap-3">
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${
                        profile.is_verified ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {profile.is_verified ? 'Verified' : 'Unverified'}
                      </span>
                      <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${
                        profile.is_blocked ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                      }`}>
                        {profile.is_blocked ? 'Blocked' : 'Active'}
                      </span>
                    </div>

                    {(idCardUrl || selfieUrl) && (
                      <div className="flex gap-2 mt-1">
                        {idCardUrl && <DocumentModal url={idCardUrl} label="View ID" className="px-2 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded text-[10px] font-bold" />}
                        {selfieUrl && <DocumentModal url={selfieUrl} label="View Selfie" className="px-2 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded text-[10px] font-bold" />}
                      </div>
                    )}
                  </div>
                  
                  <button className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors border shadow-sm ${
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
              {profiles?.map(async (profile) => {
                let displayName = profile.contact_username;
                if (!displayName) {
                  displayName = profile.handle?.startsWith('user_') 
                    ? `Unknown (${profile.handle.slice(5, 9).toUpperCase()})` 
                    : (profile.handle || 'Unknown');
                }
                const profileLink = `https://parttimemm.com/user/${profile.id}`;

                // Extract documents if they exist
                const kycData = profile.kyc_applications?.find((app: any) => app.id_card_url) || profile.kyc_applications?.[0];
                const idCardUrl = await getImageUrl(kycData?.id_card_url);
                const selfieUrl = await getImageUrl(kycData?.selfie_url);

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
                        
                        <div className="flex flex-col">
                          <a href={profileLink} target="_blank" rel="noopener noreferrer" className="font-semibold text-slate-900 hover:text-blue-600 hover:underline max-w-[200px] truncate">
                            {displayName}
                          </a>
                          
                          {/* Desktop Contact Info Display */}
                          {(profile.contact_app || profile.contact_username) && (
                            <span className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[200px]">
                              <span className="font-bold">{profile.contact_app || 'Contact'}:</span> {profile.contact_username}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold capitalize text-slate-700">
                      {profile.role || 'User'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2 items-start">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          profile.is_verified ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {profile.is_verified ? 'Verified' : 'Unverified'}
                        </span>

                        {(idCardUrl || selfieUrl) && (
                          <div className="flex gap-2">
                            {idCardUrl && <DocumentModal url={idCardUrl} label="ID Card" className="text-xs font-bold text-slate-500 hover:text-blue-600 underline" />}
                            {selfieUrl && <DocumentModal url={selfieUrl} label="Selfie" className="text-xs font-bold text-slate-500 hover:text-blue-600 underline" />}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        profile.is_blocked ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                      }`}>
                        {profile.is_blocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
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
            href={currentPage > 1 ? `/users?page=${currentPage - 1}${searchQuery ? `&search=${searchQuery}` : ''}` : '#'}
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
            href={currentPage < totalPages ? `/users?page=${currentPage + 1}${searchQuery ? `&search=${searchQuery}` : ''}` : '#'}
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