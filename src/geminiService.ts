import { supabase } from './supabaseClient'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY

export async function generateStoicReflection(
  userId: string,
  prompt: string,
  isPremium: boolean
) {
  // 🔒 Regra do plano FREE
  if (!isPremium) {
    const { count, error } = await supabase
      .from('reflections')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_ai_generated', true)

    if (error) {
      console.error(error)
      throw new Error('Erro ao verificar limite gratuito')
    }

    if ((count ?? 0) >= 1) {
      throw new Error(
        'Você já usou sua reflexão gratuita. Faça upgrade para continuar.'
      )
    }
  }

  // 🤖 Chamada à IA
  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' +
      GEMINI_API_KEY,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    }
  )

  if (!response.ok) {
    throw new Error('Erro ao gerar reflexão com IA')
  }

  const data = await response.json()
  const text =
    data.candidates?.[0]?.content?.parts?.[0]?.text ??
    'Não foi possível gerar a reflexão.'

  // 💾 Salva no banco como IA
  const { error: insertError } = await supabase.from('reflections').insert({
    user_id: userId,
    content: text,
    is_ai_generated: true,
  })

  if (insertError) {
    console.error(insertError)
    throw new Error('Erro ao salvar reflexão')
  }

  return text
}
