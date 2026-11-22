---
name: estudio-publicacao-exportacao
description: Especialista em geração de arquivos para distribuição industrial e digital, incluindo PDFs certificados para gráficas, e-books no padrão EPUB 3 validado e audiolivros.
---

# Skill: Estúdio de Publicação e Exportação

## 1. Contexto e Missão
Esta habilidade orienta a compilação final dos projetos nos formatos mundiais de publicação: PDF gráfico (para pré-impressão), EPUB 3 (para Kindle, Apple Books, Kobo) e audiolivro narrado.

## 2. Padrão de Exportação EPUB 3 (Validação W3C)
Para aprovação em plataformas como Amazon KDP e Apple Livros, o arquivo `.epub` deve cumprir estritamente:
1. **Container ZIP:** O primeiro arquivo descompactado no arquivo ZIP deve ser `mimetype` sem compressão (`application/epub+zip`).
2. **Diretório `META-INF/`:** Deve conter o arquivo `container.xml` apontando para o arquivo raiz do pacote.
3. **Diretório `OEBPS/`:**
   - `content.opf`: Manifesto com todos os arquivos listados com seus respectivos tipos MIME e metadados Dublin Core (título, autor, idioma `pt-BR`, identificador único).
   - `toc.xhtml` / `toc.ncx`: Sumário navegável semântico.
   - `styles.css`: CSS limpo, com unidades relativas (`em`, `rem`, `%`), sem larguras fixas em pixels.
   - Capítulos em arquivos individuais XHTML (`capitulo_01.xhtml`).

## 3. Padrão de Exportação PDF para Gráfica (PDF/X-1a)
1. **Imposição e Sangria:** Páginas com marcas de corte, marcas de registro e 3 mm de sangria externa.
2. **Resolução de Imagens:** Todas as fotografias e xilogravuras devem ser renderizadas com resolução mínima de 300 DPI na dimensão final.
3. **Cores:** Conversão de perfis RGB para CMYK (espaço de cor de tintas gráficas) para evitar distorções de tonalidade no papel impresso.
4. **Fontes:** Todas as fontes utilizadas devem ser incorporadas (*embedded*) no arquivo PDF para não sofrerem substituição na máquina da gráfica.

## 4. Síntese de Audiolivro
1. Segmentação da narração por capítulos inteiros.
2. Tratamento fonético de abreviações e números por extenso antes do envio à síntese vocal.

