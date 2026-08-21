@echo off
setlocal
cd /d "%~dp0"
echo Iniciando Vita Guia en http://localhost:3000
echo Asegurate de que MySQL este encendido en XAMPP.
call npm run dev
pause
