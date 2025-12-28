import { supabase } from '../supabaseClient'
import { gerarReflexaoEstoica } from '../geminiService'

export type Reflection = {
  id: number
  content: string
  created_at: string
}

/**
 * Lista reflexões do usuário logado
 */
export async function listarReflexoes(): Promise<Reflection[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Usuário não autenticado')
  }

  const { data, error } = await supabase
    .from('reflections')
    .select('id, content, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('Erro ao buscar reflexões')
  }

  return data || []
}

/**
 * Salva reflexão respeitando limite FREE vs PREMIUM
 */
export async function salvarReflexao(textoUsuario: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Usuário não autenticado')
  }

  // 🔹 Verificar se o usuário é premium
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_premium')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    throw new Error('Erro ao verificar plano do usuário')
  }

  // 🔒 REGRA FREE: só pode ter 1 reflexão
  if (!profile.is_premium) {
    const { data: existingReflection, error } = await supabase
      .from('reflections')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)

    if (error) {
      throw new Error('Erro ao verificar limite de reflexões')
    }

    if (existingReflection && existingReflection.length > 0) {
      throw new Error(
        'Usuários do plano gratuito podem salvar apenas uma reflexão.'
      )
    }
  }

  // 🧠 Gerar reflexão com IA
  const reflexaoIA = await gerarReflexaoEstoica(textoUsuario)

  // 💾 Salvar no banco
  const { error: insertError } = await supabase.from('reflections').insert({
    user_id: user.id,
    content: reflexaoIA,
  })

  if (insertError) {
    throw new Error('Erro ao salvar reflexão')
  }
}
