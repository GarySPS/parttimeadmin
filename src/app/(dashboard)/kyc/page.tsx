// src/app/(dashboard)/kyc/page.tsx
import { createClient } from '../../../utils/supabase';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import DocumentModal from '@/components/DocumentModal';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';

export default async function KycPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // --- SERVER ACTIONS ---
  async function approveKyc(formData: FormData) {
    'use server';
    
    // 1. Create an Admin Client that bypasses RLS
    const supabaseAdmin = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const id = formData.get('id') as string;
    const userId = formData.get('userId') as string;
    const tier = formData.get('tier') as string;

    const newKycStatus = tier === 'business' ? 'verified_business' : 'verified_personal';
    
    // 2. Use supabaseAdmin to perform the updates
    await supabaseAdmin.from('kyc_applications').update({ status: 'approved' }).eq('id', id);
    await supabaseAdmin.from('profiles').update({ 
      kyc_status: newKycStatus, 
      is_verified: true 
    }).eq('id', userId);
    
    revalidatePath('/kyc');
  }

  async function rejectKyc(formData: FormData) {
    'use server';
    
    // 1. Create an Admin Client that bypasses RLS
    const supabaseAdmin = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const id = formData.get('id') as string;
    const userId = formData.get('userId') as string;

    // 2. Use supabaseAdmin to perform the updates
    await supabaseAdmin.from('kyc_applications').update({ status: 'rejected' }).eq('id', id);
    await supabaseAdmin.from('profiles').update({ kyc_status: 'none' }).eq('id', userId);
    
    revalidatePath('/kyc');
  }

  // --- PAGINATION & FETCHING ---
  const resolvedSearchParams = await searchParams;
  const currentPage = Number(resolvedSearchParams?.page) || 1;
  const itemsPerPage = 10;
  const from = (currentPage - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  // Fetch pending applications and join with profiles
  const { data: applications, count } = await supabase
    .from('kyc_applications')
    // ADD 'handle' inside the profiles() select:
    .select('*, profiles(contact_username, handle, avatar_url)', { count: 'exact' })
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .range(from, to);

  const totalPages = count ? Math.ceil(count / itemsPerPage) : 1;

  // Helper to generate temporary view links for private bucket images (Only needed for Personal Tier now)
  const getImageUrl = async (path: string | null) => {
    if (!path) return null;
    const { data } = await supabase.storage.from('kyc_documents').createSignedUrl(path, 3600);
    return data?.signedUrl;
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">KYC စစ်ဆေးရန် စာရင်း</h1>
        <span className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs sm:text-sm font-bold border border-blue-200 shadow-sm">
          စစ်ဆေးရန်ကျန်ရှိ {count || 0} ခု
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        
        {/* ================= MOBILE CARDS ================= */}
        <div className="block md:hidden divide-y divide-slate-100">
          {applications?.map(async (app) => {
            const idCardUrl = await getImageUrl(app.id_card_url);
            const selfieUrl = await getImageUrl(app.selfie_url);

            return (
              <div key={app.id} className="p-4 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                    {app.profiles?.avatar_url ? <img src={app.profiles.avatar_url} alt="avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-200" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{app.profiles?.contact_username || 'အမည်မသိ'}</p>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${app.tier === 'business' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                      {app.tier}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-xs font-bold mt-2">
                  {app.tier === 'personal' ? (
                    <>
                      {idCardUrl && <DocumentModal url={idCardUrl} label="မှတ်ပုံတင် ကြည့်ရန်" className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-xs font-bold" />}
                      {selfieUrl && <DocumentModal url={selfieUrl} label="ဆဲလ်ဖီ ကြည့်ရန်" className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-xs font-bold" />}
                    </>
                  ) : (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg border border-gray-200">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.21-1.12-.33-1.08-.7.02-.19.27-.39.75-.59 2.95-1.28 4.91-2.13 5.89-2.53 2.79-1.16 3.37-1.36 3.75-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .24z"/></svg>
                      Telegram ဖြင့် စစ်ဆေးရန် စာရင်း
                    </span>
                  )}
                </div>

                <div className="mt-2 pt-3 border-t border-slate-100 flex gap-2">
                  <form action={rejectKyc} className="flex-1">
                    <input type="hidden" name="id" value={app.id} />
                    <input type="hidden" name="userId" value={app.user_id} />
                    <button type="submit" className="w-full py-2.5 bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 rounded-xl text-xs font-bold shadow-sm">ပယ်ချမည်</button>
                  </form>
                  <form action={approveKyc} className="flex-1">
                    <input type="hidden" name="id" value={app.id} />
                    <input type="hidden" name="userId" value={app.user_id} />
                    <input type="hidden" name="tier" value={app.tier} />
                    <button type="submit" className="w-full py-2.5 bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 rounded-xl text-xs font-bold shadow-sm">ခွင့်ပြုမည်</button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>

        {/* ================= DESKTOP TABLE ================= */}
        <div className="hidden md:block overflow-x-auto flex-1">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px] tracking-wider">
              <tr>
                <th className="px-6 py-4">အသုံးပြုသူ</th>
                <th className="px-6 py-4">အဆင့်</th>
                <th className="px-6 py-4">စာရွက်စာတမ်း / အခြေအနေ</th>
                <th className="px-6 py-4 text-right">လုပ်ဆောင်ချက်</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications?.map(async (app) => {
                const idCardUrl = await getImageUrl(app.id_card_url);
                const selfieUrl = await getImageUrl(app.selfie_url);

                return (
                  <tr key={app.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden shrink-0">
                          {app.profiles?.avatar_url && <img src={app.profiles.avatar_url} alt="avatar" className="w-full h-full object-cover" />}
                        </div>
                        <span className="font-semibold text-slate-900">{app.profiles?.contact_username || 'အမည်မသိ'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${app.tier === 'business' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                        {app.tier}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      {app.tier === 'personal' ? (
                        <>
                          {idCardUrl && <DocumentModal url={idCardUrl} label="မှတ်ပုံတင်" className="text-xs font-bold text-slate-600 hover:text-blue-600 underline" />}
                          {selfieUrl && <DocumentModal url={selfieUrl} label="ဆဲလ်ဖီ" className="text-xs font-bold text-slate-600 hover:text-blue-600 underline" />}
                        </>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                           <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.21-1.12-.33-1.08-.7.02-.19.27-.39.75-.59 2.95-1.28 4.91-2.13 5.89-2.53 2.79-1.16 3.37-1.36 3.75-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .24z"/></svg>
                           Video Call အတွက် Telegram ကိုစစ်ဆေးပါ
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <form action={rejectKyc}>
                          <input type="hidden" name="id" value={app.id} />
                          <input type="hidden" name="userId" value={app.user_id} />
                          <button type="submit" className="px-4 py-2 bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 rounded-xl text-xs font-bold transition-colors">ပယ်ချမည်</button>
                        </form>
                        <form action={approveKyc}>
                          <input type="hidden" name="id" value={app.id} />
                          <input type="hidden" name="userId" value={app.user_id} />
                          <input type="hidden" name="tier" value={app.tier} />
                          <button type="submit" className="px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 rounded-xl text-xs font-bold transition-colors">ခွင့်ပြုမည်</button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ================= PAGINATION ================= */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-t border-slate-200 bg-slate-50 mt-auto">
          <Link href={currentPage > 1 ? `/kyc?page=${currentPage - 1}` : '#'} className={`px-4 py-2 text-sm font-bold rounded-xl transition-all shadow-sm ${currentPage > 1 ? 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 active:scale-95' : 'bg-slate-100 text-slate-400 border border-transparent opacity-50 cursor-not-allowed pointer-events-none'}`}>
            ယခင်
          </Link>
          <span className="text-sm font-semibold text-slate-600">စာမျက်နှာ {currentPage} / {totalPages}</span>
          <Link href={currentPage < totalPages ? `/kyc?page=${currentPage + 1}` : '#'} className={`px-4 py-2 text-sm font-bold rounded-xl transition-all shadow-sm ${currentPage < totalPages ? 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 active:scale-95' : 'bg-slate-100 text-slate-400 border border-transparent opacity-50 cursor-not-allowed pointer-events-none'}`}>
            နောက်သို့
          </Link>
        </div>

        {(!applications || applications.length === 0) && (
          <div className="p-8 text-center text-slate-500 text-sm font-medium border-t border-slate-100">
            စစ်ဆေးရန်ကျန်သော KYC လျှောက်လွှာများ မရှိပါ။
          </div>
        )}
      </div>
    </div>
  );
}