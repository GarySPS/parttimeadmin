// src/app/(dashboard)/reports/page.tsx
import { createClient } from '../../../utils/supabase';
import { redirect } from 'next/navigation';
import ReportsClient from './ReportsClient';

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch reports + job details (Now including employer_id so we know who to notify)
  const { data: reports } = await supabase
    .from('reports')
    .select(`
      id,
      reason,
      created_at,
      job_id,
      reported_user_id,
      jobs ( id, title, employer_id )
    `)
    .order('created_at', { ascending: false });

  // Fetch reported usernames
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

  return <ReportsClient reports={reports || []} reportedUsersMap={reportedUsersMap} />;
}