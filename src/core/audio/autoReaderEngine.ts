/**
 * MEU LIVRO EM INSTANTE — SISTEMA DE LEITURA E CRIAÇÃO AUTOMÁTICA ("CRIA E LÊ")
 * Integração entre geração de texto por IA e leitura em voz alta com destaque em tempo real.
 */

import { AIService, AIRequestBody } from '../../../server/src/routes/ai';

export interface AutoReaderOptions {
  voice?: SpeechSynthesisVoice;
  rate?: number;           // Velocidade da fala: 0.8x a 2.0x (padrão: 1.0)
  pitch?: number;          // Tom da voz: 0.8 a 1.2 (padrão: 1.0)
  autoStartReading?: boolean; // Se deve começar a ler automaticamente assim que gerar
  onTextChunkReceived?: (accumulatedText: string, newChunk: string) => void;
  onSentenceSpoken?: (currentSentence: string, startIndex: number, endIndex: number) => void;
  onWordSpoken?: (word: string, charIndex: number) => void;
  onStatusChange?: (status: 'ocioso' | 'criando_texto' | 'lendo' | 'pausado' | 'concluido') => void;
  onError?: (errorMessage: string) => void;
}

export class AutoReaderEngine {
  private static synth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private static currentUtterance: SpeechSynthesisUtterance | null = null;
  private static isPaused = false;
  private static currentFullText = '';

  /**
   * Obtém as melhores vozes brasileiras disponíveis no navegador/sistema operacional
   */
  static getBrazilianVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    return this.synth.getVoices().filter(v => 
      v.lang.toLowerCase().includes('pt-br') || 
      v.lang.toLowerCase().includes('pt_br') ||
      v.lang.toLowerCase().includes('pt')
    );
  }

  /**
   * FLUXO INTEGRADO: Cria o texto com a IA e inicia a leitura falada imediatamente
   */
  static async createAndRead(
    request: {
      studio: 'literary' | 'cordel' | 'kids_ya' | 'journalism' | 'graphic';
      promptIdea: string;
      previousContext?: string;
    },
    options: AutoReaderOptions = {}
  ): Promise<string> {
    const onStatus = options.onStatusChange || (() => {});
    const onChunk = options.onTextChunkReceived || (() => {});
    const onError = options.onError || console.error;

    this.stop();
    onStatus('criando_texto');
    this.currentFullText = '';

    try {
      // 1. Gera o texto com a inteligência artificial do estúdio correspondente
      const requestBody: AIRequestBody = {
        studio: request.studio,
        task: request.studio === 'cordel' ? 'stanza_gen' : 'continue',
        context: request.previousContext || 'Início de uma nova publicação editorial.',
        instruction: request.promptIdea
      };

      // Simulação ou conexão direta com o servidor de IA
      await new Promise<void>((resolve, reject) => {
        let accumulated = '';
        
        AIService.handleStreamRequest(requestBody, (chunk: string) => {
          accumulated += chunk;
          this.currentFullText = accumulated;
          onChunk(accumulated, chunk);
        })
        .then(() => resolve())
        .catch(err => reject(err));
      });

      onStatus('ocioso');

      // 2. Se configurado para leitura automática, inicia imediatamente a narração vocal
      if (options.autoStartReading !== false && this.currentFullText.trim().length > 0) {
        this.readText(this.currentFullText, options);
      }

      return this.currentFullText;

    } catch (err: any) {
      onError(`Falha na criação automática: ${err.message || err}`);
      onStatus('ocioso');
      return '';
    }
  }

  /**
   * Lê em voz alta qualquer texto com sincronização de frases e palavras
   */
  static readText(text: string, options: AutoReaderOptions = {}): void {
    if (!this.synth) {
      if (options.onError) options.onError('Síntese de voz não suportada neste navegador.');
      return;
    }

    this.stop();
    const cleanText = this.sanitizeForSpeech(text);
    if (!cleanText) return;

    this.currentFullText = cleanText;
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'pt-BR';
    utterance.rate = options.rate || 1.0;
    utterance.pitch = options.pitch || 1.0;

    // Seleciona voz brasileira
    const voices = this.getBrazilianVoices();
    if (options.voice) {
      utterance.voice = options.voice;
    } else if (voices.length > 0) {
      // Prefere vozes neurais / naturais se existirem (ex: Google, Microsoft, Luciana)
      const naturalVoice = voices.find(v => v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('luciana'));
      utterance.voice = naturalVoice || voices[0];
    }

    // Eventos de rastreamento de leitura em tempo real
    utterance.onstart = () => {
      this.isPaused = false;
      if (options.onStatusChange) options.onStatusChange('lendo');
    };

    utterance.onboundary = (event) => {
      // Disparado a cada palavra falada
      if (event.name === 'word') {
        const charIndex = event.charIndex;
        const sub = cleanText.substring(charIndex);
        const match = sub.match(/^\S+/);
        const word = match ? match[0] : '';

        if (options.onWordSpoken) {
          options.onWordSpoken(word, charIndex);
        }

        // Localiza a frase atual completa para destaque em bloco
        if (options.onSentenceSpoken) {
          const sentenceStart = cleanText.lastIndexOf('.', charIndex) + 1;
          let sentenceEnd = cleanText.indexOf('.', charIndex);
          if (sentenceEnd === -1) sentenceEnd = cleanText.length;
          const sentence = cleanText.substring(sentenceStart, sentenceEnd + 1).trim();
          options.onSentenceSpoken(sentence, sentenceStart, sentenceEnd);
        }
      }
    };

    utterance.onend = () => {
      this.isPaused = false;
      this.currentUtterance = null;
      if (options.onStatusChange) options.onStatusChange('concluido');
    };

    utterance.onerror = (e) => {
      console.warn('[AutoReader] Erro na leitura automática:', e);
      this.isPaused = false;
      this.currentUtterance = null;
      if (options.onStatusChange) options.onStatusChange('ocioso');
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  /**
   * Pausa a leitura falada
   */
  static pause(onStatusChange?: (status: any) => void): void {
    if (this.synth && this.synth.speaking && !this.synth.paused) {
      this.synth.pause();
      this.isPaused = true;
      if (onStatusChange) onStatusChange('pausado');
    }
  }

  /**
   * Retoma a leitura falada
   */
  static resume(onStatusChange?: (status: any) => void): void {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
      this.isPaused = false;
      if (onStatusChange) onStatusChange('lendo');
    }
  }

  /**
   * Interrompe imediatamente qualquer leitura em andamento
   */
  static stop(onStatusChange?: (status: any) => void): void {
    if (this.synth) {
      this.synth.cancel();
      this.isPaused = false;
      this.currentUtterance = null;
      if (onStatusChange) onStatusChange('ocioso');
    }
  }

  /**
   * Ajusta a velocidade de leitura (0.5x a 2.0x) em tempo real
   */
  static changeSpeed(newRate: number, options: AutoReaderOptions = {}): void {
    if (this.synth && this.synth.speaking) {
      // No padrão Web Speech, para mudar a velocidade é necessário reiniciar do ponto
      this.stop();
      this.readText(this.currentFullText, { ...options, rate: newRate });
    }
  }

  /**
   * Limpa tags HTML, pontuações estranhas e ajusta fonética para narração limpa
   */
  private static sanitizeForSpeech(htmlOrText: string): string {
    if (!htmlOrText) return '';
    return htmlOrText
      .replace(/<[^>]+>/g, ' ')      // Remove tags HTML
      .replace(/&mdash;/g, ' — ')    // Normaliza travessão
      .replace(/&ndash;/g, ' - ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
