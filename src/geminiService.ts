import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = import.meta.env.VITE_GEMINI_API_KEY

if (!apiKey) {
  throw new Error('VITE_GEMINI_API_KEY não configurada no ambiente')
}

const genAI = new GoogleGenerativeAI(apiKey)

export async function gerarReflexaoEstoica(textoUsuario: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
    })

    const prompt = `
Você é um mentor estoico inspirado em Marco Aurélio, Sêneca e Epicteto.

Analise o texto abaixo e gere uma reflexão curta, profunda e prática,
em português, ajudando o usuário a enxergar a situação com clareza,
autodomínio e virtude.

Texto do usuário:
"${textoUsuario}"
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return text.trim()
  } catch (error) {
    console.error('Erro ao gerar reflexão:', error)
    throw new Error('Erro ao gerar reflexão com a IA')
  }
}
