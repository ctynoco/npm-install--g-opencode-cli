/**
 * MEU LIVRO EM INSTANTE — MOTOR DE MÉTRICA E RIMAS DO CORDEL
 * Especializado na tradição lírica e poética popular do Nordeste brasileiro.
 */

export interface RhymeAnalysis {
  word: string;
  ending: string; // Terminação sonora (ex: "ão", "or", "ado")
  rhymesWithNext: boolean;
}

export interface StanzaVerification {
  type: 'quadra' | 'sextilha' | 'septilha' | 'oitava' | 'decima';
  valid: boolean;
  verses: {
    text: string;
    syllablesCount: number;
    syllablesExpected: number;
    meterValid: boolean;
    lastWord: string;
    rhymeTag: string; // Ex: 'A', 'B', 'C', 'X' (solto)
    rhymeValid: boolean;
  }[];
  errors: string[];
}

export class CordelMetricsEngine {
  /**
   * Conta as sílabas poéticas populares de um verso (escansão até a última tônica).
   * Considera regras da fala popular nordestina e a elisão vocálica (fusão de vogais adjacentes).
   */
  static countPoeticSyllables(verse: string): number {
    const clean = verse.trim().toLowerCase();
    if (!clean) return 0;

    // Remove pontuações que não influenciam a fonética
    const sanitized = clean.replace(/[,;:.?!()—\-"']/g, ' ');
    const words = sanitized.split(/\s+/).filter(w => w.length > 0);
    if (words.length === 0) return 0;

    // 1. Simulação de sinalefa / elisão vocálica entre palavras adjacentes
    // (ex.: "de uma" soa como "d'uma", "que o" soa como "qu'o")
    let mergedText = words[0];
    for (let i = 1; i < words.length; i++) {
      const prevWord = words[i - 1];
      const currWord = words[i];

      const prevEndsWithVowel = /[aeiouãõâêôáéíóú]$/i.test(prevWord);
      const currStartsWithVowel = /^[aeiouh]/i.test(currWord);

      if (prevEndsWithVowel && currStartsWithVowel) {
        // Funde na contagem silábica oral
        mergedText += currWord;
      } else {
        mergedText += ' ' + currWord;
      }
    }

    // 2. Identificação de núcleos vocálicos
    // Agrupa ditongos e tritongos como emissões únicas típicas do ritmo do cordel
    const vowelClusters = mergedText.match(/[aeiouyáéíóúâêîôûãõà]+/gi);
    const totalCount = vowelClusters ? vowelClusters.length : 0;

    // 3. Regra da poesia popular: a contagem encerra na última sílaba tônica.
    // Como a esmagadora maioria das palavras em rimas de cordel é paroxítona (grave),
    // a última sílaba átona não é contada.
    const lastWord = words[words.length - 1];
    const isOxytone = /[áéíóúâêôãõ]$|[bdfgklmnprstvz]r?$|[aeiou][sz]$/i.test(lastWord);

    // Ajuste poético fino
    if (!isOxytone && totalCount > 1) {
      return Math.max(1, totalCount - 1);
    }

    return totalCount;
  }

  /**
   * Extrai a terminação fonética para análise de rima
   */
  static extractRhymeEnding(word: string): string {
    const clean = word.toLowerCase().replace(/[^a-záéíóúâêîôûãõç]/g, '');
    if (clean.length <= 2) return clean;

    // Extrai os últimos 2 a 3 caracteres fonéticos
    return clean.slice(-3);
  }

  /**
   * Verifica se duas palavras rimam (rima rica ou consoante)
   */
  static wordsRhyme(wordA: string, wordB: string): boolean {
    const endingA = this.extractRhymeEnding(wordA);
    const endingB = this.extractRhymeEnding(wordB);

    if (endingA === endingB) return true;

    // Tolerâncias poéticas comuns no cordel (ex: "ão" e "am", "ou" e "ô")
    if ((endingA.endsWith('ão') && endingB.endsWith('am')) || (endingA.endsWith('am') && endingB.endsWith('ão'))) return true;
    if ((endingA.endsWith('eu') && endingB.endsWith('êu')) || (endingA.endsWith('êu') && endingB.endsWith('eu'))) return true;
    if ((endingA.endsWith('ar') && endingB.endsWith('á')) || (endingA.endsWith('á') && endingB.endsWith('ar'))) return true;

    return false;
  }

  /**
   * Valida uma estrofe inteira de acordo com as regras canônicas do cordel
   */
  static verifyStanza(
    stanzaText: string,
    expectedType: 'quadra' | 'sextilha' | 'septilha' | 'oitava' | 'decima' = 'sextilha'
  ): StanzaVerification {
    const lines = stanzaText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    const errors: string[] = [];

    const expectedLinesCount = {
      quadra: 4,
      sextilha: 6,
      septilha: 7,
      oitava: 8,
      decima: 10
    }[expectedType];

    if (lines.length !== expectedLinesCount) {
      errors.push(`A estrofe do tipo ${expectedType} deve ter exatamente ${expectedLinesCount} versos (encontrados ${lines.length}).`);
    }

    // Configuração dos esquemas de rimas e sílabas esperadas
    // Redondilha maior = 7 sílabas poéticas para a maioria das estrofes populares
    const expectedSyllables = expectedType === 'decima' ? 10 : 7;

    const verses = lines.map((line, index) => {
      const count = this.countPoeticSyllables(line);
      const words = line.split(/\s+/).filter(w => w.length > 0);
      const lastWord = words.length > 0 ? words[words.length - 1] : '';

      return {
        text: line,
        syllablesCount: count,
        syllablesExpected: expectedSyllables,
        meterValid: count === expectedSyllables,
        lastWord,
        rhymeTag: 'X',
        rhymeValid: true
      };
    });

    // Análise de rimas por tipo de estrofe
    if (expectedType === 'sextilha' && verses.length === 6) {
      // Esquema ABCBDB: versos pares (índices 1, 3 e 5) DEVEM rimar entre si
      verses[0].rhymeTag = 'A (solto)';
      verses[1].rhymeTag = 'B (rima principal)';
      verses[2].rhymeTag = 'C (solto)';
      verses[3].rhymeTag = 'B (rima principal)';
      verses[4].rhymeTag = 'D (solto)';
      verses[5].rhymeTag = 'B (rima principal)';

      const rhyme1_3 = this.wordsRhyme(verses[1].lastWord, verses[3].lastWord);
      const rhyme1_5 = this.wordsRhyme(verses[1].lastWord, verses[5].lastWord);

      if (!rhyme1_3) {
        errors.push(`O 4º verso ("${verses[3].lastWord}") não rima com o 2º verso ("${verses[1].lastWord}").`);
        verses[3].rhymeValid = false;
      }
      if (!rhyme1_5) {
        errors.push(`O 6º verso ("${verses[5].lastWord}") não rima com o 2º verso ("${verses[1].lastWord}").`);
        verses[5].rhymeValid = false;
      }
    } else if (expectedType === 'quadra' && verses.length === 4) {
      // Esquema ABCB: versos 2 e 4 rimam
      verses[0].rhymeTag = 'A (solto)';
      verses[1].rhymeTag = 'B (rima)';
      verses[2].rhymeTag = 'C (solto)';
      verses[3].rhymeTag = 'B (rima)';

      if (!this.wordsRhyme(verses[1].lastWord, verses[3].lastWord)) {
        errors.push(`O 4º verso ("${verses[3].lastWord}") não rima com o 2º verso ("${verses[1].lastWord}").`);
        verses[3].rhymeValid = false;
      }
    } else if (expectedType === 'septilha' && verses.length === 7) {
      // Esquema ABCBDBB: versos 2, 4, 6 e 7 rimam
      verses[1].rhymeTag = 'B';
      verses[3].rhymeTag = 'B';
      verses[5].rhymeTag = 'B';
      verses[6].rhymeTag = 'B (fechamento)';

      const r2_4 = this.wordsRhyme(verses[1].lastWord, verses[3].lastWord);
      const r2_6 = this.wordsRhyme(verses[1].lastWord, verses[5].lastWord);
      const r6_7 = this.wordsRhyme(verses[5].lastWord, verses[6].lastWord);

      if (!r2_4 || !r2_6 || !r6_7) {
        errors.push('As rimas da septilha nos versos 2, 4, 6 e 7 apresentam inconsistência sonora.');
      }
    }

    // Checagem de quebras métricas
    verses.forEach((v, idx) => {
      if (!v.meterValid) {
        errors.push(`O verso ${idx + 1} possui ${v.syllablesCount} sílabas poéticas (esperado: ${v.syllablesExpected}).`);
      }
    });

    return {
      type: expectedType,
      valid: errors.length === 0,
      verses,
      errors
    };
  }
}
