/**
 * MEU LIVRO EM INSTANTE — COMPOSITOR DE PÁGINAS DUPLAS (LIVRO ILUSTRADO INFANTIL)
 * Gerencia a composição visual integrada de página esquerda (verso) e página direita (anverso).
 */

export interface PageSpread {
  spreadNumber: number;
  leftPageNumber: number;
  rightPageNumber: number;
  format: 'quadrado_21x21' | 'paisagem_28x21' | 'a4_horizontal';
  widthMm: number;
  heightMm: number;
  gutterCenterMm: number; // Margem da dobra central para não engolir ilustrações
  leftPageContent: {
    text: string;
    imageAssetId?: string;
    textPosition: 'top' | 'middle' | 'bottom' | 'side';
  };
  rightPageContent: {
    text: string;
    imageAssetId?: string;
    textPosition: 'top' | 'middle' | 'bottom' | 'side';
  };
  isFullBleedSpread: boolean; // Se a imagem cobre as duas páginas contínuas
}

export class PictureBookLayoutEngine {
  /**
   * Dimensões padronizadas para livros ilustrados
   */
  private static readonly FORMATS = {
    quadrado_21x21: { widthMm: 210, heightMm: 210, gutter: 15 },
    paisagem_28x21: { widthMm: 280, heightMm: 210, gutter: 18 },
    a4_horizontal: { widthMm: 297, heightMm: 210, gutter: 20 }
  };

  /**
   * Cria uma nova página dupla (spread) com parâmetros de segurança gráfica
   */
  static createSpread(
    spreadIndex: number,
    formatKey: 'quadrado_21x21' | 'paisagem_28x21' | 'a4_horizontal' = 'quadrado_21x21'
  ): PageSpread {
    const config = this.FORMATS[formatKey] || this.FORMATS.quadrado_21x21;
    const leftPage = (spreadIndex * 2);
    const rightPage = leftPage + 1;

    return {
      spreadNumber: spreadIndex + 1,
      leftPageNumber: leftPage,
      rightPageNumber: rightPage,
      format: formatKey,
      widthMm: config.widthMm,
      heightMm: config.heightMm,
      gutterCenterMm: config.gutter,
      leftPageContent: {
        text: '',
        textPosition: 'bottom'
      },
      rightPageContent: {
        text: '',
        textPosition: 'middle'
      },
      isFullBleedSpread: false
    };
  }

  /**
   * Gera o estilo CSS para renderizar a página dupla na tela de diagramação
   */
  static getSpreadCss(spread: PageSpread): string {
    const totalWidthMm = spread.widthMm * 2;
    return `
      .spread-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        width: 100%;
        max-width: ${totalWidthMm}mm;
        aspect-ratio: ${totalWidthMm} / ${spread.heightMm};
        background: #fff;
        box-shadow: 0 4px 20px rgba(0,0,0,0.12);
        position: relative;
        overflow: hidden;
      }
      .spread-gutter-guide {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 50%;
        width: ${spread.gutterCenterMm}mm;
        transform: translateX(-50%);
        background: rgba(255, 0, 0, 0.05);
        pointer-events: none;
        border-left: 1px dashed rgba(0,0,0,0.15);
        border-right: 1px dashed rgba(0,0,0,0.15);
      }
      .page-left, .page-right {
        padding: 15mm;
        box-sizing: border-box;
        position: relative;
        display: flex;
        flex-direction: column;
      }
      .page-left {
        padding-right: ${spread.gutterCenterMm / 2 + 10}mm;
      }
      .page-right {
        padding-left: ${spread.gutterCenterMm / 2 + 10}mm;
      }
    `;
  }
}
