/**
 * MEU LIVRO EM INSTANTE — GESTOR DE PERSONAGENS (ESTÚDIO INFANTIL E JUVENIL)
 * Garante consistência visual para ilustrações e profundidade psicológica para narrativas YA e fábulas.
 */

import { Character } from '../../data/models';

export interface CharacterPromptContext {
  character: Character;
  sceneAction: string;
  emotion: string;
  environmentSetting: string;
}

export class CharacterManager {
  /**
   * Cria uma nova ficha de personagem padronizada
   */
  static createCharacter(
    projectId: string,
    data: {
      name: string;
      ageGroup: 'infantil' | 'adolescente' | 'adulto';
      role: 'protagonista' | 'antagonista' | 'coadjuvante' | 'mentor';
      visualTraits: {
        hair: string;
        eyes: string;
        clothing: string;
        distinctiveFeatures: string;
      };
      psychologicalTraits?: string[];
      backstory?: string;
    }
  ): Character {
    return {
      id: 'char_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      projectId,
      name: data.name.trim(),
      ageGroup: data.ageGroup,
      role: data.role,
      visualTraits: data.visualTraits,
      psychologicalTraits: data.psychologicalTraits || [],
      backstory: data.backstory || '',
      avatarAssetId: undefined
    };
  }

  /**
   * Converte a ficha de personagem em uma descrição padronizada para ilustradores e modelos de IA de imagem
   * Garante que o personagem tenha sempre a mesma aparência em todas as páginas do livro
   */
  static generateIllustrationPrompt(ctx: CharacterPromptContext): string {
    const char = ctx.character;
    const v = char.visualTraits;

    const stylePrefix = char.ageGroup === 'infantil'
      ? 'Ilustração infantil brasileira em traço suave, aquarela e contornos limpos.'
      : 'Ilustração editorial infantojuvenil expressiva e dinâmica estilo quadrinhos/graphic novel.';

    const characterDescription = `Personagem: ${char.name}, papel de ${char.role}. Cabelo: ${v.hair}. Olhos: ${v.eyes}. Roupas: ${v.clothing}. Características marcantes: ${v.distinctiveFeatures}.`;
    const actionAndMood = `Ação na cena: ${ctx.sceneAction}. Expressão emocional: ${ctx.emotion}. Cenário ao fundo: ${ctx.environmentSetting}.`;
    const qualityRules = 'Consistência rigorosa de personagem, sem alterações na cor dos olhos, cabelo ou figurino principal. Alta definição, cores equilibradas e sem deformações.';

    return `${stylePrefix} ${characterDescription} ${actionAndMood} ${qualityRules}`;
  }

  /**
   * Avalia a adequação linguística e de conflito da cena de acordo com a faixa etária do personagem
   */
  static getAgeAppropriateGuidelines(ageGroup: 'infantil' | 'adolescente' | 'adulto'): {
    sentenceLength: string;
    themes: string[];
    vocabularyAdvice: string;
  } {
    switch (ageGroup) {
      case 'infantil':
        return {
          sentenceLength: 'Curta (máximo de 8 a 12 palavras por frase)',
          themes: ['Curiosidade', 'Amizade', 'Superação de pequenos medos', 'Descoberta do mundo', 'Natureza'],
          vocabularyAdvice: 'Palavras sensoriais, repetições lúdicas, sonoridade agradável e rimas pontuais.'
        };
      case 'adolescente':
        return {
          sentenceLength: 'Média a ágil (15 a 20 palavras com ritmo alternado)',
          themes: ['Busca de identidade', 'Pertencimento', 'Amizade e lealdade', 'Conflitos éticos', 'Aventura e mistério'],
          vocabularyAdvice: 'Diálogos naturais, ganchos dramáticos no fim das cenas e figuras de linguagem expressivas.'
        };
      default:
        return {
          sentenceLength: 'Livre e subordinada conforme o estilo literário',
          themes: ['Dilemas existenciais', 'Relações complexas', 'Memória e tempo'],
          vocabularyAdvice: 'Riqueza vocabular e polissemia adaptada ao gênero.'
        };
    }
  }
}
