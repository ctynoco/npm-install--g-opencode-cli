/**
 * MEU LIVRO EM INSTANTE — ENGENHARIA DE CAPA ABERTA INTEGRAL
 * Composição da folha completa para impressão gráfica com lombada, vinco, sangria e marcas de corte.
 */

import { SpineCalculator, PaperType, CoverDimensionsResult } from './spine';

export interface FullCoverData {
  title: string;
  subtitle?: string;
  author: string;
  synopsis: string;
  isbn?: string;
  pageCount: number;
  paperType: PaperType;
  pageFormat: {
    widthMm: number;
    heightMm: number;
  };
  colors: {
    primaryBg: string;
    textColor: string;
    accentColor: string;
  };
  frontImageAssetId?: string;
  publisherLogoAssetId?: string;
  hasFlaps: boolean;
  flapWidthMm?: number;
}

export class CoverComposer {
  /**
   * Gera um documento SVG vetorial em alta resolução representando a capa aberta pronta para gráfica
   */
  static generateCoverSvg(data: FullCoverData): { svgString: string; dimensions: CoverDimensionsResult } {
    const flapWidth = data.hasFlaps ? (data.flapWidthMm || 70) : 0;
    const bleed = 5; // 5mm de sangria padrão industrial

    const dim = SpineCalculator.calculateFullCoverDimensions(
      data.pageFormat.widthMm,
      data.pageFormat.heightMm,
      data.pageCount,
      data.paperType,
      bleed,
      flapWidth
    );

    // Posições X horizontais dos elementos
    let currentX = bleed;

    // 1. Orelha Esquerda
    const leftFlapX = currentX;
    if (data.hasFlaps) currentX += flapWidth;

    // 2. Quarta Capa (Contracapa)
    const backCoverX = currentX;
    currentX += dim.backCoverWidthMm;

    // 3. Lombada (Dorso)
    const spineX = currentX;
    currentX += dim.spineWidthMm;

    // 4. Primeira Capa (Frente)
    const frontCoverX = currentX;
    currentX += dim.frontCoverWidthMm;

    // 5. Orelha Direita
    const rightFlapX = currentX;

    // Geração do SVG com marcas de corte mecânicas
    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" 
     width="${dim.totalWidthMm}mm" 
     height="${dim.totalHeightMm}mm" 
     viewBox="0 0 ${dim.totalWidthMm} ${dim.totalHeightMm}">

  <defs>
    <style>
      .text-title { font-family: "Helvetica Neue", Arial, sans-serif; font-weight: 900; font-size: 16px; fill: ${data.colors.textColor}; }
      .text-subtitle { font-family: Georgia, serif; font-style: italic; font-size: 8px; fill: ${data.colors.textColor}; opacity: 0.85; }
      .text-author { font-family: Arial, sans-serif; font-weight: 700; font-size: 9px; fill: ${data.colors.accentColor}; letter-spacing: 1px; }
      .text-synopsis { font-family: Georgia, serif; font-size: 6px; fill: ${data.colors.textColor}; line-height: 1.4; }
      .text-spine { font-family: Arial, sans-serif; font-weight: 700; font-size: ${Math.max(4, Math.min(8, dim.spineWidthMm - 2))}px; fill: ${data.colors.textColor}; }
      .crop-mark { stroke: #000; stroke-width: 0.25; stroke-dasharray: none; }
      .fold-mark { stroke: rgba(0,0,0,0.3); stroke-width: 0.25; stroke-dasharray: 2, 2; }
      .guide-line { stroke: #00f; stroke-width: 0.15; stroke-dasharray: 1, 1; opacity: 0.4; }
    </style>
  </defs>

  <!-- Fundo com Sangria Completa -->
  <rect x="0" y="0" width="${dim.totalWidthMm}" height="${dim.totalHeightMm}" fill="${data.colors.primaryBg}" />

  <!-- ÁREA DA CONTRACAPA (QUARTA CAPA) -->
  <g transform="translate(${backCoverX + 15}, ${bleed + 20})">
    <text x="0" y="0" class="text-title" style="font-size: 10px;">SINOPSE</text>
    <foreignObject x="0" y="8" width="${dim.backCoverWidthMm - 30}" height="${dim.heightMm - 60}">
      <p xmlns="http://www.w3.org/1999/xhtml" style="font-family: Georgia, serif; font-size: 11px; color: ${data.colors.textColor}; line-height: 1.45; text-align: justify; margin: 0;">
        ${this.escape(data.synopsis)}
      </p>
    </foreignObject>

    <!-- Código de Barras ISBN no rodapé da contracapa -->
    ${data.isbn ? `
      <g transform="translate(${dim.backCoverWidthMm - 65}, ${dim.heightMm - 45})">
        <rect x="0" y="0" width="45" height="18" fill="#fff" rx="1" />
        <text x="22.5" y="6" text-anchor="middle" font-family="monospace" font-size="3px" fill="#000">ISBN ${this.escape(data.isbn)}</text>
        <line x1="4" y1="8" x2="41" y2="8" stroke="#000" stroke-width="0.8" />
        <line x1="4" y1="10" x2="41" y2="10" stroke="#000" stroke-width="1.2" stroke-dasharray="1, 0.5, 2, 1, 0.5" />
      </g>
    ` : ''}
  </g>

  <!-- LOMBADA (DORSO COM VINCO MECÂNICO) -->
  <g transform="translate(${spineX}, ${bleed})">
    <!-- Linhas de vinco/dobra da lombada -->
    <line x1="0" y1="0" x2="0" y2="${dim.heightMm}" class="fold-mark" />
    <line x1="${dim.spineWidthMm}" y1="0" x2="${dim.spineWidthMm}" y2="${dim.heightMm}" class="fold-mark" />

    <!-- Texto na lombada rotacionado verticalmente -->
    <text x="${dim.spineWidthMm / 2}" y="${dim.heightMm / 2}" 
          text-anchor="middle" 
          dominant-baseline="central" 
          class="text-spine" 
          transform="rotate(90, ${dim.spineWidthMm / 2}, ${dim.heightMm / 2})">
      ${this.escape(data.title)} — ${this.escape(data.author)}
    </text>
  </g>

  <!-- PRIMEIRA CAPA (FRENTE) -->
  <g transform="translate(${frontCoverX + 15}, ${bleed + 25})">
    <text x="0" y="0" class="text-author">${this.escape(data.author.toUpperCase())}</text>
    <text x="0" y="20" class="text-title">${this.escape(data.title)}</text>
    ${data.subtitle ? `<text x="0" y="32" class="text-subtitle">${this.escape(data.subtitle)}</text>` : ''}
  </g>

  <!-- MARCAS MECÂNICAS DE CORTE GRÁFICO (CROP MARKS) -->
  <!-- Superior Esquerda -->
  <line x1="${bleed}" y1="0" x2="${bleed}" y2="${bleed - 1}" class="crop-mark" />
  <line x1="0" y1="${bleed}" x2="${bleed - 1}" y2="${bleed}" class="crop-mark" />

  <!-- Superior Direita -->
  <line x1="${dim.totalWidthMm - bleed}" y1="0" x2="${dim.totalWidthMm - bleed}" y2="${bleed - 1}" class="crop-mark" />
  <line x1="${dim.totalWidthMm}" y1="${bleed}" x2="${dim.totalWidthMm - bleed + 1}" y2="${bleed}" class="crop-mark" />

  <!-- Inferior Esquerda -->
  <line x1="${bleed}" y1="${dim.totalHeightMm}" x2="${bleed}" y2="${dim.totalHeightMm - bleed + 1}" class="crop-mark" />
  <line x1="0" y1="${dim.totalHeightMm - bleed}" x2="${bleed - 1}" y2="${dim.totalHeightMm - bleed}" class="crop-mark" />

  <!-- Inferior Direita -->
  <line x1="${dim.totalWidthMm - bleed}" y1="${dim.totalHeightMm}" x2="${dim.totalWidthMm - bleed}" y2="${dim.totalHeightMm - bleed + 1}" class="crop-mark" />
  <line x1="${dim.totalWidthMm}" y1="${dim.totalHeightMm - bleed}" x2="${dim.totalWidthMm - bleed + 1}" y2="${dim.totalHeightMm - bleed}" class="crop-mark" />
</svg>
    `.trim();

    return { svgString: svg, dimensions: dim };
  }

  private static escape(str: string): string {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
