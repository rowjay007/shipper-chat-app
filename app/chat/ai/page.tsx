import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AIChatWindow } from '@/components/chat/aiChatWindow'

export default async function AIChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return <AIChatWindow />
}

