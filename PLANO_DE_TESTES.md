# PLANO DE TESTES, VALIDAÇÃO E QUALIDADE
## PLATAFORMA: MEU LIVRO EM INSTANTE (FASE 2)

**Documento:** PLANO_DE_TESTES.md  
**Objetivo:** Estabelecer a estratégia de testes automatizados e manuais, cobertura de regras de negócio, critérios de aceitação e preparação para a homologação final.

---

## 1. PIRÂMIDE DE TESTES E ESTRATÉGIA DE QUALIDADE

```
        / \
       /   \        E2E Tests (Playwright) — 15%
      / E2E \       Jornada completa: Criação -> Escrita -> Capa -> Exportação
     /-------\
    /         \     Integration Tests (Vitest + Testing Library) — 35%
   /  INTEGR.  \    IndexedDB, LanguageTool, Proxy IA, Paged.js, Reatividade
  /-------------\
 /               \  Unit Tests (Vitest / Pure Functions) — 50%
/   UNITÁRIOS     \ Métrica de Cordel, Escansão, Cálculo de Lombada, ISBN, Canvas
-------------------
```

---

## 2. SUÍTES DE TESTES UNITÁRIOS (REGRAS DE NEGÓCIO PURAS)

### 2.1. Métrica e Escansão Poética do Cordel (`core/cordel/__tests__/metrics.test.ts`)
* **Caso 1 - Escansão de Redondilha Maior:** Validar a correta contagem de 7 sílabas poéticas, incluindo regras de elisão fonética (sinalefa: fusão de vogais átonas entre palavras adjacentes).
* **Caso 2 - Validação de Esquema Sextilha (ABCBDB):** Garantir que o validador aprove estrofes em que os versos 2, 4 e 6 rimam perfeitamente e sinalize versos brancos fora do padrão.
* **Caso 3 - Validação de Décima (Esparsa / Martelo Agalopado):** Garantir a estrutura métrica de 10 versos com decassílabos e esquema ABBAACCDDC.

### 2.2. Matemática Gráfica e Cálculo de Lombada (`core/graphics/__tests__/spine.test.ts`)
* **Caso 1 - Cálculo de Espessura:** Para um livro de 200 páginas no papel Pólen Bold 90g (fator 0.0075 cm/folha), validar se a lombada gerada é de exatamente $15\text{ mm}$ ($\pm 0.1\text{ mm}$).
* **Caso 2 - Validação de Código de Barras EAN-13 / ISBN:** Testar o cálculo do dígito verificador do ISBN-13 (módulo 10 com pesos alternados 1 e 3) e rejeição de identificadores com formato incorreto.

### 2.3. Processamento de Canvas e Matriz de Xilogravura (`core/graphics/__tests__/woodcut.test.ts`)
* **Caso 1 - Limiarização Binarizada (Threshold):** Testar se a matriz de pixels resultante contém exclusivamente valores $\{0, 255\}$ nos canais RGB após o filtro.
* **Caso 2 - Performance de Processamento:** Garantir que o filtro sobre uma imagem de 2048 × 2048 pixels seja concluído em menos de 150 ms em thread de Web Worker.

---

## 3. SUÍTES DE TESTES DE INTEGRAÇÃO

### 3.1. Persistência Offline e Recuperação (`data/__tests__/indexeddb.test.ts`)
* **Caso 1 - Salvamento Automático com Debounce:** Alterações rápidas no editor devem disparar apenas uma escrita no IndexedDB após o período de repouso (1000 ms).
* **Caso 2 - Tolerância a Volume Alto de Imagens:** Salvar um projeto com 20 ilustrações em alta resolução (~50 MB totais) sem falha de cota, confirmando a superação do limite de 5 MB do `localStorage`.
* **Caso 3 - Recuperação Pós-Fechamento Inesperado:** Fechar a aba do navegador durante a digitação e recarregar deve restaurar o manuscrito intacto no último snapshot salvo.

### 3.2. Integração com Revisor LanguageTool (`core/grammar/__tests__/languagetool.test.ts`)
* **Caso 1 - Detecção e Aplicação de Correção:** Enviar sentença com erro de concordância proposital (*"Os livro foi publicado"*), receber sugestão (*"Os livros foram publicados"*) e verificar a substituição correta no nó de texto sem quebrar a formatação adjacente.

---

