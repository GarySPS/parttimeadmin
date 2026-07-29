//src/components/DocumentModal.tsx

'use client';
import { useState } from 'react';

export default function DocumentModal({ url, label, className }: { url: string, label: string, className?: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)} type="button" className={className}>
        {label}
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4" 
          onClick={() => setIsOpen(false)}
        >
          <div className="relative max-w-5xl max-h-full flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-end mb-2">
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-slate-300 font-bold bg-black/50 px-3 py-1 rounded-full cursor-pointer"
              >
                Close ✕
              </button>
            </div>
            <img 
              src={url} 
              alt={label} 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" 
            />
          </div>
        </div>
      )}
    </>
  );
}