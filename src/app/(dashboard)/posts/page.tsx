// src/app/(dashboard)/posts/page.tsx
import { createClient } from '../../../utils/supabase';
import { redirect } from 'next/navigation';

export default async function ManagePostsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch all jobs, ordered by newest first
  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="w-full max-w-7xl mx-auto">
      
      {/* Header: Stacks on mobile, inline on desktop */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">Manage Posts</h1>
        <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs sm:text-sm font-bold border border-slate-200 shadow-sm">
          {jobs?.length || 0} Total
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* =========================================
            MOBILE VIEW: Stacked Cards (Hidden on Desktop)
            ========================================= */}
        <div className="block md:hidden divide-y divide-slate-100">
          {jobs?.map((job) => (
            <div key={job.id} className="p-4 flex flex-col gap-3 hover:bg-slate-50/50 transition-colors">
              
              {/* Title & Status */}
              <div className="flex items-start justify-between gap-3">
                <a 
                  href={`https://parttimemm.com/jobs/${job.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-slate-900 hover:text-blue-600 flex items-start gap-1.5 leading-snug line-clamp-2"
                >
                  {job.title}
                  <svg className="w-3.5 h-3.5 opacity-50 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  job.status === 'open' 
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                }`}>
                  {job.status || 'open'}
                </span>
              </div>

              {/* Details (Location & Price) */}
              <div className="flex flex-col gap-1.5 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {job.township}, {job.city}
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {job.price ? `${new Intl.NumberFormat('en-MM').format(job.price)} MMK` : 'Negotiable'}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-2 pt-3 border-t border-slate-100">
                <button className="w-full py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-bold transition-colors border border-rose-200">
                  Delete Post
                </button>
              </div>

            </div>
          ))}

          {(!jobs || jobs.length === 0) && (
            <div className="p-8 text-center text-slate-500 text-sm font-medium">
              No posts found in the database.
            </div>
          )}
        </div>

        {/* =========================================
            DESKTOP VIEW: Data Table (Hidden on Mobile)
            ========================================= */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px] tracking-wider">
              <tr>
                <th className="px-6 py-4">Job Title</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobs?.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-semibold max-w-[250px] truncate">
                    <a 
                      href={`https://parttimemm.com/jobs/${job.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-900 hover:text-blue-600 hover:underline flex items-center gap-1.5 transition-colors"
                    >
                      {job.title}
                      <svg className="w-3.5 h-3.5 opacity-50 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {job.township}, {job.city}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">
                    {job.price ? `${new Intl.NumberFormat('en-MM').format(job.price)} MMK` : 'Negotiable'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      job.status === 'open' 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}>
                      {job.status || 'open'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-bold transition-colors border border-rose-200 shadow-sm hover:shadow active:scale-95">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {(!jobs || jobs.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">
                    No posts found in the database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}