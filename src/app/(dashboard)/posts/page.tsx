// src/app/(dashboard)/posts/page.tsx
import { createClient } from '../../../utils/supabase';
import { redirect } from 'next/navigation';
import PostsClient from './PostsClient';

export default async function ManagePostsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // --- PAGINATION LOGIC ---
  const resolvedSearchParams = await searchParams;
  const currentPage = Number(resolvedSearchParams?.page) || 1;
  const itemsPerPage = 10;
  
  const from = (currentPage - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  // Fetch jobs WITH count and join the employer profile
  const { data: jobs, count } = await supabase
    .from('jobs')
    .select('*, profiles(contact_username, handle, avatar_url)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  const totalPages = count ? Math.ceil(count / itemsPerPage) : 1;

  return (
    <PostsClient 
      jobs={jobs || []} 
      totalCount={count || 0}
      currentPage={currentPage}
      totalPages={totalPages}
    />
  );
}