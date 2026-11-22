/**
 * MEU LIVRO EM INSTANTE — CLIENTE DO REVISOR GRAMATICAL BRASILEIRO (LANGUAGETOOL)
 * Suporte a particionamento inteligente de texto para evitar erros 429 e lentidão.
 */

export interface GrammarIssue {
  id: string;
  message: string;
  shortMessage?: string;
  offset: number;
  length: number;
  badText: string;
  replacements: string[];
  ruleId: string;
  category: string;
}

export class LanguageToolClient {
  private static readonly ENDPOINT = 'https://api.languagetoolplus.com/v2/check';
  private static readonly CHUNK_SIZE = 4500; // Limite seguro para a API gratuita

  /**
   * Revisa um texto em português brasileiro (pt-BR)
   */
  static async checkText(text: string): Promise<GrammarIssue[]> {
    if (!text || text.trim().length === 0) return [];

    // Se o texto for curto, executa em chamada única
    if (text.length <= this.CHUNK_SIZE) {
      return this.sendCheckRequest(text, 0);
    }

    // Se o texto for longo, divide por quebras de parágrafo naturais
    const paragraphs = text.split(/\n+/);
    const issues: GrammarIssue[] = [];
    let currentChunk = '';
    let currentOffset = 0;

    for (const para of paragraphs) {
      if ((currentChunk.length + para.length) > this.CHUNK_SIZE && currentChunk.length > 0) {
        const chunkIssues = await this.sendCheckRequest(currentChunk, currentOffset);
        issues.push(...chunkIssues);

        currentOffset += currentChunk.length + 1; // +1 para compensar o \n
        currentChunk = para;
      } else {
        currentChunk += (currentChunk.length > 0 ? '\n' : '') + para;
      }
    }

    if (currentChunk.length > 0) {
      const chunkIssues = await this.sendCheckRequest(currentChunk, currentOffset);
      issues.push(...chunkIssues);
    }

    return issues;
  }

  /**
   * Dispara a requisição HTTP REST para a API do LanguageTool
   */
  private static async sendCheckRequest(chunk: string, offsetBase: number): Promise<GrammarIssue[]> {
    try {
      const params = new URLSearchParams();
      params.append('text', chunk);
      params.append('language', 'pt-BR');
      params.append('enabledOnly', 'false');

      const response = await fetch(this.ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: params.toString()
      });

      if (!response.ok) {
        console.warn(`[LanguageTool] Erro de resposta ${response.status}`);
        return [];
      }

      const data = await response.json();
      const matches = data.matches || [];

      return matches.map((m: any, index: number): GrammarIssue => {
        const offset = offsetBase + m.offset;
        const length = m.length;
        const badText = chunk.substring(m.offset, m.offset + length);
        const replacements = (m.replacements || []).map((r: any) => r.value).slice(0, 5);

        return {
          id: `issue_${offset}_${index}`,
          message: m.message,
          shortMessage: m.shortMessage || m.rule?.description,
          offset,
          length,
          badText,
          replacements,
          ruleId: m.rule?.id || 'GRAMMAR_RULE',
          category: m.rule?.category?.name || 'Gramática'
        };
      });
    } catch (err) {
      console.warn('[LanguageTool] Falha na comunicação com o revisor:', err);
      return [];
    }
  }

  /**
   * Aplica uma correção sugerida no texto original
   */
  static applyCorrection(originalText: string, issue: GrammarIssue, replacement: string): string {
    const before = originalText.substring(0, issue.offset);
    const after = originalText.substring(issue.offset + issue.length);
    return before + replacement + after;
  }
}
