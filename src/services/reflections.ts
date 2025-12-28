import { supabase } from '../supabaseClient'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY

export type Reflection = {
  id: number
  content: string
  created_at: string
}

export async function listarReflexoes(): Promise<Reflection[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuário não autenticado')

  const { data } = await supabase
    .from('reflections')
    .select('id, content, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return data || []
}

export async function gerarESalvarReflexaoIA(textoUsuario: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuário não autenticado')

  // 🔹 verificar plano
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_premium')
    .eq('id', user.id)
    .single()

  if (!profile) throw new Error('Perfil não encontrado')

  // 🔒 limite FREE: 1 IA
  if (!profile.is_premium) {
    const { data: existing } = await supabase
      .from('reflections')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_ai_generated', true)

    if (existing && existing.length >= 1) {
      throw new Error(
        'Você já usou sua reflexão gratuita. Assine o Premium.'
      )
    }
  }

  // 🤖 chamada direta à API Gemini (SEM SDK)
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Gere uma reflexão estoica curta e prática em português baseada no texto: "${textoUsuario}"`,
              },
            ],
          },
        ],
      }),
    }
  )

  if (!response.ok) {
    throw new Error('Falha na API do Gemini')
  }

  const json = await response.json()
  const text =
    json?.candidates?.[0]?.content?.parts?.[0]?.text

  if (!text) {
    throw new Error('Resposta inválida da IA')
  }

  // 💾 salvar
  const { error } = await supabase.from('reflections').insert({
    user_id: user.id,
    content: text,
    is_ai_generated: true,
  })

  if (error) throw new Error('Erro ao salvar reflexão')

  return text
}
