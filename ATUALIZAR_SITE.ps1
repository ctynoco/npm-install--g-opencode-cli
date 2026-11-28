$OutputEncoding = [Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host ""
Write-Host " ╔══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host " ║   MEU LIVRO EM INSTANTE — PUBLICADOR AUTOMÁTICO     ║" -ForegroundColor Yellow
Write-Host " ║   GitHub Pages: ctynoco.github.io                   ║" -ForegroundColor Yellow
Write-Host " ╚══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$GIT = "C:\Users\User\AppData\Local\GitHubDesktop\app-3.6.10\resources\app\git\cmd\git.exe"
if (-not (Test-Path $GIT)) { $GIT = "git" }

Set-Location $PSScriptRoot

Write-Host "[1/4] Configurando identidade do Git..." -ForegroundColor Gray
& $GIT config user.name "ctynoco"
& $GIT config user.email "ctynoco@users.noreply.github.com"

Write-Host "[2/4] Verificando e adicionando alterações..." -ForegroundColor Gray
$status = & $GIT status --porcelain
if (-not $status) {
    Write-Host "      Nenhuma alteração nova encontrada." -ForegroundColor Yellow
} else {
    Write-Host "      Arquivos modificados:" -ForegroundColor Gray
    $status | ForEach-Object { Write-Host "        $_" -ForegroundColor DarkGray }
    & $GIT add -A
}

$timestamp = Get-Date -Format "dd/MM/yyyy HH:mm"
Write-Host "[3/4] Registrando alterações ($timestamp)..." -ForegroundColor Gray
$commitOutput = & $GIT commit -m "Atualizacao automatica em $timestamp" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "      Commit registrado com sucesso!" -ForegroundColor Green
} else {
    Write-Host "      Nenhuma alteração nova para commitar." -ForegroundColor Yellow
}

Write-Host "[4/4] Publicando no GitHub Pages..." -ForegroundColor Gray
& $GIT push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "" 
    Write-Host " ✗ ERRO: Falha ao enviar para o GitHub. Verifique a conexão." -ForegroundColor Red
    Write-Host " Dica: Abra o GitHub Desktop e tente sincronizar manualmente." -ForegroundColor Yellow
    Read-Host "Pressione Enter para fechar"
    exit 1
}

& $GIT push origin main:gh-pages --force
if ($LASTEXITCODE -ne 0) {
    Write-Host " ✗ ERRO: Falha ao atualizar o branch gh-pages." -ForegroundColor Red
    Read-Host "Pressione Enter para fechar"
    exit 1
}

Write-Host ""
Write-Host " ╔══════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host " ║   ✓ SITE PUBLICADO COM SUCESSO!                     ║" -ForegroundColor Green
Write-Host " ║                                                      ║" -ForegroundColor Green
Write-Host " ║   Aguarde ~2 minutos e acesse:                      ║" -ForegroundColor Green
Write-Host " ║   https://ctynoco.github.io/npm-install--g-         ║" -ForegroundColor Green
Write-Host " ║          opencode-cli/                              ║" -ForegroundColor Green
Write-Host " ╚══════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

$resp = Read-Host "Abrir o site no navegador agora? (S/N)"
if ($resp -ieq 'S') {
    Start-Process "https://ctynoco.github.io/npm-install--g-opencode-cli/"
}
