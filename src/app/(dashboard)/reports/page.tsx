// src/app/(dashboard)/reports/page.tsx
import { createClient } from '../../../utils/supabase';
import { redirect } from 'next/navigation';

export default async function ReportsPage() {
  const supabase = await createClient();

  // 1. Secure the route
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // 2. Fetch all reports and include the linked Job titles
  const { data: reports } = await supabase
    .from('reports')
    .select(`
      id,
      reason,
      created_at,
      job_id,
      reported_user_id,
      jobs ( title )
    `)
    .order('created_at', { ascending: false });

  // 3. Safely fetch the usernames of reported users to avoid foreign key conflicts
  const userIds = reports?.map((r) => r.reported_user_id).filter(Boolean) || [];
  const reportedUsersMap: Record<string, string> = {};
  
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, contact_username')
      .in('id', userIds);
      
    profiles?.forEach((p) => {
      reportedUsersMap[p.id] = p.contact_username || 'Anonymous Employer';
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900">Platform Reports</h1>
        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-bold border border-slate-200">
          {reports?.length || 0} Total
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-xs">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Target</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports?.map((report) => {
                const isJobReport = !!report.job_id;
                const jobData = report.jobs as any;
const jobTitle = Array.isArray(jobData) ? jobData[0]?.title : jobData?.title;

const targetName = isJobReport 
  ? jobTitle || 'Deleted Job'
  : reportedUsersMap[report.reported_user_id] || 'Unknown User';
                
                const targetLink = isJobReport
                  ? `https://parttimemm.com/jobs/${report.job_id}`
                  : `https://parttimemm.com/user/${report.reported_user_id}`;

                return (
                  <tr key={report.id} className="hover:bg-slate-50/50 transition-colors">
                    
                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-medium">
                      {new Date(report.created_at).toLocaleDateString()}
                    </td>
                    
                    {/* Badge: Job vs User */}
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        isJobReport 
                          ? 'bg-blue-50 text-blue-600 border border-blue-200'
                          : 'bg-purple-50 text-purple-600 border border-purple-200'
                      }`}>
                        {isJobReport ? 'Job' : 'User'}
                      </span>
                    </td>
                    
                    {/* Target Link */}
                    <td className="px-6 py-4 font-semibold text-slate-900 max-w-[200px] truncate">
                      <a 
                        href={targetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-600 hover:underline flex items-center gap-1.5 transition-colors"
                      >
                        {targetName}
                        <svg className="w-3.5 h-3.5 opacity-50 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </td>

                    {/* Reason */}
                    <td className="px-6 py-4 font-medium text-rose-600 capitalize">
                      {report.reason}
                    </td>
                    
                    {/* Action Buttons */}
                    <td className="px-6 py-4 text-right">
                      <button className="px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg text-xs font-bold transition-colors border border-slate-200">
                        Dismiss
                      </button>
                    </td>
                  </tr>
                );
              })}

              {(!reports || reports.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No reports found. Your platform is clean!
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