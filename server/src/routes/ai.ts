/**
 * MEU LIVRO EM INSTANTE — ORQUESTRADOR E PROXY DE IA SEGURO
 * Blindagem de credenciais: as requisições à Google Gemini são feitas exclusivamente aqui.
 */

export interface AIRequestBody {
  studio: 'literary' | 'cordel' | 'kids_ya' | 'journalism' | 'graphic';
  task: 'continue' | 'expand' | 'rewrite' | 'stanza_gen' | 'character_prompt' | 'synopsis';
  context: string;
  instruction?: string;
}

export class AIService {
  private static getSystemPrompt(studio: string, task: string): string {
    switch (studio) {
      case 'cordel':
        return `Você é um mestre cordelista tradicional do Nordeste brasileiro.
REGRAS INVIOLÁVEIS:
1. Escreva estritamente em estrofes de SEXTILHA (6 versos) com 7 sílabas poéticas (redondilha maior) por verso.
2. As rimas OBRIGATÓRIAS ocorrem nos versos pares: 2, 4 e 6 (esquema ABCBDB). Versos 1, 3 e 5 são soltos.
3. Use vocabulário rico, imagético e autêntico da tradição popular nordestina.`;

      case 'kids_ya':
        return `Você é um autor premiado de literatura infantil e infantojuvenil brasileira.
REGRAS:
1. Adapte a linguagem à faixa etária indicada.
2. Estimule a imaginação, a empatia e a aventura com ritmo cativante.
3. Mantenha estrita coerência com os traços dos personagens informados.`;

      case 'journalism':
        return `Você é um editor-chefe de jornalismo impresso de alta qualidade.
REGRAS:
1. Estruture a informação no padrão clássico de pirâmide invertida (O quê, Quem, Onde, Quando, Como, Por quê).
2. Produza manchetes de alto impacto e linhas-finas esclarecedoras.
3. Mantenha objetividade, clareza e elegância na colunagem.`;

      default:
        return `Você é um consultor literário e revisor estilístico para autores de língua portuguesa (Brasil).
REGRAS:
1. Preserve o tom e a voz original do autor.
2. Evite clichês e redundâncias desnecessárias.
3. Enriqueça a descrição sensorial mantendo o ritmo da narrativa.`;
    }
  }

  /**
   * Executa chamada segura à API da Google Gemini com streaming de resposta
   */
  static async handleStreamRequest(
    body: AIRequestBody,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY não configurada no servidor (.env).');
    }

    const systemPrompt = this.getSystemPrompt(body.studio, body.task);
    const userPrompt = `Contexto do manuscrito:\n"${body.context}"\n\nInstrução da tarefa:\n${body.instruction || 'Continue a história com naturalidade mantendo o estilo.'}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?alt=sse&key=${apiKey}`;

    const payload = {
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }]
        }
      ],
      generationConfig: {
        temperature: body.studio === 'cordel' ? 0.4 : 0.7,
        maxOutputTokens: 1024
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Erro na API Gemini (${response.status}): ${errText}`);
    }

    if (!response.body) {
      throw new Error('Corpo de resposta de streaming vazio.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.replace('data: ', '').trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const textPart = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
            if (textPart) {
              onChunk(textPart);
            }
          } catch (e) {
            // Linha parcial ou formatação SSE
          }
        }
      }
    }
  }
}