## 4. TESTES DE PONTA A PONTA (END-TO-END VIA PLAYWRIGHT)

### Cenário 1: Ciclo de Criação e Exportação de Romance Literário
1. Acessar o sistema em modo offline.
2. Criar novo projeto "Memórias do Sertão" no Estúdio Literário (Formato 14 × 21 cm).
3. Adicionar 3 capítulos, digitar textos com formatações e notas de rodapé.
4. Acionar o assistente de IA para expandir a descrição do capítulo 2.
5. Desenhar capa no Estúdio Gráfico com título e cálculo automático de lombada.
6. Exportar para PDF de Impressão e para EPUB 3.
7. Validar integridade dos arquivos gerados com o validador oficial `epubcheck`.

### Cenário 2: Ciclo de Composição de Folheto de Cordel
1. Criar projeto no Estúdio de Cordel.
2. Carregar uma fotografia para o Criador de Xilogravura e aplicar o filtro de entalhe em madeira.
3. Inserir a xilogravura como capa do folheto.
4. Redigir 4 sextilhas no editor especializado.
5. Conferir aprovação pelo Verificador Métrico (7 sílabas poéticas por verso).
6. Exportar a imposição gráfica de folheto dobrado (frente e verso para grampo canoa).

---

## 5. MATRIZ DE CRITÉRIOS DE ACEITAÇÃO PARA HOMOLOGAÇÃO FINAL

Em alinhamento direto com os 20 itens obrigatórios descritos em `HOMOLOGAÇÃO, TESTES E ENTREGA FINAL.txt`:

| Item | Funcionalidade Avaliada | Critério Obrigatório de Sucesso |
|---|---|---|
| **01** | Login e Permissões | Acesso imediato no modo local; login opcional com preservação de projetos salvos. |
| **02** | Gestão de Projetos | Criação, renomeação, duplicação e exclusão sem resíduos órfãos no banco de dados. |
| **03** | Editor de Texto | Digitação fluida, atalhos universais (Ctrl+B, Ctrl+I, Ctrl+Z), suporte a travessão e aspas tipográficas. |
| **04** | Imagens e Copiar/Colar | Colagem de imagens da área de transferência com conversão automática para Blob local otimizado. |
| **05** | Salvamento Automático | Gravação silenciosa a cada 1 segundo após pausa na digitação, com indicador visual de estado. |
| **06** | Recuperação de Documentos | Histórico de revisões locais com opção de restaurar qualquer versão anterior do manuscrito. |
| **07** | Inteligência Artificial | Streaming via SSE estável, isolamento seguro de credenciais e respostas focadas no estilo do estúdio. |
| **08** | Coerência das Histórias | Preservação da memória do projeto (nomes de personagens e fatos anteriores) nas gerações de IA. |
| **09** | Revisor Ortográfico pt-BR | Detecção de desvios do Novo Acordo Ortográfico com aplicação de correções em 1 clique. |
| **10** | Métricas de Cordel | Validação exata de esquemas de rimas e contagem silábica tradicional nordestina. |
| **11** | Xilogravura Digital | Conversão em preto e branco com texturas de entalhe preservando fidelidade fisionômica. |
| **12** | Histórias Infantis e Juvenis | Fichas de personagens completas e layout de visualização em páginas duplas (*spreads*). |
| **13** | Jornais e Revistas | Grids de 2 a 4 colunas com escoamento automático de texto e suporte a elementos jornalísticos. |
| **14** | Paginação e Numeração | Numeração correta de páginas espelhadas, com supressão de numerais em páginas pré-textuais. |
| **15** | Sumário Automático | Geração dinâmica de sumário com hiperlinks internos e números de páginas atualizados. |
| **16** | Capas e Lombadas | Composição técnica de capa completa com margens de sangria, vinco e cálculo preciso de lombada. |
| **17** | Exportação PDF | Arquivo PDF de alta resolução com vetores nítidos e marcas de corte para envio à gráfica. |
| **18** | Exportação EPUB | Arquivo EPUB 3.2 aprovado sem erros pelo validador internacional W3C `epubcheck`. |
| **19** | Responsividade | Interface adaptável para monitores ultrawide, notebooks padrão e tablets. |
| **20** | Segurança e Persistência | Zero perda de dados em falha de conexão, sem vazamento de chaves privadas em console ou rede. |

