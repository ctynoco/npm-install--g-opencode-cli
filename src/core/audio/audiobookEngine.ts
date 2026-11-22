/**
 * MEU LIVRO EM INSTANTE — MOTOR DE SÍNTESE DE VOZ E AUDIOLIVRO
 * Narração estruturada por capítulos com controle de velocidade, tom e progresso.
 */

import { Chapter } from '../../data/models';

export interface AudiobookPlaybackState {
  currentChapterIndex: number;
  isPlaying: boolean;
  isPaused: boolean;
  rate: number;   // Velocidade: 0.8x a 2.0x
  pitch: number;  // Tom: 0.8 a 1.2
}

export class AudiobookEngine {
  private static synth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private static currentUtterance: SpeechSynthesisUtterance | null = null;
  private static state: AudiobookPlaybackState = {
    currentChapterIndex: 0,
    isPlaying: false,
    isPaused: false,
    rate: 1.0,
    pitch: 1.0
  };

  /**
   * Obtém vozes brasileiras disponíveis no sistema operacional do usuário
   */
  static getBrazilianVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    return this.synth.getVoices().filter(v => v.lang.toLowerCase().includes('pt') || v.lang.toLowerCase().includes('br'));
  }

  /**
   * Inicia a reprodução de um capítulo do livro
   */
  static playChapter(
    chapter: Chapter,
    onProgress?: (charIndex: number) => void,
    onComplete?: () => void
  ): void {
    if (!this.synth) return;

    this.stop();

    // Extrai texto limpo sem tags HTML
    const cleanText = this.stripHtml(chapter.contentHtml);
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'pt-BR';
    utterance.rate = this.state.rate;
    utterance.pitch = this.state.pitch;

    // Seleciona voz brasileira preferencial se disponível
    const voices = this.getBrazilianVoices();
    if (voices.length > 0) {
      utterance.voice = voices[0];
    }

    utterance.onboundary = (e) => {
      if (onProgress) onProgress(e.charIndex);
    };

    utterance.onend = () => {
      this.state.isPlaying = false;
      this.state.isPaused = false;
      if (onComplete) onComplete();
    };

    utterance.onerror = (e) => {
      console.warn('[Audiolivro] Erro na síntese de voz:', e);
      this.state.isPlaying = false;
      this.state.isPaused = false;
    };

    this.currentUtterance = utterance;
    this.state.isPlaying = true;
    this.state.isPaused = false;
    this.synth.speak(utterance);
  }

  /**
   * Pausa a narração
   */
  static pause(): void {
    if (this.synth && this.synth.speaking && !this.synth.paused) {
      this.synth.pause();
      this.state.isPaused = true;
      this.state.isPlaying = false;
    }
  }

  /**
   * Retoma a narração pausada
   */
  static resume(): void {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
      this.state.isPaused = false;
      this.state.isPlaying = true;
    }
  }

  /**
   * Interrompe a narração
   */
  static stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.state.isPlaying = false;
      this.state.isPaused = false;
      this.currentUtterance = null;
    }
  }

  /**
   * Altera a velocidade de narração (0.75x a 2.0x)
   */
  static setRate(rate: number): void {
    this.state.rate = Math.max(0.5, Math.min(2.0, rate));
  }

  /**
   * Converte HTML do capítulo em texto falado natural
   */
  private static stripHtml(html: string): string {
    if (!html) return '';
    return html
      .replace(/<[^>]+>/g, ' ')
      .replace(/&mdash;/g, ' ')
      .replace(/&ndash;/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
