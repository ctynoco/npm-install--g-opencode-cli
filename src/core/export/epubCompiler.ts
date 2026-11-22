/**
 * MEU LIVRO EM INSTANTE — COMPILADOR OFICIAL DE EPUB 3.2
 * Gera container EPUB 3 válido para Amazon Kindle (KDP), Apple Livros, Kobo e Google Play Livros.
 * Implementa empacotamento ZIP compatível com a especificação W3C/IDPF com zero dependências externas.
 */

import { Project, Chapter } from '../../data/models';

/**
 * Construtor binário de arquivo ZIP conforme especificação PKZip / EPUB (mimetype armazenado no byte 30 sem compressão)
 */
class SimpleZipBuilder {
  private files: { name: string; content: Uint8Array; storeOnly?: boolean }[] = [];

  addTextFile(name: string, text: string, storeOnly = false) {
    const encoder = new TextEncoder();
    this.files.push({ name, content: encoder.encode(text), storeOnly });
  }

  addBinaryFile(name: string, content: Uint8Array, storeOnly = false) {
    this.files.push({ name, content, storeOnly });
  }

  private crc32(data: Uint8Array): number {
    let crc = -1;
    for (let i = 0; i < data.length; i++) {
      let byte = data[i];
      for (let j = 0; j < 8; j++) {
        const bit = (byte ^ crc) & 1;
        crc >>>= 1;
        if (bit) crc ^= 0xEDB88320;
        byte >>>= 1;
      }
    }
    return (crc ^ -1) >>> 0;
  }

  generateZip(): Uint8Array {
    const fileRecords: {
      name: string;
      headerOffset: number;
      crc: number;
      size: number;
      nameBytes: Uint8Array;
    }[] = [];

    const localChunks: Uint8Array[] = [];
    let currentOffset = 0;

    for (const file of this.files) {
      const nameBytes = new TextEncoder().encode(file.name);
      const crc = this.crc32(file.content);
      const size = file.content.length;

      // Local file header (30 bytes + name length)
      const localHeader = new Uint8Array(30 + nameBytes.length);
      const view = new DataView(localHeader.buffer);

      view.setUint32(0, 0x04034b50, true); // Assinatura Local File Header
      view.setUint16(4, 20, true);         // Versão mínima (2.0)
      view.setUint16(6, 0, true);          // Flags gerais
      view.setUint16(8, 0, true);          // Método de compressão (0 = Store / Sem compressão)
      view.setUint16(10, 0, true);         // Hora do arquivo
      view.setUint16(12, 0, true);         // Data do arquivo
      view.setUint32(14, crc, true);       // CRC-32
      view.setUint32(18, size, true);      // Tamanho comprimido
      view.setUint32(22, size, true);      // Tamanho descomprimido
      view.setUint16(26, nameBytes.length, true); // Tamanho do nome
      view.setUint16(28, 0, true);         // Extra field length

      localHeader.set(nameBytes, 30);

      localChunks.push(localHeader);
      localChunks.push(file.content);

      fileRecords.push({
        name: file.name,
        headerOffset: currentOffset,
        crc,
        size,
        nameBytes
      });

      currentOffset += localHeader.length + size;
    }

    // Central Directory
    const centralDirOffset = currentOffset;
    const centralChunks: Uint8Array[] = [];

    for (const record of fileRecords) {
      const cdRecord = new Uint8Array(46 + record.nameBytes.length);
      const view = new DataView(cdRecord.buffer);

      view.setUint32(0, 0x02014b50, true); // Assinatura Central Directory Header
      view.setUint16(4, 20, true);         // Versão criada
      view.setUint16(6, 20, true);         // Versão necessária
      view.setUint16(8, 0, true);          // Flags
      view.setUint16(10, 0, true);         // Método de compressão (0)
      view.setUint16(12, 0, true);         // Hora
      view.setUint16(14, 0, true);         // Data
      view.setUint32(16, record.crc, true); // CRC-32
      view.setUint32(20, record.size, true); // Tamanho comprimido
      view.setUint32(24, record.size, true); // Tamanho descomprimido
      view.setUint16(28, record.nameBytes.length, true); // Nome do arquivo
      view.setUint16(30, 0, true);         // Extra field length
      view.setUint16(32, 0, true);         // File comment length
      view.setUint16(34, 0, true);         // Disk number start
      view.setUint16(36, 0, true);         // Atributos internos
      view.setUint32(38, 0, true);         // Atributos externos
      view.setUint32(42, record.headerOffset, true); // Offset relativo do Local Header

      cdRecord.set(record.nameBytes, 46);
      centralChunks.push(cdRecord);
      currentOffset += cdRecord.length;
    }

    const centralDirSize = currentOffset - centralDirOffset;

    // End of Central Directory Record (22 bytes)
    const eocd = new Uint8Array(22);
    const eocdView = new DataView(eocd.buffer);
    eocdView.setUint32(0, 0x06054b50, true); // Assinatura EOCD
    eocdView.setUint16(4, 0, true);          // Número deste disco
    eocdView.setUint16(6, 0, true);          // Disco onde começa o Central Dir
    eocdView.setUint16(8, fileRecords.length, true);  // Entradas neste disco
    eocdView.setUint16(10, fileRecords.length, true); // Total de entradas
    eocdView.setUint32(12, centralDirSize, true);    // Tamanho do Central Dir
    eocdView.setUint32(16, centralDirOffset, true);  // Offset do Central Dir
    eocdView.setUint16(20, 0, true);         // Comentário length

    // Monta o buffer final contínuo
    const totalLength = currentOffset + eocd.length;
    const finalBuffer = new Uint8Array(totalLength);
    let writePos = 0;

    for (const chunk of localChunks) {
      finalBuffer.set(chunk, writePos);
      writePos += chunk.length;
    }
    for (const chunk of centralChunks) {
      finalBuffer.set(chunk, writePos);
      writePos += chunk.length;
    }
    finalBuffer.set(eocd, writePos);

    return finalBuffer;
  }
}

