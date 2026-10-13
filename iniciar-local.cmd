@echo off
setlocal
cd /d "%~dp0"
call "%~dp0scripts\node-local.cmd" "%~dp0scripts\start-local.mjs"
if errorlevel 1 pause
