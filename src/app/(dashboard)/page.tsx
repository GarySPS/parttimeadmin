// src/app/page.tsx
export default function Home() {
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-slate-900 mb-6">Platform Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat Cards */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <p className="text-sm font-bold tracking-wide uppercase text-slate-500">Active Posts</p>
          <p className="text-4xl font-black text-slate-900 mt-2">--</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <p className="text-sm font-bold tracking-wide uppercase text-slate-500">Pending Reports</p>
          <p className="text-4xl font-black text-rose-500 mt-2">--</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <p className="text-sm font-bold tracking-wide uppercase text-slate-500">Total Users</p>
          <p className="text-4xl font-black text-slate-900 mt-2">--</p>
        </div>
      </div>
    </div>
  );
}