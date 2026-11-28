---
name: manutencao-github-pages
description: >
  Skill de manutenção, auditoria e atualização automática do projeto
  "MEU LIVRO EM INSTANTE" no GitHub Pages. Inclui diagnóstico de erros,
  aplicação de correções no index.html e publicação automática no GitHub
  via script PowerShell ou bat. Use sempre que o usuário pedir para
  "atualizar o site", "publicar", "corrigir erros" ou "verificar o GitHub Pages".
---

# Skill: Manutenção & Atualização Automática — GitHub Pages

## Visão Geral

Esta skill instrui o agente a:
1. **Auditar** o `index.html` em busca de erros comuns.
2. **Corrigir** automaticamente os problemas encontrados.
3. **Publicar** no GitHub Pages com um único comando.
4. **Verificar** se o deploy foi bem-sucedido.

---

## Configuração do Repositório

| Item | Valor |
|---|---|
| Pasta local | `F:\MEU LIVRO EM INSTANTE` |
| Git executável | `C:\Users\User\AppData\Local\GitHubDesktop\app-3.6.10\resources\app\git\cmd\git.exe` |
| Remote origin | `https://github.com/ctynoco/npm-install--g-opencode-cli.git` |
| Branch principal | `main` |
| Branch Pages | `gh-pages` |
| URL publicada | `https://ctynoco.github.io/npm-install--g-opencode-cli/` |
| Identidade git | `ctynoco` / `ctynoco@users.noreply.github.com` |

---

## Procedimento de Auditoria

Ao auditar o `index.html`, verificar os seguintes itens:

### Erros Críticos (devem ser corrigidos imediatamente)
1. **Funções JS referenciadas no HTML mas não definidas** — verificar onclick de cada botão.
2. **`currentProject` não verificado antes de uso** — toda função que acessa `currentProject` deve ter guard `if (!currentProject) return`.
3. **IndexedDB sem `db` verificado** — toda transação deve ter `if (!db) return`.
4. **EPUB exportado como texto puro** — o exportador deve gerar ZIP válido com mimetype, container.xml e content.opf.
5. **`navigate()` sem rótulos legíveis** — o breadcrumb deve exibir nomes em PT-BR, não IDs raw.

### Erros de UX / Acessibilidade
6. **Sidebar inacessível no mobile** — deve haver botão hamburguer `☰` e overlay de fundo clicável.
7. **`alert()` / `confirm()` nativos** — substituir por `showToast()` ou modais estilizados.
8. **Falta de `<meta description>` e favicon** — incluir para SEO e PWA.
9. **Scroll não reseta ao navegar entre telas** — chamar `window.scrollTo(0,0)` no `navigate()`.

### Erros de Lógica
10. **Auditor de Cordel conta grupos vocálicos, não sílabas poéticas** — usar heurística de ditongos + posição da tônica.
11. **Projeto excluído permanece em `currentProject`** — limpar variável ao deletar projeto ativo.
12. **Microfone não detectado (SpeechRecognition)** — retornar mensagem amigável no Firefox.

---

## Procedimento de Publicação Automática

### Via Script (1 clique)
Execute no terminal dentro de `F:\MEU LIVRO EM INSTANTE`:
```powershell
powershell -ExecutionPolicy Bypass -File .\ATUALIZAR_SITE.ps1
```

### Manualmente (via agente)
```powershell
$GIT = "C:\Users\User\AppData\Local\GitHubDesktop\app-3.6.10\resources\app\git\cmd\git.exe"
Set-Location "F:\MEU LIVRO EM INSTANTE"
& $GIT config user.name "ctynoco"
& $GIT config user.email "ctynoco@users.noreply.github.com"
& $GIT add -A
$ts = Get-Date -Format "dd/MM/yyyy HH:mm"
& $GIT commit -m "Atualização automática em $ts"
& $GIT push origin main
& $GIT push origin main:gh-pages --force
```

### Verificar se o deploy funcionou
- Aguardar ~2 minutos após o push.
- Acessar: `https://ctynoco.github.io/npm-install--g-opencode-cli/`
- Verificar no GitHub: `https://github.com/ctynoco/npm-install--g-opencode-cli/actions`

---

## Checklist de Manutenção Periódica

Executar os itens abaixo sempre que solicitado:

- [ ] Verificar se todas as funções JS estão definidas e sem erro de referência
- [ ] Testar fluxo completo: criar projeto → escrever → salvar → exportar EPUB
- [ ] Testar Modo Kids: microfone, 7 temas mágicos, leitura automática
- [ ] Testar Leitor Automático com texto de pelo menos 2 parágrafos
- [ ] Verificar acessibilidade: A+/A-, contraste, tamanho de fonte
- [ ] Validar EPUB exportado em https://validator.w3.org/epubcheck/ (online)
- [ ] Verificar GitHub Actions em https://github.com/ctynoco/npm-install--g-opencode-cli/actions
- [ ] Confirmar que a URL pública carrega sem erros no Chrome e Edge

---

## Erros Conhecidos e Soluções

| Erro | Causa | Solução |
|---|---|---|
| `git: command not found` | Git não está no PATH do sistema | Usar o caminho completo do GitHub Desktop |
| `fatal: unable to auto-detect email` | Identidade git não configurada | Executar `git config user.email` e `user.name` |
| `rejected: non-fast-forward` | Branch gh-pages divergiu | Usar `--force` no push de gh-pages |
| `SpeechRecognition not found` | Firefox não suporta | Instruir usuário a usar Chrome ou Edge |
| `IndexedDB quota exceeded` | Muitos projetos grandes | Instruir exclusão de projetos antigos |
| GitHub Pages 404 | Branch gh-pages não selecionada nas Settings | Ir em Settings → Pages → selecionar gh-pages |
| EPUB inválido | Exportador gerava texto, não ZIP | Corrigido: exportador real com CRC32 e ZIP spec |

---

## Notas Importantes

> **SEMPRE** usar PT-BR em todas as respostas ao usuário.
> **NUNCA** usar `alert()` nativo — usar `showToast()`.
> **NUNCA** commitar sem antes verificar se há mudanças (`git status`).
> O projeto é **100% offline-first** — não pode depender de CDN externo para funcionar.
