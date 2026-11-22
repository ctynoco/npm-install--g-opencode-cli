/**
 * MEU LIVRO EM INSTANTE — MOTOR DO ESTÚDIO JORNALÍSTICO E PERIÓDICOS
 * Gerencia malhas multicolunares (2 a 4 colunas) e blocos anatômicos de imprensa.
 */

export interface NewsArticle {
  id: string;
  kicker?: string;           // Cartola / Chapéu (identificador temático em caixa alta)
  headline: string;          // Manchete de impacto
  lead?: string;             // Linha-fina de resumo
  byline?: string;           // Assinatura do repórter / autor
  bodyHtml: string;          // Conteúdo textual da matéria
  columnSpan: number;        // Quantas colunas a matéria ocupa (1 a 4)
  pullQuote?: string;        // Olho de texto destacado
  sidebarBox?: {
    title: string;
    content: string;
  };
  photo?: {
    assetId: string;
    caption: string;
    photographerCredit: string;
    position: 'top' | 'middle' | 'bottom';
  };
}

export interface NewspaperPageConfig {
  columns: 2 | 3 | 4;
  gutterMm: number;          // Espaçamento entre colunas (padrão: 5mm)
  pageNumber: number;
  sectionHeader: string;     // Ex: "CADERNO DE CULTURA", "OPINIÃO", "CIDADE"
  dateString: string;
  articles: NewsArticle[];
}

export class NewspaperGridEngine {
  /**
   * Gera o HTML e CSS completo de uma página diagramada em colunas jornalísticas
   */
  static renderPageHtml(config: NewspaperPageConfig): string {
    const colWidthPercent = 100 / config.columns;

    const articlesHtml = config.articles.map(art => {
      const spanClass = `col-span-${Math.min(art.columnSpan, config.columns)}`;
      
      const kickerHtml = art.kicker ? `<span class="news-kicker">${this.escape(art.kicker)}</span>` : '';
      const headlineHtml = `<h2 class="news-headline">${this.escape(art.headline)}</h2>`;
      const leadHtml = art.lead ? `<p class="news-lead">${this.escape(art.lead)}</p>` : '';
      const bylineHtml = art.byline ? `<div class="news-byline">Por ${this.escape(art.byline)}</div>` : '';

      const photoHtml = art.photo ? `
        <figure class="news-figure">
          <img src="${art.photo.assetId}" alt="Foto da reportagem" class="news-photo" />
          <figcaption class="news-caption">
            ${this.escape(art.photo.caption)}
            <span class="photo-credit">(Foto: ${this.escape(art.photo.photographerCredit)})</span>
          </figcaption>
        </figure>
      ` : '';

      const pullQuoteHtml = art.pullQuote ? `
        <blockquote class="news-pullquote">
          “${this.escape(art.pullQuote)}”
        </blockquote>
      ` : '';

      const boxHtml = art.sidebarBox ? `
        <aside class="news-box">
          <h3>${this.escape(art.sidebarBox.title)}</h3>
          <p>${this.escape(art.sidebarBox.content)}</p>
        </aside>
      ` : '';

      return `
        <article class="news-article ${spanClass}">
          ${kickerHtml}
          ${headlineHtml}
          ${leadHtml}
          ${bylineHtml}
          ${art.photo?.position === 'top' ? photoHtml : ''}
          <div class="news-body">
            ${art.bodyHtml}
          </div>
          ${art.photo?.position === 'middle' ? photoHtml : ''}
          ${pullQuoteHtml}
          ${boxHtml}
          ${art.photo?.position === 'bottom' ? photoHtml : ''}
        </article>
      `;
    }).join('\n');

    return `
      <div class="newspaper-page-wrapper">
        <header class="newspaper-header">
          <div class="header-section">${this.escape(config.sectionHeader)}</div>
          <div class="header-date">${this.escape(config.dateString)}</div>
          <div class="header-page">PÁGINA ${config.pageNumber}</div>
        </header>

        <main class="newspaper-grid cols-${config.columns}">
          ${articlesHtml}
        </main>
      </div>
    `;
  }

  /**
   * Gera a folha de estilos CSS para colunagem jornalística profissional
   */
  static getGridStyles(): string {
    return `
      .newspaper-page-wrapper {
        background: #fbfbf9;
        color: #1a1a1a;
        font-family: Georgia, "Times New Roman", serif;
        padding: 12mm 15mm;
        box-sizing: border-box;
      }
      .newspaper-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px solid #111;
        padding-bottom: 3mm;
        margin-bottom: 6mm;
        font-family: Arial, sans-serif;
        font-size: 8.5pt;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      .newspaper-grid {
        display: grid;
        gap: 6mm;
        align-items: start;
      }
      .newspaper-grid.cols-2 { grid-template-columns: repeat(2, 1fr); }
      .newspaper-grid.cols-3 { grid-template-columns: repeat(3, 1fr); }
      .newspaper-grid.cols-4 { grid-template-columns: repeat(4, 1fr); }

      .col-span-1 { grid-column: span 1; }
      .col-span-2 { grid-column: span 2; }
      .col-span-3 { grid-column: span 3; }
      .col-span-4 { grid-column: span 4; }

      .news-article {
        border-bottom: 1px solid #ddd;
        padding-bottom: 5mm;
      }
      .news-kicker {
        font-family: Arial, sans-serif;
        font-size: 7.5pt;
        font-weight: 800;
        color: #b33939;
        text-transform: uppercase;
        display: block;
        margin-bottom: 2mm;
        letter-spacing: 0.5px;
      }
      .news-headline {
        font-family: "Helvetica Neue", Arial, sans-serif;
        font-size: 18pt;
        font-weight: 900;
        line-height: 1.15;
        margin: 0 0 3mm 0;
        letter-spacing: -0.3px;
      }
      .news-lead {
        font-size: 10.5pt;
        font-style: italic;
        line-height: 1.35;
        color: #444;
        margin: 0 0 3mm 0;
      }
      .news-byline {
        font-family: Arial, sans-serif;
        font-size: 8pt;
        color: #777;
        margin-bottom: 3mm;
        text-transform: uppercase;
      }
      .news-body {
        font-size: 9.5pt;
        line-height: 1.45;
        text-align: justify;
        column-gap: 5mm;
      }
      .news-body p {
        margin: 0 0 2.5mm 0;
        text-indent: 3mm;
      }
      .news-pullquote {
        border-top: 1.5px solid #222;
        border-bottom: 1.5px solid #222;
        padding: 3mm 0;
        margin: 4mm 0;
        font-size: 12pt;
        font-weight: 700;
        text-align: center;
        line-height: 1.3;
        color: #111;
      }
      .news-box {
        background: #f0f2f5;
        border-left: 3px solid #163653;
        padding: 4mm;
        margin: 4mm 0;
        border-radius: 4px;
      }
      .news-box h3 {
        margin: 0 0 2mm 0;
        font-size: 9pt;
        text-transform: uppercase;
        font-family: Arial, sans-serif;
      }
      .news-figure {
        margin: 3mm 0;
      }
      .news-photo {
        width: 100%;
        display: block;
        border-radius: 2px;
      }
      .news-caption {
        font-size: 7.5pt;
        color: #555;
        margin-top: 1.5mm;
        line-height: 1.3;
      }
      .photo-credit {
        font-weight: 700;
        color: #888;
      }
    `;
  }

  private static escape(str: string): string {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
