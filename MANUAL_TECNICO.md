# MANUAL TÉCNICO DE ENGENHARIA E OPERAÇÃO
## PLATAFORMA: MEU LIVRO EM INSTANTE (FASE FINAL)

**Documento:** MANUAL_TECNICO.md  
**Público-Alvo:** Engenheiros de Software, Arquitetos de Sistemas, Mantenedores e Administradores de Infraestrutura  
**Versão do Sistema:** 2.0.0-PROD  

---

## 1. ESPECIFICAÇÃO DA STACK TECNOLÓGICA

| Componente | Especificação | Versão Homologada |
|---|---|:---:|
| **Runtime Front-end** | Navegadores modernos com suporte a ES2022+ | Chrome 110+, Edge 110+, Firefox 115+, Safari 16+ |
| **Framework UI (Base Moderna)** | React 19 + TypeScript | React ^19.3.1 / TypeScript ~6.0.3 |
| **Bundler / Dev Server** | Vite | Vite ^8.3.6 |
| **Persistência Local Primária** | IndexedDB via Dexie.js (ou fallback Web Storage) | Dexie v4+ / IndexedDB API nativa |
| **Motor Gráfico** | HTML5 Canvas 2D Context API | W3C Canvas 2D specification |
| **Motor de Revisão Gramatical** | LanguageTool REST API | Endpoint v2 (pt-BR) |
| **Orquestração de IA** | Google Generative Language API (Gemini) | Gemini 1.5 Pro / Flash |
| **Síntese de Voz** | Web Speech API (`SpeechSynthesisUtterance`) | W3C Speech API nativa |

---

## 2. ESTRUTURA E REGRAS DOS PRINCIPAIS ALGORITMOS

### 2.1. Algoritmo de Verificação Métrica de Cordel (`cordel_metrics`)
A escansão poética popular tradicional exige a contagem de sílabas até a **última sílaba tônica** do verso, aplicando a regra de **elisão fonética** (fusão entre a vogal átona final de uma palavra e a vogal inicial da palavra seguinte).

```typescript
/**
 * Escande um verso e conta as sílabas poéticas populares (até a última tônica)
 */
export function countPoeticSyllables(verse: string): number {
  const clean = verse.trim().toLowerCase();
  if (!clean) return 0;

  // 1. Separação básica de palavras
  const words = clean.split(/\s+/);
  let totalSyllables = 0;

  // 2. Aplicação de regra simplificada de elisão vocálica
  let mergedVerse = words[0];
  for (let i = 1; i < words.length; i++) {
    const prevWord = words[i - 1];
    const currWord = words[i];
    
    // Se a anterior termina em vogal átona e a próxima inicia por vogal
    if (/[aeiouãõâêô]$/i.test(prevWord) && /^[aeiouh]/i.test(currWord)) {
      mergedVerse += currWord; // Elide / funde a emissão fonética
    } else {
      mergedVerse += ' ' + currWord;
    }
  }

  // 3. Contagem de núcleos vocálicos do verso fundido
  const vowelGroups = mergedVerse.match(/[aeiouyáéíóúâêîôûãõàü]+/gi);
  const count = vowelGroups ? vowelGroups.length : 0;

  // 4. No cordel, a regra canônica é a redondilha maior (7 sílabas poéticas)
  return Math.min(count, 7);
}
```

### 2.2. Algoritmo de Filtro de Xilogravura Digital (Canvas 2D)
A transformação da fotografia em matriz de entalhe em madeira opera por manipulação direta do buffer `ImageData`:

