import { supabase } from '../supabaseClient'
import { gerarReflexaoEstoica } from '../geminiService'

export type Reflection = {
  id: number
  content: string
  created_at: string
}

/**
 * Salva uma reflexão do usuário logado
 */
export async function salvarReflexao(textoUsuario: string): Promise<void> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('Usuário não autenticado')
  }

  // Gera a reflexão com IA (Gemini)
  const reflexaoIA = await gerarReflexaoEstoica(textoUsuario)

  const { error } = await supabase.from('reflections').insert({
    user_id: user.id,
    content: reflexaoIA,
  })

  if (error) {
    throw new Error('Erro ao salvar reflexão')
  }
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
