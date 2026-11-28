# MEU LIVRO EM INSTANTE — ATUALIZADOR AUTOMÁTICO EM POWERSHELL
$OutputEncoding = [Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "       MEU LIVRO EM INSTANTE — ATUALIZADOR DO SITE       " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

$git = "C:\Users\User\AppData\Local\GitHubDesktop\app-3.6.10\resources\app\git\cmd\git.exe"
if (-not (Test-Path $git)) {
    $git = "git"
}

Set-Location $PSScriptRoot

Write-Host "`n[1/3] Adicionando arquivos modificados..." -ForegroundColor Gray
& $git add .

$timestamp = Get-Date -Format "dd/MM/yyyy HH:mm"
Write-Host "[2/3] Registrando alterações ($timestamp)..." -ForegroundColor Gray
& $git -c user.name="ctynoco" -c user.email="ctynoco@users.noreply.github.com" commit -m "Atualizacao automatica em $timestamp"

Write-Host "[3/3] Publicando no GitHub Pages..." -ForegroundColor Gray
& $git push origin main
& $git push origin main:gh-pages --force

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "    SUCESSO! O SEU SITE FOI PUBLICADO NA INTERNET!      " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "`nLink: https://ctynoco.github.io/npm-install--g-opencode-cli/" -ForegroundColor Yellow

$resp = Read-Host "`nDeseja abrir o site no navegador agora? (S/N)"
if ($resp -eq 'S' -or $resp -eq 's') {
    Start-Process "https://ctynoco.github.io/npm-install--g-opencode-cli/"
}
