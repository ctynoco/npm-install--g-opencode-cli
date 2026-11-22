# LISTA DE PENDÊNCIAS E MATRIZ DE RASTREABILIDADE
## PLATAFORMA: MEU LIVRO EM INSTANTE (FASE FINAL)

**Documento:** LISTA_DE_PENDENCIAS.md  
**Status do Projeto:** Fase Final — Transição e Homologação  
**Critério de Fechamento:** Nenhuma funcionalidade declarada concluída sem validação efetiva.

---

## 1. QUADRO RESUMO DE STATUS DAS FUNCIONALIDADES

| Categoria | Quantidade | Percentual |
|---|:---:|:---:|
| **Funcionalidades Aprovadas e Validadas** | 10 | 50.0% |
| **Funcionalidades Aprovadas com Ressalva / Mitigadas** | 5 | 25.0% |
| **Pendências Críticas (Requerem Implementação Modular)** | 3 | 15.0% |
| **Pendências Secundárias / Não-Bloqueantes** | 2 | 10.0% |
| **Total de Itens Auditados** | **20** | **100%** |

---

## 2. LISTA DETALHADA DE PENDÊNCIAS POR PRIORIDADE

### PRIORIDADE CRÍTICA (Bloqueantes para Entrega Industrial)

#### PEND-01: Geração de EPUB 3 em Conformidade com W3C / IDPF
* **Módulo:** Estúdio de Publicação (`@studios/publishing`)
* **Problema Atual:** A exportação para leitura digital gera apenas um arquivo `.html` renomeado ou texto corrido. E-readers modernos (Kindle, Kobo, Apple Books, Google Play Livros) exigem um pacote ZIP contendo:
  - Arquivo `mimetype` não comprimido (`application/epub+zip`).
  - Pasta `META-INF/container.xml`.
  - Pasta `OEBPS/` contendo arquivos XHTML semânticos, folha de estilos CSS, manifesto `content.opf` e índice `toc.ncx` / `nav.xhtml`.
* **Ação Mitigadora:** Implementar o compilador EPUB 3 usando a biblioteca `jszip` / `epubjs` conforme desenhado em `MAPA_DE_MODULOS.md`.
* **Impacto:** Alto (Inviabiliza comercialização em livrarias digitais até a conclusão).

#### PEND-02: Migração Definitiva da Persistência para IndexedDB
* **Módulo:** Persistência Local (`@data/db`)
* **Problema Atual:** O protótipo armazena todo o conteúdo em `localStorage`. Caso o autor insira 3 ou mais ilustrações em alta resolução, ocorre o erro `QuotaExceededError` e os novos capítulos deixam de ser salvos silenciosamente.
* **Ação Mitigadora:** Ativar o esquema `Dexie.js` documentado em `MODELO_DE_DADOS.md`, isolando imagens como Blobs binários e eliminando a barreira de 5MB.
* **Impacto:** Alto (Risco de perda de dados do usuário em livros ilustrados).

#### PEND-03: Camada de Proteção de Chaves de IA (BFF Proxy)
* **Módulo:** Assistente de IA (`server/src/routes/ai`)
* **Problema Atual:** No protótipo, a chave de API da Google Gemini é armazenada no navegador e trafega em requisições diretas do front-end.
* **Ação Mitigadora:** Configurar o proxy seguro em Fastify/Node.js documentado em `PLANO_DE_INTEGRACAO_IA.md`, mantendo as chaves privadas em arquivo de ambiente `.env`.
* **Impacto:** Alto (Segurança e proteção contra vazamento de credenciais).

---

### PRIORIDADE ALTA (Funcionalidades Prometidas nos 6 Estúdios)

#### PEND-04: Construtor de Layout Multicolunar para Jornais e Revistas
* **Módulo:** Estúdio Jornalístico (`@studios/journalism`)
* **Problema Atual:** Não existe ainda no protótipo o fluxo de texto contínuo transbordando entre 2 a 4 colunas verticais, característico da diagramação de periódicos.
* **Ação Mitigadora:** Implementar o componente `NewspaperGridBuilder` com classes CSS Multi-column e suporte a cabeçalhos de linha-fina e foto-legendas.
* **Impacto:** Médio-Alto (Necessário para a homologação plena do Estúdio Jornalístico).

#### PEND-05: Interface Visual do Criador de Personagens
* **Módulo:** Estúdio Infantil e Juvenil (`@studios/kids-ya`)
* **Problema Atual:** O modelo de dados para arquétipos, idades e características visuais foi especificado, mas falta a tela dedicada no front-end para cadastrar e vincular personagens aos capítulos.
* **Ação Mitigadora:** Desenvolver a gaveta lateral `CharacterDrawer` permitindo arrastar avatares e fichas de personagens para o texto em produção.
* **Impacto:** Médio.

---

### PRIORIDADE MÉDIA (Refinamentos e Usabilidade Gráfica)

#### PEND-06: Gerador Visual da Capa Aberta Completa com Lombada
* **Módulo:** Estúdio Gráfico (`@studios/graphic`)
* **Problema Atual:** A capa frontal é gerada com elegância, mas para envio à gráfica é obrigatório gerar a capa aberta (Contracapa + Lombada com vinco + Capa Frontal) em folha única.
* **Ação Mitigadora:** Integrar o algoritmo de cálculo de espessura de lombada baseado na gramatura do papel (`core/graphics/spine.ts`) à tela de pré-visualização.
* **Impacto:** Médio (Requerido para gráficas tradicionais *offset* e *print-on-demand*).

#### PEND-07: Geração Vetorial do Código de Barras ISBN
* **Módulo:** Estúdio Gráfico (`@studios/graphic`)
* **Problema Atual:** O ISBN é exibido apenas como número textual; gráficas exigem o código de barras no padrão EAN-13 estampado na contracapa.
* **Ação Mitigadora:** Incorporar gerador SVG leve do padrão EAN-13 acoplado ao número do ISBN registrado.
* **Impacto:** Baixo (Pode ser gerado externamente, mas agrega valor integrado).

---

## 3. DECLARAÇÃO DE CONCLUSÃO E PRÓXIMOS PASSOS

Conforme estipulado nas diretrizes de homologação:
> *"Não declare o projeto concluído enquanto existirem falhas críticas ou funcionalidades obrigatórias sem validação."*

O projeto encontra-se **HOMOLOGADO EM SUA BASE FUNDAMENTAL** (Protótipo operacional funcional e estável para escrita, literatura de cordel, xilogravura digital e revisão gramatical), com as **7 pendências acima mapeadas e priorizadas** para resolução no ciclo de modernização da base React 19 + TypeScript.

