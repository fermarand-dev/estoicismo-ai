import { supabase } from '../supabaseClient'

export interface Reflection {
  id: number
  content: string
  created_at: string
}

export async function getMyReflections(): Promise<Reflection[]> {
  const { data, error } = await supabase
    .from('reflections')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data || []
}

export async function createReflection(content: string) {
  const user = (await supabase.auth.getUser()).data.user

  if (!user) {
    throw new Error('Usuário não autenticado')
  }

  const { error } = await supabase.from('reflections').insert({
    content,
    user_id: user.id,
  })

  if (error) {
    throw error
  }
}
