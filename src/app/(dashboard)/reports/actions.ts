// src/app/(dashboard)/reports/actions.ts

'use server'

import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

// 1. Create a helper for the Admin Client that bypasses RLS
const getAdminClient = () => {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function dismissReport(reportId: string) {
  const supabaseAdmin = getAdminClient()
  await supabaseAdmin.from('reports').delete().eq('id', reportId)
  revalidatePath('/reports')
}

export async function deleteJobAndNotify(reportId: string, jobId: string, employerId: string | null, reason: string) {
  const supabaseAdmin = getAdminClient()
  
  // 1. Delete Job (Bypassing RLS)
  await supabaseAdmin.from('jobs').delete().eq('id', jobId)
  
  // 2. Notify User (Bypassing RLS)
  if (employerId && reason) {
    await supabaseAdmin.from('notifications').insert({
      user_id: employerId,
      title: 'Job Post Removed',
      message: `Your job post was removed by an administrator. Reason: ${reason}`
    })
  }
  
  // 3. Dismiss Report
  await supabaseAdmin.from('reports').delete().eq('id', reportId)
  
  revalidatePath('/reports')
  revalidatePath('/posts')
}

export async function blockUserAndNotify(reportId: string, userId: string, reason: string) {
  const supabaseAdmin = getAdminClient()
  
  // 1. Block Profile (Bypassing RLS)
  await supabaseAdmin.from('profiles').update({ is_blocked: true }).eq('id', userId)
  
  // 2. Notify User (Bypassing RLS)
  if (reason) {
    await supabaseAdmin.from('notifications').insert({
      user_id: userId,
      title: 'Account Restricted',
      message: `Your account has been blocked by an administrator. Reason: ${reason}`
    })
  }
  
  // 3. Dismiss Report
  await supabaseAdmin.from('reports').delete().eq('id', reportId)
  
  revalidatePath('/reports')
}