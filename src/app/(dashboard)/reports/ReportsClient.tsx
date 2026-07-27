// src/app/(dashboard)/reports/ReportsClient.tsx
'use client';

import { useState } from 'react';
import { dismissReport, deleteJobAndNotify, blockUserAndNotify } from './actions';

type ActionModalState = {
  isOpen: boolean;
  type: 'DELETE_JOB' | 'BLOCK_USER' | null;
  reportId: string;
  targetId: string;
  employerId?: string; // Used for notifying job owner
} | null;

export default function ReportsClient({ reports, reportedUsersMap }: { reports: any[], reportedUsersMap: Record<string, string> }) {
  const [modal, setModal] = useState<ActionModalState>(null);
  const [reasonText, setReasonText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAction = async () => {
    if (!modal || !reasonText) return;
    setIsProcessing(true);

    if (modal.type === 'DELETE_JOB') {
      await deleteJobAndNotify(modal.reportId, modal.targetId, modal.employerId || null, reasonText);
    } else if (modal.type === 'BLOCK_USER') {
      await blockUserAndNotify(modal.reportId, modal.targetId, reasonText);
    }

    setModal(null);
    setReasonText('');
    setIsProcessing(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      
      {/* Header: Stacks on mobile, inline on desktop */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">Platform Reports</h1>
        <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs sm:text-sm font-bold border border-slate-200 shadow-sm">
          {reports.length} Total
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* =========================================
            MOBILE VIEW: Stacked Cards (Hidden on Desktop)
            ========================================= */}
        <div className="block md:hidden divide-y divide-slate-100">
          {reports.map((report) => {
            const isJobReport = !!report.job_id;
            const jobData = report.jobs as any;
            const jobTitle = Array.isArray(jobData) ? jobData[0]?.title : jobData?.title;
            const jobEmployerId = Array.isArray(jobData) ? jobData[0]?.employer_id : jobData?.employer_id;

            const targetName = isJobReport ? jobTitle || 'Deleted Job' : reportedUsersMap[report.reported_user_id] || 'Unknown User';
            const targetLink = isJobReport ? `https://parttimemm.com/jobs/${report.job_id}` : `https://parttimemm.com/user/${report.reported_user_id}`;

            return (
              <div key={report.id} className="p-4 flex flex-col gap-3 hover:bg-slate-50/50 transition-colors">
                
                {/* Date & Badge */}
                <div className="flex items-start justify-between gap-3">
                  <span className="text-xs font-semibold text-slate-500">
                    {new Date(report.created_at).toLocaleDateString()}
                  </span>
                  <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    isJobReport ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-purple-50 text-purple-600 border border-purple-200'
                  }`}>
                    {isJobReport ? 'Job' : 'User'}
                  </span>
                </div>

                {/* Target Link & Reason */}
                <div className="flex flex-col gap-1.5">
                  <a 
                    href={targetLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sm font-bold text-slate-900 hover:text-blue-600 flex items-start gap-1.5 leading-snug line-clamp-2"
                  >
                    {targetName}
                    <svg className="w-3.5 h-3.5 opacity-50 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  <p className="text-xs font-bold text-rose-600 capitalize bg-rose-50 border border-rose-100 p-2 rounded-lg inline-block self-start">
                    Reason: {report.reason}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="mt-1 pt-3 border-t border-slate-100 flex gap-2">
                  <button 
                    onClick={() => dismissReport(report.id)} 
                    className="flex-1 py-2.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl text-xs font-bold transition-colors border border-slate-200"
                  >
                    Dismiss
                  </button>
                  {isJobReport ? (
                    <button 
                      onClick={() => setModal({ isOpen: true, type: 'DELETE_JOB', reportId: report.id, targetId: report.job_id, employerId: jobEmployerId })}
                      className="flex-1 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-bold transition-colors border border-rose-200 shadow-sm"
                    >
                      Delete Post
                    </button>
                  ) : (
                    <button 
                      onClick={() => setModal({ isOpen: true, type: 'BLOCK_USER', reportId: report.id, targetId: report.reported_user_id })}
                      className="flex-1 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-bold transition-colors border border-rose-200 shadow-sm"
                    >
                      Block User
                    </button>
                  )}
                </div>

              </div>
            );
          })}

          {reports.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-sm font-medium">
              No reports found. Your platform is clean!
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
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Target</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports.map((report) => {
                const isJobReport = !!report.job_id;
                const jobData = report.jobs as any;
                const jobTitle = Array.isArray(jobData) ? jobData[0]?.title : jobData?.title;
                const jobEmployerId = Array.isArray(jobData) ? jobData[0]?.employer_id : jobData?.employer_id;

                const targetName = isJobReport ? jobTitle || 'Deleted Job' : reportedUsersMap[report.reported_user_id] || 'Unknown User';
                const targetLink = isJobReport ? `https://parttimemm.com/jobs/${report.job_id}` : `https://parttimemm.com/user/${report.reported_user_id}`;

                return (
                  <tr key={report.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-medium">
                      {new Date(report.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isJobReport ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-purple-50 text-purple-600 border border-purple-200'}`}>
                        {isJobReport ? 'Job' : 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900 max-w-[250px] truncate">
                      <a href={targetLink} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 hover:underline flex items-center gap-1.5 transition-colors">
                        {targetName}
                        <svg className="w-3.5 h-3.5 opacity-50 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </td>
                    <td className="px-6 py-4 font-bold text-rose-600 capitalize">
                      {report.reason}
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                      <button onClick={() => dismissReport(report.id)} className="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl text-xs font-bold transition-colors border border-slate-200 shadow-sm active:scale-95">
                        Dismiss
                      </button>
                      
                      {isJobReport ? (
                        <button 
                          onClick={() => setModal({ isOpen: true, type: 'DELETE_JOB', reportId: report.id, targetId: report.job_id, employerId: jobEmployerId })}
                          className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold transition-colors shadow-sm active:scale-95"
                        >
                          Delete Post
                        </button>
                      ) : (
                        <button 
                          onClick={() => setModal({ isOpen: true, type: 'BLOCK_USER', reportId: report.id, targetId: report.reported_user_id })}
                          className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold transition-colors shadow-sm active:scale-95"
                        >
                          Block User
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}

              {reports.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">
                    No reports found. Your platform is clean!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FOR REASON */}
      {modal?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {modal.type === 'DELETE_JOB' ? 'Remove Job Post' : 'Block User Account'}
            </h3>
            <p className="text-slate-500 text-sm mb-4">
              Please provide a reason. This will be sent as a notification to the user to explain why this action was taken.
            </p>

            <textarea 
              rows={3}
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              placeholder="e.g. This post violates our spam policy..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl mb-4 text-sm focus:ring-2 focus:ring-rose-500 outline-none resize-none"
            />

            <div className="flex gap-3">
              <button 
                onClick={() => { setModal(null); setReasonText(''); }} 
                className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 active:scale-95 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleAction} 
                disabled={!reasonText || isProcessing}
                className="flex-1 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-bold hover:bg-rose-600 disabled:opacity-50 active:scale-95 transition-all shadow-sm"
              >
                {isProcessing ? 'Processing...' : 'Confirm & Notify'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}