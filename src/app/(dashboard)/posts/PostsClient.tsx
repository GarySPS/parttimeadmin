// src/app/(dashboard)/posts/PostsClient.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { deletePostAndNotify } from './actions';

type ModalState = {
  isOpen: boolean;
  jobId: string;
  employerId: string;
} | null;

export default function PostsClient({ 
  jobs, 
  totalCount,
  currentPage,
  totalPages
}: { 
  jobs: any[], 
  totalCount: number,
  currentPage: number,
  totalPages: number
}) {
  const [modal, setModal] = useState<ModalState>(null);
  const [reasonText, setReasonText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDelete = async () => {
    if (!modal || !reasonText) return;
    setIsProcessing(true);

    await deletePostAndNotify(modal.jobId, modal.employerId, reasonText);

    setModal(null);
    setReasonText('');
    setIsProcessing(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col min-h-[80vh]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 shrink-0">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">Manage Posts</h1>
        <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs sm:text-sm font-bold border border-slate-200 shadow-sm">
          {totalCount} Total
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col flex-1">
        
        {/* =========================================
            MOBILE VIEW: Stacked Cards
            ========================================= */}
        <div className="block md:hidden divide-y divide-slate-100">
          {jobs.map((job) => {
            let employerName = job.profiles?.contact_username || job.profiles?.handle || 'Unknown';
            return (
              <div key={job.id} className="p-4 flex flex-col gap-3 hover:bg-slate-50/50 transition-colors">
                
                {/* Employer Info Row */}
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                    {job.profiles?.avatar_url ? (
                      <img src={job.profiles.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-3 h-3 text-slate-400 m-auto mt-1.5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    )}
                  </div>
                  <a href={`https://parttimemm.com/user/${job.employer_id}`} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-slate-600 hover:text-blue-600">
                    {employerName}
                  </a>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <a 
                    href={`https://parttimemm.com/jobs/${job.id}`} target="_blank" rel="noopener noreferrer"
                    className="text-sm font-bold text-slate-900 hover:text-blue-600 flex items-start gap-1.5 leading-snug line-clamp-2"
                  >
                    {job.title}
                  </a>
                  <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    job.status === 'open' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                    {job.status || 'open'}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 text-xs text-slate-600 font-medium mt-1">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {job.township}, {job.city}
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {job.price ? `${new Intl.NumberFormat('en-MM').format(job.price)} MMK` : 'Negotiable'}
                  </div>
                </div>

                <div className="mt-2 pt-3 border-t border-slate-100">
                  <button 
                    onClick={() => setModal({ isOpen: true, jobId: job.id, employerId: job.employer_id })}
                    className="w-full py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-bold transition-colors border border-rose-200"
                  >
                    Delete Post
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
                <th className="px-6 py-4">Job Title</th>
                <th className="px-6 py-4">Posted By</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobs.map((job) => {
                let employerName = job.profiles?.contact_username || job.profiles?.handle || 'Unknown';
                return (
                  <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold max-w-[250px] truncate">
                      <a 
                        href={`https://parttimemm.com/jobs/${job.id}`} target="_blank" rel="noopener noreferrer"
                        className="text-slate-900 hover:text-blue-600 hover:underline flex items-center gap-1.5 transition-colors"
                      >
                        {job.title}
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                          {job.profiles?.avatar_url ? (
                            <img src={job.profiles.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                          ) : (
                            <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                          )}
                        </div>
                        <a href={`https://parttimemm.com/user/${job.employer_id}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-slate-700 hover:text-blue-600 hover:underline truncate max-w-[120px]">
                          {employerName}
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">{job.township}, {job.city}</td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {job.price ? `${new Intl.NumberFormat('en-MM').format(job.price)} MMK` : 'Negotiable'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        job.status === 'open' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        {job.status || 'open'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setModal({ isOpen: true, jobId: job.id, employerId: job.employer_id })}
                        className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-bold transition-colors border border-rose-200 shadow-sm active:scale-95"
                      >
                        Delete
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
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-t border-slate-200 bg-slate-50 mt-auto shrink-0">
          <Link
            href={currentPage > 1 ? `/posts?page=${currentPage - 1}` : '#'}
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
            href={currentPage < totalPages ? `/posts?page=${currentPage + 1}` : '#'}
            className={`px-4 py-2 text-sm font-bold rounded-xl transition-all shadow-sm ${
              currentPage < totalPages 
                ? 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 active:scale-95' 
                : 'bg-slate-100 text-slate-400 border border-transparent opacity-50 cursor-not-allowed pointer-events-none'
            }`}
          >
            Next
          </Link>
        </div>

        {jobs.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-sm font-medium border-t border-slate-100">
            No posts found in the database.
          </div>
        )}
      </div>

      {/* MODAL FOR REASON */}
      {modal?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Remove Job Post</h3>
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
                onClick={handleDelete} 
                disabled={!reasonText || isProcessing}
                className="flex-1 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-bold hover:bg-rose-600 disabled:opacity-50 active:scale-95 transition-all shadow-sm"
              >
                {isProcessing ? 'Processing...' : 'Confirm & Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}