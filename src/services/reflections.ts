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
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
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
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('Usuário não autenticado')
  }

  // 1️⃣ Verificar se o usuário é premium
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_premium')
    .eq('id', user.id)
    .single()

  if (profileError) {
    throw new Error('Erro ao verificar plano do usuário')
  }

  // 2️⃣ Se FREE, verificar quantas reflexões já existem
  if (!profile.is_premium) {
    const { count, error: countError } = await supabase
      .from('reflections')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (countError) {
      throw new Error('Erro ao verificar limite de reflexões')
    }

    if ((count ?? 0) >= 1) {
      throw new Error(
        'Usuários do plano gratuito podem salvar apenas uma reflexão.'
      )
    }
  }

  // 3️⃣ Gerar reflexão com IA
  const reflexaoIA = await gerarReflexaoEstoica(textoUsuario)

  // 4️⃣ Salvar no Supabase
  const { error } = await supabase.from('reflections').insert({
    user_id: user.id,
    content: reflexaoIA,
  })

  if (error) {
    throw new Error('Erro ao salvar reflexão')
  }
}
