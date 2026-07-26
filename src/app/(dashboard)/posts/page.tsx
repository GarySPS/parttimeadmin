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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900">Manage Posts</h1>
        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-bold border border-slate-200">
          {jobs?.length || 0} Total
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-xs">
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
                  <td className="px-6 py-4 font-semibold max-w-xs truncate">
  <a 
    href={`https://parttimemm.com/jobs/${job.id}`}
    target="_blank"
    rel="noopener noreferrer"
    className="text-slate-900 hover:text-blue-600 hover:underline flex items-center gap-1.5 transition-colors"
  >
    {job.title}
    {/* External Link Icon */}
    <svg className="w-3.5 h-3.5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  </a>
</td>
                  <td className="px-6 py-4">
                    {job.township}, {job.city}
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {job.price ? `${new Intl.NumberFormat('en-MM').format(job.price)} MMK` : 'Negotiable'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                      job.status === 'open' 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}>
                      {job.status || 'open'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-bold transition-colors border border-rose-200">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {(!jobs || jobs.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
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