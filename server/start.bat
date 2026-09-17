@echo off
cd /d "%~dp0.."
echo.
echo  Iniciando o servidor da loja T^&E Variedades...
echo.
if not exist "server\.token" (
  echo  (Sem token de gravacao. Seguro apenas na rede local / WiFi.)
  echo.
) else (
  set /p API_TOKEN=<server\.token
  echo  Protecao de gravacao ATIVA. O site precisa ter o MESMO token em js\config.js.
  echo.
)
node server\server.js
echo.
echo  O servidor parou. Pressione qualquer tecla para fechar.
pause >nul