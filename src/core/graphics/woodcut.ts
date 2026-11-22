/**
 * MEU LIVRO EM INSTANTE — MOTOR GRÁFICO DE XILOGRAVURA DIGITAL (CANVAS 2D)
 * Converte fotografias em matrizes monocromáticas de entalhe em madeira (estilo cordel).
 */

export interface WoodcutFilterOptions {
  threshold: number;      // 0 a 255 (padrão: 128)
  contrast: number;       // -100 a 100 (padrão: 35)
  grainIntensity: number; // 0 a 50 (estrias de madeira)
  carvingDepth: number;   // 0 a 10 (emulação de corte de goiva)
  inkColor: 'nanquim' | 'sepia' | 'ocre' | 'azul_colonial' | 'vinho';
}

export class WoodcutEngine {
  /**
   * Paleta tradicional de tintas tipográficas de xilogravura
   */
  private static readonly INK_PALETTES = {
    nanquim: { r: 18, g: 20, b: 24 },       // Preto profundo de nanquim
    sepia: { r: 62, g: 39, b: 35 },         // Castanho escuro colonial
    ocre: { r: 120, g: 60, b: 20 },         // Ocre queimado do sertão
    azul_colonial: { r: 24, g: 43, b: 73 },  // Azul marinho clássico
    vinho: { r: 88, g: 24, b: 42 }          // Vinho escuro artesanal
  };

  /**
   * Processa uma imagem contida em um HTMLCanvasElement aplicando o filtro de xilogravura
   */
  static applyWoodcutEffect(
    canvas: HTMLCanvasElement,
    options: WoodcutFilterOptions
  ): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const imgData = ctx.getImageData(0, 0, width, height);
    const d = imgData.data;

    const ink = this.INK_PALETTES[options.inkColor] || this.INK_PALETTES.nanquim;

    // Fator de contraste linear expandido
    const factor = (259 * (options.contrast + 255)) / (255 * (259 - options.contrast));

    for (let i = 0; i < d.length; i += 4) {
      // 1. Conversão para luminância percebida (ITU-R BT.601)
      let gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];

      // 2. Ajuste de contraste
      gray = factor * (gray - 128) + 128;

      // 3. Injeção de estrias de madeira e talhe de goiva
      if (options.grainIntensity > 0) {
        const y = Math.floor(i / 4 / width);
        const x = (i / 4) % width;

        // Ondulação suave horizontal simulando o veio do cedro/cajueiro
        const woodWave = Math.sin(y * 0.35 + Math.cos(x * 0.05) * 2) * options.grainIntensity;
        gray += woodWave;
      }

      // 4. Binarização rígida (preto ou branco absoluto)
      const isInk = gray <= options.threshold;

      if (isInk) {
        // Aplica a cor da tinta selecionada
        d[i] = ink.r;
        d[i + 1] = ink.g;
        d[i + 2] = ink.b;
        d[i + 3] = 255;
      } else {
        // Branco puro do papel artesanal
        d[i] = 255;
        d[i + 1] = 255;
        d[i + 2] = 255;
        d[i + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }

  /**
   * Carrega uma imagem de fonte externa ou File, redimensiona proporcionalmente e processa
   */
  static async processImageToWoodcut(
    imageSource: HTMLImageElement | Blob | string,
    options: WoodcutFilterOptions,
    targetWidth = 1200
  ): Promise<HTMLCanvasElement> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Não foi possível inicializar o contexto Canvas 2D.');

    let img: HTMLImageElement;

    if (imageSource instanceof HTMLImageElement) {
      img = imageSource;
    } else {
      img = new Image();
      img.crossOrigin = 'anonymous';
      if (typeof imageSource === 'string') {
        img.src = imageSource;
      } else {
        img.src = URL.createObjectURL(imageSource);
      }
      await new Promise((res, rej) => {
        img.onload = () => res(true);
        img.onerror = () => rej(new Error('Falha ao carregar a imagem para xilogravura.'));
      });
    }

    // Calcula dimensões proporcionais
    const scale = Math.min(1, targetWidth / img.naturalWidth);
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);

    // Desenha a imagem original no Canvas
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Aplica o algoritmo de entalhe
    this.applyWoodcutEffect(canvas, options);

    return canvas;
  }

  /**
   * Converte o Canvas processado em Blob PNG de alta resolução para salvamento no IndexedDB
   */
  static canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Falha na exportação do Canvas para Blob.'));
      }, 'image/png');
    });
  }
}