export class EpubCompiler {
  /**
   * Compila um projeto editorial em um pacote binário EPUB 3.2 válido
   */
  static compile(project: Project): Blob {
    const zip = new SimpleZipBuilder();

    // 1. Arquivo mimetype obrigatório (DEVE ser o primeiro do ZIP e sem compressão)
    zip.addTextFile('mimetype', 'application/epub+zip', true);

    // 2. Container XML
    const containerXml = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;
    zip.addTextFile('META-INF/container.xml', containerXml);

    // 3. Folha de estilos CSS para e-readers
    const stylesCss = `
@charset "utf-8";
body {
  font-family: Georgia, "Times New Roman", serif;
  font-size: 1.05em;
  line-height: 1.5;
  margin: 5%;
  text-align: justify;
  color: #111;
}
h1, h2, h3 {
  font-family: sans-serif;
  text-align: center;
  margin-top: 1.5em;
  margin-bottom: 0.8em;
  font-weight: 700;
  page-break-after: avoid;
}
h1 { font-size: 1.6em; }
h2 { font-size: 1.3em; }
p {
  margin: 0;
  text-indent: 1.5em;
}
p.first, h1 + p, h2 + p {
  text-indent: 0;
}
blockquote {
  margin: 1.2em 5%;
  font-style: italic;
}
.verse {
  text-align: left;
  margin-left: 10%;
  text-indent: 0;
  white-space: pre-line;
}
`;
    zip.addTextFile('OEBPS/styles.css', stylesCss);

    // Prepara capítulos em XHTML
    const chapters = project.chapters && project.chapters.length > 0
      ? project.chapters
      : [{ id: 'ch_1', projectId: project.id, order: 1, title: 'Início', contentHtml: '<p>Manuscrito em elaboração.</p>' }];

    const manifestItems: string[] = [];
    const spineItems: string[] = [];
    const navPoints: string[] = [];

    // Adiciona CSS e NAV ao manifesto
    manifestItems.push(`<item id="css" href="styles.css" media-type="text/css"/>`);
    manifestItems.push(`<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>`);

    chapters.forEach((ch, idx) => {
      const fileId = `chapter_${idx + 1}`;
      const fileName = `${fileId}.xhtml`;

      manifestItems.push(`<item id="${fileId}" href="${fileName}" media-type="application/xhtml+xml"/>`);
      spineItems.push(`<itemref idref="${fileId}"/>`);
      navPoints.push(`<li><a href="${fileName}">${this.escapeXml(ch.title)}</a></li>`);

      const chapterXhtml = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="pt-BR">
<head>
  <meta charset="utf-8"/>
  <title>${this.escapeXml(ch.title)}</title>
  <link rel="stylesheet" type="text/css" href="styles.css"/>
</head>
<body>
  <section epub:type="chapter">
    <h1>${this.escapeXml(ch.title)}</h1>
    ${this.cleanContentForXhtml(ch.contentHtml)}
  </section>
</body>
</html>`;

      zip.addTextFile(`OEBPS/${fileName}`, chapterXhtml);
    });

    // 4. Arquivo NAV (Sumário EPUB 3)
    const navXhtml = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="pt-BR">
<head>
  <meta charset="utf-8"/>
  <title>Sumário</title>
  <link rel="stylesheet" type="text/css" href="styles.css"/>
</head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>Sumário</h1>
    <ol>
      ${navPoints.join('\n      ')}
    </ol>
  </nav>
</body>
</html>`;
    zip.addTextFile('OEBPS/nav.xhtml', navXhtml);

    // 5. Manifesto content.opf
    const contentOpf = `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="BookId">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>${this.escapeXml(project.title)}</dc:title>
    <dc:creator>${this.escapeXml(project.author)}</dc:creator>
    <dc:identifier id="BookId">urn:uuid:${project.id}</dc:identifier>
    <dc:language>pt-BR</dc:language>
    <dc:date>${new Date().toISOString().split('T')[0]}</dc:date>
    <meta property="dcterms:modified">${new Date().toISOString().replace(/\.[0-9]+Z$/, 'Z')}</meta>
  </metadata>
  <manifest>
    ${manifestItems.join('\n    ')}
  </manifest>
  <spine>
    ${spineItems.join('\n    ')}
  </spine>
</package>`;
    zip.addTextFile('OEBPS/content.opf', contentOpf);

    // Gera o arquivo ZIP final e empacota como Blob EPUB
    const zipData = zip.generateZip();
    return new Blob([zipData], { type: 'application/epub+zip' });
  }

  private static escapeXml(unsafe: string): string {
    return (unsafe || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private static cleanContentForXhtml(html: string): string {
    if (!html) return '<p></p>';
    // Garante que tags vazias ou com fechamento fiquem estritamente compatíveis com XHTML
    return html
      .replace(/<br>/gi, '<br/>')
      .replace(/<hr>/gi, '<hr/>')
      .replace(/<img([^>]+)(?<!\/)>/gi, '<img$1/>');
  }
}
