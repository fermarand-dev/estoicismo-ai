import { supabase } from '../supabaseClient'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(
  import.meta.env.VITE_GEMINI_API_KEY
)

export async function gerarESalvarReflexaoIA(textoUsuario: string) {
  // 1️⃣ Usuário logado
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Usuário não autenticado')
  }

  // 2️⃣ Ver plano
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_premium')
    .eq('id', user.id)
    .single()

  if (!profile) {
    throw new Error('Perfil não encontrado')
  }

  // 3️⃣ Limite FREE → 1 reflexão IA
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

  // 4️⃣ Chamar Gemini
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const prompt = `
Você é um mentor estoico inspirado em Marco Aurélio.
Gere uma reflexão curta, prática e profunda em português
a partir do texto abaixo:

"${textoUsuario}"
  `

  const result = await model.generateContent(prompt)
  const text = result.response.text()

  // 5️⃣ Salvar no banco
  const { error } = await supabase.from('reflections').insert({
    user_id: user.id,
    content: text,
    is_ai_generated: true,
  })

  if (error) {
    throw new Error('Erro ao salvar reflexão')
  }

  return text
}
