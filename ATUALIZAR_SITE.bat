@echo off
chcp 65001 >nul
title MEU LIVRO EM INSTANTE — Publicador Automático

echo.
echo  ╔══════════════════════════════════════════════════════╗
echo  ║   MEU LIVRO EM INSTANTE — PUBLICADOR AUTOMÁTICO     ║
echo  ║   GitHub Pages: ctynoco.github.io                   ║
echo  ╚══════════════════════════════════════════════════════╝
echo.

set GIT=C:\Users\User\AppData\Local\GitHubDesktop\app-3.6.10\resources\app\git\cmd\git.exe
if not exist "%GIT%" set GIT=git

cd /d "%~dp0"

echo [1/4] Verificando alterações no projeto...
"%GIT%" config user.name "ctynoco"
"%GIT%" config user.email "ctynoco@users.noreply.github.com"
"%GIT%" status --short
echo.

echo [2/4] Adicionando todos os arquivos modificados...
"%GIT%" add -A

for /f "tokens=1-4 delims=/ " %%a in ('date /t') do set DT=%%a/%%b/%%c
for /f "tokens=1-2 delims=: " %%a in ('time /t') do set TM=%%a:%%b
set COMMIT_MSG=Atualização automática em %DT% %TM%

echo [3/4] Registrando as alterações (%COMMIT_MSG%)...
"%GIT%" commit -m "%COMMIT_MSG%"
if %errorlevel% equ 1 (
    echo    Nenhuma alteração nova para publicar.
) else (
    echo    Alterações registradas com sucesso!
)
echo.

echo [4/4] Publicando no GitHub Pages...
"%GIT%" push origin main
if %errorlevel% neq 0 (
    echo    ERRO ao enviar para o GitHub. Verifique sua conexão.
    goto :erro
)
"%GIT%" push origin main:gh-pages --force
if %errorlevel% neq 0 (
    echo    ERRO ao atualizar o GitHub Pages.
    goto :erro
)

echo.
echo  ╔══════════════════════════════════════════════════════╗
echo  ║   ✓ SITE PUBLICADO COM SUCESSO!                     ║
echo  ║                                                      ║
echo  ║   Aguarde ~2 minutos e acesse:                      ║
echo  ║   https://ctynoco.github.io/npm-install--g-         ║
echo  ║          opencode-cli/                              ║
echo  ╚══════════════════════════════════════════════════════╝
echo.
set /p OPEN="Abrir o site no navegador agora? (S/N): "
if /i "%OPEN%"=="S" start https://ctynoco.github.io/npm-install--g-opencode-cli/
goto :fim

:erro
echo.
echo  ╔══════════════════════════════════════════════════════╗
echo  ║   ✗ Ocorreu um erro durante a publicação.           ║
echo  ║   Verifique sua conexão e tente novamente.          ║
echo  ╚══════════════════════════════════════════════════════╝

:fim
echo.
pause
