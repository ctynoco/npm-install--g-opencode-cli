/**
 * MEU LIVRO EM INSTANTE — SANITIZADOR DE TEXTO E COLAGEM
 * Limpa marcações invasivas do Microsoft Word, Google Docs e HTMLs externos.
 */

export class PasteSanitizer {
  /**
   * Sanitiza HTML colado pelo autor mantendo apenas tags semânticas e limpas
   */
  static sanitizeHtml(dirtyHtml: string): string {
    if (!dirtyHtml) return '';

    // 1. Cria um elemento DOM em memória para processamento
    const doc = new DOMParser().parseFromString(dirtyHtml, 'text/html');
    const body = doc.body;

    // 2. Remove tags indesejadas (scripts, styles, metas, iframes, etc.)
    const dangerousTags = body.querySelectorAll('script, style, meta, link, iframe, object, embed');
    dangerousTags.forEach(el => el.remove());

    // 3. Remove comentários do Word (<!--[if gte mso...]>)
    const cleanNodes = (node: Node) => {
      for (let i = node.childNodes.length - 1; i >= 0; i--) {
        const child = node.childNodes[i];
        if (child.nodeType === Node.COMMENT_NODE) {
          node.removeChild(child);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          const el = child as HTMLElement;

          // Remove atributos de estilo inline específicos do Word
          el.removeAttribute('class');
          el.removeAttribute('style');
          el.removeAttribute('lang');
          el.removeAttribute('dir');

          // Limpa atributos com prefixos proprietários (mso-, o:, w:, v:)
          Array.from(el.attributes).forEach(attr => {
            if (attr.name.startsWith('mso-') || attr.name.startsWith('data-') || attr.name.includes(':')) {
              el.removeAttribute(attr.name);
            }
          });

          // Substitui tags obsoletas por equivalentes modernas
          if (el.tagName === 'B') {
            const strong = document.createElement('strong');
            strong.innerHTML = el.innerHTML;
            el.replaceWith(strong);
          } else if (el.tagName === 'I') {
            const em = document.createElement('em');
            em.innerHTML = el.innerHTML;
            el.replaceWith(em);
          } else if (el.tagName === 'FONT' || el.tagName === 'SPAN') {
            // Desenvelopa span/font inútil preservando o texto interno
            const fragment = document.createDocumentFragment();
            while (el.firstChild) {
              fragment.appendChild(el.firstChild);
            }
            el.replaceWith(fragment);
          } else {
            cleanNodes(child);
          }
        }
      }
    };

    cleanNodes(body);

    // 4. Normaliza travessões de diálogo (substitui traço duplo ou hífen isolado por travessão verdadeiro)
    let result = body.innerHTML;
    result = result.replace(/(<p[^>]*>)\s*[-–]\s+/gi, '$1— ');
    result = result.replace(/(\n)\s*[-–]\s+/gi, '$1— ');
    result = result.replace(/\s+--\s+/g, ' — ');

    return result.trim();
  }

  /**
   * Converte texto puro colado em parágrafos estruturados com travessão
   */
  static textToParagraphs(rawText: string): string {
    if (!rawText) return '<p></p>';

    const lines = rawText.split(/\r?\n+/);
    return lines
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        // Se a linha começa com hífen, converte para travessão de diálogo
        const normalized = line.replace(/^[-–]\s*/, '— ');
        return `<p>${normalized}</p>`;
      })
      .join('\n');
  }
}

