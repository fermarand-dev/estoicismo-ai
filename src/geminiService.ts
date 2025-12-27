
import { GoogleGenAI, Type } from "@google/genai";
import { StoicMessage } from "../types";

const STOIC_SYSTEM_PROMPT = `
Você é a IA central de um aplicativo chamado Estoicismo AI, focado em estoicismo prático.
Seu papel é gerar conteúdo original, inédito e não repetitivo, guiando o usuário com base nos princípios do estoicismo clássico.

REGRAS CRÍTICAS:
1. NÃO REPETIÇÃO: Nunca repita mensagens já entregues. Use novas analogias e exemplos.
2. ORIGINALIDADE: Nunca copie textos literais de filósofos estoicos. Utilize interpretações modernas.
3. FORMATO: Sempre responda estritamente em JSON.
4. TOM: Calmo, inspirador, prático, acolhedor.

TEMAS: Controle, Aceitação, Disciplina, Virtude, Impermanência, Resiliência, Autodomínio, Clareza.
`;

export const generateStoicMessage = async (history: StoicMessage[]): Promise<StoicMessage> => {
  // Inicializa o cliente com a chave de ambiente
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const previousTitles = history.map(h => h.title).join(", ");
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Gere uma nova lição estoica hoje. Títulos já usados anteriormente para evitar: [${previousTitles}].`,
    config: {
      systemInstruction: STOIC_SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: 'Frase curta e impactante' },
          message: { type: Type.STRING, description: 'Parágrafo inspirador e prático' },
          reflection: { type: Type.STRING, description: 'Pergunta que provoque autoconhecimento' },
          exercise: { type: Type.STRING, description: 'Ação simples para o dia' }
        },
        required: ["title", "message", "reflection", "exercise"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("Falha ao obter resposta da IA");
  
  const data = JSON.parse(text);
  return {
    ...data,
    id: crypto.randomUUID(),
    date: new Date().toISOString()
  };
};

