// src/app/(dashboard)/posts/actions.ts
'use server'

import { createClient } from '../../../utils/supabase'
import { revalidatePath } from 'next/cache'

export async function deletePostAndNotify(jobId: string, employerId: string | null, reason: string) {
  const supabase = await createClient()
  
  // 1. Delete Job from database
  await supabase.from('jobs').delete().eq('id', jobId)
  
  // 2. Notify the user exactly why it was deleted
  if (employerId && reason) {
    await supabase.from('notifications').insert({
      user_id: employerId,
      title: 'Job Post Removed',
      message: `Your job post was removed by an administrator. Reason: ${reason}`
    })
  }
  
  // 3. Refresh the page
  revalidatePath('/posts')
}