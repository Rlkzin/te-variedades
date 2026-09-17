@echo off
where cloudflared >nul 2>nul
if %errorlevel% neq 0 (
  echo.
  echo  O Cloudflared nao esta instalado.
  echo  Instale com o comando:   winget install cloudflare.cloudflared
  echo  Ou baixe em:  https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/
  echo.
  pause
  exit /b
)
echo.
echo  Criando link publico (HTTPS) para a loja na porta 3000...
echo  Enquanto este comando estiver aberto, o link vale como internet para a loja.
echo  Quando aparecer uma URL https://....trycloudflare.com, esse e o endereco publico.
echo  Deixe o start.bat RODANDO em outra janela e passe o link para seus clientes.
echo.
cloudflared tunnel --url http://localhost:3000
echo.
pause