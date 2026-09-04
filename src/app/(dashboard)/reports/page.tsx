// src/app/(dashboard)/reports/page.tsx
import { createClient } from '../../../utils/supabase';
import { redirect } from 'next/navigation';
import ReportsClient from './ReportsClient';

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // --- စာမျက်နှာ အပိုင်းခွဲခြားခြင်း (PAGINATION LOGIC) ---
  const resolvedSearchParams = await searchParams;
  const currentPage = Number(resolvedSearchParams?.page) || 1;
  const itemsPerPage = 10;
  
  const from = (currentPage - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  // တိုင်ကြားစာများကို အရေအတွက်နှင့် ကန့်သတ်ချက်များဖြင့် ရယူရန်
  const { data: reports, count } = await supabase
    .from('reports')
    .select(`
      id,
      reason,
      created_at,
      job_id,
      reported_user_id,
      jobs ( id, title, employer_id )
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  const totalPages = count ? Math.ceil(count / itemsPerPage) : 1;

  // တိုင်ကြားခံရသည့် အသုံးပြုသူအမည်များကို လုံခြုံစွာ ရယူရန်
  const userIds = reports?.map((r) => r.reported_user_id).filter(Boolean) || [];
  const reportedUsersMap: Record<string, string> = {};
  
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, contact_username')
      .in('id', userIds);
      
    profiles?.forEach((p) => {
      // Anonymous Employer သို့မဟုတ် အမည်မသိ အလုပ်ရှင်
      reportedUsersMap[p.id] = p.contact_username || 'အမည်မသိ အလုပ်ရှင်'; 
    });
  }

  return (
    <ReportsClient 
      reports={reports || []} 
      reportedUsersMap={reportedUsersMap} 
      totalCount={count || 0}
      currentPage={currentPage}
      totalPages={totalPages}
    />
  );
}