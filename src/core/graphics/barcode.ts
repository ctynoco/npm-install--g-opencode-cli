/**
 * MEU LIVRO EM INSTANTE — GERADOR VETORIAL DE CÓDIGO DE BARRAS ISBN (EAN-13)
 * Gera código de barras em SVG vetorial de alta precisão ótica para gráficas e livrarias.
 */

export class BarcodeEan13 {
  // Padrões de codificação EAN-13 (L-code, G-code, R-code)
  private static readonly L_CODES = [
    '0001101', '0011001', '0010011', '0111101', '0100011',
    '0110001', '0101111', '0111011', '0110111', '0001011'
  ];

  private static readonly G_CODES = [
    '0100111', '0110011', '0011011', '0100001', '0011101',
    '0111001', '0000101', '0010001', '0001001', '0010111'
  ];

  private static readonly R_CODES = [
    '1110010', '1100110', '1101100', '1000010', '1011100',
    '1001110', '1010000', '1000100', '1001000', '1110100'
  ];

  private static readonly PARITY_PATTERNS = [
    'LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG',
    'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL'
  ];

  /**
   * Gera o desenho vetorial SVG do código de barras EAN-13
   */
  static generateSvg(
    isbnOrEan: string,
    widthMm = 38,
    heightMm = 24
  ): string {
    const clean = isbnOrEan.replace(/[-\s]/g, '');
    if (!/^\d{13}$/.test(clean)) {
      throw new Error(`Código de barras inválido: esperados 13 dígitos numéricos (recebido: "${clean}")`);
    }

    const firstDigit = parseInt(clean[0], 10);
    const leftDigits = clean.slice(1, 7);
    const rightDigits = clean.slice(7, 13);
    const parity = this.PARITY_PATTERNS[firstDigit];

    let binaryPattern = '';

    // Guarda inicial (101)
    binaryPattern += '101';

    // 6 dígitos esquerdos (L-code ou G-code dependendo da paridade)
    for (let i = 0; i < 6; i++) {
      const digit = parseInt(leftDigits[i], 10);
      const isL = parity[i] === 'L';
      binaryPattern += isL ? this.L_CODES[digit] : this.G_CODES[digit];
    }

    // Guarda central (01010)
    binaryPattern += '01010';

    // 6 dígitos direitos (sempre R-code)
    for (let i = 0; i < 6; i++) {
      const digit = parseInt(rightDigits[i], 10);
      binaryPattern += this.R_CODES[digit];
    }

    // Guarda final (101)
    binaryPattern += '101';

    // Monta os módulos de barras no SVG
    const moduleWidth = widthMm / 105; // 95 módulos de código + margens de silêncio
    let barsSvg = '';
    const barHeightMm = heightMm - 6;

    for (let i = 0; i < binaryPattern.length; i++) {
      if (binaryPattern[i] === '1') {
        const x = (i + 5) * moduleWidth;
        // As barras de guarda são ligeiramente mais longas para proteção
        const isGuard = (i < 3) || (i >= 45 && i < 50) || (i >= 92);
        const h = isGuard ? barHeightMm + 2 : barHeightMm;
        barsSvg += `<rect x="${x.toFixed(2)}" y="2" width="${moduleWidth.toFixed(2)}" height="${h.toFixed(2)}" fill="#000" />\n`;
      }
    }

    // Formatação visual do ISBN para texto inferior
    const textFormatted = `${clean.slice(0, 3)}-${clean.slice(3, 5)}-${clean.slice(5, 9)}-${clean.slice(9, 12)}-${clean.slice(12)}`;

    return `
<svg xmlns="http://www.w3.org/2000/svg" 
     width="${widthMm}mm" 
     height="${heightMm}mm" 
     viewBox="0 0 ${widthMm} ${heightMm}">
  <!-- Fundo branco de silêncio ótico -->
  <rect x="0" y="0" width="${widthMm}" height="${heightMm}" fill="#ffffff" />
  
  <!-- Barras pretas -->
  ${barsSvg}
  
  <!-- Texto numérico com dígito de corte -->
  <text x="${(widthMm / 2).toFixed(2)}" y="${(heightMm - 1).toFixed(2)}" 
        text-anchor="middle" 
        font-family="monospace, Courier" 
        font-size="3.2mm" 
        font-weight="bold" 
        fill="#000000">
    ${textFormatted}
  </text>
</svg>
    `.trim();
  }
}
