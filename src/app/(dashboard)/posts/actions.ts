// src/app/(dashboard)/posts/actions.ts
'use server'

import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const getAdminClient = () => {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function deletePostAndNotify(jobId: string, employerId: string | null, reason: string) {
  const supabaseAdmin = getAdminClient()
  
  // 1. Delete Job from database (Bypassing RLS)
  await supabaseAdmin.from('jobs').delete().eq('id', jobId)
  
  // 2. Notify the user exactly why it was deleted
  if (employerId && reason) {
    await supabaseAdmin.from('notifications').insert({
      user_id: employerId,
      title: 'Job Post Removed',
      message: `Your job post was removed by an administrator. Reason: ${reason}`
    })
  }
  
  // 3. Refresh the page
  revalidatePath('/posts')
}