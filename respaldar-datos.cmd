@echo off
setlocal
cd /d "%~dp0"
call "%~dp0scripts\node-local.cmd" "%~dp0scripts\backup-db.mjs"
pause
