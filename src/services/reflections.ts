import { supabase } from '../supabaseClient'

export interface Reflection {
  id: number
  content: string
  created_at: string
}

export async function salvarReflexao(prompt: string) {
  const session = await supabase.auth.getSession()

  const accessToken = session.data.session?.access_token

  if (!accessToken) {
    throw new Error('Usuário não autenticado')
  }

  const response = await fetch(
    'https://lqqvmaxlufmhzyiawalq.supabase.co/functions/v1/generate-reflection',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        prompt,
      }),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Erro ao gerar reflexão')
  }

  return data.content
}

export async function listarReflexoes() {
  const { data, error } = await supabase
    .from('reflections')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}
