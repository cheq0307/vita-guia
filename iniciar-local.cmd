@echo off
setlocal
cd /d "%~dp0"
set "PATH=%~dp0tools\node;%PATH%"
echo Iniciando Vita Guia en http://localhost:3000
echo Asegurate de que MySQL este encendido en XAMPP.
if not exist "node_modules\next" call "tools\node\npm.cmd" install
call "tools\node\npm.cmd" run dev
pause
