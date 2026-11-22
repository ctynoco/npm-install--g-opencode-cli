/**
 * MEU LIVRO EM INSTANTE — CÁLCULO DE LOMBADA E GEOMETRIA DE CAPA ABERTA
 * Cálculo milimétrico para envio a gráficas tradicionais e print-on-demand.
 */

export type PaperType = 
  | 'polen_bold_90'  // Clássico de ficção e romances (0.075 mm / folha)
  | 'polen_soft_80'  // Literatura comum e bolso (0.065 mm / folha)
  | 'offset_75'      // Sulfite padrão / apostilas (0.050 mm / folha)
  | 'couche_115';    // Revistas e livros ilustrados de arte (0.045 mm / folha)

export interface CoverDimensionsResult {
  spineWidthMm: number;
  totalWidthMm: number;
  totalHeightMm: number;
  frontCoverWidthMm: number;
  backCoverWidthMm: number;
  heightMm: number;
  bleedMm: number;
  safeMarginMm: number;
  flapWidthMm: number;
}

export class SpineCalculator {
  /**
   * Tabela de fatores de espessura por folha (1 folha = 2 páginas)
   */
  private static readonly CALIPER_FACTORS: Record<PaperType, number> = {
    polen_bold_90: 0.075,
    polen_soft_80: 0.065,
    offset_75: 0.050,
    couche_115: 0.045
  };

  /**
   * Calcula a largura exata da lombada mecânica em milímetros
   * Fórmula: Lombada (mm) = (Total de Páginas / 2) * Fator do Papel
   */
  static calculateSpineWidth(pageCount: number, paper: PaperType): number {
    const sheets = Math.ceil(pageCount / 2);
    const factor = this.CALIPER_FACTORS[paper] || 0.075;
    const width = sheets * factor;

    // Arredonda com precisão de 1 casa decimal
    return Math.round(width * 10) / 10;
  }

  /**
   * Calcula a geometria completa da capa aberta com sangrias e orelhas
   */
  static calculateFullCoverDimensions(
    pageWidthMm: number,
    pageHeightMm: number,
    pageCount: number,
    paper: PaperType,
    bleedMm = 5,
    flapWidthMm = 0 // Largura da orelha (ex: 70 mm se houver)
  ): CoverDimensionsResult {
    const spineWidthMm = this.calculateSpineWidth(pageCount, paper);

    // Largura total: Sangria Esquerda + Orelha Esquerda + Contracapa + Lombada + Capa + Orelha Direita + Sangria Direita
    const totalWidthMm = (bleedMm * 2) + (flapWidthMm * 2) + (pageWidthMm * 2) + spineWidthMm;
    // Altura total: Altura da página + Sangria Superior + Sangria Inferior
    const totalHeightMm = pageHeightMm + (bleedMm * 2);

    return {
      spineWidthMm,
      totalWidthMm: Math.round(totalWidthMm * 10) / 10,
      totalHeightMm: Math.round(totalHeightMm * 10) / 10,
      frontCoverWidthMm: pageWidthMm,
      backCoverWidthMm: pageWidthMm,
      heightMm: pageHeightMm,
      bleedMm,
      safeMarginMm: 5,
      flapWidthMm
    };
  }

  /**
   * Valida o dígito verificador de um ISBN-13 (padrão oficial da Biblioteca Nacional / CBL)
   */
  static validateIsbn13(isbn: string): boolean {
    const clean = isbn.replace(/[-\s]/g, '');
    if (!/^\d{13}$/.test(clean)) return false;

    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(clean[i], 10);
      sum += (i % 2 === 0) ? digit : digit * 3;
    }

    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit === parseInt(clean[12], 10);
  }

  /**
   * Formata um ISBN-13 no padrão legível brasileiro com hífens
   * Exemplo: 9786500000000 -> 978-65-00-00000-0
   */
  static formatIsbn13(isbn: string): string {
    const clean = isbn.replace(/[-\s]/g, '');
    if (clean.length !== 13) return isbn;

    // Prefixo Bookland (978 ou 979) - País (65 Brasil) - Editora - Título - Dígito
    return `${clean.slice(0, 3)}-${clean.slice(3, 5)}-${clean.slice(5, 9)}-${clean.slice(9, 12)}-${clean.slice(12)}`;
  }
}
