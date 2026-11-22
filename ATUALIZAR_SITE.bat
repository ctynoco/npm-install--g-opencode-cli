@echo off
chcp 65001 >nul
title MEU LIVRO EM INSTANTE — Atualizador Automático do Site
color 0B

echo ===================================================================
echo           MEU LIVRO EM INSTANTE — ATUALIZADOR DO SITE
echo ===================================================================
echo.
echo Identificando alterações locais...
echo.

:: Localiza o executável do Git (seja no PATH ou no GitHub Desktop)
set "GIT_CMD=git"
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    if exist "C:\Users\User\AppData\Local\GitHubDesktop\app-3.6.10\resources\app\git\cmd\git.exe" (
        set "GIT_CMD=C:\Users\User\AppData\Local\GitHubDesktop\app-3.6.10\resources\app\git\cmd\git.exe"
    ) else (
        for /f "delims=" %%I in ('dir /b /s "C:\Users\User\AppData\Local\GitHubDesktop\*git.exe" 2^>nul') do (
            set "GIT_CMD=%%I"
            goto :found_git
        )
    )
)

:found_git
cd /d "%~dp0"

echo [1/4] Preparando arquivos modificados...
"%GIT_CMD%" add .

:: Obtém data e hora atuais para a mensagem de commit
for /f "tokens=1-3 delims=/ " %%a in ('date /t') do set DATA_HOJE=%%a/%%b/%%c
for /f "tokens=1-2 delims=: " %%a in ('time /t') do set HORA_HOJE=%%a:%%b

echo [2/4] Gravando pacote de atualização (%DATA_HOJE% às %HORA_HOJE%)...
"%GIT_CMD%" -c user.name="ctynoco" -c user.email="ctynoco@users.noreply.github.com" commit -m "Atualizacao do site em %DATA_HOJE% %HORA_HOJE%"

echo [3/4] Enviando arquivos para a branch principal (main)...
"%GIT_CMD%" push origin main

echo [4/4] Atualizando o GitHub Pages (gh-pages)...
"%GIT_CMD%" push origin main:gh-pages --force

echo.
echo ===================================================================
color 0A
echo       SUCESSO! SEU SITE FOI ATUALIZADO NA INTERNET!
echo ===================================================================
echo.
echo Link do seu site online:
echo https://ctynoco.github.io/npm-install--g-opencode-cli/
echo.
echo Deseja abrir a página no seu navegador agora? (S/N)
set /p ABRIR="Digite S para abrir ou N para fechar: "

if /i "%ABRIR%"=="S" (
    start https://ctynoco.github.io/npm-install--g-opencode-cli/
)

echo.
echo Processo concluído! Pressione qualquer tecla para sair.
pause >nul
