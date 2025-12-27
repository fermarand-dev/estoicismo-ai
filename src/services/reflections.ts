import { supabase } from '../supabaseClient'

export type Reflection = {
  id: number
  content: string
  created_at: string
}

export async function getMyReflections() {
  const { data, error } = await supabase
    .from('reflections')
    .select('id, content, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data as Reflection[]
}
