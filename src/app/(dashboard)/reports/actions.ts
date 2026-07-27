// src/app/(dashboard)/reports/actions.ts
'use server'

import { createClient } from '../../../utils/supabase'
import { revalidatePath } from 'next/cache'

export async function dismissReport(reportId: string) {
  const supabase = await createClient()
  await supabase.from('reports').delete().eq('id', reportId)
  revalidatePath('/reports')
}

export async function deleteJobAndNotify(reportId: string, jobId: string, employerId: string | null, reason: string) {
  const supabase = await createClient()
  
  // 1. Delete Job
  await supabase.from('jobs').delete().eq('id', jobId)
  
  // 2. Notify User
  if (employerId && reason) {
    await supabase.from('notifications').insert({
      user_id: employerId,
      title: 'Job Post Removed',
      message: `Your job post was removed by an administrator. Reason: ${reason}`
    })
  }
  
  // 3. Dismiss Report
  await supabase.from('reports').delete().eq('id', reportId)
  
  revalidatePath('/reports')
  revalidatePath('/posts')
}

export async function blockUserAndNotify(reportId: string, userId: string, reason: string) {
  const supabase = await createClient()
  
  // 1. Block Profile
  await supabase.from('profiles').update({ is_blocked: true }).eq('id', userId)
  
  // 2. Notify User
  if (reason) {
    await supabase.from('notifications').insert({
      user_id: userId,
      title: 'Account Restricted',
      message: `Your account has been blocked by an administrator. Reason: ${reason}`
    })
  }
  
  // 3. Dismiss Report
  await supabase.from('reports').delete().eq('id', reportId)
  
  revalidatePath('/reports')
}