@echo off
setlocal
if defined VITA_NODE_PATH goto validate
for %%R in ("%LARAGON_HOME%" "C:\laragon" "C:\ARchivosYooo\Programas\laragon") do (
  if exist "%%~R\bin\nodejs" for /d %%D in ("%%~R\bin\nodejs\*") do (
    if exist "%%~D\node.exe" (
      "%%~D\node.exe" -e "process.exit(Number(process.versions.node.split('.')[0]) >= 22 ? 0 : 1)" >nul 2>&1
      if not errorlevel 1 set "VITA_NODE_PATH=%%~D\node.exe"
    )
  )
)
if defined VITA_NODE_PATH goto validate
for /f "delims=" %%N in ('where node.exe 2^>nul') do (
  "%%N" -e "process.exit(Number(process.versions.node.split('.')[0]) >= 22 ? 0 : 1)" >nul 2>&1
  if not errorlevel 1 set "VITA_NODE_PATH=%%N"
)
:validate
if not defined VITA_NODE_PATH (
  echo Instala Node.js 22.13 o superior en Laragon, o configura VITA_NODE_PATH.
  exit /b 1
)
"%VITA_NODE_PATH%" -e "const [major,minor]=process.versions.node.split('.').map(Number);process.exit(major>22||(major===22&&minor>=13)?0:1)" >nul 2>&1
if errorlevel 1 (
  echo VITA_NODE_PATH debe apuntar a Node.js 22.13 o superior.
  exit /b 1
)
"%VITA_NODE_PATH%" %*
exit /b %errorlevel%