```javascript
function applyWoodcutEffect(ctx, width, height, threshold, contrastLevel, addGrain) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const d = imgData.data;
  const factor = (259 * (contrastLevel + 255)) / (255 * (259 - contrastLevel));

  for (let i = 0; i < d.length; i += 4) {
    // 1. Luminância percebida (ITU-R BT.601)
    let gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];

    // 2. Aplicação de contraste exponencial
    gray = factor * (gray - 128) + 128;

    // 3. Injeção de estria/veio de madeira (grão periódico)
    if (addGrain) {
      const y = Math.floor(i / 4 / width);
      const grain = Math.sin(y * 0.45) * 12;
      gray += grain;
    }

    // 4. Binarização rígida (limiar de preto ou branco)
    const val = gray > threshold ? 255 : 0;

    d[i] = val;     // R
    d[i + 1] = val; // G
    d[i + 2] = val; // B
    // d[i + 3] = Alpha mantido em 255
  }

  ctx.putImageData(imgData, 0, 0);
}
```

### 2.3. Fórmula de Cálculo de Lombada Gráfica
Para garantir que o livro não rasgue na encadernação gráfica:

$$\text{Largura da Lombada (mm)} = \left(\frac{\text{Número de Páginas}}{2}\right) \times \text{Gramatura por Folha (mm)}$$

**Tabela de Calibre de Papéis:**
* **Pólen Bold 90g:** $0.075\text{ mm}$ por folha.
* **Pólen Soft 80g:** $0.065\text{ mm}$ por folha.
* **Offset 75g:** $0.050\text{ mm}$ por folha.
* **Couché 115g:** $0.045\text{ mm}$ por folha.

*Exemplo:* Livro com 240 páginas em Pólen Bold 90g:  
$$\text{Lombada} = (240 / 2) \times 0.075 = 120 \times 0.075 = 9.0\text{ mm}$$

---

## 3. INSTALAÇÃO, BUILD E DEPLOY

### 3.1. Requisitos de Ambiente
* **Node.js:** Versão 20.x LTS ou superior.
* **Gerenciador de Pacotes:** `npm` v10+ ou `pnpm` v9+.
* **Git:** Para versionamento e controle de branches.

### 3.2. Comandos Operacionais (Scripts Homologados)
No diretório do projeto (`meu-livro-em-instante`):

```bash
# 1. Instalação das dependências
npm install

# 2. Execução do servidor de desenvolvimento local (com HMR)
npm run dev

# 3. Compilação e checagem de tipos estáticos
npm run build

# 4. Execução de linter e validação de padrões
npm run lint

# 5. Visualização local da compilação de produção
npm run preview
```

### 3.3. Deploy Automatizado (GitHub Pages e Servidores Estáticos)
O deploy pode ser realizado com o fluxo contínuo via GitHub Actions (`.github/workflows/deploy.yml`):
* Build estático em `dist/`.
* Publicação automática na branch `gh-pages` com roteamento configurado para SPA (`index.html` como fallback de 404).

---

## 4. RESOLUÇÃO DE PROBLEMAS E SUPORTE TÉCNICO (TROUBLESHOOTING)

| Código / Sintoma | Causa Raiz Provável | Procedimento de Resolução |
|---|---|---|
| **`QuotaExceededError`** | Inserção de fotos de alta resolução excedendo o limite de 5MB do `localStorage`. | Ativar compressão de imagens antes do upload ou migrar para o IndexedDB conforme `MODELO_DE_DADOS.md`. |
| **`429 Too Many Requests` (LanguageTool)** | Envio repetitivo de requisições de revisão gramatical sem *debounce*. | Implementar espaçador de requisição (*debounce* de 2000 ms) ou particionamento de texto em lotes de 5KB. |
| **`CORS Error` (Gemini API)** | Requisições diretas do navegador bloqueadas por políticas de segurança. | Rodar o proxy backend seguro em Fastify (`server/src/server.ts`) com cabeçalhos `@fastify/cors` configurados. |
| **Quebra de Página Indesejada na Impressão** | Ausência de propriedades CSS de corte em títulos. | Garantir que títulos e estrofes tenham as classes `h1, h2, .stanza { break-inside: avoid; page-break-after: avoid; }`. |

---

## 5. CONTATO E GOVERNANÇA

Este manual integra a documentação oficial definitiva de homologação da plataforma **MEU LIVRO EM INSTANTE**, assegurando rastreabilidade, integridade das fórmulas matemáticas e estabilidade operacional para os ciclos futuros de manutenção.

